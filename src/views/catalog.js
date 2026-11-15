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

// the hero: your A-line kurti photo (with a short front placket, so the link opens the design with that option)
const HERO = DESIGNS.find((d) => d.id === 'aline-kurti');
const HERO_OPTS = { ...HERO.options, opening: 'halfplacket' };
const HERO_COLORS = [['#b5263f', 'Crimson'], ['#efe8d8', 'Ivory'], ['#3f7f8c', 'Teal'], ['#b8862e', 'Mustard']];
let heroColor = HERO_COLORS[0][0];
// the photo shows the shirt in its own colour; any other swatch shows the recoloured drawing
// every colour is your photo, dyed: the photo turns grey and the colour is multiplied over it, so folds and shading stay real
const heroArt = () => { const dyed = heroColor !== HERO_COLORS[0][0];
  return `<img class="hero-img${dyed ? ' dyed' : ''}" src="img/hero-kurti.png" alt="" onload="this.parentNode.classList.add('has-photo')">` +
    (dyed ? `<span class="hero-dye" style="background:${heroColor};-webkit-mask-image:url(img/hero-kurti.png);mask-image:url(img/hero-kurti.png)"></span>` : ''); };

function hero() {
  return `<section class="hero" aria-label="Welcome">
    <div class="hero-copy">
      <h1>Sewn by you.<br>Made to fit.</h1>
      <p>Pick a design, choose who it's for, and get a pattern in their exact size, the fabric to buy, and every stitch shown in pictures with voice.</p>
      <a class="cta" href="#/designs">EXPLORE THE DESIGNS</a>
    </div>
    <div class="hero-stage">
      <figure class="hero-garment" role="img" aria-label="A-line kurti in crimson, showing the front placket, three-quarter sleeve and flared panels">
        <span class="hero-word" aria-hidden="true">KURTI</span>
        <span class="hero-floor" aria-hidden="true"></span>
        <span class="hero-art" id="hero-art">${heroArt()}</span>
        <span class="hot" style="--dx:50%;--dy:17%;--px:50%;--py:20%" aria-hidden="true">1</span>
        <span class="hot" style="--dx:20%;--dy:45%;--px:26%;--py:42%" aria-hidden="true">2</span>
        <span class="hot" style="--dx:74%;--dy:80%;--px:74%;--py:84%" aria-hidden="true">3</span>
      </figure>
      <div class="hero-side">
        <div class="hero-name"><b>A-line kurti</b><span>Level 3 · about 6 hours</span></div>
        <div class="hero-sw" role="group" aria-label="Fabric colour">${HERO_COLORS.map(([c, n]) => `<button type="button" data-hc="${c}" aria-label="${n}" aria-pressed="${c === heroColor}" style="background:${c}"></button>`).join('')}<span>${HERO_COLORS.find(([c]) => c === heroColor)[1].toUpperCase()}</span></div>
      <ol class="hero-notes">
        <li><span class="n">1</span><span><b>Front placket</b><span>Two folded strips, edgestitched and boxed at the base, round neck faced.</span></span></li>
        <li><span class="n">2</span><span><b>Three-quarter sleeve</b><span>Eased into the armhole, hem turned twice and stitched.</span></span></li>
        <li><span class="n">3</span><span><b>A-line flare</b><span>Bust darts for shape, flared side seams, curved hem eased flat.</span></span></li>
      </ol>
      <a class="cta hero-make" href="#/design/aline-kurti?o=opening:halfplacket">MAKE THIS KURTI</a>
      </div>
    </div>
  </section>
  <ul class="feats">${FEATS.map(([ic, b, s]) => `<li><svg viewBox="0 0 40 40" aria-hidden="true">${ic}</svg><span><b>${b}</b><span>${s}</span></span></li>`).join('')}</ul>`;
}

/** A product photo for the design, if one has been added as public/img/designs/<id>.jpg; otherwise the drawing shows. */
export const designPhoto = (id) => `<img class="dphoto" src="img/designs/${id}.jpg" alt="" loading="lazy" onload="this.parentNode.classList.add('has-photo')" onerror="this.remove()">`;

function card(d) {
    return `<a class="dcard" href="#/design/${d.id}">
    <div class="ph">${sketchSvg(d.garment, d.options, null, '', d.color)}${designPhoto(d.id)}<span class="tag">${esc(TAG(d))}</span></div>
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
    if (b.dataset.hc) {
      // recolour the hero shirt in place
      heroColor = b.dataset.hc;
      el.querySelector('#hero-art').classList.remove('has-photo');
      el.querySelector('#hero-art').innerHTML = heroArt();
      el.querySelectorAll('[data-hc]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.hc === heroColor)));
      el.querySelector('.hero-sw span').textContent = HERO_COLORS.find(([c]) => c === heroColor)[1].toUpperCase();
      return;
    }
    if (b.dataset.filter) { filter = b.dataset.filter; renderCatalog(el); document.getElementById('designs')?.scrollIntoView(); }
    if (b.dataset.del) armConfirm(b, () => { store.projects = store.projects.filter((p) => p.id !== b.dataset.del); save(); renderCatalog(el); });
  };
}
