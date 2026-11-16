// Sewing in stages for shirts, dresses, skirts, trousers and the pyjama family (the kurta family is in tunic.js).
// Each stage has ONE drawing of the garment as it is at that point, built from this person's pattern pieces:
// the seam to sew now in orange with a label, earlier seams dashed, and either a close-up of the detail
// or, when the stage makes a small part (collar, cuff, pocket, fly, waistband), that part drawn on its own.

const n1 = (v) => Math.round(v * 10) / 10;
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const INK = '#1d2326', ACCENT = '#e8762c', PAPER = '#f6f3ec';

/* ---------- stages: [key, title, caption pattern, { label, feat, inset, hi }] ---------- */
// feat: extra things drawn on the garment from this stage on; inset: small pieces shown beside it;
// hi: edges of the inset pieces to highlight when the steps name none
const PLANS = {
  shirt: [
    ['prep', 'Prepare the fronts', /interfacing|front edges|button bands/i, { label: 'Button bands', feat: ['stand'] }],
    ['pocket', 'Sew on the pocket', /pocket/i, { label: 'Pocket', feat: ['pocket'], inset: ['pocket'] }],
    ['yoke', 'Back, yoke and shoulders', /back pleat|yoke|shoulders/i, { label: 'Shoulder seam', inset: ['back', 'yoke'], hi: ['yoke seam'] }],
    ['collar', 'Make and attach the collar', /collar|stand|band/i, { label: 'Collar', feat: ['collar'], inset: ['leaf', 'stand', 'band'] }],
    ['placket', 'Sleeve plackets', /sleeve slit|back edge|big placket|tower placket|sleeve pleats/i, { label: 'Sleeve placket', inset: ['placketL', 'placketS'] }],
    ['sleeves', 'Attach the sleeves', /on the sleeves|fell the armholes/i, { label: 'Sleeve into armhole' }],
    ['sides', 'Side and sleeve seams', /side and sleeve|side seams/i, { label: 'Side and sleeve seam' }],
    ['cuffs', 'Finish the sleeve ends', /cuff|short sleeves/i, { label: 'Sleeve end', feat: ['cuffs'], inset: ['cuff'] }],
    ['hem', 'Hem the bottom', /hem the bottom/i, { label: 'Bottom hem' }],
    ['closing', 'Buttonholes and buttons', /buttonhole|button/i, { label: 'Buttons', feat: ['buttons'] }],
    ['press', 'Press it', /^press it/i, { label: 'Press every seam' }],
  ],
  dress: [
    ['prep', 'Prepare the pieces', /stay-stitch|stop fraying/i, { label: 'Stay-stitch the neck' }],
    ['darts', 'Sew the waist darts', /dart/i, { label: 'Waist dart', feat: ['darts'] }],
    ['shoulders', 'Join the shoulders', /shoulder/i, { label: 'Shoulder seam' }],
    ['neck', 'Finish the neckline', /facing strip|strip on|trim and clip|understitch|turn and topstitch/i, { label: 'Neckline finish', inset: ['neckbind'] }],
    ['sleeves', 'Attach the sleeves', /sleeve top|in the sleeves/i, { label: 'Sleeve into armhole' }],
    ['sides', 'Sew the bodice sides', /bodice sides/i, { label: 'Side seam' }],
    ['sleevehem', 'Hem the sleeves', /hem the sleeves/i, { label: 'Sleeve end' }],
    ['skirt', 'Gather and join the skirt', /gather|skirt sides|skirt and top/i, { label: 'Waist seam', feat: ['gathers'], inset: ['skirtF'] }],
    ['zip', 'Back seam and zip', /back seam|zip/i, { label: 'Zip in the back', inset: ['bback'], hi: ['centre back'] }],
    ['hem', 'Hem the skirt', /hem the skirt/i, { label: 'Skirt hem' }],
    ['press', 'Press it', /^press it/i, { label: 'Press every seam' }],
  ],
  skirt: [
    ['sides', 'Sew the side seams', /fraying|sides/i, { label: 'Side seam' }],
    ['zip', 'Sew in the zip', /zip/i, { label: 'Zip', feat: ['zip'] }],
    ['waist', 'Finish the waist', /band|casing|elastic|stitch at the sides|hook/i, { label: 'Waist', feat: ['band', 'casing', 'gathers'], inset: ['wband'] }],
    ['hem', 'Hem the skirt', /hem the skirt/i, { label: 'Hem' }],
    ['press', 'Press it', /^press it/i, { label: 'Press every seam' }],
  ],
  trousers: [
    ['prep', 'Prepare the pieces', /interfacing|stop fraying|back darts/i, { label: 'Finish the edges', inset: ['tback'] }],
    ['back', 'Back pockets', /welt|two lines|cut the y|turn through|triangles|pocket bag|pocket button/i, { label: 'Back pocket', inset: ['welt', 'bbag'] }],
    ['front', 'Front pockets', /facing on the bag|slant|understitch|front bags|bags on the sides|front pleats/i, { label: 'Front pocket', feat: ['pockets', 'pleats'], inset: ['pfacing', 'pbag'] }],
    ['fly', 'Zip fly', /fly|zip|j line/i, { label: 'Zip fly', feat: ['fly'], inset: ['flyF', 'flyS'] }],
    ['legs', 'Side and inside leg seams', /sides|inside legs/i, { label: 'Side seam' }],
    ['waist', 'Waistband, loops and seat seam', /loops|waistband|band to|seat seam|try them|band ends|hook, bar/i, { label: 'Waistband', feat: ['band', 'loops'], inset: ['band'] }],
    ['hem', 'Hem the legs', /hem the legs|turn-ups/i, { label: 'Leg hem' }],
    ['press', 'Press the creases', /creases/i, { label: 'Crease line' }],
  ],
  pants: [
    ['prep', 'Prepare the pieces', /cut pieces|make the drawstring|stop fraying/i, { label: 'Finish the edges', inset: ['string'] }],
    ['pockets', 'Add the pockets', /pocket bags/i, { label: 'Pocket opening', feat: ['pockets'], inset: ['pbag'] }],
    ['sides', 'Sew the side seams', /side seams|finish the pockets|open and press/i, { label: 'Side seam' }],
    ['legs', 'Sew the inside legs', /inside legs/i, { label: 'Inside leg seam' }],
    ['crotch', 'Join the two legs', /one leg inside|crotch|right side out/i, { label: 'Crotch seam' }],
    ['waist', 'Make the waist casing', /buttonholes|casing|thread|stitch at the sides/i, { label: 'Waist casing', feat: ['casing'] }],
    ['hem', 'Hem the legs', /hem the bottoms/i, { label: 'Leg hem' }],
    ['press', 'Press it', /^press it/i, { label: 'Press every seam' }],
  ],
};
export const hasPlan = (garment) => !!PLANS[garment];

