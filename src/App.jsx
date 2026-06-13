import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { THEMES } from './data/themes.js';
import { CONFIG, STORAGE_KEYS } from './data/config.js';
import { DEFAULT_KDP_META } from './data/kdp-steps.js';

import { usePersistedState, usePersistedJSON } from './hooks/usePersistedState.js';
import { useToast } from './hooks/useToast.js';
import { generateImage } from './lib/api.js';
import { calculateRoyalty, sumTokens } from './lib/format.js';
import { initNotifications, requestNotifyPermission, notify } from './lib/notify.js';

import { Header } from './components/Header.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { ProgressBar, Toast } from './components/ui.jsx';

import { GenerateTab }  from './components/tabs/GenerateTab.jsx';
import { CatalogTab }   from './components/tabs/CatalogTab.jsx';
import { FinanceTab }   from './components/tabs/FinanceTab.jsx';
import { KdpTab }       from './components/tabs/KdpTab.jsx';
import { SeoTab }       from './components/tabs/SeoTab.jsx';
import { CanvaTab }     from './components/tabs/CanvaTab.jsx';
import { PhotoTab }     from './components/tabs/PhotoTab.jsx';
import { HistoryTab }   from './components/tabs/HistoryTab.jsx';
import { SettingsTab }  from './components/tabs/SettingsTab.jsx';

