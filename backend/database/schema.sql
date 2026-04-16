-- ============================================================
-- Day Dream Fashion — Complete MySQL Database Schema
-- ============================================================
-- Run this file to create all tables:
--   mysql -u root -p daydream_fashion < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS daydream_fashion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE daydream_fashion;

-- ============================================================
-- 1. USERS — Customer accounts
-- ============================================================
CREATE TABLE users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    phone       VARCHAR(20)     NOT NULL,
    password_hash VARCHAR(255)  NULL COMMENT 'Nullable — OTP-based login initially',
    status      ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_phone (phone),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 2. ADMINS — Admin accounts
-- ============================================================
CREATE TABLE admins (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('super_admin', 'admin', 'manager') NOT NULL DEFAULT 'admin',
    status        ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_admins_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 3. CATEGORIES — Hierarchical product categories
-- ============================================================
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    slug        VARCHAR(120)  NOT NULL,
    description TEXT          NULL,
    image       VARCHAR(500)  NULL,
    parent_id   INT UNSIGNED  NULL COMMENT 'Self-ref for sub-categories',
    status      ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    sort_order  INT           NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_categories_slug (slug),
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_status (status),

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id) REFERENCES categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. SIZES — Size attribute options
-- ============================================================
CREATE TABLE sizes (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(20)  NOT NULL COMMENT 'e.g. S, M, L, XL, XXL',
    sort_order INT          NOT NULL DEFAULT 0,

    UNIQUE KEY uk_sizes_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- 5. COLORS — Color attribute options
-- ============================================================
CREATE TABLE colors (
    id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(50)  NOT NULL COMMENT 'e.g. Red, Navy Blue',
    hex_code VARCHAR(7)   NOT NULL COMMENT 'e.g. #FF0000',

    UNIQUE KEY uk_colors_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- 6. PRODUCTS — Main product table
-- ============================================================
CREATE TABLE products (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)  NOT NULL,
    slug        VARCHAR(280)  NOT NULL,
    description TEXT          NULL,
    category_id INT UNSIGNED  NULL,
    base_price  DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Starting / display price',
    status      ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'draft',
    is_featured TINYINT(1)    NOT NULL DEFAULT 0,
    is_trending TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_products_slug (slug),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status),
    INDEX idx_products_featured (is_featured),
    INDEX idx_products_trending (is_trending),

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. PRODUCT_IMAGES — Multiple images per product
-- ============================================================
CREATE TABLE product_images (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED  NOT NULL,
    image_path VARCHAR(500)  NOT NULL,
    is_primary TINYINT(1)    NOT NULL DEFAULT 0,
    sort_order INT           NOT NULL DEFAULT 0,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_product_images_product (product_id),

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. PRODUCT_VARIATIONS — Size / Color combos with price & stock
-- ============================================================
CREATE TABLE product_variations (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id     INT UNSIGNED  NOT NULL,
    size_id        INT UNSIGNED  NOT NULL,
    color_id       INT UNSIGNED  NOT NULL,
    sku            VARCHAR(100)  NOT NULL,
    price          DECIMAL(10,2) NOT NULL COMMENT 'Variation-specific price',
    stock_quantity INT           NOT NULL DEFAULT 0,
    status         ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_variations_sku (sku),
    UNIQUE KEY uk_variations_combo (product_id, size_id, color_id),
    INDEX idx_variations_product (product_id),
    INDEX idx_variations_size (size_id),
    INDEX idx_variations_color (color_id),

    CONSTRAINT fk_variations_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_variations_size
        FOREIGN KEY (size_id) REFERENCES sizes(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_variations_color
        FOREIGN KEY (color_id) REFERENCES colors(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. CARTS — One cart per user
-- ============================================================
CREATE TABLE carts (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_carts_user (user_id),

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. CART_ITEMS — Items in a cart
-- ============================================================
CREATE TABLE cart_items (
    id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id              INT UNSIGNED NOT NULL,
    product_variation_id INT UNSIGNED NOT NULL,
    quantity             INT UNSIGNED NOT NULL DEFAULT 1,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_cart_items_variation (cart_id, product_variation_id),
    INDEX idx_cart_items_cart (cart_id),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_variation
        FOREIGN KEY (product_variation_id) REFERENCES product_variations(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. WISHLISTS — User favourites
-- ============================================================
CREATE TABLE wishlists (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_wishlists_user_product (user_id, product_id),
    INDEX idx_wishlists_user (user_id),

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wishlists_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. ORDERS — Order header
-- ============================================================
CREATE TABLE orders (
    id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id              INT UNSIGNED  NULL COMMENT 'SET NULL if user is deleted',
    order_number         VARCHAR(30)   NOT NULL,
    subtotal             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax                  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total                DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_address     JSON          NOT NULL,
    billing_address      JSON          NULL,
    payment_method       VARCHAR(50)   NOT NULL DEFAULT 'razorpay',
    razorpay_order_id    VARCHAR(255)  NULL,
    razorpay_payment_id  VARCHAR(255)  NULL,
    razorpay_signature   VARCHAR(255)  NULL,
    status               ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
                         NOT NULL DEFAULT 'pending',
    notes                TEXT          NULL,
    created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_orders_number (order_number),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created (created_at),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. ORDER_ITEMS — Snapshot of ordered items
-- ============================================================
CREATE TABLE order_items (
    id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id             INT UNSIGNED  NOT NULL,
    product_variation_id INT UNSIGNED  NULL COMMENT 'SET NULL if variation deleted',
    product_name         VARCHAR(255)  NOT NULL COMMENT 'Snapshot — preserved if product deleted',
    product_slug         VARCHAR(280)  NOT NULL,
    size_name            VARCHAR(20)   NOT NULL COMMENT 'Snapshot of size at time of order',
    color_name           VARCHAR(50)   NOT NULL COMMENT 'Snapshot of color at time of order',
    price                DECIMAL(10,2) NOT NULL COMMENT 'Price at time of order',
    quantity             INT UNSIGNED  NOT NULL DEFAULT 1,
    subtotal             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order_items_order (order_id),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_variation
        FOREIGN KEY (product_variation_id) REFERENCES product_variations(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 14. CONTACT_MESSAGES — Contact form submissions
-- ============================================================
CREATE TABLE contact_messages (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    subject    VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contact_messages_read (is_read)
) ENGINE=InnoDB;

-- ============================================================
-- 15. SETTINGS — Key-value app configuration
-- ============================================================
CREATE TABLE settings (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key   VARCHAR(100)  NOT NULL,
    setting_value TEXT          NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_settings_key (setting_key)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA — Default sizes, colors, and settings
-- ============================================================

INSERT INTO sizes (name, sort_order) VALUES
    ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5), ('XXL', 6);

INSERT INTO colors (name, hex_code) VALUES
    ('Black',   '#000000'),
    ('White',   '#FFFFFF'),
    ('Red',     '#FF0000'),
    ('Blue',    '#0000FF'),
    ('Navy',    '#000080'),
    ('Green',   '#008000'),
    ('Pink',    '#FFC0CB'),
    ('Beige',   '#F5F5DC'),
    ('Grey',    '#808080'),
    ('Yellow',  '#FFFF00');

INSERT INTO settings (setting_key, setting_value) VALUES
    ('store_name',    'Day Dream Fashion'),
    ('store_email',   'info@daydreamfashion.com'),
    ('store_phone',   '+91-XXXXXXXXXX'),
    ('tax_rate',      '18'),
    ('shipping_cost', '99.00'),
    ('currency',      'INR');

-- Default admin (password: admin123 — change immediately in production)
-- Hash generated with PHP: password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO admins (name, email, password_hash, role) VALUES
    ('Super Admin', 'admin@daydreamfashion.com', '$2y$12$VE9JeRLBXQ9xgY9h2UXEi.Smjy79IyNKk4hSM97tItCgSJgDb1teS', 'super_admin');
