# Day Dream Fashion

A full-stack e-commerce web application for a premium clothing brand.

## Tech Stack

| Layer      | Technology                                                    |
|------------|---------------------------------------------------------------|
| Frontend   | React.js, TypeScript, SCSS, Redux Toolkit, React Router DOM, React Hook Form |
| Backend    | PHP (REST API), PDO                                          |
| Database   | MySQL 8.0+                                                   |
| Payments   | Razorpay                                                     |
| Email      | PHPMailer (SMTP)                                             |

## Project Structure

```
Day-Dream-Fashion/
├── frontend/          # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level pages
│   │   ├── store/         # Redux Toolkit slices
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript interfaces
│   │   └── styles/        # SCSS variables, mixins, globals
│   └── ...
│
├── backend/           # PHP REST API
│   ├── public/            # Entry point (index.php)
│   ├── config/            # Database & app configuration
│   ├── controllers/       # Request handlers
│   ├── models/            # PDO-based data models
│   ├── middleware/         # Auth & CORS middleware
│   ├── utils/             # JWT, Mailer, Validator helpers
│   ├── routes/            # API route definitions
│   ├── database/          # MySQL schema
│   └── uploads/           # Product & category images
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PHP 8.1+ with PDO MySQL extension
- MySQL 8.0+
- Composer

### Database Setup

```bash
mysql -u root -p < backend/database/schema.sql
```

### Backend Setup

```bash
cd backend
cp .env.example .env    # Configure your DB, JWT, Razorpay, SMTP credentials
composer install
php -S localhost:8000 -t public
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:3000
```

## Features

- **Customer-facing**: Home page, shop with filters, product detail, cart, checkout, wishlist, contact form
- **Authentication**: Phone-based login (OTP placeholder), user registration
- **Admin Dashboard**: Product/category/user/order/inventory management
- **Payments**: Razorpay integration for secure checkout
- **Email**: Order confirmations to both customer and admin

## Default Admin Login

- Email: `admin@daydreamfashion.com`
- Password: `admin123` (change immediately in production)
