// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 6' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 6' };

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
    ic('L001', 360, 320, 'clock', r, { sz: 100 }), tx('L001', 360, 460, '03:12', { size: 54, fam: MONO, c: r, glow: true }), bar('L001', 1150, 320, 800, 46, [['L001', 0], ['L002', 0.68]], g, { label: 'job de nuit : ligne 3 400' }),
    cd('L002', 100, 520, 560, 220, 'Scénario 1', ['reprise à la ligne 3 401', 'ni perte, ni doublon'], g), cd('L002', 700, 520, 560, 220, 'Scénario 2', ['exécution orpheline', 'le job refuse de repartir'], r),
    ch('L003', 480, 820, 'position + données : même commit', b, { size: 24 }), ch('L004', 1200, 820, 'chunk rejoué : total doublé', o, { size: 24 }), ch('L005', 1520, 620, 'statut de la dernière exécution', d, { size: 22 }),
    ...pills('L006', [[1, 'trois outils', g, 130], [2, 'skip', o, 420], [3, 'retry', b, 640], [4, 'restart', g, 890], [5, 'capot', p, 1150], [6, 'arrêt', r, 1390], [7, 'pièges', r, 1650]], 960, 20),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L006', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'TROIS_OUTILS', color: g, part: '6.1 · TROIS PROBLÈMES, TROIS OUTILS',
  els: [
    cd('L008', 100, 190, 560, 170, 'Donnée mauvaise', ['ligne mal formée, montant illisible'], o), cd('L009', 680, 190, 560, 170, 'Ressource indisponible', ['verrou, réseau, panne de 2 s'], b), cd('L010', 1260, 190, 560, 170, 'Processus arrêté', ['crash, redémarrage, arrêt demandé'], r),
    bx('L011', 380, 450, 360, 90, 'SKIP', o, { size: 34 }), bx('L012', 960, 450, 360, 90, 'RETRY', b, { size: 34 }), bx('L013', 1540, 450, 360, 90, 'RESTART', g, { size: 34 }),
    ch('L011', 380, 530, 'ignorer, consigner, continuer', o, { size: 20 }), ch('L012', 960, 530, 'réessayer après une pause', b, { size: 20 }), ch('L013', 1540, 530, 'reprendre au dernier point validé', g, { size: 20 }),
    ch('L014', 960, 620, 'vient de la donnée ?  →  SKIP : la relancer ne change rien', o, { size: 26 }), ch('L015', 960, 690, 'transitoire (réseau, verrou) ?  →  RETRY', b, { size: 26 }), ch('L016', 960, 760, 'bug, panne durable, arrêt  →  échec puis RESTART', g, { size: 26 }),
    ch('L019', 500, 880, '.faultTolerant()', y, { size: 28 }), ch('L020', 1300, 880, 'Spring Retry → org.springframework.core.retry', o, { size: 22 }), ch('L021', 960, 960, 'backOffPolicy disparu : retryPolicy', r, { size: 24 }),
    ch('L022', 1650, 1000, 'le skip →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L017', a: 'L018', question: 'Une ligne du fichier a un montant illisible. Skip, retry ou restart ?', choices: ['skip', 'retry', 'restart'], win: 0, answer: "Skip : relancer ne changera rien, la ligne est fausse. On l'ignore et on la consigne." }],
  cues: [{ a: 'L011', s: 'pop' }, { a: 'L012', s: 'pop' }, { a: 'L013', s: 'pop' }],
});

