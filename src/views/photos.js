// Which product photo to show for a design with the options someone has chosen.
// Photos exist for each design's own options and, over time, for one visible option changed at a time.
import LIST from '../photos.json';
import { GARMENTS } from '../garments/index';

/** options you can see in a front photo (the back, darts or back pockets do not change the picture) */
export const VISIBLE = {
  shirt: ['collar', 'sleeve', 'fit', 'pockets', 'hem'],
  trousers: ['front', 'fit', 'pocket', 'hem'],
  tunic: ['neck', 'sleeve', 'length', 'fit', 'opening', 'slits'],
  pants: ['style', 'waist'],
  skirt: ['style', 'length', 'waist'],
  dress: ['neck', 'sleeve', 'skirt', 'length'],
};

/** the options a photo file shows */
function photoOptions(design, name) {
  if (name === design.id) return { ...design.options };
  const rest = name.slice(design.id.length + 2), cut = rest.indexOf('-');
  return { ...design.options, [rest.slice(0, cut)]: rest.slice(cut + 1) };
}

const label = (g, k, v) => {
  const grp = GARMENTS[g].options.find((x) => x.id === k);
  return { group: grp?.label || k, value: grp?.values.find((x) => x.id === v)?.label || v };
};

/**
 * The photo closest to these options, and what differs from them (visible options only).
 * Returns null when the design has no photo at all.
 */
export function closestPhoto(design, opts) {
  const names = LIST.filter((n) => n === design.id || n.startsWith(design.id + '--'));
  if (!names.length) return null;
  const keys = VISIBLE[design.garment] || Object.keys(design.options);
  let best = null;
  for (const n of names) {
    const o = photoOptions(design, n), diff = keys.filter((k) => (o[k] ?? '') !== (opts[k] ?? ''));
    if (!best || diff.length < best.diff.length || (diff.length === best.diff.length && n === design.id)) best = { n, o, diff };
  }
  return {
    src: `img/designs/${best.n}.jpg`,
    exact: best.diff.length === 0,
    diff: best.diff.map((k) => ({ group: label(design.garment, k, '').group, photo: label(design.garment, k, best.o[k]).value, yours: label(design.garment, k, opts[k]).value })),
  };
}

export const hasPhoto = (id) => LIST.includes(id);
