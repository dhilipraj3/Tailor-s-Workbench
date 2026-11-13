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

export interface MeasureDef { key: string; label: string; say: string; group: 'top' | 'bottom' }
export const MEASURES: MeasureDef[] = [
  { key: 'chest', label: 'Chest', group: 'top', say: 'Chest. Put the tape around the fullest part of the chest, under the arms. Keep it level.' },
  { key: 'neck', label: 'Neck', group: 'top', say: 'Neck. Put the tape around the bottom of the neck, with one finger under it.' },
  { key: 'shoulder', label: 'Shoulders', group: 'top', say: 'Shoulders. Measure across the back, from one shoulder bone to the other.' },
  { key: 'sleeve', label: 'Sleeve', group: 'top', say: 'Sleeve. Measure from the shoulder bone down the arm to the wrist bone.' },
  { key: 'shirtLength', label: 'Shirt length', group: 'top', say: 'Shirt length. From the bone at the back of the neck down to where the shirt should end.' },
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
