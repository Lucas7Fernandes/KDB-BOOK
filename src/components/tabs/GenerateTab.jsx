import { THEMES } from '../../data/themes.js';
import { CONFIG } from '../../data/config.js';
import { getItemEmoji } from '../../data/item-emojis.js';
import { ART_STYLES } from '../../data/prompts.js';
import { Button } from '../ui.jsx';
import { ResultCard } from '../ResultCard.jsx';

export function GenerateTab({
  activeTheme, artStyle, setArtStyle, turbo, setTurbo,
  switchTheme, themeItems,
  selected, toggleSelect, selectAll, selectNone, selectTest,
  customEn, setCustomEn, customPt, setCustomPt, handleAddCustom,
  generations, running, handleGenerate, handleRegenerate, clearGenerations,
  progressDone, progressTotal,
}) {
  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];
  const generationEntries = Object.entries(generations);
  const selectionCost = (selected.size * CONFIG.COST_PER_IMAGE).toFixed(2);
  const hasResults = generationEntries.length > 0;

  return (
    <>
      {/* ── 1. Tema ── */}
      <section style={{ marginBottom: 'var(--space-5)' }}>
        <div className="section-row">
          <span className="section-label">Tema — {theme.name}</span>
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
              style={activeTheme === id
                ? { background: 'var(--accent-bg)', borderColor: 'var(--accent)', color: 'var(--accent)', fontWeight: 700 }
                : {}}
            >
              {t.emoji} <span style={{ fontSize: 'var(--text-sm)' }}>{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 2. Estilo ── */}
      <section style={{ marginBottom: 'var(--space-5)' }}>
        <span className="section-label">Estilo</span>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-2)',
          maxWidth: 560,
        }}>
          {Object.entries(ART_STYLES).map(([id, s]) => {
            const active = artStyle === id;
            return (
              <button
                key={id}
                onClick={() => setArtStyle(id)}
                aria-pressed={active}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: active ? 'var(--accent-bg)' : 'var(--bg-base)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  boxShadow: active ? 'var(--accent-glow)' : 'var(--shadow-xs)',
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1 }}>{s.emoji}</span>
                <span>
                  <span style={{ display: 'block', fontSize: 'var(--text-md)', fontWeight: 700, color: active ? 'var(--accent)' : 'var(--text-primary)' }}>
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
      </section>

      {/* ── 3. Grid de itens ── */}
      <div className="chip-grid">
        {themeItems.map(item => {
          const g   = generations[`${item.en}::${artStyle}`];
          const sel = selected.has(item.en);
          const busy = g?.status === 'generating' || g?.status === 'pending';
          return (
            <button
              key={item.en}
              onClick={() => toggleSelect(item.en)}
              className={`chip ${sel ? 'is-selected' : ''} ${g?.status === 'done' ? 'is-done' : g?.status === 'error' ? 'is-error' : ''}`}
              aria-pressed={sel}
            >
              <span style={{ fontSize: 'var(--text-2xl)', lineHeight: 1 }} aria-hidden="true">
                {getItemEmoji(item.en, theme.emoji)}
              </span>
              <span className="chip-title">{item.pt}</span>
              <span className="chip-subtitle">{item.en}</span>
              {g?.status === 'done'  && <span className="chip-badge" style={{ color: 'var(--success)' }}>✓</span>}
              {g?.status === 'error' && <span className="chip-badge" style={{ color: 'var(--error)' }}>!</span>}
              {busy                  && <span className="chip-badge spin-slow" style={{ color: 'var(--accent)' }}>⊙</span>}
            </button>
          );
        })}
      </div>

      {/* ── 4. Item customizado ── */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <span className="section-label">Item customizado</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <input placeholder="Inglês (ex: dolphin)"    value={customEn} onChange={e => setCustomEn(e.target.value)} className="input" style={{ flex: '1 1 160px' }} />
          <input placeholder="Português (ex: Golfinho)" value={customPt} onChange={e => setCustomPt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustom()} className="input" style={{ flex: '1 1 160px' }} />
          <Button variant="accent" onClick={handleAddCustom}>+ Gerar agora</Button>
        </div>
      </section>

      {/* ── 5. Botão gerar ── */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <button className="btn btn-primary" disabled={selected.size === 0} onClick={handleGenerate}>
          {selected.size > 0
            ? `${running ? '➕ Adicionar à fila:' : '🚀 Gerar'} ${selected.size} item${selected.size !== 1 ? 's' : ''} · $${selectionCost}`
            : running
              ? `⏳ Gerando… ${progressDone} / ${progressTotal}`
              : '🚀 Selecione itens acima'}
        </button>

        {running && selected.size === 0 && (
          <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Fila em andamento: {progressDone}/{progressTotal} — selecione mais para enfileirar
          </p>
        )}

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', color: turbo ? 'var(--accent)' : 'var(--text-muted)', fontWeight: turbo ? 700 : 500 }}>
            <input type="checkbox" checked={turbo} onChange={e => setTurbo(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }} />
            ⚡ Modo Turbo — paralelo total (saldo ≥ $5 no Replicate)
          </label>
          {!running && selected.size > 0 && (
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {turbo
                ? 'Tempo estimado: ~60s'
                : `Fila segura: ~${Math.ceil(((selected.size - 1) * 11 + 60) / 60)} min para ${selected.size} item${selected.size !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>

      {/* ── 6. Resultados ── */}
      {hasResults && (
        <>
          <div className="section-row">
            <span className="section-label">Resultados — {generationEntries.length} item{generationEntries.length !== 1 ? 's' : ''}</span>
            <Button onClick={clearGenerations} variant="error">🗑 Limpar</Button>
          </div>
          <div className="result-grid">
            {generationEntries.map(([key, g]) => (
              <ResultCard
                key={key}
                itemKey={key}
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
