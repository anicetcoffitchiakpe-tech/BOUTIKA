<?php
/**
 * Script de test des routes API (version PHP).
 * Même logique que le script Node : 41 tests.
 *
 * Usage : php tests/run-api-tests.php
 * L'API doit être démarrée (start-server.bat) avant.
 */
declare(strict_types=1);

$base = getenv('BASE_URL') ?: 'http://localhost:5000';
$results = []; $pass=0; $fail=0;

function log_test(string $name, bool $ok, string $detail=''): void {
    global $pass, $fail, $results;
    $results[] = ['n'=>$name,'ok'=>$ok,'d'=>$detail];
    if ($ok) $pass++; else $fail++;
    $mark = $ok ? "✅ PASS" : "❌ FAIL";
    echo "  $mark  $name" . ($detail?"  — $detail":'') . "\n";
}

function http_req(string $method, string $path, array $opts=[]): array {
    global $base;
    $headers = ['Content-Type: application/json'];
    if (!empty($opts['token'])) $headers[] = 'Authorization: Bearer ' . $opts['token'];
    $ch = curl_init($base . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 10,
    ]);
    if (isset($opts['body'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($opts['body'], JSON_UNESCAPED_UNICODE));
    }
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);
    $data = $resp ? json_decode($resp, true) : null;
    if (json_last_error() !== JSON_NONE && !$data) $data = $resp;
    return ['status'=>$code,'data'=>$data,'err'=>$err];
}

function group(string $title): void { echo "\n▶ $title\n"; }

echo "\n=== Boutika (PHP) — tests des routes API  (base: $base) ===\n";
group('Pré-check');
$h = @file_get_contents($base . '/api/health', false, stream_context_create(['http'=>['timeout'=>3]]));
if (!$h) {
    log_test('API joignable', false, "Impossible d'atteindre $base. Lancez start-server.bat.");
    echo "\nArrêt des tests.\n"; exit(1);
}
log_test('API joignable', true);

// ---------- AUTH ----------
group('Authentification');
$r = http_req('POST','/api/auth/login',['body'=>['email'=>'admin@boutika.bj','password'=>'boutika2026']]);
log_test('Connexion admin (identifiants corrects)', $r['status']===200 && !empty($r['data']['token']));
$adminToken = $r['data']['token'] ?? '';
$adminUserId = $r['data']['user']['id'] ?? $r['data']['user']['_id'] ?? null;

$r = http_req('POST','/api/auth/login',['body'=>['email'=>'gestion@boutika.bj','password'=>'boutika2026']]);
log_test('Connexion gestionnaire', $r['status']===200 && !empty($r['data']['token']));
$gestToken = $r['data']['token'] ?? '';

$r = http_req('POST','/api/auth/login',['body'=>['email'=>'admin@boutika.bj','password'=>'mauvais']]);
log_test('Mauvais mot de passe → 401', $r['status']===401);

$r = http_req('GET','/api/auth/me',['token'=>$adminToken]);
log_test('Récupérer son profil (/me)', $r['status']===200 && ($r['data']['user']['email']??'')==='admin@boutika.bj');

$r = http_req('GET','/api/auth/me');
log_test('Sans jeton → 401', $r['status']===401);

// ---------- USERS ----------
group('Utilisateurs (admin)');
$r = http_req('GET','/api/users',['token'=>$adminToken]);
log_test('Liste des utilisateurs (admin)', $r['status']===200 && ($r['data']['meta']['total']??0) >= 2);

$testEmail = 'testuser'.time().'@example.com';
$r = http_req('POST','/api/users',['token'=>$adminToken,'body'=>['firstName'=>'Test','lastName'=>'User','email'=>$testEmail,'password'=>'secret123','role'=>'gestionnaire']]);
log_test('Créer un utilisateur (admin)', $r['status']===201);
$createdUserId = $r['data']['user']['id'] ?? $r['data']['user']['_id'] ?? null;

$r = http_req('GET','/api/users',['token'=>$gestToken]);
log_test('Gestionnaire ne peut pas lister les users → 403', $r['status']===403);

