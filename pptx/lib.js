// Composants communs du PowerPoint « Spring Batch — le cours complet ».
// Chaque élément animable reçoit un objectName unique ; l'animation (animate.py) est décrite dans anim.json.
'use strict';
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';                       // 13.33" × 7.5"
pres.title = 'Spring Batch : le cours complet';
pres.author = 'Formation Spring Batch';
pres.theme = { headFontFace: 'Cambria', bodyFontFace: 'Calibri' };
const C = pres.SchemeColor;
const SH = pres.ShapeType;

const THEME = {
  name: 'SpringBatchCours', headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: { dk1: '10211A', lt1: 'FFFFFF', dk2: '1D3B2A', lt2: 'EEF5EF', accent1: '6DB33F', accent2: '2E7D4F', accent3: 'E9A23B',
    accent4: 'D4503F', accent5: '3F7CAC', accent6: '8A63D2', hlink: '2E7D4F', folHlink: '8A63D2' },
};
const HEX = { green: '2E7D4F', lime: '6DB33F', amber: 'E9A23B', red: 'D4503F', blue: '3F7CAC', violet: '8A63D2', dark: '10211A', mist: 'EEF5EF' };

// ---------------------------------------------------------------- mises en page (layouts)
pres.defineSlideMaster({ title: 'TITRE', background: { color: C.text1 }, objects: [
  { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 1.9, w: 11.5, h: 1.9, fontFace: 'Cambria', fontSize: 54, bold: true, color: C.background1, align: 'left', valign: 'bottom' }, text: '' } },
  { placeholder: { options: { name: 'sub', type: 'body', x: 0.9, y: 4.0, w: 11.5, h: 1.1, fontSize: 22, color: C.accent1, align: 'left', valign: 'top' }, text: '' } },
] });
pres.defineSlideMaster({ title: 'SECTION', background: { color: C.text2 }, objects: [
  { placeholder: { options: { name: 'title', type: 'title', x: 1.4, y: 2.9, w: 10.6, h: 1.5, fontFace: 'Cambria', fontSize: 46, bold: true, color: C.background1, align: 'left', valign: 'middle' }, text: '' } },
  { placeholder: { options: { name: 'sub', type: 'body', x: 1.4, y: 4.5, w: 10.6, h: 1.2, fontSize: 20, color: C.background2, align: 'left', valign: 'top' }, text: '' } },
] });
pres.defineSlideMaster({ title: 'CONTENU', background: { color: C.background1 }, slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.text2 }, objects: [
  { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.95, fontFace: 'Cambria', fontSize: 32, bold: true, color: C.text1, align: 'left', valign: 'middle' }, text: '' } },
  { text: { text: 'Spring Batch · le cours complet', options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.text2 } } },
] });
pres.defineSlideMaster({ title: 'CONTENU_SOMBRE', background: { color: C.text1 }, slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.background2 }, objects: [
  { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.95, fontFace: 'Cambria', fontSize: 32, bold: true, color: C.background1, align: 'left', valign: 'middle' }, text: '' } },
  { text: { text: 'Spring Batch · le cours complet', options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.background2 } } },
] });

// ---------------------------------------------------------------- suivi des animations
const ANIM = { slides: [] };
let CUR = null, COUNT = 0;
const SECTIONS = new Set();
/** Crée une diapositive. kind : TITRE | SECTION | CONTENU | CONTENU_SOMBRE ; trans : fade | push | none */
function slide(kind, section, notes, trans, build) {
  COUNT += 1;
  if (!SECTIONS.has(section)) { pres.addSection({ title: section }); SECTIONS.add(section); }
  const sl = pres.addSlide({ masterName: kind, sectionTitle: section });
  CUR = { idx: COUNT, anims: [], trans: trans || 'fade' };
  ANIM.slides.push(CUR);
  build(sl);
  const num = kind === 'SECTION' && section.match(/^(\d)/);
  if (num) sl.addText(num[1], { x: 9.4, y: 1.0, w: 3.6, h: 5.2, fontFace: 'Cambria', fontSize: 260, bold: true, color: C.accent1, transparency: 72, align: 'center', valign: 'middle', isTextBox: true });
  if (notes) sl.addNotes(notes);
  return sl;
}
/** Réserve un nom d'objet animé. g = numéro de clic (même g = en même temps) ; t : f (fondu) | w (balayage gauche→droite) ; pr = [première, dernière] ligne */
function N(g, t = 'f', pr = null) {
  if (!g) return undefined;                       // g = 0 ou absent : élément statique, visible dès l'arrivée de la diapositive
  const name = `an${CUR.idx}_${CUR.anims.length}`;
  CUR.anims.push({ name, g, t, pr });
  return name;
}

