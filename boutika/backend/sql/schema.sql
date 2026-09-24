-- ============================================================
--  Boutika (version PHP) — Schéma de base de données MySQL
--  Correspond au modèle MERISE / MLD du mémoire.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_lines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payment_events;

-- Utilisateurs de l'espace d'administration
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('administrateur','gestionnaire') NOT NULL DEFAULT 'gestionnaire',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Catégories de produits
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Produits
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  price INT NOT NULL,                   -- en FCFA
  stock INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  images TEXT,                          -- JSON : tableau de chemins /uploads/xxx.jpg
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_p_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clients (ceux qui commandent — différents des utilisateurs de l'admin)
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160),
  phone VARCHAR(40),
  address VARCHAR(255),
  city VARCHAR(80),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_client_email (email),
  INDEX idx_client_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Commandes
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  client_id INT NOT NULL,
  status ENUM('en_attente','confirmee','preparee','expediee','livree','annulee') NOT NULL DEFAULT 'en_attente',
  status_history TEXT,                  -- JSON (liste d'états datés)
  delivery_fee INT NOT NULL DEFAULT 0,
  payment_method ENUM('mtn','moov','carte','cash','virement') NOT NULL DEFAULT 'mtn',
  payment_provider VARCHAR(80),
  payment_status ENUM('pending','confirmed','failed'),
  payment_reference VARCHAR(60),
  payment_phone VARCHAR(40),
  payment_requested_at DATETIME,
  payment_confirmed_at DATETIME,
  payment_events TEXT,                  -- JSON (journal d'événements)
  delivery_address TEXT,                -- JSON (fullName, phone, city, address)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_o_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_o_status (status),
  INDEX idx_o_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lignes de commande (prix figé à l'achat)
CREATE TABLE order_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  name VARCHAR(160) NOT NULL,          -- nom au moment de la commande (même si produit modifié/supprimé)
  unit_price INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_ol_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_ol_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
