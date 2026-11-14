// Tunic family: men's kurta, women's kurti, saree blouse, kids' kurta, and the bodice of dresses.
import { Outline, type Allow, type Pt } from '../engine/geometry';
import type { Garment, Measurements, Options, Piece, Step } from '../engine/types';
import { rectPiece } from './common';
import { tunicSteps } from './sew-tunic';

const r4 = (x: number) => Math.round(x * 4) / 4;

/** Where each length ends, measured down from the shoulder/neck line. */
export function tunicLengthY(m: Measurements, len: string) {
  const H = m.height || 66, waistY = H * 0.25, hipY = waistY + (H < 52 ? 5 : 8);
  return { waistY, hipY, len: ({ crop: waistY - 2, waist: waistY, hip: hipY + 1, thigh: hipY + 6, knee: H * 0.58, calf: H * 0.72 } as Record<string, number>)[len] ?? hipY + 1 };
}

export interface BodiceOpts { neck: string; sleeve: string; length: string; fit: string; slits: string; darts: string; opening: string; back?: string }

/** Draft front, back, sleeves and finishing pieces. Shared with the dress. */
export function draftTunic(m: Measurements, o: BodiceOpts, sideExtra = 1): Piece[] {
  const C = m.chest, N = m.neck, Sh = m.shoulder, H = m.hip, Wst = m.waist;
  const fitted = o.fit === 'fitted', aline = o.fit === 'aline';
  const E = fitted ? 2.5 : 5, G = C + E;
  const nw = N / 6 + (o.neck === 'boat' ? 1.75 : 0.25), armY = G / 6 + (fitted ? 2.5 : 3);
  const { waistY, hipY, len } = tunicLengthY(m, o.length);
  const fd = ({ round: N / 6 + 0.75, v: Math.max(4, N / 2.6), deep: Math.max(5, N / 2.4), boat: 1.5, band: N / 6 + 0.75, square: Math.max(4, N / 2.8), sweetheart: Math.max(4.5, N / 2.6), high: N / 6 + 0.25 } as Record<string, number>)[o.neck] ?? N / 6 + 0.75;
  // back neck depth: a deep U back is cut well down the back (popular for saree blouses)
  const bd = o.back === 'deepu' ? Math.max(6, armY - 1.5) : o.neck === 'deep' ? 2.5 : o.neck === 'boat' ? 1 : 0.75;
  const di = o.darts === 'yes' ? Math.max(0.5, (C - Wst) / 8) : 0; // bust dart intake, front gets longer by this much
  const halfW = (x: number) => x / 4;
  const chestF = halfW(G) - 0.25, chestB = halfW(G) + 0.25;
  const waistF = fitted ? halfW(Wst + E) : chestF - 0.25, waistB = fitted ? halfW(Wst + E) + 0.5 : chestB - 0.25;
  const hipF = Math.max(halfW(H + E), waistF), hipB = Math.max(halfW(H + E) + 0.25, waistB);
  const flare = aline ? Math.max(0, len - hipY) * 0.2 + 1 : 0;
  const SA = 0.5, plain: Allow = { sa: SA }, side: Allow = { sa: SA, extra: sideExtra }, hem: Allow = { sa: len > hipY + 4 ? 1.25 : 1 }, fold: Allow = { sa: 0, fold: true };
  const neckA: Allow = { sa: 0.375 };
  const pieces: Piece[] = [];
  const openFront = o.opening === 'fronthooks', backZip = o.opening === 'backzip';
  const sideSeam = (ol: Outline, chest: number, waist: number, hip: number, drop: number, front: boolean) => {
    if (front && di) {
      const dy = armY + 2;
      ol.line([chest, dy - 0.5 * di], side, 'side').line([chest - 3, dy + 0.2], plain, 'dart').line([chest, dy + 0.5 * di], plain, 'dart');
    }
    if (len > waistY + 0.5) ol.line([waist, waistY + drop], side, 'side');
    if (len > hipY + 0.5) ol.line([hip, hipY + drop], side, 'side');
    const hemX = len > hipY + 0.5 ? hip + flare : len > waistY + 0.5 ? waist : chest;
    ol.line([hemX, len + drop], side, 'side');
    return hemX;
  };
  // FRONT
  {
    const ol = new Outline(openFront ? [-1, fd] : [0, fd]);
    if (openFront) ol.line([0, fd], neckA, 'neck');
    if (o.neck === 'v') ol.line([nw, 0], neckA, 'neck');
    else if (o.neck === 'square') ol.line([nw - 0.25, fd], neckA, 'neck').line([nw, 0], neckA, 'neck');
    else if (o.neck === 'sweetheart') ol.cubic([nw * 0.25, fd * 0.75], [nw * 0.55, fd * 0.7], [nw * 0.8, fd * 0.8], neckA, 'neck').quad([nw * 1.05, fd * 0.85], [nw, 0], neckA, 'neck');
    else ol.cubic([nw * 0.6, fd], [nw, fd * 0.5], [nw, 0], neckA, 'neck');
    ol.line([Sh / 2 - 0.25, 2], plain, 'shoulder').cubic([Sh / 2 - 1, armY * 0.6], [Sh / 2 - 0.8, armY], [chestF, armY], plain, 'armhole');
    const hx = sideSeam(ol, chestF, waistF, hipF, di, true);
    ol.cubic([hx - 1, len + di + 0.4], [hx * 0.5, len + di], [0, len + di], hem, 'hem');
    if (openFront) ol.line([-1, len + di], hem, 'hem').close({ sa: 1.5 }, 'front opening'); else ol.close(fold);
    const marks: Piece['marks'] = [];
    if (fitted && len >= waistY) marks.push({ k: 'path', d: `M${chestF * 0.45 - 0.5} ${waistY + di} L${chestF * 0.45} ${armY + 2} L${chestF * 0.45 + 0.5} ${waistY + di}`, style: 'mark' }, { k: 'text', p: [chestF * 0.45 + 0.6, waistY - 1], t: 'waist dart' });
    if (o.slits === 'yes' && len > hipY) marks.push({ k: 'line', a: [hipF + flare * 0.5, len + di - Math.min(10, len - hipY)], b: [hipF + flare, len + di], style: 'mark' }, { k: 'text', p: [hipF - 2.5, len + di - 6], t: 'slit' });
    if (o.opening === 'halfplacket') marks.push({ k: 'line', a: [0, fd], b: [0, fd + 9], style: 'mark' }, { k: 'text', p: [0.3, fd + 5], t: 'placket opening' });
    if (openFront) for (let y = fd + 1; y < len + di - 1; y += 1.5) marks.push({ k: 'btn', p: [-0.3, y] });
    pieces.push({ id: 'front', name: 'Front', n: openFront ? 2 : 1, fold: !openFront, mirror: openFront, fabric: 'main', outline: ol, marks, grain: [[chestF * 0.55, armY + 1], [chestF * 0.55, len - 1]] });
  }
  // BACK
  {
    const ol = new Outline(backZip ? [0, bd] : [0, bd]);
    ol.quad([nw * 0.85, bd], [nw, 0], neckA, 'neck').line([Sh / 2, 1.75], plain, 'shoulder').cubic([Sh / 2 - 0.6, armY * 0.55], [Sh / 2 - 0.4, armY], [chestB, armY], plain, 'armhole');
    const hx = sideSeam(ol, chestB, waistB, hipB, 0, false);
    ol.cubic([hx - 1, len + 0.3], [hx * 0.5, len], [0, len], hem, 'hem');
    ol.close(backZip ? { sa: 0.75, extra: 0.5 } : fold, backZip ? 'centre back' : '');
    const marks: Piece['marks'] = [];
    if (fitted && len >= waistY) marks.push({ k: 'path', d: `M${chestB * 0.45 - 0.5} ${waistY} L${chestB * 0.45} ${armY} L${chestB * 0.45 + 0.5} ${waistY}`, style: 'mark' });
    if (backZip) marks.push({ k: 'line', a: [0, bd], b: [0, Math.min(len, waistY + 7)], style: 'mark' }, { k: 'text', p: [0.3, waistY], t: 'zip' });
    if (o.back === 'keyhole') marks.push({ k: 'line', a: [0, bd], b: [0, bd + 4], style: 'mark' }, { k: 'text', p: [0.3, bd + 2], t: 'keyhole' });
    pieces.push({ id: 'back', name: 'Back', n: backZip ? 2 : 1, fold: !backZip, mirror: backZip, fabric: 'main', outline: ol, marks, grain: [[chestB * 0.55, armY + 1], [chestB * 0.55, len - 1]] });
  }
  // SLEEVE
  if (o.sleeve !== 'none') {
    const B = (m.bicep || C * 0.32) + (fitted ? 2 : 3.5), cap = G / 8 - 0.5 + (fitted ? 1 : 0);
    const L = ({ short: Math.max(4, m.sleeve * 0.24), elbow: m.sleeve * 0.5, threequarter: m.sleeve * 0.72, full: m.sleeve + 0.5 } as Record<string, number>)[o.sleeve] ?? m.sleeve * 0.5;
    const t = (L - cap) / Math.max(1, m.sleeve - cap), hemW = B * (1 - t) + (m.wrist + 4) * t;
    const ol = new Outline([-B / 2, cap]).cubic([-B * 0.3, cap], [-B * 0.24, 0], [0, 0], plain, 'cap').cubic([B * 0.24, 0], [B * 0.3, cap], [B / 2, cap], plain, 'cap')
      .line([hemW / 2, L], { sa: SA, extra: 0.75 }, 'underarm').line([-hemW / 2, L], { sa: 1 }, 'hem').close({ sa: SA, extra: 0.75 }, 'underarm');
    pieces.push({ id: 'sleeve', name: 'Sleeve', n: 2, mirror: true, fabric: 'main', outline: ol, marks: [{ k: 'line', a: [-B / 2, cap], b: [B / 2, cap], style: 'guide' }], grain: [[0, cap + 1], [0, L - 1]] });
  } else {
    pieces.push(rectPiece('armbind', 'Armhole binding', r4(armY * 2.4 + 2), 1.5, 2));
  }
  // NECK FINISH
  if (o.neck === 'band') {
    const hs = N / 2 + 0.75, h = 1.5, P = { sa: 0.375 };
    const band = new Outline([0, 0]).line([N / 4, 0], P, 'band edge').quad([hs - 0.3, 0.05], [hs, 0.6], P, 'band edge').quad([hs + 0.05, h], [hs - 0.6, h], P, 'band edge').line([0, h], P, 'neck').close(fold);
    pieces.push({ id: 'band', name: 'Band collar', n: 2, fold: true, fabric: 'main', interfacing: true, outline: band, marks: [] });
  } else {
    const around = 2 * (nw * 1.6 + fd * 0.9 + bd * 0.6) + 2;
    pieces.push(rectPiece('neckbind', 'Neck facing strip', r4(around), 1.5, 1));
  }
  if (o.opening === 'halfplacket') pieces.push(rectPiece('placket', 'Front placket', 10.5, 3, 2));
  if (o.back === 'keyhole') pieces.push(rectPiece('keyface', 'Keyhole facing', 3, 6, 1), rectPiece('dori', 'Tie string', 1.5, 18, 2));
  // A blouse that opens at the front is lined: each lining piece is the same shape and is tacked to its blouse piece.
  if (openFront) for (const id of ['front', 'back', 'sleeve']) {
    const p = pieces.find((x) => x.id === id);
    if (p) pieces.push({ ...p, id: id + 'L', name: p.name + ' lining', fabric: 'lining', interfacing: false, marks: [], note: 'Cut from thin cotton lining, the same shape as the ' + p.name.toLowerCase() + '.' });
  }
  return pieces;
}

