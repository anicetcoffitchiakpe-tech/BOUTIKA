<?php
/**
 * Script d'installation : crée la base MySQL, les tables et insère les données de démo.
 * Génère automatiquement le hash bcrypt des mots de passe.
 */
declare(strict_types=1);

echo "========================================\n";
echo "  Boutika BACKEND (PHP) — Installation\n";
echo "========================================\n\n";

$cfg = require __DIR__ . '/../config.php';
$db  = $cfg['db'];

echo "Connexion au serveur MySQL {$db['host']}:{$db['port']} en tant que {$db['user']}...\n";
try {
    $pdo = new PDO(
        "mysql:host={$db['host']};port={$db['port']};charset={$db['charset']}",
        $db['user'], $db['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "[OK] Connexion MySQL établie.\n\n";
} catch (PDOException $e) {
    echo "[ERREUR] Connexion MySQL impossible : " . $e->getMessage() . "\n";
    echo "  → Démarrez MySQL dans XAMPP/WAMP puis relancez install.bat.\n";
    exit(1);
}

// Crée la base si elle n'existe pas
$dbname = $db['name'];
echo "Création de la base `$dbname` si absente...\n";
$pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE `$dbname`");
echo "[OK] Base `$dbname` prête.\n\n";

// Crée les tables
echo "Création des tables (schema.sql)...\n";
$sql = file_get_contents(__DIR__ . '/../sql/schema.sql');
foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
    if ($stmt) $pdo->exec($stmt);
}
echo "[OK] Tables créées.\n\n";

// Vérifie si les utilisateurs existent déjà
$count = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
if ($count > 0) {
    echo "La base contient déjà des utilisateurs — seed ignoré.\n";
    echo "Pour tout réinitialiser :  php scripts/install.php --reset\n";
    exit(0);
}

echo "Insertion des données de démonstration...\n";
echo "  → Hash bcrypt des mots de passe (peut prendre 1 seconde)...\n";
$hash = password_hash('boutika2026', PASSWORD_BCRYPT);

$seed = file_get_contents(__DIR__ . '/../sql/seed.sql');
// Remplace le hash fictif du seed.sql par un vrai hash généré ici
$seed = preg_replace("/'\\$2y\\$10\\$[^']+'/", "'" . $hash . "'", $seed);

foreach (array_filter(array_map('trim', explode(';', $seed))) as $stmt) {
    if ($stmt) {
        try { $pdo->exec($stmt); }
        catch (Throwable $e) {
            echo "[AVERTISSEMENT] " . $e->getMessage() . "\n";
        }
    }
}

$nUsers      = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
$nCats       = (int)$pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
$nProducts   = (int)$pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
$nClients    = (int)$pdo->query('SELECT COUNT(*) FROM clients')->fetchColumn();
$nOrders     = (int)$pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();

echo "\n[OK] Données insérées :\n";
echo "     - Utilisateurs : $nUsers (admin@boutika.bj / boutika2026)\n";
echo "     - Catégories   : $nCats\n";
echo "     - Produits     : $nProducts\n";
echo "     - Clients      : $nClients\n";
echo "     - Commandes    : $nOrders\n\n";
echo "========================================\n";
echo "  Installation terminée. Vous pouvez :\n";
echo "    • Lancer start-server.bat (port 5000)\n";
echo "    • Lancer test-routes.bat pour tester\n";
echo "========================================\n";
