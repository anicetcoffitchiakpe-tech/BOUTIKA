<?php
/**
 * Helpers HTTP/JSON.
 */
function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_error(int $status, string $message, array $extra = []): void {
    json_response(array_merge(['ok' => false, 'error' => $message], $extra), $status);
}

function not_found(): void {
    api_error(404, 'Route introuvable.');
}
