<?php
/**
 * WishlistController — User wishlist endpoints (authenticated).
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Wishlist.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class WishlistController
{
    /**
     * GET /api/v1/wishlist
     */
    public static function index(): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Wishlist($db);
        $items = $model->getByUser((int) $user->sub);
        Response::success($items, 'Wishlist retrieved');
    }

    /**
     * POST /api/v1/wishlist/{productId}
     * Toggle: adds if not present, removes if present.
     */
    public static function toggle(int $productId): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Wishlist($db);
        $result = $model->toggle((int) $user->sub, $productId);
        Response::success($result, $result['action'] === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    }

    /**
     * GET /api/v1/wishlist/check/{productId}
     */
    public static function check(int $productId): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Wishlist($db);
        $isWishlisted = $model->isWishlisted((int) $user->sub, $productId);
        Response::success(['wishlisted' => $isWishlisted]);
    }
}
