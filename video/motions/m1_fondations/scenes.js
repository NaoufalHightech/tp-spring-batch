// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 1' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 1' };

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

// ---------- Scène 0 : ouverture ----------
SCENES[0] = mk({
  label: 'OUVERTURE', color: r,
  els: [
    ic('L001', 560, 400, 'clock', r, { sz: 130, b: 'L003' }),
    tx({ id: 'L001', w: 'redémarre' }, 560, 600, '03:12', { size: 100, fam: MONO, c: r, glow: true, b: 'L003' }),
    bar('L001', 1260, 400, 800, 46, [['L001', 0], [{ id: 'L001', w: 'redémarre' }, 0.62], ['L002', 0.62]], g, { a2: { id: 'L001', w: 'redémarre' }, c2: r, label: 'job de nuit', b: 'L003' }),
    stp({ id: 'L001', w: 'redémarre' }, 1260, 520, 'ARRÊT', r, { b: 'L003' }),
    cd({ id: 'L002', w: 'fait' }, 240, 700, 560, 220, 'FAIT', [], g, { b: 'L003' }),
    cd({ id: 'L002', w: 'reste' }, 1120, 700, 560, 220, 'RESTE', [], o, { b: 'L003' }),
    tx({ id: 'L002', w: 'question' }, 960, 800, '?', { size: 170, c: y, glow: true, b: 'L003' }),
    tx('L003', 960, 330, 'MODULE 1', { size: 170, weight: 900, fam: DISP, c: w, glow: true, track: 6 }),
    tx({ id: 'L003', w: 'tu vas' }, 960, 470, 'Fondations et environnement de production', { size: 46, c: o }),
    ch('L003', 360, 600, 'Java 25', b, { size: 26 }), ch({ id: 'L003', w: 'production' }, 700, 600, 'Spring Boot 4.1.2', g, { size: 26 }),
    ch({ id: 'L003', w: 'production' }, 1110, 600, 'Spring Batch 6.0.6', p, { size: 26 }), ch({ id: 'L003', w: 'production' }, 1500, 600, 'PostgreSQL 16', o, { size: 26 }),
    pl({ id: 'L004', w: 'pourquoi' }, 190, 820, 1, 'batch', g, { size: 24 }), pl({ id: 'L004', w: 'vocabulaire' }, 475, 820, 2, 'vocabulaire', b, { size: 24 }),
    pl({ id: 'L004', w: 'projet' }, 760, 820, 3, 'projet', p, { size: 24 }), pl({ id: 'L004', w: 'premier job' }, 1045, 820, 4, 'premier job', o, { size: 24 }),
    pl({ id: 'L004', w: 'sous le capot' }, 1330, 820, 5, 'sous le capot', b, { size: 24 }), pl({ id: 'L004', w: 'pièges' }, 1615, 820, 6, 'pièges', r, { size: 24 }),
  ],
  fx: [{ a: { id: 'L001', w: 'redémarre' }, glitch: 0.6, dur: 0.4 }, { a: 'L003', flash: 0.15, color: '#ffffff', dur: 0.3 }],
  cues: [{ a: { id: 'L001', w: 'redémarre' }, s: 'error' }, { a: 'L003', s: 'impact', g: -4 }, { a: 'L004', s: 'blip' }, { a: { id: 'L004', w: 'vocabulaire' }, s: 'blip' }, { a: { id: 'L004', w: 'projet' }, s: 'blip' }, { a: { id: 'L004', w: 'premier job' }, s: 'blip' }, { a: { id: 'L004', w: 'sous le capot' }, s: 'blip' }, { a: { id: 'L004', w: 'pièges' }, s: 'blip' }],
});

// ---------- Scène 1 : qu'est-ce qu'un batch ? (1.1) ----------
SCENES[1] = mk({
  label: 'BATCH', color: g, part: '1.1 · POURQUOI UN BATCH DE PRODUCTION ?',
  els: [
    // L005 : l'imprimerie
    bx({ id: 'L005', w: 'imprimerie' }, 960, 500, 420, 170, 'IMPRIMERIE', o, { sub: 'chaque nuit', b: 'L006' }),
    ic({ id: 'L005', w: 'relevés' }, 1450, 500, 'file', b, { lab: 'relevé', b: 'L006' }), ic({ id: 'L005', w: 'relevés' }, 1580, 500, 'file', b, { lab: 'relevé', b: 'L006' }), ic({ id: 'L005', w: 'relevés' }, 1710, 500, 'file', b, { lab: 'relevé', b: 'L006' }),
    ar({ id: 'L005', w: 'relevés' }, 1180, 500, 1380, 500, g, { b: 'L006' }),
    ch({ id: 'L005', w: 'bouton' }, 480, 500, 'aucun bouton', r, { size: 30, b: 'L006' }),
    // L006-L008 : lire, traiter, écrire
    bx({ id: 'L006', w: 'répéter' }, 240, 480, 250, 130, 'Sources', b, { size: 30, b: 'L009' }),
    bx({ id: 'L007', w: 'lit' }, 600, 480, 250, 130, 'READER', g, { sub: 'lit', b: 'L009' }),
    bx({ id: 'L007', w: 'transforme' }, 960, 480, 250, 130, 'PROCESSOR', o, { sub: 'transforme', size: 26, b: 'L009' }),
    bx({ id: 'L007', w: 'écrit' }, 1320, 480, 250, 130, 'WRITER', p, { sub: 'écrit', b: 'L009' }),
    bx({ id: 'L006', w: 'répéter' }, 1680, 480, 250, 130, 'Destinations', b, { size: 28, b: 'L009' }),
    ar({ id: 'L007', w: 'lit' }, 365, 480, 475, 480, g, { b: 'L009' }), ar({ id: 'L007', w: 'transforme' }, 725, 480, 835, 480, g, { b: 'L009' }),
    ar({ id: 'L007', w: 'écrit' }, 1085, 480, 1195, 480, g, { b: 'L009' }), ar({ id: 'L007', w: 'écrit' }, 1445, 480, 1555, 480, g, { b: 'L009' }),
    ch({ id: 'L008', w: 'fichier' }, 240, 630, 'fichier', b, { b: 'L009' }), ch({ id: 'L008', w: 'base' }, 240, 690, 'base', b, { b: 'L009' }), ch({ id: 'L008', w: 'file' }, 240, 750, "file d'attente", b, { b: 'L009' }),
    ch({ id: 'L008', w: 'repartent' }, 1680, 630, 'base', b, { b: 'L009' }), ch({ id: 'L008', w: 'autre fichier' }, 1680, 690, 'fichier', b, { b: 'L009' }),
    // L009-L011 : six besoins
    tb('L009', 170, 200, [520, 1060], ['Besoin', 'Ce que cela veut dire'], [
      { a: { id: 'L010', w: 'Sans intervention humaine' }, cells: ['Sans intervention humaine', "pas d'IHM : tout est automatique"], c: g },
      { a: { id: 'L010', w: 'Efficacité' }, cells: ['Efficacité', 'traitements lourds, minutes ou heures'], c: g },
      { a: { id: 'L010', w: 'Supervision' }, cells: ['Supervision', "savoir ce qui est fait, ce qui reste"], c: b },
      { a: { id: 'L011', w: 'Fiabilité' }, cells: ['Fiabilité', 'reprendre un lot en échec'], c: o },
      { a: { id: 'L011', w: 'planificateur' }, cells: ['Pas un scheduler', 'cron, Quartz, Kubernetes peuvent le lancer'], c: d },
      { a: { id: 'L011', w: 'Parallélisme' }, cells: ['Parallélisme', 'beaucoup de jobs en même temps'], c: p }], { size: 24, rh: 84, b: 'L012' }),
    // L012 : planificateur et job
    bx({ id: 'L012', w: 'planificateur' }, 520, 470, 460, 150, 'HORLOGE', o, { sub: 'cron · Kubernetes', b: 'L013' }),
    bx({ id: 'L012', w: 'travail' }, 1400, 470, 460, 150, 'JOB', g, { sub: 'fait le travail', b: 'L013' }),
    ar({ id: 'L012', w: 'lancer' }, 760, 470, 1160, 470, o, { b: 'L013' }), tx({ id: 'L012', w: 'lancer' }, 960, 430, 'lance', { size: 30, c: o, b: 'L013' }),
    // L013-L016 : pourquoi un framework
    tm({ id: 'L013', w: 'script' }, 130, 230, 900, 330, 'import.sh', [
      { a: { id: 'L013', w: 'script' }, s: 'pour chaque ligne du fichier :', c: C.text }, { a: { id: 'L013', w: 'boucle' }, s: '    insérer la ligne en base', c: g }, { a: { id: 'L013', w: 'insère' }, s: 'fin du fichier', c: C.text }], { size: 30, b: 'L017' }),
    ch({ id: 'L013', w: 'marche' }, 1370, 280, 'ça marche', g, { size: 34, b: 'L015' }),
    ch({ id: 'L014', w: 'arrêté' }, 1370, 360, "où s'est-il arrêté ?", r, { size: 30, b: 'L015' }), ch({ id: 'L014', w: 'double' }, 1370, 430, 'lignes en double', r, { size: 30, b: 'L015' }),
    ch({ id: 'L014', w: 'copies' }, 1370, 500, 'deux copies en parallèle', r, { size: 30, b: 'L015' }),
    bx({ id: 'L015', w: 'suivi' }, 250, 780, 230, 110, 'suivi', o, { b: 'L017' }), bx({ id: 'L015', w: 'reprise' }, 500, 780, 230, 110, 'reprise', o, { b: 'L017' }), bx({ id: 'L015', w: 'verrou' }, 750, 780, 230, 110, 'verrou', o, { b: 'L017' }),
    ch({ id: 'L015', w: 'propre' }, 500, 700, 'maison, chaque fois différente', o, { size: 24, b: 'L016' }),
    bx({ id: 'L016', w: 'Spring Batch' }, 250, 780, 230, 110, 'suivi', g, { b: 'L017' }), bx({ id: 'L016', w: 'Spring Batch' }, 500, 780, 230, 110, 'reprise', g, { b: 'L017' }), bx({ id: 'L016', w: 'Spring Batch' }, 750, 780, 230, 110, 'verrou', g, { b: 'L017' }),
    ch({ id: 'L016', w: 'Spring Batch' }, 500, 700, 'SPRING BATCH', g, { size: 28, b: 'L017' }), ch({ id: 'L016', w: 'À toi' }, 1350, 700, 'TON MÉTIER', p, { size: 28, b: 'L017' }),
    bx({ id: 'L016', w: 'lecture' }, 1130, 780, 230, 110, 'lecture', b, { b: 'L017' }), bx({ id: 'L016', w: 'traitement' }, 1380, 780, 230, 110, 'traitement', o, { size: 26, b: 'L017' }), bx({ id: 'L016', w: 'écriture' }, 1630, 780, 230, 110, 'écriture', p, { b: 'L017' }),
    // L017-L023 : six principes
    tb('L017', 140, 200, [560, 500, 580], ['Principe', 'Pourquoi', 'Ce que ça évite'], [
      { a: { id: 'L018', w: 'Minimiser' }, cells: ['Minimiser les E/S', 'premier coût', 'relire à chaque transaction'], c: b },
      { a: { id: 'L019', w: 'Ne pas faire deux fois' }, cells: ['Ne pas faire deux fois', 'un total relit tout', 'un second passage complet'], c: b },
      { a: { id: 'L020', w: 'Supposer' }, cells: ['Supposer le pire', 'données suspectes', 'un fichier tronqué accepté'], c: r },
      { a: { id: 'L021', w: 'Tester' }, cells: ['Tester la charge tôt', 'un batch grossit', 'la limite découverte en prod'], c: o },
      { a: { id: 'L022', w: 'Sauvegarder' }, cells: ['Sauvegarder les fichiers', 'les fichiers sont oubliés', 'un batch qui dépend de fichiers perdus'], c: p },
      { a: { id: 'L023', w: 'rester simple' }, cells: ['Rester simple', 'complexité = risque', 'des batchs ingérables'], c: g }], { size: 22, rh: 86, b: 'L024' }),
    // L024-L026 : cas d'usage
    tx('L024', 150, 205, 'CÔTÉ MÉTIER', { size: 24, fam: MONO, c: d, align: 'left', b: 'L027' }),
    cd({ id: 'L024', w: 'salaires' }, 150, 240, 400, 130, 'Salaires', [], g, { b: 'L027' }), cd({ id: 'L024', w: 'factures' }, 590, 240, 400, 130, 'Factures', [], g, { b: 'L027' }),
    cd({ id: 'L024', w: 'bulletins' }, 1030, 240, 400, 130, 'Bulletins de paie', [], g, { tsize: 28, b: 'L027' }), cd({ id: 'L024', w: 'e-mails' }, 1470, 240, 300, 130, 'E-mails', [], g, { b: 'L027' }),
    tx('L025', 150, 480, 'CÔTÉ TECHNIQUE', { size: 24, fam: MONO, c: d, align: 'left', b: 'L027' }),
    cd({ id: 'L025', w: 'tests' }, 150, 515, 300, 130, 'Tests planifiés', [], b, { tsize: 26, b: 'L027' }), cd({ id: 'L025', w: 'mises à jour' }, 480, 515, 300, 130, 'Mises à jour de base', [], b, { tsize: 24, b: 'L027' }),
    cd({ id: 'L025', w: 'file de messages' }, 810, 515, 300, 130, 'File de messages', [], b, { tsize: 26, b: 'L027' }), cd({ id: 'L025', w: 'test de charge' }, 1140, 515, 300, 130, 'Test de charge', [], b, { tsize: 26, b: 'L027' }),
    cd({ id: 'L025', w: 'Côté technique' }, 1470, 515, 300, 130, 'Intégrité', [], b, { b: 'L027' }),
    ch({ id: 'L025', w: 'charge' }, 960, 730, 'même sans Spring, on finit par en faire', o, { size: 28, b: 'L027' }),
    ar({ id: 'L026', w: 'volume' }, 250, 960, 1650, 860, o, { lw: 6, b: 'L027' }), tx({ id: 'L026', w: 'volume' }, 1000, 870, 'le volume monte', { size: 30, c: o, b: 'L027' }),
    // L027-L031 : l'escalier des cinq stratégies
    bx({ id: 'L027', w: 'normal' }, 300, 800, 300, 100, '1 · Traitement normal', g, { size: 21, sub: 'fenêtre de nuit', b: null }),
    bx({ id: 'L028', w: 'utilisateurs' }, 640, 690, 300, 100, '2 · Batch concurrent', b, { size: 21, sub: "avec l'en ligne" }),
    bx({ id: 'L028', w: 'parallèle' }, 980, 580, 300, 100, '3 · Jobs en parallèle', o, { size: 21, sub: 'plusieurs jobs' }),
    bx({ id: 'L029', w: 'partitionnement' }, 1320, 470, 300, 100, '4 · Partitionnement', p, { size: 21, sub: 'même job, N instances' }),
    bx({ id: 'L029', w: 'combinaison' }, 1660, 360, 300, 100, '5 · Combinaison', r, { size: 21, sub: 'des précédentes' }),
    ar({ id: 'L028', w: 'utilisateurs' }, 420, 770, 520, 730, g), ar({ id: 'L028', w: 'parallèle' }, 760, 660, 860, 620, g), ar({ id: 'L029', w: 'partitionnement' }, 1100, 550, 1200, 510, g), ar({ id: 'L029', w: 'combinaison' }, 1440, 440, 1540, 400, g),
    ch({ id: 'L030', w: 'validation' }, 330, 690, 'validation + reprise', y, { size: 26 }),
    ic({ id: 'L031', w: 'Reprenons' }, 1450, 760, 'clock', r, { sz: 80 }), tx({ id: 'L031', w: 'Reprenons' }, 1450, 900, '03:12', { size: 54, fam: MONO, c: r, glow: true }),
  ],
  cues: [{ a: { id: 'L005', w: 'imprimerie' }, s: 'pop' }, { a: { id: 'L014', w: 'arrêté' }, s: 'error' }, { a: { id: 'L016', w: 'Spring Batch' }, s: 'success' }, { a: { id: 'L027', w: 'normal' }, s: 'blip' }, { a: { id: 'L028', w: 'parallèle' }, s: 'blip' }, { a: { id: 'L029', w: 'combinaison' }, s: 'levelup', g: -10 }],
});

