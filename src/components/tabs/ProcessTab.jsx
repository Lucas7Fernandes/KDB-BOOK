import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { permanentImageUrl } from '../../lib/format.js';

/**
 * ProcessTab — Limpa fundo/preenchimento cinza das imagens e gera cópias em PNG.
 *
 * Fluxo: escolher imagens (da Biblioteca ou upload) → ajustar limiar →
 *        Processar → conferir antes/depois → Baixar cópia (original fica intacto).
 *
 * Não grava nada no localStorage: imagens limpas são entregues como arquivo PNG
 * (base64 em histórico estouraria a cota e corromperia a Biblioteca).
 *
 * Props:
 *   history    — array do histórico (itens { id, animal_en, animal_pt, image_url, ... })
 *   showToast  — (msg, type?) => void
 */

const C = {
  surface:  '#1a1f2e',
  surface2: '#232a3b',
  border:   '#2d3748',
  text:     '#e2e8f0',
  muted:    '#64748b',
  muted2:   '#94a3b8',
  accent:   '#6366f1',
  success:  '#10b981',
  danger:   '#ef4444',
};

// ── Helpers de imagem ──────────────────────────────────────────────────────

function loadToCanvas(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      try {
        c.getContext('2d').getImageData(0, 0, 1, 1); // testa taint (CORS)
        resolve(c);
      } catch {
        reject(new Error('cors'));
      }
    };
    img.onerror = () => reject(new Error('load'));
    img.src = url;
  });
}

function applyThreshold(srcCanvas, threshold) {
  const dst = document.createElement('canvas');
  dst.width = srcCanvas.width;
  dst.height = srcCanvas.height;
  const ctx = dst.getContext('2d');
  ctx.drawImage(srcCanvas, 0, 0);
  const id = ctx.getImageData(0, 0, dst.width, dst.height);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum > threshold) { d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 255; }
  }
  ctx.putImageData(id, 0, 0);
  return dst;
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, 'image/png');
}

// ── Card de resultado ───────────────────────────────────────────────────────

