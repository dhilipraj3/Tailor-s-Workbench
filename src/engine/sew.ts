// Sewing detail carried by every step in the Sew section: which edges, how far from the edge,
// which stitch, lock or tie, trim, press, and a check before moving on.
// The same data drives the chips under the picture, the spoken instruction and the
// "no stitch missed" test (every cut edge of every piece must be covered by some step).
import { f, sn } from '../core/units.js';
import type { Step } from './types';

export type Stitch =
  | 'straight' | 'stay' | 'baste' | 'gather' | 'zigzag' | 'edge' | 'top' | 'under' | 'ditch'
  | 'bartack' | 'buttonhole' | 'button' | 'hand' | 'fuse' | 'none';

export interface SewDetail {
  /** pattern edges this step sews or finishes, as "pieceId:edge name" ("front:*" = every edge of that piece) */
  edges?: string[];
  /** whole pieces this step uses up (strips, facings, bags…) */
  pieces?: string[];
  /** how the layers go together, e.g. "Good sides together" */
  join?: string;
  stitch: Stitch;
  /** distance of the stitching from the cut edge (or from the fold for edge/top stitching), inches */
  sa?: number;
  /** where the stitching goes when it is not measured from an edge, e.g. "on the chalk line" */
  on?: string;
  /** stitch length in mm; a sensible default is used for each stitch type */
  len?: number;
  /** backstitch 3–4 stitches at both ends ("start" = only at the start, e.g. darts) */
  lock?: boolean | 'start';
  /** tie the thread ends in a knot instead of backstitching (dart points) */
  tie?: boolean;
  /** what to trim, grade, clip or notch afterwards */
  trim?: string;
  /** how to press afterwards */
  press?: string;
  /** what to check before going on */
  check?: string;
  /** presser foot to use */
  foot?: string;
}

/** stitch types that run along an edge, so they need a distance (sa) or a placement (on) */
export const SEAM_STITCHES: Stitch[] = ['straight', 'stay', 'baste', 'gather', 'zigzag', 'edge', 'top', 'under', 'ditch'];

const LEN: Partial<Record<Stitch, number>> = { straight: 2.5, stay: 2, baste: 4.5, gather: 4.5, zigzag: 2.5, edge: 2.5, top: 3, under: 2.5, ditch: 2.5 };
const NAME: Record<Stitch, string> = {
  straight: 'Straight stitch', stay: 'Stay-stitch', baste: 'Long tacking stitch', gather: 'Two rows of long stitches', zigzag: 'Zigzag',
  edge: 'Edgestitch', top: 'Topstitch', under: 'Understitch', ditch: 'Stitch in the ditch', bartack: 'Bartack', buttonhole: 'Buttonhole',
  button: 'Sew on by hand', hand: 'Hand stitch', fuse: 'Iron on', none: '',
};

export const stitchLen = (d: SewDetail) => d.len ?? LEN[d.stitch];

/** how far from the edge, as a short label */
function where(d: SewDetail) {
  if (d.on) return d.on;
  if (d.sa == null) return '';
  if (d.stitch === 'zigzag' && d.sa === 0) return 'On the raw edge';
  if (['edge', 'top', 'under', 'stay', 'baste'].includes(d.stitch)) return `${f(d.sa)} from edge`;
  return `${f(d.sa)} seam`;
}

/** short labels shown as chips under the picture */
export function detailChips(d?: SewDetail): string[] {
  if (!d || d.stitch === 'none' && !d.press && !d.check && !d.trim && !d.join) return [];
  const out: string[] = [];
  const w = where(d); if (w) out.push(w);
  if (d.join) out.push(d.join);
  if (d.stitch !== 'none') {
    const L = stitchLen(d);
    out.push(d.stitch === 'zigzag' ? `Zigzag 4 × ${L}` : L ? `${NAME[d.stitch]} ${L}` : NAME[d.stitch]);
  }
  if (d.lock === true) out.push('Lock both ends'); else if (d.lock === 'start') out.push('Lock the start');
  if (d.tie) out.push('Tie the threads');
  if (d.foot) out.push(d.foot);
  if (d.trim) out.push(d.trim);
  if (d.press) out.push(d.press);
  return out;
}

