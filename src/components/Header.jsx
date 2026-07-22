export default function Header({ view, setView, total, onNew }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark">ARCHIVO</span>
          <span className="brand-title">Fichero de Cine</span>
          {total != null && <span className="brand-count">· {total} fichas</span>}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="nav">
            <button
              className={'nav-btn' + (view === 'catalogo' ? ' active' : '')}
              onClick={() => setView('catalogo')}
            >
              Catálogo
            </button>
            <button
              className={'nav-btn' + (view === 'listados' ? ' active' : '')}
              onClick={() => setView('listados')}
            >
              Listados
            </button>
          </div>
          <button className="btn-primary" onClick={onNew}>+ Nueva ficha</button>
        </div>
      </div>
    </div>
  )
}
