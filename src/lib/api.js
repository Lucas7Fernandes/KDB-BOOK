/**
 * Camada de cliente HTTP para os serviços externos.
 *
 * Estratégia CORS:
 *   1. Make.com tem CORS habilitado por padrão — chamamos diretamente
 *   2. Se a chamada direta falhar (raro), fazemos retry via allorigins.win
 *   3. corsproxy.io foi removido (certificado SSL inválido em 2026)
 */

import { CONFIG } from '../data/config.js';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const CANVA_MCP_URL = 'https://mcp.canva.com/mcp';

const FALLBACK_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Faz um POST que tenta primeiro direto e, se falhar (CORS/rede),
 * tenta novamente via proxy.
 */
async function postWithFallback(url, body, signal, forceProxy = false) {
  const payload = JSON.stringify(body);

  // Tentativa 1: direto (Make.com tem CORS habilitado nativamente)
  if (!forceProxy) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal,
      });
      if (response.ok) return response.json();
      if (response.status < 500) return response.json();
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('[api] Direct call failed, trying proxy:', err.message);
    }
  }

  // Tentativa 2: via allorigins (SSL válido)
  const proxyUrl = `${FALLBACK_PROXY}${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    signal,
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} via proxy`);
  }
  return response.json();
}

export async function generateImage(item, options, signal) {
  const { webhookUrl, useProxy } = options;
  return postWithFallback(
    webhookUrl,
    { animal_en: item.en, animal_pt: item.pt },
    signal,
    useProxy
  );
}

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
    if (!response.ok) throw new Error(`Claude API HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractResponseText(data) {
  if (!data?.content) return '';
  return data.content
    .map((block) => {
      if (block.type === 'text') return block.text;
      if (block.type === 'mcp_tool_result') return block.content?.[0]?.text || '';
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export async function generateDescription(theme, kdpMeta) {
  const title = kdpMeta.title || `${theme.name} - Livro de Colorir Infantil`;
  const items = theme.items.map((i) => i.pt).join(', ');
  const keywords = [kdpMeta.kw1, kdpMeta.kw2, kdpMeta.kw3]
    .filter(Boolean).join(', ') || 'coloring book kids, animal coloring pages';

  const prompt =
    `Voce e especialista em copywriting para Amazon KDP. Crie uma descricao HTML otimizada para SEO.\n\n` +
    `Livro: ${title}\nTema: ${theme.name}\nItens: ${items}\n` +
    `Idade: 3 a 8 anos, 20 paginas\nKeywords-alvo: ${keywords}\n\n` +
    `Requisitos:\n- 750-900 caracteres\n- HTML com <b>, <ul>, <li>\n` +
    `- Portugues PT-BR natural\n` +
    `- Inclua: faixa etaria, numero de paginas, papel recomendado, ideal para presente, valor educacional\n` +
    `- SEM keyword stuffing\nRETORNE APENAS O HTML, sem markdown, sem explicacoes.`;

  const data = await callClaudeAPI({
    model: ANTHROPIC_MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = extractResponseText(data).replace(/```html|```/g, '').trim();
  if (text.length < 50) throw new Error('Resposta invalida do modelo. Tente novamente.');
  return text;
}

export async function createCanvaCover(theme) {
  const items = theme.items.slice(0, 6).map((i) => i.pt).join(', ');
  const prompt =
    `Crie uma capa profissional de livro de colorir infantil para Amazon KDP no Canva.\n\n` +
    `Livro: "${theme.name}: Livro de Colorir Infantil"\nItens em destaque: ${items}\n` +
    `Estilo: colorido, divertido, tipografia ousada para criancas\nPublico: criancas de 3 a 8 anos\n\n` +
    `Use o Canva para criar essa capa e retorne o link direto do design.`;
  const data = await callClaudeAPI({
    model: ANTHROPIC_MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    mcp_servers: [{ type: 'url', url: CANVA_MCP_URL, name: 'canva' }],
  });
  const text = extractResponseText(data);
  const urlMatch = text.match(/https:\/\/www\.canva\.com\/design\/[A-Za-z0-9_\-]+\/[A-Za-z0-9_\-]+/);
  return { url: urlMatch ? urlMatch[0] : null, text };
}
