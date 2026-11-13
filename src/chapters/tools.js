// TOOLS chapter
import { H, ICON } from '../art/svg.js';

const TOOLICONS=[
 ['Tape','measuring tape',(x,y)=>`<circle cx="${x}" cy="${y}" r="30" fill="url(#tapeG)" stroke="#8a6a08" stroke-width="2"/><circle cx="${x}" cy="${y}" r="10" fill="#1b2326"/><path d="M${x+28} ${y+14} L${x+62} ${y+26} L${x+58} ${y+38} L${x+24} ${y+26} Z" fill="url(#tapeG)" stroke="#8a6a08" stroke-width="1.5"/>`],
 ['Scissors','fabric scissors',(x,y)=>`<g transform="translate(${x} ${y}) scale(1.6) rotate(-30)">${ICON.scissors()}</g>`],
 ['Chalk','tailor\'s chalk',(x,y)=>`<path d="M${x-34} ${y+22} L${x+34} ${y+22} L${x} ${y-30} Z" fill="url(#chalkB)" stroke="#5f8fca" stroke-width="1.5" stroke-linejoin="round"/>`],
 ['Pins','pins and pin cushion',(x,y)=>`<ellipse cx="${x}" cy="${y+10}" rx="34" ry="22" fill="url(#cushG)"/>${[[-14,-14],[4,-20],[18,-10]].map(([a,b])=>`<line x1="${x+a}" y1="${y+b+16}" x2="${x+a+6}" y2="${y+b-6}" stroke="#d9dde1" stroke-width="2"/><circle cx="${x+a+6}" cy="${y+b-8}" r="5" fill="url(#glassY)"/>`).join('')}`],
 ['Ruler','long ruler',(x,y)=>`<rect x="${x-60}" y="${y-12}" width="120" height="26" rx="3" fill="url(#rulerG)" stroke="#9c8d68" stroke-width="1.5"/>${Array.from({length:11},(_,i)=>`<line x1="${x-54+i*11}" y1="${y-12}" x2="${x-54+i*11}" y2="${y-(i%2?4:0)}" stroke="#1b2326" stroke-width="2"/>`).join('')}`],
 ['Paper','big paper for the pattern',(x,y)=>`<rect x="${x-40}" y="${y-30}" width="80" height="60" fill="#eadcbc" stroke="#7c6a45" stroke-width="2"/><path d="M${x-40} ${y-10} H${x+40} M${x-40} ${y+10} H${x+40} M${x-14} ${y-30} V${y+30} M${x+14} ${y-30} V${y+30}" stroke="#c7b48c" stroke-width="1.5"/>`],
 ['Iron','iron',(x,y)=>`<g transform="translate(${x} ${y+16}) scale(.75)">${ICON.iron(0,0)}</g>`],
 ['Thread','thread spool',(x,y)=>`<rect x="${x-26}" y="${y-34}" width="52" height="10" rx="3" fill="url(#woodG)" stroke="#7c6a45" stroke-width="1"/><rect x="${x-20}" y="${y-24}" width="40" height="48" fill="url(#spoolG)"/><path d="M${x-20} ${y-14} H${x+20} M${x-20} ${y-2} H${x+20} M${x-20} ${y+10} H${x+20}" stroke="#356bb7" stroke-width="2"/><rect x="${x-26}" y="${y+24}" width="52" height="10" rx="3" fill="url(#woodG)" stroke="#7c6a45" stroke-width="1"/>`],
 ['Needle','machine needle',(x,y)=>`<rect x="${x-7}" y="${y-36}" width="14" height="24" rx="2" class="metal"/><path d="M${x-3} ${y-12} L${x+3} ${y-12} L${x+1} ${y+34} L${x-1} ${y+34} Z" fill="#eef2f4" stroke="#4f5a63" stroke-width="1.5"/>`],
 ['Ripper','seam ripper (undo stitches)',(x,y)=>`<rect x="${x-10}" y="${y}" width="20" height="40" rx="8" fill="url(#cushG)"/><path d="M${x} ${y} L${x} ${y-24} M${x} ${y-24} q -10 -4 -6 -16 M${x} ${y-24} q 8 -10 4 -20" fill="none" stroke="#d3dadd" stroke-width="4" stroke-linecap="round"/>`],
 ['Stiff layer','interfacing',(x,y)=>`<rect x="${x-40}" y="${y-28}" width="80" height="56" rx="4" class="intf"/>`],
 ['Buttons','buttons',(x,y)=>ICON.button(x-22,y-8,15)+ICON.button(x+18,y-12,12)+ICON.button(x,y+18,13)],
];
function toolsGrid(){
  let o='';TOOLICONS.forEach((t,i)=>{const c=i%4,r=Math.floor(i/4),x=110+c*193,y=90+r*158;
   o+=H.pop(`<g class="tapp" data-say="${t[1]}"><rect x="${x-86}" y="${y-62}" width="172" height="146" rx="18" class="tilebg"/><g filter="url(#lift2)">${t[2](x,y)}</g><text x="${x}" y="${y+70}" class="wordt">${t[0]}</text></g>`,.15+i*.18);});
  return o;
}
const TOOLS=[
 {cap:'Your tools',say:'These are the tools you need. Tap any picture to hear its name.',svg:toolsGrid},
 {cap:'Two sides of fabric',say:'Fabric has two sides. The good side is bright. It goes on the outside. The wrong side is the back, shown with stripes in these pictures.',svg:()=>
   H.pop(`<rect x="90" y="70" width="270" height="250" rx="12" class="fr"/>`,.1)+H.word(225,360,'GOOD SIDE',.4)+H.ok(225,195,.6)+
   H.pop(`<rect x="440" y="70" width="270" height="250" rx="12" class="fw"/>`,1)+H.word(575,360,'WRONG SIDE',1.3)},
 {cap:'Picture signs',say:'Watch for these signs. A dotted yellow line means sew. A white line means draw with chalk. Scissors mean cut. A white arrow means fold or move.',svg:()=>{
   const row=(y,inner,w,d)=>H.fade(inner+`<text x="560" y="${y+8}" class="wordt" text-anchor="start">${w}</text>`,d);
   return row(80,H.stitch('M120 80 L480 80',.3,1.6),'SEW',0)+row(180,H.draw('M120 180 L480 180','chalkl',1.4,1),'DRAW',1.2)+row(280,H.cut('M120 280 L480 280',2.2,1.6),'CUT',2)+row(380,H.arrow('M120 400 Q 300 330 480 400',3.6),'FOLD / MOVE',3.6);}},
 {cap:'Stay safe',say:'Always ask a grown-up to help with the hot iron. Keep your fingers away from the needle: hold the fabric at the sides, never in front of the needle.',svg:()=>
   ICON.iron(220,250)+H.fade(ICON.person(150,380,1.6)+ICON.person(210,394,1.1),.3)+H.ok(300,120,.8)+
   `<g>${'<g transform="translate(560 300)">'+ICON.foot()+'</g>'}</g>`+H.fade(`<circle cx="560" cy="300" r="46" fill="rgba(229,72,77,.3)" stroke="#e5484d" stroke-width="4"/>`,1.2)+H.no(560,400,1.6,26)+
   H.fade(`<rect x="430" y="270" width="60" height="40" rx="18" class="mann"/><rect x="630" y="270" width="60" height="40" rx="18" class="mann"/>`,2)+H.ok(460,220,2.4)+H.ok(660,220,2.6)},
];

export { TOOLICONS, toolsGrid, TOOLS };
