// Every stitch of the kurta / kurti / saree blouse, in sewing order.
// Seam widths come from the pattern (tunic.ts): neck ⅜″, shoulder/armhole/side/sleeve ½″,
// hems 1″ (1¼″ when longer than the hip), blouse front edges 1½″, sleeve hems 1″.
import { sn } from '../core/units.js';
import { W } from '../chapters/scenes-b.js';
import { sew as s } from '../engine/sew';
import type { Options, Step } from '../engine/types';

export const TUNIC_SA = { neck: 0.375, seam: 0.5, sleeveHem: 1, front: 1.5 };
export const tunicHem = (length: string) => (['thigh', 'knee', 'calf'].includes(length) ? 1.25 : 1);

/** Neckline finish with a folded facing strip (round, deep, boat, V). Shared with the dress. */
export function neckFacingSteps(o: Options, ids: { front: string; back: string }, endAt: 'ring' | 'placket' | 'zip' | 'front'): Step[] {
  // sharp points need pivoting and a clip right into the point: V-neck, the centre dip of a sweetheart, and the two corners of a square neck
  const v = o.neck === 'v' || o.neck === 'sweetheart', sq = o.neck === 'square', N = TUNIC_SA.neck;
  const point = v ? (o.neck === 'v' ? 'At the V point' : 'At the centre dip') : sq ? 'At each corner' : '';
  const neck = [`${ids.front}:neck`, `${ids.back}:neck`];
  const ends = endAt === 'ring' ? 'Join the two short ends of the strip into a ring first, with a ¼ inch seam, so it fits the neckline exactly.'
    : endAt === 'placket' ? 'Let each end of the strip stick out half an inch past the placket edge. Later you fold these ends inside.'
      : endAt === 'front' ? 'Let each end of the strip stick out half an inch past the front fold line. Later you fold these ends inside.'
      : 'Let each end of the strip stick out one inch past the zip line at the back. Later you fold these ends inside, next to the zip.';
  return [
    s(W.neckFacing, 'Fold the facing strip', 'Press the neck strip in half along its length, wrong sides together, so both long raw edges meet.', { pieces: ['neckbind'], stitch: 'none', press: 'Press a sharp fold' }),
    s(W.neckFacing, 'Sew the strip on', `${ends} Lay the strip on the good side of the neckline, raw edges together, and pin every inch.${point ? ` ${point}, stop with the needle down, lift the foot, turn the fabric and carry on.` : ''}`,
      { edges: neck, join: 'Raw edges together, on the good side', stitch: 'straight', sa: N, len: point ? 1.8 : 2.5, lock: true, check: point ? 'Both sides of the neckline are the same shape' : 'No pleats or tucks along the curve' }),
    s(W.neckFacing, 'Trim and clip', `Trim the seam to ${sn(0.25)}. Snip into the seam every half inch around the curve, up to the stitching but not through it.${point ? ` ${point}, snip right in, one thread short of the stitch.` : ''}`,
      { stitch: 'none', trim: 'Trim to ¼″ and clip the curve', check: 'No snip cuts the stitching' }),
    s(W.neckFacing, 'Understitch the facing', 'Press the strip and the seam away from the garment. Sew on the strip, close to the seam, catching the seam underneath. This keeps the facing from rolling out.',
      { stitch: 'under', sa: 0.125, lock: true }),
    s(W.neckFacing, 'Turn and topstitch', 'Turn the strip completely to the inside and press the neckline flat. Sew all round from the outside to hold it.',
      { stitch: 'top', sa: 0.25, lock: true, press: 'Press the neckline flat from inside' }),
  ];
}

