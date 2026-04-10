<?php
/**
 * CartController — User cart endpoints (authenticated).
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class CartController
{
    /**
     * GET /api/v1/cart
     */
    public static function index(): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Cart($db);

        $cart = $model->getOrCreate((int) $user->sub);
        $items = $model->getItems((int) $cart['id']);

        $totalItems = 0;
        $totalPrice = 0;
        foreach ($items as $item) {
            $totalItems += $item['quantity'];
            $totalPrice += $item['price'] * $item['quantity'];
        }

        Response::success([
            'cart_id'     => $cart['id'],
            'items'       => $items,
            'total_items' => $totalItems,
            'total_price' => round($totalPrice, 2),
        ], 'Cart retrieved');
    }

    /**
     * POST /api/v1/cart
     * Body: { product_variation_id, quantity }
     */
    public static function addItem(): void
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['product_variation_id'])) {
            Response::error('product_variation_id is required', 422);
        }

        $quantity = (int) ($data['quantity'] ?? 1);
        if ($quantity < 1) $quantity = 1;

        $db = Database::getConnection();
        $model = new Cart($db);
        $cart = $model->getOrCreate((int) $user->sub);
        $model->addItem((int) $cart['id'], (int) $data['product_variation_id'], $quantity);

        $items = $model->getItems((int) $cart['id']);
        Response::success(['items' => $items], 'Item added to cart', 201);
    }

    /**
     * PUT /api/v1/cart/{id}
     * Body: { quantity }
     */
    public static function updateItem(int $cartItemId): void
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!isset($data['quantity'])) {
            Response::error('quantity is required', 422);
        }

        $db = Database::getConnection();
        $model = new Cart($db);
        $model->updateItemQuantity($cartItemId, (int) $data['quantity']);

        Response::success(null, 'Cart item updated');
    }

    /**
     * DELETE /api/v1/cart/{id}
     */
    public static function removeItem(int $cartItemId): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Cart($db);
        $model->removeItem($cartItemId);
        Response::success(null, 'Item removed from cart');
    }

    /**
     * DELETE /api/v1/cart
     */
    public static function clear(): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Cart($db);
        $cart = $model->getOrCreate((int) $user->sub);
        $model->clearCart((int) $cart['id']);
        Response::success(null, 'Cart cleared');
    }
}
