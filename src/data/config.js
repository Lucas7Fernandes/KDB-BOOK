/**
 * Constantes globais da aplicação.
 * Valores carregados de variáveis de ambiente quando disponíveis,
 * com fallbacks seguros para desenvolvimento local.
 */

export const CONFIG = {
  WEBHOOK_URL: import.meta.env.VITE_WEBHOOK_URL ||
    'https://hook.us2.make.com/expoqepqmwwgbyq86tej96imedg8g9m7',

  USE_CORS_PROXY: import.meta.env.VITE_USE_CORS_PROXY !== 'false',

  COST_PER_IMAGE: parseFloat(import.meta.env.VITE_COST_PER_IMAGE) || 0.03,

  INITIAL_BALANCE: parseFloat(import.meta.env.VITE_INITIAL_BALANCE) || 5.00,

  PRINT_COST: 2.15,

  REQUEST_TIMEOUT_MS: 90_000,

  HISTORY_LIMIT: 500,
};

/** Storage keys (prefixadas para isolamento). */
export const STORAGE_KEYS = {
  WEBHOOK: 'kdp_webhook',
  BALANCE: 'kdp_balance',
  HISTORY: 'kdp_history',
  USE_PROXY: 'kdp_proxy',
  BOOK_STATUS: 'kdp_book_status',
  KDP_CHECK: 'kdp_check',
  KDP_META: 'kdp_meta',
  ACTIVE_THEME: 'kdp_active_theme',
};
