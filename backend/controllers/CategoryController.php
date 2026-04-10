<?php
/**
 * CategoryController — Public category endpoints.
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../utils/Response.php';

class CategoryController
{
    /**
     * GET /api/v1/categories
     * List all active categories as a tree.
     */
    public static function index(): void
    {
        $db = Database::getConnection();
        $model = new Category($db);
        $categories = $model->getAll(true);
        Response::success($categories, 'Categories retrieved');
    }

    /**
     * GET /api/v1/categories/{slug}
     */
    public static function show(string $slug): void
    {
        $db = Database::getConnection();
        $model = new Category($db);
        $category = $model->findBySlug($slug);
        if (!$category) {
            Response::error('Category not found', 404);
        }
        Response::success($category, 'Category retrieved');
    }
}
