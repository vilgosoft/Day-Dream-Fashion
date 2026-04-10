<?php
/**
 * Cart Model
 * 
 * PDO-based model for the carts table.
 * Methods will be implemented in subsequent steps.
 */
class Cart
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
