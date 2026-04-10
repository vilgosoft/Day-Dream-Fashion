<?php
/**
 * AdminProductController — CRUD for products, images, and variations.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Product.php';
require_once __DIR__ . '/../../models/ProductVariation.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Validator.php';

class AdminProductController
{
    /**
     * GET /api/v1/admin/products
     */
    public static function index(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Product($db);

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 20)));
        $result = $model->adminPaginate($page, $perPage);

        Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    /**
     * GET /api/v1/admin/products/{id}
     */
    public static function show(int $id): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Product($db);
        $product = $model->findById($id);
        if (!$product) {
            Response::error('Product not found', 404);
        }
        Response::success($product);
    }

    /**
     * POST /api/v1/admin/products
     * Accepts multipart/form-data with images[] and JSON fields.
     */
    public static function create(): void
    {
        AdminMiddleware::authenticate();
        $data = $_POST;

        $validator = new Validator();
        if (!$validator->validate($data, [
            'name'       => 'required|min:2|max:255',
            'base_price' => 'required|numeric',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $model = new Product($db);

        $data['slug'] = $model->generateSlug($data['name']);
        $productId = $model->create($data);

        // Handle image uploads
        if (!empty($_FILES['images'])) {
            self::handleImageUploads($model, $productId, $_FILES['images']);
        }

        // Handle variations if provided as JSON string
        if (!empty($data['variations'])) {
            $variations = json_decode($data['variations'], true) ?? [];
            $varModel = new ProductVariation($db);
            foreach ($variations as $var) {
                $var['product_id'] = $productId;
                $varModel->create($var);
            }
        }

        $product = $model->findById($productId);
        Response::success($product, 'Product created', 201);
    }

    /**
     * PUT /api/v1/admin/products/{id}
     */
    public static function update(int $id): void
    {
        AdminMiddleware::authenticate();

        // PUT with multipart needs php://input for JSON or $_POST for form-data
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType, 'application/json')) {
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
        } else {
            $data = $_POST;
        }

        $db = Database::getConnection();
        $model = new Product($db);

        $existing = $model->findById($id);
        if (!$existing) {
            Response::error('Product not found', 404);
        }

        if (!empty($data['name']) && $data['name'] !== $existing['name']) {
            $data['slug'] = $model->generateSlug($data['name']);
        }

        $model->update($id, $data);

        // Handle new image uploads
        if (!empty($_FILES['images'])) {
            self::handleImageUploads($model, $id, $_FILES['images']);
        }

        $product = $model->findById($id);
        Response::success($product, 'Product updated');
    }

    /**
     * DELETE /api/v1/admin/products/{id}
     */
    public static function delete(int $id): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Product($db);

        if (!$model->findById($id)) {
            Response::error('Product not found', 404);
        }

        $model->delete($id);
        Response::success(null, 'Product deleted');
    }

    /**
     * POST /api/v1/admin/products/{id}/variations
     * Body: { size_id, color_id, sku, price, stock_quantity }
     */
    public static function addVariation(int $productId): void
    {
        AdminMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $data['product_id'] = $productId;

        $validator = new Validator();
        if (!$validator->validate($data, [
            'size_id'  => 'required|numeric',
            'color_id' => 'required|numeric',
            'sku'      => 'required',
            'price'    => 'required|numeric',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $varModel = new ProductVariation($db);

        try {
            $varId = $varModel->create($data);
            $variation = $varModel->findById($varId);
            Response::success($variation, 'Variation added', 201);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('This size/color combination already exists for this product', 409);
            }
            throw $e;
        }
    }

    /**
     * DELETE /api/v1/admin/products/images/{imageId}
     */
    public static function deleteImage(int $imageId): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Product($db);
        $model->deleteImage($imageId);
        Response::success(null, 'Image deleted');
    }

    private static function handleImageUploads(Product $model, int $productId, array $files): void
    {
        $uploadDir = __DIR__ . '/../../uploads/products/';
        $isFirst = empty($model->getImages($productId));

        // Handle both single and multiple file uploads
        $fileCount = is_array($files['name']) ? count($files['name']) : 1;

        for ($i = 0; $i < $fileCount; $i++) {
            $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
            $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];
            $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];

            if ($error !== UPLOAD_ERR_OK) continue;

            // Validate type and size
            $mimeType = mime_content_type($tmpName);
            $allowed = ['image/jpeg', 'image/png', 'image/webp'];
            if (!in_array($mimeType, $allowed, true)) continue;
            if ($size > 5 * 1024 * 1024) continue; // 5MB max

            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $fileName = $productId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $destPath = $uploadDir . $fileName;

            if (move_uploaded_file($tmpName, $destPath)) {
                $model->addImage($productId, 'uploads/products/' . $fileName, $isFirst && $i === 0, $i);
            }
        }
    }
}
