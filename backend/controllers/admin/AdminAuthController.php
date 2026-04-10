<?php
/**
 * AdminAuthController
 *
 * Handles admin login with email and password.
 */

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/Admin.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Validator.php';
require_once __DIR__ . '/../../utils/JwtHandler.php';

class AdminAuthController
{
    /**
     * POST /api/v1/admin/auth/login
     * Admin login with email and password.
     */
    public static function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($data, [
            'email'    => 'required|email',
            'password' => 'required|min:6',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $adminModel = new Admin($db);

        $admin = $adminModel->findByEmail($data['email']);
        if (!$admin) {
            Response::error('Invalid email or password', 401);
        }

        if (!password_verify($data['password'], $admin['password_hash'])) {
            Response::error('Invalid email or password', 401);
        }

        if ($admin['status'] !== 'active') {
            Response::error('Admin account is inactive', 403);
        }

        // Generate tokens
        $accessToken = JwtHandler::encode([
            'sub'  => $admin['id'],
            'type' => 'admin',
            'role' => $admin['role'],
        ], 900); // 15 minutes

        $refreshToken = JwtHandler::generateRefreshToken();

        Response::success([
            'admin' => [
                'id'    => $admin['id'],
                'name'  => $admin['name'],
                'email' => $admin['email'],
                'role'  => $admin['role'],
            ],
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type'    => 'Bearer',
            'expires_in'    => 900,
        ], 'Admin login successful');
    }
}
