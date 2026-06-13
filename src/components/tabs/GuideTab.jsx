import { useState } from 'react';

/**
 * Aba Guia — documentação visual da estratégia de negócio KDP.
 * Conteúdo navegável por seções, estilo "giz de cera sobre papel".
 */

const CRAYON = {
  red: '#E8533F', blue: '#3B82C4', yellow: '#F2B33D',
  green: '#5BA672', purple: '#8B6CB0',
};

const SECTIONS = [
  { id: 'como',      icon: '🎨', label: 'Como funciona' },
  { id: 'primeiro',  icon: '📖', label: '1º livro' },
  { id: 'nicho',     icon: '🎯', label: 'Nicho' },
  { id: 'financas',  icon: '💰', label: 'Finanças' },
  { id: 'roi',       icon: '📈', label: 'ROI' },
  { id: 'publicar',  icon: '🚀', label: 'Publicar' },
  { id: 'plano',     icon: '🗓', label: 'Plano' },
];

export function GuideTab() {
  const [active, setActive] = useState('como');

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: 'var(--space-6) var(--space-4) var(--space-5)',
        background: 'radial-gradient(circle at 20% 30%, rgba(232,83,63,0.07), transparent 45%), radial-gradient(circle at 80% 25%, rgba(59,130,196,0.07), transparent 45%)',
        borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-5)',
      }}>
        <div style={{ fontSize: 40, letterSpacing: -6, marginBottom: 8 }}>🖍️🎨🖍️</div>
        <h2 style={{ fontSize: 'var(--text-2xl)', margin: '0 0 8px', lineHeight: 1.1 }}>
          Guia: ganhe dinheiro com livros de colorir
        </h2>
        <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: 'var(--text-md)' }}>
          Estratégia completa, simples e visual — do primeiro livro ao portfólio.
        </p>
        <span style={{
          display: 'inline-block', marginTop: 'var(--space-3)', background: CRAYON.green,
          color: 'white', fontWeight: 800, padding: '8px 18px', borderRadius: 999, fontSize: 'var(--text-sm)',
        }}>
          Investimento por livro: ~$1,23 · Sem estoque · Sem risco
        </span>
      </div>

      {/* Sub-nav */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
        marginBottom: 'var(--space-5)', scrollbarWidth: 'none',
      }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
              fontWeight: 700, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap',
              border: `2px solid ${active === s.id ? 'var(--accent)' : 'var(--border-default)'}`,
              background: active === s.id ? 'var(--accent-bg)' : 'var(--bg-base)',
              color: active === s.id ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="fade-in-up">
        {active === 'como'     && <Como />}
        {active === 'primeiro' && <Primeiro />}
        {active === 'nicho'    && <Nicho />}
        {active === 'financas' && <Financas />}
        {active === 'roi'      && <Roi />}
        {active === 'publicar' && <Publicar />}
        {active === 'plano'    && <Plano />}
      </div>
    </div>
  );
}

/* ─── Componentes auxiliares ─── */

function Eyebrow({ color, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color, marginBottom: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      {children}
    </span>
  );
}

function H({ children }) {
  return <h3 style={{ fontSize: 'var(--text-xl)', margin: '0 0 6px', lineHeight: 1.2 }}>{children}</h3>;
}

function Lead({ children }) {
  return <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-md)', margin: '0 0 var(--space-5)', lineHeight: 1.6 }}>{children}</p>;
}

function Callout({ icon, children, color = 'var(--warning)', bg = '#FFF6E6' }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: bg, border: `2px solid ${color}`, borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginTop: 'var(--space-4)' }}>
      <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>{children}</p>
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="card" style={{ padding: 'var(--space-4)' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 'var(--text-md)' }}>{title}</p>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

function CardGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>{children}</div>;
}

function BigNum({ n, label, color }) {
  return (
    <div style={{ textAlign: 'center', background: 'var(--bg-surface)', border: '2px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '18px 12px' }}>
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color }}>{n}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 6, fontWeight: 700 }}>{label}</div>
    </div>
  );
}

function BigNumRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 12, margin: '4px 0 var(--space-5)' }}>{children}</div>;
}

