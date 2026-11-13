# Tailor's Workbench: plan for the advanced version

**Goal:** a child (with a grown-up nearby) can make their own clothes from start to finish, with almost no reading.
Every instruction is a picture, an animation or a voice.

---

## 1. Where we are today (v0.2)

| Area | What works now |
|---|---|
| Garments | Formal shirt (S–XXL, slim/regular), formal trousers (waist 28–44) |
| Sizes | Ready-made size fills every measurement. Each one can be changed with − / + |
| Chapters | Tools → Machine → Measure → Draw pattern → Cut → Sew |
| Pictures | 79 animated steps for the shirt, 76 for trousers, all drawn in code (SVG) |
| Pattern | Drafted from the measurements, drawn line by line with real numbers, inch or cm |
| Voice | Browser text-to-speech, English only |
| App | Vite project, installable on a phone, works offline after the first visit |
| Tests | Unit tests for numbers and drafting, plus every picture step renders for both garments and units |

**Main limits today:**
- The pattern can't be printed full size.
- The animations are simple diagrams.
- Only English is available.
- No accounts: progress lives only in one browser.
- A professional tailor hasn't yet checked that the draft fits.

---

## 2. What "advanced" means

1. **Full-size patterns you can print or project.** No more drawing by hand unless you want to.
2. **Better visuals:** smooth illustrated animations and short real video clips for the hard steps (collar, fly zip).
3. **Your language:** captions and voice in Tamil, Hindi, English and more, recorded by real people.
4. **More garments**, from easy to hard, so children build skills step by step.
5. **Fit that adapts to the body:** measurement help from a photo, and fit fixes like a round belly or sloped shoulders.
6. **A helper you can ask:** take a photo of a problem and get a picture answer.
7. **Profiles and progress**, for families, schools and sewing classes.

---

## 3. Roadmap

### Phase 1: Solid foundation (4–6 weeks)
- **Move to TypeScript and a component framework (Svelte or React).** The code is easier to grow and fewer bugs slip through.
- **Content as data.** Each garment becomes one data file holding its measurements, drafting steps, pictures and voice lines, so new garments can be added without touching the engine.
- **Scene engine as its own module.** One place handles timing, pause and resume, scrubbing a step back and forth, and slow motion for children.
- **Translations (i18n):** every caption and voice line gets a key. Ship English plus one Indian language first.
- **Recorded voice.** Real human audio files, with the browser voice as a fallback when none is recorded.
- **Accessibility:** big touch targets, high contrast, full keyboard use, captions always available.
- **Automatic checks:** each change runs the tests, takes screenshot comparisons of every scene, and publishes a preview link.

### Phase 2: Real patterns (6–8 weeks)
- **True seam allowance.** Offset the outline exactly with a geometry library such as Clipper2, instead of drawing a thick band.
- **Print at home.** Export a full-size pattern as a PDF tiled onto A4 sheets, with page numbers, joining marks and a 5 cm test square to check the scale.
- **Print shop.** Export a single A0 PDF or SVG.
- **Projector mode.** Show the pattern at 1:1 on a projector over the fabric, with a calibration screen.
- **Notches and labels on the pattern:** grainline, "cut ×2", size, and the child's name.
- **Fit adjustments as on/off switches:** forward shoulder, round back, belly, long or short body, sleeve length. Each changes the draft live.
- **Tailor review.** A professional tailor sews test garments in 3 sizes and signs off each draft. Fixes go into the data files.

### Phase 3: More garments, easiest first (ongoing)
A child should start easy and work up:

| Level | Garment | New skills it teaches |
|---|---|---|
| 1 | Cushion cover, tote bag | straight seams, corners, pressing |
| 2 | Elastic pyjama / shorts | curves, crotch seam, elastic casing |
| 3 | Simple kurta / T-shirt style top | neckline facing, sleeves, side slits |
| 4 | Kids' frock / skirt | gathers, waistband, zip |
| 5 | Formal trousers (now) | darts, pockets, fly zip |
| 6 | Formal shirt (now) | collar, cuffs, plackets, buttonholes |
| 7 | Salwar kameez, blouse, waistcoat | darts and shaping, lining |

Each garment also unlocks **practice cards**, such as "sew a corner" or "make a buttonhole", to do on scrap fabric first.

### Phase 4: Smarter learning (6–8 weeks)
- **Practice games on a touchscreen:** trace the stitching line with your finger and get a score for how straight it is. Also "tap the wrong side of the fabric" and "put the steps in order".
- **Check-your-work photo.** The child photographs a seam and compares it side by side with a "good" example.
- **Badges and a progress map** per child.
- **Grown-up mode:** shows the safety steps and the "tricky" steps where an adult should help.

### Phase 5: Smart helpers (needs a small server; 6–10 weeks)
- **Measure from photos.** Two photos (front and side) plus your height give estimated body measurements, using an on-device pose model such as MediaPipe. Always shown as "estimate, please check with a tape". Photos never leave the device.
- **Ask a helper.** Take a photo of the problem ("my seam is puckered") and get a simple picture answer back. This would use a vision-capable AI model (for example Claude) through a small backend that keeps the API key safe. Answers are short, kid-safe and in the chosen language.
- **Fabric layout optimiser.** Arrange the pieces on the fabric width automatically to use the least fabric, and show the layout.

### Phase 6: Accounts and sharing (4–6 weeks)
- **Accounts and sync:** Supabase or Firebase saves profiles, measurements and progress, so you can switch from phone to tablet.
- **Class mode for teachers:** one teacher, many students, and everyone's progress on one page.
- **Admin editor (CMS)** so non-programmers can add garments, pictures and voice lines.

---

## 4. Target technology

| Part | Choice | Why |
|---|---|---|
| App | Vite + TypeScript + Svelte (or React) | fast, small, easy to test |
| Pictures | SVG scenes and Lottie animations from an illustrator | crisp at any size, small files |
| Pattern maths | Own drafting engine + Clipper2 offsets | exact seam allowance and printing |
| PDF export | pdf-lib in the browser | no server needed |
| Offline / install | Service worker (Workbox) + web manifest | works in a sewing room with no Wi-Fi |
| Voice | Recorded audio, browser speech as fallback | natural voice in Indian languages |
| Backend (later) | Supabase (database, login, storage) + small API for the AI helper | cheap to start, grows with users |
| Tests | Vitest (logic), Playwright (screens and screenshots) | catches broken pictures automatically |
| Hosting | Netlify, Vercel or GitHub Pages | free tier is enough at the start |

---

## 5. Safety, privacy and quality
- **Children's data:** no account needed to use the app. If accounts are added, a parent must give consent, and you must follow local law on children's data (for example India's DPDP Act). Photos used for measuring stay on the device.
- **Physical safety:** the iron, scissors and needle steps always show the "with a grown-up" sign and can't be skipped in child mode.
- **Accuracy:** every pattern is checked by a tailor before release. A test version (toile) in cheap fabric is always step 1.

---

## 6. Decisions needed from you
1. **Languages:** which ones come first after English?
2. **Recording:** who records the voice? Your own voice, a family member, or a hired voice artist?
3. **Next garment:** start with the easy Level 1–2 garments for children, or more adult formal wear?
4. **Hosting:** keep it free and offline-only for now, or plan accounts and the AI helper (which have running costs)?
5. **Tailor:** do you know a tailor who could check the patterns?

## 7. Suggested next 3 steps
1. Tailor review of the current shirt and trouser drafts (sew one test garment each).
2. Phase 2 printing (tiled A4 PDF), the most useful upgrade for real use.
3. Add Level 2 (elastic pyjama) and one Indian language, to test the content-as-data design.
