import { useState } from 'react';
import { KDP_STEPS } from '../../data/kdp-steps.js';
import { THEMES } from '../../data/themes.js';
import { Button, SectionGroup } from '../ui.jsx';
import { generateDescription } from '../../lib/api.js';

/**
 * Aba KDP — checklist visual de 12 passos para publicação + formulário
 * de metadados com botão "Gerar com IA" para a descrição.
 */
export function KdpTab({
  kdpCheck,
  setKdpCheck,
  kdpMeta,
  setKdpMeta,
  activeTheme,
  showToast,
}) {
  const [openTip, setOpenTip] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  const doneCount = Object.values(kdpCheck).filter(Boolean).length;
  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];

  const toggleStep = (id) => setKdpCheck({ ...kdpCheck, [id]: !kdpCheck[id] });
  const updateMeta = (field, value) => setKdpMeta({ ...kdpMeta, [field]: value });

  const generateDesc = async () => {
    setGenLoading(true);
    showToast('Gerando descrição com IA...');
    try {
      const desc = await generateDescription(theme, kdpMeta);
      setKdpMeta({ ...kdpMeta, desc });
      showToast('Descrição gerada com sucesso!');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="kdp-tab-grid">
      {/* ── Left column: checklist ── */}
      <div>
        <div className="section-row">
          <span className="section-label">Checklist KDP</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-md)',
              color: doneCount === 12 ? 'var(--success)' : 'var(--accent)',
              fontWeight: 700,
            }}
          >
            {doneCount}/12
          </span>
        </div>

        <div className="progress-track" style={{ marginBottom: 'var(--space-4)' }}>
          <div
            className="progress-fill"
            style={{ width: `${(doneCount / 12) * 100}%` }}
          />
        </div>

        {KDP_STEPS.map((step) => {
          const isDone = kdpCheck[step.id];
          const showTip = openTip === step.id;

          return (
            <div key={step.id} className={`kdp-step ${isDone ? 'is-done' : ''}`}>
              <div className="kdp-step-row">
                <div
                  className={`kdp-check ${isDone ? 'is-done' : ''}`}
                  onClick={() => toggleStep(step.id)}
                  role="checkbox"
                  aria-checked={isDone}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && toggleStep(step.id)}
                >
                  {isDone && <span className="kdp-check-mark">✓</span>}
                </div>
                <span
                  className="kdp-step-label"
                  onClick={() => toggleStep(step.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {step.label}
                </span>
                <button
                  className="kdp-step-tip-toggle"
                  onClick={() => setOpenTip(showTip ? null : step.id)}
                  aria-label={`${showTip ? 'Fechar' : 'Abrir'} dica`}
                  aria-expanded={showTip}
                >
                  {showTip ? '−' : '?'}
                </button>
              </div>
              {showTip && <div className="kdp-step-tip">{step.tip}</div>}
            </div>
          );
        })}
      </div>

      {/* ── Right column: metadata form ── */}
      <div>
        <span className="section-label">Metadados do livro</span>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-disabled)',
            margin: '4px 0 var(--space-4)',
          }}
        >
          Pré-preencha para acelerar o upload no KDP
        </p>

        <SectionGroup label="Título (max 200 chars)">
          <input
            placeholder="Jungle Animals Coloring Book for Kids"
            value={kdpMeta.title}
            onChange={(e) => updateMeta('title', e.target.value)}
            className="input"
            maxLength={200}
          />
          <div className="hint-row">
            <span style={{ fontSize: 9, color: 'var(--text-disabled)' }}>
              {kdpMeta.title.length}/200
            </span>
          </div>
        </SectionGroup>

        <SectionGroup label="Subtítulo">
          <input
            placeholder="20 Original Designs for Children Ages 4–8"
            value={kdpMeta.subtitle}
            onChange={(e) => updateMeta('subtitle', e.target.value)}
            className="input"
          />
        </SectionGroup>

        <SectionGroup label="7 keywords de busca">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <input
              key={n}
              placeholder={`Keyword ${n}`}
              value={kdpMeta[`kw${n}`]}
              onChange={(e) => updateMeta(`kw${n}`, e.target.value)}
              className="input"
              style={{ marginBottom: 6 }}
            />
          ))}
        </SectionGroup>

        <SectionGroup label="2 categorias">
          <input
            placeholder="Categoria principal"
            value={kdpMeta.cat1}
            onChange={(e) => updateMeta('cat1', e.target.value)}
            className="input"
            style={{ marginBottom: 6 }}
          />
          <input
            placeholder="Categoria secundária"
            value={kdpMeta.cat2}
            onChange={(e) => updateMeta('cat2', e.target.value)}
            className="input"
          />
        </SectionGroup>

        <SectionGroup label="Preço de venda (USD)">
          <input
            type="number"
            min="0.99"
            step="0.01"
            placeholder="7.99"
            value={kdpMeta.price}
            onChange={(e) => updateMeta('price', e.target.value)}
            className="input input-mono"
            style={{ width: 120 }}
          />
        </SectionGroup>

        <SectionGroup label="Descrição HTML (700+ chars)">
          <textarea
            placeholder="<b>O melhor livro de colorir para crianças...</b>"
            value={kdpMeta.desc}
            onChange={(e) => updateMeta('desc', e.target.value)}
            className="textarea input-mono"
            rows={8}
          />
          <div className="hint-row">
            <Button
              variant="accent"
              onClick={generateDesc}
              disabled={genLoading}
            >
              {genLoading ? '⏳ Gerando...' : '🤖 Gerar com IA'}
            </Button>
            <span
              style={{
                fontSize: 9,
                color:
                  kdpMeta.desc.length < 700
                    ? 'var(--warning)'
                    : 'var(--success)',
              }}
            >
              {kdpMeta.desc.length} chars · ideal 700+
            </span>
          </div>
        </SectionGroup>
      </div>
    </div>
  );
}
