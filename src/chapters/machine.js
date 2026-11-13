// MACHINE chapter
import { S } from '../core/state.js';
import { f, sn } from '../core/units.js';
import { P, H } from '../art/svg.js';

function machine(ox,oy,s){
  const p=d=>P(d,ox,oy,s);
  return `<path d="${p('M-30 170 L310 170 L310 196 L-30 196 Z')}" class="machd"/>
   <path d="${p('M0 0 L270 0 Q 290 0 290 20 L 290 170 L 220 170 L 220 60 L 70 60 L 70 120 L 0 120 Z')}" class="mach"/>
   <circle cx="${ox+300*s}" cy="${oy+60*s}" r="${28*s}" class="machd"/>
   <path d="${p('M190 0 L190 -24')}" stroke="#3a464d" stroke-width="5"/><rect x="${ox+178*s}" y="${oy-44*s}" width="${24*s}" height="${22*s}" rx="4" fill="#e5484d"/>
   <path d="${p('M30 120 L30 150')}" class="needle"/><path d="${p('M14 140 L50 140 L54 150 L14 150 Z')}" class="metal"/>`;
}
const MACHINE=[
 {cap:'Put the thread on',say:'Put the thread on the spool pin. Follow the numbers on your machine: across the top, down, round the U, up to the hook, and down to the needle.',svg:()=>{
   const ox=190,oy=110,s=1.4,p=d=>P(d,ox,oy,s);
   const path=p('M190 -33 L 110 8 L 50 20 L 50 100 L 20 100 L 20 14 L 34 14 L 34 110 L 30 140');
   const nums=[[110,8],[50,60],[20,60],[27,14],[30,138]];
   return machine(ox,oy,s)+H.draw(path,'thread',.5,4)+nums.map((q,i)=>H.pop(`<circle cx="${ox+q[0]*s}" cy="${oy+q[1]*s}" r="15" fill="#f2c230" stroke="#1b2326" stroke-width="2"/><text x="${ox+q[0]*s}" y="${oy+q[1]*s+1}" class="chipt" style="font-size:16px">${i+1}</text>`,.5+i*.8)).join('');}},
 {cap:'Put the bobbin in',say:'Wind thread on the small bobbin. Drop it in under the needle plate so the thread pulls the right way. Pull a tail of thread out.',svg:()=>
   `<rect x="170" y="110" width="460" height="300" rx="18" class="metal"/><circle cx="400" cy="260" r="90" fill="#9aa5ab" stroke="#4f5a63" stroke-width="3"/>`+
   H.move(`<circle cx="400" cy="260" r="56" fill="#f6f3ea" stroke="#4f5a63" stroke-width="3"/><circle cx="400" cy="260" r="40" fill="#e5484d"/><circle cx="400" cy="260" r="10" fill="#f6f3ea"/>`,260,-200,.3,1.4)+
   H.draw('M440 250 Q 500 220 560 160','thread',2,1)+H.arrow('M570 150 L640 90',2.8)},
 {cap:'Stitch length 2.5',say:'Turn the stitch length dial to two and a half. This is the best size for most seams.',svg:()=>
   `<circle cx="300" cy="250" r="140" fill="#f1f3f2" stroke="#3a464d" stroke-width="5"/>`+[0,1,2,3,4,5].map(i=>{const a=(-210+i*48)*Math.PI/180;return `<text x="${300+Math.cos(a)*105}" y="${250+Math.sin(a)*105+8}" style="font:700 28px var(--f-mono)" fill="#1b2326" text-anchor="middle">${i}</text>`;}).join('')+
   `<g class="rot" style="--ox:300px;--oy:250px;--r:120deg;--d:.4s;--t:1.4s"><path d="M300 250 L${300+Math.cos(-210*Math.PI/180)*80} ${250+Math.sin(-210*Math.PI/180)*80}" stroke="#e5484d" stroke-width="10" stroke-linecap="round"/></g><circle cx="300" cy="250" r="16" fill="#3a464d"/>`+
   H.chip(610,250,'2.5 mm',1.8)+H.stitch('M520 360 L720 360',2.2,1.2,null)},
 {cap:'Lock the start',say:'At the start of every seam, sew three stitches forward, three stitches backward, then forward again. This locks the thread. Do the same at the end.',svg:()=>
   `<rect x="80" y="170" width="640" height="160" rx="8" class="fr"/>`+H.stitch('M150 250 L250 250',.3,.9)+H.arrow('M250 210 L160 210',1.3)+H.stitch('M250 256 L160 256',1.5,.9)+H.arrow('M170 300 L300 300',2.6)+H.stitch('M160 250 L680 250',2.8,3)},
 {cap:'Follow the guide line',say:`Keep the edge of the fabric on the guide line of the needle plate, ${sn(S.garment==='shirt'?.375:.625)} from the needle. Watch the edge, not the needle.`,svg:()=>{
   const g=S.garment==='shirt'?60:100;
   return `<rect x="380" y="20" width="320" height="460" class="metal"/>`+[60,100,140].map((x,i)=>`<line x1="${300+x}" y1="20" x2="${300+x}" y2="480" stroke="#4f5a63" stroke-width="${x===g?5:2}"/>`).join('')+
   H.move(`<rect x="60" y="40" width="${240+g}" height="420" class="fr"/>`,-120,0,.2,1)+H.ring(300+g,250,30,1.3)+H.stitch('M300 470 L300 40',1.8,3.5)+H.chip(300+g/2,60,f(S.garment==='shirt'?.375:.625),1.3);}},
 {cap:'Turning a corner',say:'At a corner, stop with the needle down in the fabric. Lift the presser foot. Turn the fabric. Put the foot down and keep sewing.',svg:()=>
   `<rect x="170" y="80" width="460" height="340" class="fr"/>`+H.stitch('M210 120 L590 120',.2,2)+H.ring(590,120,26,2.3)+H.chip(470,180,'needle ↓',2.4)+H.chip(470,230,'foot ↑',3)+H.arrow('M650 170 Q 690 120 650 70',3.4)+H.stitch('M590 120 L590 380',4.2,2)},
 {cap:'Practise on paper',say:'Before using fabric, practise with no thread on paper. Follow the lines. Straight, then curves, then corners. Do it until it feels easy.',svg:()=>
   `<rect x="70" y="40" width="660" height="420" rx="6" fill="#f6f3ea"/>`+[`M120 110 L680 110`,`M120 230 C 230 150 330 310 440 230 C 550 150 600 290 680 230`,`M120 360 L300 360 L300 420 L480 420 L480 320 L680 320`].map((d,i)=>`<path d="${d}" fill="none" stroke="#c9c2ad" stroke-width="3"/>`+H.stitch(d,.3+i*3,2.8,'foot','stitch solid')).join('')},
 {cap:'Press every seam',say:'After every seam, press it flat with the iron, then press it open. Pressing makes your clothes look neat.',svg:()=>
   `<rect x="100" y="160" width="300" height="200" class="fw"/><rect x="400" y="160" width="300" height="200" class="fw"/>`+H.stitch('M400 160 L400 360',0,0,null)+
   `<rect x="370" y="160" width="30" height="200" class="fr2"/>`+
   H.flip(`<rect x="370" y="160" width="30" height="200" class="fr2"/>`,'x',400,.6,1)+H.iron(330,170,1.8,140)},
];

export { machine, MACHINE };
