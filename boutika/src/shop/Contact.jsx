export default function Contact() {
  return (
    <div className="shop-container" style={{ maxWidth: 720, paddingTop: 40 }}>
      <h2 style={{ marginTop: 0 }}>Contactez-nous</h2>
      <p className="muted">Une question sur une commande ou un produit ? Écrivez-nous ou passez à la boutique.</p>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="grid-2" style={{ gap: 16 }}>
            <div><div style={{ fontSize: 22 }}>📍</div><b>Adresse</b><p className="small muted" style={{ margin: '4px 0 0' }}>Cotonou, Bénin</p></div>
            <div><div style={{ fontSize: 22 }}>📞</div><b>Téléphone</b><p className="small muted" style={{ margin: '4px 0 0' }}>+229 01 23 45 67</p></div>
          </div>
          <div><div style={{ fontSize: 22 }}>✉️</div><b>E-mail</b><p className="small muted" style={{ margin: '4px 0 0' }}>contact@boutika.bj</p></div>
          <div><div style={{ fontSize: 22 }}>🕒</div><b>Horaires</b><p className="small muted" style={{ margin: '4px 0 0' }}>Lun–Sam : 8h–19h</p></div>
        </div>
      </div>
    </div>
  );
}
