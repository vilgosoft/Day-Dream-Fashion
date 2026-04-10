<?php
/**
 * AdminOrderController — Order management.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Order.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';

class AdminOrderController
{
    /**
     * GET /api/v1/admin/orders
     */
    public static function index(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Order($db);

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 20)));
        $status = $_GET['status'] ?? '';

        $result = $model->adminPaginate($page, $perPage, $status);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/v1/admin/orders/{id}
     */
    public static function show(int $id): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Order($db);
        $order = $model->findById($id);
        if (!$order) {
            Response::error('Order not found', 404);
        }
        Response::success($order);
    }

    /**
     * PUT /api/v1/admin/orders/{id}/status
     * Body: { status }
     */
    public static function updateStatus(int $id): void
    {
        AdminMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (empty($data['status']) || !in_array($data['status'], $validStatuses, true)) {
            Response::error('Invalid status', 422);
        }

        $db = Database::getConnection();
        $model = new Order($db);

        if (!$model->findById($id)) {
            Response::error('Order not found', 404);
        }

        $model->updateStatus($id, $data['status']);
        Response::success(null, 'Order status updated');
    }
}
