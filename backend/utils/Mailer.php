<?php
/**
 * Email sending utility using PHPMailer.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class Mailer
{
    private static function createMailer(): PHPMailer
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
        $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int) ($_ENV['MAIL_PORT'] ?? 587);

        $mail->setFrom(
            $_ENV['MAIL_FROM_EMAIL'] ?? 'noreply@daydreamfashion.com',
            $_ENV['MAIL_FROM_NAME'] ?? 'Day Dream Fashion'
        );

        return $mail;
    }

    /**
     * Send an email. Returns true on success, false on failure.
     */
    public static function send(string $to, string $subject, string $htmlBody): bool
    {
        try {
            $mail = self::createMailer();
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send order confirmation to customer.
     */
    public static function sendOrderConfirmation(string $email, array $order): bool
    {
        $subject = "Order Confirmed — #{$order['order_number']}";
        $body = "<h2>Thank you for your order!</h2>"
              . "<p>Order Number: <strong>{$order['order_number']}</strong></p>"
              . "<p>Total: <strong>₹{$order['total']}</strong></p>"
              . "<p>We will notify you when your order ships.</p>";

        return self::send($email, $subject, $body);
    }

    /**
     * Send new order notification to admin.
     */
    public static function sendAdminOrderNotification(array $order): bool
    {
        $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@daydreamfashion.com';
        $subject = "New Order Received — #{$order['order_number']}";
        $body = "<h2>New Order</h2>"
              . "<p>Order Number: <strong>{$order['order_number']}</strong></p>"
              . "<p>Total: <strong>₹{$order['total']}</strong></p>"
              . "<p>Check the admin dashboard for details.</p>";

        return self::send($adminEmail, $subject, $body);
    }
}
