import { useMemo, useState } from 'react';
import { THEMES } from '../../data/themes.js';
import { CATEGORY_FILTERS } from '../../data/categories.js';
import { exportHistory } from '../../lib/export.js';
import { syncDrive } from '../../lib/api.js';
import { Button, EmptyState } from '../ui.jsx';
import { HistoryCard } from '../HistoryCard.jsx';

/**
 * Aba Histórico — visualiza todas as imagens já geradas com filtros e export.
 */
export function HistoryTab({
  history,
  kdpMeta,
  webhookUrl,
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

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const files = await syncDrive(webhookUrl);
      const known = new Set(history.map((h) => h.drive_file_id).filter(Boolean));
      const missing = files.filter((f) => !known.has(f.drive_file_id));

      if (missing.length === 0) {
        showToast('Tudo sincronizado — nenhuma imagem nova no Drive');
        return;
      }

      const newEntries = missing.map((f) => ({
        id: `drive-${f.drive_file_id}`,
        animal_en: f.animal_en,
        animal_pt: f.animal_en.charAt(0).toUpperCase() + f.animal_en.slice(1),
        image_url: '',
        drive_file_id: f.drive_file_id,
        usage: null,
        theme: f.theme,
        elapsed: '—',
        completedAt: new Date().toISOString(),
      }));

      setHistory((prev) => [...newEntries, ...prev]);
      showToast(`☁ ${missing.length} imagem(ns) recuperada(s) do Drive!`);
    } catch (err) {
      showToast(`Erro no sync: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const deleteItem = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    showToast('Imagem removida do histórico');
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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button variant="accent" onClick={handleSync} disabled={syncing}>
            {syncing ? '⏳ Sincronizando...' : '☁ Sincronizar do Drive'}
          </Button>
        </div>
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
        <p className="hint" style={{ marginBottom: 'var(--space-3)' }}>
          ☁ Imagens com selo <b style={{ color: 'var(--success)' }}>Drive</b> são permanentes.
          Para elas aparecerem aqui, compartilhe a pasta do Drive uma única vez:
          botão direito na pasta → Compartilhar → "Qualquer pessoa com o link".
        </p>
      )}

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
            <HistoryCard key={item.id} item={item} onDelete={deleteItem} />
          ))}
        </div>
      )}
    </>
  );
}
