// Lists the product photos in public/img/designs into src/photos.json, so the app knows which exist.
// Names: <design>.jpg (the design's own options) or <design>--<option>-<value>.jpg (one option changed).
// Runs before `npm run dev` and `npm run build`; run `npm run photos` after adding photos while the app is running.
import { readdirSync, writeFileSync, existsSync } from 'node:fs';

const dir = 'public/img/designs';
const names = existsSync(dir) ? readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).map((f) => f.replace(/\.jpe?g$/i, '')).sort() : [];
writeFileSync('src/photos.json', JSON.stringify(names, null, 0) + '\n');
console.log(`photos: ${names.length} listed in src/photos.json`);
