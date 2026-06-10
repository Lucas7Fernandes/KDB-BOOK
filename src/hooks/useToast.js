import { useState, useCallback, useRef } from 'react';

/**
 * Hook para gerenciamento de toast notifications.
 *
 * Uso:
 *   const { toast, showToast } = useToast();
 *   showToast('Imagem gerada!');                  // sucesso
 *   showToast('Erro ao carregar', 'error');       // erro
 *
 * O toast some automaticamente após 3.5s.
 */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type });
    timeoutRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast(null);
  }, []);

  return { toast, showToast, dismiss };
}
