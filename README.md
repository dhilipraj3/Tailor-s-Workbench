# Tailor's Workbench

A picture-and-voice web app that teaches you to sew a **formal shirt** or **formal trousers** from scratch.
It's designed so a child can follow it with a grown-up nearby. Every step is an animation, a few words and a spoken instruction.

## Run it
You need Node.js 18 or newer.

```bash
npm install
npm run dev        # opens the app at http://localhost:5173
npm test           # run the tests
npm run build      # production build in dist/ (works offline, can be installed on a phone)
npm run preview    # try the production build locally
```

## How it's organised
```
index.html               app shell
public/                  icon, web manifest, service worker (offline)
src/main.js              starts the app
src/styles.css           all styling
src/core/                state & sizes, unit formatting (inch/cm, spoken numbers), speech
src/art/svg.js           animation primitives (draw, stitch, cut, fold, move, iron…) and garment shapes
src/drafting/pattern.js  pattern drafting from measurements and the paper-drawing renderer
src/chapters/            Tools, Machine, Measure, Cut, Sew chapters (each step = caption + voice + picture)
src/ui/app.js            home screen and step player
tests/                   unit tests and a test that renders every picture step
docs/PLAN.md             plan for the advanced version
docs/chat-session/       the conversation this app was built in
scripts/export-chat.mjs  regenerates the chat transcript
```

### Adding a step
Each step is one object in a chapter file:
```js
{ cap: 'Sew the sides',                       // ≤ 5 words, shown on screen
  say: 'Turn the shirt inside out. Sew…',     // read aloud
  svg: () => H.stitch('M10 10 L200 10', 0.4, 2) }  // the animated picture (800×500 stage)
```

## Status
v0.2. See [docs/PLAN.md](docs/PLAN.md) for the roadmap. A professional tailor hasn't reviewed the patterns yet,
so always make a test version in cheap fabric first.
