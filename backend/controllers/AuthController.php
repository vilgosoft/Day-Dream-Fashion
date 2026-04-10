<?php
/**
 * AuthController
 *
 * Handles user registration and phone-based login (OTP placeholder).
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../utils/JwtHandler.php';

class AuthController
{
    /**
     * POST /api/v1/auth/register
     * Register a new user with name, email, and phone.
     */
    public static function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($data, [
            'name'  => 'required|min:2|max:100',
            'email' => 'required|email',
            'phone' => 'required|phone',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $userModel = new User($db);

        // Check for duplicate email
        if ($userModel->findByEmail($data['email'])) {
            Response::error('Email already registered', 409);
        }

        // Check for duplicate phone
        if ($userModel->findByPhone($data['phone'])) {
            Response::error('Phone number already registered', 409);
        }

        $userId = $userModel->create([
            'name'  => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
        ]);

        $user = $userModel->findById($userId);

        Response::success($user, 'Registration successful', 201);
    }

    /**
     * POST /api/v1/auth/login
     * Login with phone number. OTP verification is a placeholder for now.
     *
     * In production: this should send an OTP via SMS and require a second
     * endpoint to verify. For development, we return a JWT directly.
     */
    public static function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($data, [
            'phone' => 'required|phone',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $userModel = new User($db);

        $user = $userModel->findByPhone($data['phone']);
        if (!$user) {
            Response::error('No account found with this phone number', 404);
        }

        if ($user['status'] !== 'active') {
            Response::error('Account is inactive or banned', 403);
        }

        /*
         * ── OTP PLACEHOLDER ──────────────────────────────────────────
         * In production, this block should:
         *   1. Generate a 6-digit OTP
         *   2. Hash and store it with expiry in the users table (or a separate otp table)
         *   3. Send the OTP via SMS gateway (e.g., Twilio, MSG91)
         *   4. Return a message like "OTP sent to your phone"
         *   5. Create a separate POST /auth/verify-otp endpoint that:
         *      - Accepts phone + otp
         *      - Verifies hash and expiry
         *      - Returns JWT tokens on success
         *
         * For now (development), we skip OTP and return tokens directly.
         * ─────────────────────────────────────────────────────────────
         */

        // Generate tokens
        $accessToken = JwtHandler::encode([
            'sub'  => $user['id'],
            'type' => 'user',
        ], 900); // 15 minutes

        $refreshToken = JwtHandler::generateRefreshToken();

        Response::success([
            'user' => [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
            ],
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type'    => 'Bearer',
            'expires_in'    => 900,
        ], 'Login successful');
    }

    /**
     * GET /api/v1/auth/profile
     * Get the currently authenticated user's profile.
     */
    public static function profile(): void
    {
        require_once __DIR__ . '/../middleware/AuthMiddleware.php';
        $decoded = AuthMiddleware::authenticate();

        $db = Database::getConnection();
        $userModel = new User($db);
        $user = $userModel->findById((int) $decoded->sub);

        if (!$user) {
            Response::error('User not found', 404);
        }

        Response::success($user, 'Profile retrieved');
    }
}
