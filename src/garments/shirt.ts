import { Outline, type Allow, type Pt } from '../engine/geometry';
import type { Garment, Measurements, Options, Piece, Step } from '../engine/types';
import { shirtSteps } from './sew-shirt';
import { rectPiece } from './common';

const SA = 0.375;
const plain: Allow = { sa: SA };
const side: Allow = { sa: SA, extra: 1 };
const fold: Allow = { sa: 0, fold: true };

function draft(m: Measurements, o: Options): Piece[] {
  const C = m.chest, N = m.neck, Sh = m.shoulder, SL = m.sleeve, Wr = m.wrist;
  const slim = o.fit === 'slim', straight = o.hem === 'straight', half = o.sleeve === 'half';
  const E = slim ? 3.5 : 5, G = C + E;
  const nw = N / 6 + 0.25, armY = G / 6 + 3, yk = 4, bx = G / 4 + 0.25, fx = G / 4 - 0.25, sup = slim ? 1 : 0.25;
  const L = straight ? m.shirtLength - 1.5 : m.shirtLength;
  const waistY = L * 0.55 + 0.75, hemY = L + 0.75, sideHemY = straight ? hemY : hemY - 3;
  const hem: Allow = { sa: straight ? 1 : 0.5 };
  const pieces: Piece[] = [];
  const armX = Sh / 2 - 0.25; // where the yoke line meets the armhole

  // YOKE
  {
    const o2 = new Outline([0, 0.75])
      .quad([nw * 0.85, 0.75], [nw, 0], plain, 'neck')
      .line([Sh / 2, 1.75], plain, 'shoulder')
      .line([armX, yk], plain, 'armhole')
      .line([0, yk], plain, 'yoke seam')
      .close(fold);
    pieces.push({ id: 'yoke', name: 'Yoke', n: 2, fold: true, fabric: 'main', outline: o2, marks: [], grain: [[nw + 1.5, 1.6], [nw + 1.5, yk - 0.6]] });
  }
  // BACK
  {
    const pl = o.backPleat === 'box' ? 0.75 : 0;
    const Ep: Pt = [bx, armY], F: Pt = [bx - sup, waistY], Gp: Pt = [bx - sup * 0.5, sideHemY];
    const o2 = new Outline([-pl, yk]).line([armX, yk], plain, 'yoke seam')
      .cubic([armX - 0.2, armY * 0.75], [Sh / 2 - 0.35, armY], Ep, plain, 'armhole')
      .line(F, side, 'side').line(Gp, side, 'side');
    if (straight) o2.line([-pl, hemY], hem, 'hem'); else o2.cubic([Gp[0] - 1.2, hemY], [Gp[0] * 0.45, hemY], [-pl, hemY], hem, 'hem');
    o2.close(fold);
    const marks: Piece['marks'] = pl ? [{ k: 'line', a: [0, yk], b: [0, yk + 6], style: 'mark' }, { k: 'text', p: [0.3, yk + 7], t: 'pleat' }] : [];
    pieces.push({ id: 'back', name: 'Back', n: 1, fold: true, fabric: 'main', outline: o2, marks, grain: [[bx * 0.6, armY + 2], [bx * 0.6, hemY - 5]] });
  }
  // FRONT
  const fnd = N / 6 + 0.75, csx = Sh / 2 - 0.25, buttons: Pt[] = [];
  {
    const Ep: Pt = [fx, armY], F: Pt = [fx - sup, waistY], Gp: Pt = [fx - sup * 0.5, sideHemY];
    const o2 = new Outline([-0.75, fnd]).line([0, fnd], plain, 'neck')
      .cubic([nw * 0.6, fnd], [nw, fnd * 0.5], [nw, 0], plain, 'neck')
      .line([csx, 2], plain, 'shoulder')
      .cubic([csx - 0.75, armY * 0.6], [csx - 0.55, armY], Ep, plain, 'armhole')
      .line(F, side, 'side').line(Gp, side, 'side');
    if (straight) o2.line([0, hemY], hem, 'hem'); else o2.cubic([Gp[0] - 1.2, hemY], [Gp[0] * 0.45, hemY], [0, hemY], hem, 'hem');
    o2.line([-0.75, hemY], hem, 'hem').close({ sa: 1.5 }, 'button stand');
    for (let y = fnd + 3; y < hemY - 5; y += 3.5) buttons.push([0, y]);
    const marks: Piece['marks'] = [{ k: 'line', a: [0, fnd], b: [0, hemY], style: 'guide' }, ...buttons.map((p) => ({ k: 'btn' as const, p }))];
    const pk = +o.pockets;
    if (pk > 0) {
      const x0 = 2.25, x1 = 7.25, py = armY - 3.25;
      marks.push({ k: 'path', d: `M${x0} ${py} L${x1} ${py} L${x1} ${py + 5} L${(x0 + x1) / 2} ${py + 5.6} L${x0} ${py + 5} Z`, style: 'mark' },
        { k: 'text', p: [x0, py - 0.4], t: pk === 2 ? 'pocket (both fronts)' : 'pocket (left front)' });
    }
    pieces.push({ id: 'front', name: 'Front', n: 2, mirror: true, fabric: 'main', outline: o2, marks, grain: [[fx * 0.62, armY + 4], [fx * 0.62, hemY - 5]],
      note: 'Fold the 1½″ edge under for the button stand.' });
  }
  // SLEEVE
  {
    const bw = G * (slim ? 0.35 : 0.37), cap = G / 8 - 0.5;
    const len = half ? SL * 0.36 : SL - 2, hemW = half ? bw * 0.86 : Wr + 4;
    const B: Pt = [-bw / 2, cap], Cc: Pt = [bw / 2, cap];
    const o2 = new Outline(B).cubic([-bw * 0.3, cap], [-bw * 0.24, 0], [0, 0], plain, 'cap').cubic([bw * 0.24, 0], [bw * 0.3, cap], Cc, plain, 'cap')
      .line([hemW / 2, len], side, 'underarm').line([-hemW / 2, len], half ? { sa: 1 } : plain, 'hem').close(side, 'underarm');
    const marks: Piece['marks'] = [{ k: 'line', a: [-bw / 2, cap], b: [bw / 2, cap], style: 'guide' }];
    if (!half) {
      const sx = hemW / 4;
      marks.push({ k: 'line', a: [sx, len - 5.5], b: [sx, len], style: 'mark' }, { k: 'text', p: [sx + 0.3, len - 3], t: 'slit' },
        { k: 'line', a: [sx + 0.8, len], b: [sx + 1.1, len - 0.8], style: 'mark' }, { k: 'line', a: [sx + 1.9, len], b: [sx + 2.2, len - 0.8], style: 'mark' });
    }
    pieces.push({ id: 'sleeve', name: half ? 'Short sleeve' : 'Sleeve', n: 2, mirror: true, fabric: 'main', outline: o2, marks, grain: [[0, cap + 1.5], [0, len - 2]] });
  }
  // COLLAR
  const hs = N / 2 + 0.75, cl = N / 2 - 0.25;
  if (o.collar === 'mandarin') {
    const h = 1.5;
    const st = new Outline([0, 0]).line([N / 4, 0], plain, 'band edge').quad([hs - 0.3, 0.05], [hs, 0.6], plain, 'band edge').quad([hs + 0.05, h], [hs - 0.6, h], plain, 'band edge').line([0, h], plain, 'neck').close(fold);
    pieces.push({ id: 'band', name: 'Band collar', n: 2, fold: true, fabric: 'main', interfacing: true, outline: st, marks: [{ k: 'line', a: [N / 2, 0], b: [N / 2, h], style: 'mark' }, { k: 'text', p: [N / 2 + 0.1, -0.2], t: 'CF' }] });
  } else {
    const st = new Outline([0, 0]).line([N / 4, 0], plain, 'stand edge').quad([hs - 0.4, 0.05], [hs, 0.55], plain, 'stand edge').quad([hs + 0.05, 1.25], [hs - 0.6, 1.25], plain, 'stand edge').line([0, 1.25], plain, 'neck').close(fold);
    pieces.push({ id: 'stand', name: 'Collar stand', n: 2, fold: true, fabric: 'main', interfacing: true, outline: st, marks: [{ k: 'line', a: [N / 2, 0], b: [N / 2, 1.25], style: 'mark' }, { k: 'text', p: [N / 2 + 0.1, -0.2], t: 'CF' }] });
    const tip: Pt = o.collar === 'spread' ? [cl + 1.15, 0.15] : o.collar === 'buttondown' ? [cl + 0.75, -0.85] : [cl + 0.9, -0.5];
    const leaf = new Outline([0, 0]).quad([cl * 0.6, 0], tip, plain, 'outer edge').line([cl, 1.5], plain, 'collar end').quad([cl * 0.5, 1.9], [0, 1.875], plain, 'neck').close(fold);
    const marks: Piece['marks'] = o.collar === 'buttondown' ? [{ k: 'btn', p: [cl + 0.15, 0.2] }] : [];
    pieces.push({ id: 'leaf', name: 'Collar', n: 2, fold: true, fabric: 'main', interfacing: true, outline: leaf, marks });
  }
  // CUFF + PLACKETS (full sleeve)
  if (!half) {
    const cL = Wr + 2.5;
    const ce = 'cuff edge';
    const cuff = new Outline([0, 0]).line([cL, 0], plain, 'sleeve edge').line([cL, 2], plain, ce).quad([cL, 2.5], [cL - 0.5, 2.5], plain, ce).line([0.5, 2.5], plain, ce).quad([0, 2.5], [0, 2], plain, ce).close(plain, ce);
    pieces.push({ id: 'cuff', name: 'Cuff', n: 4, fabric: 'main', interfacing: true, outline: cuff, marks: [], note: 'Fuse interfacing on 2 of the 4.' });
    pieces.push(rectPiece('placketL', 'Sleeve placket (big)', 10, 2.5, 2), rectPiece('placketS', 'Sleeve placket (small)', 6.5, 1.25, 2));
  }
  // POCKET
  if (+o.pockets > 0) {
    const pk = new Outline([0, 0]).line([5, 0], { sa: 1.25 }, 'top hem').line([5, 5], plain, 'pocket edge').line([2.5, 5.6], plain, 'pocket edge').line([0, 5], plain, 'pocket edge').close(plain, 'pocket edge');
    pieces.push({ id: 'pocket', name: 'Pocket', n: +o.pockets, fabric: 'main', outline: pk, marks: [], grain: [[2.5, 1], [2.5, 4]] });
  }
  return pieces;
}

