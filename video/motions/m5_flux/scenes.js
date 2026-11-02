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


// ======================= Module 5 : scènes (les cinq images : colis, aiguillage, chef d'orchestre, jeu, péage) =======================
const code = (a, x, y, w_, h, title, rows, o_ = {}) => tm(a, x, y, w_, h, title, rows.map(([an, s, c]) => ({ a: an, s, c: c || C.text })), { size: 21, accent: g, ...o_ });
const extrait2 = (a, b_, rows) => tm(a, 100, 700, 1720, 250, 'extrait indicatif', rows.map(([s, c]) => ({ a, s, c })), { size: 22, accent: r, b: b_ });
const PH2 = ['#', 'Piège', 'Ce qui se passe', 'Parade'], PC2 = [80, 600, 560, 480];
const row = (a, cells, c) => ({ a, cells, c });
const pills = (a, items, y_, sz = 22) => items.map(([n, s, c_, x]) => pl(a, x, y_, n, s, c_, { size: sz }));

// ---------- Scène 0 : ouverture et les cinq images ----------
SCENES[0] = mk({
  label: 'OUVERTURE', color: r, part: '5 · FLUX ET ORCHESTRATION',
  els: [
    bx('L001', 360, 330, 360, 100, 'chargement : ÉCHEC', r, { size: 24, b: 'L002' }), bx('L001', 960, 330, 360, 100, 'alerte : OK', g, { b: 'L002' }), bx('L001', 1560, 330, 360, 100, 'job : COMPLETED', g, { size: 24, b: 'L002' }),
    ch('L001', 960, 470, "personne n'a rien vu de la nuit", y, { size: 30, b: 'L002' }),
    code('L002', 160, 220, 1600, 150, 'BankFlowJob', [['L002', '.from(loadBankStep).on("FAILED").to(alertStep)', C.text], ['L002', '        .on("*").end()      // au lieu de fail()', r]], { size: 28, accent: r, b: 'L003' }),
    tb('L003', 100, 220, [500, 300, 500], ['step', 'status', 'exit_code'], [row('L003', ['loadBankStep', 'COMPLETED', 'COMPLETED'], g)], { size: 26, rh: 60, b: 'L005' }),
    ch('L004', 960, 520, 'plans (singletons sans état) · exécution : JobExecution', b, { size: 28, b: 'L005' }),
    tx('L005', 960, 180, 'cinq images pour tout retenir', { size: 44, c: o, b: 'L008' }),
    cd('L006', 100, 250, 320, 300, 'Le colis', ['BatchStatus et ExitStatus'], o, { b: 'L008' }), cd('L006', 440, 250, 320, 300, "L'aiguillage", ['le flux conditionnel'], p, { b: 'L008' }), cd('L006', 780, 250, 320, 300, "Le chef d'orchestre", ['le decider'], b, { b: 'L008' }),
    cd('L007', 1120, 250, 320, 300, 'Le jeu de société', ['la machine à états'], g, { b: 'L008' }), cd('L007', 1460, 250, 320, 300, "Le péage", ['le split, threads et connexions'], y, { b: 'L008' }),
    ...pills('L008', [[1, 'graphe', b, 120], [2, 'colis', o, 400], [3, 'aiguillage', p, 680], [4, 'decider', b, 980], [5, 'moteur', g, 1260], [6, 'péage', y, 1520], [7, 'pièges', r, 1760]], 480, 22),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L002', s: 'pop' }, { a: 'L006', s: 'blip' }, { a: 'L008', s: 'blip' }],
});

// ---------- Scène 1 : du pipeline au graphe ----------
SCENES[1] = mk({
  label: 'GRAPHE', color: b, part: '5.1 · DU PIPELINE AU GRAPHE',
  els: [
    bx('L009', 360, 330, 260, 100, 'A', b, { b: 'L011' }), ar('L009', 490, 330, 670, 330, w, { b: 'L011' }), bx('L009', 800, 330, 260, 100, 'B', b, { b: 'L011' }), ar('L009', 930, 330, 1110, 330, w, { b: 'L011' }), bx('L009', 1240, 330, 260, 100, 'C', b, { b: 'L011' }),
    ch('L010', 960, 470, "voie unique : si A déraille, tout s'arrête", r, { size: 30, b: 'L011' }), cr('L010', 190, 330, 26, r, { b: 'L011' }),
    bx('L011', 360, 330, 380, 100, 'chargement', b, { b: 'L015' }), ch('L011', 360, 420, 'gare de départ', d, { size: 22, b: 'L015' }),
    ar('L012', 560, 330, 840, 230, g, { b: 'L015' }), ar('L012', 560, 330, 840, 330, o, { b: 'L015' }), ar('L012', 560, 330, 840, 430, r, { b: 'L015' }),
    bx('L012', 1020, 230, 340, 90, 'rapport', g, { size: 26, b: 'L015' }), bx('L012', 1020, 330, 340, 90, 'alerte : trop de rejets', o, { size: 22, b: 'L015' }), bx('L012', 1020, 430, 340, 90, 'alerte : échec', r, { size: 24, b: 'L015' }),
    bx('L014', 1560, 230, 220, 80, 'succès', g, { size: 24, b: 'L015' }), bx('L014', 1560, 430, 220, 80, 'échec', r, { size: 24, b: 'L015' }), ar('L014', 1200, 230, 1450, 230, g, { b: 'L015' }), ar('L014', 1200, 430, 1450, 430, r, { b: 'L015' }),
    ch('L013', 960, 580, 'gares = steps · aiguillages = décisions', y, { size: 32, b: 'L015' }), ch('L014', 960, 650, 'une gare de départ · trois directions · des terminus', g, { size: 28, b: 'L015' }),
    code('L015', 100, 200, 1300, 110, 'enchaînement simple', [['L015', '.start(a).next(b).next(c)', C.text]], { size: 30, accent: b, b: 'L017' }),
    code('L016', 100, 350, 1500, 140, 'enchaînement conditionnel', [['L016', '.start(a).on("COMPLETED").to(b)', C.text], ['L016', '.from(a).on("FAILED").to(c)', C.text]], { size: 26, accent: p, b: 'L017' }),
    ch('L018', 960, 330, "il s'arrête : il faut un flux conditionnel", o, { size: 40, b: 'L019' }),
    tx('L019', 960, 900, '5.2 · Le colis →', { size: 48, c: o }),
  ],
  quiz: [{ q: 'L017', a: 'L018', question: 'Dans un enchaînement simple, le step a échoue. Que fait le job ?', choices: ['il continue', "il s'arrête", 'il saute b'], win: 1, answer: "Il s'arrête. Pour réagir à l'échec, il faut un flux conditionnel." }],
  cues: [{ a: 'L010', s: 'error' }, { a: 'L012', s: 'pop' }, { a: 'L014', s: 'blip' }],
});

// ---------- Scène 2 : le colis ----------
SCENES[2] = mk({
  label: 'COLIS', color: o, part: "5.2 · BATCHSTATUS ET EXITSTATUS : L'HISTOIRE DU COLIS",
  els: [
    ch('L020', 960, 330, 'que regarde exactement un on ?', o, { size: 38, b: 'L021' }),
    bx('L021', 960, 290, 280, 130, 'COLIS', o, { size: 40, b: 'L027' }),
    cd('L022', 100, 420, 720, 270, 'État du colis · BatchStatus', ['en cours · livré · perdu', 'décidé par le transporteur : le framework', "toi, tu n'y touches pas"], b, { b: 'L027' }),
    cd('L024', 1100, 420, 720, 270, 'Mot du livreur · ExitStatus', ['« livré au voisin » · « boîte pleine »', 'le livreur écrit ce qu\'il veut', 'celui-là, tu peux le personnaliser'], o, { b: 'L027' }),
    ar('L023', 880, 350, 540, 420, b, { b: 'L027' }), ar('L025', 1040, 350, 1380, 420, o, { b: 'L027' }),
    ch('L026', 960, 760, "un on lit toujours le mot du livreur : l'ExitStatus", g, { size: 32, b: 'L027' }),
    tb('L027', 100, 200, [420], ['BatchStatus (fixe)'], [row('L027', ['STARTING'], b), row('L027', ['STARTED'], b), row('L027', ['STOPPING'], b), row('L027', ['STOPPED'], b), row('L027', ['FAILED'], r), row('L027', ['COMPLETED'], g), row('L027', ['ABANDONED'], d)], { size: 24, rh: 52, b: 'L029' }),
    tb('L028', 700, 200, [620], ['ExitStatus (libre)'], [row('L028', ['COMPLETED'], g), row('L028', ['FAILED'], r), row('L028', ['STOPPED'], o), row('L028', ['NOOP'], d), row('L028', ['COMPLETED_WITH_REJECTS'], y)], { size: 24, rh: 52, b: 'L029' }),
    bx('L029', 500, 330, 440, 90, 'BatchStatus COMPLETED', b, { size: 22, b: 'L031' }), bx('L029', 500, 450, 440, 90, 'ExitStatus COMPLETED', g, { size: 22, b: 'L031' }), ch('L029', 960, 390, 'identiques par défaut', d, { size: 24, b: 'L030' }),
    bx('L030', 1440, 330, 520, 90, 'BatchStatus COMPLETED', b, { size: 22, b: 'L031' }), bx('L030', 1440, 450, 520, 90, 'ExitStatus COMPLETED_WITH_REJECTS', y, { size: 20, b: 'L031' }), ch('L030', 960, 560, 'colis livré, mais le bordereau dit autre chose', o, { size: 28, b: 'L031' }),
    ch('L031', 960, 330, 'chargement réussi · 150 lignes rejetées', o, { size: 36, b: 'L032' }),
    code('L032', 100, 200, 1400, 340, 'RejectsExitListener', [
      ['L032', 'public class RejectsExitListener implements StepExecutionListener {', C.text],
      ['L033', '  @Override public ExitStatus afterStep(StepExecution stepExecution) {', g],
      ['L034', '    if (stepExecution.getStatus() != BatchStatus.COMPLETED) return stepExecution.getExitStatus();', o],
      ['L035', '    if (stepExecution.getFilterCount() > MAX_REJECTS)', b],
      ['L035', '      return new ExitStatus("COMPLETED_WITH_REJECTS");', y],
      ['L036', '    return stepExecution.getExitStatus();', C.text], ['L036', '  }', C.text], ['L036', '}', C.text]], { size: 20, accent: o, b: 'L038' }),
    ch('L033', 1690, 330, 'le bordereau : modifiable ici', b, { size: 20, b: 'L038' }), ch('L034', 1690, 420, 'un colis perdu reste perdu', r, { size: 20, b: 'L038' }), ch('L036', 1690, 510, 'BatchStatus : inchangé', g, { size: 20, b: 'L038' }),
    ch('L037', 960, 640, 'reprise : BatchStatus · aiguillage : ExitStatus', y, { size: 32, b: 'L038' }),
    bx('L039', 560, 330, 440, 100, 'BatchStatus COMPLETED', b, { size: 22, b: 'L040' }), bx('L039', 1360, 330, 560, 100, 'ExitStatus COMPLETED_WITH_REJECTS', y, { size: 20, b: 'L040' }),
    tx('L040', 960, 900, "5.3 · L'aiguillage →", { size: 48, c: p }),
  ],
  quiz: [{ q: 'L038', a: 'L039', question: 'Le step a réussi, mais le listener a écrit COMPLETED_WITH_REJECTS. Que valent le BatchStatus et l\'ExitStatus ?', choices: ['COMPLETED / COMPLETED', 'COMPLETED / COMPLETED_WITH_REJECTS', 'FAILED / COMPLETED_WITH_REJECTS'], win: 1, answer: 'BatchStatus COMPLETED, ExitStatus COMPLETED_WITH_REJECTS : colis livré, mais le bordereau dit autre chose.' }],
  cues: [{ a: 'L022', s: 'pop' }, { a: 'L024', s: 'pop' }, { a: 'L026', s: 'success' }, { a: 'L030', s: 'blip' }],
});

// ---------- Scène 3 : l'aiguillage ferroviaire ----------
SCENES[3] = mk({
  label: 'AIGUILLAGE', color: p, part: "5.3 · UN FLUX CONDITIONNEL : L'AIGUILLAGE FERROVIAIRE",
  els: [
    ch('L041', 960, 230, 'chargement · rapport si tout va bien · alerte sinon', d, { size: 28, b: 'L042' }),
    bx('L042', 300, 430, 300, 110, 'chargement', b, { b: 'L045' }), ch('L042', 300, 520, 'gare de départ', y, { size: 22, b: 'L045' }),
    bx('L043', 900, 300, 300, 90, 'rapport', g, { b: 'L045' }), bx('L043', 900, 560, 300, 90, 'alerte', o, { b: 'L045' }),
    ar('L043', 450, 400, 750, 320, g, { b: 'L045' }), ar('L043', 450, 460, 750, 540, o, { b: 'L045' }), ch('L043', 560, 330, 'voie libre', g, { size: 22, b: 'L045' }), ch('L043', 560, 560, 'déraillé', o, { size: 22, b: 'L045' }),
    bx('L044', 1500, 430, 300, 100, 'arrêt du réseau', r, { b: 'L045' }), ar('L044', 450, 430, 1350, 430, r, { dash: true, b: 'L045' }), ch('L044', 900, 430, 'voie imprévue', r, { size: 22, b: 'L045' }),
    code('L045', 100, 190, 1300, 430, 'BankFlowJob', [
      ['L045', 'new JobBuilder("bankFlowJob", jobRepository)', C.text], ['L045', '    .start(loadBankStep)', y],
      ['L047', '        .on("COMPLETED").to(bankReportStep)', g],
      ['L048', '    .from(loadBankStep)', C.text], ['L048', '        .on("FAILED").to(alertStep)', o],
      ['L049', '            .on("*").fail()', r],
      ['L051', '    .from(loadBankStep)', C.text], ['L051', '        .on("*").fail()   // filet de sécurité', r],
      ['L053', '    .end().build();', C.text]], { size: 21, accent: p }),
    ch('L045', 1650, 240, 'le train part de la gare', y, { size: 22 }), ch('L046', 1650, 300, 'builder de flux', b, { size: 22 }), ch('L047', 1650, 360, 'voie libre : vers le rapport', g, { size: 22 }),
    ch('L048', 1650, 430, 'retour à la gare : déraillé, alerte', o, { size: 20 }), ch('L050', 1650, 500, 'alerte verte + job vert : faux', r, { size: 22 }),
    ch('L051', 1650, 570, 'filet : arrêt de tout le réseau', r, { size: 22 }), ch('L052', 1650, 640, 'code oublié : train sans voie', r, { size: 22 }),
    ch('L058', 1650, 710, '* : toute suite · ? : un caractère', b, { size: 20 }), ch('L059', 1650, 780, 'le plus précis gagne', g, { size: 22 }), ch('L060', 1650, 850, 'end · fail · stopAndRestart', y, { size: 22 }),
    code('L054', 100, 650, 1300, 220, 'FinanceAlertTasklet', [['L054', 'job = contribution.getStepExecution().getJobExecution();', C.text], ['L055', 'load = … filter(s -> s.getStepName().equals("loadBankStep"));', b], ['L056', 'alertSender.toFinanceTeam("… %d lignes rejetées sur %d lues");', o]], { size: 21, accent: o }),
    ch('L057', 1650, 920, 'composant sans état', g, { size: 22 }),
    ch('L063', 960, 940, "branche d'erreur : fail", y, { size: 28 }), ch('L064', 960, 1000, "la fin du réseau fixe l'état du job", y, { size: 24 }),
    ch('L065', 1600, 1040, "le chef d'orchestre →", o, { size: 22 }),
  ],
  quiz: [{ q: 'L061', a: 'L062', question: 'COMPLETED_WITH_REJECTS arrive, aucune transition ne le prévoit, mais le filet * existe. Que se passe-t-il ?', choices: ['Next state not found', 'job FAILED explicite', 'suite normale'], win: 1, answer: "Le filet l'attrape : le job se termine en échec, explicitement. Sans filet : Next state not found." }],
  cues: [{ a: 'L042', s: 'blip' }, { a: 'L044', s: 'error' }, { a: 'L049', s: 'pop' }, { a: 'L050', s: 'error' }],
});

// ---------- Scène 4 : le chef d'orchestre ----------
SCENES[4] = mk({
  label: 'DECIDER', color: o, part: "5.4 · LE DECIDER : LE CHEF D'ORCHESTRE",
  els: [
    ch('L066', 960, 330, 'rejectedCount = 150', o, { size: 44, b: 'L067' }),
    bx('L067', 400, 360, 300, 100, 'step A', b, { b: 'L070' }), bx('L067', 960, 360, 340, 100, 'DECIDER', o, { b: 'L070' }), bx('L067', 1520, 360, 300, 100, 'step B', g, { b: 'L070' }),
    ar('L067', 560, 360, 780, 360, w, { b: 'L070' }), ar('L067', 1140, 360, 1360, 360, w, { b: 'L070' }), ch('L067', 960, 260, "chef d'orchestre · arbitre", y, { size: 26, b: 'L070' }),
    ch('L068', 960, 500, 'lit le compteur · dit : on continue, ou on alerte', o, { size: 28, b: 'L070' }), ch('L069', 960, 570, "ne traite rien · n'écrit rien en base", g, { size: 28, b: 'L070' }),
    code('L070', 100, 190, 1300, 430, 'RejectsDecider', [
      ['L070', '@Component', p], ['L070', 'public class RejectsDecider implements JobExecutionDecider {', C.text],
      ['L071', '  public FlowExecutionStatus decide(JobExecution job, StepExecution step) {', g],
      ['L072', '    long rejected = step.getExecutionContext().getLong("rejectedCount", 0L);', b],
      ['L073', "    // code libre : FlowExecutionStatus joue le rôle d'ExitStatus", d],
      ['L074', '    if (rejected == 0) return new FlowExecutionStatus("NO_REJECTS");', g],
      ['L074', '    return rejected > 100 ? new FlowExecutionStatus("TOO_MANY_REJECTS") : new FlowExecutionStatus("FEW_REJECTS");', y],
      ['L074', '  }', C.text], ['L074', '}', C.text]], { size: 20, accent: o, b: 'L075' }),
    code('L075', 100, 190, 1300, 330, 'BankFlowJob', [['L075', '.start(loadBankStep).next(rejectsDecider)', C.text], ['L076', '    .on("NO_REJECTS").to(bankReportStep)', g], ['L076', '    .on("FEW_REJECTS").to(bankReportStep)', g], ['L077', '    .on("TOO_MANY_REJECTS").to(alertStep)', o], ['L077', '    .on("*").fail()', r]], { size: 22, accent: p, b: 'L078' }),
    bx('L078', 400, 360, 300, 100, 'step', b, { b: 'L080' }), bx('L078', 900, 360, 300, 100, 'decider', o, { b: 'L080' }), bx('L078', 1400, 360, 300, 100, 'step', b, { b: 'L080' }),
    ch('L078', 400, 260, 'StepScope : actif ici', g, { size: 22, b: 'L080' }), ch('L078', 1400, 260, 'StepScope : actif ici', g, { size: 22, b: 'L080' }), ch('L078', 900, 260, 'aucun contexte de step', r, { size: 22, b: 'L080' }), ch('L078', 900, 460, 'entre deux steps', y, { size: 22, b: 'L080' }),
    stp('L079', 960, 600, 'AUCUN CONTEXTE DE STEP ACTIF', r, { size: 36, b: 'L080' }),
    ch('L080', 960, 330, 'singleton sans état', g, { size: 40, b: 'L083' }), ch('L081', 960, 420, 'JobScope, ou lire les arguments reçus', b, { size: 30, b: 'L083' }), stp('L082', 960, 580, 'UN DECIDER EST PUR', g, { size: 44, b: 'L083' }),
    ch('L084', 960, 330, 'code de sortie : règle simple du step', b, { size: 30, b: 'L085' }), ch('L084', 960, 420, 'decider : plusieurs sources, ou test isolé', o, { size: 30, b: 'L085' }),
    tx('L085', 960, 900, '5.5 · Le jeu de société →', { size: 48, c: g }),
  ],
  quiz: [{ q: 'L083', a: 'L084', question: 'Quand utiliser un decider plutôt qu\'un code de sortie ?', choices: ['toujours', 'plusieurs sources, ou test isolé', 'jamais'], win: 1, answer: 'Code de sortie : règle simple, propre au step. Decider : décision multi-sources, ou à tester seule.' }],
  cues: [{ a: 'L067', s: 'pop' }, { a: 'L070', s: 'blip' }, { a: 'L079', s: 'error' }, { a: 'L082', s: 'success' }],
});

// ---------- Scène 5 : le jeu de société ----------
SCENES[5] = mk({
  label: 'MACHINE_A_ETATS', color: g, part: '5.5 · LA MACHINE À ÉTATS : LE JEU DE SOCIÉTÉ',
  els: [
    ch('L086', 960, 330, 'comment le moteur choisit-il la suite ?', g, { size: 38, b: 'L087' }),
    bx('L087', 300, 330, 280, 100, 'case : chargement', b, { size: 22, b: 'L092' }), bx('L087', 700, 330, 280, 100, 'case : rapport', g, { size: 22, b: 'L092' }), bx('L087', 1100, 330, 280, 100, 'case : alerte', o, { size: 22, b: 'L092' }), bx('L087', 1500, 330, 280, 100, 'ARRIVÉE', r, { size: 26, b: 'L092' }),
    ar('L087', 440, 330, 560, 330, w, { b: 'L092' }), ar('L087', 840, 330, 960, 330, w, { b: 'L092' }), ar('L087', 1240, 330, 1360, 330, w, { b: 'L092' }), ch('L087', 300, 230, 'une case = un step', b, { size: 22, b: 'L092' }),
    bx('L088', 300, 560, 160, 140, 'dé', y, { size: 36, b: 'L092' }), ch('L088', 300, 660, 'on exécute le step', y, { size: 22, b: 'L092' }),
    ch('L089', 600, 560, 'chiffre : COMPLETED', g, { size: 26, b: 'L092' }), ch('L089', 600, 610, "c'est l'ExitStatus", d, { size: 20, b: 'L092' }),
    ch('L090', 1000, 560, 'plateau : table des transitions', p, { size: 24, b: 'L092' }), ch('L091', 1500, 560, "jusqu'à la case arrivée", r, { size: 24, b: 'L092' }),
    tb('L092', 100, 200, [420, 600], ['état', 'transitions'], [row('L092', ['loadBankStep', 'COMPLETED → bankReportStep'], b), row('L092', ['', 'FAILED → alertStep'], o), row('L092', ['', '* → fail'], r)], { size: 24, rh: 58, b: 'L097' }),
    ch('L092', 1500, 260, 'SimpleFlow : le plateau', y, { size: 26, b: 'L097' }),
    pl('L093', 200, 520, 1, "exécuter l'état", b, { size: 26, b: 'L097' }), pl('L094', 200, 590, 2, 'produire un statut', g, { size: 26, b: 'L097' }), pl('L095', 200, 660, 3, 'chercher la transition', p, { size: 26, b: 'L097' }),
    pl('L096', 200, 730, 4, "aller à l'état suivant", o, { size: 26, b: 'L097' }), pl('L096', 200, 800, 5, "recommencer, jusqu'à une fin", r, { size: 26, b: 'L097' }),
    tb('L097', 100, 200, [380, 620, 520], ['case', 'classe', 'rôle'], [row('L097', ['case étape', 'StepState', 'exécute un step'], b), row('L097', ['case décision', 'DecisionState', 'appelle un decider'], o), row('L098', ['case carrefour', 'SplitState', 'lance des flux sur des threads'], g), row('L098', ['case sous-plateau', 'FlowState', 'exécute un sous-flux'], p), row('L098', ['case arrivée', 'EndState', 'termine le job'], r)], { size: 24, rh: 60, b: 'L100' }),
    tb('L099', 100, 620, [520, 700], ['case', 'le chiffre vient de…'], [row('L099', ['step', 'ExitStatus du step'], b), row('L099', ['decider', 'FlowExecutionStatus'], o), row('L099', ['split', 'agrégation des flux'], g)], { size: 22, rh: 52, b: 'L100' }),
    code('L100', 100, 200, 1500, 130, "erreur à l'exécution", [['L100', 'FlowExecutionException: Next state not found in flow … exit status=COMPLETED_WITH_REJECTS', r]], { size: 21, accent: r, b: 'L102' }),
    ch('L101', 960, 420, 'le dé donne un chiffre écrit sur aucune flèche', r, { size: 28, b: 'L102' }),
    code('L102', 100, 200, 1500, 130, 'erreur à la construction', [['L102', 'No end state was found. You must specify at least one transition with no next state.', r]], { size: 21, accent: r, b: 'L104' }),
    ch('L103', 960, 420, 'plateau sans case arrivée : refusé au lancement', r, { size: 28, b: 'L104' }),
    ch('L105', 960, 330, 'construction : refusé au lancement', g, { size: 36, b: 'L106' }),
    tx('L106', 960, 900, '5.6 · Le péage →', { size: 48, c: b }),
  ],
  quiz: [{ q: 'L104', a: 'L105', question: 'Un flux n\'a aucune transition vers une fin. L\'erreur apparaît quand ?', choices: ['à la construction', "à l'exécution", 'jamais'], win: 0, answer: "À la construction : le job est refusé au lancement. Next state not found, lui, apparaît à l'exécution." }],
  cues: [{ a: 'L087', s: 'pop' }, { a: 'L088', s: 'blip' }, { a: 'L100', s: 'error' }, { a: 'L102', s: 'error' }],
});

// ---------- Scène 6 : le péage d'autoroute ----------
SCENES[6] = mk({
  label: 'SPLIT', color: b, part: "5.6 · LE SPLIT : LE PÉAGE D'AUTOROUTE",
  els: [
    ch('L107', 960, 330, 'comptes + opérations en même temps, puis consolidation', o, { size: 34, b: 'L108' }),
    ln('L108', 100, 330, 650, 330, d, { lw: 12, b: 'L111' }), ar('L108', 650, 330, 900, 250, b, { b: 'L111' }), ar('L108', 650, 330, 900, 410, b, { b: 'L111' }), ch('L108', 380, 260, 'autoroute : le job', d, { size: 22, b: 'L111' }),
    bx('L109', 1100, 250, 280, 80, 'guichet 1 · thread', b, { size: 22, b: 'L111' }), bx('L109', 1100, 410, 280, 80, 'guichet 2 · thread', b, { size: 22, b: 'L111' }),
    ch('L109', 800, 190, 'voiture : un flux', y, { size: 22, b: 'L111' }), ch('L109', 800, 470, 'voiture : un flux', y, { size: 22, b: 'L111' }),
    ln('L110', 1400, 190, 1400, 470, r, { lw: 8, b: 'L111' }), ch('L110', 1400, 160, 'barrière', r, { size: 24, b: 'L111' }), bx('L110', 1650, 330, 240, 90, 'consolidation', g, { size: 22, b: 'L111' }),
    code('L111', 100, 190, 1300, 430, 'FlowConfig.java', [
      ['L111', '@Bean TaskExecutor flowExecutor() {', C.text], ['L111', '  var pool = new ThreadPoolTaskExecutor();', C.text],
      ['L112', '  pool.setThreadNamePrefix("flow-");', g],
      ['L113', '  pool.setCorePoolSize(2); pool.setMaxPoolSize(2); pool.setQueueCapacity(0);', b],
      ['L115', 'Flow accountsFlow = new FlowBuilder<SimpleFlow>("accountsFlow").start(importAccountsStep).build();', p],
      ['L116', '.split(flowExecutor).add(accountsFlow, operationsFlow)', y],
      ['L117', '.start(parallelFlow).next(consolidateStep)', g]], { size: 19, accent: b, b: 'L122' }),
    ch('L114', 1650, 300, 'trop petit : on attend', o, { size: 20, b: 'L122' }), ch('L114', 1650, 350, 'illimité : base saturée', r, { size: 20, b: 'L122' }),
    ch('L118', 1650, 420, 'barrière de synchronisation', r, { size: 20, b: 'L122' }), ch('L119', 1650, 500, 'une transaction par guichet', g, { size: 20, b: 'L122' }),
    ch('L120', 1650, 560, 'deux StepExecution', b, { size: 20, b: 'L122' }), ch('L121', 1650, 620, 'singleton partagé : course', r, { size: 20, b: 'L122' }),
    ch('L122', 960, 230, 'chaque voiture a besoin de tickets : les connexions', o, { size: 30, b: 'L126' }),
    bx('L123', 200, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }), bx('L123', 390, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }), bx('L123', 580, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }), bx('L123', 770, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }),
    bx('L123', 960, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }), bx('L123', 1150, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }), bx('L123', 1340, 330, 150, 80, 'ticket', y, { size: 22, b: 'L126' }),
    ch('L123', 960, 450, '2 voitures × 3 tickets + 1 pour le contrôleur = 7', g, { size: 28, b: 'L124' }),
    ch('L124', 960, 450, '5 tickets : chacune en tient 2 et attend le 3e : blocage', r, { size: 28, b: 'L125' }),
    ch('L125', 960, 520, "3e voiture, 7 tickets : elle attend que l'une libère les siens", o, { size: 26, b: 'L126' }),
    ch('L127', 960, 330, '7 = 2 × 3 + 1', g, { size: 64, b: 'L128' }),
    bx('L128', 560, 330, 440, 100, 'guichets = threads', b, { b: 'L129' }), bx('L128', 1360, 330, 440, 100, 'tickets = connexions', o, { b: 'L129' }),
    bx('L129', 560, 330, 440, 100, 'flux A : échec', r, { b: 'L130' }), bx('L129', 1360, 330, 440, 100, 'flux B : succès', g, { b: 'L130' }), ch('L129', 960, 470, 'split : le plus grave l\'emporte → job FAILED', r, { size: 30, b: 'L130' }),
    ch('L130', 960, 330, 'reprise : seul le step en échec est rejoué', g, { size: 34, b: 'L131' }),
    ch('L131', 960, 330, 'un même step plus vite : multithread ou partitionnement', y, { size: 30, b: 'L132' }),
    tx('L132', 960, 900, "Trois situations réelles →", { size: 48, c: o }),
  ],
  quiz: [{ q: 'L126', a: 'L127', question: 'Deux flux parallèles utilisent chacun 3 connexions, plus 1 pour le JobRepository. Quel minimum dans le pool ?', choices: ['6', '7', '10'], win: 1, answer: 'Sept : 2 × 3 + 1. Moins, et les flux se bloquent en attendant une connexion détenue par un autre.' }],
  cues: [{ a: 'L108', s: 'blip' }, { a: 'L110', s: 'pop' }, { a: 'L124', s: 'error' }, { a: 'L127', s: 'success' }],
});

