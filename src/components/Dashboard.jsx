import { THEMES } from '../data/themes.js';
import { formatCurrency } from '../lib/format.js';

/**
 * Dashboard simplificado: 4 métricas essenciais.
 * Removido: Tokens Claude, Make Credits, KDP Progress, Livros publicados.
 */
export function Dashboard({
  balanceInput, setBalanceInput, setInitBalance,
  sessionCost, remaining, doneCount, activeTheme,
}) {
  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];

  return (
    <div className="dashboard">
      <Cell label="Saldo Replicate">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', fontWeight: 600 }}>$</span>
          <input
            type="number"
            value={balanceInput}
            min="0"
            step="0.01"
            className="balance-input"
            aria-label="Saldo Replicate em USD"
            onChange={e => {
              setBalanceInput(e.target.value);
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) setInitBalance(v);
            }}
          />
        </div>
      </Cell>

      <Div />
      <Cell label="Gasto total">
        <Value color={sessionCost > 0 ? 'var(--warning)' : undefined}>
          {formatCurrency(sessionCost)}
        </Value>
      </Cell>

      <Div />
      <Cell label="Saldo restante">
        <Value color={remaining < 0 ? 'var(--error)' : remaining < 1 ? 'var(--warning)' : 'var(--success)'}>
          {formatCurrency(remaining)}
        </Value>
      </Cell>

      <Div />
      <Cell label="Imagens geradas">
        <Value color={doneCount > 0 ? 'var(--text-primary)' : undefined}>
          {doneCount}
        </Value>
      </Cell>

      <Div />
      <Cell label="Tema ativo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>{theme.emoji}</span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            fontWeight: 700,
            color: 'var(--accent)',
          }}>
            {theme.name.split(' ')[0]}
          </span>
        </div>
      </Cell>
    </div>
  );
}

function Cell({ label, children }) {
  return (
    <div className="dashboard-cell">
      <span className="dashboard-label">{label}</span>
      {children}
    </div>
  );
}

function Value({ children, color }) {
  return (
    <span className="dashboard-value" style={{ color }}>
      {children}
    </span>
  );
}

function Div() {
  return <div className="dashboard-divider" />;
}