// ---------- Scène 2 : la nuit interrompue (1.1) ----------
SCENES[2] = mk({
  label: 'NUIT_INTERROMPUE', color: o, part: '1.1 · LA NUIT INTERROMPUE',
  els: [
    ln('L032', 250, 520, 1670, 520, d, { lw: 4 }),
    tx({ id: 'L032', w: 'Deux heures' }, 300, 420, '2 h 00', { size: 54, fam: MONO, c: g }), bx({ id: 'L032', w: 'job' }, 560, 610, 520, 100, 'job de rapprochement', g, { size: 26 }),
    ar({ id: 'L032', w: 'job' }, 300, 520, 780, 520, g),
    tx({ id: 'L032', w: 'trois heures douze' }, 850, 420, '3 h 12', { size: 54, fam: MONO, c: r, glow: true }), cr({ id: 'L032', w: 'redémarre' }, 850, 520, 36, r),
    tx({ id: 'L033', w: 'tu arrives' }, 1400, 420, 'au matin', { size: 54, fam: MONO, c: o }), bx({ id: 'L033', w: 'Mais' }, 1400, 610, 400, 100, 'processus disparu', o, { size: 26 }),
    db({ id: 'L034', w: 'base' }, 1400, 830, 190, 150, b, ''), ch({ id: 'L034', w: 'démarré' }, 1400, 830, 'STARTED ?', o, { size: 28 }),
    ch({ id: 'L035', w: 'orpheline' }, 1050, 830, 'abandon / recover', o, { size: 26 }), ar({ id: 'L035', w: 'orpheline' }, 1290, 830, 1230, 830, o), ar({ id: 'L035', w: 'relancer' }, 880, 830, 760, 830, g), ch({ id: 'L035', w: 'relancer' }, 640, 830, 'relance', g, { size: 28 }),
    bar({ id: 'L035', w: 'reprend' }, 400, 960, 700, 40, [[{ id: 'L035', w: 'reprend' }, 0.62], [{ id: 'L035', w: 'zéro' }, 0.62]], g, { label: 'reprise à la dernière position', b: 'L036' }),
    bar({ id: 'L036', w: 'rejoue' }, 400, 960, 700, 40, [[{ id: 'L036', w: 'rejoue' }, 0], [{ id: 'L036', w: 'début' }, 1]], r, { label: 'tout rejoué : lignes en double ?' }),
    ch({ id: 'L037', w: 'garder' }, 960, 250, 'que garder pour répondre demain ?', y, { size: 36 }),
  ],
  fx: [{ a: { id: 'L032', w: 'redémarre' }, glitch: 0.5, dur: 0.4 }],
  cues: [{ a: { id: 'L032', w: 'redémarre' }, s: 'error' }, { a: { id: 'L035', w: 'relancer' }, s: 'success' }, { a: { id: 'L036', w: 'rejoue' }, s: 'rewind', g: -10 }, { a: { id: 'L037', w: 'garder' }, s: 'blip' }],
});

// ---------- Scène 3 : les trois questions (1.1) ----------
SCENES[3] = mk({
  label: 'TROIS_QUESTIONS', color: b, part: '1.1 · TROIS QUESTIONS DE PRODUCTION',
  els: [
    cd({ id: 'L038', w: 'Première' }, 150, 190, 540, 220, '1 · La trace', ["Que s'est-il passé cette nuit ?", "Où le job s'est-il arrêté ?"], g),
    cd({ id: 'L039', w: 'Deuxième' }, 690, 190, 540, 220, '2 · Le verrou', ['Deux serveurs peuvent-ils lancer', 'le même job en même temps ?'], o),
    cd({ id: 'L040', w: 'Troisième' }, 1230, 190, 540, 220, '3 · La reprise', ['Reprendre sans tout rejouer,', 'sans doubler les données ?'], p),
    bx({ id: 'L038', w: 'arrêté' }, 420, 520, 380, 90, 'métadonnées', g, { size: 28 }), bx({ id: 'L039', w: 'même job' }, 960, 520, 380, 90, 'verrouillage', o, { size: 28 }), bx({ id: 'L040', w: 'doubler' }, 1500, 520, 380, 90, 'état du step', p, { size: 28 }),
    ar({ id: 'L038', w: 'arrêté' }, 420, 410, 420, 475, g), ar({ id: 'L039', w: 'même job' }, 960, 410, 960, 475, o), ar({ id: 'L040', w: 'doubler' }, 1500, 410, 1500, 475, p),
    db({ id: 'L041', w: 'PostgreSQL' }, 960, 820, 230, 160, b, 'PostgreSQL', { size: 22 }),
    ar({ id: 'L041', w: 'durable' }, 420, 570, 880, 760, b), ar({ id: 'L041', w: 'durable' }, 960, 570, 960, 745, b), ar({ id: 'L041', w: 'durable' }, 1500, 570, 1040, 760, b),
    db({ id: 'L042', w: 'H2' }, 1650, 820, 170, 130, o, 'H2', { size: 26 }), ch({ id: 'L042', w: 'tests' }, 1650, 930, 'tests : oui', g, { size: 22 }), cr({ id: 'L042', w: 'disparaît' }, 1650, 820, 50, r), ch({ id: 'L042', w: 'Jamais' }, 1650, 985, 'prod : non', r, { size: 22 }),
    pl({ id: 'L045', w: 'trace' }, 330, 960, 1, 'la trace', g, { size: 26 }), pl({ id: 'L045', w: 'verrou' }, 640, 960, 2, 'le verrou', o, { size: 26 }), pl({ id: 'L045', w: 'reprise' }, 950, 960, 3, 'la reprise', p, { size: 26 }),
    ch({ id: 'L046', w: 'vocabulaire' }, 1500, 960, 'vocabulaire →', b, { size: 30 }),
  ],
  quiz: [{ q: 'L043', a: 'L044', question: "Le serveur redémarre en pleine nuit. Pour savoir où en était le job, tu t'appuies sur :", choices: ['la mémoire du processus', 'une base partagée'], win: 1, answer: "Tout ce qui est en mémoire disparaît avec le processus. Seule une base durable et partagée garde la trace." }],
  cues: [{ a: { id: 'L038', w: 'Première' }, s: 'pop' }, { a: { id: 'L039', w: 'Deuxième' }, s: 'pop' }, { a: { id: 'L040', w: 'Troisième' }, s: 'pop' }, { a: { id: 'L041', w: 'PostgreSQL' }, s: 'reveal' }, { a: { id: 'L042', w: 'disparaît' }, s: 'error' }],
});

