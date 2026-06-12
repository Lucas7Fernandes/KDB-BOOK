import { useState, useRef, useCallback } from 'react';
import { THEMES } from '../../data/themes.js';
import { ART_STYLES } from '../../data/prompts.js';
import { buildPhotoPrompt } from '../../data/photo-prompts.js';
import { Spinner, EmptyState } from '../ui.jsx';
import { permanentImageUrl } from '../../lib/format.js';

const PHOTO_WEBHOOK = 'https://hook.us2.make.com/8zae3sfd6td5h0mgdnfqyfh3iqkxlaa0';

/**
 * Comprime uma imagem para no máximo `maxPx` no lado maior, qualidade 80%.
 * Retorna uma data URL base64 JPEG.
 */
function compressImage(file, maxPx = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function PhotoTab({ artStyle, setArtStyle, activeTheme }) {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [mode, setMode] = useState('convert'); // 'convert' | 'theme'
  const [selectedTheme, setSelectedTheme] = useState(activeTheme);
  const [style, setStyle] = useState(artStyle);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith('image/')) return;
    setResult(null);
    setError(null);
    const compressed = await compressImage(file);
    setPreview(compressed);
    setBase64(compressed);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleGenerate = async () => {
    if (!base64 || !subjectName.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const themeId = mode === 'theme' ? selectedTheme : null;
    const fluxPrompt = buildPhotoPrompt(subjectName, style, themeId);

    try {
      const params = new URLSearchParams({
        photo_base64: base64,
        flux_prompt: fluxPrompt,
        subject_name: subjectName.trim(),
        style,
        theme: themeId || '',
      });

      const resp = await fetch(PHOTO_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        mode: 'cors',
      });

      const raw = await resp.text();
      const data = JSON.parse(raw);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const imgUrl = result ? permanentImageUrl(result) : null;

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
          Foto → Desenho para colorir
        </p>
        <h2 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-2xl)' }}>
          Transforme qualquer foto em personagem
        </h2>
        <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--text-md)', lineHeight: 1.6 }}>
          Envie uma foto, escolha o estilo e o contexto. O FLUX remove o fundo e redesenha
          como personagem de livro de colorir — mantendo a semelhança. Custo: <b style={{ color: 'var(--accent)' }}>$0.04</b>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left: upload + config */}
        <div>
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'var(--accent-bg)' : 'var(--bg-surface)',
              transition: 'all var(--transition-fast)',
              marginBottom: 'var(--space-4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: 260,
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 8,
                  }}
                />
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Clique para trocar a foto
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📸</div>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Arraste a foto aqui
                </p>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  ou clique para selecionar · JPG, PNG, WEBP
                </p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          {/* Subject name */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="section-group-label">Nome do personagem</label>
            <input
              placeholder="Ex: Sophia, João, Minha filha..."
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="input"
            />
            <p className="hint">Aparece na legenda e no nome do arquivo no Drive</p>
          </div>

          {/* Mode selector */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="section-group-label">Resultado</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['convert', '🖊', 'Só converter', 'Fundo branco, sem tema'],
                ['theme', '🌿', 'Inserir no tema', 'Com cenário do tema'],
              ].map(([id, emoji, label, desc]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${mode === id ? 'var(--accent)' : 'var(--border-default)'}`,
                    background: mode === id ? 'var(--accent-bg)' : 'var(--bg-base)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <p style={{ margin: '4px 0 2px', fontWeight: 700, fontSize: 'var(--text-sm)', color: mode === id ? 'var(--accent)' : 'var(--text-primary)' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme selector (only when mode=theme) */}
          {mode === 'theme' && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label className="section-group-label">Tema do cenário</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="input"
              >
                {Object.entries(THEMES).map(([id, t]) => (
                  <option key={id} value={id}>{t.emoji} {t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Style selector */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label className="section-group-label">Estilo do desenho</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {Object.entries(ART_STYLES).map(([id, s]) => (
                <button
                  key={id}
                  onClick={() => setStyle(id)}
                  aria-pressed={style === id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${style === id ? 'var(--accent)' : 'var(--border-default)'}`,
                    background: style === id ? 'var(--accent-bg)' : 'var(--bg-base)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{s.emoji}</span>
                  <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 'var(--text-xs)', color: style === id ? 'var(--accent)' : 'var(--text-primary)' }}>{s.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleGenerate}
            disabled={!base64 || !subjectName.trim() || loading}
          >
            {loading ? '⏳ Processando (~75s)...' : '✨ Gerar desenho · $0.04'}
          </button>
          {error && (
            <p style={{ marginTop: 8, color: 'var(--error)', fontSize: 'var(--text-sm)' }}>{error}</p>
          )}
        </div>

        {/* Right: result */}
        <div>
          <label className="section-group-label">Resultado</label>
          {loading ? (
            <div style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-12)',
              textAlign: 'center',
              background: 'var(--bg-surface)',
            }}>
              <Spinner large />
              <p style={{ margin: '16px 0 4px', color: 'var(--text-primary)', fontWeight: 600 }}>
                Removendo fundo...
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Em seguida, FLUX redesenha o personagem (~60s)
              </p>
            </div>
          ) : imgUrl ? (
            <div className="card card-success fade-in-up">
              <a href={imgUrl} target="_blank" rel="noreferrer" className="result-image-link">
                <img src={imgUrl} alt={subjectName} className="result-image" />
              </a>
              <div className="card-footer">
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success)' }}>
                  ☁ Salvo no Drive
                </span>
                <a href={imgUrl} download target="_blank" rel="noreferrer"
                  style={{ marginLeft: 'auto', fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 600 }}>
                  ⬇ Baixar
                </a>
              </div>
            </div>
          ) : (
            <EmptyState icon="🖼" message="Envie uma foto e clique em Gerar para ver o resultado aqui" />
          )}

          {!loading && !imgUrl && (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <label className="section-group-label">Como funciona</label>
              {[
                ['1', 'Remove o fundo', 'rembg extrai a pessoa da foto (~10s)'],
                ['2', 'FLUX redesenha', 'Transforma em line art mantendo a semelhança (~60s)'],
                ['3', 'Salva no Drive', 'Resultado permanente na sua pasta KDP'],
              ].map(([n, title, desc]) => (
                <div key={n} style={{
                  display: 'flex', gap: 10, padding: '10px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent-bg)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 'var(--text-sm)', flexShrink: 0,
                  }}>{n}</div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 'var(--text-md)' }}>{title}</p>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
