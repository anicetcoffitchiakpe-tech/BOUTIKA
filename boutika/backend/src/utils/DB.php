<?php
/**
 * Connexion PDO MySQL (singleton).
 */
class DB {
    private static ?PDO $pdo = null;

    public static function connect(array $cfg): PDO {
        if (self::$pdo !== null) return self::$pdo;
        $db = $cfg['db'];
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $db['host'], $db['port'], $db['name'], $db['charset']
        );
        try {
            self::$pdo = new PDO($dsn, $db['user'], $db['password'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
            self::$pdo->exec("SET NAMES utf8mb4");
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'ok' => false,
                'error' => 'Erreur de connexion MySQL : ' . $e->getMessage(),
                'hint'  => 'Vérifiez que MySQL est démarré (XAMPP/WAMP) et que la base "boutika" existe (lancez install.bat).',
            ], JSON_UNESCAPED_UNICODE);
            exit(1);
        }
        return self::$pdo;
    }
}
