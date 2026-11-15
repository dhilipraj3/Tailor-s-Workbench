// Tunic family: men's kurta, women's kurti, saree blouse, kids' kurta, and the bodice of dresses.
import { Outline, type Allow, type Pt } from '../engine/geometry';
import type { Fit, Garment, Measurements, Options, Piece, Step } from '../engine/types';
import { rectPiece, edgeLength, capHeightFor } from './common';
import { tunicSteps } from './sew-tunic';

const r4 = (x: number) => Math.round(x * 4) / 4;

/** distance round the neckline (front and back, both halves) */
export const neckOpening = (pieces: Piece[]) => 2 * (edgeLength(pieces.find((p) => p.id === 'front'), 'neck') + edgeLength(pieces.find((p) => p.id === 'back'), 'neck'));
/** the opening a woven neckline needs to pull over the head: head round + 1½″ (head estimated from height when not measured) */
export const headOpening = (m: Measurements) => (m.head || (m.height && m.height < 56 ? 18 + (m.height - 36) * 0.15 : 22.5)) + 1.5;

/** Where each length ends, measured down from the shoulder/neck line. */
export function tunicLengthY(m: Measurements, len: string) {
  const H = m.height || 66, waistY = H * 0.25, hipY = waistY + (H < 52 ? 5 : 8);
  return { waistY, hipY, len: ({ crop: waistY - 2, waist: waistY, hip: hipY + 1, thigh: hipY + 6, knee: H * 0.58, calf: H * 0.72 } as Record<string, number>)[len] ?? hipY + 1 };
}

export interface BodiceOpts { neck: string; sleeve: string; length: string; fit: string; slits: string; darts: string; opening: string; back?: string }

