<?php
/**
 * ContactController — Public contact form.
 */

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/ContactMessage.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';

class ContactController
{
    /**
     * POST /api/v1/contact
     * Body: { name, email, subject, message }
     */
    public static function submit(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $validator = new Validator();
        if (!$validator->validate($data, [
            'name'    => 'required|min:2|max:100',
            'email'   => 'required|email',
            'subject' => 'required|min:3|max:255',
            'message' => 'required|min:10',
        ])) {
            Response::error('Validation failed', 422, $validator->getErrors());
        }

        $db = Database::getConnection();
        $model = new ContactMessage($db);
        $model->create($data);

        Response::success(null, 'Message sent successfully', 201);
    }
}
