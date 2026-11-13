// Picture steps for the tunic (kurta / kurti / blouse), easy pants, skirt and dress families.
import { sn, f } from '../core/units.js';
import { P, H, ICON, SH, figure } from '../art/svg.js';
import { FIG } from './measure.js';
import { SEW_PANT } from './sew.js';

const TUNIC = 'M58 6 Q 80 18 102 6 L 124 12 C 120 30 120 46 128 56 L 130 150 Q80 156 30 150 L 32 56 C 40 46 40 30 36 12 Z';
const t = (ox = 250, oy = 30, s = 2) => P(TUNIC, ox, oy, s);
const SKIRT = 'M18 8 L82 8 Q92 60 100 110 Q50 118 0 110 Q8 60 18 8 Z';
const stars = () => [[180, 120], [620, 100], [650, 330], [160, 360], [560, 200]].map((q, i) => H.pop(`<path d="M${q[0]} ${q[1] - 22} L${q[0] + 7} ${q[1] - 7} L${q[0] + 23} ${q[1] - 5} L${q[0] + 11} ${q[1] + 6} L${q[0] + 14} ${q[1] + 22} L${q[0]} ${q[1] + 14} L${q[0] - 14} ${q[1] + 22} L${q[0] - 11} ${q[1] + 6} L${q[0] - 23} ${q[1] - 5} L${q[0] - 7} ${q[1] - 7} Z" fill="#f2c230"/>`, 0.3 + i * 0.25)).join('');

