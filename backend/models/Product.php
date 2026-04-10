<?php
/**
 * Product Model
 * 
 * PDO-based model for the products table.
 * Methods will be implemented in subsequent steps.
 */
class Product
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
