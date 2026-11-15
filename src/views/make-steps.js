// Builds the full "make it" step list for a project: buy → prepare → lay out → cut → sew.
import { S } from '../core/state.js';
import { store } from '../core/store.js';
import { H, ICON } from '../art/svg.js';
import { cutSteps } from '../chapters/cut.js';
import { TOOLICONS } from '../chapters/tools.js';
import { layoutFabric } from '../engine/project';
import { bottomWidth } from '../garments/trousers';
import { markSteps } from './mark-steps.js';
import { sketchSvg } from './common.js';
import { closestPhoto } from './photos.js';
import { techniqueScene } from '../art/technique.js';
import { pieceScene, keySvg, fabricColors, runs } from '../assembly/closeup.js';
import { f as fmt, sn } from '../core/units.js';
import { howStrip } from '../art/howto.js';
import { lessonsFor } from '../art/lessons.js';
import SEW_PHOTOS from '../sew-photos.json';

/** file name of a sewing step's photo: <garment>--<caption in lower case with dashes> */
export const sewPhotoName = (garment, cap) => `${garment}--${String(cap).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
import { assemblePants } from '../assembly/pants.js';

const ASSEMBLY = { pants: assemblePants };

/** Old picture scenes read a few values from the shared state; keep them in sync with the project. */
export function syncLegacy(ctx) {
  const m = ctx.m;
  S.unit = store.unit;
  S.garment = ['shirt', 'tunic', 'dress', 'skirt'].includes(ctx.garment.id) ? 'shirt' : 'trousers';
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
  const lay = layoutFabric(ctx, widthIn), isS = ['shirt', 'tunic', 'dress', 'skirt'].includes(ctx.garment.id);
  const cls = isS ? 'fw' : 'pw', hasOpen = lay.openStart != null, openW = hasOpen ? lay.widthIn - 0.5 : lay.halfIn;
  const s = Math.min(740 / lay.lengthIn, 330 / openW), ox = 30, oy = 110, foldEnd = hasOpen ? lay.openStart - 1 : lay.lengthIn;
  // folded part (two layers, fold on top), then — if needed — open single-layer fabric for very wide pieces
  const hasFold = foldEnd > 1;
  const fab = (hasFold ? `<rect x="${ox}" y="${oy}" width="${(foldEnd * s).toFixed(1)}" height="${(lay.halfIn * s).toFixed(1)}" class="${cls}"/>` +
    `<path d="M${ox} ${oy} L${ox + foldEnd * s} ${oy}" class="foldl"/>` : '') +
    (hasOpen ? `<rect x="${(ox + foldEnd * s).toFixed(1)}" y="${oy}" width="${((lay.lengthIn - foldEnd) * s).toFixed(1)}" height="${(openW * s).toFixed(1)}" class="${cls}"/>` +
      `<text x="${(ox + (foldEnd + 1) * s).toFixed(1)}" y="${oy - 16}" class="wordt" style="text-anchor:start;font-size:18px">OPEN</text>` : '');
  const pcs = lay.placed.map((p, i) => {
    const d = 'M' + p.poly.map(([x, y]) => `${(ox + x * s).toFixed(1)} ${(oy + y * s).toFixed(1)}`).join(' L') + ' Z';
    const shape = `<path d="${d}" class="paperpc"/>`;
    return animate ? H.move(shape, 0, -380, 0.2 + i * 0.12, 0.8) : shape;
  }).join('');
  const label = (hasFold ? H.word(ox + 50, oy - 16, 'FOLD', 0) : '') +
    H.chip(640, 60, `${lay.metres} m`, animate ? 0.4 : 0) + H.chip(470, 60, `${widthIn}″ wide`, animate ? 0.2 : 0);
  return { svg: fab + pcs + label, lay };
}

const STAR = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L2.9 -3.1 L10 -3.1 L4.3 1.2 L6.5 8.1 L0 4 L-6.5 8.1 L-4.3 1.2 L-10 -3.1 L-2.9 -3.1 Z" fill="#f2c230"/>`;

/** The finished garment on the dark spotlight, with a floor shadow and a few stars. */
function finishedScene(ctx) {
  const art = sketchSvg(ctx.design.garment, ctx.options, null, 'hero', ctx.design.color).replace('<svg ', '<svg x="215" y="18" width="370" height="440" ');
  return `<defs><radialGradient id="finBg" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#3b3b3a"/><stop offset=".55" stop-color="#232322"/><stop offset="1" stop-color="#141414"/></radialGradient>
    <radialGradient id="finFloor"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
    <rect width="800" height="500" fill="url(#finBg)"/><ellipse cx="400" cy="462" rx="170" ry="14" fill="url(#finFloor)"/>` +
    H.fade(art, 0.15) +
    // the design's product photo, when one has been added and the options are the design's own (a missing file draws nothing)
    (closestPhoto(ctx.design, ctx.options)?.exact ? H.fade(`<image href="${closestPhoto(ctx.design, ctx.options).src}" x="200" y="0" width="400" height="500" preserveAspectRatio="xMidYMid meet"/>`, 0.15) : '') +
    [[150, 120, 2.2], [650, 100, 1.8], [690, 330, 2.4], [120, 360, 1.9], [590, 220, 1.4], [210, 230, 1.3]].map(([x, y, s], i) => H.pop(STAR(x, y, s), 0.5 + i * 0.2)).join('');
}

