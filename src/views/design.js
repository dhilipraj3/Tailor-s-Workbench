import { DESIGNS, GARMENTS } from '../garments/index';
import { EXTRA_LEVELS } from '../engine/sizes';
import { store, save, uid, project as getProject, personFor, newPerson } from '../core/store.js';
import { S } from '../core/state.js';
import { buildCtx, layoutFabric } from '../engine/project';
import { makeSteps } from './make-steps.js';
import { TAG, designPhoto } from './catalog.js';
import { speak } from '../core/speech.js';
import { sketchSvg, levelDots, esc, avatar } from './common.js';
import { IC } from './icons.js';

// Little pictures for options that the front sketch can't show.
const SPECIAL = {
  backPockets: (v) => `<svg class="sketch trousers" viewBox="-4 -4 98 50"><path d="M4 0 L86 0 L92 44 L-2 44 Z" class="sk"/><path d="M4 0 L86 0 L86 8 L4 8 Z" class="sk2"/>${v >= 1 ? '<path d="M56 20 L76 20" class="skl" stroke-width="3"/>' : ''}${v >= 2 ? '<path d="M14 20 L34 20" class="skl" stroke-width="3"/>' : ''}</svg>`,
  backPleat: (v) => `<svg class="sketch shirt" viewBox="20 -6 120 70"><path d="M36 12 L58 6 Q 80 14 102 6 L124 12 L124 64 L36 64 Z" class="sk"/><path d="M36 22 L124 22" class="skl"/>${v === 'box' ? '<path d="M74 22 L74 64 M86 22 L86 64" class="skl"/><path d="M74 26 L80 30 L86 26" class="skl"/>' : ''}</svg>`,
  fit: (v, g) => sketchSvg(g, { ...DEFAULT_OPTS[g], fit: v }),
  // back of the blouse/kurta: plain neck, deep U, or a keyhole with tie strings
  back: (v) => `<svg class="sketch tunic" viewBox="30 -4 100 70" aria-hidden="true"><path d="M58 6 L36 12 L36 64 L124 64 L124 12 L102 6 ${v === 'deepu' ? 'Q102 44 80 44 Q58 44 58 6' : 'Q80 12 58 6'} Z" class="sk"/>${
    v === 'keyhole' ? '<path d="M80 9 L80 26" class="skl" stroke-width="2"/><path d="M80 9 Q72 26 70 40 M80 9 Q88 26 90 40" class="skl"/><circle cx="70" cy="41" r="1.6" class="skb"/><circle cx="90" cy="41" r="1.6" class="skb"/>' : ''}</svg>`,
};
const DEFAULT_OPTS = Object.fromEntries(Object.keys(GARMENTS).map((g) => [g, DESIGNS.find((d) => d.garment === g).options]));

/** One line about each kind of garment, shown under the design name. */
function describe(design, o) {
  const g = design.garment;
  if (g === 'shirt') return `A ${o.sleeve === 'half' ? 'short-sleeve' : 'long-sleeve'} shirt with ${o.collar === 'mandarin' ? 'a band collar' : 'a collar on a stand'}, a button band${o.sleeve === 'half' ? '' : ' and cuffs'}. Our most detailed design.`;
  if (g === 'trousers') return `Tailored trousers with a zip fly, ${o.pocket === 'side' ? 'side' : 'slanted'} front pockets${+o.backPockets ? ' and back welt pockets' : ''}, and a waistband you can let out later.`;
  if (g === 'tunic') return o.opening === 'fronthooks' ? 'A fitted, lined blouse with darts and front hooks. Choose the neckline and the back.'
    : `A ${o.length === 'knee' ? 'knee-length' : 'comfortable'} ${design.for === 'woman' ? 'kurti' : 'kurta'}${o.opening === 'halfplacket' ? ' with a front placket' : ''}${o.slits === 'yes' ? ' and side slits' : ''}.`;
  if (g === 'pants') return 'An easy pull-on design with an elastic or drawstring waist. A good first project.';
  if (g === 'skirt') return `A ${o.style === 'gathered' ? 'gathered' : 'flared A-line'} skirt with ${o.waist === 'band' ? 'a waistband and zip' : 'an elastic waist'}.`;
  return 'A fitted bodice joined to a skirt at the waist, closed with a back zip.';
}

