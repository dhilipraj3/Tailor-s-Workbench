// Every sewing step drawn on the real pattern pieces in this person's size and the garment's colour:
// the pieces the step works on, the edges it touches glowing, and the action itself (sewing along the
// real edge, zigzag, gathering, pinning, folding, turning over, pressing, trimming, buttonholes, buttons,
// hand stitches), with the seam width in a close-up circle.
import { H, ICON, fabricColors, pieceShape, place, D, fabric, glow, sewAlong, pinsAlong, zoom } from './kit.js';

const SEWN = ['straight', 'stay', 'baste', 'gather', 'edge', 'top', 'under', 'ditch'];
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const n1 = (v) => v.toFixed(1);

/** each named edge as its separate runs of points (e.g. a sleeve has two underarm edges, a front split by a dart has two side runs) */
export function runs(piece) {
  const out = {}; let prev = null;
  for (const e of piece.outline.edges) {
    const k = e.name || '?', list = (out[k] = out[k] || []);
    if (prev === k && list.length) list[list.length - 1].push(...e.pts.slice(1)); else list.push([...e.pts]);
    prev = k;
  }
  return out;
}

/** lay out 1–3 pieces side by side (or one on top of the other when they are sewn together) */
function layout(shapes, stacked) {
  const list = stacked ? shapes.slice(0, 1) : shapes.slice(0, 3);
  const dims = list.map((sh) => { const [bx0, y0, x1, y1] = sh.box, whole = !!sh.piece.fold, x0 = whole ? -x1 : bx0; return { sh, whole, x0, x1, y0, y1, w: x1 - x0, h: y1 - y0 }; });
  const gap = 0.6, totW = dims.reduce((s, d) => s + d.w, 0) + gap * (dims.length - 1), maxH = Math.max(...dims.map((d) => d.h));
  const s = Math.min(640 / Math.max(totW, 0.1), 330 / Math.max(maxH, 0.1), 60);
  let x = 400 - (totW * s) / 2;
  return dims.map((d) => {
    const ox = x - d.x0 * s, oy = 110 + (350 - d.h * s) / 2 - d.y0 * s;
    x += (d.w + gap) * s;
    return { ...d, s, ox, oy, M: place(ox, oy, s), Mm: place(ox, oy, s, true) };
  });
}

