<?php
/**
 * Cart Model — manages carts and cart_items tables.
 */
class Cart
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get or create a cart for the user.
     */
    public function getOrCreate(int $userId): array
    {
        $stmt = $this->db->prepare('SELECT * FROM carts WHERE user_id = ?');
        $stmt->execute([$userId]);
        $cart = $stmt->fetch();

        if (!$cart) {
            $ins = $this->db->prepare('INSERT INTO carts (user_id) VALUES (?)');
            $ins->execute([$userId]);
            $cartId = (int) $this->db->lastInsertId();
            $cart = ['id' => $cartId, 'user_id' => $userId];
        }

        return $cart;
    }

    /**
     * Get cart items with product/variation details.
     */
    public function getItems(int $cartId): array
    {
        $stmt = $this->db->prepare(
            "SELECT ci.id, ci.quantity, ci.product_variation_id,
                    pv.price, pv.stock_quantity, pv.sku,
                    p.id AS product_id, p.name AS product_name, p.slug AS product_slug,
                    s.name AS size_name, cl.name AS color_name, cl.hex_code AS color_hex,
                    pi.image_path AS product_image
             FROM cart_items ci
             JOIN product_variations pv ON pv.id = ci.product_variation_id
             JOIN products p ON p.id = pv.product_id
             JOIN sizes s ON s.id = pv.size_id
             JOIN colors cl ON cl.id = pv.color_id
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             WHERE ci.cart_id = ?
             ORDER BY ci.created_at DESC"
        );
        $stmt->execute([$cartId]);
        return $stmt->fetchAll();
    }

    /**
     * Add item or increment quantity if already in cart.
     */
    public function addItem(int $cartId, int $variationId, int $quantity = 1): bool
    {
        $stmt = $this->db->prepare(
            'INSERT INTO cart_items (cart_id, product_variation_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)'
        );
        return $stmt->execute([$cartId, $variationId, $quantity]);
    }

    public function updateItemQuantity(int $cartItemId, int $quantity): bool
    {
        if ($quantity <= 0) {
            return $this->removeItem($cartItemId);
        }
        $stmt = $this->db->prepare('UPDATE cart_items SET quantity = ? WHERE id = ?');
        return $stmt->execute([$quantity, $cartItemId]);
    }

    public function removeItem(int $cartItemId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE id = ?');
        return $stmt->execute([$cartItemId]);
    }

    public function clearCart(int $cartId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE cart_id = ?');
        return $stmt->execute([$cartId]);
    }

    public function getCartItemById(int $cartItemId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM cart_items WHERE id = ?');
        $stmt->execute([$cartItemId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
