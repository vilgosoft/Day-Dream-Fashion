<?php
/**
 * ContactMessage Model
 * 
 * PDO-based model for the contactmessages table.
 * Methods will be implemented in subsequent steps.
 */
class ContactMessage
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
