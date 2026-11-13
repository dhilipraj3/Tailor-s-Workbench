// Skirts (A-line or gathered) and the dress/frock (tunic bodice + skirt joined at the waist).
import { Outline, type Allow } from '../engine/geometry';
import type { Garment, Measurements, Options, Piece, Step } from '../engine/types';
import { rectPiece } from './common';
import { draftTunic, tunicSketch, tunicLengthY } from './tunic';
import { W } from '../chapters/scenes-b.js';

const r4 = (x: number) => Math.round(x * 4) / 4;

/** Skirt length from the waist. */
export const skirtLen = (m: Measurements, len: string) => {
  const H = m.height || 64;
  return ({ knee: H * 0.36, midi: H * 0.46, maxi: H * 0.58 - 1 } as Record<string, number>)[len] ?? H * 0.36;
};

/** Skirt panels. ownWaist = skirt has its own waistband or casing (not joined to a bodice). */
export function draftSkirt(m: Measurements, style: string, length: number, waist: string, ownWaist: boolean): Piece[] {
  const Wst = m.waist, H = m.hip, child = (m.height || 64) < 52, hipD = child ? 5 : 8;
  const SA = 0.625, side: Allow = { sa: SA, extra: 0.75 }, hem: Allow = { sa: child ? 2 : 1.25 };
  const top: Allow = ownWaist && waist === 'elastic' ? { sa: 1.875 } : { sa: SA };
  const pieces: Piece[] = [];
  if (style === 'gathered') {
    const w = r4(Math.max(H, Wst) * 0.8 + 2), h = r4(length + top.sa + hem.sa);
    pieces.push(rectPiece('skirtF', 'Skirt front panel', w, h, 1), rectPiece('skirtB', 'Skirt back panel', w, h, 1));
  } else {
    const wQ = (waist === 'elastic' && ownWaist ? H + 2 : Wst + 1) / 4, hQ = (H + 2) / 4, flare = length * 0.22;
    for (const front of [true, false]) {
      const ol = new Outline([0, 0.5]).quad([wQ * 0.6, 0.5], [wQ + (front ? 0 : 0.25), 0], top, 'waist')
        .quad([hQ + 0.1, hipD * 0.4], [hQ + (front ? 0 : 0.25), hipD], side, 'side')
        .line([hQ + flare, length], side, 'side').quad([(hQ + flare) * 0.5, length + 0.6], [0, length + 0.5], hem, 'hem').close({ sa: 0, fold: true });
      pieces.push({ id: front ? 'skirtF' : 'skirtB', name: front ? 'Skirt front' : 'Skirt back', n: 1, fold: true, fabric: 'main', outline: ol, marks: [], grain: [[hQ * 0.4, 2], [hQ * 0.4, length - 2]] });
    }
  }
  if (ownWaist && waist === 'band') pieces.push(rectPiece('wband', 'Waistband', r4(Wst + 3.5), 3.5, 1));
  return pieces;
}

const skirtSteps = (o: Options): Step[] => {
  const out: Step[] = [W.edges];
  if (o.style === 'gathered') out.push(W.gather);
  out.push(o.waist === 'band' ? W.skirtSidesZip : W.skirtSides);
  out.push(o.waist === 'band' ? W.waistbandSkirt : W.elasticCasing);
  out.push(W.skirtHem, W.press, W.doneSkirt);
  return out;
};