const steps = (o: Options): Step[] => shirtSteps(o);

function supplies(m: Measurements, o: Options) {
  const half = o.sleeve === 'half', fnd = m.neck / 6 + 0.75, hemY = (o.hem === 'straight' ? m.shirtLength - 1.5 : m.shirtLength) + 0.75;
  let front = 0; for (let y = fnd + 3; y < hemY - 5; y += 3.5) front++;
  const btn = front + 1 + (half ? 0 : 4) + (o.collar === 'buttondown' ? 2 : 0);
  return [
    { icon: 'thread', qty: '1', say: 'One spool of matching thread' },
    { icon: 'buttons', qty: `${btn} + 2`, say: `${btn} buttons, plus two spare` },
    { icon: 'interfacing', qty: '0.5 m', say: 'Half a metre of fusible interfacing for the collar' + (half ? '' : ' and cuffs') },
    { icon: 'needle', qty: '80/12', say: 'Machine needle size 80' },
  ];
}

/* ---------- flat sketch (viewBox -10 -14 180 176) ---------- */
function sketch(o: Options) {
  const slim = o.fit === 'slim', straight = o.hem === 'straight', half = o.sleeve === 'half';
  const w = slim ? 4 : 0;
  const bottom = straight ? 'L 124 140 L 36 140' : 'L 124 146 C 100 154 60 154 36 146';
  const body = `M58 6 Q 80 16 102 6 L 124 12 L ${124 - w} 70 ${bottom} L ${36 + w} 70 L 36 12 Z`;
  const sl = half ? ['M124 12 L148 48 L134 58 L124 46 Z', 'M36 12 L12 48 L26 58 L36 46 Z'] : ['M124 12 L164 112 L148 120 L124 58 Z', 'M36 12 L-4 112 L12 120 L36 58 Z'];
  const cuffs = half ? '' : `<path d="M164 112 L148 120 L144.7 111.6 L160.7 103.6 Z" class="sk2"/><path d="M-4 112 L12 120 L15.3 111.6 L-0.7 103.6 Z" class="sk2"/>`;
  let collar = '';
  if (o.collar === 'mandarin') collar = `<path d="M58 8 Q 80 18 102 8 L 101 -4 Q 80 4 59 -4 Z" class="sk2"/>`;
  else {
    const L = o.collar === 'spread' ? 'M60 -2 L80 12 L62 18 Z' : o.collar === 'buttondown' ? 'M60 -2 L80 13 L69 25 Z' : 'M60 -2 L80 14 L66 22 Z';
    const R = L.replace(/(\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_m, x, y) => `${160 - +x} ${y}`);
    collar = `<path d="M58 6 Q 80 16 102 6 L 100 -2 Q 80 6 60 -2 Z" class="sk2"/><path d="${L}" class="sk"/><path d="${R}" class="sk"/>` +
      (o.collar === 'buttondown' ? `<circle cx="68" cy="22" r="1.8" class="skb"/><circle cx="92" cy="22" r="1.8" class="skb"/>` : '');
  }
  const pk = +o.pockets, pocket = (x: number) => `<path d="M${x} 40 L${x + 18} 40 L${x + 18} 58 L${x + 9} 62 L${x} 58 Z" class="skl"/>`;
  const btns = [26, 46, 66, 86, 106, 126].map((y) => `<circle cx="80" cy="${y}" r="1.8" class="skb"/>`).join('');
  return `<path d="${sl[0]}" class="sk"/><path d="${sl[1]}" class="sk"/>${cuffs}<path d="${body}" class="sk"/>` +
    `<path d="M80 12 L80 ${straight ? 140 : 151}" class="skl"/>${btns}${pk >= 1 ? pocket(94) : ''}${pk >= 2 ? pocket(48) : ''}${collar}`;
}

