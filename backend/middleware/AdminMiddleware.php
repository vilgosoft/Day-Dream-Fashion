<?php
/**
 * JWT authentication middleware for admin routes.
 */

require_once __DIR__ . '/../utils/JwtHandler.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminMiddleware
{
    /**
     * Verify JWT token and ensure admin role.
     * Sends a 401/403 response and exits if invalid.
     */
    public static function authenticate(): object
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!str_starts_with($authHeader, 'Bearer ')) {
            Response::error('Admin authentication required', 401);
            exit;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::decode($token);

        if (!$decoded || ($decoded->type ?? '') !== 'admin') {
            Response::error('Invalid or expired admin token', 403);
            exit;
        }

        return $decoded;
    }
}
