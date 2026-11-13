// Full-size pattern PDF: either tiled on A4 pages (print at home) or one big page (print shop).
import { PDFDocument, StandardFonts, rgb, degrees, type PDFPage, type PDFFont } from 'pdf-lib';
import { bbox, polyD, reversePolyD, type Pt } from '../engine/geometry';
import { sheet, type Ctx, type PieceGeo } from '../engine/project';

const PT = 72;
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 0.4 * PT;
const ascii = (s: string) => s.replace(/½/g, '1/2').replace(/¼/g, '1/4').replace(/¾/g, '3/4').replace(/″/g, ' in').replace(/×/g, 'x').replace(/·/g, '-').replace(/[^\x20-\x7e]/g, '');
const C = { stitch: rgb(0.12, 0.44, 0.84), cut: rgb(0.1, 0.13, 0.15), extra: rgb(0.95, 0.55, 0.16), sa: rgb(0.12, 0.44, 0.84), mark: rgb(0.76, 0.25, 0.05), grey: rgb(0.45, 0.5, 0.53) };

const toD = (pts: Pt[], x0: number, y0: number) => polyD(pts.map(([x, y]) => [(x - x0) * PT, (y - y0) * PT] as Pt));
const toRD = (pts: Pt[], x0: number, y0: number) => reversePolyD(pts.map(([x, y]) => [(x - x0) * PT, (y - y0) * PT] as Pt));

function drawPiece(page: PDFPage, font: PDFFont, bold: PDFFont, g: PieceGeo, X: number, Ytop: number, ctx: Ctx) {
  const [bx0, by0, bx1, by1] = g.box, p = g.piece, at = { x: X, y: Ytop };
  if (!p.simple) {
    page.drawSvgPath(`${toD(g.cut, bx0, by0)} ${toRD(g.sa, bx0, by0)}`, { ...at, color: C.extra, opacity: 0.35, borderWidth: 0 });
    page.drawSvgPath(`${toD(g.sa, bx0, by0)} ${toRD(g.stitch, bx0, by0)}`, { ...at, color: C.sa, opacity: 0.08, borderWidth: 0 });
    page.drawSvgPath(toD(g.stitch, bx0, by0), { ...at, borderColor: C.stitch, borderWidth: 1.2, borderDashArray: [6, 3] });
  }
  page.drawSvgPath(toD(g.cut, bx0, by0), { ...at, borderColor: C.cut, borderWidth: 1.6 });
  const P = (q: Pt) => `${((q[0] - bx0) * PT).toFixed(2)} ${((q[1] - by0) * PT).toFixed(2)}`;
  for (const mk of p.marks) {
    if (mk.k === 'line') page.drawSvgPath(`M ${P(mk.a)} L ${P(mk.b)}`, { ...at, borderColor: mk.style === 'guide' ? C.grey : C.mark, borderWidth: 1, borderDashArray: [5, 3] });
    else if (mk.k === 'path') page.drawSvgPath(mk.d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g, (_m, a, b) => P([+a, +b])), { ...at, borderColor: C.mark, borderWidth: 1, borderDashArray: [5, 3] });
    else if (mk.k === 'btn') page.drawCircle({ x: X + (mk.p[0] - bx0) * PT, y: Ytop - (mk.p[1] - by0) * PT, size: 0.22 * PT, borderColor: C.cut, borderWidth: 1 });
    else if (mk.k === 'text') page.drawText(ascii(mk.t), { x: X + (mk.p[0] - bx0) * PT, y: Ytop - (mk.p[1] - by0) * PT, size: 9, font, color: C.mark });
  }
  if (p.grain) {
    const [a, b] = p.grain;
    page.drawSvgPath(`M ${P(a)} L ${P(b)} M ${P([a[0] - 0.25, a[1] + 0.5])} L ${P(a)} L ${P([a[0] + 0.25, a[1] + 0.5])} M ${P([b[0] - 0.25, b[1] - 0.5])} L ${P(b)} L ${P([b[0] + 0.25, b[1] - 0.5])}`, { ...at, borderColor: C.cut, borderWidth: 1.4 });
  }
  if (p.fold) {
    const [, sy0, , sy1] = bbox(g.stitch), fx = Math.min(...g.stitch.map((q) => q[0]));
    const ya = sy0 + (sy1 - sy0) * 0.2, yb = sy0 + (sy1 - sy0) * 0.8;
    page.drawSvgPath(`M ${P([fx, ya])} L ${P([fx + 0.6, ya])} L ${P([fx + 0.6, yb])} L ${P([fx, yb])}`, { ...at, borderColor: C.mark, borderWidth: 1.4 });
    page.drawText('PLACE ON FOLD', { x: X + (fx + 0.95 - bx0) * PT, y: Ytop - (ya + 0.4 - by0) * PT, size: 11, font: bold, color: C.mark, rotate: degrees(-90) });
  }
  const w = bx1 - bx0, h = by1 - by0, size = Math.max(9, Math.min(22, (Math.min(w, h) * PT) / 9));
  const lines = [[ascii(p.name.toUpperCase()), bold, size], [ascii(`Cut x${p.n}${p.fold ? ' on fold' : ''}${p.fabric === 'lining' ? ' - pocket fabric' : ''}${p.interfacing ? ' - + interfacing' : ''}`), font, size * 0.7], [ascii(`${ctx.design.name}${ctx.personName ? ' - ' + ctx.personName : ''}`), font, size * 0.55]] as const;
  let ty = Ytop - (h * PT) / 2;
  for (const [t, f, s] of lines) { const tw = f.widthOfTextAtSize(t, s); page.drawText(t, { x: X + (w * PT - tw) / 2, y: ty, size: s, font: f, color: C.cut }); ty -= s * 1.35; }
}