// ---------------------------------------------------------------- composants
const SHADOW = () => ({ type: 'outer', color: '000000', opacity: 0.14, blur: 6, offset: 2, angle: 90 });
function title(sl, text) { sl.addText(text, { placeholder: 'title' }); }

/** Carte : titre coloré + texte. o : head, body, col, g, hs, bs, badge (numéro/lettre) */
function card(sl, x, y, w, h, o) {
  const col = o.col || C.accent2, left = o.badge ? 52 : 14;
  sl.addText([
    { text: o.head, options: { bold: true, fontSize: o.hs || 18, color: col, breakLine: !!o.body } },
    ...(o.body ? [{ text: o.body, options: { fontSize: o.bs || 14, color: C.text1 } }] : []),
  ], { x, y, w, h, shape: SH.roundRect, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: col, width: 1.25 }, align: 'left', valign: o.valign || 'top',
    margin: [10, 12, 8, left], isTextBox: true, shadow: SHADOW(), objectName: N(o.g) });
  if (o.badge) sl.addText(String(o.badge), { x: x + 0.12, y: y + 0.12, w: 0.42, h: 0.42, shape: SH.ellipse, fill: { color: col }, color: C.background1, bold: true, fontSize: 15,
    align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: N(o.g) });
}
/** Boîte de schéma pleine couleur. o : sub, col, g, size, dark (texte sombre) */
function box(sl, x, y, w, h, label, o = {}) {
  const col = o.col || C.accent2, tc = o.dark ? C.text1 : C.background1;
  sl.addText([
    { text: label, options: { bold: true, fontSize: o.size || 18, color: tc, breakLine: !!o.sub } },
    ...(o.sub ? [{ text: o.sub, options: { fontSize: o.subSize || 13, color: tc } }] : []),
  ], { x, y, w, h, shape: o.round ? SH.ellipse : SH.roundRect, rectRadius: 0.08, fill: { color: col }, line: o.dash ? { color: C.accent3, width: 2.25, dashType: 'dash' } : { color: col, width: 0.75 },
    align: 'center', valign: 'middle', margin: 4, isTextBox: true, shadow: SHADOW(), objectName: N(o.g, o.t) });
}
/** Flèche de (x1,y1) vers (x2,y2). o : col, g, dash, w, t */
function arrow(sl, x1, y1, x2, y2, o = {}) {
  sl.addShape(SH.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.col || C.text2, width: o.w || 2.5, endArrowType: 'triangle', dashType: o.dash ? 'dash' : 'solid' }, objectName: N(o.g, o.t || 'w') });
}
/** Étiquette de texte libre (sans fond). */
function label(sl, text, x, y, w, h, o = {}) {
  sl.addText(text, { x, y, w, h, fontSize: o.size || 14, bold: !!o.bold, italic: !!o.italic, color: o.col || C.text1, align: o.align || 'left', valign: o.valign || 'top',
    margin: o.margin ?? 2, fontFace: o.font, isTextBox: true, objectName: o.g === undefined ? undefined : N(o.g, o.t) });
}
function chip(sl, text, x, y, w, o = {}) {
  sl.addText(text, { x, y, w, h: o.h || 0.38, shape: SH.roundRect, rectRadius: 0.19, fill: { color: o.col || C.accent2 }, color: o.dark ? C.text1 : C.background1,
    bold: true, fontSize: o.size || 13, align: 'center', valign: 'middle', margin: 2, isTextBox: true, objectName: o.g === undefined ? undefined : N(o.g) });
}
/** Chiffre-clé. */
function stat(sl, x, y, w, big, small, o = {}) {
  sl.addText([{ text: big, options: { fontFace: 'Cambria', bold: true, fontSize: o.bs || 54, color: o.col || C.accent2, breakLine: true } },
    { text: small, options: { fontSize: o.ss || 15, color: C.text1 } }], { x, y, w, h: o.h || 1.7, align: 'center', valign: 'middle', margin: 2, isTextBox: true, objectName: N(o.g) });
}

// ---------------------------------------------------------------- tableau
function tbl(sl, rows, o) {
  const head = rows[0].map(t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.accent2 }, fontSize: o.hs || 14, valign: 'middle' } }));
  const body = rows.slice(1).map((r, i) => r.map((t, j) => ({ text: t, options: { color: C.text1, fontSize: o.fs || 14, valign: 'middle', bold: j === 0 && o.boldFirst !== false,
    fill: { color: i % 2 ? C.background1 : C.background2 } } })));
  sl.addTable([head, ...body], { x: o.x, y: o.y, w: o.w, colW: o.colW, border: { type: 'solid', pt: 0.5, color: 'C9DACD' }, margin: [4, 8, 4, 8],
    autoPage: false, rowH: o.rowH, objectName: N(o.g) });
}

