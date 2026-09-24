import { useEffect, useState } from 'react';
import { api, fmtPrice, fmtDateTime } from '../api/client.js';
import { Spinner, Empty, StatusBadge, PaymentBadge } from '../components/ui.jsx';

const FILTERS = [
  { id: '', label: 'Toutes' }, { id: 'en_attente', label: 'En attente' },
  { id: 'confirmee', label: 'Confirmées' }, { id: 'preparee', label: 'Préparées' },
  { id: 'expediee', label: 'Expédiées' }, { id: 'livree', label: 'Livrées' }, { id: 'annulee', label: 'Annulées' },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    try {
      const d = await api(`/api/orders?${params.toString()}`, { auth: true });
      setOrders(d.items);
    } catch { setOrders([]); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [status, search]);

  return (
    <>
      <div className="pagehead"><h2>Suivi des commandes</h2></div>
      <div className="toolbar">
        <div className="search"><span>🔍</span><input placeholder="N° de commande ou nom du client…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="chips">{FILTERS.map((f) => <button key={f.id} className={`chip ${status === f.id ? 'chip--active' : ''}`} onClick={() => setStatus(f.id)}>{f.label}</button>)}</div>
      </div>

      {loading ? <Spinner /> : orders.length === 0 ? (
        <Empty title="Aucune commande" hint="Les nouvelles commandes de la boutique apparaîtront ici." />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Articles</th><th>Montant</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                  <td>{o.client?.firstName} {o.client?.lastName}<div className="small muted">{o.client?.phone}</div></td>
                  <td className="small muted">{fmtDateTime(o.createdAt)}</td>
                  <td>{o.itemCount}</td>
                  <td style={{ fontWeight: 700 }}>{fmtPrice(o.totalAmount)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><button className="btn btn--soft btn--sm" onClick={() => setSelected(o._id)}>Détail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <OrderDetail id={selected} onClose={() => setSelected(null)} onChanged={load} />}
    </>
  );
}

const ONLINE = ['mtn', 'moov', 'carte'];

function OrderDetail({ id, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try { setOrder(await api(`/api/orders/${id}`, { auth: true })); } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [id]);

  const timeline = ['en_attente', 'confirmee', 'preparee', 'expediee', 'livree'].map((s) => ({
    status: s, reached: order ? order.statusHistory.some((h) => h.status === s) : false,
  }));
  if (order?.status === 'annulee') timeline.push({ status: 'annulee', reached: true });

  async function transition(nextStatus) {
    setError('');
    try {
      setOrder(await api(`/api/orders/${id}/status`, { method: 'PATCH', body: { status: nextStatus }, auth: true }));
      onChanged();
    } catch (e) { setError(e.data?.message || e.message); load(); }
  }

  async function markPaid() {
    setError('');
    try {
      setOrder(await api(`/api/orders/${id}/payment/confirm-manual`, { method: 'POST', auth: true }));
      onChanged();
    } catch (e) { setError(e.data?.message || e.message); }
  }

  if (!order) return <div className="modal-overlay" onClick={onClose}><div className="modal"><div className="m-body"><Spinner /></div></div></div>;

  const can = {
    confirmee: order.status === 'en_attente',
    preparee: order.status === 'confirmee',
    expediee: order.status === 'preparee',
    livree: order.status === 'expediee',
    annulee: ['en_attente', 'confirmee', 'preparee', 'expediee'].includes(order.status),
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="m-head">
          <h3>Commande {order.orderNumber}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20 }}>✕</button>
        </div>
        <div className="m-body">
          {error && <div className="notice notice--error">{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <StatusBadge status={order.status} />
            <span className="small muted">Créée le {fmtDateTime(order.createdAt)} · {order.paymentLabel}</span>
          </div>

          <h4 style={{ fontSize: 14, color: 'var(--muted)', margin: '10px 0 6px' }}>Avancement</h4>
          <div className="timeline">
            {timeline.map((t) => (
              <div key={t.status} className={`step ${t.reached ? 'done' : ''}`}>
                <div className="dot" /><span>{STATUS_LABELS[t.status]}</span>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 22, marginTop: 20 }}>
            <div>
              <h4 style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 8px' }}>Articles</h4>
              {order.lines.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{l.name}</div>
                    <div className="small muted">{l.quantity} × {fmtPrice(l.unitPrice)}</div>
                  </div>
                  <b className="small">{fmtPrice(l.subtotal)}</b>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }} className="small"><span className="muted">Sous-total</span><b>{fmtPrice(order.subtotal)}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }} className="small"><span className="muted">Livraison</span><b>{fmtPrice(order.deliveryFee)}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontSize: 16 }}><b>Total</b><b style={{ color: 'var(--accent)' }}>{fmtPrice(order.totalAmount)}</b></div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 8px' }}>Client & livraison</h4>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 600 }}>{order.client?.firstName} {order.client?.lastName}</div>
                <div className="small muted">{order.client?.email}</div>
                <div className="small muted">{order.client?.phone}</div>
                {order.deliveryAddress && <div className="small muted" style={{ marginTop: 8 }}>📍 {order.deliveryAddress.street || 'Adresse non précisée'}, {order.deliveryAddress.city || ''}</div>}
              </div>
              {order.notes && <div className="small muted" style={{ marginTop: 12 }}>Note : {order.notes}</div>}

              <h4 style={{ fontSize: 14, color: 'var(--muted)', margin: '20px 0 8px' }}>Paiement</h4>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="small muted">{order.paymentLabel}</span>
                  <PaymentBadge status={order.payment?.status} />
                </div>
                {order.payment?.reference && <div className="small muted" style={{ marginTop: 8 }}>Réf. {order.payment.reference}</div>}
                {order.payment?.phone && <div className="small muted">📱 {order.payment.phone}</div>}
                {!ONLINE.includes(order.paymentMethod) && order.payment?.status !== 'confirmed' && (
                  <button className="btn btn--soft btn--sm" style={{ marginTop: 10 }} onClick={markPaid}>Marquer paiement reçu</button>
                )}
              </div>

              <h4 style={{ fontSize: 14, color: 'var(--muted)', margin: '20px 0 8px' }}>Actions</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {can.confirmee && <button className="btn btn--sm" onClick={() => transition('confirmee')}>Confirmer</button>}
                {can.preparee && <button className="btn btn--sm" onClick={() => transition('preparee')}>Préparer</button>}
                {can.expediee && <button className="btn btn--sm" onClick={() => transition('expediee')}>Expédier</button>}
                {can.livree && <button className="btn btn--success btn--sm" onClick={() => transition('livree')}>Livrée</button>}
                {can.annulee && <button className="btn btn--danger btn--sm" onClick={() => transition('annulee')}>Annuler</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  en_attente: 'En attente', confirmee: 'Confirmée', preparee: 'Préparée',
  expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée',
};