const tunicDraft = (m: Measurements, o: Options) => draftTunic(m, o as unknown as BodiceOpts, o.darts === 'yes' ? 1.5 : 1);

const steps = (o: Options): Step[] => tunicSteps(o);

function supplies(m: Measurements, o: Options) {
  const list = [{ icon: 'thread', qty: '1', say: 'One spool of matching thread' }];
  if (o.opening === 'halfplacket' || o.neck === 'band') list.push({ icon: 'buttons', qty: '4', say: 'Four small buttons' });
  if (o.opening === 'fronthooks') list.push({ icon: 'hook', qty: '8', say: 'Eight blouse hooks and eyes' }, { icon: 'lining', qty: '1 m', say: 'One metre of thin cotton lining' });
  if (o.neck === 'band' || o.opening === 'halfplacket') list.push({ icon: 'interfacing', qty: '0.25 m', say: 'A little fusible interfacing for the collar and placket' });
  list.push({ icon: 'needle', qty: '80/12', say: 'Machine needle size 80' });
  return list;
}

/* ---------- sketch (viewBox -10 -14 180 230) ---------- */
export function tunicSketch(o: Options, opts: { lengthTo?: number } = {}) {
  const lenY = opts.lengthTo ?? ({ crop: 58, waist: 66, hip: 92, thigh: 112, knee: 150, calf: 190 } as Record<string, number>)[o.length] ?? 92;
  const aline = o.fit === 'aline', fitted = o.fit === 'fitted';
  const w = fitted ? 6 : 0, fl = aline ? (lenY - 70) * 0.28 : 0;
  const body = `M58 6 Q 80 ${o.neck === 'boat' ? 10 : 16} 102 6 L 124 12 L ${124 - w} 66 L ${124 + fl} ${lenY} Q 80 ${lenY + 4} ${36 - fl} ${lenY} L ${36 + w} 66 L 36 12 Z`;
  const S = ({ none: null, short: [148, 40, 134, 50, 124, 40], elbow: [154, 64, 140, 72, 124, 52], threequarter: [160, 92, 146, 98, 124, 56], full: [164, 118, 148, 124, 124, 58] } as Record<string, number[] | null>)[o.sleeve];
  const sl = S ? `<path d="M124 12 L${S[0]} ${S[1]} L${S[2]} ${S[3]} L${S[4]} ${S[5]} Z" class="sk"/><path d="M36 12 L${160 - S[0]} ${S[1]} L${160 - S[2]} ${S[3]} L${160 - S[4]} ${S[5]} Z" class="sk"/>` : '';
  const neckD = ({ round: 'M66 7 Q80 26 94 7', v: 'M64 7 L80 34 L96 7', deep: 'M62 7 Q80 44 98 7', boat: 'M58 7 Q80 14 102 7', band: 'M66 7 Q80 22 94 7', square: 'M64 7 L65 30 L95 30 L96 7', sweetheart: 'M64 7 Q63 30 72 30 Q78 30 80 34 Q82 30 88 30 Q97 30 96 7', high: 'M68 7 Q80 18 92 7' } as Record<string, string>)[o.neck] ?? 'M66 7 Q80 26 94 7';
  let extra = `<path d="${neckD}" class="skl"/>`;
  if (o.neck === 'band') extra += `<path d="M64 6 Q80 20 96 6 L95 0 Q80 12 65 0 Z" class="sk2"/>`;
  if (o.opening === 'halfplacket' || o.neck === 'band') extra += `<path d="M78 18 L78 52 L82 52 L82 18" class="skl"/>` + [26, 34, 42].map((y) => `<circle cx="80" cy="${y}" r="1.5" class="skb"/>`).join('');
  if (o.opening === 'fronthooks') extra += `<path d="M80 30 L80 ${lenY}" class="skl"/>` + Array.from({ length: 5 }, (_, i) => `<circle cx="80" cy="${36 + i * 5}" r="1" class="skb"/>`).join('');
  if (o.slits === 'yes' && lenY > 100) extra += `<path d="M${124 + fl * 0.85} ${lenY - 24} L${124 + fl} ${lenY} M${36 - fl * 0.85} ${lenY - 24} L${36 - fl} ${lenY}" class="skl" stroke-width="2"/>`;
  if (o.darts === 'yes') extra += `<path d="M64 ${Math.min(lenY, 66)} L66 44 M96 ${Math.min(lenY, 66)} L94 44" class="skl"/>`;
  return `${sl}<path d="${body}" class="sk"/>${extra}`;
}

