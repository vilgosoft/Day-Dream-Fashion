<?php
/**
 * JSON response helper.
 */
class Response
{
    public static function success(mixed $data = null, string $message = 'Success', int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ]);
        exit;
    }

    public static function error(string $message = 'Error', int $code = 400, array $errors = []): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        echo json_encode($response);
        exit;
    }

    public static function paginated(array $data, int $total, int $page, int $perPage): void
    {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'current_page' => $page,
                'per_page'     => $perPage,
                'total'        => $total,
                'last_page'    => (int) ceil($total / $perPage),
            ],
        ]);
        exit;
    }
}
