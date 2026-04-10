<?php
/**
 * AdminCategoryController — CRUD for categories.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Category.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Validator.php';

class AdminCategoryController
{
    /**
     * GET /api/v1/admin/categories
     */
    public static function index(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Category($db);
        $categories = $model->getAllFlat();
        Response::success($categories, 'Categories retrieved');
    }

    /**
     * POST /api/v1/admin/categories
     */
    public static function create(): void
    {
        AdminMiddleware::authenticate();
        $data = $_POST ?: json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($data, [
            'name' => 'required|min:2|max:100',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $model = new Category($db);

        $data['slug'] = $model->generateSlug($data['name']);

        // Handle image upload
        if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $data['image'] = self::handleImageUpload($_FILES['image']);
        }

        $catId = $model->create($data);
        $category = $model->findById($catId);
        Response::success($category, 'Category created', 201);
    }

    /**
     * PUT /api/v1/admin/categories/{id}
     */
    public static function update(int $id): void
    {
        AdminMiddleware::authenticate();
        $data = $_POST ?: json_decode(file_get_contents('php://input'), true) ?? [];

        $db = Database::getConnection();
        $model = new Category($db);

        $existing = $model->findById($id);
        if (!$existing) {
            Response::error('Category not found', 404);
        }

        if (!empty($data['name']) && $data['name'] !== $existing['name']) {
            $data['slug'] = $model->generateSlug($data['name']);
        }

        if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $data['image'] = self::handleImageUpload($_FILES['image']);
        }

        $model->update($id, $data);
        $category = $model->findById($id);
        Response::success($category, 'Category updated');
    }

    /**
     * DELETE /api/v1/admin/categories/{id}
     */
    public static function delete(int $id): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Category($db);

        if (!$model->findById($id)) {
            Response::error('Category not found', 404);
        }

        $model->delete($id);
        Response::success(null, 'Category deleted');
    }

    private static function handleImageUpload(array $file): ?string
    {
        $uploadDir = __DIR__ . '/../../uploads/categories/';
        $mimeType = mime_content_type($file['tmp_name']);
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];

        if (!in_array($mimeType, $allowed, true) || $file['size'] > 5 * 1024 * 1024) {
            return null;
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'cat_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

        if (move_uploaded_file($file['tmp_name'], $uploadDir . $fileName)) {
            return 'uploads/categories/' . $fileName;
        }
        return null;
    }
}
