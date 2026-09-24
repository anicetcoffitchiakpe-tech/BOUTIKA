import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtPrice } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { Spinner } from '../components/ui.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api(`/api/products/${id}`).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="shop-container"><Spinner /></div>;
  if (!product) {
    return (
      <div className="shop-container">
        <div className="empty"><div className="big">😕</div><strong>Produit introuvable</strong></div>
        <div style={{ textAlign: 'center' }}><Link to="/" className="btn">Retour à la boutique</Link></div>
      </div>
    );
  }

  function add() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="shop-container" style={{ paddingTop: 30 }}>
      <Link to="/" className="small muted" style={{ display: 'inline-block', marginBottom: 16 }}>← Retour à la boutique</Link>
      <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f0eeea' }}>
          <img src={product.images?.[0] || ''} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
        </div>
        <div>
          <div className="cat" style={{ textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', fontSize: 13 }}>
            {product.category?.name || ''} · Réf. {product.reference}
          </div>
          <h1 style={{ margin: '8px 0', fontSize: 30 }}>{product.name}</h1>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)', margin: '10px 0' }}>{fmtPrice(product.price)}</div>
          <p style={{ color: 'var(--dark-2)' }}>{product.description || 'Produit de la boutique Boutika.'}</p>
          <div style={{ margin: '18px 0' }}>
            <span className={`badge ${product.stock > 0 ? 'badge--livree' : 'badge--annulee'}`}>{product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}</span>
          </div>
          <div className="field--inline" style={{ gap: 12, marginBottom: 8 }}>
            <label className="small muted">Quantité :</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 10 }}>
              <button style={{ border: 'none', background: 'none', padding: '10px 14px', fontSize: 18 }} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span style={{ width: 36, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
              <button style={{ border: 'none', background: 'none', padding: '10px 14px', fontSize: 18 }} onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}>+</button>
            </div>
          </div>
          <button className="btn btn--block" disabled={product.stock <= 0} onClick={add} style={{ marginTop: 8 }}>
            {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
          </button>
          <Link to="/cart" className="btn btn--ghost btn--block" style={{ marginTop: 10 }}>Voir le panier</Link>
        </div>
      </div>
    </div>
  );
}
