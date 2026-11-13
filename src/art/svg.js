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
  pin:(x,y,d0=0)=>H.pop(`<line x1="${x-18}" y1="${y+12}" x2="${x+12}" y2="${y-8}" stroke="#e8ecef" stroke-width="3"/><circle cx="${x+14}" cy="${y-9}" r="7" class="red" stroke="#fff" stroke-width="1.5"/>`,d0),
  pins:(pts,d0=0,gap=.15)=>pts.map((p,i)=>H.pin(p[0],p[1],d0+i*gap)).join(''),
  iron:(x,y,d0=0,dx=120,dy=0,n=3)=>H.fade(`<g class="slide" style="--d:${d0}s;--dx:${dx}px;--dy:${dy}px;--n:${n}">${ICON.iron(x,y)}</g>`,d0),
  ring:(x,y,r,d0=0)=>H.fade(`<circle cx="${x}" cy="${y}" r="${r}" class="ring pul" style="--d:${d0}s"/>`,d0),
  dim:(a,b,val,d0=0,off=0)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*off,ny=dx/L*off;
     const A=[a[0]+nx,a[1]+ny],B=[b[0]+nx,b[1]+ny],tx=-dy/L*8,ty=dx/L*8;
     return H.fade(`<path class="dimln" d="M${n1(A[0])} ${n1(A[1])} L${n1(B[0])} ${n1(B[1])} M${n1(A[0]-tx)} ${n1(A[1]-ty)} L${n1(A[0]+tx)} ${n1(A[1]+ty)} M${n1(B[0]-tx)} ${n1(B[1]-ty)} L${n1(B[0]+tx)} ${n1(B[1]+ty)}"/>`,d0)+H.chip((A[0]+B[0])/2,(A[1]+B[1])/2,typeof val==='number'?f(val):val,d0+.2);},
  zz:(pts,amp=6,step=11)=>{const o=[];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,n=Math.max(2,Math.round(L/step));for(let i=(k?1:0);i<=n;i++){const t=i/n,s=i%2?amp:-amp;o.push(n1(a[0]+dx*t+nx*s)+' '+n1(a[1]+dy*t+ny*s));}}return 'M'+o.join(' L');},
};
const ICON={
  foot:()=>`<g><rect x="-6" y="-78" width="12" height="44" rx="3" class="metal"/><line x1="0" y1="-36" x2="0" y2="-2" class="needle"/><path d="M-26 -16 L20 -16 L28 -6 L-26 -6 Z" class="metal"/></g>`,
  hand:()=>`<g transform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="-46" class="needle"/><ellipse cx="0" cy="-42" rx="2" ry="4" fill="none" stroke="#4f5a63" stroke-width="1.5"/><path d="M0 -46 C 10 -70 30 -60 40 -80" fill="none" stroke="#e5484d" stroke-width="2.5"/></g>`,
  scissors:()=>`<g><path d="M-8 -3 L34 -1 L-8 4 Z" class="metal" transform="rotate(-14)"/><path d="M-8 -4 L34 1 L-8 3 Z" class="metal" transform="rotate(14)"/><circle cx="-20" cy="-11" r="9" fill="none" stroke="#e5484d" stroke-width="5"/><circle cx="-20" cy="11" r="9" fill="none" stroke="#e5484d" stroke-width="5"/><circle r="3" fill="#4f5a63"/></g>`,
  iron:(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-62 0 Q -60 -34 -16 -38 L 48 -38 L 54 0 Z" class="ironb"/><path d="M-64 0 L56 0 L56 6 L-64 6 Z" class="irons"/><path d="M-24 -38 Q -16 -66 28 -62 L 36 -38" fill="none" stroke="#4f5a63" stroke-width="9" stroke-linecap="round"/><circle cx="10" cy="-20" r="6" class="red"/><path d="M-40 -48 q-6 -10 0 -20 M-26 -52 q-6 -10 0 -20" class="steam"/></g>`,
  button:(x,y,r=11)=>`<g><circle cx="${x}" cy="${y}" r="${r}" fill="#f6f3ea" stroke="#5a5a52" stroke-width="2"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="1.8" fill="#5a5a52"/><circle cx="${x+r*.3}" cy="${y-r*.3}" r="1.8" fill="#5a5a52"/><circle cx="${x-r*.3}" cy="${y+r*.3}" r="1.8" fill="#5a5a52"/><circle cx="${x+r*.3}" cy="${y+r*.3}" r="1.8" fill="#5a5a52"/></g>`,
  zip:(x,y,h)=>{let t='';for(let i=8;i<h-14;i+=7)t+=`<rect x="${x-4+(i%14?0:3)}" y="${y+i}" width="5" height="4" fill="#d3dadd"/>`;return `<g><rect x="${x-12}" y="${y}" width="24" height="${h}" rx="3" fill="#2a2f35"/>${t}<rect x="${x-7}" y="${y+h-24}" width="14" height="20" rx="3" class="metal"/></g>`;},
  person:(x,y,s,c='#c9d5d1')=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-30" r="12" fill="${c}"/><path d="M-18 -14 Q 0 -20 18 -14 L 16 30 L -16 30 Z" fill="${c}"/></g>`,
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
  const c='mann',sc=o.shirt||c,pc=o.pants||c;
  return `<g><circle cx="${ox+50*s}" cy="${oy+14*s}" r="${12*s}" class="${c}"/><path d="${P('M45 24 L55 24 L55 34 L45 34 Z',ox,oy,s)}" class="${c}"/>
   <path d="${P('M30 100 L70 100 L68 190 L54 190 L50 116 L46 190 L32 190 Z',ox,oy,s)}" class="${pc}"/>
   <path d="${P('M26 34 L14 96 L20 98 L32 50 Z',ox,oy,s)}" class="${sc}"/><path d="${P('M74 34 L86 96 L80 98 L68 50 Z',ox,oy,s)}" class="${sc}"/>
   <path d="${P('M26 34 L74 34 L70 100 L30 100 Z',ox,oy,s)}" class="${sc}"/>
   ${o.shirt?`<path d="${P('M50 34 L50 100',ox,oy,s)}" stroke="#1d3c69" stroke-width="2"/><path d="${P('M42 30 L50 40 L58 30',ox,oy,s)}" fill="#ffffff" stroke="#1d3c69" stroke-width="2"/>`:''}
   ${o.pants?`<path d="${P('M30 100 L70 100 L70 105 L30 105 Z',ox,oy,s)}" class="pr2"/>`:''}
   <circle cx="${ox+16*s}" cy="${oy+100*s}" r="${4*s}" class="${c}"/><circle cx="${ox+84*s}" cy="${oy+100*s}" r="${4*s}" class="${c}"/></g>`;
}
function stageSvg(inner,bg=true){
  return `<svg viewBox="0 0 800 500" role="img" aria-label="Step picture"><defs>
  <pattern id="hS" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#b9cfee"/><rect width="3.5" height="9" fill="#93b2e0"/></pattern>
  <pattern id="hP" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#a9b1ba"/><rect width="3.5" height="9" fill="#8e97a1"/></pattern>
  <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f4f1e6"/><circle cx="5" cy="5" r="1.6" fill="#c2bca8"/></pattern>
  <pattern id="mg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/></pattern>
  <marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#fff"/></marker>
  </defs>${bg?'<rect width="800" height="500" class="matbg"/><rect width="800" height="500" fill="url(#mg)"/>':''}${inner}</svg>`;
}

export { n1, TR, P, st, H, ICON, SH, figure, stageSvg };
