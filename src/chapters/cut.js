// CUT chapter
import { S } from '../core/state.js';
import { TR, H, ICON, SH } from '../art/svg.js';
import { TOOLICONS } from './tools.js';

function metres(){
  const isS=S.garment==='shirt';
  return [36,44,58].map(w=>{let n;
    if(isS){const Lp=S.shirt.length+2,SLp=S.shirt.sleeve-1;n=w===36?2*Lp+SLp+14:w===44?2*Lp+10:Lp+SLp+12;}
    else{const Op=S.pant.outseam+2,Hh=S.pant.hip,need=(Hh/4+Hh/16)+(Hh/4+1+Hh/10)+3;n=w===36?2*Op+14:w===44?2*Op+4:(need>w/2?2*Op+4:Op+8);}
    return [w,Math.ceil(n*1.05*2.54/10)/10];});
}
function layout(){
  const isS=S.garment==='shirt';
  if(isS)return [
    [TR(SH.halfback,(x,y)=>[80+y*2,120+x*2]),0],
    [TR(SH.front,(x,y)=>[300+y*2,262+x*1.9]),.25],
    [TR(SH.sleeve,(x,y)=>[520+y*1.8,140+x*1.8]),.5],
    [TR(SH.leaf,(x,y)=>[110+x*1.2,340+y*1.2]),.75],
    [TR(SH.cuff,(x,y)=>[560+x*.9,340+y*.9]),.9],[TR(SH.cuff,(x,y)=>[650+x*.9,340+y*.9]),1]];
  return [
    [TR(SH.pfront,(x,y)=>[80+y*2,134+x*1.9]),0],
    [TR(SH.pback,(x,y)=>[80+y*2,250+x*2.6]),.3],
    [`M420 140 L720 140 L720 175 L420 175 Z`,.6],[`M420 190 L720 190 L720 225 L420 225 Z`,.7],
    [`M440 260 L560 260 L560 340 L440 340 Z`,.85],[`M580 260 L700 260 L700 340 L580 340 Z`,.95]];
}
const FAB=(isS)=>`<rect x="60" y="120" width="680" height="320" class="${isS?'fw':'pw'}"/><path d="M60 120 L740 120" class="foldl"/>`;
function cutSteps(){
  const isS=S.garment==='shirt',fr=isS?'fr':'pr',fw=isS?'fw':'pw';
  return [
  {cap:'How much fabric',say:()=>{const m=metres();return `Fabric comes in different widths. For your size, buy ${m[2][1]} metres of wide fabric, or ${m[1][1]} metres of medium fabric, or ${m[0][1]} metres of narrow fabric.`;},svg:()=>metres().map(([w,m],i)=>{const x=130+i*230,h=w*3.4,y=420-h;
     return H.pop(`<rect x="${x}" y="${y}" width="120" height="${h}" rx="8" class="${fr}"/><ellipse cx="${x+60}" cy="${y}" rx="60" ry="12" class="${fw}"/>`,.2+i*.3)+H.chip(x+60,y-40,w+'″ wide',.5+i*.3)+H.chip(x+60,460,m+' m',.8+i*.3);}).join('')},
  {cap:'Shopping list',say:isS?'You also need thread, buttons, and some interfacing for the collar and cuffs.':'You also need thread, a trouser zip, a hook and bar, a button, pocket fabric and a waistband strip.',svg:()=>{
     const items=isS?[[TOOLICONS[7][2],'Thread'],[(x,y)=>ICON.button(x-22,y-8,15)+ICON.button(x+18,y-12,12)+ICON.button(x,y+18,13),'×'+(Math.floor((S.shirt.length+.75-5-(S.shirt.neck/6+.75+3))/3.5)+1+7)],[TOOLICONS[10][2],'0.5 m']]
       :[[TOOLICONS[7][2],'Thread'],[(x,y)=>ICON.zip(x,y-50,100),'7″ zip'],[(x,y)=>`<path d="M${x-26} ${y} q0 -20 20 -20 h20" fill="none" stroke="#d3dadd" stroke-width="7"/><rect x="${x+8}" y="${y-8}" width="26" height="12" rx="4" fill="#d3dadd"/>`,'Hook'],[(x,y)=>`<rect x="${x-50}" y="${y-30}" width="100" height="60" class="lin"/>`,'Pocket cloth']];
     const gap=700/items.length;return items.map(([fn,w],i)=>{const x=50+gap*(i+.5);return H.pop(`<rect x="${x-80}" y="130" width="160" height="220" rx="18" class="tilebg"/>${fn(x,230)}`,.2+i*.3)+H.word(x,320,w,.4+i*.3);}).join('');}},
  {cap:'Wash, dry, iron',say:'Wash the fabric first, because it may shrink. Dry it, then iron it flat. Ask a grown-up to help with the iron.',svg:()=>
    H.pop(`<rect x="70" y="140" width="170" height="210" rx="16" class="mach"/><circle cx="155" cy="260" r="62" fill="#8fb8e6" stroke="#3a464d" stroke-width="4"/><path d="M110 270 q 22 -16 45 0 t 45 0" fill="none" stroke="#fff" stroke-width="4"/>`,.1)+H.arrow('M255 250 L320 250',.6)+
    H.pop(`<path d="M340 150 L520 150" stroke="#fff" stroke-width="3"/><path d="M360 150 L500 150 Q 510 240 480 330 Q 430 310 380 330 Q 350 240 360 150 Z" class="${fr}"/>`,.9)+H.arrow('M540 250 L600 250',1.4)+
    H.pop(`<rect x="610" y="260" width="160" height="90" class="${fr}"/>`,1.7)+H.iron(690,270,2,40)},
  {cap:'Fold the fabric',say:'Fold the fabric in half the long way, good sides inside. The two side edges, called selvedges, meet at the bottom.',svg:()=>
    `<rect x="60" y="250" width="680" height="190" class="${fr}"/>`+H.out(H.flip(`<rect x="60" y="60" width="680" height="190" class="${fr}"/>`,'y',250,.5,1.4),1.9)+
    H.fade(`<rect x="60" y="250" width="680" height="190" class="${fw}"/>`,1.9)+H.arrow('M760 90 Q 800 250 760 400',.4)+H.fade(`<path d="M60 250 L740 250" class="foldl"/>`,2.2)+H.word(400,238,'FOLD',2.3)+H.ring(400,440,24,2.6)},
  {cap:'Lay out the pieces',say:isS?'Put the paper pieces on the fabric. The back goes against the fold. Leave a little space around every piece.':'Put the paper pieces on the fabric. Leave a little space around every piece.',svg:()=>FAB(isS)+layout().map(([d,dl])=>H.move(`<path d="${d}" class="paperpc"/>`,0,-420,.2+dl,1)).join('')},
  {cap:'Straight with the edge',say:'Each paper has a double arrow. Measure from both ends of the arrow to the bottom edge. Both numbers must be the same, so the clothes hang straight.',svg:()=>FAB(isS)+layout().map(([d])=>`<path d="${d}" class="paperpc"/>`).join('')+
    H.draw(isS?'M330 300 L470 300':'M110 175 L340 175','chalkl',.3,.8)+H.dim(isS?[340,300]:[120,175],isS?[340,440]:[120,440],isS?'4½':'5',1.2)+H.dim(isS?[460,300]:[330,175],isS?[460,440]:[330,440],isS?'4½':'5',1.8)+H.ok(660,80,2.6)},
  {cap:'Pin and draw around',say:'Pin the paper to the fabric. Draw around each piece with chalk, adding the sewing space.',svg:()=>FAB(isS)+layout().map(([d],i)=>`<path d="${d}" class="paperpc"/>`+H.draw(d,'chalkl',1+i*.5,1.2)).join('')+H.pins(isS?[[120,150],[240,180],[330,280],[470,300],[560,160],[700,250]]:[[120,150],[320,180],[120,280],[330,320],[460,155],[600,300]],.2,.12)},
  {cap:'Cut it out',say:'Cut on the chalk line with long smooth cuts. Cut through both layers at once. Keep the fabric flat on the table.',svg:()=>{const l=layout();return FAB(isS)+l.map(([d])=>`<path d="${d}" class="paperpc"/>`).join('')+H.cut(l[1][0],.3,4)+H.ok(680,80,4.6);}},
  {cap:'Snip the notches',say:'Make tiny snips at the marks, like the middle of the back and the top of the sleeve. They help you match the pieces later.',svg:()=>{
    const pcs=isS?[[TR(SH.halfback,(x,y)=>[160+x*3.2,40+y*3.2]),[[160,52],[290,120],[290,330]]],[TR(SH.sleeve,(x,y)=>[440+x*3,90+y*3]),[[545,90],[440,180],[650,180]]]]:[[TR(SH.pfront,(x,y)=>[200+x*2.6,40+y*2.6]),[[200,128],[290,40],[230,222]]],[TR(SH.pback,(x,y)=>[460+x*2.4,50+y*2.4]),[[460,132],[534,103],[484,223]]]];
    return pcs.map(([d,ns],i)=>`<path d="${d}" class="${fr}"/>`+ns.map((n,j)=>H.pop(`<path d="M${n[0]-9} ${n[1]-9} L${n[0]} ${n[1]} L${n[0]+9} ${n[1]-9}" fill="none" stroke="#fff" stroke-width="4"/>`,.3+(i*3+j)*.35)+H.ring(n[0],n[1],18,.3+(i*3+j)*.35)).join('')).join('');}},
  ];
}

export { metres, layout, FAB, cutSteps };
