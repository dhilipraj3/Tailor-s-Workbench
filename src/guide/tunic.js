// Kurta / kurti / blouse sewing guide in stages, the way printed pattern instructions do it:
// a few meaningful stages, each with ONE technical drawing of the garment as it is at that point
// (good side in the fabric colour, the new seam highlighted in orange with a label),
// a magnified close-up of the detail that matters, and the stage's actions as a numbered checklist.
// Every original step (every stitch, measurement and check) is kept as an action inside its stage.

const n1 = (v) => Math.round(v * 10) / 10;
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

/* ---------- stages ---------- */
// assigned in sewing order; a step that matches nothing stays in the stage before it
const STAGES = [
  ['prep', 'Prepare the pieces', /lining|stay-stitch|stop fraying/i],
  ['keyhole', 'Back keyhole and ties', /keyhole|tie strings|tack the ties/i],
  ['darts', 'Sew the darts', /dart/i],
  ['placket', 'Make the front opening', /interfacing|fold the strips|strips to front|cut the opening|turn the strips|edgestitch the strips|box the bottom|placket/i],
  ['shoulders', 'Join the shoulders', /shoulder/i],
  ['neck', 'Finish the neckline', /facing strip|strip on|trim and clip|understitch|turn and topstitch|strip ends|band pieces|turn the band|band on the neck|close the band|interface the band|neck/i],
  ['sleeves', 'Attach the sleeves', /sleeve top|in the sleeve|sew in the sleeves|finish the armholes|binding|armhole/i],
  ['sides', 'Sew the side seams', /sides|side seam/i],
  ['sleevehem', 'Finish the sleeve ends', /hem the sleeves|hem the bell|band ends|cuff ends|press the bands|press the cuffs|gather the sleeve ends|band on the sleeve|cuff on the sleeve|cuff/i],
  ['slits', 'Finish the side slits', /slit/i],
  ['peplum', 'Add the peplum', /peplum/i],
  ['hem', 'Hem the bottom', /hem the bottom|bottom hem/i],
  ['closing', 'Buttons and hooks', /front edges|hooks|eyes|buttonhole|buttons/i],
  ['press', 'Press and try on', /^press it|try it on/i],
];
export const STAGE_TITLE = Object.fromEntries(STAGES.map(([k, t]) => [k, t]));
const ORDER = STAGES.map(([k]) => k);

/** Group the small sewing steps into stages, in order. */
export function groupStages(steps) {
  const groups = [];
  let cur = 'prep';
  for (const st of steps) {
    const hit = STAGES.find(([, , re]) => re.test(st.cap));
    // stages only move forward: a later mention of an earlier word stays in the current stage
    if (hit && ORDER.indexOf(hit[0]) >= ORDER.indexOf(cur)) cur = hit[0];
    const last = groups[groups.length - 1];
    if (last && last.key === cur) last.actions.push(st); else groups.push({ key: cur, title: STAGE_TITLE[cur], actions: [st] });
  }
  return groups;
}

/* ---------- the flat drawing ---------- */
const edgePts = (piece, name) => piece.outline.edges.filter((e) => e.name === name).flatMap((e) => e.pts);
function outline(piece, dartsSewn = false) {
  // a piece cut on the fold: leave out the fold edge, the mirror half continues from there
  const edges = piece.fold ? piece.outline.edges.slice(0, -1) : piece.outline.edges;
  const out = [];
  edges.forEach((e, k) => {
    // a sewn dart is closed: the side runs straight past it (the dart is drafted as two edges, in and out)
    if (dartsSewn && e.name === 'dart') { if (edges[k + 1]?.name !== 'dart') out.push(e.pts[e.pts.length - 1]); return; }
    out.push(...(out.length ? e.pts.slice(1) : e.pts));
  });
  return out;
}
const mirrorX = (pts) => pts.map(([x, y]) => [-x, y]).reverse();
const mid = (pts, f = 0.5) => pts[Math.min(pts.length - 1, Math.floor(pts.length * f))];
/** the point of a polyline at height y */
const xAt = (pts, y) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]), y];
  }
  return pts[pts.length - 1];
};
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const pathNums = (d) => { const v = d.match(/-?\d+(\.\d+)?/g).map(Number); return [[v[0], v[1]], [v[2], v[3]], [v[4], v[5]]]; };

