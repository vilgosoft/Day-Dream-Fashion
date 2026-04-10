<?php
/**
 * Order Model — manages orders and order_items tables.
 */
class Order
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Create an order from the user's cart. Uses a transaction with stock locking.
     */
    public function createFromCart(int $userId, array $cartItems, array $addressData): array
    {
        $this->db->beginTransaction();

        try {
            // Lock and verify stock for each variation
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                $lockStmt = $this->db->prepare(
                    'SELECT pv.*, s.name AS size_name, cl.name AS color_name, p.name AS product_name, p.slug AS product_slug
                     FROM product_variations pv
                     JOIN sizes s ON s.id = pv.size_id
                     JOIN colors cl ON cl.id = pv.color_id
                     JOIN products p ON p.id = pv.product_id
                     WHERE pv.id = ? FOR UPDATE'
                );
                $lockStmt->execute([$item['product_variation_id']]);
                $variation = $lockStmt->fetch();

                if (!$variation || $variation['stock_quantity'] < $item['quantity']) {
                    $this->db->rollBack();
                    return ['error' => "Insufficient stock for {$item['product_name']} ({$item['size_name']}, {$item['color_name']})"];
                }

                // Decrement stock
                $decStmt = $this->db->prepare('UPDATE product_variations SET stock_quantity = stock_quantity - ? WHERE id = ?');
                $decStmt->execute([$item['quantity'], $item['product_variation_id']]);

                $itemSubtotal = $variation['price'] * $item['quantity'];
                $subtotal += $itemSubtotal;

                // Get primary image for snapshot
                $imgStmt = $this->db->prepare("SELECT image_path FROM product_images WHERE product_id = ? AND is_primary = 1 LIMIT 1");
                $imgStmt->execute([$variation['product_id']]);
                $img = $imgStmt->fetch();

                $orderItems[] = [
                    'product_variation_id' => $variation['id'],
                    'product_name'         => $variation['product_name'],
                    'product_slug'         => $variation['product_slug'],
                    'size_name'            => $variation['size_name'],
                    'color_name'           => $variation['color_name'],
                    'price'                => $variation['price'],
                    'quantity'             => $item['quantity'],
                    'subtotal'             => $itemSubtotal,
                ];
            }

            // Calculate totals
            $taxRate = 0.18; // 18% GST — could come from settings table
            $shippingCost = 99.00;
            $tax = round($subtotal * $taxRate, 2);
            $total = $subtotal + $tax + $shippingCost;

            $orderNumber = $this->generateOrderNumber();

            // Insert order
            $orderStmt = $this->db->prepare(
                'INSERT INTO orders (user_id, order_number, subtotal, discount, tax, shipping, total, shipping_address, billing_address, payment_method, status)
                 VALUES (?, ?, ?, 0.00, ?, ?, ?, ?, ?, ?, ?)'
            );
            $orderStmt->execute([
                $userId, $orderNumber, $subtotal, $tax, $shippingCost, $total,
                json_encode($addressData['shipping_address']),
                isset($addressData['billing_address']) ? json_encode($addressData['billing_address']) : null,
                $addressData['payment_method'] ?? 'razorpay',
                'pending',
            ]);
            $orderId = (int) $this->db->lastInsertId();

            // Insert order items
            $itemStmt = $this->db->prepare(
                'INSERT INTO order_items (order_id, product_variation_id, product_name, product_slug, size_name, color_name, price, quantity, subtotal)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            foreach ($orderItems as $oi) {
                $itemStmt->execute([
                    $orderId, $oi['product_variation_id'], $oi['product_name'], $oi['product_slug'],
                    $oi['size_name'], $oi['color_name'], $oi['price'], $oi['quantity'], $oi['subtotal'],
                ]);
            }

            $this->db->commit();

            return [
                'order_id'     => $orderId,
                'order_number' => $orderNumber,
                'subtotal'     => $subtotal,
                'tax'          => $tax,
                'shipping'     => $shippingCost,
                'total'        => $total,
                'items'        => $orderItems,
            ];

        } catch (\Exception $e) {
            $this->db->rollBack();
            return ['error' => 'Failed to create order: ' . $e->getMessage()];
        }
    }

    public function findByOrderNumber(string $orderNumber, ?int $userId = null): ?array
    {
        $sql = 'SELECT * FROM orders WHERE order_number = ?';
        $params = [$orderNumber];
        if ($userId !== null) {
            $sql .= ' AND user_id = ?';
            $params[] = $userId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $order = $stmt->fetch();
        if (!$order) return null;

        $order['shipping_address'] = json_decode($order['shipping_address'], true);
        $order['billing_address'] = $order['billing_address'] ? json_decode($order['billing_address'], true) : null;
        $order['items'] = $this->getItems((int) $order['id']);
        return $order;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?');
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if (!$order) return null;

        $order['shipping_address'] = json_decode($order['shipping_address'], true);
        $order['billing_address'] = $order['billing_address'] ? json_decode($order['billing_address'], true) : null;
        $order['items'] = $this->getItems($id);
        return $order;
    }

    public function getItems(int $orderId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM order_items WHERE order_id = ?');
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        foreach ($orders as &$order) {
            $order['shipping_address'] = json_decode($order['shipping_address'], true);
        }
        return $orders;
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare('UPDATE orders SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function updatePayment(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE orders SET razorpay_order_id = ?, razorpay_payment_id = ?, razorpay_signature = ?, status = ? WHERE id = ?'
        );
        return $stmt->execute([
            $data['razorpay_order_id'], $data['razorpay_payment_id'],
            $data['razorpay_signature'], 'confirmed', $id,
        ]);
    }

    public function adminPaginate(int $page = 1, int $perPage = 20, string $status = ''): array
    {
        $where = '';
        $params = [];
        if ($status) {
            $where = 'WHERE o.status = ?';
            $params[] = $status;
        }

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM orders o {$where}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $offset = ($page - 1) * $perPage;
        $sql = "SELECT o.*, u.name AS user_name, u.email AS user_email
                FROM orders o LEFT JOIN users u ON u.id = o.user_id
                {$where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($sql);
        $i = 1;
        foreach ($params as $p) { $stmt->bindValue($i++, $p); }
        $stmt->bindValue($i++, $perPage, PDO::PARAM_INT);
        $stmt->bindValue($i, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['data' => $stmt->fetchAll(), 'total' => $total];
    }

    public function getTotalRevenue(): float
    {
        $stmt = $this->db->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status NOT IN ('cancelled')");
        return (float) $stmt->fetchColumn();
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM orders');
        return (int) $stmt->fetchColumn();
    }

    public function countByStatus(string $status): int
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM orders WHERE status = ?');
        $stmt->execute([$status]);
        return (int) $stmt->fetchColumn();
    }

    private function generateOrderNumber(): string
    {
        $date = date('Ymd');
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()");
        $stmt->execute();
        $count = (int) $stmt->fetchColumn() + 1;
        return sprintf('DDF-%s-%04d', $date, $count);
    }
}
