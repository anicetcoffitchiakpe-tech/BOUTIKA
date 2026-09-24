<?php
/**
 * Configuration de l'application Boutika (version PHP).
 * Les valeurs peuvent être surchargées par des variables d'environnement.
 */
return [
    'app_name'  => getenv('APP_NAME')  ?: 'Boutika',
    'port'      => (int)(getenv('PORT') ?: 5000),
    'host'      => getenv('HOST')     ?: '0.0.0.0',

    // --- Base de données MySQL ---
    'db' => [
        'host'     => getenv('DB_HOST')     ?: '127.0.0.1',
        'port'     => (int)(getenv('DB_PORT') ?: 3306),
        'name'     => getenv('DB_NAME')     ?: 'boutika',
        'user'     => getenv('DB_USER')     ?: 'root',
        'password' => getenv('DB_PASS')     ?: '',
        'charset'  => 'utf8mb4',
    ],

    // --- JWT ---
    'jwt_secret'  => getenv('JWT_SECRET')  ?: '6y7h%@Hfz7L8JYGkKye5PN%Cbth%#3GY@3#kH0PqF^0=',
    'jwt_expires' => getenv('JWT_EXPIRES') ?: '7d', // durée du token

    // --- CORS : origine(s) autorisées (séparées par des virgules) ---
    'client_url' => getenv('CLIENT_URL') ?: 'http://localhost:5173',

    // --- Dossier des uploads (images produits) ---
    'uploads_dir' => __DIR__ . '/../public/uploads',
    'uploads_url' => '/uploads',
];
