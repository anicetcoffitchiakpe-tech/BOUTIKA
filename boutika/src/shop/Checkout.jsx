import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { api, fmtPrice } from '../api/client.js';

const DELIVERY_FEE = 1500;
const ONLINE = ['mtn', 'moov', 'carte'];

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', city: 'Cotonou', address: '',
    paymentMethod: 'cash', note: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const grandTotal = total + DELIVERY_FEE;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        client: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, city: form.city, address: form.address },
        lines: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        deliveryFee: DELIVERY_FEE,
        paymentMethod: form.paymentMethod,
        deliveryAddress: { fullName: `${form.firstName} ${form.lastName}`, phone: form.phone, street: form.address, city: form.city, note: form.note },
        notes: form.note,
      };
      const order = await api('/api/orders', { method: 'POST', body: payload });
      clear();
      navigate(ONLINE.includes(form.paymentMethod) ? `/payment/${order._id}` : `/success/${order._id}`);
    } catch (err) {
      setError(err.data?.fields ? Object.values(err.data.fields)[0] : err.message);
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return <div className="shop-container"><div className="empty" style={{ padding: 60 }}><div className="big">🛒</div><strong>Votre panier est vide</strong></div></div>;
  }

  return (
    <div className="shop-container" style={{ maxWidth: 1000, paddingTop: 30 }}>
      <h2 style={{ marginTop: 0 }}>Finaliser ma commande</h2>
      {error && <div className="notice notice--error">{error}</div>}
      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        <form className="card" style={{ padding: 24 }} onSubmit={submit}>
          <h3 className="mt-0" style={{ fontSize: 16 }}>Vos coordonnées</h3>
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="field"><label>Prénom *</label><input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></div>
            <div className="field"><label>Nom *</label><input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></div>
          </div>
          <div className="field"><label>E-mail *</label><input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div className="field"><label>Téléphone *</label><input required value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="field"><label>Ville</label><input value={form.city} onChange={(e) => set('city', e.target.value)} /></div>
            <div className="field"><label>Adresse</label><input value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          </div>

          <h3 style={{ fontSize: 16 }}>Mode de paiement</h3>
          <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 10 }}>
            <option value="cash">Paiement à la livraison</option>
            <option value="mtn">MTN Mobile Money</option>
            <option value="moov">Moov Money</option>
            <option value="carte">Carte bancaire</option>
          </select>

          <div className="field" style={{ marginTop: 16 }}><label>Remarques (optionnel)</label><textarea value={form.note} onChange={(e) => set('note', e.target.value)} /></div>
          <button className="btn btn--block" disabled={busy}>{busy ? 'Envoi…' : `Confirmer la commande · ${fmtPrice(grandTotal)}`}</button>
        </form>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="mt-0" style={{ fontSize: 16 }}>Récapitulatif</h3>
          {items.map((i) => (
            <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="small">{i.name} × {i.quantity}</span>
              <b className="small">{fmtPrice(i.price * i.quantity)}</b>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }} className="small"><span className="muted">Sous-total</span><b>{fmtPrice(total)}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }} className="small"><span className="muted">Frais de livraison</span><b>{fmtPrice(DELIVERY_FEE)}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, fontSize: 18 }}><b>Total</b><b style={{ color: 'var(--accent)' }}>{fmtPrice(grandTotal)}</b></div>
        </div>
      </div>
    </div>
  );
}
