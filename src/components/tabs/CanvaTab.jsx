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
export function CanvaTab({ activeTheme, history, webhookUrl, kdpMeta, officialCover, setOfficialCover, showToast }) {
  const [loading, setLoading] = useState(false);
  const [cover, setCover] = useState(null);
  const [error, setError] = useState(null);

  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];

  // Título sugerido a partir do kdpMeta ou do nome do tema
  const [titleOnArt, setTitleOnArt] = useState(true);
  const [messy, setMessy] = useState(false);
  const [qty, setQty] = useState(1);
  const [covers, setCovers] = useState([]); // múltiplas versões geradas nesta sessão
  const [progress, setProgress] = useState(null); // { done, total }
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
    const total = qty;
    setProgress(total > 1 ? { done: 0, total } : null);
    showToast(total > 1 ? `Gerando ${total} versões em fila... (~60s cada)` : 'Gerando arte da capa... (~60s)');

    const results = [];
    try {
      // Fila sequencial: uma capa por vez, para não saturar o Replicate
      for (let i = 0; i < total; i++) {
        try {
          const data = await generateCover(
            theme, activeTheme, webhookUrl, undefined,
            titleOnArt ? coverTitle : null,
            messy
          );
          results.push(data);
          setCovers((prev) => [data, ...prev]);
          setCover(data);
        } catch (err) {
          setError(err.message);
          showToast(`Erro na versão ${i + 1}: ${err.message}`, 'error');
        }
        if (total > 1) setProgress({ done: i + 1, total });
      }
      if (results.length > 0) {
        showToast(`✨ ${results.length} capa(s) gerada(s)! Salvas no Google Drive`);
      }
    } finally {
      setLoading(false);
      setProgress(null);
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

            {/* Toggle estilo de pintura */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 700, color: messy ? 'var(--accent)' : 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={messy}
                  onChange={(e) => setMessy(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                🖌️ Pintura "imperfeita de criança" (sai da linha, partes sem pintar)
              </label>
              <p className="hint" style={{ marginTop: 6 }}>
                {messy
                  ? 'Aparência de giz de cera bagunçado: traços visíveis, cor saindo da linha, áreas em branco. Charme autêntico de desenho infantil.'
                  : 'Pintura mais caprichada e uniforme (padrão).'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={doGenerate} disabled={loading}>
                {loading
                  ? (progress ? `⏳ Gerando ${progress.done}/${progress.total}...` : '⏳ Gerando capa...')
                  : `✨ Gerar ${qty > 1 ? `${qty} versões` : 'arte da capa'}`}
              </button>

              {/* Seletor de quantidade */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '2px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '4px 6px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700, paddingLeft: 4 }}>Versões</span>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={loading || qty <= 1}
                  aria-label="Menos versões"
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-base)', cursor: 'pointer', fontWeight: 800, fontSize: 16 }}
                >−</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: 'var(--text-md)' }}>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  disabled={loading || qty >= 10}
                  aria-label="Mais versões"
                  style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-base)', cursor: 'pointer', fontWeight: 800, fontSize: 16 }}
                >+</button>
              </div>

              {latestCover && (
                <a href={latestCover} target="_blank" rel="noreferrer" className="btn btn-accent" style={{ textDecoration: 'none' }}>
                  ⬇ Baixar imagem
                </a>
              )}

              {(cover || savedCovers[0]) && (
                (() => {
                  const current = cover || savedCovers[0];
                  const isOfficial = officialCover && current &&
                    (officialCover.drive_file_id === current.drive_file_id ||
                     officialCover.image_url === current.image_url);
                  return (
                    <button
                      className="btn"
                      onClick={() => {
                        if (isOfficial) {
                          setOfficialCover(null);
                          showToast('Capa oficial removida');
                        } else {
                          setOfficialCover({ ...current, markedAt: new Date().toISOString() });
                          showToast('✓ Definida como capa oficial do livro!');
                        }
                      }}
                      style={{
                        border: `2px solid ${isOfficial ? 'var(--success)' : 'var(--border-default)'}`,
                        background: isOfficial ? '#E8F4EC' : 'var(--bg-base)',
                        color: isOfficial ? 'var(--success)' : 'var(--text-secondary)',
                        fontWeight: 700,
                      }}
                    >
                      {isOfficial ? '✓ Capa oficial do livro' : '📕 Marcar como capa oficial'}
                    </button>
                  );
                })()
              )}
            </div>

            {officialCover && (
              <div style={{ marginTop: 'var(--space-3)', padding: '10px 14px', background: '#E8F4EC', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={permanentImageUrl(officialCover)} alt="Capa oficial" style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-default)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: 'var(--text-sm)', margin: 0 }}>📕 Capa oficial definida</p>
                  <p className="hint" style={{ margin: 0 }}>Esta é a capa do seu livro. Baixe-a e use no upload de capa do KDP.</p>
                </div>
                <a href={permanentImageUrl(officialCover)} target="_blank" rel="noreferrer" className="btn btn-accent" style={{ textDecoration: 'none', fontSize: 'var(--text-sm)' }}>⬇</a>
              </div>
            )}
            {qty > 1 && !loading && (
              <p className="hint" style={{ marginTop: 6 }}>
                Vai gerar {qty} versões diferentes em fila (uma por vez, ~60s cada = ~{Math.ceil(qty * 60 / 60)} min). Custo: ${(qty * 0.03).toFixed(2)}. Escolha a melhor depois.
              </p>
            )}
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

          {/* Galeria de versões geradas nesta sessão */}
          {covers.length > 1 && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 6px' }}>
                {covers.length} versões geradas — clique para abrir e comparar:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 6 }}>
                {covers.map((c, i) => {
                  const url = permanentImageUrl(c);
                  return url ? (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                      <img
                        src={url}
                        alt={`Versão ${covers.length - i}`}
                        style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}
                        loading="lazy"
                      />
                    </a>
                  ) : null;
                })}
              </div>
            </div>
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
