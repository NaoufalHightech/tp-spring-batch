// Module 2B : Paramètres, listeners et cycle de vie d'un job
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 2B' };

// ---------- helpers ----------
let t_now = 0;
function vis(t, a, b, fi = 0.35, fo = 0.3) { return inout(t, a, b, fi, fo); }
function kw(id, w, pre = 0.2, len = 0.35, nth = 0) { const tw = Wt(id, w, nth); return E.out(prog(t_now, tw - pre, tw - pre + len)); }
function seg(id, nextId) { return vis(t_now, S(id) - 0.05, (nextId ? S(nextId) : Eend(id) + 0.6) + 0.05); }
function box(x, y, w, h, label, col, { alpha = 1, sub = null, size = 28, lit = 1 } = {}) {
  panel(x - w / 2, y - h / 2, w, h, { r: 16, stroke: hexA(col, 0.3 + 0.6 * lit), glowC: lit > 0.5 ? hexA(col, 0.3 * lit) : null, blur: 40, alpha });
  txt(label, x, y - (sub ? 14 : 0), { size, weight: 800, fam: MONO, color: lit > 0.5 ? col : C.dim, alpha });
  if (sub) txt(sub, x, y + 24, { size: 20, weight: 400, fam: MONO, color: C.dim, alpha });
}
function arrow(x1, y1, x2, y2, col, k, lw = 4) {
  if (k <= 0) return; const x = lerp(x1, x2, k), y = lerp(y1, y2, k);
  line(x1, y1, x, y, col, lw, 0.85); const a = Math.atan2(y2 - y1, x2 - x1);
  if (k > 0.95) { ctx.save(); ctx.translate(x2, y2); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, -9); ctx.lineTo(-16, 9); ctx.fill(); ctx.restore(); }
  const p = (t_now * 1.1) % 1; if (k >= 1) circle(lerp(x1, x2, p), lerp(y1, y2, p), 6, col, 0.9);
}
function reconst(x, y, a, label = 'RECONSTITUTION') { chip(label, x, y, { size: 16, color: C.dim, alpha: a * 0.85, padX: 10, padY: 6 }); }
function badge(label, x, y, a = 1) { const col = label === 'CONFIRMÉ' ? C.green : label === 'RAPPORTÉ' ? C.yellow : label === 'HYPOTHÈSE' ? C.purple : C.dim; chip(label, x, y, { size: 20, color: col, alpha: a }); }
function title(t, s1, s2, col, k, { y = CY - 20, chipTxt = null, size = 120 } = {}) { if (k <= 0) return; withT(CX, y, lerp(1.15, 1, E.out(Math.min(1, k * 1.4))), 0, k, () => { if (chipTxt) chip(chipTxt, 0, -size - 30, { size: 24, color: col }); txt(s1, 0, -10, { size, weight: 900, fam: DISP, color: col, glowC: hexA(col, 0.4), blur: 40 }); if (s2) txt(s2, 0, size * 0.75, { size: 34, weight: 700, fam: MONO, color: C.dim }); }); }
function server(x, y, w, h, label, col, { lit = 1, alpha = 1, sub = null, dead = 0 } = {}) {
  if (alpha <= 0) return; ctx.save(); ctx.globalAlpha *= alpha; const c = dead > 0.5 ? C.red : col;
  panel(x - w / 2, y - h / 2, w, h, { r: 12, stroke: hexA(c, 0.35 + 0.55 * lit), glowC: lit > 0.5 ? hexA(c, 0.25) : null, blur: 30, fill: 'rgba(12,15,24,0.95)' });
  for (let i = 0; i < 3; i++) { const yy = y - h / 2 + 22 + i * 18; line(x - w / 2 + 18, yy, x + w / 2 - 50, yy, hexA(c, 0.35), 3); circle(x + w / 2 - 28, yy, 5, (i + Math.floor(t_now * 4)) % 3 === 0 && dead < 0.5 ? c : hexA(c, 0.3)); }
  txt(label, x, y + h / 2 - 30 - (sub ? 18 : 0), { size: 26, weight: 800, fam: MONO, color: lit > 0.5 ? c : C.dim });
  if (sub) txt(sub, x, y + h / 2 - 22, { size: 18, weight: 600, fam: MONO, color: C.dim });
  if (dead > 0) cross(x, y - 10, Math.min(w, h) * 0.32, C.red, dead, 7); ctx.restore();
}
// journal (log) : cellules numérotées
function logTape(x, y, n, cw, col, { k = 1, ch = 70, hw = -1, leo = -1, hl = -1, hlCol = C.red, cut = -1, first = 0, alpha = 1, labels = true, names = null } = {}) {
  if (alpha <= 0) return; ctx.save(); ctx.globalAlpha *= alpha; const shown = Math.floor(k * n + 1e-6);
  for (let i = 0; i < n; i++) { const cx = x + i * cw; const on = i < shown; if (!on) { ctx.strokeStyle = hexA(C.dim, 0.25); ctx.lineWidth = 2; rrect(cx + 3, y - ch / 2, cw - 6, ch, 8); ctx.stroke(); continue; }
    const isHl = i === hl, isCut = cut >= 0 && i >= cut; const c = isCut ? C.dim : isHl ? hlCol : col;
    ctx.fillStyle = hexA(c, isCut ? 0.06 : isHl ? 0.3 : 0.14); rrect(cx + 3, y - ch / 2, cw - 6, ch, 8); ctx.fill(); ctx.strokeStyle = hexA(c, isCut ? 0.25 : 0.8); ctx.lineWidth = 3; ctx.stroke();
    if (labels) txt(names ? names[i] : String(first + i), cx + cw / 2, y, { size: names ? 15 : 24, weight: 800, fam: MONO, color: isCut ? C.dim : c });
    if (isCut) line(cx + 8, y - ch / 2 + 6, cx + cw - 8, y + ch / 2 - 6, hexA(C.red, 0.7), 3); }
  if (hw >= 0) { const hx = x + hw * cw; line(hx, y - ch / 2 - 30, hx, y + ch / 2 + 30, C.cyan, 4); txt('ligne de flottaison', hx, y + ch / 2 + 52, { size: 20, weight: 800, fam: MONO, color: C.cyan }); }
  if (leo >= 0) { const lx = x + leo * cw; line(lx, y - ch / 2 - 30, lx, y + ch / 2 + 30, C.orange, 4); txt('fin du journal', lx, y - ch / 2 - 48, { size: 20, weight: 800, fam: MONO, color: C.orange }); }
  ctx.restore();
}
function person(x, y, s, col, a = 1, hand = 0) { if (a <= 0) return; withT(x, y, s, 0, a, () => { circle(0, -46, 22, hexA(col, 0.9)); ctx.fillStyle = hexA(col, 0.55); ctx.beginPath(); ctx.ellipse(0, 14, 38, 40, 0, Math.PI, 0); ctx.fill(); if (hand > 0) { line(26, -6, 26 + 14 * hand, -6 - 52 * hand, col, 7); circle(26 + 14 * hand, -6 - 52 * hand, 7, col); } }); }
function crown(x, y, s, col, a = 1) { if (a <= 0) return; withT(x, y, s, 0, a, () => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-26, 12); ctx.lineTo(-26, -10); ctx.lineTo(-13, 2); ctx.lineTo(0, -18); ctx.lineTo(13, 2); ctx.lineTo(26, -10); ctx.lineTo(26, 12); ctx.closePath(); ctx.fill(); }); }
function gauge(x, y, r, v, col, label, a = 1, valTxt = null) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(C.dim, 0.3); ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke();
  ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * clamp(v, 0, 1))); ctx.stroke(); ctx.restore();
  txt(valTxt != null ? valTxt : Math.round(v * 100) + ' %', x, y, { size: r * 0.42, weight: 900, fam: MONO, color: col, alpha: a }); if (label) txt(label, x, y + r + 34, { size: 22, weight: 800, fam: MONO, color: C.dim, alpha: a }); }
