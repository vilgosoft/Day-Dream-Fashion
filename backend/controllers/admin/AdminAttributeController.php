<?php
/**
 * AdminAttributeController — Manage sizes and colors.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../middleware/AdminMiddleware.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Validator.php';

class AdminAttributeController
{
    /** GET /api/v1/admin/sizes */
    public static function listSizes(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM sizes ORDER BY sort_order ASC');
        Response::success($stmt->fetchAll());
    }

    /** POST /api/v1/admin/sizes */
    public static function createSize(): void
    {
        AdminMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = new Validator();
        if (!$validator->validate($data, ['name' => 'required|max:20'])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }
        $db = Database::getConnection();
        $stmt = $db->prepare('INSERT INTO sizes (name, sort_order) VALUES (?, ?)');
        $stmt->execute([$data['name'], $data['sort_order'] ?? 0]);
        Response::success(['id' => (int) $db->lastInsertId(), 'name' => $data['name']], 'Size created', 201);
    }

    /** GET /api/v1/admin/colors */
    public static function listColors(): void
    {
        AdminMiddleware::authenticate();
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM colors ORDER BY name ASC');
        Response::success($stmt->fetchAll());
    }

    /** POST /api/v1/admin/colors */
    public static function createColor(): void
    {
        AdminMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $validator = new Validator();
        if (!$validator->validate($data, ['name' => 'required|max:50', 'hex_code' => 'required|max:7'])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }
        $db = Database::getConnection();
        $stmt = $db->prepare('INSERT INTO colors (name, hex_code) VALUES (?, ?)');
        $stmt->execute([$data['name'], $data['hex_code']]);
        Response::success(['id' => (int) $db->lastInsertId(), 'name' => $data['name'], 'hex_code' => $data['hex_code']], 'Color created', 201);
    }
}