/** Group the small sewing steps into this garment's stages; stages only move forward. */
export function groupFlat(garment, steps) {
  const plan = PLANS[garment], order = plan.map((s) => s[0]);
  const groups = [];
  let cur = plan[0][0];
  for (const st of steps) {
    const hit = plan.find((s) => s[2].test(st.cap));
    if (hit && order.indexOf(hit[0]) >= order.indexOf(cur)) cur = hit[0];
    const last = groups[groups.length - 1];
    if (last && last.key === cur) last.actions.push(st);
    else { const p = plan.find((s) => s[0] === cur); groups.push({ key: cur, title: p[1], opt: p[3], actions: [st] }); }
  }
  return groups;
}

/* ---------- geometry helpers ---------- */
const edgePts = (piece, name) => (piece ? piece.outline.edges.filter((e) => e.name === name).flatMap((e) => e.pts) : []);
function outline(piece, dartsSewn = false) {
  const edges = piece.fold ? piece.outline.edges.slice(0, -1) : piece.outline.edges;
  const out = [];
  edges.forEach((e, k) => {
    if (dartsSewn && e.name === 'dart') { if (edges[k + 1]?.name !== 'dart') out.push(e.pts[e.pts.length - 1]); return; }
    out.push(...(out.length ? e.pts.slice(1) : e.pts));
  });
  return out;
}
const mirrorX = (pts) => pts.map(([x, y]) => [-x, y]).reverse();
// the point a fraction f along a polyline, measured along its length
const mid = (pts, f = 0.5) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0);
  let want = tot * f;
  for (let i = 0; i < seg.length; i++) { if (want <= seg[i] && seg[i] > 0) { const t = want / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; } want -= seg[i]; }
  return pts[pts.length - 1];
};
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const maxY = (pts) => Math.max(...pts.map((p) => p[1]));
const pathNums = (d) => { const v = d.match(/-?\d+(\.\d+)?/g).map(Number); return [[v[0], v[1]], [v[2], v[3]], [v[4], v[5]]]; };