SCENES[7] = mk({
  label: 'CAS_USAGE', color: g, part: "CAS D'USAGE",
  els: [
    cd('L133', 100, 200, 560, 260, "L'import avec alerte", ['plus de 100 rejets : alerte à la place du rapport'], r), ch('L134', 380, 530, 'job FAILED : la supervision le voit', r, { size: 22 }),
    cd('L135', 680, 200, 560, 260, 'Deux sources', ['comptes (fichier) + opérations (base)'], b), ch('L136', 960, 530, 'durée = le plus long, pas la somme', g, { size: 22 }),
    cd('L137', 1260, 200, 560, 260, 'Le bon chemin selon le jour', ['fin de mois : clôture en plus'], o), ch('L138', 1540, 530, 'decider : MONTH_END ou NORMAL', y, { size: 22 }),
    ch('L139', 1550, 960, 'Top 10 des pièges →', r, { size: 28 }),
  ],
  cues: [{ a: 'L134', s: 'pop' }],
});

SCENES[8] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L140', 100, 190, PC2, PH2, [
      row('L141', ['1', 'ExitStatus personnalisé non aiguillé', 'Next state not found', 'transition + filet *'], r), row('L143', ['2', 'BatchStatus confondu avec ExitStatus', 'on("FAILED") ne se déclenche pas', 'aiguiller sur le code'], o),
      row('L145', ['3', 'decider en StepScope', 'aucun contexte de step', 'singleton ou JobScope'], r), row('L147', ['4', 'split mal dimensionné', 'base saturée ou flux en attente', 'pool borné, nommé'], o),
      row('L149', ['5', 'pool de connexions trop petit', 'blocage des flux', 'flux × connexions + 1'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L142', 'L143', [['FlowExecutionException: Next state not found … exit status=COMPLETED_WITH_REJECTS', r]]), extrait2('L144', 'L145', [['status = COMPLETED     exit_code = COMPLETED_WITH_REJECTS', r]]),
    extrait2('L146', 'L147', [['IllegalStateException: No context holder available for step scope', r]]), extrait2('L148', 'L149', [['HikariPool: Connection is not available, request timed out after 30000ms', r]]),
    extrait2('L150', null, [['active=7   idle=0   waiting=2', r]]),
  ],
  cues: [{ a: 'L141', s: 'pop' }, { a: 'L143', s: 'pop' }, { a: 'L145', s: 'alarm', g: -12 }, { a: 'L147', s: 'pop' }, { a: 'L149', s: 'pop' }],
});

