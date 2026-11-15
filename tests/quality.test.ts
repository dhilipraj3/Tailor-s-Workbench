// Test plan sections 1, 2, 3 and 6 (docs/TEST-PLAN.md): descriptions, matching seams, supplies, picture geometry.
// Each design is checked with its own options and with every single option value changed once.
import { describe as group, it, expect } from 'vitest';
import { DESIGNS, GARMENTS } from '../src/garments/index';
import { buildCtx } from '../src/engine/project';
import { SHIRT_SIZES, waistPreset } from '../src/engine/sizes';
import { makeSteps } from '../src/views/make-steps.js';
import { describe as describeDesign } from '../src/views/design.js';
import { runs } from '../src/assembly/closeup.js';
import type { Step } from '../src/engine/types';
import { closestPhoto } from '../src/views/photos.js';
import { S } from '../src/core/state.js';

const M: Record<string, number> = { ...SHIRT_SIZES.L, ...waistPreset(34), height: 66, bicep: 13 };
const say = (s: Step) => String(typeof (s.text ?? s.say) === 'function' ? (s.text as any ?? s.say)() : (s.text ?? s.say));

/** a design's own options, then each option value changed once */
function variants(d: (typeof DESIGNS)[number]) {
  const out = [{ ...d.options }];
  for (const g of GARMENTS[d.garment].options) for (const v of g.values) if (d.options[g.id] !== v.id) out.push({ ...d.options, [g.id]: v.id });
  return out;
}
const len = (pts: number[][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const edgeLen = (piece: any, name: string) => ((runs(piece) as any)[name] || []).reduce((s: number, r: number[][]) => s + len(r), 0);

group('descriptions read as sentences', () => {
  for (const d of DESIGNS) it(d.name, () => {
    for (const o of variants(d)) {
      const t = describeDesign(d, o);
      expect(t, JSON.stringify(o)).toMatch(/^[A-Z].{24,}\.$/);
      expect(t, JSON.stringify(o)).not.toMatch(/ ,|,,|, \.|with \.|with and|  | and \.|undefined|null/);
    }
  });
});

group('pictures follow each part of an edge separately', () => {
  it('a sleeve has two separate underarm edges', () => {
    const p = GARMENTS.tunic.draft(M, { ...DESIGNS.find((x) => x.id === 'aline-kurti')!.options }).find((x) => x.id === 'sleeve')!;
    expect((runs(p) as any).underarm.length).toBe(2);
  });
  it('a front with darts has its side split round the dart', () => {
    const p = GARMENTS.tunic.draft(M, { ...DESIGNS.find((x) => x.id === 'aline-kurti')!.options, darts: 'yes' }).find((x) => x.id === 'front')!;
    expect((runs(p) as any).side.length).toBe(2);
  });
});

group('everything a step uses is on the shopping list', () => {
  for (const d of DESIGNS) it(d.name, () => {
    S.unit = 'in';
    for (const o of variants(d)) {
      const ctx = buildCtx(d.id, o, M, 'standard', 'T');
      const sup = ctx.garment.supplies(ctx.m, ctx.options), has = (icon: string, word = '') => sup.some((x) => x.icon === icon || (word && x.say.toLowerCase().includes(word)));
      const sew: Step[] = makeSteps(ctx).filter((s: Step) => s.sec === 'Sew');
      const where = JSON.stringify(o);
      if (sew.some((s) => s.d?.stitch === 'button')) expect(has('buttons'), `buttons ${where}`).toBe(true);
      if (sew.some((s) => s.d?.foot === 'Zipper foot')) expect(has('zip'), `zip ${where}`).toBe(true);
      if (sew.some((s) => s.d?.stitch === 'fuse')) expect(has('interfacing', 'interfacing') || has('interfacing', 'interlining'), `interfacing ${where}`).toBe(true);
      if (sew.some((s) => /\bhooks?\b/i.test(say(s)))) expect(has('hook'), `hooks ${where}`).toBe(true);
      if (sew.some((s) => /\belastic\b/i.test(say(s)))) expect(has('lining', 'elastic'), `elastic ${where}`).toBe(true);
      if (ctx.pieces.some((g) => g.piece.fabric === 'lining' && /lining/i.test(g.piece.name))) expect(sup.some((x) => /lining/i.test(x.say)), `lining ${where}`).toBe(true);
    }
  });
});

group('edges sewn together match', () => {
  for (const d of DESIGNS.filter((x) => ['tunic', 'shirt'].includes(x.garment))) it(d.name, () => {
    for (const o of variants(d)) {
      const ps = GARMENTS[d.garment].draft(M, o), get = (id: string) => ps.find((p) => p.id === id);
      const front = get('front'), back = get('back'), sleeve = get('sleeve'), yoke = get('yoke'), where = JSON.stringify(o);
      // shoulders: the back may be up to 3/8 inch longer (eased in), never shorter
      const fs = edgeLen(front, 'shoulder'), bs = edgeLen(yoke || back, 'shoulder');
      expect(bs - fs, `shoulder ${where}`).toBeGreaterThanOrEqual(-0.13);
      expect(bs - fs, `shoulder ${where}`).toBeLessThanOrEqual(0.4);
      if (sleeve) {
        // sleeve top against the armhole: eased in up to 1.75 inch; puff and balloon are gathered, so they may be much longer
        const arm = 2 * (edgeLen(front, 'armhole') + edgeLen(back, 'armhole') + (yoke ? edgeLen(yoke, 'armhole') : 0));
        const cap = 2 * edgeLen(sleeve, 'cap') / 2;
        const gathered = ['puff', 'balloon'].includes(o.sleeve);
        expect(cap, `sleeve top shorter than armhole ${where}`).toBeGreaterThanOrEqual(arm / 2 - 0.25);
        if (!gathered) expect(cap, `sleeve top far longer than armhole ${where}`).toBeLessThanOrEqual(arm / 2 + 1.75);
      }
    }
  });
});

group('the customiser picks the closest photo', () => {
  const k = DESIGNS.find((x) => x.id === 'aline-kurti')!;
  it('shows the design photo for its own options', () => {
    expect(closestPhoto(k, k.options)).toMatchObject({ src: 'img/designs/aline-kurti.jpg', exact: true, diff: [] });
  });
  it('says what differs when a visible option changes', () => {
    const p = closestPhoto(k, { ...k.options, neck: 'band' })!;
    expect(p.exact).toBe(false);
    expect(p.diff).toEqual([{ group: 'Neck', photo: 'Round', yours: 'Band collar' }]);
  });
  it('ignores options you cannot see in a front photo', () => {
    expect(closestPhoto(k, { ...k.options, back: 'keyhole', darts: 'no' })!.exact).toBe(true);
  });
});
