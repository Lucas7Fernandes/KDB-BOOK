import { useState, useEffect, useRef } from 'react';
import { storageGet, storageSet } from '../lib/storage.js';

/**
 * Estado React que persiste automaticamente no storage.
 *
 * Inicial:  carrega de storage (assíncrono) usando o initialValue como fallback
 * Mudanças: salvas automaticamente em storage após o mount inicial
 *
 * @param {string} key - Chave única no storage
 * @param {*} initialValue - Valor padrão se a chave não existir
 * @param {{ serialize?: (v: any) => string, deserialize?: (s: string) => any }} [options]
 */
export function usePersistedState(key, initialValue, options = {}) {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Mantém serialize/deserialize em refs estáveis — evita que funções
  // passadas inline (nova referência a cada render) re-disparem os efeitos
  // e causem loop infinito de re-render.
  const serializeRef = useRef(options.serialize);
  const deserializeRef = useRef(options.deserialize);
  serializeRef.current = options.serialize;
  deserializeRef.current = options.deserialize;

  // Carrega valor inicial do storage (uma vez por key)
  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    (async () => {
      const stored = await storageGet(key, null);
      if (cancelled) return;
      if (stored !== null) {
        try {
          setValue(deserializeRef.current ? deserializeRef.current(stored) : stored);
        } catch {
          // Mantém initialValue se falhar
        }
      }
      setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, [key]);

  // Salva mudanças após hidratar (evita sobrescrever no primeiro mount)
  useEffect(() => {
    if (!hydrated) return;
    const stringValue = serializeRef.current ? serializeRef.current(value) : String(value);
    storageSet(key, stringValue);
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}

/** Wrapper que faz serialize/deserialize JSON automaticamente. */
export function usePersistedJSON(key, initialValue) {
  return usePersistedState(key, initialValue, {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
}
