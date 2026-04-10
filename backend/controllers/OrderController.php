<?php
/**
 * OrderController — Order creation and retrieval (authenticated).
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Cart.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../utils/Mailer.php';

class OrderController
{
    /**
     * POST /api/v1/orders
     * Create an order from the user's cart.
     * Body: { shipping_address: {...}, billing_address?: {...}, payment_method?: "razorpay" }
     */
    public static function create(): void
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['shipping_address'])) {
            Response::error('shipping_address is required', 422);
        }

        $db = Database::getConnection();
        $cartModel = new Cart($db);
        $orderModel = new Order($db);

        $cart = $cartModel->getOrCreate((int) $user->sub);
        $items = $cartModel->getItems((int) $cart['id']);

        if (empty($items)) {
            Response::error('Cart is empty', 400);
        }

        $result = $orderModel->createFromCart((int) $user->sub, $items, $data);

        if (isset($result['error'])) {
            Response::error($result['error'], 400);
        }

        // Clear the cart after successful order
        $cartModel->clearCart((int) $cart['id']);

        // Send email notifications (non-blocking — errors are logged, not thrown)
        $userStmt = $db->prepare('SELECT email FROM users WHERE id = ?');
        $userStmt->execute([$user->sub]);
        $userRow = $userStmt->fetch();
        if ($userRow) {
            Mailer::sendOrderConfirmation($userRow['email'], $result);
        }
        Mailer::sendAdminOrderNotification($result);

        Response::success($result, 'Order placed successfully', 201);
    }

    /**
     * GET /api/v1/orders
     * List the current user's orders.
     */
    public static function index(): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Order($db);
        $orders = $model->getByUser((int) $user->sub);
        Response::success($orders, 'Orders retrieved');
    }

    /**
     * GET /api/v1/orders/{orderNumber}
     */
    public static function show(string $orderNumber): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $model = new Order($db);
        $order = $model->findByOrderNumber($orderNumber, (int) $user->sub);
        if (!$order) {
            Response::error('Order not found', 404);
        }
        Response::success($order, 'Order retrieved');
    }
}
