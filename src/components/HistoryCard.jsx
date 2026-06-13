import { THEMES } from '../data/themes.js';
import { getItemEmoji } from '../data/item-emojis.js';
import { formatShortDate, formatNumber, sumTokens, permanentImageUrl } from '../lib/format.js';
import { Stat } from './ui.jsx';

/**
 * Card individual do histórico (compacto, com thumbnail).
 * Usa a URL permanente do Google Drive quando disponível.
 */
export function HistoryCard({ item, onDelete }) {
  const tokens = sumTokens(item.usage);
  const date = formatShortDate(item.completedAt);
  const theme = THEMES[item.theme];
  const isPhoto = item.isPhoto === true;
  const emoji = isPhoto ? '📸' : getItemEmoji(item.animal_en, theme?.emoji || '🎨');
  const imgUrl = permanentImageUrl(item);

  return (
    <div className="card fade-in-up" style={{ position: 'relative' }}>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Excluir do histórico"
          aria-label={`Excluir ${item.animal_pt} do histórico`}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--error-bg)';
            e.currentTarget.style.borderColor = 'var(--error-border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }}
        >
          🗑
        </button>
      )}
      {imgUrl && (
        <a href={imgUrl} target="_blank" rel="noreferrer" className="result-image-link">
          <img src={imgUrl} alt={item.animal_pt} className="result-image" loading="lazy" />
        </a>
      )}
      <div style={{ padding: '10px 12px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-xl)', lineHeight: 1 }} aria-hidden="true">
            {emoji}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="result-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.animal_pt}</p>
            <p className="result-subtitle">{item.animal_en}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <Stat label="Tempo" value={`${item.elapsed}s`} />
          <Stat label="Tokens" value={formatNumber(tokens)} />
          <Stat label="Custo" value="$0.03" highlight />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', margin: 0 }}>
            {date}
          </p>
          {isPhoto && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--indigo)', fontWeight: 600 }}>📸 Foto</span>
          )}
          {item.drive_file_id ? (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 600 }} title="Salva permanentemente no Google Drive">
              ☁ Drive
            </span>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)', fontWeight: 600 }} title="URL temporária do Replicate (expira em ~1h)">
              ⏳ Temporária
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
