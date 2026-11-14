// App shell + router.  Routes: #/  #/design/<id>[?p=<project>]  #/project/<id>/<tab>  #/people  #/people/<id>  #/help[/<set>]
import { store, save, uid, personFor } from '../core/store.js';
import { DESIGNS } from '../garments/index';
import { canSpeak, speak } from '../core/speech.js';
import { TOOLS } from '../chapters/tools.js';
import { MACHINE } from '../chapters/machine.js';
import { renderCatalog } from './catalog.js';
import { renderDesign } from './design.js';
import { renderProject, leaveProject } from './project.js';
import { renderPeople, renderPerson } from './people.js';
import { mountPlayer } from './player.js';
import { IC } from './icons.js';

let helpCleanup = null;
const HELP = { tools: ['Tools & fabric', TOOLS], machine: ['Using the machine', MACHINE] };

function shell() {
  const r = (location.hash.split('/')[1] || '').split('?')[0];
  const nav = [['', 'Home'], ['designs', 'Designs'], ['how', 'How it works'], ['people', 'My people'], ['help', 'Help']];
  const cur = (k) => (k === 'designs' ? ['designs', 'design'].includes(r) : k === '' ? r === '' : r === k);
  return `<header class="topbar"><div class="tb">
    <a class="logo" href="#/" aria-label="Tailor's Workbench home"><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="9" cy="25" r="5"/><circle cx="9" cy="9" r="5"/><path d="M13 22 L31 6 M13 12 L31 28"/></svg><span class="lt"><b>TAILOR'S</b><small>WORKBENCH</small></span></a>
    <nav class="topnav" aria-label="Main">${nav.map(([k, l]) => `<a href="#/${k}" aria-current="${cur(k)}">${l}</a>`).join('')}</nav>
    <div class="tb-r">
      <button class="tog" id="unit" aria-label="Switch units">${store.unit === 'in' ? 'inch' : 'cm'}</button>
      ${canSpeak ? `<button class="tog round" id="voice" aria-pressed="${store.voice}" aria-label="Voice ${store.voice ? 'on' : 'off'}">${store.voice ? IC.say : IC.mute}</button>` : ''}
      <a class="pill-o" href="#/projects" aria-current="${r === 'projects' || r === 'project'}">My projects</a>
    </div></div></header><main class="wrap" id="view"></main>`;
}

export function route() {
  leaveProject(); helpCleanup?.(); helpCleanup = null; speak('');
  document.getElementById('app').innerHTML = shell();
  const el = document.getElementById('view');
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  const [a, b, c, d] = path.split('/');
  if (a === 'start' && DESIGNS.some((d) => d.id === b)) {
    // deep link: #/start/<design>[/<tab>] makes a project for the first person and opens it
    const des = DESIGNS.find((x) => x.id === b), p = { id: uid(), designId: des.id, options: { ...des.options }, personId: personFor(des.for || 'man', true).id, extra: 'standard', created: Date.now(), step: 0, done: [] };
    store.projects.push(p); save(); location.replace(`#/project/${p.id}/${c || 'pattern'}${d ? '/' + d : ''}${query ? '?' + query : ''}`); return;
  }
  if (a === 'design') renderDesign(el, b, new URLSearchParams(query || '').get('p'));
  else if (a === 'project') renderProject(el, b, c || 'pattern', d === undefined ? undefined : +d, new URLSearchParams(query || '').get('t'));
  else if (a === 'people' && b) renderPerson(el, b);
  else if (a === 'people') renderPeople(el);
  else if (a === 'help' && HELP[b]) {
    el.innerHTML = `<h2 class="h2">${IC.help} ${HELP[b][0]}</h2><div id="hp"></div>`;
    helpCleanup = mountPlayer(el.querySelector('#hp'), { steps: HELP[b][1], onFinish: () => { location.hash = '#/help'; } });
  } else if (a === 'help') {
    el.innerHTML = `<section class="sec"><h2 class="h2">${IC.help} Help</h2><div class="cards">${Object.entries(HELP).map(([k, [n, st]]) =>
      `<a class="dcard" href="#/help/${k}"><div class="help-pic">${k === 'tools' ? IC.scissors : IC.needle}</div><b>${n}</b><span class="meta">${st.length} steps</span></a>`).join('')}</div></section>`;
  } else {
    // home, and the home sections the top menu jumps to
    renderCatalog(el);
    const to = { designs: 'designs', how: 'how', projects: 'projects' }[a];
    if (to) { requestAnimationFrame(() => document.getElementById(to)?.scrollIntoView()); return; }
  }
  window.scrollTo({ top: 0 });
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('#unit, #voice'); if (!b) return;
  if (b.id === 'unit') store.unit = store.unit === 'in' ? 'cm' : 'in';
  else { store.voice = !store.voice; if (!store.voice) speak(''); }
  save(); route();
});
window.addEventListener('hashchange', route);
