// Step player: big animated stage, short caption, voice, huge buttons.
import { stageSvg } from '../art/svg.js';
import { canSpeak, speak } from '../core/speech.js';
import { store } from '../core/store.js';
import { IC } from './icons.js';

export const sayOf = (st) => (typeof st.say === 'function' ? st.say() : st.say);

export function mountPlayer(el, { steps, start = 0, done = [], onIndex, onFinish, finishIcon }) {
  let i = Math.min(Math.max(0, Number.isFinite(+start) ? +start : 0), steps.length - 1);
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
      <div class="stage" id="stage" title="Tap to play again">${stageSvg(st.svg())}</div>
      <div class="cap"><span class="n">${i - cur.a + 1}/${cur.b - cur.a + 1}</span><span>${st.cap}</span></div>
      <div class="ctrls">
        <button class="big" id="b-prev" aria-label="Back" ${i === 0 ? 'disabled' : ''}>${IC.prev}</button>
        <button class="big round" id="b-replay" aria-label="Play again">${IC.replay}</button>
        ${canSpeak ? `<button class="big round" id="b-say" aria-label="Say it">${IC.say}</button>` : '<span></span>'}
        <button class="big go" id="b-next" aria-label="${last ? 'Finish' : 'Next'}">${last ? (finishIcon || IC.check) : IC.next}</button>
      </div></div>`;
    start_();
    onIndex?.(i);
    if (voice && store.voice) speak(sayOf(st));
  };
  const start_ = () => { const s = el.querySelector('#stage svg'); try { s.setCurrentTime(0); s.unpauseAnimations(); } catch (e) { /* no SMIL */ } };
  const replay = () => { el.querySelector('#stage').innerHTML = stageSvg(steps[i].svg()); start_(); };
  const go = (n) => { if (n >= steps.length) { onFinish?.(); return; } i = Math.max(0, n); draw(true); };
  const onClick = (e) => {
    const tap = e.target.closest('[data-say]'); if (tap) { speak(tap.dataset.say); return; }
    const b = e.target.closest('button');
    if (!b) { if (e.target.closest('#stage')) replay(); return; }
    if (b.dataset.go) go(+b.dataset.go);
    else if (b.id === 'b-next') go(i + 1);
    else if (b.id === 'b-prev') go(i - 1);
    else if (b.id === 'b-replay') replay();
    else if (b.id === 'b-say') speak(sayOf(steps[i]));
  };
  const onKey = (e) => { if (e.target.closest?.('input,select,textarea')) return; if (e.key === 'ArrowRight') go(i + 1); else if (e.key === 'ArrowLeft') go(i - 1); };
  el.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  draw(true);
  return () => { el.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); speak(''); };
}
