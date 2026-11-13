// "Mark & cut" steps: chalk every pattern piece straight onto the folded fabric, point by point.
// Generated from the real pattern geometry and the fabric layout, so it works for every design, option and size.
//
// Fabric coordinates: L = along the fabric (from its cut end), W = away from the fold.
// On screen the fold runs along the top and the fabric end is on the left, the same view as the layout picture.
import { H } from '../art/svg.js';
import { f, sn } from '../core/units.js';
import { layoutFabric, toFabric } from '../engine/project';
import { extraAt } from '../engine/geometry';

const LETTERS = 'ABCDEFGHJKMNPQRTUVWXYZ'.split('');
const r8 = (x) => Math.round(x * 8) / 8;
const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.2;

/** Fit a fabric region [L0..L1]×[W0..W1] into the 800×500 stage. */
function viewOf(L0, L1, W0, W1, lay) {
  const pad = 1.2;
  L0 -= pad; L1 += pad; W0 = Math.max(-0.6, W0 - pad); W1 = Math.min(lay.halfIn + 0.6, W1 + pad);
  const s = Math.min(740 / (L1 - L0), 400 / (W1 - W0)), ox = 30 + (740 - (L1 - L0) * s) / 2, oy = 60 + (400 - (W1 - W0) * s) / 2;
  const M = ([L, W]) => [ox + (L - L0) * s, oy + (W - W0) * s];
  const D = (pts, close = true) => 'M' + pts.map((p) => M(p).map((v) => v.toFixed(1)).join(' ')).join(' L') + (close ? ' Z' : '');
  return { M, D, s, L0, L1, W0, W1 };
}

function fabricBg(v, lay, cls) {
  const a = v.M([Math.max(0, v.L0), Math.max(0, v.W0)]), b = v.M([v.L1, Math.min(lay.halfIn, v.W1)]);
  let o = `<rect x="${a[0].toFixed(1)}" y="${a[1].toFixed(1)}" width="${(b[0] - a[0]).toFixed(1)}" height="${(b[1] - a[1]).toFixed(1)}" class="${cls}"/>`;
  if (v.W0 <= 0.01) { const y = v.M([0, 0])[1]; o += (lay.openFab ? '' : `<path d="M${a[0]} ${y} L${b[0]} ${y}" class="foldl"/>`) + `<text x="${a[0] + 8}" y="${y - 10}" class="wordt" style="text-anchor:start;font-size:20px">${lay.openFab ? 'SELVEDGE' : 'FOLD'}</text>`; }
  if (v.L0 <= 0.01) { const x = v.M([0, 0])[0]; o += `<path d="M${x} ${a[1]} L${x} ${b[1]}" stroke="#fff" stroke-width="3"/>`; }
  if (v.W1 >= lay.halfIn - 0.01) { const y = v.M([0, lay.halfIn])[1]; o += `<text x="${a[0] + 8}" y="${y + 24}" class="wordt" style="text-anchor:start;font-size:18px;opacity:.8">SELVEDGES</text>`; }
  return o;
}

const cross = ([x, y], c = '#ffd84a') => `<path d="M${x - 9} ${y - 9} L${x + 9} ${y + 9} M${x + 9} ${y - 9} L${x - 9} ${y + 9}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
const dot = ([x, y], r = 6, c = '#ffffff') => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/>`;
const label = ([x, y], t, c = '#ffffff') => `<text x="${(x + 9).toFixed(1)}" y="${(y - 9).toFixed(1)}" style="font:800 20px var(--f-body)" fill="${c}">${t}</text>`;
const arrowChip = (dl, dw) => `${dl ? '→' + f(dl) : ''}${dl && dw ? ' ' : ''}${dw ? '↓' + f(dw) : ''}` || 'S';

