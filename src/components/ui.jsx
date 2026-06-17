import { useState, useEffect } from 'react';

/* ════════════════════════════════════════════════════════
   BUTTON
   ════════════════════════════════════════════════════════ */

/**
 * Botão base com variantes.
 *
 * variant: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'info'
 */
export function Button({ variant = 'secondary', children, className = '', ...props }) {
  const variantClass = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    accent: 'btn btn-accent',
    success: 'btn btn-secondary btn-success',
    error: 'btn btn-secondary btn-error',
    info: 'btn btn-secondary btn-info',
  }[variant] || 'btn btn-secondary';

  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   BADGE (status pill)
   ════════════════════════════════════════════════════════ */

const STATUS_LABELS = {
  pending: 'Na fila',
  generating: 'Gerando',
  done: 'Concluído',
  error: 'Erro',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   STAT (label: value inline)
   ════════════════════════════════════════════════════════ */

export function Stat({ label, value, highlight }) {
  return (
    <span className="stat">
      <span className="stat-label">{label}:</span>
      <span className={`stat-value ${highlight ? 'stat-value-highlight' : ''}`}>
        {value}
      </span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   SPINNER
   ════════════════════════════════════════════════════════ */

export function Spinner({ large }) {
  return <div className={`spinner ${large ? 'spinner-large' : ''}`} />;
}

/* ════════════════════════════════════════════════════════
   PROGRESS BAR
   ════════════════════════════════════════════════════════ */

export function ProgressBar({ percent, label, color }) {
  return (
    <div className="progress-strip" style={{ background: 'transparent', padding: 0 }}>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            background: color || undefined,
          }}
        />
      </div>
      {label && <span className="progress-label">{label}</span>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SECTION (label header)
   ════════════════════════════════════════════════════════ */

export function SectionGroup({ label, children, hint }) {
  return (
    <div className="section-group">
      <label className="section-group-label">{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   EMPTY STATE
   ════════════════════════════════════════════════════════ */

export function EmptyState({ icon = '📭', message }) {
  return (
    <div className="empty-state fade-in">
      <p className="empty-state-icon">{icon}</p>
      <p className="empty-state-text">{message}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════ */

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type === 'error' ? 'error' : 'success'}`}>
      {toast.message}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ELAPSED TIMER (live counter)
   ════════════════════════════════════════════════════════ */

export function ElapsedTimer({ startTime }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <p
      style={{
        margin: '0 0 4px',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent)',
      }}
    >
      {seconds}s
    </p>
  );
}

/**
 * Banner de jornada: mostra o próximo passo recomendado no topo de uma aba,
 * com um botão que leva direto a ele. Deixa o fluxo óbvio e guiado.
 */
export function JourneyBanner({ icon, text, ctaLabel, onCta, tone = 'accent' }) {
  const bg = tone === 'success' ? '#E8F4EC' : 'var(--accent-bg, #FFF5EC)';
  const fg = tone === 'success' ? 'var(--success)' : 'var(--accent)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      background: bg, border: `1px solid ${fg}33`,
      borderRadius: 'var(--radius-lg)', padding: '12px 16px',
      marginBottom: 'var(--space-5)',
    }}>
      <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">{icon}</span>
      <span style={{ flex: 1, minWidth: 180, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</span>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          style={{
            background: fg, color: '#fff', border: 'none',
            borderRadius: 'var(--radius-md)', padding: '8px 16px',
            fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
