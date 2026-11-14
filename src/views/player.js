// Step player: big animated stage, short caption, voice, huge buttons,
// plus a timeline: play / pause, drag to any moment, slow motion, and auto-play into the next step.
import { stageSvg } from '../art/svg.js';
import { canSpeak, speak } from '../core/speech.js';
import { store, save } from '../core/store.js';
import { IC } from './icons.js';
import { esc } from './common.js';
import { detailChips } from '../engine/sew';

export const sayOf = (st) => (typeof st.say === 'function' ? st.say() : st.say);

/** The sewing detail under the caption: seam width, stitch, lock, press… and the check on its own line. */
function chipsHtml(d) {
  const c = detailChips(d);
  if (!c.length && !d?.check) return '';
  const items = c.map((x, k) => `<li class="${k === 0 && (d.sa != null || d.on) ? 'lead' : ''}">${esc(x)}</li>`).join('');
  return `<div class="sewd"><ul class="chips-sew" aria-label="How to sew this">${items}</ul>${d.check ? `<p class="sew-check">Check: ${esc(d.check)}</p>` : ''}</div>`;
}

const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4 L20 12 L7 20 Z" fill="currentColor"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>';

/**
 * Drives every animation inside one stage SVG (CSS animations and SMIL) from a single clock,
 * so it can be paused, scrubbed and slowed down.
 */