export default function App() {
  // ── Configuração ──
  const [webhookUrl,      setWebhookUrl]      = usePersistedState(STORAGE_KEYS.WEBHOOK,       CONFIG.WEBHOOK_URL);
  const [photoWebhookUrl, setPhotoWebhookUrl] = usePersistedState(STORAGE_KEYS.PHOTO_WEBHOOK, CONFIG.PHOTO_WEBHOOK_URL);

  // ── Saldo Replicate ──
  const [balanceInput, setBalanceInput] = usePersistedState(STORAGE_KEYS.BALANCE, String(CONFIG.INITIAL_BALANCE));
  const [initBalance,  setInitBalance]  = useState(CONFIG.INITIAL_BALANCE);
  useEffect(() => {
    const v = parseFloat(balanceInput);
    if (!isNaN(v)) setInitBalance(v);
  }, [balanceInput]);

  // ── Workflow KDP ──
  const [history,     setHistory]     = usePersistedJSON(STORAGE_KEYS.HISTORY,     []);
  const [bookStatus,  setBookStatus]  = usePersistedJSON(STORAGE_KEYS.BOOK_STATUS, {});
  const [kdpCheck,    setKdpCheck]    = usePersistedJSON(STORAGE_KEYS.KDP_CHECK,   {});
  const [kdpMeta,     setKdpMeta]     = usePersistedJSON(STORAGE_KEYS.KDP_META,    DEFAULT_KDP_META);
  const [activeTheme, setActiveTheme] = usePersistedState(STORAGE_KEYS.ACTIVE_THEME, 'selva');
  const [artStyle,    setArtStyle]    = usePersistedState(STORAGE_KEYS.ART_STYLE,    'classic');
  const [turbo,       setTurbo]       = usePersistedState(STORAGE_KEYS.TURBO, false,
    { serialize: String, deserialize: (s) => s === 'true' });

  // ── UI ──
  const [tab,           setTab]           = useState('gerar');
  const [generations,   setGenerations]   = useState({});
  const [selected,      setSelected]      = useState(new Set());
  const [customEn,      setCustomEn]      = useState('');
  const [customPt,      setCustomPt]      = useState('');
  const [catFilter,     setCatFilter]     = useState('all');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [finPrice,      setFinPrice]      = useState(7.99);
  const [finSales,      setFinSales]      = useState(30);

  const abortControllersRef = useRef([]);
  const paceRef             = useRef(0);
  const { toast, showToast } = useToast();

  const theme      = THEMES[activeTheme] || THEMES.selva;
  const themeItems = theme.items;

  // ── Derived ──
  const running = useMemo(
    () => Object.values(generations).some(g => g.status === 'pending' || g.status === 'generating'),
    [generations]
  );
  const doneCount  = useMemo(() => Object.values(generations).filter(g => g.status === 'done').length,  [generations]);
  const errorCount = useMemo(() => Object.values(generations).filter(g => g.status === 'error').length, [generations]);

  const sessionCost  = history.filter(h => !h.isPhoto).reduce((s, h) => s + CONFIG.COST_PER_IMAGE, 0)
                     + history.filter(h => h.isPhoto).reduce((s, h) => s + CONFIG.COST_PER_PHOTO, 0);
  const sessionTokens = useMemo(
    () => Object.values(generations).filter(g => g.status === 'done').reduce((s, g) => s + sumTokens(g.usage), 0),
    [generations]
  );
  const remaining       = initBalance - sessionCost;
  const royalty         = calculateRoyalty(finPrice, CONFIG.PRINT_COST);
  const kdpDone         = Object.values(kdpCheck).filter(Boolean).length;
  const publishedCount  = Object.values(bookStatus).filter(s => s === 'publicado').length;
  const generationTotal = Object.keys(generations).length;
  const progressPercent = generationTotal > 0 ? Math.round((doneCount / generationTotal) * 100) : 0;

  // ── Init ──
  useEffect(() => {
    initNotifications();
    return () => abortControllersRef.current.forEach(c => c.abort());
  }, []);

  /** Pacer: 11s entre disparos no modo seguro */
  const waitForSlot = useCallback(async () => {
    if (turbo) return;
    const now  = Date.now();
    const slot = Math.max(now, paceRef.current);
    paceRef.current = slot + 11_000;
    const wait = slot - now;
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
  }, [turbo]);

  // ── Gerar imagem única ──
  const generateOne = useCallback(async (item, styleOverride) => {
    const style = styleOverride || artStyle;
    const key   = `${item.en}::${style}`;
    await waitForSlot();

    const startTime  = Date.now();
    const controller = new AbortController();
    abortControllersRef.current.push(controller);

    setGenerations(prev => ({ ...prev, [key]: { status: 'generating', startTime, animal_pt: item.pt } }));

    try {
      let data;
      try {
        data = await generateImage(item, { webhookUrl, themeId: activeTheme, style }, controller.signal);
      } catch (firstErr) {
        if (firstErr.name === 'AbortError') throw firstErr;
        await new Promise(r => setTimeout(r, 15_000)); // auto-retry após 15s
        data = await generateImage(item, { webhookUrl, themeId: activeTheme, style }, controller.signal);
      }

      const elapsed     = ((Date.now() - startTime) / 1000).toFixed(1);
      const completedAt = new Date().toISOString();

      setGenerations(prev => ({ ...prev, [key]: { status: 'done', ...data, elapsed, completedAt } }));
      setHistory(prev => [{
        id:           `${item.en}-${Date.now()}`,
        animal_en:    item.en,
        animal_pt:    item.pt,
        style,
        image_url:    data.image_url,
        drive_file_id: data.drive_file_id || null,
        usage:        data.usage,
        theme:        activeTheme,
        elapsed,
        completedAt,
      }, ...prev].slice(0, CONFIG.HISTORY_LIMIT));
      return 'done';
    } catch (err) {
      if (err.name === 'AbortError') return 'aborted';
      setGenerations(prev => ({ ...prev, [key]: { status: 'error', error: err.message || 'Erro desconhecido', animal_pt: item.pt } }));
      return 'error';
    }
  }, [webhookUrl, activeTheme, artStyle, setHistory, waitForSlot]);

  // ── Handlers de geração ──
  const handleGenerate = async () => {
    requestNotifyPermission();
    const itemsToGenerate = Array.from(selected)
      .map(en => themeItems.find(i => i.en === en))
      .filter(Boolean)
      .filter(item => {
        const g = generations[`${item.en}::${artStyle}`];
        return !(g && (g.status === 'pending' || g.status === 'generating'));
      });
    if (itemsToGenerate.length === 0) return;

    setSelected(new Set());
    setGenerations(prev => {
      const next = { ...prev };
      itemsToGenerate.forEach(item => { next[`${item.en}::${artStyle}`] = { status: 'pending', animal_pt: item.pt }; });
      return next;
    });

    const results = await Promise.all(itemsToGenerate.map(item => generateOne(item)));
    const ok     = results.filter(r => r === 'done').length;
    const failed = results.filter(r => r === 'error').length;
    notify(
      failed === 0 ? '🎨 Geração concluída!' : '🎨 Geração concluída (com erros)',
      `${ok} de ${itemsToGenerate.length} prontas${failed ? ` · ${failed} com erro` : ''} — ${theme.name}`
    );
    if (itemsToGenerate.length === themeItems.length) {
      setBookStatus(prev => ({ ...prev, [activeTheme]: 'gerado' }));
      showToast(`✓ ${theme.name} completo!`);
    }
  };

  const handleAddCustom = async () => {
    const en = customEn.trim(), pt = customPt.trim();
    if (!en || !pt) { showToast('Preencha ambos os campos', 'error'); return; }
    setCustomEn(''); setCustomPt('');
    requestNotifyPermission();
    showToast(`Gerando ${pt}...`);
    const result = await generateOne({ en, pt });
    if (result === 'done') notify('✨ Imagem pronta!', `${pt} foi gerada com sucesso`);
  };

  const handleRegenerate = useCallback(async (key) => {
    const [en, keyStyle] = key.split('::');
    const item = themeItems.find(i => i.en === en)
      || (generations[key]?.animal_pt ? { en, pt: generations[key].animal_pt } : null);
    if (!item) { showToast('Item não encontrado', 'error'); return; }
    requestNotifyPermission();
    showToast(`🔄 Regenerando ${item.pt}...`);
    const result = await generateOne(item, keyStyle);
    if (result === 'done') notify('✨ Pronto!', `${item.pt} regenerada`);
  }, [themeItems, generations, generateOne, showToast]);

  /** Adiciona foto gerada ao histórico */
  const addPhotoToHistory = useCallback((photoData, subjectName) => {
    setHistory(prev => [{
      id:            `photo-${Date.now()}`,
      animal_en:     photoData.animal || subjectName,
      animal_pt:     subjectName,
      style:         'photo',
      image_url:     photoData.image_url,
      drive_file_id: photoData.drive_file_id || null,
      usage:         photoData.usage,
      theme:         null,
      elapsed:       '—',
      completedAt:   new Date().toISOString(),
      isPhoto:       true,
    }, ...prev].slice(0, CONFIG.HISTORY_LIMIT));
  }, [setHistory]);

  // ── Seleção ──
  const toggleSelect = en => setSelected(prev => {
    const next = new Set(prev);
    next.has(en) ? next.delete(en) : next.add(en);
    return next;
  });
  const selectAll  = () => setSelected(new Set(themeItems.map(i => i.en)));
  const selectNone = () => setSelected(new Set());
  const selectTest = () => setSelected(new Set(themeItems.slice(0, 2).map(i => i.en)));

  const switchTheme = id => {
    setActiveTheme(id);
    setSelected(new Set());
    setGenerations({});
    setBookStatus(prev => prev[id] ? prev : { ...prev, [id]: 'planejado' });
  };

  const clearGenerations = () => { setGenerations({}); setSelected(new Set()); };

  // ── Render ──
  return (
    <div className="app">
      <Header tab={tab} setTab={setTab} historyCount={history.length} kdpDone={kdpDone} />

      <Dashboard
        balanceInput={balanceInput}
        setBalanceInput={setBalanceInput}
        setInitBalance={setInitBalance}
        sessionCost={sessionCost}
        remaining={remaining}
        doneCount={history.length}
        activeTheme={activeTheme}
      />

      {running && (
        <div className="progress-strip">
          <ProgressBar
            percent={progressPercent}
            label={`${doneCount}/${generationTotal} · ${errorCount > 0 ? `${errorCount} erros` : 'em andamento'}`}
          />
        </div>
      )}

      <main className="main">
        {tab === 'gerar' && (
          <GenerateTab
            activeTheme={activeTheme}
            artStyle={artStyle}    setArtStyle={setArtStyle}
            turbo={turbo}          setTurbo={setTurbo}
            switchTheme={switchTheme}
            themeItems={themeItems}
            selected={selected}
            toggleSelect={toggleSelect}
            selectAll={selectAll}  selectNone={selectNone}  selectTest={selectTest}
            customEn={customEn}    setCustomEn={setCustomEn}
            customPt={customPt}    setCustomPt={setCustomPt}
            handleAddCustom={handleAddCustom}
            generations={generations}
            running={running}
            handleGenerate={handleGenerate}
            handleRegenerate={handleRegenerate}
            clearGenerations={clearGenerations}
            progressDone={doneCount}
            progressTotal={generationTotal}
          />
        )}

        {tab === 'foto' && (
          <PhotoTab
            artStyle={artStyle}
            activeTheme={activeTheme}
            photoWebhookUrl={photoWebhookUrl}
            addToHistory={addPhotoToHistory}
            showToast={showToast}
          />
        )}

        {tab === 'canva' && (
          <CanvaTab
            activeTheme={activeTheme}
            history={history}
            webhookUrl={webhookUrl}
            kdpMeta={kdpMeta}
            showToast={showToast}
          />
        )}

        {tab === 'kdp' && (
          <KdpTab
            kdpCheck={kdpCheck}  setKdpCheck={setKdpCheck}
            kdpMeta={kdpMeta}    setKdpMeta={setKdpMeta}
            activeTheme={activeTheme}
            showToast={showToast}
          />
        )}

        {tab === 'seo' && (
          <SeoTab kdpMeta={kdpMeta} activeTheme={activeTheme} showToast={showToast} />
        )}

        {tab === 'catalogo' && (
          <CatalogTab
            history={history}
            bookStatus={bookStatus}  setBookStatus={setBookStatus}
            switchTheme={switchTheme}
            setTab={setTab}
            catFilter={catFilter}    setCatFilter={setCatFilter}
          />
        )}

        {tab === 'financas' && (
          <FinanceTab
            finPrice={finPrice}  setFinPrice={setFinPrice}
            finSales={finSales}  setFinSales={setFinSales}
            royalty={royalty}
            publishedCount={publishedCount}
          />
        )}

        {tab === 'history' && (
          <HistoryTab
            history={history}
            kdpMeta={kdpMeta}
            webhookUrl={webhookUrl}
            setHistory={setHistory}
            historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter}
            showToast={showToast}
          />
        )}

        {tab === 'config' && (
          <SettingsTab
            webhookUrl={webhookUrl}           setWebhookUrl={setWebhookUrl}
            photoWebhookUrl={photoWebhookUrl} setPhotoWebhookUrl={setPhotoWebhookUrl}
            history={history}                 setHistory={setHistory}
            setBookStatus={setBookStatus}
            setKdpCheck={setKdpCheck}
            setKdpMeta={setKdpMeta}
            defaultKdpMeta={DEFAULT_KDP_META}
            showToast={showToast}
          />
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}