/**
 * The drawing for one stage.
 * groups: all stages of this garment (for what was sewn before); k: this stage's index.
 */
export function drawFlat(ctx, groups, k, col) {
  const g = groups[k], garment = ctx.garment.id;
  const get = (id) => ctx.pieces.find((x) => x.piece.id === id)?.piece;
  const keysOf = (gs) => new Set(gs.flatMap((x) => x.actions.flatMap((a) => a.d?.edges || [])));
  const nowE = keysOf([g]), doneE = keysOf(groups.slice(0, k));
  const featNow = new Set(g.opt.feat || []), featDone = new Set(groups.slice(0, k).flatMap((x) => x.opt.feat || []));
  const firstWith = (re) => groups.findIndex((x) => x.actions.some((a) => (a.d?.edges || []).some((e) => re.test(e))));
  // state of an edge name (on any of the given pieces): 'now', 'done' or ''
  const state = (names, ids) => {
    const m = (set) => [...set].some((e) => { const [p, n] = e.split(':'); return names.includes(n) && (!ids || ids.includes(p)); });
    return m(nowE) ? 'now' : m(doneE) ? 'done' : '';
  };
  const feat = (f) => (featNow.has(f) ? 'now' : featDone.has(f) ? 'done' : '');

  // collected drawing, in inches; converted to the stage at the end
  const shapes = [], lines = [], extras = [];
  let focus = null;
  const shape = (pts, fill = col, w = 2) => shapes.push({ pts, fill, w });
  const line = (pts, st) => {
    if (!st || pts.length < 2) return;
    lines.push({ pts, st });
    if (st === 'now' && !focus) focus = mid(pts);
  };

  if (['shirt', 'dress'].includes(garment)) topView();
  else lowerView();

  /* ----- shirts and dresses: the top laid flat ----- */
  function topView() {
    const F = get(garment === 'shirt' ? 'front' : 'bfront'), B = get(garment === 'shirt' ? 'back' : 'bback'), Y = get('yoke'), SLV = get('sleeve');
    const sewnD = feat('darts') === 'done' || k > groups.findIndex((x) => x.key === 'darts');
    const halves = (p) => { const o = outline(p, sewnD); return p.fold ? [[...o, ...mirrorX(o)]] : [o, mirrorX(o)]; };
    const fShapes = halves(F), bShapes = halves(B), yShapes = Y ? halves(Y) : [];
    // joined once the shoulder seams are sewn (stopping fraying on the shoulders does not count)
    const joinAt = groups.findIndex((x) => ['shoulders', 'yoke'].includes(x.key)), joined = joinAt >= 0 && k >= joinAt;
    const both = (pts, st, dx = 0) => { const p = pts.map(([x, y]) => [x + dx, y]); line(p, st); line(mirrorX(pts).map(([x, y]) => [x + dx, y]), st); };
    const fNeck = edgePts(F, 'neck').filter((p) => p[0] >= 0), sh = edgePts(F, 'shoulder'), arm = edgePts(F, 'armhole'), side = edgePts(F, 'side');
    const hem = edgePts(F, 'hem').filter((p) => p[0] >= 0), cfY = fNeck.length ? fNeck[0][1] : 3, hemY = maxY(hem.length ? hem : side);
    const S = sh[sh.length - 1], U = arm[arm.length - 1];
    if (!joined) {
      const w = Math.max(...fShapes.flat().map((p) => p[0])) * 2 + 4;
      for (const s of fShapes) shape(s);
      for (const s of bShapes) shape(s.map(([x, y]) => [x + w, y]));
      for (const s of yShapes) shape(s.map(([x, y]) => [x + w, y]));
      extras.push({ t: 'tag', p: [0, hemY * 0.6], s: 'FRONT' }, { t: 'tag', p: [w, hemY * 0.6], s: 'BACK' });
      if (feat('stand')) { line([[0.3, cfY + 0.3], [0.3, hemY - 0.3]], feat('stand')); line([[-0.3, cfY + 0.3], [-0.3, hemY - 0.3]], feat('stand')); }
      both(fNeck, state(['neck']));
      both(sh, state(['shoulder'])); both(side, state(['side']));
      if (feat('pocket')) pocket(F, U, feat('pocket'));
      if (feat('darts')) darts(F, B, w);
      return;
    }
    // sleeves hang from the shoulder point, outward and down
    const sleeveAt = firstWith(/:cap$/), showSleeves = SLV && sleeveAt >= 0 && k >= sleeveAt;
    let SL = null;
    if (SLV && S && U) {
      const L = maxY(outline(SLV)), hp = edgePts(SLV, 'hem'), hemW = hp.length ? Math.abs(hp[0][0] - hp[hp.length - 1][0]) : 10;
      const a = (38 * Math.PI) / 180, d = [Math.cos(a), Math.sin(a)], nrm = [-Math.sin(a), Math.cos(a)];
      const outer = add(S, d, L * 0.92), inner = add(outer, nrm, hemW / 2);
      SL = { pts: [S, outer, inner, ...arm.slice().reverse()], hem: [outer, inner], under: [inner, U], d };
    }
    if (showSleeves) { shape(SL.pts); shape(mirrorX(SL.pts)); }
    // the dress skirt, gathered onto the bodice once joined
    const skirtAt = firstWith(/^skirt[FB]:waist$/);
    if (garment === 'dress' && skirtAt >= 0 && k >= skirtAt) {
      const t = hem.length ? Math.max(...hem.map((p) => p[0])) : 9, b = t * 1.9, L = maxY(outline(get('skirtF')));
      shape([[-t, hemY], [t, hemY], [b, hemY + L], [-b, hemY + L]]);
      for (let x = -t + 1; x < t; x += 1.6) extras.push({ t: 'gather', a: [x, hemY + 0.2], b: [x * 1.25, hemY + 2.6] });
      line([[-t, hemY], [t, hemY]], state(['waist'], ['skirtF', 'skirtB']));
      line([[t, hemY], [b, hemY + L]], state(['side'], ['skirtF', 'skirtB'])); line([[-t, hemY], [-b, hemY + L]], state(['side'], ['skirtF', 'skirtB']));
      line([[-b + 0.3, hemY + L - 1], [b - 0.3, hemY + L - 1]], state(['hem'], ['skirtF', 'skirtB']));
    }
    // back neck shows through the front neckline
    const bNeck = edgePts(B, 'neck').filter((p) => p[0] >= 0);
    shape([...bNeck, ...mirrorX(bNeck)], col, 1.5);
    for (const s of fShapes) shape(s);
    if (garment === 'shirt') { line([[0.3, cfY + 0.3], [0.3, hemY - 0.3]], 'done'); }
    both(sh, state(['shoulder'], [F.id, 'yoke', B.id]));
    if (garment === 'dress') both(fNeck.map(([x, y]) => [x * 1.08 + (x ? 0.2 : 0), y + 0.45]), state(['neck'], [F.id, B.id]));
    if (feat('collar')) collar(fNeck, feat('collar'));
    if (showSleeves) both(arm, state(['armhole', 'cap']));
    const sideSt = state(['side', 'underarm'], [F.id, B.id, 'sleeve']);
    if (sideSt) both(showSleeves ? [...SL.under, ...side.slice(1)] : side, sideSt);
    if (showSleeves) {
      const [o, i] = SL.hem, v = [o[0] - S[0], o[1] - S[1]], kk = -1 / Math.hypot(...v), hm = [add(o, v, kk), add(i, v, kk)];
      const cuff = get('cuff') && feat('cuffs');
      if (cuff) { const c = [o, i, add(i, v, -2.4 / Math.hypot(...v)), add(o, v, -2.4 / Math.hypot(...v))]; shape(c); shape(mirrorX(c)); both([c[2], c[3]], cuff); }
      else both(hm, state(['hem'], ['sleeve']) || (featNow.has('cuffs') ? 'now' : featDone.has('cuffs') ? 'done' : ''));
    }
    if (hem.length) both(hem.map(([x, y]) => [x, y - 0.9]), state(['hem'], [F.id, B.id]));
    if (feat('pocket')) pocket(F, U, feat('pocket'));
    if (feat('darts')) darts(F, B, 0);
    if (feat('buttons') && garment === 'shirt') {
      for (let y = cfY + 0.6; y < hemY - 2.5; y += 3.6) extras.push({ t: 'btn', p: [0, y], st: feat('buttons') });
      if (!focus) focus = [0, cfY + 4.2];
    }
  }
  function pocket(F, U, st) {
    const p = get('pocket'), w = p ? Math.max(...outline(p).map((q) => q[0])) : 5, h = p ? maxY(outline(p)) : 5.5;
    const x0 = (U?.[0] || 10) * 0.3, y0 = (U?.[1] || 10) - 1.5;
    const pts = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h - 0.6], [x0 + w / 2, y0 + h], [x0, y0 + h - 0.6]];
    const two = g.actions.concat(groups.flatMap((x) => x.actions)).some((a) => /both pockets/i.test(a.cap));
    // the pocket is stitched down its sides and bottom; the top stays open
    for (const q of two ? [pts, mirrorX(pts)] : [pts]) { shape(q, col, 1.5); line([q[1], q[2], q[3], q[4], q[0]], st); }
    void F;
  }
  function darts(F, B, dxB) {
    const dm = F.marks?.find((m) => m.k === 'path'), bm = B.marks?.find((m) => m.k === 'path'), st = feat('darts');
    if (dm) { const p = pathNums(dm.d); line(p, st); line(mirrorX(p), st); }
    if (bm && dxB) { const p = pathNums(bm.d).map(([x, y]) => [x + dxB, y]); line(p, st); line(mirrorX(pathNums(bm.d)).map(([x, y]) => [x + dxB, y]), st); }
  }
  function collar(neck, st) {
    if (!neck.length) return;
    const top = neck[neck.length - 1], cf = neck[0], band = !!get('band');
    const standPts = [...neck.map(([x, y]) => [x, y - 1.2]), ...neck.slice().reverse()];
    shape([...standPts.map(([x, y]) => [x, y]), ], col, 1.6); shape(mirrorX(standPts), col, 1.6);
    if (!band) {
      const leaf = [[top[0] + 0.2, top[1] - 1.3], [top[0] + 0.9, top[1] + 0.8], [cf[0] + 1.3, cf[1] + 1.4], [cf[0] + 0.15, cf[1] - 0.2]];
      shape(leaf, col, 1.6); shape(mirrorX(leaf), col, 1.6);
      line([leaf[1], leaf[2]], st); line(mirrorX([leaf[1], leaf[2]]), st);
    } else { line(neck.map(([x, y]) => [x, y - 0.6]), st); line(mirrorX(neck.map(([x, y]) => [x, y - 0.6])), st); }
  }

  /* ----- skirts, trousers and the pyjama family: front view ----- */
  function lowerView() {
    const L = get({ skirt: 'skirtF', trousers: 'tfront', pants: 'pfront' }[garment]);
    if (garment === 'skirt') {
      const named = L.outline.edges.some((e) => e.name === 'side');
      let half;
      if (named) half = outline(L);
      else { const t = (ctx.m.waist || 30) / 4 + 0.5, h = maxY(outline(L)); half = [[0, 0], [t, 0], [t * 1.9, h], [0, h]]; }
      const right = half.filter((p) => p[0] >= 0), whole = [...right, ...mirrorX(right)];
      shape(whole);
      const side = named ? edgePts(L, 'side') : [right[1], right[2]], hemY = maxY(whole);
      const sideSt = state(['side']);
      line(side, sideSt); line(mirrorX(side), sideSt);
      const top = Math.max(...whole.filter((p) => p[1] < 1).map((p) => p[0])), bot = Math.max(...whole.filter((p) => p[1] > hemY - 1).map((p) => p[0]));
      waist(top, garment);
      if (feat('gathers') && !named) for (let x = -top + 1; x < top; x += 1.4) extras.push({ t: 'gather', a: [x, 0.3], b: [x * 1.15, 2.6] });
      if (feat('zip')) { const zp = [[side[0][0] + 0.15, 0.4], [side[0][0] + 0.6, 7.5]]; extras.push({ t: 'zip', a: zp[0], b: zp[1] }); line(zp, feat('zip')); }
      line([[-bot + 0.4, hemY - 1], [bot - 0.4, hemY - 1]], state(['hem']));
      if (g.key === 'press' && !focus) focus = side[1] || side[0];
      return;
    }
    // trouser and pyjama legs, as seen from the front: two legs meeting at the centre front
    const wp = edgePts(L, 'waist casing').length ? edgePts(L, 'waist casing') : edgePts(L, 'waist');
    const sx = -wp[wp.length - 1][0], ins = edgePts(L, 'inseam'), crotchY = ins[0][1], hp = edgePts(L, 'hem'), hemY = maxY(hp);
    const sidePts = edgePts(L, 'side').map(([x, y]) => [x + sx, y]);
    const hemIn = Math.min(hp[0][0] + sx, -0.8), sideBot = sidePts[0];
    const leg = [...wp.map(([x, y]) => [x + sx, y]), [0, crotchY], [hemIn, hemY], ...sidePts];
    // the two fronts stay apart until the centre front is sewn (fly, or the crotch seam)
    const cfAt = firstWith(garment === 'trousers' ? /tfront:(front crotch|fly)$/ : /:crotch$/), gap = cfAt >= 0 && k >= cfAt ? 0 : 1.6;
    const Lx = (pts) => pts.map(([x, y]) => [x - gap / 2, y]), Rx = (pts) => pts.map(([x, y]) => [-x + gap / 2, y]);
    shape(Lx(leg)); shape(Rx(leg).reverse());
    const pair = (pts, st) => { line(Lx(pts), st); line(Rx(pts), st); };
    pair(sidePts, state(['side']));
    pair([[0, crotchY], [hemIn, hemY]], state(['inseam']));
    const cf = state(['crotch', 'front crotch', 'seat seam', 'fly']);
    if (cf) line([[0, 0.3], [0, crotchY]], cf);
    pair([[hemIn + 0.2, hemY - 1], [sideBot[0] - 0.2, hemY - 1]], state(['hem']));
    const sideTop = sidePts[sidePts.length - 1][0];
    if (feat('pockets')) {
      const slant = garment === 'trousers' && ctx.pieces.some((x) => x.piece.id === 'pfacing') && !/side/i.test(ctx.design.id);
      const pk = slant ? [[sideTop * 0.55, 0.3], [xOn(sidePts, 6.5) + 0.2, 6.5]] : [[xOn(sidePts, 1.5) + 0.25, 1.5], [xOn(sidePts, 7.5) + 0.25, 7.5]];
      pair(pk, feat('pockets'));
    }
    if (feat('pleats') && g.actions.concat(groups.flatMap((x) => x.actions)).some((a) => /pleat/i.test(a.cap))) pair([[sideTop * 0.45, 0.2], [sideTop * 0.45, 3]], 'done');
    if (feat('fly')) { const j = [[-1.4, 0.4], [-1.4, 5.6], [-1.0, 6.6], [0, 7]]; line(j, feat('fly')); }
    waist(-sideTop + gap / 2, garment);
    if (feat('loops') || state(['waist'], ['band'])) for (const x of [0.85, 0.4]) for (const s of [-1, 1]) extras.push({ t: 'loop', p: [s * (-sideTop) * x, 0] });
    if (g.key === 'press' && garment === 'trousers') { pair([[sideTop * 0.5, 0.5], [sideTop * 0.5 + (sideBot[0] - sideTop) * 0.3, hemY - 0.5]], 'now'); }
  }
  function xOn(pts, y) {
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]); }
    return pts[0][0];
  }
  function waist(halfW, kind) {
    const bandPiece = get('band') || get('wband'), bandSt = state(['waist'], ['band']) || state(['waist'], [get('wband') ? 'skirtF' : '_']);
    const hasBand = bandPiece && (feat('band') || bandSt) && (kind !== 'skirt' || get('wband'));
    if (hasBand) {
      const h = Math.min(2, (maxY(outline(bandPiece)) || 3) / 2);
      shape([[-halfW, -h], [halfW, -h], [halfW, 0], [-halfW, 0]]);
      line([[-halfW + 0.2, -0.1], [halfW - 0.2, -0.1]], bandSt || feat('band'));
    } else {
      const cs = state(['waist casing']) || (kind === 'skirt' && !get('wband') ? state(['waist']) : '') || (feat('casing') && !bandPiece ? feat('casing') : '');
      line([[-halfW + 0.3, 1], [halfW - 0.3, 1]], cs);
    }
  }

  // the last press points at a seam sewn before, so it still has a label and a close-up
  if (!focus && g.key === 'press' && lines.length) focus = mid(lines[0].pts);

  /* ----- to the 800×500 stage ----- */
  const all = shapes.flatMap((s) => s.pts).concat(lines.flatMap((l) => l.pts));
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const inset = (g.opt.inset || []).map(get).filter(Boolean).slice(0, 3);
  const room = inset.length || focus ? 520 : 700;
  const s = Math.min(room / (x1 - x0), 372 / (y1 - y0));
  const ox = 28 + (room - (x1 - x0) * s) / 2 - x0 * s, oy = 74 + (372 - (y1 - y0) * s) / 2 - y0 * s;
  const M = ([x, y]) => [n1(ox + x * s), n1(oy + y * s)];
  const P = (pts) => 'M' + pts.map((p) => M(p).join(' ')).join(' L');
  let art = '';
  for (const sh of shapes) art += `<path d="${P(sh.pts)} Z" fill="${sh.fill}" stroke="${INK}" stroke-width="${sh.w}" stroke-linejoin="round"/>`;
  for (const e of extras) {
    if (e.t === 'tag') { const [x, y] = M(e.p); art += `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 15px var(--f-display);letter-spacing:.12em;fill:${INK};opacity:.55">${e.s}</text>`; }
    if (e.t === 'gather') art += `<path d="${P([e.a, e.b])}" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2" fill="none"/>`;
    if (e.t === 'btn') { const [x, y] = M(e.p); art += `<circle cx="${x}" cy="${y}" r="${n1(Math.max(4, s * 0.3))}" fill="#fff" stroke="${e.st === 'now' ? ACCENT : INK}" stroke-width="${e.st === 'now' ? 3 : 1.5}"/>`; }
    if (e.t === 'zip') art += `<path d="${P([e.a, e.b])}" stroke="${INK}" stroke-width="3" stroke-dasharray="2 2" fill="none"/>`;
    if (e.t === 'loop') { const [x, y] = M(e.p); art += `<rect x="${n1(x - 4)}" y="${n1(y - s * 1.9)}" width="8" height="${n1(s * 1.9)}" fill="${col}" stroke="${INK}" stroke-width="1.5"/>`; }
  }
  for (const l of lines) art += l.st === 'now'
    ? `<path d="${P(l.pts)}" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-dasharray="9 5" stroke-linecap="round"/>`
    : `<path d="${P(l.pts)}" fill="none" stroke="${INK}" stroke-opacity=".75" stroke-width="1.4" stroke-dasharray="5 4"/>`;

  // the label points at the seam sewn now
  let note = '';
  const label = g.opt.label || g.title;
  if (focus) {
    const [fx, fy] = M(focus), tx = 572, ty = Math.max(84, Math.min(220, fy - 20));
    note = `<g><path d="M${fx} ${fy} L${tx} ${ty}" stroke="${ACCENT}" stroke-width="1.6" fill="none"/><circle cx="${fx}" cy="${fy}" r="5" fill="${ACCENT}"/>` +
      `<rect x="${tx}" y="${ty - 16}" width="${n1(label.length * 8.2 + 26)}" height="32" rx="16" fill="${ACCENT}"/>` +
      `<text x="${tx + 13}" y="${ty + 5}" style="font:700 14px var(--f-body);fill:#fff">${esc(label)}</text></g>`;
  }
  // beside it: the small parts this stage makes, or a close-up of the seam
  let side = '';
  if (inset.length) side = card(inset, nowE, g.opt.hi || [], col);
  else if (focus) {
    const [fx, fy] = M(focus), r = 92, zx = 680, zy = 372, z = 2.6;
    side = `<clipPath id="zf-${k}"><circle cx="${zx}" cy="${zy}" r="${r}"/></clipPath>` +
      `<circle cx="${fx}" cy="${fy}" r="${n1(r / z)}" fill="none" stroke="${INK}" stroke-width="1.4"/>` +
      `<line x1="${n1(fx + (r / z) * 0.7)}" y1="${n1(fy + (r / z) * 0.7)}" x2="${n1(zx - r * 0.7)}" y2="${n1(zy - r * 0.7)}" stroke="${INK}" stroke-width="1.2" stroke-dasharray="4 4"/>` +
      `<circle cx="${zx}" cy="${zy}" r="${r + 4}" fill="#fff" stroke="${INK}" stroke-width="2"/>` +
      `<g clip-path="url(#zf-${k})"><rect x="${zx - r}" y="${zy - r}" width="${2 * r}" height="${2 * r}" fill="${PAPER}"/>` +
      `<g transform="translate(${n1(zx - fx * z)} ${n1(zy - fy * z)}) scale(${z})">${art}</g></g>` +
      `<text x="${zx}" y="${zy + r + 22}" text-anchor="middle" style="font:700 11px var(--f-body);letter-spacing:.1em;fill:${INK}">CLOSE-UP</text>`;
  }
  return `<rect width="800" height="500" fill="${PAPER}"/>` +
    `<text x="28" y="42" style="font:800 22px var(--f-display);fill:${INK}">${esc(g.title)}</text>` +
    art + side + note +
    `<g transform="translate(28 476)" style="font:600 13px var(--f-body);fill:#4a4a47"><rect width="18" height="12" fill="${col}" stroke="${INK}"/><text x="24" y="10">Your fabric, good side</text>` +
    `<path d="M190 6 h28" stroke="${ACCENT}" stroke-width="4" stroke-dasharray="9 5"/><text x="224" y="10">Sew now</text>` +
    `<path d="M300 6 h28" stroke="${INK}" stroke-width="1.4" stroke-dasharray="5 4"/><text x="334" y="10">Sewn before</text></g>`;
}

