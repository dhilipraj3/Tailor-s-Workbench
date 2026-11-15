import type { Design, Garment } from '../engine/types';
import { SHIRT } from './shirt';
import { TROUSERS } from './trousers';
import { TUNIC } from './tunic';
import { PANTS } from './pants';
import { SKIRT, DRESS } from './skirt';

export const GARMENTS: Record<string, Garment> = { shirt: SHIRT, trousers: TROUSERS, tunic: TUNIC, pants: PANTS, skirt: SKIRT, dress: DRESS };

/** The design catalogue: each design is a base garment plus a set of options.
 *  Options and colours match each design's product photo (public/img/designs/<id>.jpg); colours are measured from the photo. */
export const DESIGNS: Design[] = [
  { id: 'formal-shirt', garment: 'shirt', name: 'Classic formal shirt', for: 'man', tags: ['men', 'shirt', 'formal'], level: 4, hours: 8, color: '#bdd2e9',
    options: { collar: 'classic', sleeve: 'full', fit: 'regular', pockets: '1', hem: 'curved', backPleat: 'none' } },
  { id: 'slim-formal-shirt', garment: 'shirt', name: 'Slim formal shirt', for: 'man', tags: ['men', 'shirt', 'formal'], level: 4, hours: 8, color: '#c8dbf0',
    options: { collar: 'spread', sleeve: 'full', fit: 'slim', pockets: '0', hem: 'curved', backPleat: 'none' } },
  { id: 'oxford-shirt', garment: 'shirt', name: 'Button-down shirt', for: 'man', tags: ['men', 'shirt', 'formal', 'casual'], level: 4, hours: 9, color: '#c0d2e7',
    options: { collar: 'buttondown', sleeve: 'full', fit: 'regular', pockets: '1', hem: 'curved', backPleat: 'box' } },
  { id: 'band-collar-shirt', garment: 'shirt', name: 'Band collar shirt', for: 'man', tags: ['men', 'shirt', 'casual', 'indian'], level: 3, hours: 7, color: '#c6d9ec',
    options: { collar: 'mandarin', sleeve: 'full', fit: 'regular', pockets: '0', hem: 'curved', backPleat: 'none' } },
  { id: 'half-sleeve-shirt', garment: 'shirt', name: 'Half-sleeve shirt', for: 'man', tags: ['men', 'shirt', 'casual'], level: 3, hours: 6, color: '#bed2eb',
    options: { collar: 'classic', sleeve: 'half', fit: 'regular', pockets: '1', hem: 'straight', backPleat: 'none' } },
  { id: 'two-pocket-shirt', garment: 'shirt', name: 'Two-pocket shirt', for: 'man', tags: ['men', 'shirt', 'casual'], level: 3, hours: 7, color: '#b6cde5',
    options: { collar: 'classic', sleeve: 'half', fit: 'regular', pockets: '2', hem: 'straight', backPleat: 'box' } },
  { id: 'formal-trousers', garment: 'trousers', name: 'Formal trousers', for: 'man', tags: ['men', 'trousers', 'formal'], level: 4, hours: 7, color: '#585858',
    options: { front: 'flat', fit: 'regular', pocket: 'slant', backPockets: '2', loops: 'yes', hem: 'plain' } },
  { id: 'slim-trousers', garment: 'trousers', name: 'Slim fit trousers', for: 'man', tags: ['men', 'trousers', 'formal', 'casual'], level: 4, hours: 7, color: '#484849',
    options: { front: 'flat', fit: 'slim', pocket: 'slant', backPockets: '1', loops: 'yes', hem: 'plain' } },
  { id: 'pleated-trousers', garment: 'trousers', name: 'Pleated trousers', for: 'man', tags: ['men', 'trousers', 'formal'], level: 5, hours: 8, color: '#535354',
    options: { front: 'pleated', fit: 'regular', pocket: 'slant', backPockets: '2', loops: 'yes', hem: 'turnup' } },
  { id: 'side-pocket-trousers', garment: 'trousers', name: 'Side-pocket trousers', for: 'man', tags: ['men', 'trousers', 'casual'], level: 3, hours: 6, color: '#57544f',
    options: { front: 'flat', fit: 'regular', pocket: 'side', backPockets: '0', loops: 'no', hem: 'plain' } },
  // ---- men: Indian wear ----
  { id: 'kurta', garment: 'tunic', for: 'man', name: 'Classic kurta', tags: ['men', 'indian', 'casual'], level: 3, hours: 6, color: '#ebe2d0',
    options: { neck: 'band', sleeve: 'full', length: 'knee', fit: 'straight', slits: 'yes', darts: 'no', back: 'plain', opening: 'halfplacket' } },
  { id: 'short-kurta', garment: 'tunic', for: 'man', name: 'Short kurta', tags: ['men', 'indian', 'casual'], level: 2, hours: 5, color: '#8e9c85',
    options: { neck: 'round', sleeve: 'full', length: 'knee', fit: 'straight', slits: 'yes', darts: 'no', back: 'plain', opening: 'halfplacket' } },
  { id: 'pyjama', garment: 'pants', for: 'man', name: 'Pyjama', tags: ['men', 'indian', 'casual', 'easy'], level: 1, hours: 3, color: '#ded8c7',
    options: { style: 'pyjama', waist: 'drawstring', pockets: 'none' } },
  { id: 'men-shorts', garment: 'pants', for: 'man', name: 'Elastic shorts', tags: ['men', 'casual', 'easy'], level: 1, hours: 2, color: '#66664c',
    options: { style: 'shorts', waist: 'elastic', pockets: 'side' } },
  // ---- women ----
  { id: 'aline-kurti', garment: 'tunic', for: 'woman', name: 'A-line kurti', tags: ['women', 'indian', 'casual'], level: 3, hours: 6, color: '#ad3e50',
    options: { neck: 'round', sleeve: 'threequarter', length: 'calf', fit: 'aline', slits: 'no', darts: 'yes', back: 'plain', opening: 'halfplacket' } },
  { id: 'straight-kurti', garment: 'tunic', for: 'woman', name: 'Straight kurti', tags: ['women', 'indian', 'casual'], level: 3, hours: 6, color: '#267078',
    options: { neck: 'v', sleeve: 'threequarter', length: 'knee', fit: 'straight', slits: 'yes', darts: 'yes', back: 'plain', opening: 'none' } },
  { id: 'saree-blouse', garment: 'tunic', for: 'woman', name: 'Saree blouse', tags: ['women', 'indian', 'formal'], level: 4, hours: 5, color: '#b17e3c',
    options: { neck: 'deep', sleeve: 'short', length: 'crop', fit: 'fitted', slits: 'no', darts: 'yes', back: 'deepu', opening: 'fronthooks' } },
  { id: 'salwar', garment: 'pants', for: 'woman', name: 'Salwar', tags: ['women', 'indian', 'easy'], level: 2, hours: 3, color: '#d6bfa5',
    options: { style: 'salwar', waist: 'drawstring', pockets: 'none' } },
  { id: 'churidar', garment: 'pants', for: 'woman', name: 'Churidar', tags: ['women', 'indian'], level: 2, hours: 3, color: '#bb99b7',
    options: { style: 'churidar', waist: 'elastic', pockets: 'none' } },
  { id: 'palazzo', garment: 'pants', for: 'woman', name: 'Palazzo', tags: ['women', 'casual', 'easy'], level: 1, hours: 3, color: '#404860',
    options: { style: 'palazzo', waist: 'elastic', pockets: 'side' } },
  { id: 'aline-skirt', garment: 'skirt', for: 'woman', name: 'A-line skirt', tags: ['women', 'casual', 'formal'], level: 2, hours: 4, color: '#643b5f',
    options: { style: 'aline', length: 'knee', waist: 'band' } },
  { id: 'maxi-skirt', garment: 'skirt', for: 'woman', name: 'Gathered maxi skirt', tags: ['women', 'casual', 'easy'], level: 1, hours: 3, color: '#b45a37',
    options: { style: 'gathered', length: 'maxi', waist: 'elastic' } },
  { id: 'simple-dress', garment: 'dress', for: 'woman', name: 'Simple dress', tags: ['women', 'casual'], level: 4, hours: 7, color: '#83acc9',
    options: { neck: 'round', sleeve: 'short', skirt: 'gathered', length: 'midi' } },
  // ---- kids ----
  { id: 'kids-frock', garment: 'dress', for: 'child', name: "Girls' frock", tags: ['kids', 'casual'], level: 3, hours: 4, color: '#e8a4b0',
    options: { neck: 'round', sleeve: 'short', skirt: 'gathered', length: 'knee' } },
  { id: 'kids-shorts', garment: 'pants', for: 'child', name: "Kids' shorts", tags: ['kids', 'casual', 'easy'], level: 1, hours: 2, color: '#54728e',
    options: { style: 'shorts', waist: 'drawstring', pockets: 'side' } },
  { id: 'kids-pyjama', garment: 'pants', for: 'child', name: "Kids' pyjama", tags: ['kids', 'indian', 'easy'], level: 1, hours: 2, color: '#e1d8c3',
    options: { style: 'pyjama', waist: 'elastic', pockets: 'none' } },
  { id: 'kids-kurta', garment: 'tunic', for: 'child', name: "Kids' kurta", tags: ['kids', 'indian'], level: 2, hours: 4, color: '#f9b339',
    options: { neck: 'band', sleeve: 'full', length: 'knee', fit: 'straight', slits: 'yes', darts: 'no', back: 'plain', opening: 'halfplacket' } },
  { id: 'kids-shirt', garment: 'shirt', for: 'child', name: "Kids' shirt", tags: ['kids', 'casual'], level: 3, hours: 5, color: '#b2cde5',
    options: { collar: 'classic', sleeve: 'half', fit: 'regular', pockets: '1', hem: 'straight', backPleat: 'none' } },
];

export const FILTERS = [
  { id: 'all', label: 'All' }, { id: 'men', label: 'Men' }, { id: 'women', label: 'Women' }, { id: 'kids', label: 'Kids' },
  { id: 'indian', label: 'Indian' }, { id: 'formal', label: 'Formal' }, { id: 'casual', label: 'Casual' }, { id: 'easy', label: 'Easy first' },
];
