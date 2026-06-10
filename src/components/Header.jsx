/**
 * Header da aplicação com brand + navegação principal.
 */
export function Header({ tab, setTab, historyCount, kdpDone }) {
  const tabs = [
    ['gerar', '🖼', 'Gerar'],
    ['catalogo', '📦', 'Catálogo'],
    ['financas', '📊', 'Finanças'],
    ['kdp', '🚀', `KDP${kdpDone > 0 ? ` ${kdpDone}/12` : ''}`],
    ['seo', '🔍', 'SEO'],
    ['canva', '📐', 'Canva'],
    ['history', '📂', `Histórico${historyCount > 0 ? ` (${historyCount})` : ''}`],
    ['config', '⚙', 'Config'],
  ];

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">🎨</span>
        <div>
          <h1 className="header-title">KDP Colorbook Generator</h1>
          <p className="header-subtitle">
            16 temas · 320+ itens · Pipeline completo Amazon KDP
          </p>
        </div>
      </div>
      <nav className="nav" role="tablist">
        {tabs.map(([key, icon, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`nav-item ${tab === key ? 'is-active' : ''}`}
          >
            <span aria-hidden="true">{icon}</span> {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
