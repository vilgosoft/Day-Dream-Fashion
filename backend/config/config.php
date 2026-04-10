<?php
/**
 * Application configuration constants.
 * Values are loaded from .env — never hardcode secrets here.
 */
return [
    'app' => [
        'name'    => $_ENV['APP_NAME'] ?? 'Day Dream Fashion',
        'url'     => $_ENV['APP_URL'] ?? 'http://localhost:8000',
        'env'     => $_ENV['APP_ENV'] ?? 'development',
    ],

    'jwt' => [
        'secret'          => $_ENV['JWT_SECRET'] ?? 'change-this-secret',
        'access_expiry'   => 900,    // 15 minutes
        'refresh_expiry'  => 2592000, // 30 days
        'algorithm'       => 'HS256',
    ],

    'razorpay' => [
        'key_id'     => $_ENV['RAZORPAY_KEY_ID'] ?? '',
        'key_secret' => $_ENV['RAZORPAY_KEY_SECRET'] ?? '',
    ],

    'mail' => [
        'host'       => $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com',
        'port'       => $_ENV['MAIL_PORT'] ?? 587,
        'username'   => $_ENV['MAIL_USERNAME'] ?? '',
        'password'   => $_ENV['MAIL_PASSWORD'] ?? '',
        'from_email' => $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@daydreamfashion.com',
        'from_name'  => $_ENV['MAIL_FROM_NAME'] ?? 'Day Dream Fashion',
    ],

    'upload' => [
        'max_size'       => 5 * 1024 * 1024, // 5MB
        'allowed_types'  => ['image/jpeg', 'image/png', 'image/webp'],
        'products_path'  => __DIR__ . '/../uploads/products/',
        'categories_path' => __DIR__ . '/../uploads/categories/',
    ],
];
