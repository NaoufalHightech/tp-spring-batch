// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 2' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 2' };

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

SCENES[0] = mk({
  label: 'FLASHBACK', color: r,
  els: [
    cd('L001', 100, 200, 520, 200, 'Lundi', ['Total : 100'], g, { b: 'L003' }), cd({ id: 'L001', w: 'mardi' }, 700, 200, 520, 200, 'Mardi', ['Total : 200'], r, { b: 'L003' }),
    ch({ id: 'L001', w: 'Aucune' }, 1500, 300, 'aucune erreur', d, { size: 30, b: 'L003' }),
    tx({ id: 'L002', w: 'singleton' }, 960, 560, 'SINGLETON', { size: 150, weight: 900, fam: DISP, c: r, glow: true, b: 'L003' }),
    db('L003', 1650, 420, 190, 140, b, 'PostgreSQL', { size: 20, b: 'L006' }), bx('L003', 400, 420, 260, 100, 'Job', g, { b: 'L006' }), bx('L003', 800, 420, 260, 100, 'Step', g, { b: 'L006' }),
    ar('L003', 530, 420, 670, 420, g, { b: 'L006' }), ar('L003', 930, 420, 1540, 420, b, { b: 'L006' }),
    tx('L004', 960, 640, 'Job + paramètres = JobInstance', { size: 50, c: y, b: 'L006' }), ic('L004', 1600, 640, 'lock', g, { s: 80, b: 'L006' }),
    bx('L005', 400, 820, 340, 100, 'JobOperator', b, { size: 30, b: 'L006' }), ch('L005', 800, 820, 'start · restart · stop · abandon', o, { size: 26, b: 'L006' }),
    pl({ id: 'L006', w: 'Six' }, 190, 920, 1, 'les deux modèles', g, { size: 22 }), pl({ id: 'L006', w: 'Six' }, 570, 920, 2, 'la tasklet', b, { size: 22 }), pl({ id: 'L006', w: 'Six' }, 890, 920, 3, 'step et job', p, { size: 22 }),
    pl({ id: 'L006', w: 'Six' }, 1210, 920, 4, 'lancer', o, { size: 22 }), pl({ id: 'L006', w: 'Six' }, 1470, 920, 5, 'singleton et proxy', r, { size: 22 }), pl({ id: 'L006', w: 'Six' }, 1830, 920, 6, 'Boot', g, { size: 22 }),
  ],
  cues: [{ a: 'L002', s: 'error' }, { a: 'L006', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'DEUX_MODELES', color: b, part: '2.1 · LES DEUX MODÈLES D\'UN STEP',
  els: [
    bx('L007', 500, 400, 360, 130, 'Job', g, { b: 'L008' }), bx('L007', 1100, 400, 360, 130, 'Step ?', o, { b: 'L008' }), ar('L007', 680, 400, 920, 400, d, { b: 'L008' }),
    cd('L008', 100, 200, 820, 240, 'Action unique', ['nettoyer une table', 'déplacer un fichier', 'appeler un service'], g, { b: 'L010' }),
    cd('L009', 1000, 200, 820, 240, 'Grand volume', ['un million de lignes', 'lire, transformer, écrire par paquets'], b, { b: 'L010' }),
    tb('L010', 260, 220, [320, 640, 640], ['', 'Tasklet', 'Chunk'], [
      { a: 'L010', cells: ['Quand', 'une action unique', 'un grand volume'], c: g }, { a: 'L011', cells: ['Interface', 'Tasklet', 'ItemReader · Processor · Writer'], c: b },
      { a: 'L012', cells: ['Transaction', 'une par appel de execute', 'une par paquet'], c: o }], { size: 26, rh: 80, b: 'L014' }),
    ch('L013', 960, 620, 'CONTINUABLE → on rappelle, nouvelle transaction', o, { size: 28, b: 'L014' }), ch('L013', 960, 700, 'FINISHED → fin du step', g, { size: 28, b: 'L014' }),
    cd('L014', 100, 200, 820, 260, 'Une seule transaction', ['DELETE de millions de lignes', 'la base sature'], r, { b: 'L017' }), cd('L015', 1000, 200, 820, 260, 'Par paquets de 1000', ['DELETE … 1000 lignes', 'commit, puis on recommence'], g, { b: 'L017' }),
    code('L016', 400, 560, 1100, 160, 'DeleteOldRowsTasklet', [['L016', 'int n = repo.deleteBatch(1000);', C.text], ['L016', 'return n == 0 ? FINISHED : CONTINUABLE;', g]], { b: 'L017' }),
    ch('L018', 960, 500, 'commits : 1, 2, 3, … sans fin', r, { size: 34, b: 'L019' }),
    bx('L019', 500, 420, 640, 150, 'TASKLET', g, { sub: 'une action, une transaction', size: 34, b: 'L020' }), bx('L019', 1420, 420, 640, 150, 'CHUNK', b, { sub: 'lire, traiter, écrire', size: 34, b: 'L020' }),
    ch('L022', 960, 410, 'qui déclenche tout ça ?', y, { size: 30, b: 'L023' }),
    bx('L023', 200, 500, 300, 110, 'déclencheur', o, { size: 28 }), bx('L024', 560, 500, 300, 110, 'JobOperator', b, { size: 28 }), bx({ id: 'L024', w: 'job et ses steps' }, 920, 500, 300, 110, 'Job · Steps', g, { size: 28 }),
    bx({ id: 'L024', w: 'JobRepository' }, 1280, 500, 300, 110, 'JobRepository', p, { size: 26 }), db({ id: 'L024', w: 'PostgreSQL' }, 1660, 500, 170, 130, b, ''),
    ar('L024', 350, 500, 410, 500, d), ar('L024', 710, 500, 770, 500, d), ar({ id: 'L024', w: 'JobRepository' }, 1070, 500, 1130, 500, d), ar({ id: 'L024', w: 'PostgreSQL' }, 1430, 500, 1580, 500, d),
    ch('L025', 960, 680, "un batch n'est pas un planificateur", y, { size: 30 }),
    ch('L026', 330, 330, 'cron', o, { size: 26 }), ch('L026', 960, 330, 'CronJob Kubernetes', o, { size: 26 }), ch('L026', 1560, 330, 'appel REST', o, { size: 26 }),
    ic('L027', 500, 840, 'server', g, { s: 'serveur A', w: 300, h: 150 }), ic('L027', 1400, 840, 'server', p, { s: 'serveur B', w: 300, h: 150 }), ch('L027', 960, 840, 'deux horloges : doublon', r, { size: 28 }),
    pl('L028', 200, 980, 1, 'deux modèles', g, { size: 24 }), pl('L028', 700, 980, 2, 'lanceur ≠ planificateur', b, { size: 24 }),
  ],
  quiz: [{ q: 'L017', a: 'L018', question: 'Ta tasklet retourne toujours CONTINUABLE. Que se passe-t-il ?', choices: ['elle se termine', 'boucle infinie', 'elle échoue'], win: 1, answer: 'Boucle infinie : une transaction par tour, le job ne se termine jamais.' },
         { q: 'L020', a: 'L021', question: 'Supprimer chaque nuit les lignes de plus de trente jours : tasklet ou chunk ?', choices: ['tasklet', 'chunk'], win: 0, answer: "Une tasklet : une seule instruction, pas de flux d'éléments à lire et à écrire." }],
  cues: [{ a: 'L018', s: 'error' }, { a: 'L024', s: 'pop' }, { a: 'L027', s: 'error' }],
});

SCENES[2] = mk({
  label: 'TASKLET_CLASSE', color: p, part: '2.2 · LA TASKLET, CLASSE EXPLICITE',
  els: [
    code('L029', 100, 190, 1100, 720, 'PrintMessageTasklet.java', [
      ['L031', '@Component', o], ['L032', '@StepScope', o], ['L033', 'public class PrintMessageTasklet implements Tasklet {'], ['L034', '  private static final Logger log = …;'],
      ['L035', '  private final String runDate;'], ['L036', '  public PrintMessageTasklet(', C.text], ['L036', '      @Value("#{jobParameters[\'runDate\']}") String runDate) {', y], ['L036', '    this.runDate = runDate; }'],
      ['L041', '  public RepeatStatus execute(StepContribution c, ChunkContext ctx) {'], ['L042', '    log.info("Traitement du {} (step {})", runDate,'], ['L042', '        c.getStepExecution().getStepName());', b],
      ['L043', '    return RepeatStatus.FINISHED;', g], ['L043', '  } }']], { b: 'L047' }),
    ch('L030', 1600, 280, 'classe : un nom, injection, testable', g, { size: 24, b: 'L047' }), cr('L030', 1360, 280, 30, r, { b: 'L047' }),
    side('L032', 360, 'neuf à chaque exécution du step', o, { b: 'L047' }), side('L036', 440, 'SpEL : jobParameters', b, { b: 'L047' }),
    side('L037', 520, 'step démarre : paramètres connus', g, { b: 'L047' }), side('L038', 600, "démarrage de l'appli : aucun paramètre", r, { b: 'L047' }),
    side('L039', 680, 'jobParameters = dictionnaire', y, { b: 'L047' }), side('L040', 760, 'JobScope contient StepScope', p, { b: 'L047' }),
    pl('L046', 250, 980, 1, 'une classe', b, { size: 22 }), pl('L046', 600, 980, 2, 'un bean', g, { size: 22 }), pl('L046', 940, 980, 3, 'StepScope', o, { size: 22 }), pl('L046', 1270, 980, 4, 'date par SpEL', y, { size: 22 }), pl('L046', 1600, 980, 5, 'FINISHED', g, { size: 22 }),
    tm('L047', 100, 200, 1300, 360, 'terminal', [
      { a: 'L048', s: 'Traitement du 2026-11-01 (step printMessageStep)', c: o }, { a: 'L048', s: 'Job: [helloJob] completed  status: COMPLETED', c: g },
      { a: 'L050', s: '! JobInstanceAlreadyCompleteException', c: r }, { a: 'L051', s: 'runDate=2026-11-02  →  COMPLETED', c: g }], { size: 24, accent: g }),
    tb('L049', 100, 620, [380, 220, 340, 460], ['job_name', 'instance', 'status', 'runDate'], [
      { a: 'L049', cells: ['helloJob', '1', 'COMPLETED', '2026-11-01'], c: g }, { a: 'L051', cells: ['helloJob', '2', 'COMPLETED', '2026-11-02'], c: b }], { size: 24, rh: 64, fam: MONO, noBold: true }),
    ch('L052', 1500, 900, '2.3 · le step et le job →', g, { size: 28 }),
  ],
  quiz: [{ q: 'L044', a: 'L045', question: "Tu retires StepScope mais tu gardes l'expression jobParameters. Que se passe-t-il ?", choices: ['elle fonctionne', 'erreur au démarrage', 'valeur null'], win: 1, answer: "Le contexte ne démarre pas : à la création du bean, les paramètres n'existent pas encore." }],
  cues: [{ a: 'L038', s: 'error' }, { a: 'L043', s: 'success' }, { a: 'L050', s: 'error' }],
});

SCENES[3] = mk({
  label: 'STEP_ET_JOB', color: g, part: '2.3 · LE STEP ET LE JOB AVEC LES BUILDERS 6',
  els: [
    code('L053', 100, 190, 1150, 720, 'HelloJobConfig.java', [
      ['L054', '@Configuration public class HelloJobConfig {', o], ['L055', '  @Bean', o], ['L056', '  Step printMessageStep(JobRepository jobRepository,'], ['L057', '        PlatformTransactionManager transactionManager,'],
      ['L058', '        PrintMessageTasklet tasklet) {', y], ['L061', '    return new StepBuilder("printMessageStep", jobRepository)', b], ['L062', '        .tasklet(tasklet, transactionManager)'], ['L062', '        .build(); }'],
      ['L063', '  @Bean Job helloJob(JobRepository jobRepository,', o], ['L063', '                     Step printMessageStep) {'], ['L064', '    return new JobBuilder("helloJob", jobRepository)', b], ['L065', '        .start(printMessageStep).build(); } }', g]]),
    side('L055', 280, 'singleton : un seul objet', g), side('L058', 360, "proxy, pas l'objet réel", o), side('L059', 440, 'le proxy attend le démarrage du step', o), side('L060', 520, 'jamais la vraie tasklet', y),
    side('L066', 620, 'v5 : StepBuilderFactory', r), cr('L066', 1330, 620, 26, r), side('L066', 700, 'v6 : new StepBuilder(…)', g),
    side('L067', 790, 'nom du step = clé en base', o), side('L068', 870, 'les noms sont des contrats', y), side('L069', 950, 'la transaction vient du manager', b),
    ch('L072', 1500, 1000, '2.4 · lancer le job →', g, { size: 26 }),
  ],
  quiz: [{ q: 'L070', a: 'L071', question: 'Dans batch_job_instance, quel nom de job apparaît ?', choices: ['nom de la classe', 'nom du bean', 'nom passé au JobBuilder'], win: 2, answer: 'Celui passé au JobBuilder : helloJob. Le nom de la classe ou de la méthode est sans importance pour la base.' }],
  cues: [{ a: 'L058', s: 'pop' }, { a: 'L065', s: 'success' }],
});

SCENES[4] = mk({
  label: 'LANCER', color: b, part: '2.4 · LANCER AVEC JOBOPERATOR, PUIS SANS BLOQUER',
  els: [
    code('L073', 100, 190, 1050, 520, 'HelloJobService.java', [
      ['L074', '@Service public class HelloJobService {', o], ['L075', '  private final JobOperator jobOperator;'], ['L075', '  private final Job helloJob;'], ['L075', '  public HelloJobService(JobOperator o, Job j) { … }'],
      ['L076', '  public JobExecution run(String runDate) {'], ['L076', '    JobParameters params = new JobParametersBuilder()'], ['L077', '        .addString("runDate", runDate)', y], ['L077', '        .toJobParameters();'],
      ['L078', '    return jobOperator.start(helloJob, params);', g], ['L078', '  } }']], { b: 'L085' }),
    ch('L079', 1550, 300, 'synchrone : attend la fin du job', o, { size: 26, b: 'L085' }),
    bar('L080', 1550, 430, 560, 44, [['L080', 0], ['L081', 1]], r, { label: 'requête HTTP bloquée', b: 'L085' }),
    ch('L081', 1550, 520, '2 s   /   1200 s', y, { size: 28, b: 'L085' }), ch('L082', 1550, 600, '100 requêtes : plus de thread libre', r, { size: 24, b: 'L085' }),
    ch('L085', 960, 500, 'comment lancer sans bloquer ?', y, { size: 44, b: 'L086' }),
    ar('L086', 300, 330, 900, 330, b, { b: 'L088' }), ch('L086', 300, 280, 'client', b, { size: 26, b: 'L088' }), ch('L087', 960, 400, 'le contrôleur attend : délai dépassé', r, { size: 28, b: 'L088' }),
    ch('L088', 960, 400, 'thread HTTP libéré, le job continue', g, { size: 28, b: 'L099' }),
    code('L089', 100, 190, 1280, 700, 'HelloJobController.java', [
      ['L089', 'ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();', b], ['L090', 'record StartRequest(String runDate) { }'], ['L090', 'record StartResponse(String runDate, String statusUrl) { }'],
      ['L091', '@PostMapping("/jobs/hello")', o], ['L094', 'ResponseEntity<StartResponse> start(@RequestBody StartRequest req) {'], ['L094', '  executor.submit(() -> service.run(req.runDate()));', y],
      ['L094', '  return ResponseEntity.accepted().body(…); }', g], ['L096', '@GetMapping("/jobs/hello/{runDate}")', o], ['L096', 'var last = jobRepository.getLastJobExecution("helloJob", params);', b],
      ['L098', 'return switch (last) {'], ['L098', '  case null -> "INCONNU";', y], ['L098', '  default -> last.getStatus().name(); };']], { b: 'L099' }),
    side('L091', 300, 'POST : lancer modifie l\'état', g, { b: 'L099' }), side('L095', 400, '202 : reçu, pas terminé', g, { b: 'L099' }), db('L097', 1620, 560, 160, 120, b, '', { b: 'L099' }), side('L097', 660, 'le suivi survit au redémarrage', b, { b: 'L099' }),
    tm('L099', 100, 200, 1400, 520, 'terminal', [
      { a: 'L099', s: '$ curl -X POST /jobs/hello -d \'{"runDate":"2026-11-02"}\'', c: C.text }, { a: 'L099', s: '→ 202 Accepted   /jobs/hello/2026-11-02', c: g },
      { a: 'L100', s: '$ curl /jobs/hello/2026-11-02', c: C.text }, { a: 'L100', s: '→ STARTED', c: o }, { a: 'L101', s: '$ curl /jobs/hello/2026-11-02', c: C.text }, { a: 'L101', s: '→ COMPLETED', c: g },
      { a: 'L102', s: '(redémarrage de l\'application)', c: d }, { a: 'L102', s: '$ curl /jobs/hello/2026-11-02  →  COMPLETED', c: g }, { a: 'L103', s: '$ curl -X POST … (même date)', c: C.text }, { a: 'L103', s: '! JobInstanceAlreadyCompleteException', c: r }], { size: 22, accent: b, b: 'L104' }),
    ch('L104', 960, 300, 'catch (Exception e) { }   ✗', r, { size: 34, b: 'L107' }),
    tb('L107', 200, 420, [320, 640, 640], ['', 'exécuteur applicatif', 'TaskExecutorJobOperator'], [
      { a: 'L107', cells: ['Principe', "on soumet l'appel", 'le lanceur crée le thread'], c: b }, { a: 'L107', cells: ['Quand', 'simple, sous ton contrôle', 'uniformiser les lancements'], c: g }], { size: 24, rh: 70 }),
    pl('L108', 250, 960, 1, 'service sans état', g, { size: 22 }), pl('L108', 640, 960, 2, 'POST', b, { size: 22 }), pl('L108', 920, 960, 3, '202', o, { size: 22 }), pl('L108', 1180, 960, 4, 'suivi par interrogation', p, { size: 22 }),
    code('L109', 100, 620, 1300, 260, 'HelloJobTest.java (indicatif)', [['L109', 'var e1 = utils.startJob(params("2026-11-01"));', C.text], ['L109', 'var e2 = utils.startJob(params("2026-11-02"));', y]], { b: 'L112' }),
    ch('L110', 1600, 680, 'test 1 : vert   test 2 : rouge', r, { size: 26 }), ch('L111', 1600, 760, 'toujours lancer deux fois', y, { size: 26 }),
    ch('L112', 1500, 1000, '2.5 · cycle de vie des beans →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L083', a: 'L084', question: 'Job de vingt minutes : start dans le contrôleur, ou soumettre à un autre thread ?', choices: ['start dans le contrôleur', 'autre thread'], win: 1, answer: 'Un autre thread, et répondre tout de suite : le thread HTTP reste libre.' },
         { q: 'L092', a: 'L093', question: 'Pourquoi un POST, et pas un GET, pour lancer le job ?', choices: ['POST', 'GET'], win: 0, answer: 'Un GET doit pouvoir être rejoué sans effet : un robot, un navigateur peuvent le déclencher.' },
         { q: 'L105', a: 'L106', question: "L'appelant reçoit la main avant la fin du job. Quel est l'état de l'exécution ?", choices: ['STARTED', 'COMPLETED', 'FAILED'], win: 0, answer: "STARTING ou STARTED : elle n'est pas terminée. D'où l'interrogation du dépôt." }],
  cues: [{ a: 'L082', s: 'error' }, { a: 'L094', s: 'success' }, { a: 'L103', s: 'error' }, { a: 'L110', s: 'error' }],
});

SCENES[5] = mk({
  label: 'CYCLE_BEAN', color: o, part: '2.5 · LE CYCLE DE VIE D\'UN BEAN',
  els: [
    ch('L113', 960, 255, 'à quel moment Spring fabrique mes objets ?', d, { size: 24, b: 'L115' }),
    ch('L114', 960, 190, 'cuisine · serveur · client · plonge', y, { size: 28, b: 'L115' }),
    bx('L115', 320, 330, 380, 120, '1 · instanciation', b, { sub: 'le constructeur', size: 26 }), bx('L115', 760, 330, 380, 120, '2 · injection', b, { sub: 'les dépendances', size: 26 }),
    bx('L116', 1200, 330, 380, 120, '3 · callbacks Aware', d, { sub: 'BeanNameAware…', size: 24 }), bx('L117', 1640, 330, 380, 120, '4 · post-processeur', o, { sub: 'avant initialisation', size: 24 }),
    bx('L117', 320, 600, 380, 120, '5 · initialisation', g, { sub: '@PostConstruct', size: 26 }), bx('L118', 760, 600, 380, 120, '6 · post-processeur', r, { sub: 'après : PROXYS', size: 26 }),
    bx('L119', 1200, 600, 380, 120, '7 · bean prêt', g, { sub: 'utilisé', size: 28 }), bx('L119', 1640, 600, 380, 120, '8 · destruction', d, { sub: '@PreDestroy', size: 26 }),
    ch('L118', 760, 700, 'les proxys naissent ici', r, { size: 24 }),
    code('L120', 400, 760, 1100, 130, 'console', [['L120', 'PrintMessageTasklet$$SpringCGLIB$$0', o]], { size: 24 }), ch('L121', 1650, 825, 'sous-classe générée', y, { size: 26 }),
    ch('L122', 500, 960, 'injecté = parfois un proxy', o, { size: 26 }), ch('L123', 1300, 960, "paramètres : après l'étape 7", r, { size: 26 }),
    ch('L126', 1650, 960, 'singleton / StepScope →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L124', a: 'L125', question: "À quelle étape le proxy d'un bean StepScope est-il créé ?", choices: ['étape 2', 'étape 6', 'étape 7'], win: 1, answer: "À l'étape 6, après l'initialisation. La vraie instance n'est créée qu'au démarrage du step." }],
  cues: [{ a: 'L118', s: 'alarm', g: -12 }, { a: 'L120', s: 'reveal' }],
});

SCENES[6] = mk({
  label: 'SINGLETON_PROXY', color: p, part: '2.5 · SINGLETON CONTRE STEPSCOPE',
  els: [
    tx('L127', 480, 190, 'SINGLETON', { size: 40, fam: MONO, c: r }), bx('L127', 480, 340, 400, 120, 'une instance', r, { sub: 'pour toujours', size: 30 }),
    ch('L128', 130, 520, 'lancement 1', b, { size: 22 }), ch('L128', 480, 520, 'lancement 2', b, { size: 22 }), ch('L128', 830, 520, 'lancement 3', b, { size: 22 }),
    ar('L128', 230, 495, 380, 410, r), ar('L128', 480, 495, 480, 410, r), ar('L128', 730, 495, 580, 410, r),
    tx('L129', 1400, 190, 'STEPSCOPE', { size: 40, fam: MONO, c: g }), bx('L129', 1400, 340, 440, 110, 'proxy (permanent)', d, { size: 28 }),
    ar('L131', 1280, 400, 1120, 520, g), bx('L131', 1100, 560, 300, 100, 'instance 1', b, { size: 26, b: 'L133' }), bx('L133', 1100, 560, 300, 100, 'instance 2', g, { size: 26 }),
    ar('L133', 1520, 400, 1660, 520, g, { dash: true }), bx('L133', 1680, 560, 300, 100, 'instance 3', p, { size: 26 }),
    ch('L132', 1400, 640, 'chaque appel est délégué', g, { size: 22, b: 'L133' }),
    ch('L130', 1400, 450, "prend la place dans l'injection", d, { size: 22 }), ch('L134', 1400, 700, 'proxy permanent · instances éphémères', y, { size: 26 }),
    code('L135', 100, 740, 900, 170, 'code', [['L136', 'void a() { this.b(); }', r], ['L136', 'void b() { … }  // appel interne', C.text]], { size: 24, b: 'L139' }),
    ch('L137', 1350, 800, 'this.b() contourne le proxy', r, { size: 26, b: 'L139' }), ch('L138', 1350, 880, "injecter depuis l'extérieur", g, { size: 26, b: 'L139' }),
    tb('L139', 260, 740, [300, 560, 700], ['portée', 'un objet pour…', 'état entre deux exécutions'], [
      { a: 'L139', cells: ['singleton', "toute l'application", 'partagé'], c: r }, { a: 'L139', cells: ['JobScope', 'un job', 'neuf à chaque job'], c: o }, { a: 'L139', cells: ['StepScope', 'un step', 'neuf à chaque step'], c: g }], { size: 24, rh: 50 }),
    ch('L140', 1500, 960, 'plus étroit = moins d\'état', y, { size: 26 }), ch('L141', 500, 960, 'le double comptage →', r, { size: 30 }),
  ],
  cues: [{ a: 'L129', s: 'pop' }, { a: 'L131', s: 'reveal' }, { a: 'L136', s: 'error' }],
});

SCENES[7] = mk({
  label: 'DOUBLE_COMPTAGE', color: r, part: '2.5 · LA DÉMONSTRATION DU DOUBLE COMPTAGE',
  els: [
    code('L142', 100, 190, 1050, 340, 'CountingTasklet.java', [
      ['L143', '@Component   // pas de @StepScope : singleton', r], ['L143', 'public class CountingTasklet implements Tasklet {'], ['L143', '  private int processed = 0;', y], ['L143', '  public RepeatStatus execute(…) {'],
      ['L143', '    processed += 100;', o], ['L143', '    log.info("Total traité : {}", processed);'], ['L143', '    return RepeatStatus.FINISHED; } }']], { size: 21, accent: r }),
    ch('L144', 600, 560, 'singleton', r, { size: 30 }),
    tm('L145', 1200, 190, 620, 340, 'journal', [{ a: 'L145', s: 'Total traité : 100', c: g }, { a: 'L146', s: 'Total traité : 200', c: r }, { a: 'L150', s: 'Total traité : 300', c: r }], { size: 26, accent: r }),
    stp('L147', 1500, 640, 'RAPPORT FAUX', r, { b: 'L148' }), ch('L147', 1500, 720, 'aucune exception', d, { size: 26, b: 'L148' }),
    bx('L148', 1500, 640, 380, 130, 'singleton', r, { sub: 'processed = 200', size: 30, b: 'L151' }),
    cd('L151', 100, 640, 560, 220, "1 · Pas d'état", ["le compteur vit dans la StepExecution"], g, { b: 'L159' }), cd('L152', 680, 640, 560, 220, '2 · StepScope', ['neuf à chaque exécution du step'], b, { b: 'L159' }), cd('L153', 1260, 640, 560, 220, '3 · Réinitialiser', ['fragile : on finit par oublier'], o, { b: 'L159' }),
    ch('L154', 480, 920, 'contribution.incrementWriteCount(100);', g, { size: 24, b: 'L159' }), ch('L155', 1300, 920, 'total dans batch_step_execution', b, { size: 24, b: 'L159' }), ch('L156', 480, 990, '@Component @StepScope', b, { size: 24, b: 'L159' }),
    ch('L159', 600, 700, 'test 1 : vert', g, { size: 34 }), ch('L159', 1300, 700, 'test 2 : rouge', r, { size: 34 }), ch('L160', 960, 820, 'toujours lancer le job deux fois', y, { size: 34 }),
    ch('L161', 1500, 960, '2.6 · démarrage Spring Boot →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L149', a: 'L150', question: 'Troisième lancement, toujours cent éléments. Qu'affiche le journal ?', choices: ['100', '200', '300'], win: 2, answer: 'Trois cents : le compteur grandit à chaque lancement tant que l\'application reste vivante.' },
         { q: 'L157', a: 'L158', question: 'Quelle parade est la plus sûre ?', choices: ["pas d'état", 'StepScope', 'réinitialiser'], win: 0, answer: "La première : pas d'état du tout, donc rien à oublier de réinitialiser ni à partager." }],
  cues: [{ a: 'L146', s: 'error' }, { a: 'L147', s: 'stamp' }, { a: 'L150', s: 'error' }],
  fx: [{ a: 'L146', glitch: 0.5, dur: 0.35 }],
});

SCENES[8] = mk({
  label: 'DEMARRAGE_BOOT', color: o, part: '2.6 · LE DÉMARRAGE DE SPRING BOOT',
  els: [
    bx('L162', 300, 350, 340, 120, 'application', g, { b: 'L168' }), ch('L163', 800, 280, 'job 1', r, { size: 28, b: 'L168' }), ch('L163', 800, 360, 'job 2', r, { size: 28, b: 'L168' }), ch('L163', 800, 440, 'helloJob', r, { size: 28, b: 'L168' }),
    ar('L163', 470, 330, 700, 290, r, { b: 'L168' }), ar('L163', 470, 350, 700, 360, r, { b: 'L168' }), ar('L163', 470, 370, 700, 435, r, { b: 'L168' }),
    ch('L164', 1450, 290, 'Hello World : pratique', g, { size: 26, b: 'L168' }), ch('L164', 1450, 370, 'API, plusieurs jobs : dangereux', r, { size: 26, b: 'L168' }),
    bx('L165', 300, 620, 380, 110, 'contexte construit', b, { size: 26, b: 'L168' }), bx('L165', 760, 620, 380, 110, 'jobs lancés', o, { size: 26, b: 'L168' }), bx('L165', 1220, 620, 380, 110, 'prêt à servir', g, { size: 26, b: 'L168' }),
    ar('L165', 500, 620, 560, 620, d, { b: 'L168' }), ar('L165', 960, 620, 1020, 620, d, { b: 'L168' }),
    code('L166', 100, 740, 1700, 170, 'journal (indicatif)', [['L166', 'Job: [name=helloJob] launched with parameters: [{}]', o], ['L167', 'runDate = null   →   résultat faux', r]], { size: 24, accent: r, b: 'L168' }),
    code('L168', 100, 200, 1400, 220, 'application.properties', [['L168', 'spring.batch.job.enabled=false', g], ['L169', 'spring.batch.job.name=helloJob', b]], { size: 28, accent: o }),
    ch('L170', 960, 520, "sans enabled=false : échec au démarrage, avant l'API", r, { size: 28 }),
    cd('L171', 100, 600, 820, 230, "Job d'initialisation", ['charge un référentiel', "une seule fois, à l'installation"], g),
    ch('L174', 1500, 960, "cas d'usage →", b, { size: 28 }),
  ],
  quiz: [{ q: 'L172', a: 'L173', question: 'Deux jobs dans l\'application : tu veux lancer seulement l\'un des deux au démarrage. Quelle propriété ?', choices: ['job.name', 'job.enabled', 'job.single'], win: 0, answer: 'spring.batch.job.name désigne le job à lancer ; enabled reste à true.' }],
  cues: [{ a: 'L163', s: 'error' }, { a: 'L168', s: 'success' }, { a: 'L170', s: 'error' }],
});

SCENES[9] = mk({
  label: 'CAS_USAGE', color: b, part: "CAS D'USAGE",
  els: [
    cd('L175', 100, 200, 860, 260, '1 · Import du matin', ['CronJob → POST /jobs/hello à 2 h', '202 aussitôt, suivi par GET'], g), ch('L176', 300, 500, 'GET : suivi', b, { size: 26 }), ch('L177', 700, 500, 'doublon : exception', r, { size: 26 }),
    cd('L178', 980, 200, 840, 260, '2 · Job à la demande', ['« recalculer les soldes du mois »', '202, suivi par interrogation'], b), ch('L179', 1400, 500, 'pas 20 minutes de requête', o, { size: 26 }),
    cd('L180', 100, 560, 860, 260, "3 · Initialisation", ['enabled=true + job.name', "une seule fois, à l'installation"], o),
    cd('L181', 980, 560, 840, 260, '4 · Reprise après échec', ['3 h : échec', 'matin : même date → reprise'], p), ch('L182', 1400, 860, 'même instance, nouvelle exécution', g, { size: 26 }),
    ch('L183', 960, 930, 'la date métier fait l\'instance : la reprise est possible', y, { size: 30 }), ch('L184', 1600, 1000, 'Top 10 des pièges →', r, { size: 26 }),
  ],
  cues: [{ a: 'L177', s: 'error' }, { a: 'L183', s: 'stamp' }],
});

const PH2 = ['#', 'Piège', 'Ce qui se passe', 'Parade'], PC2 = [80, 600, 560, 480];
const why = (a, b_, s) => ch(a, 960, 655, s, y, { size: 26, ...(b_ ? { b: b_ } : {}) });
SCENES[10] = mk({
  label: 'TOP10_1', color: r, part: '2.6 · TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L185', 100, 190, PC2, PH2, [
      { a: 'L186', cells: ['1', 'lancement automatique oublié', 'tous les jobs partent, sans paramètre', 'enabled=false'], c: r },
      { a: 'L189', cells: ['2', 'job long lancé en synchrone', 'requête bloquée, client qui relance', '202 + suivi'], c: r },
      { a: 'L192', cells: ['3', 'champ modifiable dans un singleton', 'double comptage entre lancements', 'sans état, ou StepScope'], c: r },
      { a: 'L195', cells: ['4', 'jobParameters hors StepScope', 'échec au démarrage du contexte', 'StepScope'], c: o },
      { a: 'L198', cells: ['5', 'appel interne sur un bean StepScope', 'le proxy est contourné', 'injecter depuis l\'extérieur'], c: o }], { size: 22, rh: 70, noBold: true }),
    extrait2('L187', 'L189', [['Job: [name=helloJob] launched with parameters: [{}]', o]]), why('L188', 'L189', 'Spring Boot est généreux : tout ce qui est déclaré est exécuté'),
    extrait2('L190', 'L192', [['curl: (28) Operation timed out after 30001 ms', r]]), why('L191', 'L192', 'en local : 2 s ; en production : 20 minutes'),
    extrait2('L193', 'L195', [['Total traité : 100', g], ['Total traité : 200   (2e lancement, même application)', r]]), why('L194', 'L195', 'le premier lancement est toujours correct'),
    extrait2('L196', 'L198', [['BeanCreationException: Error creating bean …', r], ['  Cannot resolve jobParameters   (bean hors StepScope)', r]]), why('L197', 'L198', 'le bean naît avant les paramètres'),
    extrait2('L199', null, [['appel interne : this.b()   →   valeur null   (proxy contourné)', r]]), why('L200', null, "on code l'objet, pas le proxy qui est devant"),
  ],
  cues: [{ a: 'L186', s: 'pop' }, { a: 'L189', s: 'pop' }, { a: 'L192', s: 'alarm', g: -12 }, { a: 'L195', s: 'pop' }, { a: 'L198', s: 'pop' }],
});
SCENES[11] = mk({
  label: 'TOP10_2', color: r, part: '2.6 · TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L201', 100, 190, PC2, PH2, [
      { a: 'L202', cells: ['6', 'tasklet qui retourne null', 'exception à l\'exécution', 'FINISHED ou CONTINUABLE'], c: o },
      { a: 'L205', cells: ['7', 'CONTINUABLE sans condition', 'boucle infinie, une transaction par tour', 'condition de sortie'], c: r },
      { a: 'L208', cells: ['8', 'lancement par GET', 'un robot relance le job', 'POST'], c: o },
      { a: 'L211', cells: ['9', 'exception asynchrone engloutie', 'échec invisible', 'journaliser, lire le dépôt'], c: r },
      { a: 'L214', cells: ['10', 'paramètre horodaté identifiant', 'chaque relance = nouvelle instance', 'date métier stable'], c: r }], { size: 22, rh: 70, noBold: true }),
    extrait2('L203', 'L205', [['NullPointerException   (statut de retour null)', r]]), why('L204', 'L205', 'on écrit la tasklet vite, on oublie le retour'),
    extrait2('L206', 'L208', [['commit_count = 48213   status = STARTED   (jamais terminé)', r]]), why('L207', 'L208', 'petit volume : la boucle finit par hasard'),
    extrait2('L209', 'L211', [["GET /jobs/hello 200   (journal d'accès, sans demande)", r]]), why('L210', 'L211', 'un GET se teste dans le navigateur'),
    extrait2('L212', 'L214', [['batch_job_execution.status = FAILED', r], ['(journal applicatif : vide)', d]]), why('L213', 'L214', 'un catch vide semble propre'),
    extrait2('L215', 'L217', [['job_instance_id = 101, 102, 103   pour le même jour', r]]), why('L216', 'L217', 'on veut une date unique, on oublie le coût'),
    ch('L217', 480, 750, 'test sur un lancement : vert', g, { size: 30 }), ch('L218', 1300, 750, 'test sur deux lancements : rouge', r, { size: 30 }),
  ],
  cues: [{ a: 'L202', s: 'pop' }, { a: 'L205', s: 'alarm', g: -12 }, { a: 'L208', s: 'pop' }, { a: 'L211', s: 'pop' }, { a: 'L214', s: 'pop' }, { a: 'L218', s: 'error' }],
});

