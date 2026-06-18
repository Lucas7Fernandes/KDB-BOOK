import { THEMES } from '../data/themes.js';
import { getItemEmoji } from '../data/item-emojis.js';
import { formatShortDate, permanentImageUrl } from '../lib/format.js';

/**
 * Card individual do histórico (compacto, com thumbnail).
 * Ações: favoritar (⭐), incluir no livro (✓), excluir (🗑).
 */
export function HistoryCard({ item, onDelete, onToggleFavorite, onToggleInBook, onRename }) {
  const isUntitled = !item.animal_pt || /^untitled$/i.test(item.animal_pt) || /^untitled$/i.test(item.animal_en || '');
  const date = formatShortDate(item.completedAt);
  const theme = THEMES[item.theme];
  const isPhoto = item.isPhoto === true;
  const emoji = isPhoto ? '📸' : getItemEmoji(item.animal_en, theme?.emoji || '🎨');
  const imgUrl = permanentImageUrl(item);

  const circleBtn = (extra = {}) => ({
    width: 30, height: 30, borderRadius: '50%',
    background: 'rgba(255,255,255,0.94)', border: '1px solid var(--border-default)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-fast)', ...extra,
  });

  return (
    <div
      className="card fade-in-up"
      style={{
        position: 'relative',
        outline: item.inBook ? '3px solid var(--success)' : 'none',
        outlineOffset: -1,
      }}
    >
      {item.inBook && (
        <span style={{
          position: 'absolute', top: 8, left: 8, zIndex: 2,
          background: 'var(--success)', color: 'white', fontWeight: 800,
          fontSize: 'var(--text-xs)', padding: '3px 9px', borderRadius: 999,
          boxShadow: 'var(--shadow-sm)',
        }}>
          ✓ No livro
        </span>
      )}

      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', gap: 6 }}>
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
            title={item.favorite ? 'Desfavoritar' : 'Favoritar'}
            aria-label="Favoritar"
            style={circleBtn(item.favorite ? { background: '#FFF6E6', borderColor: '#F2B33D' } : {})}
          >
            {item.favorite ? '⭐' : '☆'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            title="Excluir (também do Drive)"
            aria-label="Excluir"
            style={circleBtn()}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--error-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.94)'; }}
          >
            🗑
          </button>
        )}
      </div>

      {imgUrl && (
        <a href={imgUrl} target="_blank" rel="noreferrer" className="result-image-link">
          <img src={imgUrl} alt={item.animal_pt} className="result-image" loading="lazy" />
        </a>
      )}

      <div style={{ padding: '10px 12px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 'var(--text-xl)', lineHeight: 1 }} aria-hidden="true">{emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {onRename ? (
              <input
                defaultValue={isUntitled ? '' : item.animal_pt}
                placeholder={isUntitled ? '✏️ Digite o nome' : item.animal_pt}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== item.animal_pt) onRename(item, v);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                className="result-title"
                style={{
                  width: '100%', border: 'none', background: 'transparent',
                  borderBottom: isUntitled ? '2px solid var(--error)' : '1px solid transparent',
                  outline: 'none', padding: '1px 0', font: 'inherit',
                  color: isUntitled ? 'var(--error)' : 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderBottomColor = 'var(--accent)'; }}
              />
            ) : (
              <p className="result-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.animal_pt}</p>
            )}
            <p className="result-subtitle">{item.animal_en}</p>
          </div>
        </div>

        {onToggleInBook && (
          <button
            onClick={() => onToggleInBook(item.id)}
            style={{
              width: '100%', padding: '7px 10px', marginBottom: 8,
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontWeight: 700, fontSize: 'var(--text-sm)',
              border: `2px solid ${item.inBook ? 'var(--success)' : 'var(--border-default)'}`,
              background: item.inBook ? '#E8F4EC' : 'var(--bg-base)',
              color: item.inBook ? 'var(--success)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {item.inBook ? '✓ Incluída no livro' : '+ Incluir no livro'}
          </button>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', margin: 0 }}>{date}</p>
          {isPhoto && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--indigo)', fontWeight: 600 }}>📸 Foto</span>}
          {item.drive_file_id ? (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 600 }} title="Permanente no Google Drive">☁ Drive</span>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)', fontWeight: 600 }} title="URL temporária (expira ~1h)">⏳ Temp</span>
          )}
        </div>
      </div>
    </div>
  );
}
