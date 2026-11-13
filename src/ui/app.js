// UI
import { SHIRT_SIZES, PANT_SIZES, pantPreset, S, save } from '../core/state.js';
import { f } from '../core/units.js';
import { st, SH, stageSvg } from '../art/svg.js';
import { chapters, seenKey, chIcon } from '../chapters/index.js';
import { canSpeak, speak } from '../core/speech.js';

const IC={
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 L12 3 L21 11 M5 9 V21 H19 V9"/></svg>`,
  prev:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 L7 12 L15 20"/></svg>`,
  next:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 L17 12 L9 20"/></svg>`,
  replay:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 A8 8 0 1 0 7 5.8 M4 4 V9 H9"/></svg>`,
  say:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 9 Q18 12 16 15 M18.5 6.5 Q22 12 18.5 17.5"/></svg>`,
  mute:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 9 L21 15 M21 9 L16 15"/></svg>`,
  star:`<svg viewBox="0 0 24 24"><path d="M12 2 L15 9 L22 9.5 L16.5 14 L18.5 21 L12 17 L5.5 21 L7.5 14 L2 9.5 L9 9 Z" fill="currentColor"/></svg>`,
};
const app=document.getElementById('app');
function renderHome(){
  const isS=S.garment==='shirt',chs=chapters();
  let nextIdx=chs.findIndex(c=>(S.seen[seenKey(c)]||0)<c.steps.length);if(nextIdx<0)nextIdx=-1;
  const shirtIcon=(sc)=>`<svg viewBox="-4 -6 168 166" style="height:${44*sc}px"><path d="${SH.shirt}" fill="#4f86d1" stroke="#1d3c69" stroke-width="5"/><path d="${SH.collar}" fill="#fff" stroke="#1d3c69" stroke-width="4"/></svg>`;
  const pantIcon=()=>`<svg viewBox="-6 -4 102 168"><path d="${SH.pants}" fill="#66717d" stroke="#252b31" stroke-width="5"/></svg>`;
  app.innerHTML=`<div class="tape" aria-hidden="true"></div><h1>Tailor's Workbench</h1>
  <div class="label">${IC.star.replace('<svg','<svg width="20" height="20" style="color:var(--accent)"')} What will you make?</div>
  <div class="garments">
    <button class="gcard" id="g-shirt" data-g="shirt" aria-pressed="${isS}" aria-label="Shirt"><svg viewBox="-4 -6 168 166"><path d="${SH.shirt}" fill="#4f86d1" stroke="#1d3c69" stroke-width="4"/><path d="${SH.collar}" fill="#fff" stroke="#1d3c69" stroke-width="3"/><path d="M80 22 L80 148" stroke="#1d3c69" stroke-width="2"/></svg>Shirt</button>
    <button class="gcard" id="g-trousers" data-g="trousers" aria-pressed="${!isS}" aria-label="Trousers"><svg viewBox="-30 -4 150 168"><path d="${SH.pants}" fill="#66717d" stroke="#252b31" stroke-width="4"/><path d="M4 0 L86 0 L86 10 L4 10 Z" fill="#535d68"/></svg>Trousers</button>
  </div>
  <div class="label">Your size</div>
  <div class="sizes">${isS?Object.keys(SHIRT_SIZES).map((k,i)=>`<button class="sz" id="sz-${k}" data-size="${k}" aria-pressed="${S.shirtSize===k}">${shirtIcon(.75+i*.12)}${k}</button>`).join('')
     :PANT_SIZES.map(k=>`<button class="sz" id="sz-${k}" data-size="${k}" aria-pressed="${S.pantSize===k}">${pantIcon()}${k}</button>`).join('')}</div>
  <div class="toggles">
    ${isS?`<button class="tog" id="fit-reg" data-fit="regular" aria-pressed="${S.fit==='regular'}">Regular fit</button><button class="tog" id="fit-slim" data-fit="slim" aria-pressed="${S.fit==='slim'}">Slim fit</button>`:''}
    <button class="tog" id="u-in" data-u="in" aria-pressed="${S.unit==='in'}">inch</button><button class="tog" id="u-cm" data-u="cm" aria-pressed="${S.unit==='cm'}">cm</button>
    ${canSpeak?`<button class="tog" id="voice" data-voice aria-pressed="${S.voice}" aria-label="Voice">${S.voice?IC.say:IC.mute} Voice</button>`:''}
  </div>
  <div class="label">Step by step</div>
  <div class="path">${chs.map((c,i)=>{const seen=Math.min(S.seen[seenKey(c)]||0,c.steps.length),done=seen>=c.steps.length;
    return `<button class="ch ${done?'done':''} ${i===nextIdx?'next':''}" id="ch-${c.id}" data-ch="${i}"><span class="num">${done?'✓':i+1}</span>${chIcon(c.id)}<b>${c.name}</b><span class="bar"><i style="width:${seen/c.steps.length*100}%"></i></span></button>`;}).join('')}</div>`;
}
let cur=null;
function renderPlayer(say=true){
  const chs=chapters(),c=chs[S.view.ch],i=S.view.i,st=c.steps[i],k=seenKey(c);
  S.seen[k]=Math.max(S.seen[k]||0,i+1);save();
  const field=st.field,data=S.garment==='shirt'?S.shirt:S.pant;
  const last=i===c.steps.length-1;
  app.innerHTML=`<div class="player">
   <div class="pbar"><button class="icon-btn" id="b-home" aria-label="All steps">${IC.home}</button><div class="ptitle">${chIcon(c.id).replace('class="ci"','')}<span>${c.name}</span></div>
   <div class="dots">${c.steps.map((_,j)=>`<i class="${j===i?'cur':j<(S.seen[k]||0)?'on':''}"></i>`).join('')}</div></div>
   <div class="stage" id="stage" title="Tap to play again">${stageSvg(st.svg())}</div>
   <div class="cap"><span class="n">${i+1}/${c.steps.length}</span><span>${st.cap}</span></div>
   ${field?`<div class="stepper"><button id="f-minus" aria-label="Smaller">−</button><output id="f-val">${f(data[field])}</output><button id="f-plus" aria-label="Bigger">+</button></div>`:''}
   <div class="ctrls"><button class="big" id="b-prev" aria-label="Back" ${i===0&&S.view.ch===0?'disabled':''}>${IC.prev}</button>
     <button class="big round" id="b-replay" aria-label="Play again">${IC.replay}</button>
     ${canSpeak?`<button class="big round" id="b-say" aria-label="Say it">${IC.say}</button>`:'<span></span>'}
     <button class="big go" id="b-next" aria-label="${last?'Next chapter':'Next'}">${last&&S.view.ch===chs.length-1?IC.star:IC.next}</button></div></div>`;
  startStage();
  if(say&&S.voice)speak(stepSay(st));
}
const stepSay=st=>typeof st.say==='function'?st.say():(st.sayFn?st.sayFn():st.say);
function startStage(){const svg=document.querySelector('#stage svg');try{svg.setCurrentTime(0);svg.unpauseAnimations();}catch(e){}}
function replay(){const chs=chapters(),st=chs[S.view.ch].steps[S.view.i];document.getElementById('stage').innerHTML=stageSvg(st.svg());startStage();}
function render(){if(S.view)renderPlayer(false);else renderHome();}
function go(d){
  const chs=chapters();let {ch,i}=S.view;i+=d;
  if(i>=chs[ch].steps.length){if(ch<chs.length-1){ch++;i=0;}else{S.view=null;speak('');render();window.scrollTo({top:0});return;}}
  if(i<0){if(ch>0){ch--;i=chs[ch].steps.length-1;}else i=0;}
  S.view={ch,i};renderPlayer(true);
}
document.addEventListener('click',e=>{
  const tap=e.target.closest('[data-say]');if(tap){speak(tap.dataset.say);return;}
  const b=e.target.closest('button');
  if(!b){if(e.target.closest('#stage'))replay();return;}
  if(b.dataset.g){S.garment=b.dataset.g;save();render();return;}
  if(b.dataset.size){if(S.garment==='shirt'){S.shirtSize=b.dataset.size;S.shirt={...SHIRT_SIZES[S.shirtSize]};}else{S.pantSize=+b.dataset.size;S.pant=pantPreset(S.pantSize);}save();render();return;}
  if(b.dataset.fit){S.fit=b.dataset.fit;save();render();return;}
  if(b.dataset.u){S.unit=b.dataset.u;save();render();return;}
  if(b.hasAttribute('data-voice')){S.voice=!S.voice;if(!S.voice)speak('');save();render();return;}
  if(b.dataset.ch){S.view={ch:+b.dataset.ch,i:0};renderPlayer(true);window.scrollTo({top:0});return;}
  switch(b.id){
    case 'b-home':S.view=null;speak('');render();return;
    case 'b-next':go(1);return;
    case 'b-prev':go(-1);return;
    case 'b-replay':replay();return;
    case 'b-say':{const st=chapters()[S.view.ch].steps[S.view.i];speak(stepSay(st));return;}
    case 'f-minus':case 'f-plus':{const st=chapters()[S.view.ch].steps[S.view.i],data=S.garment==='shirt'?S.shirt:S.pant,stp=S.unit==='in'?.25:.5/2.54;
      data[st.field]=Math.max(1,data[st.field]+(b.id==='f-plus'?stp:-stp));save();document.getElementById('f-val').textContent=f(data[st.field]);replay();return;}
  }
});
document.addEventListener('keydown',e=>{if(!S.view)return;if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1);});

export { IC, renderHome, renderPlayer, stepSay, startStage, replay, render, go };
