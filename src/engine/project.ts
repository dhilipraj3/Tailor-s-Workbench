import { bbox, offset, polyD, reversePolyD, type Pt } from './geometry';
import type { Design, Garment, Measurements, Options, Piece } from './types';
import { GARMENTS, DESIGNS } from '../garments/index';
import { EXTRA_LEVELS } from './sizes';

export interface Project {
  id: string; designId: string; options: Options; personId: string; extra: string;
  created: number; step: number; done: number[];
}

export interface PieceGeo {
  piece: Piece; stitch: Pt[]; sa: Pt[]; cut: Pt[]; box: [number, number, number, number];
}

export interface Ctx {
  design: Design; garment: Garment; options: Options; m: Measurements; extraScale: number; pieces: PieceGeo[]; personName: string;
}

export function geo(piece: Piece, extraScale: number): PieceGeo {
  const stitch = piece.outline.points();
  const sa = piece.simple ? stitch : offset(piece.outline, 'sa');
  const cut = piece.simple ? stitch : offset(piece.outline, 'cut', extraScale);
  return { piece, stitch, sa, cut, box: bbox(cut) };
}

export function buildCtx(designId: string, options: Options, m: Measurements, extraId: string, personName = ''): Ctx {
  const design = DESIGNS.find((d) => d.id === designId) || DESIGNS[0];
  const garment = GARMENTS[design.garment];
  const extraScale = (EXTRA_LEVELS.find((e) => e.id === extraId) || EXTRA_LEVELS[1]).scale;
  const pieces = garment.draft(m, options).map((p) => geo(p, extraScale));
  return { design, garment, options, m, extraScale, pieces, personName };
}

/* ---------- fabric layout on folded fabric ---------- */
export interface Placed { g: PieceGeo; x: number; y: number; w: number; h: number; poly: Pt[] }
export interface Layout { widthIn: number; halfIn: number; lengthIn: number; metres: number; placed: Placed[]; open: number }

type Item = { g: PieceGeo; w: number; h: number; fold: boolean };
const ORDERS: ((a: Item, b: Item) => number)[] = [
  (a, b) => b.w * b.h - a.w * a.h,
  (a, b) => b.w - a.w,
  (a, b) => (+b.fold - +a.fold) || b.w * b.h - a.w * a.h,
  (a, b) => b.h - a.h,
];

const layoutCache = new Map<string, Layout>();

export function layoutFabric(ctx: Ctx, widthIn: number, fabric: Piece['fabric'] = 'main'): Layout {
  const key = JSON.stringify([ctx.design.id, ctx.options, ctx.m, ctx.extraScale, widthIn, fabric]);
  const hit = layoutCache.get(key);
  if (hit) return hit;
  if (layoutCache.size > 200) layoutCache.clear();
  const l = computeLayout(ctx, widthIn, fabric);
  layoutCache.set(key, l);
  return l;
}

function computeLayout(ctx: Ctx, widthIn: number, fabric: Piece['fabric']): Layout {
  const items: Item[] = [];
  for (const g of ctx.pieces) {
    if (g.piece.fabric !== fabric) continue;
    const [x0, y0, x1, y1] = g.box;
    const copies = g.piece.fold ? g.piece.n : Math.ceil(g.piece.n / 2);
    for (let i = 0; i < copies; i++) items.push({ g, w: y1 - y0, h: x1 - x0, fold: !!g.piece.fold });
  }
  let best: Layout | null = null;
  for (const order of ORDERS) {
    const l = packOnce([...items].sort(order), widthIn);
    if (!best || l.lengthIn < best.lengthIn) best = l;
  }
  return best!;
}

// Shape-aware packing on a ¼″ grid. Each piece keeps its grain along the fabric length,
// but may be turned end-to-end (and flipped across, if it isn't cut on the fold).
const CELL = 0.25;
type Mask = { poly: Pt[]; cols: number; lo: Int16Array; hi: Int16Array; w: number; h: number };

