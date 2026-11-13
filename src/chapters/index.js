// chapters
import { S } from '../core/state.js';
import { P, ICON, SH } from '../art/svg.js';
import { TOOLS } from './tools.js';
import { machine, MACHINE } from './machine.js';
import { MEASURE_SHIRT, MEASURE_PANT } from './measure.js';
import { patternSteps } from '../drafting/pattern.js';
import { cutSteps } from './cut.js';
import { SEW_SHIRT, SEW_PANT } from './sew.js';

const CHI={ // chapter icons (96x96)
  tools:`<rect width="96" height="96" rx="20" fill="var(--mat)"/><g transform="translate(48 50) scale(1.5) rotate(-35)">${ICON.scissors()}</g>`,
  machine:`<rect width="96" height="96" rx="20" fill="var(--mat)"/><g transform="translate(-2 30) scale(.33)">${machine(30,40,1)}</g>`,
  measure:`<rect width="96" height="96" rx="20" fill="var(--mat)"/><circle cx="44" cy="48" r="24" fill="#f2c230" stroke="#1b2326" stroke-width="3"/><circle cx="44" cy="48" r="8" fill="#1b2326"/><path d="M62 62 L86 70 L84 80 L58 72 Z" fill="#f2c230" stroke="#1b2326" stroke-width="2"/>`,
  pattern:`<rect width="96" height="96" rx="20" fill="#eadcbc"/><path d="M22 18 L22 80 L70 80 M22 18 L60 18 C 56 40 62 50 74 54 L70 80" fill="none" stroke="#26282a" stroke-width="4"/><circle cx="22" cy="18" r="5" fill="#c2410c"/>`,
  cut:`<rect width="96" height="96" rx="20" fill="var(--mat)"/><rect x="12" y="30" width="72" height="50" fill="#4f86d1"/><path d="M12 52 L84 52" stroke="#fff" stroke-width="3" stroke-dasharray="4 6"/><g transform="translate(58 52) scale(1.1)">${ICON.scissors()}</g>`,
  sew:()=>S.garment==='shirt'?`<rect width="96" height="96" rx="20" fill="var(--mat)"/><path d="${P(SH.shirt,8,14,.5)}" class="fr"/><path d="M48 22 L48 86" stroke="#ffd84a" stroke-width="3" stroke-dasharray="5 4"/>`:`<rect width="96" height="96" rx="20" fill="var(--mat)"/><path d="${P(SH.pants,24,10,.5)}" class="pr"/><path d="M47 14 L47 40" stroke="#ffd84a" stroke-width="3" stroke-dasharray="5 4"/>`,
};
function chapters(){
  const isS=S.garment==='shirt';
  return [
    {id:'tools',name:'Tools',shared:true,steps:TOOLS},
    {id:'machine',name:'Machine',shared:true,steps:MACHINE},
    {id:'measure',name:'Measure',steps:isS?MEASURE_SHIRT:MEASURE_PANT},
    {id:'pattern',name:'Draw pattern',steps:patternSteps()},
    {id:'cut',name:'Cut',steps:cutSteps()},
    {id:'sew',name:isS?'Sew the shirt':'Sew the trousers',steps:isS?SEW_SHIRT:SEW_PANT},
  ];
}
const seenKey=ch=>ch.shared?ch.id:S.garment+':'+ch.id;
const chIcon=id=>`<svg class="ci" viewBox="0 0 96 96" aria-hidden="true">${typeof CHI[id]==='function'?CHI[id]():CHI[id]}</svg>`;

export { CHI, chapters, seenKey, chIcon };
