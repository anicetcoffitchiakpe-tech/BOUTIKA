import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  return (
    <>
      <div className="pagehead"><h2>Paramètres</h2></div>
      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 22 }}>
          <h3 className="mt-0" style={{ fontSize: 16 }}>Compte</h3>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.firstName} {user?.lastName}</div>
              <div className="small muted">{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge--confirmee">Rôle : {user?.role === 'administrateur' ? 'Administrateur' : 'Gestionnaire'}</span>
            <span className="badge badge--livree">Actif</span>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 className="mt-0" style={{ fontSize: 16 }}>À propos de Boutika</h3>
          <p className="small muted">
            Plateforme d'administration de boutique en ligne développée dans le cadre d'un mémoire de fin de formation
            (Développement Web, IMA 2025-2026). Architecture MERN. Données conçues selon la méthode MERISE.
          </p>
          <div className="small muted" style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            <div><b>Front-end :</b> React (Vite), React Router</div>
            <div><b>Back-end :</b> Node.js, Express.js</div>
            <div><b>Base de données :</b> MongoDB + Mongoose</div>
            <div><b>Authentification :</b> JWT + hachage bcrypt</div>
          </div>
        </div>
      </div>
    </>
  );
}
