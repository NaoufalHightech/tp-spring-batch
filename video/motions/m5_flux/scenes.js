// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 5' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 5' };

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

const PH2 = ['#', 'Piège', 'Ce qui se passe', 'Parade'], PC2 = [80, 600, 560, 480];
const row = (a, cells, c) => ({ a, cells, c });
const pills = (a, items, y_, sz = 22) => items.map(([n, s, c_, x]) => pl(a, x, y_, n, s, c_, { size: sz }));

SCENES[0] = mk({
  label: 'OUVERTURE', color: r,
  els: [
    bx('L001', 330, 330, 440, 130, 'chargement', r, { sub: 'ÉCHEC', size: 34 }), bx('L001', 960, 330, 440, 130, 'alerte', g, { sub: 'envoyée : réussie', size: 34 }), bx('L001', 1590, 330, 440, 130, 'job', g, { sub: 'tableau de bord : vert', size: 34 }),
    ar('L001', 560, 330, 740, 330, d), ar('L001', 1190, 330, 1370, 330, d), ch('L002', 960, 540, '.end()  au lieu de  .fail()', r, { size: 44 }),
    ch('L003', 500, 700, 'chaque step laisse sa trace : status, exit_code', b, { size: 26 }), ch('L004', 1400, 700, 'Step, Flow, Job : singletons sans état', p, { size: 26 }),
    ...pills('L005', [[1, 'graphe', g, 130], [2, 'statuts', b, 400], [3, 'flux', p, 670], [4, 'decider', o, 910], [5, 'états', g, 1170], [6, 'split', b, 1430], [7, 'pièges', r, 1700]], 960, 20),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L002', s: 'alarm', g: -12 }, { a: 'L005', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'GRAPHE', color: g, part: '5.1 · DU PIPELINE AU GRAPHE',
  els: [
    bx('L007', 400, 330, 260, 100, 'step A', g, { b: 'L008' }), bx('L007', 960, 330, 260, 100, 'step B', g, { b: 'L008' }), ar('L007', 540, 330, 820, 330, d, { b: 'L008' }), ch('L006', 960, 200, 'pas seulement en ligne droite', y, { size: 28, b: 'L008' }), cr('L007', 400, 330, 40, r, { b: 'L008' }),
    bx('L008', 960, 270, 380, 100, 'loadBankStep', b, { size: 30 }),
    bx('L009', 420, 520, 420, 100, 'bankReportStep', g, { size: 26 }), bx('L009', 960, 520, 420, 100, 'alertStep (trop de rejets)', o, { size: 24 }), bx('L009', 1500, 520, 420, 100, 'alertStep (échec)', r, { size: 26 }),
    ar('L009', 860, 320, 560, 470, g), ar('L009', 960, 320, 960, 470, o), ar('L009', 1060, 320, 1380, 470, r),
    ch('L009', 480, 400, 'COMPLETED', g, { size: 20 }), ch('L009', 960, 410, 'COMPLETED_WITH_REJECTS', o, { size: 18 }), ch('L009', 1440, 400, 'FAILED', r, { size: 20 }),
    ch('L010', 960, 620, "un job = un graphe d'états", y, { size: 30 }), ch('L013', 960, 670, 'alertes · chemins d\'erreur · branches métier', d, { size: 22 }),
    code('L011', 100, 710, 1700, 230, 'écritures', [['L011', '.start(a).next(b).next(c)               // si a échoue, le job s\'arrête', C.text], ['L012', '.start(a).on("COMPLETED").to(b).from(a).on("FAILED").to(c)', g]], { size: 24 }),
    ch('L016', 1550, 1000, 'deux statuts →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L014', a: 'L015', question: "Dans un enchaînement simple, le step a échoue. Que fait le job ?", choices: ['il continue', "il s'arrête", 'il alerte'], win: 1, answer: "Il s'arrête. Pour réagir à l'échec, il faut un flux conditionnel." }],
  cues: [{ a: 'L009', s: 'pop' }],
});

SCENES[2] = mk({
  label: 'BATCH_EXIT_STATUS', color: b, part: '5.2 · BATCHSTATUS CONTRE EXITSTATUS',
  els: [
    ch('L017', 960, 170, 'que compare un on(...) ?', y, { size: 26 }),
    tx('L018', 150, 240, 'BatchStatus : énumération fixe, décidée par le framework', { size: 24, fam: MONO, c: b, align: 'left' }),
    ...['STARTING', 'STARTED', 'STOPPING', 'STOPPED', 'FAILED', 'COMPLETED', 'ABANDONED'].map((s, i) => ch('L019', 260 + i * 235, 300, s, i === 4 ? r : i === 5 ? g : b, { size: 20 })),
    tx('L020', 150, 400, 'ExitStatus : texte libre, sert à aiguiller le flux', { size: 24, fam: MONO, c: o, align: 'left' }),
    ...['COMPLETED', 'FAILED', 'STOPPED', 'NOOP', 'COMPLETED_WITH_REJECTS'].map((s, i) => ch('L021', 260 + i * 330, 460, s, i === 4 ? o : d, { size: 20 })),
    ch('L022', 960, 540, 'les transitions comparent le code de ExitStatus', y, { size: 30 }), ch('L023', 500, 600, 'par défaut : coïncident', g, { size: 24 }), ch('L024', 1400, 600, 'code personnalisé : divergent', o, { size: 24 }),
    ch('L025', 1680, 690, 'chargement réussi, 150 rejets', b, { size: 22 }),
    code('L026', 100, 680, 1350, 280, 'RejectsExitListener', [['L026', 'implements StepExecutionListener', C.text], ['L027', 'public ExitStatus afterStep(StepExecution stepExecution) {', y], ['L028', '  if (status != COMPLETED) return stepExecution.getExitStatus();', C.text], ['L029', '  return stepExecution.getFilterCount() > MAX_REJECTS', o], ['L029', '      ? new ExitStatus("COMPLETED_WITH_REJECTS") : …', o]], { size: 21 }),
    ch('L030', 1650, 790, 'BatchStatus : COMPLETED', g, { size: 20 }), ch('L030', 1650, 850, 'ExitStatus : COMPLETED_WITH_REJECTS', o, { size: 18 }), ch('L031', 1650, 920, 'reprise : BatchStatus · aiguillage : ExitStatus', y, { size: 16 }),
    ch('L032', 1680, 750, 'sans code : ExitStatus = BatchStatus', d, { size: 18 }), ch('L035', 1500, 1000, 'le flux conditionnel →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L033', a: 'L034', question: 'Le step a réussi, le listener pose COMPLETED_WITH_REJECTS. Que vaut le BatchStatus ?', choices: ['COMPLETED', 'FAILED', 'COMPLETED_WITH_REJECTS'], win: 0, answer: 'BatchStatus COMPLETED, ExitStatus COMPLETED_WITH_REJECTS : réussi techniquement, mais le code dit autre chose.' }],
  cues: [{ a: 'L022', s: 'stamp' }, { a: 'L030', s: 'pop' }],
});

SCENES[3] = mk({
  label: 'FLUX_CONDITIONNEL', color: p, part: '5.3 · UN FLUX CONDITIONNEL, LIGNE PAR LIGNE',
  els: [
    code('L037', 100, 190, 1300, 500, 'BankFlowJob', [
      ['L037', 'new JobBuilder("bankFlowJob", jobRepository)', C.text], ['L037', '    .start(loadBankStep)', y], ['L039', '        .on("COMPLETED").to(bankReportStep)', g], ['L040', '    .from(loadBankStep)'], ['L040', '        .on("FAILED").to(alertStep)', o],
      ['L041', '            .on("*").fail()', r], ['L043', '    .from(loadBankStep)'], ['L043', '        .on("*").fail()   // filet de sécurité', r], ['L045', '    .end().build();']], { size: 21 }),
    ch('L036', 1600, 240, 'rapport si tout va bien, alerte sinon', d, { size: 22 }), ch('L038', 1600, 310, 'builder de flux', b, { size: 22 }), ch('L042', 1600, 380, 'alerte verte + job vert : faux', r, { size: 22 }), ch('L044', 1600, 450, 'code oublié, STOPPED, UNKNOWN', r, { size: 22 }),
    ch('L050', 1600, 520, '* : toute suite · ? : un caractère', b, { size: 20 }), ch('L051', 1600, 590, 'le plus précis gagne', g, { size: 22 }), ch('L052', 1600, 660, 'end · fail · stopAndRestart', y, { size: 22 }),
    code('L046', 100, 720, 1300, 220, 'FinanceAlertTasklet', [['L046', 'job = contribution.getStepExecution().getJobExecution();', C.text], ['L047', 'load = … filter(s -> s.getStepName().equals("loadBankStep"));', b], ['L048', 'alertSender.toFinanceTeam("… %d lignes rejetées sur %d lues");', o]], { size: 21 }),
    ch('L049', 1600, 780, 'composant sans état', g, { size: 22 }), ch('L055', 960, 1000, 'branche d\'erreur : fail', y, { size: 26 }), ch('L056', 1600, 850, 'la fin du flux fixe l\'état du job', y, { size: 22 }), ch('L057', 1650, 960, 'le decider →', o, { size: 24 }),
  ],
  quiz: [{ q: 'L053', a: 'L054', question: 'COMPLETED_WITH_REJECTS arrive, aucune transition ne le prévoit, mais le filet * existe. Que se passe-t-il ?', choices: ['Next state not found', 'job FAILED explicite', 'suite normale'], win: 1, answer: 'Le filet l\'attrape : le job se termine en échec, explicitement. Sans filet : Next state not found.' }],
  cues: [{ a: 'L041', s: 'pop' }, { a: 'L042', s: 'error' }],
});

SCENES[4] = mk({
  label: 'DECIDER', color: o, part: '5.4 · LE JOB EXECUTION DECIDER',
  els: [
    code('L060', 100, 190, 1300, 300, 'RejectsDecider', [['L060', '@Component public class RejectsDecider implements JobExecutionDecider {', y], ['L061', '  FlowExecutionStatus decide(JobExecution je, StepExecution se) {', C.text],
      ['L062', '    long rejected = se.getExecutionContext().getLong("rejectedCount", 0L);', b], ['L063', '    return new FlowExecutionStatus("TOO_MANY_REJECTS");', g]], { size: 21 }),
    code('L065', 100, 520, 1300, 320, 'bankDecisionJob', [['L065', '.start(loadBankStep).next(rejectsDecider)', C.text], ['L066', '    .on("NO_REJECTS").to(bankReportStep)', g], ['L066', '    .from(rejectsDecider).on("FEW_REJECTS").to(bankReportStep)', g], ['L067', '    .from(rejectsDecider).on("TOO_MANY_REJECTS").to(alertStep)', o], ['L067', '    .from(rejectsDecider).on("*").fail()', r]], { size: 21 }),
    ch('L058', 1650, 240, 'décider d\'après un compteur', d, { size: 22 }), ch('L059', 1650, 310, 'décision pure, sans traitement', g, { size: 22 }), ch('L064', 1650, 380, '3 codes : NO · FEW · TOO_MANY', y, { size: 20 }), ch('L068', 1650, 450, 'pas un step : rien en base', d, { size: 22 }),
    ch('L069', 1650, 540, 'StepScope : pendant un step seulement', b, { size: 18 }), ch('L070', 1650, 610, 'entre deux steps : aucun contexte', r, { size: 20 }), ch('L071', 1650, 680, 'singleton sans état', g, { size: 22 }), ch('L072', 1650, 750, 'JobScope, ou lire les arguments', b, { size: 20 }), ch('L073', 1650, 820, 'decider pur : il ne modifie rien', y, { size: 20 }),
    ch('L076', 1500, 960, 'la machine à états →', p, { size: 26 }), ch('L075', 960, 900, 'code de sortie : règle simple · decider : plusieurs sources', y, { size: 24 }),
  ],
  quiz: [{ q: 'L074', a: 'L075', question: 'Quand préférer un decider à un code de sortie ?', choices: ['règle simple', 'sources multiples', 'jamais'], win: 1, answer: 'Le code de sortie convient à une règle simple du step. Le decider, quand la décision combine plusieurs sources ou doit se tester seule.' }],
  cues: [{ a: 'L070', s: 'error' }, { a: 'L067', s: 'pop' }],
});

SCENES[5] = mk({
  label: 'MACHINE_ETATS', color: p, part: '5.5 · SOUS LE CAPOT : LA MACHINE À ÉTATS',
  els: [
    ch('L077', 960, 160, 'comment le moteur choisit l\'état suivant', y, { size: 26 }), ch('L078', 960, 215, 'SimpleFlow : des états + une table de transitions', d, { size: 22 }),
    tb('L083', 100, 250, [300, 620, 780], ['état', 'exécute', 'statut produit par'], [
      row('L083', ['StepState', 'un step', 'le code ExitStatus du step'], b), row('L083', ['DecisionState', 'un decider', 'le FlowExecutionStatus retourné'], o), row('L084', ['SplitState', 'plusieurs flux', 'le statut le plus grave'], p), row('L084', ['FlowState', 'un sous-flux', 'son statut final'], g), row('L084', ['EndState', 'rien : termine le job', 'COMPLETED, FAILED ou STOPPED'], r)], { size: 22, rh: 60 }),
    bx('L079', 210, 700, 300, 100, '1 · exécuter', b, { size: 26 }), bx('L080', 570, 700, 300, 100, '2 · statut', o, { size: 26 }), bx('L081', 930, 700, 300, 100, '3 · transition', p, { size: 24 }), bx('L082', 1290, 700, 300, 100, '4 · suivant', g, { size: 26 }), bx('L082', 1650, 700, 300, 100, '5 · fin', d, { size: 26 }),
    ar('L080', 360, 700, 420, 700, d), ar('L081', 720, 700, 780, 700, d), ar('L082', 1080, 700, 1140, 700, d), ar('L082', 1440, 700, 1500, 700, d),
    ch('L085', 1500, 190, 'le statut vient de l\'état', d, { size: 22 }),
    ch('L086', 500, 840, 'Next state not found … exit status=…', r, { size: 22 }), ch('L087', 500, 900, 'à l\'exécution : le job échoue', r, { size: 22 }), ch('L088', 1350, 840, 'No end state was found', r, { size: 22 }), ch('L089', 1350, 900, 'au moins une fin : end · fail · stop', g, { size: 22 }),
    ch('L092', 1550, 1000, 'le split →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L090', a: 'L091', question: "Un flux n'a aucune transition vers une fin. L'erreur apparaît quand ?", choices: ['construction', 'exécution'], win: 0, answer: 'À la construction : le job est refusé au lancement. Next state not found apparaît, lui, à l\'exécution.' }],
  cues: [{ a: 'L086', s: 'error' }, { a: 'L088', s: 'error' }],
});

SCENES[6] = mk({
  label: 'SPLIT', color: b, part: '5.6 · LE SPLIT ET LES THREADS',
  els: [
    code('L095', 100, 190, 1400, 500, 'parallelJob', [
      ['L095', 'ThreadPoolTaskExecutor pool = new ThreadPoolTaskExecutor();', C.text], ['L096', 'pool.setThreadNamePrefix("flow-");', y], ['L097', 'pool.setCorePoolSize(2);   pool.setQueueCapacity(0);', g],
      ['L099', 'new FlowBuilder<SimpleFlow>("accountsFlow").start(importAccountsStep).build();', b], ['L100', '.split(flowExecutor).add(accountsFlow, operationsFlow)', o], ['L101', '.start(parallelFlow).next(consolidateStep)', g]], { size: 21 }),
    ch('L093', 1650, 240, 'comptes + opérations en parallèle', d, { size: 20 }), ch('L094', 1650, 310, 'barrière de synchronisation', y, { size: 22 }), ch('L098', 1650, 380, 'pool trop petit ou trop grand', r, { size: 22 }),
    ch('L105', 1650, 450, 'singleton partagé : course', r, { size: 22 }), ch('L106', 1650, 520, 'pool de threads ≠ pool de connexions', o, { size: 20 }), ch('L109', 1650, 590, 'un flux échoue : le job échoue', r, { size: 22 }), ch('L110', 1650, 660, 'reprise : seul le step en échec', g, { size: 22 }), ch('L111', 1650, 730, 'split ≠ accélérer un seul step', d, { size: 20 }),
    bx('L103', 400, 820, 380, 90, 'thread flow-1 : accountsFlow', b, { size: 22 }), bx('L103', 400, 930, 380, 90, 'thread flow-2 : operationsFlow', g, { size: 22 }),
    bx('L102', 900, 875, 60, 200, '', r), ch('L102', 900, 790, 'barrière', r, { size: 20 }), bx('L102', 1300, 875, 360, 100, 'consolidateStep', o, { size: 26 }), ar('L102', 600, 820, 860, 860, d), ar('L102', 600, 930, 860, 890, d), ar('L102', 940, 875, 1110, 875, d),
    ch('L104', 1650, 880, '2 StepExecution distinctes', d, { size: 20 }), ch('L112', 1550, 1000, "cas d'usage →", y, { size: 24 }),
  ],
  quiz: [{ q: 'L107', a: 'L108', question: 'Deux flux utilisent chacun 3 connexions, plus 1 pour le JobRepository. Quel minimum dans le pool ?', choices: ['6', '7', '2'], win: 1, answer: 'Sept : deux fois trois, plus une. Moins, et les flux se bloquent en attendant une connexion détenue par un autre.' }],
  cues: [{ a: 'L102', s: 'stamp' }, { a: 'L109', s: 'error' }],
});

SCENES[7] = mk({
  label: 'CAS_USAGE', color: g, part: "CAS D'USAGE",
  els: [
    cd('L113', 100, 200, 560, 260, "L'import avec alerte", ['plus de 100 rejets : alerte à la place du rapport'], r), ch('L114', 380, 530, 'job FAILED : la supervision le voit', r, { size: 22 }),
    cd('L115', 680, 200, 560, 260, 'Deux sources', ['comptes (fichier) + opérations (base)'], b), ch('L116', 960, 530, 'durée = le plus long, pas la somme', g, { size: 22 }),
    cd('L117', 1260, 200, 560, 260, 'Le bon chemin selon le jour', ['fin de mois : clôture en plus'], o), ch('L118', 1540, 530, 'decider : MONTH_END ou NORMAL', y, { size: 22 }),
    ch('L119', 1550, 960, 'Top 10 des pièges →', r, { size: 28 }),
  ],
  cues: [{ a: 'L114', s: 'pop' }],
});

SCENES[8] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L120', 100, 190, PC2, PH2, [
      row('L121', ['1', 'ExitStatus personnalisé non aiguillé', 'Next state not found', 'transition + filet *'], r), row('L123', ['2', 'BatchStatus confondu avec ExitStatus', 'on("FAILED") ne se déclenche pas', 'aiguiller sur le code'], o),
      row('L125', ['3', 'decider en StepScope', 'aucun contexte de step', 'singleton ou JobScope'], r), row('L127', ['4', 'split mal dimensionné', 'base saturée ou flux en attente', 'pool borné, nommé'], o),
      row('L129', ['5', 'pool de connexions trop petit', 'blocage des flux', 'flux × connexions + 1'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L122', 'L123', [['FlowExecutionException: Next state not found … exit status=COMPLETED_WITH_REJECTS', r]]), extrait2('L124', 'L125', [['status = COMPLETED     exit_code = COMPLETED_WITH_REJECTS', r]]),
    extrait2('L126', 'L127', [['IllegalStateException: No context holder available for step scope', r]]), extrait2('L128', 'L129', [['HikariPool: Connection is not available, request timed out after 30000ms', r]]),
    extrait2('L130', null, [['active=7   idle=0   waiting=2', r]]),
  ],
  cues: [{ a: 'L121', s: 'pop' }, { a: 'L123', s: 'pop' }, { a: 'L125', s: 'alarm', g: -12 }, { a: 'L127', s: 'pop' }, { a: 'L129', s: 'pop' }],
});

