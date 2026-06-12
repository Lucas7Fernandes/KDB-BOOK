import { THEMES } from '../../data/themes.js';
import { CONFIG } from '../../data/config.js';
import { getItemEmoji } from '../../data/item-emojis.js';
import { ART_STYLES } from '../../data/prompts.js';
import { Button } from '../ui.jsx';
import { ResultCard } from '../ResultCard.jsx';

/**
 * Aba "Gerar" — seleção de tema, escolha de itens e disparo de geração paralela.
 */
export function GenerateTab({
  activeTheme,
  artStyle,
  setArtStyle,
  turbo,
  setTurbo,
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
  handleRegenerate,
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


      {/* Style selector */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <label className="section-label">Estilo do desenho</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            maxWidth: 640,
          }}
        >
          {Object.entries(ART_STYLES).map(([id, s]) => {
            const active = artStyle === id;
            return (
              <button
                key={id}
                onClick={() => setArtStyle(id)}
                aria-pressed={active}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: active ? 'var(--accent-bg)' : 'var(--bg-base)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  boxShadow: active ? 'var(--accent-glow)' : 'var(--shadow-xs)',
                }}
              >
                <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden="true">{s.emoji}</span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 'var(--text-md)',
                      fontWeight: 700,
                      color: active ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    {s.name}
                  </span>
                  <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {s.description}
                  </span>
                </span>
              </button>
            );
          })}
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
          disabled={selected.size === 0}
          onClick={handleGenerate}
        >
          {selected.size > 0
            ? `${running ? '➕ Adicionar à fila:' : '🚀 Gerar'} ${selected.size} item${selected.size !== 1 ? 's' : ''} · $${selectionCost}`
            : running
              ? `⏳ Gerando... ${progressDone} / ${progressTotal}`
              : `🚀 Selecione itens para gerar`}
        </button>
        {running && selected.size === 0 && (
          <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            ⏳ Fila em andamento: {progressDone} / {progressTotal} — selecione mais itens para enfileirar
          </p>
        )}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              color: turbo ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: turbo ? 700 : 500,
            }}
          >
            <input
              type="checkbox"
              checked={turbo}
              onChange={(e) => setTurbo(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            ⚡ Modo Turbo — tudo em paralelo (requer saldo ≥ $5 no Replicate)
          </label>
          {!running && selected.size > 0 && (
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {turbo
                ? `Tempo estimado: ~60s (paralelo total)`
                : `Fila segura (6/min): ~${Math.ceil(((selected.size - 1) * 11 + 60) / 60)} min para ${selected.size} item${selected.size !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
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
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
