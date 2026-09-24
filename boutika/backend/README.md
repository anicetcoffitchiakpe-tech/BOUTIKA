# Boutika — BACKEND PHP

API REST pour Boutika, écrite en **PHP 8 natif** (sans framework lourd, **sans Composer**,
sans extensions à installer à part PDO MySQL), pour fonctionner immédiatement avec
**XAMPP / WAMP** (MySQL).

> ⚠️ Cette version remplace la version Node.js/Express. Les URLs des routes `/api/...`
> sont **strictement identiques**, ainsi que les réponses JSON. Le frontend React
> (boutika-frontend) fonctionne **sans aucune modification**.

## Prérequis Windows
- **XAMPP** (ou WAMP) installé : https://www.apachefriends.org/
- Dans XAMPP Control Panel, démarrez **MySQL** (Apache n'est pas nécessaire)
- Assurez-vous que `php.exe` est accessible (soit vous ajoutez `C:\xampp\php` au
  PATH, soit vous lancez les `.bat` depuis le bouton **"Shell"** de XAMPP)

## Démarrage rapide

### 1. Installer la base et les données de démo (une seule fois)
Double-cliquez sur **`install.bat`**.

Le script :
- se connecte à MySQL (`root` sans mot de passe par défaut, comme dans XAMPP),
- crée la base `boutika` et toutes les tables,
- insère 2 utilisateurs, 4 catégories, 21 produits, 8 clients, 20 commandes,
- hash automatiquement le mot de passe `boutika2026` en bcrypt.

Si votre MySQL a un mot de passe différent, modifiez la section `[db]` en haut de `config.php`.

### 2. Démarrer l'API
Double-cliquez sur **`start-server.bat`**.
L'API démarre sur **http://localhost:5000** via le serveur built-in de PHP (pas besoin d'Apache).
La fenêtre doit afficher quelque chose comme :
```
[boutika-php] Demarrage de l'API Boutika (PHP) ...
[boutika-php]   - Base : MySQL (localhost)
[boutika-php]   - Port : 5000
[boutika-php]   - Health : http://localhost:5000/api/health
PHP 8.x.x Development Server (http://0.0.0.0:5000) started
```
⚠️ **Ne fermez pas cette fenêtre** tant que vous utilisez l'appli.

### 3. Tester les routes (preuve pour la soutenance)
Avec le serveur démarré, double-cliquez sur **`test-routes.bat`** dans une
deuxième fenêtre. Vous verrez défiler **41 tests PASS**, et à la fin :
```
RÉSULTAT : 41 réussi(s)  •  0 échec(s)
✅ Toutes les routes fonctionnent.
```

Vous pouvez aussi tester directement dans votre navigateur :
- http://localhost:5000/api/health
- http://localhost:5000/api/products
- http://localhost:5000/api/categories

### 4. Démarrer le frontend React
Dans le dossier `boutika-frontend`, lancez `start-front.bat` (comme avant).
Le front proxifie `/api` et `/uploads` vers le port 5000 → il fonctionnera avec
cette version PHP sans rien changer.

## Identifiants de démo
- **Administrateur** : `admin@boutika.bj` / `boutika2026`
- **Gestionnaire** : `gestion@boutika.bj` / `boutika2026`

## Configuration (fichier `config.php`)
| Clé | Défaut | Description |
|-----|--------|-------------|
| `db.host` | `127.0.0.1` | Hôte MySQL |
| `db.port` | `3306` | Port MySQL |
| `db.name` | `boutika` | Nom de la base |
| `db.user` | `root` | Utilisateur MySQL |
| `db.password` | *(vide)* | Mot de passe MySQL |
| `jwt_secret` | *(clé fournie)* | Secret de signature JWT |
| `jwt_expires` | `7d` | Durée du token |
| `port` | `5000` | Port de l'API |
| `client_url` | `http://localhost:5173` | Origine CORS du front |

## Arborescence
```
boutika-backend-php/
├── README.md
├── config.php               ← configuration DB + JWT
├── install.bat              ← installation Windows
├── start-server.bat         ← démarre l'API sur le port 5000
├── test-routes.bat          ← lance les 41 tests
├── public/
│   ├── index.php            ← point d'entrée (front controller + routes)
│   └── uploads/             ← 21 images JPG
├── src/
│   ├── controllers/         ← AuthController, ProductController, OrderController...
│   ├── middleware/          ← CORS + vérification JWT
│   └── utils/               ← DB (PDO), JWT (HS256), Router mini, Response JSON
├── sql/
│   ├── schema.sql           ← création des tables
│   └── seed.sql             ← données de démonstration
├── scripts/
│   └── install.php          ← script d'installation
└── tests/
    └── run-api-tests.php    ← 41 tests de routes
```

## Fonctionnalités
- ✅ Authentification **JWT** (HS256) + **bcrypt** (implémentation native PHP, pas de dépendance)
- ✅ Rôles **administrateur / gestionnaire** + protection des routes
- ✅ CRUD produits, catégories, utilisateurs, clients
- ✅ Machine à états des commandes (en_attente → confirmee → preparee → expediee → livree / annulee)
- ✅ Paiement mobile money simulé (PIN 4 chiffres, `0000` = échec)
- ✅ Dashboard agrégé (CA, commandes, produits, nouveaux clients, évolution 7 jours, meilleures ventes)
- ✅ Suivi public de commande sans fuite d'e-mail
- ✅ CORS configuré, erreurs JSON en français, fichiers statiques `/uploads`
- ✅ **41 tests** rejouables à volonté

## Si vous avez Apache dans XAMPP
Vous pouvez aussi créer un VirtualHost pointant sur le dossier `public/`, mais le
plus simple reste d'utiliser le serveur built-in (`start-server.bat`) qui démarre
en 1 seconde sur le port 5000.
