<?php
class AuthController {
    private PDO $pdo;
    private string $secret;
    private string $expires;

    public function __construct(PDO $pdo, string $secret, string $expires) {
        $this->pdo = $pdo;
        $this->secret = $secret;
        $this->expires = $expires;
    }

    public function login() {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        if (!$email || !$password) {
            api_error(400, 'E-mail et mot de passe requis.');
        }
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password'])) {
            api_error(401, 'Identifiants incorrects.');
        }
        $token = JWT::encode(['id' => $user['id'], 'role' => $user['role']], $this->secret, $this->expires);
        return [
            'token' => $token,
            'user' => [
                'id' => $user['id'], 'firstName' => $user['first_name'], 'lastName' => $user['last_name'],
                'email' => $user['email'], 'role' => $user['role'],
            ],
        ];
    }

    public function register() {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $first = trim($body['firstName'] ?? ''); $last = trim($body['lastName'] ?? '');
        $email = trim($body['email'] ?? ''); $password = $body['password'] ?? '';
        $role = ($body['role'] ?? 'gestionnaire') === 'administrateur' ? 'administrateur' : 'gestionnaire';
        if (!$first || !$last || !$email || !$password || strlen($password) < 6) {
            api_error(400, 'Prénom, nom, e-mail et mot de passe (≥6 caractères) requis.');
        }
        $stmt = $this->pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([strtolower($email)]);
        if ($stmt->fetch()) api_error(409, 'Un compte existe déjà pour cet e-mail.');
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->pdo->prepare('INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$first, $last, strtolower($email), $hash, $role]);
        $id = $this->pdo->lastInsertId();
        $token = JWT::encode(['id' => (int)$id, 'role' => $role], $this->secret, $this->expires);
        return ['token' => $token, 'user' => ['id' => (int)$id, 'firstName' => $first, 'lastName' => $last, 'email' => strtolower($email), 'role' => $role]];
    }

    public function me() {
        $u = $GLOBALS['currentUser'];
        return ['user' => [
            'id' => $u['id'], 'firstName' => $u['first_name'], 'lastName' => $u['last_name'],
            'email' => $u['email'], 'role' => $u['role'],
        ]];
    }
}
