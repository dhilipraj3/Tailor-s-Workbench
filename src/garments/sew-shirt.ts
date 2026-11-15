// Every stitch of the shirt, in sewing order. All shirt seams are ⅜″ (shirt.ts),
// curved hem ½″ (straight 1″), button stand 1½″, short-sleeve hem 1″, pocket top 1¼″.
import { sn } from '../core/units.js';
import { SEW_SHIRT } from '../chapters/sew.js';
import { V } from '../chapters/variants.js';
import { sew as s, withSize, rectSize, edgeLen } from '../engine/sew';
import type { Fit, Options, Step } from '../engine/types';

const SA = 0.375;

/** This person's sizes for each shirt step, measured from their pattern pieces. */
function shirtSizes(o: Options, fit: Fit): Record<string, string> {
  const get = (id: string) => fit.pieces.find((p) => p.id === id);
  const front = get('front'), back = get('back'), yoke = get('yoke'), sleeve = get('sleeve');
  const out: Record<string, string> = {};
  const neck = 2 * (edgeLen(front, 'neck') + edgeLen(yoke, 'neck'));
  // buttons and buttonholes, from the marks on the front
  const btn = (front?.marks || []).filter((mk) => mk.k === 'btn').map((mk) => (mk as { p: [number, number] }).p[1]).sort((a, b) => a - b);
  if (btn.length > 1) {
    out['Mark the buttonholes'] = `For your shirt: ${btn.length} buttonholes down the front, the first ${sn(btn[0] - (front?.outline.start[1] ?? 0))} below the neck seam at the centre front, then one every ${sn(btn[1] - btn[0])}.`;
    out['Sew on the buttons'] = `You need ${btn.length} buttons down the front${o.sleeve === 'half' ? '' : ', 2 for the cuffs'}${o.collar === 'buttondown' ? ', 2 small ones for the collar points' : ''} and 1 on the collar ${o.collar === 'mandarin' ? 'band' : 'stand'}.`;
  }
  // pocket position, from the pocket mark
  const pm = (front?.marks || []).find((mk) => mk.k === 'path' && mk.style === 'mark');
  const pk = get('pocket');
  if (pm && pk && pm.k === 'path') {
    const nums = pm.d.match(/-?\d+(\.\d+)?/g)!.map(Number), x0 = nums[0], y0 = nums[1];
    const msg = `Place the top of the pocket ${sn(y0)} below the shoulder at the neck and ${sn(x0)} from the centre front line. The finished pocket is ${sn(5)} wide.`;
    out['Sew on the pocket'] = msg; out['Sew on both pockets'] = msg;
  }
  out['Roll and sew shoulders'] = `Each shoulder seam is ${sn(edgeLen(front, 'shoulder'))} long.`;
  const stand = get('stand') || get('band');
  if (stand) {
    const w = 2 * Math.max(...stand.outline.points().map((q) => q[0]));
    out[stand.id === 'band' ? 'Band on the neckline' : 'Stand on the neckline'] = `Your neckline is ${sn(neck)} all round; the finished ${stand.id === 'band' ? 'band' : 'stand'} is ${sn(w)} from end to end.`;
  }
  const leaf = get('leaf');
  if (leaf) out['Sew the collar'] = `The finished collar is ${sn(2 * Math.max(...leaf.outline.points().map((q) => q[0])))} long across the back.`;
  if (sleeve) {
    const cap = edgeLen(sleeve, 'cap'), arm = edgeLen(front, 'armhole') + edgeLen(back, 'armhole') + edgeLen(yoke, 'armhole');
    out['Sew on the sleeves'] = `Each sleeve top is ${sn(cap)} and each armhole is ${sn(arm)}${cap - arm > 0.06 ? `, so ease in ${sn(cap - arm)} over the top of the sleeve` : ''}.`;
    const slit = sleeve.marks.find((mk) => mk.k === 'line' && mk.style === 'mark');
    if (slit && slit.k === 'line') out['Cut the sleeve slit'] = `The slit is ${sn(Math.abs(slit.b[1] - slit.a[1]))} long, a quarter of the way across the sleeve end from the back.`;
    out['Hem the short sleeves'] = `Each sleeve end measures ${sn(edgeLen(sleeve, 'hem'))} round.`;
  }
  const cuff = get('cuff');
  if (cuff) {
    const pts = cuff.outline.points(), w = Math.max(...pts.map((q) => q[0])) - Math.min(...pts.map((q) => q[0])), h = Math.max(...pts.map((q) => q[1])) - Math.min(...pts.map((q) => q[1]));
    out['Sew the cuff pairs'] = `Each finished cuff is ${sn(w)} long and ${sn(h)} deep.`;
    out['Tack the sleeve pleats'] = `Fold the two pleats so the sleeve end shrinks to ${sn(w - 1)}, leaving the overlap free.`;
  }
  const bp = rectSize(get('placketL')), sp = rectSize(get('placketS'));
  if (bp) out['Fold the big placket'] = `The big placket strip is ${sn(bp.w)} long and ${sn(bp.h)} wide; it finishes ${sn((bp.h - 0.5) / 2)} wide.`;
  if (sp) out['Bind the back edge'] = `The small strip is ${sn(sp.w)} long and ${sn(sp.h)} wide; it finishes ${sn((sp.h - 0.5) / 2)} wide.`;
  if (o.backPleat === 'box') out['Fold the back pleat'] = `Each fold of the pleat takes in ${sn(0.75)}, centred on the centre back mark.`;
  out['Hem the bottom'] = `Your hem measures ${sn(2 * (edgeLen(front, 'hem') + edgeLen(back, 'hem')))} all round.`;
  if (pk) out['Hem the pocket top'] = `The pocket top folds down ${sn(1.25)} in all.`;
  return out;
}

