<?php
class CategoryController {
    public function __construct(private PDO $pdo) {}

    public function index() {
        $rows = $this->pdo->query(
            "SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS productCount
             FROM categories c ORDER BY c.name ASC"
        )->fetchAll();
        return array_map(fn($r) => [
            '_id' => (int)$r['id'], 'id' => (int)$r['id'],
            'name' => $r['name'], 'description' => $r['description'],
            'productCount' => (int)$r['productCount'],
            'createdAt' => $r['created_at'],
        ], $rows);
    }

    public function create() {
        require_role($this->pdo, 'administrateur');
        $b = body_json();
        $name = trim($b['name'] ?? ''); $desc = trim($b['description'] ?? '');
        if ($name === '') api_error(400, 'Le nom de la catégorie est obligatoire.');
        $st = $this->pdo->prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
        try { $st->execute([$name, $desc]); }
        catch (Exception $e) { api_error(409, 'Une catégorie avec ce nom existe déjà.'); }
        return $this->one((int)$this->pdo->lastInsertId(), 201);
    }

    public function show($id) { return $this->one((int)$id); }

    public function update($id) {
        require_role($this->pdo, 'administrateur');
        $b = body_json();
        $fields = []; $values = [];
        foreach (['name','description'] as $k) {
            if (isset($b[$k])) { $fields[] = "$k = ?"; $values[] = $b[$k]; }
        }
        if (!$fields) return $this->one((int)$id);
        $values[] = (int)$id;
        $this->pdo->prepare("UPDATE categories SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
        return $this->one((int)$id);
    }

    public function delete($id) {
        require_role($this->pdo, 'administrateur');
        $st = $this->pdo->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
        $st->execute([(int)$id]);
        if ((int)$st->fetchColumn() > 0) {
            api_error(400, 'Impossible de supprimer une catégorie qui contient des produits.');
        }
        $this->pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([(int)$id]);
        return ['ok' => true, 'message' => 'Catégorie supprimée.'];
    }

    private function one(int $id, int $status = 200) {
        $st = $this->pdo->prepare(
            "SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS productCount
             FROM categories c WHERE c.id = ?"
        );
        $st->execute([$id]);
        $r = $st->fetch();
        if (!$r) api_error(404, 'Catégorie introuvable.');
        $data = ['_id'=>(int)$r['id'],'id'=>(int)$r['id'],'name'=>$r['name'],'description'=>$r['description'],'productCount'=>(int)$r['productCount'],'createdAt'=>$r['created_at']];
        json_response($data, $status);
    }
}
