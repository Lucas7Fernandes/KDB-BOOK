/**
 * Cliente HTTP do webhook Make.com.
 *
 * CORS: application/x-www-form-urlencoded e "simple request" (sem preflight)
 * e o Make parseia os campos nativamente.
 *
 * O prompt FLUX e gerado no frontend (data/prompts.js) e enviado pronto
 * no campo flux_prompt — o Make passa direto ao Replicate.
 */

import { buildFluxPrompt, buildCoverPrompt } from '../data/prompts.js';

async function postWebhook(webhookUrl, fields, signal) {
  // Sanitiza o flux_prompt: aspas, quebras de linha e caracteres de controle
  // quebram o JSON que o Make monta para o Replicate (causa 400 Bad Request).
  const clean = { ...fields };
  if (clean.flux_prompt) {
    clean.flux_prompt = clean.flux_prompt
      .replace(/["""'']/g, '')      // remove aspas retas e curvas
      .replace(/[\r\n\t]+/g, ' ')    // quebras de linha e tabs viram espaço
      .replace(/[—–]/g, '-')         // travessões viram hífen simples
      .replace(/\s+/g, ' ')          // colapsa espaços múltiplos
      .trim();
  }

  const params = new URLSearchParams(clean);

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    signal,
    mode: 'cors',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 200) || response.statusText}`);
  }

  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Resposta nao-JSON do webhook: ${raw.slice(0, 200)}`);
  }
}

/**
 * Gera uma imagem de colorir (line art) para um item.
 */
export async function generateImage(item, options, signal) {
  const { webhookUrl, themeId, style } = options;
  return postWebhook(
    webhookUrl,
    {
      animal_en: item.en,
      animal_pt: item.pt,
      flux_prompt: buildFluxPrompt(item, themeId, style),
      theme: themeId,
      style: style || 'classic',
    },
    signal
  );
}

/**
 * Gera a CAPA colorida do livro via o mesmo pipeline FLUX.
 * A imagem e salva automaticamente no Google Drive pelo Make.
 */
export async function generateCover(theme, themeId, webhookUrl, signal, bookTitle, messy) {
  const fields = {
    animal_en: `${themeId}-book-cover`,
    animal_pt: `Capa — ${theme.name}`,
    flux_prompt: buildCoverPrompt(theme, themeId, bookTitle, messy),
    theme: themeId,
  };
  // Guidance baixo solta o FLUX da estetica polida e permite o look "mal pintado".
  if (messy) fields.guidance = '2';
  return postWebhook(webhookUrl, fields, signal);
}

/**
 * Lista os arquivos da pasta do Google Drive via rota "sync" do Make.
 * Retorna [{ drive_file_id, name, theme, animal_en }].
 * Custo: ~3 operações Make por chamada (sem custo Replicate).
 */
export async function syncDrive(webhookUrl, signal) {
  const data = await postWebhook(webhookUrl, { action: 'sync' }, signal);
  const ids = (data.ids || '').split(',').filter(Boolean);
  const names = (data.names || '').split(',').filter(Boolean);

  return ids.map((id, i) => {
    const name = names[i] || '';
    const base = name.replace(/\.jpe?g$/i, '');
    let theme = null;
    let animalEn = base;

    if (base.includes('__')) {
      // Formato novo: tema__animal.jpg
      const [t, ...rest] = base.split('__');
      theme = t || null;
      animalEn = rest.join('__') || base;
    } else {
      // Formato legado: animal-coloring-book.jpg
      animalEn = base.replace(/-coloring-book$/i, '');
    }

    return { drive_file_id: id, name, theme, animal_en: animalEn };
  });
}
