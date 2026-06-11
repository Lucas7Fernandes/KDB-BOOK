/**
 * Gerador local de descrição KDP — instantâneo, sem API, sem custo.
 *
 * Produz HTML em INGLÊS (mercado Amazon.com) seguindo as melhores
 * práticas de listing: hook emocional, bullets de benefícios,
 * especificações do produto e CTA de presente.
 */

const CATEGORY_HOOKS = {
  animais: (name) =>
    `Does your little one love animals? <b>${name}</b> brings their favorite creatures to life, one crayon stroke at a time!`,
  educativo: (name) =>
    `Learning has never been this fun! <b>${name}</b> combines creative play with early education in every page.`,
  personagens: (name) =>
    `Step into a world of wonder! <b>${name}</b> sparks imagination with magical characters kids adore.`,
  datas: (name) =>
    `Make the season extra special! <b>${name}</b> is the perfect holiday activity to share with your little ones.`,
};

/**
 * Gera a descrição HTML completa.
 *
 * @param {object} theme - tema ativo (name, items, cat)
 * @param {object} kdpMeta - metadados (title, price...)
 * @returns {string} HTML pronto para colar no KDP (700-1100 chars)
 */
export function buildDescription(theme, kdpMeta) {
  const title = kdpMeta.title?.trim() || `${theme.name} Coloring Book for Kids`;
  const hook = (CATEGORY_HOOKS[theme.cat] || CATEGORY_HOOKS.animais)(title);

  const sampleItems = theme.items
    .slice(0, 6)
    .map((i) => i.en.charAt(0).toUpperCase() + i.en.slice(1))
    .join(', ');

  return [
    `<p>${hook}</p>`,
    `<p>Inside this book, young artists will discover <b>20 adorable, hand-crafted illustrations</b> featuring ${sampleItems} and many more — each drawn with thick, easy-to-color lines perfect for small hands.</p>`,
    `<p><b>Why parents and kids love this book:</b></p>`,
    `<ul>`,
    `<li><b>Perfect for ages 3-8</b> — simple enough for toddlers, fun for big kids too</li>`,
    `<li><b>Large 8.5 x 11 inch pages</b> — plenty of room for creativity</li>`,
    `<li><b>Single-sided printing</b> — no bleed-through, safe for markers</li>`,
    `<li><b>Bold, thick outlines</b> — builds confidence and fine motor skills</li>`,
    `<li><b>Cute, friendly designs</b> — every page brings a smile</li>`,
    `</ul>`,
    `<p>Screen-free fun that develops focus, creativity and hand-eye coordination. A wonderful gift idea for <b>birthdays, holidays and rainy afternoons</b>!</p>`,
    `<p>Scroll up and click <b>Add to Cart</b> to start the coloring adventure today! 🎨</p>`,
  ].join('');
}
