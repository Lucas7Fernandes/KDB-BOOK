/**
 * Constantes globais da aplicação.
 */
export const CONFIG = {
  WEBHOOK_URL: import.meta.env.VITE_WEBHOOK_URL ||
    'https://hook.us2.make.com/expoqepqmwwgbyq86tej96imedg8g9m7',

  PHOTO_WEBHOOK_URL: import.meta.env.VITE_PHOTO_WEBHOOK_URL ||
    'https://hook.us2.make.com/8zae3sfd6td5h0mgdnfqyfh3iqkxlaa0',

  COST_PER_IMAGE: parseFloat(import.meta.env.VITE_COST_PER_IMAGE) || 0.03,
  COST_PER_PHOTO: 0.04,

  INITIAL_BALANCE: parseFloat(import.meta.env.VITE_INITIAL_BALANCE) || 5.00,
  PRINT_COST: 2.15,
  HISTORY_LIMIT: 500,
};

export const STORAGE_KEYS = {
  WEBHOOK:       'kdp_webhook',
  PHOTO_WEBHOOK: 'kdp_photo_webhook',
  BALANCE:       'kdp_balance',
  HISTORY:       'kdp_history',
  BOOK_STATUS:   'kdp_book_status',
  KDP_CHECK:     'kdp_check',
  KDP_META:      'kdp_meta',
  ACTIVE_THEME:  'kdp_active_theme',
  ART_STYLE:     'kdp_art_style',
  TURBO:         'kdp_turbo',
};
