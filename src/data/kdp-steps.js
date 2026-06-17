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
  title: 'My First Coloring Book',
  subtitle: 'Baby Animals | 30+ Big & Easy Cute Animals to Color | Bold Simple Outlines for Little Hands',
  kw1: 'first coloring book for toddlers',
  kw2: 'baby animals coloring book for kids',
  kw3: 'toddler coloring book ages 1-3',
  kw4: 'bold and easy coloring book for kids',
  kw5: 'simple coloring book for preschoolers',
  kw6: 'cute animal coloring book',
  kw7: 'big and easy coloring book toddlers',
  cat1: 'Books > Children\'s Books > Activities, Crafts & Games > Coloring Books',
  cat2: 'Books > Children\'s Books > Animals',
  desc: `This started as a coloring book for my own kid. It turned out so well that I wanted other little hands to enjoy it too.

If your little one is just learning to hold a crayon, this is the perfect first coloring book for them.

Every page features one big, friendly baby animal with thick, bold outlines that are easy for small hands to color inside. No tiny details to frustrate them, no complicated scenes — just simple, happy designs.

<b>Inside this book:</b>
✏️ 30+ cute baby animals — lions, elephants, giraffes, puppies, and more
🖍️ Extra-thick outlines, perfect for little hands
📄 One animal per page, printed single-side
📐 Big 8.5 x 8.5 inch pages with plenty of room to color
👶 Simple, friendly designs kids will love

Coloring helps young children build focus, fine motor skills, and color recognition — all while having fun away from screens. It makes a wonderful gift for birthdays, holidays, or quiet afternoons at home.

Grab a copy, hand over the crayons, and watch the coloring adventures begin. 💛`,
  price: '8.99',
};