function stamp(label, x, y, col, k, rot = -0.08, size = 40) { if (k <= 0) return; withT(x, y, lerp(1.6, 1, E.out(k)), rot, k, () => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 5; font(size, 900, DISP); const w = ctx.measureText(label).width + 50; rrect(-w / 2, -size * 0.8, w, size * 1.6, 10); ctx.stroke(); ctx.restore(); txt(label, 0, 2, { size, weight: 900, fam: DISP, color: col }); }); }

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 2B' };

// ======================================================================================
// Mini-langage de scène : une scène = une liste d'éléments, chacun apparaît à un ancrage.
//   ancrage : 'Lxxx' (début de la ligne) ou { id: ..., w: ... } (instant où le mot est dit)
//   a = apparition, b = disparition (facultatif : sinon l'élément reste jusqu'à la fin de la scène)
// Sémantique des couleurs (palette de la formation) : vert = nominal, rouge = erreur ou piège,
// orange = attention, bleu = lecture, violet = écriture ou paramètre.
// ======================================================================================
const g = C.green, r = C.red, o = C.orange, b = C.cyan, p = C.purple, d = C.dim, y = C.yellow, w = C.text;
const until = (b_, els) => els.map(e => ({ ...e, b: e.b || b_ }));
const T = a => (typeof a === 'string' ? S(a) : Wt(a.id, a.w));
function K(el) {
  const ta = T(el.a), tb = el.b ? T(el.b) : 1e9;
  return Math.min(E.out(prog(t_now, ta, ta + (el.fi || 0.4))), 1 - E.io(prog(t_now, tb - 0.3, tb)));
}
// fabriques d'éléments
const bx = (a, x, y, w_, h, s, c, o_ = {}) => ({ type: 'box', a, x, y, w: w_, h, s, c, ...o_ });
const tx = (a, x, y, s, o_ = {}) => ({ type: 'text', a, x, y, s, ...o_ });
const pa = (a, x, y, w_, s, o_ = {}) => ({ type: 'para', a, x, y, w: w_, s, ...o_ });
const ar = (a, x1, y1, x2, y2, c, o_ = {}) => ({ type: 'arrow', a, x1, y1, x2, y2, c, ...o_ });
const ln = (a, x1, y1, x2, y2, c, o_ = {}) => ({ type: 'line', a, x1, y1, x2, y2, c, ...o_ });
const ch = (a, x, y, s, c, o_ = {}) => ({ type: 'chip', a, x, y, s, c, ...o_ });
const cd = (a, x, y, w_, h, title, body, c, o_ = {}) => ({ type: 'card', a, x, y, w: w_, h, title, body, c, ...o_ });
const db = (a, x, y, w_, h, c, s, o_ = {}) => ({ type: 'db', a, x, y, w: w_, h, c, s, ...o_ });
const tm = (a, x, y, w_, h, title, lines, o_ = {}) => ({ type: 'term', a, x, y, w: w_, h, title, lines, ...o_ });
const tb = (a, x, y, cols, head, rows, o_ = {}) => ({ type: 'table', a, x, y, cols, head, rows, ...o_ });
const pl = (a, x, y, n, s, c, o_ = {}) => ({ type: 'pill', a, x, y, n, s, c, ...o_ });
const en = (a, x, y, w_, name, cols, c, o_ = {}) => ({ type: 'ent', a, x, y, w: w_, name, cols, c, ...o_ });
const bar = (a, x, y, w_, h, pts, c, o_ = {}) => ({ type: 'bar', a, x, y, w: w_, h, pts, c, ...o_ });
const stp = (a, x, y, s, c, o_ = {}) => ({ type: 'stamp', a, x, y, s, c, ...o_ });
const cr = (a, x, y, s, c, o_ = {}) => ({ type: 'cross', a, x, y, s, c, ...o_ });
const ck = (a, x, y, s, c, o_ = {}) => ({ type: 'check', a, x, y, s, c, ...o_ });
const ic = (a, x, y, kind, c, o_ = {}) => ({ type: 'icon', a, x, y, kind, c, ...o_ });

