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
export const THEME_HABITATS = {
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
      `Black and white line art coloring page for kids. Pure clean line drawing, NO fill, NO shading whatsoever.`,
      `Subject: an adorable BABY ${item.en} in kawaii chibi style.`,
      `Character design (CRITICAL): oversized head taking up about HALF of the total body size,`,
      `HUGE round eyes drawn as simple outlines with small highlight circles (eyes must be OUTLINED only, NEVER filled black),`,
      `tiny chubby rounded body, small sweet gentle smile, soft rounded simple shapes, irresistibly cute baby proportions.`,
      `STRICT line-art rules (most important):`,
      `- The ENTIRE drawing is made of clean BLACK OUTLINES on PURE WHITE only`,
      `- Absolutely NO black fills, NO solid black areas, NO gray, NO grayscale, NO shading, NO shadows, NO gradients, NO hatching`,
      `- Even dark animals (like a black cat) must be drawn as WHITE with only black outlines, so children can color them`,
      `- EXTRA THICK uniform bold outlines, chunky confident lines of even weight`,
      `- Completely EMPTY pure white background, no scenery, no floor, no shadow under the character`,
      `- Very simple, minimal interior detail, suitable for toddlers ages 1 to 4`,
      `- All shapes fully CLOSED so kids can color inside`,
      `COMPOSITION (very important for a consistent book): the baby ${item.en} is CENTERED and fills about 80 percent of a TALL PORTRAIT frame,`,
      `full body always fully visible from top to bottom with a small even margin of white space on all four sides,`,
      `the character sized large and consistent so every page in the book matches, never tiny, never cropped or cut off at the edges.`,
      `Output: high-contrast crisp black-and-white coloring book line art, like a printable coloring page, tall portrait 8.5x11 page ratio.`,
    ].join(' ');
  }

  /* ── Estilo COZY: cena aconchegante estilo cozy/wholesome ── */
  if (style === 'cozy') {
    // Variações de cena para evitar repetição — determinístico por item
    const COZY_SCENES = [
      {
        activity: 'having a cozy picnic, sitting on a checkered blanket with a tiny basket',
        props: 'small sandwiches, a teapot, butterflies, and little daisies around',
      },
      {
        activity: 'reading a tiny book under a big mushroom, sitting on a pebble',
        props: 'small snails, dewdrops, clovers, and tiny lanterns floating nearby',
      },
      {
        activity: 'watering a little garden with a tiny watering can',
        props: 'small sprouting plants, a sun peeking from corner, ladybugs, and a little fence',
      },
      {
        activity: 'baking cookies, wearing a tiny apron, stirring a bowl',
        props: 'floating stars, tiny rolling pin, small cookies, steam swirls above',
      },
      {
        activity: 'wrapped in a cozy blanket, holding a hot cocoa mug with steam',
        props: 'snowflakes, small mittens, a little candle, cozy stars around',
      },
      {
        activity: 'playing with soap bubbles, arms stretched out joyfully',
        props: 'floating bubbles each with tiny sparkle, small rainbow, little clouds',
      },
      {
        activity: 'sitting on a cloud, fishing with a tiny rod down below',
        props: 'small stars, moon crescent, twinkling dots, little birds nearby',
      },
      {
        activity: 'planting a tiny seed in a small pot with a little shovel',
        props: 'a smiling sun, small worm, tiny sprouting plant, seed packets',
      },
    ];

    // Hash simples e determinística para variar por item.en
    const hash = item.en.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const scene = COZY_SCENES[hash % COZY_SCENES.length];

    const activity = isAnimal
      ? scene.activity
      : `in a charming cozy wholesome setting, ${scene.activity}`;

    return [
      `A black and white children's coloring book illustration of a cute chibi ${item.en}, cozy wholesome style.`,
      `Scene: the character is ${activity},`,
      `with ${scene.props}.`,
      `Character design: rounded squishy soft proportions, simple dot eyes, tiny happy smile, plump cheeks, very huggable look.`,
      `Drawing rules (CRITICAL):`,
      `- THICK clean uniform black outlines throughout`,
      `- PURE WHITE background with only the small cute scene objects floating around`,
      `- NO shading, NO gray, NO color fills, NO gradients`,
      `- Simple rounded lines, cozy warm wholesome atmosphere`,
      `- All shapes CLOSED for easy coloring`,
      `Composition: character fills 65 percent of the frame, scene objects scattered gently around.`,
      `Format: portrait orientation, ready for 8.5 x 11 inch KDP coloring book printing.`,
      `IMPORTANT: just line art for coloring, no color anywhere.`,
    ].join(' ');
  }

  /* ── Estilo CLASSIC (padrão): anatomia correta + habitat ── */
  const subjectLine = isAnimal
    ? `a friendly cute ${item.en}, anatomically correct, with expressive happy face, full body visible`
    : `${article(item.en)} ${item.en}, child-friendly cartoon style, clear and recognizable`;

  return [
    `Black and white line art coloring page for kids. Pure clean line drawing, NO fill, NO shading whatsoever.`,
    `Subject: ${subjectLine}.`,
    `Setting: ${habitat}.`,
    `Style: classic professional coloring book line art for kids ages 3 to 8 years old.`,
    `STRICT line-art rules (most important):`,
    `- The ENTIRE drawing is made of clean BLACK OUTLINES on PURE WHITE only`,
    `- Absolutely NO black fills, NO solid black areas, NO gray, NO grayscale, NO shading, NO shadows, NO gradients, NO crosshatching`,
    `- Even dark subjects must be drawn as WHITE with only black outlines, so children can color them`,
    `- Thick bold uniform black outlines, smooth confident curved lines`,
    `- Completely empty pure white background, no shadow under the subject`,
    `- All shapes fully CLOSED so kids can color inside without gaps`,
    `Composition: the ${type === 'celestial object' ? item.en : 'subject'} fills 70 to 80 percent of the frame, centered, full body or shape visible.`,
    `Mood: cheerful, friendly, expressive, age-appropriate cartoon style.`,
    `Output: high-contrast crisp black-and-white coloring book line art, like a printable coloring page.`,
  ].join(' ');
}

