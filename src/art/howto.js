// "How" strip: three numbered pictures beside the real piece that show the technique itself, step by step.
// Side views (cross-sections) show how layers fold for hems, casings, bands and felled seams;
// top views show darts, gathers, buttonholes, clipping and finishing. Picked from the step's caption and stitch.
import { H, ICON } from './svg.js';

const W = 285, FH = 136;   // one picture
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const lum = (hex) => { const h = String(hex).replace('#', ''); if (h.length < 6) return 0.5; const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

/** fabric shapes in this garment's colour */
const kit = (col) => {
  const dark = lum(col) > 0.6 ? '#2f3b45' : '#f7f3ea', edge = 'rgba(0,0,0,.35)';
  return {
    thread: dark,
    cloth: (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${col}" stroke="${edge}" stroke-width="1" style="filter:url(#cloth)" ${extra}/>`,
    under: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${col}" opacity=".6" stroke="${edge}" stroke-width="1"/>`,
    // a side view of fabric: a thick line in the fabric colour with a darker outline
    side: (d) => `<path d="${d}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    stitch: (d, d0) => H.draw(d, 'stitch solid tq', d0, 1).replace('class="', `style="stroke:${dark};stroke-width:2.4;stroke-dasharray:5 4;filter:none" class="`),
    needle: (x, y) => `<path d="M${x} ${y - 22} L${x} ${y + 14}" stroke="#d4d9de" stroke-width="2.4" stroke-linecap="round"/><circle cx="${x}" cy="${y + 4}" r="3.5" fill="${dark}"/>`,
    chalk: (d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="6 4" stroke-linecap="round"/>`,
    arrow: (d) => `<path d="${d}" fill="none" stroke="#ffd84a" stroke-width="3" stroke-linecap="round" marker-end="url(#ah)"/>`,
  };
};

// each technique: three pictures [label, drawing(k)]
const T = {
  dart: [
    ['Chalk the dart', (k) => k.cloth(20, 18, 245, 104) + k.chalk('M50 28 L215 70 L50 112')],
    ['Fold so the lines meet', (k) => k.under(20, 70, 245, 52) + k.cloth(20, 18, 245, 52) + `<path d="M20 70 L265 70" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/>` + k.chalk('M50 28 L215 70') + H.pin(215, 66, 0.3)],
    ['Sew to the point, tie off', (k) => k.under(20, 70, 245, 52) + k.cloth(20, 18, 245, 52) + k.chalk('M50 28 L215 70') + k.stitch('M50 28 L215 70', 0.2) + `<path d="M215 70 q14 6 10 18 M215 70 q18 -2 22 10" fill="none" stroke="${k.thread}" stroke-width="1.6"/>`],
  ],
  hem: [
    ['The raw edge', (k) => k.side('M20 96 L250 96')],
    ['Fold it up once', (k) => k.side('M20 96 L236 96 Q252 96 252 84 L200 84') + k.arrow('M262 104 Q272 90 262 78')],
    ['Fold again, sew near the fold', (k) => k.side('M20 96 L244 96 Q258 96 258 78 L196 78 Q188 78 188 86 L214 86') + k.needle(206, 86)],
  ],
  casing: [
    ['Turn the edge under', (k) => k.side('M20 100 L236 100 Q250 100 250 90 L224 90')],
    ['Fold down to make the tunnel', (k) => k.side('M20 100 L232 100 Q262 100 262 70 Q262 40 232 40 L150 40 Q140 40 140 50 L170 50') + k.arrow('M272 108 Q284 70 272 34')],
    ['Sew along the lower fold', (k) => k.side('M20 100 L232 100 Q262 100 262 70 Q262 40 232 40 L150 40 Q140 40 140 50 L170 50') + k.needle(158, 50) + `<text x="200" y="76" class="howt" style="font-size:12px">elastic goes here</text>`],
  ],
  band: [
    ['Sew the band on, good sides together', (k) => k.side('M20 100 L200 100') + k.side('M200 100 L200 30') + k.needle(200, 92)],
    ['Fold the band over the seam', (k) => k.side('M20 100 L200 100 L200 30 Q200 18 212 18 Q224 18 224 30 L224 96') + k.arrow('M236 40 Q248 60 236 84')],
    ['Sew close to the edge, catching it', (k) => k.side('M20 100 L200 100 L200 30 Q200 18 212 18 Q224 18 224 30 L224 104') + k.needle(212, 98)],
  ],
  under: [
    ['Sewn on: facing and garment', (k) => k.side('M20 70 L150 70') + k.side('M150 70 L270 70') + k.needle(150, 70)],
    ['Press seam towards the facing', (k) => k.side('M20 80 L150 80 L270 80') + k.side('M150 80 L210 64') + k.arrow('M160 52 L200 52')],
    ['Sew on the facing, through the seam', (k) => k.side('M20 80 L150 80 L270 80') + k.side('M150 80 L210 70') + k.needle(176, 76)],
  ],
  fell: [
    ['Sew the seam', (k) => k.side('M20 90 L150 90 L150 40') + k.side('M280 90 L160 90 L160 40') + k.needle(155, 82)],
    ['Trim one edge, wrap the other over it', (k) => k.side('M20 90 L150 90 L150 64') + k.side('M280 90 L160 90 L160 40 Q160 28 148 28 L130 28') + k.arrow('M120 20 Q100 30 110 50')],
    ['Press flat and sew down', (k) => k.side('M20 90 L150 90 L130 78') + k.side('M280 90 L160 90 L118 80 L130 74') + k.needle(122, 80)],
  ],
  gather: [
    ['Two rows of long stitches', (k) => k.cloth(20, 30, 245, 80) + k.stitch('M28 44 L258 44', 0.1) + k.stitch('M28 56 L258 56', 0.5)],
    ['Pull the threads gently', (k) => `<path d="M40 30 ${Array.from({ length: 10 }, (_, i) => `q9 ${i % 2 ? 8 : -8} 18 0`).join(' ')} L220 110 L40 110 Z" fill="none"/>` + k.cloth(40, 30, 180, 80) + Array.from({ length: 9 }, (_, i) => `<path d="M${52 + i * 19} 32 l0 76" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`).join('') + k.arrow('M226 50 L262 50')],
    ['Spread evenly, pin to fit', (k) => k.cloth(50, 30, 170, 80) + Array.from({ length: 12 }, (_, i) => `<path d="M${58 + i * 14} 32 l0 76" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`).join('') + H.pin(80, 40, 0.2) + H.pin(150, 40, 0.4) + H.pin(210, 40, 0.6)],
  ],
  clip: [
    ['The curved seam', (k) => k.cloth(20, 20, 245, 100) + `<path d="M30 40 Q142 140 255 40" fill="none" stroke="${k.thread}" stroke-width="2.4" stroke-dasharray="5 4"/>`],
    ['Trim the edge narrow', (k) => k.cloth(20, 20, 245, 100) + `<path d="M30 40 Q142 140 255 40" fill="none" stroke="${k.thread}" stroke-width="2.4" stroke-dasharray="5 4"/>` + H.cut('M30 30 Q142 128 255 30', 0.2, 1)],
    ['Snip up to the stitches', (k) => k.cloth(20, 20, 245, 100) + `<path d="M30 40 Q142 140 255 40" fill="none" stroke="${k.thread}" stroke-width="2.4" stroke-dasharray="5 4"/>` + [60, 100, 142, 184, 224].map((x) => `<path d="M${x} ${x === 142 ? 72 : x < 142 ? 40 + (x - 30) * 0.5 : 40 + (255 - x) * 0.5} l0 -16" stroke="#fff" stroke-width="2"/>`).join('')],
  ],
  edge: [
    ['Press the edge flat', (k) => k.side('M20 90 L240 90 Q256 90 256 76 L140 76')],
    ['Line the foot up with the edge', (k) => k.side('M20 90 L240 90 Q256 90 256 76 L140 76') + `<g transform="translate(240 70)">${ICON.foot()}</g>`],
    ['Sew a tiny distance from the edge', (k) => k.side('M20 90 L240 90 Q256 90 256 76 L140 76') + k.needle(244, 82)],
  ],
  zigzag: [
    ['Cut edges fray', (k) => k.cloth(20, 30, 245, 80) + Array.from({ length: 16 }, (_, i) => `<path d="M${28 + i * 15} 110 l${i % 2 ? 2 : -2} 10" stroke="${k.thread}" stroke-width="1.2"/>`).join('')],
    ['Zigzag over the edge', (k) => k.cloth(20, 30, 245, 80) + H.stitch(H.zz([[28, 104], [258, 104]], 6, 9), 0.2, 1, '', 'stitch solid tq')],
    ['A clean, strong edge', (k) => k.cloth(20, 30, 245, 80) + `<path d="${H.zz([[28, 104], [258, 104]], 6, 9)}" fill="none" stroke="${k.thread}" stroke-width="1.6"/>`],
  ],
  seam: [
    ['Good sides together', (k) => k.under(20, 46, 245, 70) + k.cloth(28, 30, 237, 70)],
    ['Pin across the line', (k) => k.under(20, 46, 245, 70) + k.cloth(28, 30, 237, 70) + H.pin(70, 44, 0.2) + H.pin(150, 44, 0.4) + H.pin(230, 44, 0.6)],
    ['Sew along the guide, lock both ends', (k) => k.under(20, 46, 245, 70) + k.cloth(28, 30, 237, 70) + k.stitch('M30 48 L262 48', 0.2) + `<path d="M30 30 L30 48" stroke="#4fb3ff" stroke-width="2"/><text x="36" y="42" class="howt" style="font-size:11px">seam width</text>`],
  ],
  buttonhole: [
    ['Mark the buttonhole', (k) => k.cloth(20, 20, 245, 100) + k.chalk('M90 70 L200 70')],
    ['Sew with the buttonhole foot', (k) => k.cloth(20, 20, 245, 100) + `<rect x="86" y="62" width="118" height="16" rx="2" fill="none" stroke="${k.thread}" stroke-width="4"/>`],
    ['Open it, pin across the end', (k) => k.cloth(20, 20, 245, 100) + `<rect x="86" y="62" width="118" height="16" rx="2" fill="none" stroke="${k.thread}" stroke-width="4"/>` + H.cut('M96 70 L194 70', 0.2, 0.8) + H.pin(198, 70, 0.1)],
  ],
  button: [
    ['Mark through the buttonhole', (k) => k.cloth(20, 20, 245, 100) + `<path d="M140 60 l0 20 M130 70 l20 0" stroke="#fff" stroke-width="2.5"/>`],
    ['Sew through the holes, 4 times', (k) => k.cloth(20, 20, 245, 100) + ICON.button(140, 70, 18) + `<path d="M133 63 L147 77 M147 63 L133 77" stroke="${k.thread}" stroke-width="2"/>`],
    ['Wind thread under it for a stem', (k) => k.cloth(20, 20, 245, 100) + ICON.button(140, 62, 18) + `<path d="M132 84 q8 6 16 0 M132 89 q8 6 16 0" fill="none" stroke="${k.thread}" stroke-width="2"/>`],
  ],
  bartack: [
    ['The end that takes the pull', (k) => k.cloth(20, 20, 245, 100) + `<path d="M142 120 L142 60" stroke="rgba(0,0,0,.45)" stroke-width="3"/>`],
    ['Short, very close zigzag', (k) => k.cloth(20, 20, 245, 100) + `<path d="M142 120 L142 60" stroke="rgba(0,0,0,.45)" stroke-width="3"/>` + H.stitch(H.zz([[122, 60], [162, 60]], 5, 2.5), 0.2, 0.8, '', 'stitch solid tq')],
    ['Strong and flat', (k) => k.cloth(20, 20, 245, 100) + `<path d="M142 120 L142 60" stroke="rgba(0,0,0,.45)" stroke-width="3"/><rect x="122" y="54" width="40" height="12" rx="2" fill="${k.thread}"/>`],
  ],
  stay: [
    ['One layer, before anything else', (k) => k.cloth(20, 20, 245, 100) + '<path d="M40 30 Q142 110 245 30" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>'],
    ['Sew just inside the sewing line', (k) => k.cloth(20, 20, 245, 100) + '<path d="M40 30 Q142 110 245 30" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/>' + k.stitch('M48 36 Q142 104 237 36', 0.2)],
    ['The curve now cannot stretch', (k) => k.cloth(20, 20, 245, 100) + '<path d="M48 36 Q142 104 237 36" fill="none" stroke="' + k.thread + '" stroke-width="2.4" stroke-dasharray="5 4"/>'],
  ],
  sleeve: [
    ['Sleeve top to the shoulder seam', (k) => k.cloth(20, 60, 245, 60) + '<path d="M40 60 Q142 0 245 60 Z" fill="' + k.thread + '" opacity=".0"/>' + '<path d="M40 64 Q142 6 245 64" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="8"/>' + H.pin(142, 30, 0.2)],
    ['Pull the long stitches to fit, pin', (k) => k.cloth(20, 60, 245, 60) + '<path d="M40 64 Q142 6 245 64" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="8"/>' + H.pin(70, 44, 0.1) + H.pin(142, 30, 0.2) + H.pin(214, 44, 0.3)],
    ['Sew with the sleeve underneath', (k) => k.cloth(20, 60, 245, 60) + '<path d="M40 64 Q142 6 245 64" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="8"/>' + k.stitch('M44 70 Q142 14 241 70', 0.2)],
  ],
  fuse: [
    ['Fabric wrong side up', (k) => k.cloth(20, 40, 245, 80)],
    ['Interfacing on top, glue side down', (k) => k.cloth(20, 40, 245, 80) + H.move('<rect x="30" y="48" width="225" height="64" rx="2" class="intf"/>', 0, -40, 0.2, 0.8)],
    ['Press 10 seconds: lift, do not slide', (k) => k.cloth(20, 40, 245, 80) + '<rect x="30" y="48" width="225" height="64" rx="2" class="intf"/>' + `<g transform="translate(150 54) scale(.7)">${ICON.iron(0, 0)}</g>`],
  ],
};

/** which technique a step teaches */
function pick(st) {
  const c = (st.cap || '').toLowerCase(), d = st.d || {};
  if (/dart/.test(c)) return 'dart';
  if (d.stitch === 'stay' || /stay-stitch/.test(c)) return 'stay';
  if (/ease/.test(c)) return 'gather';
  if (/sleeve/.test(c) && /(sew|pin) (in|on)/.test(c)) return 'sleeve';
  if (/casing/.test(c)) return 'casing';
  if (/fell/.test(c)) return 'fell';
  if (/gather/.test(c) || d.stitch === 'gather') return 'gather';
  if (/understitch/.test(c) || d.stitch === 'under') return 'under';
  if (/close the|band on|cuff on|stand on|neckline|close/.test(c) && /band|cuff|stand|waistband/.test(c)) return 'band';
  if (/hem/.test(c)) return 'hem';
  if (/clip|trim/.test(c) || d.trim) return 'clip';
  if (d.stitch === 'zigzag' || /fraying/.test(c)) return 'zigzag';
  if (d.stitch === 'buttonhole') return 'buttonhole';
  if (d.stitch === 'button') return 'button';
  if (d.stitch === 'bartack' || /bartack/.test(c)) return 'bartack';
  if (d.stitch === 'fuse' || /interfacing/.test(c)) return 'fuse';
  if (d.stitch === 'edge' || d.stitch === 'top' || /edgestitch|topstitch/.test(c)) return 'edge';
  if (d.stitch === 'straight' && d.join) return 'seam';
  return null;
}

/** the strip for a step, placed in the right part of the 800×500 stage, or '' when the step has none */
export function howStrip(st, col) {
  const id = pick(st); if (!id) return '';
  const k = kit(col), x0 = 505, y0 = 30;
  return `<g class="howstrip">` + T[id].map(([label, draw], i) => {
    const y = y0 + i * (FH + 12);
    return `<g transform="translate(${x0} ${y})"><rect width="${W}" height="${FH}" rx="12" fill="rgba(10,10,10,.55)" stroke="rgba(255,255,255,.12)"/>` +
      `<g transform="translate(0 -6)">${H.fade(draw(k), 0.15 + i * 0.6)}</g>` +
      `<circle cx="18" cy="18" r="12" fill="#8fcbb5"/><text x="18" y="22.5" text-anchor="middle" style="font:800 13px var(--f-body);fill:#10201a">${i + 1}</text>` +
      `<text x="${W / 2}" y="${FH - 10}" text-anchor="middle" class="howt">${esc(label)}</text></g>`;
  }).join('') + `</g>`;
}