// ---------- Scène 4 : le vocabulaire (1.2) ----------
SCENES[4] = mk({
  label: 'VOCABULAIRE', color: b, part: '1.2 · LE VOCABULAIRE',
  els: [
    cd({ id: 'L047', w: 'recette' }, 150, 260, 700, 190, 'La recette', ['tarte aux pommes : toujours le même plat'], b, { b: 'L048' }),
    ar({ id: 'L047', w: 'chaque fois' }, 860, 355, 1050, 355, g, { b: 'L048' }),
    cd({ id: 'L047', w: 'précise' }, 1060, 260, 700, 190, 'Une tarte précise', ['pommes de cette récolte, ce jour-là'], g, { b: 'L048' }),
    bx({ id: 'L048', w: 'Job' }, 300, 560, 360, 130, 'Job', b, { sub: 'EndOfDay : la recette', b: 'L054' }),
    bx({ id: 'L048', w: 'JobInstance' }, 960, 560, 360, 130, 'JobInstance', g, { sub: 'EndOfDay du 2007/05/05', size: 28, b: 'L054' }),
    bx({ id: 'L049', w: 'date' }, 960, 330, 460, 100, 'JobParameters', p, { sub: 'schedule.date = 2007/05/05', size: 26, b: 'L054' }),
    ar({ id: 'L049', w: 'paramètre identifiant' }, 960, 380, 960, 495, p, { b: 'L054' }),
    bx({ id: 'L050', w: 'tentative' }, 1620, 560, 360, 130, 'JobExecution', o, { sub: '1re tentative', size: 28, b: 'L054' }),
    ar({ id: 'L048', w: 'Une JobInstance' }, 480, 560, 780, 560, b, { b: 'L054' }), ar({ id: 'L050', w: 'tentative' }, 1140, 560, 1440, 560, g, { b: 'L054' }),
    tx({ id: 'L048', w: 'Une JobInstance' }, 630, 520, '1 … *', { size: 26, fam: MONO, c: d, b: 'L054' }), tx({ id: 'L050', w: 'tentative' }, 1290, 520, '1 … *', { size: 26, fam: MONO, c: d, b: 'L054' }),
    ch({ id: 'L050', w: 'réussir' }, 1620, 680, 'réussite', g, { size: 24, b: 'L054' }), ch({ id: 'L050', w: 'échouer' }, 1620, 740, 'échec, puis reprise', r, { size: 24, b: 'L054' }),
    tx({ id: 'L051', w: 'Règle' }, 960, 860, 'JobInstance = Job + paramètres identifiants', { size: 44, c: y, glow: true, b: 'L054' }),
    ch({ id: 'L052', w: 'Deux lancements' }, 680, 720, 'lancement 1', b, { size: 24, b: 'L054' }), ch({ id: 'L052', w: 'Deux lancements' }, 1240, 720, 'lancement 2', b, { size: 24, b: 'L054' }),
    ar({ id: 'L052', w: 'même instance' }, 700, 700, 900, 630, b, { b: 'L054' }), ar({ id: 'L052', w: 'même instance' }, 1220, 700, 1020, 630, b, { b: 'L054' }),
    stp({ id: 'L053', w: 'refuse' }, 1620, 860, 'REFUSÉ', r, { b: 'L054' }), ch({ id: 'L053', w: 'terminée' }, 960, 960, 'instance COMPLETED : fermée', g, { size: 26, b: 'L054' }),
    cd({ id: 'L054', w: 'billet' }, 150, 260, 700, 230, 'Le billet', ['Paris · 12 mars', 'ce billet, c\'est l\'instance'], g, { b: 'L055' }),
    ch({ id: 'L054', w: 'rates' }, 1150, 330, 'train 1 : raté', r, { size: 30, b: 'L055' }), ch({ id: 'L054', w: 'même billet' }, 1150, 420, 'train 2 : même billet', o, { size: 30, b: 'L055' }),
    ch({ id: 'L054', w: 'nouvelle tentative' }, 960, 640, 'nouvelle tentative, pas nouveau billet', y, { size: 34, b: 'L055' }),
    tb('L055', 100, 230, [260, 260, 560, 640], ['JOB_EXEC_ID', 'JOB_INST_ID', 'schedule.date', 'STATUS'], [
      { a: { id: 'L056', w: 'échoué' }, cells: ['1', '1', '2017-01-01', 'FAILED'], c: r },
      { a: { id: 'L057', w: 'relance' }, cells: ['2', '1', '2017-01-01 (relance)', 'COMPLETED : instance 1 fermée'], c: g },
      { a: { id: 'L058', w: 'autre date' }, cells: ['3', '2', '2017-01-02', 'COMPLETED : une AUTRE instance'], c: b }], { size: 26, rh: 90, fam: MONO, noBold: true, b: 'L059' }),
    ic({ id: 'L057', w: 'fermée' }, 1500, 700, 'lock', g, { s: 80 }), ch({ id: 'L057', w: 'fermée' }, 1500, 780, 'instance 1 fermée', g, { size: 24 }),
    cd({ id: 'L059', w: 'Mêmes paramètres' }, 100, 200, 540, 230, 'Mêmes paramètres', ['Même instance, nouvelle exécution : c\'est la reprise.'], g, { b: 'L063' }),
    cd({ id: 'L060', w: 'réussie' }, 690, 200, 540, 230, 'Instance réussie', ['Fermée : un nouveau lancement identique est refusé.'], b, { b: 'L063' }),
    cd({ id: 'L060', w: 'en cours' }, 1280, 200, 540, 230, 'Instance en cours', ['JobExecutionAlreadyRunningException si on la relance.'], o, { size: 22, b: 'L063' }),
    ch({ id: 'L062', w: 'reprise' }, 500, 640, 'même date → reprise', g, { size: 30, b: 'L063' }), ch({ id: 'L062', w: 'changé la date' }, 1300, 640, 'autre date → autre instance', b, { size: 30, b: 'L063' }),
    // L063-L071 : les états d'une exécution
    bx({ id: 'L064', w: 'Starting' }, 300, 400, 300, 90, 'STARTING', b, { size: 26 }), bx({ id: 'L064', w: 'Started' }, 700, 400, 300, 90, 'STARTED', b, { size: 26 }),
    ar({ id: 'L064', w: 'Started' }, 450, 400, 550, 400, b),
    bx({ id: 'L065', w: 'Completed' }, 1150, 290, 320, 90, 'COMPLETED', g, { size: 26 }), bx({ id: 'L065', w: 'Failed' }, 1150, 470, 320, 90, 'FAILED', r, { size: 26 }),
    ar({ id: 'L065', w: 'Completed' }, 850, 380, 990, 310, g), ar({ id: 'L065', w: 'Failed' }, 850, 420, 990, 460, r),
    bx({ id: 'L066', w: 'Stopping' }, 700, 700, 300, 90, 'STOPPING', o, { size: 26 }), bx({ id: 'L066', w: 'Stopped' }, 1150, 700, 320, 90, 'STOPPED', o, { size: 26 }),
    ar({ id: 'L066', w: 'Stopping' }, 700, 450, 700, 650, o), ar({ id: 'L066', w: 'Stopped' }, 850, 700, 990, 700, o),
    bx({ id: 'L067', w: 'Abandoned' }, 1620, 580, 300, 90, 'ABANDONED', d, { size: 26 }), ic({ id: 'L067', w: 'Abandoned' }, 1620, 680, 'lock', d, { s: 50 }),
    ch({ id: 'L068', w: 'failed et stopped' }, 1000, 850, 'reprenables : FAILED, STOPPED', g, { size: 26 }), ch({ id: 'L068', w: 'Completed et abandoned' }, 1560, 850, 'fermés : COMPLETED, ABANDONED', d, { size: 26 }),
    ch({ id: 'L070', w: 'abandonner' }, 400, 560, 'abandon / recover', o, { size: 28 }), ar({ id: 'L070', w: 'abandonner' }, 500, 520, 620, 450, o, { dash: true }),
    ch({ id: 'L071', w: 'Zoomons' }, 300, 880, 'zoom : le Step', p, { size: 34 }),
  ],
  quiz: [
    { q: 'L061', a: 'L062', question: "Le job du cinq mai échoue à la moitié. Tu le relances avec la même date : nouvelle instance ou nouvelle exécution ?", choices: ['nouvelle instance', 'nouvelle exécution'], win: 1, answer: "Nouvelle exécution de la même instance : c'est une reprise. Avec une autre date, ce serait une autre instance." },
    { q: 'L069', a: 'L070', question: "Une exécution est restée à l'état STARTED après un crash. Peut-on simplement la relancer ?", choices: ['oui', 'non'], win: 1, answer: "Non : Spring Batch la croit encore en cours. Il faut d'abord l'abandonner ou la récupérer." },
  ],
  cues: [{ a: { id: 'L048', w: 'JobInstance' }, s: 'pop' }, { a: { id: 'L050', w: 'tentative' }, s: 'pop' }, { a: { id: 'L051', w: 'Règle' }, s: 'levelup', g: -10 }, { a: { id: 'L053', w: 'refuse' }, s: 'stamp' }, { a: { id: 'L056', w: 'échoué' }, s: 'error' }, { a: { id: 'L057', w: 'fermée' }, s: 'lock' }],
});

// ---------- Scène 5 : Step, StepExecution, ExecutionContext (1.2) ----------
SCENES[5] = mk({
  label: 'STEP_ET_CONTEXTE', color: p, part: '1.2 · STEP, STEPEXECUTION, EXECUTIONCONTEXT',
  els: [
    cd('L072', 120, 200, 1680, 290, 'JobExecution', [], o, { b: 'L075' }),
    bx({ id: 'L072', w: 'Step' }, 440, 380, 380, 110, 'Step 1', p, { b: 'L075' }), bx({ id: 'L072', w: 'Step' }, 960, 380, 380, 110, 'Step 2', p, { b: 'L075' }),
    bx({ id: 'L072', w: 'Step' }, 1480, 380, 380, 110, 'Step 3', p, { b: 'L075' }),
    ar('L072', 640, 380, 760, 380, p, { b: 'L075' }), ar('L072', 1160, 380, 1280, 380, p, { b: 'L075' }),
    cd('L073', 120, 540, 1100, 420, 'StepExecution', [], p, { b: 'L075' }),
    ch({ id: 'L073', w: 'lus' }, 360, 680, 'readCount', b, { size: 28, b: 'L075' }), ch({ id: 'L073', w: 'écrits' }, 720, 680, 'writeCount', p, { size: 28, b: 'L075' }),
    ch({ id: 'L073', w: 'filtrés' }, 360, 760, 'filterCount', o, { size: 28, b: 'L075' }), ch({ id: 'L073', w: 'ignorés' }, 720, 760, 'skipCount', d, { size: 28, b: 'L075' }),
    ch({ id: 'L074', w: 'validations' }, 360, 850, 'commitCount', g, { size: 28, b: 'L075' }), ch({ id: 'L074', w: 'annulations' }, 720, 850, 'rollbackCount', r, { size: 28, b: 'L075' }),
    bx({ id: 'L074', w: 'aucune' }, 1480, 380, 380, 110, 'Step 3 : non créé', d, { size: 24, b: 'L075' }),
    cd({ id: 'L075', w: 'jeu vidéo' }, 120, 220, 760, 220, 'Un jeu vidéo', ['tu sauvegardes : le jeu garde ta position', 'tu coupes la console : tu reprends là où tu étais'], y),
    bx({ id: 'L076', w: 'ExecutionContext' }, 1350, 330, 560, 130, 'ExecutionContext', p, { sub: 'la sauvegarde de partie du step', size: 30 }),
    ch({ id: 'L076', w: 'douze mille' }, 1350, 450, 'ligne 12 000 atteinte', y, { size: 28 }),
    bx({ id: 'L077', w: 'contexte du step' }, 500, 640, 560, 130, 'contexte du step', b, { sub: 'à chaque validation de transaction', size: 28, b: 'L078' }),
    bx({ id: 'L077', w: 'contexte du job' }, 1200, 640, 560, 130, 'contexte du job', g, { sub: 'entre deux steps', size: 28, b: 'L078' }),
    ch({ id: 'L077', w: 'pas les mêmes objets' }, 850, 800, 'pas les mêmes objets', o, { size: 28, b: 'L078' }),
    tb('L078', 220, 520, [320, 960], ['STEP_EXEC_ID', 'SHORT_CONTEXT'], [{ a: { id: 'L078', w: 'ligne par step' }, cells: ['1', '{"bankCsvReader.read.count": 3400}'], c: p }], { size: 26, rh: 80, fam: MONO, noBold: true }),
    bar({ id: 'L079', w: 'repart' }, 860, 780, 1100, 44, [[{ id: 'L079', w: 'repart' }, 0], [{ id: 'L079', w: 'unième' }, 0.68]], g, { label: 'lues avant la panne : 3 400' }),
    ch({ id: 'L079', w: 'unième' }, 1450, 860, 'reprise à la ligne 3 401', g, { size: 28 }),
    ic({ id: 'L080', w: 'sérialisable' }, 1700, 560, 'lock', o, { s: 80 }), ch({ id: 'L080', w: 'sérialisable' }, 1620, 660, 'sérialisable', o, { size: 26 }),
    db({ id: 'L081', w: 'JobRepository' }, 960, 960, 200, 120, b, 'JobRepository', { size: 22 }),
    ch({ id: 'L082', w: 'PostgreSQL' }, 1300, 960, 'PostgreSQL', b, { size: 28 }), ch({ id: 'L082', w: 'version' }, 1560, 960, 'colonne version', r, { size: 26 }),
    ch({ id: 'L083', w: 'architecture' }, 400, 960, 'architecture →', p, { size: 30 }),
  ],
  cues: [{ a: { id: 'L073', w: 'lus' }, s: 'tick' }, { a: { id: 'L074', w: 'aucune' }, s: 'error' }, { a: { id: 'L076', w: 'ExecutionContext' }, s: 'pop' }, { a: { id: 'L079', w: 'unième' }, s: 'success' }, { a: { id: 'L080', w: 'sérialisable' }, s: 'lock' }, { a: { id: 'L081', w: 'JobRepository' }, s: 'reveal' }],
});