/** the same detail as a spoken sentence, appended to the step's own words */
export function detailSay(d?: SewDetail): string {
  if (!d) return '';
  const p: string[] = [];
  if (d.stitch !== 'none') {
    const L = stitchLen(d);
    let s = NAME[d.stitch] + (L ? `, length ${L}` : '');
    if (d.sa != null && SEAM_STITCHES.includes(d.stitch)) s += d.stitch === 'zigzag' && d.sa === 0 ? ', right on the raw edge' : `, ${sn(d.sa)} from the edge`;
    else if (d.on) s += `, ${d.on.toLowerCase()}`;
    p.push(s + '.');
  }
  if (d.foot) p.push(`Use the ${d.foot.toLowerCase()}.`);
  if (d.lock === true) p.push('Lock the stitches at both ends.'); else if (d.lock === 'start') p.push('Lock the stitches at the start only.');
  if (d.tie) p.push('Tie the thread ends in a knot.');
  if (d.trim) p.push(`Then ${d.trim.charAt(0).toLowerCase() + d.trim.slice(1)}.`);
  if (d.press) p.push(`${d.press}.`);
  if (d.check) p.push(`Check: ${d.check.charAt(0).toLowerCase() + d.check.slice(1)}.`);
  return p.join(' ');
}

type Pic = { svg: () => string };
type Say = string | (() => string);

/** Build a step from a picture, a caption, the words and the sewing detail. */
export function sew(pic: Pic, cap: string, say: Say, d: SewDetail): Step {
  const base = () => (typeof say === 'function' ? say() : say);
  return { cap, say: () => [base(), detailSay(d)].filter(Boolean).join(' '), text: base, svg: pic.svg, d };
}

/** every "piece:edge" a set of pieces needs covered (fold edges need nothing) */
export function edgeKeys(pieces: { id: string; simple?: boolean; outline: { edges: { name: string; allow: { fold?: boolean } }[] } }[]) {
  const keys = new Set<string>();
  for (const p of pieces) {
    if (p.simple) { keys.add(`${p.id}`); continue; }
    for (const e of p.outline.edges) if (!e.allow.fold) keys.add(`${p.id}:${e.name || '?'}`);
  }
  return keys;
}

/** which of those keys the steps leave uncovered */
export function uncovered(keys: Set<string>, steps: { d?: SewDetail }[]) {
  const edges = new Set<string>(), pieces = new Set<string>();
  for (const s of steps) { s.d?.edges?.forEach((e) => edges.add(e)); s.d?.pieces?.forEach((p) => pieces.add(p)); }
  return [...keys].filter((k) => {
    if (!k.includes(':')) return !pieces.has(k) && ![...edges].some((e) => e.startsWith(k + ':'));
    const [pid] = k.split(':');
    return !edges.has(k) && !edges.has(`${pid}:*`);
  });
}

/** Add a sentence with this person's sizes to a step: shown in the words and spoken before the sewing detail. */
export function withSize(st: Step, extra: string | undefined): Step {
  if (!extra) return st;
  const base = st.text ?? st.say;
  const text = () => `${typeof base === 'function' ? base() : base} ${extra}`;
  return { ...st, text, say: () => [text(), detailSay(st.d)].filter(Boolean).join(' ') };
}

/** width and height of a plain rectangle piece (its size already includes the sewing space) */
export function rectSize(p: { outline: { points(): [number, number][] } } | undefined) {
  if (!p) return null;
  const pts = p.outline.points(), xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

/** total length of the named edges of a piece */
export function edgeLen(p: { outline: { edges: { name: string; pts: [number, number][] }[] } } | undefined, name: string) {
  if (!p) return 0;
  return p.outline.edges.filter((e) => e.name === name).reduce((s, e) => s + e.pts.slice(1).reduce((t, q, i) => t + Math.hypot(q[0] - e.pts[i][0], q[1] - e.pts[i][1]), 0), 0);
}