SCENES[9] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L131', 100, 190, PC2, PH2, [
      row('L132', ['6', 'branche d\'erreur terminée par end', 'le job apparaît réussi', 'fail()'], r), row('L134', ['7', 'état partagé entre flux', 'course entre threads', 'composants sans état'], r),
      row('L136', ['8', 'decider avec effets de bord', 'effet répété à la reprise', 'decider pur'], o), row('L138', ['9', 'motifs mal compris', 'COMP* capte aussi COMPLETED_WITH_REJECTS', 'motifs explicites, tester'], o),
      row('L140', ['10', 'flux sans état final', 'No end state was found', 'end, fail ou stopAndRestart'], o)], { size: 21, rh: 70, noBold: true }),
    extrait2('L133', 'L134', [['job status = COMPLETED      loadBankStep = FAILED', r]]), extrait2('L135', 'L136', [['total = 1 187,00      puis      1 203,50', r]]),
    extrait2('L137', 'L138', [['alerte envoyée', r], ['alerte envoyée   (après reprise)', r]]), extrait2('L139', 'L140', [['COMPLETED_WITH_REJECTS  →  bankReportStep   (capté par COMP*)', r]]),
    extrait2('L141', 'L142', [['No end state was found. You must specify at least one transition with no next state.', r]]),
    ch('L142', 480, 650, 'un test par issue : COMPLETED · FAILED · …_WITH_REJECTS · inconnu', g, { size: 22 }), ch('L143', 480, 720, 'vérifier les steps exécutés, chemin par chemin', b, { size: 22 }), ch('L144', 1400, 880, 'on ne teste souvent que le chemin heureux', y, { size: 22 }),
  ],
  cues: [{ a: 'L132', s: 'pop' }, { a: 'L134', s: 'pop' }, { a: 'L136', s: 'pop' }, { a: 'L138', s: 'alarm', g: -12 }, { a: 'L140', s: 'pop' }],
});

