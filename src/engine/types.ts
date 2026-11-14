import type { Outline, Pt } from './geometry';

export type Measurements = Record<string, number>;
export type Options = Record<string, string>;

export type Mark =
  | { k: 'line'; a: Pt; b: Pt; style?: 'mark' | 'guide' }
  | { k: 'path'; d: string; style?: 'mark' | 'guide' }
  | { k: 'btn'; p: Pt }
  | { k: 'text'; p: Pt; t: string };

export interface Piece {
  id: string;
  name: string;
  /** how many to cut */
  n: number;
  /** cut with the left (x = 0) edge on the fabric fold */
  fold?: boolean;
  /** cut as a left/right pair (fabric folded, two layers) */
  mirror?: boolean;
  fabric: 'main' | 'lining';
  /** also cut this piece in fusible interfacing */
  interfacing?: boolean;
  outline: Outline;
  marks: Mark[];
  grain?: [Pt, Pt];
  note?: string;
  /** small rectangles whose size already includes sewing space */
  simple?: boolean;
}

export interface OptionValue { id: string; label: string; say?: string }
export interface OptionGroup {
  id: string;
  label: string;
  /** part of the sketch shown on each choice tile: [x, y, w, h] in sketch units */
  crop?: [number, number, number, number];
  values: OptionValue[];
}

export interface Supply { icon: string; qty: string; say: string }

export interface Step { cap: string; say: string | (() => string); svg: () => string; field?: string; d?: import('./sew').SewDetail; sec?: string;
  /** the written instruction shown on screen (without the spoken sewing detail, which shows as chips) */
  text?: string | (() => string) }

export interface Garment {
  id: string;
  name: string;
  measureKeys: string[];
  options: OptionGroup[];
  draft(m: Measurements, o: Options): Piece[];
  steps(o: Options): Step[];
  supplies(m: Measurements, o: Options): Supply[];
  /** flat technical sketch; returns inner SVG for viewBox VIEWBOX */
  sketch(o: Options): string;
  viewBox: string;
}

export interface Design {
  id: string;
  garment: string;
  name: string;
  tags: string[];
  options: Options;
  /** 1 easy … 5 hard */
  level: number;
  hours: number;
  /** who it is made for (picks the default person) */
  for?: 'man' | 'woman' | 'child';
  /** fabric colour for the sketch */
  color?: string;
}
