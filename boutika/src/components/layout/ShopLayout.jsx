import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

// Icônes
const Icon = ({p, c}) => (
  <svg className="i" viewBox="0 0 24 24" style={c?{color:c}:{}}>
    {p === 'dashboard' && <><path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/></>}
    {p === 'cart' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></>}
    {p === 'user' && <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
    {p === 'menu' && <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
  </svg>
);

const SocialIcon = ({d}) => (
  <a href="#" aria-label="social">
    <svg className="i-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d={d}/>
    </svg>
  </a>
);

export default function ShopLayout() {
  const { count } = useCart();
  return (
    <div className="shop-layout">
      <div className="announcement-bar">
        <span>Livraison gratuite dès 15 000 FCFA sur Cotonou</span>
        <span className="sep">·</span>
        <span>Paiement Mobile Money sécurisé</span>
        <span className="sep">·</span>
        <span>Retours gratuits sous 7 jours</span>
      </div>

      <header className="shop-header">
        <div className="shop-nav">
          <Link to="/" className="logo">
            <span className="logo-mark">B</span>
            <span className="logo-text">Boutika</span>
          </Link>

          <nav className="nav-links">
            <NavLink to="/" end>Boutique</NavLink>
            <NavLink to="/cart">Panier{count>0 && <span className="cart-badge" style={{position:'static',marginLeft:8,transform:'scale(0.9)'}}>{count}</span>}</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="nav-actions">
            <Link to="/admin" className="nav-icon" title="Espace professionnel">
              <svg className="i" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="14" width="7" height="7"/></svg>
            </Link>
            <Link to="/cart" className="nav-icon" title="Panier">
              <svg className="i" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>
              {count>0 && <span className="cart-badge">{count}</span>}
            </Link>
          </div>
        </div>
      </header>

      <main className="shop-main"><Outlet /></main>

      <footer className="shop-footer">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{color:'#fff',marginBottom:8}}>
              <span className="logo-mark" style={{fontSize:'1.1rem'}}>B</span>
              <span style={{background:'linear-gradient(135deg,#f0b097,#d4a752)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Boutika</span>
            </div>
            <p>Votre boutique en ligne d'articles et d'artisanat béninois — vêtements, chaussures, accessoires et pièces authentiques faites main.</p>
          </div>
          <div>
            <h4>Boutique</h4>
            <a href="#catalogue">Nouveautés</a>
            <a href="#catalogue">Vêtements</a>
            <a href="#catalogue">Chaussures</a>
            <a href="#catalogue">Accessoires</a>
            <a href="#catalogue">Artisanat</a>
          </div>
          <div>
            <h4>Service client</h4>
            <Link to="/contact">Contact</Link>
            <a href="#">Livraison</a>
            <a href="#">Retours</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h4>Professionnel</h4>
            <Link to="/admin">Espace admin</Link>
            <Link to="/admin">Tableau de bord</Link>
            <Link to="/admin">Gestion commandes</Link>
          </div>
          <div>
            <h4>Restez informé</h4>
            <p style={{fontSize:'0.85rem',opacity:0.7, marginBottom:0}}>Inscrivez-vous à notre newsletter pour recevoir nos nouveautés.</p>
            <div className="newsletter">
              <input type="email" placeholder="Votre adresse e-mail"/>
              <button>OK</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Boutika · Conçu au Bénin · Mémoire de fin de formation Développement Web IMA</div>
          <div className="footer-social">
            <SocialIcon d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v7A10 10 0 0022 12z"/>
            <SocialIcon d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 8v1a10.66 10.66 0 01-8-4s-4 9 5 13a11.6 11.6 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.1-.8A7.7 7.7 0 0023 3z"/>
            <SocialIcon d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4a3.3 3.3 0 01-1.4-.9 3.3 3.3 0 01-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.3a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 10.7a4.2 4.2 0 110-8.4 4.2 4.2 0 010 8.4zm6.7-11a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </div>
        </div>
      </footer>
    </div>
  );
}
