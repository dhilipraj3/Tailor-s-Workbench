import { describe, it, expect } from 'vitest';
import { Outline, offset, bbox, area } from '../src/engine/geometry';

const square = (allow: any, left: any = allow) =>
  new Outline([0, 0]).line([10, 0], allow).line([10, 10], allow).line([0, 10], allow).close(left);

describe('seam allowance and extra cloth', () => {
  it('sewing-space line sits exactly one allowance outside the stitch line', () => {
    const b = bbox(offset(square({ sa: 1 }), 'sa'));
    b.forEach((v, i) => expect(v).toBeCloseTo([-1, -1, 11, 11][i], 6));
  });

  it('cut line adds the extra cloth on top of the sewing space', () => {
    const b = bbox(offset(square({ sa: 0.5, extra: 1 }), 'cut'));
    expect(b[0]).toBeCloseTo(-1.5, 6);
    expect(b[2]).toBeCloseTo(11.5, 6);
  });

  it('extra cloth scales with the chosen level, and level 0 means none', () => {
    expect(bbox(offset(square({ sa: 0.5, extra: 1 }), 'cut', 2))[2]).toBeCloseTo(12.5, 6);
    expect(bbox(offset(square({ sa: 0.5, extra: 1 }), 'cut', 0))[2]).toBeCloseTo(10.5, 6);
  });

  it('a fold edge gets no allowance at all', () => {
    const b = bbox(offset(square({ sa: 1 }, { sa: 1, fold: true }), 'cut'));
    expect(b[0]).toBeCloseTo(0, 6);
    expect(b[2]).toBeCloseTo(11, 6);
  });

  it('works the same whichever way round the outline is drawn', () => {
    const ccw = new Outline([0, 0]).line([0, 10], { sa: 1 }).line([10, 10], { sa: 1 }).line([10, 0], { sa: 1 }).close({ sa: 1 });
    expect(Math.abs(area(offset(ccw, 'sa')))).toBeCloseTo(144, 6);
  });

  it('a tapering extra goes from its start value to its end value', () => {
    const o = new Outline([0, 0]).line([10, 0], { sa: 0 }).line([10, 10], { sa: 0, extra: [2, 0] }).line([0, 10], { sa: 0 }).close({ sa: 0 });
    const pts = offset(o, 'cut');
    const xs = pts.filter((p) => p[0] > 10.01).map((p) => p[0]);
    expect(Math.max(...xs)).toBeGreaterThan(1.9 + 10 - 0.2);
  });
});
