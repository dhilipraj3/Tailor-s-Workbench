// MEASURE chapter
import { S } from '../core/state.js';
import { f } from '../core/units.js';
import { n1, P, H, ICON, figure } from '../art/svg.js';

const FIG={ox:290,oy:34,s:2.3};
const fp=(d)=>P(d,FIG.ox,FIG.oy,FIG.s);
const fe=(cx,cy,rx,ry)=>`M${n1(FIG.ox+(cx-rx)*FIG.s)} ${n1(FIG.oy+cy*FIG.s)} A${n1(rx*FIG.s)} ${n1(ry*FIG.s)} 0 1 0 ${n1(FIG.ox+(cx+rx)*FIG.s)} ${n1(FIG.oy+cy*FIG.s)} A${n1(rx*FIG.s)} ${n1(ry*FIG.s)} 0 1 0 ${n1(FIG.ox+(cx-rx)*FIG.s)} ${n1(FIG.oy+cy*FIG.s)}`;
function measScene(tape,key){return ()=>{const m=S.garment==='shirt'?S.shirt:S.pant;return figure(FIG.ox,FIG.oy,FIG.s)+H.draw(tape,'tapel',.3,1.6)+H.chip(660,250,f(m[key]),1.6);};}
const MEASURE_SHIRT=[
 {cap:'Ask a helper',say:'You can use your ready-made size. It is already filled in. Or ask a helper to measure you. Stand straight and relax.',svg:()=>figure(FIG.ox,FIG.oy,FIG.s)+H.fade(ICON.person(150,420,2.2)+`<path d="M190 330 Q 260 320 300 300" class="tapel"/>`,.4)+H.chip(660,250,'Size '+S.shirtSize,.8)},
 {cap:'Chest',field:'chest',say:'Chest. Put the tape around the fullest part of the chest, under the arms. Keep it level.',svg:measScene(fe(50,48,28,5),'chest')},
 {cap:'Neck',field:'neck',say:'Neck. Put the tape around the bottom of the neck, with one finger under it.',svg:measScene(fe(50,29,7,2.4),'neck')},
 {cap:'Shoulders',field:'shoulder',say:'Shoulders. Measure across the back, from one shoulder bone to the other.',svg:measScene(fp('M26 35 Q 50 30 74 35'),'shoulder')},
 {cap:'Sleeve',field:'sleeve',say:'Sleeve. Measure from the shoulder bone, down the arm to the wrist bone.',svg:measScene(fp('M74 35 L 80 66 L 84 97'),'sleeve')},
 {cap:'Shirt length',field:'length',say:'Shirt length. Measure from the bone at the back of the neck down to where the shirt should end.',svg:measScene(fp('M50 30 L 50 112'),'length')},
 {cap:'Wrist',field:'wrist',say:'Wrist. Put the tape around the wrist bone.',svg:measScene(fe(84,95,4.5,1.8),'wrist')},
];
const MEASURE_PANT=[
 {cap:'Ask a helper',say:'Your ready-made waist size is already filled in. Or ask a helper to measure you. Stand straight and relax.',svg:()=>figure(FIG.ox,FIG.oy,FIG.s)+H.fade(ICON.person(150,420,2.2)+`<path d="M190 330 Q 260 320 300 300" class="tapel"/>`,.4)+H.chip(660,250,'Size '+S.pantSize,.8)},
 {cap:'Waist',field:'waist',say:'Waist. Put the tape where you wear your trousers. Snug, not tight.',svg:measScene(fe(50,92,21,4),'waist')},
 {cap:'Hip',field:'hip',say:'Hip. Put the tape around the fullest part of your bottom, with feet together.',svg:measScene(fe(50,106,23,4.5),'hip')},
 {cap:'Seat depth',field:'rise',say:'Seat depth. Sit on a flat chair. Measure down your side from the waist to the chair.',svg:measScene(fp('M73 92 L 73 117'),'rise')},
 {cap:'Length',field:'outseam',say:'Length. Measure down the side, from the waist to where the trousers should end.',svg:measScene(fp('M72 92 L 69 188'),'outseam')},
 {cap:'Bottom',field:'bottom',say:'Bottom. This is how wide the trouser leg is at the bottom, all the way around.',svg:measScene(fe(61,186,7.5,2.2),'bottom')},
];

export { FIG, fp, fe, measScene, MEASURE_SHIRT, MEASURE_PANT };
