import { useMemo, useState } from 'react';
import { THEMES } from '../../data/themes.js';
import { exportHistory } from '../../lib/export.js';
import { syncDrive, deleteDriveFile, renameDriveFile } from '../../lib/api.js';
import { resolveEnglishName, PT_TO_EN } from '../../data/animal-names-en.js';
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

  const isUntitled = (h) => !h.animal_pt || /^untitled$/i.test(h.animal_pt) || /^untitled$/i.test(h.animal_en || '');
  const untitledCount = history.filter(isUntitled).length;

  const filterOptions = useMemo(() => [
    ['all', 'Todos', '📦'],
    ['fav', 'Favoritos', '⭐'],
    ['book', 'No livro', '✓'],
    ...(untitledCount > 0 ? [['noname', `Sem nome (${untitledCount})`, '✏️']] : []),
    ...Object.entries(THEMES).map(([id, t]) => [id, t.name.split(' ').slice(-1)[0], t.emoji]),
  ], [untitledCount]);

  const filtered =
    historyFilter === 'all'    ? history :
    historyFilter === 'fav'    ? history.filter((h) => h.favorite) :
    historyFilter === 'book'   ? history.filter((h) => h.inBook) :
    historyFilter === 'noname' ? history.filter(isUntitled) :
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

  // Renomeia um item: atualiza histórico (PT + EN) e renomeia o arquivo no Drive.
  const renameItem = async (item, newPtName) => {
    const en = PT_TO_EN[newPtName.toLowerCase()]
      || PT_TO_EN[newPtName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
      || newPtName;
    setHistory((prev) => prev.map((h) =>
      h.id === item.id ? { ...h, animal_pt: newPtName, animal_en: en } : h
    ));
    if (item.drive_file_id) {
      try {
        await renameDriveFile(webhookUrl, item.drive_file_id, `${en}.jpg`);
      } catch {
        showToast('Nome salvo no portal (falha ao renomear no Drive)', 'error');
        return;
      }
    }
    showToast(`Renomeado para "${newPtName}"`);
  };

  // Corrige automaticamente os "untitled" onde há pista (animal_pt preenchido).
  const autoFixNames = async () => {
    const broken = history.filter(isUntitled);
    if (broken.length === 0) { showToast('Nenhum nome para corrigir 🎉'); return; }

    let fixed = 0;
    const stillBroken = [];
    for (const h of broken) {
      // tenta achar o nome PT a partir do animal_pt; se for untitled, não há pista
      const pt = (h.animal_pt || '').trim();
      const en = resolveEnglishName(h);
      if (pt && !/^untitled$/i.test(pt) && en && !/^untitled$/i.test(en)) {
        setHistory((prev) => prev.map((x) => x.id === h.id ? { ...x, animal_en: en } : x));
        if (h.drive_file_id) {
          try { await renameDriveFile(webhookUrl, h.drive_file_id, `${en}.jpg`); } catch { /* ignora */ }
        }
        fixed++;
      } else {
        stillBroken.push(h);
      }
    }
    if (stillBroken.length > 0) {
      showToast(`${fixed} corrigido(s). ${stillBroken.length} sem pista — edite manualmente (campo vermelho).`, fixed ? 'success' : 'error');
    } else {
      showToast(`✓ ${fixed} nome(s) corrigido(s) automaticamente!`);
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
          {untitledCount > 0 && (
            <Button variant="info" onClick={autoFixNames}>
              ✏️ Corrigir nomes ({untitledCount})
            </Button>
          )}
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
              onRename={renameItem}
            />
          ))}
        </div>
      )}
    </>
  );
}
