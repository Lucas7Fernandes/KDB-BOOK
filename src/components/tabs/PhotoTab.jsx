import { useState, useRef, useCallback } from 'react';
import { THEMES } from '../../data/themes.js';
import { ART_STYLES } from '../../data/prompts.js';
import { buildPhotoPrompt } from '../../data/photo-prompts.js';
import { Spinner, EmptyState } from '../ui.jsx';
import { permanentImageUrl } from '../../lib/format.js';
import { CONFIG } from '../../data/config.js';

function compressImage(file, maxPx = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function PhotoTab({ artStyle, activeTheme, photoWebhookUrl, addToHistory, showToast }) {
  const [preview,     setPreview]     = useState(null);
  const [base64,      setBase64]      = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [mode,        setMode]        = useState('convert'); // 'convert' | 'theme'
  const [selTheme,    setSelTheme]    = useState(activeTheme);
  const [style,       setStyle]       = useState(artStyle);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [dragging,    setDragging]    = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback(async file => {
    if (!file?.type.startsWith('image/')) return;
    setResult(null); setError(null);
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      setBase64(compressed);
    } catch { showToast('Erro ao processar imagem', 'error'); }
  }, [showToast]);

  const handleGenerate = async () => {
    if (!base64 || !subjectName.trim()) {
      showToast('Selecione uma foto e dê um nome ao personagem', 'error');
      return;
    }
    setLoading(true); setError(null); setResult(null);
    const themeId    = mode === 'theme' ? selTheme : null;
    const fluxPrompt = buildPhotoPrompt(subjectName, style, themeId);
    try {
      const params = new URLSearchParams({
        photo_base64: base64,
        flux_prompt:  fluxPrompt,
        subject_name: subjectName.trim(),
        style,
        theme: themeId || '',
      });
      const resp = await fetch(photoWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        mode: 'cors',
      });
      const data = JSON.parse(await resp.text());
      setResult(data);
      addToHistory(data, subjectName.trim());
      showToast(`✨ ${subjectName} gerado! Salvo no Drive.`);
    } catch (err) {
      setError(err.message);
      showToast('Erro ao gerar — tente novamente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const imgUrl = result ? permanentImageUrl(result) : null;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
          Foto real → Desenho para colorir
        </p>
        <h2 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-2xl)' }}>
          Transforme qualquer pessoa em personagem
        </h2>
        <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--text-md)', lineHeight: 1.6 }}>
          O pipeline remove o fundo e redesenha como personagem de coloring book mantendo a semelhança.{' '}
          <b style={{ color: 'var(--accent)' }}>Custo: $0.04</b> · Tempo: ~75s
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Lado esquerdo: configuração */}
        <div>
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)',
              textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'var(--accent-bg)' : 'var(--bg-surface)',
              transition: 'all var(--transition-fast)', marginBottom: 'var(--space-4)',
            }}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 'var(--radius-lg)', marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Clique para trocar a foto</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 44, marginBottom: 8 }}>📸</div>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>Arraste ou clique para selecionar</p>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>JPG, PNG, WEBP · Redimensionado para 1024px</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

          {/* Nome */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="section-group-label">Nome do personagem</label>
            <input placeholder="Ex: Sophia, meu gato, bebê João..." value={subjectName} onChange={e => setSubjectName(e.target.value)} className="input" />
          </div>

          {/* Modo */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="section-group-label">Contexto</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['convert','🖊','Fundo branco','Só o personagem'], ['theme','🌿','Inserir no tema','Com cenário']].map(([id, emoji, label, desc]) => (
                <button key={id} onClick={() => setMode(id)} aria-pressed={mode === id} style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${mode === id ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: mode === id ? 'var(--accent-bg)' : 'var(--bg-base)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition-fast)',
                }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <p style={{ margin: '4px 0 2px', fontWeight: 700, fontSize: 'var(--text-sm)', color: mode === id ? 'var(--accent)' : 'var(--text-primary)' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {mode === 'theme' && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="section-group-label">Tema do cenário</label>
              <select value={selTheme} onChange={e => setSelTheme(e.target.value)} className="input">
                {Object.entries(THEMES).map(([id, t]) => (
                  <option key={id} value={id}>{t.emoji} {t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Estilo */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label className="section-group-label">Estilo do desenho</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {Object.entries(ART_STYLES).map(([id, s]) => (
                <button key={id} onClick={() => setStyle(id)} aria-pressed={style === id} style={{
                  padding: '8px 10px', borderRadius: 'var(--radius-lg)', textAlign: 'center',
                  border: `2px solid ${style === id ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: style === id ? 'var(--accent-bg)' : 'var(--bg-base)',
                  cursor: 'pointer', transition: 'all var(--transition-fast)',
                }}>
                  <span style={{ fontSize: 22 }}>{s.emoji}</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 'var(--text-xs)', color: style === id ? 'var(--accent)' : 'var(--text-primary)' }}>{s.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGenerate} disabled={!base64 || !subjectName.trim() || loading}>
            {loading ? '⏳ Processando (~75s)...' : '✨ Gerar desenho · $0.04'}
          </button>
          {error && <p style={{ marginTop: 8, color: 'var(--error)', fontSize: 'var(--text-sm)' }}>{error}</p>}
        </div>

        {/* Lado direito: resultado */}
        <div>
          <label className="section-group-label">Resultado</label>
          {loading ? (
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)', textAlign: 'center', background: 'var(--bg-surface)' }}>
              <Spinner large />
              <p style={{ margin: '16px 0 4px', fontWeight: 600 }}>Removendo fundo…</p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>FLUX redesenha o personagem (~60s)</p>
            </div>
          ) : imgUrl ? (
            <div className="card card-success fade-in-up">
              <a href={imgUrl} target="_blank" rel="noreferrer" className="result-image-link">
                <img src={imgUrl} alt={subjectName} className="result-image" />
              </a>
              <div className="card-footer">
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success)' }}>☁ Salvo no Drive · aparece no Histórico</span>
                <a href={imgUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>⬇ Baixar</a>
              </div>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 'var(--space-3)', opacity: 0.4 }}>🎨</div>
              <p style={{ color: 'var(--text-tertiary)', margin: '0 0 var(--space-5)' }}>
                Configure e clique em Gerar para ver o resultado aqui
              </p>
              {[['1','Remove fundo (rembg)','~10s'],['2','FLUX redesenha','~60s'],['3','Salva no Drive','permanente']].map(([n, label, time]) => (
                <div key={n} style={{ display: 'flex', gap: 10, textAlign: 'left', marginBottom: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'var(--text-xs)', flexShrink: 0 }}>{n}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}><b style={{ color: 'var(--text-primary)' }}>{label}</b> {time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