function Table({ head, rows }) {
  return (
    <div style={{ border: '2px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ background: 'var(--text-primary)', color: 'var(--bg-base)', padding: '11px 14px', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? 'var(--bg-soft)' : 'transparent' }}>
              {r.map((c, ci) => <td key={ci} style={{ padding: '11px 14px', borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)' }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bar({ name, val, pct, color }) {
  return (
    <div className="card" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>{name}</span>
        <span style={{ fontWeight: 800, fontSize: 'var(--text-md)', color }}>{val}</span>
      </div>
      <div style={{ height: 10, background: 'var(--border-default)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

/* ─── Seções ─── */

function Como() {
  return (
    <>
      <Eyebrow color={CRAYON.blue}>O modelo</Eyebrow>
      <H>Como você ganha dinheiro</H>
      <Lead>Você cria o livro uma vez. A Amazon imprime e envia a cada venda. Você recebe royalties para sempre, sem tocar em estoque.</Lead>
      <CardGrid>
        <Card icon="🎨" title="1. Gerar">O portal cria as imagens automaticamente. Escolhe tema e estilo, clica e pronto.</Card>
        <Card icon="📦" title="2. Publicar">Sobe o PDF na Amazon KDP. Eles imprimem sob demanda (print-on-demand).</Card>
        <Card icon="💵" title="3. Receber">A cada venda, a Amazon paga o royalty. Renda passiva.</Card>
      </CardGrid>
      <Callout icon="💡">
        <strong>A verdade honesta:</strong> não é "ficar rico com 1 livro". O segredo é <strong>portfólio</strong> — vários livros pequenos somando renda. Um livro rende em média $30–80/mês; 10 a 20 livros constroem uma renda real.
      </Callout>
    </>
  );
}

function Primeiro() {
  const steps = [
    [CRAYON.red, '1', 'Gerar as imagens', 'Estilo Baby → tema Animais da Selva → "Todos" → Gerar. Use itens customizados para chegar a 40 desenhos.', '⏱ ~15 min · 💲 ~$1,20'],
    [CRAYON.yellow, '2', 'Escolher os melhores', 'Revise cada imagem. Não ficou fofa? Clique 🔄 Regenerar. Confira: fundo branco, traços grossos.', '⏱ ~10 min'],
    [CRAYON.green, '3', 'Exportar o miolo (PDF)', 'Aba Capa → "Exportar HTML interior" → abrir → Ctrl+P → Salvar como PDF.', '⏱ ~5 min'],
    [CRAYON.blue, '4', 'Criar a capa', 'Aba Capa → "Gerar arte da capa" com título no estilo giz de cera. Mostre os bichos coloridos + "Ages 1-4".', '⏱ ~15 min · 💲 $0,03'],
    [CRAYON.purple, '5', 'Publicar na Amazon', 'Sobe interior + capa no KDP, preenche os dados e define o preço. Aprovação em 24–72h.', '⏱ ~30 min · 💲 grátis'],
  ];
  return (
    <>
      <Eyebrow color={CRAYON.red}>Mão na massa</Eyebrow>
      <H>Seu primeiro livro, passo a passo</H>
      <Lead>Recomendado: <strong>"Baby Safari Animals"</strong> — animais fofos estilo bebê. É a fórmula campeã de vendas em 2026.</Lead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map(([color, num, title, desc, meta]) => (
          <div key={num} className="card" style={{ display: 'flex', gap: 16, padding: 'var(--space-4)' }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>{num}</div>
            <div>
              <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: 'var(--text-md)' }}>{title}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{desc}</p>
              <p style={{ margin: '6px 0 0', fontSize: 'var(--text-xs)', color: CRAYON.green, fontWeight: 800 }}>{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Nicho() {
  return (
    <>
      <Eyebrow color={CRAYON.purple}>A regra de ouro</Eyebrow>
      <H>Específico vende. Genérico afunda.</H>
      <Lead>A Amazon tem 100.000+ livros de colorir. Os genéricos se perdem. Os específicos têm menos de 500 concorrentes e vendem 6× mais.</Lead>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#FBEAE7', border: '2px solid #F2C7BF', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 'var(--text-md)' }}>❌ Genérico (evite)</p>
          {['"Animal Coloring Book"', '"Cute Animals"', '"Coloring Book for Kids"', 'Sem faixa etária'].map(t => (
            <p key={t} style={{ margin: '0 0 7px', fontSize: 'var(--text-sm)', paddingLeft: 20, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: CRAYON.red, fontWeight: 800 }}>✕</span>{t}
            </p>
          ))}
        </div>
        <div style={{ background: '#E8F4EC', border: '2px solid #BFE0CB', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: 'var(--text-md)' }}>✅ Específico (faça)</p>
          {['"Baby Safari Animals — Ages 1-4"', '"Cozy Christmas Animals"', '"Baby Sea Creatures First Book"', 'Faixa etária bem clara'].map(t => (
            <p key={t} style={{ margin: '0 0 7px', fontSize: 'var(--text-sm)', paddingLeft: 20, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: CRAYON.green, fontWeight: 800 }}>✓</span>{t}
            </p>
          ))}
        </div>
      </div>
      <Callout icon="🎯" color={CRAYON.purple} bg="#F3EEF8">
        <strong>A fórmula mágica:</strong> Estilo + Tema específico + Faixa etária.<br />
        Ex: <strong>Baby</strong> + <strong>Safari Animals</strong> + <strong>Ages 1-4</strong> = identidade única e forte.
      </Callout>
    </>
  );
}

function Financas() {
  return (
    <>
      <Eyebrow color={CRAYON.green}>Dinheiro</Eyebrow>
      <H>Quanto custa e quanto rende</H>
      <Lead>Os números surpreendem porque não há estoque: você gasta uma vez para criar e vende infinitas cópias.</Lead>
      <BigNumRow>
        <BigNum n="$1,23" label="Custo p/ criar 1 livro" color={CRAYON.red} />
        <BigNum n="$2,30" label="Ganho por cada venda" color={CRAYON.green} />
        <BigNum n="1" label="venda já paga o custo" color={CRAYON.blue} />
      </BigNumRow>
      <p style={{ fontWeight: 800, fontSize: 'var(--text-md)', margin: '8px 0 10px' }}>📋 Custo para criar (uma única vez)</p>
      <Table
        head={['Item', 'Custo']}
        rows={[
          ['40 imagens (IA, $0,03 cada)', '$1,20'],
          ['Arte da capa', '$0,03'],
          ['Make.com (automação)', 'Grátis'],
          ['Canva (finalizar capa)', 'Grátis'],
          ['Total por livro', '$1,23'],
        ]}
      />
      <p style={{ fontWeight: 800, fontSize: 'var(--text-md)', margin: '8px 0 10px' }}>💵 Quanto você ganha por venda (P&B)</p>
      <Table
        head={['Preço', 'Você recebe', 'Quando usar']}
        rows={[
          ['$5,99', '$1,29', 'Entrar agressivo, pegar avaliações'],
          ['$8,99 ⭐', '$2,30', 'Recomendado p/ 1º livro'],
          ['$12,99', '$4,00', 'Com avaliações e autoridade'],
        ]}
      />
      <Callout icon="⚠️">
        <strong>Regra importante:</strong> o miolo é sempre <strong>preto e branco</strong> (margem boa). Só a <strong>capa</strong> é colorida. Livro colorido por dentro tem margem mínima.
      </Callout>
    </>
  );
}

function Roi() {
  return (
    <>
      <Eyebrow color={CRAYON.yellow}>Retorno</Eyebrow>
      <H>Quanto um livro pode render</H>
      <Lead>Depende de quantas cópias vende. Cenários reais (preço $8,99, ganho $2,30/venda):</Lead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--space-5)' }}>
        <Bar name="😐 Fraco · 5/mês"        val="$11/mês"  pct={8}   color="var(--text-muted)" />
        <Bar name="🙂 Conservador · 10/mês" val="$23/mês"  pct={16}  color={CRAYON.blue} />
        <Bar name="😀 Médio · 30/mês"       val="$69/mês"  pct={33}  color={CRAYON.green} />
        <Bar name="🤩 Bom · 60/mês"         val="$138/mês" pct={60}  color={CRAYON.yellow} />
        <Bar name="🚀 Best-seller · 200/mês" val="$460/mês" pct={100} color={CRAYON.red} />
      </div>
      <p style={{ fontWeight: 800, fontSize: 'var(--text-md)', margin: '8px 0 10px' }}>📈 O poder do portfólio</p>
      <Lead>Cada livro custa ~$1,23 uma vez. Com média de $40/mês por livro:</Lead>
      <Table
        head={['Livros', 'Investimento', 'Renda/mês', 'Renda/ano']}
        rows={[
          ['1', '$11*', '~$40', '~$480'],
          ['5', '$16', '~$200', '~$2.400'],
          ['10', '$22', '~$400', '~$4.800'],
          ['20', '$35', '~$800', '~$9.600'],
        ]}
      />
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: -8, marginBottom: 'var(--space-4)' }}>
        *Inclui recarga de $10 no Replicate (rende ~333 imagens).
      </p>
      <Callout icon="📊" color={CRAYON.green} bg="#E8F4EC">
        <strong>Por que o ROI é tão alto?</strong> Print-on-demand não tem estoque nem custo recorrente. Seu único gasto é gerar as imagens (centavos). O resto a Amazon banca a cada venda. O trabalho é criar e publicar com consistência.
      </Callout>
    </>
  );
}

function Publicar() {
  return (
    <>
      <Eyebrow color={CRAYON.blue}>Especificações</Eyebrow>
      <H>O livro certo, do jeito certo</H>
      <Lead>Siga estas specs para não tomar rejeição na Amazon e parecer profissional.</Lead>
      <CardGrid>
        <Card icon="📐" title="Tamanho">8,5 × 8,5 pol (quadrado). 64% dos mais vendidos em 2026.</Card>
        <Card icon="📄" title="Páginas">40 desenhos = ~80-100 páginas. Impressão só de um lado.</Card>
        <Card icon="🖤" title="Miolo">Preto e branco. Capa colorida. Melhor margem.</Card>
        <Card icon="🎨" title="Capa">Bichos coloridos estilo giz de cera + faixa etária visível.</Card>
        <Card icon="💲" title="Preço">$8,99 no primeiro livro. Faixa competitiva.</Card>
        <Card icon="📣" title="Divulgação">Pinterest + vídeos "folheando" no TikTok convertem muito.</Card>
      </CardGrid>
      <Callout icon="✋">
        <strong>Nunca pule:</strong> peça uma <strong>cópia de prova</strong> antes de divulgar. Segurar o livro físico confirma margens, capa e papel antes de gastar em marketing.
      </Callout>
    </>
  );
}

function Plano() {
  const phases = [
    ['#FBEAE7', '🌱', 'Fase 1 — Validar (1 livro)', 'Faça o "Baby Safari Animals" do início ao fim. Aprenda o processo. Peça a cópia de prova.'],
    ['#FFF6E6', '🔧', 'Fase 2 — Refinar (livros 2-3)', 'Ajuste com base no que aprendeu. Teste outros temas e estilos (Cozy, outros animais).'],
    ['#E8F4EC', '📚', 'Fase 3 — Expandir (livros 4-10)', 'Cubra vários temas. Descubra o que vende melhor e dobre a aposta.'],
    ['#EAF1F8', '💰', 'Fase 4 — Portfólio (10-20)', 'Renda passiva consistente. No Q4 (out-dez), foque em Natal e sazonais.'],
  ];
  return (
    <>
      <Eyebrow color={CRAYON.green}>O caminho</Eyebrow>
      <H>Seu plano dos próximos meses</H>
      <Lead>Não tente fazer tudo de uma vez. Construa o hábito de publicar com consistência.</Lead>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {phases.map(([bg, icon, title, desc], i) => (
          <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < phases.length - 1 ? 20 : 0, position: 'relative' }}>
            {i < phases.length - 1 && <div style={{ position: 'absolute', left: 21, top: 44, bottom: 0, width: 2, background: 'var(--border-default)' }} />}
            <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, zIndex: 1 }}>{icon}</div>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 'var(--text-md)' }}>{title}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Callout icon="🗓️">
        <strong>Dica de calendário:</strong> publique temas sazonais com <strong>2 meses de antecedência</strong>. Natal sobe em outubro, Páscoa em fevereiro. Assim o livro indexa e ganha avaliações antes do pico.
      </Callout>
    </>
  );
}
