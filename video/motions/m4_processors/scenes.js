// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 4' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 4' };

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
const pills = (a, items, y_, sz = 22) => items.map(([n, s, c_, x], i) => pl(a, x, y_, n, s, c_, { size: sz }));

SCENES[0] = mk({
  label: 'OUVERTURE', color: r,
  els: [
    cd('L001', 100, 200, 700, 240, 'Rapport de fin de nuit', ['total des débits : faux', 'deux nuits cumulées'], r), ch('L001', 1250, 300, 'découvert trois semaines plus tard', o, { size: 28 }),
    ch('L002', 960, 540, 'un champ modifiable dans un singleton', r, { size: 40 }),
    ch('L003', 480, 680, 'return null  →  filterCount (jamais skipCount)', g, { size: 28 }), ch('L004', 1400, 680, 'singleton : un seul objet, état partagé', b, { size: 28 }),
    ...pills('L005', [[1, 'rôle', g, 120], [2, 'validation', b, 400], [3, 'composite', p, 740], [4, "l'état", r, 1050], [5, 'solutions', g, 1330], [6, 'proxys', o, 1620], [7, 'pièges', r, 1840]], 960, 20),
  ],
  cues: [{ a: 'L002', s: 'error' }, { a: 'L005', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'ROLE', color: g, part: '4.1 · LE RÔLE DU PROCESSOR',
  els: [
    bx('L006', 150, 400, 220, 100, 'READER', b, { size: 28 }), bx('L007', 560, 400, 280, 110, 'PROCESSOR', o, { size: 32 }), ar('L007', 270, 400, 410, 400, d),
    bx('L008', 1250, 290, 520, 90, 'transformer : entre dans le chunk', g, { size: 24 }), bx('L009', 1250, 420, 520, 90, 'filtrer : null, filterCount + 1', d, { size: 24 }), bx('L010', 1250, 550, 520, 90, 'rejeter : exception, rollback', r, { size: 24 }),
    ar('L008', 700, 380, 990, 300, g), ar('L009', 700, 400, 990, 420, d), ar('L010', 700, 420, 990, 540, r),
    ch('L011', 700, 640, 'ItemProcessor<RawTransaction, BankTransaction>', y, { size: 26 }), ch('L012', 700, 720, 'read_count = write_count + filter_count', b, { size: 26 }),
    ch('L015', 1500, 960, 'valider →', g, { size: 28 }),
  ],
  quiz: [{ q: 'L013', a: 'L014', question: 'Un processor lève une exception sur un élément. Que devient le chunk ?', choices: ['il continue', 'annulé en entier', 'écrit sans cet élément'], win: 1, answer: 'Il est annulé en entier, avec un rollback. Le step échoue, sauf règle de skip (module 6).' }],
  cues: [{ a: 'L010', s: 'error' }],
});

SCENES[2] = mk({
  label: 'VALIDATION', color: b, part: '4.2 · VALIDER AVEC BEAN VALIDATION',
  els: [
    code('L018', 100, 190, 1250, 560, 'RawTransaction.java', [
      ['L018', '<artifactId>spring-boot-starter-validation</artifactId>', o], ['L019', 'record RawTransaction(@Positive long id,', C.text], ['L019', '    @NotBlank String accountNumber,', g], ['L020', '    @Pattern(regexp = "[DC]") String transactionType,', y],
      ['L020', '    @NotNull @PositiveOrZero BigDecimal amount) { }', g], ['L021', 'new BeanValidatingItemProcessor<RawTransaction>()', b], ['L023', 'validating.setFilter(true);', o]], { size: 22 }),
    ch('L016', 1600, 260, 'sans cascade de if', d, { size: 24 }), ch('L017', 1600, 340, 'règles = annotations', g, { size: 24 }), ch('L022', 1600, 430, 'défaut : ValidationException', r, { size: 24 }), ch('L023', 1600, 510, 'filtré, filterCount + 1', g, { size: 24 }),
    ch('L024', 960, 850, 'arrêter le lot, ou écarter et compter ?', y, { size: 34 }), ch('L026', 960, 930, 'sans le starter : aucune règle appliquée', r, { size: 26 }),
  ],
  quiz: [{ q: 'L025', a: 'L026', question: 'Tu oublies le starter de validation. Que se passe-t-il ?', choices: ['erreur au démarrage', 'aucune règle appliquée', 'toutes les lignes filtrées'], win: 1, answer: 'Rien ne se plaint : aucune règle appliquée, toutes les lignes passent, même invalides.' }],
  cues: [{ a: 'L022', s: 'error' }],
});

SCENES[3] = mk({
  label: 'COMPOSITE', color: p, part: '4.3 · TRANSFORMER ET COMPOSER',
  els: [
    code('L028', 100, 190, 1300, 340, 'processors', [['L028', 'static final DateTimeFormatter FORMAT = …("dd/MM/yyyy HH:mm");', g], ['L029', 'if (raw.amount().signum() == 0) return null;', o], ['L031', 'new CompositeItemProcessor<>(validationProcessor, transformProcessor)', y]], { size: 22 }),
    ch('L027', 1650, 260, 'une responsabilité chacun', d, { size: 22 }), ch('L030', 1650, 340, 'aucun champ modifiable : sûr', g, { size: 22 }),
    bx('L032', 200, 680, 300, 100, 'Raw', b, { size: 26 }), bx('L032', 560, 680, 300, 100, 'validation', o, { size: 26 }), bx('L032', 920, 680, 300, 100, 'Raw', b, { size: 26 }), bx('L032', 1280, 680, 300, 100, 'transformation', g, { size: 24 }), bx('L032', 1640, 680, 300, 100, 'Bank', p, { size: 26 }),
    ar('L032', 350, 680, 410, 680, d), ar('L032', 710, 680, 770, 680, d), ar('L032', 1070, 680, 1130, 680, d), ar('L032', 1430, 680, 1490, 680, d),
    ch('L033', 560, 800, 'null : la chaîne s\'arrête', o, { size: 24 }), ch('L034', 960, 870, 'validation en premier', g, { size: 28 }), ch('L035', 1500, 800, 'génériques effacés : erreur à l\'exécution', r, { size: 22 }),
    ch('L038', 1550, 1000, "le piège de l'état →", r, { size: 26 }),
  ],
  quiz: [{ q: 'L036', a: 'L037', question: "Tu inverses l'ordre : transformation d'abord, validation ensuite. Que se passe-t-il ?", choices: ['rien', 'ClassCastException', 'validation ignorée'], win: 1, answer: 'ClassCastException à l\'exécution : la validation reçoit un BankTransaction. Le compilateur n\'a rien vu.' }],
  cues: [{ a: 'L035', s: 'error' }],
});

SCENES[4] = mk({
  label: 'ETAT', color: r, part: "4.4 · LE PROCESSOR QUI A UN ÉTAT",
  els: [
    code('L041', 100, 190, 1300, 560, 'AnalyticsProcessor.java', [
      ['L041', '@Component   // singleton', r], ['L041', 'public class AnalyticsProcessor', C.text], ['L041', '    implements ItemProcessor<BankTransaction, BankTransaction> {'], ['L042', '  private BigDecimal totalDebit  = BigDecimal.ZERO;', y], ['L042', '  private BigDecimal totalCredit = BigDecimal.ZERO;', y],
      ['L043', '  if (t.transactionType().equals("D")) totalDebit = totalDebit.add(t.amount());', o], ['L043', '  else totalCredit = totalCredit.add(t.amount());', o], ['L044', '  return t;']], { size: 21 }),
    ch('L039', 1650, 250, 'rapport : débits et crédits', d, { size: 22 }), ch('L040', 1650, 330, 'accumuler dans des champs', o, { size: 22 }), ch('L045', 1650, 410, 'GET /analytics lit les totaux', b, { size: 22 }), ch('L046', 1650, 490, 'test à un lancement : vert', g, { size: 22 }),
    ch('L049', 1500, 960, 'le deuxième lancement →', r, { size: 28 }),
  ],
  quiz: [{ q: 'L047', a: 'L048', question: 'Quel total affiche le premier lancement ?', choices: ['135,50', '271,00', '0'], win: 0, answer: 'Cent trente-cinq virgule cinquante : exact. Le bug est silencieux au premier lancement.' }],
  cues: [{ a: 'L042', s: 'pop' }],
});

SCENES[5] = mk({
  label: 'DOUBLE_COMPTAGE', color: r, part: '4.5 · LA DÉMONSTRATION DU DOUBLE COMPTAGE',
  els: [
    tb('L050', 100, 200, [520, 200, 300, 300], ['lancement', 'éléments', 'débit affiché', 'crédit affiché'], [
      row('L051', ['1er  (2026-10-01)', '4', '135,50', '2 350,75'], g), row('L052', ['2e  (2026-10-02, même JVM)', '4', '271,00', '4 701,50'], r), row('L054', ['3e', '4', '406,50', '7 052,25'], r)], { size: 26, rh: 72, fam: MONO, noBold: true }),
    ch('L053', 1720, 720, 'crédit : 4 701,50', r, { size: 20 }),
    ch('L050', 1600, 260, 'fichier : 4 lignes traitées', b, { size: 24 }), ch('L055', 1600, 340, 'COMPLETED partout, chiffres faux', r, { size: 24 }), ch('L056', 1600, 420, 'application vivante : API, planificateur', o, { size: 22 }),
    ch('L057', 1600, 500, 'jamais au premier lancement', y, { size: 24 }), ch('L058', 1600, 580, 'redémarrage : tout redevient normal', d, { size: 22 }),
    code('L061', 100, 640, 1500, 250, 'test', [['L061', 'jobOperator.start(bankJob, params("2026-10-01"));  var first = totals();', C.text], ['L061', 'jobOperator.start(bankJob, params("2026-10-02"));  var second = totals();', C.text], ['L062', 'assertThat(second.totalDebit()).isEqualByComparingTo(first.totalDebit());', y]], { size: 22 }),
    ch('L063', 1700, 760, 'rouge avec le singleton', r, { size: 24 }), ch('L064', 1550, 1000, 'StepScope et proxy →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L059', a: 'L060', question: 'Pourquoi un test à un seul lancement ne voit-il pas le bug ?', choices: ['il est trop rapide', 'le singleton naît à zéro', 'le test est mal écrit'], win: 1, answer: 'Le singleton naît à zéro : le premier lancement part toujours de zéro. Le défaut n\'apparaît qu\'au deuxième.' }],
  cues: [{ a: 'L052', s: 'error' }, { a: 'L054', s: 'error' }, { a: 'L055', s: 'alarm', g: -12 }],
  fx: [{ a: 'L052', glitch: 0.5, dur: 0.35 }],
});

SCENES[6] = mk({
  label: 'STEPSCOPE_PROXY', color: p, part: '4.6 · STEPSCOPE ET PROXY',
  els: [
    ch('L065', 960, 190, 'singleton : étapes 1 à 7 au démarrage, une seule fois', d, { size: 26 }),
    bx('L066', 420, 360, 440, 140, 'singleton', r, { sub: 'totalDebit : 135,50 → 271,00', size: 32 }),
    ch('L067', 1300, 250, '@StepScope : une ligne en plus', g, { size: 28 }), bx('L068', 1300, 370, 460, 110, 'proxy CGLIB (étape 6)', d, { size: 26 }), ch('L069', 1300, 460, 'injecté dans le composite et le step', d, { size: 20 }),
    bx('L070', 1300, 570, 400, 90, 'contexte step', o, { size: 26 }), ar('L070', 1300, 430, 1300, 525, d),
    bx('L071', 1000, 740, 320, 100, 'instance 1 (neuve)', b, { size: 24, b: 'L073' }), ar('L071', 1200, 615, 1050, 690, g), ch('L072', 1650, 740, 'appels délégués', d, { size: 22 }),
    bx('L073', 1000, 740, 320, 100, 'instance 2 (neuve)', g, { size: 24 }), ch('L073', 1600, 830, 'instance 1 détruite', d, { size: 22 }), ch('L074', 960, 930, 'proxy permanent · instances éphémères', y, { size: 30 }),
  ],
  quiz: [{ q: 'L075', a: 'L076', question: 'Tu ajoutes StepScope à un processor. À quel moment le champ repart-il à zéro ?', choices: ['au démarrage appli', 'à chaque exécution du step', 'jamais'], win: 1, answer: 'À chaque exécution du step : une nouvelle instance, donc des champs neufs.' }],
  cues: [{ a: 'L068', s: 'reveal' }, { a: 'L073', s: 'success' }],
});

SCENES[7] = mk({
  label: 'TROIS_SOLUTIONS', color: g, part: '4.6 · LES TROIS SOLUTIONS',
  els: [
    ch('L077', 960, 150, 'trois solutions, de la meilleure à la pire', y, { size: 24 }),
    cd('L078', 100, 190, 560, 190, '1 · Pas d\'état', ['l\'état va dans l\'ExecutionContext'], g, { b: 'L090' }), cd('L085', 680, 190, 560, 190, '2 · @StepScope', ['un champ, neuf à chaque exécution'], b, { b: 'L090' }), cd('L087', 1260, 190, 560, 190, '3 · Reset manuel', ['à éviter'], r, { b: 'L090' }),
    code('L080', 100, 420, 1400, 520, 'AnalyticsProcessor (ExecutionContext)', [
      ['L080', '@Component @StepScope', o], ['L081', 'private final ExecutionContext context;', y], ['L082', 'ctor(@Value("#{stepExecution.executionContext}") ExecutionContext context)', b],
      ['L083', 'String key = D ? "totalDebitCents" : "totalCreditCents";', C.text], ['L083', 'long cents = t.amount().movePointRight(2).longValueExact();', C.text], ['L084', 'context.putLong(key, context.getLong(key, 0L) + cents);', g]], { size: 21, b: 'L090' }),
    ch('L079', 1650, 460, 'persisté à chaque commit', b, { size: 22, b: 'L090' }), ch('L084', 1650, 540, 'restart : reprend au dernier commit', g, { size: 20, b: 'L090' }),
    ch('L086', 1650, 620, 'en mémoire : perdu au restart', r, { size: 22, b: 'L090' }), ch('L088', 1650, 700, 'reset oublié', r, { size: 24, b: 'L090' }), ch('L089', 1650, 780, 'deux steps : bug en pire', r, { size: 22, b: 'L090' }),
    tb('L090', 100, 450, [560, 400, 400, 400], ['', "pas d'état", '@StepScope', 'reset manuel'], [
      row('L090', ['neuf à chaque exécution', 'oui', 'oui', "si on y pense"], b), row('L091', ['survit à un restart', 'oui', 'non', 'non'], g), row('L091', ['deux exécutions simultanées', 'sûr', 'sûr', 'dangereux'], o)], { size: 24, rh: 70 }),
    ch('L094', 1500, 1000, 'total faux malgré tout →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L092', a: 'L093', question: 'Quelle solution survit à un restart en plein step ?', choices: ['ExecutionContext', 'StepScope', 'reset manuel'], win: 0, answer: 'L\'ExecutionContext : persisté à chaque commit, le total reprend où il s\'était arrêté.' }],
  cues: [{ a: 'L084', s: 'success' }, { a: 'L089', s: 'error' }],
});

SCENES[8] = mk({
  label: 'REJEU_ET_PROXYS', color: o, part: '4.6 · REJEU DU CHUNK, LIMITES DES PROXYS',
  els: [
    bx('L095', 300, 300, 420, 100, 'chunk rejoué', o, { size: 28 }), ch('L096', 800, 300, 'élément 37 traité deux fois', r, { size: 26 }), ch('L096', 1400, 300, 'total du processor : compté deux fois', r, { size: 24 }),
    ch('L097', 960, 400, 'pas de chiffre qui engage l\'entreprise dans un processor', y, { size: 28 }), ch('L098', 960, 480, 'SELECT SUM(amount) … GROUP BY transaction_type', g, { size: 24 }), ch('L099', 960, 560, 'processor : 1 250,00   ·   SQL : 1 200,00 (juste)', b, { size: 24 }),
    ch('L100', 500, 700, 'SimpleDateFormat : état interne, 2 threads', r, { size: 24 }), ch('L101', 1400, 700, 'DateTimeFormatter : immuable', g, { size: 24 }),
    ch('L102', 400, 800, 'proxy CGLIB = sous-classe', d, { size: 24 }), ch('L103', 960, 800, 'record, classe final : impossible', r, { size: 24 }), ch('L104', 1500, 800, 'appel interne this.x() : contourné', r, { size: 22 }),
    ch('L107', 1550, 1000, "cas d'usage →", b, { size: 26 }),
  ],
  quiz: [{ q: 'L105', a: 'L106', question: 'Peut-on mettre StepScope sur un record ?', choices: ['oui', 'non'], win: 1, answer: 'Non : un record est final, CGLIB ne peut pas le sous-classer. La création du proxy échoue.' }],
  cues: [{ a: 'L096', s: 'error' }, { a: 'L103', s: 'error' }],
});

SCENES[9] = mk({
  label: 'CAS_USAGE', color: b, part: "CAS D'USAGE",
  els: [
    cd('L108', 100, 200, 560, 240, 'Rapport de fin de nuit', ['jour 1 exact', 'lendemain : deux nuits cumulées'], r), ch('L109', 380, 500, 'ExecutionContext ou SUM : plus de problème', g, { size: 22 }),
    cd('L110', 680, 200, 560, 240, 'Le tri des lignes', ['2 M de lignes, 8 % invalides'], o), ch('L111', 960, 500, 'validation en tête + filterCount', g, { size: 24 }),
    cd('L112', 1260, 200, 560, 240, "L'enrichissement", ["libellé d'agence ajouté"], p), ch('L113', 1540, 500, 'référentiel en lecture seule : sûr', g, { size: 22 }),
    ch('L114', 1550, 960, 'Top 10 des pièges →', r, { size: 28 }),
  ],
  cues: [{ a: 'L109', s: 'success' }],
});

SCENES[10] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L115', 100, 190, PC2, PH2, [
      row('L116', ['1', 'singleton avec état', 'double comptage entre lancements', 'sans état · StepScope'], r), row('L119', ['2', 'StepScope sur final ou record', 'échec de création du proxy', 'classe ordinaire'], o),
      row('L121', ['3', 'exception pour une ligne à ignorer', 'rollback, step en échec', 'return null'], o), row('L123', ['4', 'ordre incohérent du composite', 'ClassCastException', 'tester la chaîne'], o),
      row('L125', ['5', 'SimpleDateFormat partagé', 'dates fausses en multithread', 'DateTimeFormatter'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L117', 'L119', [['Total débit : 135,50   puis   271,00   (même application)', r]]), why('L118', 'L119', 'le premier lancement est toujours correct'),
    extrait2('L120', 'L121', [['Cannot subclass final class …', r]]), extrait2('L122', 'L123', [['ValidationException … chunk rolled back', r]]),
    extrait2('L124', 'L125', [['ClassCastException: BankTransaction cannot be cast to RawTransaction', r]]), extrait2('L126', null, [['NumberFormatException: multiple points', r]]),
  ],
  cues: [{ a: 'L116', s: 'alarm', g: -12 }, { a: 'L119', s: 'pop' }, { a: 'L121', s: 'pop' }, { a: 'L123', s: 'pop' }, { a: 'L125', s: 'pop' }],
});

SCENES[11] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L127', 100, 190, PC2, PH2, [
      row('L128', ['6', 'accumuler un total dans le processor', 'un chunk rejoué compte deux fois', 'SUM SQL'], r), row('L130', ['7', 'effet de bord dans le processor', 'répété à chaque rejeu', 'processor pur'], r),
      row('L132', ['8', 'requête par élément (N+1)', 'débit effondré', 'jointure ou cache'], o), row('L134', ['9', 'test vert, données fausses', 'transformation non vérifiée', 'asserter les valeurs'], r),
      row('L138', ['10', 'validation sans starter', 'aucune règle ou échec immédiat', 'starter + setFilter'], o)], { size: 21, rh: 70, noBold: true }),
    extrait2('L129', 'L130', [['processor : 1 250,00      SQL : 1 200,00', r]]), extrait2('L131', 'L132', [['mail envoyé : client 42', r], ['mail envoyé : client 42   (rejeu)', r]]),
    extrait2('L133', 'L134', [['1 000 000 × SELECT … WHERE id = ?', r]]), extrait2('L135', 'L138', [['transaction_date = now()   ✗      (test : hasSize(4) ✔)', r]]),
    code('L136', 100, 700, 1100, 120, 'processor fautif', [['L136', 'LocalDateTime.now()  // la vraie date est ignorée', r]], { size: 22, b: 'L138' }), ch('L137', 1500, 760, 'tester le processor seul, et le job deux fois', y, { size: 24, b: 'L138' }),
    extrait2('L139', null, [['amount = -50.00   (ligne invalide en base)', r]]), ch('L140', 960, 990, "chaque piège ressemble à un détail, jusqu'au premier incident", y, { size: 24 }),
  ],
  cues: [{ a: 'L128', s: 'pop' }, { a: 'L130', s: 'pop' }, { a: 'L132', s: 'pop' }, { a: 'L134', s: 'alarm', g: -12 }, { a: 'L138', s: 'pop' }],
});

