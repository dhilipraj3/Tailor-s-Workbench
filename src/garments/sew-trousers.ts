// Every stitch of the trousers, in sewing order. Seams ⅝″ (trousers.ts), hem 1½″ (turn-up 4½″).
// Order follows tailoring practice: pockets and fly while the pieces are flat, then sides, inside legs,
// waistband halves, and the seat seam last, sewn up through the waistband so it can be let out later.
import { sn } from '../core/units.js';
import { SEW_PANT } from '../chapters/sew.js';
import { V } from '../chapters/variants.js';
import { sew as s } from '../engine/sew';
import type { Options, Step } from '../engine/types';

const SA = 0.625;

export function trouserSteps(o: Options): Step[] {
  const P = SEW_PANT, bp = +o.backPockets, slant = o.pocket !== 'side';
  const out: Step[] = [];

  out.push(
    s(P[0], 'Iron on interfacing', `Iron the interlining onto the wrong side of both waistband pieces${bp ? ', and a strip one inch wide behind each back pocket line' : ''}. Lift and press, do not slide.`,
      { stitch: 'fuse' }),
    s(P[0], 'Stop fraying', 'Zigzag the side, inside-leg and crotch edges of all four trouser pieces, one long edge of the fly facing, and the bottom edge of each pocket facing.',
      { edges: ['tfront:side', 'tfront:inseam', 'tfront:front crotch', 'tback:side', 'tback:inseam', 'tback:seat seam'], stitch: 'zigzag', sa: 0, check: 'Keep any extra cloth: zigzag its edge, do not cut it' }),
    s(P[1], 'Sew the back darts', 'Fold each back dart along its middle so the chalk lines meet. Sew from the waist to the point. Do not backstitch at the point.',
      { stitch: 'straight', on: 'On the chalk line', len: 2, lock: 'start', tie: true, press: 'Press towards the centre back' }),
  );

  if (bp) out.push(
    s(V.welt, 'Fold the welts', 'Fold each welt strip in half along its length, wrong sides together, and press.', { pieces: ['welt'], stitch: 'none', press: 'Press a sharp fold' }),
    s(V.welt, 'Place welt and bag', 'On the good side of the back, lay the welt just below the pocket line, raw edges on the line and the fold pointing down. Lay one pocket bag above the line, good side down, its edge on the line.',
      { stitch: 'none', check: 'Both pieces reach past each end of the pocket line' }),
    s(V.welt, 'Sew the two lines', 'Sew the welt and the bag on with two lines exactly the pocket length, each a quarter inch from the pocket line. Start and stop exactly at the end marks.',
      { stitch: 'straight', sa: 0.25, len: 2, lock: true, check: 'Both lines are exactly the same length' }),
    s(V.welt, 'Cut the Y', 'From the wrong side, cut along the pocket line between the two stitch lines, stopping half an inch from each end. Then snip diagonally to the last stitch of each line, making a Y at each end.',
      { stitch: 'none', check: 'The snips reach the stitches but do not cut them' }),
    s(V.welt, 'Turn through', 'Push the bag and the welt through to the inside. The welt fills the opening from below. Press.',
      { stitch: 'none', press: 'Press the opening flat' }),
    s(V.welt, 'Sew the triangles', 'Fold the back away and sew across each little triangle at the ends, through the welt and bag, three times.',
      { stitch: 'straight', on: 'Across the triangle base', len: 1.8, lock: true }),
    s(V.welt, 'Close the pocket bag', 'Lay the second pocket bag on the first, good sides together, and sew round the three sides. Zigzag the edges.',
      { pieces: ['bbag'], join: 'Good sides together', stitch: 'straight', sa: 0.375, lock: true, trim: 'Zigzag the bag edges' }),
    s(V.welt, 'Pocket button', 'Make a buttonhole across the back, centred half an inch above the opening, through the back and the bag. Sew a button on the welt below it.',
      { stitch: 'buttonhole', foot: 'Buttonhole foot' }),
  );

  if (slant) out.push(
    s(P[2], 'Facing on the bag', 'Lay each pocket facing on the good side of a back pocket bag, edges level at the top and side. Sew along its zigzagged bottom edge.',
      { pieces: ['pfacing'], stitch: 'straight', sa: 0.25, lock: true }),
    s(P[2], 'Bag on the slant', 'Lay a plain pocket bag on each front, good sides together, along the slanted pocket edge. Sew along the slant.',
      { join: 'Good sides together', stitch: 'straight', sa: 0.375, lock: true, trim: 'Trim to ¼″' }),
    s(P[2], 'Understitch and turn', 'Press the bag away from the front and understitch it. Turn the bag to the inside and press. Topstitch along the slant from the outside.',
      { stitch: 'top', sa: 0.25, lock: true, press: 'Press the slant edge flat' }),
    s(P[2], 'Close the front bags', 'Lay the faced bag under each opening, matching the waist and side edges. Sew the two bag layers together round the bottom with a French seam: first wrong sides together a quarter inch, then turn and sew three eighths of an inch. Tack the bag tops to the waist and side.',
      { pieces: ['pbag'], stitch: 'straight', sa: 0.375, lock: true, check: 'The opening lies flat when the side edge is matched' }),
  );
  else out.push(
    s(V.sidePocket, 'Bags on the sides', 'Sew a pocket bag to the side edge of each front and each back at the pocket marks, good sides together. Press the bags outwards and understitch the front bags.',
      { pieces: ['pbag', 'pfacing'], join: 'Good sides together', stitch: 'straight', sa: 0.375, lock: true, press: 'Press the bags outwards' }),
  );

  if (o.front === 'pleated') out.push(s(V.pleats, 'Fold the front pleats', 'Fold each pleat at its marks towards the side seam and tack across the top.',
    { stitch: 'baste', sa: 0.25, check: 'Both fronts have matching pleats' }));

  out.push(
    s(P[3], 'Make the fly shield', 'Fold the fly shield in half along its length, good sides together, and sew across the bottom end. Turn it right side out, press, and zigzag the long raw edges together.',
      { pieces: ['flyS'], stitch: 'straight', sa: 0.375, lock: true, press: 'Press flat' }),
    s(P[3], 'Facing on the left front', 'Sew the fly facing to the fly edge of the left front, good sides together, from the waist down to the zip mark. Understitch it, fold it to the inside and press.',
      { pieces: ['flyF'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the facing inside' }),
    s(P[3], 'Sew to the zip mark', 'Put the two fronts together, good sides facing. Sew the front crotch curve from the inside leg up to the zip mark. Sew a second line on top for strength.',
      { edges: ['tfront:front crotch'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, check: 'Both inside-leg ends meet exactly' }),
    s(P[4], 'Zip on the facing', 'Lay the zip face down on the left facing, its teeth a quarter inch from the folded edge and its stop just above the zip mark. Sew down both sides of that zip tape.',
      { stitch: 'straight', sa: 0.25, foot: 'Zipper foot', lock: true }),
    s(P[5], 'Sew the J line', 'From the outside, chalk a J one and a quarter inches from the left fly edge, curving into the crotch seam at the bottom. Sew along it through the front and the facing only.',
      { stitch: 'top', sa: 1.25, len: 3, lock: true, check: 'The curve is smooth and does not catch the zip teeth' }),
    s(P[4], 'Zip to the right front', `Press the right front fly edge ${sn(0.375)} to the inside. Lay it over the other zip tape with the fly shield behind, and sew close to the fold through the front, the zip and the shield.`,
      { edges: ['tfront:fly'], stitch: 'edge', sa: 0.0625, foot: 'Zipper foot', lock: true, check: 'The left front covers the zip when closed' }),
    s(P[5], 'Bartack the fly', 'Sew a short, tight zigzag at the bottom of the J line through all the layers, and another where the crotch seam starts.',
      { stitch: 'bartack' }),
  );

  out.push(
    s(P[6], 'Sew the sides', 'Put a front on a back, good sides together. Sew down the side from the waist to the bottom.',
      { edges: ['tfront:side', 'tback:side'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open', check: 'The pocket opening lies flat' }),
    s(P[7], 'Sew the inside legs', 'Sew each inside-leg seam from the bottom up to the crotch, matching the knee marks.',
      { edges: ['tfront:inseam', 'tback:inseam'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open', check: 'The knee marks meet' }),
  );

  if (o.loops === 'yes') out.push(
    s(P[10], 'Make the belt loops', 'Fold the long strip in three along its length and press. Edgestitch both long edges. Cut it into seven equal pieces.',
      { pieces: ['loops'], stitch: 'edge', sa: 0.0625, lock: true }),
    s(P[10], 'Tack the loops on', 'Pin the loops at the waist, raw ends at the top edge: two at the front over the creases, two just behind the side seams, three across the back. Tack them a quarter inch from the edge.',
      { stitch: 'baste', sa: 0.25 }),
  );

  out.push(
    s(P[11], 'Prepare the waistband', `Press each waistband piece in half along the fold line, then press its inner edge ${sn(SA)} to the wrong side.`,
      { stitch: 'none', press: 'Press the fold and the inner edge' }),
    s(P[11], 'Band to the waist', 'Sew the outer edge of each waistband piece to the waist of its trouser half, good sides together. On the left, let the band stick out past the fly edge by its extension.',
      { edges: ['band:waist', 'tfront:waist', 'tback:waist'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the band up' }),
    s(P[8], 'Sew the seat seam', 'Turn one leg right side out and put it inside the other. Sew from the bottom of the fly, under the crotch, up the back seat seam and right through the waistband. Sew the curved part twice.',
      { edges: ['tback:seat seam', 'band:centre back'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Trim only the curve under the crotch to ⅜″', press: 'Press the upper back seam open' }),
    s(P[9], 'Try them on', 'Try the trousers on. If they are loose or tight, change the back seam or the side seams now, using the extra cloth, before you finish the waistband.',
      { stitch: 'none', check: 'Comfortable when sitting and standing' }),
    s(P[11], 'Finish the band ends', 'At each front end, fold the waistband good sides together and sew across the end. Trim the corner and turn it right side out.',
      { edges: ['band:overlap end'], stitch: 'straight', sa: SA, lock: true, trim: 'Cut the corners across' }),
    s(P[11], 'Close the waistband', 'Pin the pressed inner edge over the seam on the inside. From the outside, sew right in the groove of the waistband seam so it hides, catching the inner edge.',
      { edges: ['band:inner edge'], stitch: 'ditch', on: 'In the seam groove', len: 3, lock: true, check: 'The inner band is caught all the way round' }),
  );
  if (o.loops === 'yes') out.push(s(P[10], 'Finish the loops', 'Fold the top of each loop down to the top of the waistband, tuck the raw end under, and bartack it.',
    { stitch: 'bartack' }));
  out.push(s(P[11], 'Hook, bar and button', 'Sew the hook on the inside of the left waistband end and the bar on the right, so they meet. Sew the button on the inside extension and make its buttonhole in the shield end.',
    { stitch: 'hand', check: 'The waistband closes flat' }));

  out.push(o.hem === 'turnup'
    ? s(V.turnup, 'Fold the turn-ups', 'Zigzag the bottom edge. Fold the bottom up three inches to the inside, then fold one and a half inches back to the outside to make the turn-up. Sew the inside fold by hand and tack the turn-up at both seams.',
      { edges: ['tfront:hem', 'tback:hem'], stitch: 'hand', check: 'Both legs are the same length' })
    : s(P[12], 'Hem the legs', `Zigzag the bottom edge. Fold it up ${sn(1.5)}, press, and sew it by hand with tiny stitches that do not show outside.`,
      { edges: ['tfront:hem', 'tback:hem'], stitch: 'hand', check: 'Both legs are the same length' }));
  out.push(P[13], P[14]);
  return out;
}
