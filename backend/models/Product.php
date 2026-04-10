<?php
/**
 * Product Model
 *
 * PDO-based model for products, product_images, and related queries.
 */
class Product
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Paginated product listing with filters for the shop page.
     */
    public function paginate(array $filters = [], int $page = 1, int $perPage = 20): array
    {
        $where = ['p.status = ?'];
        $params = ['active'];

        if (!empty($filters['category_id'])) {
            $where[] = 'p.category_id = ?';
            $params[] = $filters['category_id'];
        }
        if (!empty($filters['featured'])) {
            $where[] = 'p.is_featured = 1';
        }
        if (!empty($filters['trending'])) {
            $where[] = 'p.is_trending = 1';
        }
        if (!empty($filters['min_price'])) {
            $where[] = 'pv_agg.min_price >= ?';
            $params[] = $filters['min_price'];
        }
        if (!empty($filters['max_price'])) {
            $where[] = 'pv_agg.max_price <= ?';
            $params[] = $filters['max_price'];
        }
        if (!empty($filters['size_id'])) {
            $ids = is_array($filters['size_id']) ? $filters['size_id'] : explode(',', $filters['size_id']);
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $where[] = "EXISTS (SELECT 1 FROM product_variations pvs WHERE pvs.product_id = p.id AND pvs.size_id IN ({$ph}) AND pvs.status='active')";
            $params = array_merge($params, $ids);
        }
        if (!empty($filters['color_id'])) {
            $ids = is_array($filters['color_id']) ? $filters['color_id'] : explode(',', $filters['color_id']);
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $where[] = "EXISTS (SELECT 1 FROM product_variations pvc WHERE pvc.product_id = p.id AND pvc.color_id IN ({$ph}) AND pvc.status='active')";
            $params = array_merge($params, $ids);
        }
        if (!empty($filters['search'])) {
            $where[] = '(p.name LIKE ? OR p.description LIKE ?)';
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
        }

        $whereClause = implode(' AND ', $where);

        // Count
        $countSql = "SELECT COUNT(DISTINCT p.id) FROM products p
            LEFT JOIN (SELECT product_id, MIN(price) AS min_price, MAX(price) AS max_price FROM product_variations WHERE status='active' GROUP BY product_id) pv_agg ON pv_agg.product_id = p.id
            WHERE {$whereClause}";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Sort
        $orderMap = [
            'price_asc'  => 'pv_agg.min_price ASC',
            'price_desc' => 'pv_agg.max_price DESC',
            'newest'     => 'p.created_at DESC',
            'name_asc'   => 'p.name ASC',
        ];
        $orderBy = $orderMap[$filters['sort'] ?? ''] ?? 'p.created_at DESC';
        $offset = ($page - 1) * $perPage;

        $sql = "SELECT p.*, c.name AS category_name, c.slug AS category_slug,
                    pi.image_path AS primary_image,
                    pv_agg.min_price, pv_agg.max_price
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
                LEFT JOIN (SELECT product_id, MIN(price) AS min_price, MAX(price) AS max_price FROM product_variations WHERE status='active' GROUP BY product_id) pv_agg ON pv_agg.product_id = p.id
                WHERE {$whereClause}
                ORDER BY {$orderBy}
                LIMIT ? OFFSET ?";

        $stmt = $this->db->prepare($sql);
        $i = 1;
        foreach ($params as $val) {
            $stmt->bindValue($i++, $val);
        }
        $stmt->bindValue($i++, $perPage, PDO::PARAM_INT);
        $stmt->bindValue($i, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['data' => $stmt->fetchAll(), 'total' => $total];
    }

    /**
     * Get product by slug with images and variations (public detail page).
     */
    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.slug = ? AND p.status = 'active'"
        );
        $stmt->execute([$slug]);
        $product = $stmt->fetch();
        if (!$product) return null;

        $product['images'] = $this->getImages((int) $product['id']);
        $product['variations'] = $this->getVariations((int) $product['id']);
        return $product;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if (!$product) return null;

        $product['images'] = $this->getImages($id);
        $product['variations'] = $this->getVariations($id, false);
        return $product;
    }

    public function getImages(int $productId): array
    {
        $stmt = $this->db->prepare('SELECT id, image_path, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order');
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public function getVariations(int $productId, bool $activeOnly = true): array
    {
        $statusFilter = $activeOnly ? "AND pv.status = 'active'" : '';
        $stmt = $this->db->prepare(
            "SELECT pv.*, s.name AS size_name, s.sort_order AS size_sort, cl.name AS color_name, cl.hex_code AS color_hex
             FROM product_variations pv
             JOIN sizes s ON s.id = pv.size_id
             JOIN colors cl ON cl.id = pv.color_id
             WHERE pv.product_id = ? {$statusFilter}
             ORDER BY s.sort_order, cl.name"
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO products (name, slug, description, category_id, base_price, status, is_featured, is_trending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'], $data['slug'], $data['description'] ?? null,
            $data['category_id'] ?? null, $data['base_price'],
            $data['status'] ?? 'draft', $data['is_featured'] ?? 0, $data['is_trending'] ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        foreach (['name', 'slug', 'description', 'category_id', 'base_price', 'status', 'is_featured', 'is_trending'] as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "{$f} = ?";
                $values[] = $data[$f];
            }
        }
        if (empty($fields)) return false;
        $values[] = $id;
        $stmt = $this->db->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function addImage(int $productId, string $path, bool $isPrimary = false, int $sortOrder = 0): int
    {
        $stmt = $this->db->prepare('INSERT INTO product_images (product_id, image_path, is_primary, sort_order) VALUES (?, ?, ?, ?)');
        $stmt->execute([$productId, $path, $isPrimary ? 1 : 0, $sortOrder]);
        return (int) $this->db->lastInsertId();
    }

    public function deleteImage(int $imageId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM product_images WHERE id = ?');
        return $stmt->execute([$imageId]);
    }

    public function count(string $status = ''): int
    {
        $sql = 'SELECT COUNT(*) FROM products';
        $params = [];
        if ($status) { $sql .= ' WHERE status = ?'; $params[] = $status; }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function adminPaginate(int $page = 1, int $perPage = 20): array
    {
        $total = $this->count();
        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare(
            "SELECT p.*, c.name AS category_name, pi.image_path AS primary_image
             FROM products p LEFT JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
        );
        $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return ['data' => $stmt->fetchAll(), 'total' => $total];
    }

    public function generateSlug(string $name): string
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        $base = $slug;
        $n = 1;
        while (true) {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM products WHERE slug = ?');
            $stmt->execute([$slug]);
            if ((int) $stmt->fetchColumn() === 0) break;
            $slug = $base . '-' . (++$n);
        }
        return $slug;
    }
}
