import { DESIGNS } from '../garments/index';
import { EXTRA_LEVELS } from '../engine/sizes';
import { buildCtx, pieceSvg, sheetSvg, layoutFabric } from '../engine/project';
import { extraAt } from '../engine/geometry';
import { store, save, person, project as getProject } from '../core/store.js';
import { f } from '../core/units.js';
import { stageSvg } from '../art/svg.js';
import { sketchSvg, esc, avatar, download } from './common.js';
import { mountPlayer } from './player.js';
import { makeSteps, layoutScene, syncLegacy } from './make-steps.js';
import { IC } from './icons.js';

let cleanup = null;

export function projectCtx(p) {
  const who = person(p.personId);
  return buildCtx(p.designId, p.options, who.m, p.extra, who.name);
}

/** Which seams get how much: sewing space + extra cloth, grouped by seam name. */
function allowanceRows(ctx) {
  const rows = new Map();
  for (const g of ctx.pieces) {
    if (g.piece.simple) continue;
    for (const e of g.piece.outline.edges) {
      if (e.allow.fold || !e.name) continue;
      const ex = [extraAt(e.allow, 0), extraAt(e.allow, 1)].map((x) => x * ctx.extraScale);
      const key = `${e.name}|${e.allow.sa}`;
      if (!rows.has(key)) rows.set(key, { name: e.name, sa: e.allow.sa, all: [], pieces: new Set() });
      const r = rows.get(key); r.all.push(...ex); r.pieces.add(g.piece.name);
    }
  }
  // a seam made of several edges (e.g. the tapering seat seam) shows its biggest → smallest extra
  return [...rows.values()].map((r) => ({ ...r, ex: [Math.max(...r.all), Math.min(...r.all)] })).sort((a, b) => b.ex[0] - a.ex[0]);
}