export function tunicSteps(o: Options): Step[] {
  const SA = TUNIC_SA.seam, hemSA = tunicHem(o.length), sleeves = o.sleeve !== 'none';
  const blouse = o.opening === 'fronthooks', placket = o.opening === 'halfplacket', band = o.neck === 'band';
  const out: Step[] = [];

  if (blouse) {
    out.push(s(W.stay, 'Tack the lining on', 'Lay each lining piece on the wrong side of its matching blouse piece, wrong sides together, edges level. Tack them together all round with long stitches. From now on treat each pair as one piece.',
      { edges: ['frontL:*', 'backL:*', ...(sleeves ? ['sleeveL:*'] : [])], join: 'Wrong sides together', stitch: 'baste', sa: 0.25, check: 'The lining lies flat with no bubbles' }));
  }
  out.push(s(W.stay, 'Stay-stitch the neck', 'Before anything else, sew one line just inside the neck curve on the front and the back. Sew from each shoulder towards the centre. This stops the curve from stretching.',
    { edges: ['front:neck', 'back:neck'], stitch: 'stay', sa: 0.25, check: 'The neck curve has not stretched' }));
  out.push(s(W.edges, 'Stop fraying', `Zigzag the raw edges of the shoulders and side seams on the front and back${sleeves ? ', and both long edges of each sleeve' : ''}. Keep any extra cloth: zigzag its edge too, do not cut it off.`,
    { edges: ['front:shoulder', 'back:shoulder', 'front:side', 'back:side', ...(sleeves ? ['sleeve:underarm'] : [])], stitch: 'zigzag', sa: 0 }));

  if (o.darts === 'yes') {
    out.push(s(W.darts, 'Fold the darts', 'Fold each bust dart through its middle, good sides together, so its two chalk lines lie exactly on top of each other. Put a pin across the point.',
      { stitch: 'none', check: 'The chalk lines match on both layers' }));
    out.push(s(W.darts, 'Sew the darts', 'Sew from the wide end to the point along the chalk line. For the last half inch, sew right next to the fold and run off the edge. Do not backstitch at the point.',
      { edges: ['front:dart'], stitch: 'straight', on: 'On the chalk line', len: 2, lock: 'start', tie: true, press: 'Press bust darts down', check: 'The point is smooth, with no bubble' }));
  }
  if (o.fit === 'fitted') {
    out.push(s(W.darts, 'Sew the waist darts', 'Fold each waist dart along its middle and sew from one point to the other along the chalk lines, widest at the waist. Tie the threads at both points.',
      { stitch: 'straight', on: 'On the chalk lines', len: 2, tie: true, press: 'Press towards the centre' }));
  }

  if (placket) {
    out.push(
      s(W.placket, 'Iron on interfacing', 'Lay the interfacing, glue side down, on the wrong side of both placket strips. Press each part for ten seconds without sliding the iron.',
        { stitch: 'fuse', check: 'The interfacing is stuck down at every corner' }),
      s(W.placket, 'Fold the strips', 'Fold each strip in half along its length, wrong sides together, and press. Each strip is now one and a half inches wide.',
        { pieces: ['placket'], stitch: 'none', press: 'Press a sharp fold' }),
      s(W.placket, 'Sew strips to front', 'On the good side of the front, chalk a box one inch wide and nine inches long, centred on the placket line. Lay a strip on each side of the line, raw edges meeting at the line and folds facing out. Sew each strip along the side of the box, stopping exactly at the bottom of the box.',
        { join: 'Strip on the good side of the front', stitch: 'straight', sa: 0.5, lock: true, check: 'Both lines are the same length and end at the same level' }),
      s(W.placket, 'Cut the opening', 'From the wrong side, cut down the centre line to half an inch above the bottom of the box. Then snip diagonally into each bottom corner, right up to the last stitch but not through it.',
        { stitch: 'none', check: 'The cut reaches the last stitch of each line' }),
      s(W.placket, 'Turn the strips through', 'Push both strips through to the inside so they fill the opening. Press the seams towards the strips. The little triangle at the bottom folds up on the inside.',
        { stitch: 'none', press: 'Press seams towards the strips' }),
      s(W.placket, 'Edgestitch the strips', 'From the good side, sew along each strip right next to its seam.',
        { stitch: 'edge', sa: 0.0625, lock: true }),
      s(W.placket, 'Box the bottom', 'Lay the right strip over the left strip for men, left over right for women. Tuck the strip ends and the triangle inside. Sew a small box across the bottom through every layer, then a cross inside the box.',
        { stitch: 'straight', on: 'A box at the bottom', len: 2, lock: true, check: 'The strips lie flat and the opening is straight' }),
    );
  }

  if (o.back === 'keyhole') out.push(
    s(W.stay, 'Make the tie strings', `Press both long edges of each tie strip to the middle, fold it in half again and press. Tuck one end in. Sew along the open edge.`,
      { pieces: ['dori'], stitch: 'edge', sa: 0.0625, lock: true }),
    s(W.stay, 'Sew the keyhole facing', 'Lay the keyhole facing on the good side of the back, centred over the keyhole mark, good sides together. Sew a narrow U a quarter inch each side of the mark and across its bottom.',
      { pieces: ['keyface'], join: 'Good sides together', stitch: 'straight', sa: 0.25, len: 1.8, lock: true }),
    s(W.stay, 'Cut and turn keyhole', 'Cut down the middle of the U, then snip into both bottom corners up to the stitching. Turn the facing to the inside, understitch it and press. Topstitch round the opening.',
      { stitch: 'top', sa: 0.125, lock: true, trim: 'Clip into the corners', check: 'The keyhole lies flat and both sides match' }),
    s(W.stay, 'Tack the ties on', 'Tack one tie string at the top of each side of the keyhole, raw ends at the neck edge, so the neck facing will catch them.',
      { stitch: 'baste', sa: 0.25, check: 'Both ties point down into the back' }),
  );

  out.push(s(W.shoulders, 'Join the shoulders', 'Lay the front on the back, good sides together. Match the neck and armhole ends of each shoulder and pin. Sew both shoulders.',
    { edges: ['front:shoulder', 'back:shoulder'], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open', check: 'The neck edges meet exactly at the shoulder' }));

  if (band) {
    out.push(
      s(W.bandCollar, 'Interface the band', 'Iron interfacing on the wrong side of one band piece. This is the outer band.',
        { stitch: 'fuse' }),
      s(W.bandCollar, 'Sew the band pieces', `Press the neck edge of the plain band ${sn(0.375)} to the wrong side. Lay the two bands good sides together and sew along the top and both rounded ends. Leave the neck edge open.`,
        { edges: ['band:band edge'], join: 'Good sides together', stitch: 'straight', sa: TUNIC_SA.neck, lock: true, trim: 'Trim to ⅛″ and notch the curves', check: 'Both rounded ends match' }),
      s(W.bandCollar, 'Turn the band', 'Turn the band right side out. Push the curves out gently from inside and press flat.',
        { stitch: 'none', press: 'Press flat, seam exactly on the edge' }),
      s(W.bandCollar, 'Band on the neckline', 'Pin the open edge of the outer band to the neckline, good sides together, matching the centre back and with each end level with the placket edge. Sew it on. Snip the neckline curve every half inch.',
        { edges: ['band:neck', 'front:neck', 'back:neck'], join: 'Good sides together', stitch: 'straight', sa: TUNIC_SA.neck, lock: true, trim: 'Clip the neck curve', check: 'The band ends line up with the placket edges' }),
      s(W.bandCollar, 'Close the band', 'Fold the inner band down over the seam on the inside, its pressed edge just covering the stitching. Pin from the outside. Edgestitch all round the band, catching the inner band underneath.',
        { stitch: 'edge', sa: 0.0625, lock: true, check: 'The inner band is caught all the way round' }),
    );
  } else {
    out.push(...neckFacingSteps(o, { front: 'front', back: 'back' }, placket ? 'placket' : blouse ? 'front' : 'ring'));
    if (placket || blouse) out.push(s(W.neckFacing, 'Finish the strip ends', 'Fold the sticking-out ends of the neck strip to the inside and sew them down by hand with small stitches.',
      { stitch: 'hand', check: 'No raw edge shows at the opening' }));
  }

  if (sleeves) {
    out.push(
      s(W.sleeves, 'Ease the sleeve top', 'Sew a row of long stitches along the curved top of each sleeve, just inside the sewing line, between the two balance marks. Leave long thread ends.',
        { stitch: 'baste', sa: 0.375 }),
      s(W.sleeves, 'Pin in the sleeve', 'Lay the garment open, good side up. Match the top of the sleeve to the shoulder seam, good sides together, and the sleeve ends to the armhole ends. Pull the long stitches gently so the sleeve top fits the armhole, and pin every inch.',
        { join: 'Good sides together', stitch: 'none', check: 'There are no pleats, only a soft fullness at the top' }),
      s(W.sleeves, 'Sew in the sleeves', 'Sew the sleeve to the armhole with the sleeve underneath, so the machine eases it in. Go slowly round the curve.',
        { edges: ['sleeve:cap', 'front:armhole', 'back:armhole'], stitch: 'straight', sa: SA, lock: true, check: 'No tucks on the good side' }),
      s(W.sleeves, 'Finish the armholes', 'Zigzag the two seam edges together all round each armhole. Press the seam towards the sleeve.',
        { stitch: 'zigzag', sa: 0, press: 'Press towards the sleeve' }),
    );
  } else {
    out.push(
      s(W.armBinding, 'Fold the binding', 'Press each armhole binding strip in half along its length, wrong sides together.',
        { pieces: ['armbind'], stitch: 'none', press: 'Press a sharp fold' }),
      s(W.armBinding, 'Sew on the binding', 'Pin the binding to the good side of each armhole, raw edges together, and sew it on.',
        { edges: ['front:armhole', 'back:armhole'], join: 'Raw edges together, on the good side', stitch: 'straight', sa: 0.375, lock: true, trim: 'Trim to ¼″ and clip the curve' }),
      s(W.armBinding, 'Turn and topstitch', 'Understitch the binding, then turn it fully inside, press, and topstitch all round from the outside.',
        { stitch: 'top', sa: 0.25, lock: true, press: 'Press the armhole flat' }),
    );
  }

  out.push(s(o.slits === 'yes' ? W.sidesSlit : W.sides, o.slits === 'yes' ? 'Sides down to slits' : 'Sew the sides',
    `${sleeves ? 'Fold the garment good sides together. Starting at the sleeve end, sew along the sleeve, through the underarm, and down the side' : 'Fold the garment good sides together and sew down each side from the armhole'} ${o.slits === 'yes' ? 'until the slit mark. Stop there and lock the stitches.' : 'to the hem.'}`,
    { edges: ['front:side', 'back:side', ...(sleeves ? ['sleeve:underarm'] : [])], join: 'Good sides together', stitch: 'straight', sa: SA, lock: true, press: 'Press the seams open',
      check: sleeves ? 'The armhole seams meet exactly at the underarm' : 'Both sides are the same length' }));

  if (sleeves) out.push(s(W.sleeveHem, 'Hem the sleeves', `Fold the end of each sleeve ${sn(0.25)} to the inside and press, then fold again ${sn(TUNIC_SA.sleeveHem - 0.25)} and press. Sew close to the inner fold.`,
    { edges: ['sleeve:hem'], stitch: 'edge', sa: 0.125, lock: true, check: 'The underarm seam lines up inside the hem' }));

  if (o.slits === 'yes') out.push(
    s(W.slitFinish, 'Fold the slit edges', `Below the slit mark, fold each raw edge ${sn(0.25)} under, then fold again so the fold meets the seam line. Press.`,
      { stitch: 'none', press: 'Press both folds' }),
    s(W.slitFinish, 'Stitch around the slit', 'From the inside, sew down one side of the slit close to the fold, across the top just below the seam end, and up the other side, in one U-shaped line.',
      { stitch: 'edge', sa: 0.125, lock: true }),
    s(W.slitFinish, 'Bartack the slit top', 'Sew a short, tight zigzag across the top of the slit to stop it tearing.',
      { stitch: 'bartack', check: 'The slit top is strong and flat' }),
  );

  out.push(s(o.fit === 'aline' ? W.curvedHem : W.hem, 'Hem the bottom',
    () => `${o.fit === 'aline' ? `Sew a row of long stitches ${sn(hemSA - 0.25)} from the bottom edge, and pull it gently so the curved hem lies flat when folded. ` : ''}Fold the bottom edge ${sn(0.25)} to the inside and press, then fold again ${sn(hemSA - 0.25)} and press. Sew close to the inner fold.`,
    { edges: ['front:hem', 'back:hem'], stitch: 'edge', sa: 0.125, lock: true, check: 'The side seams line up and the hem is level all round' }));

  if (blouse) out.push(
    s(W.hooks, 'Fold the front edges', `Fold each front edge ${sn(0.5)} to the inside, then ${sn(1)} more, and press. Sew close to the inner fold, from the neck to the hem.`,
      { edges: ['front:front opening'], stitch: 'edge', sa: 0.125, lock: true, check: 'Both fronts are the same width' }),
    s(W.hooks, 'Sew on the hooks', 'On the inside of the right front, sew a hook an eighth of an inch back from the edge, every inch from the neck to the hem. Sew through the folded edge only, so no stitches show outside.',
      { stitch: 'hand', check: 'Every hook head sits just inside the edge' }),
    s(W.hooks, 'Sew on the eyes', 'Close the blouse edge to edge. Mark where each hook meets the left front, and sew a metal eye or a thread loop there, just sticking out past the edge.',
      { stitch: 'hand', check: 'The fronts meet edge to edge with no gap' }),
  );

  if (placket || band) out.push(
    s(W.buttons, 'Mark the buttonholes', `Mark ${band ? 'one buttonhole across the band, half an inch from its end, and ' : ''}${placket ? 'up-and-down buttonholes in the middle of the top placket strip: the first half an inch below the neck seam, the last one inch above the box, the rest evenly between' : ''}.`,
      { stitch: 'none', check: 'Buttonholes are evenly spaced and in a straight line' }),
    s(W.buttons, 'Sew the buttonholes', 'Make each buttonhole an eighth of an inch longer than the button. Try one on a scrap with interfacing first. Open each one with the seam ripper, with a pin across the end so you do not cut too far.',
      { stitch: 'buttonhole', foot: 'Buttonhole foot', check: 'The button slides through easily' }),
    s(W.buttons, 'Sew on the buttons', 'Close the opening and mark through each buttonhole onto the other strip. Sew each button on with a doubled thread, four times through each hole, then wind the thread round under the button to make a short stem.',
      { stitch: 'button', check: 'Each button lines up with its buttonhole' }),
  );

  out.push(W.press, W.doneTunic(o.length));
  return out;
}