/** The garment laid flat, seen from the front, as it is at this stage. */
export function drawStage(ctx, key, col) {
  const get = (id) => ctx.pieces.find((g) => g.piece.id === id)?.piece;
  const front = get('front'), back = get('back'), sleeve = get('sleeve');
  if (!front || !back) return '';
  const at = ORDER.indexOf(key), done = (k) => ORDER.indexOf(k) < at, now = (k) => k === key;
  const joined = at >= ORDER.indexOf('shoulders');
  const sewnD = done('darts') || joined;
  const F = [...outline(front, sewnD), ...mirrorX(outline(front, sewnD))];
  const B = [...outline(back, sewnD), ...mirrorX(outline(back, sewnD))];

  // flat sleeve: from the shoulder point S and the underarm U it runs outward and down
  const S = edgePts(front, 'shoulder').slice(-1)[0], U = edgePts(front, 'armhole').slice(-1)[0];
  let SL = null;
  if (sleeve && S && U) {
    const L = Math.max(...outline(sleeve).map((p) => p[1]));
    const hemPts = edgePts(sleeve, 'hem'), hemW = hemPts.length ? Math.abs(hemPts[0][0] - hemPts[hemPts.length - 1][0]) : 10;
    const a = (38 * Math.PI) / 180, d = [Math.cos(a), Math.sin(a)], nrm = [-Math.sin(a), Math.cos(a)];
    const outer = add(S, d, L * 0.92), inner = add(outer, nrm, hemW / 2);
    SL = { pts: [S, outer, inner, ...edgePts(front, 'armhole').slice().reverse()], hem: [outer, inner], under: [inner, U] };
  }
  const showSleeves = !!SL && at >= ORDER.indexOf('sleeves');

  // fit everything on the 800×500 stage, leaving the right side for the close-up and labels
  const all = joined ? [...F, ...(showSleeves ? [...SL.pts, ...SL.pts.map(([x, y]) => [-x, y])] : [])] : F;
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), ymin = Math.min(...ys);
  const gap = 4;
  const s = Math.min((joined ? 520 : 560) / (joined ? w : 2 * w + gap), 370 / h);
  const cx = joined ? 300 : 300 - ((w + gap) * s) / 2, oy = 76 - ymin * s;
  const dxB = joined ? 0 : w + gap;
  const M = ([x, y], dx = 0) => [n1(cx + (x + dx) * s), n1(oy + y * s)];
  const P = (pts, dx = 0) => 'M' + pts.map((p) => M(p, dx).join(' ')).join(' L') + ' Z';
  const L = (pts, dx = 0) => 'M' + pts.map((p) => M(p, dx).join(' ')).join(' L');

  const ink = '#1d2326', accent = '#e8762c', paper = '#f6f3ec';
  const shape = (pts, dx = 0) => `<path d="${P(pts, dx)}" fill="${col}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>`;
  const sewn = (pts, dx = 0) => `<path d="${L(pts, dx)}" fill="none" stroke="${ink}" stroke-opacity=".75" stroke-width="1.4" stroke-dasharray="5 4"/>`;
  const fresh = (pts, dx = 0) => `<path d="${L(pts, dx)}" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="9 5" stroke-linecap="round"/>`;
  const both = (pts, isNow, dx = 0) => (isNow ? fresh(pts, dx) + fresh(mirrorX(pts), dx) : sewn(pts, dx) + sewn(mirrorX(pts), dx));
  const notes = [];
  let focus = null;
  const callout = (p, text, dx = 0) => {
    const [x, y] = M(p, dx), tx = 590, ty = Math.max(78, Math.min(250, y - 20));
    notes.push(`<g><path d="M${x} ${y} L${tx} ${ty}" stroke="${accent}" stroke-width="1.6" fill="none"/><circle cx="${x}" cy="${y}" r="5" fill="${accent}"/>` +
      `<rect x="${tx}" y="${ty - 16}" width="${n1(text.length * 8.2 + 26)}" height="32" rx="16" fill="${accent}"/>` +
      `<text x="${tx + 13}" y="${ty + 5}" style="font:700 14px var(--f-body);fill:#fff">${esc(text)}</text></g>`);
    if (!focus) focus = [p[0] + dx, p[1]];
  };
  const tag = (p, t, dx = 0) => { const [x, y] = M(p, dx); return `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 15px var(--f-display);letter-spacing:.12em;fill:${ink};opacity:.55">${t}</text>`; };

  let art = '';
  const fNeck = edgePts(front, 'neck'), bNeck = edgePts(back, 'neck');
  const cfY = fNeck.length ? fNeck[0][1] : 6, cbY = bNeck.length ? bNeck[0][1] : 2;
  if (!joined) {
    // the front and the back side by side, good side up
    art += shape(F) + shape(B, dxB);
    art += tag([0, ymin + h * 0.55], 'FRONT') + tag([0, ymin + h * 0.55], 'BACK', dxB);
    if (now('prep')) {
      for (const [pc, dx] of [[front, 0], [back, dxB]]) for (const e of ['neck', 'armhole']) art += both(edgePts(pc, e), true, dx);
      callout(mid(edgePts(front, 'armhole'), 0.3), 'Stay-stitch the curves');
    }
    if (now('keyhole')) { art += fresh([[0, cbY], [0, cbY + 4]], dxB); callout([0, cbY + 2], 'Keyhole slit', dxB); }
    if (now('darts')) {
      const dm = front.marks.find((m) => m.k === 'path'), bm = back.marks.find((m) => m.k === 'path');
      if (dm) {
        const pts = pathNums(dm.d);
        art += both(pts, true);
        if (bm) art += both(pathNums(bm.d), true, dxB);
        callout(pts[1], 'Dart: sew to the point');
      } else {
        const bd = edgePts(front, 'dart');
        if (bd.length) { art += both(bd, true); callout(mid(bd), 'Bust dart: fold and sew'); } else callout(mid(edgePts(front, 'side'), 0.2), 'Bust dart');
      }
    }
    if (now('placket')) {
      const [x0, y0] = M([-0.75, cfY]);
      art += `<rect x="${x0}" y="${y0}" width="${n1(1.5 * s)}" height="${n1(9 * s)}" fill="${col}" stroke="${accent}" stroke-width="3"/>`;
      callout([0, cfY + 6], 'Front opening');
    }
  } else {
    // shoulders sewn: the garment laid flat, good side up; the back neck shows through the front neckline
    if (showSleeves) art += shape(SL.pts) + shape(SL.pts.map(([x, y]) => [-x, y]).reverse());
    art += shape(F);
    art += `<path d="${P([...bNeck, ...mirrorX(bNeck)])}" fill="${col}" stroke="${ink}" stroke-width="1.5"/>`;
    art += `<path d="${P([...fNeck, ...mirrorX(fNeck)])}" fill="#000" fill-opacity=".14" stroke="none"/>`;
    // a sewn front opening (placket) stays visible down the centre front
    if (front.marks.some((m) => m.k === 'text' && /placket/.test(m.t))) {
      const [x0, y0] = M([-0.75, cfY]);
      art += `<rect x="${x0}" y="${y0}" width="${n1(1.5 * s)}" height="${n1(9 * s)}" fill="${col}" stroke="${ink}" stroke-width="1.5"/>` +
        `<path d="${L([[0.55, cfY + 0.3], [0.55, cfY + 8.7]])}" stroke="${ink}" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="5 4"/>`;
    }
    const sh = edgePts(front, 'shoulder');
    art += both(sh, now('shoulders'));
    if (now('shoulders')) callout(mid(sh), 'Shoulder seam');
    if (done('neck') || now('neck')) {
      const inset = fNeck.map(([x, y]) => [x * 1.08 + (x ? 0.2 : 0), y + 0.45]);
      art += both(inset, now('neck'));
      if (now('neck')) callout(mid(inset, 0.6), 'Neckline finish');
    }
    if (showSleeves) {
      const arm = edgePts(front, 'armhole');
      art += both(arm, now('sleeves'));
      if (now('sleeves')) callout(mid(arm, 0.45), 'Sleeve into armhole');
    }
    // with slits, the side seam stops at the slit mark
    const slitMark = front.marks.find((m) => m.k === 'line' && m.style === 'mark' && m.a[0] > 1);
    const slitTop = slitMark ? Math.min(slitMark.a[1], slitMark.b[1]) : null;
    const side = edgePts(front, 'side');
    const sideSewn = slitTop == null ? side : [...side.filter((p) => p[1] < slitTop), xAt(side, slitTop)];
    if (done('sides') || now('sides')) {
      const under = showSleeves ? [...SL.under, ...sideSewn.slice(1)] : sideSewn;
      art += both(under, now('sides'));
      if (now('sides')) callout(mid(side, 0.35), showSleeves ? 'Sleeve and side seam' : 'Side seam');
    }
    if (showSleeves && (done('sleevehem') || now('sleevehem'))) {
      const [o, i] = SL.hem, v = [o[0] - S[0], o[1] - S[1]], k = -1 / Math.hypot(...v), hm = [add(o, v, k), add(i, v, k)];
      art += both(hm, now('sleevehem'));
      if (now('sleevehem')) callout(mid(hm), 'Sleeve end');
    }
    const sb = side[side.length - 1];
    if (sb && slitTop != null && (done('slits') || now('slits'))) {
      const sl = [...side.filter((p) => p[1] > slitTop), sb].map(([x, y]) => [x - 0.4, Math.min(y, sb[1] - 0.8)]);
      sl.unshift([xAt(side, slitTop)[0] - 0.4, slitTop]);
      art += both(sl, now('slits'));
      if (now('slits')) callout(sl[0], 'Slit edges');
    }
    const hem = edgePts(front, 'hem').map(([x, y]) => [x, y - 0.9]);
    if (now('peplum')) callout(mid(hem, 0.2), 'Peplum joins here');
    if (done('hem') || now('hem')) { art += both(hem, now('hem')); if (now('hem')) callout(mid(hem, 0.3), 'Bottom hem'); }
    if (now('closing')) callout(fNeck[0] || [0, 4], 'Buttons / hooks');
    if (now('press')) callout(mid(sh), 'Press every seam');
  }

  // magnified close-up of the detail that matters at this stage
  let zoom = '';
  if (focus) {
    const [fx, fy] = M(focus), r = 92, zx = 680, zy = 380, k = 2.6;
    zoom = `<clipPath id="zc-${key}"><circle cx="${zx}" cy="${zy}" r="${r}"/></clipPath>` +
      `<circle cx="${fx}" cy="${fy}" r="${n1(r / k)}" fill="none" stroke="${ink}" stroke-width="1.4"/>` +
      `<line x1="${n1(fx + (r / k) * 0.7)}" y1="${n1(fy + (r / k) * 0.7)}" x2="${n1(zx - r * 0.7)}" y2="${n1(zy - r * 0.7)}" stroke="${ink}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
      `<circle cx="${zx}" cy="${zy}" r="${r + 4}" fill="#fff" stroke="${ink}" stroke-width="2"/>` +
      `<g clip-path="url(#zc-${key})"><rect x="${zx - r}" y="${zy - r}" width="${2 * r}" height="${2 * r}" fill="${paper}"/>` +
      `<g transform="translate(${n1(zx - fx * k)} ${n1(zy - fy * k)}) scale(${k})">${art}</g></g>` +
      `<text x="${zx}" y="${zy + r + 22}" text-anchor="middle" style="font:700 11px var(--f-body);letter-spacing:.1em;fill:${ink}">CLOSE-UP</text>`;
  }
  return `<rect width="800" height="500" fill="${paper}"/>` +
    `<text x="28" y="42" style="font:800 22px var(--f-display);fill:${ink}">${esc(STAGE_TITLE[key] || '')}</text>` +
    art + zoom + notes.join('') +
    `<g transform="translate(28 476)" style="font:600 13px var(--f-body);fill:#4a4a47"><rect width="18" height="12" fill="${col}" stroke="${ink}"/><text x="24" y="10">Your fabric, good side</text>` +
    `<path d="M190 6 h28" stroke="${accent}" stroke-width="4" stroke-dasharray="9 5"/><text x="224" y="10">Sew now</text>` +
    `<path d="M300 6 h28" stroke="${ink}" stroke-width="1.4" stroke-dasharray="5 4"/><text x="334" y="10">Sewn before</text></g>`;
}