// ---------- Scène 6 : les trois couches, le schéma de référence, les versions (1.2) ----------
SCENES[6] = mk({
  label: 'COUCHES_ET_VERSIONS', color: b, part: '1.2 · ARCHITECTURE, SCHÉMA DE RÉFÉRENCE, VERSIONS',
  els: [
    bx({ id: 'L084', w: 'application' }, 700, 300, 900, 130, 'Application', g, { sub: 'jobs · steps · readers · processors', b: 'L088' }),
    bx({ id: 'L085', w: 'noyau' }, 700, 480, 900, 130, 'Batch Core', b, { sub: 'Job · Step · JobOperator · JobRepository', b: 'L088' }),
    bx({ id: 'L086', w: 'infrastructure' }, 700, 660, 900, 130, 'Batch Infrastructure', p, { sub: 'readers · writers · services courants', b: 'L088' }),
    tx({ id: 'L084', w: 'application' }, 1480, 300, 'ce que tu écris', { size: 30, c: g, align: 'left', b: 'L088' }), tx({ id: 'L085', w: 'noyau' }, 1480, 480, 'lancer et contrôler', { size: 30, c: b, align: 'left', b: 'L088' }),
    tx({ id: 'L086', w: 'infrastructure' }, 1480, 660, 'brique commune', { size: 30, c: p, align: 'left', b: 'L088' }),
    ar({ id: 'L087', w: 'application' }, 190, 600, 190, 360, p, { b: 'L088' }), ar({ id: 'L087', w: 'noyau' }, 1280, 600, 1280, 540, p, { b: 'L088' }),
    bx({ id: 'L088', w: 'JobOperator' }, 300, 360, 340, 110, 'JobOperator', b, { sub: 'étend JobLauncher', size: 30, b: 'L094' }),
    bx({ id: 'L088', w: 'lance le Job' }, 780, 360, 300, 110, 'Job', g, { b: 'L094' }), bx({ id: 'L088', w: 'fait de Steps' }, 1260, 360, 300, 110, 'Step', o, { b: 'L094' }),
    bx({ id: 'L088', w: 'un reader' }, 1100, 640, 300, 100, 'ItemReader', p, { size: 28, b: 'L094' }), bx({ id: 'L088', w: 'un writer' }, 1500, 640, 300, 100, 'ItemWriter', p, { size: 28, b: 'L094' }),
    ar({ id: 'L088', w: 'lance le Job' }, 470, 360, 630, 360, b, { b: 'L094' }), ar({ id: 'L088', w: 'fait de Steps' }, 930, 360, 1110, 360, g, { b: 'L094' }),
    ar({ id: 'L088', w: 'un reader' }, 1200, 415, 1150, 590, o, { b: 'L094' }), ar({ id: 'L088', w: 'un writer' }, 1330, 415, 1480, 590, o, { b: 'L094' }),
    bx({ id: 'L089', w: 'JobRepository' }, 480, 640, 460, 110, 'JobRepository', r, { sub: 'métadonnées BATCH_*', size: 30, b: 'L094' }),
    ar({ id: 'L089', w: 'enregistre' }, 780, 415, 560, 590, r, { dash: true, b: 'L094' }),
    ch({ id: 'L090', w: 'exactement' }, 960, 820, '1 reader · 1 writer · 0 ou 1 processor', y, { size: 28, b: 'L094' }),
    ch({ id: 'L091', w: 'métier' }, 480, 930, 'mon métier → en haut', g, { size: 28, b: 'L094' }), ch({ id: 'L091', w: 'moteur' }, 1400, 930, 'le moteur : je ne le réécris pas', b, { size: 28, b: 'L094' }),
    ln('L094', 250, 290, 1700, 290, d, { lw: 4 }),
    ch({ id: 'L095', w: 'deux mille huit' }, 300, 230, '1.x · 2008 · XML', d, { size: 24 }), ch({ id: 'L095', w: 'Java' }, 590, 230, '2.x · 3.x', d, { size: 24 }),
    ch({ id: 'L095', w: 'Quatre' }, 860, 230, '4.x · Spring 5', d, { size: 24 }), ch({ id: 'L095', w: 'Cinq' }, 1130, 230, '5.x · Spring 6', g, { size: 24 }), ch({ id: 'L097', w: 'six' }, 1500, 230, '6.x · Boot 4', y, { size: 28 }),
    ch({ id: 'L096', w: 'exige' }, 1130, 340, 'base de données obligatoire', g, { size: 24 }),
    tb('L097', 150, 420, [700, 920], ['Nouveauté (6.0.6)', 'Conséquence'], [
      { a: { id: 'L098', w: 'quatre point un' }, cells: ['Boot 4.1.2 embarque Spring Batch 6.0.6', 'spring-boot-starter-batch-jdbc'], c: b },
      { a: { id: 'L099', w: 'paquets' }, cells: ['Paquets déplacés', 'core.job.Job · core.step.Step · infrastructure.item.*'], c: r },
      { a: { id: 'L101', w: 'JobOperator' }, cells: ['JobOperator étend JobLauncher', 'start · restart · stop · abandon · recover'], c: g },
      { a: { id: 'L102', w: 'JobRepository' }, cells: ['JobRepository étend JobExplorer', 'une seule interface : lire et écrire'], c: g },
      { a: { id: 'L103', w: 'annotation' }, cells: ['@EnableJdbcJobRepository', 'déclare le dépôt JDBC'], c: p }], { size: 24, rh: 76, b: 'L104' }),
    ch({ id: 'L100', w: 'paramètres' }, 520, 920, 'core.job.parameters', g, { size: 24, b: 'L104' }), ch({ id: 'L100', w: 'Les steps' }, 960, 920, 'core.step', g, { size: 24, b: 'L104' }), ch({ id: 'L100', w: 'lecteurs' }, 1400, 920, 'infrastructure.item', g, { size: 24, b: 'L104' }),
    pl({ id: 'L104', w: 'Job' }, 360, 960, 1, 'Job', b, { size: 26 }), pl({ id: 'L104', w: 'JobInstance' }, 720, 960, 2, 'Instance', g, { size: 26 }),
    pl({ id: 'L104', w: 'JobExecution' }, 1080, 960, 3, 'Execution', o, { size: 26 }), pl({ id: 'L104', w: 'JobRepository' }, 1440, 960, 4, 'Repository', r, { size: 26 }),
    ch({ id: 'L105', w: 'projet' }, 1600, 330, '1.3 · le projet →', p, { size: 30 }),
  ],
  quiz: [{ q: 'L092', a: 'L093', question: 'Dans quelle couche se trouve le JobRepository ?', choices: ['Application', 'Noyau', 'Infrastructure'], win: 1, answer: "Dans le noyau : un composant du cœur, que ton application utilise sans le réécrire." }],
  cues: [{ a: { id: 'L084', w: 'application' }, s: 'pop' }, { a: { id: 'L085', w: 'noyau' }, s: 'pop' }, { a: { id: 'L086', w: 'infrastructure' }, s: 'pop' }, { a: { id: 'L096', w: 'exige' }, s: 'ding' }, { a: { id: 'L099', w: 'paquets' }, s: 'error' }],
});

// ---------- Scène 7 : le pom (1.3) ----------
SCENES[7] = mk({
  label: 'POM', color: p, part: '1.3 · LE POM',
  els: [
    tm({ id: 'L106', w: 'besoin' }, 100, 200, 1060, 700, 'pom.xml', [
      { a: { id: 'L108', w: 'parent' }, s: '<parent>', c: C.text }, { a: { id: 'L108', w: 'Boot' }, s: '  <artifactId>spring-boot-starter-parent</artifactId>', c: C.text },
      { a: { id: 'L108', w: 'fixe' }, s: '  <version>4.1.2</version>', c: y }, { a: { id: 'L108', w: 'Je' }, s: '</parent>', c: C.text },
      { a: { id: 'L109', w: 'Java' }, s: '<java.version>25</java.version>', c: o },
      { a: { id: 'L111', w: 'starter' }, s: '<dependency>', c: C.text }, { a: { id: 'L111', w: 'apporte' }, s: '  <artifactId>spring-boot-starter-batch-jdbc</artifactId>', c: g }, { a: { id: 'L111', w: 'support JDBC' }, s: '</dependency>', c: C.text },
      { a: { id: 'L112', w: 'pilote' }, s: '<dependency>', c: C.text }, { a: { id: 'L112', w: 'PostgreSQL' }, s: '  <artifactId>postgresql</artifactId>', c: b }, { a: { id: 'L112', w: 'runtime' }, s: '  <scope>runtime</scope>', c: o }, { a: { id: 'L112', w: 'exécution' }, s: '</dependency>', c: C.text },
      { a: { id: 'L113', w: 'Enfin' }, s: '<dependency>', c: C.text }, { a: { id: 'L113', w: 'starter de test' }, s: '  <artifactId>spring-boot-starter-batch-jdbc-test</artifactId>', c: p }, { a: { id: 'L113', w: 'portée test' }, s: '  <scope>test</scope>', c: o }, { a: { id: 'L113', w: 'jamais' }, s: '</dependency>', c: C.text }], { size: 21, accent: p }),
    ch({ id: 'L107', w: 'une par une' }, 1500, 280, 'batch 5.x', o, { size: 28, b: 'L108' }), ch({ id: 'L107', w: 'une par une' }, 1500, 360, 'jdbc 3.x', o, { size: 28, b: 'L108' }), ch({ id: 'L107', w: 'une par une' }, 1500, 440, 'driver 42.x', o, { size: 28, b: 'L108' }),
    cr({ id: 'L107', w: 'plus' }, 1500, 360, 70, r, { b: 'L108' }),
    bx({ id: 'L110', w: 'compilateur' }, 1400, 300, 240, 100, 'JDK 25', g, { b: 'L114' }), bx({ id: 'L110', w: 'JDK plus ancien' }, 1700, 300, 200, 100, 'JDK 17', o, { b: 'L114' }),
    ar({ id: 'L110', w: 'refusera' }, 1500, 420, 1650, 420, r, { b: 'L114' }), ch({ id: 'L110', w: 'refusera' }, 1580, 480, 'classes refusées', r, { size: 22, b: 'L114' }),
    pl({ id: 'L114', w: 'Retiens' }, 1280, 250, 1, 'un seul numéro : celui du parent', y, { size: 24 }), pl({ id: 'L114', w: 'une seule' }, 1280, 340, 2, 'Java 25', o, { size: 24 }),
    pl({ id: 'L114', w: 'parent' }, 1280, 430, 3, 'starter Batch + JDBC', g, { size: 24 }), pl({ id: 'L114', w: 'Tout le reste' }, 1280, 520, 4, 'pilote : runtime', b, { size: 24 }),
    pl({ id: 'L114', w: 'toi' }, 1280, 610, 5, 'test : jamais livré', p, { size: 24 }),
    ch({ id: 'L117', w: 'base' }, 1500, 900, 'application.properties →', o, { size: 28 }),
  ],
  quiz: [{ q: 'L115', a: 'L116', question: "Dans ce pom, où écris-tu la version de Spring Batch ?", choices: ['dans le starter', 'dans le parent', 'nulle part'], win: 2, answer: "Nulle part : elle vient du parent, qui garantit que toutes les briques sont compatibles." }],
  cues: [{ a: { id: 'L107', w: 'plus' }, s: 'error' }, { a: { id: 'L108', w: 'fixe' }, s: 'success' }, { a: { id: 'L110', w: 'refusera' }, s: 'error' }],
});

// ---------- Scène 8 : application.properties (1.3) ----------
SCENES[8] = mk({
  label: 'PROPERTIES', color: o, part: '1.3 · APPLICATION.PROPERTIES',
  els: [
    ic({ id: 'L118', w: 'dépôt' }, 400, 420, 'file', b, { lab: 'Git' }), ch({ id: 'L118', w: 'mot de passe' }, 400, 540, 'password=secret', r, { size: 30, b: 'L119' }), stp({ id: 'L118', w: 'jamais' }, 1100, 460, 'ALERTE', r, { b: 'L119' }),
    tm({ id: 'L119', w: 'syntaxe' }, 100, 200, 1300, 380, 'application.properties', [
      { a: { id: 'L119', w: 'syntaxe' }, s: 'spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/batchdb}', c: o },
      { a: { id: 'L120', w: 'utilisateur' }, s: 'spring.datasource.username=${DB_USER:batch}', c: o },
      { a: { id: 'L121', w: 'aucun défaut' }, s: 'spring.datasource.password=${DB_PASSWORD}', c: r },
      { a: { id: 'L123', w: 'lancement automatique' }, s: 'spring.batch.job.enabled=false', c: b },
      { a: { id: 'L124', w: 'création du schéma' }, s: 'spring.batch.jdbc.initialize-schema=never', c: g }], { size: 22, accent: o }),
    ic({ id: 'L121', w: 'aucun défaut' }, 1650, 330, 'lock', r, { s: 80 }), ch({ id: 'L121', w: 'jamais' }, 1650, 430, 'aucun défaut', r, { size: 26 }),
    bx({ id: 'L122', w: 'poste' }, 350, 720, 420, 110, 'poste', b, { sub: 'DB_PASSWORD défini à la main', size: 28, b: 'L125' }), bx({ id: 'L122', w: 'orchestrateur' }, 860, 720, 420, 110, 'recette', o, { sub: 'injecté par l\'orchestrateur', size: 28, b: 'L125' }),
    bx({ id: 'L122', w: 'coffre-fort' }, 1370, 720, 420, 110, 'production', g, { sub: 'coffre-fort de secrets', size: 28, b: 'L125' }),
    ch({ id: 'L122', w: 'ne change pas' }, 860, 860, 'le code ne change pas', y, { size: 28, b: 'L125' }),
    ic({ id: 'L125', w: 'fichier' }, 330, 780, 'file', g, { lab: 'V1' }), ic({ id: 'L125', w: 'relu en revue' }, 470, 780, 'file', g, { lab: 'V2' }), ic({ id: 'L125', w: 'même ordre' }, 610, 780, 'file', g, { lab: 'V3' }),
    ch({ id: 'L125', w: 'versionné' }, 470, 680, 'schéma versionné (Flyway, Liquibase)', g, { size: 26 }),
    ch({ id: 'L126', w: 'aucune trace' }, 1250, 780, 'always : aucune trace', r, { size: 28 }), cr({ id: 'L126', w: 'aucune trace' }, 1650, 780, 40, r),
    ch({ id: 'L127', w: 'always' }, 520, 930, 'dev : always', o, { size: 28 }), ch({ id: 'L127', w: 'production' }, 1050, 930, 'prod : never', g, { size: 28 }),
    ch({ id: 'L130', w: 'jamais' }, 1500, 930, "jamais créé par l'application", y, { size: 26 }),
    ch({ id: 'L131', w: 'pièce' }, 1500, 1000, 'BatchInfraConfig.java →', p, { size: 24 }),
  ],
  quiz: [{ q: 'L128', a: 'L129', question: "Quelle valeur mets-tu en production pour la création du schéma ?", choices: ['always', 'never', 'embedded'], win: 1, answer: "never : le schéma vient de l'outil de migration, jamais de l'application." }],
  cues: [{ a: { id: 'L118', w: 'jamais' }, s: 'buzzer', g: -8 }, { a: { id: 'L121', w: 'aucun défaut' }, s: 'lock' }, { a: { id: 'L126', w: 'aucune trace' }, s: 'error' }, { a: { id: 'L130', w: 'jamais' }, s: 'stamp' }],
});