function skirtSketch(o: Options) {
  const len = ({ knee: 70, midi: 100, maxi: 130 } as Record<string, number>)[o.length] ?? 70;
  const fl = o.style === 'gathered' ? len * 0.5 : len * 0.34;
  const gathers = o.style === 'gathered' ? Array.from({ length: 10 }, (_, i) => `<path d="M${20 + i * 6} 12 L${10 - fl * 0.6 + i * (10 + fl * 0.14)} ${len - 4}" class="skl" opacity=".55"/>`).join('') : '';
  const band = o.waist === 'band' ? `<path d="M18 0 L82 0 L82 9 L18 9 Z" class="sk2"/><circle cx="76" cy="4.5" r="1.6" class="skb"/>` : `<path d="M18 0 L82 0 L82 9 L18 9 Z" class="sk2"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${22 + i * 8} 1 L${23 + i * 8} 8" class="skl"/>`).join('')}`;
  return `<path d="M18 8 L82 8 Q${88 + fl * 0.2} ${len * 0.5} ${84 + fl} ${len} Q50 ${len + 6} ${16 - fl} ${len} Q${12 - fl * 0.2} ${len * 0.5} 18 8 Z" class="sk"/>${gathers}${band}`;
}

export const SKIRT: Garment = {
  id: 'skirt' as Garment['id'], name: 'Skirt', viewBox: '-50 -8 200 150',
  measureKeys: ['waist', 'hip', 'height'],
  options: [
    { id: 'style', label: 'Style', values: [{ id: 'aline', label: 'A-line' }, { id: 'gathered', label: 'Gathered' }] },
    { id: 'length', label: 'Length', values: [{ id: 'knee', label: 'Knee' }, { id: 'midi', label: 'Midi' }, { id: 'maxi', label: 'Maxi' }] },
    { id: 'waist', label: 'Waist', crop: [10, -6, 80, 30], values: [{ id: 'elastic', label: 'Elastic' }, { id: 'band', label: 'Band + zip' }] },
  ],
  draft: (m, o) => draftSkirt(m, o.style, skirtLen(m, o.length), o.waist, true),
  steps: skirtSteps,
  supplies: (m, o) => [
    { icon: 'thread', qty: '1', say: 'One spool of matching thread' },
    o.waist === 'band' ? { icon: 'zip', qty: '7″', say: 'One 7 inch zip and a hook' } : { icon: 'lining', qty: `${r4(m.waist - 2)}″`, say: `Waist elastic, about ${Math.round(m.waist - 2)} inches long` },
    { icon: 'needle', qty: '80/12', say: 'Machine needle size 80' },
  ],
  sketch: skirtSketch,
};

/* ---------- DRESS / FROCK: fitted bodice to the waist + skirt, back zip ---------- */
function dressDraft(m: Measurements, o: Options): Piece[] {
  const bodice = draftTunic(m, { neck: o.neck, sleeve: o.sleeve, length: 'waist', fit: 'fitted', slits: 'no', darts: 'no', opening: 'backzip' }, 0.75)
    .map((p) => (p.id === 'front' ? { ...p, id: 'bfront', name: 'Bodice front' } : p.id === 'back' ? { ...p, id: 'bback', name: 'Bodice back' } : p));
  const { waistY } = tunicLengthY(m, 'waist');
  void waistY;
  return [...bodice, ...draftSkirt(m, o.skirt, skirtLen(m, o.length), 'joined', false)];
}

function dressSteps(o: Options): Step[] {
  return [W.stay, W.edges, W.darts, W.shoulders, W.neckFacing, o.sleeve === 'none' ? W.armBinding : W.sleeves, W.sides,
    ...(o.sleeve === 'none' ? [] : [W.sleeveHem]), ...(o.skirt === 'gathered' ? [W.gather] : []), W.skirtSides, W.joinSkirt, W.backZip, W.skirtHem, W.press, W.doneDress];
}

export const DRESS: Garment = {
  id: 'dress' as Garment['id'], name: 'Dress / frock', viewBox: '-40 -14 240 250',
  measureKeys: ['chest', 'waist', 'hip', 'shoulder', 'neck', 'sleeve', 'bicep', 'height'],
  options: [
    { id: 'neck', label: 'Neck', crop: [44, -10, 72, 50], values: [{ id: 'round', label: 'Round' }, { id: 'v', label: 'V-neck' }, { id: 'boat', label: 'Boat' }] },
    { id: 'sleeve', label: 'Sleeve', values: [{ id: 'none', label: 'None' }, { id: 'short', label: 'Short' }, { id: 'elbow', label: 'Elbow' }] },
    { id: 'skirt', label: 'Skirt', values: [{ id: 'gathered', label: 'Gathered' }, { id: 'aline', label: 'A-line' }] },
    { id: 'length', label: 'Length', values: [{ id: 'knee', label: 'Knee' }, { id: 'midi', label: 'Midi' }, { id: 'maxi', label: 'Maxi' }] },
  ],
  draft: dressDraft, steps: dressSteps,
  supplies: () => [
    { icon: 'thread', qty: '1', say: 'One spool of matching thread' },
    { icon: 'zip', qty: '14″', say: 'One 14 inch zip for the back' },
    { icon: 'needle', qty: '80/12', say: 'Machine needle size 80' },
  ],
  sketch: (o) => {
    const len = ({ knee: 80, midi: 112, maxi: 144 } as Record<string, number>)[o.length] ?? 80;
    const fl = o.skirt === 'gathered' ? len * 0.55 : len * 0.38;
    const skirt = `<path d="M38 64 L122 64 Q${128 + fl * 0.2} ${64 + len * 0.5} ${124 + fl} ${64 + len} Q80 ${70 + len} ${36 - fl} ${64 + len} Q${32 - fl * 0.2} ${64 + len * 0.5} 38 64 Z" class="sk"/>` +
      (o.skirt === 'gathered' ? Array.from({ length: 12 }, (_, i) => `<path d="M${42 + i * 7} 66 L${36 - fl * 0.6 + i * ((88 + fl * 1.2) / 11)} ${60 + len}" class="skl" opacity=".5"/>`).join('') : '');
    return skirt + tunicSketch({ ...o, length: 'waist', fit: 'fitted' }, { lengthTo: 66 });
  },
};