export function shirtSteps(o: Options, fit?: Fit): Step[] {
  const P = SEW_SHIRT, half = o.sleeve === 'half', pk = +o.pockets, mandarin = o.collar === 'mandarin';
  const hemSA = o.hem === 'straight' ? 1 : 0.5;
  const out: Step[] = [];

  out.push(s(P[0], 'Iron on interfacing', `Lay ${mandarin ? 'one band piece' : 'one collar piece and one stand piece'}${half ? '' : ' and two of the four cuffs'} wrong side up. Put the interfacing on top, glue side down. With a grown-up, press each part for ten seconds. Lift and press, do not slide.`,
    { stitch: 'fuse', check: 'No bubbles and every corner is stuck' }));

  out.push(
    s(P[1], 'Fold the front edges', `On each front, fold the long front edge ${sn(0.75)} to the wrong side and press. Fold it ${sn(0.75)} again and press. This makes the button band.`,
      { stitch: 'none', press: 'Press both folds' }),
    s(P[1], 'Stitch the button bands', 'Sew two lines along each band from the neck to the hem: one close to the outer fold, one close to the inner fold.',
      { edges: ['front:button stand'], stitch: 'edge', sa: 0.125, lock: true, check: 'Both bands are exactly the same width' }),
  );

  if (pk) out.push(
    s(P[2], 'Hem the pocket top', `Fold the top of ${pk === 2 ? 'each' : 'the'} pocket ${sn(0.25)} to the wrong side, then ${sn(1)} more. Press and sew close to the inner fold.`,
      { edges: ['pocket:top hem'], stitch: 'edge', sa: 0.125, lock: true }),
    s(P[2], 'Press the pocket edges', `Press the sides and the pointed bottom of ${pk === 2 ? 'each' : 'the'} pocket ${sn(SA)} to the wrong side. Fold the point neatly so no raw edge shows.`,
      { stitch: 'none', press: 'Press the edges under' }),
    s(P[2], pk === 2 ? 'Sew on both pockets' : 'Sew on the pocket', `Pin ${pk === 2 ? 'one pocket on each front' : 'the pocket on the left front'} at the chalk marks. Sew down one side, round the point and up the other side, close to the edge. At each top corner sew a small triangle to make it strong.`,
      { edges: ['pocket:pocket edge'], stitch: 'edge', sa: 0.0625, lock: true, check: 'The pocket is straight and the corners are reinforced' }),
  );

  if (o.backPleat === 'box') out.push(s(V.boxPleat, 'Fold the back pleat', 'Fold the pleat at the centre back marks, the two folds meeting in the middle. Tack it across the top edge.',
    { stitch: 'baste', sa: 0.25, check: 'The pleat is centred' }));

  out.push(
    s(P[3], 'Sandwich back and yoke', 'Lay the back good side up. Put one yoke on top, good side down. Put the other yoke underneath the back, good side up. Pin the three layers along the yoke seam and sew.',
      { edges: ['yoke:yoke seam', 'back:yoke seam'], join: 'Back between the two yokes', stitch: 'straight', sa: SA, lock: true, press: 'Press both yokes up' }),
    s(P[3], 'Edgestitch the yoke', 'From the outside, sew along the yoke close to the seam, through the yoke and the seam underneath.',
      { stitch: 'edge', sa: 0.0625, lock: true }),
    s(P[4], 'Roll and sew shoulders', 'Pin the outer yoke shoulders to the front shoulders, good sides together. Roll the fronts and back up tightly. Bring the inner yoke over the roll and pin its shoulders on top, so the fronts are sandwiched. Sew both shoulders, then pull everything out through the neck.',
      { edges: ['yoke:shoulder', 'front:shoulder'], join: 'Fronts sandwiched between the yokes', stitch: 'straight', sa: SA, lock: true, press: 'Press the yoke flat', check: 'Both yoke layers lie smooth with no twist' }),
    s(P[4], 'Tack the yoke edges', 'Tack the two yoke layers together along the neck and the armholes, just inside the sewing line. Then stay-stitch the front neck curves.',
      { stitch: 'stay', sa: 0.25, check: 'The yoke layers match at the neck and armholes' }),
  );

  if (mandarin) {
    out.push(
      s(V.mandarin, 'Sew the band pieces', `Press the neck edge of the plain band ${sn(SA)} to the wrong side. Lay the two bands good sides together and sew along the top and both rounded ends.`,
        { edges: ['band:band edge'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Trim to ⅛″ and notch the curves' }),
      s(V.mandarin, 'Turn the band', 'Turn the band right side out, push the curves out and press.', { stitch: 'none', press: 'Press flat' }),
      s(P[8], 'Band on the neckline', 'Pin the interfaced band to the neckline, good sides together, centre to centre back and each end level with the front edge. Sew it on and clip the curve.',
        { edges: ['band:neck', 'front:neck', 'yoke:neck'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Clip the neck curve', check: 'The band ends line up with the front edges' }),
      s(P[8], 'Close the band', 'Fold the inner band down over the seam. Edgestitch all round the band from the outside, catching the inner band.',
        { stitch: 'edge', sa: 0.0625, lock: true, check: 'The inner band is caught all round' }),
    );
  } else {
    out.push(
      s(P[5], 'Sew the collar', 'Lay the two collar pieces good sides together. Sew along both short ends and the long outer edge, leaving the neck edge open. At each point, sew one small stitch across the tip.',
        { edges: ['leaf:outer edge', 'leaf:collar end'], join: 'Good sides together', stitch: 'straight', sa: SA, len: 2, lock: true, trim: 'Trim to ⅛″ and cut the points across', check: 'Both points are the same shape' }),
      s(P[6], 'Turn and press', 'Turn the collar right side out. Push the points out gently with a chopstick. Press flat, rolling the seam a little to the underside.',
        { stitch: 'none', press: 'Press, seam rolled under' }),
      s(P[6], 'Topstitch the collar', 'Sew round the outer edge and ends of the collar.',
        { stitch: 'top', sa: 0.125, lock: true }),
      s(P[7], 'Collar into the stand', `Press the neck edge of the plain stand ${sn(SA)} to the wrong side. Lay the collar on the interfaced stand, centres matched. Lay the plain stand on top, good side down. Sew along the top and round both ends of the stand.`,
        { edges: ['stand:stand edge', 'leaf:neck'], join: 'Collar between the two stands', stitch: 'straight', sa: SA, lock: true, trim: 'Trim to ⅛″ and notch the curves', check: 'The collar ends sit the same distance from each stand end' }),
      s(P[7], 'Turn the stand', 'Turn the stand right side out and press.', { stitch: 'none', press: 'Press flat' }),
      s(P[8], 'Stand on the neckline', 'Pin the open edge of the interfaced stand to the neckline, good sides together, centre to centre back and each end level with the front edge. Sew it on and clip the curve.',
        { edges: ['stand:neck', 'front:neck', 'yoke:neck'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Clip the neck curve', check: 'The stand ends line up exactly with the front edges' }),
      s(P[8], 'Close the stand', 'Fold the inner stand down so its pressed edge just covers the seam. Edgestitch all round the stand from the outside, catching it underneath.',
        { stitch: 'edge', sa: 0.0625, lock: true, check: 'The inner stand is caught all round' }),
    );
  }

  if (!half) out.push(
    s(P[9], 'Cut the sleeve slit', 'Cut along the slit line at the bottom of each sleeve.', { stitch: 'none', check: 'Both slits are the same length' }),
    s(P[9], 'Bind the back edge', `Press both long edges of the small placket ${sn(0.25)} under, then fold it in half. Wrap it round the edge of the slit nearer the underarm and sew close to its edge.`,
      { pieces: ['placketS'], stitch: 'edge', sa: 0.0625, lock: true }),
    s(P[9], 'Fold the big placket', `Press both long edges of the big placket ${sn(0.25)} under, fold it in half and press the top end into a point.`,
      { pieces: ['placketL'], stitch: 'none', press: 'Press the point' }),
    s(P[9], 'Sew the tower placket', 'Wrap the big placket round the other edge of the slit, over the small one. Sew up its side, across above the slit, round the point and down. Then sew a small box with a cross above the slit, through every layer.',
      { stitch: 'edge', sa: 0.0625, lock: true, check: 'The placket lies flat and covers the slit top' }),
    s(P[12], 'Tack the sleeve pleats', 'Fold the two small pleats at the sleeve bottom towards the placket and tack them in place.',
      { stitch: 'baste', sa: 0.25 }),
  );

  out.push(
    s(P[10], 'Sew on the sleeves', 'Match the top of each sleeve to the shoulder seam, good sides together, and pin all along the armhole. Sew with the sleeve on top.',
      { edges: ['sleeve:cap', 'front:armhole', 'back:armhole', 'yoke:armhole'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, check: 'No tucks along the seam' }),
    s(P[10], 'Fell the armholes', `Trim the sleeve's seam edge to ${sn(0.125)}. Fold the shirt's seam edge over it, press the seam towards the shirt, and sew it down from the outside, close to the fold.`,
      { stitch: 'edge', sa: 0.0625, lock: true, trim: 'Trim the sleeve edge to ⅛″', press: 'Press towards the shirt', check: 'No raw edge shows inside' }),
    s(P[11], 'Side and sleeve seam', 'Turn the shirt inside out. Sew from the bottom of the shirt up to the armpit and along the sleeve, in one long line. Do both sides.',
      { edges: ['front:side', 'back:side', 'sleeve:underarm'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, check: 'The armhole seams meet exactly at the armpit' }),
    s(P[11], 'Finish the side seams', 'Zigzag each seam edge on its own, keeping any extra cloth. Press the seams open.',
      { stitch: 'zigzag', sa: 0, press: 'Press the seams open' }),
  );

  if (half) out.push(s(V.halfSleeveHem, 'Hem the short sleeves', `Fold each sleeve end ${sn(0.25)} to the inside, then ${sn(0.75)} more. Press and sew close to the inner fold.`,
    { edges: ['sleeve:hem'], stitch: 'edge', sa: 0.125, lock: true }));
  else out.push(
    s(P[12], 'Sew the cuff pairs', `Press the long top edge of each plain cuff ${sn(SA)} under. Lay each plain cuff on an interfaced cuff, good sides together, and sew round the two ends and the bottom.`,
      { edges: ['cuff:cuff edge'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Trim to ⅛″ and notch the curves' }),
    s(P[12], 'Turn the cuffs', 'Turn each cuff right side out, push out the corners and press.', { stitch: 'none', press: 'Press flat' }),
    s(P[12], 'Cuff on the sleeve', 'Pin the open edge of the interfaced cuff to the sleeve bottom, good sides together, with the cuff ends level with the placket edges. Sew it on.',
      { edges: ['cuff:sleeve edge', 'sleeve:hem'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, check: 'The cuff ends line up with the placket edges' }),
    s(P[12], 'Close the cuffs', 'Fold the inner cuff over the seam and edgestitch all round the cuff from the outside.',
      { stitch: 'edge', sa: 0.0625, lock: true }),
  );

  out.push(s(o.hem === 'straight' ? V.straightHem : P[13], 'Hem the bottom', o.hem === 'straight'
    ? `Fold the bottom edge ${sn(0.25)} under, then ${sn(0.75)} more. Press and sew close to the inner fold.`
    : `Fold the curved bottom edge ${sn(0.25)} under, then ${sn(0.25)} again. Sew slowly round the curves, easing the fabric.`,
    { edges: ['front:hem', 'back:hem'], stitch: 'edge', sa: 0.125, lock: true, check: 'Both fronts are the same length at the hem' }));

  out.push(
    s(P[14], 'Mark the buttonholes', `Mark up-and-down buttonholes on the right front band at the chalk marks, one across the ${mandarin ? 'band' : 'collar stand'}${half ? '' : ', one across each cuff half an inch from the end'}${o.collar === 'buttondown' ? ', and one at each collar point' : ''}.`,
      { stitch: 'none', check: 'Buttonholes are evenly spaced and centred' }),
    s(P[14], 'Sew the buttonholes', 'Make each buttonhole an eighth of an inch longer than the button. Try one on a scrap first. Open each with the seam ripper, with a pin across the end.',
      { stitch: 'buttonhole', foot: 'Buttonhole foot', check: 'The button goes through easily' }),
  );
  if (o.collar === 'buttondown') out.push(s(V.collarButtons, 'Collar point buttons', 'Button the collar points down onto the shirt, mark through the holes and sew two small buttons there.',
    { stitch: 'button' }));
  out.push(s(P[14], 'Sew on the buttons', 'Close the front, mark through each buttonhole onto the left band, and sew each button on with a doubled thread and a short thread stem.',
    { stitch: 'button', check: 'The fronts line up at the neck and the hem' }));
  out.push(P[15], P[16]);
  return fit ? out.map((st) => withSize(st, shirtSizes(o, fit)[st.cap])) : out;
}