/**
 * Prompt para CAPA do livro — colorida, fofa e vibrante (diferente do
 * interior que é line art). Sem texto na imagem: o título é adicionado
 * no Canva para tipografia perfeita.
 */
export function buildCoverPrompt(theme, themeId, bookTitle, messy = false) {
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
    personagens_originais: 'bright playful scene with colorful shapes and stars',
  }[themeId] || 'colorful cheerful scene';

  const titleLine = bookTitle && bookTitle.trim()
    ? `At the top third, the title text ${bookTitle.trim()} written in big, fun, chunky hand-drawn CRAYON lettering, each letter a different bright color, slightly uneven and playful like a child wrote it, with bold black outline around each letter so it pops.`
    : `Leave generous empty space at the TOP THIRD for a title to be added later.`;

  const coloringStyle = messy
    ? [
        `COLORING STYLE (very important): it must look like a REAL YOUNG CHILD colored it with crayons, charmingly imperfect and messy.`,
        `Keep THICK BOLD BLACK OUTLINES clearly visible underneath (a coloring book line drawing showing through).`,
        `The crayon coloring is loose and playful: scribbly visible crayon strokes, color going OUTSIDE the lines in many places,`,
        `some areas left only partly colored or completely WHITE and unfinished, uneven pressure, patches of overlapping colors,`,
        `streaky waxy crayon texture, NOT neat, NOT filled completely, like a happy toddler colored it in a hurry.`,
      ].join(' ')
    : [
        `CRITICAL coloring style: keep THICK BOLD BLACK OUTLINES clearly visible on everything (like a coloring book line drawing),`,
        `then filled in with bright CRAYON coloring on top, visible crayon texture, slightly uneven strokes,`,
        `a little coloring going outside the lines here and there, the charming imperfect look of a happy child coloring with a crayon box.`,
      ].join(' ');

  return [
    `A childrens coloring book COVER that looks like the pages were COLORED IN BY A CHILD with crayons.`,
    `Subject: adorable cute kawaii-style ${stars}, happy smiling faces, big sparkling eyes,`,
    `grouped together joyfully in a ${habitatHint}.`,
    coloringStyle,
    `Bright saturated primary crayon colors (red, blue, yellow, green, orange, purple).`,
    titleLine,
    `Mood: joyful, warm, inviting, irresistibly cute, eye-catching on a store shelf, perfect for kids ages 1 to 8.`,
    `Portrait orientation, book cover format, white or soft pastel background border.`,
  ].join(' ');
}