SCENES[10] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    bx('L145', 400, 300, 360, 110, 'job vert', g, { size: 30 }), ar('L145', 600, 300, 760, 300, d), bx('L145', 960, 300, 360, 110, 'fail()', r, { size: 30 }),
    pl('L146', 1250, 240, 1, 'graphe · ExitStatus aiguille · BatchStatus reprend', g, { size: 22 }), pl('L147', 1250, 320, 2, 'decider sans StepScope · split borné', b, { size: 22 }), pl('L148', 1250, 400, 3, 'branche d\'erreur : fail + filet *', r, { size: 22 }),
    cd('L149', 100, 500, 410, 300, 'Exercice 1', ['Listener : COMPLETED_WITH_REJECTS. Statuts ? Suite du flux ?'], b, { size: 20 }), cd('L150', 540, 500, 410, 300, 'Exercice 2', ['Pourquoi un decider n\'est pas en StepScope ? Deux solutions.'], o, { size: 20 }),
    cd('L151', 980, 500, 410, 300, 'Exercice 3', ['2 flux × 3 connexions + 1 : minimum ? Pourquoi 20 threads n\'aident pas ?'], p, { size: 20 }), cd('L152', 1420, 500, 400, 300, 'Exercice 4', ['Branche d\'erreur terminée par end : détecter, corriger ?'], r, { size: 20 }),
    bar('L153', 960, 930, 800, 36, [['L153', 1], ['L154', 0]], y, { label: 'réfléchis…', b: 'L154' }),
    ch('L154', 305, 850, 'Batch COMPLETED · filet * : échec', g, { size: 18 }), ch('L155', 745, 850, 'hors contexte step', g, { size: 20 }), ch('L156', 1185, 850, '7 connexions', g, { size: 22 }), ch('L157', 1620, 850, 'job COMPLETED, step FAILED : fail()', g, { size: 18 }),
    ch('L158', 1500, 990, 'Module 6 : fiabilité →', o, { size: 26 }),
  ],
  cues: [{ a: 'L154', s: 'success' }, { a: 'L158', s: 'levelup', g: -10 }],
});
