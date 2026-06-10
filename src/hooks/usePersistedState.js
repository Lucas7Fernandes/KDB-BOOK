import { useState, useEffect, useCallback } from 'react';
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
  const { serialize, deserialize } = options;
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Carrega valor inicial do storage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await storageGet(key, null);
      if (cancelled) return;
      if (stored !== null) {
        try {
          setValue(deserialize ? deserialize(stored) : stored);
        } catch {
          // Mantém initialValue se falhar
        }
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [key, deserialize]);

  // Salva mudanças após hidratar (evita sobrescrever no primeiro mount)
  useEffect(() => {
    if (!hydrated) return;
    const stringValue = serialize ? serialize(value) : String(value);
    storageSet(key, stringValue);
  }, [key, value, hydrated, serialize]);

  return [value, setValue, hydrated];
}

/** Wrapper que faz serialize/deserialize JSON automaticamente. */
export function usePersistedJSON(key, initialValue) {
  return usePersistedState(key, initialValue, {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
}