SCENES[2] = mk({
  label: 'SKIP', color: o, part: '6.2 · SKIP : IGNORER ET CONSIGNER',
  els: [
    code('L024', 100, 190, 1300, 560, 'loadBankStep · RejectedLineLogger · FileSkipPolicy', [
      ['L024', '.<RawTransaction, BankTransaction>chunk(100).transactionManager(tx)…', C.text], ['L025', '.faultTolerant()', r], ['L026', '.skip(FlatFileParseException.class).skip(ValidationException.class)', o], ['L027', '.skipLimit(10)', y],
      ['L028', '.skipListener(rejectedLineLogger)', g], ['L029', 'implements SkipListener<RawTransaction, BankTransaction>', b], ['L030', 'log.warn("Ligne {} rejetée : [{}]", e.getLineNumber(), e.getInput());', g],
      ['L035', 'boolean shouldSkip(Throwable t, long skipCount)', b], ['L036', 'case FileNotFoundException e -> false; case FlatFileParseException e -> skipCount < 10;', o], ['L037', '.skipPolicy(new FileSkipPolicy())', y]], { size: 21 }),
    ch('L023', 1650, 240, 'ignorer ET consigner', o, { size: 24 }), ch('L027', 1650, 320, '11e erreur : le step échoue', y, { size: 22 }), ch('L031', 1650, 400, 'rapport de rejets exploitable', g, { size: 22 }), ch('L032', 1650, 480, 'lecture · traitement · écriture', b, { size: 22 }),
    ch('L033', 1650, 560, 'sans listener : lignes sans trace', r, { size: 22 }), ch('L034', 1650, 640, 'SkipPolicy : règle sur mesure', d, { size: 22 }), ch('L040', 1550, 1000, 'le retry →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L038', a: 'L039', question: 'Tu oublies faultTolerant, mais tu écris skip et skipLimit. Que se passe-t-il ?', choices: ['skip appliqué', 'règles ignorées', 'erreur au démarrage'], win: 1, answer: 'Les règles sont ignorées : la première exception fait échouer le step.' }],
  cues: [{ a: 'L025', s: 'alarm', g: -12 }, { a: 'L033', s: 'error' }],
});

SCENES[3] = mk({
  label: 'RETRY', color: b, part: '6.3 · RETRY : LA POLITIQUE DE SPRING FRAMEWORK 7',
  els: [
    code('L043', 100, 190, 1300, 560, 'RetryPolicy', [
      ['L043', 'RetryPolicy transientRetry = RetryPolicy.builder()', C.text], ['L044', '    .maxRetries(3)', g], ['L045', '    .delay(Duration.ofMillis(200))', b], ['L046', '    .multiplier(2.0)', o], ['L047', '    .maxDelay(Duration.ofSeconds(2))', y], ['L048', '    .jitter(Duration.ofMillis(50))', p],
      ['L049', '    .includes(TransientDataAccessException.class, SocketTimeoutException.class)', g], ['L049', '    .build();'], ['L050', '.faultTolerant().retryPolicy(transientRetry)', y], ['L051', '// courte : .retry(TransientDataAccessException.class).retryLimit(3)', d]], { size: 21 }),
    ch('L041', 1650, 240, 'verrou de quelques secondes', d, { size: 22 }), ch('L042', 1650, 320, 'rafale : on martèle la base', r, { size: 22 }), ch('L046', 1650, 400, '200 → 400 → 800 ms', o, { size: 24 }), ch('L048', 1650, 480, 'effet de troupeau évité', p, { size: 22 }),
    ch('L052', 1650, 560, 'retentable ET ignorable : retry puis skip', b, { size: 18 }), ch('L053', 1650, 640, 'épuisé : ignoré et consigné', o, { size: 22 }), ch('L056', 1550, 1000, 'le restart →', g, { size: 26 }),
  ],
  quiz: [{ q: 'L054', a: 'L055', question: 'Pourquoi ne pas réessayer un NullPointerException ?', choices: ["c'est un bug, pas un hoquet", 'trop lent', 'interdit par Spring'], win: 0, answer: 'Parce que c\'est un bug : on le réessaie trois fois pour rien, et on masque une régression.' }],
  cues: [{ a: 'L046', s: 'pop' }, { a: 'L049', s: 'success' }],
});

