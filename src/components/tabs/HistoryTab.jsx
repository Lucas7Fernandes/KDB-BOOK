import { useMemo, useState } from 'react';
import { THEMES } from '../../data/themes.js';
import { exportHistory } from '../../lib/export.js';
import { syncDrive, deleteDriveFile } from '../../lib/api.js';
import { Button, EmptyState } from '../ui.jsx';
import { HistoryCard } from '../HistoryCard.jsx';

/**
 * Aba Histórico — visualiza imagens geradas, com favoritos, seleção
 * para o livro, exclusão (inclui Drive) e export.
 */
export function HistoryTab({
  history, kdpMeta, webhookUrl, setHistory,
  historyFilter, setHistoryFilter,
  toggleFavorite, toggleInBook, showToast,
}) {
  const [syncing, setSyncing] = useState(false);

  const favCount  = history.filter((h) => h.favorite).length;
  const bookCount = history.filter((h) => h.inBook).length;

  const filterOptions = useMemo(() => [
    ['all', 'Todos', '📦'],
    ['fav', 'Favoritos', '⭐'],
    ['book', 'No livro', '✓'],
    ...Object.entries(THEMES).map(([id, t]) => [id, t.name.split(' ').slice(-1)[0], t.emoji]),
  ], []);

  const filtered =
    historyFilter === 'all'  ? history :
    historyFilter === 'fav'  ? history.filter((h) => h.favorite) :
    historyFilter === 'book' ? history.filter((h) => h.inBook) :
    history.filter((h) => h.theme === historyFilter);

  const doExport = (format) => {
    // Se houver imagens marcadas "no livro", exporta só elas; senão, usa o filtro atual.
    const source = bookCount > 0 ? history.filter((h) => h.inBook) : filtered;
    const result = exportHistory(source, 'all', format, kdpMeta || {});
    if (result.ok) {
      const scope = bookCount > 0 ? `${bookCount} selecionadas p/ o livro` : `${result.count} itens`;
      showToast(`Export ${format.toUpperCase()}: ${scope}`);
    } else {
      showToast('Sem itens para exportar', 'error');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const files = await syncDrive(webhookUrl);
      const known = new Set(history.map((h) => h.drive_file_id).filter(Boolean));
      const missing = files.filter((f) => !known.has(f.drive_file_id));
      if (missing.length === 0) {
        showToast('Tudo sincronizado — nada novo no Drive');
        return;
      }
      const newEntries = missing.map((f) => ({
        id: `drive-${f.drive_file_id}`,
        animal_en: f.animal_en,
        animal_pt: f.animal_en.charAt(0).toUpperCase() + f.animal_en.slice(1),
        image_url: '', drive_file_id: f.drive_file_id, usage: null,
        theme: f.theme, elapsed: '—', completedAt: new Date().toISOString(),
      }));
      setHistory((prev) => [...newEntries, ...prev]);
      showToast(`☁ ${missing.length} imagem(ns) recuperada(s)!`);
    } catch (err) {
      showToast(`Erro no sync: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Exclui do histórico E do Google Drive
  const deleteItem = async (item) => {
    setHistory((prev) => prev.filter((h) => h.id !== item.id));
    if (item.drive_file_id) {
      try {
        await deleteDriveFile(webhookUrl, item.drive_file_id);
        showToast('Imagem excluída do portal e do Drive');
      } catch {
        showToast('Removida do portal (falha ao excluir no Drive)', 'error');
      }
    } else {
      showToast('Imagem removida do histórico');
    }
  };

  const clearAll = () => {
    if (window.confirm('Apagar todo o histórico do portal? (Os arquivos no Drive não são afetados.)')) {
      setHistory([]);
      showToast('Histórico apagado');
    }
  };

  return (
    <>
      <div className="section-row">
        <span className="section-label">
          {history.length} imagens · {favCount} ⭐ · {bookCount} no livro
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button variant="accent" onClick={handleSync} disabled={syncing}>
            {syncing ? '⏳ Sincronizando...' : '☁ Sincronizar do Drive'}
          </Button>
        </div>
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button variant="accent" onClick={() => doExport('html')}>
              🖨 HTML interior{bookCount > 0 ? ` (${bookCount})` : ''}
            </Button>
            <Button variant="info" onClick={() => doExport('csv')}>📄 CSV</Button>
            <Button variant="error" onClick={clearAll}>🗑 Limpar</Button>
          </div>
        )}
      </div>

      {bookCount > 0 && (
        <p className="hint" style={{ marginBottom: 'var(--space-3)', color: 'var(--success)' }}>
          ✓ {bookCount} imagem(ns) marcada(s) para o livro. O export "HTML interior" usará só essas.
        </p>
      )}

      {history.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)' }}>
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
              : 'Nenhuma imagem neste filtro.'
          }
          icon="📂"
        />
      ) : (
        <div className="history-grid">
          {filtered.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onDelete={deleteItem}
              onToggleFavorite={toggleFavorite}
              onToggleInBook={toggleInBook}
            />
          ))}
        </div>
      )}
    </>
  );
}
