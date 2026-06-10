import { THEMES } from '../data/themes.js';
import { formatNumber, formatCurrency } from '../lib/format.js';

/**
 * Barra de estatísticas global da sessão.
 */
export function Dashboard({
  balanceInput,
  setBalanceInput,
  setInitBalance,
  sessionCost,
  remaining,
  doneCount,
  sessionTokens,
  publishedCount,
  totalThemes,
  activeTheme,
  kdpDone,
}) {
  const theme = THEMES[activeTheme] || Object.values(THEMES)[0];

  return (
    <div className="dashboard">
      <DashboardCell label="Saldo Replicate">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>$</span>
          <input
            type="number"
            value={balanceInput}
            min="0"
            step="0.01"
            className="balance-input"
            aria-label="Saldo Replicate em USD"
            onChange={(e) => {
              setBalanceInput(e.target.value);
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) setInitBalance(v);
            }}
          />
        </div>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Gasto sessão">
        <span className="dashboard-value" style={{ color: sessionCost > 0 ? 'var(--warning)' : undefined }}>
          {formatCurrency(sessionCost)}
        </span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Saldo restante">
        <span
          className="dashboard-value"
          style={{
            color:
              remaining < 0 ? 'var(--error)' :
              remaining < 1 ? 'var(--warning)' :
              'var(--success)',
          }}
        >
          {formatCurrency(remaining)}
        </span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Imagens">
        <span className="dashboard-value">{doneCount}</span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Tokens Claude">
        <span className="dashboard-value">{formatNumber(sessionTokens)}</span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Make Credits">
        <span className="dashboard-value">{doneCount}</span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Livros publicados">
        <span
          className="dashboard-value"
          style={{ color: publishedCount > 0 ? 'var(--success)' : undefined }}
        >
          {publishedCount}/{totalThemes}
        </span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="KDP Progress">
        <span
          className="dashboard-value"
          style={{ color: kdpDone === 12 ? 'var(--success)' : undefined }}
        >
          {kdpDone}/12
        </span>
      </DashboardCell>

      <Divider />
      <DashboardCell label="Tema ativo">
        <span
          className="dashboard-value"
          style={{ color: 'var(--accent)', fontSize: 'var(--text-lg)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <span>{theme.emoji}</span>
          <span>{theme.name.split(' ')[0]}</span>
        </span>
      </DashboardCell>
    </div>
  );
}

function DashboardCell({ label, children }) {
  return (
    <div className="dashboard-cell">
      <span className="dashboard-label">{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="dashboard-divider" />;
}
