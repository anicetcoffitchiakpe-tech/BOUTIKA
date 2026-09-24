import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@boutika.bj');
  const [password, setPassword] = useState('boutika2026');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-visual">
        <div style={{marginBottom:'auto', display:'flex', alignItems:'center', gap:10, fontSize:'1.2rem', fontWeight:600}}>
          <span style={{width:38, height:38, borderRadius:12, background:'rgba(255,255,255,0.2)', display:'grid', placeItems:'center'}}>B</span>
          Boutika
        </div>
        <h2>Gérez votre boutique<br/>en toute simplicité</h2>
        <p>Tableau de bord en temps réel, suivi des commandes, catalogue produits et paiements Mobile Money centralisés.</p>
      </div>

      <div className="login-form">
        <h1>Bienvenue 👋</h1>
        <p className="lead">Connectez-vous à votre espace d'administration.</p>

        {error && (
          <div style={{background:'#fbe5e2', color:'var(--c-danger)', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:20, fontSize:'0.9rem', fontWeight:500}}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Adresse e-mail</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy} style={{marginTop:8}}>
            {busy ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>

        <div style={{marginTop:28, padding:'18px', background:'var(--c-cream)', borderRadius:'var(--radius-md)', fontSize:'0.85rem', color:'var(--c-text-light)', lineHeight:1.7}}>
          <strong style={{color:'var(--c-text)'}}>🔑 Comptes de démonstration</strong><br/>
          Administrateur : <code style={{background:'white', padding:'2px 6px', borderRadius:4}}>admin@boutika.bj</code> / <code style={{background:'white', padding:'2px 6px', borderRadius:4}}>boutika2026</code><br/>
          Gestionnaire : <code style={{background:'white', padding:'2px 6px', borderRadius:4}}>gestion@boutika.bj</code> / <code style={{background:'white', padding:'2px 6px', borderRadius:4}}>boutika2026</code>
        </div>

        <div style={{marginTop:24, textAlign:'center', fontSize:'0.85rem', color:'var(--c-text-muted)'}}>
          <Link to="/" style={{color:'var(--c-primary)', fontWeight:500}}>← Retour à la boutique</Link>
        </div>
      </div>
    </div>
  );
}
