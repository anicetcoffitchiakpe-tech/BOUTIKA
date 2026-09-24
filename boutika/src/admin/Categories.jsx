import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { Spinner, Empty } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Categories() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrateur';
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    try { setCats(await api('/api/categories')); } catch {} finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setNotice('');
    await api('/api/categories', { method: 'POST', body: { name, description: desc }, auth: true });
    setName(''); setDesc('');
    load();
  }

  async function remove(id) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE', auth: true });
      load();
    } catch (err) {
      setNotice(err.message);
    }
  }

  return (
    <>
      <div className="pagehead"><h2>Catégories</h2></div>
      {notice && <div className="notice notice--error">{notice}</div>}
      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 className="mt-0" style={{ fontSize: 16 }}>Liste des catégories</h3>
          {loading ? <Spinner /> : cats.length === 0 ? <Empty title="Aucune catégorie" /> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Nom</th><th>Produits</th><th>Description</th>{isAdmin && <th></th>}</tr></thead>
                <tbody>
                  {cats.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td><span className="badge badge--en_attente">{c.productCount}</span></td>
                      <td className="small muted">{c.description || '—'}</td>
                      {isAdmin && <td><button className="btn btn--danger btn--sm" onClick={() => remove(c._id)}>Suppr.</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isAdmin && (
          <form className="card" style={{ padding: 22 }} onSubmit={add}>
            <h3 className="mt-0" style={{ fontSize: 16 }}>Nouvelle catégorie</h3>
            <div className="field"><label>Nom *</label><input required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label>Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <button className="btn">Ajouter</button>
          </form>
        )}
      </div>
    </>
  );
}