function along(dl, dw, edge = 'the fold') {
  if (dl && dw) return `go ${sn(dl)} along the fabric and ${sn(dw)} away from ${edge}`;
  if (dl) return `go ${sn(dl)} straight along the fabric`;
  if (dw) return `go ${sn(dw)} straight away from ${edge}`;
  return 'stay on S';
}

/** Allowances for the edges of one piece, grouped by seam name. */
function allowances(piece, scale) {
  const rows = new Map();
  for (const e of piece.outline.edges) {
    if (!e.name && !e.allow.fold) continue;
    const name = e.allow.fold ? 'fold' : e.name;
    const total = [0, 1].map((t) => (e.allow.fold ? 0 : e.allow.sa + extraAt(e.allow, t) * scale));
    const r = rows.get(name) || { name, all: [] }; r.all.push(...total); rows.set(name, r);
  }
  return [...rows.values()].map((r) => ({ name: r.name, hi: Math.max(...r.all), lo: Math.min(...r.all) }));
}

function pieceSteps(ctx, pls, layIn, cls) {
  const pl = pls[0], lay = pl.open ? { ...layIn, halfIn: layIn.widthIn - 0.5, openFab: true } : layIn, edge = pl.open ? 'the selvedge' : 'the fold', g = pl.g, piece = g.piece, F = (p) => toFabric(pl, p);
  const stitch = g.stitch.map(F), cut = g.cut.map(F), sa = g.sa.map(F);
  const Ls = stitch.map((p) => p[0]), Ws = stitch.map((p) => p[1]);
  const S = [Math.floor(Math.min(...Ls) * 8) / 8, Math.floor(Math.min(...Ws) * 8) / 8];
  const Lmax = Math.max(...cut.map((p) => p[0])), Wmax = Math.max(...cut.map((p) => p[1]));
  const Lmin = Math.min(...cut.map((p) => p[0])), Wmin = Math.min(...cut.map((p) => p[1]));
  const name = piece.name, lname = name.toLowerCase();
  const v = viewOf(Lmin, Lmax, Math.min(Wmin, S[1] < 6 ? 0 : Wmin), Wmax, lay);
  const bg = () => fabricBg(v, lay, cls);
  const ghost = `<path d="${v.D(stitch)}" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-dasharray="4 5"/>`;
  const Sm = v.M(S);
  const steps = [];
  const sec = 'Mark & cut';

  // 1. where this piece starts on the fabric
  const big = viewOf(0, Math.max(Lmax, 10), 0, lay.halfIn, lay);
  const startSay = `Next: the ${lname}${piece.n > 1 ? `. You need ${piece.n}` : ''}.${pl.open ? ' This piece is too wide for folded fabric, so open the end of the fabric out flat and cut it from one layer.' : ''} Find its start point S: measure ${sn(S[0])} along the fabric from the end, and ${S[1] < 0.06 ? 'stay right on ' + edge : sn(S[1]) + ' away from ' + edge}. Mark a small cross.`;
  steps.push({ sec, cap: `Start: ${name}`, say: startSay, svg: () => {
    const bS = big.M(S), b0 = big.M([0, S[1]]), bF = big.M([S[0], 0]);
    return fabricBg(big, lay, cls) + `<path d="${big.D(stitch)}" fill="rgba(255,216,74,.18)" stroke="#ffd84a" stroke-width="2" stroke-dasharray="6 5"/>` +
      (S[0] > 0.1 ? H.dim(b0, bS, S[0], 0.3, 0) : '') + (S[1] > 0.1 ? H.dim(bF, bS, S[1], 0.9, 0) : '') + H.pop(cross(bS), 1.4) + H.pop(label(bS, 'S', '#ffd84a'), 1.5);
  } });

  if (piece.simple) {
    const wL = r8(Math.max(...Ls) - S[0]), wW = r8(Math.max(...Ws) - S[1]);
    steps.push({ sec, cap: 'Mark the rectangle', say: `From S, mark a rectangle ${sn(wL)} along the fabric and ${sn(wW)} away from the fold. This size already includes the sewing space.`, svg: () =>
      bg() + cross(Sm) + label(Sm, 'S', '#ffd84a') + H.draw(v.D(stitch), 'chalkl', 0.3, 1.6) + H.dim(Sm, v.M([S[0] + wL, S[1]]), wL, 1.8, -24) + H.dim(Sm, v.M([S[0], S[1] + wW]), wW, 2.2, 24) });
  } else {
    // 2. key points, two per step
    const pts = [];
    for (const e of piece.outline.edges) {
      const corner = e.pts[0];
      if (!pts.some((q) => near(q.p, corner))) pts.push({ p: corner, guide: false });
      if (/^[CQ]/.test(e.cmd)) { const mid = e.pts[Math.floor(e.pts.length / 2)]; if (!pts.some((q) => near(q.p, mid))) pts.push({ p: mid, guide: true }); }
    }
    pts.forEach((q, i) => { q.F = F(q.p); q.rel = [r8(q.F[0] - S[0]), r8(q.F[1] - S[1])]; q.name = LETTERS[i % LETTERS.length] + (i >= LETTERS.length ? '2' : ''); });
    const drawn = (upto) => pts.slice(0, upto).map((q) => dot(v.M(q.F), q.guide ? 4 : 6, q.guide ? '#9fd3ff' : '#fff') + label(v.M(q.F), q.name, q.guide ? '#9fd3ff' : '#fff')).join('');
    // one point per step, so the two measurements can sit right on their own chalk lines
    const tag = (x, y, txt, d0) => {
      const w = txt.length * 10.5 + 18;
      return H.pop(`<rect x="${(x - w / 2).toFixed(1)}" y="${(y - 14).toFixed(1)}" width="${w.toFixed(1)}" height="28" rx="9" class="chipbg"/><text x="${x.toFixed(1)}" y="${(y + 1).toFixed(1)}" class="chipt" style="font-size:16px">${txt}</text>`, d0);
    };
    const clampX = (x, w) => Math.min(800 - w / 2 - 6, Math.max(w / 2 + 6, x));
    pts.forEach((q, i) => {
      const say = `From S, ${along(q.rel[0], q.rel[1], edge)}. Mark ${q.guide ? 'a small curve guide dot' : 'point'} ${q.name}.`;
      steps.push({ sec, cap: `Mark point ${q.name}`, say, svg: () => {
        let o = bg() + ghost + cross(Sm) + label(Sm, 'S', '#ffd84a') + drawn(i);
        const corner = v.M([q.F[0], S[1]]), P = v.M(q.F);
        o += H.draw(`M${Sm[0]} ${Sm[1]} L${corner[0]} ${corner[1]} L${P[0]} ${P[1]}`, 'chalkd', 0.3, 1.2);
        if (q.rel[0]) {
          // "along the fabric": centred on the horizontal line, or just above it when the line is short
          const t = `→ ${f(q.rel[0])}`, w = t.length * 10.5 + 18, len = Math.abs(corner[0] - Sm[0]);
          o += tag(clampX((Sm[0] + corner[0]) / 2, w), Sm[1] - (len > w + 20 ? 0 : 24), t, 0.9);
        }
        if (q.rel[1]) {
          // "away from the fold": centred on the vertical line, or beside it when the line is short
          const t = `↓ ${f(q.rel[1])}`, w = t.length * 10.5 + 18, len = Math.abs(P[1] - corner[1]);
          const beside = len < 44, side = corner[0] > 680 ? -1 : 1;
          o += tag(clampX(corner[0] + (beside ? side * (w / 2 + 12) : 0), w), (corner[1] + P[1]) / 2, t, 1.4);
        }
        o += H.pop(dot(P, q.guide ? 5 : 8, q.guide ? '#9fd3ff' : '#ffd84a') + label(P, q.name, '#ffd84a'), 1.6);
        return o;
      } });
    });
    // 3. join the points
    const curved = piece.outline.edges.some((e) => /^[CQ]/.test(e.cmd));
    steps.push({ sec, cap: 'Join the chalk lines', say: `Join the points in order${curved ? ': straight lines where the edge is straight, and a smooth curve through each blue guide dot' : ' with straight lines'}. Use a long ruler for straight lines. This chalk line is where you will sew.`, svg: () =>
      bg() + cross(Sm) + drawn(pts.length) + H.draw(v.D(stitch), 'chalkl', 0.3, 3) });
  }

  // 4. marks: pocket, buttons, pleats, darts, slits
  const marks = piece.marks.filter((m) => m.k !== 'text' && !(m.k === 'line' && m.style === 'guide'));
  if (marks.length && !piece.simple) {
    const btns = marks.filter((m) => m.k === 'btn');
    const others = marks.length - btns.length;
    const say = [btns.length ? `Mark ${btns.length} button dot${btns.length > 1 ? 's' : ''}` : '', others ? `mark the ${others > 1 ? 'pocket, pleat or dart lines' : 'detail line'} shown in red` : '']
      .filter(Boolean).join(', and ') + '. Each chip shows how far it is from S. ' + (piece.marks.find((m) => m.k === 'text') ? 'Note: ' + piece.marks.filter((m) => m.k === 'text').map((m) => m.t).join(', ') + '.' : '');
    steps.push({ sec, cap: 'Mark the details', say, svg: () => {
      let o = bg() + cross(Sm) + `<path d="${v.D(stitch)}" class="chalkl"/>`, d = 0.3;
      for (const mk of marks) {
        let ref;
        if (mk.k === 'btn') { const P = v.M(F(mk.p)); o += H.pop(`<circle cx="${P[0]}" cy="${P[1]}" r="7" fill="none" stroke="#ff8a65" stroke-width="3"/>`, d); ref = F(mk.p); }
        else if (mk.k === 'line') { o += H.draw(v.D([F(mk.a), F(mk.b)], false), 'redmk', d, 0.6); ref = F(mk.a); }
        else { const pairs = [...mk.d.matchAll(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g)].map((m) => F([+m[1], +m[2]])); o += H.draw(v.D(pairs, /Z\s*$/.test(mk.d)), 'redmk', d, 0.8); ref = pairs[0]; }
        if (mk === marks[0] || mk.k !== 'btn') { const R = v.M(ref); o += H.chip(R[0], Math.max(24, R[1] - 26), arrowChip(r8(ref[0] - S[0]), r8(ref[1] - S[1])), d + 0.4); }
        d += 0.35;
      }
      return o;
    } });
  }

  // 5. cutting line: sewing space + extra cloth
  if (!piece.simple) {
    const al = allowances(piece, ctx.extraScale);
    const parts = al.filter((a) => a.name !== 'fold').map((a) => `${a.name}: ${a.hi === a.lo ? sn(a.hi) : `${sn(a.hi)}, getting smaller to ${sn(a.lo)}`}`);
    const say = `Now draw the cutting line outside the chalk line. Measure out from the chalk line at many places and join the marks. ${parts.join('. ')}.${al.some((a) => a.name === 'fold') ? ' Nothing is added along the fold.' : ''} The orange part is the extra cloth for later adjustment.`;
    steps.push({ sec, cap: 'Draw the cutting line', say, svg: () =>
      bg() + `<path d="${v.D(cut)} ${v.D([...sa].reverse())}" fill="rgba(242,140,40,.55)" fill-rule="evenodd" class="fi" style="--d:.3s"/>` +
      `<path d="${v.D(sa)} ${v.D([...stitch].reverse())}" fill="rgba(120,180,255,.35)" fill-rule="evenodd" class="fi" style="--d:.3s"/>` +
      `<path d="${v.D(stitch)}" class="chalkl"/>` + H.draw(v.D(cut), 'chalkl', 1, 2.4) +
      al.filter((a) => a.name !== 'fold').slice(0, 5).map((a, i) => H.chip(680, 30 + i * 42, `${a.name.slice(0, 10)} ${f(a.hi)}`, 1.2 + i * 0.3)).join('') });
  }

  // 6. cut
  const fold = piece.fold ? ' Do not cut along the fold.' : '';
  steps.push({ sec, cap: 'Cut it out', say: pl.open ? `Cut along the outer line through the single layer. Write the name on the wrong side with chalk.` : `Pin the two layers together inside the shape. Cut along the outer line, through both layers.${fold} You get ${piece.fold ? 'one whole' : 'two matching'} ${lname}${piece.fold ? '' : ' pieces'}. Write the name on the wrong side with chalk.`, svg: () =>
    bg() + `<path d="${v.D(cut)}" class="chalkl"/><path d="${v.D(stitch)}" class="chalkd"/>` +
    H.pins([0.2, 0.45, 0.7].map((t) => v.M(stitch[Math.floor(stitch.length * t)])).map(([x, y]) => [x, y]), 0.2) + H.cut(v.D(cut), 1, 4) + H.ok(720, 440, 5.2) });

  // 7. more copies of the same piece elsewhere on the fabric
  pls.slice(1).forEach((p2, k) => {
    const S2pts = p2.g.stitch.map((q) => toFabric(p2, q));
    const S2 = [Math.floor(Math.min(...S2pts.map((p) => p[0])) * 8) / 8, Math.floor(Math.min(...S2pts.map((p) => p[1])) * 8) / 8];
    steps.push({ sec, cap: `${k ? 'Next' : 'Second'} ${lname}`, say: `Mark another ${lname} the same way. Its start point S is ${sn(S2[0])} along the fabric and ${S2[1] < 0.06 ? 'on the fold' : sn(S2[1]) + ' from the fold'}. It may be turned the other way round; follow the picture.`, svg: () => {
      const bS = big.M(S2);
      return fabricBg(big, lay, cls) + `<path d="${big.D(stitch)}" fill="rgba(255,255,255,.12)" stroke="#fff" stroke-width="1.5"/>` +
        `<path d="${big.D(S2pts)}" fill="rgba(255,216,74,.18)" stroke="#ffd84a" stroke-width="2" stroke-dasharray="6 5"/>` + H.pop(cross(bS), 0.6) + H.pop(label(bS, 'S', '#ffd84a'), 0.7);
    } });
  });
  return steps;
}

