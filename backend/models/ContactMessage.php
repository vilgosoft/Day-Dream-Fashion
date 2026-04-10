<?php
/**
 * ContactMessage Model
 */
class ContactMessage
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)');
        $stmt->execute([$data['name'], $data['email'], $data['subject'], $data['message']]);
        return (int) $this->db->lastInsertId();
    }

    public function paginate(int $page = 1, int $perPage = 20): array
    {
        $countStmt = $this->db->query('SELECT COUNT(*) FROM contact_messages');
        $total = (int) $countStmt->fetchColumn();

        $offset = ($page - 1) * $perPage;
        $stmt = $this->db->prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return ['data' => $stmt->fetchAll(), 'total' => $total];
    }

    public function markAsRead(int $id): bool
    {
        $stmt = $this->db->prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function countUnread(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) FROM contact_messages WHERE is_read = 0');
        return (int) $stmt->fetchColumn();
    }
}
