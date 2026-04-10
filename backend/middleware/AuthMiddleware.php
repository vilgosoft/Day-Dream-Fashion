<?php
/**
 * JWT authentication middleware for user routes.
 */

require_once __DIR__ . '/../utils/JwtHandler.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware
{
    /**
     * Verify JWT token and return the decoded user payload.
     * Sends a 401 response and exits if invalid.
     */
    public static function authenticate(): object
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!str_starts_with($authHeader, 'Bearer ')) {
            Response::error('Authentication required', 401);
            exit;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::decode($token);

        if (!$decoded || ($decoded->type ?? '') !== 'user') {
            Response::error('Invalid or expired token', 401);
            exit;
        }

        return $decoded;
    }
}
