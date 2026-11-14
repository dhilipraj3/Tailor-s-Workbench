import { DESIGNS, GARMENTS } from '../garments/index';
import { EXTRA_LEVELS } from '../engine/sizes';
import { store, save, uid, project as getProject, personFor } from '../core/store.js';
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

export function renderDesign(el, designId, editProjectId) {
  const design = DESIGNS.find((d) => d.id === designId) || DESIGNS[0];
  const g = GARMENTS[design.garment];
  const editing = editProjectId ? getProject(editProjectId) : null;
  const st = { options: { ...(editing?.options || design.options) }, personId: editing?.personId || personFor(design.for || 'man')?.id || 'new', extra: editing?.extra || 'standard' };
  const draw = () => {
    el.innerHTML = `<div class="design">
      <div class="design-preview">
        <div class="preview-card">${sketchSvg(g.id, st.options, null, 'hero', design.color)}</div>
        <h1 class="h1">${esc(design.name)}</h1>
        <div class="meta">${levelDots(design.level)}<span class="hrs">⏱ about ${design.hours} hours</span></div>
      </div>
      <div class="design-opts">
        ${g.options.map((grp) => `<section class="optgrp"><h3>${grp.label}</h3><div class="tiles">${grp.values.map((v) => {
          const sel = st.options[grp.id] === v.id;
          const pic = SPECIAL[grp.id] ? SPECIAL[grp.id](grp.id === 'backPockets' ? +v.id : v.id, g.id) : sketchSvg(g.id, { ...st.options, [grp.id]: v.id }, grp.crop, '', design.color);
          return `<button class="tile" data-opt="${grp.id}" data-val="${v.id}" aria-pressed="${sel}">${pic}<span>${v.label}</span></button>`;
        }).join('')}</div></section>`).join('')}
        <section class="optgrp"><h3>Who is it for?</h3><div class="tiles people">${store.profiles.map((p) => `<button class="tile person" data-person="${p.id}" aria-pressed="${st.personId === p.id}">${avatar(p, 54)}<span>${esc(p.name)}</span></button>`).join('')}
          ${!personFor(design.for || 'man') ? `<button class="tile person" data-person="new" aria-pressed="${st.personId === 'new'}"><span class="avatar" style="--c:#8a8f94;width:54px;height:54px;font-size:24px">+</span><span>New ${({ man: 'man', woman: 'woman', child: 'child' })[design.for || 'man']}</span></button>` : ''}<a class="tile person add" href="#/people/new">${IC.plus}<span>Add</span></a></div></section>
        <section class="optgrp"><h3>Extra cloth for later</h3><div class="tiles">${EXTRA_LEVELS.map((x) => `<button class="tile extra" data-extra="${x.id}" aria-pressed="${st.extra === x.id}">
          <svg viewBox="0 0 80 50" aria-hidden="true"><rect x="10" y="${32 - x.scale * 8}" width="60" height="${10 + x.scale * 8}" rx="3" fill="rgba(242,140,40,.55)"/><rect x="10" y="32" width="60" height="10" rx="2" fill="rgba(31,111,214,.35)"/><path d="M10 42 H70" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 3"/></svg><span>${x.label}</span></button>`).join('')}</div></section>
        <button class="cta" id="start">${editing ? IC.check + ' Save changes' : IC.scissors + ' Start making'}</button>
      </div></div>`;
  };
  draw();
  el.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.opt) { st.options[b.dataset.opt] = b.dataset.val; draw(); }
    else if (b.dataset.person) { st.personId = b.dataset.person; draw(); }
    else if (b.dataset.extra) { st.extra = b.dataset.extra; draw(); speak(EXTRA_LEVELS.find((x) => x.id === st.extra).say); }
    else if (b.id === 'start') {
      if (st.personId === 'new') st.personId = personFor(design.for || 'man', true).id;
      let p = editing;
      if (p) Object.assign(p, { options: st.options, personId: st.personId, extra: st.extra, step: 0, done: [] });
      else { p = { id: uid(), designId: design.id, options: st.options, personId: st.personId, extra: st.extra, created: Date.now(), step: 0, done: [] }; store.projects.push(p); }
      save(); location.hash = `#/project/${p.id}/pattern`;
    }
  };
}
