import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtPrice } from '../api/client.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/dashboard', { auth: true })
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"></div>;
  if (!data) return <div className="empty-state"><h3>Impossible de charger le tableau de bord</h3></div>;

  const m = data.metrics;
  const stats = [
    { label: "Chiffre d'affaires", value: fmtPrice(m.revenue.current), change: m.revenue.change, icon: '💰', iconBg: 'rgba(217,119,87,0.12)', iconColor: 'var(--c-primary)' },
    { label: 'Commandes', value: m.orders.current, change: m.orders.change, icon: '🧾', iconBg: 'rgba(122,140,95,0.12)', iconColor: 'var(--c-accent)' },
    { label: 'Produits actifs', value: m.activeProducts.current, change: m.activeProducts.change, icon: '📦', iconBg: 'rgba(200,150,62,0.12)', iconColor: 'var(--c-gold)' },
    { label: 'Nouveaux clients', value: m.newClients.current, change: m.newClients.change, icon: '👥', iconBg: 'rgba(95,143,71,0.12)', iconColor: 'var(--c-success)' },
  ];

  const max = Math.max(1, ...data.evolution.map((d) => d.count));
  const totalStatus = Object.values(data.statusBreakdown||{}).reduce((a,b)=>a+b,0) || 1;

  return (
    <>
      <div className="metrics-grid">
        {stats.map((s) => (
          <div className="metric-card" key={s.label}>
            <div className="metric-icon" style={{background: s.iconBg, color: s.iconColor}}>{s.icon}</div>
            <div className="metric-label">{s.label} (30j)</div>
            <div className="metric-value">{s.value}</div>
            <span className={`metric-change ${s.change >= 0 ? 'up' : 'down'}`}>
              {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change)}% <span style={{opacity:0.7,fontWeight:400,fontSize:'0.72rem'}}>vs mois préc.</span>
            </span>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, marginBottom:24}}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Évolution des commandes · 7 derniers jours</h3>
          </div>
          <div style={{padding:'24px'}}>
            <div style={{display:'flex', alignItems:'flex-end', gap:12, height:200}}>
              {data.evolution.map((d) => (
                <div key={d.date} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
                  <div style={{fontSize:13, fontWeight:700, color:'var(--c-text-light)'}}>{d.count || ''}</div>
                  <div style={{
                    width:'100%', maxWidth:50,
                    height: Math.max(6, (d.count/max)*150),
                    background:'linear-gradient(180deg, var(--c-primary), var(--c-primary-light))',
                    borderRadius:'10px 10px 4px 4px',
                    transition:'height .4s ease',
                  }}></div>
                  <div style={{fontSize:12, color:'var(--c-text-muted)', fontWeight:500}}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>En un coup d'œil</h3>
          </div>
          <div style={{padding:'24px'}}>
            <div style={{fontSize:48, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'var(--c-primary-dark)', lineHeight:1, marginBottom:8}}>{m.pendingOrders}</div>
            <div style={{color:'var(--c-text-muted)', fontSize:'0.9rem', marginBottom:20}}>commandes à traiter</div>
            <Link to="/admin/orders" className="btn btn-primary btn-sm">Voir les commandes →</Link>

            <h4 style={{margin:'28px 0 14px', fontSize:'0.9rem', fontFamily:'Inter', fontWeight:600}}>Répartition par statut</h4>
            {Object.entries(data.statusBreakdown||{}).map(([status, count]) => {
              const pct = Math.round(count/totalStatus*100);
              return (
                <div key={status} style={{marginBottom:10}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                    <span className={`status-pill status-${status}`}>{status.replace('_',' ')}</span>
                    <span style={{fontSize:'0.85rem', fontWeight:600}}>{count}</span>
                  </div>
                  <div style={{height:6, background:'var(--c-warm)', borderRadius:3, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,var(--c-primary),var(--c-gold))', borderRadius:3, transition:'width .5s'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>🏆 Produits les plus vendus</h3>
        </div>
        <div style={{padding:'24px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:20}}>
          {data.bestSellers.length === 0 ? (
            <div style={{color:'var(--c-text-muted)'}}>Aucune vente cette semaine.</div>
          ) : data.bestSellers.map((b, i) => (
            <div key={b.product?._id || i} style={{display:'flex', alignItems:'center', gap:14, padding:12, background:'var(--c-cream)', borderRadius:'var(--radius-md)'}}>
              <div style={{width:56, height:56, borderRadius:12, overflow:'hidden', background:'var(--c-warm)', flexShrink:0}}>
                <img src={b.product?.images?.[0] || ''} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:'0.9rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.product?.name || 'Produit'}</div>
                <div style={{fontSize:'0.8rem', color:'var(--c-text-muted)', marginTop:2}}>{b.quantity || b.totalQty || 0} vendus</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
