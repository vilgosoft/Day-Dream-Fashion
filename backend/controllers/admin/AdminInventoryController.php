<?php
/**
 * AdminInventoryController — Stock management.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/ProductVariation.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';

class AdminInventoryController
{
    /**
     * GET /api/v1/admin/inventory
     * Lists all product variations sorted by stock level (lowest first).
     */
    public static function index(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new ProductVariation($db);

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($_GET['per_page'] ?? 30)));

        $result = $model->getInventoryList($page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * PUT /api/v1/admin/inventory/{variationId}
     * Body: { stock_quantity }
     */
    public static function updateStock(int $variationId): void
    {
        AdminMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!isset($data['stock_quantity']) || !is_numeric($data['stock_quantity'])) {
            Response::error('stock_quantity is required and must be numeric', 422);
        }

        $db = Database::getConnection();
        $model = new ProductVariation($db);

        $variation = $model->findById($variationId);
        if (!$variation) {
            Response::error('Variation not found', 404);
        }

        $model->update($variationId, ['stock_quantity' => (int) $data['stock_quantity']]);
        Response::success(null, 'Stock updated');
    }
}
