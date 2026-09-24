import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { fmtPrice } from '../api/client.js';

export default function Cart() {
  const { items, total, updateQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="shop-container">
        <div className="empty" style={{ padding: 60 }}>
          <div className="big">🛒</div><strong>Votre panier est vide</strong>
          <div style={{ marginTop: 16 }}><Link to="/" className="btn">Explorer la boutique</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container" style={{ maxWidth: 1000, paddingTop: 30 }}>
      <h2 style={{ marginTop: 0 }}>Votre panier</h2>
      <div className="card" style={{ padding: 6 }}>
        {items.map((i) => (
          <div key={i._id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, borderBottom: '1px solid var(--border)' }}>
            <img src={i.image || ''} alt={i.name} style={{ width: 70, height: 70, borderRadius: 10, objectFit: 'cover', background: '#eee' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{i.name}</div>
              <div className="small muted">{fmtPrice(i.price)} / unité</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8 }}>
              <button style={{ border: 'none', background: 'none', padding: '8px 12px' }} onClick={() => updateQty(i._id, i.quantity - 1)}>−</button>
              <b style={{ width: 28, textAlign: 'center' }}>{i.quantity}</b>
              <button style={{ border: 'none', background: 'none', padding: '8px 12px' }} onClick={() => updateQty(i._id, i.quantity + 1)}>+</button>
            </div>
            <div style={{ fontWeight: 700, minWidth: 90, textAlign: 'right' }}>{fmtPrice(i.price * i.quantity)}</div>
            <button style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: 18 }} onClick={() => removeItem(i._id)}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <button className="btn btn--ghost" onClick={clear}>Vider le panier</button>
        <div style={{ textAlign: 'right' }}>
          <div className="small muted">Total</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{fmtPrice(total)}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
        <Link to="/" className="btn btn--ghost">Continuer mes achats</Link>
        <Link to="/checkout" className="btn">Passer la commande</Link>
      </div>
    </div>
  );
}
