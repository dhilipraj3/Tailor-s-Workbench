import { MEASURES, SHIRT_SIZES, WAIST_SIZES, waistPreset } from '../engine/sizes';
import { store, save, newPerson, exportBackup, importBackup } from '../core/store.js';
import { f } from '../core/units.js';
import { speak } from '../core/speech.js';
import { figure, stageSvg } from '../art/svg.js';
import { FIG, fe, fp } from '../chapters/measure.js';
import { esc, avatar, armConfirm } from './common.js';
import { IC } from './icons.js';

const TAPE = {
  chest: () => fe(50, 48, 28, 5), neck: () => fe(50, 29, 7, 2.4), shoulder: () => fp('M26 35 Q 50 30 74 35'),
  sleeve: () => fp('M74 35 L 80 66 L 84 97'), shirtLength: () => fp('M50 30 L 50 112'), wrist: () => fe(84, 95, 4.5, 1.8),
  waist: () => fe(50, 92, 21, 4), hip: () => fe(50, 106, 23, 4.5), rise: () => fp('M73 92 L 73 117'), outseam: () => fp('M72 92 L 69 188'),
};
const figSvg = (key) => stageSvg(figure(FIG.ox, FIG.oy, FIG.s) + `<path d="${TAPE[key]()}" class="tapel"/>`).replace('viewBox="0 0 800 500"', 'viewBox="250 20 300 470"');

export function renderPeople(el) {
  el.innerHTML = `<section class="sec"><h2 class="h2">${IC.people} People</h2>
    <div class="cards people">${store.profiles.map((p) => `<a class="dcard person" href="#/people/${p.id}">${avatar(p, 72)}<b>${esc(p.name)}</b>
      <span class="meta">Shirt ${p.shirtSize || '–'} · Waist ${p.waist || '–'}</span></a>`).join('')}
      <a class="dcard person add" href="#/people/new">${IC.plus}<b>Add person</b></a></div></section>
    <section class="sec"><h2 class="h2">Backup</h2><div class="actions">
      <button class="btn big2" id="bk-out">${IC.download} Save backup</button>
      <label class="btn big2">${IC.upload} Restore backup<input type="file" id="bk-in" accept="application/json" hidden></label></div>
      <p class="hint">Keeps everyone's measurements and projects safe, or moves them to another phone.</p></section>`;
  el.querySelector('#bk-out').onclick = exportBackup;
  el.querySelector('#bk-in').onchange = async (e) => {
    try { await importBackup(e.target.files[0]); renderPeople(el); } catch (err) { el.querySelector('.hint').textContent = err.message; }
  };
}

export function renderPerson(el, id) {
  let p = store.profiles.find((x) => x.id === id);
  if (id === 'new' || !p) { p = newPerson('', store.profiles.length); store.profiles.push(p); save(); history.replaceState(null, '', `#/people/${p.id}`); }
  const draw = () => {
    el.innerHTML = `<div class="person-edit">
      <header class="row gap">${avatar(p, 64)}<input id="pname" class="name-input" value="${esc(p.name)}" placeholder="Name" aria-label="Name"></header>
      <section class="optgrp"><h3>Ready-made shirt size</h3><div class="chips">${Object.keys(SHIRT_SIZES).map((s) => `<button class="chip big" data-shirt="${s}" aria-pressed="${p.shirtSize === s}">${s}</button>`).join('')}</div></section>
      <section class="optgrp"><h3>Trouser waist size</h3><div class="chips">${WAIST_SIZES.map((w) => `<button class="chip big" data-waist="${w}" aria-pressed="${p.waist === w}">${w}</button>`).join('')}</div></section>
      <section class="optgrp"><h3>Measurements</h3><p class="hint">Filled in from the sizes above. Measure and change any of them for a better fit.</p>
      <div class="mgrid">${MEASURES.map((m) => `<div class="mcard">
        <button class="mfig" data-how="${m.key}" aria-label="How to measure ${m.label}">${figSvg(m.key)}<span class="say">${IC.say}</span></button>
        <b>${m.label}</b>
        <div class="stepper sm"><button data-dec="${m.key}" aria-label="Smaller">${IC.minus}</button><output>${f(p.m[m.key])}</output><button data-inc="${m.key}" aria-label="Bigger">${IC.plus}</button></div>
      </div>`).join('')}</div></section>
      <div class="actions"><a class="cta" href="#/">${IC.check} Done</a>${store.profiles.length > 1 ? `<button class="btn big2 danger" id="pdel">${IC.trash} Delete</button>` : ''}</div></div>`;
    el.querySelector('#pname').oninput = (e) => { p.name = e.target.value; save(); };
  };
  draw();
  el.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const step = store.unit === 'in' ? 0.25 : 0.5 / 2.54;
    if (b.dataset.shirt) { p.shirtSize = b.dataset.shirt; Object.assign(p.m, SHIRT_SIZES[p.shirtSize]); save(); draw(); }
    else if (b.dataset.waist) { p.waist = +b.dataset.waist; Object.assign(p.m, waistPreset(p.waist)); save(); draw(); }
    else if (b.dataset.inc || b.dataset.dec) { const k = b.dataset.inc || b.dataset.dec; p.m[k] = Math.max(1, Math.round((p.m[k] + (b.dataset.inc ? step : -step)) * 1000) / 1000); save(); b.parentElement.querySelector('output').textContent = f(p.m[k]); }
    else if (b.dataset.how) speak(MEASURES.find((m) => m.key === b.dataset.how).say);
    else if (b.id === 'pdel') armConfirm(b, () => { store.profiles = store.profiles.filter((x) => x.id !== p.id); store.projects = store.projects.filter((x) => x.personId !== p.id); save(); location.hash = '#/people'; });
  };
}
