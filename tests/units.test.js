import { describe, it, expect, beforeEach } from 'vitest';
import { S } from '../src/core/state.js';
import { f, sn } from '../src/core/units.js';

describe('measurement formatting', () => {
  beforeEach(() => { S.unit = 'in'; });
  it('shows tape-measure fractions in inches', () => {
    expect(f(10.5)).toBe('10½″');
    expect(f(0.375)).toBe('⅜″');
    expect(f(3)).toBe('3″');
  });
  it('speaks fractions in words', () => {
    expect(sn(10.5)).toBe('10 and a half inches');
    expect(sn(0.75)).toBe('three quarters of an inch');
  });
  it('converts to centimetres', () => {
    S.unit = 'cm';
    expect(f(1)).toBe('2.5 cm');
    expect(f(10)).toBe('25.4 cm');
  });
});