function wrapLines(s, maxW, size, weight = 600, fam = SANS) {
  const out = []; let cur = '';
  for (const word of s.split(' ')) { const t2 = cur ? cur + ' ' + word : word; if (measure(t2, size, weight, fam) > maxW && cur) { out.push(cur); cur = word; } else cur = t2; }
  if (cur) out.push(cur); return out;
}
const DRAW = {
  box(e, k) { withT(e.x, e.y, lerp(0.9, 1, k), 0, k, () => box(0, 0, e.w, e.h, e.s, e.c, { sub: e.sub, size: e.size || 28, lit: e.lit == null ? 1 : e.lit })); },
  text(e, k) { txt(e.s, e.x, e.y, { size: e.size || 34, weight: e.weight || 700, fam: e.fam || SANS, color: e.c || w, align: e.align || 'center', alpha: k, glowC: e.glow ? hexA(e.c || w, 0.5) : null, blur: e.glow ? 30 : 0, track: e.track || 0 }); },
  para(e, k) {
    const size = e.size || 30, lh = e.lh || 1.35, lines = wrapLines(e.s, e.w, size, e.weight || 600, e.fam || SANS);
    const y0 = e.y - (lines.length - 1) * size * lh / 2;
    lines.forEach((L, i) => txt(L, e.align === 'left' ? e.x : e.x + (e.align === 'right' ? e.w : e.w / 2), y0 + i * size * lh, { size, weight: e.weight || 600, fam: e.fam || SANS, color: e.c || w, align: e.align || 'center', alpha: k }));
  },
  arrow(e, k) { if (e.dash) { line(e.x1, e.y1, lerp(e.x1, e.x2, k), lerp(e.y1, e.y2, k), e.c, e.lw || 4, 0.9, [14, 10]); if (k > 0.95) { const a = Math.atan2(e.y2 - e.y1, e.x2 - e.x1); ctx.save(); ctx.translate(e.x2, e.y2); ctx.rotate(a); ctx.fillStyle = e.c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, -9); ctx.lineTo(-16, 9); ctx.fill(); ctx.restore(); } } else arrow(e.x1, e.y1, e.x2, e.y2, e.c, k, e.lw || 4); },
  line(e, k) { line(e.x1, e.y1, e.x2, e.y2, e.c, e.lw || 3, 0.9 * k, e.dash ? [12, 10] : null); },
  chip(e, k) { chip(e.s, e.x, e.y, { size: e.size || 24, color: e.c, alpha: k, padX: e.padX || 18 }); },
  card(e, k) {
    withT(e.x + e.w / 2, e.y + e.h / 2, lerp(0.95, 1, k), 0, k, () => {
      panel(-e.w / 2, -e.h / 2, e.w, e.h, { r: 18, stroke: hexA(e.c, 0.7), glowC: hexA(e.c, 0.25), blur: 30 });
      txt(e.title, -e.w / 2 + 28, -e.h / 2 + 40, { size: e.tsize || 30, weight: 800, fam: DISP, color: e.c, align: 'left' });
      let yy = -e.h / 2 + 40 + (e.tsize || 30) + 14; const size = e.size || 24;
      for (const L of e.body) { const ls = wrapLines(L, e.w - 56, size, 500, SANS); for (const l2 of ls) { txt(l2, -e.w / 2 + 28, yy, { size, weight: 500, fam: SANS, color: e.fam === 'mono' ? C.text : C.text, align: 'left' }); yy += size * 1.35; } yy += 8; }
    });
  },
  db(e, k) { dbIcon(e.x, e.y, e.w, e.h, e.c, { alpha: k, bands: 2, levelColor: e.fill || null }); if (e.s) txt(e.s, e.x, e.y + 8, { size: e.size || 26, weight: 800, fam: MONO, color: e.c, alpha: k }); },
  term(e, k) {
    const lines = e.lines.map(L => ({ t: T(L.a), s: L.s, color: L.c, cps: L.cps || 45, prompt: L.p === undefined ? undefined : L.p }));
    terminal(e.x, e.y, e.w, e.h, t_now, lines, { title: e.title || 'terminal', alpha: k, size: e.size || 26, lh: 1.5, accent: e.accent || g, cursor: false });
  },
  table(e, k) {
    const size = e.size || 24, rh = e.rh || 58, x0 = e.x; const W_ = e.cols.reduce((a, c) => a + c, 0);
    ctx.save(); ctx.globalAlpha *= k;
    panel(x0, e.y, W_, rh * (e.rows.length + 1), { r: 14, stroke: 'rgba(255,255,255,0.14)', fill: 'rgba(14,17,26,0.95)' });
    let cx = x0; e.head.forEach((h, i) => { txt(h, cx + 18, e.y + rh / 2, { size: size - 2, weight: 800, fam: MONO, color: e.hc || C.dim, align: 'left' }); cx += e.cols[i]; });
    line(x0, e.y + rh, x0 + W_, e.y + rh, 'rgba(255,255,255,0.14)', 2);
    ctx.restore();
    e.rows.forEach((R, j) => {
      const kr = E.out(prog(t_now, T(R.a), T(R.a) + 0.4)) * (e.b ? 1 - E.io(prog(t_now, T(e.b) - 0.3, T(e.b))) : 1); if (kr <= 0) return;
      const yy = e.y + rh * (j + 1);
      if (R.c) { ctx.save(); ctx.globalAlpha *= kr * 0.14; ctx.fillStyle = R.c; ctx.fillRect(x0 + 4, yy + 3, W_ - 8, rh - 6); ctx.restore(); }
      let cx2 = x0; R.cells.forEach((s, i) => { txt(s, cx2 + 18, yy + rh / 2, { size, weight: i === 0 && !e.noBold ? 800 : 500, fam: e.fam || SANS, color: (R.cc && R.cc[i]) || R.c || w, align: 'left', alpha: kr }); cx2 += e.cols[i]; });
    });
  },
  pill(e, k) { withT(e.x, e.y, lerp(0.8, 1, k), 0, k, () => { circle(0, 0, 30, hexA(e.c, 0.22)); ring(0, 0, 30, e.c, 4); txt(String(e.n), 0, 2, { size: 28, weight: 900, fam: MONO, color: e.c }); if (e.s) txt(e.s, 50, 2, { size: e.size || 28, weight: 700, fam: SANS, color: w, align: 'left' }); }); },
  ent(e, k) {
    const rowH = 30, hh = 48, hgt = hh + 16 + e.cols.length * rowH;
    withT(e.x + e.w / 2, e.y + hgt / 2, lerp(0.95, 1, k), 0, k, () => {
      panel(-e.w / 2, -hgt / 2, e.w, hgt, { r: 12, stroke: hexA(e.c, 0.8), glowC: hexA(e.c, 0.2), blur: 24, lw: 3 });
      ctx.fillStyle = hexA(e.c, 0.28); ctx.fillRect(-e.w / 2 + 2, -hgt / 2 + 2, e.w - 4, hh - 2);
      txt(e.name, 0, -hgt / 2 + hh / 2, { size: e.nsize || 20, weight: 800, fam: MONO, color: e.c });
      e.cols.forEach((c, i) => { const hot = typeof c === 'object' ? c.hot : false; const s = typeof c === 'object' ? c.x : c; const pulseA = hot ? 0.6 + 0.4 * Math.sin(t_now * 6) : 1; txt(s, -e.w / 2 + 16, -hgt / 2 + hh + 16 + i * rowH, { size: 19, weight: hot ? 800 : 400, fam: MONO, color: hot ? C.red : C.text, align: 'left', alpha: pulseA }); });
    });
  },
  bar(e, k) {
    let v = 0; const pts = e.pts.map(([a, val]) => [T(a), val]);
    if (t_now >= pts[0][0]) { v = pts[pts.length - 1][1]; for (let i = 0; i < pts.length - 1; i++) if (t_now < pts[i + 1][0]) { v = lerp(pts[i][1], pts[i + 1][1], prog(t_now, pts[i][0], pts[i + 1][0])); break; } }
    const col = e.a2 && t_now >= T(e.a2) ? (e.c2 || r) : e.c;
    ctx.save(); ctx.globalAlpha *= k;
    panel(e.x - e.w / 2, e.y - e.h / 2, e.w, e.h, { r: e.h / 2, stroke: 'rgba(255,255,255,0.18)', fill: 'rgba(14,17,26,0.9)' });
    if (v > 0.002) { ctx.fillStyle = hexA(col, 0.85); rrect(e.x - e.w / 2 + 4, e.y - e.h / 2 + 4, Math.max(e.h - 8, (e.w - 8) * v), e.h - 8, (e.h - 8) / 2); ctx.fill(); }
    if (e.label) txt(e.label, e.x - e.w / 2, e.y - e.h / 2 - 26, { size: 22, weight: 700, fam: MONO, color: C.dim, align: 'left' });
    ctx.restore();
  },
  stamp(e, k) { stamp(e.s, e.x, e.y, e.c, k, e.rot == null ? -0.08 : e.rot, e.size || 40); },
  cross(e, k) { cross(e.x, e.y, e.s || 40, e.c || r, k, 10); },
  check(e, k) { check(e.x, e.y, e.s || 40, e.c || g, k, 10); },
  icon(e, k) {
    if (e.kind === 'file') fileIcon(e.x, e.y, e.w || 80, e.h || 100, e.c, { alpha: k, label: e.lab, lines: 3 });
    else if (e.kind === 'lock') lockIcon(e.x, e.y, (e.s || 60) / 50, e.c, { alpha: k, open: e.open || 0 });
    else if (e.kind === 'server') server(e.x, e.y, e.w || 260, e.h || 150, e.s || '', e.c, { alpha: k, sub: e.sub, dead: e.dead || 0 });
    else if (e.kind === 'person') person(e.x, e.y, e.sc || 1.3, e.c, k, e.hand || 0);
    else if (e.kind === 'clock') { const s = e.sz || 90; circle(e.x, e.y, s, 'rgba(10,14,22,0.95)', k); ring(e.x, e.y, s, e.c, 6, k); const hh = e.h12 == null ? 3.2 : e.h12, mm = e.m12 == null ? 0.2 : e.m12; line(e.x, e.y, e.x + Math.sin(hh / 12 * 6.283) * s * 0.5, e.y - Math.cos(hh / 12 * 6.283) * s * 0.5, e.c, 8, k); line(e.x, e.y, e.x + Math.sin(mm * 6.283) * s * 0.8, e.y - Math.cos(mm * 6.283) * s * 0.8, e.c, 5, k); }
  },
};
// question « PRÉDIRE » : voile + carte ; la question s'affiche à q, la réponse à a.
function drawQuiz(Q) {
  const tq = S(Q.q), ta = S(Q.a), te = Eend(Q.a) + 0.5;
  const k = Math.min(E.out(prog(t_now, tq - 0.1, tq + 0.4)), 1 - E.io(prog(t_now, te - 0.35, te))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.9 * k; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); ctx.restore();
  withT(CX, CY - 20, lerp(0.96, 1, k), 0, k, () => {
    panel(-760, -330, 1520, 660, { r: 28, stroke: hexA(o, 0.7), glowC: hexA(o, 0.25), blur: 50, lw: 3 });
    chip('PRÉDIRE', -620, -280, { size: 24, color: o, align: 'left' });
    const ls = wrapLines(Q.question, 1380, 46, 700, DISP); ls.forEach((L, i) => txt(L, 0, -190 + i * 62, { size: 46, weight: 700, fam: DISP, color: C.text }));
    (Q.choices || []).forEach((c, i) => { const cx = (i - (Q.choices.length - 1) / 2) * 560; const win = Q.win === i && t_now >= ta; const lose = Q.win != null && Q.win !== i && t_now >= ta;
      panel(cx - 250, -10, 500, 100, { r: 16, stroke: win ? hexA(g, 0.9) : lose ? hexA(r, 0.7) : hexA(d, 0.6), glowC: win ? hexA(g, 0.35) : null, lw: 3 });
      txt(c, cx, 40, { size: 30, weight: 800, fam: MONO, color: win ? g : lose ? r : C.text }); });
    const ka = E.out(prog(t_now, ta, ta + 0.5));
    if (ka > 0) { const als = wrapLines(Q.answer, 1380, 36, 600, SANS); als.forEach((L, i) => txt(L, 0, (Q.choices ? 150 : 40) + i * 50, { size: 36, weight: 600, fam: SANS, color: g, alpha: ka })); }
    else { const dots = '.'.repeat(1 + Math.floor(t_now * 2) % 3); txt('réfléchis' + dots, 0, (Q.choices ? 170 : 120), { size: 28, weight: 500, fam: MONO, color: C.dim }); }
  });
}
function renderScene(spec, t) {
  t_now = t;
  background(t, { tint: spec.color, gridA: 0.55 });
  if (spec.part) txt(spec.part, 110, 118, { size: 22, weight: 700, fam: MONO, color: spec.color, align: 'left', track: 3, alpha: 0.9 });
  for (const e of spec.els) { const k = K(e); if (k > 0.001) DRAW[e.type](e, k); }
  for (const Q of (spec.quiz || [])) drawQuiz(Q);
  hud(t, spec.label, spec.color, 1);
}
function mk(spec) {
  return {
    label: spec.label, color: spec.color,
    draw(t) { renderScene(spec, t); },
    fx() { return (spec.fx || []).map(f => ({ ...f, t: T(f.a) })); },
    cues() {
      const c = (spec.cues || []).map(q => ({ t: T(q.a) + (q.dt || 0), s: q.s, g: q.g == null ? -8 : q.g, d: q.d }));
      for (const Q of (spec.quiz || [])) { c.push({ t: S(Q.q), s: 'blip', g: -8 }, { t: S(Q.a), s: 'success', g: -8 }); }
      return c;
    },
  };
}


