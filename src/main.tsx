// Fetch override safeguard for iframe environments
(function() {
  if (typeof window !== 'undefined') {
    if (typeof (window as any).FormData === 'undefined') {
      try {
        class DummyFormData {
          append() {}
          delete() {}
          get() {}
          getAll() {}
          has() {}
          set() {}
          *keys() {}
          *values() {}
          *entries() {}
          [Symbol.iterator]() { return this.entries(); }
        }
        (window as any).FormData = DummyFormData;
      } catch (e) {}
    } else {
      try {
        if (!(window as any).FormData.prototype.keys) {
          (window as any).FormData.prototype.keys = function* () {};
        }
        if (!(window as any).FormData.prototype.values) {
          (window as any).FormData.prototype.values = function* () {};
        }
        if (!(window as any).FormData.prototype.entries) {
          (window as any).FormData.prototype.entries = function* () {};
        }
      } catch (e) {}
    }

    try {
      let originalFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        get() { return originalFetch; },
        set(v) { originalFetch = v; },
        configurable: true,
        enumerable: true
      });
    } catch (e) {}

    try {
      let originalGlobalFetch = globalThis.fetch;
      Object.defineProperty(globalThis, 'fetch', {
        get() { return originalGlobalFetch; },
        set(v) { originalGlobalFetch = v; },
        configurable: true,
        enumerable: true
      });
    } catch (e) {}
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
