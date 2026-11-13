// Continuous assembly of the easy pants (pyjama, shorts, palazzo, churidar, salwar) from the real pieces.
import { H, ICON, f, fabricColors, pieceShape, place, D, fabric, flipOver, glow, pinsAlong, sewAlong, zoom } from './kit.js';
import { sn } from '../core/units.js';
import { figure } from '../art/svg.js';
import { FIG } from '../chapters/measure.js';

const rev = (a) => [...a].reverse();

export function assemblePants(ctx) {
  const front = pieceShape(ctx, 'pfront'), back = pieceShape(ctx, 'pback');
  if (!front || !back) return null;
  const o = ctx.options, col = fabricColors(ctx.design.color || '#9aa3ad');
  const elastic = o.waist !== 'drawstring', name = ctx.design.name.toLowerCase();

  /* ---- table layout: each leg = back (as drafted) with its front opened out beside it, sharing the side-seam line ---- */
  const minY = Math.min(front.box[1], back.box[1]), maxY = Math.max(front.box[3], back.box[3]), legH = maxY - minY;
  const fW = front.box[2], bW = back.box[2], seamPad = Math.max(-front.box[0], -back.box[0]);
  const s = Math.min(440 / legH, 370 / (fW + bW + 2 * seamPad));
  const X0 = 412 + (fW + seamPad) * s, oy = 30 + (440 - legH * s) / 2 - minY * s;
  const R = { back: place(X0, oy, s), open: place(X0, oy, s, true), over: place(X0, oy, s) };
  const mirror = (m) => (p) => { const q = m(p); return [800 - q[0], q[1]]; };
  const L = { back: mirror(R.back), open: mirror(R.open), over: mirror(R.over) };
  const legs = [[R, X0], [L, 800 - X0]];
  const gap = 2 * 1.4 * s; // cut pieces lie side by side, seam allowances not yet overlapping
  const shiftOut = (m, dir) => (p) => { const q = m(p); return [q[0] + dir * gap, q[1]]; };
  const E = (shape, k) => shape.edges[k] || [];
  const sideB = E(back, 'side'), inB = E(back, 'inseam'), crB = E(back, 'crotch'), crF = E(front, 'crotch'), inF = E(front, 'inseam');

  // states of the table, so each step starts where the previous one ended
  const backs = (side = 'right') => legs.map(([M]) => fabric(back, M.back, col, side, { label: 'BACK' })).join('');
  const frontsOpen = (side = 'right', apart = false) => legs.map(([M], i) => fabric(front, apart ? shiftOut(M.open, i ? 1 : -1) : M.open, col, side, { label: 'FRONT' })).join('');
  const frontsOver = () => legs.map(([M]) => fabric(front, M.over, col, 'wrong')).join('');
  const thread = (pts, M) => `<path d="${D(pts, M, false)}" fill="none" stroke="#f7f3ea" stroke-width="2.2" stroke-dasharray="6 4" filter="url(#thread)"/>`;
  const sideSeams = () => legs.map(([M]) => thread(sideB, M.back)).join('');
  const inSeams = () => legs.map(([M]) => thread(inB, M.back)).join('');

  const steps = [];
  const step = (cap, say, svg) => steps.push({ sec: 'Sew', cap, say, svg });

  step('Your cut pieces', `Here are your four cut pieces: two fronts and two backs. Lay each front next to its back, good side up, with the side edges touching, like this.`, () =>
    legs.map(([M], i) => H.pop(fabric(back, M.back, col, 'right', { label: 'BACK' }), 0.2 + i * 0.3) + H.pop(fabric(front, shiftOut(M.open, i ? 1 : -1), col, 'right', { label: 'FRONT' }), 0.35 + i * 0.3)).join(''));

  step('Stop fraying', 'Sew a zigzag along the side and inside-leg edges of all four pieces, so the threads do not come loose.', () => {
    let out = backs() + frontsOpen('right', true), d = 0.3;
    for (const [M, , ] of legs) for (const [pts, m] of [[sideB, M.back], [inB, M.back], [E(front, 'side'), shiftOut(M.open, M === L ? 1 : -1)], [inF, shiftOut(M.open, M === L ? 1 : -1)]]) {
      const st = pts.filter((_, i) => i % 3 === 0).map(m);
      if (st.length > 1) { out += H.stitch(H.zz(st, 4, 9), d, 1.1, 'foot', 'stitch solid'); d += 1.15; }
    }
    return out;
  });

  if (o.pockets === 'side') {
    step('Add the pocket bags', 'Sew a pocket bag to the side edge of each front and each back, just below the waist. Press the bags outwards.', () => {
      let out = backs() + frontsOpen('right', true);
      legs.forEach(([M], i) => {
        const top = sideB.slice(0, Math.max(3, Math.floor(sideB.length * 0.35)));
        const a = M.back(top[top.length - 1]), b = M.back(top[0]), w = 62 * (i ? -1 : 1);
        const bag = `<path d="M${a[0]} ${b[1] + 30} L${a[0]} ${b[1] + 150} Q${a[0] - w} ${b[1] + 170} ${a[0] - w} ${b[1] + 60} Z" fill="#ebe6d8" stroke="rgba(0,0,0,.25)"/>`;
        out += H.move(bag, -w * 2, 0, 0.3 + i * 0.4, 0.9) + H.stitch(`M${a[0]} ${b[1] + 34} L${a[0]} ${b[1] + 146}`, 1.6 + i * 1.6, 1.4);
      });
      return out;
    });
  }

  step('Pin the side seams', 'Flip each front over onto its back, good sides together, like closing a book. The two side edges, glowing orange, must lie exactly on top of each other. Pin them.', () =>
    backs() + legs.map(([M, ox], i) => flipOver((side) => fabric(front, M.over, col, side), ox, 0.3 + i * 0.2, 1.4, (i ? 1 : -1) * gap, 'right', 'wrong')).join('') +
    legs.map(([M]) => glow(sideB, M.back, 1.9)).join('') +
    legs.map(([M], i) => pinsAlong(sideB, M.back, 2.4 + i * 0.5, 5, i ? -1 : 1)).join(''));

  step('Sew the side seams', `Sew each side seam from the waist down to the bottom, keeping the fabric edge on the ${f(0.625)} guide line. Lock the stitches at both ends.`, () =>
    backs() + frontsOver() + zoom(0.625, 0.2, col) + legs.map(([M], i) => sewAlong(rev(sideB), M.back, 0.8 + i * 3.4, 3)).join(''));

  step('Open and press', 'Open each front out again. Press the side seams flat, then press them open with the iron.', () =>
    backs() + legs.map(([M, ox], i) => flipOver((side) => fabric(front, M.open, col, side, { label: side === 'right' ? 'FRONT' : '' }), ox, 0.3 + i * 0.2, 1.3, 0, 'wrong', 'right')).join('') +
    H.fade(sideSeams(), 1.6) + legs.map(([M]) => { const a = M.back(sideB[sideB.length - 1]); return H.iron(a[0] + 40, a[1] + 70, 2.2, 0, 220, 2); }).join(''));

  step('Pin the inside legs', 'Fold each front back over onto its back. Now the inside-leg edges, glowing blue, lie on top of each other from the crotch to the bottom. Pin them.', () =>
    backs() + sideSeams() + legs.map(([M, ox], i) => flipOver((side) => fabric(front, M.over, col, side), ox, 0.3 + i * 0.2, 1.3, 0, 'right', 'wrong')).join('') +
    legs.map(([M]) => glow(inB, M.back, 1.8, '#4fb3ff') + glow(inF, M.over, 1.8, '#4fb3ff')).join('') +
    legs.map(([M], i) => pinsAlong(inB, M.back, 2.4 + i * 0.5, 5, i ? 1 : -1)).join(''));

  step('Sew the inside legs', `Sew each inside-leg seam from the bottom up to the crotch, ${f(0.625)} from the edge. Each leg is now a tube.`, () =>
    backs() + frontsOver() + zoom(0.625, 0.2, col) + legs.map(([M], i) => sewAlong(rev(inB), M.back, 0.8 + i * 3.2, 2.8)).join(''));

  step('Slide one leg inside', 'Turn the left leg right side out. Slide it inside the right leg, which stays inside out, so the good sides face each other. Line up the curved crotch edges and the inside-leg seams.', () => {
    const [Lm] = legs[1], [Rm] = legs[0];
    const leftWrong = fabric(back, Lm.back, col, 'wrong') + fabric(front, Lm.over, col, 'wrong');
    const leftRight = fabric(back, Lm.back, col, 'right') + fabric(front, Lm.over, col, 'right');
    const shift = 2 * X0 - 800; // left leg slides across onto the right leg
    return fabric(back, Rm.back, col, 'wrong') + fabric(front, Rm.over, col, 'wrong') +
      H.out(leftWrong, 0.3) + // turned right side out…
      H.move(`<g transform="translate(${shift.toFixed(1)} 0)" opacity=".6">${H.fade(leftRight, 0.3)}</g>`, -shift, 0, 1.6, 1.4) + // …and slid inside
      H.arrow(`M${(400 - X0 + 400) / 2 + 300} 470 L${X0 + 40} 470`, 1.2);
  });

  step('Sew the crotch seam', `Sew the curved crotch seam all the way round, from the front waist, under the crotch, up to the back waist. Sew it a second time just next to the first line, because this seam takes the most strain.`, () => {
    const [Rm] = legs[0];
    const u = [...crF.map(Rm.over), ...rev(crB).map(Rm.back)];
    const ud = 'M' + u.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
    return fabric(back, Rm.back, col, 'wrong') + fabric(front, Rm.over, col, 'wrong') +
      glow(crF, Rm.over, 0.3, '#c77dff') + glow(crB, Rm.back, 0.3, '#c77dff') + zoom(0.625, 0.4, col, 'Sew twice') +
      H.stitch(ud, 1, 3) + H.stitch(ud.replace(/(\d+\.\d) (\d+\.\d)/g, (m, a, b) => `${(+a - 3).toFixed(1)} ${b}`), 4.3, 3);
  });

  /* ---- front view of the finished shape (real front pieces, joined at the centre front) ---- */
  const cfX = front.edges.crotch?.[0]?.[0] ?? fW * 0.8;
  const s2 = Math.min(400 / legH, 330 / (2 * cfX + 2));
  const oy2 = 50 + (420 - legH * s2) / 2 - minY * s2;
  const FR = place(400 - cfX * s2, oy2, s2), FL = (p) => { const q = FR(p); return [800 - q[0], q[1]]; };
  // Each leg hangs slightly outwards from the centre-front waist, so the legs part below the crotch like real trousers.
  const waistY = FR([0, front.box[1]])[1], casingPx = (o.waist === 'drawstring' ? 2 : 1.5) * s2, wsa = (o.waist === 'drawstring' ? 2.375 : 1.875) * s2;
  const hemIn = (E(front, 'inseam').slice(-1)[0] || [cfX, legH])[0];
  const tilt = Math.min(9, Math.max(2.5, (Math.atan2((hemIn - cfX) + 1.2, legH) * 180) / Math.PI));
  const legR = (inner) => `<g transform="rotate(${tilt.toFixed(2)} 400 ${waistY.toFixed(1)})">${inner}</g>`;
  const legLft = (inner) => `<g transform="rotate(${(-tilt).toFixed(2)} 400 ${waistY.toFixed(1)})">${inner}</g>`;
  const frontView = (side = 'right') => legR(fabric(front, FR, col, side, { stitchLine: false })) + legLft(fabric(front, FL, col, side, { stitchLine: false })) +
    `<path d="M400 ${(waistY + 4).toFixed(1)} L400 ${FR([0, ctx.m.rise * 0.8])[1].toFixed(1)}" stroke="${col.edge}" stroke-width="1.2" opacity=".5"/>`;
  const leftX = FR([front.box[0], 0])[0] - 2, rightX = 800 - leftX;
  const hemPts = E(front, 'hem'), hemSa = (o.style === 'churidar' ? 0.75 : 1.25) * s2;

  step('Turn it right side out', `Turn the ${name} right side out. Now it looks like the finished shape. Next we finish the waist and the bottoms.`, () =>
    H.out(fabric(back, legs[0][0].back, col, 'wrong') + fabric(front, legs[0][0].over, col, 'wrong'), 0.2) + H.fade(frontView(), 0.6));

  step(elastic ? 'Make the elastic casing' : 'Make the drawstring casing',
    elastic ? `Fold the top edge down to the inside along the fold line, about ${sn(1.875)}, and sew close to the lower edge. Leave a two inch gap at the back for the elastic.`
      : `First make two small buttonholes at the centre front, in the casing. Then fold the top edge down to the inside, about ${sn(2.375)}, and sew close to the lower edge.`,
    () => frontView() +
      (elastic ? '' : H.stitch(`M388 ${waistY + casingPx * 0.4} L388 ${waistY + casingPx * 0.75} M412 ${waistY + casingPx * 0.4} L412 ${waistY + casingPx * 0.75}`, 0.2, 1, 'foot', 'stitch solid')) +
      H.fade(`<rect x="${leftX}" y="${waistY}" width="${rightX - leftX}" height="${wsa}" fill="rgba(255,157,59,.35)" stroke="#ff9d3b" stroke-width="2" stroke-dasharray="5 4"/>`, elastic ? 0.3 : 1.4) +
      H.arrow(`M${rightX + 24} ${waistY + 4} Q ${rightX + 50} ${waistY + wsa / 2} ${rightX + 24} ${waistY + wsa}`, elastic ? 0.8 : 1.8) +
      H.stitch(`M${leftX + 2} ${waistY + casingPx} L${rightX - 2} ${waistY + casingPx}`, elastic ? 1.4 : 2.4, 3.2));

  step(elastic ? 'Thread the elastic' : 'Thread the drawstring',
    elastic ? 'Pin a safety pin to one end of the elastic. Push it through the casing all the way round and out of the gap. Overlap the two ends by one inch and sew them together firmly. Then sew the gap closed.'
      : 'Pin a safety pin to one end of the drawstring. Push it in through one buttonhole, all the way round the casing, and out of the other. Tie a knot at each end so it cannot slip back in.',
    () => {
      const y = waistY + casingPx / 2;
      return frontView() + `<path d="M${leftX + 2} ${waistY + casingPx} L${rightX - 2} ${waistY + casingPx}" stroke="#f7f3ea" stroke-width="2" stroke-dasharray="6 4"/>` +
        H.draw(`M${elastic ? leftX + 10 : 412} ${y} L${rightX - 10} ${y}`, elastic ? 'elasticband' : 'stringband', 0.4, 3) +
        H.follow(`M${elastic ? leftX + 10 : 412} ${y} L${rightX - 10} ${y}`, 0.4, 3, `<g><circle r="7" fill="none" stroke="#d9dde1" stroke-width="3"/><path d="M-7 0 L-20 0" stroke="#d9dde1" stroke-width="3"/></g>`, false) +
        (elastic ? H.stitch(`M${leftX + 30} ${y - 5} L${leftX + 30} ${y + 5}`, 3.8, 0.6, 'foot', 'stitch solid')
          : H.draw(`M394 ${y + 4} Q 380 ${y + 60} 360 ${y + 90} M406 ${y + 4} Q 420 ${y + 60} 440 ${y + 90}`, 'stringband', 3.6, 1));
    });

  if (hemPts.length) step('Hem the bottoms', o.style === 'churidar'
    ? 'Fold a narrow hem at each ankle and sew it. The extra churidar length will gather into soft folds above the ankle.'
    : `Fold the bottom of each leg up by ${sn(0.5)}, then again by ${sn(0.75)}. Press, and sew close to the fold.`, () => {
    const a = FR(hemPts[0]), b = FR(hemPts[hemPts.length - 1]), y = Math.max(a[1], b[1]);
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]);
    // drawn in each leg's own (tilted) position
    return frontView() + [[x0, x1, legR, 1], [800 - x1, 800 - x0, legLft, -1]].map(([p, q, wrap, dir], i) => wrap(
      H.fade(`<rect x="${p}" y="${y - hemSa}" width="${q - p}" height="${hemSa}" fill="rgba(79,179,255,.35)" stroke="#4fb3ff" stroke-width="2" stroke-dasharray="5 4"/>`, 0.3 + i * 0.2) +
      H.arrow(dir > 0 ? `M${p - 14} ${y} Q ${p - 34} ${y - hemSa / 2} ${p - 14} ${y - hemSa}` : `M${q + 14} ${y} Q ${q + 34} ${y - hemSa / 2} ${q + 14} ${y - hemSa}`, 0.8 + i * 0.2) +
      H.stitch(`M${p + 2} ${y - hemSa + 3} L${q - 2} ${y - hemSa + 3}`, 1.6 + i * 1.8, 1.6))).join('');
  });

  step('Press it', 'Press the whole garment with a damp cloth, the seams first, then the legs.', () => frontView() + H.iron(330, 260, 0.3, 140, 0, 4));
  step('All done!', `Well done! You made your own ${name}. Put it on.`, () =>
    figure(FIG.ox, FIG.oy, FIG.s, { pants: 'pr' }).replace(/class="pr"/g, `fill="${col.right}" style="filter:url(#cloth)"`) +
    [[180, 120], [620, 100], [650, 330], [160, 360], [560, 200]].map((q, i) => H.pop(`<circle cx="${q[0]}" cy="${q[1]}" r="10" fill="#f2c230"/>`, 0.3 + i * 0.25)).join(''));
  void ICON;
  return steps;
}
