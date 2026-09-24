import { useEffect, useState } from 'react';
import { api, fmtPrice } from '../api/client.js';
import { Spinner, Empty, StockBar } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrateur';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (cat) params.set('category', cat);
    if (filter === 'low') params.set('lowStock', 'true');
    if (filter === 'draft') params.set('status', 'draft');
    if (filter === 'published') params.set('status', 'published');
    try {
      const d = await api(`/api/products?${params.toString()}`);
      setProducts(d.items);
    } catch { setProducts([]); } finally { setLoading(false); }
  }

  useEffect(() => { api('/api/categories').then(setCategories).catch(() => {}); }, []);
  useEffect(() => { load(); }, [search, cat, filter]);

  async function remove(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    await api(`/api/products/${id}`, { method: 'DELETE', auth: true });
    load();
  }

  return (
    <>
      <div className="pagehead">
        <h2>Gestion du catalogue</h2>
        {isAdmin && <button className="btn" onClick={() => { setEditing(null); setModal('create'); }}>+ Ajouter un produit</button>}
      </div>

      <div className="toolbar">
        <div className="search">
          <span>🔍</span>
          <input placeholder="Rechercher (nom ou référence)…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="chips">
          <button className={`chip ${cat === '' ? 'chip--active' : ''}`} onClick={() => setCat('')}>Toutes</button>
          {categories.map((c) => (
            <button key={c._id} className={`chip ${cat === c._id ? 'chip--active' : ''}`} onClick={() => setCat(c._id)}>{c.name}</button>
          ))}
        </div>
        <div className="chips">
          <button className={`chip ${filter === 'low' ? 'chip--active' : ''}`} onClick={() => setFilter(filter === 'low' ? '' : 'low')}>⚠ Stock faible</button>
          <button className={`chip ${filter === 'published' ? 'chip--active' : ''}`} onClick={() => setFilter(filter === 'published' ? '' : 'published')}>Publiés</button>
          <button className={`chip ${filter === 'draft' ? 'chip--active' : ''}`} onClick={() => setFilter(filter === 'draft' ? '' : 'draft')}>Brouillons</button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <Empty title="Aucun produit" hint="Ajoutez un produit pour démarrer votre catalogue." />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th>{isAdmin && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.images?.[0] || ''} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', background: '#eee' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="small muted">{p.reference}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{fmtPrice(p.price)}</td>
                  <td><StockBar stock={p.stock} /></td>
                  <td>{p.published ? <span className="badge badge--livree">Publié</span> : <span className="badge badge--annulee">Brouillon</span>}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn--soft btn--sm" onClick={() => { setEditing(p); setModal('edit'); }}>Modifier</button>
                        <button className="btn btn--danger btn--sm" onClick={() => remove(p._id)}>Suppr.</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ProductModal product={editing} categories={categories} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </>
  );
}

const emptyForm = { reference: '', name: '', description: '', category: '', price: '', stock: '', images: '', published: true };

function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(
    product
      ? { ...product, price: product.price, stock: product.stock, images: (product.images || []).join(', ') }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fieldErrors = error?.fields || {};

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const body = {
      reference: form.reference, name: form.name, description: form.description,
      category: form.category, price: Number(form.price), stock: Number(form.stock),
      images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      published: form.published,
    };
    try {
      if (product) await api(`/api/products/${product._id}`, { method: 'PUT', body, auth: true });
      else await api('/api/products', { method: 'POST', body, auth: true });
      onSaved();
    } catch (err) {
      setError(err.data || { message: err.message });
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="m-head">
          <h3>{product ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20 }}>✕</button>
        </div>
        <form className="m-body" onSubmit={submit}>
          {error && !error.fields && <div className="notice notice--error">{error.message}</div>}
          <h4 className="mt-0" style={{ fontSize: 14, color: 'var(--muted)' }}>Informations générales</h4>
          <div className="grid-2" style={{ gap: 14 }}>
            <div className="field"><label>Référence *</label><input required value={form.reference} onChange={(e) => set('reference', e.target.value)} placeholder="VET-001" />{fieldErrors.reference && <span className="err">{fieldErrors.reference}</span>}</div>
            <div className="field"><label>Nom *</label><input required value={form.name} onChange={(e) => set('name', e.target.value)} />{fieldErrors.name && <span className="err">{fieldErrors.name}</span>}</div>
          </div>
          <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="grid-3" style={{ gap: 14 }}>
            <div className="field">
              <label>Catégorie *</label>
              <select required value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">— Choisir —</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field"><label>Prix (FCFA) *</label><input type="number" min="0.01" step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} />{fieldErrors.price && <span className="err">{fieldErrors.price}</span>}</div>
            <div className="field"><label>Stock *</label><input type="number" min="0" required value={form.stock} onChange={(e) => set('stock', e.target.value)} />{fieldErrors.stock && <span className="err">{fieldErrors.stock}</span>}</div>
          </div>
          <h4 style={{ fontSize: 14, color: 'var(--muted)' }}>Visuels et statut</h4>
          <div className="field"><label>URLs d'images (séparées par des virgules)</label><input value={form.images} onChange={(e) => set('images', e.target.value)} placeholder="/uploads/mon-image.jpg" /></div>
          <div className="field--inline"><label className="field--inline"><input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} /> Produit publié</label></div>
          <div className="m-foot" style={{ padding: '18px 0 0' }}>
            <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
            <button className="btn" disabled={busy}>{busy ? 'Enregistrement…' : product ? 'Enregistrer' : 'Créer le produit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
