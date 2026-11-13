import { describe, it, expect } from 'vitest';
import { S } from '../src/core/state.js';
import { chapters } from '../src/chapters/index.js';
import { stageSvg } from '../src/art/svg.js';

const sayOf = (st) => (typeof st.say === 'function' ? st.say() : st.sayFn ? st.sayFn() : st.say);

describe('every picture step renders', () => {
  for (const garment of ['shirt', 'trousers']) for (const unit of ['in', 'cm']) {
    it(`${garment} in ${unit}`, () => {
      S.garment = garment; S.unit = unit;
      let count = 0;
      for (const ch of chapters()) ch.steps.forEach((st, i) => {
        const svg = stageSvg(st.svg());
        const label = `${ch.id} #${i + 1} ${st.cap}`;
        expect(svg, label).not.toMatch(/NaN|undefined/);
        expect(sayOf(st), label).not.toMatch(/NaN|undefined/);
        expect(st.cap.split(' ').length, `${label}: caption should stay short`).toBeLessThanOrEqual(5);
        count++;
      });
      expect(count).toBeGreaterThan(70);
    });
  }
});
