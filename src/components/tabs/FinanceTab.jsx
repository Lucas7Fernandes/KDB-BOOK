import { CONFIG } from '../../data/config.js';
import { SectionGroup } from '../ui.jsx';
import { formatNumber } from '../../lib/format.js';

const SCENARIOS = [1, 5, 10, 16, 50];

const GOALS = [
  { amount: 500,  emoji: '🌱', label: 'Renda extra' },
  { amount: 1000, emoji: '🎯', label: '$1k/mês' },
  { amount: 3000, emoji: '🚀', label: '$3k/mês' },
  { amount: 5000, emoji: '💎', label: 'Full-time' },
];

const COSTS = [
  ['20 imagens FLUX Dev', '$0.60', '$0.03/imagem'],
  ['Claude Haiku', '$0.00', 'tier gratuito'],
  ['Make.com', '$0.00', '20 créditos (1.000/mês free)'],
  ['Google Drive + Gmail', '$0.00', 'tier gratuito'],
  ['Canva (capa + PDF)', '$0.00', 'plano gratuito'],
  ['KDP', '$0.00', 'sem taxa de publicação'],
];

/**
 * Aba Finanças — projeções de receita, royalty, ROI e metas de renda passiva.
 */
export function FinanceTab({
  finPrice,
  setFinPrice,
  finSales,
  setFinSales,
  royalty,
  publishedCount,
}) {
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="two-col-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <SectionGroup
          label="Preço de venda (USD)"
          hint="Faixa ideal: $6.99–$8.99 · KDP paga 60% até $9.99, depois 35%"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input
              type="range"
              min="5.99"
              max="14.99"
              step="0.50"
              value={finPrice}
              onChange={(e) => setFinPrice(parseFloat(e.target.value))}
              className="slider"
              aria-label="Preço de venda"
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                minWidth: 80,
              }}
            >
              ${finPrice.toFixed(2)}
            </span>
          </div>
        </SectionGroup>

        <SectionGroup
          label="Vendas médias / mês / livro"
          hint="Iniciante: 10–30 · Médio: 50–100 · Popular: 200+"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={finSales}
              onChange={(e) => setFinSales(parseInt(e.target.value))}
              className="slider"
              aria-label="Vendas médias mensais"
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                minWidth: 48,
              }}
            >
              {finSales}
            </span>
          </div>
        </SectionGroup>
      </div>

      {/* Top metrics */}
      <div className="three-col-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <MetricCard
          label="Royalty por venda"
          value={`$${royalty.toFixed(2)}`}
          color="var(--success)"
        />
        <MetricCard
          label="Taxa KDP"
          value={finPrice <= 9.99 ? '60%' : '35%'}
          color="var(--accent)"
        />
        <MetricCard
          label="Custo impressão"
          value={`$${CONFIG.PRINT_COST.toFixed(2)}`}
          color="var(--warning)"
        />
      </div>

      {/* Projection table */}
      <SectionGroup label="Projeção por número de livros publicados">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Livros</th>
                <th>Vendas/mês</th>
                <th>Receita/mês</th>
                <th>Receita/ano</th>
                <th>Payback</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((n) => {
                const monthly = n * finSales * royalty;
                const yearly = monthly * 12;
                const isHi = monthly >= 1000;
                const payback = royalty > 0 ? Math.ceil((n * 0.60) / royalty) : 0;
                const isCurrent = n === publishedCount;

                return (
                  <tr key={n} className={isHi ? 'is-highlight' : ''}>
                    <td style={{ color: isHi ? 'var(--success)' : 'var(--text-primary)', fontWeight: isHi ? 700 : 400 }}>
                      {n}
                      {isCurrent && (
                        <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.5 }}>← atual</span>
                      )}
                    </td>
                    <td>{formatNumber(n * finSales)}</td>
                    <td style={{ color: isHi ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                      ${formatNumber(Math.round(monthly))}
                      {isHi && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.5 }}>🎯</span>}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)' }}>
                      ${formatNumber(Math.round(yearly))}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {payback} venda{payback !== 1 ? 's' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionGroup>

      {/* Goals */}
      <SectionGroup label="Metas de renda passiva">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: 10 }}>
          {GOALS.map(({ amount, emoji, label }) => {
            const booksNeeded =
              royalty > 0 && finSales > 0
                ? Math.ceil(amount / (royalty * finSales))
                : null;

            return (
              <div
                key={amount}
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 4 }}>{emoji}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 6 }}>
                  {label} · ${formatNumber(amount)}/mês
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                  }}
                >
                  {booksNeeded ?? '∞'} livros
                </div>
                {booksNeeded && (
                  <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginTop: 3 }}>
                    {booksNeeded} semanas produção
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionGroup>

      {/* Production cost */}
      <SectionGroup label="Custo de produção — 1 livro completo">
        {COSTS.map(([item, cost, note]) => (
          <div
            key={item}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'var(--bg-surface-2)',
              borderRadius: 6,
              marginBottom: 3,
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>{item}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginLeft: 8 }}>
                {note}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-md)',
                color: cost === '$0.00' ? 'var(--success)' : 'var(--warning)',
                fontWeight: 600,
              }}
            >
              {cost}
            </span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderTop: '1px solid var(--border-default)',
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Total investido por livro
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-lg)',
              color: 'var(--accent)',
              fontWeight: 700,
            }}
          >
            $0.60
          </span>
        </div>
      </SectionGroup>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: 'var(--text-disabled)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color,
          marginTop: 6,
        }}
      >
        {value}
      </span>
    </div>
  );
}
