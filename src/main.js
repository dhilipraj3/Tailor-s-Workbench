import './styles.css';
import './app.css';
import './real.css';
import './theme.css';
import './screens.css';
import { route } from './views/app.js';

route();

// Offline support + "Add to Home screen" (production builds only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