SCENES[4] = mk({
  label: 'RESTART', color: g, part: '6.4 · RESTART : REPRENDRE UN JOB ÉCHOUÉ',
  els: [
    code('L058', 100, 190, 1300, 560, 'BankRestartService', [
      ['L058', '@Service public class BankRestartService {  JobOperator · JobRepository  }', y], ['L059', 'var params = new JobParametersBuilder().addString("runDate", runDate).toJobParameters();', b], ['L060', 'JobExecution last = jobRepository.getLastJobExecution("bankJob", params);', C.text],
      ['L061', 'return switch (last.getStatus()) {', o], ['L062', '  case FAILED, STOPPED -> jobOperator.restart(last.getId());', g], ['L063', '  case COMPLETED -> throw new IllegalStateException("Déjà terminé");', r], ['L063', '  default -> throw new IllegalStateException("Non reprenable"); };', r]], { size: 21 }),
    ch('L057', 1650, 240, 'lot du 2026-10-01 : FAILED', r, { size: 22 }), ch('L059', 1650, 310, 'runDate : même JobInstance', b, { size: 22 }), ch('L062', 1650, 380, 'nouvelle exécution, même instance', g, { size: 20 }), ch('L064', 1650, 450, 'start identique = restart implicite', d, { size: 18 }),
    ch('L065', 1650, 540, '.startLimit(3)', y, { size: 24 }), ch('L066', 1650, 610, '.allowStartIfComplete(true)', y, { size: 20 }), ch('L067', 1650, 680, '.preventRestart()', y, { size: 24 }), ch('L070', 1550, 1000, 'sous le capot →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L068', a: 'L069', question: 'Tu relances un job COMPLETED avec les mêmes paramètres. Que se passe-t-il ?', choices: ['rien', 'JobInstanceAlreadyComplete', 'nouvelle exécution'], win: 1, answer: "JobInstanceAlreadyCompleteException : l'instance est terminée, rien à reprendre." }],
  cues: [{ a: 'L062', s: 'success' }, { a: 'L063', s: 'error' }],
});

SCENES[5] = mk({
  label: 'OU_REPRENDRE', color: p, part: '6.5 · COMMENT SPRING BATCH SAIT OÙ REPRENDRE',
  els: [
    bx('L072', 960, 250, 620, 90, 'batch_job_instance : bankJob + runDate', b, { size: 24 }),
    bx('L073', 500, 400, 560, 90, 'exécution n°1 : FAILED', r, { size: 26 }), bx('L073', 500, 510, 560, 90, 'loadBankStep : FAILED · 34 commits', r, { size: 22 }), bx('L074', 500, 620, 560, 90, 'read.count = 3400', y, { size: 26 }),
    bx('L075', 1420, 400, 560, 90, 'exécution n°2 (restart)', g, { size: 26 }), ar('L075', 1100, 330, 1300, 380, g), ar('L072', 800, 290, 600, 360, d),
    bx('L077', 1420, 510, 560, 90, 'open(contexte restauré)', g, { size: 24 }), bx('L078', 1420, 620, 560, 90, 'reprise à la ligne 3 401', g, { size: 26 }),
    ch('L076', 960, 740, 'step COMPLETED : sauté · FAILED / STOPPED : rejoué', o, { size: 22 }),
    ch('L079', 960, 800, 'lignes + position : même transaction', y, { size: 26 }), ch('L080', 500, 860, 'deux états : validé, ou pas du tout', d, { size: 22 }), ch('L081', 1400, 860, 'crash à 3 450 : 50 lignes rejouées', r, { size: 22 }),
    pl('L082', 200, 960, 1, 'nom + saveState', g, { size: 20 }), pl('L083', 570, 960, 2, 'paramètres identiques', g, { size: 20 }), pl('L083', 960, 960, 3, 'fichier figé', g, { size: 20 }), pl('L084', 1330, 960, 4, 'même base ou idempotent', g, { size: 20 }),
    ch('L087', 1650, 1000, 'rollback et rejeu →', o, { size: 24 }),
  ],
  quiz: [{ q: 'L085', a: 'L086', question: 'Le fichier est remplacé entre le crash et la reprise. Que se passe-t-il ?', choices: ['reprise correcte', 'reprise fausse', 'erreur claire'], win: 1, answer: 'Le reader saute 3 400 lignes d\'un autre fichier : la reprise est fausse. Il faut figer le fichier, un répertoire par exécution.' }],
  cues: [{ a: 'L079', s: 'stamp' }, { a: 'L078', s: 'success' }],
});