function cover(doc: PDFDocument, font: PDFFont, bold: PDFFont, ctx: Ctx, cols: number, rows: number, used: boolean[][], mode: 'a4' | 'full') {
  const page = doc.addPage([A4.w, A4.h]);
  let y = A4.h - 60;
  const T = (t: string, s = 11, f = font, x = 48) => { page.drawText(ascii(t), { x, y, size: s, font: f, color: C.cut }); y -= s * 1.6; };
  T("Tailor's Workbench", 22, bold); T(`${ctx.design.name}${ctx.personName ? ' for ' + ctx.personName : ''}`, 14, bold);
  T(`Options: ${Object.entries(ctx.options).map(([k, v]) => `${k} ${v}`).join(', ')}`, 9);
  T(`Measurements (in): ${Object.entries(ctx.m).map(([k, v]) => `${k} ${v}`).join(', ')}`, 9);
  y -= 6; T('1. Print at 100% / "Actual size". Do not "fit to page".', 12, bold);
  T('2. Check the test squares below with a ruler before printing the rest.', 11);
  if (mode === 'a4') { T('3. Trim the right and bottom margin of each page, then tape pages together by their labels.', 11); T('4. Cut along the solid black line.', 11); }
  else T('3. Cut along the solid black line.', 11);
  y -= 10;
  page.drawRectangle({ x: 48, y: y - 141.73, width: 141.73, height: 141.73, borderColor: C.cut, borderWidth: 1 });
  page.drawText('5 cm x 5 cm', { x: 56, y: y - 20, size: 11, font: bold });
  page.drawRectangle({ x: 220, y: y - 144, width: 144, height: 144, borderColor: C.cut, borderWidth: 1 });
  page.drawText('2 in x 2 in', { x: 228, y: y - 20, size: 11, font: bold });
  y -= 175;
  T('Lines on the pattern:', 12, bold);
  page.drawLine({ start: { x: 48, y: y + 4 }, end: { x: 98, y: y + 4 }, color: C.cut, thickness: 1.6 }); T('Cut here', 10, font, 108);
  page.drawLine({ start: { x: 48, y: y + 4 }, end: { x: 98, y: y + 4 }, color: C.stitch, thickness: 1.2, dashArray: [6, 3] }); T('Sew here (stitch line)', 10, font, 108);
  page.drawRectangle({ x: 48, y: y - 2, width: 50, height: 10, color: C.extra, opacity: 0.35 }); T('Extra cloth for future adjustment', 10, font, 108);
  if (mode === 'a4') {
    y -= 8; T(`Page map (${used.flat().filter(Boolean).length} pages to print):`, 12, bold);
    const cell = Math.min(40, 480 / cols, (y - 60) / rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = 48 + c * cell, yy = y - (r + 1) * cell;
      page.drawRectangle({ x, y: yy, width: cell - 3, height: cell - 3, color: used[r][c] ? rgb(0.95, 0.76, 0.19) : rgb(0.92, 0.92, 0.92), borderColor: C.grey, borderWidth: 0.5 });
      if (used[r][c]) page.drawText(`${String.fromCharCode(65 + r)}${c + 1}`, { x: x + 4, y: yy + 5, size: Math.min(11, cell / 3), font: bold });
    }
  }
}

