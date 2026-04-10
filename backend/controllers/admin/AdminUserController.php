<?php
/**
 * AdminUserController — User management.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';

class AdminUserController
{
    /**
     * GET /api/v1/admin/users
     */
    public static function index(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new User($db);

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 20)));

        $users = $model->paginate($page, $perPage);
        $total = $model->count();

        Response::paginated($users, $total, $page, $perPage);
    }

    /**
     * GET /api/v1/admin/users/{id}
     */
    public static function show(int $id): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new User($db);
        $user = $model->findById($id);
        if (!$user) {
            Response::error('User not found', 404);
        }
        Response::success($user);
    }

    /**
     * PUT /api/v1/admin/users/{id}/status
     * Body: { status: "active"|"inactive"|"banned" }
     */
    public static function updateStatus(int $id): void
    {
        AdminMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $validStatuses = ['active', 'inactive', 'banned'];
        if (empty($data['status']) || !in_array($data['status'], $validStatuses, true)) {
            Response::error('Invalid status. Must be: active, inactive, or banned', 422);
        }

        $db = Database::getConnection();
        $model = new User($db);

        if (!$model->findById($id)) {
            Response::error('User not found', 404);
        }

        $model->updateStatus($id, $data['status']);
        Response::success(null, 'User status updated');
    }
}
