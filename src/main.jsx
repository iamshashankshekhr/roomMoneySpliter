import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto reload on Vite dynamic chunk load failure after a new deployment
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading to get latest build...', event);
  window.location.reload();
});

// Progressive Web App Service Worker Handling
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In local development, unregister any active service worker and purge caches
    // to prevent interference with Vite HMR and module resolution
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  } else {
    // Production only: Register SW on page load
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('RoomSplit PWA Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration note:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
