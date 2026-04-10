<?php
/**
 * User Model
 * 
 * PDO-based model for the users table.
 * Methods will be implemented in subsequent steps.
 */
class User
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