export function renderProject(el, id, tab = 'pattern', stepAt, atTime) {
  cleanup?.(); cleanup = null;
  const p = getProject(id);
  if (!p) { el.innerHTML = `<p class="empty">This project was deleted. <a href="#/">Choose a design</a></p>`; return; }
  const ctx = projectCtx(p), who = person(p.personId), d = DESIGNS.find((x) => x.id === p.designId);
  syncLegacy(ctx);
  const tabs = [['pattern', IC.pattern, 'Pattern'], ['fabric', IC.fabric, 'Fabric'], ['make', IC.scissors, 'Make it']];
  el.innerHTML = `<div class="proj">
    <header class="proj-head">${sketchSvg(d.garment, p.options, null, '', d.color)}<div><h1 class="h1">${esc(d.name)}</h1>
      <span class="row">${avatar(who, 28)} ${esc(who.name)} · ${EXTRA_LEVELS.find((x) => x.id === p.extra)?.label} extra cloth</span></div>
      <a class="btn" href="#/design/${d.id}?p=${p.id}">${IC.edit} Change</a></header>
    <nav class="tabs">${tabs.map(([k, ic, l]) => `<a class="tab" href="#/project/${p.id}/${k}" aria-selected="${tab === k}">${ic}<span>${l}</span></a>`).join('')}</nav>
    <div id="tabbody"></div></div>`;
  const body = el.querySelector('#tabbody');
  const fabricW = () => p.fabricW || 58;
  if (tab === 'pattern') {
    const rows = allowanceRows(ctx);
    body.innerHTML = `
      <a class="nopr" href="#/project/${p.id}/make">${IC.scissors}<span><b>No printer needed</b>The Make it tab shows how to chalk every piece straight onto the fabric, point by point.</span></a>
      <div class="actions">
        <button class="cta" id="pdf-a4">${IC.print} Print at home <small>optional · A4 pages</small></button>
        <button class="btn big2" id="pdf-full">${IC.file} Print shop <small>one big sheet</small></button>
        <button class="btn big2" id="svg">${IC.download} SVG file</button>
      </div>
      <div class="legend">
        <span><i class="lg cut"></i>Cut</span><span><i class="lg sew"></i>Sew</span><span><i class="lg sa"></i>Sewing space</span><span><i class="lg ex"></i>Extra cloth for later</span><span><i class="lg mk"></i>Marks</span>
      </div>
      <p class="hint">All pieces are drawn to the same scale.</p>
      <div class="pieces">${(() => { const k = Math.min(9, 330 / Math.max(...ctx.pieces.map((g) => g.box[3] - g.box[1])));
        return ctx.pieces.map((g) => { const s = pieceSvg(g, {}); return `<figure class="piece"><svg viewBox="0 0 ${s.w.toFixed(2)} ${s.h.toFixed(2)}" width="${(s.w * k).toFixed(0)}" height="${(s.h * k).toFixed(0)}">${s.inner}</svg><figcaption><b>${esc(g.piece.name)}</b><span>×${g.piece.n}</span></figcaption></figure>`; }).join(''); })()}</div>
      <section class="sec"><h2 class="h2">Extra cloth on each seam</h2><div class="allow">${rows.map((r) => `
        <div class="arow"><span class="aname">${esc(r.name)}</span><span class="abar"><i class="a-sa" style="width:${r.sa * 60}px"></i><i class="a-ex" style="width:${Math.max(...r.ex) * 60}px"></i></span>
        <span class="aval"><b>${f(r.sa)}</b> + <b class="ex">${r.ex[0] === r.ex[1] ? f(r.ex[0]) : f(r.ex[0]) + '→' + f(r.ex[1])}</b></span><span class="apcs">${[...r.pieces].map(esc).join(', ')}</span></div>`).join('')}</div></section>`;
    const busy = (b, on) => { b.disabled = on; b.classList.toggle('busy', on); };
    body.querySelector('#pdf-a4').onclick = async (e) => { const b = e.currentTarget; busy(b, true); const { makePdf } = await import('../export/pdf'); download(await makePdf(ctx, 'a4'), `${d.id}-${who.name}-A4.pdf`, 'application/pdf'); busy(b, false); };
    body.querySelector('#pdf-full').onclick = async (e) => { const b = e.currentTarget; busy(b, true); const { makePdf } = await import('../export/pdf'); download(await makePdf(ctx, 'full'), `${d.id}-${who.name}-full-size.pdf`, 'application/pdf'); busy(b, false); };
    body.querySelector('#svg').onclick = () => download(sheetSvg(ctx, { person: who.name }), `${d.id}-${who.name}.svg`, 'image/svg+xml');
  } else if (tab === 'fabric') {
    const draw = () => {
      const { svg, lay } = layoutScene(ctx, fabricW(), false);
      const lining = layoutFabric(ctx, 44, 'lining');
      const sup = ctx.garment.supplies(ctx.m, ctx.options);
      body.innerHTML = `<div class="chips">${[36, 44, 58].map((w) => `<button class="chip" data-w="${w}" aria-pressed="${fabricW() === w}">${w}″ · ${Math.round(w * 2.54)} cm</button>`).join('')}</div>
        <div class="fab-big"><span class="m">${lay.metres}<small>m</small></span><span>of ${fabricW()}″ fabric${lining.placed.length ? ` · plus ${lining.metres} m pocket fabric` : ''}</span></div>
        <div class="levels">${EXTRA_LEVELS.map((x) => { const m = layoutFabric(buildCtx(p.designId, p.options, who.m, x.id), fabricW()).metres;
          return `<span class="lvlc ${x.id === p.extra ? 'cur' : ''}"><i style="height:${8 + x.scale * 8}px"></i>${x.label}<b>${m} m</b></span>`; }).join('')}</div>
        ${lay.open ? '<p class="warn">Some pieces are wider than the folded fabric. Cut them from open (unfolded) fabric.</p>' : ''}
        <div class="stage">${stageSvg(svg)}</div>
        <h2 class="h2">Also buy</h2>
        <div class="sup">${sup.map((s) => `<div class="supi"><b>${esc(s.qty)}</b><span>${esc(s.say)}</span></div>`).join('')}</div>`;
    };
    draw();
    body.onclick = (e) => { const b = e.target.closest('[data-w]'); if (b) { p.fabricW = +b.dataset.w; save(); draw(); } };
  } else {
    const steps = makeSteps(ctx, fabricW());
    if (p.total !== steps.length) { p.total = steps.length; p.done = p.done.filter((x) => x < steps.length); save(); }
    cleanup = mountPlayer(body, {
      steps, start: stepAt ?? p.step ?? 0, atTime: atTime == null ? null : +atTime, done: p.done, finishIcon: IC.star,
      onIndex: (i) => { p.step = i; for (let j = 0; j < i; j++) if (!p.done.includes(j)) p.done.push(j); save(); },
      onFinish: () => { for (let j = 0; j < steps.length; j++) if (!p.done.includes(j)) p.done.push(j); save(); location.hash = '#/'; },
    });
  }
}

export function leaveProject() { cleanup?.(); cleanup = null; }