SCENES[12] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    cd('L141', 100, 200, 700, 200, 'Le rapport faux', ['singleton avec champ modifiable'], r), pl('L142', 950, 240, 1, 'transformer, filtrer (null), rejeter · valider en premier', g, { size: 22 }),
    pl('L143', 950, 320, 2, 'singleton + état = double comptage · remèdes : contexte, StepScope, SUM', b, { size: 22 }), pl('L144', 950, 400, 3, 'proxy CGLIB : ni record, ni final', o, { size: 22 }),
    cd('L145', 100, 500, 560, 300, 'Exercice 1', ['Pourquoi le total d\'un processor StepScope peut-il être faux ?'], b, { size: 22 }), cd('L146', 680, 500, 560, 300, 'Exercice 2', ['Pourquoi StepScope échoue-t-il sur un record ?'], o, { size: 22 }),
    cd('L147', 1260, 500, 560, 300, 'Exercice 3', ['Ordre correct : validation puis transformation, pourquoi ?'], p, { size: 22 }),
    bar('L148', 960, 930, 800, 36, [['L148', 1], ['L149', 0]], y, { label: 'réfléchis…', b: 'L149' }),
    ch('L149', 380, 850, 'rejeu : le total compte deux fois', g, { size: 22 }), ch('L150', 960, 850, 'record = final, CGLIB ne sous-classe pas', g, { size: 22 }), ch('L150', 1540, 850, 'valider avant de transformer', g, { size: 22 }),
    ch('L151', 1500, 990, 'Module 5 : flux et orchestration →', o, { size: 26 }),
  ],
  cues: [{ a: 'L149', s: 'success' }, { a: 'L151', s: 'levelup', g: -10 }],
});
