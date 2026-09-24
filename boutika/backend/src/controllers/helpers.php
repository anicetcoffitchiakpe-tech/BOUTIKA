<?php
/**
 * Fonctions utilitaires partagées par les contrôleurs.
 */

function body_json(): array {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function query_param(string $k, $default = null) {
    return $_GET[$k] ?? $default;
}

function current_user(): array {
    return $GLOBALS['currentUser'] ?? [];
}

function require_role(PDO $pdo, string ...$roles): void {
    $u = current_user();
    if (!$u) api_error(401, 'Authentification requise.');
    if (!in_array($u['role'], $roles, true)) api_error(403, 'Droits insuffisants.');
}

function generate_ref(string $prefix = 'BK'): string {
    return $prefix . '-' . strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 10));
}

// Parse les durées comme "7d" en secondes
function parse_duration(string $d): int {
    $d = trim($d);
    if (ctype_digit($d)) return (int)$d;
    if (preg_match('/^(\d+)\s*(s|min|h|d|w|m)$/', $d, $m)) {
        [, $n, $unit] = $m;
        return match ($unit) {
            's' => (int)$n,
            'min' => (int)$n * 60,
            'h' => (int)$n * 3600,
            'd' => (int)$n * 86400,
            'w' => (int)$n * 86400 * 7,
            'm' => (int)$n * 86400 * 30,
            default => (int)$n,
        };
    }
    return 7 * 86400;
}

function days_ago(int $n, int $hour = 10): string {
    $dt = new DateTime();
    $dt->modify("-$n days");
    $dt->setTime($hour, random_int(0, 49));
    return $dt->format('Y-m-d H:i:s');
}

function jenc($val): string { return json_encode($val, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); }
