<?php
class ClientController {
    public function __construct(private PDO $pdo) {}

    public function index() {
        require_role($this->pdo, 'administrateur','gestionnaire');
        $page=max(1,(int)(query_param('page',1)));
        $limit=min(100,max(1,(int)(query_param('limit',20))));
        $offset=($page-1)*$limit;
        $where=['1=1']; $params=[];
        if ($q=trim((string)query_param('search',''))) {
            $where[]='(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ?)';
            foreach (range(0,4) as $_) $params[]="%$q%";
        }
        $w=implode(' AND ',$where);
        $total=$this->pdo->prepare("SELECT COUNT(*) FROM clients WHERE $w"); $total->execute($params);
        $totalCount=(int)$total->fetchColumn();
        $st=$this->pdo->prepare(
            "SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.client_id=c.id) AS order_count
             FROM clients c WHERE $w ORDER BY c.created_at DESC LIMIT $limit OFFSET $offset"
        );
        $st->execute($params);
        $items=array_map(fn($r)=>[
            '_id'=>(int)$r['id'],'id'=>(int)$r['id'],
            'firstName'=>$r['first_name'],'lastName'=>$r['last_name'],
            'email'=>$r['email'],'phone'=>$r['phone'],'address'=>$r['address'],'city'=>$r['city'],
            'orderCount'=>(int)$r['order_count'],'createdAt'=>$r['created_at'],
        ], $st->fetchAll());
        return ['items'=>$items,'meta'=>['page'=>$page,'limit'=>$limit,'total'=>$totalCount,'pages'=>(int)ceil($totalCount/max(1,$limit))]];
    }

    public function show($id) {
        require_role($this->pdo, 'administrateur','gestionnaire');
        $id=(int)$id;
        $st=$this->pdo->prepare('SELECT * FROM clients WHERE id=?'); $st->execute([$id]);
        $c=$st->fetch(); if(!$c) api_error(404,'Client introuvable.');
        $orders=$this->pdo->prepare(
            "SELECT o.* FROM orders o WHERE o.client_id=? ORDER BY o.created_at DESC"
        ); $orders->execute([$id]);
        $orderList=array_map(fn($o)=>$this->mapOrder($o), $orders->fetchAll());
        return [
            '_id'=>(int)$c['id'],'id'=>(int)$c['id'],
            'firstName'=>$c['first_name'],'lastName'=>$c['last_name'],
            'email'=>$c['email'],'phone'=>$c['phone'],'address'=>$c['address'],'city'=>$c['city'],
            'createdAt'=>$c['created_at'], 'orders'=>$orderList,
        ];
    }

    public function findOrCreate(array $data): int {
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? '');
        // Recherche par e-mail ou téléphone
        if ($email) {
            $s=$this->pdo->prepare('SELECT id FROM clients WHERE email=? LIMIT 1'); $s->execute([$email]);
            if ($x=$s->fetch()) return (int)$x['id'];
        }
        if ($phone) {
            $s=$this->pdo->prepare('SELECT id FROM clients WHERE phone=? LIMIT 1'); $s->execute([$phone]);
            if ($x=$s->fetch()) return (int)$x['id'];
        }
        $this->pdo->prepare('INSERT INTO clients (first_name,last_name,email,phone,address,city) VALUES (?,?,?,?,?,?)')
            ->execute([$data['firstName']??'',$data['lastName']??'',$email,$phone,$data['address']??null,$data['city']??null]);
        return (int)$this->pdo->lastInsertId();
    }

    private function mapOrder($o): array {
        return [
            '_id'=>(int)$o['id'],'id'=>(int)$o['id'],
            'orderNumber'=>$o['order_number'],'status'=>$o['status'],
            'createdAt'=>$o['created_at'],'paymentMethod'=>$o['payment_method'],
        ];
    }
}
