<?php
class OrderController {
    private const TRANSITIONS = [
        'en_attente' => ['confirmee','annulee'],
        'confirmee'  => ['preparee','annulee'],
        'preparee'   => ['expediee','annulee'],
        'expediee'   => ['livree','annulee'],
        'livree'     => [],
        'annulee'    => [],
    ];

    public function __construct(private PDO $pdo, private ClientController $clients) {}

    public function index() {
        require_role($this->pdo, 'administrateur','gestionnaire');
        $where=['1=1']; $params=[];
        if ($s=query_param('status')) { $where[]='o.status=?'; $params[]=$s; }
        if ($q=trim((string)query_param('search',''))) {
            $where[]='(o.order_number LIKE ? OR CONCAT_WS(" ",c.first_name,c.last_name) LIKE ?)';
            $like="%$q%"; $params[]=$like; $params[]=$like;
        }
        $w=implode(' AND ',$where);
        $st=$this->pdo->prepare(
            "SELECT o.*, CONCAT_WS(' ',c.first_name,c.last_name) AS client_name, c.phone AS client_phone
             FROM orders o JOIN clients c ON c.id=o.client_id
             WHERE $w ORDER BY o.created_at DESC LIMIT 200"
        ); $st->execute($params);
        return ['items'=>array_map([$this,'map'], $st->fetchAll()), 'meta'=>['total'=>$st->rowCount()]];
    }

