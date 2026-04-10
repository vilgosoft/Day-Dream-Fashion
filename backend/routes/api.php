<?php
/**
 * API Route Definitions
 *
 * Routes are matched against $method and $uri set in public/index.php.
 * Each matched route calls the controller and exits — no further routes are evaluated.
 */

$controllersPath = __DIR__ . '/../controllers/';
$adminControllersPath = __DIR__ . '/../controllers/admin/';

// ─── PUBLIC AUTH ────────────────────────────────────────────────

if ($method === 'POST' && $uri === '/auth/register') {
    require_once $controllersPath . 'AuthController.php';
    AuthController::register();
}

if ($method === 'POST' && $uri === '/auth/login') {
    require_once $controllersPath . 'AuthController.php';
    AuthController::login();
}

if ($method === 'GET' && $uri === '/auth/profile') {
    require_once $controllersPath . 'AuthController.php';
    AuthController::profile();
}

// ─── PUBLIC PRODUCTS ────────────────────────────────────────────

if ($method === 'GET' && $uri === '/products') {
    require_once $controllersPath . 'ProductController.php';
    ProductController::index();
}

if ($method === 'GET' && preg_match('#^/products/([a-z0-9\-]+)$#', $uri, $matches)) {
    require_once $controllersPath . 'ProductController.php';
    ProductController::show($matches[1]);
}

// ─── PUBLIC CATEGORIES ──────────────────────────────────────────

if ($method === 'GET' && $uri === '/categories') {
    require_once $controllersPath . 'CategoryController.php';
    CategoryController::index();
}

if ($method === 'GET' && preg_match('#^/categories/([a-z0-9\-]+)$#', $uri, $matches)) {
    require_once $controllersPath . 'CategoryController.php';
    CategoryController::show($matches[1]);
}

// ─── PUBLIC CONTACT ─────────────────────────────────────────────

if ($method === 'POST' && $uri === '/contact') {
    require_once $controllersPath . 'ContactController.php';
    ContactController::submit();
}

// ─── USER: CART ─────────────────────────────────────────────────

if ($method === 'GET' && $uri === '/cart') {
    require_once $controllersPath . 'CartController.php';
    CartController::index();
}

if ($method === 'POST' && $uri === '/cart') {
    require_once $controllersPath . 'CartController.php';
    CartController::addItem();
}

if ($method === 'PUT' && preg_match('#^/cart/(\d+)$#', $uri, $matches)) {
    require_once $controllersPath . 'CartController.php';
    CartController::updateItem((int) $matches[1]);
}

if ($method === 'DELETE' && preg_match('#^/cart/(\d+)$#', $uri, $matches)) {
    require_once $controllersPath . 'CartController.php';
    CartController::removeItem((int) $matches[1]);
}

if ($method === 'DELETE' && $uri === '/cart') {
    require_once $controllersPath . 'CartController.php';
    CartController::clear();
}

// ─── USER: WISHLIST ─────────────────────────────────────────────

if ($method === 'GET' && $uri === '/wishlist') {
    require_once $controllersPath . 'WishlistController.php';
    WishlistController::index();
}

if ($method === 'POST' && preg_match('#^/wishlist/(\d+)$#', $uri, $matches)) {
    require_once $controllersPath . 'WishlistController.php';
    WishlistController::toggle((int) $matches[1]);
}

if ($method === 'GET' && preg_match('#^/wishlist/check/(\d+)$#', $uri, $matches)) {
    require_once $controllersPath . 'WishlistController.php';
    WishlistController::check((int) $matches[1]);
}

// ─── USER: ORDERS ───────────────────────────────────────────────

if ($method === 'POST' && $uri === '/orders') {
    require_once $controllersPath . 'OrderController.php';
    OrderController::create();
}

if ($method === 'GET' && $uri === '/orders') {
    require_once $controllersPath . 'OrderController.php';
    OrderController::index();
}

if ($method === 'GET' && preg_match('#^/orders/(DDF-[A-Z0-9\-]+)$#', $uri, $matches)) {
    require_once $controllersPath . 'OrderController.php';
    OrderController::show($matches[1]);
}

// ─── USER: PAYMENT ──────────────────────────────────────────────

if ($method === 'POST' && $uri === '/payment/create-order') {
    require_once $controllersPath . 'PaymentController.php';
    PaymentController::createOrder();
}

if ($method === 'POST' && $uri === '/payment/verify') {
    require_once $controllersPath . 'PaymentController.php';
    PaymentController::verify();
}

// ─── ADMIN ROUTES ───────────────────────────────────────────────
require_once __DIR__ . '/admin.php';
