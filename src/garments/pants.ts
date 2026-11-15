// Easy pants family: pyjama, shorts, palazzo, churidar, salwar. Elastic or drawstring waist, no fly.
import { Outline, type Allow, type Pt } from '../engine/geometry';
import type { Garment, Measurements, Options, Piece, Step } from '../engine/types';
import { rectPiece } from './common';
import { W } from '../chapters/scenes-b.js';

const r4 = (x: number) => Math.round(x * 4) / 4;

function draft(m: Measurements, o: Options): Piece[] {
  const H = m.hip, R = m.rise + 0.5, child = (m.height || 66) < 52;
  const style = o.style, casing = o.waist === 'drawstring' ? 2 : 1.5;
  const L = style === 'shorts' ? R + (child ? 6 : 9) : style === 'churidar' ? m.outseam + 7 : m.outseam;
  const ease = style === 'churidar' ? 1 : style === 'palazzo' || style === 'salwar' ? 3 : 2;
  const legBottom = ({ pyjama: H * 0.42, shorts: H * 0.6, palazzo: H * 0.95, churidar: Math.max(8, H * 0.24), salwar: Math.max(12, H * 0.34) } as Record<string, number>)[style] ?? H * 0.42;
  const extraTop = style === 'salwar' ? 3 : style === 'palazzo' ? 1.5 : 0;
  const kneeY = R + (L - R) * 0.45;
  const SA = 0.625, side: Allow = { sa: SA, extra: 0.75 }, ins: Allow = { sa: SA, extra: 0.5 }, plain: Allow = { sa: SA };
  const waistA: Allow = { sa: casing + 0.375 }, hem: Allow = { sa: style === 'churidar' ? 0.75 : 1.25, extra: child ? 1 : 0 };
  const make = (front: boolean): Piece => {
    const half = H / 4 + ease / 2 + (front ? 0 : 1) + extraTop, ext = front ? H / 16 + 0.5 : H / 10 + 0.5;
    const cr = (half + ext) / 2, hb = legBottom / 4 + (front ? -0.25 : 0.25);
    const kneeHalf = style === 'palazzo' ? hb : Math.max(hb, (front ? H * 0.12 : H * 0.135));
    const top = front ? 0 : -0.75;
    const pts = { A: [0, top] as Pt, CF: [half, top] as Pt, F: [half, R * 0.66] as Pt, G: [half + ext, R + (front ? 0 : 0.375)] as Pt,
      K: [cr + kneeHalf, kneeY] as Pt, M: [cr + hb, L] as Pt, N: [cr - hb, L] as Pt, Kl: [cr - kneeHalf, kneeY] as Pt };
    const ol = new Outline(pts.A).line(pts.CF, waistA, 'waist casing').line(pts.F, front ? plain : { sa: SA, extra: [1, 0.6] }, 'crotch')
      .cubic([half, R - (front ? 0.9 : 0.4)], [half + 0.6, pts.G[1]], pts.G, front ? plain : { sa: SA, extra: [0.6, 0] }, 'crotch');
    if (style === 'palazzo') ol.line(pts.M, ins, 'inseam'); else ol.line(pts.K, ins, 'inseam').line(pts.M, ins, 'inseam');
    ol.line(pts.N, hem, 'hem');
    if (style === 'palazzo') ol.line([0, R], side, 'side'); else ol.line(pts.Kl, side, 'side').line([0, R], side, 'side');
    ol.close(side, 'side');
    const marks: Piece['marks'] = [{ k: 'line', a: [0, casing], b: [half, casing], style: 'mark' }, { k: 'text', p: [0.4, casing + 0.6], t: 'fold line for the casing' }];
    if (o.pockets === 'side' && style !== 'shorts') marks.push({ k: 'line', a: [0.1, 2.5], b: [0.05, 9], style: 'mark' }, { k: 'text', p: [0.4, 6], t: 'pocket opening' });
    else if (o.pockets === 'side') marks.push({ k: 'line', a: [0.1, 2], b: [0.05, 7], style: 'mark' });
    if (style === 'churidar') marks.push({ k: 'text', p: [cr - 2, L - 6], t: 'extra length gathers at the ankle' });
    return { id: front ? 'pfront' : 'pback', name: front ? 'Leg front' : 'Leg back', n: 2, mirror: true, fabric: 'main', outline: ol, marks, grain: [[cr, 2], [cr, L - 2]] };
  };
  const pieces: Piece[] = [make(true), make(false)];
  if (o.waist === 'drawstring') pieces.push(rectPiece('string', 'Drawstring', 2, r4(m.waist + 24), 1));
  if (o.pockets === 'side') pieces.push(rectPiece('pbag', 'Pocket bag', 7.5, 12, 4, 'lining'));
  return pieces;
}

