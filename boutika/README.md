# Boutika — Projet complet (Frontend React + Backend PHP)

Boutika est une plateforme web de gestion de boutique en ligne : **catalogue de
produits**, **suivi des commandes** (de la confirmation à la livraison),
**gestion des clients**, **tableau de bord**, **paiement mobile money (MTN/Moov)**.

Ce dossier contient **tout le projet** dans une seule arborescence :

```
boutika/                      ← FRONTEND React (Vite) — port 5173
├── install.bat               ← installe tout (front + backend) EN UNE FOIS
├── start.bat                 ← demarre backend + frontend EN UNE FOIS
├── test-routes.bat           ← teste les 41 routes du backend
├── package.json              ← dependances React
├── vite.config.js            ← proxy /api et /uploads vers http://localhost:5000
├── index.html
├── src/                      ← code React (pages admin + boutique)
│   ├── App.jsx
│   ├── main.jsx
│   ├── context/, components/, admin/, shop/, styles/
│   └── api/client.js
│
└── backend/                  ← BACKEND PHP (natif, sans framework) — port 5000
    ├── config.php            ← configuration DB / JWT / CORS
    ├── install.bat           ← installe la base MySQL seule
    ├── start-server.bat      ← demarre l'API seule
    ├── test-routes.bat       ← teste les routes seules
    ├── public/
    │   ├── index.php         ← point d'entree API (toutes les routes /api/...)
    │   └── uploads/          ← 21 images de produits (.jpg)
    ├── src/                  ← controleurs, middleware, utilitaires
    ├── sql/                  ← schema.sql + seed.sql
    └── tests/                ← script de test des 41 routes
```

---

## Demarrage rapide (Windows — XAMPP)

### 1. Demarrer MySQL dans XAMPP
- Ouvrez **XAMPP Control Panel**
- Cliquez sur **Start** a cote de **MySQL**
- (Apache n'est pas necessaire, on utilise le serveur built-in de PHP)

### 2. Installer (une seule fois)
**Double-cliquez sur `install.bat`**, a la racine du projet.
Le script :
- verifie PHP, Node.js et MySQL,
- cree la base MySQL `boutika` et les tables,
- insere les donnees de demo (21 produits, 2 comptes, 8 clients, 20 commandes),
- installe les dependances npm du frontend React.

### 3. Lancer le projet
**Double-cliquez sur `start.bat`**. Deux fenetres noires s'ouvrent :
- `Boutika Backend (PHP)` : API sur http://localhost:5000
- `Boutika Frontend (React)` : site sur http://localhost:5173

Votre navigateur s'ouvre automatiquement sur http://localhost:5173.
**Ne fermez pas les deux fenetres** tant que vous utilisez le projet.

### 4. Tester les routes (preuve pour la soutenance)
Avec le projet demarre, **double-cliquez sur `test-routes.bat`**.
Vous verrez defiler 41 tests. A la fin :
```
RÉSULTAT : 41 réussi(s)  •  0 échec(s)
✅ Toutes les routes fonctionnent.
```

---

## Comptes de demonstration
| Role | Identifiant | Mot de passe |
|------|-------------|--------------|
| Administrateur | `admin@boutika.bj` | `boutika2026` |
| Gestionnaire | `gestion@boutika.bj` | `boutika2026` |

## Adresses utiles
- **Boutique publique** : http://localhost:5173
- **Espace admin** : http://localhost:5173/admin
- **Health check API** : http://localhost:5000/api/health
- **Liste des produits (JSON)** : http://localhost:5000/api/products

## Configuration
Si votre MySQL a un mot de passe different de `root` / vide, editez le fichier
`backend/config.php` et modifiez la section `[db]` :
```php
'db' => [
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'name'     => 'boutika',
    'user'     => 'root',
    'password' => 'VOTRE_MOT_DE_PASSE',
    ...
],
```

## Arreter le projet
Fermez simplement les deux fenetres noires (Backend et Frontend), ou appuyez sur
`Ctrl+C` dans chacune d'elles.
