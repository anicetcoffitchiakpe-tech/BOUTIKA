<?php
/**
 * Front controller unique de l'API Boutika (version PHP).
 * Toutes les requêtes /api/... passent par ici. Le serveur built-in de PHP
 * sert aussi les fichiers statiques du dossier public (images /uploads/).
 */
declare(strict_types=1);

// Compatibilité PHP 7.4 (str_starts_with a été ajouté en PHP 8.0)
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }
}
if (!function_exists('str_contains')) {
    function str_contains(string $haystack, string $needle): bool {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }
}

// Gestion des fichiers statiques (pour le serveur PHP built-in)
if (PHP_SAPI === 'cli-server') {
    $static = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($static !== __DIR__ . '/' && is_file($static)) {
        // Types MIME simples
        $ext = strtolower(pathinfo($static, PATHINFO_EXTENSION));
        $types = ['jpg'=>'image/jpeg','jpeg'=>'image/jpeg','png'=>'image/png','gif'=>'image/gif','css'=>'text/css','js'=>'application/javascript','svg'=>'image/svg+xml'];
        if (isset($types[$ext])) header('Content-Type: '.$types[$ext]);
        return false;
    }
}

require_once __DIR__ . '/../config.php';
$cfg = require __DIR__ . '/../config.php';

// Autoloader minimal : charge toutes les classes/fichiers nécessaires
require_once __DIR__ . '/../src/utils/DB.php';
require_once __DIR__ . '/../src/utils/JWT.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/utils/Router.php';
require_once __DIR__ . '/../src/controllers/helpers.php';
require_once __DIR__ . '/../src/controllers/AuthController.php';
require_once __DIR__ . '/../src/controllers/UserController.php';
require_once __DIR__ . '/../src/controllers/CategoryController.php';
require_once __DIR__ . '/../src/controllers/ProductController.php';
require_once __DIR__ . '/../src/controllers/ClientController.php';
require_once __DIR__ . '/../src/controllers/OrderController.php';
require_once __DIR__ . '/../src/controllers/DashboardController.php';

// Connexion DB
$pdo = DB::connect($cfg);

// Middleware CORS
$cors = require __DIR__ . '/../src/middleware/cors.php';
$cors($cfg);

// Instancie les contrôleurs
$authCtrl    = new AuthController($pdo, $cfg['jwt_secret'], $cfg['jwt_expires']);
$userCtrl    = new UserController($pdo);
$catCtrl     = new CategoryController($pdo);
$prodCtrl    = new ProductController($pdo);
$clientCtrl  = new ClientController($pdo);
$orderCtrl   = new OrderController($pdo, $clientCtrl);
$dashCtrl    = new DashboardController($pdo);

// Middleware "protect" : vérifie JWT et remplit $GLOBALS['currentUser']
$authMw = require __DIR__ . '/../src/middleware/auth.php';
Router::registerMiddleware('protect', function() use ($authMw, $pdo, $cfg) { $authMw($pdo, $cfg['jwt_secret']); });

$router = new Router();

// --- Health ---
$router->get('/api/health', function() use ($cfg) {
    return [
        'ok' => true, 'service' => $cfg['app_name'],
        'stack' => 'PHP',
        'time' => date('c'),
    ];
});

// --- Auth ---
$router->post('/api/auth/login',    [$authCtrl, 'login']);
$router->post('/api/auth/register', [$authCtrl, 'register']);
$router->get('/api/auth/me',        [$authCtrl, 'me'])->middleware('protect');

// --- Users ---
$router->group('/api/users', function(Router $r) use ($userCtrl) {
    $r->get('',   [$userCtrl, 'index'])->middleware('protect');
    $r->post('',  [$userCtrl, 'create'])->middleware('protect');
    $r->delete('/:id', [$userCtrl, 'delete'])->middleware('protect');
});

// --- Categories ---
$router->get('/api/categories',     [$catCtrl, 'index']);
$router->get('/api/categories/:id', [$catCtrl, 'show']);
$router->group('/api/categories', function(Router $r) use ($catCtrl) {
    $r->post('',   [$catCtrl, 'create'])->middleware('protect');
    $r->put('/:id', [$catCtrl, 'update'])->middleware('protect');
    $r->delete('/:id', [$catCtrl, 'delete'])->middleware('protect');
});

// --- Products ---
$router->get('/api/products',       [$prodCtrl, 'index']);
$router->get('/api/products/:id',   [$prodCtrl, 'show']);
$router->group('/api/products', function(Router $r) use ($prodCtrl) {
    $r->post('',   [$prodCtrl, 'create'])->middleware('protect');
    $r->put('/:id', [$prodCtrl, 'update'])->middleware('protect');
    $r->delete('/:id', [$prodCtrl, 'delete'])->middleware('protect');
});

// --- Clients ---
$router->group('/api/clients', function(Router $r) use ($clientCtrl) {
    $r->get('',    [$clientCtrl, 'index'])->middleware('protect');
    $r->get('/:id', [$clientCtrl, 'show'])->middleware('protect');
});

// --- Orders ---
$router->post('/api/orders',         [$orderCtrl, 'create']);
$router->get('/api/orders/track/:id',[$orderCtrl, 'track']);
$router->group('/api/orders', function(Router $r) use ($orderCtrl) {
    $r->get('',      [$orderCtrl, 'index'])->middleware('protect');
    $r->get('/:id',  function($id) use ($orderCtrl) { return $orderCtrl->show($id); })->middleware('protect');
    $r->patch('/:id/status',     [$orderCtrl, 'updateStatus'])->middleware('protect');
    $r->post('/:id/payment/confirm',       [$orderCtrl, 'confirmPayment']);
    $r->post('/:id/payment/fail',          [$orderCtrl, 'failPayment']);
    $r->post('/:id/payment/retry',         [$orderCtrl, 'retryPayment']);
    $r->post('/:id/payment/confirm-manual',[$orderCtrl, 'confirmManual'])->middleware('protect');
    $r->delete('/:id', [$orderCtrl, 'delete'])->middleware('protect');
});

// --- Dashboard ---
$router->get('/api/dashboard', [$dashCtrl, 'index'])->middleware('protect');

// --- Dispatch ---
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri    = $_SERVER['REQUEST_URI']    ?? '/';
$router->dispatch($method, $uri);