export const SHIRT: Garment = {
  id: 'shirt', name: 'Shirt', viewBox: '-10 -14 180 176',
  measureKeys: ['chest', 'neck', 'shoulder', 'sleeve', 'shirtLength', 'wrist'],
  options: [
    { id: 'collar', label: 'Collar', crop: [44, -12, 72, 44], values: [{ id: 'classic', label: 'Classic' }, { id: 'spread', label: 'Spread' }, { id: 'buttondown', label: 'Button-down' }, { id: 'mandarin', label: 'Band' }] },
    { id: 'sleeve', label: 'Sleeve', crop: [100, -2, 70, 126], values: [{ id: 'full', label: 'Full' }, { id: 'half', label: 'Half' }] },
    { id: 'fit', label: 'Fit', values: [{ id: 'regular', label: 'Regular' }, { id: 'slim', label: 'Slim' }] },
    { id: 'pockets', label: 'Pockets', crop: [36, 28, 88, 42], values: [{ id: '0', label: 'None' }, { id: '1', label: 'One' }, { id: '2', label: 'Two' }] },
    { id: 'hem', label: 'Bottom', crop: [28, 112, 104, 46], values: [{ id: 'curved', label: 'Curved' }, { id: 'straight', label: 'Straight' }] },
    { id: 'backPleat', label: 'Back pleat', values: [{ id: 'none', label: 'None' }, { id: 'box', label: 'Box pleat' }] },
  ],
  draft, steps, supplies, sketch,
};
