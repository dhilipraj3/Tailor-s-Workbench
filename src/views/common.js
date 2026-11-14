import { GARMENTS } from '../garments/index';
import { f } from '../core/units.js';

// Fabric texture for sketches: soft folds lit from the top left, a fine weave, and a light shadow.
// Frequencies are in sketch units (about 2 px each), so they differ from the stage filter.
const SKETCH_DEFS = `<defs><filter id="clothS" x="-6%" y="-4%" width="112%" height="112%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency=".01 .045" numOctaves="2" seed="9" result="n"/>
  <feDiffuseLighting in="n" surfaceScale="1.6" diffuseConstant="1" lighting-color="#fff" result="L"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="L" operator="arithmetic" k1=".7" k2=".35" result="lit"/>
  <feTurbulence type="fractalNoise" baseFrequency="1.1 .25" numOctaves="1" seed="2" result="w"/><feColorMatrix in="w" type="luminanceToAlpha" result="wa"/>
  <feComposite in="lit" in2="wa" operator="arithmetic" k2="1" k3="-.08" k4=".025" result="woven"/>
  <feComposite in="woven" in2="SourceAlpha" operator="in" result="c"/>
  <feDropShadow in="c" dx="1" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".22"/></filter></defs>`;

// Product-style rendering on top of the flat drawing: one light across the whole garment,
// soft vertical folds, darker edges for volume, stitch lines beside every seam, shiny buttons,
// and a shadow under the garment. Shared gradients; each drawing gets its own clip (its silhouette).
const RENDER_DEFS = `<defs>
  <linearGradient id="gLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
  <linearGradient id="gFold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".14"/><stop offset=".28" stop-color="#fff" stop-opacity=".1"/><stop offset=".5" stop-color="#000" stop-opacity=".03"/><stop offset=".72" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
  <radialGradient id="gBtn" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cfc8b6"/></radialGradient>
  <filter id="gEdge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="gShadow" x="-10%" y="-6%" width="120%" height="125%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter></defs>`;
const SHAPE = /<(path|rect|circle|ellipse|polygon)\b[^>]*\bclass="sk2?"[^>]*\/>/g;
let sketchN = 0;

/** Product-style drawing of a design with its options; crop = [x,y,w,h] to zoom on a detail. */
export function sketchSvg(garmentId, options, crop, cls = '', color = '') {
  const g = GARMENTS[garmentId];
  const vb = crop ? crop.join(' ') : g.viewBox, [vx, vy, vw, vh] = vb.split(/\s+/).map(Number), k = ++sketchN;
  const art = g.sketch(options);
  const sil = (art.match(SHAPE) || []).map((s) => s.replace(/\sclass="sk2?"/, '').replace(/\sfilter="[^"]*"/, '')).join('');
  // every seam line also gets a row of stitches beside it
  const stitched = art.replace(/<path([^>]*?)\sclass="skl"([^>]*?)\/>/g, (m, a, b) => `${m}<path${a} class="skt"${b} transform="translate(.9 .7)"/>`);
  const shade = sil ? `<g clip-path="url(#sc${k})" pointer-events="none"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#gFold)"/><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#gLight)"/>` +
    `<g filter="url(#gEdge)" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="5">${sil}</g></g>` : '';
  return `<svg class="sketch ${garmentId} ${cls}" viewBox="${vb}" aria-hidden="true"${color ? ` style="--skf:${color}"` : ''}>${SKETCH_DEFS}${RENDER_DEFS}` +
    `<defs><clipPath id="sc${k}">${sil}</clipPath></defs><g filter="url(#gShadow)"><g filter="url(#clothS)">${stitched}</g></g>${shade}${art.match(/<[^>]*class="skl"[^>]*\/>/g)?.join('') || ''}</svg>`;
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
