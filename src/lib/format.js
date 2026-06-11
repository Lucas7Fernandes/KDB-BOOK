/**
 * Funções de formatação reutilizáveis em toda a aplicação.
 */

const BR_NUMBER = new Intl.NumberFormat('pt-BR');

/** Formata número grande com separador de milhar PT-BR */
export const formatNumber = (n) => BR_NUMBER.format(n);

/** Formata valor monetário em USD com 2 casas decimais */
export const formatCurrency = (n) => `$${n.toFixed(2)}`;

/** Formata data ISO em formato curto PT-BR */
export const formatShortDate = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Calcula royalty KDP baseado no preço e custo de impressão.
 * - Até $9.99: 60% royalty − custo impressão
 * - Acima de $9.99: 35% royalty (sem desconto adicional)
 */
export function calculateRoyalty(price, printCost = 2.15) {
  if (price <= 9.99) return Math.max(0, price * 0.60 - printCost);
  return price * 0.35;
}

/** Soma tokens Claude (input + output) de um objeto usage */
export function sumTokens(usage) {
  if (!usage?.claude) return 0;
  return (usage.claude.input_tokens || 0) + (usage.claude.output_tokens || 0);
}

/**
 * URL permanente da imagem: prioriza o Google Drive (não expira),
 * com fallback para a URL do Replicate (expira em ~1h).
 * Requer que a pasta do Drive esteja compartilhada como
 * "Qualquer pessoa com o link pode ver".
 */
export function permanentImageUrl(item) {
  if (item?.drive_file_id) {
    return `https://lh3.googleusercontent.com/d/${item.drive_file_id}`;
  }
  return item?.image_url || '';
}
