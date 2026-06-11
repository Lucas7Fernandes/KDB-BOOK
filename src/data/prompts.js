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
 * Estilos de desenho disponíveis para o interior do livro.
 */
export const ART_STYLES = {
  classic: {
    name: 'Clássico',
    emoji: '🦁',
    description: 'Anatomia correta, habitat do tema',
  },
  cozy: {
    name: 'Cozy',
    emoji: '🍪',
    description: 'Cena aconchegante com objetinhos fofos',
  },
  baby: {
    name: 'Baby',
    emoji: '🐣',
    description: 'Bebê chibi, cabeça grande, olhos gigantes',
  },
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
export function buildFluxPrompt(item, themeId, style = 'classic') {
  const habitat = THEME_HABITATS[themeId] || 'simple clean background with minimal decorative elements';
  const type = subjectType(themeId, item.en);
  const isAnimal = type === 'animal';

  /* ── Estilo BABY: bebê chibi, cabeça enorme, olhos gigantes ── */
  if (style === 'baby') {
    return [
      `A black and white children's coloring book illustration of an adorable BABY ${item.en}, kawaii chibi style.`,
      `Character design (CRITICAL): oversized head taking up about HALF of the total body size,`,
      `HUGE round sparkling eyes with big white highlight circles, tiny chubby rounded body,`,
      `small sweet gentle smile, soft rounded simple shapes, irresistibly cute baby proportions.`,
      `Drawing rules (CRITICAL):`,
      `- EXTRA THICK bold black outlines, very chunky lines`,
      `- PURE WHITE background, completely EMPTY background, no scenery`,
      `- NO shading, NO gray tones, NO color, NO gradients`,
      `- Very simple, minimal details, perfect for toddlers ages 2 to 5`,
      `- All shapes CLOSED so kids can color inside`,
      `Composition: the baby character fills 75 percent of the frame, centered, full body visible.`,
      `Format: portrait orientation, ready for 8.5 x 11 inch KDP coloring book printing.`,
      `IMPORTANT: just bold line art, no color, empty white background.`,
    ].join(' ');
  }

  /* ── Estilo COZY: cena aconchegante estilo cozy/wholesome ── */
  if (style === 'cozy') {
    const activity = isAnimal
      ? 'doing a wholesome cozy activity like having a picnic, holding a tiny flower, sipping from a teacup, or reading a little book'
      : 'in a charming cozy wholesome setting';
    return [
      `A black and white children's coloring book illustration of a cute chibi ${item.en}, cozy wholesome style.`,
      `Scene: the character is ${activity},`,
      `surrounded by small adorable decorative objects: tiny hearts, little stars, small flowers, sparkles, cookies, or mushrooms.`,
      `Character design: rounded squishy soft proportions, simple dot eyes, tiny happy smile, plump cheeks, very huggable look.`,
      `Drawing rules (CRITICAL):`,
      `- THICK clean uniform black outlines throughout`,
      `- PURE WHITE background with only the small cute objects floating around`,
      `- NO shading, NO gray, NO color fills, NO gradients`,
      `- Simple rounded lines, cozy warm wholesome atmosphere`,
      `- All shapes CLOSED for easy coloring`,
      `Composition: character fills 65 percent of the frame, cute objects scattered around the edges.`,
      `Format: portrait orientation, ready for 8.5 x 11 inch KDP coloring book printing.`,
      `IMPORTANT: just line art for coloring, no color anywhere.`,
    ].join(' ');
  }

  /* ── Estilo CLASSIC (padrão): anatomia correta + habitat ── */
  const subjectLine = isAnimal
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

/**
 * Prompt para CAPA do livro — colorida, fofa e vibrante (diferente do
 * interior que é line art). Sem texto na imagem: o título é adicionado
 * no Canva para tipografia perfeita.
 */
export function buildCoverPrompt(theme, themeId) {
  const stars = theme.items.slice(0, 4).map((i) => i.en).join(', ');
  const habitatHint = {
    selva: 'lush green jungle with tropical leaves and flowers',
    fazenda: 'sunny farm with red barn and rolling green hills',
    oceano: 'bright underwater world with coral and bubbles',
    floresta: 'magical forest with tall trees and mushrooms',
    artico: 'sparkling snowy landscape with ice and northern lights',
    domesticos: 'cozy colorful home interior',
    dinos: 'prehistoric land with volcano and giant ferns',
    profissoes: 'cheerful town scene with buildings',
    veiculos: 'fun city road with sky and clouds',
    esportes: 'bright sports field with confetti',
    frutas: 'sunny orchard garden full of plants',
    espaco: 'deep space with colorful planets and twinkling stars',
    princesas: 'magical pink and purple fairytale kingdom with castle',
    natal: 'snowy christmas village with lights and decorations',
    pascoa: 'spring meadow full of colorful flowers',
    halloween: 'friendly halloween night with smiling moon and pumpkins',
  }[themeId] || 'colorful cheerful scene';

  return [
    `Children's coloring book COVER illustration, full vibrant colors.`,
    `Subject: adorable cute kawaii-style ${stars}, happy smiling faces, big sparkling eyes,`,
    `grouped together in a joyful composition in a ${habitatHint}.`,
    `Style: modern children's book illustration, soft rounded shapes, thick clean outlines,`,
    `bright saturated cheerful color palette, smooth digital art, professional quality.`,
    `Composition: characters fill the center, decorative elements around the edges,`,
    `generous empty space at the TOP THIRD of the image for title text placement.`,
    `Mood: joyful, warm, inviting, irresistibly cute, perfect for kids ages 3-8.`,
    `NO text, NO words, NO letters anywhere in the image.`,
    `Portrait orientation, book cover format.`,
  ].join(' ');
}
