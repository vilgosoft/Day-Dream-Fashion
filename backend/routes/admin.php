<?php
/**
 * Admin Route Definitions
 *
 * All routes here require admin authentication.
 * $method and $uri are set in public/index.php.
 */

// Admin Auth
if ($method === 'POST' && $uri === '/admin/auth/login') {
    require_once $adminControllersPath . 'AdminAuthController.php';
    AdminAuthController::login();
}

// Admin Dashboard
if ($method === 'GET' && $uri === '/admin/dashboard') {
    require_once $adminControllersPath . 'AdminDashboardController.php';
    AdminDashboardController::index();
}

// Admin Products
if ($method === 'GET' && $uri === '/admin/products') {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::index();
}

if ($method === 'POST' && $uri === '/admin/products') {
    require_once $adminControllersPath . 'AdminProductController.php';
    AdminProductController::create();
}

// Admin Categories
if ($method === 'GET' && $uri === '/admin/categories') {
    require_once $adminControllersPath . 'AdminCategoryController.php';
    AdminCategoryController::index();
}

if ($method === 'POST' && $uri === '/admin/categories') {
    require_once $adminControllersPath . 'AdminCategoryController.php';
    AdminCategoryController::create();
}

// Admin Users
if ($method === 'GET' && $uri === '/admin/users') {
    require_once $adminControllersPath . 'AdminUserController.php';
    AdminUserController::index();
}

// Admin Orders
if ($method === 'GET' && $uri === '/admin/orders') {
    require_once $adminControllersPath . 'AdminOrderController.php';
    AdminOrderController::index();
}

// Admin Inventory
if ($method === 'GET' && $uri === '/admin/inventory') {
    require_once $adminControllersPath . 'AdminInventoryController.php';
    AdminInventoryController::index();
}