export const W = {
  stay: { cap: 'Stay-stitch the neck', say: 'Before anything else, sew one line just inside the neck curve on the front and back. This stops the curve from stretching.', svg: () =>
    `<path d="${t()}" class="fw"/>` + H.stitch(P('M62 9 Q80 24 98 9', 250, 30, 2), 0.4, 2.2) },
  edges: { cap: 'Stop fraying', say: 'Sew a zigzag stitch along the side and shoulder edges of every piece. This stops the threads from coming loose.', svg: () =>
    `<path d="${t()}" class="fw"/>` + H.stitch(H.zz([[506, 140], [510, 330]]), 0.3, 2.4, 'foot', 'stitch solid') + H.stitch(H.zz([[310, 140], [306, 330]]), 2.9, 2.4, 'foot', 'stitch solid') },
  darts: { cap: 'Sew the darts', say: 'Fold each dart so its two chalk lines meet. Sew from the wide end to the point and tie the threads. Press bust darts down and waist darts towards the middle.', svg: () =>
    `<path d="${t()}" class="fw"/>` + H.draw('M320 150 L360 168 L320 186', 'chalkl', 0.2, 0.8) + H.draw('M392 330 L400 230 L408 330', 'chalkl', 0.6, 0.8) + H.stitch('M320 150 L360 168', 1.6, 1) + H.stitch('M392 330 L400 230', 2.8, 1.3) + H.iron(420, 240, 4.4, 60, 0, 2) },
  placket: { cap: 'Make the front placket', say: 'Cut the front opening on the marked line. Sew a placket strip to each side, fold them in, overlap them and sew a small box at the bottom.', svg: () =>
    `<path d="${t()}" class="fr"/>` + H.cut('M410 66 L410 150', 0.3, 1) + H.fade('<rect x="398" y="66" width="12" height="90" class="fr2"/><rect x="410" y="66" width="12" height="90" class="fr2"/>', 1.5) + H.stitch('M400 150 L420 150 L420 140 L400 140 Z', 2.3, 1.4) },
  shoulders: { cap: 'Sew the shoulders', say: 'Put the front on the back, good sides together. Sew both shoulder seams and press them open.', svg: () =>
    `<path d="${t(250, 40)}" class="fr"/>` + H.move(`<path d="${t(250, 40)}" class="fw" opacity=".9"/>`, 0, -160, 0.2, 1) + H.stitch(P('M102 6 L124 12', 250, 40, 2), 1.4, 0.9) + H.stitch(P('M58 6 L36 12', 250, 40, 2), 2.5, 0.9) },
  neckFacing: { cap: 'Finish the neckline', say: 'Sew the neck facing strip around the neck, good sides together. Clip the curve, turn the strip to the inside, press, and sew it down close to the edge.', svg: () =>
    `<path d="${t()}" class="fr"/>` + H.draw(P('M62 9 Q80 26 98 9', 250, 30, 2), 'chalkl', 0.2, 0.8) + H.fade(`<path d="${P('M60 8 Q80 30 100 8', 250, 30, 2)}" fill="none" stroke="#6a8ec0" stroke-width="9"/>`, 0.9) + H.stitch(P('M62 9 Q80 26 98 9', 250, 30, 2), 1.5, 2) + H.cut(P('M70 15 L71 12 M80 20 L80 17 M90 15 L89 12', 250, 30, 2), 3.7, 0.8) + H.stitch(P('M60 12 Q80 31 100 12', 250, 30, 2), 4.8, 2) },
  vNeck: { cap: 'Finish the V-neck', say: 'Sew the facing around the V-neck. At the point of the V, stop with the needle down, turn, and carry on. Snip right into the point, turn the facing inside and press.', svg: () =>
    `<path d="${t()}" class="fr"/>` + H.stitch(P('M64 7 L80 34 L96 7', 250, 30, 2), 0.4, 2.4) + H.ring(410, 98, 18, 1.6) + H.cut(P('M80 31 L80 27', 250, 30, 2), 3, 0.5) + H.iron(420, 120, 3.6, 60, 0, 2) },
  bandCollar: { cap: 'Add the band collar', say: 'Sew the two band collar pieces together along the top and the round ends. Turn and press. Sew the band to the neckline, fold the inside over and sew close to the edge.', svg: () =>
    `<path d="${t()}" class="fr"/>` + H.move(`<path d="${P('M64 6 Q80 20 96 6 L95 0 Q80 12 65 0 Z', 250, 30, 2)}" class="fr2"/>`, 0, -120, 0.3, 1) + H.stitch(P('M64 6 Q80 20 96 6', 250, 30, 2), 1.6, 2) },
  armBinding: { cap: 'Bind the armholes', say: 'Fold the binding strip in half and sew it around each armhole on the good side. Turn it to the inside, press, and sew it down.', svg: () =>
    `<path d="${t()}" class="fr"/>` + H.fade(`<path d="${P('M124 12 C 120 30 120 46 128 56', 250, 30, 2)}" fill="none" stroke="#6a8ec0" stroke-width="8"/>`, 0.3) + H.stitch(P('M124 12 C 120 30 120 46 128 56', 250, 30, 2), 1, 2) + H.stitch(P('M36 12 C 40 30 40 46 32 56', 250, 30, 2), 3.2, 2) },
  sleeves: { cap: 'Sew on the sleeves', say: 'Match the top of each sleeve to the shoulder seam. Pin it along the armhole and sew with the sleeve on top.', svg: () => {
    const sl = (sx) => P('M0 30 C 12 30 18 0 35 0 C 52 0 58 30 70 30 L 62 80 L 8 80 Z', 0, 0, 1).replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (m, a, b) => `${sx > 0 ? 506 + +b * 1.6 : 294 - +b * 1.6} ${118 + (+a - 35) * 1.6}`);
    return `<path d="${t()}" class="fr"/>` + H.move(`<path d="${sl(1)}" class="fw"/>`, 200, 0, 0.2, 1) + H.move(`<path d="${sl(-1)}" class="fw"/>`, -200, 0, 0.4, 1) + H.pins([[505, 70], [500, 110], [505, 150]], 1.4) + H.stitch(P('M124 12 C 120 30 120 46 128 56', 250, 30, 2), 2.1, 2) + H.stitch(P('M36 12 C 40 30 40 46 32 56', 250, 30, 2), 4.2, 2); } },
  sides: { cap: 'Sew the sides', say: 'Turn it inside out. Sew each side from the bottom up to the armpit, and on along the sleeve in one line.', svg: () =>
    `<path d="${t()}" class="fw"/>` + H.stitch(P('M130 150 L128 56 L124 12', 250, 30, 2), 0.4, 2.4) + H.stitch(P('M30 150 L32 56 L36 12', 250, 30, 2), 3, 2.4) },
  sidesSlit: { cap: 'Sides with slits', say: 'Sew each side seam from the armpit down to the slit mark, then stop and lock the stitches. Below the mark, leave the seam open for the slit.', svg: () =>
    `<path d="${t()}" class="fw"/>` + H.stitch(P('M124 12 L128 56 L129 110', 250, 30, 2), 0.4, 2) + H.ring(508, 250, 16, 2.5) + H.draw(P('M129 110 L130 150', 250, 30, 2), 'chalkd', 2.8, 0.6) + H.stitch(P('M36 12 L32 56 L31 110', 250, 30, 2), 3.6, 2) },
  slitFinish: { cap: 'Finish the slits', say: 'Press the seam open, also along the slit. Fold each slit edge under twice and sew around the slit in a narrow U, with a small bar across the top.', svg: () =>
    `<rect x="250" y="60" width="300" height="380" class="fr"/><path d="M400 260 L400 440" stroke="#1b2326" stroke-width="3"/>` + H.stitch('M392 440 L392 262 L408 262 L408 440', 0.4, 3) + H.stitch('M392 258 L408 258', 3.6, 0.5, 'foot', 'stitch solid') },
  sleeveHem: { cap: 'Hem the sleeves', say: `Fold the end of each sleeve up by ${sn(1)} and press. Sew close to the fold.`, svg: () =>
    `<path d="M200 60 L600 60 L620 380 L180 380 Z" class="fw"/>` + H.flip('<rect x="180" y="380" width="440" height="60" class="fr"/>', 'y', 380, 0.3, 1) + H.stitch('M196 368 L604 368', 1.6, 2.4) },
  hem: { cap: 'Hem the bottom', say: `Fold the bottom edge up by ${sn(0.5)}, then again by ${sn(0.75)}. Press and sew close to the fold.`, svg: () =>
    `<rect x="100" y="60" width="600" height="320" class="fw"/>` + H.flip('<rect x="100" y="380" width="600" height="40" class="fr"/>', 'y', 380, 0.3, 1) + H.stitch('M100 366 L700 366', 1.6, 3) },
  curvedHem: { cap: 'Hem the flared bottom', say: 'A flared hem is curved. Fold up a narrow hem, about half an inch, so it lies flat. Press as you go and sew slowly around the curve.', svg: () =>
    `<path d="M150 60 L650 60 L720 330 Q400 400 80 330 Z" class="fw"/>` + H.fade('<path d="M86 322 Q400 390 714 322" fill="none" stroke="#6a8ec0" stroke-width="12"/>', 0.3) + H.stitch('M90 316 Q400 384 710 316', 1.2, 3.4) },
  hooks: { cap: 'Sew on the hooks', say: 'Sew the hooks on the inside of the right front edge, about one and a half inches apart. Sew the eyes on the left front so they line up exactly.', svg: () =>
    `<rect x="260" y="40" width="130" height="420" class="fr"/><rect x="410" y="40" width="130" height="420" class="fr"/>` + [100, 160, 220, 280, 340, 400].map((y, i) => H.pop(`<path d="M374 ${y} q-14 0 -14 -6 q0 -6 14 -6" fill="none" stroke="#d9dde1" stroke-width="3"/><path d="M426 ${y - 6} q12 -6 12 0 q0 6 -12 6" fill="none" stroke="#d9dde1" stroke-width="3"/>`, 0.3 + i * 0.4)).join('') },
  buttons: { cap: 'Buttons and buttonholes', say: 'Make the buttonholes on the right side of the placket or collar. Sew the buttons on the other side, lined up with each hole.', svg: () =>
    `<rect x="300" y="40" width="90" height="420" class="fr"/><rect x="410" y="40" width="90" height="420" class="fr"/>` + [110, 200, 290].map((y, i) => H.stitch(`M337 ${y - 16} L353 ${y - 16} L353 ${y + 16} L337 ${y + 16} Z`, 0.3 + i, 0.8, 'foot', 'stitch solid')).join('') + [110, 200, 290].map((y, i) => H.pop(ICON.button(455, y, 13), 3.4 + i * 0.4)).join('') },
  press: { cap: 'Press it', say: 'Press the whole garment with a damp cloth: the seams, the neck, the sleeves and the hem.', svg: () =>
    `<path d="${t()}" class="fr"/>` + H.iron(330, 240, 0.3, 160, 0, 4) },
  doneTunic: (len) => ({ cap: 'All done!', say: 'Well done! Try it on. You made it yourself.', svg: () =>
    figure(FIG.ox, FIG.oy, FIG.s, { top: { cls: 'fr', to: ({ crop: 70, hip: 112, thigh: 126, knee: 150, calf: 172 })[len] || 112 } }) + stars() }),
  // easy pants
  sidePocketEasy: { ...SEW_PANT[2], cap: 'Side pockets', say: 'Sew a pocket bag to the front and to the back at the side edges. When you sew the side seams, leave the pocket opening open and turn the bags to the front.' },
  pantsSides: { ...SEW_PANT[6], cap: 'Sew the sides', say: 'Put each front on its back, good sides together. Sew the side seams from the waist to the bottom. Press them open.' },
  pantsInseam: SEW_PANT[7],
  pantsCrotch: SEW_PANT[8],
  elasticCasing: { cap: 'Elastic waist', say: 'Fold the top edge over along the fold line and sew close to the bottom of the fold, leaving a two inch gap. Pull the elastic through with a safety pin, overlap the ends and sew them. Close the gap.', svg: () =>
    `<rect x="120" y="140" width="560" height="300" class="pr"/>` + H.flip('<rect x="120" y="100" width="560" height="40" class="pr2"/>', 'y', 140, 0.3, 0.9) + H.stitch('M120 172 L620 172', 1.4, 2.4) + H.fade('<path d="M160 158 L560 158" stroke="#f6f3ea" stroke-width="10" stroke-linecap="round"/>', 4) + H.move('<g transform="translate(560 158)"><circle r="8" fill="none" stroke="#d9dde1" stroke-width="3"/></g>', -400, 0, 4, 1.4) },
  drawCasing: { cap: 'Drawstring waist', say: 'Make two small buttonholes at the front, in the middle of the casing. Fold the top over and sew it down. Thread the drawstring through with a safety pin.', svg: () =>
    `<rect x="120" y="140" width="560" height="300" class="pr"/>` + H.stitch('M380 112 L380 128 M420 112 L420 128', 0.3, 1, 'foot', 'stitch solid') + H.flip('<rect x="120" y="100" width="560" height="40" class="pr2"/>', 'y', 140, 1.5, 0.9) + H.stitch('M120 176 L680 176', 2.6, 2.4) + H.draw('M380 160 Q 360 220 330 250 M420 160 Q 440 220 470 250', 'chalkl', 5, 1) },
  pantsHem: { cap: 'Hem the legs', say: `Fold the bottom of each leg up by ${sn(0.5)}, then by ${sn(0.75)}. Press and sew close to the fold.`, svg: () =>
    `<rect x="220" y="40" width="360" height="360" class="pw"/>` + H.flip('<rect x="220" y="400" width="360" height="50" class="pr"/>', 'y', 400, 0.3, 1) + H.stitch('M236 386 L564 386', 1.6, 2.6) },
  churidarHem: { cap: 'Churidar ankles', say: 'Churidar legs are long and narrow. Hem the ankle with a narrow hem. The extra length gathers up into soft folds above the ankle when you wear it. You can add a small button loop at the ankle.', svg: () =>
    `<path d="M300 40 L500 40 L460 440 L340 440 Z" class="pr"/>` + [0, 1, 2, 3, 4].map((i) => H.fade(`<path d="M${344 + i * 2} ${380 - i * 30} Q400 ${396 - i * 30} ${456 - i * 2} ${380 - i * 30}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3"/>`, 0.3 + i * 0.2)).join('') + H.stitch('M342 430 L458 430', 1.6, 1.4) },
  donePants: { cap: 'All done!', say: 'Well done! Put them on. You made them yourself.', svg: () => figure(FIG.ox, FIG.oy, FIG.s, { pants: 'pr' }) + stars() },
  // skirt & dress
  gather: { cap: 'Gather the skirt', say: 'Sew two long loose stitches along the top of the skirt, without locking them. Pull the bobbin threads gently to gather the skirt until it fits the waist. Spread the gathers evenly.', svg: () =>
    `<rect x="100" y="120" width="600" height="300" class="fr"/>` + H.stitch('M100 136 L700 136', 0.3, 2, 'foot', 'stitch') + H.stitch('M100 148 L700 148', 2.4, 2, 'foot', 'stitch') +
    H.fade(Array.from({ length: 18 }, (_, i) => `<path d="M${250 + i * 17} 120 L${246 + i * 17} 420" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`).join(''), 4.6) + H.arrow('M720 140 L770 140', 4.4) },
  skirtSides: { cap: 'Sew the skirt sides', say: 'Put the skirt front on the skirt back, good sides together. Sew both side seams and press them open.', svg: () =>
    `<path d="${P(SKIRT, 250, 40, 3)}" class="fw"/>` + H.stitch(P('M82 8 Q92 60 100 110', 250, 40, 3), 0.4, 2) + H.stitch(P('M18 8 Q8 60 0 110', 250, 40, 3), 2.6, 2) },
  skirtSidesZip: { cap: 'Sides and zip', say: 'Sew the right side seam. On the left side, leave the top seven inches open for the zip. Sew the zip in with the zipper foot, then sew the rest of the seam.', svg: () =>
    `<path d="${P(SKIRT, 250, 40, 3)}" class="fw"/>` + H.move(ICON.zip(300, 64, 150), -200, 0, 0.3, 1) + H.stitch('M296 220 Q280 300 252 370', 1.6, 1.6) + H.stitch(P('M82 8 Q92 60 100 110', 250, 40, 3), 3.4, 2) },
  waistbandSkirt: { cap: 'Sew the waistband', say: 'Sew the waistband to the top of the skirt. Fold it to the inside and sew it down from the outside. Sew a hook and eye at the zip end.', svg: () =>
    `<path d="${P(SKIRT, 250, 80, 3)}" class="fr"/>` + H.move(`<rect x="300" y="64" width="200" height="40" class="fr2"/>`, 0, -100, 0.2, 1) + H.stitch('M300 104 L500 104', 1.4, 2) + H.pop('<path d="M484 84 q12 0 12 -6 q0 -6 -12 -6" fill="none" stroke="#d9dde1" stroke-width="3"/>', 3.6) },
  skirtHem: { cap: 'Hem the skirt', say: 'Fold up a narrow double hem, press it as you go around the curve, and sew close to the fold.', svg: () =>
    `<path d="M150 60 L650 60 L720 330 Q400 400 80 330 Z" class="fw"/>` + H.stitch('M90 316 Q400 384 710 316', 0.6, 3.4) },
  joinSkirt: { cap: 'Join skirt and top', say: 'Turn the bodice inside out and slip the skirt over it, good sides together. Match the side seams and the middle. Pin all around the waist and sew.', svg: () =>
    `<path d="${P(SKIRT, 250, 170, 3)}" class="fr2"/>` + H.move(`<path d="${P('M58 6 Q 80 18 102 6 L 124 12 C 120 30 120 46 128 56 L 126 70 L 34 70 L 32 56 C 40 46 40 30 36 12 Z', 250, 30, 2)}" class="fr"/>`, 0, -100, 0.3, 1) + H.pins([[310, 178], [400, 176], [490, 178]], 1.5) + H.stitch('M304 172 L496 172', 2.2, 2) },
  backZip: { cap: 'Back zip', say: 'Sew the centre back seam from the bottom up to the zip mark. Press the seam allowances open, put the zip under the opening and sew both sides with the zipper foot.', svg: () =>
    `<rect x="240" y="40" width="320" height="420" class="fw"/><path d="M400 40 L400 460" stroke="rgba(0,0,0,.4)" stroke-width="2"/>` + H.stitch('M400 460 L400 250', 0.3, 1.4) + H.move(ICON.zip(400, 50, 200), 0, -260, 1.8, 1) + H.stitch('M386 60 L386 246', 3, 1.4) + H.stitch('M414 60 L414 246', 4.6, 1.4) },
  doneSkirt: { cap: 'All done!', say: 'Well done! You made your own skirt.', svg: () => figure(FIG.ox, FIG.oy, FIG.s, { skirt: { cls: 'fr', to: 150 } }) + stars() },
  doneDress: { cap: 'All done!', say: 'Well done! You made your own dress.', svg: () => figure(FIG.ox, FIG.oy, FIG.s, { top: { cls: 'fr', to: 92, sleeves: 'short' }, skirt: { cls: 'fr', to: 158 } }) + stars() },
};
void f; void SH;