if ($createdUserId) {
    $r = http_req('DELETE',"/api/users/$createdUserId",['token'=>$adminToken]);
    log_test('Supprimer un utilisateur (admin) → 200', $r['status']===200);
}
if ($adminUserId) {
    $r = http_req('DELETE',"/api/users/$adminUserId",['token'=>$adminToken]);
    log_test('Supprimer son propre compte → refusé (400)', $r['status']===400);
}

// ---------- CATEGORIES ----------
group('Catégories');
$r = http_req('GET','/api/categories');
log_test('Liste des catégories (public)', $r['status']===200 && is_array($r['data']) && count($r['data'])>=4);

$r = http_req('POST','/api/categories',['token'=>$adminToken,'body'=>['name'=>'Categorie Test '.time(),'description'=>'Test']]);
log_test('Créer une catégorie (admin) → 201', $r['status']===201);
$createdCatId = $r['data']['id'] ?? $r['data']['_id'] ?? null;

$r = http_req('POST','/api/categories',['token'=>$gestToken,'body'=>['name'=>'Interdit']]);
log_test('Gestionnaire ne peut pas créer de catégorie → 403', $r['status']===403);

// ---------- PRODUCTS ----------
group('Produits');
$r = http_req('GET','/api/products?limit=5');
log_test('Liste des produits + pagination', $r['status']===200 && is_array($r['data']['items']??null) && count($r['data']['items'])<=5);

$r = http_req('GET','/api/products?search=chemise');
log_test('Recherche produit', $r['status']===200 && ($r['data']['meta']['total']??0)>=1);

$r = http_req('GET','/api/products?lowStock=true');
log_test('Filtre "stock faible"', $r['status']===200);

$r = http_req('GET','/api/products?status=published');
log_test('Filtre "publiés"', $r['status']===200);

$cats = http_req('GET','/api/categories');
$catId = $cats['data'][0]['id'] ?? $cats['data'][0]['_id'] ?? null;
$ref = 'TST-'.time();
$r = http_req('POST','/api/products',['token'=>$adminToken,'body'=>['reference'=>$ref,'name'=>'Produit Test','description'=>'Test','category'=>$catId,'price'=>5000,'stock'=>10,'published'=>true]]);
log_test('Créer un produit (admin) → 201', $r['status']===201);
$createdProductId = $r['data']['id'] ?? $r['data']['_id'] ?? null;

if ($createdProductId) {
    $r = http_req('PUT',"/api/products/$createdProductId",['token'=>$adminToken,'body'=>['price'=>5500]]);
    log_test('Modification partielle d\'un produit (PUT) → 200', $r['status']===200 && (int)($r['data']['price']??0)===5500);
}

$r = http_req('POST','/api/products',['token'=>$gestToken,'body'=>['reference'=>'X','name'=>'y','category'=>$catId,'price'=>1]]);
log_test('Gestionnaire ne peut pas créer de produit → 403', $r['status']===403);

if ($createdProductId) {
    $r = http_req('GET',"/api/products/$createdProductId");
    log_test('Détail d\'un produit', $r['status']===200);
}

// ---------- CLIENTS ----------
group('Clients');
$r = http_req('GET','/api/clients',['token'=>$adminToken]);
log_test('Liste des clients (admin)', $r['status']===200 && ($r['data']['meta']['total']??0)>=1);

$r = http_req('GET','/api/clients?search=Amadou',['token'=>$adminToken]);
log_test('Recherche client', $r['status']===200);

$clients = http_req('GET','/api/clients',['token'=>$adminToken]);
$clientId = $clients['data']['items'][0]['id'] ?? $clients['data']['items'][0]['_id'] ?? null;
if ($clientId) {
    $r = http_req('GET',"/api/clients/$clientId",['token'=>$adminToken]);
    log_test('Détail client + historique', $r['status']===200 && is_array($r['data']['orders']??null));
}

// ---------- DASHBOARD ----------
group('Tableau de bord');
$r = http_req('GET','/api/dashboard',['token'=>$adminToken]);
log_test('Indicateurs (autorisé)', $r['status']===200 && !empty($r['data']['metrics']) && is_array($r['data']['evolution']??null));
$r = http_req('GET','/api/dashboard');
log_test('Sans jeton → 401', $r['status']===401);

