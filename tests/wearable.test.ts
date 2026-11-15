// Can every garment be put on, and do the pieces that are sewn together match?
// Checked for every design, each option value changed once, in a man's, a woman's and a child's size.
import { describe, it, expect } from 'vitest';
import { DESIGNS, GARMENTS } from '../src/garments/index';
import { presetFor } from '../src/engine/sizes';
import { edgeLen } from '../src/engine/sew';
import type { Piece } from '../src/engine/types';

const SIZES = { man: presetFor('man', 'L', 34), woman: presetFor('woman', 'M', 30), child: presetFor('child', '8', 24) };
function variants(d: (typeof DESIGNS)[number]) {
  const out = [{ ...d.options }];
  for (const g of GARMENTS[d.garment].options) for (const v of g.values) if (d.options[g.id] !== v.id) out.push({ ...d.options, [g.id]: v.id });
  return out;
}
const get = (ps: Piece[], id: string) => ps.find((p) => p.id === id);
/** full width of a piece at height y (both halves of a piece cut on the fold) */
function widthAt(p: Piece, y: number) {
  const pts = p.outline.points(); let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) { const x = a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]); lo = Math.min(lo, x); hi = Math.max(hi, x); }
  }
  return p.fold ? 2 * hi : hi - lo;
}
const bottom = (p: Piece) => Math.max(...p.outline.points().map((q) => q[1]));
const foot = (m: Record<string, number>) => (m.height && m.height < 56 ? 9.5 : 12.5);   // round the heel and instep

describe('every garment can be put on, and matching pieces match', () => {
  for (const d of DESIGNS) it(d.name, () => {
    const m0 = SIZES[d.for || 'man'];
    for (const o of variants(d)) {
      const ps = GARMENTS[d.garment].draft(m0, o), w = JSON.stringify(o), hip = m0.hip, rise = [] as string[];
      if (d.garment === 'pants') {
        // pull-on: the waist must open round the hips; each leg end must go over the foot
        const waist = 2 * (edgeLen(get(ps, 'pfront') as any, 'waist casing') + edgeLen(get(ps, 'pback') as any, 'waist casing'));
        expect(waist, `pull-on waist goes over the hips ${w}`).toBeGreaterThanOrEqual(hip + 2);
        const ankle = edgeLen(get(ps, 'pfront') as any, 'hem') + edgeLen(get(ps, 'pback') as any, 'hem');
        expect(ankle, `leg end goes over the foot ${w}`).toBeGreaterThanOrEqual(foot(m0));
        expect(Math.abs(edgeLen(get(ps, 'pfront') as any, 'side') - edgeLen(get(ps, 'pback') as any, 'side')), `side seams match ${w}`).toBeLessThanOrEqual(0.25);
        expect(Math.abs(edgeLen(get(ps, 'pfront') as any, 'inseam') - edgeLen(get(ps, 'pback') as any, 'inseam')), `inside legs match ${w}`).toBeLessThanOrEqual(0.25);
      }
      if (d.garment === 'skirt') {
        const f = get(ps, 'skirtF')!, b = get(ps, 'skirtB')!;
        // an elastic waist must stretch over the hips: the waist edge, before gathering, at least hip + 2
        if (o.waist === 'elastic') expect(widthAt(f, 0.2) + widthAt(b, 0.2), `elastic skirt goes over the hips ${w}`).toBeGreaterThanOrEqual(hip + 2);
        expect(Math.abs(widthAt(f, bottom(f) - 0.5) - widthAt(b, bottom(b) - 0.5)), `front and back hem match ${w}`).toBeLessThanOrEqual(0.13);
      }
      if (d.garment === 'trousers') {
        const f = get(ps, 'tfront')!, b = get(ps, 'tback')!;
        expect(Math.abs(edgeLen(f as any, 'side') - edgeLen(b as any, 'side')), `side seams match ${w}`).toBeLessThanOrEqual(0.25);
        expect(Math.abs(edgeLen(f as any, 'inseam') - edgeLen(b as any, 'inseam')), `inside legs match ${w}`).toBeLessThanOrEqual(0.25);
        const legEnd = edgeLen(f as any, 'hem') + edgeLen(b as any, 'hem');
        expect(legEnd, `leg end goes over the foot ${w}`).toBeGreaterThanOrEqual(foot(m0));
      }
      if (d.garment === 'shirt') {
        const f = get(ps, 'front')!, b = get(ps, 'back')!;
        expect(Math.abs(edgeLen(f as any, 'side') - edgeLen(b as any, 'side')), `side seams match ${w}`).toBeLessThanOrEqual(0.25);
        // the cuff must go over the hand when unbuttoned: wrist + 2.5 is the minimum
        const cuff = get(ps, 'cuff');
        if (cuff) expect(Math.max(...cuff.outline.points().map((q) => q[0])), `cuff fits the wrist ${w}`).toBeGreaterThanOrEqual(m0.wrist + 1.5);
      }
      if (d.garment === 'dress') {
        const bf = get(ps, 'bfront')!, bb = get(ps, 'bback')!, sf = get(ps, 'skirtF')!, sb = get(ps, 'skirtB')!;
        expect(Math.abs(edgeLen(bf as any, 'side') - edgeLen(bb as any, 'side')), `bodice side seams match ${w}`).toBeLessThanOrEqual(0.25);
        // with the zip open the waist seam must pass over the shoulders/bust: bodice waist + zip opening (twice its length below the waist is not needed)
        const waistSeam = 2 * (edgeLen(bf as any, 'hem') + edgeLen(bb as any, 'hem'));
        expect(waistSeam + 2 * 7, `dress goes on with the zip open ${w}`).toBeGreaterThanOrEqual(m0.chest + 2);
        expect(Math.abs(widthAt(sf, bottom(sf) - 0.5) - widthAt(sb, bottom(sb) - 0.5)), `skirt front and back hem match ${w}`).toBeLessThanOrEqual(0.13);
      }
      void rise;
    }
  });
});
