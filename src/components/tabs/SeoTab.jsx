import { useMemo } from 'react';
import { SEO_INTEL, GROWTH_STRATEGIES } from '../../data/seo.js';
import { CATEGORIES } from '../../data/categories.js';
import { THEMES } from '../../data/themes.js';
import { SectionGroup } from '../ui.jsx';

/**
 * Aba SEO — inteligência competitiva por categoria, score do título atual
 * e estratégias de crescimento no algoritmo A9 da Amazon.
 */
export function SeoTab({ kdpMeta, activeTheme, showToast }) {
  // ── SEO Score (0-8) baseado no kdpMeta atual ──
  const score = useMemo(() => {
    let s = 0;
    if (kdpMeta.title.length >= 20) s++;
    if (kdpMeta.title.toLowerCase().includes('coloring book')) s++;
    if (kdpMeta.title.match(/ages \d/i)) s++;
    if (kdpMeta.subtitle.length >= 20) s++;
    if (kdpMeta.kw1 && kdpMeta.kw2 && kdpMeta.kw3) s++;
    if (kdpMeta.kw5) s++;
    if (kdpMeta.desc.length >= 700) s++;
    if (kdpMeta.desc.includes('<b>') || kdpMeta.desc.includes('<ul>')) s++;
    return s;
  }, [kdpMeta]);

  const scoreColor =
    score >= 7 ? 'var(--success)' : score >= 4 ? 'var(--accent)' : 'var(--error)';

  const theme = THEMES[activeTheme];

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copiado: ${text}`);
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* ── Top: Score + Resumo ── */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-6)',
          alignItems: 'center',
          marginBottom: 'var(--space-8)',
          flexWrap: 'wrap',
        }}
      >
        <ScoreCircle score={score} color={scoreColor} />
        <div style={{ flex: 1, minWidth: 280 }}>
          <span className="section-label">Score do seu listing atual</span>
          <p
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: scoreColor,
              margin: '6px 0',
            }}
          >
            {score >= 7 ? '🎯 Excelente — pronto para publicar' :
             score >= 4 ? '⚙️ Em construção — revise os campos abaixo' :
             '⚠️ Listing incompleto — vá para a aba KDP'}
          </p>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-tertiary)', margin: 0 }}>
            Os critérios abaixo são derivados dos seus metadados na aba KDP.
            Quanto maior o score, melhor a posição na busca.
          </p>
        </div>
      </div>

      {/* ── Criteria checklist ── */}
      <SectionGroup label="Critérios avaliados">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
          {[
            ['Título ≥ 20 chars', kdpMeta.title.length >= 20],
            ['Título contém "coloring book"', kdpMeta.title.toLowerCase().includes('coloring book')],
            ['Título com faixa etária', !!kdpMeta.title.match(/ages \d/i)],
            ['Subtítulo ≥ 20 chars', kdpMeta.subtitle.length >= 20],
            ['3 keywords principais preenchidas', !!(kdpMeta.kw1 && kdpMeta.kw2 && kdpMeta.kw3)],
            ['5ª keyword (slot único) preenchida', !!kdpMeta.kw5],
            ['Descrição ≥ 700 chars', kdpMeta.desc.length >= 700],
            ['Descrição com HTML (<b>/<ul>)', kdpMeta.desc.includes('<b>') || kdpMeta.desc.includes('<ul>')],
          ].map(([label, ok]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--bg-surface-2)',
                borderRadius: 6,
                border: `1px solid ${ok ? 'var(--success-border)' : 'var(--border-default)'}`,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: ok ? 'var(--success)' : 'transparent',
                  border: `1.5px solid ${ok ? 'var(--success)' : 'var(--text-disabled)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: 'var(--bg-base)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {ok ? '✓' : ''}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  color: ok ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </SectionGroup>

      {/* ── Category intel ── */}
      <SectionGroup label="Inteligência por categoria">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {Object.entries(SEO_INTEL).map(([id, data]) => {
            const cat = CATEGORIES[id];
            const isCurrentCat = theme?.cat === id;

            return (
              <div
                key={id}
                className="card"
                style={{
                  background: 'var(--bg-surface-2)',
                  borderColor: isCurrentCat ? cat.color : 'var(--border-default)',
                }}
              >
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 'var(--text-2xl)' }}>{cat.emoji}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: cat.color }}>{cat.name}</p>
                      {isCurrentCat && (
                        <span style={{ fontSize: 9, color: 'var(--text-disabled)' }}>tema atual</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                    <Pill label="BSR" value={data.bsr} />
                    <Pill label="Buscas" value={data.searches} />
                    <Pill label="Concorrência" value={data.competition} />
                    <Pill label="Preço ideal" value={data.price} />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <span className="section-label">Keywords sugeridas</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {data.keywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => copy(kw)}
                          style={{
                            padding: '3px 8px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-full)',
                            color: cat.color,
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => { e.target.style.background = 'var(--bg-elevated)'; }}
                          onMouseLeave={(e) => { e.target.style.background = 'var(--bg-surface)'; }}
                          title="Clique para copiar"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-tertiary)',
                      lineHeight: 1.6,
                      margin: 0,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    💡 {data.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionGroup>

      {/* ── Growth strategies ── */}
      <SectionGroup label="Estratégias de crescimento orgânico">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {GROWTH_STRATEGIES.map((s) => (
            <div
              key={s.n}
              style={{
                background: 'var(--bg-surface-2)',
                border: `1px solid ${s.color}30`,
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 6,
                }}
              >
                {s.n}
              </div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: 'var(--text-md)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {s.title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.5,
                }}
              >
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </SectionGroup>
    </div>
  );
}

function ScoreCircle({ score, color }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 8);
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} stroke="var(--border-default)" strokeWidth="6" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={r}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-disabled)' }}>/ 8</div>
      </div>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        padding: '6px 10px',
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 9, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}