SCENES[9] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L151', 100, 190, PC2, PH2, [
      row('L152', ['6', 'branche d\'erreur terminée par end', 'le job apparaît réussi', 'fail()'], r), row('L154', ['7', 'état partagé entre flux', 'course entre threads', 'composants sans état'], r),
      row('L156', ['8', 'decider avec effets de bord', 'effet répété à la reprise', 'decider pur'], o), row('L158', ['9', 'motifs mal compris', 'COMP* capte aussi COMPLETED_WITH_REJECTS', 'motifs explicites, tester'], o),
      row('L160', ['10', 'flux sans état final', 'No end state was found', 'end, fail ou stopAndRestart'], o)], { size: 21, rh: 70, noBold: true }),
    extrait2('L153', 'L154', [['job status = COMPLETED      loadBankStep = FAILED', r]]), extrait2('L155', 'L156', [['total = 1 187,00      puis      1 203,50', r]]),
    extrait2('L157', 'L158', [['alerte envoyée', r], ['alerte envoyée   (après reprise)', r]]), extrait2('L159', 'L160', [['COMPLETED_WITH_REJECTS  →  bankReportStep   (capté par COMP*)', r]]),
    extrait2('L161', 'L162', [['No end state was found. You must specify at least one transition with no next state.', r]]),
    ch('L162', 480, 650, 'un test par issue : COMPLETED · FAILED · …_WITH_REJECTS · inconnu', g, { size: 22 }), ch('L163', 480, 720, 'vérifier les steps exécutés, chemin par chemin', b, { size: 22 }), ch('L164', 1400, 880, 'on ne teste souvent que le chemin heureux', y, { size: 22 }),
  ],
  cues: [{ a: 'L152', s: 'pop' }, { a: 'L154', s: 'pop' }, { a: 'L156', s: 'pop' }, { a: 'L158', s: 'alarm', g: -12 }, { a: 'L160', s: 'pop' }],
});

