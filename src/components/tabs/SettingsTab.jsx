import { THEMES, totalItems } from '../../data/themes.js';
import { CATEGORIES } from '../../data/categories.js';
import { CONFIG } from '../../data/config.js';
import { SectionGroup, Button } from '../ui.jsx';
import { formatNumber } from '../../lib/format.js';

/**
 * Aba Configurações — webhook URL, proxy CORS, estatísticas e ações de reset.
 */
export function SettingsTab({
  webhookUrl,
  setWebhookUrl,
  photoWebhookUrl,
  setPhotoWebhookUrl,
  history,
  setHistory,
  setBookStatus,
  setKdpCheck,
  setKdpMeta,
  defaultKdpMeta,
  showToast,
}) {
  const totalImages = history.length;

  const totalCost = ((totalImages * CONFIG.COST_PER_IMAGE) || 0).toFixed(2);

  const resetWebhook = () => {
    setWebhookUrl(CONFIG.WEBHOOK_URL);
    showToast('Webhook restaurado para o padrão');
  };

  const clearAll = () => {
    if (
      !window.confirm(
        'Apagar TODOS os dados (histórico, status de livros, checklist KDP e metadados)? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }
    setHistory([]);
    setBookStatus({});
    setKdpCheck({});
    setKdpMeta(defaultKdpMeta);
    showToast('Todos os dados foram apagados');
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <SectionGroup
        label="Webhook Make.com"
        hint="Endpoint que recebe { animal_en, animal_pt } e retorna a imagem gerada. Salvo automaticamente."
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="input input-mono"
            style={{ flex: 1 }}
            aria-label="URL do webhook"
          />
          <Button onClick={resetWebhook}>Restaurar padrão</Button>
        </div>
      </SectionGroup>

      <SectionGroup
        label="Webhook: Foto para Colorir"
        hint="URL do cenário Make.com para converter fotos em desenhos. Criado automaticamente."
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={photoWebhookUrl}
            onChange={(e) => setPhotoWebhookUrl(e.target.value)}
            className="input input-mono"
            style={{ flex: 1 }}
          />
        </div>
      </SectionGroup>

      <SectionGroup
        label="Proxy CORS (descontinuado)"
        hint="Habilite se o Make.com bloquear chamadas diretas do browser. Usa corsproxy.io como intermediário."
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          ✓ Proxy removido — o portal usa <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>application/x-www-form-urlencoded</code> que é uma "simple request" CORS, dispensando proxy.
        </p>
      </SectionGroup>

      <SectionGroup label="Estatísticas globais">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          <StatCard label="Temas disponíveis" value={Object.keys(THEMES).length} suffix="livros" />
          <StatCard label="Categorias" value={Object.keys(CATEGORIES).length} suffix="grupos" />
          <StatCard label="Total de itens" value={totalItems()} suffix="únicos" />
          <StatCard label="Imagens geradas" value={formatNumber(totalImages)} suffix="histórico" highlight />
          <StatCard label="Custo acumulado" value={`$${totalCost}`} suffix="todas sessões" color="var(--warning)" />
          <StatCard
            label="Make credits"
            value={formatNumber(totalImages)}
            suffix={`/ ${formatNumber(1000)} mês`}
            color="var(--info)"
          />
        </div>
      </SectionGroup>

      <SectionGroup label="Zona de perigo">
        <div
          style={{
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
          }}
        >
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-md)', color: 'var(--text-secondary)' }}>
            Apaga histórico, status de livros, checklist KDP e metadados.
            A ação não pode ser desfeita.
          </p>
          <Button variant="error" onClick={clearAll}>
            🗑 Apagar todos os dados
          </Button>
        </div>
      </SectionGroup>
    </div>
  );
}

function StatCard({ label, value, suffix, color, highlight }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
      }}
    >
      <div style={{ fontSize: 9, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: color || (highlight ? 'var(--accent)' : 'var(--text-primary)'),
          marginTop: 4,
        }}
      >
        {value}
      </div>
      {suffix && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginTop: 2 }}>{suffix}</div>
      )}
    </div>
  );
}
