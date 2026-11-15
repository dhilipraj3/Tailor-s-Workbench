// Writes docs/image-prompts.md: one image-generator prompt per catalogue design, built from its options,
// so photos match exactly what the pattern makes. Run: npx vitest run scripts/image-prompts.test.ts
import { it } from 'vitest';
import { writeFileSync } from 'fs';
import { DESIGNS } from '../src/garments/index';

const COLORS: [string, string][] = [['#efe8d8', 'ivory'], ['#f3efe6', 'off-white'], ['#f1e6c8', 'cream'], ['#e9d7c2', 'beige'], ['#b9c7a6', 'sage green'], ['#7b8a6a', 'olive green'],
  ['#c45b6b', 'rose red'], ['#3f7f8c', 'teal'], ['#b8862e', 'mustard gold'], ['#d9c7d6', 'lilac'], ['#2f4a6b', 'navy blue'], ['#5a4a7a', 'deep purple'], ['#cf8a3a', 'burnt orange'],
  ['#6d9bc7', 'sky blue'], ['#e88aa8', 'pink'], ['#4f7fbf', 'denim blue'], ['#e2b24a', 'marigold yellow'], ['#a8c0e0', 'light blue'], ['#6a7380', 'charcoal grey']];
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const colourName = (h?: string) => {
  if (!h) return '';
  const c = rgb(h);
  return COLORS.map(([k, n]) => [rgb(k).reduce((s, v, i) => s + (v - c[i]) ** 2, 0), n] as [number, string]).sort((a, b) => a[0] - b[0])[0][1];
};
const pick = (m: Record<string, string>, k: string) => m[k] ?? k;

function describe(d: (typeof DESIGNS)[number]) {
  const o = d.options, kid = d.for === 'child', who = kid ? "children's " : d.for === 'woman' ? "women's " : "men's ";
  const col = colourName(d.color) || (d.garment === 'shirt' ? 'light blue' : d.garment === 'trousers' ? 'charcoal grey' : 'ivory');
  if (d.garment === 'shirt') return `${who}${col} cotton ${o.fit === 'slim' ? 'slim-fit ' : ''}shirt, ${pick({ classic: 'classic point collar', spread: 'spread collar', buttondown: 'button-down collar', mandarin: 'mandarin band collar' }, o.collar)}, full button-front placket, ${o.sleeve === 'half' ? 'short sleeves' : 'long sleeves with buttoned cuffs'}, ${pick({ '0': 'no chest pocket', '1': 'one patch pocket on the left chest', '2': 'two patch chest pockets' }, o.pockets)}, ${o.hem === 'straight' ? 'straight hem' : 'curved shirt-tail hem'}`;
  if (d.garment === 'trousers') return `${who}${col} wool-blend tailored trousers, ${o.fit === 'slim' ? 'slim tapered leg' : 'straight leg'}, ${o.front === 'pleated' ? 'single front pleats' : 'flat front'}, zip fly with waistband hook, ${o.pocket === 'side' ? 'side-seam pockets' : 'slanted front pockets'}${o.loops === 'yes' ? ', belt loops' : ''}, pressed front creases, ${o.hem === 'turnup' ? 'cuffed hem (turn-ups)' : 'plain hem'}`;
  if (d.garment === 'tunic') {
    const noun = o.opening === 'fronthooks' ? 'saree blouse' : d.for === 'woman' ? 'kurti' : 'kurta';
    return `${who}${col} cotton ${noun}, Indian ethnic wear, ` +
      `${pick({ round: 'round neckline', v: 'V-neckline', band: 'mandarin band collar', deep: 'deep round neckline', boat: 'boat neckline', square: 'square neckline', sweetheart: 'sweetheart neckline', high: 'high round neckline' }, o.neck)}, ` +
      `${pick({ none: 'sleeveless', short: 'short sleeves', elbow: 'elbow-length sleeves', threequarter: 'three-quarter sleeves', full: 'full-length sleeves', puff: 'puff sleeves', balloon: 'balloon sleeves with cuffs', bell: 'bell sleeves' }, o.sleeve)}, ` +
      `${pick({ crop: 'cropped to just below the bust', hip: 'hip length', thigh: 'mid-thigh length', knee: 'knee length', calf: 'calf length' }, o.length)}, ` +
      `${pick({ straight: 'straight cut', aline: 'A-line flared cut', fitted: 'fitted with darts', peplum: 'fitted bodice with a gathered peplum' }, o.fit)}` +
      `${o.slits === 'yes' ? ', side slits at the hem' : ''}${o.opening === 'halfplacket' ? ', short front button placket' : ''}${o.opening === 'fronthooks' ? ', front hook-and-eye closure, lined' : ''}`;
  }
  if (d.garment === 'pants') return `${who}${col} cotton ${pick({ pyjama: 'straight-leg pyjama pants', palazzo: 'wide-leg palazzo pants', churidar: 'churidar pants, slim legs with soft gathered folds at the ankle', salwar: 'salwar pants, very full at the top and narrow at the ankle', shorts: 'pull-on shorts' }, o.style)}, ${o.waist === 'drawstring' ? 'drawstring waist' : 'elastic waist'}${o.pockets === 'side' ? ', side pockets' : ''}`;
  if (d.garment === 'skirt') return `${who}${col} cotton ${o.style === 'gathered' ? 'gathered' : 'A-line'} skirt, ${pick({ knee: 'knee length', midi: 'midi length', maxi: 'maxi length' }, o.length)}, ${o.waist === 'band' ? 'waistband with side zip' : 'elastic waist'}`;
  return `${kid ? "girls' " : "women's "}${col} cotton ${kid ? 'frock' : 'dress'}, fitted bodice, ${pick({ round: 'round neckline', v: 'V-neckline', boat: 'boat neckline' }, o.neck)}, ${pick({ none: 'sleeveless', short: 'short sleeves', elbow: 'elbow-length sleeves' }, o.sleeve)}, ${o.skirt === 'gathered' ? 'gathered skirt' : 'A-line skirt'} joined at the waist, ${pick({ knee: 'knee length', midi: 'midi length', maxi: 'maxi length' }, o.length)}, back zip`;
}

const STYLE = 'Professional e-commerce product photo, ghost mannequin (invisible mannequin) style, front view, centred, the whole garment visible with a little space around it, no person, no hanger, no visible mannequin, no text, no logo, no brand label, realistic fabric texture with natural soft folds, seamless dark charcoal studio background (#1c1c1b) with a soft round spotlight behind the garment and a subtle shadow below it, soft diffused lighting, sharp focus, photorealistic, portrait 4:5.';

it('writes docs/image-prompts.md', () => {
  let md = `# Image prompts for every design\n\nOne photo per design, in the app's style. Paste each prompt into your image generator (ChatGPT, Gemini, Midjourney or similar).\n\n` +
    `**How to deliver:** save each picture as \`public/img/designs/<file>.jpg\` with the file name shown (JPG, about 1000 × 1250 pixels). The app picks it up automatically: the design card, the customiser and the finished-garment step show the photo. The drawing is still used whenever someone changes an option, because then the photo would no longer match.\n\n` +
    `**Check before saving:** the garment must match the description (collar, sleeves, length, pockets, colour). If the generator adds a person, a hanger, text or a logo, generate it again. The background is already the app's own colour, so it needs no cutting out.\n\n---\n\n`;
  for (const d of DESIGNS) md += `## ${d.name}\nFile: \`${d.id}.jpg\`\n\n> ${describe(d).replace(/^./, (c) => c.toUpperCase())}. ${STYLE}\n\n`;
  writeFileSync('docs/image-prompts.md', md);
});
