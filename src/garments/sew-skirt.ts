// Every stitch of the skirt and the dress, in sewing order.
// Skirt: seams ⅝″, elastic casing 1⅞″ (⅜″ turn-under + 1½″), hem 1¼″ (skirt.ts).
// Dress bodice: neck ⅜″, other seams ½″, centre back ¾″ for the zip; skirt joins at the waist with ⅝″.
import { sn } from '../core/units.js';
import { W } from '../chapters/scenes-b.js';
import { sew as s } from '../engine/sew';
import type { Options, Step } from '../engine/types';
import { neckFacingSteps, TUNIC_SA } from './sew-tunic';

const SA = 0.625, HEM = 1.25;

const gatherSteps = (where: string): Step[] => [
  s(W.gather, 'Sew gathering rows', `Sew two rows of long stitches along the waist edge of each skirt panel, ${sn(0.375)} and ${sn(0.625)} from the edge, stopping at the side seams. Leave long thread ends.`,
    { stitch: 'gather', sa: 0.375, check: 'Do not lock these stitches' }),
  s(W.gather, 'Pull up the gathers', `Hold both bottom threads and slide the fabric along until the skirt fits ${where}. Spread the gathers evenly and wind the threads round a pin.`,
    { stitch: 'none', check: 'The gathers are even all round' }),
];

const hemStep = (pieces: string[], flared: boolean) => s(W.skirtHem, 'Hem the skirt',
  () => `${flared ? `Sew a row of long stitches ${sn(HEM - 0.25)} from the bottom and pull it gently so the curved hem lies flat. ` : ''}Fold the bottom edge ${sn(0.25)} under, then ${sn(HEM - 0.25)} more. Press and sew close to the inner fold.`,
  { edges: pieces.map((p) => `${p}:hem`), stitch: 'edge', sa: 0.125, lock: true, check: 'The hem is level all round' });

