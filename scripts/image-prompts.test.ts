// Writes docs/image-prompts.md: one image-generator prompt per catalogue design, built from its options,
// so photos match exactly what the pattern makes. Run: npx vitest run scripts/image-prompts.test.ts
import { it } from 'vitest';
import { writeFileSync } from 'fs';
import { DESIGNS, GARMENTS } from '../src/garments/index';
import { VISIBLE } from '../src/views/photos.js';
import { buildCtx } from '../src/engine/project';
import { SHIRT_SIZES, waistPreset } from '../src/engine/sizes';
import { makeSteps, sewPhotoName } from '../src/views/make-steps.js';
import { detailChips } from '../src/engine/sew';
import { S } from '../src/core/state.js';

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

// Option photos: each design with one visible option changed, so the customiser can show a real photo
// that matches what people pick. Most-customised designs first.
const ORDER = ['aline-kurti', 'straight-kurti', 'saree-blouse', 'kurta', 'short-kurta', 'kids-kurta', 'simple-dress', 'kids-frock', 'aline-skirt', 'maxi-skirt',
  'formal-shirt', 'slim-formal-shirt', 'oxford-shirt', 'band-collar-shirt', 'half-sleeve-shirt', 'two-pocket-shirt', 'kids-shirt',
  'formal-trousers', 'slim-trousers', 'pleated-trousers', 'side-pocket-trousers', 'pyjama', 'men-shorts', 'salwar', 'churidar', 'palazzo', 'kids-shorts', 'kids-pyjama'];

it('writes docs/image-prompts-options.md', () => {
  const designs = [...DESIGNS].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  let md = '', total = 0;
  for (const d of designs) {
    const rows: string[] = [];
    for (const k of VISIBLE[d.garment] || []) {
      const grp = GARMENTS[d.garment].options.find((g) => g.id === k);
      for (const v of grp?.values || []) {
        if (d.options[k] === v.id) continue;
        const o = { ...d.options, [k]: v.id };
        // a change you cannot see in the photo is skipped (side slits on a short top)
        if (k === 'slits' && !['thigh', 'knee', 'calf'].includes(o.length)) continue;
        rows.push(`### ${grp!.label}: ${v.label}\nFile: \`${d.id}--${k}-${v.id}.jpg\`\n\n> ${describe({ ...d, options: o }).replace(/^./, (c) => c.toUpperCase())}. ${STYLE}\n`);
      }
    }
    total += rows.length;
    md += `## ${d.name} (${rows.length} photos)\n\n${rows.join('\n')}\n`;
  }
  writeFileSync('docs/image-prompts-options.md', `# Option photos\n\n${total} photos: each design with one visible option changed. The customiser shows the photo closest to what someone picks, ` +
    `with a note on any difference and a small drawing of exactly what they will make. Work from the top: the first designs have the most options.\n\n` +
    `**Save as** \`public/img/designs/<file>.jpg\` with the file name shown, then run \`npm run photos\` (or restart \`npm run dev\`). Same checks as the main photos: the garment must match the description, with no person, hanger, text or logo.\n\n---\n\n${md}`);
});

// Sewing-step photos: one real photo per distinct sewing step of each garment family, in plain off-white cotton,
// so they serve every design and colour. The person's own pieces stay in an inset beside the photo.
it('writes docs/image-prompts-sewing.md', () => {
  S.unit = 'in';
  const M: Record<string, number> = { ...SHIRT_SIZES.L, ...waistPreset(34), height: 66, bicep: 13 };
  const FAMILY: Record<string, string> = { tunic: 'a kurti (Indian tunic)', shirt: "a men's shirt", trousers: 'tailored trousers', pants: 'pyjama pants', skirt: 'a skirt', dress: 'a dress' };
  const ORDER_G = ['tunic', 'shirt', 'trousers', 'pants', 'dress', 'skirt'];
  const seen = new Map<string, { garment: string; cap: string; text: string; d: any }[]>();
  const done = new Set<string>();
  for (const d of [...DESIGNS].sort((a, b) => ORDER_G.indexOf(a.garment) - ORDER_G.indexOf(b.garment))) {
    const vs = [d.options];
    for (const g of GARMENTS[d.garment].options) for (const v of g.values) vs.push({ ...d.options, [g.id]: v.id });
    for (const o of vs) {
      const sew = makeSteps(buildCtx(d.id, o, M, 'standard', 'T')).filter((x: any) => x.sec === 'Sew').slice(0, -1);
      for (const st of sew) {
        const name = sewPhotoName(d.garment, st.cap);
        if (done.has(name)) continue;
        done.add(name);
        const text = String(typeof (st.text ?? st.say) === 'function' ? (st.text ?? st.say)() : (st.text ?? st.say));
        const list = seen.get(d.garment) || [];
        list.push({ garment: d.garment, cap: st.cap, text, d: st.d });
        seen.set(d.garment, list);
      }
    }
  }
  const where = (d: any, cap: string) => {
    const c = cap.toLowerCase();
    if (d?.stitch === 'fuse' || /press|iron/.test(c) && d?.stitch === 'none') return 'at an ironing board, with a steam iron';
    if (d?.stitch === 'hand' || d?.stitch === 'button') return 'at a work table, sewing by hand with a needle and thread';
    if (!d || d.stitch === 'none') return 'at a work table';
    return 'at a home sewing machine, the presser foot on the fabric';
  };
  let md = '', total = 0;
  for (const g of ORDER_G) {
    const rows = (seen.get(g) || []).map((x, i) => {
      const chips = detailChips(x.d).join(', ');
      return `### ${i + 1}. ${x.cap}\nFile: \`${sewPhotoName(g, x.cap)}.jpg\`\n\n> Real photograph, close-up from slightly above, of a person's hands ${where(x.d, x.cap)}, making ${FAMILY[g]} in plain natural off-white cotton. ` +
        `The step shown: ${x.text}${chips ? ` (${chips})` : ''}. Show exactly this action and where the stitching goes; chalk marks and pins visible where they help; matching thread. ` +
        `Clean dark charcoal work surface, soft daylight-balanced light, sharp focus, photorealistic, no text, no logo, no face, landscape 16:10.\n`;
    });
    total += rows.length;
    md += `## ${({ tunic: 'Kurta / kurti / blouse', shirt: 'Shirt', trousers: 'Trousers', pants: 'Pyjama, salwar, churidar, palazzo, shorts', dress: 'Dress and frock', skirt: 'Skirt' } as any)[g]} (${rows.length} photos)\n\n${rows.join('\n')}\n`;
  }
  writeFileSync('docs/image-prompts-sewing.md', `# Sewing-step photos\n\n${total} photos: one for every distinct sewing step, shared by all designs of that garment. ` +
    `They use plain off-white cotton so stitches, chalk and folds show clearly; the person's own pieces, edge and seam width appear in a small inset beside each photo.\n\n` +
    `**Save as** \`public/img/sew/<file>.jpg\` with the file name shown (landscape, about 1600 × 1000), then run \`npm run photos\` or restart \`npm run dev\`. ` +
    `Check each photo shows the action described (right edge, right side of the fabric, foot on the fabric). Regenerate if it adds text, a logo or a face.\n\n---\n\n${md}`);
});