// ---------------------------------------------------------------- code (extraits réels du projet)
const KW = /\b(public|private|protected|class|interface|implements|extends|return|new|var|static|final|void|throws|abstract|if|else|for|while|true|false|null|this|import)\b/;
function runs(line, size) {
  const out = []; const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(@\w+)|\b(public|private|protected|class|interface|implements|extends|return|new|var|static|final|void|throws|abstract|if|else|for|while|true|false|null|this)\b|\b([A-Z][A-Za-z0-9_]*)\b/g;
  let last = 0, m; const push = (t, c) => { if (t) out.push({ text: t, options: { color: c, fontFace: 'Courier New', fontSize: size } }); };
  while ((m = re.exec(line))) {
    push(line.slice(last, m.index), 'E8F0EA');
    const t = m[0]; push(t, m[1] ? '8FA89A' : m[2] ? C.accent1 : m[3] ? C.accent3 : m[4] ? 'C3A6F5' : '7FC1EE'); last = re.lastIndex;
  }
  push(line.slice(last), 'E8F0EA'); if (!out.length) push(' ', 'E8F0EA');
  return out;
}
/** Panneau de code. lines : tableau de chaînes. o : title (nom du fichier), size, steps : [[premièreLigne, dernièreLigne, g], ...] */
function code(sl, x, y, w, h, lines, o = {}) {
  const size = o.size || 12, th = 0.36;
  sl.addText('', { x, y, w, h, shape: SH.roundRect, rectRadius: 0.07, fill: { color: C.text1 }, line: { color: C.text2, width: 1 }, isTextBox: true, objectName: N(o.g0) });
  if (o.title) sl.addText(o.title, { x: x + 0.12, y: y + 0.05, w: w - 0.24, h: th, fontFace: 'Courier New', fontSize: 11, color: C.accent1, bold: true, margin: 2, isTextBox: true, objectName: N(o.g0) });
  const paras = [];
  lines.forEach((ln, i) => { const r = runs(ln.replace(/\t/g, '  '), size); r[r.length - 1].options.breakLine = i < lines.length - 1; paras.push(...r); });
  const steps = o.steps || [];
  // le texte est un objet à construction par paragraphes : une entrée d'animation par plage de lignes
  const nm = steps.length ? `an${CUR.idx}_${CUR.anims.length}` : undefined;
  sl.addText(paras, { x: x + 0.12, y: y + (o.title ? th + 0.1 : 0.1), w: w - 0.24, h: h - (o.title ? th + 0.2 : 0.2), valign: 'top', align: 'left', margin: 4, isTextBox: true, objectName: nm, paraSpaceAfter: 0 });
  steps.forEach(s => CUR.anims.push({ name: nm, g: s[2], t: 'f', pr: [s[0], s[1]] }));
}

// ---------------------------------------------------------------- extraits de code réels
const ROOT = '/home/user/tp-spring-batch/tp';
const SOL = ROOT + '/tpSpringBatchSolution/src/main/java/tp/tpSpringBatch/';
const SOLT = ROOT + '/tpSpringBatchSolution/src/test/java/tp/tpSpringBatch/';
const BANK = ROOT + '/tpBankDemo/src/main/java/tp/bank/';
const cache = {};
function fileLines(f) { return cache[f] || (cache[f] = fs.readFileSync(f, 'utf8').split(/\r?\n/).map(l => l.replace(/\t/g, '  ').replace(/\s+$/, ''))); }
/** ranges : [[motifDébut, motifFin], ...]  (le motif de fin est cherché à partir de la ligne de début, inclus) */
function snip(f, ranges, o = {}) {
  const sep = o.sep || '// …', inline = o.inline !== false, L = fileLines(f), out = [];
  ranges.forEach((r, k) => {
    const a = L.findIndex(l => l.includes(r[0])); if (a < 0) throw new Error(`motif introuvable dans ${f} : ${r[0]}`);
    const b = r[1] === r[0] ? a : L.findIndex((l, i) => i >= a && l.includes(r[1])); if (b < 0) throw new Error(`motif de fin introuvable dans ${f} : ${r[1]}`);
    if (k > 0) out.push(sep);
    out.push(...L.slice(a, b + 1).map(l => (inline && !/^\s*(\/\/|#|<!--)/.test(l)) ? l.replace(/(?<=[;)\]},{])\s*\/\/.*$|\s+\/\/.*$/, '') : l));
  });
  const keep = out.filter(l => l.trim());
  const ind = Math.min(...keep.map(l => l.match(/^ */)[0].length));
  return out.map(l => l.slice(Math.min(ind, l.match(/^ */)[0].length)));
}

module.exports = { pres, C, SH, THEME, HEX, ANIM, slide, N, title, card, box, arrow, label, chip, stat, tbl, code, snip, SOL, SOLT, BANK, ROOT, fileLines, SHADOW };
