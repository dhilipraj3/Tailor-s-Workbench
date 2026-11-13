import { DESIGNS, FILTERS } from '../garments/index';
import { store, person, save } from '../core/store.js';
import { sketchSvg, levelDots, esc, avatar, armConfirm } from './common.js';
import { IC } from './icons.js';

let filter = 'all';

export function renderCatalog(el) {
  const list = DESIGNS.filter((d) => filter === 'all' || d.tags.includes(filter));
  const projects = [...store.projects].sort((a, b) => b.created - a.created);
  el.innerHTML = `
  ${projects.length ? `<section class="sec"><h2 class="h2">${IC.needle} My projects</h2><div class="hscroll">${projects.map((p) => {
    const d = DESIGNS.find((x) => x.id === p.designId) || DESIGNS[0], who = person(p.personId);
    const pct = Math.round((p.done.length / Math.max(1, p.total || 1)) * 100);
    return `<div class="pcard"><a class="pcard-main" href="#/project/${p.id}/make">${sketchSvg(d.garment, p.options, null, '', d.color)}<b>${esc(d.name)}</b>
      <span class="row">${avatar(who, 26)} ${esc(who.name)}</span><span class="bar"><i style="width:${pct}%"></i></span></a>
      <button class="icon-sm" data-del="${p.id}" aria-label="Delete project">${IC.trash}</button></div>`;
  }).join('')}</div></section>` : ''}
  <section class="sec">
    <h2 class="h2">${IC.grid} Choose a design</h2>
    <div class="chips" role="tablist">${FILTERS.map((x) => `<button class="chip" data-filter="${x.id}" aria-pressed="${filter === x.id}">${x.label}</button>`).join('')}</div>
    <div class="cards">${list.map((d) => `<a class="dcard" href="#/design/${d.id}">
      ${sketchSvg(d.garment, d.options, null, '', d.color)}
      <b>${esc(d.name)}</b>
      <span class="meta">${levelDots(d.level)}<span class="hrs">⏱ ${d.hours} h</span></span>
    </a>`).join('')}</div>
  </section>`;
  el.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.filter) { filter = b.dataset.filter; renderCatalog(el); }
    if (b.dataset.del) armConfirm(b, () => { store.projects = store.projects.filter((p) => p.id !== b.dataset.del); save(); renderCatalog(el); });
  };
}
