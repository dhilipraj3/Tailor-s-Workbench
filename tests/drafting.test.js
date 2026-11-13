import { describe, it, expect, beforeEach } from 'vitest';
import { S, SHIRT_SIZES, pantPreset } from '../src/core/state.js';
import { shirtDraft, pantDraft } from '../src/drafting/pattern.js';

describe('pattern drafting', () => {
  beforeEach(() => { S.unit = 'in'; S.fit = 'regular'; S.shirt = { ...SHIRT_SIZES.L }; S.pant = pantPreset(34); });

  it('drafts 4 shirt pieces and 3 trouser pieces', () => {
    expect(shirtDraft().map((p) => p.name)).toEqual(['Back', 'Front', 'Sleeve', 'Collar & cuff']);
    expect(pantDraft().map((p) => p.name)).toEqual(['Trouser front', 'Trouser back', 'Waistband']);
  });

  it('back chest width = (chest + 5″ ease) / 4 + ¼″ for regular fit', () => {
    const back = shirtDraft()[0];
    const E = back.steps.find((s) => s.cap === 'Underarm point E').els.find((e) => e[0] === 'p')[2];
    expect(E[0]).toBeCloseTo((42 + 5) / 4 + 0.25, 5);
  });

  it('size 34 trousers use hip 40 and front hip quarter of 10″', () => {
    expect(S.pant.hip).toBe(40);
    const front = pantDraft()[0];
    const F = front.steps.find((s) => s.cap === 'Front middle F').els.find((e) => e[0] === 'p')[2];
    expect(F[0]).toBe(10);
  });

  it('bigger sizes make bigger patterns', () => {
    S.shirt = { ...SHIRT_SIZES.S }; const small = shirtDraft()[0].box[2];
    S.shirt = { ...SHIRT_SIZES.XXL }; const big = shirtDraft()[0].box[2];
    expect(big).toBeGreaterThan(small);
  });
});
