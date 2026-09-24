<?php
class UserController {
    public function __construct(private PDO $pdo) {}

    public function index() {
        require_role($this->pdo, 'administrateur');
        $rows = $this->pdo->query('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY id')->fetchAll();
        $items = array_map(fn($u) => [
            '_id'=>(int)$u['id'],'id'=>(int)$u['id'],
            'firstName'=>$u['first_name'],'lastName'=>$u['last_name'],
            'email'=>$u['email'],'role'=>$u['role'],'createdAt'=>$u['created_at'],
        ], $rows);
        return ['items'=>$items,'meta'=>['total'=>count($items)]];
    }

    public function create() {
        require_role($this->pdo, 'administrateur');
        $b = body_json();
        $first=trim($b['firstName']??''); $last=trim($b['lastName']??'');
        $email=trim($b['email']??''); $password=$b['password']??'';
        $role=($b['role']??'gestionnaire')==='administrateur'?'administrateur':'gestionnaire';
        if (!$first||!$last||!$email||strlen($password)<6) api_error(400,'Champs invalides (mot de passe ≥6 caractères).');
        $c=$this->pdo->prepare('SELECT id FROM users WHERE email=?'); $c->execute([strtolower($email)]);
        if ($c->fetch()) api_error(409,'Un compte existe déjà pour cet e-mail.');
        $hash=password_hash($password, PASSWORD_BCRYPT);
        $this->pdo->prepare('INSERT INTO users (first_name,last_name,email,password,role) VALUES (?,?,?,?,?)')
                  ->execute([$first,$last,strtolower($email),$hash,$role]);
        $id=(int)$this->pdo->lastInsertId();
        return $this->one($id, 201);
    }

    public function delete($id) {
        require_role($this->pdo, 'administrateur');
        $id=(int)$id;
        $me=current_user();
        if ((int)$me['id'] === $id) api_error(400, 'Vous ne pouvez pas supprimer votre propre compte.');
        $this->pdo->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
        return ['ok'=>true,'message'=>'Utilisateur supprimé.'];
    }

    private function one(int $id, int $status=200) {
        $st=$this->pdo->prepare('SELECT id,first_name,last_name,email,role,created_at FROM users WHERE id=?');
        $st->execute([$id]); $u=$st->fetch();
        if(!$u) api_error(404,'Utilisateur introuvable.');
        json_response(['user'=>[
            '_id'=>(int)$u['id'],'id'=>(int)$u['id'],
            'firstName'=>$u['first_name'],'lastName'=>$u['last_name'],
            'email'=>$u['email'],'role'=>$u['role'],'createdAt'=>$u['created_at']
        ]], $status);
    }
}
