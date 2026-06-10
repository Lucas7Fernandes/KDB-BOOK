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
