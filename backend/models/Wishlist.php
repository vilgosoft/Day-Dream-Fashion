<?php
/**
 * Wishlist Model
 */
class Wishlist
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Get user's wishlist with product details.
     */
    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            "SELECT w.id, w.created_at, p.id AS product_id, p.name, p.slug, p.base_price,
                    pi.image_path AS primary_image,
                    pv_agg.min_price
             FROM wishlists w
             JOIN products p ON p.id = w.product_id
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             LEFT JOIN (SELECT product_id, MIN(price) AS min_price FROM product_variations WHERE status='active' GROUP BY product_id) pv_agg ON pv_agg.product_id = p.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Toggle wishlist: add if not present, remove if present.
     */
    public function toggle(int $userId, int $productId): array
    {
        $stmt = $this->db->prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$userId, $productId]);
        $existing = $stmt->fetch();

        if ($existing) {
            $del = $this->db->prepare('DELETE FROM wishlists WHERE id = ?');
            $del->execute([$existing['id']]);
            return ['action' => 'removed'];
        }

        $ins = $this->db->prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)');
        $ins->execute([$userId, $productId]);
        return ['action' => 'added'];
    }

    public function isWishlisted(int $userId, int $productId): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM wishlists WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$userId, $productId]);
        return (int) $stmt->fetchColumn() > 0;
    }
}