SCENES[6] = mk({
  label: 'ROLLBACK_REJEU', color: o, part: '6.5 · ROLLBACK ET REJEU D\'UN CHUNK',
  els: [
    bx('L089', 250, 300, 380, 100, 'chunk de 100 : T1', b, { size: 26 }), ch('L089', 250, 380, 'élément 37 : verrou', r, { size: 22 }),
    bx('L090', 700, 300, 380, 100, 'ROLLBACK', r, { size: 30 }), ch('L090', 700, 380, '36 éléments annulés', r, { size: 22 }), bx('L091', 1150, 300, 380, 100, 'pause 200 · 400 · 800 ms', o, { size: 22 }),
    bx('L092', 1600, 300, 380, 100, 'T2 : chunk rejoué en entier', g, { size: 22 }), ar('L090', 440, 300, 510, 300, d), ar('L091', 890, 300, 960, 300, d), ar('L092', 1340, 300, 1410, 300, d),
    ch('L093', 1600, 380, 'commit : 100 + position', g, { size: 22 }), ch('L094', 960, 470, 'épuisé : skip (élément écarté) ou step FAILED', y, { size: 24 }),
    ch('L095', 500, 570, 'rollback = chunk entier', o, { size: 26 }), ch('L096', 1400, 570, 'effets hors transaction : répétés', r, { size: 24 }), ch('L097', 960, 640, 'compteur en mémoire : compté deux fois', r, { size: 24 }),
    ch('L098', 500, 730, 'écriture en échec + skip : mode scan', b, { size: 24 }), ch('L099', 1400, 730, '100 petites transactions : plus lent', o, { size: 24 }), ch('L100', 960, 820, 'valider en amont (module 4)', y, { size: 28 }), ch('L103', 1550, 1000, "l'arrêt gracieux →", r, { size: 24 }),
    ch('L088', 960, 180, 'le coût exact d\'un retry', d, { size: 24 }),
  ],
  quiz: [{ q: 'L101', a: 'L102', question: "Chunk de 100, échec à l'élément 37 en traitement, puis succès. Combien d'éléments écrits ?", choices: ['36', '100', '136'], win: 1, answer: 'Cent, une seule fois : la première tentative est annulée. Mais le processor a été appelé plus de cent fois.' }],
  cues: [{ a: 'L090', s: 'error' }, { a: 'L092', s: 'success' }],
});

SCENES[7] = mk({
  label: 'ARRET_GRACIEUX', color: r, part: '6.6 · L\'ARRÊT GRACIEUX',
  els: [
    code('L106', 100, 190, 1250, 480, 'GracefulShutdownListener', [
      ['L106', 'Map<Long, Thread> hooks = new ConcurrentHashMap<>();', y], ['L108', 'ObjectProvider<JobOperator> jobOperator;', b], ['L109', 'var hook = new JobExecutionShutdownHook(jobExecution, jobOperator.getObject());', g],
      ['L110', 'Runtime.getRuntime().addShutdownHook(hook);', o], ['L111', 'afterJob : Runtime.getRuntime().removeShutdownHook(hook);', C.text], ['L113', '.listener(gracefulShutdownListener)', g]], { size: 21, b: 'L124' }),
    ch('L104', 1650, 240, 'SIGTERM → fin du chunk → STOPPED', g, { size: 20, b: 'L124' }), ch('L105', 1650, 310, 'arrêt coopératif', b, { size: 22, b: 'L124' }), ch('L107', 1650, 380, 'jamais un champ unique', r, { size: 22, b: 'L124' }), ch('L112', 1650, 450, 'JVM déjà en arrêt : on ignore', d, { size: 20, b: 'L124' }),
    ch('L115', 1650, 520, 'demande l\'arrêt, n\'attend pas', y, { size: 20, b: 'L124' }), ch('L119', 1650, 590, 'arrêt entre deux chunks', o, { size: 22, b: 'L124' }), ch('L120', 1650, 660, 'STOPPED, pas FAILED : restart ok', g, { size: 20, b: 'L124' }),
    bx('L114', 200, 800, 280, 100, 'SIGTERM', r, { size: 28, b: 'L124' }), bx('L114', 560, 800, 280, 100, 'hook : stop(…)', o, { size: 24, b: 'L124' }), bx('L116', 920, 800, 300, 100, 'chunk en cours : commit', b, { size: 22, b: 'L124' }), bx('L118', 1300, 800, 300, 100, 'STOPPED + contexte', g, { size: 24, b: 'L124' }), bx('L118', 1660, 800, 260, 100, 'JVM arrêtée', d, { size: 24, b: 'L124' }),
    ar('L114', 340, 800, 420, 800, d, { b: 'L124' }), ar('L116', 700, 800, 770, 800, d, { b: 'L124' }), ar('L118', 1070, 800, 1150, 800, d, { b: 'L124' }), ar('L118', 1450, 800, 1530, 800, d, { b: 'L124' }),
    ch('L121', 960, 900, 'délai de l\'orchestrateur > durée d\'un chunk', y, { size: 26, b: 'L124' }),
    bx('L124', 300, 330, 400, 110, 'kill -9 · OOM · coupure', r, { size: 26 }), ch('L124', 300, 420, 'aucun hook', r, { size: 22 }),
    bx('L125', 960, 330, 440, 110, 'STARTED orphelin', o, { size: 28 }), ch('L125', 960, 420, 'PostgreSQL annule le chunk : sain', d, { size: 20 }),
    bx('L126', 1620, 330, 400, 110, 'restart refusé', r, { size: 28 }), ch('L126', 1620, 420, 'le dépôt croit que le job tourne', d, { size: 18 }),
    ch('L127', 960, 560, 'recover ou abandon : déclarer l\'exécution orpheline', g, { size: 30 }), ch('L128', 960, 650, 'vérifier avant qu\'aucune JVM ne tourne', y, { size: 28 }),
    ch('L129', 1550, 1000, "cas d'usage →", b, { size: 26 }),
  ],
  quiz: [{ q: 'L122', a: 'L123', question: "Le délai d'arrêt de l'orchestrateur est plus court qu'un chunk. Que se passe-t-il ?", choices: ['arrêt propre', 'JVM tuée, orphelin', 'job relancé'], win: 1, answer: 'La JVM est tuée avant la fin du chunk : on retombe dans le cas du crash, avec une exécution orpheline.' }],
  cues: [{ a: 'L114', s: 'alarm', g: -12 }, { a: 'L118', s: 'success' }, { a: 'L125', s: 'error' }],
});

