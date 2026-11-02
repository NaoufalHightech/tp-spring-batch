// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 3' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 3' };

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

SCENES[0] = mk({
  label: 'FLASHBACK', color: r,
  els: [
    ic('L001', 300, 330, 'file', b, { lab: '10 Go', w: 110, h: 140 }), bar('L001', 1000, 330, 700, 44, [['L001', 0], ['L002', 1]], r, { label: 'mémoire JVM : débordement', b: 'L003' }),
    ic({ id: 'L001', w: 'redémarre' }, 1620, 330, 'clock', r, { sz: 80, b: 'L003' }), tx({ id: 'L001', w: 'redémarre' }, 1620, 450, '03:40', { size: 44, fam: MONO, c: r, b: 'L003' }),
    cd('L002', 100, 560, 820, 220, 'Tout le fichier', ['en base, sans doublon'], g, { b: 'L003' }), cd('L002', 980, 560, 840, 220, 'Reprise courte', ['pas dix heures rejouées'], b, { b: 'L003' }),
    bx('L003', 500, 400, 440, 120, 'ExecutionContext', p, { sub: 'sauvegarde de partie du step', size: 30 }), db('L003', 1300, 400, 190, 140, b, 'PostgreSQL', { size: 20 }), ar('L003', 730, 400, 1190, 400, d),
    ch('L004', 500, 640, 'tasklet : une action, une transaction', g, { size: 28 }), ch('L004', 1300, 640, 'StepScope : un bean neuf par step', o, { size: 28 }),
    pl('L005', 130, 960, 1, 'chunk', g, { size: 22 }), pl('L005', 400, 960, 2, 'données', b, { size: 22 }), pl('L005', 700, 960, 3, 'reader', p, { size: 22 }), pl('L005', 960, 960, 4, 'processor', o, { size: 22 }),
    pl('L005', 1260, 960, 5, 'writer', g, { size: 22 }), pl('L005', 1500, 960, 6, 'ItemStream', b, { size: 22 }), pl('L005', 1760, 960, 7, 'pièges', r, { size: 22 }),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L005', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'TASKLET_VERS_CHUNK', color: g, part: '3.1 · DE LA TASKLET AU CHUNK',
  els: [
    code('L006', 100, 200, 800, 220, 'Tasklet avec boucle', [['L006', 'for (var item : allItems) {', C.text], ['L006', '  process(item);  write(item);', y], ['L006', '}', C.text]], { size: 26, b: 'L008' }),
    ch('L007', 1500, 250, 'mémoire', r, { size: 28, b: 'L008' }), ch('L007', 1500, 320, 'transactions', r, { size: 28, b: 'L008' }), ch('L007', 1500, 390, 'reprise', r, { size: 28, b: 'L008' }), ch('L007', 1500, 460, 'compteurs', r, { size: 28, b: 'L008' }),
    bx('L008', 350, 330, 400, 130, 'READER', b, { size: 34 }), bx('L008', 960, 330, 400, 130, 'PROCESSOR', o, { size: 34 }), bx('L008', 1570, 330, 400, 130, 'WRITER', p, { size: 34 }),
    ar('L008', 560, 330, 750, 330, d), ar('L008', 1170, 330, 1360, 330, d),
    ch('L009', 350, 440, '1 appel = 1 élément', b, { size: 24 }), ch('L010', 960, 440, '1 appel = 1 élément', o, { size: 24 }), ch('L011', 1570, 440, '1 appel = 1 chunk', p, { size: 24 }),
    cd('L012', 100, 520, 1720, 300, 'TRANSACTION', [], o, { b: 'L019' }),
    bx('L013', 300, 700, 260, 100, 'read()', b, { size: 26, b: 'L019' }), bx('L013', 640, 700, 260, 100, 'process()', o, { size: 26, b: 'L019' }), bx('L013', 980, 700, 260, 100, 'ajouter', g, { size: 26, b: 'L019' }),
    ar('L013', 430, 700, 510, 700, d, { b: 'L019' }), ar('L013', 770, 700, 850, 700, d, { b: 'L019' }),
    bx('L014', 1320, 700, 260, 100, 'write(chunk)', p, { size: 24, b: 'L019' }), ch('L014', 1320, 770, '+ ExecutionContext + compteurs', d, { size: 20, b: 'L019' }),
    bx('L015', 1660, 700, 260, 100, 'COMMIT', g, { size: 30, b: 'L019' }), ar('L014', 1450, 700, 1530, 700, d, { b: 'L019' }),
    ch('L016', 960, 900, 'un chunk = une transaction', y, { size: 34, b: 'L019' }),
    ch('L019', 960, 250, 'ce qui change en version 6', y, { size: 34 }),
    code('L020', 200, 340, 1500, 280, 'BankJobConfig.java', [['L020', '.<RawTransaction, BankTransaction>chunk(100)', g], ['L021', '.chunk(100, transactionManager)   // déprécié, à supprimer', r], ['L022', '.transactionManager(transactionManager)', g]], { size: 26 }),
    ch('L022', 960, 720, 'avertissement de compilation', o, { size: 28 }),
    pl('L023', 300, 950, 1, 'trois pièces', g, { size: 24 }), pl('L023', 800, 950, 2, 'une transaction par chunk', b, { size: 24 }), pl('L023', 1350, 950, 3, '.chunk(100)', o, { size: 24 }),
  ],
  quiz: [{ q: 'L017', a: 'L018', question: "Un chunk de cent échoue au cinquantième élément. Combien d'éléments de ce chunk sont écrits ?", choices: ['0', '49', '100'], win: 0, answer: 'Aucun : le rollback annule les cent éléments, mais pas les chunks déjà validés.' }],
  cues: [{ a: 'L007', s: 'error' }, { a: 'L015', s: 'success' }, { a: 'L021', s: 'error' }],
});

SCENES[2] = mk({
  label: 'DONNEES', color: b, part: '3.2 · LES DONNÉES : FICHIER, TABLE, RECORDS',
  els: [
    ch('L024', 1500, 150, 'fichier de transactions → PostgreSQL', y, { size: 24 }),
    tb('L025', 100, 190, [100, 320, 420, 360, 320], ['id', 'accountNumber', 'transactionDate', 'transactionType', 'amount'], [
      row('L025', ['1', 'FR7612345', '01/10/2026 09:15', 'D', '120.50'], g), row('L025', ['2', 'FR7612345', '01/10/2026 10:02', 'C', '2000.00'], g), row('L025', ['3', 'FR7698765', '02/10/2026 14:30', 'D', '15.00'], g),
      row('L026', ['4', 'FR7698765', '02/10/2026 15:45', 'D', '0.00'], o), row('L025', ['5', 'FR7612345', '03/10/2026 08:00', 'C', '350.75'], g)], { size: 22, rh: 52, fam: MONO, noBold: true }),
    code('L027', 100, 560, 1000, 380, 'V2__bank_transaction.sql', [['L027', 'CREATE TABLE bank_transaction (', C.text], ['L027', '  id BIGINT PRIMARY KEY,', y], ['L028', '  transaction_date TIMESTAMP NOT NULL,', b],
      ['L029', "  transaction_type CHAR(1) CHECK (… IN ('D','C')),", o], ['L030', '  amount NUMERIC(15,2) NOT NULL );', g]], { size: 22 }),
    ch('L032', 1550, 500, '0,1 + 0,2 ≠ 0,3  en flottant', r, { size: 24 }),
    code('L033', 1150, 560, 670, 380, 'records', [['L033', 'record RawTransaction(', C.text], ['L033', '  long id, String accountNumber,', C.text], ['L033', '  String transactionDate, …)', y], ['L035', 'record BankTransaction(', C.text], ['L035', '  LocalDateTime transactionDate,', g], ['L036', '  { constructeur compact : valide D / C }', o]], { size: 20 }),
    ch('L034', 1600, 490, 'lecture ≠ conversion', y, { size: 22, b: 'L035' }), ch('L037', 1600, 960, 'Raw → Bank (processor)', b, { size: 24 }),
  ],
  quiz: [{ q: 'L031', a: 'L032', question: 'Pourquoi un montant en NUMERIC, et pas en nombre flottant ?', choices: ["c'est plus rapide", 'décimales exactes', 'plus petit en base'], win: 1, answer: "Un flottant ne représente pas exactement les décimales : zéro virgule un plus zéro virgule deux n'est pas zéro virgule trois." }],
  cues: [{ a: 'L026', s: 'pop' }, { a: 'L030', s: 'success' }],
});

SCENES[3] = mk({
  label: 'READER', color: p, part: '3.3 · LE READER DE FICHIER PLAT',
  els: [
    code('L038', 100, 190, 1150, 720, 'BankReaderConfig.java', [
      ['L039', '@Bean @StepScope', o], ['L040', 'FlatFileItemReader<RawTransaction> bankCsvReader(', y], ['L041', '    @Value("#{jobParameters[\'inputFile\']}") String inputFile) {'], ['L042', '  var tokenizer = new DelimitedLineTokenizer();'],
      ['L043', '  tokenizer.setNames("id", "accountNumber", …);'], ['L044', '  return new FlatFileItemReaderBuilder<RawTransaction>()'], ['L045', '      .name("bankCsvReader")', r], ['L046', '      .resource(new FileSystemResource(inputFile))'],
      ['L047', '      .linesToSkip(1)', g], ['L048', '      .lineTokenizer(tokenizer)'], ['L048', '      .fieldSetMapper(new RecordFieldSetMapper<>(…))'], ['L048', '      .build(); }']], { b: 'L051' }),
    side('L038', 250, 'lu en flux, ligne par ligne', b, { b: 'L051' }), side('L040', 350, 'classe concrète, pas ItemReader', o, { b: 'L051' }), side('L045', 450, 'nom obligatoire', r, { b: 'L051' }), side('L047', 550, "saute l'en-tête", y, { b: 'L051' }),
    code('L051', 100, 200, 1300, 220, 'paramètres du job', [['L051', '.addString("runDate", "2026-10-01")', g], ['L052', '.addString("inputFile", "data/transactions.csv", false)', b]], { size: 26 }),
    ch('L053', 1500, 300, 'runDate : identifiant', g, { size: 26 }), ch('L053', 1500, 380, 'inputFile : non identifiant', b, { size: 26 }),
    ch('L054', 500, 560, 'fichier corrigé, même date : reprise', g, { size: 26 }), ch('L055', 1300, 560, 'COMPLETED : refus, quel que soit le fichier', r, { size: 26 }),
    pl('L058', 200, 960, 1, 'reader nommé', g, { size: 22 }), pl('L058', 600, 960, 2, 'type concret', b, { size: 22 }), pl('L058', 1000, 960, 3, 'saute en-tête', o, { size: 22 }), pl('L058', 1400, 960, 4, 'fichier non identifiant', p, { size: 22 }),
  ],
  quiz: [{ q: 'L049', a: 'L050', question: "Que se passe-t-il si tu oublies linesToSkip ?", choices: ['rien', 'erreur à la ligne 1', 'une ligne en trop'], win: 1, answer: "L'en-tête est lu comme une donnée : la conversion de id en nombre échoue dès la ligne un." },
         { q: 'L056', a: 'L057', question: "Même runDate, autre fichier, l'instance est COMPLETED. Que se passe-t-il ?", choices: ['nouvelle instance', 'refus', 'reprise'], win: 1, answer: "Refus : JobInstanceAlreadyCompleteException. L'instance est identifiée par runDate, pas par le fichier." }],
  cues: [{ a: 'L045', s: 'pop' }, { a: 'L055', s: 'error' }],
});

SCENES[4] = mk({
  label: 'PROCESSOR', color: o, part: '3.4 · LE PROCESSOR ET LE FILTRAGE',
  els: [
    code('L059', 100, 190, 1150, 620, 'BankTransactionProcessor.java', [
      ['L060', 'public class BankTransactionProcessor', C.text], ['L060', '    implements ItemProcessor<RawTransaction, BankTransaction> {', y], ['L062', '  static final DateTimeFormatter FORMAT = …("dd/MM/yyyy HH:mm");', g],
      ['L064', '  public BankTransaction process(RawTransaction raw) {'], ['L065', '    if (raw.amount().signum() == 0) {', o], ['L066', '      return null;', r], ['L066', '    }'],
      ['L068', '    return new BankTransaction(…, LocalDateTime.parse(raw.transactionDate(), FORMAT), …);'], ['L068', '  }  }']], {}),
    side('L059', 250, 'convertir + écarter', o), side('L061', 330, 'entrée Raw → sortie Bank', b), side('L063', 410, 'SimpleDateFormat : pas thread-safe', r), side('L067', 490, 'null = ne pas poursuivre', y),
    ch('L069', 1600, 570, 'null → filterCount++', g, { size: 24 }), ch('L070', 1600, 650, 'skipCount inchangé', d, { size: 24 }), ch('L071', 1600, 730, 'la position avance quand même', b, { size: 22 }),
    ch('L072', 450, 880, 'readCount 5', b, { size: 28 }), ch('L072', 900, 880, 'filterCount 1', o, { size: 28 }), ch('L072', 1350, 880, 'writeCount 4', g, { size: 28 }),
    ch('L075', 1600, 880, 'chunk vide : commit quand même', d, { size: 22 }),
    pl('L076', 300, 980, 1, 'sans état', g, { size: 22 }), pl('L076', 800, 980, 2, 'convertit', b, { size: 22 }), pl('L076', 1300, 980, 3, 'filtre par null', o, { size: 22 }),
  ],
  quiz: [{ q: 'L073', a: 'L074', question: 'Le fichier contient 1 000 lignes dont 80 à montant nul. Combien vaut write count ?', choices: ['1 000', '920', '80'], win: 1, answer: 'Neuf cent vingt : mille lues, quatre-vingts filtrées. Et skip count vaut zéro.' }],
  cues: [{ a: 'L066', s: 'pop' }, { a: 'L072', s: 'success' }],
});

SCENES[5] = mk({
  label: 'WRITER', color: g, part: '3.5 · LE WRITER POSTGRESQL',
  els: [
    code('L077', 100, 190, 1300, 640, 'BankWriterConfig.java', [
      ['L078', 'JdbcBatchItemWriter<BankTransaction> bankDbWriter(DataSource ds) {', y], ['L079', '  … .dataSource(ds)', b], ['L080', '  .sql("""INSERT INTO bank_transaction (…)'], ['L080', '       VALUES (:id, :accountNumber, :transactionDate, …)'],
      ['L081', '       ON CONFLICT (id) DO UPDATE SET … """)', g], ['L082', '  .itemSqlParameterSourceProvider(tx -> new MapSqlParameterSource()'], ['L082', '        .addValue("id", tx.id()) …)'], ['L084', '  .build(); }']], {}),
    side('L077', 250, 'un chunk de 100 → une table', g), side('L079', 330, 'même base que le JobRepository', b), side('L081', 410, 'rejouable, sans doublon', g), side('L083', 490, 'beanMapped : pas de getters sur un record', r), side('L084', 570, 'un seul lot JDBC', p),
    ch('L085', 960, 880, 'jdbc:postgresql://…?reWriteBatchedInserts=true', y, { size: 26 }), ch('L088', 1550, 960, 'le step →', g, { size: 28 }),
  ],
  quiz: [{ q: 'L086', a: 'L087', question: 'Je relance le même fichier avec ON CONFLICT DO UPDATE. Combien de lignes en base ?', choices: ['4', '8', 'erreur'], win: 0, answer: 'Quatre : les mêmes, mises à jour. Aucun doublon, aucune erreur.' }],
  cues: [{ a: 'L081', s: 'success' }, { a: 'L083', s: 'error' }],
});

SCENES[6] = mk({
  label: 'STEP_ET_JOB', color: b, part: '3.5 · LE STEP ET LE JOB',
  els: [
    code('L089', 100, 190, 1100, 520, 'BankJobConfig.java', [
      ['L090', 'new StepBuilder("loadBankStep", jobRepository)', C.text], ['L091', '    .<RawTransaction, BankTransaction>chunk(100)', g], ['L092', '    .transactionManager(transactionManager)'], ['L093', '    .reader(bankCsvReader)', b], ['L093', '    .processor(processor)', o], ['L093', '    .writer(bankDbWriter)', p],
      ['L094', '    .stream(bankCsvReader)', r], ['L096', '    .build();']], { b: 'L097' }),
    side('L094', 260, 'ItemStream explicite', r, { b: 'L097' }), side('L095', 340, 'piège n°4 évité', g, { b: 'L097' }),
    tm('L097', 100, 200, 1000, 200, 'terminal', [{ a: 'L098', s: 'Step: [loadBankStep] executed', c: C.text }, { a: 'L098', s: 'Job: [bankJob] completed  status: COMPLETED', c: g }], { size: 24, accent: g, b: 'L103' }),
    code('L099', 100, 440, 1720, 400, 'psql', [['L099', 'SELECT read_count, filter_count, write_count FROM batch_step_execution;', b], ['L099', '   5 | 1 | 4', g], ['L100', 'SELECT SUM(amount) FROM bank_transaction;   →   2486.25', g], ['L101', 'short_context : {"bankCsvReader.read.count": 5}', y]], { size: 24, accent: b, b: 'L103' }),
    pl('L102', 300, 960, 1, 'trois pièces', g, { size: 22, b: 'L103' }), pl('L102', 700, 960, 2, 'reader déclaré comme flux', r, { size: 22, b: 'L103' }), pl('L102', 1300, 960, 3, 'Spring Batch tient la boucle', b, { size: 22, b: 'L103' }),
    ch('L103', 1650, 260, 'ligne 350 : montant « abc »', o, { size: 26 }),
    tm('L104', 100, 200, 1300, 260, 'terminal', [{ a: 'L104', s: 'FlatFileParseException … line 350', c: r }, { a: 'L106', s: 'Step: FAILED   Job: FAILED', c: r }, { a: 'L108', s: 'open : read.count = 300  →  reprise à la ligne 301', c: g }], { size: 24, accent: r }),
    code('L105', 100, 500, 1300, 300, 'psql', [['L105', 'SELECT count(*) FROM bank_transaction;   →   300', b], ['L105', 'read.count = 300', y], ['L109', 'SELECT count(*) …   →   1000   (0 doublon)', g]], { size: 24, accent: b }),
    ch('L107', 1650, 350, 'même runDate : reprise', g, { size: 26 }), ch('L109', 1500, 880, '1000 lignes, 0 doublon', g, { size: 30 }),
  ],
  cues: [{ a: 'L098', s: 'success' }, { a: 'L104', s: 'error' }, { a: 'L109', s: 'success' }],
});

SCENES[7] = mk({
  label: 'ITEMSTREAM', color: p, part: '3.6 · ITEMSTREAM ET LA POSITION SAUVEGARDÉE',
  els: [
    ch('L110', 960, 150, 'comment la position est sauvegardée', d, { size: 24, b: 'L111' }),
    ch('L115', 960, 430, 'le step pilote le cycle', d, { size: 22, b: 'L116' }),
    ch('L111', 960, 220, 'ItemStream : la durée de vie d\'une ressource', y, { size: 30 }),
    bx('L112', 360, 340, 400, 120, 'open()', g, { sub: 'une fois : ouvre, relit l\'état', size: 34 }), bx('L113', 960, 340, 400, 120, 'update()', b, { sub: 'à chaque chunk, avant le commit', size: 34 }), bx('L114', 1560, 340, 400, 120, 'close()', d, { sub: 'à la fin', size: 34 }),
    tx('L116', 960, 480, 'bankCsvReader.read.count', { size: 40, fam: MONO, c: y, glow: true }), ch('L117', 960, 540, 'nom unique par reader', o, { size: 24 }),
    db('L118', 1680, 540, 160, 120, b, ''), ch('L118', 1680, 640, 'batch_step_execution_context', b, { size: 18 }),
    bx('L119', 330, 740, 400, 120, 'chunk 1', g, { sub: '100 lignes + position 100', size: 28 }), bx('L120', 780, 740, 400, 120, 'chunk 2', g, { sub: '200 lignes + position 200', size: 28 }), bx('L121', 1230, 740, 400, 120, 'chunk 3', r, { sub: 'crash : rien enregistré', size: 28 }),
    ch('L122', 780, 860, 'données + position : même commit', y, { size: 28 }), ch('L123', 780, 920, 'open relit 200 → reprise à 201', g, { size: 26 }), ch('L124', 780, 980, 'même base que le JobRepository', o, { size: 24 }),
    ch('L127', 1620, 800, 'saveState = true (défaut)', g, { size: 22 }), ch('L128', 1620, 860, 'saveState(false) : restart du début', r, { size: 22 }), ch('L129', 1620, 920, 'multithread : plus tard', d, { size: 22 }),
  ],
  quiz: [{ q: 'L125', a: 'L126', question: 'Un chunk de cent échoue à la ligne 350. Quelle position est enregistrée ?', choices: ['350', '300', '0'], win: 1, answer: 'Position trois cents, et trois cents lignes en base : le chunk quatre est annulé en entier.' }],
  cues: [{ a: 'L112', s: 'pop' }, { a: 'L113', s: 'pop' }, { a: 'L114', s: 'pop' }, { a: 'L121', s: 'error' }, { a: 'L123', s: 'success' }],
});

SCENES[8] = mk({
  label: 'TRANSACTION_ET_TAILLE', color: o, part: '3.6 · LA TRANSACTION ET LA TAILLE DU CHUNK',
  els: [
    cd('L130', 100, 200, 1100, 260, 'Une transaction par chunk', ['reader · processor · writer dedans', 'JobRepository : compteurs et contexte'], o),
    ch('L131', 1500, 210, 'trois pièces dans la transaction', g, { size: 22 }),
    ch('L132', 1500, 280, 'même connexion, même commit', g, { size: 26 }), ch('L133', 1500, 360, 'exception : rollback du chunk', r, { size: 26 }), ch('L134', 1500, 440, 'skip / retry : module 6', d, { size: 24 }),
    tb('L135', 100, 520, [320, 640, 640], ['', 'petit (1)', 'grand (100 000)'], [
      row('L136', ['commits', 'un par élément : lent', 'très peu : rapide'], b), row('L137', ['rollback', 'minuscule', 'tout est à refaire'], o), row('L137', ['mémoire', 'minimale', 'tout le chunk en mémoire'], r)], { size: 24, rh: 56 }),
    ch('L138', 1550, 600, 'courbe débit / taille : on mesure', y, { size: 24 }), ch('L139', 1550, 680, 'souvent 100 à 5 000', g, { size: 26 }),
    tb('L141', 100, 800, [300, 260, 260, 260, 260], ['chunk', '10', '100', '1 000', '100 000'], [row('L141', ['durée (illustratif)', '10 min', '1 min 20', '50 s', '50 s'], g)], { size: 22, rh: 50, noBold: true }),
    ch('L140', 1550, 880, 'chiffres illustratifs', o, { size: 24 }), ch('L144', 1500, 980, 'curseur ou pagination →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L142', a: 'L143', question: 'Pourquoi un chunk de cent mille risque-t-il un OutOfMemoryError ?', choices: ['trop de commits', 'tout le chunk en mémoire', 'trop de colonnes'], win: 1, answer: "Parce que tous les éléments du chunk sont en mémoire en même temps, avant l'écriture." }],
  cues: [{ a: 'L133', s: 'error' }, { a: 'L139', s: 'success' }],
});

SCENES[9] = mk({
  label: 'CURSEUR_PAGINATION', color: b, part: '3.7 · CURSEUR OU PAGINATION',
  els: [
    db('L145', 300, 320, 220, 160, b, '10 M lignes', { size: 24, b: 'L161' }), ch('L146', 960, 250, 'curseur = pointeur vers le résultat', y, { size: 28, b: 'L161' }),
    ch('L147', 960, 330, 'sans curseur : tout en mémoire', r, { size: 26, b: 'L161' }), ch('L147', 960, 400, 'avec curseur : une ligne à la fois', g, { size: 26, b: 'L161' }),
    bx('L148', 1450, 280, 340, 90, 'paquet 1 → 1 000', b, { size: 24, b: 'L161' }), bx('L149', 1450, 390, 340, 90, 'paquet 1 001 → 2 000', b, { size: 24, b: 'L161' }), ch('L150', 1450, 470, 'ni trop petit, ni trop grand', g, { size: 22, b: 'L161' }),
    ch('L151', 960, 500, 'PostgreSQL : tout en mémoire par défaut', r, { size: 28, b: 'L161' }),
    pl('L152', 250, 590, 1, 'auto-commit désactivé', g, { size: 22, b: 'L161' }), pl('L153', 650, 590, 2, 'fetchSize > 0', g, { size: 22, b: 'L161' }), pl('L153', 1000, 590, 3, 'forward-only', g, { size: 22, b: 'L161' }), pl('L153', 1350, 590, 4, 'une seule instruction', g, { size: 22, b: 'L161' }),
    ch('L155', 1560, 540, 'ou hikari auto-commit = false', o, { size: 22, b: 'L161' }),
    ch('L154', 960, 660, 'le reader ouvre sa propre connexion', o, { size: 24, b: 'L161' }), ch('L156', 1500, 660, 'sinon : fetchSize ignoré', r, { size: 24, b: 'L161' }),
    code('L157', 100, 700, 1500, 250, 'JdbcCursorItemReader', [['L157', 'new JdbcCursorItemReaderBuilder<BankTransaction>()', C.text], ['L157', '    .name("cursorReader").dataSource(dataSource)', C.text], ['L158', '    .sql("SELECT …").fetchSize(1000)', b], ['L159', '    .rowMapper(rowMapper).build();', C.text], ['L159', 'reader.setConnectionAutoCommit(false);', o]], { size: 21, b: 'L161' }),
    ch('L160', 1500, 780, 'test vert · production : OOM', r, { size: 24, b: 'L161' }),
    tb('L161', 200, 230, [320, 700, 700], ['', 'JdbcCursorItemReader', 'JdbcPagingItemReader'], [
      row('L161', ['Principe', 'une requête, un curseur ouvert', 'une requête par page'], b), row('L162', ['Threads', 'non', 'oui (thread-safe)'], g), row('L163', ['Risque', 'curseur coupé si step trop long', 'lignes sautées si tri instable'], r)], { size: 24, rh: 70 }),
    ch('L164', 960, 640, 'trier sur une clé unique (la clé primaire)', y, { size: 30 }),
  ],
  quiz: [{ q: 'L165', a: 'L166', question: 'Dans quel cas JdbcPagingItemReader peut-il lire deux fois la même ligne ?', choices: ['tri sur colonne non unique', 'pageSize trop grand', 'fetchSize à 0'], win: 0, answer: "Quand le tri porte sur une colonne non unique : l'ordre n'est plus stable d'une page à l'autre." }],
  cues: [{ a: 'L151', s: 'alarm', g: -12 }, { a: 'L156', s: 'error' }, { a: 'L163', s: 'pop' }],
});

SCENES[10] = mk({
  label: 'CAS_USAGE', color: g, part: "CAS D'USAGE",
  els: [
    cd('L167', 100, 200, 540, 230, 'Le fichier de 10 Go', ['chunk de 1 000 : mémoire constante'], g), ch('L168', 370, 500, 'reprise : au plus un chunk', g, { size: 24 }),
    cd('L169', 690, 200, 540, 230, 'La migration', ['lecture paginée, écriture par lots'], b), ch('L170', 960, 500, 'rejouable, sans doublon', b, { size: 24 }),
    cd('L171', 1280, 200, 540, 230, 'Le nettoyage', ['2 M de lignes, 8 % à montant nul'], o), ch('L172', 1550, 500, 'filterCount = 160 000', o, { size: 24 }),
    ch('L173', 1500, 900, 'Top 10 des pièges →', r, { size: 30 }),
  ],
  cues: [{ a: 'L168', s: 'success' }, { a: 'L172', s: 'pop' }],
});

SCENES[11] = mk({
  label: 'TOP10_1', color: r, part: '3.7 · TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L174', 100, 190, PC2, PH2, [
      row('L175', ['1', 'chunk à 1, jamais mesuré', 'un commit par ligne', 'mesurer : 100 à 5 000'], r), row('L178', ['2', 'OutOfMemoryError', 'reader qui charge tout, chunk énorme', 'flux + chunk borné'], r),
      row('L181', ['3', 'reader sans name', 'échec ou clés mélangées', 'nom unique'], o), row('L184', ['4', 'StepScope typé ItemReader', 'ItemStream jamais appelé', 'classe concrète + .stream()'], r),
      row('L187', ['5', 'processor avec état', 'double comptage, valeurs fausses', 'sans état, DateTimeFormatter'], o)], { size: 22, rh: 70, noBold: true }),
    extrait2('L176', 'L178', [['read_count = 5000   commit_count = 5000', r]]), why('L177', 'L178', 'la valeur du tutoriel convient pour dix lignes'),
    extrait2('L179', 'L181', [['java.lang.OutOfMemoryError: Java heap space', r]]), why('L180', 'L181', 'findAll() marche en test'),
    extrait2('L182', 'L184', [['IllegalArgumentException: A name is required', r]]), why('L183', 'L184', 'on retire le nom pour simplifier'),
    extrait2('L185', 'L187', [['batch_step_execution_context : aucune ligne (position jamais sauvegardée)', r]]), why('L186', 'L187', 'ItemReader semble plus propre : le proxy cache le flux'),
    extrait2('L188', null, [['date lue : 01/10/2026  →  valeur incohérente (format partagé, deux threads)', r]]), why('L189', null, 'un formateur semble inoffensif, jusqu\'au deuxième thread'),
  ],
  cues: [{ a: 'L175', s: 'pop' }, { a: 'L178', s: 'alarm', g: -12 }, { a: 'L181', s: 'pop' }, { a: 'L184', s: 'pop' }, { a: 'L187', s: 'pop' }],
});