// ---------- Scène 9 : @EnableJdbcJobRepository ligne par ligne (1.3) ----------
SCENES[9] = mk({
  label: 'JOB_REPOSITORY', color: g, part: '1.3 · @ENABLEJDBCJOBREPOSITORY, LIGNE PAR LIGNE',
  els: [
    db({ id: 'L132', w: 'JobRepository' }, 1600, 330, 230, 170, b, 'PostgreSQL', { size: 22 }),
    tm({ id: 'L133', w: 'classe' }, 100, 200, 1250, 380, 'BatchInfraConfig.java', [
      { a: { id: 'L133', w: 'classe' }, s: '@Configuration', c: o }, { a: { id: 'L134', w: 'EnableJdbcJobRepository' }, s: '@EnableJdbcJobRepository(', c: o },
      { a: { id: 'L135', w: 'DataSource' }, s: '    dataSourceRef = "dataSource",', c: C.text }, { a: { id: 'L136', w: 'gestionnaire' }, s: '    transactionManagerRef = "transactionManager",', c: C.text },
      { a: { id: 'L137', w: 'préfixe' }, s: '    tablePrefix = "BATCH_")', c: C.text }, { a: { id: 'L138', w: 'aucune méthode' }, s: 'public class BatchInfraConfig { }', c: b }], { size: 28, accent: g }),
    ar({ id: 'L134', w: 'déclare' }, 1370, 400, 1500, 380, g), ch({ id: 'L134', w: 'déclare' }, 1600, 470, 'JobRepository JDBC', g, { size: 24 }),
    ch({ id: 'L135', w: 'Boot' }, 1600, 540, 'bean DataSource de Boot', b, { size: 22 }), ch({ id: 'L136', w: 'transactions' }, 1600, 600, 'transactions des métadonnées', b, { size: 22 }),
    ch({ id: 'L137', w: 'plusieurs applications' }, 1600, 660, 'plusieurs applications, un schéma', o, { size: 22 }),
    ch({ id: 'L139', w: 'quatre' }, 450, 700, 'v4 : une classe qui étend un configurateur', d, { size: 26, b: 'L140' }), cr({ id: 'L139', w: 'quatre' }, 1000, 700, 34, r, { b: 'L140' }),
    ch({ id: 'L139', w: 'une annotation' }, 450, 780, 'v6 : une annotation', g, { size: 28, b: 'L140' }),
    cd({ id: 'L140', w: 'isolation' }, 100, 660, 1250, 190, "Ne change pas l'isolation de création", ['isolationLevelForCreate vaut SERIALIZABLE par défaut : le niveau le plus strict.'], o, { size: 26 }),
    ch({ id: 'L141', w: 'baisses' }, 1550, 780, 'READ_COMMITTED → deux lancements', r, { size: 24 }), cr({ id: 'L141', w: 'baisses' }, 1680, 860, 40, r),
    pl({ id: 'L142', w: 'seul numéro' }, 250, 960, 1, 'un seul numéro de version', g, { size: 24 }), pl({ id: 'L142', w: 'propriétés' }, 700, 960, 2, "variables d'environnement", o, { size: 24 }),
    pl({ id: 'L142', w: 'jamais créé' }, 1150, 960, 3, 'schéma jamais créé', b, { size: 24 }), pl({ id: 'L142', w: 'annotation' }, 1560, 960, 4, 'une annotation', p, { size: 24 }),
    ch({ id: 'L143', w: 'premier job' }, 1560, 900, '1.4 · ton premier job →', g, { size: 28 }),
  ],
  cues: [{ a: { id: 'L134', w: 'déclare' }, s: 'success' }, { a: { id: 'L140', w: 'isolation' }, s: 'alarm', g: -12 }, { a: { id: 'L141', w: 'baisses' }, s: 'error' }],
});

// ---------- Scène 10 : le premier job (1.4) ----------
SCENES[10] = mk({
  label: 'PREMIER_JOB', color: g, part: '1.4 · TON PREMIER JOB',
  els: [
    tm({ id: 'L144', w: 'besoin' }, 100, 190, 1070, 730, 'FirstJobConfig.java', [
      { a: { id: 'L146', w: 'journal' }, s: '@Configuration public class FirstJobConfig {', c: C.text }, { a: { id: 'L146', w: 'logs' }, s: '  private static final Logger log = ...;', c: C.text },
      { a: { id: 'L147', w: 'comme un bean' }, s: '  @Bean Tasklet firstTasklet() {', c: o }, { a: { id: 'L148', w: 'lambda' }, s: '    return (contribution, chunkContext) -> {', c: b },
      { a: { id: 'L149', w: 'StepContribution' }, s: '      log.info("Bonjour depuis {}",', c: C.text }, { a: { id: 'L149', w: 'nom' }, s: '        contribution.getStepExecution().getStepName());', c: C.text },
      { a: { id: 'L150', w: 'FINISHED' }, s: '      return RepeatStatus.FINISHED;', c: g }, { a: { id: 'L150', w: 'CONTINUABLE' }, s: '    }; }', c: C.text },
      { a: { id: 'L151', w: 'step' }, s: '  @Bean Step firstStep(JobRepository repo,', c: o }, { a: { id: 'L151', w: 'injecte' }, s: '        PlatformTransactionManager tx, Tasklet firstTasklet) {', c: C.text },
      { a: { id: 'L152', w: 'nom du step' }, s: '    return new StepBuilder("firstStep", repo)', c: y }, { a: { id: 'L153', w: 'transaction' }, s: '        .tasklet(firstTasklet, tx).build(); }', c: g },
      { a: { id: 'L157', w: 'job' }, s: '  @Bean Job firstJob(JobRepository repo, Step firstStep) {', c: o }, { a: { id: 'L157', w: 'nom' }, s: '    return new JobBuilder("firstJob", repo)', c: y },
      { a: { id: 'L158', w: 'start' }, s: '        .start(firstStep).build(); }', c: g }, { a: { id: 'L158', w: 'build' }, s: '}', c: C.text }], { size: 22, accent: g }),
    bx({ id: 'L145', w: 'tasklet' }, 1520, 300, 560, 120, 'Tasklet = une action', g, { size: 30, b: 'L159' }),
    ch({ id: 'L154', w: 'exception' }, 1520, 450, 'exception → rollback', r, { size: 28, b: 'L159' }), ch({ id: 'L155', w: 'enregistré' }, 1520, 540, 'FAILED + message en base', r, { size: 26, b: 'L159' }),
    ch({ id: 'L156', w: 'lendemain' }, 1520, 630, 'la trace : lue le lendemain', y, { size: 26, b: 'L159' }),
    bx({ id: 'L159', w: 'plus petit' }, 1300, 300, 190, 100, 'Job', g, { b: 'L160' }), bx({ id: 'L159', w: 'plus petit' }, 1520, 300, 190, 100, 'Step', g, { b: 'L160' }), bx({ id: 'L159', w: 'plus petit' }, 1740, 300, 190, 100, 'Tasklet', g, { size: 26, b: 'L160' }),
    ar({ id: 'L159', w: 'plus petit' }, 1395, 300, 1425, 300, g, { b: 'L160' }), ar({ id: 'L159', w: 'plus petit' }, 1615, 300, 1645, 300, g, { b: 'L160' }),
    tm({ id: 'L160', w: 'Lançons' }, 1200, 190, 640, 730, 'console', [
      { a: { id: 'L161', w: 'lancement' }, s: 'Job: [firstJob] launched', c: C.text }, { a: { id: 'L161', w: 'runDate' }, s: '  parameters: {runDate=2026-11-01}', c: b },
      { a: { id: 'L162', w: 'step qui démarre' }, s: 'Executing step: [firstStep]', c: C.text }, { a: { id: 'L162', w: 'bonjour' }, s: 'Bonjour depuis firstStep', c: o },
      { a: { id: 'L163', w: 'statut final' }, s: 'Job: [firstJob] completed', c: C.text }, { a: { id: 'L163', w: 'terminé' }, s: '  status: [COMPLETED]', c: g },
      { a: { id: 'L165', w: 'Une exception' }, s: '! JobInstanceAlreadyCompleteException', c: r },
      { a: { id: 'L165', w: 'change la date' }, s: 'runDate=2026-11-02 → COMPLETED', c: g }], { size: 22, accent: g }),
    ch({ id: 'L160', w: 'indicatif' }, 1520, 130, 'extrait indicatif', o, { size: 22 }),
  ],
  quiz: [{ q: 'L164', a: 'L165', question: "Tu relances exactement la même commande, avec la même date. Qu'est-ce qui s'affiche ?", choices: ['rien de plus', 'une exception', 'un second COMPLETED'], win: 1, answer: "JobInstanceAlreadyCompleteException : l'instance est fermée. Pour relancer, change la date." }],
  cues: [{ a: { id: 'L150', w: 'FINISHED' }, s: 'success' }, { a: { id: 'L154', w: 'exception' }, s: 'error' }, { a: { id: 'L163', w: 'terminé' }, s: 'success' }, { a: { id: 'L165', w: 'Une exception' }, s: 'error' }],
});

// ---------- Scène 11 : lancer le job par une API (1.4) ----------
SCENES[11] = mk({
  label: 'API', color: b, part: '1.4 · LANCER PAR UNE API',
  els: [
    tm({ id: 'L167', w: 'record' }, 100, 190, 1040, 600, 'FirstJobController.java', [
      { a: { id: 'L167', w: 'record' }, s: 'record RunRequest(String runDate) { }', c: b },
      { a: { id: 'L168', w: 'réponse' }, s: 'record RunResult(long executionId, String status) {', c: b }, { a: { id: 'L168', w: 'switch' }, s: '  static RunResult of(JobExecution ex) { ... switch (ex.getStatus()) {', c: C.text },
      { a: { id: 'L169', w: 'Terminé' }, s: '    case COMPLETED -> "TERMINÉ";', c: g }, { a: { id: 'L169', w: 'Échec' }, s: '    case FAILED, STOPPED -> "À REPRENDRE";', c: o }, { a: { id: 'L169', w: 'Le reste' }, s: '    default -> ex.getStatus().name(); } }', c: C.text },
      { a: { id: 'L170', w: 'contrôleur' }, s: '@RestController class FirstJobController {', c: o }, { a: { id: 'L171', w: 'POST' }, s: '  @PostMapping("/jobs/first")', c: o },
      { a: { id: 'L172', w: 'JobParametersBuilder' }, s: '  RunResult run(@RequestBody RunRequest req) {', c: C.text }, { a: { id: 'L172', w: 'JobParametersBuilder' }, s: '    var params = new JobParametersBuilder()', c: C.text },
      { a: { id: 'L172', w: 'runDate est' }, s: '        .addString("runDate", req.runDate()).toJobParameters();', c: y }, { a: { id: 'L180', w: 'Enfin' }, s: '    return RunResult.of(jobOperator.start(firstJob, params));', c: g },
      { a: { id: 'L180', w: 'terminée' }, s: '  } }', c: C.text }], { size: 21, accent: b }),
    bx({ id: 'L166', w: 'besoin' }, 1500, 280, 360, 100, 'ordonnanceur', o, { size: 28, b: 'L171' }), ar({ id: 'L166', w: 'besoin' }, 1500, 335, 1500, 405, o, { b: 'L171' }),
    bx({ id: 'L166', w: 'job' }, 1500, 460, 360, 100, 'requête HTTP', b, { size: 28, b: 'L171' }), ar({ id: 'L166', w: 'job' }, 1500, 515, 1500, 585, b, { b: 'L171' }),
    bx({ id: 'L166', w: 'extérieur' }, 1500, 640, 360, 100, 'application', g, { size: 28, b: 'L171' }),
    ch({ id: 'L171', w: 'POST' }, 1500, 300, 'POST : modifie l\'état', g, { size: 28, b: 'L173' }), ch({ id: 'L171', w: 'GET' }, 1500, 390, 'GET : jamais', r, { size: 28, b: 'L173' }),
    ch({ id: 'L173', w: 'sortes' }, 1500, 150, 'deux sortes de paramètres', y, { size: 24, b: 'L181' }),
    cd({ id: 'L174', w: 'identifiants' }, 1200, 190, 620, 240, 'Identifiants', ["définissent l'instance", 'la date métier : runDate'], g, { b: 'L181' }),
    cd({ id: 'L175', w: 'non identifiants' }, 1200, 460, 620, 240, 'Non identifiants', ["accompagnent l'exécution", 'horodatage, opérateur, commentaire'], o, { b: 'L181' }),
    ch({ id: 'L176', w: 'booléen' }, 1500, 760, 'addString(clé, valeur, false)', o, { size: 24, b: 'L181' }),
    ch({ id: 'L177', w: 'hésites' }, 960, 900, "deux valeurs différentes = deux traitements ? alors identifiant", y, { size: 26, b: 'L181' }),
    ch({ id: 'L179', w: 'Non identifiant' }, 1500, 820, "l'opérateur : non identifiant", o, { size: 26, b: 'L181' }),
    tm({ id: 'L181', w: 'appel' }, 1180, 190, 640, 300, 'terminal', [
      { a: { id: 'L181', w: 'appel' }, s: '$ curl -X POST /jobs/first', c: C.text }, { a: { id: 'L181', w: 'date' }, s: "  -d '{\"runDate\":\"2026-11-02\"}'", c: b },
      { a: { id: 'L181', w: 'réponse' }, s: '{"executionId":1,', c: g }, { a: { id: 'L181', w: 'statut' }, s: ' "status":"TERMINÉ"}', c: g }], { size: 22, accent: b, b: 'L182' }),
    bar({ id: 'L182', w: 'synchrone' }, 1500, 330, 560, 44, [[{ id: 'L182', w: 'synchrone' }, 0], [{ id: 'L182', w: 'bloquée' }, 1]], r, { label: 'requête HTTP bloquée', b: 'L183' }),
    ch({ id: 'L182', w: 'reste' }, 1500, 420, 'délai dépassé', r, { size: 28, b: 'L183' }),
    ch({ id: 'L183', w: 'vingt minutes' }, 1400, 330, 'client : abandonne à 30 s', r, { size: 26 }), ch({ id: 'L183', w: 'continuera' }, 1400, 410, 'job : continue, personne ne sait', o, { size: 26 }),
    pl({ id: 'L184', w: 'tasklet' }, 250, 960, 1, 'job, step, tasklet', g, { size: 24 }), pl({ id: 'L184', w: 'paramètres' }, 700, 960, 2, 'paramètres identifiants', p, { size: 24 }),
    pl({ id: 'L184', w: 'POST' }, 1150, 960, 3, 'lancement par POST', b, { size: 24 }), pl({ id: 'L184', w: 'asynchrone' }, 1560, 960, 4, 'job long : asynchrone', o, { size: 24 }),
    ch({ id: 'L185', w: 'base' }, 1500, 880, '1.5 · sous le capot →', b, { size: 28 }),
  ],
  quiz: [{ q: 'L178', a: 'L179', question: "Tu veux tracer qui a lancé le job, sans créer une nouvelle instance à chaque fois. Identifiant ou non ?", choices: ['identifiant', 'non identifiant'], win: 1, answer: "Non identifiant : l'opérateur est une information de contexte, il ne change pas le traitement." }],
  cues: [{ a: { id: 'L171', w: 'GET' }, s: 'error' }, { a: { id: 'L182', w: 'bloquée' }, s: 'error' }, { a: { id: 'L181', w: 'statut' }, s: 'success' }],
});

