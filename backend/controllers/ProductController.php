<?php
/**
 * ProductController — Public product endpoints.
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../utils/Response.php';

class ProductController
{
    /**
     * GET /api/v1/products
     * List products with optional filters: category_id, size_id, color_id, min_price, max_price, search, sort, page.
     */
    public static function index(): void
    {
        $db = Database::getConnection();
        $model = new Product($db);

        $filters = [];
        foreach (['category_id', 'size_id', 'color_id', 'min_price', 'max_price', 'search', 'sort', 'featured', 'trending'] as $key) {
            if (isset($_GET[$key]) && $_GET[$key] !== '') {
                $filters[$key] = $_GET[$key];
            }
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 20)));

        $result = $model->paginate($filters, $page, $perPage);
        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/v1/products/{slug}
     */
    public static function show(string $slug): void
    {
        $db = Database::getConnection();
        $model = new Product($db);

        $product = $model->findBySlug($slug);
        if (!$product) {
            Response::error('Product not found', 404);
        }

        Response::success($product, 'Product retrieved');
    }
}
