import { fmtPrice } from '../api/client.js';

export function Spinner({ label = 'Chargement…' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      <div className="spinner" />
      <div style={{ marginTop: 12, fontSize: 14 }}>{label}</div>
    </div>
  );
}

const STATUS = {
  en_attente: 'En attente', confirmee: 'Confirmée', preparee: 'Préparée',
  expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée',
};

export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{STATUS[status] || status}</span>;
}

export function PaymentBadge({ status }) {
  const map = {
    pending: { label: 'Paiement en attente', cls: 'badge--en_attente' },
    confirmed: { label: 'Paiement confirmé', cls: 'badge--livree' },
    failed: { label: 'Paiement échoué', cls: 'badge--annulee' },
  };
  const m = map[status] || { label: '—', cls: '' };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
}

export function StockBar({ stock }) {
  const pct = Math.min(100, (stock / 20) * 100);
  const color = stock <= 5 ? 'var(--danger)' : stock <= 10 ? 'var(--warn)' : 'var(--success)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="stockbar"><span style={{ width: `${Math.max(4, pct)}%`, background: color }} /></div>
      <span className="small muted">{stock}</span>
    </div>
  );
}

export function Empty({ title, hint }) {
  return (
    <div className="empty">
      <div className="big">🗂️</div>
      <strong>{title}</strong>
      {hint && <div className="small muted" style={{ marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

export function ChangeBadge({ value }) {
  const up = Number(value) >= 0;
  return <span className={`change change--${up ? 'up' : 'down'}`}>{up ? '▲' : '▼'} {Math.abs(value)}%</span>;
}

export function Price({ value }) {
  return <span>{fmtPrice(value)}</span>;
}