// ---------- Scène 12 : les six tables (1.5) ----------
SCENES[12] = mk({
  label: 'SIX_TABLES', color: b, part: '1.5 · SOUS LE CAPOT : LES SIX TABLES',
  els: [
    en({ id: 'L188', w: 'instances' }, 100, 190, 520, 'batch_job_instance', ['job_instance_id      PK', 'job_name', 'job_key (hachage)'], b, { b: 'L195' }),
    en({ id: 'L189', w: 'exécutions' }, 700, 190, 520, 'batch_job_execution', ['job_execution_id     PK', 'job_instance_id      FK', 'status · exit_code', 'start_time · end_time', { x: 'version', hot: true }], g, { b: 'L195' }),
    en({ id: 'L190', w: 'paramètres' }, 1300, 190, 520, 'batch_job_execution_params', ['job_execution_id     FK', 'parameter_name · type', 'parameter_value', 'identifying'], g, { nsize: 17, b: 'L195' }),
    en({ id: 'L191', w: 'contexte' }, 1300, 520, 520, 'batch_job_execution_context', ['job_execution_id     FK', 'short_context (état du job)'], g, { nsize: 17, b: 'L195' }),
    en({ id: 'L192', w: 'steps' }, 700, 520, 520, 'batch_step_execution', ['step_execution_id    PK', 'job_execution_id     FK', 'step_name · status', 'read · write · filter', 'rollback', { x: 'version', hot: true }], p, { b: 'L195' }),
    en({ id: 'L193', w: 'sauvegarde' }, 100, 520, 520, 'batch_step_execution_context', ['step_execution_id    FK', 'short_context (position)'], p, { nsize: 17, b: 'L195' }),
    ar({ id: 'L189', w: 'exécutions' }, 620, 290, 700, 290, d, { b: 'L195' }), ar({ id: 'L190', w: 'paramètres' }, 1220, 290, 1300, 290, d, { b: 'L195' }),
    ar({ id: 'L192', w: 'steps' }, 960, 404, 960, 520, d, { b: 'L195' }), ar({ id: 'L191', w: 'contexte' }, 1220, 390, 1300, 570, d, { b: 'L195' }), ar({ id: 'L193', w: 'sauvegarde' }, 700, 620, 620, 620, d, { b: 'L195' }),
    ch({ id: 'L186', w: 'écrit' }, 960, 150, 'ce que Spring Batch a écrit', y, { size: 26, b: 'L187' }),
    ch({ id: 'L187', w: 'six tables' }, 960, 150, 'six tables · trois séquences', y, { size: 26, b: 'L195' }),
    ch({ id: 'L194', w: 'séquences' }, 960, 900, 'batch_*_seq × 3', o, { size: 26, b: 'L195' }), ch({ id: 'L194', w: 'version' }, 1500, 900, 'version : verrouillage optimiste', r, { size: 24, b: 'L195' }),
    tm({ id: 'L195', w: 'Vérifions' }, 100, 190, 860, 470, 'psql', [
      { a: { id: 'L195', w: 'liste' }, s: 'batchdb=# \\dt batch_*', c: C.text }, { a: { id: 'L195', w: 'six' }, s: ' batch_job_instance', c: g }, { a: { id: 'L195', w: 'six' }, s: ' batch_job_execution', c: g },
      { a: { id: 'L195', w: 'préfixées' }, s: ' batch_job_execution_params', c: g }, { a: { id: 'L195', w: 'préfixées' }, s: ' batch_job_execution_context', c: g }, { a: { id: 'L195', w: 'batch' }, s: ' batch_step_execution', c: g }, { a: { id: 'L195', w: 'batch' }, s: ' batch_step_execution_context', c: g },
      { a: { id: 'L196', w: 'séquences' }, s: 'batchdb=# \\ds batch_*', c: C.text }, { a: { id: 'L196', w: 'trois' }, s: ' batch_job_instance_seq', c: o }, { a: { id: 'L196', w: 'trois' }, s: ' batch_job_execution_seq', c: o }, { a: { id: 'L196', w: 'identifiant' }, s: ' batch_step_execution_seq', c: o }], { size: 22, accent: b, b: 'L197' }),
    tm({ id: 'L197', w: 'deux sessions' }, 100, 190, 880, 540, 'session 1', [
      { a: { id: 'L198', w: 'strict' }, s: 'BEGIN ISOLATION LEVEL SERIALIZABLE;', c: C.text }, { a: { id: 'L198', w: 'en cours' }, s: 'SELECT … en cours   →  0 ligne', c: b },
      { a: { id: 'L199', w: 'insèrent' }, s: 'INSERT INTO batch_job_execution …', c: o }, { a: { id: 'L200', w: 'première' }, s: 'COMMIT;   OK', c: g }], { size: 22, accent: g, b: 'L201' }),
    tm({ id: 'L197', w: 'deux sessions' }, 1000, 190, 820, 540, 'session 2', [
      { a: { id: 'L198', w: 'pareil' }, s: 'BEGIN ISOLATION LEVEL SERIALIZABLE;', c: C.text }, { a: { id: 'L198', w: 'pareil' }, s: 'SELECT … en cours   →  0 ligne', c: b },
      { a: { id: 'L199', w: 'insèrent' }, s: 'INSERT INTO batch_job_execution …', c: o }, { a: { id: 'L200', w: 'échoue' }, s: 'ERREUR : could not serialize access', c: r }, { a: { id: 'L200', w: 'sérialisation' }, s: 'SQLSTATE 40001', c: r }], { size: 22, accent: r, b: 'L201' }),
    ch({ id: 'L197', w: 'Reconstitution' }, 960, 150, 'reconstitution simplifiée', o, { size: 22, b: 'L201' }),
    ch({ id: 'L201', w: 'Regardons' }, 960, 150, 'exemple indicatif', o, { size: 22 }),
    en({ id: 'L202', w: 'instance' }, 100, 230, 820, 'batch_job_instance', ['job_instance_id = 1', 'job_name = firstJob', 'job_key = a3f9…'], b),
    en({ id: 'L203', w: 'exécution' }, 1000, 230, 820, 'batch_job_execution', ['job_execution_id = 1', 'job_instance_id = 1', 'status = COMPLETED', { x: 'version = 2', hot: true }], g),
    en({ id: 'L204', w: 'paramètre' }, 100, 520, 820, 'batch_job_execution_params', ['parameter_name = runDate', 'parameter_type = STRING', 'parameter_value = 2026-11-01', 'identifying = true'], g),
    en({ id: 'L205', w: 'exécution de step' }, 1000, 520, 820, 'batch_step_execution', ['step_name = firstStep', 'read_count = 0  write_count = 0', 'commit_count = 1', 'status = COMPLETED'], p),
    ch({ id: 'L206', w: 'trace' }, 960, 860, 'trace complète : zéro ligne de code de ta part', y, { size: 28, b: 'L207' }),
    bar({ id: 'L207', w: 'transition' }, 960, 500, 1200, 44, [['L207', 0], [{ id: 'L207', w: 'coupé' }, 0.7], [{ id: 'L208', w: 'Et' }, 0.7]], g, { a2: { id: 'L207', w: 'coupé' }, c2: o, label: 'chaque transition est écrite immédiatement' }),
    ch({ id: 'L207', w: 'dernier point' }, 1130, 600, 'dernier point confirmé', g, { size: 28 }), cr({ id: 'L207', w: 'coupé' }, 960, 400, 50, r),
    ch({ id: 'L208', w: 'décide' }, 960, 800, 'vérification du lancement →', o, { size: 30 }),
  ],
  cues: [{ a: { id: 'L188', w: 'instances' }, s: 'pop' }, { a: { id: 'L189', w: 'exécutions' }, s: 'pop' }, { a: { id: 'L192', w: 'steps' }, s: 'pop' }, { a: { id: 'L200', w: 'échoue' }, s: 'error' }, { a: { id: 'L206', w: 'trace' }, s: 'success' }],
});

// ---------- Scène 13 : la vérification d'un lancement (1.5) ----------
SCENES[13] = mk({
  label: 'VERIFICATION', color: o, part: "1.5 · COMMENT UN LANCEMENT EST VÉRIFIÉ",
  els: [
    bx({ id: 'L209', w: 'chercher' }, 250, 400, 400, 150, '1 · Chercher la JobInstance', b, { sub: 'nom + hachage des paramètres', size: 24 }),
    bx({ id: 'L210', w: 'Deuxième' }, 720, 400, 400, 150, '2 · En cours ?', r, { size: 28 }), bx({ id: 'L211', w: 'Troisième' }, 1190, 400, 400, 150, '3 · Déjà COMPLETED ?', r, { size: 28 }),
    bx({ id: 'L212', w: 'crée' }, 1660, 400, 400, 150, '4 · Nouvelle JobExecution', g, { size: 24 }),
    ar({ id: 'L210', w: 'Deuxième' }, 455, 400, 515, 400, d), ar({ id: 'L211', w: 'Troisième' }, 925, 400, 985, 400, d), ar({ id: 'L212', w: 'crée' }, 1395, 400, 1455, 400, d),
    ch({ id: 'L210', w: 'refusé' }, 720, 520, 'JobExecutionAlreadyRunningException', r, { size: 18 }), ch({ id: 'L211', w: 'refusé' }, 1190, 520, 'JobInstanceAlreadyCompleteException', r, { size: 18 }),
    ch({ id: 'L213', w: 'deux serveurs' }, 190, 220, 'serveur A', b, { size: 24, b: 'L216' }), ch({ id: 'L213', w: 'deux serveurs' }, 400, 220, 'serveur B', p, { size: 24, b: 'L216' }),
    ar({ id: 'L213', w: 'même temps' }, 190, 245, 230, 320, b, { b: 'L216' }), ar({ id: 'L213', w: 'même temps' }, 400, 245, 290, 320, p, { b: 'L216' }),
    ch({ id: 'L213', w: 'atomique' }, 960, 230, 'lectures puis création : pas atomique', y, { size: 28, b: 'L216' }),
    bx({ id: 'L214', w: 'faible' }, 480, 700, 460, 120, 'transaction A', o, { sub: 'voit « aucune exécution »', size: 28, b: 'L216' }), bx({ id: 'L214', w: 'faible' }, 1080, 700, 460, 120, 'transaction B', o, { sub: 'voit « aucune exécution »', size: 28, b: 'L216' }),
    ch({ id: 'L214', w: 'chacune' }, 480, 800, 'crée la sienne', r, { size: 26, b: 'L216' }), ch({ id: 'L214', w: 'chacune' }, 1080, 800, 'crée la sienne', r, { size: 26, b: 'L216' }),
    ch({ id: 'L215', w: 'strict' }, 1660, 300, 'SERIALIZABLE', g, { size: 28 }),
    bx({ id: 'L216', w: 'échouer' }, 480, 700, 460, 120, 'transaction A', g, { sub: 'valide', size: 28 }), bx({ id: 'L216', w: 'échouer' }, 1080, 700, 460, 120, 'transaction B', r, { sub: 'échoue : SQLSTATE 40001', size: 28 }),
    ch({ id: 'L217', w: 'retenté' }, 780, 880, 'le perdant : retenter ou abandonner', y, { size: 30 }),
    ch({ id: 'L220', w: 'mécanisme' }, 1500, 960, 'verrouillage optimiste →', p, { size: 28 }),
  ],
  quiz: [{ q: 'L218', a: 'L219', question: "On a baissé l'isolation, et les deux serveurs vérifient au même instant. Que se passe-t-il ?", choices: ['une seule exécution', 'deux exécutions', 'une exception'], win: 1, answer: "Les deux créent une exécution : deux traitements concurrents, des données en double. L'isolation stricte l'empêche." }],
  cues: [{ a: { id: 'L210', w: 'Deuxième' }, s: 'pop' }, { a: { id: 'L211', w: 'Troisième' }, s: 'pop' }, { a: { id: 'L212', w: 'crée' }, s: 'success' }, { a: { id: 'L216', w: 'échouer' }, s: 'error' }],
});

