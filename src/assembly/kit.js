// Shared tools for assembly animations built from the real pattern pieces.
// Everything is drawn in stage coordinates (800×500), mapped from pattern inches.
import { H, ICON } from '../art/svg.js';
import { f } from '../core/units.js';

/* ---------- colours ---------- */
const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r) => '#' + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
/** right-side and wrong-side fills for a fabric colour */
export const fabricColors = (c = '#7fa1cf') => ({ right: c, wrong: mix(mix(c, '#ffffff', 0.32), '#8a8a8a', 0.12), edge: mix(c, '#000000', 0.45) });

/* ---------- piece geometry ---------- */
/** cut outline, stitch outline and named stitch edges of a pattern piece (inches) */
export function pieceShape(ctx, id) {
  const g = ctx.pieces.find((p) => p.piece.id === id);
  if (!g) return null;
  const edges = {};
  for (const e of g.piece.outline.edges) {
    const k = e.name || '?';
    (edges[k] = edges[k] || []).push(...(edges[k]?.length ? e.pts.slice(1) : e.pts));
  }
  return { g, cut: g.cut, stitch: g.stitch, edges, box: g.box, piece: g.piece };
}

/** A placement: inches → stage. mirror=true flips the piece left↔right about its own x=0 line. */
export const place = (ox, oy, s, mirror = false) => ([x, y]) => [ox + (mirror ? -x : x) * s, oy + y * s];
export const D = (pts, map, close = true) => 'M' + pts.map((p) => map(p).map((v) => v.toFixed(1)).join(' ')).join(' L') + (close ? ' Z' : '');

/* ---------- drawing a fabric piece ---------- */
export function fabric(shape, map, col, side = 'right', opts = {}) {
  const fill = side === 'right' ? col.right : col.wrong;
  let o = `<path d="${D(shape.cut, map)}" fill="${fill}" stroke="${col.edge}" stroke-width="1" style="filter:url(#cloth)"/>`;
  if (side === 'wrong') o += `<path d="${D(shape.cut, map)}" fill="url(#wrongTex)" style="pointer-events:none"/>`;
  if (opts.stitchLine !== false) o += `<path d="${D(shape.stitch, map)}" fill="none" stroke="rgba(255,255,255,${side === 'wrong' ? 0.7 : 0.35})" stroke-width="1.2" stroke-dasharray="5 5"/>`;
  if (opts.label) { const c = map([(shape.box[0] + shape.box[2]) / 2, (shape.box[1] + shape.box[3]) / 2]); o += `<text x="${c[0].toFixed(1)}" y="${c[1].toFixed(1)}" text-anchor="middle" style="font:700 15px var(--f-display);letter-spacing:.06em" fill="rgba(0,0,0,.45)">${opts.label}</text>`; }
  return o;
}

/* ---------- motion ---------- */
/**
 * Flip a piece over a vertical line (like turning a page), optionally sliding at the same time.
 * Drawn in its END position; at the start it appears mirrored about x=ox and shifted by dx.
 * `startSide` is the layer seen before the flip, `endSide` after.
 */
export function flipOver(drawSide, ox, d0, t, dx = 0, startSide = 'right', endSide = 'wrong') {
  return `<g class="mflip" style="--ox:${ox.toFixed(1)}px;--oy:0px;--fx:${dx.toFixed(1)}px;--fy:0px;--d:${d0}s;--t:${t}s">` +
    `<g class="halfA" style="--d:${d0}s;--t:${t}s">${drawSide(startSide)}</g><g class="halfB" style="--d:${d0}s;--t:${t}s">${drawSide(endSide)}</g></g>`;
}

/** glowing seam edge (both edges that will be sewn together glow the same colour) */
export const glow = (pts, map, d0, color = '#ff9d3b') =>
  H.fade(`<path d="${D(pts, map, false)}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".85" class="seamglow" style="--d:${d0}s"/>`, d0);

/** pins along an edge (every n-th point), pointing into the fabric */
export function pinsAlong(pts, map, d0, count = 5, inward = 1) {
  const out = [];
  for (let i = 1; i <= count; i++) {
    const p = pts[Math.min(pts.length - 1, Math.round((i * (pts.length - 1)) / (count + 1)))];
    const [x, y] = map(p);
    out.push([x + 10 * inward, y]);
  }
  return H.pins(out, d0, 0.12);
}

/** sewing along a real seam, with the machine foot following it */
export const sewAlong = (pts, map, d0, t) => H.stitch(D(pts, map, false), d0, t);

/** close-up circle: two fabric layers, the needle and the guide line at the sewing distance */
export function zoom(sa, d0, col, label = 'Sew here') {
  const cx = 400, cy = 250, r = 74;
  const edgeX = cx + 34, needleX = edgeX - 46;
  return H.fade(`<g><circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#ffffff" opacity=".9" filter="url(#lift)"/>
    <clipPath id="zc${Math.round(d0 * 100)}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <g clip-path="url(#zc${Math.round(d0 * 100)})">
      <rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="#cfd5d8"/>
      <rect x="${cx - r}" y="${cy - r}" width="${edgeX - cx + r}" height="${2 * r}" fill="${col.wrong}"/>
      <rect x="${cx - r}" y="${cy - r}" width="${edgeX - cx + r - 3}" height="${2 * r}" fill="${col.right}" opacity=".35"/>
      <path d="M${edgeX} ${cy - r} L${edgeX} ${cy + r}" stroke="${col.edge}" stroke-width="2"/>
      <path d="M${needleX} ${cy - r} L${needleX} ${cy + r}" stroke="#f7f3ea" stroke-width="2.4" stroke-dasharray="6 4"/>
      <g transform="translate(${needleX} ${cy + 6}) scale(1.1)">${ICON.foot()}</g>
      <path d="M${needleX} ${cy + 46} L${edgeX} ${cy + 46}" stroke="#1f6fd6" stroke-width="2"/><path d="M${needleX} ${cy + 40} L${needleX} ${cy + 52} M${edgeX} ${cy + 40} L${edgeX} ${cy + 52}" stroke="#1f6fd6" stroke-width="2"/>
      <text x="${(needleX + edgeX) / 2}" y="${cy + 66}" text-anchor="middle" style="font:700 15px var(--f-mono)" fill="#1b2326">${f(sa)}</text>
    </g>
    <text x="${cx}" y="${cy - r - 10}" text-anchor="middle" style="font:700 15px var(--f-display);letter-spacing:.05em" fill="#ffffff">${label}</text></g>`, d0);
}

/** fold a strip along an edge (hem, casing): the strip flips over the fold line */
export const foldStrip = (pts, map, depthPx, d0, col, dir = 1) => {
  const a = map(pts[0]), b = map(pts[pts.length - 1]);
  const y = Math.min(a[1], b[1]), x0 = Math.min(a[0], b[0]), w = Math.abs(b[0] - a[0]);
  return H.flip(`<rect x="${x0}" y="${dir > 0 ? y : y - depthPx}" width="${w}" height="${depthPx}" fill="${col.wrong}" stroke="${col.edge}" stroke-width="1"/>`, 'y', dir > 0 ? y : y, d0, 0.9);
};

export { H, ICON, f };
