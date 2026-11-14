import { DESIGNS, FILTERS } from '../garments/index';
import { store, person, save } from '../core/store.js';
import { sketchSvg, levelDots, esc, avatar, armConfirm } from './common.js';
import { IC } from './icons.js';

let filter = 'all';

/** Real garment photos (royalty-free, garment only). Designs without one show their drawing. */
export const PHOTOS = {
  'formal-shirt': { src: 'img/shirt.jpg', alt: 'Light blue formal shirt on a wooden hanger' },
  'aline-kurti': { src: 'img/kurti.jpg', alt: 'Printed long-sleeve tunic on a wooden hanger' },
  'kids-frock': { src: 'img/frock.jpg', alt: "Child's lace frock on a hanger" },
};
export const TAG = (d) => [({ man: 'Men', woman: 'Women', child: 'Kids' })[d.for] || '', d.tags.includes('indian') ? 'Indian' : d.tags.includes('formal') ? 'Formal' : d.tags.includes('easy') ? 'Easy' : 'Casual'].filter(Boolean).join(' · ');

const FEATS = [
  ['<rect x="7" y="5" width="26" height="30" rx="2"/><path d="M12 12h16M12 18h16M12 24h10" stroke-dasharray="2 2"/>', 'Full-size pattern', 'Print it, or chalk it on.'],
  ['<ellipse cx="13" cy="20" rx="6" ry="13"/><path d="M13 7 L33 7 L33 33 L13 33"/><ellipse cx="13" cy="20" rx="2" ry="4"/>', 'Fabric worked out', 'Metres for 36″, 44″ or 58″.'],
  ['<path d="M7 16v8h6l7 6V10l-7 6z"/><path d="M25 14a8 8 0 0 1 0 12"/><path d="M29 10a13 13 0 0 1 0 20"/>', 'Every stitch, with voice', 'Seam, stitch and press for each step.'],
  ['<rect x="12" y="4" width="16" height="32" rx="3"/><path d="M18 31h4"/>', 'Works offline', 'Install it on your phone.'],
];

const HOW = [
  ['Pick and customise', 'Collar, sleeve, fit and pockets. The picture updates as you tap.'],
  ['Measure once', 'Save sizes for everyone in the family, or start from a ready-made size.'],
  ['Mark and cut', 'Chalk each piece straight onto folded fabric, or print the pattern.'],
  ['Sew with voice', 'Seam width, stitch and pressing, spelled out and read aloud.'],
];

const HERO = DESIGNS.find((d) => d.id === 'formal-shirt');

function hero() {
  return `<section class="hero" aria-label="Welcome">
    <div class="hero-copy">
      <h1>Sewn by you.<br>Made to fit.</h1>
      <p>Pick a design, choose who it's for, and get a pattern in their exact size, the fabric to buy, and every stitch shown in pictures with voice.</p>
      <a class="cta" href="#/designs">EXPLORE THE DESIGNS</a>
    </div>
    <div class="hero-stage">
      <figure class="hero-photo render" role="img" aria-label="Classic formal shirt in light blue, showing the collar, button band and sleeve">
        ${sketchSvg('shirt', HERO.options, null, 'hero', HERO.color)}
        <span class="hot" style="left:45%;top:25%" aria-hidden="true">1</span>
        <span class="hot" style="left:50%;top:47%" aria-hidden="true">2</span>
        <span class="hot" style="left:73%;top:26%" aria-hidden="true">3</span>
        <figcaption><span><b>Classic formal shirt</b><span>Level 4 · about 8 hours</span></span><a href="#/design/formal-shirt">MAKE THIS</a></figcaption>
      </figure>
      <ol class="hero-notes">
        <li><span class="n">1</span><span><b>Collar on a stand</b><span>Interfaced collar and stand, topstitched ⅛″ from the edge.</span></span></li>
        <li><span class="n">2</span><span><b>Front button band</b><span>Folded band, buttonholes spaced evenly from the collar.</span></span></li>
        <li><span class="n">3</span><span><b>Set-in sleeve</b><span>Felled armhole seam, then side and sleeve in one seam.</span></span></li>
      </ol>
    </div>
  </section>
  <ul class="feats">${FEATS.map(([ic, b, s]) => `<li><svg viewBox="0 0 40 40" aria-hidden="true">${ic}</svg><span><b>${b}</b><span>${s}</span></span></li>`).join('')}</ul>`;
}

