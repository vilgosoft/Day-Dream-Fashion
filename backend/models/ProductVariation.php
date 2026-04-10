<?php
/**
 * ProductVariation Model
 * 
 * PDO-based model for the productvariations table.
 * Methods will be implemented in subsequent steps.
 */
class ProductVariation
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
