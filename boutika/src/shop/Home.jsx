import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtPrice } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

// ==== Icônes SVG (style cohérent, stroke 1.8-2px) ====
const I = {
  sparkle: <svg className="i" viewBox="0 0 24 24"><path d="M12 2l2 7h7l-6 4 2 8-5-4-5 4 2-8-6-4h7z"/></svg>,
  arrow: <svg className="i" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  truck: <svg className="i-lg" viewBox="0 0 24 24"><rect x="1" y="6" width="13" height="11" rx="1"/><path d="M14 9h4l3 3v5h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>,
  phone: <svg className="i-lg" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0122 16.9z"/></svg>,
  lock: <svg className="i-lg" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  return: <svg className="i-lg" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>,
  star: <svg className="i-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{color:'var(--gold-light)'}}><path d="M12 2l3 7h7l-6 4 2 8-6-4-6 4 2-8-6-4h7z"/></svg>,
  starEmpty: <svg className="i-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{color:'var(--warm-deep)'}}><path d="M12 2l3 7h7l-6 4 2 8-6-4-6 4 2-8-6-4h7z"/></svg>,
  heart: <svg className="i-sm" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 000-7.9z"/></svg>,
  heartOn: <svg className="i-sm" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{color:'var(--danger)'}}><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 000-7.9z"/></svg>,
  plus: <svg className="i-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  eye: <svg className="i-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  check: <svg className="i" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
  package: <svg className="i" viewBox="0 0 24 24"><path d="M16.5 9.4L7.5 4.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.3 7l8.7 5 8.7-5M12 22V12"/></svg>,
  award: <svg className="i" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5L17 22l-5-3-5 3 1.5-8.5"/></svg>,
  bike: <svg className="i" viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h4l-3 9-5-6L8 12"/><path d="M12 6l-2 6h5"/></svg>,
  chat: <svg className="i" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  cart: <svg className="i" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>,
};

const CATEGORY_IMG = {
  'Vêtements': '/uploads/vetements-5.jpg',
  'Chaussures': '/uploads/chaussures-1.jpg',
  'Accessoires': '/uploads/accessoires-1.jpg',
  'Artisanat': '/uploads/artisanat-3.jpg',
};
const CATEGORY_DESC = {
  'Vêtements': 'Prêt-à-porter & wax',
  'Chaussures': 'Cuir & baskets',
  'Accessoires': 'Sacs, montres',
  'Artisanat': 'Pièces faites main',
};

