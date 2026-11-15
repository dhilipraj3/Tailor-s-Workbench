// Lists the photos the app can use, so it knows which exist (a browser cannot list a folder):
//   public/img/designs/<design>.jpg or <design>--<option>-<value>.jpg  → src/photos.json
//   public/img/sew/<garment>--<step>.jpg (one real photo per sewing step) → src/sew-photos.json
// Runs before `npm run dev`, `npm run build` and `npm test`; run `npm run photos` after adding photos while the app runs.
import { readdirSync, writeFileSync, existsSync } from 'node:fs';

const list = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).map((f) => f.replace(/\.jpe?g$/i, '')).sort() : []);
const designs = list('public/img/designs'), sew = list('public/img/sew');
writeFileSync('src/photos.json', JSON.stringify(designs) + '\n');
writeFileSync('src/sew-photos.json', JSON.stringify(sew) + '\n');
console.log(`photos: ${designs.length} design photos, ${sew.length} sewing-step photos`);
