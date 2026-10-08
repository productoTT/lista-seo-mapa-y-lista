import { useEffect } from 'react';
import { ComparatorShell } from './ComparatorShell';

export function ExperimentRoot() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Experimento — Búsqueda conversacional · TOCTOC';
    return () => { document.title = prev; };
  }, []);

  return <ComparatorShell />;
}
