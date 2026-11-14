import { Outline, type Allow, type Pt } from '../engine/geometry';
import type { Garment, Measurements, Options, Piece, Step } from '../engine/types';
import { rectPiece } from './common';
import { trouserSteps } from './sew-trousers';

const SA = 0.625;
const plain: Allow = { sa: SA };
const side: Allow = { sa: SA, extra: 1 };
const inseam: Allow = { sa: SA, extra: 0.5 };

export function bottomWidth(m: Measurements, o: Options) {
  return Math.round(((o.fit === 'slim' ? 15 : 16.5) + (m.waist - 34) * 0.2) * 2) / 2;
}

function draft(m: Measurements, o: Options): Piece[] {
  const W = m.waist, Hp = m.hip, R = m.rise, L = m.outseam - 1.5;
  const slim = o.fit === 'slim', pleated = o.front === 'pleated', Bt = bottomWidth(m, o);
  const hipY = R * 0.66, kneeY = R + (L - R) / 2 - 2;
  const hem: Allow = o.hem === 'turnup' ? { sa: 4.5, extra: 1 } : { sa: 1.5, extra: 2 };
  const pieces: Piece[] = [];
  // FRONT
  {
    const Fh = Hp / 4 + (slim ? -0.25 : 0) + (pleated ? 0.5 : 0), ext = Hp / 16, cr = (Fh + ext) / 2;
    const hh = (Bt / 2 - 0.5) / 2, kh = hh + (slim ? 0.25 : 0.5), pleat = pleated ? 1.25 : 0;
    const F: Pt = [Fh, hipY], G: Pt = [Fh + ext, R], I: Pt = [Fh - 0.5, 0], J: Pt = [I[0] - (W / 4 + 0.25 + pleat), 0];
    const K: Pt = [cr + kh, kneeY], Lk: Pt = [cr - kh, kneeY], M: Pt = [cr + hh, L], N: Pt = [cr - hh, L];
    const ol = new Outline(J).line(I, plain, 'waist').line(F, plain, 'fly')
      .cubic([Fh, R - 0.9], [Fh + 0.5, R], G, plain, 'front crotch')
      .line(K, inseam, 'inseam').line(M, inseam, 'inseam').line(N, hem, 'hem').line(Lk, side, 'side').line([0.25, R], side, 'side')
      .cubic([0, R - 1], [0, hipY + 1], [0, hipY], side, 'side').quad([0, hipY * 0.35], J, side, 'side');
    const cfAt = (y: number) => (y <= hipY ? I[0] + (0.5 * y) / hipY : Fh);
    const marks: Piece['marks'] = [
      { k: 'path', d: `M${I[0] - 1.5} 0 L${cfAt(6.4) - 1.5} 6.4 Q${cfAt(7.5) - 1.5} 7.6 ${cfAt(7.6)} 7.6`, style: 'mark' },
      o.pocket === 'side' ? { k: 'line', a: [0.15, 1.5], b: [0.05, 8], style: 'mark' } : { k: 'line', a: [J[0] + 1.5, 0], b: [0, 6.5], style: 'mark' },
    ];
    if (pleated) marks.push({ k: 'line', a: [cr, 0], b: [cr, 3], style: 'mark' }, { k: 'line', a: [cr + pleat, 0], b: [cr + pleat, 3], style: 'mark' }, { k: 'text', p: [cr + 0.2, 3.6], t: 'pleat' });
    pieces.push({ id: 'tfront', name: 'Trouser front', n: 2, mirror: true, fabric: 'main', outline: ol, marks, grain: [[cr, 2], [cr, L - 2]], note: 'The grain arrow is also the crease line.' });
  }
  // BACK
  {
    const Bh = Hp / 4 + (slim ? 0.75 : 1), ext = Hp / 10, drop = 0.375, crB = (Bh + ext) / 2 - 0.5;
    const hb = (Bt / 2 + 0.5) / 2, kb = hb + (slim ? 0.25 : 0.5);
    const F: Pt = [Bh, hipY], G: Pt = [Bh + ext, R + drop], I: Pt = [Bh - 1.75, -1], J: Pt = [I[0] - (W / 4 + 0.75), 0];
    const K: Pt = [crB + kb, kneeY], Lk: Pt = [crB - kb, kneeY], M: Pt = [crB + hb, L], N: Pt = [crB - hb, L];
    const ol = new Outline(J).line(I, plain, 'waist').line(F, { sa: SA, extra: [1.5, 1.2] }, 'seat seam')
      .cubic([Bh + 0.15, R - 0.4], [Bh + 0.9, R + drop], G, { sa: SA, extra: [1.2, 0.25] }, 'seat seam')
      .line(K, inseam, 'inseam').line(M, inseam, 'inseam').line(N, hem, 'hem').line(Lk, side, 'side').line([0.25, R], side, 'side')
      .cubic([0, R - 1], [0, hipY + 1], [0, hipY], side, 'side').quad([Math.min(0, J[0]), hipY * 0.35], J, side, 'side');
    const mx = (I[0] + J[0]) / 2, my = (I[1] + J[1]) / 2, sl = (I[1] - J[1]) / (I[0] - J[0]);
    const marks: Piece['marks'] = [{ k: 'path', d: `M${mx - 0.5} ${my - 0.5 * sl} L${mx + 0.15} ${my + 4.5} L${mx + 0.5} ${my + 0.5 * sl}`, style: 'mark' }];
    const bp = +o.backPockets;
    if (bp > 0) marks.push({ k: 'line', a: [mx - 2.75, my + 2.5 - 2.75 * sl], b: [mx + 2.75, my + 2.5 + 2.75 * sl], style: 'mark' }, { k: 'text', p: [mx - 2.75, my + 3.4], t: bp === 2 ? 'pocket (both backs)' : 'pocket (right back)' });
    pieces.push({ id: 'tback', name: 'Trouser back', n: 2, mirror: true, fabric: 'main', outline: ol, marks, grain: [[crB, 2], [crB, L - 2]], note: 'Extra cloth on the seat seam lets the waist be let out later.' });
  }
  // WAISTBAND
  {
    const len = W / 2 + 2;
    const ol = new Outline([0, 0]).line([len, 0], plain, 'waist').line([len, 3], plain, 'overlap end').line([0, 3], plain, 'inner edge').close({ sa: SA, extra: 2 }, 'centre back');
    pieces.push({ id: 'band', name: 'Waistband', n: 2, mirror: true, fabric: 'main', interfacing: true, outline: ol, marks: [{ k: 'line', a: [0, 1.5], b: [len, 1.5], style: 'mark' }, { k: 'line', a: [len - 2, 0], b: [len - 2, 3], style: 'guide' }] });
  }
  pieces.push(rectPiece('flyF', 'Fly facing', 2.5, 8.5, 1), rectPiece('flyS', 'Fly shield', 3, 8.5, 1), rectPiece('pfacing', 'Pocket facing', 7, 9, 2));
  if (o.loops === 'yes') pieces.push(rectPiece('loops', 'Belt loop strip', 26, 1.5, 1));
  pieces.push(rectPiece('pbag', 'Front pocket bag', 7.5, 13, 4, 'lining'));
  const bp = +o.backPockets;
  if (bp > 0) pieces.push(rectPiece('welt', 'Back welt', 7, 2.5, bp), rectPiece('bbag', 'Back pocket bag', 7, 14, bp * 2, 'lining'));
  return pieces;
}

