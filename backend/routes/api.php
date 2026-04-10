<?php
/**
 * API Route Definitions
 *
 * Routes are matched against $method and $uri set in public/index.php.
 * Each route calls the appropriate controller method.
 */

// Autoload controllers
$controllersPath = __DIR__ . '/../controllers/';
$adminControllersPath = __DIR__ . '/../controllers/admin/';

// ─── Public Routes ──────────────────────────────────────────

// Auth
if ($method === 'POST' && $uri === '/auth/register') {
    require_once $controllersPath . 'AuthController.php';
    AuthController::register();
}

if ($method === 'POST' && $uri === '/auth/login') {
    require_once $controllersPath . 'AuthController.php';
    AuthController::login();
}

// Products
if ($method === 'GET' && $uri === '/products') {
    require_once $controllersPath . 'ProductController.php';
    ProductController::index();
}

if ($method === 'GET' && preg_match('#^/products/([a-z0-9\-]+)$#', $uri, $matches)) {
    require_once $controllersPath . 'ProductController.php';
    ProductController::show($matches[1]);
}

// Categories
if ($method === 'GET' && $uri === '/categories') {
    require_once $controllersPath . 'CategoryController.php';
    CategoryController::index();
}

// Contact
if ($method === 'POST' && $uri === '/contact') {
    require_once $controllersPath . 'ContactController.php';
    ContactController::submit();
}

// ─── User Authenticated Routes ──────────────────────────────

// Cart
if ($method === 'GET' && $uri === '/cart') {
    require_once $controllersPath . 'CartController.php';
    CartController::index();
}

if ($method === 'POST' && $uri === '/cart') {
    require_once $controllersPath . 'CartController.php';
    CartController::addItem();
}

// Wishlist
if ($method === 'GET' && $uri === '/wishlist') {
    require_once $controllersPath . 'WishlistController.php';
    WishlistController::index();
}

// Orders
if ($method === 'POST' && $uri === '/orders') {
    require_once $controllersPath . 'OrderController.php';
    OrderController::create();
}

if ($method === 'GET' && $uri === '/orders') {
    require_once $controllersPath . 'OrderController.php';
    OrderController::index();
}

// Payment
if ($method === 'POST' && $uri === '/payment/verify') {
    require_once $controllersPath . 'PaymentController.php';
    PaymentController::verify();
}

// ─── Admin Routes ───────────────────────────────────────────
require_once __DIR__ . '/admin.php';
