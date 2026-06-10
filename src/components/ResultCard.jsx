import { CONFIG } from '../data/config.js';
import { formatNumber, sumTokens } from '../lib/format.js';
import { StatusBadge, Stat, Spinner, ElapsedTimer } from './ui.jsx';

/**
 * Card individual de resultado de geração de imagem.
 * Exibe estados: pending, generating, done, error.
 */
export function ResultCard({ itemKey, generation, themeEmoji }) {
  const tokens = generation.usage ? sumTokens(generation.usage) : null;
  const cost = generation.usage?.replicate?.cost_usd ?? CONFIG.COST_PER_IMAGE;

  const cardClass = `card fade-in-up ${
    generation.status === 'done' ? 'card-success' :
    generation.status === 'error' ? 'card-error' : ''
  }`;

  return (
    <div className={cardClass}>
      <div className="card-header">
        <span style={{ fontSize: 'var(--text-2xl)' }} aria-hidden="true">
          {themeEmoji}
        </span>
        <div style={{ flex: 1 }}>
          <p className="result-title">{generation.animal_pt || itemKey}</p>
          <p className="result-subtitle">{itemKey}</p>
        </div>
        <StatusBadge status={generation.status} />
      </div>

      {(generation.status === 'pending' || generation.status === 'generating') && (
        <div className="result-loading">
          <Spinner />
          {generation.status === 'generating' && generation.startTime && (
            <ElapsedTimer startTime={generation.startTime} />
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', margin: '8px 0 0' }}>
            {generation.status === 'pending'
              ? 'Aguardando na fila...'
              : 'Gerando via Make.com + FLUX Dev'}
          </p>
          {generation.status === 'generating' && (
            <p style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              ~50–60 segundos por imagem
            </p>
          )}
        </div>
      )}

      {generation.status === 'error' && (
        <div className="result-error">{generation.error}</div>
      )}

      {generation.status === 'done' && generation.image_url && (
        <>
          <a
            href={generation.image_url}
            target="_blank"
            rel="noreferrer"
            className="result-image-link"
            aria-label={`Abrir imagem de ${generation.animal_pt} em nova aba`}
          >
            <img
              src={generation.image_url}
              alt={generation.animal_pt}
              className="result-image"
              loading="lazy"
            />
          </a>
          <div className="card-footer">
            {generation.elapsed && <Stat label="Tempo" value={`${generation.elapsed}s`} />}
            {tokens !== null && <Stat label="Tokens" value={formatNumber(tokens)} />}
            <Stat label="Custo" value={`$${cost.toFixed(2)}`} highlight />
            <a
              href={generation.image_url}
              target="_blank"
              rel="noreferrer"
              style={{
                marginLeft: 'auto',
                fontSize: 'var(--text-base)',
                color: 'var(--accent)',
                fontWeight: 600,
              }}
            >
              ↗ Abrir
            </a>
          </div>
        </>
      )}
    </div>
  );
}
