import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { makePdf } from '../src/export/pdf';
import { buildCtx } from '../src/engine/project';
import { DESIGNS } from '../src/garments/index';
import { SHIRT_SIZES, waistPreset } from '../src/engine/sizes';

const M = { ...SHIRT_SIZES.L, ...waistPreset(34) };

describe('printable pattern PDF', () => {
  for (const id of ['formal-shirt', 'formal-trousers']) {
    it(`${id}: A4 tiles and one big sheet`, async () => {
      const d = DESIGNS.find((x) => x.id === id)!;
      const ctx = buildCtx(d.id, d.options, M, 'standard', 'Me');
      const a4 = await PDFDocument.load(await makePdf(ctx, 'a4'));
      expect(a4.getPageCount()).toBeGreaterThan(4);
      const p1 = a4.getPage(1).getSize();
      expect(p1.width).toBeCloseTo(595.28, 1);
      const full = await PDFDocument.load(await makePdf(ctx, 'full'));
      expect(full.getPageCount()).toBe(2);
      const big = full.getPage(1).getSize();
      expect(big.height / 72).toBeGreaterThan(40); // trouser leg or shirt pieces at true size
    }, 20000);
  }
});
