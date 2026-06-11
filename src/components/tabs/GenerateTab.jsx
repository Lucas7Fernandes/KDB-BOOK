import { THEMES } from '../../data/themes.js';
import { CONFIG } from '../../data/config.js';
import { getItemEmoji } from '../../data/item-emojis.js';
import { Button } from '../ui.jsx';
import { ResultCard } from '../ResultCard.jsx';

/**
 * Aba "Gerar" — seleção de tema, escolha de itens e disparo de geração paralela.
 */
export function GenerateTab({
  activeTheme,
  switchTheme,
  themeItems,
  selected,
  toggleSelect,
  selectAll,
  selectNone,
  selectTest,
  customEn,
  customPt,
  setCustomEn,
  setCustomPt,
  handleAddCustom,
  generations,
  running,
  handleGenerate,
  progressDone,
  progressTotal,
}) {
  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];
  const generationEntries = Object.entries(generations);
  const selectionCost = (selected.size * CONFIG.COST_PER_IMAGE).toFixed(2);

  return (
    <>
      {/* Theme picker */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div className="section-row">
          <span className="section-label">Tema ativo — {theme.name}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button onClick={selectAll}>Todos</Button>
            <Button onClick={selectNone}>Nenhum</Button>
            <Button onClick={selectTest}>Teste (2)</Button>
          </div>
        </div>
        <div className="theme-pills" role="tablist" aria-label="Selecionar tema">
          {Object.entries(THEMES).map(([id, t]) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTheme === id}
              onClick={() => switchTheme(id)}
              className="theme-pill"
              style={
                activeTheme === id
                  ? {
                      background: 'var(--accent-bg)',
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                      fontWeight: 700,
                    }
                  : {}
              }
            >
              {t.emoji} <span style={{ fontSize: 'var(--text-sm)' }}>{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="chip-grid">
        {themeItems.map((item) => {
          const g = generations[item.en];
          const sel = selected.has(item.en);
          const busy = g?.status === 'generating' || g?.status === 'pending';

          const chipClass = `chip ${sel ? 'is-selected' : ''} ${
            g?.status === 'done' ? 'is-done' :
            g?.status === 'error' ? 'is-error' : ''
          }`;

          return (
            <button
              key={item.en}
              onClick={() => toggleSelect(item.en)}
              className={chipClass}
              aria-pressed={sel}
            >
              <span style={{ fontSize: 'var(--text-2xl)', lineHeight: 1 }} aria-hidden="true">
                {getItemEmoji(item.en, theme.emoji)}
              </span>
              <span className="chip-title">{item.pt}</span>
              <span className="chip-subtitle">{item.en}</span>
              {g?.status === 'done' && (
                <span className="chip-badge" style={{ color: 'var(--success)' }}>✓</span>
              )}
              {g?.status === 'error' && (
                <span className="chip-badge" style={{ color: 'var(--error)' }}>!</span>
              )}
              {busy && (
                <span className="chip-badge spin-slow" style={{ color: 'var(--accent)' }}>
                  ⊙
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom item */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label className="section-label">Item customizado</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <input
            placeholder="Inglês (ex: dolphin)"
            value={customEn}
            onChange={(e) => setCustomEn(e.target.value)}
            className="input"
            style={{ width: 'auto', flex: '1 1 180px' }}
            aria-label="Nome em inglês"
          />
          <input
            placeholder="Português (ex: Golfinho)"
            value={customPt}
            onChange={(e) => setCustomPt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            className="input"
            style={{ width: 'auto', flex: '1 1 180px' }}
            aria-label="Nome em português"
          />
          <Button variant="accent" onClick={handleAddCustom}>+ Gerar agora</Button>
        </div>
      </div>

      {/* Generate button */}
      <div style={{ textAlign: 'center', margin: '0 0 var(--space-8)' }}>
        <button
          className="btn btn-primary"
          disabled={selected.size === 0 || running}
          onClick={handleGenerate}
        >
          {running
            ? `⏳ Gerando... ${progressDone} / ${progressTotal}`
            : `🚀 Gerar ${selected.size} item${selected.size !== 1 ? 's' : ''} · $${selectionCost}`}
        </button>
        {!running && selected.size === themeItems.length && (
          <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Livro completo · ~60s paralelo · $0.60
          </p>
        )}
      </div>

      {/* Results */}
      {generationEntries.length > 0 && (
        <>
          <span className="section-label">Resultados</span>
          <div className="result-grid">
            {generationEntries.map(([en, g]) => (
              <ResultCard
                key={en}
                itemKey={en}
                generation={g}
                themeEmoji={theme.emoji}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
