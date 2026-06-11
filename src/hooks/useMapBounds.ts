import { useState, useCallback } from 'react';
import type { MapBounds } from '../types/property';

export function useMapBounds() {
  const [pendingBounds, setPendingBounds] = useState<MapBounds | null>(null);
  const [showSearchHere, setShowSearchHere] = useState(false);

  const onMapMove = useCallback((bounds: MapBounds) => {
    setPendingBounds(bounds);
    setShowSearchHere(true);
  }, []);

  const applyBounds = useCallback((cb: (b: MapBounds | null) => void) => {
    cb(pendingBounds);
    setShowSearchHere(false);
  }, [pendingBounds]);

  const clearBounds = useCallback((cb: (b: MapBounds | null) => void) => {
    setPendingBounds(null);
    cb(null);
    setShowSearchHere(false);
  }, []);

  return { pendingBounds, showSearchHere, onMapMove, applyBounds, clearBounds };
}
