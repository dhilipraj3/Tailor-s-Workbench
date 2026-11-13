import { GARMENTS } from '../garments/index';
import { f } from '../core/units.js';

/** Flat technical sketch of a design with options; crop = [x,y,w,h] to zoom on a detail. */
export function sketchSvg(garmentId, options, crop, cls = '') {
  const g = GARMENTS[garmentId];
  const vb = crop ? crop.join(' ') : g.viewBox;
  return `<svg class="sketch ${garmentId} ${cls}" viewBox="${vb}" aria-hidden="true">${g.sketch(options)}</svg>`;
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const levelDots = (n) => `<span class="lvl" aria-label="Difficulty ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
export const avatar = (p, size = 40) => `<span class="avatar" style="--c:${p.color};width:${size}px;height:${size}px;font-size:${size * 0.45}px">${esc((p.name || '?').trim().charAt(0).toUpperCase())}</span>`;
export { f };

export function download(bytes, name, type) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** Two-tap delete: first tap arms the button, second tap within 3 s confirms. */
export function armConfirm(btn, run) {
  if (btn.dataset.armed) { run(); return; }
  btn.dataset.armed = '1'; btn.classList.add('armed'); const old = btn.innerHTML; btn.innerHTML = 'Tap again';
  setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.classList.remove('armed'); btn.innerHTML = old; } }, 3000);
}