SCENES[12] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    tx('L219', 500, 230, '200', { size: 150, fam: MONO, c: r, glow: true, b: 'L220' }), ch('L219', 1000, 230, '← un singleton qui garde un champ', r, { size: 34, b: 'L220' }),
    pl('L220', 150, 280, 1, 'tasklet : une action, une transaction', g, { size: 26 }), pl('L220', 1000, 280, 2, 'builders v6, sans fabrique', b, { size: 26 }),
    pl('L221', 150, 370, 3, 'synchrone : bloque', r, { size: 26 }), pl('L221', 1000, 370, 4, 'asynchrone : 202 + suivi', g, { size: 26 }),
    pl('L222', 150, 460, 5, 'singleton : partagé', o, { size: 26 }), pl('L222', 1000, 460, 6, 'StepScope : neuf, derrière un proxy', p, { size: 26 }),
    ch('L226', 960, 560, "l'état partagé : un deuxième lancement le révèle", y, { size: 28 }),
    cd('L223', 100, 640, 560, 270, 'Exercice 1', ['CountingTasklet lancée 3 fois :', 'que vaut le 3e total ? Deux corrections.'], b, { size: 22 }),
    cd('L224', 680, 640, 560, 270, 'Exercice 2', ["Pourquoi jobParameters échoue sur un singleton", 'et pas en StepScope ?'], o, { size: 22 }),
    cd('L225', 1260, 640, 560, 270, 'Exercice 3', ["start dans le contrôleur : 20 minutes.", 'Explique et corrige.'], p, { size: 22 }),
    bar('L227', 960, 990, 800, 36, [['L227', 1], ['L228', 0]], y, { label: 'réfléchis…', b: 'L228' }),
    ch('L228', 380, 850, '300 · sans état, ou StepScope', g, { size: 22 }), ch('L229', 960, 850, 'SpEL évalué au démarrage de l\'appli', g, { size: 22 }), ch('L230', 1540, 850, '202 + autre thread + suivi', g, { size: 22 }),
    ch('L231', 1500, 990, 'Module 3 : lire, traiter, écrire →', o, { size: 28 }),
  ],
  cues: [{ a: 'L219', s: 'error' }, { a: 'L228', s: 'success' }, { a: 'L231', s: 'levelup', g: -10 }],
});
