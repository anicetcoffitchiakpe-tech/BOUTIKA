<?php
/**
 * Implémentation minimale mais correcte de JWT (HS256) — pas de dépendance externe.
 */
class JWT {
    private static function base64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function decodeSegment(string $seg): string {
        $pad = strlen($seg) % 4;
        if ($pad) $seg .= str_repeat('=', 4 - $pad);
        return base64_decode(strtr($seg, '-_', '+/'));
    }

    /**
     * Signer un token JWT avec HS256.
     */
    public static function encode(array $payload, string $secret, string $expires = '7d'): string {
        $now = time();
        $exp = strtotime('+' . $expires, $now);
        $payload = array_merge($payload, [
            'iat' => $now,
            'exp' => $exp,
        ]);
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];

        $h = self::base64url(json_encode($header));
        $p = self::base64url(json_encode($payload));
        $sig = hash_hmac('sha256', "$h.$p", $secret, true);
        $s = self::base64url($sig);
        return "$h.$p.$s";
    }

    /**
     * Vérifier et décoder un token. Retourne le payload, ou lance une exception.
     */
    public static function decode(string $token, string $secret): object {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Token invalide.');
        }
        [$h, $p, $s] = $parts;
        $sig = self::decodeSegment($s);
        $expected = hash_hmac('sha256', "$h.$p", $secret, true);
        if (!hash_equals($expected, $sig)) {
            throw new Exception('Signature du token invalide.');
        }
        $payload = json_decode(self::decodeSegment($p));
        if (!$payload) throw new Exception('Payload invalide.');
        if (isset($payload->exp) && $payload->exp < time()) {
            throw new Exception('Session expirée.');
        }
        return $payload;
    }
}