/** Draft front, back, sleeves and finishing pieces. Shared with the dress. */
export function draftTunic(m: Measurements, o0: BodiceOpts, sideExtra = 1, grow = 0): Piece[] {
  // a band collar closes round the neck, so it always has a front placket to get the head through
  const o: BodiceOpts = o0.neck === 'band' && o0.opening === 'none' ? { ...o0, opening: 'halfplacket' } : o0;
  // a pull-on top (no placket, hooks, zip or keyhole) has a wider, deeper kurti neckline; `grow` widens it further until the head fits
  const pullOn = o.opening === 'none' && o.back !== 'keyhole';
  const C = m.chest, N = m.neck, Sh = m.shoulder, H = m.hip, Wst = m.waist;
  // a peplum top is a fitted bodice cut to the waist, with a gathered peplum sewn on below
  const peplum = o.fit === 'peplum', fitted = o.fit === 'fitted' || peplum, aline = o.fit === 'aline';
  const E = fitted ? 2.5 : 5, G = C + E;
  // never so wide that the shoulder seam shrinks below 2¾ inches (narrow child shoulders)
  const nw = Math.min(N / 6 + (o.neck === 'boat' ? 1.75 : pullOn ? 1.25 : 0.25) + grow * 0.4, Sh / 2 - 3), armY = G / 6 + (fitted ? 2.5 : 3);
  const L0 = tunicLengthY(m, o.length), { waistY, hipY } = L0, len = peplum ? waistY : L0.len;
  const fd = (({ round: N / 6 + 0.75, v: Math.max(4, N / 2.6), deep: Math.max(5, N / 2.4), boat: 1.5, band: N / 6 + 0.75, square: Math.max(4, N / 2.8), sweetheart: Math.max(4.5, N / 2.6), high: N / 6 + 0.25 } as Record<string, number>)[o.neck] ?? N / 6 + 0.75) + (pullOn ? 2 + grow : 0);
  // back neck depth: a deep U back is cut well down the back (popular for saree blouses)
  const bd = o.back === 'deepu' ? Math.max(6, armY - 1.5) : Math.max(o.neck === 'deep' ? 2.5 : o.neck === 'boat' ? 1 : 0.75, pullOn ? 2 + grow * 0.5 : 0);
  const di = o.darts === 'yes' ? Math.max(0.5, (C - Wst) / 8) : 0; // bust dart intake, front gets longer by this much
  const halfW = (x: number) => x / 4;
  // Front and back are the same width at every level (under the arm, bust, waist, hip, hem), so the side seams meet.
  const bust = 0; // front and back are cut the same width everywhere; the bust darts give the shaping
  const chestF = halfW(G) + bust, chestB = halfW(G) - bust;
  const waistF = fitted ? halfW(Wst + E) : halfW(G) - 0.25, waistB = waistF;
  const hipF = Math.max(halfW(H + E), waistF), hipB = hipF;
  const flare = aline ? Math.max(0, len - hipY) * 0.2 + 1 : 0;
  const SA = 0.5, plain: Allow = { sa: SA }, side: Allow = { sa: SA, extra: sideExtra }, hem: Allow = { sa: peplum ? SA : len > hipY + 4 ? 1.25 : 1 }, fold: Allow = { sa: 0, fold: true };
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
    // a top cut to the waist (peplum bodice) ends at the waist width, not the bust width
    const hemX = len > hipY + 0.5 ? hip + flare : len > waistY - 0.01 ? waist : chest;
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
    (o.back === 'deepu' ? ol.cubic([nw * 0.62, bd], [nw, bd * 0.6], [nw, 0], neckA, 'neck') : ol.quad([nw * 0.85, bd], [nw, 0], neckA, 'neck')).line([Sh / 2, 1.75], plain, 'shoulder').cubic([Sh / 2 - 0.6, armY * 0.55], [Sh / 2 - 0.4, armY], [chestB, armY], plain, 'armhole');
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
    // the sleeve top is drafted to the real armhole length plus a little ease, so it sets in without stretching or tucks
    const fitB = (m.bicep || C * 0.32) + (fitted ? 2 : 3.5);
    const armLen = edgeLength(pieces.find((p) => p.id === 'front'), 'armhole') + edgeLength(pieces.find((p) => p.id === 'back'), 'armhole');
    const baseCap = capHeightFor(fitB, armLen + (fitted ? 0.5 : 0.75));
    const puff = o.sleeve === 'puff', balloon = o.sleeve === 'balloon', bell = o.sleeve === 'bell', gathered = puff || balloon;
    // puff and balloon sleeves are cut wider and taller at the top: the extra is gathered into the armhole and into a band;
    // a bell sleeve keeps the normal top and flares out to the hem
    const B = fitB + (puff ? 5 : balloon ? 6 : 0), cap = baseCap + (gathered ? 1.25 : 0);
    const L = ({ short: Math.max(4, m.sleeve * 0.24), elbow: m.sleeve * 0.5, threequarter: m.sleeve * 0.72, full: m.sleeve + 0.5,
      puff: Math.max(5, m.sleeve * 0.26 + 1), balloon: m.sleeve + 1.5, bell: m.sleeve * 0.72 } as Record<string, number>)[o.sleeve] ?? m.sleeve * 0.5;
    const t = (L - cap) / Math.max(1, m.sleeve - cap);
    const hemW = puff ? B : balloon ? B * 0.92 : bell ? fitB * 1.9 : fitB * (1 - t) + (m.wrist + 4) * t;
    const hemA: Allow = gathered ? { sa: 0.375 } : bell ? { sa: 0.5 } : { sa: 1 };
    const ol = new Outline([-B / 2, cap]).cubic([-B * 0.3, cap], [-B * 0.24, 0], [0, 0], plain, 'cap').cubic([B * 0.24, 0], [B * 0.3, cap], [B / 2, cap], plain, 'cap')
      .line([hemW / 2, L], { sa: SA, extra: 0.75 }, 'underarm').line([-hemW / 2, L], hemA, 'hem').close({ sa: SA, extra: 0.75 }, 'underarm');
    const marks: Piece['marks'] = [{ k: 'line', a: [-B / 2, cap], b: [B / 2, cap], style: 'guide' }];
    if (gathered) marks.push({ k: 'text', p: [-1.2, 1.2], t: 'gather' }, { k: 'text', p: [-1.2, L - 0.8], t: 'gather' });
    pieces.push({ id: 'sleeve', name: puff ? 'Puff sleeve' : balloon ? 'Balloon sleeve' : bell ? 'Bell sleeve' : 'Sleeve', n: 2, mirror: true, fabric: 'main', outline: ol, marks, grain: [[0, cap + 1], [0, L - 1]] });
    // the band (puff) or cuff (balloon) holds the gathers; its size includes a 3/8 inch seam at each end
    if (gathered) pieces.push(rectPiece('sband', puff ? 'Sleeve band' : 'Sleeve cuff', r4(puff ? (m.bicep || C * 0.32) + 1.75 : m.wrist + 2.25), puff ? 2.5 : 3.25, 2));
  } else {
    pieces.push(rectPiece('armbind', 'Armhole binding', r4(armY * 2.4 + 2), 1.5, 2));
  }
  // NECK FINISH
  if (o.neck === 'band') {
    const hs = N / 2 + 0.75, h = 1.5, P = { sa: 0.375 };
    const band = new Outline([0, 0]).line([N / 4, 0], P, 'band edge').quad([hs - 0.3, 0.05], [hs, 0.6], P, 'band edge').quad([hs + 0.05, h], [hs - 0.6, h], P, 'band edge').line([0, h], P, 'neck').close(fold);
    pieces.push({ id: 'band', name: 'Band collar', n: 2, fold: true, fabric: 'main', interfacing: true, outline: band, marks: [] });
  } else {
    // the real neckline (front and back, both halves) plus 2 inches for joining the ends or turning them in
    const around = 2 * (edgeLength(pieces.find((p) => p.id === 'front'), 'neck') + edgeLength(pieces.find((p) => p.id === 'back'), 'neck')) + 2;
    pieces.push(rectPiece('neckbind', 'Neck facing strip', r4(around), 1.5, 1));
  }
  if (o.opening === 'halfplacket') pieces.push(rectPiece('placket', 'Front placket', 10.5, 3, 2));
  if (peplum) {
    // gathered peplum: one and a half times the hip, 8 inches deep (sizes include the sewing space)
    const w = r4(((H + E) / 2) * 1.5 + 1);
    pieces.push(rectPiece('pepF', 'Peplum front', openFront ? r4(w / 2 + 1.5) : w, 8, openFront ? 2 : 1), rectPiece('pepB', 'Peplum back', w, 8, 1));
  }
  // A pull-on top must go over the head. If the neckline is too small and there is no other opening,
  // a 4 inch back keyhole is added (it opens the neck by 8 inches), with ties to close it.
  // still too small for the head? draft again with a wider, deeper neckline (no keyhole is added)
  if (pullOn && neckOpening(pieces) < headOpening(m) && grow < 6) return draftTunic(m, o0, sideExtra, grow + 0.5);
  if (o.back === 'keyhole') {
    // deep enough that the neck opens to fit the head (a keyhole adds twice its depth), at least 4 inches
    const depth = Math.max(4, Math.ceil(((headOpening(m) - (o.opening === 'halfplacket' ? 18 : 0) - neckOpening(pieces)) / 2 + 0.25) * 4) / 4);
    const backP = pieces.find((p) => p.id === 'back');
    if (backP) { backP.marks = backP.marks.filter((mk) => !(mk.k === 'text' && mk.t === 'keyhole')); const i = backP.marks.findIndex((mk) => mk.k === 'line' && mk.a[0] === 0 && mk.b[0] === 0 && mk.style === 'mark' && Math.abs(mk.b[1] - mk.a[1] - 4) < 1e-6); if (i >= 0) backP.marks.splice(i, 1); }
    backP?.marks.push({ k: 'line', a: [0, bd], b: [0, bd + depth], style: 'mark' }, { k: 'text', p: [0.3, bd + depth / 2], t: 'keyhole' });
    pieces.push(rectPiece('keyface', 'Keyhole facing', 3, depth + 2, 1), rectPiece('dori', 'Tie string', 1.5, 18, 2));
  }
  // A blouse that opens at the front is lined: each lining piece is the same shape and is tacked to its blouse piece.
  if (openFront) for (const id of ['front', 'back', 'sleeve']) {
    const p = pieces.find((x) => x.id === id);
    if (p) pieces.push({ ...p, id: id + 'L', name: p.name + ' lining', fabric: 'lining', interfacing: false, marks: [], note: 'Cut from thin cotton lining, the same shape as the ' + p.name.toLowerCase() + '.' });
  }
  return pieces;
}