function card(d) {
    return `<a class="dcard" href="#/design/${d.id}">
    <div class="ph">${sketchSvg(d.garment, d.options, null, '', d.color)}<span class="tag">${esc(TAG(d))}</span></div>
    <div class="body"><span><b>${esc(d.name)}</b><span class="meta">${levelDots(d.level)}<span class="hrs">${d.hours} h</span></span></span><span class="go">MAKE →</span></div>
  </a>`;
}

export function renderCatalog(el) {
  const list = DESIGNS.filter((d) => filter === 'all' || d.tags.includes(filter));
  const projects = [...store.projects].sort((a, b) => b.created - a.created);
  el.innerHTML = `${hero()}
  ${projects.length ? `<section class="sec" id="projects"><div class="sec-head"><div><span class="eyebrow">Carry on</span><h2 class="h2">My projects</h2></div></div><div class="hscroll">${projects.map((p) => {
    const d = DESIGNS.find((x) => x.id === p.designId) || DESIGNS[0], who = person(p.personId);
    const pct = Math.round((p.done.length / Math.max(1, p.total || 1)) * 100);
    return `<div class="pcard"><a class="pcard-main" href="#/project/${p.id}/make">${sketchSvg(d.garment, p.options, null, '', d.color)}<b>${esc(d.name)}</b>
      <span class="row">${avatar(who, 26)} ${esc(who.name)}</span><span class="bar"><i style="width:${pct}%"></i></span></a>
      <button class="icon-sm" data-del="${p.id}" aria-label="Delete project">${IC.trash}</button></div>`;
  }).join('')}</div></section>` : `<section class="sec" id="projects"><div class="sec-head"><div><span class="eyebrow">Carry on</span><h2 class="h2">My projects</h2></div></div>
    <p class="empty-note">No projects yet. Pick a design below and press Start making. It will wait here for you.</p></section>`}
  <section class="sec" id="designs">
    <div class="sec-head"><div><span class="eyebrow">The collection</span><h2 class="h2">Choose what to make</h2></div>
      <div class="chips" role="group" aria-label="Filter designs">${FILTERS.map((x) => `<button class="chip" data-filter="${x.id}" aria-pressed="${filter === x.id}">${x.label}</button>`).join('')}</div></div>
    <div class="cards">${list.map(card).join('')}</div>
  </section>
  <section class="how" id="how">
    <figure class="how-photo"><img src="img/sewing.jpg" alt="Hands guiding teal fabric under a sewing machine foot" loading="lazy"></figure>
    <div class="how-body">
      <div><span class="eyebrow">How it works</span><h2 class="h2">From fabric to finished</h2></div>
      <ol class="how-list">${HOW.map(([t, s], k) => `<li><span class="k">0${k + 1}</span><span><b>${t}</b><span>${s}</span></span></li>`).join('')}</ol>
    </div>
  </section>
  <footer class="foot"><span class="foot-logo">TAILOR'S WORKBENCH</span><span>Make a test version in cheap fabric first · Photos: Unsplash, Pexels</span></footer>`;
  el.onclick = (e) => {
    const sc = e.target.closest('[data-scroll]');
    if (sc) { e.preventDefault(); document.getElementById(sc.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.filter) { filter = b.dataset.filter; renderCatalog(el); document.getElementById('designs')?.scrollIntoView(); }
    if (b.dataset.del) armConfirm(b, () => { store.projects = store.projects.filter((p) => p.id !== b.dataset.del); save(); renderCatalog(el); });
  };
}
