// Technique lessons: the hand skills a beginner needs, each as a few clear drawings plus a practice
// exercise on scrap fabric. Used three ways: as a lesson in Help ("Learn sewing"), as the "Learn this
// first" link on every step that needs it, and (three key pictures) as the How strip beside the step.
import { H, ICON } from './svg.js';

const C = '#d98f9b', CW = '#efd6da', EDGE = 'rgba(0,0,0,.45)', THREAD = '#2f3b45';
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

/* ---------- drawing pieces (stage 800 × 500) ---------- */
const cloth = (d, fill = C) => `<path d="${d}" fill="${fill}" stroke="${EDGE}" stroke-width="2" stroke-linejoin="round" style="filter:url(#cloth)"/>`;
const rect = (x, y, w, h, fill = C) => cloth(`M${x} ${y} h${w} v${h} h${-w} Z`, fill);
const stitch = (d, d0 = 0.3, t = 1.4) => H.draw(d, 'stitch solid', d0, t).replace('class="', `style="stroke:${THREAD};stroke-width:3;stroke-dasharray:9 6;filter:none" class="`);
const line = (d, color = THREAD, w = 3, dash = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
const chalk = (d) => line(d, '#ffffff', 3, '10 7');
const arrow = (d, d0 = 0.6) => H.fade(`<path d="${d}" fill="none" stroke="#ffd84a" stroke-width="5" stroke-linecap="round" marker-end="url(#ah)"/>`, d0);
const label = (x, y, t, size = 22, color = '#ffffff') => `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${size}px var(--f-display);fill:${color}">${esc(t)}</text>`;
const tag = (x, y, t) => `<g><rect x="${x - t.length * 6.5 - 14}" y="${y - 22}" width="${t.length * 13 + 28}" height="34" rx="10" fill="#ffd84a"/><text x="${x}" y="${y + 2}" text-anchor="middle" style="font:800 17px var(--f-body);fill:#1b2326">${esc(t)}</text></g>`;
const foot = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(1.6)">${ICON.foot()}</g>`;
const needleDown = (x, y) => `<circle cx="${x}" cy="${y}" r="9" fill="#e5484d" stroke="#fff" stroke-width="3"/>`;
const turn = (x, y, r = 46, d0 = 0.6) => H.fade(`<path d="M${x + r} ${y} A${r} ${r} 0 1 1 ${x} ${y - r}" fill="none" stroke="#ffd84a" stroke-width="5" marker-end="url(#ah)"/>`, d0);
const scissorsAt = (x, y, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(1.5)">${ICON.scissors()}</g>`;
const pin = (x, y, d0 = 0.3) => `<g transform="translate(${x} ${y}) scale(1.6) translate(${-x} ${-y})">${H.pin(x, y, d0)}</g>`;
const side = (d, fill = C) => `<path d="${d}" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---------- the lessons ---------- */
// each step: [caption, words, drawing]
export const LESSONS = {
  curve: { title: 'Sewing a curve', why: 'Necklines, armholes and curved hems are curves. Rushing them makes wobbly, stretched seams.', steps: [
    ['Look at the edge, not the needle', 'Keep your eyes on the fabric edge and the guide line on the machine plate. The needle follows on its own.',
      () => rect(120, 90, 560, 330) + chalk('M180 380 Q400 120 620 380') + line('M150 400 Q400 100 650 400', 'rgba(0,0,0,.55)', 2) + foot(260, 300, -38) + tag(400, 460, 'Edge on the guide line')],
    ['Go slowly', 'Press the pedal gently. Sew only a few stitches at a time round the curve.',
      () => rect(120, 90, 560, 330) + chalk('M180 380 Q400 120 620 380') + stitch('M180 380 Q290 240 360 205', 0.3, 2) + foot(360, 205, -22) + tag(400, 460, 'Slow and steady')],
    ['Stop, needle down, turn a little', 'Every few stitches, stop with the needle down in the fabric. Lift the foot, turn the fabric a little to follow the curve, lower the foot, sew on.',
      () => rect(120, 90, 560, 330) + chalk('M180 380 Q400 120 620 380') + stitch('M180 380 Q330 210 400 210', 0.3, 1.2) + needleDown(400, 212) + turn(400, 212, 52, 1.4) + tag(400, 460, 'Needle down · lift foot · turn · sew')],
    ['Do not pull or push', 'Let the machine feed the fabric. Your hands only steer. Pulling stretches the curve.',
      () => rect(120, 90, 560, 330) + chalk('M180 380 Q400 120 620 380') + stitch('M180 380 Q400 120 620 380', 0.2, 2.6) + H.no(660, 120, 2.9, 30) + tag(400, 460, 'Hands steer, the machine feeds')],
    ['Practise on scrap', 'Draw a circle the size of a saucer on a scrap and sew round it three times, each time a little smoother.',
      () => rect(200, 70, 400, 360, '#e9e2d0') + chalk('M400 130 a120 120 0 1 1 -0.1 0') + stitch('M400 110 a140 140 0 1 1 -0.1 0', 0.3, 3) + tag(400, 470, 'Practice: sew round a circle')],
  ] },
  pivot: { title: 'Turning a corner or a V point', why: 'V-necks, square necks, collar tips, plackets and pocket corners all need a sharp turn.', steps: [
    ['Mark the turning point', 'Chalk a dot exactly one seam width in from both edges. That is where you turn.',
      () => rect(160, 90, 480, 330) + chalk('M200 380 L560 380 L560 130') + needleDown(560, 380) + tag(400, 470, 'Turning dot')],
    ['Sew exactly to the dot', 'Slow right down near the end. Turn the hand wheel for the last stitch so the needle goes in exactly on the dot.',
      () => rect(160, 90, 480, 330) + chalk('M560 380 L560 130') + stitch('M200 380 L560 380', 0.3, 1.6) + foot(560, 380) + needleDown(560, 380)],
    ['Needle down, lift the foot', 'Leave the needle down in the fabric. Lift the presser foot.',
      () => rect(160, 90, 480, 330) + stitch('M200 380 L560 380', 0, 0.01) + needleDown(560, 380) + H.fade(`<path d="M600 300 L600 220" stroke="#ffd84a" stroke-width="5" marker-end="url(#ah)"/>`, 0.4) + tag(400, 470, 'Foot up, needle stays down')],
    ['Turn round the needle', 'Turn the fabric round the needle until the next chalk line runs straight towards you.',
      () => H.rot(rect(160, 90, 480, 330) + chalk('M560 380 L560 130') + stitch('M200 380 L560 380', 0, 0.01), 560, 380, -90, 0.4, 1.2) + needleDown(560, 380) + turn(560, 380, 60, 0.4)],
    ['Foot down, sew on', 'Lower the foot and sew along the next line. For a V-neck, later snip into the point, one thread short of the stitch.',
      () => rect(160, 90, 480, 330) + stitch('M200 380 L560 380 L560 130', 0, 0.01) + needleDown(560, 380) + scissorsAt(530, 350, -45) + tag(400, 470, 'Snip into the point')],
    ['Practise on scrap', 'Chalk a square on a scrap and sew round it, turning at each corner.',
      () => rect(200, 70, 400, 360, '#e9e2d0') + chalk('M280 150 h240 v200 h-240 Z') + stitch('M280 150 h240 v200 h-240 Z', 0.3, 3) + tag(400, 470, 'Practice: a square')],
  ] },
  clip: { title: 'Clipping and notching curves', why: 'After sewing a curve, the seam must be cut so it lies flat when turned.', steps: [
    ['Trim the seam narrow', 'Trim the sewing space to about ¼ inch.',
      () => side('M80 260 L720 260') + rect(120, 150, 560, 110) + stitch('M120 220 L680 220', 0, 0.01) + H.cut('M120 238 L680 238', 0.3, 1.4)],
    ['Inside curve: snip straight', 'On a curve that goes inwards (neckline, armhole), make straight snips every half inch, up to the stitching but not through it.',
      () => cloth('M120 120 Q400 420 680 120 L680 80 L120 80 Z') + stitch('M140 130 Q400 380 660 130', 0, 0.01) + [200, 280, 360, 440, 520, 600].map((x) => line(`M${x} ${x < 400 ? 150 + (x - 140) * 0.55 : 150 + (660 - x) * 0.55} l0 -38`, '#fff', 3)).join('') + tag(400, 470, 'Snip up to the stitches')],
    ['Outside curve: cut little V notches', 'On a curve that goes outwards (collar edge, round pocket), cut small V shapes out of the sewing space so it does not bunch.',
      () => cloth('M120 380 Q400 60 680 380 Z') + stitch('M150 370 Q400 90 650 370', 0, 0.01) + [220, 310, 400, 490, 580].map((x) => `<path d="M${x - 9} ${370 - (x < 400 ? (x - 150) * 0.9 : (650 - x) * 0.9) + 40} l9 -20 l9 20 Z" fill="#1b4f3e"/>`).join('') + tag(400, 470, 'Cut out small Vs')],
    ['Corners: cut across', 'At a corner or point, cut the sewing space across, close to the stitching, so the point turns out sharp.',
      () => rect(180, 120, 440, 260) + stitch('M220 340 L580 340 L580 160', 0, 0.01) + H.cut('M600 320 L560 360', 0.3, 0.8) + tag(400, 470, 'Cut the corner across')],
    ['Never cut the stitches', 'Stop each snip one thread short of the stitching. A cut stitch makes a hole.',
      () => rect(160, 150, 480, 200) + stitch('M160 280 L640 280', 0, 0.01) + line('M400 350 L400 284', '#fff', 3) + H.ok(560, 220, 0.3) + tag(400, 460, 'Stop just before the stitch')],
  ] },
  binding: { title: 'Finishing a round neck with a strip', why: 'The neck strip (facing or binding) is the most visible finish on a kurta or blouse.', steps: [
    ['Fold and press the strip', 'Fold the strip in half along its length, wrong sides together, and press a sharp fold.',
      () => side('M120 300 L680 300 Q700 300 700 280 L120 280') + arrow('M720 330 Q740 300 720 270') + tag(400, 420, 'Sharp fold')],
    ['Make it the size of the neck', 'Lay the strip round the neckline without stretching it. Join the two ends into a ring with a ¼ inch seam where they meet.',
      () => cloth('M140 80 L660 80 L660 420 L140 420 Z') + `<path d="M260 80 Q400 300 540 80" fill="#1b4f3e" stroke="${EDGE}" stroke-width="2"/>` + line('M250 80 Q400 320 550 80', '#f4c9cf', 14) + stitch('M392 280 l16 0', 0.2, 0.4) + tag(400, 460, 'Join the ends where they meet')],
    ['Pin round, raw edges together', 'Pin the strip to the good side of the neckline, raw edges together, every inch. Ease it round the curve; do not stretch it.',
      () => cloth('M140 80 L660 80 L660 420 L140 420 Z') + `<path d="M260 80 Q400 300 540 80" fill="#1b4f3e"/>` + line('M250 80 Q400 320 550 80', '#f4c9cf', 14) + [290, 340, 400, 460, 510].map((x, i) => pin(x, x < 400 ? 130 + (x - 260) * 0.95 : 130 + (540 - x) * 0.95, 0.2 + i * 0.12)).join('')],
    ['Sew slowly round the curve', 'Sew at the seam width, slowly, stopping to turn a little as for any curve.',
      () => cloth('M140 80 L660 80 L660 420 L140 420 Z') + `<path d="M260 80 Q400 300 540 80" fill="#1b4f3e"/>` + line('M250 80 Q400 320 550 80', '#f4c9cf', 14) + stitch('M262 90 Q400 300 538 90', 0.3, 2.4)],
    ['Trim, clip, understitch', 'Trim and snip the curve. Press the strip and seam away from the garment and sew them together close to the seam.',
      () => side('M80 300 L400 300') + side('M400 300 L640 252', '#f4c9cf') + stitch('M430 292 L640 252', 0.3, 1.2) + tag(400, 420, 'Seam goes under the strip')],
    ['Turn inside, topstitch', 'Turn the strip to the inside, press the neckline flat and sew round from the outside to hold it.',
      () => cloth('M140 80 L660 80 L660 420 L140 420 Z') + `<path d="M260 80 Q400 300 540 80" fill="#1b4f3e"/>` + stitch('M278 92 Q400 270 522 92', 0.3, 2) + H.ok(640, 380, 2.4)],
  ] },
  setsleeve: { title: 'Setting in a sleeve', why: 'The sleeve top is a little longer than the armhole and must be eased in without tucks.', steps: [
    ['Long stitches across the top', 'Sew a row of long stitches across the sleeve top, just inside the sewing line. Do not lock them.',
      () => cloth('M150 380 Q160 120 400 90 Q640 120 650 380 Z') + stitch('M180 330 Q190 140 400 112 Q610 140 620 330', 0.3, 2)],
    ['Match the marks', 'Pin the sleeve top to the shoulder seam and the sleeve ends to the armhole ends, good sides together.',
      () => cloth('M150 380 Q160 120 400 90 Q640 120 650 380 Z') + pin(400, 92, 0.2) + pin(160, 370, 0.4) + pin(640, 370, 0.6) + tag(400, 450, 'Top to shoulder seam')],
    ['Pull the threads to fit', 'Gently pull the long stitches so the sleeve top shrinks to fit the armhole. Spread the fullness evenly over the top.',
      () => cloth('M150 380 Q160 120 400 90 Q640 120 650 380 Z') + Array.from({ length: 9 }, (_, i) => line(`M${250 + i * 38} ${150 - Math.sin((i / 8) * Math.PI) * 40} l0 26`, 'rgba(0,0,0,.25)', 4)).join('') + arrow('M690 260 L740 260')],
    ['Pin every inch, sew', 'Pin all round. Sew with the sleeve underneath so the machine helps ease it in.',
      () => cloth('M150 380 Q160 120 400 90 Q640 120 650 380 Z') + stitch('M168 360 Q178 130 400 104 Q622 130 632 360', 0.3, 2.4) + tag(400, 450, 'Sleeve underneath')],
    ['Check for tucks', 'Look at the good side. If there is a tuck, unpick a few stitches there and sew again.',
      () => cloth('M150 380 Q160 120 400 90 Q640 120 650 380 Z') + H.ok(400, 250, 0.3) + tag(400, 450, 'Smooth, no tucks')],
  ] },
  turnpoint: { title: 'Turning out points and tubes', why: 'Collars, cuffs, bands and strips are sewn inside out and turned. Sharp points make them look finished.', steps: [
    ['Cut the corners across', 'Before turning, cut the sewing space across each corner, close to the stitching.',
      () => rect(180, 150, 440, 200) + stitch('M200 330 L600 330 L600 170', 0, 0.01) + H.cut('M620 310 L580 350', 0.3, 0.8)],
    ['Turn through the open end', 'Push the far end through the opening with your fingers, a little at a time.',
      () => side('M120 260 L520 260') + arrow('M540 260 L660 260') + tag(400, 360, 'Gently, a little at a time')],
    ['Push the points out', 'Push each point out gently from inside with a chopstick or a knitting needle. Never with scissors.',
      () => cloth('M200 340 L560 340 L600 150 L200 340 Z') + line('M330 300 L580 170', '#c9a26b', 9) + tag(400, 420, 'Chopstick, not scissors')],
    ['Roll the seam to the edge, press', 'Roll the seam exactly onto the edge between your fingers and press.',
      () => side('M120 280 L680 280') + H.iron(300, 240, 0.3, 200, 0, 2)],
  ] },
  match: { title: 'Matching seams where they cross', why: 'Under the arm, at the crotch and at the waist, two seams meet. Lined up, they look neat and are strong.', steps: [
    ['Press both seams open', 'Press each seam open first.', () => rect(140, 120, 520, 260) + line('M400 120 L400 380', 'rgba(0,0,0,.4)', 3) + H.iron(300, 260, 0.3, 160, 0, 2)],
    ['Line them up exactly', 'Lay the pieces together so the two seam lines sit exactly on top of each other.',
      () => rect(140, 140, 520, 240) + rect(150, 130, 520, 240, '#c97e8b') + line('M410 130 L410 370', 'rgba(0,0,0,.5)', 3) + tag(400, 450, 'Seam on seam')],
    ['Pin right through the seams', 'Push a pin straight through both seam lines to hold them together.', () => rect(150, 130, 520, 240, '#c97e8b') + line('M410 130 L410 370', 'rgba(0,0,0,.5)', 3) + pin(410, 250, 0.2)],
    ['Sew slowly across', 'Sew slowly over the crossing; take the pin out just before the needle reaches it.', () => rect(150, 130, 520, 240, '#c97e8b') + stitch('M150 200 L670 200', 0.3, 2) + line('M410 130 L410 370', 'rgba(0,0,0,.5)', 3)],
  ] },
  zip: { title: 'Putting in a zip', why: 'Skirts, dresses and trousers close with a zip. Sewn this way it is hidden and straight.', steps: [
    ['Tack the opening closed', 'Sew the seam up to the zip mark with normal stitches, then the rest with long stitches. Press it open.',
      () => rect(200, 60, 400, 380) + stitch('M400 300 L400 440', 0.2, 0.8) + line('M400 60 L400 300', THREAD, 3, '20 10') + tag(400, 30, 'Long stitches where the zip goes')],
    ['Zip face down on the seam', 'Lay the zip face down on the pressed-open seam, the teeth exactly on the seam line.',
      () => rect(200, 60, 400, 380) + `<rect x="380" y="70" width="40" height="230" rx="4" fill="#3a3f45"/>` + ICON.zip(400, 70, 230)],
    ['Zipper foot, sew one side', 'Change to the zipper foot. From the outside, sew down one side a quarter inch from the seam.',
      () => rect(200, 60, 400, 380) + stitch('M376 70 L376 300', 0.3, 1.6) + tag(400, 470, 'Zipper foot')],
    ['Across the bottom and up', 'Turn at the bottom, sew across below the zip stop, turn again and sew up the other side.',
      () => rect(200, 60, 400, 380) + stitch('M376 70 L376 300 L424 300 L424 70', 0.3, 2.4)],
    ['Unpick the long stitches', 'Pull out the long stitches. The zip opens between the two lines.', () => rect(200, 60, 400, 380) + stitch('M376 70 L376 300 L424 300 L424 70', 0, 0.01) + `<path d="M396 70 L404 70 L404 290 L396 290 Z" fill="#3a3f45"/>` + H.ok(560, 380, 0.3)],
  ] },
  fold: { title: 'Folding and pressing strips', why: 'Plackets, bands, cuffs, loops and ties all start as a strip folded and pressed.', steps: [
    ['Fold in half and press', 'Fold the strip in half along its length, wrong sides together. Press.', () => side('M120 300 L680 300 Q700 300 700 280 L120 280') + H.iron(260, 250, 0.3, 260, 0, 2)],
    ['Open, fold the edges to the middle', 'Open it, fold both long edges in to meet the fold, and press again.', () => side('M120 300 L400 300 L400 286 L140 286') + side('M680 300 L400 300 L400 286 L660 286') + arrow('M180 250 L330 250') + arrow('M620 250 L470 250')],
    ['Fold again', 'Fold in half again so the raw edges are hidden inside. Press.', () => side('M120 300 L680 300 Q694 300 694 288 L120 288') + H.ok(400, 200, 0.3)],
  ] },
  press: { title: 'Pressing as you go', why: 'Pressing each seam before the next one is what makes home-made clothes look shop-made.', steps: [
    ['Press the seam flat first', 'Press the seam as it was sewn, to set the stitches.', () => side('M120 280 L680 280') + H.iron(260, 240, 0.3, 260, 0, 2)],
    ['Then press it open or to one side', 'Open the seam with your fingers and press it open, or both edges to one side as the step says.', () => side('M120 300 L390 300 L390 270') + side('M680 300 L410 300 L410 270') + arrow('M380 240 L300 240') + arrow('M420 240 L500 240')],
    ['Lift and press, do not slide', 'Lift the iron and put it down; sliding stretches the fabric. Use a damp cloth on dark fabric.', () => rect(160, 200, 480, 160) + H.iron(330, 230, 0.3, 0, 0, 1) + H.no(600, 160, 0.4, 30)],
  ] },
  pin: { title: 'Pinning', why: 'Pins hold layers so they do not slide while you sew.', steps: [
    ['Pins across the line', 'Put pins across the sewing line, heads towards you, about every 3 inches.', () => rect(140, 140, 520, 220) + chalk('M140 200 L660 200') + [220, 340, 460, 580].map((x, i) => pin(x, 200, 0.2 + i * 0.15)).join('')],
    ['Take each pin out before the needle', 'Never sew over a pin. Pull it out just before the needle reaches it.', () => rect(140, 140, 520, 220) + stitch('M140 200 L380 200', 0.2, 1) + foot(380, 200) + pin(460, 200, 0) + H.no(600, 300, 0.6, 28)],
  ] },
  hand: { title: 'Hand stitches, hooks and buttons', why: 'Hems, hooks, eyes and buttons are sewn by hand.', steps: [
    ['Thread and knot', 'Thread a needle with a doubled thread about as long as your arm. Tie a knot at the end.', () => line('M200 250 L600 250', THREAD, 3) + `<g transform="translate(640 250) scale(2)">${ICON.hand()}</g>` + `<circle cx="196" cy="250" r="8" fill="${THREAD}"/>`],
    ['Small stitches through the fold only', 'For a hem, catch only one or two threads of the outside fabric so the stitch does not show.', () => side('M120 300 L680 300 L680 240 L400 240') + Array.from({ length: 6 }, (_, i) => line(`M${430 + i * 40} 240 l20 60`, THREAD, 2)).join('')],
    ['Four times through, then a stem', 'For buttons, hooks and eyes go through each hole four times, then wind the thread round underneath and knot it.', () => rect(220, 120, 360, 260) + ICON.button(400, 230, 30) + line('M380 210 L420 250 M420 210 L380 250', THREAD, 3)],
  ] },
  placket: { title: 'A front placket (button strip)', why: 'The kurta and the shirt cuff open with a placket: two strips that overlap and are boxed at the bottom.', steps: [
    ['Sew both strips to the box', 'Sew a strip along each long side of the chalked box, stopping exactly at the bottom.', () => rect(160, 60, 480, 380) + chalk('M370 80 L370 340 L430 340 L430 80') + stitch('M370 80 L370 340', 0.2, 1) + stitch('M430 80 L430 340', 1.3, 1)],
    ['Cut down and into the corners', 'Cut down the middle, then snip into both bottom corners to the last stitch, making a Y.', () => rect(160, 60, 480, 380) + stitch('M370 80 L370 340 M430 80 L430 340', 0, 0.01) + H.cut('M400 80 L400 310', 0.2, 1) + H.cut('M400 310 L372 340', 1.3, 0.4) + H.cut('M400 310 L428 340', 1.8, 0.4)],
    ['Turn the strips through', 'Push both strips through to the inside so they fill the opening. The little triangle folds up inside.', () => rect(160, 60, 480, 380) + `<rect x="370" y="80" width="60" height="260" fill="#c97e8b" stroke="${EDGE}"/>` + line('M400 80 L400 340', EDGE, 2)],
    ['Overlap and box the bottom', 'Lay one strip over the other and sew a small box with a cross through all layers at the bottom.', () => rect(160, 60, 480, 380) + `<rect x="370" y="80" width="60" height="260" fill="#c97e8b" stroke="${EDGE}"/>` + stitch('M370 310 h60 v30 h-60 Z M370 310 L430 340 M430 310 L370 340', 0.3, 1.6)],
  ] },
  thread: { title: 'Threading elastic or a drawstring', why: 'Pull-on waists have elastic or a cord inside a tunnel (casing).', steps: [
    ['Safety pin on the end', 'Fix a big safety pin to one end of the elastic or cord.', () => side('M120 260 L680 260') + line('M140 260 L360 260', '#f6f3ea', 9) + `<circle cx="372" cy="260" r="12" fill="none" stroke="#d3dadd" stroke-width="4"/>`],
    ['Push it through the casing', 'Push the pin into the casing and work it round, bunching the fabric and sliding it along.', () => rect(100, 200, 600, 120) + line('M120 260 L520 260', '#f6f3ea', 9) + arrow('M540 260 L660 260') + tag(400, 380, 'Bunch, slide, repeat')],
    ['Join or knot the ends', 'Elastic: overlap the ends one inch and zigzag them together. Cord: knot each end.', () => line('M200 260 L600 260', '#f6f3ea', 18) + H.stitch(H.zz([[360, 260], [440, 260]], 9, 6), 0.3, 1, '', 'stitch solid')],
  ] },
  welt: { title: 'A welt pocket', why: 'The back trouser pocket is cut into the fabric. It looks hard but is just straight lines and a careful cut.', steps: [
    ['Two lines, same length', 'Sew two straight lines a quarter inch above and below the pocket line, exactly the same length.', () => rect(140, 100, 520, 300) + chalk('M250 250 L550 250') + stitch('M250 232 L550 232', 0.2, 1) + stitch('M250 268 L550 268', 1.3, 1)],
    ['Cut the middle and a Y at each end', 'Cut along the middle, stopping half an inch from each end, then snip to the last stitch of each line.', () => rect(140, 100, 520, 300) + stitch('M250 232 L550 232 M250 268 L550 268', 0, 0.01) + H.cut('M285 250 L515 250', 0.2, 1) + line('M285 250 L250 232 M285 250 L250 268 M515 250 L550 232 M515 250 L550 268', '#fff', 2)],
    ['Turn through, sew the triangles', 'Push the welt and bag through, then sew across each little end triangle three times.', () => rect(140, 100, 520, 300) + `<rect x="250" y="232" width="300" height="36" fill="#3a3f45"/>` + stitch('M250 232 L250 268 M550 232 L550 268', 0.3, 0.8)],
  ] },
  fly: { title: 'A trouser fly zip', why: 'The fly hides the zip on the front of trousers.', steps: [
    ['Facing on the left front', 'Sew the facing to the left front edge, understitch it and fold it inside.', () => rect(220, 60, 360, 380) + `<rect x="420" y="60" width="70" height="260" fill="#c97e8b" stroke="${EDGE}"/>`],
    ['Zip on the facing', 'Sew one zip tape to the facing only.', () => rect(220, 60, 360, 380) + `<rect x="420" y="60" width="70" height="260" fill="#c97e8b" stroke="${EDGE}"/>` + ICON.zip(455, 70, 220)],
    ['Sew the J from the outside', 'Chalk a J curve on the left front and sew along it through the front and facing.', () => rect(220, 60, 360, 380) + chalk('M470 60 L470 280 Q470 320 420 330') + stitch('M470 60 L470 280 Q470 320 420 330', 0.3, 1.6)],
  ] },
  pleat: { title: 'Folding pleats', why: 'Pleats add room in shirts, sleeves and trousers.', steps: [
    ['Mark the pleat lines', 'Chalk the two lines of each pleat from the pattern marks.', () => rect(160, 120, 480, 260) + chalk('M360 120 L360 380 M440 120 L440 380')],
    ['Fold one line onto the other', 'Fold so the first line lies on the second, in the direction the step says.', () => rect(160, 120, 480, 260) + chalk('M440 120 L440 380') + arrow('M350 200 L430 200')],
    ['Tack across the top', 'Tack the folds in place across the top edge.', () => rect(160, 120, 480, 260) + stitch('M160 140 L640 140', 0.3, 1.4)],
  ] },
  legs: { title: 'Joining the two legs', why: 'Pyjamas and trousers are made as two tubes joined by one curved seam.', steps: [
    ['Two legs, each a tube', 'Sew each leg\'s side and inside leg so you have two tubes.', () => cloth('M200 80 L360 80 L380 420 L240 420 Z') + cloth('M440 80 L600 80 L560 420 L420 420 Z')],
    ['One leg inside the other', 'Turn one leg right side out and slide it inside the other, good sides together.', () => cloth('M300 80 L500 80 L500 420 L300 420 Z') + cloth('M330 80 L470 80 L470 300 L330 300 Z', '#c97e8b') + arrow('M400 380 L400 320')],
    ['Sew the curve, twice', 'Sew the curved seam from front waist to back waist, and again beside it for strength.', () => cloth('M300 80 L500 80 L500 420 L300 420 Z') + stitch('M320 90 Q320 300 400 330 Q480 300 480 90', 0.3, 2) + stitch('M330 90 Q330 290 400 318 Q470 290 470 90', 2.4, 2)],
  ] },
};

/** which lessons a sewing step needs */
export function lessonsFor(st, garment) {
  const out = new Set();
  const c = (st.cap || '').toLowerCase(), d = st.d || {}, e = (d.edges || []).join(' ');
  const words = String(typeof (st.text ?? st.say) === 'function' ? (st.text ?? st.say)() : (st.text ?? st.say ?? '')).toLowerCase();
  // the step's own words say when it turns a point or corner (V-neck, square neck, sweetheart dip)
  if (/v point|each corner|centre dip|lift the foot, turn/.test(words)) out.add('pivot');
  if (/neck|armhole|cap|crotch|seat seam/.test(e) && ['straight', 'stay', 'under', 'top', 'edge'].includes(d.stitch)) out.add('curve');
  if (/hem/.test(c) && /curve|bottom/.test(c)) out.add('curve');
  if (/v-neck|v point|square|sweetheart|corner|point|box|collar|cuff pairs|band pieces|triangle/.test(c) || (d.trim && /corner|point/.test(d.trim))) out.add('pivot');
  if (/clip|notch|trim/.test(c) || /clip|notch/.test(d.trim || '')) out.add('clip');
  if (/strip|facing|binding/.test(c)) out.add('binding');
  if (/sleeve/.test(c) && /(sew|pin|ease|gather).*(sleeve)|sleeve top|in the sleeve/.test(c)) out.add('setsleeve');
  if (/^turn|turn the|turn through/.test(c)) out.add('turnpoint');
  if (/side|inside leg|crotch|seat seam|skirt and top|sleeve seam/.test(c) && d.stitch === 'straight') out.add('match');
  if (/zip/.test(c) && !/fly|facing/.test(c)) out.add('zip');
  if (/fold the (strips|big placket|binding|facing strip|welts)|make the (tie|drawstring|fly shield|belt)|loops|press the (bands|cuffs)|prepare the waistband/.test(c)) out.add('fold');
  if (/^press|open and press/.test(c) || (d.stitch === 'none' && d.press)) out.add('press');
  if (/^pin /.test(c)) out.add('pin');
  if (d.stitch === 'hand' || d.stitch === 'button' || /hook|eye|button/.test(c)) out.add('hand');
  if (/placket|cut the opening|box the bottom|sleeve slit/.test(c)) out.add('placket');
  if (/elastic|drawstring|stitch at the sides/.test(c) && /thread|stitch at/.test(c)) out.add('thread');
  if (/welt|cut the y|sew the two lines|triangles|place welt/.test(c)) out.add('welt');
  if (/bag|pocket/.test(c) && !out.size) out.add('match');
  if (/fly|j line|zip on the facing|zip to the right/.test(c)) out.add('fly');
  if (/pleat/.test(c)) out.add('pleat');
  if (/leg inside|crotch seam|seat seam|your cut pieces/.test(c) || (garment === 'pants' && /inside legs|side seams/.test(c))) out.add('legs');
  if (/^mark|tack the|place |cut the sleeve slit/.test(c) && !out.size) out.add('pin');
  return [...out].filter((k) => LESSONS[k]);
}

/** a lesson as player steps */
export function lessonSteps(id) {
  const L = LESSONS[id];
  return L.steps.map(([cap, say, svg]) => ({ cap, say, svg }));
}

/** three pictures from a lesson, small, for the How strip beside a step */
export function lessonPanels(id) {
  const steps = LESSONS[id].steps.filter(([cap]) => !/^practise/i.test(cap));
  const pick = steps.length <= 3 ? steps : [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]];
  return pick.map(([cap, , svg]) => [cap, () => `<svg x="10" y="8" width="265" height="104" viewBox="60 40 680 420">${svg()}</svg>`]);
}
