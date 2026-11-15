// A sewing step drawn on the real pattern piece in this person's size: the piece itself,
// the edge being sewn glowing, the stitches running along that edge, the second layer when
// two pieces are sewn together, and the seam width in a close-up circle.
import { H, fabricColors, pieceShape, place, D, fabric, glow, sewAlong, zoom } from './kit.js';

const SEWN = ['straight', 'stay', 'baste', 'gather', 'edge', 'top', 'under', 'ditch'];
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

export function pieceScene(ctx, d, color, cap = '') {
  if (!d) return null;
  const refs = (d.edges || []).map((e) => e.split(':'));
  const ids = [...new Set([...refs.map((r) => r[0]), ...(d.pieces || [])])];
  const shapes = ids.map((id) => pieceShape(ctx, id)).filter(Boolean);
  if (!shapes.length) return null;
  // a piece cut on the fold is shown whole: its half and the mirror image, joined at the fold
  const main = shapes[0], whole = !!main.piece.fold, [bx0, y0, x1, y1] = main.box, x0 = whole ? -x1 : bx0, w = x1 - x0, h = y1 - y0;
  const s = Math.min(600 / Math.max(w, 0.1), 330 / Math.max(h, 0.1), 60);
  const ox = 380 - (x0 + w / 2) * s, oy = 110 + (350 - h * s) / 2 - y0 * s, M = place(ox, oy, s), Mm = place(ox, oy, s, true);
  const maps = whole ? [M, Mm] : [M];
  const col = fabricColors(color);
  let out = '';
  // the second piece lies underneath, shifted a little, when the step joins two pieces
  if (shapes[1] && d.join && /together/i.test(d.join)) out += H.fade(fabric(shapes[1], place(ox + 12, oy + 10, s), col, 'wrong', { stitchLine: false }), 0.1);
  if (whole) out += fabric(main, Mm, col, 'right', { stitchLine: true });
  out += fabric(main, M, col, 'right', { label: whole ? '' : esc(main.piece.name.toUpperCase()) });
  if (whole) { const c = M([0, (y0 + y1) / 2]); out += `<text x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" text-anchor="middle" style="font:700 15px var(--f-display);letter-spacing:.06em" fill="rgba(0,0,0,.45)">${esc(main.piece.name.toUpperCase())}</text>`; }
  const named = refs.filter((r) => r[0] === main.piece.id).map((r) => r[1]);
  const names = named.includes('*') ? Object.keys(main.edges) : named;
  let t0 = 0.5;
  for (const n of names) {
    const pts = main.edges[n];
    if (!pts || pts.length < 2) continue;
    for (const m of maps) {
      out += glow(pts, m, 0.2);
      if (SEWN.includes(d.stitch)) { out += sewAlong(pts, m, t0, 1.4); t0 += 1.5; }
      else if (d.stitch === 'zigzag') { out += H.stitch(H.zz(pts.map(m), 5, 10), t0, 1.4, 'foot', 'stitch solid'); t0 += 1.5; }
    }
  }
  if (d.stitch === 'fuse') out += H.iron(330, 300, 0.6, 160, 0, 3);
  else if (d.stitch === 'none' && d.press) out += H.iron(330, 300, 0.6, 160, 0, 3);
  if (d.sa && SEWN.includes(d.stitch)) out += zoom(d.sa, 0.2, col);
  return out + (cap ? `<text x="400" y="62" class="wordt" style="font-size:28px">${esc(cap.toUpperCase())}</text>` : '');
}
