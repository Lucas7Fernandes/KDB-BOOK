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

import { GenerateTab } from './components/tabs/GenerateTab.jsx';
import { CatalogTab } from './components/tabs/CatalogTab.jsx';
import { FinanceTab } from './components/tabs/FinanceTab.jsx';
import { KdpTab } from './components/tabs/KdpTab.jsx';
import { SeoTab } from './components/tabs/SeoTab.jsx';
import { CanvaTab } from './components/tabs/CanvaTab.jsx';
import { HistoryTab } from './components/tabs/HistoryTab.jsx';
import { SettingsTab } from './components/tabs/SettingsTab.jsx';

/**
 * Componente raiz da aplicação.
 *
 * Estado:
 *   - webhookUrl, useProxy: configuração da API
 *   - balanceInput, initBalance: saldo Replicate
 *   - history: lista de imagens geradas
 *   - bookStatus, kdpCheck, kdpMeta: workflow KDP
 *   - activeTheme: tema selecionado
 *   - generations: cache de gerações em andamento (não persistido)
 *   - selected: seleção atual de itens para gerar
 *   - tab: aba ativa do menu
 */
export default function App() {
  // ── Configuração (persistida) ──
  const [webhookUrl, setWebhookUrl] = usePersistedState(STORAGE_KEYS.WEBHOOK, CONFIG.WEBHOOK_URL);
  const [useProxy, setUseProxy] = usePersistedState(
    STORAGE_KEYS.USE_PROXY,
    CONFIG.USE_CORS_PROXY,
    { serialize: String, deserialize: (s) => s !== 'false' }
  );

  // ── Estado financeiro ──
  const [balanceInput, setBalanceInput] = usePersistedState(
    STORAGE_KEYS.BALANCE,
    String(CONFIG.INITIAL_BALANCE)
  );
  const [initBalance, setInitBalance] = useState(CONFIG.INITIAL_BALANCE);

  // Sincroniza initBalance com o input persistido
  useEffect(() => {
    const v = parseFloat(balanceInput);
    if (!isNaN(v)) setInitBalance(v);
  }, [balanceInput]);

  // ── Workflow KDP ──
  const [history, setHistory] = usePersistedJSON(STORAGE_KEYS.HISTORY, []);
  const [bookStatus, setBookStatus] = usePersistedJSON(STORAGE_KEYS.BOOK_STATUS, {});
  const [kdpCheck, setKdpCheck] = usePersistedJSON(STORAGE_KEYS.KDP_CHECK, {});
  const [kdpMeta, setKdpMeta] = usePersistedJSON(STORAGE_KEYS.KDP_META, DEFAULT_KDP_META);
  const [activeTheme, setActiveTheme] = usePersistedState(STORAGE_KEYS.ACTIVE_THEME, 'selva');

  // ── Estado de UI (não persistido) ──
  const [tab, setTab] = useState('gerar');
  const [generations, setGenerations] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [customEn, setCustomEn] = useState('');
  const [customPt, setCustomPt] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [finPrice, setFinPrice] = useState(7.99);
  const [finSales, setFinSales] = useState(30);

  // Ref para abortar requisições em flight
  const abortControllersRef = useRef([]);

  const { toast, showToast } = useToast();

  const theme = THEMES[activeTheme] || THEMES.selva;
  const themeItems = theme.items;

  // ── Derived state ──
  const doneCount = useMemo(
    () => Object.values(generations).filter((g) => g.status === 'done').length,
    [generations]
  );

  const errorCount = useMemo(
    () => Object.values(generations).filter((g) => g.status === 'error').length,
    [generations]
  );

  const sessionCost = doneCount * CONFIG.COST_PER_IMAGE;

  const sessionTokens = useMemo(
    () =>
      Object.values(generations)
        .filter((g) => g.status === 'done')
        .reduce((sum, g) => sum + sumTokens(g.usage), 0),
    [generations]
  );

  const remaining = initBalance - sessionCost;
  const royalty = calculateRoyalty(finPrice, CONFIG.PRINT_COST);
  const kdpDone = Object.values(kdpCheck).filter(Boolean).length;
  const publishedCount = Object.values(bookStatus).filter((s) => s === 'publicado').length;
  const generationTotal = Object.keys(generations).length;
  const progressPercent = generationTotal > 0 ? Math.round((doneCount / generationTotal) * 100) : 0;

  // ── Service worker p/ notificações + limpeza de aborts ──
  useEffect(() => {
    initNotifications();
    return () => {
      abortControllersRef.current.forEach((c) => c.abort());
    };
  }, []);

  // ── Single image generation ──
  const generateOne = useCallback(
    async (item) => {
      const startTime = Date.now();
      const controller = new AbortController();
      abortControllersRef.current.push(controller);

      setGenerations((prev) => ({
        ...prev,
        [item.en]: {
          status: 'generating',
          startTime,
          animal_pt: item.pt,
        },
      }));

      try {
        const data = await generateImage(
          item,
          { webhookUrl, themeId: activeTheme },
          controller.signal
        );

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const completedAt = new Date().toISOString();

        setGenerations((prev) => ({
          ...prev,
          [item.en]: {
            status: 'done',
            ...data,
            elapsed,
            completedAt,
          },
        }));

        // Add to persistent history
        setHistory((prev) => [
          {
            id: `${item.en}-${Date.now()}`,
            animal_en: item.en,
            animal_pt: item.pt,
            image_url: data.image_url,
            drive_file_id: data.drive_file_id || null,
            usage: data.usage,
            theme: activeTheme,
            elapsed,
            completedAt,
          },
          ...prev,
        ].slice(0, CONFIG.HISTORY_LIMIT));
        return 'done';
      } catch (err) {
        if (err.name === 'AbortError') return 'aborted';
        setGenerations((prev) => ({
          ...prev,
          [item.en]: {
            status: 'error',
            error: err.message || 'Erro desconhecido',
            animal_pt: item.pt,
          },
        }));
        return 'error';
      }
    },
    [webhookUrl, activeTheme, setHistory]
  );

  // ── Generation handlers ──
  const handleGenerate = async () => {
    if (running) return;

    requestNotifyPermission(); // gesto do usuário: momento certo de pedir
    setRunning(true);

    const itemsToGenerate = Array.from(selected)
      .map((en) => themeItems.find((i) => i.en === en))
      .filter(Boolean);

    // Mark all as pending immediately
    setGenerations((prev) => {
      const next = { ...prev };
      itemsToGenerate.forEach((item) => {
        next[item.en] = { status: 'pending', animal_pt: item.pt };
      });
      return next;
    });

    // Fire in parallel
    const results = await Promise.all(itemsToGenerate.map((item) => generateOne(item)));

    setRunning(false);

    const ok = results.filter((r) => r === 'done').length;
    const failed = results.filter((r) => r === 'error').length;
    notify(
      failed === 0 ? '🎨 Geração concluída!' : '🎨 Geração concluída (com erros)',
      `${ok} de ${itemsToGenerate.length} imagens prontas${failed ? ` · ${failed} com erro` : ''} — ${theme.name}`
    );

    // Mark theme as "gerado" if all items completed successfully
    if (itemsToGenerate.length === themeItems.length && itemsToGenerate.length > 0) {
      setBookStatus((prev) => ({ ...prev, [activeTheme]: 'gerado' }));
      showToast(`✓ ${theme.name} completo!`);
    }
  };

  const handleAddCustom = async () => {
    const en = customEn.trim();
    const pt = customPt.trim();
    if (!en || !pt) {
      showToast('Preencha ambos os campos', 'error');
      return;
    }
    setCustomEn('');
    setCustomPt('');
    requestNotifyPermission();
    showToast(`Gerando ${pt}...`);
    const result = await generateOne({ en, pt });
    if (result === 'done') notify('✨ Imagem pronta!', `${pt} foi gerada com sucesso`);
  };

  /**
   * Regenera um item individual ($0.03). Busca o item no tema ativo
   * ou reconstrói a partir do estado de generations (itens customizados).
   */
  const handleRegenerate = useCallback(
    async (en) => {
      const item =
        themeItems.find((i) => i.en === en) ||
        (generations[en]?.animal_pt ? { en, pt: generations[en].animal_pt } : null);
      if (!item) {
        showToast('Item não encontrado para regenerar', 'error');
        return;
      }
      requestNotifyPermission();
      showToast(`🔄 Regenerando ${item.pt}...`);
      const result = await generateOne(item);
      if (result === 'done') notify('✨ Imagem pronta!', `${item.pt} foi regenerada`);
    },
    [themeItems, generations, generateOne, showToast]
  );

  // ── Selection handlers ──
  const toggleSelect = (en) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(en)) next.delete(en);
      else next.add(en);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(themeItems.map((i) => i.en)));
  const selectNone = () => setSelected(new Set());
  const selectTest = () => setSelected(new Set(themeItems.slice(0, 2).map((i) => i.en)));

  const switchTheme = (id) => {
    setActiveTheme(id);
    setSelected(new Set());
    setGenerations({});
    setBookStatus((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: 'planejado' };
    });
  };

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
        doneCount={doneCount}
        sessionTokens={sessionTokens}
        publishedCount={publishedCount}
        totalThemes={Object.keys(THEMES).length}
        activeTheme={activeTheme}
        kdpDone={kdpDone}
      />

      {running && (
        <div className="progress-strip">
          <ProgressBar
            percent={progressPercent}
            label={`${doneCount}/${generationTotal} concluídas · ${errorCount} erros`}
          />
        </div>
      )}

      <main className="main">
        {tab === 'gerar' && (
          <GenerateTab
            activeTheme={activeTheme}
            switchTheme={switchTheme}
            themeItems={themeItems}
            selected={selected}
            toggleSelect={toggleSelect}
            selectAll={selectAll}
            selectNone={selectNone}
            selectTest={selectTest}
            customEn={customEn}
            customPt={customPt}
            setCustomEn={setCustomEn}
            setCustomPt={setCustomPt}
            handleAddCustom={handleAddCustom}
            generations={generations}
            running={running}
            handleGenerate={handleGenerate}
            handleRegenerate={handleRegenerate}
            progressDone={doneCount}
            progressTotal={generationTotal}
          />
        )}

        {tab === 'catalogo' && (
          <CatalogTab
            history={history}
            bookStatus={bookStatus}
            setBookStatus={setBookStatus}
            switchTheme={switchTheme}
            setTab={setTab}
            catFilter={catFilter}
            setCatFilter={setCatFilter}
          />
        )}

        {tab === 'financas' && (
          <FinanceTab
            finPrice={finPrice}
            setFinPrice={setFinPrice}
            finSales={finSales}
            setFinSales={setFinSales}
            royalty={royalty}
            publishedCount={publishedCount}
          />
        )}

        {tab === 'kdp' && (
          <KdpTab
            kdpCheck={kdpCheck}
            setKdpCheck={setKdpCheck}
            kdpMeta={kdpMeta}
            setKdpMeta={setKdpMeta}
            activeTheme={activeTheme}
            showToast={showToast}
          />
        )}

        {tab === 'seo' && (
          <SeoTab kdpMeta={kdpMeta} activeTheme={activeTheme} showToast={showToast} />
        )}

        {tab === 'canva' && (
          <CanvaTab activeTheme={activeTheme} history={history} webhookUrl={webhookUrl} kdpMeta={kdpMeta} showToast={showToast} />
        )}

        {tab === 'history' && (
          <HistoryTab
            history={history}
            kdpMeta={kdpMeta}
            setHistory={setHistory}
            historyFilter={historyFilter}
            setHistoryFilter={setHistoryFilter}
            showToast={showToast}
          />
        )}

        {tab === 'config' && (
          <SettingsTab
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            useProxy={useProxy}
            setUseProxy={setUseProxy}
            history={history}
            setHistory={setHistory}
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