const tunicDraft = (m: Measurements, o: Options) => draftTunic(m, o as unknown as BodiceOpts, o.darts === 'yes' ? 1.5 : 1);

const steps = (o: Options, fit?: Fit): Step[] => tunicSteps(o, fit);

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
  const pep = o.fit === 'peplum';
  const lenY = pep ? 66 : opts.lengthTo ?? ({ crop: 58, waist: 66, hip: 92, thigh: 112, knee: 150, calf: 190 } as Record<string, number>)[o.length] ?? 92;
  const aline = o.fit === 'aline', fitted = o.fit === 'fitted';
  const w = fitted ? 6 : 0, fl = aline ? (lenY - 70) * 0.28 : 0;
  const body = `M58 6 Q 80 ${o.neck === 'boat' ? 10 : 16} 102 6 L 124 12 L ${124 - w} 66 L ${124 + fl} ${lenY} Q 80 ${lenY + 4} ${36 - fl} ${lenY} L ${36 + w} 66 L 36 12 Z`;
  // sleeves: curved, with a stitched hem; puff is rounded with a band, balloon is wide with a cuff, bell flares
  const R: Record<string, string> = {
    short: 'M124 12 Q140 22 148 40 L134 50 Q130 44 124 40 Z',
    elbow: 'M124 12 Q142 30 154 64 L140 72 Q132 60 124 52 Z',
    threequarter: 'M124 12 Q146 40 160 92 L146 98 Q134 76 124 56 Z',
    full: 'M124 12 Q148 50 164 118 L148 124 Q136 90 124 58 Z',
    puff: 'M124 12 C146 4 166 26 156 42 L138 52 C133 47 128 44 124 40 Z',
    balloon: 'M124 12 C152 28 178 70 172 104 L150 116 C140 96 130 76 124 58 Z',
    bell: 'M124 12 Q140 34 150 62 Q160 80 178 92 L138 106 Q134 84 124 56 Z',
  };
  const HEM: Record<string, string> = {
    short: 'M146 37 L132 47', elbow: 'M152 61 L138 69', threequarter: 'M158 89 L144 95', full: 'M162 115 L146 121',
    puff: '', balloon: '', bell: 'M175 90 L139 103',
  };
  const mirror = (d: string) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_m, x, y) => `${160 - +x} ${y}`);
  let sl = '';
  if (R[o.sleeve]) {
    const one = `<path d="${R[o.sleeve]}" class="sk"/>` + (HEM[o.sleeve] ? `<path d="${HEM[o.sleeve]}" class="skl"/>` : '') +
      (o.sleeve === 'puff' ? '<path d="M156 42 L138 52 L141 56 L159 46 Z" class="sk2"/><path d="M134 22 Q142 30 144 40" class="skf"/>' : '') +
      (o.sleeve === 'balloon' ? '<path d="M172 104 L150 116 L153 124 L175 112 Z" class="sk2"/><path d="M150 60 Q156 80 156 100" class="skf"/>' : '') +
      (['full', 'threequarter', 'elbow'].includes(o.sleeve) ? '<path d="M136 46 Q140 54 141 62" class="skf"/><path d="M130 26 Q138 44 144 70" class="skh"/>' : '');
    sl = one + mirror(one);
  }
  const neckD = ({ round: 'M66 7 Q80 26 94 7', v: 'M64 7 L80 34 L96 7', deep: 'M62 7 Q80 44 98 7', boat: 'M58 7 Q80 14 102 7', band: 'M66 7 Q80 22 94 7', square: 'M64 7 L65 30 L95 30 L96 7', sweetheart: 'M64 7 Q63 30 72 30 Q78 30 80 34 Q82 30 88 30 Q97 30 96 7', high: 'M68 7 Q80 18 92 7' } as Record<string, string>)[o.neck] ?? 'M66 7 Q80 26 94 7';
  // the inside of the back neck shows through the neckline
  const nx = +(neckD.match(/^M(-?\d+(?:\.\d+)?)/)?.[1] ?? 66);
  let extra = `<path d="${neckD} Q80 11 ${nx} 7 Z" class="sk2"/><path d="${neckD}" class="skl"/>`;
  // seams, hem stitching, folds and highlights
  extra += '<path d="M58 6 L37 12 M102 6 L123 12" class="skl"/>';
  extra += `<path d="M${37 + w} 66 L${36 - fl + 1} ${lenY - 1} M${123 - w} 66 L${124 + fl - 1} ${lenY - 1}" class="skl"/>`;
  extra += `<path d="M${37 - fl} ${lenY - 3} Q80 ${lenY + 1} ${123 + fl} ${lenY - 3}" class="skl"/>`;
  extra += '<path d="M40 40 Q48 46 52 56 M120 40 Q112 46 108 56" class="skf"/>';
  extra += `<path d="M54 66 Q${52 - fl * 0.4} ${(66 + lenY) / 2} ${50 - fl * 0.6} ${lenY - 4} M106 66 Q${108 + fl * 0.4} ${(66 + lenY) / 2} ${110 + fl * 0.6} ${lenY - 4}" class="skf"/>`;
  extra += `<path d="M64 24 Q66 ${(24 + lenY) / 2} 62 ${lenY - 8}" class="skh"/>`;
  if (o.neck === 'band') extra += `<path d="M64 6 Q80 20 96 6 L95 0 Q80 12 65 0 Z" class="sk2"/><path d="M65 3 Q80 15 95 3" class="skl"/>`;
  if (o.opening === 'halfplacket' || o.neck === 'band') extra += `<path d="M78 18 L78 52 L82 52 L82 18" class="skl"/>` + [26, 34, 42].map((y) => `<circle cx="80" cy="${y}" r="1.5" class="skb"/>`).join('');
  if (o.opening === 'fronthooks') extra += `<path d="M80 30 L80 ${lenY}" class="skl"/>` + Array.from({ length: 5 }, (_, i) => `<circle cx="80" cy="${36 + i * 5}" r="1" class="skb"/>`).join('');
  if (o.slits === 'yes' && lenY > 100) extra += `<path d="M${124 + fl * 0.85} ${lenY - 24} L${124 + fl} ${lenY} M${36 - fl * 0.85} ${lenY - 24} L${36 - fl} ${lenY}" class="skl" stroke-width="2"/>`;
  if (o.darts === 'yes') extra += `<path d="M64 ${Math.min(lenY, 66)} L66 44 M96 ${Math.min(lenY, 66)} L94 44" class="skl"/>`;
  if (pep) extra += `<path d="M36 66 L124 66 L140 96 Q110 102 80 99 Q50 102 20 96 Z" class="sk"/><path d="M52 68 L46 97 M68 68 L66 99 M92 68 L94 99 M108 68 L114 97" class="skf"/><path d="M22 93 Q50 99 80 96 Q110 99 138 93" class="skl"/>`;
  return `${sl}<path d="${body}" class="sk"/>${extra}`;
}

