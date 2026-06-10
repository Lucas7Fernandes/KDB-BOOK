import { useState } from 'react';
import { THEMES } from '../../data/themes.js';
import { CATEGORIES, CATEGORY_FILTERS } from '../../data/categories.js';
import { Button } from '../ui.jsx';

const STATUS_MAP = {
  planejado: { label: 'Planejado',     color: 'var(--text-muted)' },
  producao:  { label: 'Em produção',   color: 'var(--accent)' },
  gerado:    { label: 'Imagens ✓',     color: 'var(--info)' },
  revisao:   { label: 'Revisão',       color: '#C084FC' },
  publicado: { label: 'Publicado',     color: 'var(--success)' },
};

const STATUS_FLOW = ['planejado', 'producao', 'gerado', 'revisao', 'publicado'];

/**
 * Aba Catálogo — visualiza todos os 16 temas, filtra por categoria,
 * e exibe o status do livro (planejado → publicado).
 */
export function CatalogTab({
  history,
  bookStatus,
  setBookStatus,
  switchTheme,
  setTab,
  catFilter,
  setCatFilter,
}) {
  const [detail, setDetail] = useState(null);

  const historyByTheme = Object.fromEntries(
    Object.keys(THEMES).map((id) => [id, history.filter((h) => h.theme === id).length])
  );

  const filteredIds =
    catFilter === 'all'
      ? Object.keys(THEMES)
      : CATEGORIES[catFilter]?.themeIds || [];

  // ── Detail view (when clicking on a book card) ──
  if (detail) {
    return <DetailView themeId={detail} bookStatus={bookStatus} setBookStatus={setBookStatus}
      switchTheme={switchTheme} setTab={setTab} setDetail={setDetail} />;
  }

  // ── List view ──
  return (
    <>
      <div className="section-row" style={{ marginBottom: 'var(--space-3)' }}>
        <span className="section-label">
          Catálogo · {Object.keys(THEMES).length} livros ·{' '}
          {Object.values(THEMES).reduce((s, t) => s + t.items.length, 0)} itens
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {CATEGORY_FILTERS.map(([id, label, emoji]) => (
          <button
            key={id}
            onClick={() => setCatFilter(id)}
            className={`nav-item ${catFilter === id ? 'is-active' : ''}`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      <div className="book-grid">
        {filteredIds.map((id) => {
          const theme = THEMES[id];
          const status = STATUS_MAP[bookStatus[id] || 'planejado'];
          const genCount = historyByTheme[id] || 0;
          const percent = Math.min(100, Math.round((genCount / theme.items.length) * 100));

          return (
            <div
              key={id}
              onClick={() => setDetail(id)}
              className="card fade-in-up"
              style={{ borderColor: `${theme.color}30`, cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setDetail(id)}
            >
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 'var(--text-3xl)' }} aria-hidden="true">{theme.emoji}</span>
                  <div>
                    <p className="result-title">{theme.name}</p>
                    <p className="result-subtitle">
                      {theme.items.length} itens · {genCount} gerados
                    </p>
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    color: status.color,
                    background: `${status.color}18`,
                    borderColor: `${status.color}40`,
                  }}
                >
                  {status.label}
                </span>
              </div>
              <div style={{ padding: '0 var(--space-4) var(--space-3)' }}>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ background: theme.color, width: `${percent}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>
                    {percent}% gerado
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)' }}>
                    Custo: $0.60
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category summary cards */}
      <div className="four-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {Object.entries(CATEGORIES).map(([id, cat]) => {
          const published = cat.themeIds.filter((t) => bookStatus[t] === 'publicado').length;
          return (
            <div
              key={id}
              style={{
                background: 'var(--bg-surface-2)',
                border: `1px solid ${cat.color}30`,
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 4 }}>{cat.emoji}</div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {cat.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {cat.themeIds.length} livros · {published} publicados
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** View detalhada de um tema individual */
function DetailView({ themeId, bookStatus, setBookStatus, switchTheme, setTab, setDetail }) {
  const theme = THEMES[themeId];
  const status = STATUS_MAP[bookStatus[themeId] || 'planejado'];

  const goGenerate = () => {
    switchTheme(themeId);
    setTab('gerar');
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Button onClick={() => setDetail(null)}>← Voltar</Button>
        <span style={{ fontSize: 'var(--text-3xl)' }}>{theme.emoji}</span>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{theme.name}</h2>
        <span className="badge" style={{
          color: status.color,
          background: `${status.color}18`,
          borderColor: `${status.color}40`,
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 20 }}>
        {theme.items.map((item, i) => (
          <div
            key={item.en}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', minWidth: 18 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {item.pt}
              </p>
              <p style={{ margin: 0, fontSize: 9, color: 'var(--text-disabled)' }}>{item.en}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={goGenerate}>
          🖼  Gerar este tema
        </button>
        {STATUS_FLOW.slice(1).map((s) => (
          <Button
            key={s}
            onClick={() => setBookStatus({ ...bookStatus, [themeId]: s })}
            style={{
              color: STATUS_MAP[s].color,
              borderColor: `${STATUS_MAP[s].color}40`,
            }}
          >
            → {STATUS_MAP[s].label}
          </Button>
        ))}
      </div>
    </div>
  );
}
