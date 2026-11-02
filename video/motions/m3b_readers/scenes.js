// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 3B' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 3B' };

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
const why = (a, b_, s) => ch(a, 960, 655, s, y, { size: 26, ...(b_ ? { b: b_ } : {}) });
const row = (a, cells, c) => ({ a, cells, c });
const node = (a, x, y_, s, c_, o_ = {}) => bx(a, x, y_, 560, 110, s, c_, { size: 24, ...o_ });

SCENES[0] = mk({
  label: 'OUVERTURE', color: b,
  els: [
    code('L001', 100, 200, 900, 330, 'export.txt', [['L001', 'ACC,FR7612345,Durand,Alice', g], ['L001', 'OP,2026-10-01 09:15:00,D,120.50', b], ['L001', 'OP,2026-10-01 10:02:00,C,2000.00', b], ['L001', 'ACC,FR7698765,Martin,Paul', g], ['L001', 'OP,2026-10-02 14:30:00,D,15.00', b]], { size: 24, accent: b }),
    ch('L001', 1450, 360, 'un seul format attendu ?', r, { size: 32 }),
    ch('L002', 400, 640, 'fichiers', g, { size: 30 }), ch('L002', 800, 640, 'bases', b, { size: 30 }), ch('L002', 1200, 640, 'services', p, { size: 30 }),
    pl('L003', 400, 800, 1, 'open', g, { size: 28 }), pl('L003', 800, 800, 2, 'update (à chaque chunk)', b, { size: 28 }), pl('L003', 1350, 800, 3, 'close', d, { size: 28 }),
    pl('L004', 200, 960, 1, 'catalogue', g, { size: 22 }), pl('L004', 600, 960, 2, 'plusieurs formats', b, { size: 22 }), pl('L004', 1050, 960, 3, 'rupture de contrôle', o, { size: 22 }), pl('L004', 1500, 960, 4, 'pages', p, { size: 22 }), pl('L004', 1750, 960, 5, 'perso', r, { size: 22 }),
  ],
  cues: [{ a: 'L001', s: 'pop' }, { a: 'L004', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'CATALOGUE', color: g, part: '3B.1 · LE CATALOGUE DES READERS',
  els: [
    bx('L005', 960, 520, 300, 100, 'READERS', g, { size: 34 }),
    node('L008', 330, 330, 'fichier : FlatFileItemReader', b), node('L009', 1590, 330, 'fichiers : MultiResource · Stax · Json', b),
    node('L010', 330, 720, 'base : JdbcCursor · JdbcPaging · Jpa', p), node('L011', 1590, 720, 'procédure · Mongo (Paging, Cursor)', p), node('L012', 960, 900, 'Spring Data : Repository · service : Adapter', o),
    ar('L008', 810, 470, 600, 370, d), ar('L009', 1110, 470, 1320, 370, d), ar('L010', 810, 570, 600, 680, d), ar('L011', 1110, 570, 1320, 680, d), ar('L012', 960, 570, 960, 840, d),
    ch('L013', 960, 410, 'Hibernate : disparu en version 6', r, { size: 28 }), cr('L014', 640, 410, 30, r), ch('L015', 960, 640, 'JpaCursorItemReader · MongoCursor / MongoPaging : nouveaux', g, { size: 22 }),
    ch('L016', 960, 220, 'infrastructure.item.* · plus de BuilderFactory', o, { size: 24 }), ch('L006', 960, 170, 'read() : un élément, ou null', d, { size: 24 }), ch('L007', 1500, 170, 'source inhabituelle : reader maison', o, { size: 22 }),
    ch('L019', 1550, 1000, 'plusieurs formats →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L017', a: 'L018', question: 'Un tutoriel te demande HibernateCursorItemReader. Que fais-tu en Spring Batch 6 ?', choices: ["je l'utilise", 'JPA', "je l'écris moi-même"], win: 1, answer: 'JPA : JpaCursorItemReader ou JpaPagingItemReader. Aucun reader Hibernate natif en 6.0.6.' }],
  cues: [{ a: 'L013', s: 'error' }, { a: 'L015', s: 'success' }],
});

SCENES[2] = mk({
  label: 'PLUSIEURS_FORMATS', color: b, part: '3B.2 · FICHIERS À PLUSIEURS FORMATS',
  els: [
    code('L020', 100, 200, 860, 300, 'export.txt', [['L020', 'ACC,FR7612345,Durand,Alice', g], ['L020', 'OP,2026-10-01 09:15:00,D,120.50', b], ['L020', 'OP,2026-10-01 10:02:00,C,2000.00', b]], { size: 22, accent: b }),
    ch('L021', 1300, 270, 'ACC : prefix, compte, nom, prénom', g, { size: 24 }), ch('L021', 1300, 340, 'OP : prefix, date, type, montant', b, { size: 24 }),
    ch('L022', 1300, 430, 'un seul tokenizer qui devine…', o, { size: 24, b: 'L024' }), ch('L023', 1300, 500, 'illisible à 3 ou 4 formats', r, { size: 24, b: 'L024' }),
    ch('L024', 1300, 430, 'un tokenizer par format', g, { size: 26 }),
    code('L025', 100, 540, 1450, 410, 'rawLineReader', [
      ['L025', 'accTokenizer.setNames("prefix", "accountNumber", "lastName", "firstName");', g], ['L026', 'opTokenizer.setNames("prefix", "date", "type", "amount");', b],
      ['L027', 'var mapper = new PatternMatchingCompositeLineMapper<Object>();', y], ['L028', 'mapper.setTokenizers(Map.of("ACC*", accTokenizer, "OP*", opTokenizer));', o],
      ['L029', 'mapper.setFieldSetMappers(… fs.readBigDecimal("amount") …);', C.text], ['L030', '.name("rawLineReader").lineMapper(mapper).build();', g]], { size: 21 }),
    ch('L031', 1700, 620, 'AccountLine · OperationLine', p, { size: 22 }), ch('L033', 1700, 720, 'motif de rejet explicite', g, { size: 22 }),
    ch('L034', 1550, 1000, 'rupture de contrôle →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L032', a: 'L033', question: 'Le fichier contient une ligne qui commence par XYZ. Que se passe-t-il ?', choices: ['ignorée', 'erreur', 'traitée comme OP'], win: 1, answer: 'Une erreur : aucun motif ne correspond. Prévois un motif par format, et un motif de rejet explicite.' }],
  cues: [{ a: 'L027', s: 'pop' }, { a: 'L023', s: 'error' }],
});

SCENES[3] = mk({
  label: 'RUPTURE_CONTROLE', color: o, part: '3B.3 · UN COMPTE ET SES OPÉRATIONS',
  els: [
    code('L038', 100, 190, 1100, 660, 'AccountReader.java', [
      ['L038', 'public class AccountReader implements ItemStreamReader<Account> {', y], ['L039', '  SingleItemPeekableItemReader<Object> source;', b], ['L040', '  source.setDelegate(delegate);'],
      ['L041', '  if (!(source.read() instanceof AccountLine head)) return null;', g], ['L042', '  while (source.peek() instanceof OperationLine)', o], ['L042', '      operations.add((OperationLine) source.read());'],
      ['L043', '  return new Account(head.accountNumber(), …, operations);', g], ['L046', '  open(ctx) / update(ctx) / close()   →   source', r]], { size: 21 }),
    ch('L036', 1500, 240, 'ACC', g, { size: 26 }), ch('L036', 1500, 300, 'OP', b, { size: 26 }), ch('L036', 1500, 360, 'OP', b, { size: 26 }), ch('L036', 1500, 420, 'ACC', g, { size: 26 }),
    ch('L035', 1500, 180, 'Account + opérations', y, { size: 24 }), ch('L037', 1500, 500, 'peek : regarder sans consommer', o, { size: 22 }),
    ch('L044', 1500, 580, 'chunk de 100 = 100 comptes', g, { size: 24 }), ch('L045', 1500, 650, 'rupture de contrôle', b, { size: 24 }), ch('L047', 1500, 720, 'update oublié : rien sauvegardé', r, { size: 22 }), ch('L052', 1500, 790, 'saveState(false) : multithread', d, { size: 22 }),
    ch('L053', 1550, 1000, 'lire par pages →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L048', a: 'L049', question: "Avec le fichier d'exemple, combien d'Account le reader retourne-t-il ?", choices: ['2', '3', '6'], win: 1, answer: 'Trois : Alice avec deux opérations, Martin sans opération, Bernard avec une.' },
         { q: 'L050', a: 'L051', question: 'Chunk de cent : combien de lignes du fichier dans une transaction ?', choices: ['100', 'moins de 100', 'plus de 100'], win: 2, answer: 'Plus de cent : cent comptes, plus toutes leurs lignes d\'opération.' }],
  cues: [{ a: 'L043', s: 'success' }, { a: 'L047', s: 'error' }],
});

SCENES[4] = mk({
  label: 'PAGINATION', color: p, part: '3B.4 · LIRE POSTGRESQL PAR PAGES',
  els: [
    code('L058', 100, 190, 1250, 640, 'pagedReader', [
      ['L058', 'new JdbcPagingItemReaderBuilder<BankTransaction>()', C.text], ['L058', '    .name("pagedReader")', r], ['L059', '    .dataSource(dataSource).queryProvider(queryProvider)', b],
      ['L060', '    .parameterValues(Map.of("account", accountNumber)).pageSize(500)', g], ['L061', '    .rowMapper((rs, i) -> new BankTransaction(…)).build();', y],
      ['L062', 'new SqlPagingQueryProviderFactoryBean()   // détecte PostgreSQL', o], ['L063', '  setSelectClause(…)  setFromClause(…)  setWhereClause(…)'], ['L064', '  setSortKey("id");', r]], { size: 21 }),
    ch('L054', 1600, 230, 'pages de 500, mémoire constante', b, { size: 22 }), ch('L055', 1600, 310, 'curseur : une connexion tenue', o, { size: 22 }), ch('L056', 1600, 390, 'pagination : une requête par page', g, { size: 22 }), ch('L057', 1600, 470, 'prix : un tri obligatoire', r, { size: 22 }),
    ch('L065', 1600, 560, 'clé unique, jamais modifiée', y, { size: 24 }), ch('L068', 1600, 640, 'curseur PostgreSQL : auto-commit + fetchSize', b, { size: 20 }),
    ch('L069', 960, 880, 'session JPA : chaque entité mémorisée, mémoire qui gonfle', r, { size: 24 }), ch('L070', 960, 950, 'ORM : raccourci · JDBC : performance', g, { size: 24 }),
    ch('L071', 1550, 1000, 'readers personnalisés →', r, { size: 26 }),
  ],
  quiz: [{ q: 'L066', a: 'L067', question: 'Tri des pages sur transaction_date, plusieurs transactions ont la même date. Quel risque ?', choices: ['aucun', 'lignes sautées ou doublées', 'erreur SQL'], win: 1, answer: "Des lignes sautées ou lues deux fois, sans erreur. Trie sur une clé unique, comme l'identifiant." }],
  cues: [{ a: 'L057', s: 'pop' }, { a: 'L065', s: 'stamp' }],
});

SCENES[5] = mk({
  label: 'PERSONNALISE', color: r, part: '3B.5 · READERS PERSONNALISÉS, ENTRÉES VIDES, ERREURS',
  els: [
    code('L074', 100, 190, 1250, 400, 'ExternalAccountsReader.java', [
      ['L074', 'public class ExternalAccountsReader', C.text], ['L074', '    extends AbstractItemCountingItemStreamItemReader<AccountLine> {', y], ['L075', '  setName("externalAccountsReader");', r],
      ['L076', '  doOpen()  { iterator = client.fetchAll().iterator(); }', b], ['L077', '  doRead()  { return iterator.hasNext() ? iterator.next() : null; }', g], ['L078', '  doClose() { iterator = null; }', d]], { size: 21, b: 'L084' }),
    ch('L072', 1600, 230, 'service interne → reader → job', b, { size: 22, b: 'L084' }), ch('L073', 1600, 310, 'open/update à la main : fragile', o, { size: 22, b: 'L084' }), ch('L079', 1600, 390, 'la classe de base saute les éléments lus', g, { size: 20, b: 'L084' }), ch('L080', 1600, 470, '1 000 comptes : ok · 10 M : non', r, { size: 22, b: 'L084' }),
    ch('L083', 960, 640, 'une liste retournée = un seul élément', r, { size: 26, b: 'L084' }),
    ch('L084', 1500, 230, 'fichier vide : step COMPLETED', o, { size: 24, b: 'L088' }), ch('L085', 1500, 300, 'lot vert sans donnée : inaperçu', r, { size: 24, b: 'L088' }),
    code('L086', 100, 190, 1300, 200, 'EmptyInputFailer', [['L086', 'afterStep(StepExecution se) {', C.text], ['L086', '  return se.getReadCount() > 0 ? se.getExitStatus() : ExitStatus.FAILED;', g]], { size: 22, b: 'L088' }),
    ch('L087', 1500, 380, 'puis alerte (module 5)', b, { size: 22, b: 'L088' }),
    code('L089', 100, 190, 1500, 160, 'skip', [['L089', '.faultTolerant().skip(FlatFileParseException.class).skipLimit(10)', o]], { size: 22, b: 'L093' }),
    ch('L088', 1600, 300, 'ignorer des erreurs : aperçu', d, { size: 22, b: 'L093' }), ch('L090', 960, 420, 'onzième ligne : le step échoue', r, { size: 26, b: 'L093' }), ch('L091', 960, 490, 'ignorer sans consigner : inacceptable', r, { size: 26, b: 'L093' }), ch('L092', 960, 560, 'listener de rejets : numéro de ligne + texte brut', g, { size: 24, b: 'L093' }),
    ch('L093', 500, 300, 'MultiResourceItemReader : liste de fichiers', b, { size: 26 }), ch('L094', 500, 380, 'restart : liste recalculée, fichier 3 ajouté', r, { size: 26 }), ch('L095', 500, 460, 'un répertoire par exécution', g, { size: 26 }),
    ch('L098', 1550, 1000, 'Top 10 →', r, { size: 28 }),
  ],
  quiz: [{ q: 'L081', a: 'L082', question: "Une méthode d'ItemReaderAdapter ne retourne jamais null. Que se passe-t-il ?", choices: ['le step se termine', 'boucle infinie', 'erreur'], win: 1, answer: 'Une boucle infinie : le step ne se termine jamais. La méthode doit retourner null à la fin.' },
         { q: 'L096', a: 'L097', question: 'Un job échoue au deuxième fichier, un troisième arrive avant la reprise. Que traite la reprise ?', choices: ['fichier 2 seul', 'fichiers 2 et 3', 'tout depuis 1'], win: 1, answer: 'Elle traite aussi le troisième fichier : la liste est recalculée. Un répertoire par exécution évite le problème.' }],
  cues: [{ a: 'L091', s: 'error' }, { a: 'L094', s: 'error' }, { a: 'L092', s: 'success' }],
});

SCENES[6] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L099', 100, 190, PC2, PH2, [
      row('L100', ['1', 'reader enveloppe sans open/update/close', 'fichier jamais fermé, aucune position', 'retransmettre les trois'], r), row('L102', ['2', 'motif absent (composite)', 'erreur sur une ligne inconnue', 'un motif par format + rejet'], o),
      row('L104', ['3', 'FixedLength en mode strict', 'ligne trop longue ou courte : échec', 'caler les colonnes'], o), row('L106', ['4', 'espaces conservés (positions fixes)', 'Durand ≠ « Durand    »', 'nettoyer dans le mapper'], o),
      row('L108', ['5', 'tri de pagination non unique', 'lignes sautées ou doublées', 'clé de tri unique'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L101', 'L102', [['batch_step_execution_context : vide après le premier chunk', r]]), extrait2('L103', 'L104', [['IllegalStateException: Could not map … "XYZ,…"', r]]),
    extrait2('L105', 'L106', [['IncorrectLineLengthException: Line is longer than max', r]]), extrait2('L107', 'L108', [['"Durand    "  ≠  "Durand"   (jointure vide)', r]]),
    extrait2('L109', null, [['source : 1 000 000 lignes   destination : 999 987 lignes', r]]),
  ],
  cues: [{ a: 'L100', s: 'pop' }, { a: 'L102', s: 'pop' }, { a: 'L104', s: 'pop' }, { a: 'L106', s: 'pop' }, { a: 'L108', s: 'alarm', g: -12 }],
});

SCENES[7] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L110', 100, 190, PC2, PH2, [
      row('L111', ['6', 'MultiResource + restart', 'un fichier ajouté est traité', 'répertoire par exécution'], o), row('L113', ['7', 'Adapter qui ne retourne pas null', 'boucle infinie', 'null à la fin'], r),
      row('L115', ['8', 'méthode qui retourne une liste', 'la liste = un seul élément', 'un élément à la fois'], o), row('L117', ['9', 'fichier vide = succès', 'lot réussi sans donnée', 'EmptyInputFailer'], o),
      row('L119', ['10', 'erreurs ignorées sans consigner', 'lignes disparues, sans trace', 'listener de rejets'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L112', 'L113', [['Resource list : [f1, f2]   puis   [f1, f2, f3]', r]]), extrait2('L114', 'L115', [['read_count = 48213   status = STARTED', r]]),
    extrait2('L116', 'L117', [['read_count = 1   (la liste contenait 1000 éléments)', r]]), extrait2('L118', 'L119', [['status = COMPLETED   read_count = 0', r]]),
    extrait2('L120', null, [['skip_count = 7   journal des rejets : vide', r]]), ch('L121', 960, 990, 'chaque piège ressemble à un détail, jusqu\'au premier incident', y, { size: 24 }),
  ],
  cues: [{ a: 'L111', s: 'pop' }, { a: 'L113', s: 'alarm', g: -12 }, { a: 'L115', s: 'pop' }, { a: 'L117', s: 'pop' }, { a: 'L119', s: 'pop' }],
});

