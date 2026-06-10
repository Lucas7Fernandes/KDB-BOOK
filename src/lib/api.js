/**
 * Camada de cliente HTTP para os serviços externos.
 *
 * - generateImage: chama o webhook Make.com que gera uma imagem via FLUX Dev
 * - generateDescription: chama Claude API para gerar descrição HTML otimizada
 * - createCanvaCover: chama Claude API + MCP Canva para criar capa do livro
 */

import { CONFIG } from '../data/config.js';

const CORS_PROXY = 'https://corsproxy.io/?';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const CANVA_MCP_URL = 'https://mcp.canva.com/mcp';

/**
 * Gera uma imagem para um item específico.
 *
 * @param {{ en: string, pt: string }} item - Item a ser gerado
 * @param {{ webhookUrl: string, useProxy: boolean }} options
 * @param {AbortSignal} [signal] - Para cancelamento
 * @returns {Promise<{ image_url: string, usage: object }>}
 */
export async function generateImage(item, options, signal) {
  const { webhookUrl, useProxy } = options;
  const url = useProxy
    ? `${CORS_PROXY}${encodeURIComponent(webhookUrl)}`
    : webhookUrl;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      animal_en: item.en,
      animal_pt: item.pt,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${response.statusText}`);
  }

  return response.json();
}

/**
 * Cria uma chamada à Claude API com timeout via AbortController.
 */
async function callClaudeAPI(body, timeoutMs = 60_000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Claude API HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extrai texto de uma resposta da Claude API (lida com text + mcp_tool_result blocks).
 */
function extractResponseText(data) {
  if (!data?.content) return '';
  return data.content
    .map((block) => {
      if (block.type === 'text') return block.text;
      if (block.type === 'mcp_tool_result') {
        return block.content?.[0]?.text || '';
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Gera uma descrição HTML otimizada para Amazon KDP.
 *
 * @param {object} theme - Tema com name + items
 * @param {object} kdpMeta - Metadados atuais com title, keywords, etc.
 * @returns {Promise<string>} HTML pronto para colar na descrição do KDP
 */
export async function generateDescription(theme, kdpMeta) {
  const title = kdpMeta.title || `${theme.name} - Livro de Colorir Infantil`;
  const items = theme.items.map((i) => i.pt).join(', ');
  const keywords = [kdpMeta.kw1, kdpMeta.kw2, kdpMeta.kw3]
    .filter(Boolean)
    .join(', ') || 'coloring book kids, animal coloring pages';

  const prompt =
    `Voce e especialista em copywriting para Amazon KDP. Crie uma descricao HTML otimizada para SEO.\n\n` +
    `Livro: ${title}\n` +
    `Tema: ${theme.name}\n` +
    `Itens: ${items}\n` +
    `Idade: 3 a 8 anos, 20 paginas\n` +
    `Keywords-alvo: ${keywords}\n\n` +
    `Requisitos:\n` +
    `- 750-900 caracteres\n` +
    `- HTML com <b>, <ul>, <li>\n` +
    `- Portugues PT-BR natural\n` +
    `- Inclua: faixa etaria, numero de paginas, papel recomendado, ideal para presente, valor educacional\n` +
    `- SEM keyword stuffing\n` +
    `RETORNE APENAS O HTML, sem markdown, sem explicacoes.`;

  const data = await callClaudeAPI({
    model: ANTHROPIC_MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = extractResponseText(data)
    .replace(/```html|```/g, '')
    .trim();

  if (text.length < 50) {
    throw new Error('Resposta inválida do modelo. Tente novamente.');
  }
  return text;
}

/**
 * Cria uma capa de livro no Canva usando o MCP Canva.
 *
 * @param {object} theme - Tema do livro (name, items, emoji)
 * @returns {Promise<{ url: string|null, text: string }>}
 */
export async function createCanvaCover(theme) {
  const items = theme.items.slice(0, 6).map((i) => i.pt).join(', ');

  const prompt =
    `Crie uma capa profissional de livro de colorir infantil para Amazon KDP no Canva.\n\n` +
    `Livro: "${theme.name}: Livro de Colorir Infantil"\n` +
    `Itens em destaque: ${items}\n` +
    `Estilo: colorido, divertido, tipografia ousada para crianças\n` +
    `Público: crianças de 3 a 8 anos\n\n` +
    `Use o Canva para criar essa capa e retorne o link direto do design.`;

  const data = await callClaudeAPI({
    model: ANTHROPIC_MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    mcp_servers: [
      { type: 'url', url: CANVA_MCP_URL, name: 'canva' },
    ],
  });

  const text = extractResponseText(data);
  const urlMatch = text.match(
    /https:\/\/www\.canva\.com\/design\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-]+/
  );

  return {
    url: urlMatch ? urlMatch[0] : null,
    text,
  };
}
