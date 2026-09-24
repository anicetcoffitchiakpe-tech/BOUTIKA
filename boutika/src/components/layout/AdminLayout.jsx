import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Icônes SVG admin
const DashIcon = <svg className="i" viewBox="0 0 24 24"><path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/></svg>;
const OrderIcon = <svg className="i" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16l3-3 3 3 3-3 3 3V8z"/><path d="M8 13h8M8 9h6"/></svg>;
const ProdIcon = <svg className="i" viewBox="0 0 24 24"><path d="M16.5 9.4L7.5 4.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.3 7l8.7 5 8.7-5M12 22V12"/></svg>;
const CatIcon = <svg className="i" viewBox="0 0 24 24"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2 12V2h10l8.6 8.6a2 2 0 010 2.8z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>;
const ClientIcon = <svg className="i" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></svg>;
const SettingsIcon = <svg className="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 8a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8-.3 1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8 1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
const ShopIcon = <svg className="i" viewBox="0 0 24 24"><path d="M3 9l2-5h14l2 5M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M8 13h8"/></svg>;
const LogoutIcon = <svg className="i" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;

const MENU = [
  { section: 'PRINCIPAL' },
  { to: '/admin', label: 'Tableau de bord', icon: DashIcon, end: true },
  { to: '/admin/orders', label: 'Commandes', icon: OrderIcon },
  { section: 'CATALOGUE' },
  { to: '/admin/products', label: 'Produits', icon: ProdIcon },
  { to: '/admin/categories', label: 'Catégories', icon: CatIcon },
  { to: '/admin/clients', label: 'Clients', icon: ClientIcon },
  { section: 'SYSTÈME' },
  { to: '/admin/settings', label: 'Paramètres', icon: SettingsIcon },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loader" style={{marginTop:100}}></div>;
  if (!user) return <Navigate to="/login" state={{from:location}} replace/>;

  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`;
  const roleLabel = user?.role==='administrateur' ? 'Administrateur' : 'Gestionnaire';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-mark">B</span>
          Boutika
        </div>
        <nav className="admin-nav">
          {MENU.map((m,i) => m.section ? (
            <div className="admin-nav-sec" key={`s${i}`}>{m.section}</div>
          ) : (
            <NavLink key={m.to} to={m.to} end={m.end}>
              {m.icon}
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-foot">
          <Link to="/">
            {ShopIcon} Voir la boutique
          </Link>
          <a href="#" onClick={e=>{e.preventDefault();logout();}}>
            {LogoutIcon} Déconnexion
          </a>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{getTitle(location.pathname)}</h1>
          <div className="admin-user">
            <div>
              <strong>{user?.firstName} {user?.lastName}</strong>
              <span>{roleLabel}</span>
            </div>
            <div className="admin-avatar">{initials}</div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

function getTitle(p) {
  if (p==='/admin'||p.endsWith('/admin')) return 'Tableau de bord';
  if (p.includes('/products')) return 'Produits';
  if (p.includes('/categories')) return 'Catégories';
  if (p.includes('/orders')) return 'Commandes';
  if (p.includes('/clients')) return 'Clients';
  if (p.includes('/settings')) return 'Paramètres';
  return 'Administration';
}
