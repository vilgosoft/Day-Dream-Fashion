<?php
/**
 * JWT token encode/decode using firebase/php-jwt.
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHandler
{
    private static function getSecret(): string
    {
        return $_ENV['JWT_SECRET'] ?? 'change-this-secret';
    }

    /**
     * Generate an access token.
     */
    public static function encode(array $payload, int $expiry = 900): string
    {
        $issuedAt = time();
        $tokenPayload = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $issuedAt + $expiry,
        ]);

        return JWT::encode($tokenPayload, self::getSecret(), 'HS256');
    }

    /**
     * Decode and verify a token. Returns null on failure.
     */
    public static function decode(string $token): ?object
    {
        try {
            return JWT::decode($token, new Key(self::getSecret(), 'HS256'));
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate a random refresh token string.
     */
    public static function generateRefreshToken(): string
    {
        return bin2hex(random_bytes(32));
    }
}