function orientations(it: Item): Mask[] {
  const [x0, y0] = it.g.box;
  const base = it.g.cut.map(([px, py]) => [py - y0, px - x0] as Pt); // layout x = along grain, y = across
  const flips: [number, number][] = it.fold ? [[1, 1], [-1, 1]] : [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  return flips.map(([fx, fy]) => {
    let poly = base.map(([x, y]) => [x * fx, y * fy] as Pt);
    const mx = Math.min(...poly.map((p) => p[0])), my = Math.min(...poly.map((p) => p[1]));
    poly = poly.map(([x, y]) => [x - mx, y - my] as Pt);
    const w = Math.max(...poly.map((p) => p[0])), h = Math.max(...poly.map((p) => p[1]));
    const cols = Math.ceil(w / CELL) + 1, lo = new Int16Array(cols).fill(32767), hi = new Int16Array(cols).fill(-1);
    for (let c = 0; c < cols; c++) {
      for (const xs of [c * CELL, (c + 0.5) * CELL, Math.min(w, (c + 1) * CELL)]) {
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i], b = poly[(i + 1) % poly.length];
          if ((a[0] - xs) * (b[0] - xs) > 0 || a[0] === b[0]) continue;
          const y = a[1] + ((xs - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
          lo[c] = Math.min(lo[c], Math.floor(y / CELL)); hi[c] = Math.max(hi[c], Math.ceil(y / CELL));
        }
      }
    }
    return { poly, cols, lo, hi, w, h };
  });
}

function packOnce(items: Item[], widthIn: number): Layout {
  const half = (widthIn - 0.5) / 2, rows = Math.floor(half / CELL), maxCols = 4000;
  const grid = new Uint8Array(rows * maxCols);
  const placed: Placed[] = [];
  let open = 0, used = 0;
  const fits = (m: Mask, x0: number, y0: number) => {
    for (let c = 0; c < m.cols; c++) {
      if (m.hi[c] < 0) continue;
      const base = (x0 + c) * rows;
      for (let r = Math.max(0, m.lo[c]); r <= m.hi[c]; r++) if (r + y0 >= rows || grid[base + r + y0]) return false;
    }
    return true;
  };
  for (const it of items) {
    if (it.h > half) { open += it.w; continue; }
    let best: { m: Mask; x: number; y: number } | null = null;
    const ms = orientations(it);
    for (let x = 0; x < maxCols - 200 && !best; x++) {
      for (const m of ms) {
        const hr = Math.ceil(m.h / CELL);
        if (hr > rows) continue;
        const ys = it.fold ? [0] : Array.from({ length: rows - hr + 1 }, (_, i) => rows - hr - i);
        for (const y of ys) if (fits(m, x, y)) { best = { m, x, y }; break; }
        if (best) break;
      }
    }
    if (!best) continue;
    const { m, x, y } = best;
    for (let c = 0; c < m.cols; c++) {
      if (m.hi[c] < 0) continue;
      for (let r = Math.max(0, m.lo[c]); r <= Math.min(rows - 1 - y, m.hi[c]); r++) grid[(x + c) * rows + r + y] = 1;
    }
    used = Math.max(used, (x + m.cols) * CELL);
    placed.push({ g: it.g, x: x * CELL, y: y * CELL, w: m.w, h: m.h, poly: m.poly.map(([px, py]) => [px + x * CELL, py + y * CELL] as Pt) });
  }
  const lengthIn = used + open * 2 + 2;
  const metres = Math.ceil(((lengthIn * 1.05 * 2.54) / 100) * 10) / 10;
  return { widthIn, halfIn: half, lengthIn, metres, placed, open };
}

/* ---------- printable sheet: every piece once, grain vertical ---------- */
export interface SheetItem { g: PieceGeo; x: number; y: number }
export function sheet(ctx: Ctx, maxW: number) {
  const gap = 0.6, items: SheetItem[] = [];
  const list = [...ctx.pieces].sort((a, b) => (b.box[3] - b.box[1]) - (a.box[3] - a.box[1]));
  const W = Math.max(maxW, ...list.map((g) => g.box[2] - g.box[0] + gap * 2));
  let x = gap, y = gap, rowH = 0;
  for (const g of list) {
    const w = g.box[2] - g.box[0], h = g.box[3] - g.box[1];
    if (x + w + gap > W) { x = gap; y += rowH + gap; rowH = 0; }
    items.push({ g, x, y }); x += w + gap; rowH = Math.max(rowH, h);
  }
  return { items, W, H: y + rowH + gap };
}

/* ---------- SVG drawing of one piece (inches, origin at its cut bbox) ---------- */
const PAL = { stitch: '#1f6fd6', cut: '#1b2326', sa: 'rgba(31,111,214,.10)', extra: 'rgba(242,140,40,.42)', mark: '#c2410c', text: '#1b2326' };
const loc = (g: PieceGeo) => (pts: Pt[]) => pts.map(([x, y]) => [x - g.box[0], y - g.box[1]] as Pt);
const D = (pts: Pt[]) => polyD(pts);

export function pieceSvg(g: PieceGeo, label: { size?: string; person?: string; design?: string } = {}, opts: { extra?: boolean } = {}) {
  const L = loc(g), p = g.piece, ox = -g.box[0], oy = -g.box[1];
  const sw = (n: number) => `stroke-width="${n}" vector-effect="non-scaling-stroke"`;
  const tr = `transform="translate(${ox.toFixed(3)} ${oy.toFixed(3)})"`;
  let s = '';
  if (!p.simple) {
    if (opts.extra !== false) s += `<path d="${D(L(g.cut))} ${reversePolyD(L(g.sa))}" fill="${PAL.extra}"/>`;
    s += `<path d="${D(L(g.sa))} ${reversePolyD(L(g.stitch))}" fill="${PAL.sa}"/>`;
    s += `<path d="${D(L(g.stitch))}" fill="none" stroke="${PAL.stitch}" ${sw(2)} stroke-dasharray="7 4"/>`;
  }
  s += `<path d="${D(L(g.cut))}" fill="none" stroke="${PAL.cut}" ${sw(2.6)}/>`;
  for (const mk of p.marks) {
    if (mk.k === 'line') s += `<path ${tr} d="M${mk.a[0]} ${mk.a[1]} L${mk.b[0]} ${mk.b[1]}" fill="none" stroke="${mk.style === 'guide' ? '#7a8a90' : PAL.mark}" ${sw(1.8)} stroke-dasharray="${mk.style === 'guide' ? '3 4' : '8 5'}"/>`;
    else if (mk.k === 'path') s += `<path ${tr} d="${mk.d}" fill="none" stroke="${mk.style === 'guide' ? '#7a8a90' : PAL.mark}" ${sw(1.8)} stroke-dasharray="8 5"/>`;
    else if (mk.k === 'btn') s += `<circle ${tr} cx="${mk.p[0]}" cy="${mk.p[1]}" r=".22" fill="none" stroke="${PAL.text}" ${sw(1.6)}/>`;
    else if (mk.k === 'text') s += `<text ${tr} x="${mk.p[0]}" y="${mk.p[1]}" font-size=".42" fill="${PAL.mark}" font-family="sans-serif">${mk.t}</text>`;
  }
  if (p.grain) {
    const [a, b] = p.grain;
    s += `<g ${tr}><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} M${a[0] - .25} ${a[1] + .5} L${a[0]} ${a[1]} L${a[0] + .25} ${a[1] + .5} M${b[0] - .25} ${b[1] - .5} L${b[0]} ${b[1]} L${b[0] + .25} ${b[1] - .5}" fill="none" stroke="${PAL.text}" ${sw(2)}/></g>`;
  }
  if (p.fold) {
    const [, y0, , y1] = bbox(g.stitch), fx = ox + Math.min(...g.stitch.map((q) => q[0]));
    const ya = oy + y0 + (y1 - y0) * 0.2, yb = oy + y0 + (y1 - y0) * 0.8;
    s += `<path d="M${fx} ${ya} L${fx + .6} ${ya} L${fx + .6} ${yb} L${fx} ${yb}" fill="none" stroke="${PAL.mark}" ${sw(2)}/><text x="${fx + .8}" y="${(ya + yb) / 2}" font-size=".45" fill="${PAL.mark}" font-family="sans-serif" transform="rotate(90 ${fx + .8} ${(ya + yb) / 2})">PLACE ON FOLD</text>`;
  }
  const w = g.box[2] - g.box[0], h = g.box[3] - g.box[1], cx = w / 2, cy = h / 2;
  const fs = Math.min(0.7, Math.max(0.3, Math.min(w, h) / 8));
  s += `<text x="${cx}" y="${cy}" font-size="${fs}" font-weight="700" text-anchor="middle" fill="${PAL.text}" font-family="sans-serif">${p.name.toUpperCase()}</text>`;
  s += `<text x="${cx}" y="${cy + fs * 1.3}" font-size="${fs * 0.75}" text-anchor="middle" fill="${PAL.text}" font-family="sans-serif">Cut ×${p.n}${p.fold ? ' on fold' : ''}${p.fabric === 'lining' ? ' · pocket fabric' : ''}${p.interfacing ? ' · + interfacing' : ''}</text>`;
  if (label.person || label.size) s += `<text x="${cx}" y="${cy + fs * 2.4}" font-size="${fs * 0.6}" text-anchor="middle" fill="#55606a" font-family="sans-serif">${[label.design, label.person, label.size].filter(Boolean).join(' · ')}</text>`;
  return { inner: s, w, h };
}

export function sheetSvg(ctx: Ctx, label: { person?: string }) {
  const sh = sheet(ctx, 22);
  const body = sh.items.map((it) => `<g transform="translate(${it.x} ${it.y})">${pieceSvg(it.g, { design: ctx.design.name, person: label.person }).inner}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sh.W}in" height="${sh.H}in" viewBox="0 0 ${sh.W} ${sh.H}">${body}</svg>`;
}
