<?php
/**
 * Middleware : protège une route en vérifiant le JWT.
 * Attache l'utilisateur courant à $GLOBALS['currentUser'].
 */
return function (PDO $pdo, string $secret) {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    // Normalise la casse
    $auth = '';
    foreach ($headers as $k => $v) {
        if (strcasecmp($k, 'Authorization') === 0) {
            $auth = $v;
            break;
        }
    }
    if (!$auth || !str_starts_with($auth, 'Bearer ')) {
        api_error(401, 'Accès refusé. Veuillez vous connecter.');
    }
    $token = substr($auth, 7);
    try {
        $payload = JWT::decode($token, $secret);
    } catch (Exception $e) {
        api_error(401, 'Session invalide ou expirée. Reconnectez-vous.');
    }
    // Recherche l'utilisateur en BDD
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email, role FROM users WHERE id = ?');
    $stmt->execute([$payload->id]);
    $user = $stmt->fetch();
    if (!$user) {
        api_error(401, "L'utilisateur associé au jeton n'existe plus.");
    }
    $GLOBALS['currentUser'] = $user;
};
