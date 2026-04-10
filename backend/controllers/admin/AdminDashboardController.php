<?php
/**
 * AdminDashboardController — Dashboard statistics.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Product.php';
require_once __DIR__ . '/../../models/Order.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/ContactMessage.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';

class AdminDashboardController
{
    /**
     * GET /api/v1/admin/dashboard
     * Returns aggregate stats for the admin dashboard.
     */
    public static function index(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();

        $productModel = new Product($db);
        $orderModel = new Order($db);
        $userModel = new User($db);
        $contactModel = new ContactMessage($db);

        Response::success([
            'total_products'   => $productModel->count(),
            'active_products'  => $productModel->count('active'),
            'total_users'      => $userModel->count(),
            'total_orders'     => $orderModel->countAll(),
            'pending_orders'   => $orderModel->countByStatus('pending'),
            'total_revenue'    => $orderModel->getTotalRevenue(),
            'unread_messages'  => $contactModel->countUnread(),
        ], 'Dashboard stats retrieved');
    }
}