SCENES[8] = mk({
  label: 'CAS_USAGE', color: b, part: "CAS D'USAGE",
  els: [
    cd('L130', 100, 200, 560, 260, 'La nuit du redémarrage', ['3 h 12 : SIGTERM, STOPPED', 'au matin : reprise à 3 401'], g), ch('L131', 380, 530, 'aucune ligne perdue ni dupliquée', g, { size: 22 }),
    cd('L132', 680, 200, 560, 260, 'Le fichier du partenaire', ['3 lignes cassées sur 2 M', 'skip, plafond 10, listener'], o), ch('L133', 960, 530, 'le lot va au bout, rapport de rejets', o, { size: 22 }),
    cd('L134', 1260, 200, 560, 260, 'La base qui hoquette', ['verrou de quelques secondes'], b), ch('L135', 1540, 530, 'retry exponentiel : tentative 2 passe', b, { size: 22 }),
    ch('L136', 1550, 960, 'Top 10 des pièges →', r, { size: 28 }),
  ],
  cues: [{ a: 'L131', s: 'success' }],
});

SCENES[9] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L137', 100, 190, PC2, PH2, [
      row('L138', ['1', 'skip silencieux', 'lignes disparues sans trace', 'SkipListener : ligne + texte'], r), row('L140', ['2', 'retry sur exception non transitoire', 'bug réessayé 3 fois', 'includes(transitoires)'], o),
      row('L142', ['3', 'restart hors FAILED / STOPPED', 'exception ou nouvelle instance', 'vérifier statut + paramètres'], o), row('L144', ['4', 'skipLimit trop haut', 'fichier mauvais = lot « réussi »', 'plafond bas + alerte'], r),
      row('L146', ['5', 'skip / retry sans faultTolerant', 'règles ignorées', 'faultTolerant() d\'abord'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L139', 'L140', [['skip_count = 7      journal des rejets : vide', r]]), extrait2('L141', 'L142', [['NullPointerException   (×3, pauses de 200, 400, 800 ms)', r]]),
    extrait2('L143', 'L144', [['JobInstanceAlreadyCompleteException', r]]), extrait2('L145', 'L146', [['status = COMPLETED      skip_count = 482 931', r]]),
    extrait2('L147', null, [['FlatFileParseException …   step FAILED      skip_count = 0', r]]),
  ],
  cues: [{ a: 'L138', s: 'pop' }, { a: 'L140', s: 'pop' }, { a: 'L142', s: 'pop' }, { a: 'L144', s: 'alarm', g: -12 }, { a: 'L146', s: 'pop' }],
});

