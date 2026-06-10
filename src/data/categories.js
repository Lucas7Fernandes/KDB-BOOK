/**
 * Categorias dos temas. Cada categoria agrupa múltiplos temas.
 */
export const CATEGORIES = {
  animais: {
    name: 'Animais',
    emoji: '🐾',
    color: '#15803D',
    themeIds: ['selva', 'fazenda', 'oceano', 'floresta', 'artico', 'domesticos', 'dinos'],
  },
  educativo: {
    name: 'Educativo',
    emoji: '📚',
    color: '#7C3AED',
    themeIds: ['profissoes', 'veiculos', 'esportes', 'frutas'],
  },
  personagens: {
    name: 'Personagens',
    emoji: '🎭',
    color: '#BE185D',
    themeIds: ['espaco', 'princesas'],
  },
  datas: {
    name: 'Datas Comemorativas',
    emoji: '🎉',
    color: '#C2410C',
    themeIds: ['natal', 'pascoa', 'halloween'],
  },
};

/** Lista filtros disponíveis incluindo "todos" */
export const CATEGORY_FILTERS = [
  ['all', 'Todos', '📦'],
  ['animais', 'Animais', '🐾'],
  ['educativo', 'Educativo', '📚'],
  ['personagens', 'Personagens', '🎭'],
  ['datas', 'Datas', '🎉'],
];
