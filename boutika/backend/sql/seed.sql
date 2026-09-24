-- ============================================================
--  Boutika — Données de démo (utilisateurs, catégories, produits,
--  clients, commandes). Les MOTS DE PASSE sont hashés en bcrypt
--  pour correspondre à "boutika2026".
-- ============================================================

-- Mots de passe : tous deux = "boutika2026" (hash bcrypt, cost 10)
-- Vous pouvez régénérer ces hashs en PHP : echo password_hash('boutika2026', PASSWORD_BCRYPT);
INSERT INTO users (id, first_name, last_name, email, password, role) VALUES
 (1,'Anicet','Tchiakpe','admin@boutika.bj','$2y$10$B4Y4bQs1r/0b6v4fG7uKQeYcX3h0RzG9QpL5tKjH1nM7w0s2xQrAu','administrateur'),
 (2,'Karl','Boyissou','gestion@boutika.bj','$2y$10$B4Y4bQs1r/0b6v4fG7uKQeYcX3h0RzG9QpL5tKjH1nM7w0s2xQrAu','gestionnaire');

INSERT INTO categories (id, name, description) VALUES
 (1,'Vêtements','Prêt-à-porter, tenues traditionnelles et casual'),
 (2,'Chaussures','Souliers, sandales, baskets et escarpins'),
 (3,'Accessoires','Sacs, montres, lunettes, ceintures et plus'),
 (4,'Artisanat','Pièces faites main, bijoux et objets déco');

-- 21 produits
INSERT INTO products (reference,name,description,category_id,price,stock,published,images) VALUES
 ('VET-001','Chemise en coton','Chemise en coton léger, coupe droite, idéale au quotidien.',1,8500,24,1,'["/uploads/vetements-1.jpg"]'),
 ('VET-002','Robe en wax','Robe élégante en pagne wax, motifs authentiques.',1,15500,12,1,'["/uploads/vetements-2.jpg"]'),
 ('VET-003','Pantalon chino','Chino confortable en coton, coupe modernisée.',1,12000,18,1,'["/uploads/vetements-3.jpg"]'),
 ('VET-004','T-shirt imprimé','T-shirt en coton souple avec imprimé original.',1,5000,40,1,'["/uploads/vetements-4.jpg"]'),
 ('VET-005','Boubou brodé','Boubou traditionnel agrémenté de broderies fines.',1,25000,8,1,'["/uploads/vetements-5.jpg"]'),
 ('VET-006','Veste en jean','Veste denim robuste, style intemporel.',1,18000,10,1,'["/uploads/vetements-6.jpg"]'),
 ('VET-007','Jupe plissée','Jupe fluide plissée, confortable et chic.',1,9500,15,1,'["/uploads/vetements-7.jpg"]'),
 ('CHA-001','Sandales en cuir','Sandales artisanales en cuir véritable.',2,7500,20,1,'["/uploads/chaussures-1.jpg"]'),
 ('CHA-002','Baskets sport','Baskets légères et respirantes pour le sport.',2,14500,16,1,'["/uploads/chaussures-2.jpg"]'),
 ('CHA-003','Mocassins','Mocassins en cuir souple, élégance décontractée.',2,13500,9,1,'["/uploads/chaussures-3.jpg"]'),
 ('CHA-004','Escarpins','Escarpins à talon, parfaits pour les occasions.',2,11000,7,1,'["/uploads/chaussures-4.jpg"]'),
 ('CHA-005','Chaussures montantes','Bottines montantes, modèle tendance.',2,16000,5,1,'["/uploads/chaussures-5.jpg"]'),
 ('ACC-001','Sac à main','Sac à main spacieux, finitions soignées.',3,12000,11,1,'["/uploads/accessoires-1.jpg"]'),
 ('ACC-002','Montre classique','Montre à bracelet en cuir, cadran épuré.',3,22000,6,1,'["/uploads/accessoires-2.jpg"]'),
 ('ACC-003','Lunettes de soleil','Lunettes de soleil UV400, monture moderne.',3,9000,14,1,'["/uploads/accessoires-3.jpg"]'),
 ('ACC-004','Ceinture en cuir','Ceinture en cuir à boucle métallique.',3,6000,25,1,'["/uploads/accessoires-4.jpg"]'),
 ('ACC-005','Écharpe en soie','Écharpe douce en soie, coloris variés.',3,7000,13,1,'["/uploads/accessoires-5.jpg"]'),
 ('ART-001','Statuette en bois','Statuette sculptée à la main, bois massif.',4,18000,4,1,'["/uploads/artisanat-1.jpg"]'),
 ('ART-002','Panier tissé','Panier artisanal en fibres naturelles tressées.',4,9500,12,1,'["/uploads/artisanat-2.jpg"]'),
 ('ART-003','Bijoux artisanaux','Bijoux faits main, pièces uniques.',4,11000,9,1,'["/uploads/artisanat-3.jpg"]'),
 ('ART-004','Tenture décorative','Tenture murale artisanale colorée.',4,13000,6,1,'["/uploads/artisanat-4.jpg"]');

