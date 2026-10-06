import { useSyncExternalStore } from 'react';

/**
 * Tiny global store tracking how many async operations are in flight.
 * The centered LoadingOverlay shows while the count is above zero.
 * Fed automatically by the axios interceptors in services/api.js
 * and by route changes in MainLayout.
 */
let pending = 0;
const listeners = new Set();

const emit = () => listeners.forEach((l) => l());

export const loadingStore = {
  start() {
    pending += 1;
    emit();
  },
  stop() {
    pending = Math.max(0, pending - 1);
    emit();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => pending > 0,
};

export const useIsLoading = () =>
  useSyncExternalStore(loadingStore.subscribe, loadingStore.getSnapshot);
