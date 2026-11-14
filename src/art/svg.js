// svg helpers
import { f } from '../core/units.js';

let uid=0;
const n1=v=>(+v).toFixed(1);
const TR=(d,fn)=>d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g,(m,a,b)=>{const p=fn(+a,+b);return n1(p[0])+' '+n1(p[1]);});
const P=(d,ox,oy,s,sx=1)=>TR(d,(x,y)=>[ox+x*s*sx,oy+y*s]);
const st=(d0,t)=>`style="--d:${d0}s;--t:${t}s"`;
const H={
  shape:(d,cls,extra='')=>`<path d="${d}" class="${cls}" ${extra}/>`,
  draw:(d,cls,d0=0,t=1)=>`<path d="${d}" pathLength="1" class="${cls} drw" ${st(d0,t)}/>`,
  follow:(d,d0,t,icon,auto)=>`<g visibility="hidden"><set attributeName="visibility" to="visible" begin="${d0}s" fill="freeze"/><set attributeName="visibility" to="hidden" begin="${(d0+t+.4).toFixed(2)}s" fill="freeze"/>${icon}<animateMotion dur="${t}s" begin="${d0}s" fill="freeze" path="${d}" ${auto?'rotate="auto"':''}/></g>`,
  stitch:(d,d0=0,t=2,tool='foot',cls='stitch')=>{const id='mk'+(uid++);return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="900"><path d="${d}" pathLength="1" fill="none" stroke="#fff" stroke-width="22" class="drw" ${st(d0,t)}/></mask><path d="${d}" class="${cls}" mask="url(#${id})"/>${tool?H.follow(d,d0,t,ICON[tool]()):''}`;},
  cut:(d,d0=0,t=1.5)=>H.draw(d,'cutl',d0,t)+H.follow(d,d0,t,ICON.scissors(),true),
  fade:(inner,d0=0)=>`<g class="fi" style="--d:${d0}s">${inner}</g>`,
  out:(inner,d0=0)=>`<g class="fo" style="--d:${d0}s">${inner}</g>`,
  move:(inner,dx,dy,d0=0,t=1)=>`<g class="mv" style="--fx:${dx}px;--fy:${dy}px;--d:${d0}s;--t:${t}s">${inner}</g>`,
  flip:(inner,ax,o,d0=0,t=1)=>`<g class="flip${ax}" style="--o:${o}px;--d:${d0}s;--t:${t}s">${inner}</g>`,
  rot:(inner,ox,oy,r,d0=0,t=1)=>`<g class="rot" style="--ox:${ox}px;--oy:${oy}px;--r:${r}deg;--d:${d0}s;--t:${t}s">${inner}</g>`,
  pop:(inner,d0=0)=>`<g class="pop" style="--d:${d0}s">${inner}</g>`,
  arrow:(d,d0=0)=>H.fade(`<path d="${d}" class="arrowl" marker-end="url(#ah)"/>`,d0),
  chip:(x,y,txt,d0=0)=>{const w=String(txt).length*13+26;return H.pop(`<rect x="${x-w/2}" y="${y-19}" width="${w}" height="38" rx="12" class="chipbg"/><text x="${x}" y="${y+1}" class="chipt">${txt}</text>`,d0);},
  word:(x,y,txt,d0=0)=>H.fade(`<text x="${x}" y="${y}" class="wordt">${txt}</text>`,d0),
  ok:(x,y,d0=0)=>H.pop(`<circle cx="${x}" cy="${y}" r="34" class="okc"/><path d="M${x-15} ${y} l10 11 l20 -22" class="mark"/>`,d0),
  no:(x,y,d0=0,r=34)=>H.pop(`<circle cx="${x}" cy="${y}" r="${r}" class="noc"/><path d="M${x-r*.38} ${y-r*.38} l${r*.76} ${r*.76} M${x+r*.38} ${y-r*.38} l${-r*.76} ${r*.76}" class="mark"/>`,d0),
  pin:(x,y,d0=0)=>H.pop(`<g filter="url(#lift2)"><line x1="${x-20}" y1="${y+13}" x2="${x+12}" y2="${y-8}" stroke="url(#steelG)" stroke-width="2.2" stroke-linecap="round"/><circle cx="${x+14}" cy="${y-9}" r="6.5" fill="url(#glassR)"/></g>`,d0),
  pins:(pts,d0=0,gap=.15)=>pts.map((p,i)=>H.pin(p[0],p[1],d0+i*gap)).join(''),
  iron:(x,y,d0=0,dx=120,dy=0,n=3)=>H.fade(`<g class="slide" style="--d:${d0}s;--dx:${dx}px;--dy:${dy}px;--n:${n}">${ICON.iron(x,y)}</g>`,d0),
  ring:(x,y,r,d0=0)=>H.fade(`<circle cx="${x}" cy="${y}" r="${r}" class="ring pul" style="--d:${d0}s"/>`,d0),
  dim:(a,b,val,d0=0,off=0)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*off,ny=dx/L*off;
     const A=[a[0]+nx,a[1]+ny],B=[b[0]+nx,b[1]+ny],tx=-dy/L*8,ty=dx/L*8;
     return H.fade(`<path class="dimln" d="M${n1(A[0])} ${n1(A[1])} L${n1(B[0])} ${n1(B[1])} M${n1(A[0]-tx)} ${n1(A[1]-ty)} L${n1(A[0]+tx)} ${n1(A[1]+ty)} M${n1(B[0]-tx)} ${n1(B[1]-ty)} L${n1(B[0]+tx)} ${n1(B[1]+ty)}"/>`,d0)+H.chip((A[0]+B[0])/2,(A[1]+B[1])/2,typeof val==='number'?f(val):val,d0+.2);},
  zz:(pts,amp=6,step=11)=>{const o=[];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,n=Math.max(2,Math.round(L/step));for(let i=(k?1:0);i<=n;i++){const t=i/n,s=i%2?amp:-amp;o.push(n1(a[0]+dx*t+nx*s)+' '+n1(a[1]+dy*t+ny*s));}}return 'M'+o.join(' L');},
};
const ICON={
  foot:()=>`<g filter="url(#lift2)"><rect x="-7" y="-84" width="14" height="50" rx="3" fill="url(#metalG)" stroke="#59626b" stroke-width="1"/><rect x="-2" y="-36" width="4" height="10" fill="#8d969e"/><path d="M0 -28 L0 -3" stroke="#d4d9de" stroke-width="2.6" stroke-linecap="round"/><path d="M-.6 -28 L-.6 -5" stroke="#ffffff" stroke-width=".8" opacity=".8"/><path d="M-30 -17 Q-30 -20 -26 -20 L18 -20 Q24 -20 30 -9 L30 -6 L-30 -6 Z" fill="url(#metalG)" stroke="#59626b" stroke-width="1"/><path d="M-3 -20 L3 -20 L3 -6 L-3 -6 Z" fill="#3b4046"/></g>`,
  hand:()=>`<g transform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="-46" class="needle"/><ellipse cx="0" cy="-42" rx="2" ry="4" fill="none" stroke="#4f5a63" stroke-width="1.5"/><path d="M0 -46 C 10 -70 30 -60 40 -80" fill="none" stroke="#e5484d" stroke-width="2.5"/></g>`,
  scissors:()=>`<g filter="url(#lift2)"><path d="M-6 -4 L36 -1.5 Q38 0 36 1 L-6 2 Z" fill="url(#metalG)" stroke="#6b737b" stroke-width=".8" transform="rotate(-12)"/><path d="M-6 -2 L36 -1 Q38 0 36 1.5 L-6 4 Z" fill="url(#metalG)" stroke="#6b737b" stroke-width=".8" transform="rotate(12)"/><path d="M-6 -3 L-16 -9" stroke="#1d2024" stroke-width="5" stroke-linecap="round"/><path d="M-6 3 L-16 9" stroke="#1d2024" stroke-width="5" stroke-linecap="round"/><ellipse cx="-26" cy="-13" rx="11" ry="7" fill="none" stroke="url(#blackG)" stroke-width="5" transform="rotate(-20 -26 -13)"/><ellipse cx="-26" cy="13" rx="11" ry="7" fill="none" stroke="url(#blackG)" stroke-width="5" transform="rotate(20 -26 13)"/><circle r="3.2" fill="url(#steelG)" stroke="#444" stroke-width=".6"/></g>`,
  iron:(x,y)=>`<g transform="translate(${x} ${y})" filter="url(#lift)"><path d="M-66 2 Q -64 -34 -18 -40 L 50 -40 Q 56 -40 57 -30 L 58 2 Z" fill="url(#ironG)" stroke="#8a939b" stroke-width="1"/><path d="M-68 0 L58 0 L58 7 Q58 9 56 9 L-66 9 Z" fill="url(#steelG)"/><path d="M-26 -40 Q -18 -70 30 -66 Q 40 -64 40 -54 L 38 -40" fill="none" stroke="url(#blackG)" stroke-width="11" stroke-linecap="round"/><rect x="2" y="-30" width="22" height="10" rx="5" fill="#2b2f33"/><circle cx="13" cy="-25" r="3" fill="#ff6b3d"/><path d="M-44 -50 q-8 -12 0 -24 M-28 -54 q-8 -12 0 -24" class="steam"/></g>`,
  button:(x,y,r=11)=>`<g filter="url(#lift2)"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#pearlG)" stroke="#b9b3a3" stroke-width="1"/><circle cx="${x}" cy="${y}" r="${r*.72}" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>${[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>`<circle cx="${x+a*r*.24}" cy="${y+b*r*.24}" r="${Math.max(1.2,r*.1)}" fill="#6d675a"/>`).join('')}</g>`,
  zip:(x,y,h)=>{let t='';for(let i=8;i<h-14;i+=7)t+=`<rect x="${x-4+(i%14?0:3)}" y="${y+i}" width="5" height="4" fill="#d3dadd"/>`;return `<g><rect x="${x-12}" y="${y}" width="24" height="${h}" rx="3" fill="#2a2f35"/>${t}<rect x="${x-7}" y="${y+h-24}" width="14" height="20" rx="3" class="metal"/></g>`;},
  person:(x,y,s,c)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-30" rx="10" ry="12" fill="url(#formG)"/><path d="M-18 -12 Q 0 -20 18 -12 Q 20 6 16 30 L -16 30 Q -20 6 -18 -12 Z" fill="${c||'url(#formG)'}"/></g>`,
};
const SH={ // garment outlines in local units; P() places them on the stage
  front:'M-5 14 L0 14 C 8 14 12 8 12 0 L 34 6 C 30 20 30 30 40 34 L 40 92 C 30 100 10 100 0 100 L -5 100 Z',
  halfback:'M0 4 Q 8 4 12 0 L 34 6 C 30 20 30 30 40 34 L 40 92 C 30 100 10 100 0 100 Z',
  backbody:'M10 16 L 74 16 C 73 24 74 30 84 34 L 84 92 C 70 100 14 100 0 92 L 0 34 C 10 30 11 24 10 16 Z',
  yoke:'M30 2 Q 42 6 54 2 L 76 8 L 74 16 L 10 16 L 8 8 Z',
  sleeve:'M0 30 C 12 30 18 0 35 0 C 52 0 58 30 70 30 L 58 110 L 12 110 Z',
  leaf:'M0 6 Q 50 0 100 6 L 112 26 Q 50 18 -12 26 Z',
  stand:'M2 0 Q 50 -4 98 0 Q 106 4 104 12 Q 50 16 -4 12 Q -6 4 2 0 Z',
  cuff:'M0 0 L 80 0 L 80 22 Q 80 28 74 28 L 6 28 Q 0 28 0 22 Z',
  body:'M58 6 Q 80 16 102 6 L 124 12 C 120 30 120 46 128 56 L 128 146 C 100 154 60 154 32 146 L 32 56 C 40 46 40 30 36 12 Z',
  shirt:'M58 6 Q 80 16 102 6 L 124 12 L 160 74 L 144 84 L 124 56 L 124 146 C 100 154 60 154 36 146 L 36 56 L 16 84 L 0 74 L 36 12 Z',
  collar:'M58 6 L 80 22 L 102 6 L 98 -2 Q 80 4 62 -2 Z',
  pfront:'M0 0 L32 0 L34 20 C 34 28 38 31 46 32 L 40 70 L 38 150 L 12 150 L 8 70 L 0 34 Z',
  pback:'M0 0 L30 -4 L38 22 C 40 32 46 36 56 36 L 48 72 L 46 150 L 14 150 L 10 72 L 0 34 Z',
  pants:'M4 0 L86 0 L92 64 L86 160 L56 160 L45 58 L34 160 L4 160 L-2 64 Z',
};
function figure(ox,oy,s,o={}){
  // smooth, shaded dress form; garments are drawn over it in real fabric
  const p=d=>P(d,ox,oy,s), mirror=d=>d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g,(m,a,b)=>`${100-+a} ${b}`);
  const torso='M28 33 Q50 28 72 33 Q78 35 77 44 Q75 60 71 74 Q69 86 72 100 Q72 108 70 114 L30 114 Q28 108 28 100 Q31 86 29 74 Q25 60 23 44 Q22 35 28 33 Z';
  const arm='M72 34 Q79 35 80 44 L84 70 L86 95 Q86 99 83 99 Q80 99 80 95 L76 72 L71 50 Z';
  const leg='M30 112 L49 116 L48 186 Q48 190 44 190 L36 190 Q33 190 33 186 L31 140 Z';
  const F='fill="url(#formG)" stroke="rgba(60,45,25,.35)" stroke-width="1"';
  let g=`<g filter="url(#lift)"><ellipse cx="${ox+50*s}" cy="${oy+13*s}" rx="${9.5*s}" ry="${11.5*s}" ${F}/><path d="${p('M45 22 Q50 24 55 22 L56 31 Q50 33 44 31 Z')}" ${F}/>
   <path d="${p(leg)}" ${F}/><path d="${p(mirror(leg))}" ${F}/><path d="${p(arm)}" ${F}/><path d="${p(mirror(arm))}" ${F}/><path d="${p(torso)}" ${F}/>
   <ellipse cx="${ox+83*s}" cy="${oy+99*s}" rx="${3.4*s}" ry="${4.8*s}" ${F}/><ellipse cx="${ox+17*s}" cy="${oy+99*s}" rx="${3.4*s}" ry="${4.8*s}" ${F}/>`;
  if(o.pants) g+=`<path d="${p('M29 90 L71 90 Q72 104 70 114 L68 187 L52 187 L50.5 120 L49.5 120 L48 187 L32 187 L30 114 Q28 104 29 90 Z')}" class="${o.pants}"/><path d="${p('M29 90 L71 90 L71 95 L29 95 Z')}" class="${o.pants}" style="filter:brightness(.85)"/><path d="${p('M40 96 L40 186 M60 96 L60 186')}" stroke="rgba(255,255,255,.18)" stroke-width="1"/>`;
  if(o.shirt) g+=`<path d="${p(arm)}" class="${o.shirt}"/><path d="${p(mirror(arm))}" class="${o.shirt}"/><path d="${p('M28 33 Q50 28 72 33 Q78 35 77 44 Q75 60 71 74 Q69 86 71 102 L29 102 Q31 86 29 74 Q25 60 23 44 Q22 35 28 33 Z')}" class="${o.shirt}"/>
   <path d="${p('M43 28 L50 38 L57 28 L55 25 Q50 28 45 25 Z')}" fill="#f4f1ea" stroke="rgba(0,0,0,.25)" stroke-width="1"/><path d="${p('M50 38 L50 102')}" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>${[46,58,70,82,94].map(y=>`<circle cx="${ox+50*s}" cy="${oy+y*s}" r="${1.1*s}" fill="url(#pearlG)"/>`).join('')}`;
  if(o.skirt){
    const y=o.skirt.to, w=(y-150)*0.1;
    g+=`<path d="${p(`M29 90 L71 90 Q78 ${(90+y)/2} ${84+w} ${y} Q50 ${y+4} ${16-w} ${y} Q22 ${(90+y)/2} 29 90 Z`)}" class="${o.skirt.cls}"/>`;
  }
  if(o.top){
    const y=o.top.to, wide=y>100, armT=o.top.sleeves==='short'?'M72 34 Q79 35 80 44 L81 56 L72 58 Z':arm;
    g+=`<path d="${p(armT)}" class="${o.top.cls}"/><path d="${p(mirror(armT))}" class="${o.top.cls}"/>`+
      `<path d="${p(`M28 33 Q50 28 72 33 Q78 35 77 44 Q75 60 71 74 Q70 86 ${wide?75:71} ${y} Q50 ${y+2} ${wide?25:29} ${y} Q30 86 29 74 Q25 60 23 44 Q22 35 28 33 Z`)}" class="${o.top.cls}"/>`+
      `<path d="${p('M44 30 Q50 40 56 30')}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>`;
  }
  return g+'</g>';
}
// Realistic look: a printed cutting mat, woven fabric with soft folds and light,
// thread and chalk textures, metal and glass gradients. Shared by every picture step.
const REAL_DEFS=`
  <linearGradient id="matG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c6e58"/><stop offset=".55" stop-color="#235f4b"/><stop offset="1" stop-color="#1b4f3e"/></linearGradient>
  <radialGradient id="vig" cx=".5" cy=".42" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2=".6"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <pattern id="mg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(235,245,225,.20)" stroke-width="1"/><path d="M20 0 V40 M0 20 H40" fill="none" stroke="rgba(235,245,225,.07)" stroke-width=".7"/></pattern>
  <pattern id="mg5" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 L0 0 0 200" fill="none" stroke="rgba(255,236,170,.34)" stroke-width="1.4"/></pattern>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.2 .62"/></filter>
  <filter id="cloth" x="-4%" y="-4%" width="108%" height="112%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".0035 .016" numOctaves="2" seed="11" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="3.2" diffuseConstant="1" lighting-color="#fff" result="L"><feDistantLight azimuth="230" elevation="62"/></feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="L" operator="arithmetic" k1=".75" k2=".33" k3="0" k4="0" result="lit"/>
    <feTurbulence type="fractalNoise" baseFrequency="1.4 .22" numOctaves="1" seed="3" result="w"/>
    <feColorMatrix in="w" type="luminanceToAlpha" result="wa"/>
    <feComposite in="lit" in2="wa" operator="arithmetic" k1="0" k2="1" k3="-.10" k4=".03" result="woven"/>
    <feComposite in="woven" in2="SourceAlpha" operator="in" result="cloth"/>
    <feDropShadow in="cloth" dx="2" dy="4" stdDeviation="3.5" flood-color="#000" flood-opacity=".38"/>
  </filter>
  <filter id="lift" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#000" flood-opacity=".4"/></filter>
  <filter id="lift2" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="1.5" dy="2.5" stdDeviation="1.6" flood-color="#000" flood-opacity=".45"/></filter>
  <filter id="thread" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="900"><feDropShadow dx=".8" dy="1.2" stdDeviation=".5" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="chalk" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="900"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1.6 0 0 -.25" result="g"/><feComposite in="d" in2="g" operator="in"/></filter>
  <linearGradient id="metalG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".45" stop-color="#c5ccd2"/><stop offset=".55" stop-color="#9aa3ab"/><stop offset="1" stop-color="#e2e6e9"/></linearGradient>
  <linearGradient id="steelG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".5" stop-color="#8f979f"/><stop offset="1" stop-color="#d9dde1"/></linearGradient>
  <linearGradient id="blackG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f55"/><stop offset=".35" stop-color="#1f2226"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>
  <linearGradient id="ironG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#dfe4e8"/><stop offset="1" stop-color="#b9c1c8"/></linearGradient>
  <radialGradient id="pearlG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece7da"/><stop offset="1" stop-color="#cfc8b6"/></radialGradient>
  <radialGradient id="glassR" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffd0cc"/><stop offset=".35" stop-color="#e5484d"/><stop offset="1" stop-color="#8e1d22"/></radialGradient>
  <linearGradient id="formG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a39276"/><stop offset=".32" stop-color="#e9dcc4"/><stop offset=".5" stop-color="#efe4cf"/><stop offset=".78" stop-color="#cdbd9f"/><stop offset="1" stop-color="#9c8b6f"/></linearGradient>
  <linearGradient id="enamelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f1"/><stop offset=".7" stop-color="#e7e1d3"/><stop offset="1" stop-color="#cfc7b6"/></linearGradient>
  <pattern id="hS" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#a9bedb"/><path d="M0 6 L6 0" stroke="rgba(255,255,255,.18)" stroke-width="1"/></pattern>
  <pattern id="hP" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#98a0aa"/><path d="M0 6 L6 0" stroke="rgba(255,255,255,.14)" stroke-width="1"/></pattern>
  <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f6f4ee"/><circle cx="4" cy="4" r="1" fill="#d9d3c2"/></pattern>
  <radialGradient id="tapeG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe680"/><stop offset=".7" stop-color="#f2c230"/><stop offset="1" stop-color="#c79a10"/></radialGradient>
  <radialGradient id="cushG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f07a7d"/><stop offset=".6" stop-color="#c9343a"/><stop offset="1" stop-color="#7d1a1f"/></radialGradient>
  <radialGradient id="glassY" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff3c2"/><stop offset=".4" stop-color="#f2c230"/><stop offset="1" stop-color="#9c7408"/></radialGradient>
  <linearGradient id="woodG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a9824f"/><stop offset=".5" stop-color="#e2c391"/><stop offset="1" stop-color="#9b7546"/></linearGradient>
  <linearGradient id="spoolG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f5d9a"/><stop offset=".45" stop-color="#6d9be0"/><stop offset="1" stop-color="#244a7e"/></linearGradient>
  <linearGradient id="rulerG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6e6"/><stop offset="1" stop-color="#dccfa8"/></linearGradient>
  <linearGradient id="chalkB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe2fb"/><stop offset=".6" stop-color="#8fb9ee"/><stop offset="1" stop-color="#6c9bd6"/></linearGradient>
  <pattern id="wrongTex" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="7" fill="rgba(255,255,255,.28)"/></pattern>
  <marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#fff"/></marker>`;
const MAT=`<rect width="800" height="500" fill="url(#matG)"/><rect width="800" height="500" fill="url(#mg)"/><rect width="800" height="500" fill="url(#mg5)"/>
  <path d="M0 500 L500 0 M300 500 L800 0" stroke="rgba(255,236,170,.10)" stroke-width="1"/>
  ${Array.from({length:19},(_,i)=>`<text x="${(i+1)*40+2}" y="11" style="font:600 8px var(--f-mono)" fill="rgba(255,240,200,.45)">${i+1}</text>`).join('')}
  ${Array.from({length:11},(_,i)=>`<text x="3" y="${(i+1)*40+3}" style="font:600 8px var(--f-mono)" fill="rgba(255,240,200,.45)">${i+1}</text>`).join('')}
  <rect width="800" height="500" filter="url(#grain)" opacity=".5"/><rect width="800" height="500" fill="url(#sheen)"/>`;
function stageSvg(inner,bg=true){
  return `<svg viewBox="0 0 800 500" role="img" aria-label="Step picture"><defs>${REAL_DEFS}</defs>${bg?MAT:''}<g>${inner}</g>${bg?'<rect width="800" height="500" fill="url(#vig)" pointer-events="none"/>':''}</svg>`;
}
export { n1, TR, P, st, H, ICON, SH, figure, stageSvg };
