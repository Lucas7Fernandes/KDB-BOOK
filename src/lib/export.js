/**
 * Utilitários para exportação do histórico em diferentes formatos.
 *
 * Formatos:
 *   - csv: planilha com URLs e metadados
 *   - json: dados estruturados (para APIs ou scripts)
 *   - html: documento print-ready com 1 imagem por página (PDF KDP)
 */

import { THEMES } from '../data/themes.js';
import { permanentImageUrl, permanentImageUrlHiRes } from './format.js';
import { resolveEnglishName } from '../data/animal-names-en.js';

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
      permanentImageUrl(h),
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
    image_url: permanentImageUrl(h),
    replicate_url: h.image_url || '',
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
 * Exporta um HTML print-ready com páginas de abertura (título + "This book
 * belongs to") e 1 imagem por página em formato 8.5"×11" (KDP).
 * Para gerar o PDF: abra o HTML no navegador → Ctrl+P → Salvar como PDF.
 */
export function exportInteriorHTML(history, themeId, meta = {}) {
  const items = filterByTheme(history, themeId);
  if (items.length === 0) return { ok: false, count: 0 };

  const bookTitle = meta.title?.trim() || 'My First Coloring Book';
  const bookSubtitle = meta.subtitle?.trim() || '';
  const titleLines = bookTitle.split(/\s+/).length > 2
    ? bookTitle.replace(/^(\S+\s\S+)\s/, '$1<br>')
    : bookTitle;

  const openingPages = `
    <div class="page title-page">
      <p class="title-main">${titleLines}</p>
      ${bookSubtitle ? `<p class="title-sub">${bookSubtitle}</p>` : ''}
      <p class="title-note">Big &amp; easy designs for little hands</p>
    </div>
    <div class="page belongs-page">
      <div class="belongs-frame">
        <p class="belongs-label">This book belongs to</p>
        <div class="belongs-line"></div>
        <p class="belongs-hint">&#9733; &#9734; &#9733;</p>
      </div>
    </div>`;

  const pages = items
    .map((h) => {
      const name = resolveEnglishName(h);
      const hi = permanentImageUrlHiRes(h);
      return `
    <div class="page">
      <div class="art"><img src="${hi}" alt="${name}" onerror="this.style.opacity=.15" /></div>
      <p class="label" contenteditable="true" spellcheck="false" data-placeholder="(type name)">${name}</p>
    </div>`;
    })
    .join('');

  const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${bookTitle} — KDP Interior</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 8.5in 8.5in; margin: 0; }
    html, body { background: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Fredoka', sans-serif; }

    .toolbar {
      position: sticky; top: 0; z-index: 10;
      background: #1a1a1a; color: #fff; padding: 12px 18px;
      font-family: 'Fredoka', sans-serif; font-size: 14px;
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    }
    .toolbar b { color: #ffd27a; }
    .toolbar button {
      background: #e8602c; color: #fff; border: none; border-radius: 8px;
      padding: 8px 16px; font-weight: 700; cursor: pointer; font-family: inherit; font-size: 14px;
    }
    @media print { .toolbar { display: none; } }

    .page {
      width: 8.5in; height: 8.5in;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      page-break-after: always; break-after: page;
      padding: 0.55in 0.5in 0.45in 0.65in;
      position: relative;
      margin: 0 auto;
    }
    .page:last-child { page-break-after: auto; }
    @media screen {
      .page { box-shadow: 0 2px 16px rgba(0,0,0,.12); margin: 16px auto; }
    }

    .art { flex: 1 1 auto; width: 100%; display: flex; align-items: center; justify-content: center; min-height: 0; }
    .art img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }

    .label {
      margin-top: 0.12in;
      font-family: 'Baloo 2', cursive;
      font-size: 30px; font-weight: 700;
      color: #2b2b2b; text-align: center; letter-spacing: 0.02em;
      min-width: 2in; padding: 2px 10px; border-radius: 8px;
      outline: none;
    }
    .label:empty:before {
      content: attr(data-placeholder); color: #c00; font-style: italic; font-weight: 500;
    }
    @media screen {
      .label:hover, .label:focus { background: #fff5e6; box-shadow: inset 0 0 0 2px #e8602c33; }
    }

    .title-page { justify-content: center; }
    .title-main { font-family: 'Baloo 2', cursive; font-size: 62px; font-weight: 800; line-height: 1.05; color: #1a1a1a; text-align: center; margin-bottom: 0.25in; }
    .title-sub { font-family: 'Baloo 2', cursive; font-size: 40px; font-weight: 700; color: #e8602c; text-align: center; letter-spacing: 0.03em; margin-bottom: 0.5in; }
    .title-note { font-family: 'Fredoka', sans-serif; font-size: 22px; color: #888; text-align: center; }

    .belongs-frame { border: 3px dashed #cfcfcf; border-radius: 28px; padding: 0.9in 1in; text-align: center; }
    .belongs-label { font-family: 'Baloo 2', cursive; font-size: 40px; font-weight: 700; margin-bottom: 0.6in; color: #2b2b2b; }
    .belongs-line { width: 4in; border-bottom: 3px solid #1a1a1a; margin: 0 auto 0.5in; height: 0.7in; }
    .belongs-hint { font-size: 34px; letter-spacing: 0.4em; color: #e8602c; }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>📖 <b>${items.length} páginas</b> · formato 8,5×8,5" pronto para KDP</span>
    <span>✏️ Clique em qualquer nome para editar ou preencher os em branco</span>
    <button onclick="window.print()">🖨 Salvar como PDF</button>
  </div>
  ${openingPages}${pages}
</body>
</html>`;

  downloadBlob(content, `interior-${themeId}.html`, 'text/html');
  return { ok: true, count: items.length };
}

/**
 * Função única de dispatch para todos os formatos.
 */
export function exportHistory(history, themeId, format, meta = {}) {
  switch (format) {
    case 'csv': return exportCSV(history, themeId);
    case 'json': return exportJSON(history, themeId);
    case 'html': return exportInteriorHTML(history, themeId, meta);
    default: throw new Error(`Formato desconhecido: ${format}`);
  }
}
