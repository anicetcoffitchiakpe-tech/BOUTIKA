<?php
class ProductController {
    public function __construct(private PDO $pdo) {}

    public function index() {
        $page = max(1, (int)(query_param('page', 1)));
        $limit = min(100, max(1, (int)(query_param('limit', 12))));
        $offset = ($page - 1) * $limit;
        $where = ['1=1']; $params = [];
        if ($q = trim((string)query_param('search', ''))) {
            $where[] = '(p.name LIKE ? OR p.reference LIKE ? OR p.description LIKE ?)';
            $like = "%$q%"; $params[] = $like; $params[] = $like; $params[] = $like;
        }
        if (query_param('category')) {
            $where[] = 'p.category_id = ?'; $params[] = (int)query_param('category');
        }
        if (query_param('status') === 'published') { $where[] = 'p.published = 1'; }
        if (query_param('status') === 'draft') { $where[] = 'p.published = 0'; }
        if (query_param('lowStock') === 'true') { $where[] = 'p.stock <= 5'; }

        $w = implode(' AND ', $where);
        $total = $this->pdo->prepare("SELECT COUNT(*) FROM products p WHERE $w");
        $total->execute($params);
        $totalCount = (int)$total->fetchColumn();

        $sql = "SELECT p.*, c.name AS category_name FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                WHERE $w ORDER BY p.created_at DESC LIMIT $limit OFFSET $offset";
        $st = $this->pdo->prepare($sql);
        $st->execute($params);
        $items = array_map([$this, 'map'], $st->fetchAll());
        return ['items' => $items, 'meta' => [
            'page' => $page, 'limit' => $limit, 'total' => $totalCount,
            'pages' => (int)ceil($totalCount / max(1,$limit)),
        ]];
    }

    public function show($id) {
        $st = $this->pdo->prepare(
            "SELECT p.*, c.name AS category_name FROM products p
             LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?"
        );
        $st->execute([(int)$id]);
        $r = $st->fetch();
        if (!$r) api_error(404, 'Produit introuvable.');
        return $this->map($r);
    }

    public function create() {
        require_role($this->pdo, 'administrateur');
        $b = body_json();
        $ref = trim($b['reference'] ?? ''); $name = trim($b['name'] ?? '');
        $desc = $b['description'] ?? ''; $cat = (int)($b['category'] ?? 0);
        $price = (int)($b['price'] ?? 0); $stock = (int)($b['stock'] ?? 0);
        $published = isset($b['published']) ? (int)(bool)$b['published'] : 1;
        $images = $b['images'] ?? [];
        if (!$ref || !$name || !$cat) api_error(400, 'Référence, nom et catégorie obligatoires.');
        if ($price <= 0) api_error(400, 'Le prix doit être supérieur à 0.');
        if ($stock < 0) api_error(400, 'Le stock ne peut pas être négatif.');
        // Vérifie l'existence de la catégorie
        $c = $this->pdo->prepare('SELECT id FROM categories WHERE id = ?'); $c->execute([$cat]);
        if (!$c->fetch()) api_error(400, 'Catégorie invalide.');
        // Vérifie référence unique
        $u = $this->pdo->prepare('SELECT id FROM products WHERE reference = ?'); $u->execute([$ref]);
        if ($u->fetch()) api_error(409, 'Cette référence existe déjà.');
        $imagesJson = json_encode(is_array($images) ? $images : [], JSON_UNESCAPED_SLASHES);
        $this->pdo->prepare(
            'INSERT INTO products (reference, name, description, category_id, price, stock, published, images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([$ref,$name,$desc,$cat,$price,$stock,$published,$imagesJson]);
        return $this->show((int)$this->pdo->lastInsertId());
    }

    public function update($id) {
        require_role($this->pdo, 'administrateur');
        $b = body_json();
        $id = (int)$id;
        $old = $this->pdo->prepare('SELECT * FROM products WHERE id = ?'); $old->execute([$id]);
        $r = $old->fetch();
        if (!$r) api_error(404, 'Produit introuvable.');

        $fields = []; $vals = [];
        if (array_key_exists('reference', $b)) { $ref = trim($b['reference']); if (!$ref) api_error(400,'Référence invalide.'); $fields[]='reference=?';$vals[]=$ref; }
        if (array_key_exists('name', $b))      { $nm = trim($b['name']); if (!$nm) api_error(400,'Nom invalide.'); $fields[]='name=?';$vals[]=$nm; }
        if (array_key_exists('description', $b)) { $fields[]='description=?';$vals[]=$b['description']; }
        if (array_key_exists('category', $b))  { $cat=(int)$b['category']; $c=$this->pdo->prepare('SELECT id FROM categories WHERE id=?');$c->execute([$cat]); if(!$c->fetch()) api_error(400,'Catégorie invalide.'); $fields[]='category_id=?';$vals[]=$cat; }
        if (array_key_exists('price', $b))     { $price=(int)$b['price']; if($price<=0) api_error(400,'Prix invalide.'); $fields[]='price=?';$vals[]=$price; }
        if (array_key_exists('stock', $b))     { $stock=(int)$b['stock']; if($stock<0) api_error(400,'Stock invalide.'); $fields[]='stock=?';$vals[]=$stock; }
        if (array_key_exists('published', $b)) { $fields[]='published=?';$vals[]=(int)(bool)$b['published']; }
        if (array_key_exists('images', $b))    { $fields[]='images=?';$vals[]=json_encode(is_array($b['images'])?$b['images']:[], JSON_UNESCAPED_SLASHES); }
        if ($fields) {
            $vals[] = $id;
            $this->pdo->prepare('UPDATE products SET ' . implode(', ',$fields) . ' WHERE id=?')->execute($vals);
        }
        return $this->show($id);
    }

    public function delete($id) {
        require_role($this->pdo, 'administrateur');
        $id=(int)$id;
        $c=$this->pdo->prepare('SELECT COUNT(*) FROM order_lines WHERE product_id=?'); $c->execute([$id]);
        if ((int)$c->fetchColumn() > 0) {
            // On ne supprime pas un produit déjà commandé : on le dé-publie
            $this->pdo->prepare('UPDATE products SET published=0 WHERE id=?')->execute([$id]);
            return ['ok'=>true,'message'=>'Produit déjà commandé : dépublié au lieu d\'être supprimé.'];
        }
        $this->pdo->prepare('DELETE FROM products WHERE id=?')->execute([$id]);
        return ['ok'=>true,'message'=>'Produit supprimé.'];
    }

    private function map($r): array {
        $imgs = json_decode($r['images'] ?? '[]', true) ?: [];
        return [
            '_id' => (int)$r['id'], 'id' => (int)$r['id'],
            'reference' => $r['reference'], 'name' => $r['name'],
            'description' => $r['description'],
            'category' => (int)$r['category_id'], 'categoryName' => $r['category_name'] ?? null,
            'price' => (int)$r['price'], 'stock' => (int)$r['stock'],
            'published' => (bool)$r['published'], 'images' => $imgs,
            'createdAt' => $r['created_at'], 'updatedAt' => $r['updated_at'] ?? $r['created_at'],
        ];
    }
}