SCENES[10] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L148', 100, 190, PC2, PH2, [
      row('L149', ['6', 'skip en écriture non anticipé', 'rejeu élément par élément', 'valider en amont'], o), row('L151', ['7', 'retry + effets de bord', 'e-mail deux fois, total doublé', 'processor pur'], r),
      row('L153', ['8', 'retry sans pause ni plafond', 'on martèle la base', 'delay + multiplier + jitter'], o), row('L155', ['9', 'reader non reprenable', 'restart de zéro, ou autre fichier', 'nom, saveState, fichier figé'], r),
      row('L157', ['10', 'arrêt non gracieux', 'exécution orpheline', 'hook + délai > chunk'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L150', 'L151', [['commit_count = 100   pour un seul chunk', r]]), extrait2('L152', 'L153', [['mail envoyé : client 42', r], ['mail envoyé : client 42   (rejeu)', r]]),
    extrait2('L154', 'L155', [['retry 1 … retry 47   en une seconde', r]]), extrait2('L156', 'L157', [['read.count absent   →   reprise à la ligne 1', r]]),
    extrait2('L158', 'L159', [['status = STARTED      end_time = NULL', r]]),
    ch('L159', 960, 700, 'test skip : 2 lignes mauvaises → COMPLETED, skip_count = 2', g, { size: 22 }), ch('L160', 960, 770, 'test retry : échoue 2 fois puis réussit → appels comptés', b, { size: 22 }),
    ch('L161', 960, 840, 'test restart : échec au 350e → relance → COUNT = lignes du fichier', o, { size: 22 }), ch('L162', 960, 930, 'ni doublons, ni pertes', y, { size: 30 }),
  ],
  cues: [{ a: 'L149', s: 'pop' }, { a: 'L151', s: 'pop' }, { a: 'L153', s: 'pop' }, { a: 'L155', s: 'pop' }, { a: 'L157', s: 'alarm', g: -12 }],
});

SCENES[11] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    ic('L163', 250, 300, 'clock', r, { sz: 70 }), tx('L163', 250, 400, '03:12 → reprise', { size: 30, fam: MONO, c: g }),
    pl('L164', 650, 240, 1, 'skip : donnée · retry : ressource · restart : processus', g, { size: 22 }), pl('L165', 650, 320, 2, 'skip consigné · retry borné (pauses, jitter) · restart au dernier commit', b, { size: 20 }), pl('L166', 650, 400, 3, 'arrêt gracieux : STOPPED après le chunk', o, { size: 22 }),
    cd('L167', 100, 500, 410, 300, 'Exercice 1', ['Skip sans listener : pourquoi dangereux pour un fichier bancaire ?'], r, { size: 20 }), cd('L168', 540, 500, 410, 300, 'Exercice 2', ['3 éléments échouent 2 fois : appels, rollbacks ? À mesurer.'], b, { size: 20 }),
    cd('L169', 980, 500, 410, 300, 'Exercice 3', ['Job STARTED au matin, sans processus : que faire, dans quel ordre ?'], o, { size: 20 }), cd('L170', 1420, 500, 400, 300, 'Exercice 4', ['Chunk de 100 000, délai d\'arrêt de 30 s : quel risque ?'], p, { size: 20 }),
    bar('L171', 960, 930, 800, 36, [['L171', 1], ['L172', 0]], y, { label: 'réfléchis…', b: 'L172' }),
    ch('L172', 305, 850, 'lignes sans trace', g, { size: 20 }), ch('L173', 745, 850, 'à mesurer sur ta version', g, { size: 20 }), ch('L174', 1185, 850, 'vérifier · recover · restart', g, { size: 20 }), ch('L175', 1620, 850, 'JVM tuée : orphelin', g, { size: 20 }),
    ch('L176', 1500, 990, 'Module 7 : mise à l\'échelle →', o, { size: 26 }),
  ],
  cues: [{ a: 'L172', s: 'success' }, { a: 'L176', s: 'levelup', g: -10 }],
});
