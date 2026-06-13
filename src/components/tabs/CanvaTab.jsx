import { useState } from 'react';
import { THEMES } from '../../data/themes.js';
import { getItemEmoji } from '../../data/item-emojis.js';
import { generateCover } from '../../lib/api.js';
import { exportHistory } from '../../lib/export.js';
import { permanentImageUrl } from '../../lib/format.js';
import { SectionGroup, Button, EmptyState, Spinner } from '../ui.jsx';

/**
 * Aba Capa — gera arte de capa colorida e fofa via FLUX (mesmo pipeline),
 * com fluxo guiado para finalizar o título no Canva.
 */
export function CanvaTab({ activeTheme, history, webhookUrl, kdpMeta, showToast }) {
  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState(null);
  const [error, setError] = useState(null);

  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];

  // Título sugerido a partir do kdpMeta ou do nome do tema
  const [titleOnArt, setTitleOnArt] = useState(true);
  const [coverTitle, setCoverTitle] = useState(
    (kdpMeta && kdpMeta.title && kdpMeta.title.trim()) || `${theme.name} Coloring Book`
  );

  const themeHistory = history.filter(
    (h) => h.theme === activeTheme && !h.animal_en.endsWith('-book-cover')
  );
  const savedCovers = history.filter(
    (h) => h.theme === activeTheme && h.animal_en.endsWith('-book-cover')
  );

  const doGenerate = async () => {
    setLoading(true);
    setError(null);
    showToast('Gerando arte da capa... (~60s)');
    try {
      const data = await generateCover(
        theme, activeTheme, webhookUrl, undefined,
        titleOnArt ? coverTitle : null
      );
      setCover(data);
      showToast('✨ Capa gerada! Salva também no seu Google Drive');
    } catch (err) {
      setError(err.message);
      showToast(`Erro: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const doExport = (format) => {
    const result = exportHistory(themeHistory, activeTheme, format, kdpMeta || {});
    if (result.ok) showToast(`Export ${format.toUpperCase()}: ${result.count} itens`);
    else showToast('Sem itens no histórico deste tema', 'error');
  };

  const latestCover = (cover && permanentImageUrl(cover)) || (savedCovers[0] && permanentImageUrl(savedCovers[0]));

  return (
    <div style={{ maxWidth: 960 }}>
      {/* ── Hero: gerador de capa ── */}
      <div
        className="card"
        style={{
          marginBottom: 'var(--space-8)',
          background: 'linear-gradient(135deg, var(--bg-soft) 0%, var(--bg-base) 60%)',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: latestCover ? '1fr 280px' : '1fr',
            gap: 'var(--space-6)',
            padding: 'var(--space-6)',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                margin: '0 0 var(--space-2)',
              }}
            >
              Capa do livro · colorida & fofa
            </p>
            <h2 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-2xl)' }}>
              {theme.emoji} {theme.name}: Livro de Colorir
            </h2>
            <p style={{ margin: '0 0 var(--space-4)', color: 'var(--text-tertiary)', fontSize: 'var(--text-md)', lineHeight: 1.6 }}>
              Arte vibrante com os personagens do tema <b>coloridos em estilo giz de cera</b>,
              como se uma criança tivesse pintado — bem chamativa para a prateleira.
              Salva automaticamente no Google Drive. Custo: <b style={{ color: 'var(--accent)' }}>$0.03</b>
            </p>

            {/* Controles de título */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 700, color: titleOnArt ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                <input
                  type="checkbox"
                  checked={titleOnArt}
                  onChange={(e) => setTitleOnArt(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                🖍️ Escrever o título na arte (estilo giz de cera colorido)
              </label>
              {titleOnArt && (
                <input
                  type="text"
                  value={coverTitle}
                  onChange={(e) => setCoverTitle(e.target.value)}
                  placeholder="Ex: Baby Safari Animals"
                  className="input"
                  style={{ width: '100%' }}
                />
              )}
              <p className="hint" style={{ marginTop: 6 }}>
                {titleOnArt
                  ? 'O FLUX desenha o título em letras de giz de cera coloridas. Dica: títulos curtos saem melhor. Você pode refinar no Canva depois.'
                  : 'A capa virá com espaço livre no topo para você adicionar o título no Canva.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={doGenerate} disabled={loading}>
                {loading ? '⏳ Gerando capa...' : '✨ Gerar arte da capa'}
              </button>
              {latestCover && (
                <a
                  href={latestCover}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent"
                  style={{ textDecoration: 'none' }}
                >
                  ⬇ Baixar imagem
                </a>
              )}
            </div>
            {error && (
              <p style={{ marginTop: 'var(--space-3)', color: 'var(--error)', fontSize: 'var(--text-sm)' }}>
                {error}
              </p>
            )}
          </div>

          {loading && !latestCover && (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <Spinner large />
            </div>
          )}

          {latestCover && (
            <a href={latestCover} target="_blank" rel="noreferrer" className="result-image-link">
              <img
                src={latestCover}
                alt={`Capa — ${theme.name}`}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-default)',
                }}
                loading="lazy"
              />
            </a>
          )}
        </div>
      </div>

      {/* ── Finalizar no Canva ── */}
      <SectionGroup label="Finalizar capa no Canva (adicionar título)">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          {[
            ['1', 'Baixe a arte', 'Clique em "Baixar imagem" acima e salve o JPG'],
            ['2', 'Abra o template KDP', 'No Canva, busque "KDP book cover 8.5x11" (templates prontos e gratuitos)'],
            ['3', 'Insira a arte + título', 'Arraste a imagem, adicione o título no espaço do topo com fonte infantil (ex: Quicksand Bold)'],
            ['4', 'Exporte em PDF', 'Download → PDF Print (300 DPI) → pronto para o KDP!'],
          ].map(([n, title, desc]) => (
            <div
              key={n}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {n}
              </div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 'var(--text-md)' }}>{title}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
        <p className="hint" style={{ marginTop: 'var(--space-3)' }}>
          🔗 Atalho:{' '}
          <a href="https://www.canva.com/search/templates?q=kdp%20book%20cover" target="_blank" rel="noreferrer">
            canva.com → templates KDP book cover
          </a>
        </p>
      </SectionGroup>

      {/* ── Export interior ── */}
      <SectionGroup label={`Exportar interior — ${theme.name} (${themeHistory.length} imagens)`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="accent" onClick={() => doExport('html')} disabled={themeHistory.length === 0}>
            🖨 HTML interior (print → PDF)
          </Button>
          <Button variant="info" onClick={() => doExport('csv')} disabled={themeHistory.length === 0}>
            📄 CSV
          </Button>
          <Button variant="success" onClick={() => doExport('json')} disabled={themeHistory.length === 0}>
            🔧 JSON
          </Button>
        </div>
        <p className="hint">
          O HTML abre em 8.5×11" pronto para imprimir. <b>Ctrl/Cmd + P → Salvar como PDF</b> gera o miolo do livro.
        </p>
      </SectionGroup>

      {/* ── Galeria ── */}
      <SectionGroup label="Imagens do interior deste tema">
        {themeHistory.length === 0 ? (
          <EmptyState message={`Nenhuma imagem gerada para ${theme.name} ainda. Vá na aba Gerar!`} icon="🎨" />
        ) : (
          <div className="history-grid">
            {themeHistory.slice(0, 12).map((h) => (
              <div key={h.id} className="card">
                <img src={permanentImageUrl(h)} alt={h.animal_pt} className="result-image" loading="lazy" />
                <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 'var(--text-lg)', lineHeight: 1 }} aria-hidden="true">
                    {getItemEmoji(h.animal_en, theme.emoji)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.animal_pt}
                    </p>
                    <p style={{ margin: 0, fontSize: 9, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>
                      {h.animal_en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionGroup>
    </div>
  );
}