SCENES[10] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    bx('L165', 400, 300, 360, 110, 'job vert', g, { size: 30 }), ar('L165', 600, 300, 760, 300, d), bx('L165', 960, 300, 360, 110, 'fail()', r, { size: 30 }),
    pl('L166', 1250, 240, 1, 'graphe · ExitStatus aiguille · BatchStatus reprend', g, { size: 22 }), pl('L167', 1250, 320, 2, 'decider sans StepScope · split borné', b, { size: 22 }), pl('L168', 1250, 400, 3, 'branche d\'erreur : fail + filet *', r, { size: 22 }),
    cd('L169', 100, 500, 410, 300, 'Exercice 1', ['Listener : COMPLETED_WITH_REJECTS. Statuts ? Suite du flux ?'], b, { size: 20 }), cd('L170', 540, 500, 410, 300, 'Exercice 2', ['Pourquoi un decider n\'est pas en StepScope ? Deux solutions.'], o, { size: 20 }),
    cd('L171', 980, 500, 410, 300, 'Exercice 3', ['2 flux × 3 connexions + 1 : minimum ? Pourquoi 20 threads n\'aident pas ?'], p, { size: 20 }), cd('L172', 1420, 500, 400, 300, 'Exercice 4', ['Branche d\'erreur terminée par end : détecter, corriger ?'], r, { size: 20 }),
    bar('L173', 960, 930, 800, 36, [['L173', 1], ['L174', 0]], y, { label: 'réfléchis…', b: 'L174' }),
    ch('L174', 305, 850, 'Batch COMPLETED · filet * : échec', g, { size: 18 }), ch('L175', 745, 850, 'hors contexte step', g, { size: 20 }), ch('L176', 1185, 850, '7 connexions', g, { size: 22 }), ch('L177', 1620, 850, 'job COMPLETED, step FAILED : fail()', g, { size: 18 }),
    ch('L178', 1500, 990, 'Module 6 : fiabilité →', o, { size: 26 }),
  ],
  cues: [{ a: 'L174', s: 'success' }, { a: 'L178', s: 'levelup', g: -10 }],
});