export const TUNIC: Garment = {
  id: 'tunic' as Garment['id'], name: 'Kurta / kurti / blouse', viewBox: '-10 -14 180 214',
  measureKeys: ['chest', 'waist', 'hip', 'shoulder', 'neck', 'sleeve', 'bicep', 'height'],
  options: [
    { id: 'neck', label: 'Neck', crop: [44, -10, 72, 50], values: [{ id: 'round', label: 'Round' }, { id: 'v', label: 'V-neck' }, { id: 'band', label: 'Band collar' }, { id: 'deep', label: 'Deep' }, { id: 'boat', label: 'Boat' }, { id: 'square', label: 'Square' }, { id: 'sweetheart', label: 'Sweetheart' }, { id: 'high', label: 'High' }] },
    { id: 'sleeve', label: 'Sleeve', crop: [100, -4, 70, 130], values: [{ id: 'none', label: 'None' }, { id: 'short', label: 'Short' }, { id: 'elbow', label: 'Elbow' }, { id: 'threequarter', label: '¾' }, { id: 'full', label: 'Full' }] },
    { id: 'length', label: 'Length', values: [{ id: 'crop', label: 'Blouse' }, { id: 'hip', label: 'Hip' }, { id: 'thigh', label: 'Thigh' }, { id: 'knee', label: 'Knee' }, { id: 'calf', label: 'Calf' }] },
    { id: 'fit', label: 'Shape', values: [{ id: 'straight', label: 'Straight' }, { id: 'aline', label: 'A-line' }, { id: 'fitted', label: 'Fitted' }] },
    { id: 'slits', label: 'Side slits', values: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }] },
    { id: 'darts', label: 'Bust darts', values: [{ id: 'no', label: 'No' }, { id: 'yes', label: 'Yes' }] },
    { id: 'back', label: 'Back', values: [{ id: 'plain', label: 'Plain' }, { id: 'deepu', label: 'Deep U' }, { id: 'keyhole', label: 'Keyhole + ties' }] },
    { id: 'opening', label: 'Opening', values: [{ id: 'none', label: 'Pull-on' }, { id: 'halfplacket', label: 'Half placket' }, { id: 'fronthooks', label: 'Front hooks' }] },
  ],
  draft: tunicDraft, steps, supplies, sketch: (o) => tunicSketch(o),
};
