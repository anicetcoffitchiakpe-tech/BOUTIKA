<?php
class DashboardController {
    public function __construct(private PDO $pdo) {}

    public function index() {
        require_role($this->pdo,'administrateur','gestionnaire');
        // Période courante (30 derniers jours) vs précédente
        $now = new DateTime(); $curStart=(clone $now)->modify('-30 days'); $prevStart=(clone $curStart)->modify('-30 days');

        $metric = function(string $sql, ...$p) {
            $st=$this->pdo->prepare($sql); $st->execute($p); return (int)$st->fetchColumn();
        };
        $revenueCur = $metric(
            "SELECT COALESCE(SUM(ol.unit_price*ol.quantity)+MAX(o.delivery_fee),0) FROM orders o
             JOIN order_lines ol ON ol.order_id=o.id
             WHERE o.status <> 'annulee' AND o.created_at >= ?", $curStart->format('Y-m-d H:i:s')
        );
        // approximation : pour simplifier on additionne livraison par commande
        $revenueCur = $metric(
            "SELECT COALESCE(SUM(
                (SELECT COALESCE(SUM(unit_price*quantity),0) FROM order_lines ol WHERE ol.order_id=o.id) + o.delivery_fee
             ),0) FROM orders o WHERE o.status<>'annulee' AND o.created_at >= ?",
            $curStart->format('Y-m-d H:i:s')
        );
        $revenuePrev = $metric(
            "SELECT COALESCE(SUM(
                (SELECT COALESCE(SUM(unit_price*quantity),0) FROM order_lines ol WHERE ol.order_id=o.id) + o.delivery_fee
             ),0) FROM orders o WHERE o.status<>'annulee' AND o.created_at >= ? AND o.created_at < ?",
            $prevStart->format('Y-m-d H:i:s'), $curStart->format('Y-m-d H:i:s')
        );
        $ordersCur = $metric("SELECT COUNT(*) FROM orders WHERE created_at >= ?", $curStart->format('Y-m-d H:i:s'));
        $ordersPrev = $metric("SELECT COUNT(*) FROM orders WHERE created_at >= ? AND created_at < ?", $prevStart->format('Y-m-d H:i:s'), $curStart->format('Y-m-d H:i:s'));
        $activeCur = $metric("SELECT COUNT(*) FROM products WHERE published=1");
        $activePrev = $activeCur;
        $newClientsCur = $metric("SELECT COUNT(*) FROM clients WHERE created_at >= ?", $curStart->format('Y-m-d H:i:s'));
        $newClientsPrev = $metric("SELECT COUNT(*) FROM clients WHERE created_at >= ? AND created_at < ?", $prevStart->format('Y-m-d H:i:s'), $curStart->format('Y-m-d H:i:s'));
        $pending = $metric("SELECT COUNT(*) FROM orders WHERE status IN ('en_attente','confirmee','preparee')");

        $pct = fn($cur,$prev) => $prev==0 ? ($cur>0?100:0) : round((($cur-$prev)/$prev)*100,1);

        // 7 derniers jours
        $evolution=[];
        for ($i=6; $i>=0; $i--) {
            $d=(new DateTime())->modify("-$i days");
            $dayStart=(clone $d)->setTime(0,0); $dayEnd=(clone $d)->setTime(23,59,59);
            $c=$metric("SELECT COUNT(*) FROM orders WHERE created_at >= ? AND created_at <= ?", $dayStart->format('Y-m-d H:i:s'), $dayEnd->format('Y-m-d H:i:s'));
            $evolution[]=['date'=>$d->format('Y-m-d'),'label'=>['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][(int)$d->format('w')],'count'=>$c];
        }

        // Meilleures ventes
        $best = $this->pdo->query(
            "SELECT p.id, p.name, p.reference, p.images, SUM(ol.quantity) AS qty
             FROM order_lines ol JOIN products p ON p.id=ol.product_id
             JOIN orders o ON o.id=ol.order_id WHERE o.status<>'annulee'
             GROUP BY p.id ORDER BY qty DESC LIMIT 5"
        )->fetchAll();
        $bestSellers=array_map(fn($b)=>([
            'product'=>['_id'=>(int)$b['id'],'id'=>(int)$b['id'],'name'=>$b['name'],'reference'=>$b['reference'],
                        'images'=>json_decode($b['images']?:'[]',true)?:[]],
            'quantity'=>(int)$b['qty'],
        ]), $best);

        // Répartition par statut
        $rows=$this->pdo->query("SELECT status, COUNT(*) c FROM orders GROUP BY status")->fetchAll();
        $statusBreakdown=[]; foreach ($rows as $r) $statusBreakdown[$r['status']]=(int)$r['c'];

        return [
            'metrics' => [
                'revenue'        => ['current'=>$revenueCur,'previous'=>$revenuePrev,'change'=>$pct($revenueCur,$revenuePrev)],
                'orders'         => ['current'=>$ordersCur, 'previous'=>$ordersPrev, 'change'=>$pct($ordersCur,$ordersPrev)],
                'activeProducts' => ['current'=>$activeCur, 'previous'=>$activePrev, 'change'=>$pct($activeCur,$activePrev)],
                'newClients'     => ['current'=>$newClientsCur,'previous'=>$newClientsPrev,'change'=>$pct($newClientsCur,$newClientsPrev)],
                'pendingOrders'  => $pending,
            ],
            'evolution' => $evolution,
            'bestSellers' => $bestSellers,
            'statusBreakdown' => $statusBreakdown,
        ];
    }
}
