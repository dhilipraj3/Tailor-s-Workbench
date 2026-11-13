import { Outline } from '../engine/geometry';
import type { Piece } from '../engine/types';

/** A plain rectangle whose size already includes the sewing space. */
export function rectPiece(id: string, name: string, w: number, h: number, n: number, fabric: Piece['fabric'] = 'main'): Piece {
  const z = { sa: 0 };
  const o = new Outline([0, 0]).line([w, 0], z).line([w, h], z).line([0, h], z).close(z);
  return { id, name, n, fabric, outline: o, marks: [], simple: true, grain: w > h ? [[0.6, h / 2], [w - 0.6, h / 2]] : [[w / 2, 0.6], [w / 2, h - 0.6]], note: 'Size includes sewing space.' };
}
