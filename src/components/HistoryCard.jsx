import { THEMES } from '../data/themes.js';
import { getItemEmoji } from '../data/item-emojis.js';
import { formatShortDate, formatNumber, sumTokens } from '../lib/format.js';
import { Stat } from './ui.jsx';

/**
 * Card individual do histórico (compacto, com thumbnail).
 */
export function HistoryCard({ item }) {
  const tokens = sumTokens(item.usage);
  const date = formatShortDate(item.completedAt);
  const theme = THEMES[item.theme];
  const emoji = getItemEmoji(item.animal_en, theme?.emoji || '🎨');

  return (
    <div className="card fade-in-up">
      {item.image_url && (
        <a
          href={item.image_url}
          target="_blank"
          rel="noreferrer"
          className="result-image-link"
        >
          <img
            src={item.image_url}
            alt={item.animal_pt}
            className="result-image"
            loading="lazy"
          />
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
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginTop: 7 }}>
          {date}
        </p>
      </div>
    </div>
  );
}