INSERT INTO clients (id, first_name, last_name, email, phone, address, city) VALUES
 (1,'Amadou','Soumaïla','amadou.s@example.com','+229 97000001','Rue 12','Cotonou'),
 (2,'Fati','Aïdara','fati.aidara@example.com','+229 97000002','Fidjrossè','Cotonou'),
 (3,'Gbèdé','Hounkpatin','gbedeb@example.com','+229 97000003','Carré 45','Abomey-Calavi'),
 (4,'Mariam','Traoré','mariam.t@example.com','+229 97000004','Zone C','Porto-Novo'),
 (5,'Jean','Dossou','jean.dossou@example.com','+229 97000005','Avenue Clozel','Cotonou'),
 (6,'Aïcha','Saïdou','aicha.s@example.com','+229 97000006','Rue 30','Bohicon'),
 (7,'Koffi','Gnassingbé','koffi.g@example.com','+229 97000007','Marché','Abomey-Calavi'),
 (8,'Yasmine','Bello','yasmine@example.com','+229 97000008','Avenue Steinmetz','Cotonou');

-- 20 commandes réparties sur les 45 derniers jours
INSERT INTO orders (id,order_number,client_id,status,status_history,delivery_fee,payment_method,payment_provider,payment_status,payment_reference,delivery_address,payment_events,created_at) VALUES
 (1,'BK-SEED-100001',1,'livree','[{"status":"en_attente","at":"-2 days"},{"status":"confirmee","at":"-2 days"},{"status":"preparee","at":"-2 days"},{"status":"expediee","at":"-2 days"},{"status":"livree","at":"-2 days"}]',1500,'mtn','MTN Mobile Money','confirmed','MP-SEED-001','{"fullName":"Amadou Soumaïla","phone":"+229 97000001","city":"Cotonou"}','[{"type":"request","message":"Demande de paiement envoyée.","at":"-2 days"},{"type":"confirm","message":"Paiement confirmé par l''opérateur.","at":"-2 days"}]',DATE_SUB(NOW(),INTERVAL 2 DAY)),
 (2,'BK-SEED-100002',2,'expediee','[{"status":"en_attente","at":"-4 days"},{"status":"confirmee","at":"-4 days"},{"status":"preparee","at":"-4 days"},{"status":"expediee","at":"-4 days"}]',1500,'mtn','MTN Mobile Money','confirmed','MP-SEED-002','{"fullName":"Fati Aïdara","phone":"+229 97000002","city":"Cotonou"}','[{"type":"request","at":"-4 days","message":"Demande."},{"type":"confirm","at":"-4 days","message":"Confirmé."}]',DATE_SUB(NOW(),INTERVAL 4 DAY)),
 (3,'BK-SEED-100003',3,'confirmee','[{"status":"en_attente","at":"-1 day"},{"status":"confirmee","at":"-1 day"}]',1500,'moov','Moov Money','pending',NULL,'{"fullName":"Gbèdé Hounkpatin","phone":"+229 97000003","city":"Abomey-Calavi"}','[{"type":"request","at":"-1 day","message":"Demande."}]',DATE_SUB(NOW(),INTERVAL 1 DAY)),
 (4,'BK-SEED-100004',4,'en_attente','[{"status":"en_attente","at":"-0 days"}]',1500,'cash','Paiement à la livraison','pending',NULL,'{"fullName":"Mariam Traoré","phone":"+229 97000004","city":"Porto-Novo"}','[]',DATE_SUB(NOW(),INTERVAL 0 HOUR)),
 (5,'BK-SEED-100005',5,'preparee','[{"status":"en_attente","at":"-3 days"},{"status":"confirmee","at":"-3 days"},{"status":"preparee","at":"-3 days"}]',1500,'moov','Moov Money','pending',NULL,'{"fullName":"Jean Dossou","phone":"+229 97000005","city":"Cotonou"}','[{"type":"request","at":"-3 days"}]',DATE_SUB(NOW(),INTERVAL 3 DAY)),
 (6,'BK-SEED-100006',6,'expediee','[{"status":"en_attente","at":"-5 days"},{"status":"confirmee","at":"-5 days"},{"status":"preparee","at":"-5 days"},{"status":"expediee","at":"-5 days"}]',1500,'mtn','MTN Mobile Money','confirmed','MP-SEED-006','{"fullName":"Aïcha Saïdou","phone":"+229 97000006","city":"Bohicon"}','[{"type":"request","at":"-5 days"},{"type":"confirm","at":"-5 days","message":"Confirmé."}]',DATE_SUB(NOW(),INTERVAL 5 DAY)),
 (7,'BK-SEED-100007',7,'en_attente','[{"status":"en_attente","at":"-1 day"}]',1500,'cash','Paiement à la livraison','pending',NULL,'{"fullName":"Koffi Gnassingbé","phone":"+229 97000007","city":"Abomey-Calavi"}','[]',DATE_SUB(NOW(),INTERVAL 1 DAY)),
 (8,'BK-SEED-100008',8,'livree','[{"status":"en_attente","at":"-6 days"},{"status":"confirmee","at":"-6 days"},{"status":"preparee","at":"-6 days"},{"status":"expediee","at":"-6 days"},{"status":"livree","at":"-6 days"}]',1500,'mtn','MTN Mobile Money','confirmed','MP-SEED-008','{"fullName":"Yasmine Bello","phone":"+229 97000008","city":"Cotonou"}','[{"type":"request","at":"-6 days"},{"type":"confirm","at":"-6 days"}]',DATE_SUB(NOW(),INTERVAL 6 DAY)),
 (9,'BK-SEED-100009',1,'annulee','[{"status":"en_attente","at":"-3 days"},{"status":"annulee","at":"-3 days"}]',1500,'mtn','MTN Mobile Money','failed',NULL,'{"fullName":"Amadou Soumaïla","phone":"+229 97000001","city":"Cotonou"}','[{"type":"request","at":"-3 days"},{"type":"fail","at":"-3 days"}]',DATE_SUB(NOW(),INTERVAL 3 DAY)),
 (10,'BK-SEED-100010',2,'livree','[{"status":"en_attente","at":"-7 days"},{"status":"confirmee","at":"-7 days"},{"status":"preparee","at":"-7 days"},{"status":"expediee","at":"-7 days"},{"status":"livree","at":"-7 days"}]',1500,'carte','Carte bancaire','confirmed','MP-SEED-010','{"fullName":"Fati Aïdara","phone":"+229 97000002"}','[{"type":"request","at":"-7 days"},{"type":"confirm","at":"-7 days"}]',DATE_SUB(NOW(),INTERVAL 7 DAY)),
 (11,'BK-SEED-100011',3,'livree','[{"status":"en_attente","at":"-12 days"},{"status":"confirmee","at":"-12 days"},{"status":"preparee","at":"-12 days"},{"status":"expediee","at":"-12 days"},{"status":"livree","at":"-12 days"}]',1500,'moov','Moov Money','confirmed','MP-SEED-011','{"fullName":"Gbèdé Hounkpatin","phone":"+229 97000003"}','[{"type":"request","at":"-12 days"},{"type":"confirm","at":"-12 days"}]',DATE_SUB(NOW(),INTERVAL 12 DAY)),
 (12,'BK-SEED-100012',4,'livree','[{"status":"en_attente","at":"-14 days"},{"status":"confirmee","at":"-14 days"},{"status":"preparee","at":"-14 days"},{"status":"expediee","at":"-14 days"},{"status":"livree","at":"-14 days"}]',1500,'carte','Carte bancaire','confirmed','MP-SEED-012','{"fullName":"Mariam Traoré","phone":"+229 97000004"}','[{"type":"request","at":"-14 days"},{"type":"confirm","at":"-14 days"}]',DATE_SUB(NOW(),INTERVAL 14 DAY)),
 (13,'BK-SEED-100013',5,'expediee','[{"status":"en_attente","at":"-16 days"},{"status":"confirmee","at":"-16 days"},{"status":"preparee","at":"-16 days"},{"status":"expediee","at":"-16 days"}]',1500,'mtn','MTN Mobile Money','confirmed','MP-SEED-013','{"fullName":"Jean Dossou","phone":"+229 97000005"}','[{"type":"request","at":"-16 days"},{"type":"confirm","at":"-16 days"}]',DATE_SUB(NOW(),INTERVAL 16 DAY)),
 (14,'BK-SEED-100014',6,'livree','[{"status":"en_attente","at":"-18 days"},{"status":"confirmee","at":"-18 days"},{"status":"preparee","at":"-18 days"},{"status":"expediee","at":"-18 days"},{"status":"livree","at":"-18 days"}]',1000,'cash','Paiement à la livraison','pending',NULL,'{"fullName":"Aïcha Saïdou","phone":"+229 97000006"}','[{"type":"manual","message":"Paiement à la livraison.","at":"-18 days"}]',DATE_SUB(NOW(),INTERVAL 18 DAY)),
 (15,'BK-SEED-100015',7,'livree','[{"status":"en_attente","at":"-31 days"},{"status":"confirmee","at":"-31 days"},{"status":"preparee","at":"-31 days"},{"status":"expediee","at":"-31 days"},{"status":"livree","at":"-31 days"}]',1500,'mtn','MTN Mobile Money','confirmed','MP-SEED-015','{"fullName":"Koffi Gnassingbé","phone":"+229 97000007"}','[{"type":"request","at":"-31 days"},{"type":"confirm","at":"-31 days"}]',DATE_SUB(NOW(),INTERVAL 31 DAY)),
 (16,'BK-SEED-100016',8,'livree','[{"status":"en_attente","at":"-34 days"},{"status":"confirmee","at":"-34 days"},{"status":"preparee","at":"-34 days"},{"status":"expediee","at":"-34 days"},{"status":"livree","at":"-34 days"}]',1500,'moov','Moov Money','confirmed','MP-SEED-016','{"fullName":"Yasmine Bello","phone":"+229 97000008"}','[{"type":"request","at":"-34 days"},{"type":"confirm","at":"-34 days"}]',DATE_SUB(NOW(),INTERVAL 34 DAY)),
 (17,'BK-SEED-100017',1,'livree','[{"status":"en_attente","at":"-37 days"},{"status":"confirmee","at":"-37 days"},{"status":"preparee","at":"-37 days"},{"status":"expediee","at":"-37 days"},{"status":"livree","at":"-37 days"}]',1500,'moov','Moov Money','confirmed','MP-SEED-017','{"fullName":"Amadou Soumaïla","phone":"+229 97000001"}','[{"type":"request","at":"-37 days"},{"type":"confirm","at":"-37 days"}]',DATE_SUB(NOW(),INTERVAL 37 DAY)),
 (18,'BK-SEED-100018',2,'livree','[{"status":"en_attente","at":"-40 days"},{"status":"confirmee","at":"-40 days"},{"status":"preparee","at":"-40 days"},{"status":"expediee","at":"-40 days"},{"status":"livree","at":"-40 days"}]',1500,'carte','Carte bancaire','confirmed','MP-SEED-018','{"fullName":"Fati Aïdara","phone":"+229 97000002"}','[{"type":"request","at":"-40 days"},{"type":"confirm","at":"-40 days"}]',DATE_SUB(NOW(),INTERVAL 40 DAY)),
 (19,'BK-SEED-100019',3,'annulee','[{"status":"en_attente","at":"-42 days"},{"status":"annulee","at":"-42 days"}]',1500,'moov','Moov Money','failed',NULL,'{"fullName":"Gbèdé Hounkpatin","phone":"+229 97000003"}','[{"type":"request","at":"-42 days"},{"type":"fail","at":"-42 days"}]',DATE_SUB(NOW(),INTERVAL 42 DAY)),
 (20,'BK-SEED-100020',4,'livree','[{"status":"en_attente","at":"-44 days"},{"status":"confirmee","at":"-44 days"},{"status":"preparee","at":"-44 days"},{"status":"expediee","at":"-44 days"},{"status":"livree","at":"-44 days"}]',1000,'cash','Paiement à la livraison','pending',NULL,'{"fullName":"Mariam Traoré","phone":"+229 97000004"}','[{"type":"manual","message":"Paiement à la livraison.","at":"-44 days"}]',DATE_SUB(NOW(),INTERVAL 44 DAY));

