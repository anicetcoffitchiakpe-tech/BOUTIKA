import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmtPrice } from '../api/client.js';
import { Spinner } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clear } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const o = await api(`/api/orders/track/${id}`);
      setOrder(o);
      setPhone(o.payment?.phone || '');
    } catch { setOrder(null); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api(`/api/orders/${id}/payment/confirm`, { method: 'POST', body: { pin, phone } });
      if (res.order) setOrder(res.order);
      clear();
      navigate(`/success/${id}?paid=1`);
    } catch (err) {
      setError(err.data?.message || err.message);
      if (err.data?.order) setOrder(err.data.order);
    } finally { setBusy(false); }
  }

  async function cancel() {
    await api(`/api/orders/${id}/payment/fail`, { method: 'POST' }).catch(() => {});
    navigate('/');
  }

  if (loading) return <div className="shop-container"><Spinner /></div>;
  if (!order) return <div className="shop-container"><div className="empty"><div className="big">😕</div><strong>Commande introuvable</strong></div></div>;

  const paid = order.payment?.status === 'confirmed';
  const failed = order.payment?.status === 'failed';

  return (
    <div className="shop-container" style={{ maxWidth: 560, paddingTop: 40 }}>
      <div className="card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44 }}>{paid ? '✅' : failed ? '❌' : '📱'}</div>
          <h2 style={{ margin: '10px 0 4px' }}>{paid ? 'Paiement confirmé !' : failed ? 'Paiement échoué' : 'Paiement Mobile Money'}</h2>
          <p className="muted" style={{ margin: 0 }}>Commande {order.orderNumber}</p>
        </div>

        {!paid && (
          <div className="notice notice--info">
            <b>{order.paymentLabel}</b> · un code de validation vous a été envoyé par SMS.
            <br />Montant à payer : <b>{fmtPrice(order.totalAmount)}</b>
          </div>
        )}

        {paid ? (
          <>
            <div style={{ display: 'grid', gap: 10, margin: '18px 0' }}>
              <InfoRow label="Référence" value={order.payment.reference} />
              <InfoRow label="Opérateur" value={order.paymentLabel} />
              <InfoRow label="Montant" value={fmtPrice(order.totalAmount)} />
              <InfoRow label="Statut" value={order.payment.statusLabel} />
            </div>
            <Link to={`/success/${order._id}`} className="btn btn--block">Voir le récapitulatif</Link>
          </>
        ) : (
          <form onSubmit={submit}>
            {error && <div className="notice notice--error">{error}</div>}
            <div className="field"><label>Numéro de téléphone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 97 00 00 00" /></div>
            <div className="field">
              <label>Code PIN (4 chiffres)</label>
              <input inputMode="numeric" value={pin} maxLength={4} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" style={{ letterSpacing: '0.5em', fontSize: 18, textAlign: 'center' }} />
              <span className="small muted">Démo : tout code à 4 chiffres fonctionne · 0000 simule un échec.</span>
            </div>
            <button className="btn btn--block" disabled={busy}>{busy ? 'Confirmation…' : 'Confirmer le paiement'}</button>
          </form>
        )}

        {failed && !paid && (
          <>
            <div className="notice notice--error" style={{ marginTop: 6 }}>Le paiement a été refusé. Réessayez avec un autre code.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn--block" onClick={() => { setError(''); setPin(''); api(`/api/orders/${id}/payment/retry`, { method: 'POST' }).then(load).catch(() => {}); }}>Relancer le paiement</button>
              <button className="btn btn--ghost btn--block" onClick={cancel}>Annuler</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="muted small">{label}</span><b className="small">{value}</b>
    </div>
  );
}
