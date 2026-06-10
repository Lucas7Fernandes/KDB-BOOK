/**
 * Utilitários para exportação do histórico em diferentes formatos.
 *
 * Formatos:
 *   - csv: planilha com URLs e metadados
 *   - json: dados estruturados (para APIs ou scripts)
 *   - html: documento print-ready com 1 imagem por página (PDF KDP)
 */

import { THEMES } from '../data/themes.js';

/**
 * Filtra histórico por tema. "all" retorna tudo.
 */
function filterByTheme(history, themeId) {
  if (themeId === 'all') return history;
  return history.filter((h) => h.theme === themeId);
}

/**
 * Faz download de um Blob criando um link temporário.
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapa um campo CSV (envolve em aspas e duplica aspas internas).
 */
function csvField(value) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exporta histórico como CSV.
 */
export function exportCSV(history, themeId) {
  const items = filterByTheme(history, themeId);
  if (items.length === 0) return { ok: false, count: 0 };

  const header = ['Nome PT', 'Nome EN', 'Image URL', 'Tema', 'Tempo (s)', 'Data']
    .map(csvField)
    .join(',');

  const rows = items.map((h) =>
    [
      h.animal_pt,
      h.animal_en,
      h.image_url || '',
      THEMES[h.theme]?.name || h.theme || '',
      h.elapsed,
      h.completedAt,
    ].map(csvField).join(',')
  );

  const content = [header, ...rows].join('\n');
  downloadBlob(content, `kdp-${themeId}.csv`, 'text/csv;charset=utf-8;');
  return { ok: true, count: items.length };
}

/**
 * Exporta histórico como JSON estruturado.
 */
export function exportJSON(history, themeId) {
  const items = filterByTheme(history, themeId);
  if (items.length === 0) return { ok: false, count: 0 };

  const data = items.map((h) => ({
    animal_pt: h.animal_pt,
    animal_en: h.animal_en,
    image_url: h.image_url,
    theme: h.theme || '',
    theme_name: THEMES[h.theme]?.name || '',
    elapsed_seconds: parseFloat(h.elapsed),
    date: h.completedAt,
    tokens: h.usage
      ? (h.usage.claude?.input_tokens || 0) + (h.usage.claude?.output_tokens || 0)
      : 0,
  }));

  const content = JSON.stringify(data, null, 2);
  downloadBlob(content, `kdp-${themeId}.json`, 'application/json');
  return { ok: true, count: items.length };
}

/**
 * Exporta um HTML print-ready com 1 imagem por página em formato 8.5"×11" (KDP).
 * Para gerar o PDF: abra o HTML no navegador → Ctrl+P → Salvar como PDF.
 */
export function exportInteriorHTML(history, themeId) {
  const items = filterByTheme(history, themeId);
  if (items.length === 0) return { ok: false, count: 0 };

  const themeName = themeId === 'all'
    ? 'Coloring Book'
    : THEMES[themeId]?.name || themeId;

  const pages = items
    .map(
      (h) => `
    <div class="page">
      <img src="${h.image_url}" alt="${h.animal_pt}" onerror="this.style.opacity=.2" />
      <p class="label">${h.animal_pt}</p>
    </div>`
    )
    .join('');

  const content = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${themeName} — KDP Interior</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: 8.5in 11in;
      margin: 0.375in 0.375in 0.375in 0.5in;
    }
    body { font-family: 'Helvetica', Arial, sans-serif; background: white; color: black; }
    .page {
      width: 100%;
      height: 10.25in;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      break-after: page;
    }
    .page:last-child { page-break-after: auto; }
    .page img {
      max-width: 100%;
      max-height: 9.3in;
      object-fit: contain;
    }
    .label {
      margin-top: 12px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      color: #333;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>${pages}</body>
</html>`;

  downloadBlob(content, `interior-${themeId}.html`, 'text/html');
  return { ok: true, count: items.length };
}

/**
 * Função única de dispatch para todos os formatos.
 */
export function exportHistory(history, themeId, format) {
  switch (format) {
    case 'csv': return exportCSV(history, themeId);
    case 'json': return exportJSON(history, themeId);
    case 'html': return exportInteriorHTML(history, themeId);
    default: throw new Error(`Formato desconhecido: ${format}`);
  }
}
