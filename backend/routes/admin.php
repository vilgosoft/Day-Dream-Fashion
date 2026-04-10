<?php
/**
 * Admin Route Definitions
 *
 * All routes here are prefixed with /admin.
 * $method and $uri are set in public/index.php.
 */

// ─── ADMIN AUTH ─────────────────────────────────────────────────

if ($method === 'POST' && $uri === '/admin/auth/login') {
    require_once $adminControllersPath . 'AdminAuthController.php';
    AdminAuthController::login();
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/dashboard') {
    require_once $adminControllersPath . 'AdminDashboardController.php';
    AdminDashboardController::index();
}

// ─── ADMIN PRODUCTS ─────────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/products') {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::index();
}

if ($method === 'POST' && $uri === '/admin/products') {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::create();
}

if ($method === 'GET' && preg_match('#^/admin/products/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::show((int) $matches[1]);
}

if ($method === 'PUT' && preg_match('#^/admin/products/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::update((int) $matches[1]);
}

if ($method === 'DELETE' && preg_match('#^/admin/products/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::delete((int) $matches[1]);
}

// Product Variations
if ($method === 'POST' && preg_match('#^/admin/products/(\d+)/variations$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::addVariation((int) $matches[1]);
}

// Product Images
if ($method === 'DELETE' && preg_match('#^/admin/products/images/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::deleteImage((int) $matches[1]);
}

// ─── ADMIN CATEGORIES ───────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/categories') {
    require_once $adminControllersPath . 'AdminCategoryController.php';
    AdminCategoryController::index();
}

if ($method === 'POST' && $uri === '/admin/categories') {
    require_once $adminControllersPath . 'AdminCategoryController.php';
    AdminCategoryController::create();
}

if ($method === 'PUT' && preg_match('#^/admin/categories/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminCategoryController.php';
    AdminCategoryController::update((int) $matches[1]);
}

if ($method === 'DELETE' && preg_match('#^/admin/categories/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminCategoryController.php';
    AdminCategoryController::delete((int) $matches[1]);
}

// ─── ADMIN USERS ────────────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/users') {
    require_once $adminControllersPath . 'AdminUserController.php';
    AdminUserController::index();
}

if ($method === 'GET' && preg_match('#^/admin/users/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminUserController.php';
    AdminUserController::show((int) $matches[1]);
}

if ($method === 'PUT' && preg_match('#^/admin/users/(\d+)/status$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminUserController.php';
    AdminUserController::updateStatus((int) $matches[1]);
}

// ─── ADMIN ORDERS ───────────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/orders') {
    require_once $adminControllersPath . 'AdminOrderController.php';
    AdminOrderController::index();
}

if ($method === 'GET' && preg_match('#^/admin/orders/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminOrderController.php';
    AdminOrderController::show((int) $matches[1]);
}

if ($method === 'PUT' && preg_match('#^/admin/orders/(\d+)/status$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminOrderController.php';
    AdminOrderController::updateStatus((int) $matches[1]);
}

// ─── ADMIN INVENTORY ────────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/inventory') {
    require_once $adminControllersPath . 'AdminInventoryController.php';
    AdminInventoryController::index();
}

if ($method === 'PUT' && preg_match('#^/admin/inventory/(\d+)$#', $uri, $matches)) {
    require_once $adminControllersPath . 'AdminInventoryController.php';
    AdminInventoryController::updateStock((int) $matches[1]);
}

// ─── ADMIN ATTRIBUTES (Sizes & Colors) ─────────────────────────

if ($method === 'GET' && $uri === '/admin/sizes') {
    require_once $adminControllersPath . 'AdminAttributeController.php';
    AdminAttributeController::listSizes();
}

if ($method === 'POST' && $uri === '/admin/sizes') {
    require_once $adminControllersPath . 'AdminAttributeController.php';
    AdminAttributeController::createSize();
}

if ($method === 'GET' && $uri === '/admin/colors') {
    require_once $adminControllersPath . 'AdminAttributeController.php';
    AdminAttributeController::listColors();
}

if ($method === 'POST' && $uri === '/admin/colors') {
    require_once $adminControllersPath . 'AdminAttributeController.php';
    AdminAttributeController::createColor();
}

// ─── ADMIN CONTACTS ─────────────────────────────────────────────

if ($method === 'GET' && $uri === '/admin/contacts') {
    require_once __DIR__ . '/../config/Database.php';
    require_once __DIR__ . '/../models/ContactMessage.php';
    require_once __DIR__ . '/../middleware/AdminMiddleware.php';
    require_once __DIR__ . '/../utils/Response.php';
    AdminMiddleware::authenticate();
    $db = Database::getConnection();
    $model = new ContactMessage($db);
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $result = $model->paginate($page, 20);
    Response::paginated($result['data'], $result['total'], $page, 20);
}

if ($method === 'PUT' && preg_match('#^/admin/contacts/(\d+)/read$#', $uri, $matches)) {
    require_once __DIR__ . '/../config/Database.php';
    require_once __DIR__ . '/../models/ContactMessage.php';
    require_once __DIR__ . '/../middleware/AdminMiddleware.php';
    require_once __DIR__ . '/../utils/Response.php';
    AdminMiddleware::authenticate();
    $db = Database::getConnection();
    $model = new ContactMessage($db);
    $model->markAsRead((int) $matches[1]);
    Response::success(null, 'Marked as read');
}