function Stars({rating}) {
  const full = Math.round(rating);
  return (
    <span className="stars">
      {Array.from({length:5}).map((_,i)=>(
        i<full ? <span key={i} style={{display:'inline-block'}}>{I.star}</span> : <span key={i} style={{display:'inline-block', opacity:0.3}}>{I.star}</span>
      ))}
    </span>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [toast, setToast] = useState('');
  const [wish, setWish] = useState({});
  const { addItem } = useCart();

  useEffect(() => { api('/api/categories').then(setCategories).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (search) params.set('search', search);
    params.set('status','published'); params.set('limit','24');
    api(`/api/products?${params.toString()}`)
      .then(d => {
        let items = d.items || [];
        if (sort === 'price-asc') items = [...items].sort((a,b)=>a.price-b.price);
        if (sort === 'price-desc') items = [...items].sort((a,b)=>b.price-a.price);
        setProducts(items);
      })
      .catch(()=>setProducts([]))
      .finally(()=>setLoading(false));
  }, [cat, search, sort]);

  const handleAdd = p => { addItem(p,1); setToast(`"${p.name}" a ete ajoute au panier`); setTimeout(()=>setToast(''),2800); };
  const toggleWish = id => setWish(w => ({...w, [id]: !w[id]}));

  const feat1 = products.find(p => (p.categoryName||p.category?.name)==='Vêtements')?.images?.[0];
  const feat2 = products.find(p => (p.categoryName||p.category?.name)==='Accessoires')?.images?.[0];
  const feat3 = products.find(p => (p.categoryName||p.category?.name)==='Artisanat')?.images?.[0];
  const feat4 = products.find(p => (p.categoryName||p.category?.name)==='Chaussures')?.images?.[0];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          {feat1 && <img src={feat1} alt="" className="hero-bg-img"/>}
          <div className="hero-orb-a"></div>
          <div className="hero-orb-b"></div>
        </div>
        <div className="hero-content">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot">{I.sparkle}</span>
            Collection 2026 · Artisanat béninois
          </span>
          <h1>
            L'élégance <span className="it">authentique</span>,<br/>
            <span className="gold">à votre portée</span>
          </h1>
          <p className="hero-desc">
            Vêtements, chaussures, accessoires et pièces d'artisanat soigneusement
            sélectionnés auprès d'artisans du pays. Paiement Mobile Money sécurisé et
            livraison rapide à Cotonou.
          </p>
          <div className="hero-cta">
            <a href="#catalogue" className="btn btn-primary btn-lg btn-shine">
              Découvrir la collection
              {I.arrow}
            </a>
            <Link to="/contact" className="btn btn-secondary btn-lg">Nous contacter</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stats-item"><strong>21+</strong><span>Articles</span></div>
            <div className="hero-stats-item"><strong>100%</strong><span>Artisanat</span></div>
            <div className="hero-stats-item"><strong>24h</strong><span>Livraison Cotonou</span></div>
          </div>
        </div>

        {feat2 && (
          <div className="hero-float hero-float-1">
            <div className="hero-float-ic b">{I.truck}</div>
            <div>
              <div className="hero-float-t">Livraison rapide</div>
              <div className="hero-float-s">En moins de 24h</div>
            </div>
          </div>
        )}
        <div className="hero-float hero-float-2">
          <div className="hero-float-ic b">{I.lock}</div>
          <div>
            <div className="hero-float-t">Paiement sécurisé</div>
            <div className="hero-float-s">MTN · Moov · Carte</div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <div className="trust-bar">
        <div className="trust-item">
          <div className="trust-ic">{I.truck}</div>
          <div><strong>Livraison 24h</strong><span>Cotonou & environs</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-ic">{I.phone}</div>
          <div><strong>Paiement Mobile</strong><span>MTN MoMo · Moov Money</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-ic">{I.lock}</div>
          <div><strong>Paiement sécurisé</strong><span>Transactions chiffrées</span></div>
        </div>
        <div className="trust-item">
          <div className="trust-ic">{I.return}</div>
          <div><strong>Retours 7 jours</strong><span>Satisfait ou remboursé</span></div>
        </div>
      </div>

      {/* ===== CATÉGORIES ===== */}
      <div className="section-header" id="catalogue">
        <div>
          <span className="uppercase-label">Explorer</span>
          <h2>Parcourez par univers</h2>
        </div>
      </div>
      <div className="categories-grid">
        <div className={`cat-card ${!cat ? 'active' : ''}`} onClick={()=>setCat('')}>
          {feat4 && <img src={feat4} alt="Toute la boutique"/>}
          <div className="cat-overlay">
            <h3>Toute la boutique</h3>
            <span>{products.length || '21'} articles</span>
            <div className="cat-arrow">{I.arrow}</div>
          </div>
        </div>
        {categories.map(c => (
          <div key={c._id} className={`cat-card ${cat===c._id?'active':''}`} onClick={()=>setCat(c._id)}>
            <img src={CATEGORY_IMG[c.name] || '/uploads/accessoires-3.jpg'} alt={c.name}/>
            <div className="cat-overlay">
              <h3>{c.name}</h3>
              <span>{CATEGORY_DESC[c.name] || `${c.productCount||0} articles`}</span>
              <div className="cat-arrow">{I.arrow}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PRODUITS ===== */}
      <div className="section-header">
        <div>
          <span className="uppercase-label">Notre sélection</span>
          <h2>{cat ? categories.find(c=>c._id===cat)?.name : 'Coups de cœur du moment'}</h2>
        </div>
        <a href="#catalogue" className="section-link" onClick={()=>{setCat('');setSearch('');}}>
          Voir tout {I.arrow}
        </a>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Rechercher un article..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="filter-select" value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="">Trier par</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>

      {loading ? <div className="loader"></div> : products.length===0 ? (
        <div className="empty">
          <div className="empty-ic">
            <svg className="i" viewBox="0 0 24 24" style={{width:'4rem',height:'4rem'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h3>Aucun article trouvé</h3>
          <p>Essayez une autre recherche ou catégorie.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => {
            const isLow = p.stock<=5 && p.stock>0;
            const isOut = p.stock<=0;
            const isNew = (p._id % 5 === 0);
            const rating = (4.2 + ((p.price||0) % 13)/10).toFixed(1);
            const reviews = 12 + (p.price % 37);
            return (
              <div className="p-card" key={p._id}>
                <Link to={`/product/${p._id}`} className="p-media">
                  <img src={p.images?.[0]||''} alt={p.name}/>
                  {isNew && !isOut && <span className="badge badge-new">Nouveauté</span>}
                  {isLow && <span className="badge badge-low">Stock limité</span>}
                </Link>
                <button className={`p-wish ${wish[p._id]?'active':''}`} onClick={()=>toggleWish(p._id)} title="Favoris">
                  {wish[p._id] ? I.heartOn : I.heart}
                </button>
                <div className="p-actions">
                  <button className="p-add" disabled={isOut} onClick={()=>handleAdd(p)}>
                    {I.cart} Ajouter
                  </button>
                  <Link to={`/product/${p._id}`} className="p-quick" title="Voir le produit">{I.eye}</Link>
                </div>
                <div className="p-body">
                  <div className="p-cat">{p.categoryName || p.category?.name || 'Article'}</div>
                  <Link to={`/product/${p._id}`} className="p-name">{p.name}</Link>
                  <div className="p-rating">
                    <Stars rating={rating}/>
                    <span>({reviews})</span>
                  </div>
                  <div className="p-foot">
                    <div className="p-price">{fmtPrice(p.price)} <small>FCFA</small></div>
                    {!isOut && (
                      <span className={`p-stock ${isLow?'low':'ok'}`}>
                        <span className="dot"></span>
                        {isLow ? `${p.stock} restants` : 'En stock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== PROMO BANNER ===== */}
      <section className="promo">
        <div>
          <span className="promo-tag">Offre limitée</span>
          <h2>-20% sur <em>l'artisanat</em><br/>cette semaine</h2>
          <p>Découvrez notre sélection de pièces faites main par des artisans locaux. Chaque création raconte une histoire unique et soutient le savoir-faire béninois.</p>
          <Link to="/" className="btn btn-primary btn-lg btn-shine">
            Profiter de l'offre {I.arrow}
          </Link>
        </div>
        <div className="promo-imgs">
          {feat3 && <img src={feat3} alt=""/>}
          {feat1 && <img src={feat1} alt=""/>}
        </div>
      </section>

      {/* ===== POURQUOI NOUS ===== */}
      <section className="why">
        <div className="section-header">
          <div>
            <span className="uppercase-label">Pourquoi Boutika</span>
            <h2>Une expérience d'achat pensée pour vous</h2>
          </div>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-ic">{I.award}</div>
            <h4>Qualité garantie</h4>
            <p>Chaque article est rigoureusement sélectionné pour sa qualité et son authenticité.</p>
          </div>
          <div className="why-card">
            <div className="why-ic">{I.phone}</div>
            <h4>Paiement facile</h4>
            <p>MTN Mobile Money, Moov Money ou carte bancaire : choisissez votre méthode préférée.</p>
          </div>
          <div className="why-card">
            <div className="why-ic">{I.bike}</div>
            <h4>Livraison rapide</h4>
            <p>Vos articles livrés chez vous à Cotonou en moins de 24 heures après commande.</p>
          </div>
          <div className="why-card">
            <div className="why-ic">{I.chat}</div>
            <h4>Service client</h4>
            <p>Une équipe à votre écoute 7 jours sur 7 pour répondre à toutes vos questions.</p>
          </div>
        </div>
      </section>

      {toast && <div className="toast ok">{I.check} {toast}</div>}
    </div>
  );
}
