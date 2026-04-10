<?php
/**
 * Admin Model
 * 
 * PDO-based model for the admins table.
 * Methods will be implemented in subsequent steps.
 */
class Admin
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