export function skirtSteps(o: Options): Step[] {
  const gathered = o.style === 'gathered', band = o.waist === 'band';
  const out: Step[] = [
    s(W.edges, 'Stop fraying', 'Zigzag both side edges of the front and the back skirt.', { edges: ['skirtF:side', 'skirtB:side'], stitch: 'zigzag', sa: 0 }),
  ];
  if (gathered && band) out.push(...gatherSteps('the waistband'));
  if (band) out.push(
    s(W.skirtSidesZip, 'Sew the sides', 'Sew the right side seam from waist to hem. On the left side, sew from the hem up to the zip mark and lock the stitches. Tack the rest closed with long stitches.',
      { edges: ['skirtF:side', 'skirtB:side'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open' }),
    s(W.skirtSidesZip, 'Sew in the zip', 'Lay the zip face down on the pressed-open tacked seam, teeth on the seam. From the outside, sew down one side a quarter inch from the seam, across the bottom and up the other side. Then pull out the tacking.',
      { stitch: 'straight', sa: 0.25, foot: 'Zipper foot', lock: true, check: 'The zip opens and closes freely' }),
    s(W.waistbandSkirt, 'Prepare the band', `Iron interfacing on half of the waistband. Press it in half along its length, then press one long edge ${sn(SA)} to the wrong side.`,
      { pieces: ['wband'], stitch: 'fuse', press: 'Press the fold and the edge' }),
    s(W.waistbandSkirt, 'Band on the waist', 'Sew the unpressed edge of the band to the skirt waist, good sides together. Let one end stick out an inch and a quarter past the zip for the overlap.',
      { edges: ['skirtF:waist', 'skirtB:waist'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Trim the skirt seam to ⅜″', press: 'Press the band up' }),
    s(W.waistbandSkirt, 'Close the band', 'Fold each band end good sides together and sew across it, then turn it right side out. Fold the pressed edge over the seam inside and sew in the seam groove from the outside, catching it.',
      { stitch: 'ditch', on: 'In the seam groove', lock: true, check: 'The inner band is caught all round' }),
    s(W.waistbandSkirt, 'Hook and bar', 'Sew a hook under the overlap end and a bar on the other end of the band, so they meet.', { stitch: 'hand' }),
  );
  else out.push(
    s(W.skirtSides, 'Sew the sides', 'Put the front on the back, good sides together, and sew both side seams.',
      { edges: ['skirtF:side', 'skirtB:side'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open' }),
    s(W.elasticCasing, 'Fold the casing', `Turn the waist edge ${sn(0.375)} under and press. Fold it ${sn(1.5)} more to the inside and press.`,
      { stitch: 'none', press: 'Press both folds' }),
    s(W.elasticCasing, 'Sew the casing', 'Sew close to the lower fold all round, leaving a two inch gap at the back.',
      { edges: ['skirtF:waist', 'skirtB:waist'], stitch: 'edge', sa: 0.125, lock: true }),
    s(W.elasticCasing, 'Thread the elastic', 'Pin a safety pin to the elastic and push it round the casing. Overlap the ends one inch and zigzag them together in a box. Sew the gap closed.',
      { stitch: 'zigzag', on: 'A box over the overlap', lock: true, check: 'The elastic is not twisted' }),
    s(W.elasticCasing, 'Stitch at the sides', 'Spread the gathers evenly. At each side seam, sew down through the casing and the elastic, right in the seam groove, so the elastic cannot twist.',
      { stitch: 'ditch', on: 'In the side seam groove', lock: true }),
  );
  out.push(hemStep(['skirtF', 'skirtB'], o.style === 'aline'), W.press, W.doneSkirt);
  return out;
}

export function dressSteps(o: Options): Step[] {
  const sleeves = o.sleeve !== 'none', SB = TUNIC_SA.seam;
  const out: Step[] = [
    s(W.stay, 'Stay-stitch the neck', 'Sew one line just inside the neck curve on the front and both backs, from each shoulder towards the centre.',
      { edges: ['bfront:neck', 'bback:neck'], stitch: 'stay', sa: 0.25 }),
    s(W.edges, 'Stop fraying', `Zigzag the shoulders, the bodice sides, the centre back edges and the skirt sides${sleeves ? ', and both long edges of each sleeve' : ''}.`,
      { edges: ['bfront:shoulder', 'bback:shoulder', 'bfront:side', 'bback:side', 'bback:centre back', 'skirtF:side', 'skirtB:side', ...(sleeves ? ['sleeve:underarm'] : [])], stitch: 'zigzag', sa: 0 }),
    s(W.darts, 'Sew the waist darts', 'Fold each bodice dart along its middle so the chalk lines meet. Sew from the waist up to the point. Do not backstitch at the point.',
      { stitch: 'straight', on: 'On the chalk line', len: 2, lock: 'start', tie: true, press: 'Press towards the centre' }),
    s(W.shoulders, 'Join the shoulders', 'Lay the front on the backs, good sides together, and sew both shoulders.',
      { edges: ['bfront:shoulder', 'bback:shoulder'], join: 'Good sides together', stitch: 'straight', sa: SB, lock: true, press: 'Press the seams open' }),
    ...neckFacingSteps(o, { front: 'bfront', back: 'bback' }, 'zip'),
  ];
  if (sleeves) out.push(
    s(W.sleeves, 'Ease the sleeve top', 'Sew a row of long stitches along the curved top of each sleeve, just inside the sewing line.', { stitch: 'baste', sa: 0.375 }),
    s(W.sleeves, 'Sew in the sleeves', 'Match the sleeve top to the shoulder seam, good sides together, pull up the long stitches to fit, pin, and sew with the sleeve underneath.',
      { edges: ['sleeve:cap', 'bfront:armhole', 'bback:armhole'], join: 'Good sides together', stitch: 'straight', sa: SB, lock: true, trim: 'Zigzag the edges together', press: 'Press towards the sleeve' }),
  );
  else out.push(
    s(W.armBinding, 'Bind the armholes', 'Fold each binding strip in half, sew it to the good side of the armhole, trim and clip, understitch, turn it inside and topstitch.',
      { pieces: ['armbind'], edges: ['bfront:armhole', 'bback:armhole'], stitch: 'straight', sa: 0.375, lock: true, trim: 'Trim to ¼″ and clip the curve' }),
  );
  out.push(s(W.sides, 'Sew the bodice sides', `Sew ${sleeves ? 'from the sleeve end, through the underarm, and down' : 'down'} each bodice side to the waist.`,
    { edges: ['bfront:side', 'bback:side', ...(sleeves ? ['sleeve:underarm'] : [])], join: 'Good sides together', stitch: 'straight', sa: SB, lock: true, press: 'Press the seams open' }));
  if (sleeves) out.push(s(W.sleeveHem, 'Hem the sleeves', `Fold each sleeve end ${sn(0.25)} under, then ${sn(0.75)} more. Press and sew close to the inner fold.`,
    { edges: ['sleeve:hem'], stitch: 'edge', sa: 0.125, lock: true }));
  if (o.skirt === 'gathered') out.push(...gatherSteps('the bodice waist'));
  out.push(
    s(W.skirtSides, 'Sew the skirt sides', 'Put the skirt front on the back, good sides together, and sew both side seams.',
      { edges: ['skirtF:side', 'skirtB:side'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open' }),
    s(W.joinSkirt, 'Join skirt and top', 'Turn the bodice inside out and drop it inside the skirt, good sides together. Match the side seams and the centres, and sew round the waist with the gathered side on top.',
      { edges: ['bfront:hem', 'bback:hem', 'skirtF:waist', 'skirtB:waist'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, trim: 'Zigzag the edges together', press: 'Press towards the bodice', check: 'The side seams of top and skirt meet' }),
    s(W.backZip, 'Close the back seam', 'Sew the centre back seam from the skirt up to the zip mark and lock it. Tack the rest closed with long stitches and press it open.',
      { join: 'Good sides together', stitch: 'straight', sa: 0.75, lock: true, press: 'Press the seam open' }),
    s(W.backZip, 'Sew in the zip', 'Lay the zip face down on the tacked seam, teeth on the seam. From the outside, sew down one side a quarter inch from the seam, across the bottom and up the other side. Pull out the tacking.',
      { stitch: 'straight', sa: 0.25, foot: 'Zipper foot', lock: true, check: 'The zip opens and closes freely' }),
    s(W.backZip, 'Finish at the zip', 'Fold the ends of the neck strip inside next to the zip tape and sew them down by hand. Sew a small hook and eye at the top of the zip.',
      { stitch: 'hand', check: 'No raw edge shows at the neck' }),
    hemStep(['skirtF', 'skirtB'], o.skirt === 'aline'),
    W.press, W.doneDress,
  );
  return out;
}
