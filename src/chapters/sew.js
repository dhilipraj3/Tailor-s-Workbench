// SEW chapter
import { f, sn } from '../core/units.js';
import { TR, P, st, H, ICON, SH, figure } from '../art/svg.js';
import { machine } from './machine.js';
import { FIG } from './measure.js';
import { pp } from '../drafting/pattern.js';

const SEW_SHIRT=[
 {cap:'Iron on the stiff layer',say:'Lay the collar pieces and two cuffs wrong side up. Put the interfacing on top, glue side down. With a grown-up, press for ten seconds. Lift and press, do not slide.',svg:()=>
   `<path d="${P(SH.leaf,200,90,3)}" class="fw"/>`+H.move(`<path d="${P(SH.leaf,200,90,3)}" class="intf"/>`,0,-180,.3,1)+
   `<path d="${P(SH.cuff,220,300,2.6)}" class="fw"/>`+H.move(`<path d="${P(SH.cuff,220,300,2.6)}" class="intf"/>`,0,200,.8,1)+H.chip(500,340,'×2',1.4)+
   H.iron(350,150,1.8,160)+H.ok(650,240,4.8)},
 {cap:'Fold the front edge',say:`Fold the front edge over by ${sn(1.5)} and press it. Then sew two lines to hold it. Do this on both fronts.`,svg:()=>
   `<path d="${P(SH.front,360,40,4)}" class="fw"/>`+H.flip(`<rect x="300" y="96" width="40" height="344" class="fw"/>`,'x',340,.5,1)+H.chip(320,60,f(1.5),0)+
   H.stitch('M346 100 L346 436',1.8,1.6)+H.stitch('M374 100 L374 436',3.6,1.6)},
 {cap:'Sew on the pocket',say:'Fold the top of the pocket down and sew it. Fold in the other edges. Pin it on the left front. Sew around the sides and the bottom.',svg:()=>
   `<path d="${P(SH.front,420,60,3.6)}" class="fr"/>`+H.out(`<path d="M150 170 L230 170 L230 256 L190 266 L150 256 Z" class="fr2"/>`+H.flip(`<rect x="150" y="150" width="80" height="20" class="fr2"/>`,'y',170,.3,.8),1.7)+
   H.move(`<path d="M450 172 L530 172 L530 256 L490 266 L450 256 Z" class="fr2"/><path d="M450 182 L530 182" class="stitch"/>`,-300,0,1.7,1)+H.pins([[455,180],[525,180]],2.6)+H.stitch('M450 174 L450 256 L490 266 L530 256 L530 174',3,2.4)},
 {cap:'Join back and yoke',say:'Put the yoke on top of the back, good sides together. Put the second yoke underneath. Sew along the top edge of the back. Then flip the yokes up.',svg:()=>{
   const s=3.4,ox=258,oy=90,down=TR(SH.yoke,(x,y)=>[ox+x*s,oy+(32-y)*s]),up=P(SH.yoke,ox,oy,s);
   return `<path d="${P(SH.backbody,ox,oy,s)}" class="fr"/>`+H.out(H.move(`<path d="${down}" class="fw"/>`,0,-170,.2,1),3.8)+H.stitch(`M${ox+10*s} ${oy+16*s} L${ox+74*s} ${oy+16*s}`,1.4,2.2)+H.fade(`<path d="${up}" class="fr2"/>`,3.8)+H.arrow(`M${ox+100*s} ${oy+30*s} Q ${ox+108*s} ${oy+16*s} ${ox+100*s} ${oy+4*s}`,3.6)+H.ok(660,300,4.6);}},
 {cap:'Sew the shoulders',say:'Lay the two fronts on the back, good sides together. Match the shoulders to the yoke. Sew both shoulder seams.',svg:()=>{
   const s=3.4,ox=258,oy=90;
   return `<path d="${P(SH.backbody,ox,oy,s)}" class="fr"/><path d="${P(SH.yoke,ox,oy,s)}" class="fr2"/>`+
   H.move(`<path d="${P(SH.front,400.8,96.8,s)}" class="fw" opacity=".95"/>`,260,0,.2,1)+H.move(`<path d="${P(SH.front,400.8,96.8,s,-1)}" class="fw" opacity=".95"/>`,-260,0,.5,1)+
   H.stitch('M441.6 97 L516.4 117',1.8,1.2)+H.stitch('M360 97 L285.2 117',3.2,1.2);}},
 {cap:'Sew the collar',say:'Put the two collar pieces together, good sides facing. Sew around the ends and the long outside edge. Leave the neck edge open. Snip off the corners.',svg:()=>{
   const p=d=>P(d,220,170,3);
   return `<path d="${p(SH.leaf)}" class="fr"/>`+H.move(`<path d="${p(SH.leaf)}" class="fw"/>`,0,-200,.2,1)+H.stitch(p('M2 9 L -7 23 Q 50 15 107 23 L 98 9'),1.4,3)+H.cut(p('M-4 27 L-13 17'),4.7,.5)+H.cut(p('M104 27 L113 17'),5.4,.5);}},
 {cap:'Turn and press',say:'Turn the collar right side out. Push the points out gently with a chopstick. Press it flat. Sew a line close to the edge.',svg:()=>{
   const p=d=>P(d,220,170,3);
   return H.out(`<path d="${p(SH.leaf)}" class="fw"/>`,.4)+H.fade(`<path d="${p(SH.leaf)}" class="fr"/>`,.4)+H.move(`<path d="M590 260 L700 320" stroke="#d6b98a" stroke-width="9" stroke-linecap="round"/>`,60,30,1,.8)+H.iron(400,190,1.9,120,0,2)+H.stitch(p('M4 10 L -4 22 Q 50 14 104 22 L 97 10'),3.7,2.4);}},
 {cap:'Add the collar stand',say:'Put the collar between the two stand pieces, like a sandwich. Sew along the top and round the ends. Turn it right side out.',svg:()=>{
   const s=3,ox=240,oy=260,st=P(SH.stand,ox,oy,s),leaf=TR(SH.leaf,(x,y)=>[ox+x*s,oy-6-(y-3)*s]);
   return `<path d="${st}" class="fr"/><path d="${leaf}" class="fr2"/>`+H.move(`<path d="${st}" class="fw" opacity=".95"/>`,0,200,.8,1)+H.stitch(P('M-4 12 Q -6 4 2 0 Q 50 -4 98 0 Q 106 4 104 12',ox,oy,s),2.1,3);}},
 {cap:'Collar on the shirt',say:'Match the middle of the stand to the middle of the back neck. Pin it all around. Sew the stand to the neck. Fold the inside stand over and sew close to the edge.',svg:()=>
   `<path d="${P(SH.body,240,150,2)}" class="fr"/>`+H.move(`<path d="M356 162 Q 400 182 444 162 L 450 144 Q 400 166 350 144 Z" class="fr2"/>`,0,-140,.3,1)+H.pins([[365,170],[400,176],[435,170]],1.4)+H.stitch('M356 162 Q 400 182 444 162',2,2)+H.ok(650,250,4.4)},
 {cap:'Sleeve opening',say:'Cut the slit at the bottom of the sleeve. Wrap the small strip around one side and the big strip around the other side. Sew a little box at the top.',svg:()=>
   `<path d="${P(SH.sleeve,300,40,3.4)}" class="fr"/>`+H.cut('M456 414 L456 326',.3,1)+H.fade(`<rect x="448" y="326" width="8" height="88" class="fr2"/>`,1.5)+H.fade(`<path d="M456 414 L456 312 L465 300 L474 312 L474 414 Z" class="fr2"/>`,2.1)+H.stitch('M471 414 L471 332 L459 332 L459 316 L471 316 L471 332',2.9,2.6)},
 {cap:'Sew on the sleeves',say:'Match the top of the sleeve to the shoulder seam. Pin the sleeve all along the armhole. Sew with the sleeve on top. Do both sleeves.',svg:()=>{
   const arm=P('M124 12 C 120 30 120 46 128 56',150,90,2.2),sl=TR(SH.sleeve,(x,y)=>[428+y*1.5,165+(x-35)*1.5]);
   return `<path d="${P(SH.body,150,90,2.2)}" class="fr"/>`+H.move(`<path d="${sl}" class="fw"/>`,220,0,.2,1)+H.pins([[425,122],[420,150],[422,180],[430,205]],1.4)+H.stitch(arm,2.3,2.4);}},
 {cap:'Sew the sides',say:'Turn the shirt inside out. Sew from the bottom of the shirt, up to the armpit, and along the sleeve, in one long line. Do both sides.',svg:()=>
   `<path d="${P(SH.shirt,240,60,2)}" class="fw"/>`+H.stitch(P('M124 146 L124 56 L144 84',240,60,2),.4,2.4)+H.stitch(P('M36 146 L36 56 L16 84',240,60,2),3.2,2.4)},
 {cap:'Pleats and cuffs',say:'Fold two small pleats at the bottom of the sleeve. Put the cuff on, good sides together, and sew. Fold it over and sew close to the edge.',svg:()=>
   `<path d="M220 60 L580 60 L600 300 L200 300 Z" class="fr"/>`+H.draw('M480 230 L480 300 M500 230 L500 300 M530 230 L530 300 M550 230 L550 300','chalkl',.2,.8)+H.arrow('M470 270 Q 490 250 505 270',1)+H.arrow('M520 270 Q 540 250 555 270',1.2)+
   H.move(`<path d="M206 300 L594 300 L594 360 Q 594 372 582 372 L218 372 Q 206 372 206 360 Z" class="fr2"/>`,0,140,1.8,1)+H.stitch('M206 304 L594 304',3,2)+H.stitch('M212 364 L588 364',5.2,2)},
 {cap:'Hem the bottom',say:'Fold the bottom edge under a tiny bit, then fold it again. Sew slowly around the curve.',svg:()=>
   `<path d="M100 60 L700 60 L700 260 C 640 260 560 400 400 400 C 240 400 160 260 100 260 Z" class="fr"/>`+H.fade(`<path d="M100 252 C 160 252 240 392 400 392 C 560 392 640 252 700 252" fill="none" stroke="#356bb7" stroke-width="16"/>`,.4)+H.arrow('M400 450 L400 410',.4)+
   H.stitch('M100 246 C 160 246 240 386 400 386 C 560 386 640 246 700 246',1.4,3.4)},
 {cap:'Buttonholes and buttons',say:'Make the buttonholes with your machine. Try one on a scrap first. Open each hole carefully with the seam ripper. Sew the buttons on the other side, across from each hole.',svg:()=>
   `<rect x="270" y="30" width="110" height="440" class="fr"/><rect x="420" y="30" width="110" height="440" class="fr"/>`+[80,180,280,380].map((y,i)=>H.stitch(`M321 ${y-18} L339 ${y-18} L339 ${y+18} L321 ${y+18} Z`,.3+i*1,.8,'foot','stitch solid')).join('')+
   [80,180,280,380].map((y,i)=>H.pop(ICON.button(475,y,15)+`<path d="M470 ${y-5} L480 ${y+5} M480 ${y-5} L470 ${y+5}" stroke="#e5484d" stroke-width="2"/>`,4.6+i*.4)).join('')},
 {cap:'Press it',say:'Press the whole shirt: the collar, the yoke, the sleeves and the front.',svg:()=>
   `<path d="${P(SH.shirt,240,60,2)}" class="fr"/><path d="${P(SH.collar,240,60,2)}" fill="#fff" stroke="#1d3c69" stroke-width="2"/><path d="M400 104 L400 356" stroke="#1d3c69" stroke-width="2"/>`+[130,170,210,250,290,330].map(y=>ICON.button(408,y,5)).join('')+H.iron(330,260,.3,160,0,4)},
 {cap:'You made a shirt!',say:'Well done! You made your own shirt. Try it on. Next time will be even easier.',svg:()=>
   figure(FIG.ox,FIG.oy,FIG.s,{shirt:'fr'})+[[180,120],[620,100],[650,330],[160,360],[560,200]].map((q,i)=>H.pop(`<path d="M${q[0]} ${q[1]-22} L${q[0]+7} ${q[1]-7} L${q[0]+23} ${q[1]-5} L${q[0]+11} ${q[1]+6} L${q[0]+14} ${q[1]+22} L${q[0]} ${q[1]+14} L${q[0]-14} ${q[1]+22} L${q[0]-11} ${q[1]+6} L${q[0]-23} ${q[1]-5} L${q[0]-7} ${q[1]-7} Z" fill="#f2c230"/>`,.3+i*.25)).join('')},
];
const SEW_PANT=[
 {cap:'Stop fraying',say:'Sew a zigzag stitch along all the edges, except the waist. This stops threads from coming loose.',svg:()=>{
   const q=(x,y)=>[300+x*2.8,30+y*2.8];
   return `<path d="${P(SH.pfront,300,30,2.8)}" class="pr"/>`+H.stitch(H.zz([q(0,0),q(0,34),q(8,70),q(12,150)]),.3,3,'foot','stitch solid')+H.stitch(H.zz([q(46,32),q(40,70),q(38,150)]),3.6,3,'foot','stitch solid');}},
 {cap:'Sew the darts',say:'On the back pieces, fold the dart so the two chalk lines meet. Sew from the wide end down to the point. Tie the threads in a knot.',svg:()=>
   `<path d="M150 80 L650 60 L670 440 L130 440 Z" class="pw"/>`+H.draw('M380 72 L400 280 L420 71','chalkl',.2,1)+H.dim([440,70],[440,280],4.5,.6,-20)+
   H.stitch('M380 72 L400 280',1.8,2)+H.pop(`<path d="M400 284 c -14 10 0 26 8 12 c 6 -12 -12 -12 -8 -2" fill="none" stroke="#ffd84a" stroke-width="3"/>`,4)},
 {cap:'Front pockets',say:'Put the pocket bag on the front, good sides together. Sew along the slanted pocket line. Turn the bag to the inside, press, and sew close to the edge.',svg:()=>
   `<path d="M240 60 L460 60 L470 380 Q 350 420 200 380 L 156 250 Z" class="lin"/><path d="M260 60 L650 60 L640 440 L160 440 L154 250 Z" class="pr"/>`+H.fade(`<path d="M240 60 L460 60 L470 380 Q 350 420 200 380 L 156 250 Z" class="lin" opacity=".55"/>`,.3)+
   H.out(`<path d="M150 60 L260 60 L154 250 Z" class="pr"/>`,3.2)+H.stitch('M260 60 L154 250',1.2,1.8)+H.stitch('M274 60 L168 252',3.8,1.8)},
 {cap:'Sew to the zip mark',say:'Put the two fronts together, good sides facing. Sew the front curve from the bottom up to the zip mark. Stop there.',svg:()=>
   `<path d="M150 40 L560 40 L580 300 C 590 360 620 380 660 390 L 640 460 L150 460 Z" class="pr"/>`+H.ring(576,252,20,.2)+H.stitch('M650 392 C 615 380 588 360 580 300 L 576 256',.8,2.2)+H.ok(660,180,3.4)},
 {cap:'Sew in the zip',say:'Sew the zip strip to the left front. Lay the zip on it and sew down both sides of the zip tape. Use the zipper foot.',svg:()=>
   `<rect x="180" y="40" width="240" height="430" class="pr"/><path d="M420 40 L420 470" stroke="#252b31" stroke-width="3"/>`+H.fade(`<rect x="420" y="40" width="80" height="260" class="pr2"/>`,.2)+H.move(ICON.zip(455,50,220),0,-300,.7,1)+H.stitch('M440 60 L440 268',1.9,1.4)+H.stitch('M470 60 L470 268',3.5,1.4)},
 {cap:'Sew the J line',say:'From the outside, sew the curved J shape over the zip. Go slowly and keep the line smooth.',svg:()=>
   `<path d="${P(SH.pants,170,40,5)}" class="pr"/><path d="${P('M45 0 L45 58',170,40,5)}" stroke="#252b31" stroke-width="3"/>`+H.draw('M380 50 L380 270 Q 380 320 395 325','chalkd',.2,1)+H.stitch('M380 50 L380 270 Q 380 320 395 325',1.4,2.6)},
 {cap:'Sew the sides',say:'Put a front on a back, good sides together. Sew down the side from the waist to the bottom. Press the seam open.',svg:()=>{
   const q=(x,y)=>pp([262+x*2.7,30+y*2.7]);
   return `<path d="${P(SH.pback,260,30,2.7)}" class="pr"/>`+H.move(`<path d="${P(SH.pfront,262,30,2.7)}" class="pw" opacity=".95"/>`,260,0,.2,1)+H.stitch(`M${q(0,0)} L${q(0,34)} L${q(8,70)} L${q(12,150)}`,1.4,3)+H.iron(560,300,4.6,90,0,2);}},
 {cap:'Sew the inside leg',say:'Now sew the inside leg seam, from the bottom up to the crotch. Match the knee marks. Do both legs.',svg:()=>{
   const q=(x,y)=>pp([262+x*2.7,30+y*2.7]);
   return `<path d="${P(SH.pback,260,30,2.7)}" class="pr"/><path d="${P(SH.pfront,262,30,2.7)}" class="pw" opacity=".95"/>`+H.stitch(`M${q(38,150)} L${q(40,70)} L${q(46,32)}`,.4,3);}},
 {cap:'Join the two legs',say:'Turn one leg right side out and put it inside the other leg. Sew the curved seam from the front zip all the way to the back waist. Sew it twice.',svg:()=>
   `<path d="M470 60 L600 60 L590 460 L480 460 Z" class="pw"/>`+H.out(H.move(`<path d="M480 60 L590 60 L580 460 L490 460 Z" class="pr"/>`,-300,0,.3,1.4),2.2)+H.arrow('M260 260 L420 260',.1)+
   H.fade(`<path d="M260 60 L540 60 L520 460 L280 460 Z" class="pw"/>`,2.2)+H.stitch('M290 70 C 300 200 360 230 400 230 C 450 230 520 200 530 70',2.8,2.4)+H.stitch('M296 70 C 306 210 360 240 400 240 C 450 240 514 210 524 70',5.4,2.4)},
 {cap:'Try them on',say:'Try the trousers on. If they are loose or tight, change the back seam or the side seams now, before the waistband.',svg:()=>
   figure(FIG.ox,FIG.oy,FIG.s,{pants:'pr'})+H.arrow('M270 255 L310 255',.4)+H.arrow('M560 255 L520 255',.6)+H.arrow('M240 290 L190 290',1.2)+H.arrow('M590 290 L640 290',1.4)},
 {cap:'Belt loops',say:'Fold the long strip in half and sew it. Cut it into seven pieces. Pin them around the waist: two at the front, two at the sides, three at the back.',svg:()=>
   `<rect x="120" y="160" width="560" height="20" class="pr"/>`+H.flip(`<rect x="120" y="140" width="560" height="20" class="pr2"/>`,'y',160,.3,.8)+H.stitch('M120 170 L680 170',1.2,2)+
   [200,280,360,440,520,600].map((x,i)=>H.cut(`M${x} 150 L${x} 190`,3.4+i*.35,.3)).join('')+`<rect x="150" y="320" width="500" height="140" class="pr"/><rect x="150" y="320" width="500" height="30" class="pr2"/>`+[180,250,330,400,470,550,620].map((x,i)=>H.pop(`<rect x="${x-8}" y="314" width="16" height="44" rx="3" class="pr2"/>`,5.8+i*.2)).join('')},
 {cap:'Sew the waistband',say:'Sew the waistband to the top of the trousers. Fold it to the inside. From the outside, sew right in the seam line so it hides. Sew on the hook and bar.',svg:()=>
   `<path d="${P('M4 0 L86 0 L88 30 L84 60 L2 60 L0 30 Z',170,160,5)}" class="pr"/>`+H.move(`<rect x="180" y="100" width="450" height="60" class="pr2"/>`,0,-140,.2,1)+H.stitch('M180 160 L630 160',1.3,2.4)+H.arrow('M660 170 Q 700 130 660 100',3.8)+
   H.pop(`<rect x="600" y="120" width="22" height="10" rx="3" fill="#d3dadd"/><path d="M196 128 q0 -14 14 -14 h12" fill="none" stroke="#d3dadd" stroke-width="5"/>`,4.4)},
 {cap:'Hem the legs',say:`Fold the bottom up ${sn(1.5)} and press. Sew it by hand with tiny stitches that do not show on the outside.`,svg:()=>
   `<rect x="220" y="40" width="360" height="360" class="pw"/>`+H.flip(`<rect x="220" y="400" width="360" height="60" class="pr"/>`,'y',400,.3,1)+H.chip(640,370,f(1.5),.2)+H.stitch(H.zz([[236,344],[564,344]],7,22),1.6,3.6,'hand','stitch solid')},
 {cap:'Press the creases',say:'Fold each leg along the crease line, with the inside and outside seams on top of each other. Press with a damp cloth from the bottom to the top.',svg:()=>
   `<path d="${P(SH.pfront,330,30,2.8)}" class="pr"/>`+H.draw(P('M22 0 L25 150',330,30,2.8),'chalkd',.2,1.2)+H.iron(420,440,1.4,0,-320,2)},
 {cap:'You made trousers!',say:'Well done! You made your own trousers. Put them on and wear them proudly.',svg:()=>
   figure(FIG.ox,FIG.oy,FIG.s,{pants:'pr'})+[[180,120],[620,100],[650,330],[160,360],[560,200]].map((q,i)=>H.pop(`<path d="M${q[0]} ${q[1]-22} L${q[0]+7} ${q[1]-7} L${q[0]+23} ${q[1]-5} L${q[0]+11} ${q[1]+6} L${q[0]+14} ${q[1]+22} L${q[0]} ${q[1]+14} L${q[0]-14} ${q[1]+22} L${q[0]-11} ${q[1]+6} L${q[0]-23} ${q[1]-5} L${q[0]-7} ${q[1]-7} Z" fill="#f2c230"/>`,.3+i*.25)).join('')},
];

export { SEW_SHIRT, SEW_PANT };
