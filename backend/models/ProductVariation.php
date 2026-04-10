<?php
/**
 * ProductVariation Model
 */
class ProductVariation
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT pv.*, s.name AS size_name, cl.name AS color_name, cl.hex_code AS color_hex,
                    p.name AS product_name, p.slug AS product_slug
             FROM product_variations pv
             JOIN sizes s ON s.id = pv.size_id
             JOIN colors cl ON cl.id = pv.color_id
             JOIN products p ON p.id = pv.product_id
             WHERE pv.id = ?"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO product_variations (product_id, size_id, color_id, sku, price, stock_quantity, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['product_id'], $data['size_id'], $data['color_id'],
            $data['sku'], $data['price'], $data['stock_quantity'] ?? 0, $data['status'] ?? 'active',
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        foreach (['price', 'stock_quantity', 'status', 'sku'] as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "{$f} = ?";
                $values[] = $data[$f];
            }
        }
        if (empty($fields)) return false;
        $values[] = $id;
        $stmt = $this->db->prepare('UPDATE product_variations SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM product_variations WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function decrementStock(int $id, int $qty): bool
    {
        $stmt = $this->db->prepare('UPDATE product_variations SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?');
        $stmt->execute([$qty, $id, $qty]);
        return $stmt->rowCount() > 0;
    }

    public function getInventoryList(int $page = 1, int $perPage = 30): array
    {
        $countStmt = $this->db->prepare('SELECT COUNT(*) FROM product_variations');
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();

        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare(
            "SELECT pv.*, p.name AS product_name, s.name AS size_name, cl.name AS color_name, cl.hex_code AS color_hex,
                    pi.image_path AS product_image
             FROM product_variations pv
             JOIN products p ON p.id = pv.product_id
             JOIN sizes s ON s.id = pv.size_id
             JOIN colors cl ON cl.id = pv.color_id
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             ORDER BY pv.stock_quantity ASC, p.name ASC
             LIMIT ? OFFSET ?"
        );
        $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return ['data' => $stmt->fetchAll(), 'total' => $total];
    }
}
