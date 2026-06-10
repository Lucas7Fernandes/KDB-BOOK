import { useState } from 'react';
import { THEMES } from '../../data/themes.js';
import { createCanvaCover } from '../../lib/api.js';
import { exportHistory } from '../../lib/export.js';
import { SectionGroup, Button, EmptyState } from '../ui.jsx';

/**
 * Aba Canva — gera capa profissional via MCP Canva,
 * permite exportar interior do livro (CSV/JSON/HTML print-ready).
 */
export function CanvaTab({ activeTheme, history, showToast }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];
  const themeHistory = history.filter((h) => h.theme === activeTheme);

  const doGenerate = async () => {
    setLoading(true);
    showToast('Gerando capa no Canva...');
    try {
      const r = await createCanvaCover(theme);
      setResult(r);
      showToast(r.url ? 'Capa criada com sucesso!' : 'Resposta recebida — verifique abaixo');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const doExport = (format) => {
    const result = exportHistory(history, activeTheme, format);
    if (result.ok) {
      showToast(`Export ${format.toUpperCase()}: ${result.count} itens`);
    } else {
      showToast('Sem itens no histórico deste tema', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* ── Cover generator ── */}
      <SectionGroup label={`Gerar capa — ${theme.name}`}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            display: 'flex',
            gap: 'var(--space-5)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 64, lineHeight: 1 }}>{theme.emoji}</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {theme.name}: Livro de Colorir Infantil
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              20 itens · público 3–8 anos · estilo Amazon KDP
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={doGenerate}
            disabled={loading}
          >
            {loading ? '⏳ Gerando capa...' : '🎨 Gerar capa no Canva'}
          </button>
        </div>

        {result && (
          <div
            className="fade-in"
            style={{
              marginTop: 12,
              padding: 'var(--space-4)',
              background: 'var(--bg-surface-2)',
              border: `1px solid ${result.url ? 'var(--success-border)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {result.url ? (
              <>
                <p style={{ margin: '0 0 8px', fontSize: 'var(--text-md)', color: 'var(--success)', fontWeight: 600 }}>
                  ✓ Design criado no Canva
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    wordBreak: 'break-all',
                  }}
                >
                  {result.url} ↗
                </a>
              </>
            ) : (
              <pre
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.5,
                }}
              >
                {result.text}
              </pre>
            )}
          </div>
        )}
      </SectionGroup>

      {/* ── Export ── */}
      <SectionGroup label={`Exportar — ${theme.name} (${themeHistory.length} imagens)`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="info" onClick={() => doExport('csv')} disabled={themeHistory.length === 0}>
            📄 CSV
          </Button>
          <Button variant="success" onClick={() => doExport('json')} disabled={themeHistory.length === 0}>
            🔧 JSON
          </Button>
          <Button variant="accent" onClick={() => doExport('html')} disabled={themeHistory.length === 0}>
            🖨 HTML interior (print → PDF)
          </Button>
        </div>
        <p className="hint">
          O HTML interior abre em 8.5×11" pronto para imprimir.
          Use <strong>Ctrl/Cmd + P → Salvar como PDF</strong> para gerar o miolo do livro KDP.
        </p>
      </SectionGroup>

      {/* ── Gallery preview ── */}
      <SectionGroup label="Galeria de imagens deste tema">
        {themeHistory.length === 0 ? (
          <EmptyState message={`Nenhuma imagem gerada para ${theme.name} ainda.`} icon="🎨" />
        ) : (
          <div className="history-grid">
            {themeHistory.slice(0, 12).map((h) => (
              <div key={h.id} className="card">
                <img
                  src={h.image_url}
                  alt={h.animal_pt}
                  className="result-image"
                  loading="lazy"
                />
                <div style={{ padding: '8px 12px' }}>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {h.animal_pt}
                  </p>
                  <p style={{ margin: 0, fontSize: 9, color: 'var(--text-disabled)' }}>
                    {h.animal_en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {themeHistory.length > 12 && (
          <p
            style={{
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginTop: 10,
            }}
          >
            +{themeHistory.length - 12} imagens · veja todas no Histórico
          </p>
        )}
      </SectionGroup>

      {/* ── Pipeline guide ── */}
      <SectionGroup label="Pipeline completo do livro">
        <ol
          style={{
            paddingLeft: 20,
            fontSize: 'var(--text-md)',
            color: 'var(--text-tertiary)',
            lineHeight: 1.9,
          }}
        >
          <li>Gere as 20 imagens do tema na aba <strong>Gerar</strong></li>
          <li>Exporte o HTML interior aqui e converta para PDF (Ctrl+P)</li>
          <li>Clique em <strong>Gerar capa no Canva</strong> e personalize o design</li>
          <li>Exporte a capa no Canva como PDF (KDP-ready)</li>
          <li>Preencha metadados na aba <strong>KDP</strong></li>
          <li>Suba ambos os PDFs no KDP Amazon</li>
        </ol>
      </SectionGroup>
    </div>
  );
}
