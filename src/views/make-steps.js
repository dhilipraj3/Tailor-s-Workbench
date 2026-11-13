// Builds the full "make it" step list for a project: buy → prepare → lay out → cut → sew.
import { S } from '../core/state.js';
import { store } from '../core/store.js';
import { H, ICON } from '../art/svg.js';
import { cutSteps } from '../chapters/cut.js';
import { TOOLICONS } from '../chapters/tools.js';
import { layoutFabric } from '../engine/project';
import { bottomWidth } from '../garments/trousers';

/** Old picture scenes read a few values from the shared state; keep them in sync with the project. */
export function syncLegacy(ctx) {
  const m = ctx.m;
  S.unit = store.unit;
  S.garment = ctx.garment.id === 'shirt' ? 'shirt' : 'trousers';
  S.fit = ctx.options.fit || 'regular';
  S.shirt = { chest: m.chest, neck: m.neck, shoulder: m.shoulder, sleeve: m.sleeve, length: m.shirtLength, wrist: m.wrist };
  S.pant = { waist: m.waist, hip: m.hip, rise: m.rise, outseam: m.outseam, bottom: bottomWidth(m, ctx.options) };
}

const SUP = {
  thread: TOOLICONS[7][2], interfacing: TOOLICONS[10][2], needle: TOOLICONS[8][2],
  buttons: (x, y) => ICON.button(x - 22, y - 8, 15) + ICON.button(x + 18, y - 12, 12) + ICON.button(x, y + 18, 13),
  zip: (x, y) => ICON.zip(x, y - 50, 100),
  hook: (x, y) => `<path d="M${x - 26} ${y} q0 -20 20 -20 h20" fill="none" stroke="#d3dadd" stroke-width="7"/><rect x="${x + 8}" y="${y - 8}" width="26" height="12" rx="4" fill="#d3dadd"/>`,
  lining: (x, y) => `<rect x="${x - 50}" y="${y - 30}" width="100" height="60" class="lin"/>`,
};

export function layoutScene(ctx, widthIn, animate = true) {
  const lay = layoutFabric(ctx, widthIn), isS = ctx.garment.id === 'shirt';
  const s = Math.min(740 / lay.lengthIn, 330 / lay.halfIn), ox = 30, oy = 110;
  const fab = `<rect x="${ox}" y="${oy}" width="${(lay.lengthIn * s).toFixed(1)}" height="${(lay.halfIn * s).toFixed(1)}" class="${isS ? 'fw' : 'pw'}"/>` +
    `<path d="M${ox} ${oy} L${ox + lay.lengthIn * s} ${oy}" class="foldl"/>`;
  const pcs = lay.placed.map((p, i) => {
    const d = 'M' + p.poly.map(([x, y]) => `${(ox + x * s).toFixed(1)} ${(oy + y * s).toFixed(1)}`).join(' L') + ' Z';
    const shape = `<path d="${d}" class="paperpc"/>`;
    return animate ? H.move(shape, 0, -380, 0.2 + i * 0.12, 0.8) : shape;
  }).join('');
  const label = H.word(ox + 50, oy - 16, 'FOLD', 0) +
    H.chip(640, 60, `${lay.metres} m`, animate ? 0.4 : 0) + H.chip(470, 60, `${widthIn}″ wide`, animate ? 0.2 : 0);
  return { svg: fab + pcs + label, lay };
}

export function makeSteps(ctx) {
  syncLegacy(ctx);
  const old = cutSteps(), w = [36, 44, 58].map((x) => [x, layoutFabric(ctx, x).metres]);
  const sup = ctx.garment.supplies(ctx.m, ctx.options);
  const steps = [
    { cap: 'Buy the fabric', say: () => `For this design, buy ${w[2][1]} metres of wide fabric, ${w[2][0]} inches. Or ${w[1][1]} metres if it is ${w[1][0]} inches wide, or ${w[0][1]} metres if it is ${w[0][0]} inches wide.`,
      svg: () => w.map(([wd, m], i) => { const x = 130 + i * 230, h = wd * 3.4, y = 420 - h, c = ctx.garment.id === 'shirt' ? ['fr', 'fw'] : ['pr', 'pw'];
        return H.pop(`<rect x="${x}" y="${y}" width="120" height="${h}" rx="8" class="${c[0]}"/><ellipse cx="${x + 60}" cy="${y}" rx="60" ry="12" class="${c[1]}"/>`, 0.2 + i * 0.3) + H.chip(x + 60, y - 40, wd + '″ wide', 0.5 + i * 0.3) + H.chip(x + 60, 460, m + ' m', 0.8 + i * 0.3); }).join('') },
    { cap: 'Get the extras', say: () => 'You also need: ' + sup.map((x) => x.say).join(', ') + '.',
      svg: () => { const g = 760 / sup.length; return sup.map((it, i) => { const x = 20 + g * (i + 0.5), fn = SUP[it.icon];
        return H.pop(`<g class="tapp" data-say="${it.say}"><rect x="${x - g / 2 + 6}" y="130" width="${g - 12}" height="230" rx="18" class="tilebg"/>${fn ? fn(x, 230) : ''}</g>`, 0.2 + i * 0.25) + H.word(x, 330, it.qty, 0.4 + i * 0.25); }).join(''); } },
    old[2], old[3],
    { cap: 'Lay out the pieces', say: 'Lay the paper pattern pieces on the folded fabric like this. Pieces marked "on fold" go against the fold. Keep every grain arrow straight along the fabric.', svg: () => layoutScene(ctx, 58).svg },
    old[5], old[6], old[7], old[8],
  ];
  return [...steps, ...ctx.garment.steps(ctx.options)];
}
