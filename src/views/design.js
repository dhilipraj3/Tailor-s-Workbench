import { DESIGNS, GARMENTS } from '../garments/index';
import { EXTRA_LEVELS } from '../engine/sizes';
import { store, save, uid, project as getProject } from '../core/store.js';
import { speak } from '../core/speech.js';
import { sketchSvg, levelDots, esc, avatar } from './common.js';
import { IC } from './icons.js';

// Little pictures for options that the front sketch can't show.
const SPECIAL = {
  backPockets: (v) => `<svg class="sketch trousers" viewBox="-4 -4 98 50"><path d="M4 0 L86 0 L92 44 L-2 44 Z" class="sk"/><path d="M4 0 L86 0 L86 8 L4 8 Z" class="sk2"/>${v >= 1 ? '<path d="M56 20 L76 20" class="skl" stroke-width="3"/>' : ''}${v >= 2 ? '<path d="M14 20 L34 20" class="skl" stroke-width="3"/>' : ''}</svg>`,
  backPleat: (v) => `<svg class="sketch shirt" viewBox="20 -6 120 70"><path d="M36 12 L58 6 Q 80 14 102 6 L124 12 L124 64 L36 64 Z" class="sk"/><path d="M36 22 L124 22" class="skl"/>${v === 'box' ? '<path d="M74 22 L74 64 M86 22 L86 64" class="skl"/><path d="M74 26 L80 30 L86 26" class="skl"/>' : ''}</svg>`,
  fit: (v, g) => sketchSvg(g, { ...DEFAULT_OPTS[g], fit: v }),
};
const DEFAULT_OPTS = Object.fromEntries(Object.keys(GARMENTS).map((g) => [g, DESIGNS.find((d) => d.garment === g).options]));

export function renderDesign(el, designId, editProjectId) {
  const design = DESIGNS.find((d) => d.id === designId) || DESIGNS[0];
  const g = GARMENTS[design.garment];
  const editing = editProjectId ? getProject(editProjectId) : null;
  const st = { options: { ...(editing?.options || design.options) }, personId: editing?.personId || store.profiles[0].id, extra: editing?.extra || 'standard' };
  const draw = () => {
    el.innerHTML = `<div class="design">
      <div class="design-preview">
        <div class="preview-card">${sketchSvg(g.id, st.options, null, 'hero')}</div>
        <h1 class="h1">${esc(design.name)}</h1>
        <div class="meta">${levelDots(design.level)}<span class="hrs">⏱ about ${design.hours} hours</span></div>
      </div>
      <div class="design-opts">
        ${g.options.map((grp) => `<section class="optgrp"><h3>${grp.label}</h3><div class="tiles">${grp.values.map((v) => {
          const sel = st.options[grp.id] === v.id;
          const pic = SPECIAL[grp.id] ? SPECIAL[grp.id](grp.id === 'backPockets' ? +v.id : v.id, g.id) : sketchSvg(g.id, { ...st.options, [grp.id]: v.id }, grp.crop);
          return `<button class="tile" data-opt="${grp.id}" data-val="${v.id}" aria-pressed="${sel}">${pic}<span>${v.label}</span></button>`;
        }).join('')}</div></section>`).join('')}
        <section class="optgrp"><h3>Who is it for?</h3><div class="tiles people">${store.profiles.map((p) => `<button class="tile person" data-person="${p.id}" aria-pressed="${st.personId === p.id}">${avatar(p, 54)}<span>${esc(p.name)}</span></button>`).join('')}
          <a class="tile person add" href="#/people/new">${IC.plus}<span>Add</span></a></div></section>
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
      let p = editing;
      if (p) Object.assign(p, { options: st.options, personId: st.personId, extra: st.extra, step: 0, done: [] });
      else { p = { id: uid(), designId: design.id, options: st.options, personId: st.personId, extra: st.extra, created: Date.now(), step: 0, done: [] }; store.projects.push(p); }
      save(); location.hash = `#/project/${p.id}/pattern`;
    }
  };
}
