/**
 * Abstração de storage assíncrono.
 *
 * Prioridade:
 *   1. window.storage (Claude.ai artifacts) — quando disponível
 *   2. localStorage (browser comum) — fallback padrão
 *
 * Todos os métodos retornam Promises para manter API uniforme.
 */

const hasWindowStorage =
  typeof window !== 'undefined' && typeof window.storage === 'object';

const hasLocalStorage = (() => {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__kdp_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
})();

/**
 * Lê um valor do storage. Retorna o fallback se a chave não existir.
 */
export async function storageGet(key, fallback = null) {
  try {
    if (hasWindowStorage) {
      const result = await window.storage.get(key);
      return result ? result.value : fallback;
    }
    if (hasLocalStorage) {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : raw;
    }
  } catch (error) {
    console.warn(`[storage] get(${key}) failed:`, error);
  }
  return fallback;
}

/**
 * Escreve um valor no storage. Valores não-string são serializados.
 */
export async function storageSet(key, value) {
  const stringValue = typeof value === 'string' ? value : String(value);
  try {
    if (hasWindowStorage) {
      await window.storage.set(key, stringValue);
      return true;
    }
    if (hasLocalStorage) {
      window.localStorage.setItem(key, stringValue);
      return true;
    }
  } catch (error) {
    console.warn(`[storage] set(${key}) failed:`, error);
  }
  return false;
}

/**
 * Remove uma chave do storage.
 */
export async function storageDelete(key) {
  try {
    if (hasWindowStorage) {
      await window.storage.delete(key);
      return true;
    }
    if (hasLocalStorage) {
      window.localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.warn(`[storage] delete(${key}) failed:`, error);
  }
  return false;
}

/** Lê e parseia JSON (com fallback se inválido) */
export async function storageGetJSON(key, fallback = null) {
  const raw = await storageGet(key, null);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Serializa e escreve JSON */
export async function storageSetJSON(key, value) {
  return storageSet(key, JSON.stringify(value));
}