export async function makePdf(ctx: Ctx, mode: 'a4' | 'full'): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.setTitle(`${ctx.design.name} pattern`); doc.setCreator("Tailor's Workbench");
  const tileW = A4.w - MARGIN * 2, tileH = A4.h - MARGIN * 2;
  if (mode === 'full') {
    const sh = sheet(ctx, 30);
    cover(doc, font, bold, ctx, 0, 0, [], 'full');
    const page = doc.addPage([sh.W * PT + MARGIN * 2, sh.H * PT + MARGIN * 2]);
    for (const it of sh.items) drawPiece(page, font, bold, it.g, MARGIN + it.x * PT, page.getHeight() - MARGIN - it.y * PT, ctx);
    return doc.save();
  }
  // try sheets 2–6 pages wide and keep the arrangement that needs the fewest pages
  const plan = (k: number) => {
    const sh = sheet(ctx, (tileW * k) / PT);
    const cols = Math.ceil((sh.W * PT) / tileW), rows = Math.ceil((sh.H * PT) / tileH);
    const used = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => sh.items.some((it) => {
      const x0 = it.x * PT, y0 = it.y * PT, x1 = x0 + (it.g.box[2] - it.g.box[0]) * PT, y1 = y0 + (it.g.box[3] - it.g.box[1]) * PT;
      return x0 < (c + 1) * tileW && x1 > c * tileW && y0 < (r + 1) * tileH && y1 > r * tileH;
    })));
    return { sh, cols, rows, used, n: used.flat().filter(Boolean).length };
  };
  const best = [2, 3, 4, 5, 6].map(plan).reduce((a, b) => (b.n < a.n ? b : a));
  const { sh, cols, rows, used } = best;
  cover(doc, font, bold, ctx, cols, rows, used, 'a4');
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!used[r][c]) continue;
    const page = doc.addPage([A4.w, A4.h]);
    const X0 = MARGIN - c * tileW, Y0 = A4.h - MARGIN + r * tileH;
    for (const it of sh.items) drawPiece(page, font, bold, it.g, X0 + it.x * PT, Y0 - it.y * PT, ctx);
    const white = rgb(1, 1, 1);
    page.drawRectangle({ x: 0, y: 0, width: A4.w, height: MARGIN, color: white });
    page.drawRectangle({ x: 0, y: A4.h - MARGIN, width: A4.w, height: MARGIN, color: white });
    page.drawRectangle({ x: 0, y: 0, width: MARGIN, height: A4.h, color: white });
    page.drawRectangle({ x: A4.w - MARGIN, y: 0, width: MARGIN, height: A4.h, color: white });
    page.drawRectangle({ x: MARGIN, y: MARGIN, width: tileW, height: tileH, borderColor: C.grey, borderWidth: 0.6 });
    const id = `${String.fromCharCode(65 + r)}${c + 1}`;
    page.drawText(id, { x: MARGIN + 6, y: A4.h - MARGIN - 18, size: 14, font: bold, color: C.grey });
    const lab = (t: string, x: number, y: number) => page.drawText(t, { x, y, size: 8, font, color: C.grey });
    if (c > 0) lab(`< ${String.fromCharCode(65 + r)}${c}`, MARGIN + 4, A4.h / 2);
    if (c < cols - 1) lab(`${String.fromCharCode(65 + r)}${c + 2} >`, A4.w - MARGIN - 26, A4.h / 2);
    if (r > 0) lab(`^ ${String.fromCharCode(64 + r)}${c + 1}`, A4.w / 2, A4.h - MARGIN - 10);
    if (r < rows - 1) lab(`v ${String.fromCharCode(66 + r)}${c + 1}`, A4.w / 2, MARGIN + 4);
    page.drawText(`${ascii(ctx.design.name)}  |  page ${id}  |  print at 100%`, { x: MARGIN, y: MARGIN / 2 - 3, size: 7, font, color: C.grey });
  }
  return doc.save();
}