export function renderDesign(el, designId, editProjectId) {
  const design = DESIGNS.find((d) => d.id === designId) || DESIGNS[0];
  const g = GARMENTS[design.garment];
  const editing = editProjectId ? getProject(editProjectId) : null;
  const st = { options: { ...(editing?.options || design.options) }, personId: editing?.personId || personFor(design.for || 'man')?.id || 'new', extra: editing?.extra || 'standard' };
  const kindWord = ({ man: 'man', woman: 'woman', child: 'child' })[design.for || 'man'];
  const draw = () => {
    // the drawing always shows exactly what will be made, with the options chosen
        const who = store.profiles.find((p) => p.id === st.personId);
    let metres = '–', count = '';
    try {
      S.unit = store.unit;
      const ctx = buildCtx(design.id, st.options, who?.m || newPerson('x', 0, design.for || 'man').m, st.extra, who?.name || '');
      metres = layoutFabric(ctx, 44).metres + ' m';
      count = ` · ${makeSteps(ctx, 44).length} STEPS`;
    } catch (e) { /* preview numbers are a nicety; the project page recomputes them */ }
    el.innerHTML = `<div class="dz">
      <div class="dz-left">
        <a class="back-link" href="#/designs">← ALL DESIGNS</a>
        <figure class="dz-stage">${sketchSvg(g.id, st.options, null, 'hero', design.color)}${Object.entries(design.options).every(([k, v]) => st.options[k] === v) ? designPhoto(design.id) : ''}</figure>
      </div>
      <aside class="dz-right" aria-label="Options">
        <span class="eyebrow">${esc(TAG(design))}</span>
        <h1 class="h1">${esc(design.name)}</h1>
        <p class="dz-desc">${esc(describe(design, st.options))}</p>
        <div class="dz-stats"><div><b>Level ${design.level}</b><span>of 5</span></div><div><b>${design.hours} h</b><span>to make</span></div><div><b>${metres}</b><span>fabric, 44″</span></div></div>
        ${g.options.map((grp) => `<section class="og"><h3 id="og-${grp.id}">${grp.label}</h3><div class="pills" role="group" aria-labelledby="og-${grp.id}">${grp.values.map((v) =>
          `<button class="pill" data-opt="${grp.id}" data-val="${v.id}" aria-pressed="${st.options[grp.id] === v.id}">${esc(v.label)}</button>`).join('')}</div></section>`).join('')}
        <section class="og"><h3 id="og-who">Making it for</h3><div class="pills" role="group" aria-labelledby="og-who">${store.profiles.map((p) =>
          `<button class="pill person" data-person="${p.id}" aria-pressed="${st.personId === p.id}">${avatar(p, 36)}<span>${esc(p.name)}</span></button>`).join('')}
          ${!personFor(design.for || 'man') ? `<button class="pill person" data-person="new" aria-pressed="${st.personId === 'new'}"><span class="avatar" style="--c:#4a4a47;width:36px;height:36px;font-size:16px">+</span><span>New ${kindWord}</span></button>` : ''}
          <a class="pill add" href="#/people/new">+ Add person</a></div></section>
        <section class="og"><label class="og-l" for="extra">Extra cloth for later</label>
          <select id="extra">${EXTRA_LEVELS.map((x) => `<option value="${x.id}" ${st.extra === x.id ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}</select></section>
        <button class="cta start" id="start"><span>${editing ? 'SAVE CHANGES' : `START MAKING${count}`}</span><span class="cta-i" aria-hidden="true">${IC.next}</span></button>
        <p class="hint center">Pattern, fabric list and steps are made for the person you choose.</p>
      </aside></div>`;
    el.querySelector('#extra').onchange = (e) => { st.extra = e.target.value; draw(); speak(EXTRA_LEVELS.find((x) => x.id === st.extra).say); };
  };
  draw();
  el.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.opt) { st.options[b.dataset.opt] = b.dataset.val; draw(); }
    else if (b.dataset.person) { st.personId = b.dataset.person; draw(); }
    else if (b.id === 'start') {
      if (st.personId === 'new') st.personId = personFor(design.for || 'man', true).id;
      let p = editing;
      if (p) Object.assign(p, { options: st.options, personId: st.personId, extra: st.extra, step: 0, done: [] });
      else { p = { id: uid(), designId: design.id, options: st.options, personId: st.personId, extra: st.extra, created: Date.now(), step: 0, done: [] }; store.projects.push(p); }
      save(); location.hash = `#/project/${p.id}/pattern`;
    }
  };
}
