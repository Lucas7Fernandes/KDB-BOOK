/**
 * Notificações do navegador (desktop e mobile).
 *
 * No Chrome Android, `new Notification()` lança erro — é obrigatório usar
 * ServiceWorkerRegistration.showNotification(). Registramos um SW mínimo
 * e usamos com fallback para Notification simples e vibração.
 */

let swRegistration = null;

/** Registra o service worker (chamar uma vez no mount). */
export async function initNotifications() {
  if (!('serviceWorker' in navigator)) return;
  try {
    swRegistration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`
    );
  } catch (err) {
    console.warn('[notify] SW register failed:', err);
  }
}

/**
 * Pede permissão de notificação. Deve ser chamado dentro de um gesto
 * do usuário (clique). Retorna true se concedida.
 */
export async function requestNotifyPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/**
 * Dispara uma notificação. Silenciosamente não faz nada sem permissão.
 */
export async function notify(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }
    const options = {
      body,
      icon: `${import.meta.env.BASE_URL}favicon.svg`,
      badge: `${import.meta.env.BASE_URL}favicon.svg`,
      vibrate: [200, 100, 200],
      tag: 'kdp-generation',
      renotify: true,
    };
    if (swRegistration?.showNotification) {
      await swRegistration.showNotification(title, options);
      return true;
    }
    new Notification(title, options);
    return true;
  } catch {
    try { navigator.vibrate?.([200, 100, 200]); } catch { /* noop */ }
    return false;
  }
}
