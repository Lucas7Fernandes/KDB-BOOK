import { useMemo } from 'react';
import { THEMES } from '../../data/themes.js';
import { CATEGORY_FILTERS } from '../../data/categories.js';
import { exportHistory } from '../../lib/export.js';
import { Button, EmptyState } from '../ui.jsx';
import { HistoryCard } from '../HistoryCard.jsx';

/**
 * Aba Histórico — visualiza todas as imagens já geradas com filtros e export.
 */
export function HistoryTab({
  history,
  kdpMeta,
  setHistory,
  historyFilter,
  setHistoryFilter,
  showToast,
}) {
  const filterOptions = useMemo(
    () => [['all', 'Todos', '📦'], ...Object.entries(THEMES).map(([id, t]) => [id, t.name.split(' ').slice(-1)[0], t.emoji])],
    []
  );

  const filtered =
    historyFilter === 'all'
      ? history
      : history.filter((h) => h.theme === historyFilter);

  const doExport = (format) => {
    const result = exportHistory(history, historyFilter, format, kdpMeta || {});
    if (result.ok) {
      showToast(`Export ${format.toUpperCase()}: ${result.count} itens`);
    } else {
      showToast('Sem itens no histórico', 'error');
    }
  };

  const clearAll = () => {
    if (window.confirm('Apagar todo o histórico? Esta ação não pode ser desfeita.')) {
      setHistory([]);
      showToast('Histórico apagado');
    }
  };

  return (
    <>
      <div className="section-row">
        <span className="section-label">
          Histórico · {history.length} imagens totais · {filtered.length} filtradas
        </span>
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button variant="info" onClick={() => doExport('csv')}>📄 CSV</Button>
            <Button variant="success" onClick={() => doExport('json')}>🔧 JSON</Button>
            <Button variant="accent" onClick={() => doExport('html')}>🖨 HTML interior</Button>
            <Button variant="error" onClick={clearAll}>🗑 Limpar</Button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            marginBottom: 'var(--space-4)',
            paddingBottom: 'var(--space-2)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {filterOptions.map(([id, label, emoji]) => (
            <button
              key={id}
              onClick={() => setHistoryFilter(id)}
              className={`nav-item ${historyFilter === id ? 'is-active' : ''}`}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          message={
            history.length === 0
              ? 'Nenhuma imagem gerada ainda. Vá em "Gerar" para começar.'
              : 'Nenhuma imagem deste tema. Tente outro filtro.'
          }
          icon="📂"
        />
      ) : (
        <div className="history-grid">
          {filtered.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
