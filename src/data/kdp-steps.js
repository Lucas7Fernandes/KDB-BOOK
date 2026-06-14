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
  title: 'Baby Safari Animals',
  subtitle: 'My First Coloring Book for Toddlers Ages 1-4 | 40 Big & Easy Cute Animals to Color | Bold Simple Outlines for Little Hands',
  kw1: 'toddler coloring book ages 1-3',
  kw2: 'baby animals coloring book for kids',
  kw3: 'first coloring book for toddlers',
  kw4: 'bold and easy coloring book for kids',
  kw5: 'simple coloring book for preschoolers',
  kw6: 'cute animal coloring book ages 2-4',
  kw7: 'safari jungle animals toddler activity book',
  cat1: 'Books > Children\'s Books > Activities, Crafts & Games > Coloring Books',
  cat2: 'Books > Children\'s Books > Animals',
  desc: `<b>Give your little one hours of happy, screen-free fun!</b>

<b>Baby Safari Animals</b> is the perfect first coloring book for toddlers and preschoolers who are just learning to hold a crayon. Each page features one adorable baby safari animal drawn with big, bold, easy-to-color outlines — designed especially for little hands ages 1 to 4.

<b>Inside this book you'll find:</b>
• 40 cute baby animals — lion, elephant, giraffe, zebra, hippo, monkey and many more
• Extra-thick bold outlines that are easy for tiny hands to stay inside
• One animal per page, printed single-sided so colors won't bleed through
• Big, simple designs with no tiny details to frustrate young children
• Large 8.5 x 8.5 inch pages — plenty of room to color

<b>Why parents love it:</b>
Coloring helps toddlers develop fine motor skills, hand-eye coordination, focus, and color recognition — all while having fun. A wonderful gift for birthdays, holidays, Easter baskets, or quiet-time activities at home.

<b>Perfect for ages 1, 2, 3 and 4.</b>

Scroll up and click <b>Add to Cart</b> to start the coloring adventure today!`,
  price: '8.99',
};