export function makeSteps(ctx, widthIn = 58) {
  syncLegacy(ctx);
  const old = cutSteps(), w = [36, 44, 58].map((x) => [x, layoutFabric(ctx, x).metres]);
  const sup = ctx.garment.supplies(ctx.m, ctx.options);
  const steps = [
    { sec: 'Buy', cap: 'Buy the fabric', say: () => `For this design, buy ${w[2][1]} metres of wide fabric, ${w[2][0]} inches. Or ${w[1][1]} metres if it is ${w[1][0]} inches wide, or ${w[0][1]} metres if it is ${w[0][0]} inches wide.`,
      svg: () => w.map(([wd, m], i) => { const x = 130 + i * 230, h = wd * 3.4, y = 420 - h, c = ['shirt', 'tunic', 'dress', 'skirt'].includes(ctx.garment.id) ? ['fr', 'fw'] : ['pr', 'pw'];
        return H.pop(`<rect x="${x}" y="${y}" width="120" height="${h}" rx="8" class="${c[0]}"/><ellipse cx="${x + 60}" cy="${y}" rx="60" ry="12" class="${c[1]}"/>`, 0.2 + i * 0.3) + H.chip(x + 60, y - 40, wd + '″ wide', 0.5 + i * 0.3) + H.chip(x + 60, 460, m + ' m', 0.8 + i * 0.3); }).join('') },
    { sec: 'Buy', cap: 'Get the extras', say: () => 'You also need: ' + sup.map((x) => x.say).join(', ') + '.',
      svg: () => { const g = 760 / sup.length; return sup.map((it, i) => { const x = 20 + g * (i + 0.5), fn = SUP[it.icon];
        return H.pop(`<g class="tapp" data-say="${it.say}"><rect x="${x - g / 2 + 6}" y="130" width="${g - 12}" height="230" rx="18" class="tilebg"/>${fn ? fn(x, 230) : ''}</g>`, 0.2 + i * 0.25) + H.word(x, 330, it.qty, 0.4 + i * 0.25); }).join(''); } },
    { ...old[2], sec: 'Prepare' }, { ...old[3], sec: 'Prepare' },
    { sec: 'Prepare', cap: 'Where each piece goes', say: () => `This is how all the pieces fit on ${widthIn} inch fabric, folded in half along its length. Next we chalk each piece in its place. If you printed the paper pattern instead, lay the paper pieces like this and pin them.`, svg: () => layoutScene(ctx, widthIn).svg },
    ...markSteps(ctx, widthIn),
    { ...old[8], sec: 'Mark & cut' },
  ];
  // continuous assembly from the real pieces where available, otherwise the picture steps
  const sew = (ASSEMBLY[ctx.garment.id]?.(ctx)) || ctx.garment.steps(ctx.options, { m: ctx.m, pieces: ctx.pieces.map((g) => g.piece) });
  // the last step shows the finished garment itself: this design, these options, this colour
  // A picture used by an earlier step is replaced by a close-up of this step's own action,
  // so no two sewing steps show the same animation.
  const seen = new Set(), col = ctx.design.color || ({ shirt: '#a8c0e0', trousers: '#6a7380' })[ctx.garment.id] || '#c9bfa9';
  // Steps that name the pieces or edges they sew are drawn on the real pieces in this person's size
  // (the pyjama family already has its own animation built from the real pieces).
  const real = !ASSEMBLY[ctx.garment.id];
  // A step that names no pieces (fold, pin, turn, press, trim, buttonholes…) works on the same pieces
  // as the nearest step that does: the next one first (you fold before you sew), else the one before.
  const refsOf = (st) => (st?.d?.edges?.length || st?.d?.pieces?.length ? st.d : null);
  const ahead = (i) => { for (let k = i + 1; k < sew.length; k++) if (refsOf(sew[k])) return refsOf(sew[k]); return null; };
  const back = (i) => { for (let k = i - 1; k >= 0; k--) if (refsOf(sew[k])) return refsOf(sew[k]); return null; };
  // preparing (fold, pin, mark, ease, gather, iron on) uses the pieces of the step it prepares; anything else (trim, clip,
  // understitch, turn, close, press) uses the pieces of the step it follows
  const near = (i) => (/^(fold|pin|mark|ease|gather|iron|tack|cut|make|prepare|press the [a-z]+s?$)/i.test(sew[i].cap) ? ahead(i) || back(i) : back(i) || ahead(i));
  // the final press works on every main piece
  const allMain = { pieces: ctx.pieces.filter((g) => g.piece.fabric === 'main' && !g.piece.simple).slice(0, 3).map((g) => g.piece.id) };
  // Dart steps get this person's dart size in their words: width at the side, length, and how far below the armhole.
  const front = ctx.pieces.find((g) => g.piece.id === 'front')?.piece, R = front ? runs(front) : {};
  const dartRun = (R.dart || [])[0], sideStart = (R.side || [])[0]?.[0];
  const dartWords = dartRun && sideStart ? (() => {
    const a = dartRun[0], b = dartRun[dartRun.length - 1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = (u, v) => Math.hypot(v[0] - u[0], v[1] - u[1]);
    const tip = dartRun.reduce((q, p) => (L(p, m) > L(q, m) ? p : q), a);
    return { show: `Each dart is ${fmt(L(a, b))} wide at the side seam and ${fmt(L(m, tip))} long, starting ${fmt(L(sideStart, a))} below the armhole.`,
      say: `Each dart is ${sn(L(a, b))} wide at the side seam and ${sn(L(m, tip))} long, starting ${sn(L(sideStart, a))} below the armhole.` };
  })() : null;
  const withDart = (st) => (dartWords && /^(fold|sew) the darts$/i.test(st.cap) ? {
    ...st,
    text: () => `${typeof (st.text ?? st.say) === 'function' ? (st.text ?? st.say)() : (st.text ?? st.say)} ${dartWords.show}`,
    say: () => `${typeof st.say === 'function' ? st.say() : st.say} ${dartWords.say}`,
  } : st);
  const out = sew.map(withDart).map((st, i) => {
    const repeat = seen.has(st.svg); seen.add(st.svg);
    if (real && i < sew.length - 1) {
      // A1: steps without sewing detail (the final press) are drawn on the real pieces too
      const d = st.d || { stitch: 'none', press: 'Press with a damp cloth' }, refs = st.d ? near(i) : allMain;
      // the real piece on the left; the three-picture How strip for the technique on the right
      const how = howStrip({ ...st, d }, col, ctx.garment.id);
      const scene = (key) => pieceScene(ctx, d, col, st.cap, refs, { key }) || techniqueScene(d, col, st.cap);
      // with a How strip the pieces shrink to the left; the key stays full size along the bottom
      return { ...st, sec: 'Sew', svg: () => (how ? `<g transform="translate(4 56) scale(.62)">${scene(false)}</g>` + how + keySvg(fabricColors(col), '#fbf7ee', 16, 476) : scene(true)) };
    }
    // the pyjama family keeps its own animation, shrunk to the left beside the How strip
    if (!real && i < sew.length - 1) {
      const how = howStrip(st, col, ctx.garment.id), own = st.svg;
      if (how) return { ...st, sec: 'Sew', svg: () => `<g transform="translate(4 56) scale(.62)">${own()}</g>` + how };
    }
    return repeat && st.d ? { ...st, sec: 'Sew', svg: () => techniqueScene(st.d, col, st.cap) } : { ...st, sec: 'Sew' };
  });
  // A real photo of the step, when one has been added (public/img/sew/<garment>--<step>.jpg), becomes the main
  // picture; the person's own pieces, with the edge and seam width, stay in a small inset.
  for (let i = 0; i < out.length - 1; i++) {
    const name = sewPhotoName(ctx.garment.id, out[i].cap);
    if (!SEW_PHOTOS.includes(name)) continue;
    const drawn = out[i].svg;
    out[i] = { ...out[i], photo: `img/sew/${name}.jpg`, svg: () => `<image href="img/sew/${name}.jpg" x="0" y="0" width="800" height="500" preserveAspectRatio="xMidYMid slice"/>` +
      `<g transform="translate(16 296)"><rect width="248" height="188" rx="14" fill="rgba(16,16,15,.82)" stroke="rgba(255,255,255,.18)"/>` +
      `<svg x="6" y="6" width="236" height="152" viewBox="0 0 800 500">${drawn()}</svg>` +
      `<text x="124" y="176" text-anchor="middle" class="howt">YOUR PIECE</text></g>` };
  }
  // every step knows which technique lessons it needs ("Learn this first" in the player)
  for (let i = 0; i < out.length - 1; i++) out[i] = { ...out[i], lessons: lessonsFor(out[i], ctx.garment.id) };
  const last = out[out.length - 1];
  if (last) out[out.length - 1] = { ...last, svg: () => finishedScene(ctx) };
  return [...steps, ...out];
}