export function markSteps(ctx, widthIn = 58) {
  const lay = layoutFabric(ctx, widthIn);
  const cls = ['shirt', 'tunic', 'dress', 'skirt'].includes(ctx.garment.id) ? 'fw' : 'pw';
  const groups = new Map();
  for (const pl of lay.placed) { const id = pl.g.piece.id; if (!groups.has(id)) groups.set(id, []); groups.get(id).push(pl); }
  const intro = { sec: 'Mark & cut', cap: 'Chalk it on fabric', say: `No printer needed. We will draw every piece straight onto the folded fabric with chalk, using the measuring tape. Lay the folded fabric flat, wrong side up, with the fold away from you and the cut end on your left. Each piece starts from a point S, measured along the fabric and away from the fold.`, svg: () => {
    const v = viewOf(0, lay.lengthIn, 0, lay.halfIn, lay);
    return fabricBg(v, lay, cls) + lay.placed.map((p, i) => H.move(`<path d="${v.D(p.poly)}" fill="rgba(255,216,74,.16)" stroke="#ffd84a" stroke-width="1.5" stroke-dasharray="5 4"/>`, 0, -60, 0.2 + i * 0.08, 0.5)).join('') +
      H.chip(160, 40, `${widthIn}″ fabric`, 0.2) + H.chip(380, 40, `${lay.metres} m`, 0.4);
  } };
  return [intro, ...[...groups.values()].flatMap((pls) => pieceSteps(ctx, pls, lay, cls))];
}
