// Pattern geometry: outlines built from edges, each edge knows its own sewing space
// and its own extra cloth for later adjustment. All units are inches.

export type Pt = [number, number];

export interface Allow {
  /** normal sewing space (seam allowance) */
  sa: number;
  /** extra cloth kept for future adjustment; a pair tapers from start to end of the edge */
  extra?: number | [number, number];
  /** edge lies on the fabric fold: no allowance at all */
  fold?: boolean;
}

export interface Edge { cmd: string; pts: Pt[]; allow: Allow; name: string }

const r3 = (n: number) => +n.toFixed(3);
export const ps = (p: Pt) => `${r3(p[0])} ${r3(p[1])}`;
export const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export class Outline {
  edges: Edge[] = [];
  cur: Pt;
  constructor(public start: Pt) { this.cur = start; }

  line(to: Pt, allow: Allow, name = '') {
    // a tapering extra needs several sample points so the offset can change along the edge
    const n = Array.isArray(allow.extra) ? 12 : 1, a = this.cur;
    const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => [a[0] + ((to[0] - a[0]) * i) / n, a[1] + ((to[1] - a[1]) * i) / n] as Pt);
    this.edges.push({ cmd: `L ${ps(to)}`, pts, allow, name });
    this.cur = to; return this;
  }
  cubic(c1: Pt, c2: Pt, to: Pt, allow: Allow, name = '') {
    const a = this.cur, pts: Pt[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, u = 1 - t;
      pts.push([
        u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0],
        u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1],
      ]);
    }
    this.edges.push({ cmd: `C ${ps(c1)} ${ps(c2)} ${ps(to)}`, pts, allow, name });
    this.cur = to; return this;
  }
  quad(c: Pt, to: Pt, allow: Allow, name = '') {
    const a = this.cur, pts: Pt[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * to[0], u * u * a[1] + 2 * u * t * c[1] + t * t * to[1]]);
    }
    this.edges.push({ cmd: `Q ${ps(c)} ${ps(to)}`, pts, allow, name });
    this.cur = to; return this;
  }
  close(allow: Allow, name = '') {
    if (dist(this.cur, this.start) > 1e-6) this.line(this.start, allow, name);
    return this;
  }
  /** the stitching line as an SVG path */
  get d() { return `M ${ps(this.start)} ` + this.edges.map((e) => e.cmd).join(' ') + ' Z'; }
  points(): Pt[] {
    const out: Pt[] = [];
    for (const e of this.edges) for (const p of e.pts) if (!out.length || dist(out[out.length - 1], p) > 1e-6) out.push(p);
    if (out.length > 1 && dist(out[0], out[out.length - 1]) < 1e-6) out.pop();
    return out;
  }
}

export function area(pts: Pt[]) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; }
  return s / 2;
}

export function bbox(pts: Pt[]): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}

function intersect(p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (Math.abs(d) < 1e-9) return null;
  const a = p1[0] * p2[1] - p1[1] * p2[0], b = p3[0] * p4[1] - p3[1] * p4[0];
  return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d];
}

export function extraAt(allow: Allow, t: number) {
  const ex = allow.extra ?? 0;
  return Array.isArray(ex) ? ex[0] + (ex[1] - ex[0]) * t : ex;
}

/**
 * Offset the outline outwards, edge by edge.
 * mode 'sa'  → sewing-space line (stitch line + seam allowance)
 * mode 'cut' → cutting line (stitch line + seam allowance + extra cloth × extraScale)
 */
export function offset(o: Outline, mode: 'sa' | 'cut', extraScale = 1): Pt[] {
  const segs: { a: Pt; b: Pt; d: number }[] = [];
  for (const e of o.edges) {
    const n = e.pts.length - 1;
    for (let i = 0; i < n; i++) {
      const a = e.pts[i], b = e.pts[i + 1];
      if (dist(a, b) < 1e-6) continue;
      const d = e.allow.fold ? 0 : e.allow.sa + (mode === 'cut' ? extraAt(e.allow, (i + 0.5) / n) * extraScale : 0);
      segs.push({ a, b, d });
    }
  }
  if (segs.length < 3) return segs.map((s) => s.a);
  const sg = area(segs.map((s) => s.a)) > 0 ? 1 : -1;
  const lines = segs.map((s) => {
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], L = Math.hypot(dx, dy);
    const nx = (sg * dy) / L, ny = (-sg * dx) / L;
    return { p: [s.a[0] + nx * s.d, s.a[1] + ny * s.d] as Pt, q: [s.b[0] + nx * s.d, s.b[1] + ny * s.d] as Pt, d: s.d };
  });
  const out: Pt[] = [];
  for (let i = 0; i < lines.length; i++) {
    const A = lines[i], B = lines[(i + 1) % lines.length];
    // nearly straight join (e.g. inside a tapering edge): blend the two ends so the line stays smooth
    const ua = [A.q[0] - A.p[0], A.q[1] - A.p[1]], ub = [B.q[0] - B.p[0], B.q[1] - B.p[1]];
    const sin = Math.abs(ua[0] * ub[1] - ua[1] * ub[0]) / (Math.hypot(ua[0], ua[1]) * Math.hypot(ub[0], ub[1]) || 1);
    const dot = ua[0] * ub[0] + ua[1] * ub[1];
    if (sin < 0.02 && dot > 0) { out.push([(A.q[0] + B.p[0]) / 2, (A.q[1] + B.p[1]) / 2]); continue; }
    const X = intersect(A.p, A.q, B.p, B.q);
    const lim = Math.max(A.d, B.d) * 3 + 0.05;
    if (X && dist(X, segs[i].b) < lim) out.push(X);
    else { out.push(A.q); if (dist(A.q, B.p) > 1e-6) out.push(B.p); }
  }
  return out;
}

export const polyD = (pts: Pt[]) => 'M ' + pts.map(ps).join(' L ') + ' Z';
export const reversePolyD = (pts: Pt[]) => polyD([...pts].reverse());
