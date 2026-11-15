// "Don't miss any stitch": for every garment and every combination of options,
// every cut edge of every pattern piece must be sewn, finished or hemmed by some step,
// every seam must say how far from the edge it is sewn, and step references must be real.
import { describe, it, expect } from 'vitest';
import { DESIGNS, GARMENTS } from '../src/garments/index';
import { buildCtx } from '../src/engine/project';
import { SHIRT_SIZES, waistPreset } from '../src/engine/sizes';
import { makeSteps } from '../src/views/make-steps.js';
import { edgeKeys, uncovered, SEAM_STITCHES, detailChips, detailSay } from '../src/engine/sew';
import type { Step } from '../src/engine/types';
import { S } from '../src/core/state.js';

const M: Record<string, number> = { ...SHIRT_SIZES.L, ...waistPreset(34), height: 66, bicep: 13 };

function* combos(gid: string) {
  const groups = GARMENTS[gid].options;
  const rec = function* (i: number, acc: Record<string, string>): Generator<Record<string, string>> {
    if (i === groups.length) { yield { ...acc }; return; }
    for (const v of groups[i].values) yield* rec(i + 1, { ...acc, [groups[i].id]: v.id });
  };
  yield* rec(0, {});
}

function problems(pieces: ReturnType<typeof GARMENTS[string]['draft']>, steps: Step[]) {
  const keys = edgeKeys(pieces), ids = new Set(pieces.map((p) => p.id)), out: string[] = [];
  // plain rectangles (gathered skirt panels, strips) have no named edges: any side name is fine
  const rect = new Set(pieces.filter((p) => p.simple).map((p) => p.id));
  for (const k of uncovered(keys, steps)) out.push(`not sewn: ${k}`);
  steps.forEach((st, i) => {
    const d = st.d;
    if (!d) { if (i > 0 && i < steps.length - 2) out.push(`no sewing detail: "${st.cap}"`); return; }
    if (SEAM_STITCHES.includes(d.stitch) && d.sa == null && !d.on) out.push(`no distance from edge: "${st.cap}"`);
    for (const e of d.edges || []) {
      const [pid, name] = e.split(':');
      if (!ids.has(pid) || (name !== '*' && !rect.has(pid) && !keys.has(e))) out.push(`"${st.cap}" names a missing edge ${e}`);
    }
    for (const p of d.pieces || []) if (!ids.has(p)) out.push(`"${st.cap}" names a missing piece ${p}`);
  });
  return out;
}

describe('every stitch is covered', () => {
  for (const gid of Object.keys(GARMENTS).filter((g) => g !== 'pants')) {
    it(`${gid}: every edge of every piece, in every option combination`, () => {
      S.unit = 'in';
      const bad = new Map<string, string>();
      for (const o of combos(gid)) for (const p of problems(GARMENTS[gid].draft(M, o), GARMENTS[gid].steps(o))) if (!bad.has(p)) bad.set(p, JSON.stringify(o));
      expect([...bad].map(([p, o]) => `${p}  (${o})`)).toEqual([]);
    }, 120_000); // tens of thousands of option combinations
  }
  it('pants (animated assembly): every edge, in every option combination', () => {
    S.unit = 'in';
    const bad = new Map<string, string>();
    const d0 = DESIGNS.find((d) => d.garment === 'pants')!;
    for (const o of combos('pants')) {
      const ctx = buildCtx(d0.id, o, M, 'standard', 'T');
      const sew = makeSteps(ctx).filter((s: Step) => s.sec === 'Sew');
      for (const p of problems(ctx.pieces.map((g) => g.piece), sew)) if (!bad.has(p)) bad.set(p, JSON.stringify(o));
    }
    expect([...bad].map(([p, o]) => `${p}  (${o})`)).toEqual([]);
  }, 120_000);
});

describe('no sewing step repeats a picture', () => {
  for (const d of DESIGNS) {
    it(d.name, () => {
      S.unit = 'in';
      const sew = makeSteps(buildCtx(d.id, d.options, M, 'standard', 'T')).filter((s: Step) => s.sec === 'Sew');
      const pics = sew.map((s: Step) => s.svg());
      const dup = pics.map((p: string, i: number) => (pics.indexOf(p) !== i ? sew[i].cap : '')).filter(Boolean);
      expect(dup).toEqual([]);
    });
  }
});

describe('every sewing step is drawn on the real pieces', () => {
  for (const d of DESIGNS.filter((x) => x.garment !== 'pants')) {
    it(d.name, () => {
      S.unit = 'in';
      const ctx = buildCtx(d.id, d.options, M, 'standard', 'T');
      const sew = makeSteps(ctx).filter((s: Step) => s.sec === 'Sew');
      // every step except the finished garment shows at least one real piece (fabric drawn with the cloth filter)
      const generic = sew.slice(0, -1).filter((s: Step) => !/filter:url\(#cloth\)/.test(s.svg())).map((s: Step) => s.cap);
      expect(generic).toEqual([]);
    });
  }
});

describe('sewing detail is spoken and shown', () => {
  it('chips and speech read naturally in both units', () => {
    const d = { stitch: 'straight' as const, sa: 0.625, lock: true, press: 'Press the seams open' };
    S.unit = 'in';
    expect(detailChips(d)).toEqual(['⅝″ seam', 'Straight stitch 2.5', 'Lock both ends', 'Press the seams open']);
    expect(detailSay(d)).toBe('Straight stitch, length 2.5, five eighths of an inch from the edge. Lock the stitches at both ends. Press the seams open.');
    S.unit = 'cm';
    expect(detailChips(d)[0]).toBe('1.6 cm seam');
    S.unit = 'in';
  });
});
