<?php
/**
 * Day Dream Fashion — API Entry Point
 *
 * All requests are routed through this file via .htaccess rewrite rules.
 */

declare(strict_types=1);

// Autoload dependencies
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

// CORS headers
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
CorsMiddleware::handle();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
require_once __DIR__ . '/../config/Database.php';

// Response helper
require_once __DIR__ . '/../utils/Response.php';

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip the base path (adjust if deployed in a subdirectory)
$basePath = '/api/v1';
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}
$uri = $uri ?: '/';

// Load routes
require_once __DIR__ . '/../routes/api.php';

// If no route matched
Response::error('Endpoint not found', 404);
