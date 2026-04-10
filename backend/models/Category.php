<?php
/**
 * Category Model
 * 
 * PDO-based model for the categorys table.
 * Methods will be implemented in subsequent steps.
 */
class Category
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