function timeline(svg, onTick, onEnd) {
  let anims = [];
  try { anims = svg.getAnimations({ subtree: true }); } catch (e) { /* older browser: plays normally */ }
  anims.forEach((a) => a.pause());
  try { svg.pauseAnimations(); } catch (e) { /* no SMIL */ }
  const ends = anims.map((a) => a.effect?.getComputedTiming().endTime).filter((x) => Number.isFinite(x)).map((x) => x / 1000);
  for (const m of svg.querySelectorAll('animateMotion')) ends.push(parseFloat(m.getAttribute('begin')) + parseFloat(m.getAttribute('dur')));
  const dur = Math.max(0.5, ...ends.filter((x) => Number.isFinite(x)));
  let t = 0, playing = true, last = performance.now(), raf = 0, ended = false;
  const seek = (s) => {
    t = Math.max(0, Math.min(dur, s));
    for (const a of anims) { try { a.currentTime = t * 1000; } catch (e) { /* finished */ } }
    try { svg.setCurrentTime(t); } catch (e) { /* no SMIL */ }
    onTick(t, dur, playing);
  };
  const loop = (now) => {
    const dt = (now - last) / 1000; last = now;
    if (playing) {
      seek(t + dt * (store.speed || 1));
      if (t >= dur && !ended) { ended = true; playing = false; onTick(t, dur, playing); onEnd(); }
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return {
    dur,
    toggle() { if (t >= dur) { seek(0); ended = false; } playing = !playing; last = performance.now(); onTick(t, dur, playing); },
    seek(s) { playing = false; ended = s >= dur; seek(s); },
    restart() { ended = false; playing = true; last = performance.now(); seek(0); },
    stop() { cancelAnimationFrame(raf); },
  };
}

export function mountPlayer(el, { steps, start = 0, done = [], onIndex, onFinish, finishIcon, atTime = null }) {
  let i = Math.min(Math.max(0, Number.isFinite(+start) ? +start : 0), steps.length - 1);
  let tl = null, autoTimer = 0;
  const fmt = (s) => s.toFixed(1) + 's';
  const tick = (t, dur, playing) => {
    const r = el.querySelector('#tl-range'), b = el.querySelector('#tl-play');
    if (r && document.activeElement !== r) r.value = String(Math.round((t / dur) * 1000));
    if (b) { b.innerHTML = playing ? PAUSE : PLAY; b.setAttribute('aria-label', playing ? 'Pause' : 'Play'); }
    const lbl = el.querySelector('#tl-time'); if (lbl) lbl.textContent = fmt(t);
  };
  const startTimeline = () => {
    tl?.stop(); clearTimeout(autoTimer);
    const svg = el.querySelector('#stage svg');
    tl = timeline(svg, tick, () => { if (store.autoplay && i < steps.length - 1) autoTimer = setTimeout(() => go(i + 1), 1500); });
  };
  const draw = (voice) => {
    const st = steps[i], last = i === steps.length - 1;
    // sections (Buy / Prepare / Mark & cut / Sew): tabs on top, dots only for the current section
    const secs = [];
    steps.forEach((s, j) => { const n = s.sec || ''; if (!secs.length || secs[secs.length - 1].n !== n) secs.push({ n, a: j, b: j }); else secs[secs.length - 1].b = j; });
    const cur = secs.find((s) => i >= s.a && i <= s.b) || secs[0];
    const secBar = secs.length > 1 ? `<div class="secs">${secs.map((s) => {
      const doneN = steps.slice(s.a, s.b + 1).filter((_, k) => done.includes(s.a + k)).length, tot = s.b - s.a + 1;
      return `<button class="sec-t ${s === cur ? 'cur' : ''} ${doneN === tot ? 'full' : ''}" data-go="${s.a}"><b>${s.n}</b><span class="sbar"><i style="width:${(doneN / tot) * 100}%"></i></span></button>`;
    }).join('')}</div>` : '';
    el.innerHTML = `<div class="player">${secBar}
      <div class="dots" aria-label="Step ${i - cur.a + 1} of ${cur.b - cur.a + 1}">${steps.slice(cur.a, cur.b + 1).map((_, k) => { const j = cur.a + k; return `<button class="dot ${j === i ? 'cur' : done.includes(j) ? 'on' : ''}" data-go="${j}" aria-label="Step ${k + 1}"></button>`; }).join('')}</div>
      <div class="stage" id="stage" title="Tap to pause or play">${stageSvg(st.svg())}</div>
      <div class="tl">
        <button class="tl-b" id="tl-play" aria-label="Pause">${PAUSE}</button>
        <input type="range" id="tl-range" min="0" max="1000" value="0" aria-label="Move through this step">
        <span class="tl-time" id="tl-time">0.0s</span>
        <button class="tl-b tl-t ${(store.speed || 1) < 1 ? 'on' : ''}" id="tl-slow" aria-pressed="${(store.speed || 1) < 1}" aria-label="Slow motion">½×</button>
        <button class="tl-b tl-t ${store.autoplay ? 'on' : ''}" id="tl-auto" aria-pressed="${!!store.autoplay}" aria-label="Play all steps">${IC.next}${IC.next}</button>
      </div>
      <div class="cap"><span class="n">${i - cur.a + 1}/${cur.b - cur.a + 1}</span><span>${st.cap}</span></div>
      ${chipsHtml(st.d)}
      <div class="ctrls">
        <button class="big" id="b-prev" aria-label="Back" ${i === 0 ? 'disabled' : ''}>${IC.prev}</button>
        <button class="big round" id="b-replay" aria-label="Play again">${IC.replay}</button>
        ${canSpeak ? `<button class="big round" id="b-say" aria-label="Say it">${IC.say}</button>` : '<span></span>'}
        <button class="big go" id="b-next" aria-label="${last ? 'Finish' : 'Next'}">${last ? (finishIcon || IC.check) : IC.next}</button>
      </div></div>`;
    el.querySelector('#tl-range').addEventListener('input', (e) => tl?.seek((+e.target.value / 1000) * tl.dur));
    startTimeline();
    if (atTime != null && Number.isFinite(atTime)) { tl.seek(atTime); atTime = null; } // deep link to a moment: ?t=seconds
    onIndex?.(i);
    if (voice && store.voice) speak(sayOf(st));
  };
  const go = (n) => { clearTimeout(autoTimer); if (n >= steps.length) { onFinish?.(); return; } i = Math.max(0, n); draw(true); };
  const onClick = (e) => {
    const tap = e.target.closest('[data-say]'); if (tap) { speak(tap.dataset.say); return; }
    const b = e.target.closest('button');
    if (!b) { if (e.target.closest('#stage')) tl?.toggle(); return; }
    if (b.dataset.go) go(+b.dataset.go);
    else if (b.id === 'b-next') go(i + 1);
    else if (b.id === 'b-prev') go(i - 1);
    else if (b.id === 'b-replay') tl?.restart();
    else if (b.id === 'b-say') speak(sayOf(steps[i]));
    else if (b.id === 'tl-play') tl?.toggle();
    else if (b.id === 'tl-slow') { store.speed = (store.speed || 1) < 1 ? 1 : 0.5; save(); b.classList.toggle('on', store.speed < 1); b.setAttribute('aria-pressed', String(store.speed < 1)); }
    else if (b.id === 'tl-auto') { store.autoplay = !store.autoplay; save(); b.classList.toggle('on', store.autoplay); b.setAttribute('aria-pressed', String(store.autoplay)); }
  };
  const onKey = (e) => {
    if (e.target.closest?.('input,select,textarea')) return;
    if (e.key === 'ArrowRight') go(i + 1); else if (e.key === 'ArrowLeft') go(i - 1); else if (e.key === ' ') { e.preventDefault(); tl?.toggle(); }
  };
  el.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  draw(true);
  return () => { tl?.stop(); clearTimeout(autoTimer); el.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); speak(''); };
}
