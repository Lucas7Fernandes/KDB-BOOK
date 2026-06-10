<div align="center">

# 🎨 KDP Colorbook Generator

**Portal de automação para geração de livros de colorir infantis na Amazon KDP.**

Pipeline completo: 16 temas · 320+ itens · geração paralela via Make.com · SEO + finanças + checklist KDP integrados.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-FFC542)

</div>

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Início Rápido](#-início-rápido)
- [Arquitetura](#-arquitetura)
- [Como Usar](#-como-usar)
- [Pipeline Make.com](#-pipeline-makecom)
- [Custos](#-custos)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O **KDP Colorbook Generator** é um portal web em React que automatiza todo o fluxo de criação de livros de colorir para Amazon KDP. Em vez de gerar imagens uma por uma manualmente, o portal:

- ✅ **Gera 20 imagens em paralelo** via webhook Make.com (~60s/livro)
- ✅ **Dashboard de custos** em tempo real ($0.03/imagem · $0.60/livro)
- ✅ **16 temas pré-configurados** com 320+ itens (animais, datas comemorativas, profissões, esportes...)
- ✅ **Catálogo visual** com status por livro (planejado → produção → publicado)
- ✅ **Checklist KDP** de 12 passos com dicas práticas para publicação
- ✅ **Inteligência SEO** com keywords, BSR e volume de busca por categoria
- ✅ **Projeção financeira** interativa (preço × vendas → royalty mensal/anual)
- ✅ **Geração de capa via Canva** (MCP integration)
- ✅ **Geração de descrição IA** otimizada para Amazon
- ✅ **Export do interior** em HTML print-ready (Ctrl+P → PDF para upload no KDP)

### 🖼 Funcionalidades

| Aba | O que faz |
|-----|-----------|
| **🖼 Gerar** | Seleciona itens, dispara geração paralela, mostra resultados em tempo real |
| **📦 Catálogo** | Visualiza os 16 livros com status e progresso de produção |
| **📊 Finanças** | Calculadora de royalty + projeções por número de livros publicados |
| **🚀 KDP** | Checklist de 12 passos + formulário de metadados |
| **🔍 SEO** | Score do listing + inteligência por categoria + estratégias de crescimento |
| **📐 Canva** | Gera capa via MCP Canva + export do interior |
| **📂 Histórico** | Todas as imagens geradas com filtros e export (CSV/JSON/HTML) |
| **⚙ Config** | Webhook URL, proxy CORS, estatísticas globais |

---

## 🛠 Stack Tecnológica

- **[React 18](https://react.dev/)** — UI declarativa com hooks
- **[Vite 5](https://vitejs.dev/)** — build tool ultra-rápido
- **CSS puro com variáveis** — design system sem dependências
- **Make.com** — pipeline de geração via webhook
- **FLUX Dev** (Replicate) — modelo de imagem para coloring pages
- **Claude API** — descrições otimizadas + integração Canva via MCP

### Pipeline backend

```
[Browser] → Webhook Make.com
              ↓
              Claude Haiku (gera prompt FLUX)
              ↓
              Replicate FLUX Dev (gera imagem)
              ↓
              Google Drive (salva imagem)
              ↓
              Webhook Response → [Browser exibe resultado]
```

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js 18+** ([download](https://nodejs.org/))
- Webhook Make.com configurado (consulte [Pipeline Make.com](#-pipeline-makecom))

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/kdp-colorbook-portal.git
cd kdp-colorbook-portal

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# edite .env e cole seu webhook URL

# Rode em modo desenvolvimento
npm run dev
```

A aplicação abre automaticamente em `http://localhost:3000`.

### Scripts disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (HMR) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Preview local do build de produção |

---

## 🏗 Arquitetura

```
kdp-colorbook-portal/
├── index.html              # entry HTML
├── package.json
├── vite.config.js
├── .env.example            # template de configuração
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # ponto de entrada React
    ├── App.jsx             # componente raiz (state + routing)
    ├── styles/
    │   └── globals.css     # design system + utility classes
    ├── data/
    │   ├── themes.js       # 16 temas × 20 itens
    │   ├── categories.js   # 4 categorias de agrupamento
    │   ├── kdp-steps.js    # checklist de 12 passos + tips
    │   ├── seo.js          # intel SEO + estratégias
    │   └── config.js       # constantes globais
    ├── lib/
    │   ├── storage.js      # abstração assíncrona localStorage
    │   ├── api.js          # cliente HTTP (webhook + Claude + Canva)
    │   ├── export.js       # CSV / JSON / HTML interior
    │   └── format.js       # números, moeda, datas
    ├── hooks/
    │   ├── usePersistedState.js
    │   └── useToast.js
    └── components/
        ├── Header.jsx
        ├── Dashboard.jsx
        ├── ui.jsx          # Button, Badge, Stat, Spinner, etc.
        ├── ResultCard.jsx
        ├── HistoryCard.jsx
        └── tabs/           # uma aba por arquivo
            ├── GenerateTab.jsx
            ├── CatalogTab.jsx
            ├── FinanceTab.jsx
            ├── KdpTab.jsx
            ├── SeoTab.jsx
            ├── CanvaTab.jsx
            ├── HistoryTab.jsx
            └── SettingsTab.jsx
```

### Design system

O CSS usa **variáveis nativas** (`--accent`, `--bg-base`, `--space-4`, etc.) em vez de Tailwind ou CSS-in-JS. Vantagens:

- Zero dependências de styling
- Tema dark consistente em toda a aplicação
- Fácil customização (mude uma variável → toda a app muda)
- Suporte completo a `prefers-reduced-motion` e foco WCAG

Cor principal: **âmbar `#FFC542`**. Background: **`#080809`** (quase preto). Tipografia: Inter (corpo), Space Grotesk (display), JetBrains Mono (números/código).

---

## 📖 Como Usar

### 1. Gerar imagens de um tema

1. Vá em **🖼 Gerar**
2. Escolha o tema na barra de pílulas no topo (Selva, Fazenda, Oceano...)
3. Clique em **Selecionar Todos** ou marque itens individuais
4. Clique em **🚀 Gerar N item(s) · $X.XX**
5. Aguarde ~60s — todas as imagens aparecem em paralelo

### 2. Adicionar item customizado

Na aba **🖼 Gerar**, role até a seção **Item customizado**:
- Preencha o nome em **inglês** e **português**
- Clique em **+ Gerar agora**

A imagem é gerada imediatamente, fora da seleção do tema.

### 3. Pré-preencher metadados KDP

1. Vá em **🚀 KDP**
2. Preencha título, subtítulo, 7 keywords, 2 categorias, preço
3. Clique em **🤖 Gerar com IA** para criar a descrição HTML automaticamente
4. Marque os passos do checklist conforme avança

### 4. Exportar o interior do livro

1. Após gerar as 20 imagens, vá em **📐 Canva**
2. Clique em **🖨 HTML interior**
3. Abra o arquivo baixado no navegador
4. Aperte **Ctrl/Cmd + P** → **Salvar como PDF**
5. Faça upload no KDP

---

## 🔌 Pipeline Make.com

O backend é um pipeline Make.com (público). Crie seu próprio com a estrutura:

```
Webhook → Claude Haiku → Replicate POST → Sleep 45s → Replicate GET
       → Webhook Response (JSON)
       → Google Drive Upload (opcional)
       → Gmail (opcional)
```

### Payload de entrada

```json
{
  "animal_en": "lion",
  "animal_pt": "Leão"
}
```

### Resposta esperada

```json
{
  "status": "ok",
  "animal": "lion",
  "animal_pt": "Leão",
  "image_url": "https://replicate.delivery/xezq/...",
  "usage": {
    "claude": {
      "input_tokens": 512,
      "output_tokens": 98,
      "model": "claude-haiku-4-5-20251001",
      "cost_usd": 0
    },
    "replicate": {
      "predict_time_seconds": 18.4,
      "cost_usd": 0.03,
      "model": "flux-dev"
    },
    "make": { "credits_used": 1 }
  }
}
```

### Prompt FLUX usado pelo Claude

O Claude Haiku traduz o item recebido para um prompt FLUX otimizado:

```
A black and white coloring book page for children showing a [ANIMAL].
Thick bold black outlines, white background, no color, no shading, no gray.
The animal occupies 80% of the image. Simple contextual background
(savanna/ocean/forest/jungle elements). Classic professional children's
coloring book illustration style.
```

---

## 💰 Custos

| Serviço | Custo unitário | Por livro (20 imgs) |
|---------|---------------:|---------------------:|
| Replicate FLUX Dev | $0.03 | $0.60 |
| Claude Haiku | $0.00 | $0.00 |
| Make.com | 1 crédito | 20 créditos (1.000 grátis/mês) |
| Google Drive / Gmail | $0.00 | $0.00 |
| Canva | $0.00 | $0.00 |
| **Total** | | **$0.60** |

Com **plano grátis Make.com (1.000 créditos/mês)** você produz **50 livros/mês = 1.000 imagens** com investimento total de **$30**.

---

## 🚢 Deploy

### Vercel (recomendado)

```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente no painel Vercel:
- `VITE_WEBHOOK_URL`
- `VITE_USE_CORS_PROXY=true`

### Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
npm run build
# faça commit do conteúdo de dist/ na branch gh-pages
```

> **Atenção**: para deploy estático funcionar com webhook externo, deixe `VITE_USE_CORS_PROXY=true`.

---

## 🛠 Troubleshooting

### "CORS error" ao chamar o webhook

O Make.com pode bloquear chamadas diretas do browser. Soluções:

1. **Ative o proxy CORS** na aba **⚙ Config** (usa `corsproxy.io`)
2. **Ou** crie um endpoint backend (Vercel Function / Netlify Function) que faz proxy

### "Failed to fetch" ou timeout

- Verifique se o webhook Make.com está **ativo** (botão LIGADO na esquina superior direita)
- Aguarde até 90s por imagem (o pipeline tem `Sleep 45s` interno)
- Confira o `Scenario History` no Make.com para erros backend

### "Resposta inválida do modelo" na geração de descrição

A integração Claude (Canva + descrições) requer credenciais. Em produção, **nunca exponha a chave Claude no frontend** — use uma função serverless como proxy.

### O saldo Replicate "some" ao recarregar

O saldo Replicate é mantido em `localStorage` do navegador. Ele é específico por dispositivo e por origem (URL). Se mudar de URL ou limpar dados do site, o valor reseta para `$5.00`.

---

## 🗺 Roadmap

- [x] Geração paralela via webhook Make.com
- [x] 16 temas pré-configurados (320+ itens)
- [x] Catálogo visual com status por livro
- [x] Checklist KDP completo (12 passos)
- [x] Inteligência SEO por categoria
- [x] Projeção financeira interativa
- [x] Geração de capa via Canva (MCP)
- [x] Geração de descrição com IA
- [x] Export HTML interior print-ready
- [ ] Auto-upload do PDF para Google Drive
- [ ] Bulk publishing (várias contas KDP)
- [ ] A/B test de keywords no listing
- [ ] Tracker de vendas via SP-API Amazon
- [ ] Dashboard de royalties consolidado
- [ ] PWA com modo offline

---

## 📄 Licença

[MIT](./LICENSE) © 2026

Feito com ☕ e muito brigadeiro.
