import { THEME_HABITATS } from './prompts.js';

/**
 * Prompt FLUX para converter foto real em coloring book.
 * Funciona em 2 modos:
 *   - convert: só converte para line art (sem tema)
 *   - theme: converte + insere no habitat do tema escolhido
 */
export function buildPhotoPrompt(subjectName, style, themeId) {
  const name = subjectName?.trim() || 'the character';
  const habitat = themeId ? (THEME_HABITATS[themeId] || 'simple clean background') : null;

  const styleRules = style === 'baby'
    ? 'kawaii chibi style, oversized round head, huge sparkling eyes, tiny chubby body, very cute baby proportions'
    : style === 'cozy'
      ? 'cute rounded chibi proportions, simple dot eyes, cozy wholesome atmosphere'
      : 'friendly cartoon style, expressive face, clear recognizable features';

  const setting = habitat
    ? `Setting: ${habitat}.`
    : 'Setting: plain white background, no scenery.';

  return [
    `A black and white children's coloring book line art illustration of ${name},`,
    `drawn as a cute cartoon character based on the reference image provided.`,
    `${styleRules}.`,
    setting,
    `Drawing rules (CRITICAL):`,
    `- THICK bold black outlines only, no color fills`,
    `- PURE WHITE background, no shading, no gray tones, no gradients`,
    `- Keep the general likeness and recognizable features of the person in the reference`,
    `- Transform into coloring book line art style while preserving identity`,
    `- All shapes CLOSED so kids can color inside`,
    `Composition: character fills 75 percent of frame, centered, full body visible.`,
    `Format: portrait orientation, ready for 8.5 x 11 inch KDP coloring book printing.`,
    `IMPORTANT: just bold line art, no color, white background.`,
  ].join(' ');
}
