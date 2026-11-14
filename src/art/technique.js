// A close-up picture for any sewing step, built from its sewing detail (engine/sew.ts):
// the fabric in the garment's colour, the edge at the top, and the stitch, press, trim or fold
// happening at the right distance. Used when a step would otherwise repeat the previous picture.
import { H, ICON } from './svg.js';
import { f } from '../core/units.js';

const PX = 110;                       // pixels per inch in the close-up
const X0 = 130, X1 = 670, EDGE = 165;  // working edge across the top of the fabric
const n1 = (v) => Math.round(v * 10) / 10;
// thread that shows on this fabric: dark thread on light cloth, light thread on dark cloth
const lum = (hex) => { const h = String(hex).replace('#', ''); if (h.length < 6) return 0.5; const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
let THREAD = '#f7f3ea';

function cloth(col, two) {
  const layer = (dy, op) => `<rect x="${X0 - 20}" y="${EDGE + dy}" width="${X1 - X0 + 40}" height="${300 - dy}" rx="6" fill="${col}" opacity="${op}" style="filter:url(#cloth)" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`;
  return (two ? layer(10, 0.8) : '') + layer(0, 1);
}

function seamLine(d, y) {
  const band = d.sa ? `<rect x="${X0 - 20}" y="${EDGE}" width="${X1 - X0 + 40}" height="${n1(y - EDGE)}" fill="rgba(31,111,214,.16)"/>` : '';
  const len = d.stitch === 'baste' || d.stitch === 'gather' ? '14 9' : d.stitch === 'stay' ? '5 4' : '7 5';
  const path = `M${X0} ${n1(y)} L${X1} ${n1(y)}`;
  let out = band + H.stitch(path, 0.5, 2.6, 'foot').replace(/class="stitch"/, `class="stitch" style="stroke-dasharray:${len};stroke:${THREAD};stroke-width:2.6;filter:none"`);
  if (d.lock === true || d.lock === 'start') out += H.draw(`M${X0} ${n1(y)} L${X0 + 26} ${n1(y)}`, 'stitch solid tq', 0.5, 0.3);
  if (d.lock === true) out += H.draw(`M${X1 - 26} ${n1(y)} L${X1} ${n1(y)}`, 'stitch solid tq', 3.1, 0.3);
  return out;
}

const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

export function techniqueScene(d, color = '#a8c0e0', cap = '') {
  const col = color, two = !!d.join && /together/i.test(d.join);
  THREAD = lum(col) > 0.6 ? '#2f3b45' : '#f7f3ea';
  const sa = d.sa ?? 0, y = EDGE + Math.max(sa, 0.06) * PX;
  let art = cloth(col, two);
  const measure = d.sa != null && d.sa > 0 ? H.dim([X1 + 40, EDGE], [X1 + 40, y], f(d.sa), 0.2) : '';
  switch (d.stitch) {
    case 'straight': case 'stay': case 'baste': case 'edge': case 'top': case 'under': case 'ditch':
      art += measure + seamLine(d, y);
      break;
    case 'gather':
      art += measure + seamLine(d, y) + H.stitch(`M${X0} ${n1(y + 0.25 * PX)} L${X1} ${n1(y + 0.25 * PX)}`, 3.3, 2.2, 'foot') +
        H.fade(`<path d="M${X0} ${EDGE} ${Array.from({ length: 18 }, (_, i) => `q 15 ${i % 2 ? 9 : -9} 30 0`).join(' ')}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>`, 5.6);
      break;
    case 'zigzag': {
      const pts = [[X0, EDGE + 8], [X1, EDGE + 8]];
      art += H.stitch(H.zz(pts, 7, 12), 0.5, 2.8, 'foot', 'stitch solid tq');
      break;
    }
    case 'bartack': {
      const pts = [[360, EDGE + 60], [440, EDGE + 60]];
      art += H.stitch(H.zz(pts, 6, 3), 0.5, 1.6, 'foot', 'stitch solid tq') + H.ring(400, EDGE + 60, 60, 2.3);
      break;
    }
    case 'buttonhole': {
      const yy = EDGE + 110;
      art += H.stitch(`M330 ${yy - 8} L470 ${yy - 8} L470 ${yy + 8} L330 ${yy + 8} Z`, 0.5, 2.6, 'foot', 'stitch solid tq') +
        H.cut(`M342 ${yy} L458 ${yy}`, 3.4, 1);
      break;
    }
    case 'button': {
      const yy = EDGE + 110;
      art += H.pop(ICON.button(400, yy, 22), 0.3) + H.draw(`M392 ${yy - 8} L408 ${yy + 8} M408 ${yy - 8} L392 ${yy + 8}`, 'thread', 1, 2.2);
      break;
    }
    case 'hand':
      art += H.draw(Array.from({ length: 9 }, (_, i) => `M${X0 + 30 + i * 55} ${EDGE + 40} l20 0`).join(' '), 'stitch solid tq', 0.4, 3.4) +
        H.follow(`M${X0 + 30} ${EDGE + 30} L${X1 - 30} ${EDGE + 30}`, 0.4, 3.4, ICON.hand(), false);
      break;
    case 'fuse':
      art += H.move(`<rect x="${X0}" y="${EDGE + 20}" width="${X1 - X0}" height="220" rx="4" class="intf"/>`, 0, -260, 0.3, 1.2) + H.iron(330, EDGE + 120, 1.8, 160, 0, 3);
      break;
    default: {
      // no stitching: press, trim or fold
      if (d.trim) art += H.cut(`M${X0} ${EDGE + 0.2 * PX} L${X1} ${EDGE + 0.2 * PX}`, 0.4, 2.4) +
        H.draw(Array.from({ length: 8 }, (_, i) => `M${X0 + 40 + i * 65} ${EDGE} l0 ${0.2 * PX}`).join(' '), 'cutl', 3, 1);
      else if (/^turn/i.test(cap)) art += H.flip(`<rect x="${X0 + 120}" y="${EDGE + 40}" width="300" height="160" rx="8" fill="${col}" style="filter:url(#cloth)" opacity=".9"/>`, 'x', 400, 0.5, 1.4) + H.arrow('M560 380 Q 620 300 560 230', 1.2);
      else if (d.press) art += H.iron(260, EDGE + 120, 0.4, 260, 0, 3) + H.fade('<path d="M200 140 q10 -30 0 -60 M240 140 q10 -30 0 -60" class="steam"/>', 1);
      else art += H.arrow(`M${X1 - 40} ${EDGE + 200} Q ${X1 + 30} ${EDGE + 100} ${X1 - 40} ${EDGE + 20}`, 0.5) +
        H.fade(`<rect x="${X0 - 20}" y="${EDGE}" width="${X1 - X0 + 40}" height="60" rx="4" fill="rgba(0,0,0,.18)"/>`, 1.2);
    }
  }
  // the step's name across the top, so every close-up says what it shows
  return `<g style="--thread:${THREAD}">${art}</g>` + (cap ? `<text x="400" y="70" class="wordt" style="font-size:30px">${esc(cap.toUpperCase())}</text>` : '');
}