// ======================= Module 2 : scènes (ancres sur le début des lignes) =======================
// code(ancre, x, y, w, h, titre, [[ancre, texte, couleur]...], options)
const code = (a, x, y, w_, h, title, rows, o_ = {}) => tm(a, x, y, w_, h, title, rows.map(([an, s, c]) => ({ a: an, s, c: c || C.text })), { size: 21, accent: g, ...o_ });
const extrait2 = (a, b_, rows) => tm(a, 100, 700, 1720, 250, 'extrait indicatif', rows.map(([s, c]) => ({ a, s, c })), { size: 22, accent: r, b: b_ });
const side = (a, y_, s, c_, o_ = {}) => ch(a, 1600, y_, s, c_, { size: 24, ...o_ });

const row = (a, cells, c) => ({ a, cells, c });
const pills = (a, items, y_, sz = 22) => items.map(([n, s, c_, x]) => pl(a, x, y_, n, s, c_, { size: sz }));

// ---------- Scène 0 : ouverture ----------
SCENES[0] = mk({
  label: 'OUVERTURE', color: o, part: '2B · LE CYCLE DE VIE D\'UN JOB',
  els: [
    code('L001', 160, 200, 1600, 190, 'terminal', [['L001', 'runDate=2026-11-O2        // un O, pas un zéro', r], ['L001', '... 20 minutes plus tard : FAILED', r]], { size: 28, accent: r, b: 'L002' }),
    ch('L002', 560, 330, 'Module 1 : instance, paramètres identifiants', b, { size: 26, b: 'L003' }), ch('L002', 1360, 330, 'Module 2 : premier job', g, { size: 26, b: 'L003' }),
    bx('L003', 330, 330, 340, 110, 'videur', b, { b: 'L005' }), bx('L003', 710, 330, 340, 110, 'chef de chantier', o, { size: 24, b: 'L005' }), bx('L003', 1090, 330, 340, 110, 'ouvriers', g, { b: 'L005' }), bx('L003', 1470, 330, 340, 110, 'consignes', p, { b: 'L005' }),
    ch('L004', 330, 450, 'validateur', b, { size: 24, b: 'L005' }), ch('L004', 710, 450, 'listener', o, { size: 24, b: 'L005' }), ch('L004', 1090, 450, 'steps', g, { size: 24, b: 'L005' }), ch('L004', 1470, 450, 'ExecutionContext', p, { size: 22, b: 'L005' }),
    ...pills('L005', [[1, 'le videur', b, 150], [2, 'rappel RunId', y, 510], [3, 'chef de chantier', o, 870], [4, 'consignes', p, 1290], [5, 'outils', g, 1650]], 330, 24),
    tx('L006', 960, 860, '2B.1 · Le videur →', { size: 52, c: b }),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L003', s: 'pop' }, { a: 'L005', s: 'blip' }],
});

// ---------- Scène 1 : le videur ----------
SCENES[1] = mk({
  label: 'LE VIDEUR', color: b, part: '2B.1 · VALIDER LES PARAMÈTRES',
  els: [
    ch('L007', 960, 330, 'refuser avant de dépenser vingt minutes', o, { size: 36, b: 'L008' }),
    code('L008', 100, 200, 1300, 260, 'StatementJobConfig.java', [
      ['L008', 'new DefaultJobParametersValidator(', w],
      ['L009', '    new String[] {"runDate"},     // obligatoire', g],
      ['L009', '    new String[] {"format"});     // facultatif', b],
      ['L011', 'new JobBuilder("statementJob", jobRepository).validator(statementValidator)', p]], { size: 22, accent: b, b: 'L015' }),
    ch('L010', 1650, 330, 'autre clé : refusée', r, { size: 22, b: 'L015' }),
    ch('L012', 1650, 420, 'InvalidJobParametersException', r, { size: 20, b: 'L015' }), ch('L012', 1650, 470, 'ex-JobParametersInvalidException', d, { size: 18, b: 'L015' }),
    code('L013', 100, 520, 1300, 150, 'validateur métier', [['L013', 'public void validate(JobParameters p) {', w], ['L013', '  if (!ok(p)) throw new InvalidJobParametersException("runDate invalide");', r], ['L013', '}', w]], { size: 21, accent: o, b: 'L015' }),
    ch('L014', 1650, 560, 'CompositeJobParametersValidator', p, { size: 18, b: 'L015' }),
    ch('L016', 960, 330, "refusé : mode n'est pas autorisé", r, { size: 40, b: 'L017' }),
    tx('L017', 960, 900, '2B.2 · Rappel : une nouvelle instance →', { size: 46, c: y }),
  ],
  quiz: [{ q: 'L015', a: 'L016', question: 'Un job déclare runDate obligatoire et format facultatif. On le lance avec runDate et un paramètre mode. Que se passe-t-il ?', choices: ['il démarre', 'il est refusé', 'mode est ignoré'], win: 1, answer: "Le lancement est refusé : mode n'est pas dans les clés autorisées. Le job ne démarre pas." }],
  cues: [{ a: 'L008', s: 'blip' }, { a: 'L010', s: 'error' }, { a: 'L012', s: 'error' }],
});

// ---------- Scène 2 : rappel RunIdIncrementer ----------
SCENES[2] = mk({
  label: 'RAPPEL RUNID', color: y, part: '2B.2 · UNE NOUVELLE INSTANCE À LA DEMANDE',
  els: [
    ch('L018', 960, 330, 'reporting à la demande · même date · un clic de plus', o, { size: 32, b: 'L020' }),
    pa('L019', 260, 470, 1400, 'comment forcer une nouvelle instance, sans casser la reprise ?', { size: 42, c: w, b: 'L020' }),
    bx('L020', 480, 330, 460, 110, 'RunIdIncrementer', p, { size: 26, b: 'L023' }), ar('L020', 720, 330, 1170, 330, p, { b: 'L023' }), bx('L020', 1440, 330, 460, 110, 'run.id = 1, 2, 3…', p, { size: 26, b: 'L023' }),
    ch('L021', 960, 470, 'identifiant : nouvelle valeur, nouvelle instance · reprise intacte', g, { size: 26, b: 'L023' }),
    code('L022', 100, 560, 1400, 110, 'builder', [['L022', 'new JobBuilder("reportJob", jobRepository).incrementer(new RunIdIncrementer())', w]], { size: 22, accent: p, b: 'L023' }),
    bx('L023', 480, 330, 520, 100, 'startNextInstance()', g, { size: 26, b: 'L025' }), ch('L023', 480, 430, "appelle l'incrémenteur", g, { size: 24, b: 'L025' }),
    bx('L023', 1380, 330, 600, 100, 'start(job, params) · runner Boot 4.1', r, { size: 22, b: 'L025' }), ch('L023', 1380, 430, "n'appelle pas l'incrémenteur", r, { size: 24, b: 'L025' }),
    ch('L024', 960, 560, 'validateur : ajouter run.id aux clés facultatives', o, { size: 28, b: 'L025' }),
    stp('L025', 960, 360, 'ANNEXE 1', y, { size: 80 }), tx('L025', 960, 480, 'le détail, le code, la requête SQL', { size: 34, c: w }),
    tx('L026', 960, 900, '2B.3 · Les listeners →', { size: 48, c: o }),
  ],
  cues: [{ a: 'L020', s: 'pop' }, { a: 'L023', s: 'blip' }, { a: 'L025', s: 'success' }],
});

// ---------- Scène 3 : les listeners ----------
SCENES[3] = mk({
  label: 'LISTENERS', color: o, part: '2B.3 · LE CHEF DE CHANTIER',
  els: [
    ch('L027', 960, 330, 'début et fin du job, sans ouvrir les journaux', o, { size: 34, b: 'L028' }),
    code('L028', 100, 200, 1400, 330, 'StatementJobListener.java', [
      ['L028', 'public class StatementJobListener implements JobExecutionListener {', w],
      ['L028', '  @Override public void beforeJob(JobExecution e) { log.info("Début"); }', g],
      ['L030', '  @Override public void afterJob(JobExecution e) {', o],
      ['L031', '    if (e.getStatus() == BatchStatus.COMPLETED) { log.info("Terminé"); }', g],
      ['L031', '    else { alertTeam(e); }', r],
      ['L031', '  }', w], ['L031', '}', w]], { size: 21, accent: o, b: 'L034' }),
    ch('L029', 1690, 330, 'méthodes par défaut : vides', d, { size: 20, b: 'L034' }),
    ch('L030', 1690, 420, 'appelé même après un échec', o, { size: 20, b: 'L034' }),
    ch('L032', 1690, 510, 'notifier · nettoyer · libérer', g, { size: 20, b: 'L034' }),
    ch('L033', 1690, 600, '.listener(objet)', b, { size: 20, b: 'L034' }), ch('L033', 1690, 650, '@BeforeJob · @AfterJob', b, { size: 20, b: 'L034' }),
    ch('L035', 960, 330, 'oui : afterJob, avec le statut FAILED', g, { size: 40, b: 'L036' }),
    ch('L036', 960, 330, 'listener court et sûr', o, { size: 40, b: 'L037' }),
    code('L037', 100, 220, 1400, 150, 'StepExecutionListener', [['L037', 'void beforeStep(StepExecution s)', b], ['L038', "ExitStatus afterStep(StepExecution s)   // peut changer l'issue", o]], { size: 24, accent: o, b: 'L039' }),
    tx('L039', 960, 900, '2B.4 · Les consignes →', { size: 48, c: p }),
  ],
  quiz: [{ q: 'L034', a: 'L035', question: 'Le job échoue au deuxième step. La méthode afterJob est-elle appelée ?', choices: ['non', 'oui, avec FAILED', 'oui, avec COMPLETED'], win: 1, answer: 'Oui, avec le statut FAILED. C\'est voulu : un job qui échoue doit aussi nettoyer.' }],
  cues: [{ a: 'L028', s: 'blip' }, { a: 'L030', s: 'pop' }, { a: 'L031', s: 'success' }],
});

// ---------- Scène 4 : les consignes ----------
SCENES[4] = mk({
  label: 'CONSIGNES', color: p, part: "2B.4 · PASSER UNE CONSIGNE D'UN STEP À L'AUTRE",
  els: [
    bx('L040', 480, 330, 420, 110, 'step chargement', b, { b: 'L041' }), ch('L040', 480, 430, 'compte 12 480 lignes', g, { size: 24, b: 'L041' }), ar('L040', 700, 330, 1220, 330, w, { b: 'L041' }),
    bx('L040', 1440, 330, 420, 110, 'step contrôle', g, { b: 'L041' }), ch('L040', 1440, 430, 'doit connaître ce total', o, { size: 24, b: 'L041' }),
    bx('L041', 480, 330, 420, 110, 'carnet du step 1', b, { b: 'L045' }), bx('L041', 1000, 330, 420, 110, 'carnet du step 2', g, { b: 'L045' }), bx('L041', 1500, 330, 380, 110, 'carnet du job', p, { size: 26, b: 'L045' }),
    ch('L042', 740, 450, 'non visible', r, { size: 24, b: 'L043' }),
    ar('L043', 480, 260, 1500, 260, p, { b: 'L045' }), ch('L043', 990, 215, 'promotion', p, { size: 26, b: 'L045' }),
    code('L044', 100, 520, 1400, 140, 'promotion', [['L044', 'var listener = new ExecutionContextPromotionListener();', w], ['L044', 'listener.setKeys(new String[] {"totalLines"});', g]], { size: 23, accent: p, b: 'L048' }),
    ch('L045', 960, 710, '.listener(promotion) sur le step', b, { size: 26, b: 'L048' }),
    ch('L046', 960, 780, 'par défaut : seulement si le step a réussi', g, { size: 26, b: 'L048' }),
    ch('L047', 960, 850, 'setStrict(true) : échoue si la clé est absente', o, { size: 26, b: 'L048' }),
    ch('L049', 960, 330, 'null : la note est restée dans le carnet du step 1', r, { size: 36, b: 'L050' }),
    tx('L050', 960, 900, '2B.5 · Réutiliser et outils →', { size: 48, c: g }),
  ],
  quiz: [{ q: 'L048', a: 'L049', question: 'Le step 1 écrit totalLines dans son carnet, sans promotion. Que lit le step 2 ?', choices: ['0', 'null', '12 480'], win: 1, answer: 'null : la note est restée dans le carnet du step 1. Sans promotion, personne d\'autre ne la voit.' }],
  cues: [{ a: 'L040', s: 'blip' }, { a: 'L042', s: 'error' }, { a: 'L043', s: 'success' }],
});

// ---------- Scène 5 : réutiliser, outils, lancement ----------
SCENES[5] = mk({
  label: 'RÉUTILISER ET OUTILS', color: g, part: '2B.5 · RÉUTILISER DES STEPS, OUTILS TOUT FAITS',
  els: [
    ch('L051', 960, 330, 'la même suite de steps dans plusieurs jobs', g, { size: 34, b: 'L052' }),
    tb('L052', 100, 200, [300, 760, 660], ['option', 'dans le repository', 'image'], [
      row('L052', ['flow', 'les steps, comme écrits dans le job', 'plan photocopié'], b),
      row('L053', ['FlowStep', 'une ligne de plus', 'le plan, avec un titre'], o),
      row('L054', ['JobStep', 'un autre job, sa propre instance', 'un sous-traitant'], p)], { size: 24, rh: 62, b: 'L057' }),
    code('L055', 100, 480, 1500, 130, 'JobStep', [['L055', 'new StepBuilder("initStep", jobRepository).job(preProcessingJob)', w], ['L055', '    .parametersExtractor(new DefaultJobParametersExtractor()).build();', g]], { size: 22, accent: g, b: 'L057' }),
    stp('L056', 960, 720, 'UN SEUL NIVEAU DE JOBSTEP', r, { size: 44, b: 'L057' }),
    ch('L057', 960, 330, 'appeler du code existant, sans écrire de tasklet', b, { size: 34, b: 'L058' }),
    tb('L058', 100, 200, [560, 820, 340], ['tasklet', 'rôle', 'attention'], [
      row('L058', ['MethodInvokingTaskletAdapter', 'appelle une méthode de bean, une fois', ''], g),
      row('L059', ['CallableTaskletAdapter', 'exécute un Callable', 'le step attend'], o),
      row('L060', ['SystemCommandTasklet', 'lance une commande du système', 'timeout !'], r)], { size: 22, rh: 60, b: 'L064' }),
    code('L061', 100, 460, 1500, 110, 'SystemCommandTasklet', [['L061', 'shell.setCommand("tar", "czf", "archive.tgz", "export/");   // en morceaux, sans shell', w]], { size: 22, accent: o, b: 'L064' }),
    code('L062', 100, 610, 1500, 130, 'garde-fous', [['L062', 'shell.setTimeout(60_000);  shell.setInterruptOnCancel(true);', g]], { size: 22, accent: g, b: 'L064' }),
    ch('L063', 960, 800, 'SystemProcessExitCodeMapper : code de sortie → statut', p, { size: 24, b: 'L064' }),
    bx('L064', 480, 330, 560, 110, 'JobLauncherApplicationRunner', b, { size: 22, b: 'L066' }), ar('L064', 760, 330, 1000, 330, w, { b: 'L066' }), bx('L064', 1440, 330, 560, 110, 'JobExecutionExitCodeGenerator', g, { size: 20, b: 'L066' }),
    ch('L065', 960, 470, 'spring.batch.job.name : choisir le job', y, { size: 28, b: 'L066' }), ch('L065', 960, 540, 'cron, orchestrateur : le code de sortie dit si ça a réussi', g, { size: 24, b: 'L066' }),
    pl('L066', 300, 330, 1, 'run.id oublié dans le validateur', r, { size: 26 }), pl('L066', 300, 400, 2, 'afterJob sans tester le statut', r, { size: 26 }),
    pl('L067', 300, 480, 3, 'note non promue', r, { size: 26 }), pl('L067', 300, 550, 4, 'JobStep sans extracteur', r, { size: 26 }),
    pl('L068', 300, 630, 5, 'SystemCommandTasklet sans timeout', r, { size: 26 }), pl('L068', 300, 700, 6, 'anciens noms copiés', r, { size: 26 }),
    ch('L069', 1500, 540, 'Exercices 1 à 5', b, { size: 32 }),
    tx('L070', 960, 900, 'Module 3 : le chunk →', { size: 48, c: p }),
  ],
  cues: [{ a: 'L052', s: 'pop' }, { a: 'L056', s: 'error' }, { a: 'L064', s: 'blip' }, { a: 'L070', s: 'levelup', g: -10 }],
});