SCENES[8] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    code('L122', 100, 200, 900, 220, 'export.txt', [['L122', 'ACC … / OP … / OP … / ACC …', g]], { size: 26, accent: b }),
    pl('L123', 1100, 240, 1, 'un tokenizer par format · enveloppe : open, update, close', g, { size: 22 }), pl('L124', 1100, 320, 2, 'pagination triée sur clé unique · répertoire par exécution', b, { size: 22 }),
    cd('L125', 100, 500, 410, 300, 'Exercice 1', ["Combien d'Account, avec combien d'opérations ?"], b, { size: 22 }), cd('L126', 540, 500, 410, 300, 'Exercice 2', ['Chunk de 100 : combien de lignes ? Pourquoi pas 100 ?'], o, { size: 22 }),
    cd('L127', 980, 500, 410, 300, 'Exercice 3', ['Tri sur la date, dates identiques : risque ?'], p, { size: 22 }), cd('L128', 1420, 500, 400, 300, 'Exercice 4', ['Répertoire partagé, 3e fichier : que traite la reprise ?'], r, { size: 22 }),
    bar('L129', 960, 930, 800, 36, [['L129', 1], ['L130', 0]], y, { label: 'réfléchis…', b: 'L130' }),
    ch('L130', 520, 840, '3 comptes : 2, 0, 1 · plus de 100 lignes', g, { size: 22 }), ch('L131', 1350, 840, 'clé unique · 3e fichier traité aussi', g, { size: 22 }),
    ch('L132', 1500, 990, 'Module 4 : processors, scopes, proxys →', o, { size: 26 }),
  ],
  cues: [{ a: 'L130', s: 'success' }, { a: 'L132', s: 'levelup', g: -10 }],
});
