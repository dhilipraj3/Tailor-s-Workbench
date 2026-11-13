import './styles.css';
import { render } from './ui/app.js';

render();

// Offline support + "Add to Home screen" (production builds only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