export const TUNIC: Garment = {
  id: 'tunic' as Garment['id'], name: 'Kurta / kurti / blouse', viewBox: '-10 -14 180 214',
  measureKeys: ['chest', 'waist', 'hip', 'shoulder', 'neck', 'sleeve', 'bicep', 'height'],
  options: [
    { id: 'neck', label: 'Neck', crop: [44, -10, 72, 50], values: [{ id: 'round', label: 'Round' }, { id: 'v', label: 'V-neck' }, { id: 'band', label: 'Band collar' }, { id: 'deep', label: 'Deep' }, { id: 'boat', label: 'Boat' }, { id: 'square', label: 'Square' }, { id: 'sweetheart', label: 'Sweetheart' }, { id: 'high', label: 'High' }] },
    { id: 'sleeve', label: 'Sleeve', crop: [100, -4, 70, 130], values: [{ id: 'none', label: 'None' }, { id: 'short', label: 'Short' }, { id: 'elbow', label: 'Elbow' }, { id: 'threequarter', label: '¾' }, { id: 'full', label: 'Full' }, { id: 'puff', label: 'Puff' }, { id: 'balloon', label: 'Balloon' }, { id: 'bell', label: 'Bell' }] },
    { id: 'length', label: 'Length', values: [{ id: 'crop', label: 'Blouse' }, { id: 'hip', label: 'Hip' }, { id: 'thigh', label: 'Thigh' }, { id: 'knee', label: 'Knee' }, { id: 'calf', label: 'Calf' }] },
    { id: 'fit', label: 'Shape', values: [{ id: 'straight', label: 'Straight' }, { id: 'aline', label: 'A-line' }, { id: 'fitted', label: 'Fitted' }, { id: 'peplum', label: 'Peplum' }] },
    { id: 'slits', label: 'Side slits', values: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }] },
    { id: 'darts', label: 'Bust darts', values: [{ id: 'no', label: 'No' }, { id: 'yes', label: 'Yes' }] },
    { id: 'back', label: 'Back', values: [{ id: 'plain', label: 'Plain' }, { id: 'deepu', label: 'Deep U' }, { id: 'keyhole', label: 'Keyhole + ties' }] },
    { id: 'opening', label: 'Opening', values: [{ id: 'none', label: 'Pull-on' }, { id: 'halfplacket', label: 'Half placket' }, { id: 'fronthooks', label: 'Front hooks' }] },
  ],
  draft: tunicDraft, steps, supplies, sketch: (o) => tunicSketch(o),
};