export function pieceScene(ctx, d, color, cap = '', ctxRefs = null) {
  if (!d) return null;
  const src = (d.edges?.length || d.pieces?.length) ? d : ctxRefs;   // a step that names nothing borrows its neighbour's pieces
  if (!src) return null;
  const refs = (src.edges || []).map((e) => e.split(':'));
  const ids = [...new Set([...refs.map((r) => r[0]), ...(src.pieces || [])])];
  const shapes = ids.map((id) => pieceShape(ctx, id)).filter(Boolean);
  if (!shapes.length) return null;
  const joined = !!(d.join && /together/i.test(d.join)) && shapes.length > 1;
  const placed = layout(shapes, joined), col = fabricColors(color);
  {
    const p = placed[0], R = runs(p.sh.piece), mine = refs.filter((r) => r[0] === p.sh.piece.id && r[1] !== '*').map((r) => r[1]);
    const pts = mine.flatMap((n) => (R[n] || []).flat());
    if (placed.length === 1 && pts.length) {
      const xs = pts.map(([x]) => x), ys = pts.map(([, y]) => y);   // on a piece cut on the fold, zoom on one half
      const ex0 = Math.min(...xs), ex1 = Math.max(...xs), ey0 = Math.min(...ys), ey1 = Math.max(...ys);
      if (ey1 - ey0 < 0.25 * p.h && ex1 - ex0 < 0.6 * p.w) {
        // the detail is small: zoom so its area fills the middle of the picture
        const cx = (ex0 + ex1) / 2, cy = (ey0 + ey1) / 2, s = Math.min(560 / Math.max(ex1 - ex0 + 6, 0.1), 300 / Math.max(ey1 - ey0 + 5, 0.1), 140);
        const ox = 400 - cx * s, oy = 290 - cy * s;
        Object.assign(p, { s, ox, oy, M: place(ox, oy, s), Mm: place(ox, oy, s, true), zoomed: true });
      }
    }
  }
  const word = cap.toLowerCase();
  let out = '', t0 = 0.5;

  // the second piece lies underneath, shifted a little, when the step joins two pieces
  if (joined) { const p = placed[0]; out += H.fade(fabric(shapes[1], place(p.ox + 12, p.oy + 10, p.s), col, 'wrong', { stitchLine: false }), 0.1); }

  const turning = /^turn (the|it|each|right)|right side out|turn .* through/.test(word) && !/^turn and/.test(word);
  for (const p of placed) {
    const maps = p.whole ? [p.M, p.Mm] : [p.M];
    let piece = (p.whole ? fabric(p.sh, p.Mm, col, 'right') : '') + fabric(p.sh, p.M, col, 'right', { label: p.whole ? '' : esc(p.sh.piece.name.toUpperCase()) });
    if (p.whole) { const c = p.M([0, (p.y0 + p.y1) / 2]); piece += `<text x="${n1(c[0])}" y="${n1(c[1])}" text-anchor="middle" style="font:700 15px var(--f-display);letter-spacing:.06em" fill="rgba(0,0,0,.45)">${esc(p.sh.piece.name.toUpperCase())}</text>`; }
    // turning right side out / turning a band or strip through: the piece flips over
    out += turning ? H.flip(piece, 'x', n1(p.M([(p.x0 + p.x1) / 2, 0])[0]), 0.4, 1.2) : piece;

    const named = refs.filter((r) => r[0] === p.sh.piece.id).map((r) => r[1]);
    const R = runs(p.sh.piece);
    // a step that names no edges (pressing the whole garment) highlights none; otherwise its edges, or all with "*"
    const names = named.includes('*') ? Object.keys(R) : named.length ? named : (d.stitch === 'none' && d.press ? [] : Object.keys(R));
    for (const pts of names.flatMap((n) => R[n] || [])) {
      if (!pts || pts.length < 2) continue;
      for (const m of maps) {
        out += glow(pts, m, 0.2);
        if (SEWN.includes(d.stitch)) { out += sewAlong(pts, m, t0, 1.4); t0 += 1.5; }
        else if (d.stitch === 'zigzag') { out += H.stitch(H.zz(pts.map(m), 5, 10), t0, 1.4, 'foot', 'stitch solid'); t0 += 1.5; }
        else if (d.stitch === 'hand') { out += H.draw(D(pts, m, false), 'stitch', t0, 1.6) + H.follow(D(pts, m, false), t0, 1.6, ICON.hand(), false); t0 += 1.7; }
        else if (d.stitch === 'none' && d.trim) { out += H.cut(D(pts, m, false), t0, 1.4); t0 += 1.5; }
        else if (d.stitch === 'none' && !d.press && !turning) { out += pinsAlong(pts, m, t0, 4, 1); t0 += 0.8; }
      }
    }
    const mid = p.M([(p.x0 + p.x1) / 2 * (p.whole ? 0 : 1) + (p.whole ? 0 : 0), (p.y0 + p.y1) / 2]);
    if (d.stitch === 'fuse' || (d.stitch === 'none' && d.press)) out += H.iron(mid[0] - 40, mid[1] + 30, 0.6, 120, 0, 3);
    if (d.stitch === 'buttonhole' || d.stitch === 'button' || d.stitch === 'bartack') {
      // along the centre front (or down the middle of a strip): buttonholes, buttons or a bartack
      const top = p.M([p.whole ? 0 : (p.x0 + p.x1) / 2, p.y0 + (p.y1 - p.y0) * 0.15]), bot = p.M([p.whole ? 0 : (p.x0 + p.x1) / 2, p.y0 + (p.y1 - p.y0) * (d.stitch === 'bartack' ? 0.2 : 0.55)]);
      const k = d.stitch === 'bartack' ? 1 : 4;
      for (let i = 0; i < k; i++) {
        const y = top[1] + ((bot[1] - top[1]) * i) / Math.max(1, k - 1), x = top[0] + 6;
        out += d.stitch === 'button' ? H.pop(ICON.button(x, y, 8), t0 + i * 0.4)
          : d.stitch === 'bartack' ? H.stitch(H.zz([[x - 18, y], [x + 18, y]], 4, 3), t0, 0.8, 'foot', 'stitch solid')
            : H.stitch(`M${n1(x)} ${n1(y - 9)} L${n1(x)} ${n1(y + 9)}`, t0 + i * 0.5, 0.45, 'foot', 'stitch solid');
      }
    }
  }
  // the seam-width close-up sits to the right of the pieces, so it never hides them
  if (d.sa && SEWN.includes(d.stitch)) out += `<g transform="translate(300 10) scale(.82)">${zoom(d.sa, 0.2, col)}</g>`;
  return out + (cap ? `<text x="400" y="62" class="wordt" style="font-size:28px">${esc(cap.toUpperCase())}</text>` : '');
}
