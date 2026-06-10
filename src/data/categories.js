/**
 * Categorias dos temas. Cada categoria agrupa múltiplos temas.
 */
export const CATEGORIES = {
  animais: {
    name: 'Animais',
    emoji: '🐾',
    color: '#4ADE80',
    themeIds: ['selva', 'fazenda', 'oceano', 'floresta', 'artico', 'domesticos', 'dinos'],
  },
  educativo: {
    name: 'Educativo',
    emoji: '📚',
    color: '#C084FC',
    themeIds: ['profissoes', 'veiculos', 'esportes', 'frutas'],
  },
  personagens: {
    name: 'Personagens',
    emoji: '🎭',
    color: '#F472B6',
    themeIds: ['espaco', 'princesas'],
  },
  datas: {
    name: 'Datas Comemorativas',
    emoji: '🎉',
    color: '#FB923C',
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