/** The small pieces a stage makes, drawn on their own in a card, with the edges sewn now in orange. */
function card(pieces, nowE, hi, col) {
  const X = 556, Y = 250, W = 228, H = 206, pad = 16;
  const boxes = pieces.map((p) => { const o = p.fold ? [...outline(p), ...mirrorX(outline(p))] : outline(p); const xs = o.map((q) => q[0]), ys = o.map((q) => q[1]); return { p, o, x0: Math.min(...xs), y0: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }; });
  const totH = boxes.reduce((a, b) => a + b.h, 0) + (boxes.length - 1) * 2.5, maxW = Math.max(...boxes.map((b) => b.w));
  const s = Math.min((W - 2 * pad) / maxW, (H - 2 * pad - 18 * boxes.length) / totH, 14);
  let y = Y + pad, out = `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="16" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
  for (const b of boxes) {
    const ox = X + (W - b.w * s) / 2 - b.x0 * s, oy = y + 16 - b.y0 * s;
    const M = ([px, py]) => `${n1(ox + px * s)} ${n1(oy + py * s)}`;
    out += `<text x="${X + W / 2}" y="${n1(y + 11)}" text-anchor="middle" style="font:700 11px var(--f-body);letter-spacing:.08em;fill:${INK}">${esc(b.p.name.toUpperCase())}</text>`;
    out += `<path d="M${b.o.map(M).join(' L')} Z" fill="${col}" stroke="${INK}" stroke-width="1.6"/>`;
    const marked = (e) => e.name && (nowE.has(`${b.p.id}:${e.name}`) || hi.includes(e.name));
    // a piece with no named edge sewn now is made whole in this stage: outline all of it
    if (!b.p.outline.edges.some(marked)) out += `<path d="M${b.o.map(M).join(' L')} Z" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-dasharray="7 4"/>`;
    for (const e of b.p.outline.edges) {
      if (!marked(e)) continue;
      out += `<path d="M${e.pts.map(M).join(' L')}" fill="none" stroke="${ACCENT}" stroke-width="3.5" stroke-dasharray="7 4" stroke-linecap="round"/>`;
      if (b.p.fold) out += `<path d="M${e.pts.map(([a, c]) => [-a, c]).map(M).join(' L')}" fill="none" stroke="${ACCENT}" stroke-width="3.5" stroke-dasharray="7 4" stroke-linecap="round"/>`;
    }
    y += b.h * s + 18 + 2.5 * s;
  }
  return out;
}