SCENES[12] = mk({
  label: 'TOP10_2', color: r, part: '3.7 · TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L190', 100, 190, PC2, PH2, [
      row('L191', ['6', 'reader paginé instable', 'lignes sautées ou doublées', 'tri sur clé unique'], r), row('L194', ['7', 'DO NOTHING + assertUpdates', 'un lot de doublons fait échouer le step', 'DO UPDATE'], o),
      row('L197', ['8', 'beanMapped avec records', 'paramètres introuvables', 'fournisseur explicite'], o), row('L200', ['9', 'test vert, données fausses', 'un champ oublié à zéro', 'asserter les valeurs'], r),
      row('L206', ['10', 'linesToSkip oublié', 'en-tête lu comme une donnée', 'linesToSkip(1)'], o)], { size: 22, rh: 70, noBold: true }),
    extrait2('L192', 'L194', [['source : 1 000 000 lignes   destination : 999 987 lignes', r]]), why('L193', 'L194', 'tri sur colonne non unique : deux lignes à égalité'),
    extrait2('L195', 'L197', [['EmptyResultDataAccessException: Item 0 of 100 did not update any rows', r]]), why('L196', 'L197', 'on ignore les doublons, mais le contrôle attend une ligne touchée'),
    extrait2('L198', 'L200', [["Invalid property 'id' of bean class …   (record sans getter)", r]]), why('L199', 'L200', "beanMapped vient d'avant les records"),
    extrait2('L201', 'L206', [['assertThat(rows).hasSize(4)   ✔        amount = 0   ✗', r]]), why('L202', 'L206', 'le comptage est le test le plus facile à écrire'),
    code('L203', 100, 700, 1100, 150, 'test correct', [['L203', 'SELECT SUM(amount) FROM bank_transaction  →  2486.25', g]], { size: 24, b: 'L206' }),
    ch('L204', 1500, 760, 'contrôler une valeur calculée', y, { size: 26, b: 'L206' }), ch('L205', 1500, 840, 'tester deux lancements, comparer', b, { size: 24, b: 'L206' }),
    extrait2('L207', null, [['NumberFormatException: For input string: "id"', r]]), why('L208', null, "l'exemple du tutoriel n'avait pas d'en-tête"),
    ch('L209', 1500, 980, 'même sujet que le module 2 : l\'état partagé', d, { size: 22 }),
  ],
  cues: [{ a: 'L191', s: 'pop' }, { a: 'L194', s: 'pop' }, { a: 'L197', s: 'pop' }, { a: 'L200', s: 'alarm', g: -12 }, { a: 'L206', s: 'pop' }],
});

