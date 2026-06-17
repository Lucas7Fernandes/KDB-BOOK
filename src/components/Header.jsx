import { useState } from 'react';

/**
 * Header com jornada LINEAR de publicação (1→4) + secundários.
 * O fluxo principal fica numerado e óbvio; extras ficam no menu "Mais".
 */
export function Header({ tab, setTab, historyCount, kdpDone, inBookCount = 0, hasCover = false }) {
  const [moreOpen, setMoreOpen] = useState(false);

  // Etapas concluídas (para mostrar ✓ verde)
  const done = {
    gerar:   historyCount > 0,
    history: inBookCount > 0,
    canva:   hasCover,
    kdp:     kdpDone >= 12,
  };

  const journey = [
    ['gerar',   '1', '🖼', 'Criar'],
    ['history', '2', '📚', historyCount > 0 ? `Biblioteca (${historyCount})` : 'Biblioteca'],
    ['canva',   '3', '🎨', 'Capa'],
    ['kdp',     '4', '🚀', kdpDone > 0 ? `Publicar ${kdpDone}/12` : 'Publicar'],
  ];

  const secondary = [
    ['guia', '📖', 'Guia'],
  ];

  const more = [
    ['foto',     '📸', 'Foto → Colorir'],
    ['seo',      '🔍', 'SEO & Keywords'],
    ['catalogo', '📦', 'Catálogo de livros'],
    ['financas', '📊', 'Finanças & ROI'],
    ['config',   '⚙',  'Configurações'],
  ];

  const pick = (key) => { setTab(key); setMoreOpen(false); };
  const moreActive = more.some(([k]) => k === tab);

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo" aria-hidden="true">🎨</span>
        <div>
          <h1 className="header-title">Colorbook Studio</h1>
          <p className="header-subtitle">Do desenho à Amazon KDP</p>
        </div>
      </div>

      <nav className="nav" role="tablist" aria-label="Jornada de publicacao">
        {journey.map(([key, num, icon, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => pick(key)}
            className={`nav-item nav-journey ${tab === key ? 'is-active' : ''} ${done[key] ? 'is-done' : ''}`}
          >
            <span className="nav-step" aria-hidden="true">{done[key] && tab !== key ? '✓' : num}</span>
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        <span className="nav-divider" aria-hidden="true" />

        {secondary.map(([key, icon, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => pick(key)}
            className={`nav-item ${tab === key ? 'is-active' : ''}`}
          >
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={`nav-item ${moreActive ? 'is-active' : ''}`}
            aria-haspopup="true"
            aria-expanded={moreOpen}
          >
            <span aria-hidden="true">⋯</span>
            <span>Mais</span>
          </button>
          {moreOpen && (
            <>
              <div
                onClick={() => setMoreOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                aria-hidden="true"
              />
              <div className="more-menu">
                {more.map(([key, icon, label]) => (
                  <button
                    key={key}
                    onClick={() => pick(key)}
                    className={`more-item ${tab === key ? 'is-active' : ''}`}
                  >
                    <span aria-hidden="true" style={{ width: 22, textAlign: 'center' }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