    public function create() {
        $b=body_json();
        $client=$b['client']??[]; $lines=$b['lines']??[];
        if (!$lines || !is_array($lines) || count($lines)===0) api_error(400,'Panier vide.');
        if (!$client || !($client['firstName']??null) || !($client['lastName']??null) || !($client['phone']??null)) {
            api_error(400,'Informations client incomplètes.');
        }
        $clientId=$this->clients->findOrCreate($client);
        $deliveryFee=(int)($b['deliveryFee']??1500);
        $paymentMethod=in_array($b['paymentMethod']??'mtn', ['mtn','moov','carte','cash','virement'], true) ? $b['paymentMethod'] : 'mtn';

        // Récupère les produits et vérifie le stock
        $lineModels=[]; $total=0;
        foreach ($lines as $l) {
            $pid=(int)($l['product']??0); $qty=max(1,(int)($l['quantity']??1));
            $st=$this->pdo->prepare('SELECT * FROM products WHERE id=?'); $st->execute([$pid]);
            $p=$st->fetch(); if(!$p) api_error(400,'Produit introuvable dans une ligne.');
            if ((int)$p['stock'] < $qty) api_error(400,"Stock insuffisant pour {$p['name']}.");
            $lineModels[]=['product_id'=>$pid,'name'=>$p['name'],'unit_price'=>(int)$p['price'],'quantity'=>$qty];
            $total += (int)$p['price'] * $qty;
        }
        $total += $deliveryFee;
        $orderNumber='BK-'.strtoupper(substr(md5(uniqid((string)mt_rand(),true)),0,10));
        $this->pdo->beginTransaction();
        try {
            $statusHistory=[['status'=>'en_attente','at'=>date('Y-m-d H:i:s')]];
            $addr=['fullName'=>($client['firstName']??'').' '.($client['lastName']??''),'phone'=>$client['phone']??null,'city'=>$client['city']??null,'address'=>$client['address']??null];
            $this->pdo->prepare(
                'INSERT INTO orders (order_number,client_id,status,status_history,delivery_fee,payment_method,
                                    payment_status,payment_provider,delivery_address,payment_events,created_at)
                 VALUES (?,?,?,?,?,?,?,?,?,?,NOW())'
            )->execute([
                $orderNumber,$clientId,'en_attente',json_encode($statusHistory),$deliveryFee,$paymentMethod,
                $paymentMethod==='cash'? 'pending':'pending',
                $this->providerLabel($paymentMethod),
                json_encode($addr),
                json_encode([['type'=>'request','message'=>'Commande enregistrée.','at'=>date('Y-m-d H:i:s')]]),
            ]);
            $oid=(int)$this->pdo->lastInsertId();
            $ls=$this->pdo->prepare('INSERT INTO order_lines (order_id,product_id,name,unit_price,quantity) VALUES (?,?,?,?,?)');
            $stockDec=$this->pdo->prepare('UPDATE products SET stock = stock - ? WHERE id=?');
            foreach ($lineModels as $lm) {
                $ls->execute([$oid,$lm['product_id'],$lm['name'],$lm['unit_price'],$lm['quantity']]);
                $stockDec->execute([$lm['quantity'],$lm['product_id']]);
            }
            $this->pdo->commit();
        } catch (Exception $e) {
            $this->pdo->rollBack();
            api_error(500,'Erreur lors de la création de commande : '.$e->getMessage());
        }
        return $this->show((string)$oid, 201);
    }

    public function show($id, int $status=200) {
        $st=$this->pdo->prepare(
            "SELECT o.*, CONCAT_WS(' ',c.first_name,c.last_name) AS client_name, c.email AS client_email,
                    c.phone AS client_phone, c.address AS client_address, c.city AS client_city
             FROM orders o JOIN clients c ON c.id=o.client_id WHERE o.id=?"
        ); $st->execute([(int)$id]);
        $o=$st->fetch(); if(!$o) api_error(404,'Commande introuvable.');
        $lines=$this->pdo->prepare('SELECT * FROM order_lines WHERE order_id=?'); $lines->execute([(int)$id]);
        $data=$this->mapFull($o, $lines->fetchAll());
        json_response($data, $status);
    }

    public function track($id) {
        $st=$this->pdo->prepare(
            "SELECT o.*, CONCAT_WS(' ',c.first_name,c.last_name) AS client_name, c.phone AS client_phone, c.city AS client_city
             FROM orders o JOIN clients c ON c.id=o.client_id WHERE o.id=?"
        ); $st->execute([(int)$id]);
        $o=$st->fetch(); if(!$o) api_error(404,'Commande introuvable.');
        // Ne divulgue PAS l'email
        $lines=$this->pdo->prepare('SELECT * FROM order_lines WHERE order_id=?'); $lines->execute([(int)$id]);
        $mapped=$this->mapFull($o, $lines->fetchAll());
        unset($mapped['client']['email'], $mapped['client']['address']);
        return $mapped;
    }

    public function updateStatus($id) {
        require_role($this->pdo,'administrateur','gestionnaire');
        $b=body_json(); $new=$b['status']??'';
        $id=(int)$id;
        $st=$this->pdo->prepare('SELECT * FROM orders WHERE id=?'); $st->execute([$id]); $o=$st->fetch();
        if(!$o) api_error(404,'Commande introuvable.');
        $current=$o['status'];
        $allowed=self::TRANSITIONS[$current] ?? [];
        if (!in_array($new,$allowed,true)) {
            api_error(400,"Transition de statut impossible : '$current' → '$new'. Autorisées : ".implode(', ',$allowed));
        }
        // Règle métier : paiement en ligne non confirmé → on ne peut pas expédier
        if ($new==='expediee' && in_array($o['payment_method'],['mtn','moov','carte'],true) && $o['payment_status']!=='confirmed') {
            api_error(400,'Impossible d\'expédier : le paiement en ligne n\'a pas été confirmé.');
        }
        $hist=json_decode($o['status_history']??'[]',true) ?: [];
        $hist[]=['status'=>$new,'at'=>date('Y-m-d H:i:s')];
        $this->pdo->prepare('UPDATE orders SET status=?, status_history=? WHERE id=?')->execute([$new,json_encode($hist),$id]);
        return $this->show((string)$id);
    }

    public function confirmPayment($id) {
        $b=body_json(); $pin=(string)($b['pin']??'');
        $id=(int)$id;
        $st=$this->pdo->prepare('SELECT * FROM orders WHERE id=?'); $st->execute([$id]); $o=$st->fetch();
        if(!$o) api_error(404,'Commande introuvable.');
        $events=json_decode($o['payment_events']??'[]',true) ?: [];
        if ($pin === '0000') {
            $events[]=['type'=>'fail','message'=>'Paiement refusé par l\'opérateur (PIN 0000 = échec simulé).','at'=>date('Y-m-d H:i:s')];
            $this->pdo->prepare('UPDATE orders SET payment_status=?, payment_events=? WHERE id=?')->execute(['failed',json_encode($events),$id]);
            api_error(400,'Paiement refusé (PIN invalide / solde insuffisant).');
        }
        if (!preg_match('/^\d{4}$/',$pin)) api_error(400,'Le code PIN doit contenir exactement 4 chiffres.');
        $ref='MP-'.strtoupper(substr(md5(uniqid((string)mt_rand(),true)),0,10));
        $events[]=['type'=>'confirm','message'=>'Paiement confirmé par l\'opérateur.','at'=>date('Y-m-d H:i:s'),'pin'=>$pin];
        $this->pdo->prepare(
            'UPDATE orders SET payment_status=?, payment_reference=?, payment_confirmed_at=NOW(), payment_events=? WHERE id=?'
        )->execute(['confirmed',$ref,json_encode($events),$id]);
        return $this->show((string)$id);
    }

    public function failPayment($id) {
        $id=(int)$id; $b=body_json();
        $st=$this->pdo->prepare('SELECT * FROM orders WHERE id=?'); $st->execute([$id]); $o=$st->fetch();
        if(!$o) api_error(404,'Commande introuvable.');
        $events=json_decode($o['payment_events']??'[]',true)?:[];
        $events[]=['type'=>'fail','message'=>$b['reason']??'Échec du paiement.','at'=>date('Y-m-d H:i:s')];
        $this->pdo->prepare('UPDATE orders SET payment_status=?, payment_events=? WHERE id=?')->execute(['failed',json_encode($events),$id]);
        return $this->show((string)$id);
    }

    public function retryPayment($id) {
        $id=(int)$id;
        $st=$this->pdo->prepare('SELECT * FROM orders WHERE id=?'); $st->execute([$id]); $o=$st->fetch();
        if(!$o) api_error(404,'Commande introuvable.');
        $events=json_decode($o['payment_events']??'[]',true)?:[];
        $events[]=['type'=>'retry','message'=>'Nouvelle tentative de paiement.','at'=>date('Y-m-d H:i:s')];
        $this->pdo->prepare('UPDATE orders SET payment_status=?, payment_confirmed_at=NULL, payment_reference=NULL, payment_events=? WHERE id=?')
                 ->execute(['pending',json_encode($events),$id]);
        return $this->show((string)$id);
    }

    public function confirmManual($id) {
        require_role($this->pdo,'administrateur','gestionnaire');
        $id=(int)$id;
        $st=$this->pdo->prepare('SELECT * FROM orders WHERE id=?'); $st->execute([$id]); $o=$st->fetch();
        if(!$o) api_error(404,'Commande introuvable.');
        $events=json_decode($o['payment_events']??'[]',true)?:[];
        $ref='MAN-'.strtoupper(substr(md5(uniqid((string)mt_rand(),true)),0,8));
        $events[]=['type'=>'manual-confirm','message'=>'Paiement marqué comme reçu manuellement.','at'=>date('Y-m-d H:i:s')];
        $this->pdo->prepare(
            'UPDATE orders SET payment_status=?, payment_reference=?, payment_confirmed_at=NOW(), payment_events=? WHERE id=?'
        )->execute(['confirmed',$ref,json_encode($events),$id]);
        return $this->show((string)$id);
    }

    public function delete($id) {
        require_role($this->pdo,'administrateur');
        $id=(int)$id;
        // Remet le stock des lignes
        $lines=$this->pdo->prepare('SELECT product_id, quantity FROM order_lines WHERE order_id=? AND product_id IS NOT NULL');
        $lines->execute([$id]);
        foreach ($lines->fetchAll() as $l) {
            $this->pdo->prepare('UPDATE products SET stock = stock + ? WHERE id=?')->execute([(int)$l['quantity'],(int)$l['product_id']]);
        }
        $this->pdo->prepare('DELETE FROM orders WHERE id=?')->execute([$id]);
        return ['ok'=>true,'message'=>'Commande supprimée.'];
    }

    private function providerLabel($m): string {
        return match($m){
            'mtn'=>'MTN Mobile Money','moov'=>'Moov Money','carte'=>'Carte bancaire','cash'=>'Paiement à la livraison','virement'=>'Virement bancaire', default='-'
        };
    }

    private function map($o): array {
        $total=0;
        return [
            '_id'=>(int)$o['id'],'id'=>(int)$o['id'],
            'orderNumber'=>$o['order_number'],'status'=>$o['status'],
            'client'=>['name'=>$o['client_name'],'phone'=>$o['client_phone']],
            'createdAt'=>$o['created_at'],'updatedAt'=>$o['updated_at']??$o['created_at'],
            'paymentMethod'=>$o['payment_method'],'paymentStatus'=>$o['payment_status'],
            'total'=>$total,'deliveryFee'=>(int)$o['delivery_fee'],
        ];
    }

    private function mapFull($o, $lines): array {
        $subtotal=0; $mappedLines=[];
        foreach ($lines as $l) {
            $mappedLines[]=[
                '_id'=>(int)$l['id'],'id'=>(int)$l['id'],'product'=>(int)$l['product_id'],
                'name'=>$l['name'],'unitPrice'=>(int)$l['unit_price'],'quantity'=>(int)$l['quantity'],
                'lineTotal'=>(int)$l['unit_price']*(int)$l['quantity'],
            ];
            $subtotal += (int)$l['unit_price']*(int)$l['quantity'];
        }
        $addr=json_decode($o['delivery_address']??'{}',true)?:[];
        $hist=json_decode($o['status_history']??'[]',true)?:[];
        $events=json_decode($o['payment_events']??'[]',true)?:[];
        return [
            '_id'=>(int)$o['id'],'id'=>(int)$o['id'],
            'orderNumber'=>$o['order_number'],'status'=>$o['status'],'statusHistory'=>$hist,
            'client'=>[
                'id'=>(int)$o['client_id'],'name'=>$o['client_name'],
                'email'=>$o['client_email']??null,'phone'=>$o['client_phone']??null,
                'address'=>$o['client_address']??null,'city'=>$o['client_city']??null,
            ],
            'lines'=>$mappedLines,
            'deliveryFee'=>(int)$o['delivery_fee'],'subtotal'=>$subtotal,'total'=>$subtotal+(int)$o['delivery_fee'],
            'paymentMethod'=>$o['payment_method'],
            'payment'=>[
                'provider'=>$o['payment_provider'],
                'status'=>$o['payment_status'],
                'reference'=>$o['payment_reference'],
                'phone'=>$o['payment_phone'] ?? $o['client_phone'],
                'requestedAt'=>$o['payment_requested_at'] ?? $o['created_at'],
                'confirmedAt'=>$o['payment_confirmed_at'],
                'events'=>$events,
            ],
            'deliveryAddress'=>$addr,
            'createdAt'=>$o['created_at'],'updatedAt'=>$o['updated_at']??$o['created_at'],
        ];
    }
}
