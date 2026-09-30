import { useEffect } from 'react';

/** Executa `fn` sempre que a aba fica ativa (sem precisar de react-navigation). */
export function useFocusEffect(active: boolean, fn: () => void) {
  useEffect(() => {
    if (active) fn();
  }, [active, fn]);
}