// ---------- Scène 14 : le verrouillage optimiste (1.5) ----------
const LA = 380, LD = 960, LB = 1540;
SCENES[14] = mk({
  label: 'VERROU_OPTIMISTE', color: p, part: '1.5 · LE VERROUILLAGE OPTIMISTE',
  els: [
    ic({ id: 'L221', w: 'collègues' }, 300, 520, 'person', b, { sc: 1.6, b: 'L222' }), ic({ id: 'L221', w: 'collègues' }, 1100, 520, 'person', p, { sc: 1.6, b: 'L222' }),
    cd({ id: 'L221', w: 'document' }, 520, 220, 520, 170, 'Document partagé', ['version 3'], g, { b: 'L222' }),
    ch({ id: 'L221', w: 'premier' }, 300, 660, 'enregistre en premier', g, { size: 26, b: 'L222' }), ch({ id: 'L221', w: 'second' }, 1100, 660, 'veut enregistrer ensuite', o, { size: 26, b: 'L222' }),
    cd({ id: 'L222', w: 'bloque' }, 150, 400, 780, 220, 'Pessimiste', ["on bloque le document pour tous", 'pendant toute l\'édition'], o, { b: 'L224' }),
    cd({ id: 'L222', w: 'laisse faire' }, 990, 400, 780, 220, 'Optimiste', ['on laisse faire', "on vérifie à l'enregistrement"], g, { b: 'L224' }),
    stp({ id: 'L223', w: 'optimiste' }, 1380, 720, 'ON PARIE SUR L\'ABSENCE DE CONFLIT', g, { size: 30, b: 'L224' }),
    // diagramme de séquence (disparaît à L229)
    ...until('L229', [
    bx({ id: 'L224', w: 'Dans Spring Batch' }, LA, 240, 300, 80, 'Serveur A', b, { size: 28 }), bx({ id: 'L224', w: 'Dans Spring Batch' }, LD, 240, 300, 80, 'PostgreSQL', g, { size: 28 }), bx({ id: 'L224', w: 'Dans Spring Batch' }, LB, 240, 300, 80, 'Serveur B', p, { size: 28 }),
    ln('L224', LA, 290, LA, 960, b, { dash: true, lw: 2 }), ln('L224', LD, 290, LD, 960, g, { dash: true, lw: 2 }), ln('L224', LB, 290, LB, 960, p, { dash: true, lw: 2 }),
    ar({ id: 'L224', w: 'serveur A' }, LA, 380, LD - 6, 380, C.text), tx({ id: 'L224', w: 'serveur A' }, 670, 350, "lit l'exécution 42 : version = 3", { size: 22, fam: MONO }),
    ar({ id: 'L225', w: 'aussi' }, LB, 470, LD + 6, 470, C.text), tx({ id: 'L225', w: 'aussi' }, 1250, 440, "lit l'exécution 42 : version = 3", { size: 22, fam: MONO }),
    ar({ id: 'L226', w: 'condition' }, LA, 580, LD - 6, 580, C.text), tx({ id: 'L226', w: 'condition' }, 670, 550, 'UPDATE … WHERE id = 42 AND version = 3', { size: 20, fam: MONO }),
    ar({ id: 'L226', w: 'Une ligne' }, LD - 6, 670, LA, 670, g, { dash: true }), tx({ id: 'L226', w: 'Une ligne' }, 670, 640, '1 ligne modifiée : version = 4', { size: 22, fam: MONO, c: g }),
    ar({ id: 'L227', w: 'B écrit' }, LB, 780, LD + 6, 780, C.text), tx({ id: 'L227', w: 'B écrit' }, 1250, 750, 'UPDATE … WHERE id = 42 AND version = 3', { size: 20, fam: MONO }),
    ar({ id: 'L227', w: 'aucune ligne' }, LD + 6, 870, LB, 870, r, { dash: true }), tx({ id: 'L227', w: 'aucune ligne' }, 1250, 840, '0 ligne modifiée', { size: 22, fam: MONO, c: r }),
    ch({ id: 'L228', w: 'OptimisticLockingFailureException' }, 1380, 930, 'OptimisticLockingFailureException', r, { size: 20 }), cr({ id: 'L228', w: 'refusé' }, LB, 870, 30, r)
    ]),
    cd({ id: 'L229', w: 'pas de blocage' }, 150, 230, 780, 240, 'Avantage', ["aucun verrou tenu pendant la lecture", 'pas de blocage'], g, { b: 'L232' }), cd({ id: 'L229', w: 'prix' }, 990, 230, 780, 240, 'Coût', ["le perdant doit gérer l'échec"], o, { b: 'L232' }),
    ic({ id: 'L230', w: 'pessimiste' }, 250, 650, 'lock', r, { s: 90, b: 'L232' }), ic({ id: 'L230', w: 'Personne' }, 450, 680, 'person', d, { sc: 1.1, b: 'L232' }), ic({ id: 'L230', w: 'Personne' }, 600, 680, 'person', d, { sc: 1.1, b: 'L232' }), ic({ id: 'L230', w: 'Personne' }, 750, 680, 'person', d, { sc: 1.1, b: 'L232' }),
    ch({ id: 'L230', w: 'attend' }, 500, 780, 'tout le monde attend', r, { size: 26, b: 'L232' }),
    ch({ id: 'L231', w: 'optimiste' }, 1450, 650, 'optimiste : conflits rares, détectés', g, { size: 26, b: 'L232' }), ch({ id: 'L231', w: 'détecte' }, 1450, 730, 'pessimiste : on empêche, on attend', o, { size: 26, b: 'L232' }),
    ch({ id: 'L234', w: 'pratique' }, 1500, 960, "ce qu'il faut savoir →", o, { size: 28 }),
  ],
  quiz: [{ q: 'L232', a: 'L233', question: "Le serveur B écrit avec la version trois alors que la base est à la version quatre. Combien de lignes sont modifiées ?", choices: ['une', 'zéro', 'deux'], win: 1, answer: "Zéro. Et c'est précisément ce zéro qui déclenche l'exception." }],
  cues: [{ a: { id: 'L226', w: 'Une ligne' }, s: 'success' }, { a: { id: 'L227', w: 'aucune ligne' }, s: 'error' }, { a: { id: 'L228', w: 'OptimisticLockingFailureException' }, s: 'buzzer', g: -8 }, { a: { id: 'L223', w: 'optimiste' }, s: 'stamp' }],
  fx: [{ a: { id: 'L227', w: 'aucune ligne' }, glitch: 0.5, dur: 0.35 }],
});

// ---------- Scène 15 : un verrouillage atténué (1.5) ----------
SCENES[15] = mk({
  label: 'VERROU_ATTENUE', color: o, part: '1.5 · LE PIÈGE : UN VERROUILLAGE ATTÉNUÉ',
  els: [
    cd({ id: 'L235', w: 'En théorie' }, 100, 200, 560, 400, 'Le mécanisme', ['colonne version sur chaque ligne', 'UPDATE … WHERE id = ? AND version = ?', 'aucune ligne : OptimisticLockingFailureException'], b, { size: 22 }),
    cd({ id: 'L236', w: 'En pratique' }, 680, 200, 560, 400, 'Le piège', ["JdbcJobExecutionDao compare la version en base à celle de l'objet", 'si elles diffèrent : il recopie la version', 'et le statut ne fait que monter'], o, { size: 22 }),
    cd({ id: 'L239', w: 'atténué' }, 1260, 200, 560, 400, 'À retenir', ['le verrouillage existe, mais il est atténué', "ne pas attendre une exception à chaque fois"], g, { size: 22 }),
    ch({ id: 'L237', w: 'monter' }, 960, 660, '↑ le statut monte', g, { size: 26 }), ch({ id: 'L237', w: 'baisser' }, 1300, 660, '↓ jamais', r, { size: 26 }),
    bx({ id: 'L238', w: "ordre d'arrêt" }, 450, 780, 360, 90, 'STOP demandé', r, { size: 26 }), bx({ id: 'L238', w: 'continue' }, 960, 780, 360, 90, 'exécution qui tourne', b, { size: 24 }),
    ar({ id: 'L238', w: 'écrasé' }, 780, 780, 770, 780, d), cr({ id: 'L238', w: 'écrasé' }, 780, 780, 30, r), ch({ id: 'L238', w: 'écrasé' }, 620, 860, "l'arrêt n'est pas écrasé", y, { size: 24 }),
    bx({ id: 'L240', w: 'combine' }, 450, 940, 440, 90, 'exécutions en cours', o, { size: 24 }), tx({ id: 'L240', w: 'combine' }, 760, 940, '+', { size: 50, c: y }), bx({ id: 'L240', w: 'isolation' }, 1060, 940, 440, 90, 'SERIALIZABLE', g, { size: 26 }),
    ch({ id: 'L241', w: 'JobOperator' }, 1620, 800, 'JobOperator.stop(…)', b, { size: 26 }),
    ch({ id: 'L244', w: 'singleton' }, 1620, 940, 'singleton →', p, { size: 28 }),
  ],
  quiz: [{ q: 'L242', a: 'L243', question: "Un test exige l'exception à chaque copie périmée d'une exécution. Est-il fiable ?", choices: ['oui', 'non'], win: 1, answer: "Non : à cause de la synchronisation, l'exception n'est pas systématique. Un tel test se trompera." }],
  cues: [{ a: { id: 'L236', w: 'En pratique' }, s: 'pop' }, { a: { id: 'L238', w: 'écrasé' }, s: 'error' }, { a: { id: 'L240', w: 'combine' }, s: 'success' }],
});

// ---------- Scène 16 : le singleton sans danger (1.5) ----------
SCENES[16] = mk({
  label: 'SINGLETON', color: g, part: '1.5 · UN SINGLETON SANS DANGER',
  els: [
    bx({ id: 'L245', w: 'guichet' }, 500, 400, 360, 150, 'GUICHET', g, { sub: 'une seule instance', size: 32 }),
    ic({ id: 'L245', w: 'ville' }, 170, 420, 'person', d, { sc: 1.2 }), ic({ id: 'L245', w: 'ville' }, 270, 420, 'person', d, { sc: 1.2 }), ar({ id: 'L245', w: 'ville' }, 340, 400, 310, 400, d),
    db({ id: 'L246', w: 'base' }, 1250, 400, 200, 150, b, 'base'), ar({ id: 'L246', w: 'en base' }, 690, 400, 1130, 400, g), ch({ id: 'L246', w: 'ne garde rien' }, 900, 340, 'ne garde rien', g, { size: 26 }),
    ch({ id: 'L248', w: 'sans état' }, 500, 600, 'sans état : sûr', g, { size: 32 }), ch({ id: 'L248', w: "ne l'est pas" }, 1300, 600, 'avec un compteur : piège', r, { size: 32 }),
    bx({ id: 'L247', w: 'compteur' }, 400, 830, 400, 150, 'singleton + compteur', r, { sub: 'en mémoire', size: 28 }),
    tx({ id: 'L247', w: 'total' }, 850, 830, '135,50', { size: 70, fam: MONO, c: r }), ar({ id: 'L249', w: 'double comptage' }, 1010, 830, 1120, 830, r),
    tx({ id: 'L249', w: 'double comptage' }, 1290, 830, '271,00', { size: 70, fam: MONO, c: r, glow: true }), ar({ id: 'L249', w: 'processors' }, 1450, 830, 1540, 830, r), tx({ id: 'L249', w: 'processors' }, 1700, 830, '406,50', { size: 70, fam: MONO, c: r, glow: true }),
    ch({ id: 'L250', w: 'cas' }, 960, 980, 'deux cas d\'usage →', b, { size: 28 }),
  ],
  cues: [{ a: { id: 'L246', w: 'en base' }, s: 'success' }, { a: { id: 'L247', w: 'total' }, s: 'error' }, { a: { id: 'L249', w: 'double comptage' }, s: 'error' }],
});

// ---------- Scène 17 : deux serveurs et l'audit (1.5) ----------
SCENES[17] = mk({
  label: 'USAGES', color: b, part: "1.5 · CAS D'USAGE : DEUX SERVEURS, L'AUDIT",
  els: [
    bx({ id: 'L251', w: 'répartiteur' }, 960, 230, 360, 100, 'répartiteur', o, { size: 28, b: 'L254' }),
    ic({ id: 'L251', w: 'Deux instances' }, 520, 520, 'server', g, { s: 'serveur A', w: 300, h: 170, b: 'L254' }), ic({ id: 'L251', w: 'Deux instances' }, 1400, 520, 'server', p, { s: 'serveur B', w: 300, h: 170, b: 'L254' }),
    ar({ id: 'L251', w: 'Deux instances' }, 880, 285, 590, 430, d, { b: 'L254' }), ar({ id: 'L251', w: 'Deux instances' }, 1040, 285, 1330, 430, d, { b: 'L254' }),
    ch({ id: 'L251', w: 'runDate' }, 960, 380, 'même job · même runDate', b, { size: 26, b: 'L254' }),
    ch({ id: 'L252', w: 'seule' }, 520, 700, 'une seule exécution démarre', g, { size: 26, b: 'L254' }), ch({ id: 'L252', w: 'échoue' }, 1400, 700, 'échoue proprement', r, { size: 26, b: 'L254' }), cr({ id: 'L252', w: 'échoue' }, 1400, 560, 40, r, { b: 'L254' }),
    ch({ id: 'L253', w: 'double' }, 960, 820, 'sans cela : deux traitements, données en double', r, { size: 28, b: 'L254' }),
    ic({ id: 'L254', w: 'audit' }, 220, 330, 'person', y, { sc: 1.5 }), cd({ id: 'L254', w: 'résultat' }, 340, 210, 680, 190, "Le job d'hier ?", ['combien de lignes écrites ?', 'combien rejetées ?'], y),
    tm({ id: 'L255', w: 'requête SQL' }, 100, 470, 920, 290, 'psql', [
      { a: { id: 'L255', w: 'requête SQL' }, s: 'SELECT step_name, status, read_count,', c: b }, { a: { id: 'L255', w: 'table des steps' }, s: '       write_count, filter_count, skip_count', c: b },
      { a: { id: 'L255', w: 'table des steps' }, s: '  FROM batch_step_execution', c: g }, { a: { id: 'L255', w: 'compteurs' }, s: ' WHERE job_execution_id = ?;', c: C.text }], { size: 22, accent: b }),
    tb({ id: 'L256', w: 'Rien' }, 1060, 500, [200, 180, 120, 120, 100], ['step', 'status', 'read', 'write', 'skip'], [
      { a: { id: 'L256', w: 'audit' }, cells: ['importStep', 'COMPLETED', '50000', '49870', '130'], c: g }], { size: 20, rh: 70, fam: MONO, noBold: true }),
    ch({ id: 'L257', w: 'grossissent' }, 560, 820, 'les tables grossissent à chaque exécution', o, { size: 26 }), ch({ id: 'L257', w: 'supprime' }, 1360, 820, 'purge par date de fin', g, { size: 26 }),
    ch({ id: 'L258', w: 'ralentissent' }, 960, 880, 'sans purge : requêtes de plus en plus lentes (piège n°8)', r, { size: 26 }),
    pl({ id: 'L259', w: 'six tables' }, 120, 960, 1, 'six tables', g, { size: 22 }), pl({ id: 'L259', w: 'deux colonnes' }, 440, 960, 2, '2 colonnes version', r, { size: 22 }),
    pl({ id: 'L259', w: 'isolation' }, 810, 960, 3, 'isolation stricte', o, { size: 22 }), pl({ id: 'L259', w: 'atténué' }, 1180, 960, 4, 'atténué', p, { size: 22 }), pl({ id: 'L259', w: 'singletons' }, 1400, 960, 5, 'singleton sans état', b, { size: 22 }),
    ch({ id: 'L260', w: 'pièges' }, 1560, 880, 'Top 10 des pièges →', r, { size: 28 }),
  ],
  cues: [{ a: { id: 'L252', w: 'échoue' }, s: 'error' }, { a: { id: 'L255', w: 'requête SQL' }, s: 'typing', d: 2.5, g: -10 }, { a: { id: 'L256', w: 'audit' }, s: 'success' }],
});

