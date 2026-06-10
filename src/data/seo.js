/**
 * Inteligência de SEO Amazon KDP por categoria.
 * Dados de pesquisa de mercado: BSR (Best Sellers Rank), volume de busca,
 * concorrência, faixa de preço ideal e dicas estratégicas.
 */
export const SEO_INTEL = {
  animais: {
    keywords: [
      'coloring book animals kids',
      'animal coloring pages toddler',
      'zoo animals activity book',
      'wildlife coloring book children',
    ],
    bsr: '#500–5.000',
    searches: '15k–25k/mês',
    competition: 'Média',
    price: '$6.99–$8.99',
    tip: 'Use nomes específicos nas keywords. Inclua faixa etária no título. Ex: "Jungle Animals Coloring Book Ages 4-8". Bullet points com lista de animais aumentam conversão.',
  },
  educativo: {
    keywords: [
      'educational coloring book',
      'learning activity workbook',
      'preschool coloring book',
      'toddler activity book',
    ],
    bsr: '#1.000–8.000',
    searches: '8k–15k/mês',
    competition: 'Baixa',
    price: '$7.99–$9.99',
    tip: 'Combine tema com aprendizado: "Learn & Color: Professions". Alta conversão em presentes de aniversário. Segmento menos competitivo, ótimo para autores iniciantes.',
  },
  personagens: {
    keywords: [
      'princess coloring book girls',
      'space coloring book kids',
      'fantasy coloring pages',
      'unicorn coloring book',
    ],
    bsr: '#200–3.000',
    searches: '10k–20k/mês',
    competition: 'Média-Alta',
    price: '$6.99–$8.99',
    tip: 'Crie personagens 100% originais. Evite nomes de franquias (copyright). "Original Characters" tem margem maior e sem risco de takedown.',
  },
  datas: {
    keywords: [
      'christmas coloring book kids',
      'halloween coloring pages',
      'easter coloring book',
      'holiday activity book',
    ],
    bsr: '#100–1.000 (temporada)',
    searches: '20k–80k/mês (pico)',
    competition: 'Alta (temporada)',
    price: '$5.99–$7.99',
    tip: 'PUBLIQUE 6-8 SEMANAS ANTES da data. Picos de busca são enormes. Bundle (3 livros = 1 volume sazonal) aumenta ticket médio. Crie uma série anual.',
  },
};

/**
 * Estratégias de crescimento orgânico no algoritmo A9 da Amazon.
 */
export const GROWTH_STRATEGIES = [
  {
    n: '01',
    title: 'Séries temáticas',
    description: 'Publique 3+ livros do mesmo nicho. Amazon prioriza autores com múltiplos livros no catálogo.',
    color: '#15803D',
  },
  {
    n: '02',
    title: 'Bundle de 3 livros',
    description: 'Crie um volume compilado (ex: 3 in 1 Animal Coloring Books) a $12.99. Ticket maior, mesma produção.',
    color: '#B45309',
  },
  {
    n: '03',
    title: 'Sazonalidade',
    description: 'Natal e Halloween geram 10x mais buscas. Publique 6-8 semanas antes. Agenda anual.',
    color: '#1D4ED8',
  },
  {
    n: '04',
    title: 'Versões de idioma',
    description: 'Mesmas imagens, título em inglês + espanhol + português. Triplica o mercado endereçável.',
    color: '#7C3AED',
  },
  {
    n: '05',
    title: 'Reviews iniciais',
    description: 'Primeiras 5 reviews são críticas. Use BookClub, NetGalley ou envie para familiares e amigos.',
    color: '#C2410C',
  },
  {
    n: '06',
    title: 'A+ Content',
    description: 'Ative A+ Content (gratuito) para adicionar imagens de amostra inline. +10-20% conversão.',
    color: '#BE185D',
  },
];