function ResultCard({ result, onDownload }) {
  const origRef = useRef(null);
  const procRef = useRef(null);

  useEffect(() => {
    if (result.status !== 'done') return;
    [[origRef, result.origCanvas], [procRef, result.procCanvas]].forEach(([ref, src]) => {
      if (!ref.current || !src) return;
      ref.current.width = src.width;
      ref.current.height = src.height;
      ref.current.getContext('2d').drawImage(src, 0, 0);
    });
  }, [result]);

  if (result.status === 'error') {
    return (
      <div style={{ ...S.card, padding: 16 }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500 }}>{result.label}</p>
        <p style={{ margin: 0, fontSize: 12, color: C.danger }}>{result.error}</p>
        {result.srcUrl && (
          <a href={result.srcUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: C.accent, display: 'inline-block', marginTop: 8 }}>
            ↗ Abrir original (salve e use o modo Upload)
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {result.label}
        </span>
        <button onClick={onDownload} style={S.btnSm}>⬇ Baixar cópia</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.border }}>
        {[['origRef', origRef, 'Antes'], ['procRef', procRef, 'Depois']].map(([k, ref, lbl]) => (
          <div key={k} style={{ position: 'relative', background: '#fff', lineHeight: 0 }}>
            <span style={S.canvasLabel}>{lbl}</span>
            <canvas ref={ref} style={{ width: '100%', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ProcessTab({ history = [], showToast }) {
  const [source, setSource]         = useState('biblioteca'); // 'biblioteca' | 'upload'
  const [uploads, setUploads]       = useState([]);           // { id, name, url }
  const [selected, setSelected]     = useState(new Set());
  const [threshold, setThreshold]   = useState(200);
  const [results, setResults]       = useState([]);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);

  const libItems = useMemo(
    () => history.filter((h) => h.drive_file_id || h.image_url),
    [history]
  );

  const pool = source === 'biblioteca'
    ? libItems.map((h) => ({ id: h.id, label: h.animal_pt || h.animal_en || 'imagem', url: permanentImageUrl(h), base: h.animal_en || h.animal_pt || 'imagem' }))
    : uploads.map((u) => ({ id: u.id, label: u.name, url: u.url, base: u.name.replace(/\.[^.]+$/, '') }));

  const poolById = useMemo(() => Object.fromEntries(pool.map((p) => [p.id, p])), [pool]);

  const toggle = (id) => setSelected((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const selectAll  = () => setSelected(new Set(pool.map((p) => p.id)));
  const selectNone = () => setSelected(new Set());

  const switchSource = (s) => { setSource(s); setSelected(new Set()); };

  const handleUpload = (files) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) return;
    const items = imgs.map((f) => ({ id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, url: URL.createObjectURL(f) }));
    setUploads((prev) => [...prev, ...items]);
    setSource('upload');
    setSelected((prev) => new Set([...prev, ...items.map((i) => i.id)]));
  };

  const process = useCallback(async () => {
    const chosen = pool.filter((p) => selected.has(p.id));
    if (!chosen.length) return;
    setProcessing(true);
    setResults([]);

    const out = await Promise.all(chosen.map(async (p) => {
      try {
        const origCanvas = await loadToCanvas(p.url);
        const procCanvas = applyThreshold(origCanvas, threshold);
        return { id: p.id, label: p.label, base: p.base, origCanvas, procCanvas, status: 'done' };
      } catch (err) {
        const msg = err.message === 'cors'
          ? 'Bloqueio CORS ao ler esta imagem da Biblioteca. Use o modo Upload com o arquivo salvo.'
          : 'Não consegui carregar a imagem.';
        return { id: p.id, label: p.label, srcUrl: p.url, status: 'error', error: msg };
      }
    }));

    setResults(out);
    setProcessing(false);
    const ok  = out.filter((r) => r.status === 'done').length;
    const bad = out.length - ok;
    if (showToast) showToast(`✓ ${ok} tratada${ok !== 1 ? 's' : ''}${bad ? ` · ${bad} com erro` : ''}`, bad ? 'error' : 'success');
  }, [pool, selected, threshold, showToast]);

  const reapply = useCallback(() => {
    setResults((prev) => prev.map((r) => (r.status === 'done' ? { ...r, procCanvas: applyThreshold(r.origCanvas, threshold) } : r)));
  }, [threshold]);

  const downloadAll = () => {
    results.filter((r) => r.status === 'done').forEach((r, i) => {
      setTimeout(() => downloadCanvas(r.procCanvas, `${r.base}_limpo.png`), i * 300);
    });
  };

  const doneCount = results.filter((r) => r.status === 'done').length;

  return (
    <section style={S.root}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={S.title}>🧽 Limpar fundo</h2>
        <p style={S.subtitle}>
          Transforma cinza (fundo, sombras, preenchimentos) em branco puro e gera uma cópia em PNG.
          O original não é alterado.
        </p>
      </div>

      {/* Fonte */}
      <div style={S.tabs}>
        {[['biblioteca', `📚 Da Biblioteca (${libItems.length})`], ['upload', `📁 Upload manual${uploads.length ? ` (${uploads.length})` : ''}`]].map(([key, lbl]) => (
          <button key={key} onClick={() => switchSource(key)} style={{ ...S.srcTab, ...(source === key ? S.srcTabActive : {}) }}>
            {lbl}
          </button>
        ))}
      </div>

      {source === 'upload' && (
        <>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files)} />
          <div style={S.dropzone}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}>
            <span style={{ fontSize: 26, display: 'block', marginBottom: 6 }}>📂</span>
            Arraste imagens ou clique para selecionar
          </div>
        </>
      )}

      {source === 'biblioteca' && (
        <p style={S.tip}>
          As imagens da Biblioteca vêm de URLs externas (Replicate/Drive). Se aparecer erro de CORS,
          baixe o original pelo link e processe pelo modo <strong>Upload manual</strong> — funciona sempre.
        </p>
      )}

      {/* Seleção */}
      <div style={S.selHeader}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btnSm} onClick={selectAll} disabled={!pool.length}>Todas</button>
          <button style={S.btnSm} onClick={selectNone} disabled={!selected.size}>Nenhuma</button>
        </div>
        <span style={{ fontSize: 12, color: C.muted }}>{selected.size} de {pool.length} selecionadas</span>
      </div>

      {pool.length === 0 ? (
        <div style={S.empty}>
          {source === 'biblioteca'
            ? 'Nenhuma imagem na Biblioteca ainda. Gere imagens na aba Criar primeiro.'
            : 'Nenhum arquivo carregado. Arraste suas imagens acima.'}
        </div>
      ) : (
        <div style={S.grid}>
          {pool.map((p) => {
            const isSel = selected.has(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                style={{ ...S.thumb, ...(isSel ? S.thumbSel : {}) }} aria-pressed={isSel}>
                {isSel && <span style={S.check}>✓</span>}
                <img src={p.url} alt={p.label}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', borderRadius: '7px 7px 0 0' }} />
                <span style={S.thumbLabel}>{p.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Controles */}
      {selected.size > 0 && (
        <div style={S.controls}>
          <span style={{ fontSize: 13, color: C.muted2, whiteSpace: 'nowrap' }}>Limiar de branco</span>
          <input type="range" min="100" max="254" step="1" value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))} style={{ flex: 1, minWidth: 120 }} />
          <span style={{ fontSize: 13, fontWeight: 500, minWidth: 28 }}>{threshold}</span>
          {results.length > 0 && <button onClick={reapply} style={S.btnSm}>↺ Reaplicar</button>}
          <button onClick={process} disabled={processing}
            style={{ ...S.btn, opacity: processing ? 0.6 : 1 }}>
            {processing ? '⏳ Processando…' : `✨ Processar ${selected.size}`}
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <p style={{ ...S.tip, marginTop: 8 }}>
          Sobrou cinza? <strong>Diminua</strong> o limiar. O traço está sumindo ou afinando? <strong>Aumente</strong>.
        </p>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={S.selHeader}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
              {doneCount} cópia{doneCount !== 1 ? 's' : ''} pronta{doneCount !== 1 ? 's' : ''}
            </h3>
            {doneCount > 0 && (
              <button onClick={downloadAll} style={{ ...S.btn, background: C.success }}>
                ⬇ Baixar todas ({doneCount})
              </button>
            )}
          </div>
          <div style={S.resultsGrid}>
            {results.map((r) => (
              <ResultCard key={r.id} result={r} onDownload={() => downloadCanvas(r.procCanvas, `${r.base}_limpo.png`)} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────

const S = {
  root: { color: C.text },
  title: { margin: '0 0 4px', fontSize: 18, fontWeight: 500 },
  subtitle: { margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.5 },
  tabs: { display: 'flex', gap: 8, marginBottom: 14 },
  srcTab: { padding: '8px 14px', background: C.surface, color: C.muted2, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  srcTabActive: { background: C.accent, color: '#fff', borderColor: C.accent },
  dropzone: { border: `2px dashed ${C.border}`, borderRadius: 10, padding: 26, textAlign: 'center', cursor: 'pointer', marginBottom: 14, background: C.surface, color: C.muted2, fontSize: 14 },
  tip: { fontSize: 12, color: C.muted2, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', margin: '0 0 14px', lineHeight: 1.5 },
  selHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  empty: { padding: 28, textAlign: 'center', color: C.muted, background: C.surface, borderRadius: 8, fontSize: 13 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 10 },
  thumb: { background: C.surface, border: `2px solid ${C.border}`, borderRadius: 9, overflow: 'hidden', cursor: 'pointer', position: 'relative', padding: 0, textAlign: 'left' },
  thumbSel: { borderColor: C.accent },
  check: { position: 'absolute', top: 6, right: 6, background: C.accent, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, zIndex: 1 },
  thumbLabel: { display: 'block', padding: '6px 8px', fontSize: 11, color: C.muted2, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  controls: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px', background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, marginTop: 18 },
  btn: { padding: '8px 16px', background: C.accent, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' },
  btnSm: { padding: '5px 10px', background: C.surface2, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 },
  card: { background: C.surface, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` },
  cardHeader: { padding: '8px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  canvasLabel: { position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4, zIndex: 1, lineHeight: 1.4, pointerEvents: 'none' },
};
