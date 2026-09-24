import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtPrice } from '../api/client.js';

export default function Success() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/orders/track/${id}`).then(setOrder).catch((e) => { setError(e.message); setOrder(null); });
  }, [id]);

  const online = ['mtn', 'moov', 'carte'].includes(order?.paymentMethod);
  const paid = order?.payment?.status === 'confirmed';
  const pendingPayment = online && !paid && order?.payment?.status !== 'failed';

  return (
    <div className="shop-container" style={{ maxWidth: 640, paddingTop: 50 }}>
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontSize: 54 }}>😕</div><h2 style={{ margin: '10px 0' }}>Commande introuvable</h2><p className="muted">{error}</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 54 }}>{paid ? '🎉' : '✅'}</div>
            <h2 style={{ margin: '10px 0' }}>Merci pour votre commande !</h2>
            {order ? (
              <>
                <p className="muted">Votre commande <b>{order.orderNumber}</b> a bien été enregistrée.</p>
                <p className="muted">Montant total : <b style={{ color: 'var(--accent)' }}>{fmtPrice(order.totalAmount)}</b> — {order.paymentLabel}</p>
                {online ? (
                  paid ? (
                    <p className="small muted">Paiement <b style={{ color: 'var(--success)' }}>confirmé</b> (réf. {order.payment.reference}). Nous préparons votre commande.</p>
                  ) : (
                    <p className="small muted">Il vous reste à confirmer votre paiement en ligne pour que la commande soit expédiée.</p>
                  )
                ) : (
                  <p className="small muted">Vous réglerez à la livraison. Nous vous contacterons pour la livraison.</p>
                )}
              </>
            ) : <p className="muted">Votre commande a bien été enregistrée.</p>}
          </>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {pendingPayment && <Link to={`/payment/${id}`} className="btn">Confirmer mon paiement</Link>}
          <Link to="/" className="btn">Retour à la boutique</Link>
          <Link to="/admin/orders" className="btn btn--ghost">Suivre ma commande (admin)</Link>
        </div>
      </div>
    </div>
  );
}
