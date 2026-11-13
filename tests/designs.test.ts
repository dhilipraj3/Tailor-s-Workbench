import { describe, it, expect } from 'vitest';
import { DESIGNS, GARMENTS } from '../src/garments/index';
import { buildCtx, layoutFabric, sheetSvg } from '../src/engine/project';
import { area } from '../src/engine/geometry';
import { SHIRT_SIZES, waistPreset } from '../src/engine/sizes';
import { makeSteps } from '../src/views/make-steps.js';
import { stageSvg } from '../src/art/svg.js';
import { S } from '../src/core/state.js';

const M = { ...SHIRT_SIZES.L, ...waistPreset(34) };
const sayOf = (st: any) => (typeof st.say === 'function' ? st.say() : st.say);

function* combos(gid: string) {
  const groups = GARMENTS[gid].options;
  const rec = function* (i: number, acc: Record<string, string>): Generator<Record<string, string>> {
    if (i === groups.length) { yield { ...acc }; return; }
    for (const v of groups[i].values) yield* rec(i + 1, { ...acc, [groups[i].id]: v.id });
  };
  yield* rec(0, {});
}

describe('every design in the catalogue', () => {
  for (const d of DESIGNS) {
    it(`${d.name}: pattern, fabric and steps are complete`, () => {
      S.unit = 'in';
      const ctx = buildCtx(d.id, d.options, M, 'standard', 'Test');
      expect(ctx.pieces.length).toBeGreaterThan(1);
      const lay = layoutFabric(ctx, 58);
      expect(lay.placed.length).toBeGreaterThan(0);
      expect(lay.metres).toBeGreaterThan(0.4);
      expect(lay.metres).toBeLessThan(6);
      const steps = makeSteps(ctx);
      expect(steps.length).toBeGreaterThan(15);
      for (const [i, st] of steps.entries()) {
        const svg = stageSvg(st.svg());
        expect(svg, `${d.id} step ${i + 1}`).not.toMatch(/NaN|undefined/);
        expect(sayOf(st), `${d.id} step ${i + 1}`).not.toMatch(/NaN|undefined/);
        expect(st.cap.split(' ').length, `${d.id} "${st.cap}" caption ≤ 5 words`).toBeLessThanOrEqual(5);
      }
      expect(sheetSvg(ctx, {})).not.toMatch(/NaN/);
      // every main-fabric piece is chalked on the fabric, with a start point and a cut step
      for (const g of ctx.pieces.filter((x) => x.piece.fabric === 'main')) expect(steps.some((st) => st.cap === 'Start: ' + g.piece.name), g.piece.name + ' has marking steps').toBe(true);
      for (const w of [36, 44]) for (const st of makeSteps(ctx, w)) expect(stageSvg(st.svg())).not.toMatch(/NaN|undefined/);
    });
  }
});

describe('every option combination drafts cleanly', () => {
  for (const gid of Object.keys(GARMENTS)) {
    it(`${gid}: all combinations, all extra-cloth levels`, () => {
      let n = 0;
      const design = DESIGNS.find((d) => d.garment === gid)!;
      for (const o of combos(gid)) for (const extra of ['none', 'growing']) {
        const ctx = buildCtx(design.id, o, M, extra);
        for (const g of ctx.pieces) {
          const all = [...g.stitch, ...g.sa, ...g.cut].flat();
          expect(all.every(Number.isFinite), `${gid} ${JSON.stringify(o)} ${g.piece.id}`).toBe(true);
          if (!g.piece.simple) expect(Math.abs(area(g.cut)) + 1e-6, `${g.piece.id} cut line encloses stitch line`).toBeGreaterThanOrEqual(Math.abs(area(g.stitch)));
        }
        n++;
      }
      expect(n).toBeGreaterThan(10);
    }, 180000);
  }
});

describe('sizes and options change the pattern', () => {
  const width = (ctx: ReturnType<typeof buildCtx>, id: string) => { const g = ctx.pieces.find((p) => p.piece.id === id)!; return g.box[2] - g.box[0]; };
  it('XXL front is wider than S front', () => {
    const d = DESIGNS[0];
    expect(width(buildCtx(d.id, d.options, { ...M, ...SHIRT_SIZES.XXL }, 'standard'), 'front'))
      .toBeGreaterThan(width(buildCtx(d.id, d.options, { ...M, ...SHIRT_SIZES.S }, 'standard'), 'front'));
  });
  it('"Growing child" leaves more cloth than "None"', () => {
    const d = DESIGNS.find((x) => x.garment === 'trousers')!;
    expect(width(buildCtx(d.id, d.options, M, 'growing'), 'tback')).toBeGreaterThan(width(buildCtx(d.id, d.options, M, 'none'), 'tback') + 1);
  });
  it('half sleeves need less fabric than full sleeves', () => {
    const d = DESIGNS[0], full = buildCtx(d.id, d.options, M, 'standard'), half = buildCtx(d.id, { ...d.options, sleeve: 'half' }, M, 'standard');
    expect(layoutFabric(half, 58).metres).toBeLessThanOrEqual(layoutFabric(full, 58).metres);
  });
  it('mandarin collar has a band and no collar leaf', () => {
    const ids = buildCtx('band-collar-shirt', DESIGNS[3].options, M, 'standard').pieces.map((p) => p.piece.id);
    expect(ids).toContain('band'); expect(ids).not.toContain('leaf');
  });
});
