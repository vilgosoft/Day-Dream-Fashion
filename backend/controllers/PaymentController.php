<?php
/**
 * PaymentController — Razorpay integration.
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class PaymentController
{
    /**
     * POST /api/v1/payment/create-order
     * Create a Razorpay order for the given order.
     * Body: { order_number }
     */
    public static function createOrder(): void
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        if (empty($data['order_number'])) {
            Response::error('order_number is required', 422);
        }

        $db = Database::getConnection();
        $orderModel = new Order($db);
        $order = $orderModel->findByOrderNumber($data['order_number'], (int) $user->sub);

        if (!$order) {
            Response::error('Order not found', 404);
        }

        if ($order['status'] !== 'pending') {
            Response::error('Order is not in a payable state', 400);
        }

        $keyId = $_ENV['RAZORPAY_KEY_ID'] ?? '';
        $keySecret = $_ENV['RAZORPAY_KEY_SECRET'] ?? '';

        if (!$keyId || !$keySecret) {
            Response::error('Payment gateway not configured', 500);
        }

        // Create Razorpay order via their API
        $razorpayPayload = json_encode([
            'amount'   => (int) ($order['total'] * 100), // Razorpay expects paise
            'currency' => 'INR',
            'receipt'  => $order['order_number'],
        ]);

        $ch = curl_init('https://api.razorpay.com/v1/orders');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $razorpayPayload,
            CURLOPT_USERPWD        => "{$keyId}:{$keySecret}",
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            Response::error('Failed to create payment order', 502);
        }

        $razorpayOrder = json_decode($response, true);

        // Store Razorpay order ID
        $stmt = $db->prepare('UPDATE orders SET razorpay_order_id = ? WHERE id = ?');
        $stmt->execute([$razorpayOrder['id'], $order['id']]);

        Response::success([
            'razorpay_order_id' => $razorpayOrder['id'],
            'razorpay_key_id'   => $keyId,
            'amount'            => $razorpayOrder['amount'],
            'currency'          => 'INR',
            'order_number'      => $order['order_number'],
        ], 'Payment order created');
    }

    /**
     * POST /api/v1/payment/verify
     * Verify Razorpay payment signature.
     * Body: { order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature }
     */
    public static function verify(): void
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $required = ['order_number', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("{$field} is required", 422);
            }
        }

        $db = Database::getConnection();
        $orderModel = new Order($db);
        $order = $orderModel->findByOrderNumber($data['order_number'], (int) $user->sub);

        if (!$order) {
            Response::error('Order not found', 404);
        }

        // Verify signature
        $keySecret = $_ENV['RAZORPAY_KEY_SECRET'] ?? '';
        $expectedSignature = hash_hmac('sha256', $data['razorpay_order_id'] . '|' . $data['razorpay_payment_id'], $keySecret);

        if (!hash_equals($expectedSignature, $data['razorpay_signature'])) {
            Response::error('Payment verification failed — invalid signature', 400);
        }

        // Update order with payment details
        $orderModel->updatePayment((int) $order['id'], [
            'razorpay_order_id'   => $data['razorpay_order_id'],
            'razorpay_payment_id' => $data['razorpay_payment_id'],
            'razorpay_signature'  => $data['razorpay_signature'],
        ]);

        Response::success(['order_number' => $order['order_number'], 'status' => 'confirmed'], 'Payment verified successfully');
    }
}
