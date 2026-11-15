# Test plan

Goal: someone who has never sewn can pick any design, in any option combination, for any person, and get a correct pattern, a correct fabric amount, and a correct, clearly shown instruction for every stitch.

Each area below lists **what** is checked, **how** (automatic test, visual audit, or manual), and **the pass rule**. Automatic tests run with `npm test`; the visual audit with `npm run audit` (see section 9).

---

## 1. Catalogue and options (automatic)
| Check | Pass rule |
|---|---|
| Every design opens in the customiser | No error; preview, title, description, stats, every option group render |
| Every option of every garment can be picked | Pattern, steps and fabric rebuild without error, no `NaN`/`undefined` anywhere |
| Description text | Reads as a sentence: no empty phrases, no dangling commas, mentions the chosen collar/neck, sleeve and length |
| Photo shown only for the design's own options | Changing any option shows the drawing |

## 2. Patterns (automatic)
For every garment × every option combination × sizes S, M, L, XL, a child size and a custom size:
| Check | Pass rule |
|---|---|
| Pieces drafted | At least two pieces, each with a closed outline |
| Seam allowance and extra cloth | Cut line lies outside the stitching line everywhere; extra cloth only where the design says |
| Matching seams | Edges sewn together have equal length (± ⅛″), or the difference is eased/gathered by a step (sleeve caps, gathers) |
| Fit sanity | Finished chest/waist/hip ≥ body + minimum ease; lengths within the option's range |
| PDF and SVG export | Generated without error; A4 tiles cover every piece; test square is 5 cm |

## 3. Fabric (automatic)
| Check | Pass rule |
|---|---|
| Layout | Every piece placed, none overlapping, all inside the fabric width |
| Metres | Between 0.4 m and 6 m; more extra cloth never needs less fabric |
| Supplies | Every notion used in a step (zip, hooks, buttons, elastic, interfacing, lining) is on the shopping list, and nothing extra |

## 4. Sewing instructions — completeness (automatic, exists)
| Check | Pass rule |
|---|---|
| No stitch missed | Every cut edge of every piece is sewn, finished or hemmed by a step, in every option combination |
| Every seam has a distance | Seam stitches state the seam width or where to sew |
| References are real | Steps name only pieces and edges that exist |
| Order | A piece is finished before it is joined; casings/bands come after the seams they cover; buttons after buttonholes |

## 5. Sewing instructions — correctness (manual, then locked by tests)
| Check | Pass rule |
|---|---|
| Seam widths match the pattern | Each step's width equals the edge's seam allowance in the pattern |
| Methods are standard | Reviewed against tailoring references and, before release, by a tailor |
| Words | Short, plain, one action per step; captions ≤ 5 words |

## 6. Sewing pictures — automatic picture checks
For every design (default options) and a set of option variants (every value of every option at least once):
| Check | Pass rule |
|---|---|
| Real pieces | Every sewing step except the finished garment shows the real pieces in the garment's colour |
| No repeats | No two steps show the same picture |
| Edges drawn along the piece | Every highlighted or stitched line follows a real edge; no line jumps between separate parts of an edge |
| Inside the stage | Pieces, foot, close-up and title stay inside the picture and do not cover each other |
| Small details are big enough | A highlighted detail (dart, slit, placket, buttonhole area) is at least 25% of the picture height; otherwise the picture zooms in |
| Readable | Thread colour contrasts with the fabric; titles do not overlap the pieces |

## 7. Sewing pictures — visual audit (by eye, every release)
`npm run audit` builds one page with every sewing step of every design (end state of each animation, with its caption, words and chips). Reviewed by eye, design by design:
- the picture shows what the words say, on the right piece;
- shapes look like the garment (necklines, backs, sleeves, darts);
- nothing is cut off, hidden or overlapping.
Findings are logged in section 11 and fixed before release.

## 8. Screens (automatic + manual)
| Screen | Checks |
|---|---|
| Home | Hero, swatches recolour, notes, features, projects (empty and filled), filters, cards, how it works, footer |
| Customiser | Every option pill, person pills, add person, extra cloth, Start making creates a project |
| Project | Pattern tab (pieces, PDF, SVG), Fabric tab (widths, metres, supplies), Make it tab |
| Player | Sections, step bar, play/pause, drag, slow motion, back/next, voice, auto-play, deep links `/make/<step>?t=` |
| People | Add, edit measurements, ready-made sizes, delete, backup and restore |
| Help | Tools and machine guides play |
Widths: 390 px (phone), 768 px (tablet), 1440 px (desktop). No horizontal scroll, no clipped controls.

## 9. Tooling
- `npm test`: sections 1–4 and 6.
- `npm run audit`: section 7 gallery, written to `public/audit/` (not committed).
- Screenshots of key screens at the three widths, compared by eye.

## 10. Other
- Units: every number correct in inches and centimetres, spoken and shown.
- Voice: every step's words read aloud; detail sentence follows.
- Offline: after one visit the app opens without network; the service worker serves pages and photos.
- Accessibility: buttons reachable by keyboard, labels on icon buttons, contrast ≥ 4.5:1 for text.
- Performance: a step opens in under 300 ms on a mid-range phone.

## 11. Findings log
| # | Found | Area | Status |
|---|---|---|---|
| 1 | Split edges (two underarm edges) drawn as one line across the sleeve | Pictures | Fixed: each part of an edge drawn separately; regression test |
| 2 | Darts too small to see in dart steps | Pictures | Fixed: small details zoom in (one half of fold pieces) |
| 3 | Deep U back drawn as a sharp V | Pattern shape | Fixed: drafted as a U curve |
| 4 | Description grammar and thin kurti description | Customiser | Fixed: built from the options; test for every design and option value |
| 5 | Customiser preview sits in a box | Customiser | Fixed |
| 6 | Old generic picture on "Fold the darts" | Pictures | Fixed (was a cached page; also final "Press it" step now real) |
| 7 | Sleeve top drafted up to ⅝″ shorter than its armhole (shirt, kurta, kurti, blouse) | Patterns | Fixed: sleeve top drafted to the real armhole + ease; test |
| 8 | Interfacing used but not on the shopping list (drawstring pyjamas, skirts with a band) | Supplies | Fixed; test |
| 9 | Skirt hook and bar not listed on its own | Supplies | Fixed; test |
| 10 | Steps without named pieces borrowed the wrong pieces ("Trim and clip" showed the sleeves) | Pictures | Fixed: preparation looks ahead, follow-up looks back |
| 11 | "Turn and topstitch" flipped the pieces to the wrong side | Pictures | Fixed |
| 12 | Final "Press it" step used the old generic picture | Pictures | Fixed; test now covers steps without sewing detail |
