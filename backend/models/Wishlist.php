<?php
/**
 * Wishlist Model
 * 
 * PDO-based model for the wishlists table.
 * Methods will be implemented in subsequent steps.
 */
class Wishlist
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
