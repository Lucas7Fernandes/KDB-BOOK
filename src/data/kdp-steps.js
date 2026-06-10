/**
 * Checklist de 12 passos para publicar um livro na Amazon KDP.
 * Cada passo tem um label curto + tip expandida com instruções práticas.
 */
export const KDP_STEPS = [
  {
    id: 'account',
    label: 'Criar conta KDP',
    tip: 'kdp.amazon.com — use e-mail separado do pessoal. A conta nunca é excluída, organize desde o início.',
  },
  {
    id: 'tax',
    label: 'Informações fiscais (W-7/EIN)',
    tip: 'Brasileiros: solicite ITIN via formulário W-7 (~8 semanas) ou EIN de uma LLC americana. Sem isso, Amazon retém 30% de impostos.',
  },
  {
    id: 'bank',
    label: 'Conta bancária USD',
    tip: 'Payoneer ou Wise para receber USD. Mínimo $100 para primeiro saque. Sem ITIN, Payoneer funciona diretamente.',
  },
  {
    id: 'images',
    label: 'Gerar 20 imagens (aba Gerar)',
    tip: 'Selecione o tema, clique em "Selecionar Todos" e depois "Gerar". Custo total: $0.60. Tempo: ~60s em paralelo. URLs ficam salvas no Histórico.',
  },
  {
    id: 'interior',
    label: 'Montar PDF interior',
    tip: '8.5×11 polegadas, B&W. Uma imagem por página. Margem interna (gutter) de 0.375 polegadas. Total ~22 páginas com capa, verso e créditos.',
  },
  {
    id: 'cover',
    label: 'Criar capa (Canva template KDP)',
    tip: 'Canva tem templates KDP gratuitos. Use a calculadora de capa KDP para dimensões exatas baseadas na contagem de páginas. Exporte em 300 DPI.',
  },
  {
    id: 'title',
    label: 'Título + subtítulo SEO-rich',
    tip: 'Template: [TEMA] Coloring Book for Kids | [N] [ADJ] Designs for Children Ages [X-Y]. Máximo de 200 caracteres no total.',
  },
  {
    id: 'keywords',
    label: '7 keywords de busca',
    tip: 'Exemplos: coloring book kids · animal coloring pages · toddler activity book · [tema] coloring · children activity book',
  },
  {
    id: 'cats',
    label: '2 categorias KDP',
    tip: 'Juvenile Nonfiction > Activities > Coloring + Children\'s > Activity Books. Solicite uma 3ª categoria por e-mail ao suporte KDP após publicar.',
  },
  {
    id: 'desc',
    label: 'Descrição HTML (700+ chars)',
    tip: 'Use tags <b>, <ul>, <li>. Inclua: faixa etária, número de páginas, papel fino recomendado, ideal para presente. Máximo 4.000 caracteres.',
  },
  {
    id: 'upload',
    label: 'Upload capa + interior + preview',
    tip: 'KDP Previewer 3D mostra como o livro será impresso. Corrija alertas de sangria, margem e resolução antes de prosseguir.',
  },
  {
    id: 'publish',
    label: 'Definir preço e publicar',
    tip: '$6.99–$8.99 é a faixa ideal para coloring books. Aprovação: 24–72 horas. O primeiro livro pode demorar mais. Notificação por e-mail.',
  },
];

/** Metadados default para o formulário KDP */
export const DEFAULT_KDP_META = {
  title: '',
  subtitle: '',
  kw1: 'coloring book for kids',
  kw2: 'animal coloring pages',
  kw3: 'toddler activity book',
  kw4: 'children coloring book',
  kw5: '',
  kw6: 'preschool activity book',
  kw7: 'coloring book ages 4-8',
  cat1: 'Juvenile Nonfiction > Activities > Coloring',
  cat2: 'Children\'s Books > Activities > Activity Books',
  desc: '',
  price: '7.99',
};