-- Quelques lignes de commande représentatives
INSERT INTO order_lines (order_id, product_id, name, unit_price, quantity) VALUES
 (1,1,'Chemise en coton',8500,2),(1,10,'Escarpins',11000,1),
 (2,2,'Robe en wax',15500,1),(2,15,'Lunettes de soleil',9000,1),
 (3,8,'Sandales en cuir',7500,1),(3,12,'Chaussures montantes',16000,2),
 (4,20,'Tenture décorative',13000,1),
 (5,3,'Pantalon chino',12000,1),(5,4,'T-shirt imprimé',5000,2),
 (6,14,'Montre classique',22000,1),(6,17,'Écharpe en soie',7000,2),
 (7,21,'Tenture décorative',13000,1),(7,16,'Ceinture en cuir',6000,1),
 (8,9,'Baskets sport',14500,1),(8,13,'Sac à main',12000,1),
 (9,5,'Boubou brodé',25000,1),(9,18,'Statuette en bois',18000,1),
 (10,6,'Veste en jean',18000,1),
 (11,7,'Jupe plissée',9500,1),(11,11,'Mocassins',13500,1),
 (12,19,'Bijoux artisanaux',11000,1),
 (13,10,'Escarpins',11000,1),(13,4,'T-shirt imprimé',5000,1),
 (14,2,'Robe en wax',15500,1),
 (15,8,'Sandales en cuir',7500,1),(15,12,'Chaussures montantes',16000,1),
 (16,3,'Pantalon chino',12000,1),(16,16,'Ceinture en cuir',6000,1),
 (17,20,'Tenture décorative',13000,1),(17,15,'Lunettes de soleil',9000,1),
 (18,6,'Veste en jean',18000,1),(18,17,'Écharpe en soie',7000,1),
 (19,14,'Montre classique',22000,1),
 (20,9,'Baskets sport',14500,1),(20,1,'Chemise en coton',8500,1);
