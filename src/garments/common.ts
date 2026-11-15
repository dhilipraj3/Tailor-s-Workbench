import { Outline } from '../engine/geometry';
import type { Piece } from '../engine/types';

/** A plain rectangle whose size already includes the sewing space. */
export function rectPiece(id: string, name: string, w: number, h: number, n: number, fabric: Piece['fabric'] = 'main'): Piece {
  const z = { sa: 0 };
  const o = new Outline([0, 0]).line([w, 0], z).line([w, h], z).line([0, h], z).close(z);
  return { id, name, n, fabric, outline: o, marks: [], simple: true, grain: w > h ? [[0.6, h / 2], [w - 0.6, h / 2]] : [[w / 2, 0.6], [w / 2, h - 0.6]], note: 'Size includes sewing space.' };
}

/** length of a polyline */
export const polyLen = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
/** total length of the named edges of a piece */
export const edgeLength = (piece: Piece | undefined, name: string) => (piece ? piece.outline.edges.filter((e) => e.name === name).reduce((s, e) => s + polyLen(e.pts as [number, number][]), 0) : 0);

/** Sleeve-cap height that makes the cap (both curves, as drafted) exactly `target` long for a sleeve `B` wide. */
export function capHeightFor(B: number, target: number) {
  const capLen = (cap: number) => {
    const half = new Outline([-B / 2, cap]).cubic([-B * 0.3, cap], [-B * 0.24, 0], [0, 0], { sa: 0 });
    return 2 * polyLen(half.edges[0].pts as [number, number][]);
  };
  let lo = 0.5, hi = 12;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (capLen(mid) < target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
