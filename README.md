# Tailor's Workbench

Pick a design, choose who it's for, and get everything needed to make it at home:
a full-size printable pattern, the fabric to buy, and animated step-by-step instructions with voice.

## What it does
- **Design catalogue**: 28 designs for men, women and kids (shirts, trousers, kurta, kurti, saree blouse, pyjama, salwar, churidar, palazzo, shorts, skirts, dress, frock), each built from a base garment plus options.
- **Customiser**: tap pictures to change the collar, sleeve, fit, pockets, hem, pleats, belt loops and turn-ups. The sketch updates live.
- **People**: save sizes for each family member, from a ready-made size (S–XXL, waist 28–44) or their own measurements.
- **Extra cloth for later adjustment**: every seam has its own sewing space plus optional extra cloth
  (None / Standard / Generous / Growing child). It's drawn as an orange band on the pattern and listed seam by seam.
- **No printer needed**: the Make it tab guides chalking every piece straight onto the folded fabric: where each piece starts (from the fold and the fabric end), every point measured from there, curve guide dots, pocket, button and pleat marks, and the cutting line seam by seam with the extra cloth. Generated from the real pattern, so it works for every design, option and size.
- **Printable pattern (optional)**: full-size PDF on A4 pages (with page map, joining labels and test squares),
  one big sheet for a print shop, or an SVG file.
- **Fabric**: metres to buy for 36″, 44″ or 58″ fabric, worked out by laying the real piece shapes on folded fabric.
  Also a shopping list and a cutting layout picture.
- **Make it**: animated steps in four sections (Buy, Prepare, Mark & cut, Sew), matched to the chosen options, with progress saved per project.
- **Every stitch spelled out**: each sewing step shows and speaks which edges go together, the seam width (from the pattern itself), the stitch and its length, locking, trimming, pressing and a check before moving on. A test checks that every cut edge of every piece, in every option combination, is sewn, finished or hemmed by some step.
- Works offline once loaded and can be installed on a phone. Backup and restore are on the People page.

## Run it
You need Node.js 20 (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # all tests
npx tsc -p .       # type-check
npm run build      # production build in dist/
npm run preview    # try the production build locally
npm run audit      # every sewing step of every design on one page, for review by eye
npm run photos     # after adding photos to public/img/designs or public/img/sew
npm run prompts    # rewrite the image prompts in docs/ after changing designs or steps
```

## Deploy (Cloudflare Pages)
Every push to `main` is built and published by Cloudflare Pages. One-time setup in the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**, pick this repository.
2. Production branch: `main`.
3. Framework preset: **None** (or Vite). Build command: `npm run build`. Build output directory: `dist`.
4. Environment variable (optional, `.nvmrc` already sets it): `NODE_VERSION` = `20`.
5. Save and deploy. Pull requests and other branches get their own preview addresses.

`public/_headers` keeps the page and the service worker fresh, so installed apps update straight away.
GitHub Actions (`.github/workflows/ci.yml`) runs the type-check, tests and build on every push.

## Photos
- `public/img/designs/<design>.jpg`: product photo of each design (prompts: `docs/image-prompts.md`).
- `public/img/designs/<design>--<option>-<value>.jpg`: one visible option changed (`docs/image-prompts-options.md`).
- `public/img/sew/<garment>--<step>.jpg`: a real photo of each sewing step (`docs/image-prompts-sewing.md`).
The app picks up whatever exists; missing photos fall back to the drawings.

## How it's organised
```
src/engine/       geometry (seam allowance + extra cloth offsets), sizes, project context, fabric layout
src/garments/     drafting, options, supplies and sketch per garment; sew-*.ts hold every sewing step; index.ts is the catalogue
src/engine/sew.ts sewing detail (seam, stitch, lock, press, check), chips, spoken text, stitch-coverage helpers
src/export/pdf.ts full-size PDF (A4 tiles or one sheet)
src/views/        screens: catalogue, designer, project (pattern / fabric / make), people, help, step player
src/chapters/     animated picture steps (tools, machine, cutting, sewing, option variants)
src/art/svg.js    animation primitives and shapes used by the picture steps
tests/            geometry, every design and option combination, PDF output
docs/PLAN.md      roadmap
docs/chat-session the conversation this app was built in
```

### Adding a design option
1. Add the option to the garment's `options` list (e.g. `src/garments/shirt.ts`).
2. Handle it in `draft()` (pattern pieces), `steps()` (which picture steps), `sketch()` (the flat drawing) and, if needed, `supplies()`.
3. Add a preset to `DESIGNS` in `src/garments/index.ts`.
4. `npm test` checks every option combination automatically.

## Status
v0.7. A professional tailor hasn't reviewed the patterns yet,
so make a test version in cheap fabric first.