function steps(o: Options): Step[] {
  const out: Step[] = [W.edges];
  if (o.pockets === 'side') out.push(W.sidePocketEasy);
  out.push(W.pantsSides, W.pantsInseam, W.pantsCrotch);
  out.push(o.waist === 'drawstring' ? W.drawCasing : W.elasticCasing);
  out.push(o.style === 'churidar' ? W.churidarHem : W.pantsHem);
  out.push(W.press, W.donePants);
  return out;
}

function supplies(m: Measurements, o: Options) {
  const list = [{ icon: 'thread', qty: '1', say: 'One spool of matching thread' }];
  if (o.waist === 'elastic') list.push({ icon: 'lining', qty: `${r4(m.waist - 2)}″`, say: `Waist elastic, about ${Math.round(m.waist - 2)} inches long and one inch wide` });
  if (o.pockets === 'side') list.push({ icon: 'lining', qty: '0.3 m', say: 'A little pocket fabric' });
  list.push({ icon: 'needle', qty: '80/12', say: 'Machine needle size 80' });
  return list;
}

/* ---------- sketch (viewBox -26 -10 142 182) ---------- */
export function pantsSketch(o: Options) {
  const st = o.style;
  const bottom = ({ pyjama: 15, shorts: 60, palazzo: 40, churidar: 8, salwar: 10 } as Record<string, number>)[st] ?? 15;
  const len = st === 'shorts' ? 64 : 160, hw = st === 'salwar' ? 12 : st === 'palazzo' ? 6 : 0;
  const crotch = st === 'salwar' ? 90 : 56;
  const outL = -2 - hw - (st === 'palazzo' ? 14 : 0), outR = 92 + hw + (st === 'palazzo' ? 14 : 0);
  const legs = `M4 0 L86 0 L${92 + hw} 40 L${outR} ${len} L${outR - bottom * (st === 'shorts' ? 0.6 : 1)} ${len} L45 ${crotch} L${outL + bottom * (st === 'shorts' ? 0.6 : 1)} ${len} L${outL} ${len} L${-2 - hw} 40 Z`;
  const gathers = Array.from({ length: 9 }, (_, i) => `<path d="M${10 + i * 9} 2 L${11 + i * 9} 9" class="skl"/>`).join('');
  const string = o.waist === 'drawstring' ? `<path d="M43 9 Q40 22 36 26 M47 9 Q50 22 54 27" class="skl" stroke-width="2"/>` : '';
  const churi = st === 'churidar' ? Array.from({ length: 6 }, (_, i) => `<path d="M${outL + 1} ${len - 4 - i * 4} L${outL + bottom} ${len - 6 - i * 4} M${outR - bottom} ${len - 6 - i * 4} L${outR - 1} ${len - 4 - i * 4}" class="skl"/>`).join('') : '';
  // hem stitching, soft folds at the knee and from the seat, light down each leg
  const bw = bottom * (st === 'shorts' ? 0.6 : 1), lx = outL + bw / 2, rx = outR - bw / 2, ky = len * 0.62;
  const det = `<path d="M${outL + 1} ${len - 3} L${outL + bw - 1} ${len - 3} M${outR - bw + 1} ${len - 3} L${outR - 1} ${len - 3}" class="skl"/>` +
    (st === 'shorts' ? '' : `<path d="M${lx - 7} ${ky} Q${lx} ${ky + 5} ${lx + 7} ${ky} M${rx - 7} ${ky} Q${rx} ${ky + 5} ${rx + 7} ${ky}" class="skf"/>`) +
    `<path d="M38 ${crotch - 8} Q32 ${crotch + 2} 24 ${crotch + 14} M52 ${crotch - 8} Q58 ${crotch + 2} 66 ${crotch + 14}" class="skf"/><path d="M${lx + 4} 16 L${lx} ${len - 8} M${rx - 4} 16 L${rx} ${len - 8}" class="skh"/>`;
  return `<path d="${legs}" class="sk"/><path d="M4 0 L86 0 L86 10 L4 10 Z" class="sk2"/>${gathers}${string}${churi}${det}`;
}

export const PANTS: Garment = {
  id: 'pants' as Garment['id'], name: 'Pyjama / salwar / shorts', viewBox: '-40 -10 170 182',
  measureKeys: ['waist', 'hip', 'rise', 'outseam', 'height'],
  options: [
    { id: 'style', label: 'Style', values: [{ id: 'pyjama', label: 'Pyjama' }, { id: 'palazzo', label: 'Palazzo' }, { id: 'churidar', label: 'Churidar' }, { id: 'salwar', label: 'Salwar' }, { id: 'shorts', label: 'Shorts' }] },
    { id: 'waist', label: 'Waist', crop: [-6, -8, 102, 40], values: [{ id: 'elastic', label: 'Elastic' }, { id: 'drawstring', label: 'Drawstring' }] },
    { id: 'pockets', label: 'Pockets', values: [{ id: 'none', label: 'None' }, { id: 'side', label: 'Side' }] },
  ],
  draft, steps, supplies, sketch: pantsSketch,
};
