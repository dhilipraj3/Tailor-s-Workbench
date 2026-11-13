import type { Design, Garment } from '../engine/types';
import { SHIRT } from './shirt';
import { TROUSERS } from './trousers';

export const GARMENTS: Record<string, Garment> = { shirt: SHIRT, trousers: TROUSERS };

/** The design catalogue: each design is a base garment plus a set of options. */
export const DESIGNS: Design[] = [
  { id: 'formal-shirt', garment: 'shirt', name: 'Classic formal shirt', tags: ['men', 'shirt', 'formal'], level: 4, hours: 8,
    options: { collar: 'classic', sleeve: 'full', fit: 'regular', pockets: '1', hem: 'curved', backPleat: 'none' } },
  { id: 'slim-formal-shirt', garment: 'shirt', name: 'Slim formal shirt', tags: ['men', 'shirt', 'formal'], level: 4, hours: 8,
    options: { collar: 'spread', sleeve: 'full', fit: 'slim', pockets: '0', hem: 'curved', backPleat: 'none' } },
  { id: 'oxford-shirt', garment: 'shirt', name: 'Button-down shirt', tags: ['men', 'shirt', 'formal', 'casual'], level: 4, hours: 9,
    options: { collar: 'buttondown', sleeve: 'full', fit: 'regular', pockets: '1', hem: 'curved', backPleat: 'box' } },
  { id: 'band-collar-shirt', garment: 'shirt', name: 'Band collar shirt', tags: ['men', 'shirt', 'casual', 'indian'], level: 3, hours: 7,
    options: { collar: 'mandarin', sleeve: 'full', fit: 'regular', pockets: '0', hem: 'curved', backPleat: 'none' } },
  { id: 'half-sleeve-shirt', garment: 'shirt', name: 'Half-sleeve shirt', tags: ['men', 'shirt', 'casual'], level: 3, hours: 6,
    options: { collar: 'classic', sleeve: 'half', fit: 'regular', pockets: '1', hem: 'straight', backPleat: 'none' } },
  { id: 'two-pocket-shirt', garment: 'shirt', name: 'Two-pocket shirt', tags: ['men', 'shirt', 'casual'], level: 3, hours: 7,
    options: { collar: 'classic', sleeve: 'half', fit: 'regular', pockets: '2', hem: 'straight', backPleat: 'box' } },
  { id: 'formal-trousers', garment: 'trousers', name: 'Formal trousers', tags: ['men', 'trousers', 'formal'], level: 4, hours: 7,
    options: { front: 'flat', fit: 'regular', pocket: 'slant', backPockets: '2', loops: 'yes', hem: 'plain' } },
  { id: 'slim-trousers', garment: 'trousers', name: 'Slim fit trousers', tags: ['men', 'trousers', 'formal', 'casual'], level: 4, hours: 7,
    options: { front: 'flat', fit: 'slim', pocket: 'slant', backPockets: '1', loops: 'yes', hem: 'plain' } },
  { id: 'pleated-trousers', garment: 'trousers', name: 'Pleated trousers', tags: ['men', 'trousers', 'formal'], level: 5, hours: 8,
    options: { front: 'pleated', fit: 'regular', pocket: 'slant', backPockets: '2', loops: 'yes', hem: 'turnup' } },
  { id: 'side-pocket-trousers', garment: 'trousers', name: 'Side-pocket trousers', tags: ['men', 'trousers', 'casual'], level: 3, hours: 6,
    options: { front: 'flat', fit: 'regular', pocket: 'side', backPockets: '0', loops: 'no', hem: 'plain' } },
];

export const FILTERS = [
  { id: 'all', label: 'All' }, { id: 'shirt', label: 'Shirts' }, { id: 'trousers', label: 'Trousers' },
  { id: 'formal', label: 'Formal' }, { id: 'casual', label: 'Casual' },
];
