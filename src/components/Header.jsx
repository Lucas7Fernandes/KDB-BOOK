/**
 * Header sticky com brand + nav em scroll horizontal (mobile-friendly).
 * 9 abas organizadas em grupos visuais com separadores.
 */
export function Header({ tab, setTab, historyCount, kdpDone }) {
  const groups = [
    [
      ['gerar',    '🖼', 'Gerar'],
      ['foto',     '📸', 'Foto'],
      ['canva',    '🎨', 'Capa'],
    ],
    [
      ['kdp',      '🚀', kdpDone > 0 ? `KDP ${kdpDone}/12` : 'KDP'],
      ['seo',      '🔍', 'SEO'],
      ['catalogo', '📦', 'Catálogo'],
      ['financas', '📊', 'Finanças'],
    ],
    [
      ['history', '📂', historyCount > 0 ? `Histórico (${historyCount})` : 'Histórico'],
      ['config',  '⚙',  'Config'],
    ],
  ];

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">🎨</span>
        <div>
          <h1 className="header-title">KDP Colorbook Generator</h1>
          <p className="header-subtitle">17 temas · 340+ itens · Pipeline completo Amazon KDP</p>
        </div>
      </div>

      <nav className="nav" role="tablist" aria-label="Navegação principal">
        {groups.map((group, gi) => (
          <span key={gi} style={{ display: 'contents' }}>
            {gi > 0 && (
              <span
                aria-hidden="true"
                style={{
                  width: 1,
                  background: 'var(--border-default)',
                  margin: '4px 2px',
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
            )}
            {group.map(([key, icon, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`nav-item ${tab === key ? 'is-active' : ''}`}
              >
                <span aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </span>
        ))}
      </nav>
    </header>
  );
}