// ---------- Scènes 18 et 19 : Top 10 des pièges (1.6) ----------
const PH = ['#', 'Piège', 'Ce qui se passe', 'Parade'], PC = [80, 600, 560, 480];
const extrait = (a, b_, lines) => tm(a, 100, 700, 1720, 260, 'extrait indicatif', lines.map(([id, w_, s, c]) => ({ a: { id, w: w_ }, s, c })), { size: 22, accent: r, b: b_ });
SCENES[18] = mk({
  label: 'TOP10_1', color: r, part: '1.6 · TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L261', 100, 190, PC, PH, [
      { a: { id: 'L262', w: 'schéma' }, cells: ['1', 'initialize-schema=always en prod', 'tables créées au démarrage, droits excessifs', 'never + Flyway / Liquibase'], c: r },
      { a: { id: 'L264', w: 'dépôt en mémoire' }, cells: ['2', 'JobRepository en mémoire (H2)', 'aucune reprise, aucune trace', 'PostgreSQL persistant'], c: r },
      { a: { id: 'L266', w: 'abaisser' }, cells: ['3', 'isolationLevelForCreate abaissé', 'deux lancements concurrents possibles', 'garder SERIALIZABLE, gérer l\'erreur'], c: r },
      { a: { id: 'L269', w: 'relancer' }, cells: ['4', 'mêmes paramètres relancés', 'JobInstanceAlreadyComplete…', 'paramètre qui change'], c: o },
      { a: { id: 'L272', w: 'horodatage' }, cells: ['5', 'horodatage en paramètre identifiant', 'chaque relance = nouvelle instance', 'paramètre métier stable'], c: o }], { size: 22, rh: 70, b: 'L275', noBold: true }),
    ch({ id: 'L267', w: 'garder' }, 960, 655, 'gérer l\'erreur : nouvelle tentative ou alerte', g, { size: 26, b: 'L268' }),
    ch({ id: 'L270', w: 'date métier' }, 960, 655, 'une date métier, ou startNextInstance', g, { size: 26, b: 'L271' }),
    ch({ id: 'L273', w: 'stable' }, 960, 655, 'runDate stable · horodatage : non identifiant', g, { size: 26, b: 'L274' }),
    extrait({ id: 'L263', w: 'repérer' }, 'L264', [['L263', 'repérer', 'CREATE TABLE batch_job_instance ( … )', r], ['L263', 'journaux', 'spring.batch.jdbc.initialize-schema=always', o]]),
    extrait({ id: 'L265', w: 'signe typique' }, 'L266', [['L265', 'signe typique', 'jdbc:h2:mem:testdb', o], ['L265', 'redémarrage', 'SELECT count(*) FROM batch_job_instance;   →  0 (après redémarrage)', r]]),
    extrait({ id: 'L268', w: 'repérer' }, 'L269', [['L268', 'repérer', 'firstJob runDate=2026-11-01  STARTED', o], ['L268', 'même temps', 'firstJob runDate=2026-11-01  STARTED   (2e exécution)', r], ['L268', 'même temps', 'isolationLevelForCreate = READ_COMMITTED', r]]),
    extrait({ id: 'L271', w: 'repérer' }, 'L272', [['L271', 'repérer', 'JobInstanceAlreadyCompleteException:', r], ['L271', 'refuse', '  A job instance already exists and is complete', r], ['L271', 'refuse', '  for identifying parameters={runDate=2026-11-01}', r]]),
    extrait({ id: 'L274', w: 'repérer' }, 'L275', [['L274', 'repérer', 'addString("runAt", Instant.now().toString())', o], ['L274', 'zéro', 'instances 101, 102, 103 … pour le même jour', r]]),
    ch({ id: 'L261', w: 'Dix pièges' }, 960, 150, '5 sur 10 : la configuration', y, { size: 24 }),
  ],
  cues: [{ a: { id: 'L262', w: 'schéma' }, s: 'pop' }, { a: { id: 'L264', w: 'dépôt en mémoire' }, s: 'pop' }, { a: { id: 'L266', w: 'abaisser' }, s: 'alarm', g: -12 }, { a: { id: 'L269', w: 'relancer' }, s: 'pop' }, { a: { id: 'L272', w: 'horodatage' }, s: 'pop' }, { a: { id: 'L271', w: 'repérer' }, s: 'error' }],
});
SCENES[19] = mk({
  label: 'TOP10_2', color: r, part: '1.6 · TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L275', 100, 190, PC, PH, [
      { a: { id: 'L276', w: 'automatique' }, cells: ['6', 'spring.batch.job.enabled = true', 'tous les jobs partent au démarrage', 'false + lancement explicite'], c: o },
      { a: { id: 'L278', w: 'restée en cours' }, cells: ['7', 'exécution restée STARTED après un crash', 'le job refuse de repartir', 'abandon / recover après vérification'], c: o },
      { a: { id: 'L280', w: 'purger' }, cells: ['8', 'tables BATCH_* jamais purgées', 'tables énormes, requêtes lentes', 'purge planifiée'], c: o },
      { a: { id: 'L282', w: 'copier' }, cells: ['9', 'imports de Spring Batch 4 / 5', 'erreurs de compilation', 'paquets 6.x'], c: o },
      { a: { id: 'L284', w: 'job long' }, cells: ['10', 'job long dans la requête HTTP', 'requête bloquée, délai dépassé', 'lancement asynchrone'], c: r }], { size: 22, rh: 70, noBold: true }),
    extrait({ id: 'L277', w: 'repérer' }, 'L278', [['L277', 'repérer', 'Job: [name=importJob] launched', o], ['L277', 'test', 'Job: [name=exportJob] launched', o], ['L277', 'test', '(au démarrage, sans rien demander)', C.text]]),
    extrait({ id: 'L279', w: 'repérer' }, 'L280', [['L279', 'repérer', 'JobExecutionAlreadyRunningException:', r], ['L279', 'message', '  A job execution for this job is already running:', r], ['L279', 'arrêté', '  id=42, status=STARTED', r]]),
    extrait({ id: 'L281', w: 'repérer' }, 'L282', [['L281', 'repérer', 'SELECT count(*) FROM batch_step_execution;', C.text], ['L281', 'mois', '→ 48 213 904', r]]),
    extrait({ id: 'L283', w: 'repérer' }, 'L284', [['L283', 'repérer', 'error: package org.springframework.batch.core.Job', r], ['L283', 'tout de suite', '       does not exist', r]]),
    extrait({ id: 'L285', w: 'repérer' }, 'L286', [['L285', 'repérer', 'curl: (28) Operation timed out after 30001 ms', r]]),
    ch({ id: 'L286', w: 'H2' }, 480, 750, 'test sur H2 : vert', g, { size: 30 }), ch({ id: 'L286', w: 'silencieux' }, 1250, 750, 'même test sur PostgreSQL : rouge', r, { size: 30 }),
    ch({ id: 'L287', w: 'PostgreSQL' }, 960, 880, 'concurrence ou reprise : toujours sur PostgreSQL', y, { size: 30 }),
  ],
  cues: [{ a: { id: 'L276', w: 'automatique' }, s: 'pop' }, { a: { id: 'L278', w: 'restée en cours' }, s: 'pop' }, { a: { id: 'L280', w: 'purger' }, s: 'pop' }, { a: { id: 'L282', w: 'copier' }, s: 'pop' }, { a: { id: 'L284', w: 'job long' }, s: 'pop' }, { a: { id: 'L286', w: 'silencieux' }, s: 'error' }, { a: { id: 'L287', w: 'PostgreSQL' }, s: 'stamp' }],
});

// ---------- Scène 20 : bilan et exercices ----------
SCENES[20] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    ic({ id: 'L288', w: 'trois heures douze' }, 300, 330, 'clock', r, { sz: 90, b: 'L289' }), tx({ id: 'L288', w: 'trois heures douze' }, 300, 460, '03:12', { size: 54, fam: MONO, c: r, b: 'L289' }),
    db({ id: 'L288', w: 'métadonnées' }, 760, 330, 200, 150, b, 'PostgreSQL', { size: 20, b: 'L289' }), ch({ id: 'L288', w: 'métadonnées' }, 760, 460, 'STARTED · position confirmée', o, { size: 22, b: 'L289' }),
    ar({ id: 'L288', w: 'répondre' }, 900, 330, 1200, 330, g, { b: 'L289' }), ch({ id: 'L288', w: 'répondre' }, 1400, 330, 'relance : reprise', g, { size: 30, b: 'L289' }),
    pl({ id: 'L289', w: 'recette' }, 120, 300, 1, 'Job : la recette', b, { size: 26 }), pl({ id: 'L289', w: 'paramètres' }, 560, 300, 2, 'JobInstance : + paramètres', g, { size: 26 }),
    pl({ id: 'L289', w: 'tentative' }, 1040, 300, 3, 'JobExecution : tentative', o, { size: 26 }), pl({ id: 'L289', w: 'sauvegarde de partie' }, 1500, 300, 4, 'Context : sauvegarde', p, { size: 26 }),
    pl({ id: 'L290', w: 'dépôt' }, 120, 420, 1, 'un dépôt JDBC', b, { size: 26 }), pl({ id: 'L290', w: 'Six tables' }, 560, 420, 2, 'six tables, deux colonnes version', r, { size: 26 }), pl({ id: 'L290', w: 'isolation' }, 1280, 420, 3, 'isolation stricte', o, { size: 26 }),
    cd({ id: 'L291', w: 'deux fois' }, 100, 520, 560, 330, 'Exercice 1', ['Même job, même date, deux lancements.', "Le premier est terminé ? Encore en cours ? Cite les deux exceptions."], b, { size: 22 }),
    cd({ id: 'L292', w: 'comment relancer' }, 680, 520, 560, 330, 'Exercice 2', ["Relancer le job du jour après un échec, sans jamais rejouer un job réussi.", 'Quel paramètre est identifiant ?'], o, { size: 22 }),
    cd({ id: 'L293', w: 'collègue' }, 1260, 520, 560, 330, 'Exercice 3', ["Un collègue veut READ_COMMITTED pour supprimer des erreurs dans les journaux.", 'Quel risque ? Que réponds-tu ?'], p, { size: 22 }),
    bar({ id: 'L294', w: 'temps' }, 960, 960, 800, 40, [['L294', 1], ['L295', 0]], y, { label: 'réfléchis…', b: 'L295' }),
    ch({ id: 'L295', w: 'Correction' }, 380, 800, 'AlreadyComplete · AlreadyRunning', g, { size: 20 }), ch({ id: 'L296', w: 'date métier' }, 960, 800, 'identifiant : runDate · non : horodatage', g, { size: 20 }),
    ch({ id: 'L297', w: 'bonne réponse' }, 1540, 800, 'isolation stricte + nouvelle tentative', g, { size: 20 }),
    ch({ id: 'L298', w: 'module suivant' }, 960, 980, 'Module 2 : lancer, arrêter, relancer →', o, { size: 30 }),
  ],
  cues: [{ a: { id: 'L289', w: 'recette' }, s: 'pop' }, { a: { id: 'L290', w: 'dépôt' }, s: 'pop' }, { a: { id: 'L291', w: 'deux fois' }, s: 'blip' }, { a: { id: 'L292', w: 'comment relancer' }, s: 'blip' }, { a: { id: 'L293', w: 'collègue' }, s: 'blip' }, { a: { id: 'L295', w: 'Correction' }, s: 'success' }, { a: { id: 'L298', w: 'module suivant' }, s: 'levelup', g: -10 }],
});
