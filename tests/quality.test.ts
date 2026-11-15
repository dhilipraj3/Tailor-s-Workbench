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

group('steps that place, size or space something say how much, in this person\'s sizes', () => {
  const NEED = /^(Fold the facing strip|Sew the strip on|Join the shoulders|Roll and sew shoulders|Fold the strips|Mark the buttonholes|Pin in the sleeve|Sew in the sleeves|Sew on the sleeves|Gather the sleeve top|Hem the sleeves|Hem the bell sleeves|Hem the short sleeves|Sides down to slits|Hem the bottom|Sew the band pieces|Sew on the hooks|Gather the peplum|Sew the keyhole facing|Make the tie strings|Fold the binding|Sew on the pocket|Sew on both pockets|Stand on the neckline|Band on the neckline|Sew the collar|Cut the sleeve slit|Sew the cuff pairs|Fold the big placket|Bind the back edge|Fold the back pleat|Fold the darts|Sew the darts)$/;
  const SIZE = /inch|inches|centimetre|″|[0-9] cm/;
  for (const d of DESIGNS.filter((x) => ['tunic', 'shirt'].includes(x.garment))) it(d.name, () => {
    S.unit = 'in';
    for (const o of variants(d)) {
      const sew: Step[] = makeSteps(buildCtx(d.id, o, M, 'standard', 'T')).filter((s: Step) => s.sec === 'Sew');
      const missing = sew.filter((s) => NEED.test(s.cap) && !SIZE.test(say(s))).map((s) => s.cap);
      expect(missing, JSON.stringify(o)).toEqual([]);
    }
  });
});

group('a finished top can be put on, and its front and back match', () => {
  for (const d of DESIGNS.filter((x) => x.garment === 'tunic')) it(d.name, async () => {
    const { neckOpening, headOpening } = await import('../src/garments/tunic');
    for (const size of [M, { ...M, chest: 34, neck: 13.5, waist: 28, hip: 37, height: 62 }, { ...M, chest: 26, neck: 11.5, waist: 23, hip: 27, height: 48, shoulder: 11, sleeve: 16 }]) {
      for (const o of variants(d)) {
        const ps = GARMENTS.tunic.draft(size, o), where = JSON.stringify(o);
        const key = ps.find((p) => p.id === 'keyface'), keyDepth = key ? Math.max(...key.outline.points().map((p) => p[1])) - 2 : 0;
        // no keyhole unless chosen; a pull-on neckline must fit the head on its own
        if (o.back !== 'keyhole') expect(key, `no keyhole added ${where}`).toBeUndefined();
        const placket = o.opening === 'halfplacket' || (o.neck === 'band' && o.opening === 'none');
        const extra = 2 * keyDepth + (placket ? 18 : 0) + (o.opening === 'fronthooks' ? 99 : 0);
        expect(neckOpening(ps) + extra, `goes over the head ${where}`).toBeGreaterThanOrEqual(headOpening(size));
        const f = ps.find((p) => p.id === 'front')!, b = ps.find((p) => p.id === 'back')!;
        // the shoulder seam stays a real shoulder
        expect(edgeLen(f, 'shoulder'), `shoulder length ${where}`).toBeGreaterThanOrEqual(2.5);
        const hipWidth = (p: typeof f) => Math.max(...p.outline.points().filter((q) => q[1] > (p.outline.points().reduce((a, c) => Math.max(a, c[1]), 0)) - 1).map((q) => Math.abs(q[0])));
        // a cropped blouse ends at the bust, where the front is meant to be wider; every longer top must match at the hem
        if (o.length !== 'crop') expect(Math.abs(hipWidth(f) - hipWidth(b)), `front and back hem width ${where}`).toBeLessThanOrEqual(0.13);
      }
    }
  });
});
