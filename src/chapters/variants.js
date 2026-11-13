// Picture steps for design options (collar styles, sleeves, pleats, pockets, hems).
import { sn, f } from '../core/units.js';
import { P, H, ICON, SH } from '../art/svg.js';

export const V = {
  mandarin: {cap:'Make the band collar',say:'Put the two band collar pieces together, good sides facing. Sew along the top edge and round both ends. Turn it right side out and press.',svg:()=>{
    const s=3,ox=240,oy=220,st=P('M2 0 Q 50 -6 98 0 Q 108 6 106 18 Q 50 22 -6 18 Q -8 6 2 0 Z',ox,oy,s);
    return `<path d="${st}" class="fr"/>`+H.move(`<path d="${st}" class="fw" opacity=".95"/>`,0,-200,.3,1)+H.stitch(P('M-5 17 Q -7 6 2 1 Q 50 -5 98 1 Q 107 6 105 17',ox,oy,s),1.6,3)+H.ok(660,140,4.8);}},
  collarButtons: {cap:'Collar point buttons',say:'Make a small buttonhole at each collar point. Sew two small buttons on the shirt front, under the collar points.',svg:()=>{
    const p=d=>P(d,220,170,3);
    return `<path d="${p(SH.leaf)}" class="fr"/>`+H.stitch(p('M-2 22 L 4 22'),.4,.6,'foot','stitch solid')+H.stitch(p('M96 22 L 102 22'),1.3,.6,'foot','stitch solid')+
      H.pop(ICON.button(200,330,10),2.4)+H.pop(ICON.button(560,330,10),2.7)+H.arrow('M210 300 L205 250',3)+H.arrow('M550 300 L555 250',3.2);}},
  boxPleat: {cap:'Fold the back pleat',say:'On the back piece, fold the box pleat at the middle along the marks. Pin it, then sew across the top to hold it.',svg:()=>{
    const s=3.4,ox=258,oy=40;
    return `<path d="${P(SH.backbody,ox,oy,s)}" class="fr"/>`+H.draw(`M${ox+36*s} ${oy+16*s} L${ox+36*s} ${oy+40*s} M${ox+48*s} ${oy+16*s} L${ox+48*s} ${oy+40*s}`,'chalkl',.2,.8)+
      H.arrow(`M${ox+30*s} ${oy+30*s} Q ${ox+36*s} ${oy+24*s} ${ox+41*s} ${oy+30*s}`,1)+H.arrow(`M${ox+54*s} ${oy+30*s} Q ${ox+48*s} ${oy+24*s} ${ox+43*s} ${oy+30*s}`,1.2)+
      H.pins([[ox+40*s,oy+20*s],[ox+44*s,oy+20*s]],1.8)+H.stitch(`M${ox+30*s} ${oy+17.5*s} L${ox+54*s} ${oy+17.5*s}`,2.4,1.4);}},
  halfSleeveHem: {cap:'Hem the short sleeves',say:`Fold the bottom of each short sleeve up by ${sn(1)} and press. Sew close to the folded edge.`,svg:()=>
    `<path d="M200 60 L600 60 L620 380 L180 380 Z" class="fw"/>`+H.flip(`<rect x="180" y="380" width="440" height="60" class="fr"/>`,'y',380,.3,1)+H.chip(670,350,f(1),.2)+H.stitch('M196 368 L604 368',1.6,2.6)},
  straightHem: {cap:'Hem the bottom',say:`Fold the straight bottom edge up by ${sn(.5)}, then again by ${sn(.5)}. Press and sew close to the fold.`,svg:()=>
    `<rect x="100" y="60" width="600" height="320" class="fw"/>`+H.flip(`<rect x="100" y="380" width="600" height="40" class="fr"/>`,'y',380,.3,1)+H.stitch('M100 366 L700 366',1.6,3)},
  pleats: {cap:'Fold the front pleats',say:'At the top of each front, fold the pleats along the marks, towards the side. Pin them and sew across the top to hold them.',svg:()=>
    `<path d="M150 60 L650 60 L640 440 L160 440 Z" class="pr"/>`+H.draw('M380 60 L380 200 M440 60 L440 200','chalkl',.2,.8)+H.arrow('M450 130 Q 420 100 390 130',1.1)+
    H.pins([[400,80],[420,80]],1.8)+H.stitch('M200 72 L620 72',2.4,1.8)},
  sidePocket: {cap:'Side seam pockets',say:'Sew a pocket bag to the front and to the back, at the side seam. When you sew the side seam, leave the pocket opening open. Turn the bags towards the front.',svg:()=>
    `<path d="M120 60 L400 60 L400 440 L120 440 Z" class="pr"/><path d="M400 60 L680 60 L680 440 L400 440 Z" class="pr2"/>`+
    H.fade(`<path d="M320 110 L480 110 Q 500 300 400 330 Q 300 300 320 110 Z" class="lin"/>`,.3)+H.stitch('M400 60 L400 110',1.3,.8)+H.ring(400,200,30,2.2)+H.stitch('M400 300 L400 440',2.6,1.2)},
  welt: {cap:'Back welt pocket',say:'Mark the pocket line on the back. Sew a long thin box around the line, then cut a Y shape inside it. Push the welt strip through, press, and sew the pocket bag behind it.',svg:()=>
    `<path d="M150 80 L650 60 L670 440 L130 440 Z" class="pr"/>`+H.draw('M260 200 L540 200','chalkl',.2,.8)+H.stitch('M260 190 L540 190 L540 210 L260 210 Z',1.1,2.2,'foot','stitch solid')+
    H.cut('M280 200 L520 200',3.5,1)+H.fade(`<rect x="256" y="186" width="288" height="28" class="pr2"/>`,4.7)+H.pop(ICON.button(400,250,10),5.2)},
  turnup: {cap:'Fold the turn-ups',say:`Fold the bottom of each leg up by ${sn(3)}, then fold the cuff back down by ${sn(1.5)}. Press hard, and sew it by hand at the side seams.`,svg:()=>
    `<rect x="220" y="40" width="360" height="300" class="pw"/>`+H.flip(`<rect x="220" y="340" width="360" height="100" class="pr"/>`,'y',340,.3,1)+
    H.fade(`<rect x="220" y="290" width="360" height="50" class="pr2"/>`,1.6)+H.chip(650,320,f(1.5),1.6)+H.iron(400,300,2.3,120,0,2)},
};
