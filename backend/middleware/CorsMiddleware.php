<?php
/**
 * CORS middleware — sets headers for cross-origin requests.
 */
class CorsMiddleware
{
    public static function handle(): void
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
        ];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
}
