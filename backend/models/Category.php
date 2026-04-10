<?php
/**
 * Category Model
 */
class Category
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM categories WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE slug = ? AND status = 'active'");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Get all active categories with hierarchy.
     */
    public function getAll(bool $activeOnly = true): array
    {
        $sql = 'SELECT * FROM categories';
        if ($activeOnly) $sql .= " WHERE status = 'active'";
        $sql .= ' ORDER BY sort_order ASC, name ASC';
        $stmt = $this->db->query($sql);
        $categories = $stmt->fetchAll();

        return $this->buildTree($categories);
    }

    /**
     * Get flat list (for admin).
     */
    public function getAllFlat(): array
    {
        $stmt = $this->db->query('SELECT c.*, p.name AS parent_name FROM categories c LEFT JOIN categories p ON p.id = c.parent_id ORDER BY c.sort_order ASC, c.name ASC');
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO categories (name, slug, description, image, parent_id, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'], $data['slug'], $data['description'] ?? null,
            $data['image'] ?? null, $data['parent_id'] ?? null,
            $data['status'] ?? 'active', $data['sort_order'] ?? 0,
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $values = [];
        foreach (['name', 'slug', 'description', 'image', 'parent_id', 'status', 'sort_order'] as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "{$f} = ?";
                $values[] = $data[$f];
            }
        }
        if (empty($fields)) return false;
        $values[] = $id;
        $stmt = $this->db->prepare('UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($values);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function generateSlug(string $name): string
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        $base = $slug;
        $n = 1;
        while (true) {
            $stmt = $this->db->prepare('SELECT COUNT(*) FROM categories WHERE slug = ?');
            $stmt->execute([$slug]);
            if ((int) $stmt->fetchColumn() === 0) break;
            $slug = $base . '-' . (++$n);
        }
        return $slug;
    }

    private function buildTree(array $categories, ?int $parentId = null): array
    {
        $tree = [];
        foreach ($categories as $cat) {
            $catParent = $cat['parent_id'] === null ? null : (int) $cat['parent_id'];
            if ($catParent === $parentId) {
                $cat['children'] = $this->buildTree($categories, (int) $cat['id']);
                $tree[] = $cat;
            }
        }
        return $tree;
    }
}
