import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (PWA)
if ('serviceWorker' in navigator) {
  // @ts-ignore - virtual module provided by vite-plugin-pwa
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {
    // noop
  });
}