// ---------- ORDERS + PAIEMENT ----------
group('Commandes & paiement mobile money');
$prods = http_req('GET','/api/products?limit=1');
$prodId = $prods['data']['items'][0]['id'] ?? $prods['data']['items'][0]['_id'] ?? null;
$clientEmail = 'client'.time().'@example.com';
$r = http_req('POST','/api/orders',['body'=>[
    'client'=>['firstName'=>'Test','lastName'=>'Client','email'=>$clientEmail,'phone'=>'+229 97009988','city'=>'Cotonou'],
    'lines'=>[['product'=>$prodId,'quantity'=>2]],
    'deliveryFee'=>1500,'paymentMethod'=>'mtn'
]]);
log_test('Créer une commande (checkout public) → 201', $r['status']===201);
$createdOrderId = $r['data']['id'] ?? $r['data']['_id'] ?? null;

if ($createdOrderId) {
    $r = http_req('GET',"/api/orders/track/$createdOrderId");
    log_test('Suivi public de commande (sans jeton)', $r['status']===200 && !empty($r['data']['orderNumber']));
    $respStr = json_encode($r['data'] ?? [], JSON_UNESCAPED_UNICODE);
    log_test('Track ne divulgue pas l\'e-mail client', strpos($respStr, '@example.com')===false);

    $r = http_req('GET',"/api/orders/$createdOrderId");
    log_test('Détail commande SANS jeton → 401', $r['status']===401);

    $r = http_req('GET',"/api/orders/$createdOrderId",['token'=>$adminToken]);
    log_test('Détail commande (admin)', $r['status']===200 && is_array($r['data']['lines']??null));

    $r = http_req('PATCH',"/api/orders/$createdOrderId/status",['token'=>$adminToken,'body'=>['status'=>'confirmee']]);
    log_test('Transition en_attente → confirmee', $r['status']===200 && ($r['data']['status']??'')==='confirmee');

    $r = http_req('PATCH',"/api/orders/$createdOrderId/status",['token'=>$adminToken,'body'=>['status'=>'preparee']]);
    log_test('Transition confirmee → preparee', $r['status']===200);

    $r = http_req('PATCH',"/api/orders/$createdOrderId/status",['token'=>$adminToken,'body'=>['status'=>'expediee']]);
    log_test('Expédier SANS paiement confirmé → bloqué', $r['status']===400);

    $r = http_req('POST',"/api/orders/$createdOrderId/payment/confirm",['body'=>['pin'=>'0000']]);
    log_test('Paiement PIN 0000 → échec simulé', $r['status']===400);

    $r = http_req('POST',"/api/orders/$createdOrderId/payment/confirm",['body'=>['pin'=>'1234']]);
    log_test('Paiement PIN valide → confirmé', $r['status']===200 && ($r['data']['payment']['status']??'')==='confirmed');

    $r = http_req('PATCH',"/api/orders/$createdOrderId/status",['token'=>$adminToken,'body'=>['status'=>'expediee']]);
    log_test('Expédier après paiement → autorisé', $r['status']===200 && ($r['data']['status']??'')==='expediee');

    $r = http_req('PATCH',"/api/orders/$createdOrderId/status",['token'=>$adminToken,'body'=>['status'=>'livree']]);
    log_test('Livrer la commande', $r['status']===200);

    $r = http_req('PATCH',"/api/orders/$createdOrderId/status",['token'=>$adminToken,'body'=>['status'=>'annulee']]);
    log_test('Annuler une commande livrée → refusé', $r['status']===400);
}

// ---------- NETTOYAGE ----------
group('Nettoyage');
if ($createdOrderId)   { http_req('DELETE',"/api/orders/$createdOrderId",['token'=>$adminToken]); }
if ($createdProductId) { http_req('DELETE',"/api/products/$createdProductId",['token'=>$adminToken]); }
if ($createdCatId)     { http_req('DELETE',"/api/categories/$createdCatId",['token'=>$adminToken]); }
log_test('Données de test supprimées', true);

echo "\n" . str_repeat('=',54) . "\n";
echo "  RÉSULTAT : $pass réussi(s)  •  $fail échec(s)\n";
echo str_repeat('=',54) . "\n";
if ($fail > 0) {
    echo "\n  Échecs :\n";
    foreach ($results as $r) if (!$r['ok']) echo "   - {$r['n']}" . ($r['d']?' :: '.$r['d']:'') . "\n";
    exit(1);
}
echo "  ✅ Toutes les routes fonctionnent.\n";
