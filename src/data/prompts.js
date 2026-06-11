/**
 * Construtor de prompts FLUX otimizados para livros de colorir infantis KDP.
 *
 * Gera o prompt completo NO FRONTEND, eliminando a dependência do Claude Haiku
 * no pipeline Make.com. O prompt é enviado pronto no campo `flux_prompt` do
 * webhook payload — o Make.com só precisa repassá-lo ao Replicate FLUX.
 *
 * Estrutura do prompt:
 *   1. Subject (sujeito específico)
 *   2. Style (coloring book line art rules)
 *   3. Composition (size, framing)
 *   4. Background (habitat específico ao tema)
 *   5. Mood (child-friendly)
 *   6. Format (portrait, KDP ready)
 */

/**
 * Habitat / cenário de fundo por tema.
 * Cada tema tem um cenário simples e contextual para o background.
 */
const THEME_HABITATS = {
  selva:       'lush jungle setting with simple palm leaves, hanging vines, small flowers, and a friendly sun in the corner',
  fazenda:     'farm scene with simple barn outline in background, grass tufts, wooden fence, and small fluffy clouds',
  oceano:      'underwater scene with simple bubbles, gentle wave lines, seaweed, and small coral pieces (no sun, no floor)',
  floresta:    'forest setting with simple pine trees, mushrooms, small flowers, and falling leaves',
  artico:      'arctic scene with icebergs, snowflakes falling, simple snow drifts, and gentle hills',
  domesticos:  'cozy home setting with a simple cushion, ball of yarn, food bowl, and a small window in background',
  dinos:       'prehistoric landscape with simple volcano in distance, large fern leaves, and small pebbles on the ground',
  profissoes:  'simple workplace background relevant to the profession, minimal tools or symbols of the job',
  veiculos:    'simple street, road, or sky background depending on vehicle type, with clouds or road lines',
  esportes:    'sports court or field with simple lines, goal posts, or relevant equipment in background',
  frutas:      'simple wooden table or basket setting with leaves or small details around',
  espaco:      'outer space scene with stars, small planets, and crescent moon shapes scattered in background',
  princesas:   'magical fairytale setting with castle silhouette, sparkles, stars, and simple clouds',
  natal:       'christmas scene with snowflakes, simple gift boxes, small christmas tree in background',
  pascoa:      'spring meadow with simple flowers, butterflies, small bushes, and pastel garden elements',
  halloween:   'spooky but kid-friendly scene with simple moon, bare tree branches, small pumpkins on ground',
};

/**
 * Artigo correto em inglês baseado no início da palavra.
 * Ex: "elephant" → "an", "lion" → "a"
 */
function article(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

/**
 * Categoria geral do sujeito — afeta o tipo de "subject" (animal, character, object, etc).
 */
function subjectType(themeId, itemEn) {
  if (themeId === 'profissoes') return 'character/person';
  if (themeId === 'veiculos') return 'vehicle';
  if (themeId === 'esportes') return 'character doing this sport activity';
  if (themeId === 'frutas') return 'fruit or vegetable';
  if (themeId === 'espaco') {
    if (['Saturn', 'Mars', 'Jupiter', 'planet Earth', 'moon', 'sun', 'star', 'galaxy', 'black hole'].includes(itemEn)) {
      return 'celestial object';
    }
    return 'space-themed subject';
  }
  if (themeId === 'princesas') return 'fairytale character or magical object';
  if (themeId === 'natal') return 'christmas-themed subject';
  if (themeId === 'pascoa') return 'easter-themed subject';
  if (themeId === 'halloween') return 'halloween-themed subject (kid-friendly, not scary)';
  return 'animal';
}

/**
 * Gera o prompt FLUX completo para um item específico em um tema.
 *
 * @param {object} item - { en, pt }
 * @param {string} themeId - chave do tema (selva, fazenda, etc)
 * @returns {string} prompt completo pronto para FLUX
 */
export function buildFluxPrompt(item, themeId) {
  const habitat = THEME_HABITATS[themeId] || 'simple clean background with minimal decorative elements';
  const type = subjectType(themeId, item.en);
  const subjectLine =
    type === 'animal'
      ? `a friendly cute ${item.en}, anatomically correct, with expressive happy face, full body visible`
      : `${article(item.en)} ${item.en}, child-friendly cartoon style, clear and recognizable`;

  return [
    `A black and white children's coloring book illustration of ${subjectLine}.`,
    `Setting: ${habitat}.`,
    `Style: classic professional coloring book line art for kids ages 3 to 8 years old.`,
    `Drawing rules (CRITICAL):`,
    `- ONLY thick bold black outlines, 3 to 4 pixels wide`,
    `- PURE WHITE background, completely empty fill, NO color anywhere`,
    `- NO shading, NO crosshatching, NO gray tones, NO gradients`,
    `- Simple clean curved lines, smooth and clear`,
    `- All shapes are CLOSED so kids can color inside without gaps`,
    `Composition: the ${type === 'celestial object' ? item.en : 'subject'} fills 70 to 80 percent of the frame, centered, full body or shape visible.`,
    `Mood: cheerful, friendly, expressive, age-appropriate cartoon style.`,
    `Format: portrait orientation, square borders, ready for 8.5 x 11 inch KDP coloring book printing.`,
    `IMPORTANT: this is for a children's coloring book. Just line art. No color. Pure white background.`,
  ].join(' ');
}
