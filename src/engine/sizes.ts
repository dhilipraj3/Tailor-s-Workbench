import type { Measurements } from './types';

// Typical ready-made menswear body measurements (inches).
export const SHIRT_SIZES: Record<string, Measurements> = {
  S: { chest: 38, neck: 15, shoulder: 17, sleeve: 24.5, shirtLength: 29, wrist: 6.5 },
  M: { chest: 40, neck: 15.5, shoulder: 17.5, sleeve: 25, shirtLength: 29.5, wrist: 7 },
  L: { chest: 42, neck: 16, shoulder: 18, sleeve: 25.5, shirtLength: 30, wrist: 7 },
  XL: { chest: 44, neck: 16.5, shoulder: 18.5, sleeve: 26, shirtLength: 30.5, wrist: 7.5 },
  XXL: { chest: 46, neck: 17.5, shoulder: 19, sleeve: 26.5, shirtLength: 31, wrist: 7.5 },
};
export const WAIST_SIZES = [28, 30, 32, 34, 36, 38, 40, 42, 44];

const r4 = (x: number) => Math.round(x * 4) / 4;
export function waistPreset(w: number): Measurements {
  return { waist: w, hip: w + 6, rise: r4((w + 6) / 8 + 5.5), outseam: r4(40 + (w - 28) * 0.125) };
}

/* ---------- who a profile is for, and their ready-made sizes ---------- */
export type Kind = 'man' | 'woman' | 'child';

const WOMEN: Record<string, number[]> = {
  //       bust waist hip shoulder neck sleeve wrist height
  XS: [32, 26, 35, 14, 13, 22, 5.75, 62],
  S: [34, 28, 37, 14.5, 13.5, 22.5, 6, 63],
  M: [36, 30, 39, 15, 14, 23, 6.25, 64],
  L: [38, 32, 41, 15.5, 14.5, 23.25, 6.5, 64],
  XL: [40, 34, 43, 16, 15, 23.5, 6.75, 65],
  XXL: [42, 36, 45, 16.5, 15.5, 23.75, 7, 65],
};
const KIDS: Record<string, number[]> = {
  //  age: chest waist hip shoulder neck sleeve wrist height
  '2': [21, 20, 22, 9, 10.5, 12, 5, 35],
  '4': [23, 21, 24, 10, 11, 14, 5, 41],
  '6': [25, 22, 26, 10.5, 11.5, 16, 5.5, 46],
  '8': [27, 23, 28, 11.5, 12, 18, 5.5, 50],
  '10': [29, 24, 30, 12, 12.5, 20, 6, 55],
  '12': [31, 25, 32, 13, 13, 22, 6, 60],
};
export const SIZE_CHOICES: Record<Kind, string[]> = { man: Object.keys(SHIRT_SIZES), woman: Object.keys(WOMEN), child: Object.keys(KIDS) };

/** Full measurement set for a ready-made size (men also choose a trouser waist). */
export function presetFor(kind: Kind, size: string, waist = 34): Measurements {
  if (kind === 'man') {
    const t = SHIRT_SIZES[size] || SHIRT_SIZES.L;
    return { ...t, ...waistPreset(waist), height: 68, bicep: r4(t.chest * 0.32) };
  }
  const row = (kind === 'woman' ? WOMEN[size] || WOMEN.M : KIDS[size] || KIDS['6']);
  const [chest, w, hip, shoulder, neck, sleeve, wrist, height] = row;
  const child = kind === 'child';
  return {
    chest, waist: w, hip, shoulder, neck, sleeve, wrist, height,
    bicep: r4(chest * (child ? 0.34 : 0.3)),
    shirtLength: r4(height * (child ? 0.4 : 0.38)),
    rise: r4(hip / 8 + (child ? 3.5 : 5.75)),
    outseam: r4(height * 0.6 - 1),
  };
}

export interface MeasureDef { key: string; label: string; say: string; group: 'top' | 'bottom' }
export const MEASURES: MeasureDef[] = [
  { key: 'height', label: 'Height', group: 'top', say: 'Height. Stand straight against a wall without shoes, and measure from the floor to the top of the head.' },
  { key: 'bicep', label: 'Upper arm', group: 'top', say: 'Upper arm. Put the tape around the widest part of the upper arm.' },
  { key: 'chest', label: 'Chest / bust', group: 'top', say: 'Chest. Put the tape around the fullest part of the chest, under the arms. Keep it level.' },
  { key: 'neck', label: 'Neck', group: 'top', say: 'Neck. Put the tape around the bottom of the neck, with one finger under it.' },
  { key: 'shoulder', label: 'Shoulders', group: 'top', say: 'Shoulders. Measure across the back, from one shoulder bone to the other.' },
  { key: 'sleeve', label: 'Sleeve', group: 'top', say: 'Sleeve. Measure from the shoulder bone down the arm to the wrist bone.' },
  { key: 'shirtLength', label: 'Shirt / top length', group: 'top', say: 'Shirt length. From the bone at the back of the neck down to where the shirt should end.' },
  { key: 'wrist', label: 'Wrist', group: 'top', say: 'Wrist. Put the tape around the wrist bone.' },
  { key: 'waist', label: 'Waist', group: 'bottom', say: 'Waist. Put the tape where you wear your trousers. Snug, not tight.' },
  { key: 'hip', label: 'Hip', group: 'bottom', say: 'Hip. Put the tape around the fullest part of your bottom, with feet together.' },
  { key: 'rise', label: 'Seat depth', group: 'bottom', say: 'Seat depth. Sit on a flat chair. Measure down your side from the waist to the chair.' },
  { key: 'outseam', label: 'Trouser length', group: 'bottom', say: 'Trouser length. Measure down the side from the waist to where the trousers should end.' },
];

/** How much extra cloth to keep for future adjustment (multiplies every seam's extra). */
export const EXTRA_LEVELS = [
  { id: 'none', label: 'None', scale: 0, say: 'No extra cloth. Only normal sewing space.' },
  { id: 'standard', label: 'Standard', scale: 1, say: 'Standard extra cloth, so a tailor can loosen it a little later.' },
  { id: 'generous', label: 'Generous', scale: 1.5, say: 'Generous extra cloth, for more room to let it out later.' },
  { id: 'growing', label: 'Growing child', scale: 2, say: 'Lots of extra cloth, for a child who is still growing.' },
];
