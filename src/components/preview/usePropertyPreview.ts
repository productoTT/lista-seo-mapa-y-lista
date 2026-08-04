import { useCallback, useRef, useState } from 'react';
import type {
  PreviewVariant, PreviewOrigin, PreviewStage, PreviewLoadState,
  DrawerSize, ModalColumns, MapPanelSize, MapReplaceView, BackgroundMode,
  PreviewToggles, ContactFormValues,
} from './previewTypes';

const LOADING_DELAY = 380;
const EMPTY_FORM: ContactFormValues = { name: '', email: '', phone: '', message: '' };
const DEFAULT_TOGGLES: PreviewToggles = {
  similar: true, descriptionExpanded: false, clpEquivalent: true, prevNext: true,
};

interface OpenOptions {
  stage?: PreviewStage;
}

export function usePropertyPreview(navigationIds: string[]) {
  const idsRef = useRef(navigationIds);
  idsRef.current = navigationIds;

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<PreviewOrigin>('card');
  const [stage, setStage] = useState<PreviewStage>('preview');
  const [loadState, setLoadState] = useState<PreviewLoadState>('idle');
  const [galleryExpanded, setGalleryExpanded] = useState(false);

  const [variant, setVariant] = useState<PreviewVariant>('drawer');
  const [drawerSize, setDrawerSize] = useState<DrawerSize>('amplio');
  const [modalColumns, setModalColumns] = useState<ModalColumns>(2);
  const [mapPanelSize, setMapPanelSize] = useState<MapPanelSize>('expanded');
  const [mapReplaceView, setMapReplaceView] = useState<MapReplaceView>('ficha');
  const [background, setBackground] = useState<BackgroundMode>('overlay');
  const [toggles, setToggles] = useState<PreviewToggles>(DEFAULT_TOGGLES);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactForm, setContactForm] = useState<ContactFormValues>(EMPTY_FORM);

  const loadingTimer = useRef<number | null>(null);
  const clearTimer = () => {
    if (loadingTimer.current !== null) { window.clearTimeout(loadingTimer.current); loadingTimer.current = null; }
  };

  const open = useCallback((id: string, o: PreviewOrigin, opts?: OpenOptions) => {
    clearTimer();
    setPropertyId(id);
    setOrigin(o);
    setStage(opts?.stage ?? 'preview');
    setGalleryIndex(0);
    setGalleryExpanded(false);
    setContactForm(EMPTY_FORM);
    setLoadState('loading');
    loadingTimer.current = window.setTimeout(() => setLoadState('idle'), LOADING_DELAY);
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setPropertyId(null);
    setLoadState('idle');
    setGalleryExpanded(false);
  }, []);

  const retry = useCallback(() => {
    clearTimer();
    setLoadState('loading');
    loadingTimer.current = window.setTimeout(() => setLoadState('idle'), LOADING_DELAY);
  }, []);

  const goTo = useCallback((direction: 1 | -1) => {
    const ids = idsRef.current;
    setPropertyId(current => {
      if (!current) return current;
      const idx = ids.indexOf(current);
      if (idx < 0) return current;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= ids.length) return current;
      const nextId = ids[nextIdx];
      clearTimer();
      setOrigin('card');
      setStage('preview');
      setGalleryIndex(0);
      setGalleryExpanded(false);
      setContactForm(EMPTY_FORM);
      setLoadState('loading');
      loadingTimer.current = window.setTimeout(() => setLoadState('idle'), LOADING_DELAY);
      return nextId;
    });
  }, []);

  const goPrev = useCallback(() => goTo(-1), [goTo]);
  const goNext = useCallback(() => goTo(1), [goTo]);

  const startContact = useCallback(() => setStage('contact'), []);
  const backToInfo = useCallback(() => setStage('preview'), []);
  const submitContact = useCallback(() => setStage('contact-sent'), []);

  const updateContactForm = useCallback((partial: Partial<ContactFormValues>) => {
    setContactForm(f => ({ ...f, ...partial }));
  }, []);

  const toggle = useCallback((key: keyof PreviewToggles) => {
    setToggles(t => ({ ...t, [key]: !t[key] }));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setPropertyId(null);
    setLoadState('idle');
    setGalleryExpanded(false);
    setVariant('drawer');
    setDrawerSize('amplio');
    setModalColumns(2);
    setMapPanelSize('expanded');
    setMapReplaceView('ficha');
    setBackground('overlay');
    setToggles(DEFAULT_TOGGLES);
  }, []);

  const navIndex = propertyId ? idsRef.current.indexOf(propertyId) : -1;
  const hasPrev = navIndex > 0;
  const hasNext = navIndex >= 0 && navIndex < idsRef.current.length - 1;

  return {
    propertyId, origin, stage, loadState, galleryExpanded,
    variant, drawerSize, modalColumns, mapPanelSize, mapReplaceView, background,
    toggles, galleryIndex, contactForm,
    hasPrev, hasNext,
    open, close, retry, goPrev, goNext, startContact, backToInfo, submitContact,
    updateContactForm, toggle, reset,
    setVariant, setDrawerSize, setModalColumns, setMapPanelSize, setMapReplaceView,
    setBackground, setGalleryIndex, setGalleryExpanded, setOrigin, setLoadState, setStage,
  };
}

export type PropertyPreviewController = ReturnType<typeof usePropertyPreview>;