SCENES[13] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    ic('L210', 250, 280, 'file', b, { lab: '10 Go', w: 100, h: 130 }), ic('L210', 600, 280, 'clock', r, { sz: 70 }), tx('L210', 600, 390, '03:40', { size: 40, fam: MONO, c: r }),
    pl('L211', 950, 240, 1, 'un chunk = une transaction', g, { size: 26 }), pl('L212', 950, 320, 2, 'position + données : même commit', b, { size: 26 }), pl('L213', 950, 400, 3, 'reader nommé, concret, flux · processor : null filtre', o, { size: 26 }),
    cd('L214', 100, 500, 410, 300, 'Exercice 1', ['1 000 lignes, 80 nulles : read, filter, write ?'], b, { size: 22 }), cd('L215', 540, 500, 410, 300, 'Exercice 2', ['Chunk en échec à la ligne 350 : position, lignes en base ?'], o, { size: 22 }),
    cd('L216', 980, 500, 410, 300, 'Exercice 3', ['Reader sans nom ? Retourne ItemReader ?'], p, { size: 22 }), cd('L217', 1420, 500, 400, 300, 'Exercice 4', ['Assertion qui détecte un montant non mappé'], r, { size: 22 }),
    bar('L218', 960, 930, 800, 36, [['L218', 1], ['L219', 0]], y, { label: 'réfléchis…', b: 'L219' }),
    ch('L219', 305, 760, '1000 · 80 · 920', g, { size: 22 }), ch('L220', 745, 760, 'position 300 · 300 lignes', g, { size: 22 }), ch('L221', 1185, 760, 'nom + type concret', g, { size: 22 }), ch('L222', 1620, 760, 'SUM(amount)', g, { size: 22 }),
    ch('L223', 1500, 990, 'Module 4 : processors, scopes, proxys →', o, { size: 26 }),
  ],
  cues: [{ a: 'L219', s: 'success' }, { a: 'L223', s: 'levelup', g: -10 }],
});
