<?php
/**
 * Order Model
 * 
 * PDO-based model for the orders table.
 * Methods will be implemented in subsequent steps.
 */
class Order
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