const steps = (o: Options): Step[] => trouserSteps(o);

function supplies(m: Measurements, o: Options) {
  const bp = +o.backPockets;
  return [
    { icon: 'thread', qty: '1', say: 'One spool of matching thread' },
    { icon: 'zip', qty: '7″', say: 'One trouser zip, 7 inches or 18 centimetres' },
    { icon: 'hook', qty: '1', say: 'One trouser hook and bar' },
    { icon: 'buttons', qty: `${bp + 1}`, say: `${bp + 1} buttons` },
    { icon: 'lining', qty: '0.5 m', say: 'Half a metre of pocket fabric' },
    { icon: 'interfacing', qty: `${Math.ceil((m.waist + 6) * 2.54 / 10) / 10} m`, say: 'Waistband interlining strip' },
    { icon: 'needle', qty: '90/14', say: 'Machine needle size 90' },
  ];
}

/* ---------- flat sketch (viewBox -20 -10 130 180) ---------- */
function sketch(o: Options) {
  const slim = o.fit === 'slim';
  const a = slim ? 8 : 4, b = slim ? 30 : 34, c = slim ? 60 : 56, d = slim ? 82 : 86;
  const legs = `M4 0 L86 0 L92 64 L${d} 160 L${c} 160 L45 58 L${b} 160 L${a} 160 L-2 64 Z`;
  const loops = o.loops === 'yes' ? [12, 30, 60, 78].map((x) => `<rect x="${x - 2}" y="-2" width="4" height="14" class="sk2"/>`).join('') : '';
  const pockets = o.pocket === 'side' ? `<path d="M1 14 L-1 36" class="skl"/><path d="M89 14 L91 36" class="skl"/>` : `<path d="M16 10 L2 32" class="skl"/><path d="M74 10 L88 32" class="skl"/>`;
  const pleats = o.front === 'pleated' ? `<path d="M24 10 L25 26 M30 10 L30.5 22 M66 10 L65 26 M60 10 L59.5 22" class="skl"/>` : '';
  const turnup = o.hem === 'turnup' ? `<path d="M${a - 0.4} 152 L${b + 0.3} 152 L${b} 160 L${a} 160 Z" class="sk2"/><path d="M${c - 0.3} 152 L${d + 0.4} 152 L${d} 160 L${c} 160 Z" class="sk2"/>` : '';
  return `<path d="${legs}" class="sk"/><path d="M4 0 L86 0 L86 10 L4 10 Z" class="sk2"/>${loops}` +
    `<path d="M45 10 L45 40 Q 45 48 38 50 M38 10 L38 42" class="skl"/>${pockets}${pleats}` +
    `<path d="M${(a + b) / 2 + 6} 12 L${(a + b) / 2} 160 M${(c + d) / 2 - 6} 12 L${(c + d) / 2} 160" class="skc"/>${turnup}<circle cx="45" cy="5" r="1.8" class="skb"/>`;
}

export const TROUSERS: Garment = {
  id: 'trousers', name: 'Trousers', viewBox: '-20 -10 130 180',
  measureKeys: ['waist', 'hip', 'rise', 'outseam'],
  options: [
    { id: 'front', label: 'Front', crop: [-4, -6, 98, 40], values: [{ id: 'flat', label: 'Flat' }, { id: 'pleated', label: 'Pleated' }] },
    { id: 'fit', label: 'Fit', values: [{ id: 'regular', label: 'Regular' }, { id: 'slim', label: 'Slim' }] },
    { id: 'pocket', label: 'Pockets', crop: [-8, -6, 56, 50], values: [{ id: 'slant', label: 'Slant' }, { id: 'side', label: 'Side seam' }] },
    { id: 'backPockets', label: 'Back pockets', values: [{ id: '0', label: 'None' }, { id: '1', label: 'One' }, { id: '2', label: 'Two' }] },
    { id: 'loops', label: 'Belt loops', crop: [-4, -6, 98, 26], values: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }] },
    { id: 'hem', label: 'Bottom', crop: [-6, 128, 100, 38], values: [{ id: 'plain', label: 'Plain' }, { id: 'turnup', label: 'Turn-up' }] },
  ],
  draft, steps, supplies, sketch,
};
