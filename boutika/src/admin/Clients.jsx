import { useEffect, useState } from 'react';
import { api, fmtPrice, fmtDate } from '../api/client.js';
import { Spinner, Empty } from '../components/ui.jsx';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    try {
      const d = await api(`/api/clients?${params.toString()}`, { auth: true });
      setClients(d.items);
    } catch { setClients([]); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [search]);

  return (
    <>
      <div className="pagehead"><h2>Gestion des clients</h2></div>
      <div className="toolbar">
        <div className="search"><span>🔍</span><input placeholder="Nom, e-mail ou téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      {loading ? <Spinner /> : clients.length === 0 ? (
        <Empty title="Aucun client" hint="Les clients qui commandent sur la boutique apparaîtront ici." />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Client</th><th>Contact</th><th>Ville</th><th>Commandes</th><th>Inscrit</th><th></th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{c.firstName?.[0]}{c.lastName?.[0]}</div>
                      <div style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                    </div>
                  </td>
                  <td className="small">{c.email}<div className="muted">{c.phone}</div></td>
                  <td className="small">{c.city || '—'}</td>
                  <td><span className="badge badge--en_attente">{c.orderCount}</span></td>
                  <td className="small muted">{fmtDate(c.createdAt)}</td>
                  <td><button className="btn btn--soft btn--sm" onClick={() => setDetailId(c._id)}>Historique</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailId && <ClientHistory id={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}

function ClientHistory({ id, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => { api(`/api/clients/${id}`, { auth: true }).then(setData).catch(() => {}); }, [id]);
  if (!data) return <div className="modal-overlay" onClick={onClose}><div className="modal"><div className="m-body"><Spinner /></div></div></div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-head">
          <h3>Historique — {data.client.firstName} {data.client.lastName}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20 }}>✕</button>
        </div>
        <div className="m-body">
          <div className="small muted" style={{ marginBottom: 14 }}>{data.client.email} · {data.client.phone} · {data.client.city || ''}</div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>N°</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                {data.orders.length === 0 ? (
                  <tr><td colSpan={4} className="muted" style={{ textAlign: 'center' }}>Aucune commande</td></tr>
                ) : data.orders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                    <td className="small muted">{fmtDate(o.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>{fmtPrice(o.totalAmount)}</td>
                    <td><span className={`badge badge--${o.status}`}>{statusLabel(o.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusLabel(s) {
  return { en_attente: 'En attente', confirmee: 'Confirmée', preparee: 'Préparée', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée' }[s] || s;
}
