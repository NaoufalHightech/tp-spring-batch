// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 8' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 8' };

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
const rc = (a, y_, s, c_, sz = 22, o_ = {}) => ch(a, 1650, y_, s, c_, { size: sz, ...o_ });

SCENES[0] = mk({
  label: 'OUVERTURE', color: r,
  els: [
    ic('L001', 300, 330, 'clock', r, { sz: 80 }), tx('L001', 300, 450, '09:00', { size: 48, fam: MONO, c: r }), ch('L001', 800, 300, 'tests : verts', g, { size: 30 }), ch('L001', 800, 370, 'job : COMPLETED', g, { size: 30 }), ch('L001', 1450, 330, 'montants de la nuit : 0.00', r, { size: 32 }),
    ch('L002', 960, 540, 'non testé · non supervisé · mal déployé : un matin, ça arrive', y, { size: 34 }),
    bx('L003', 400, 700, 380, 110, 'TESTS', g, { size: 34 }), bx('L003', 960, 700, 380, 110, 'MONITORING', b, { size: 34 }), bx('L003', 1520, 700, 380, 110, 'DÉPLOIEMENT', o, { size: 34 }),
    ...pills('L004', [[1, 'piliers', g, 90], [2, 'tester', b, 330], [3, 'contenu', p, 550], [4, 'métriques', o, 790], [5, 'JFR', g, 1010], [6, '12 facteurs', b, 1190], [7, 'async', p, 1470], [8, 'K8s', o, 1620], [9, 'Data Flow', r, 1780]], 900, 16),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L004', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'PILIERS', color: g, part: '8.1 · LES TROIS PILIERS ET LES NOUVEAUTÉS DE LA VERSION 6',
  els: [
    ch('L005', 960, 160, 'un batch en production, sans mal dormir', d, { size: 24 }),
    cd('L006', 100, 200, 560, 230, 'Tests', ['ce que je livre fait-il ce que je crois ?', 'JobOperatorTestUtils, tests de contenu'], g), cd('L007', 680, 200, 560, 230, 'Monitoring', ["que s'est-il passé cette nuit ?", 'Micrometer, JFR, journaux, alertes'], b), cd('L008', 1260, 200, 560, 230, 'Déploiement', ['où, comment ça redémarre et s\'arrête ?', 'Kubernetes, Data Flow'], o),
    tb('L009', 100, 500, [700, 1100], ['nouveauté de la version 6', 'à retenir'], [
      row('L009', ['JobOperator étend JobLauncher', 'start, restart, stop, abandon'], b), row('L010', ['JobRepository étend JobExplorer · paquets · ChunkOrientedStep', 'une seule interface · infrastructure.item.*'], g), row('L010', ['retry de Spring Framework 7', 'RetryPolicy.builder()'], o), row('L011', ['événements JFR natifs · métriques Micrometer', 'observabilité intégrée'], p),
      row('L011', ['JobOperatorTestUtils', 'remplace JobLauncherTestUtils (déprécié)'], r)], { size: 21, rh: 60, noBold: true }),
    ch('L014', 1550, 1000, 'tester →', g, { size: 28 }),
  ],
  quiz: [{ q: 'L012', a: 'L013', question: 'Un tutoriel te fait utiliser JobLauncherTestUtils. Que fais-tu en Spring Batch 6 ?', choices: ['je le garde', 'JobOperatorTestUtils', 'je le supprime'], win: 1, answer: "JobOperatorTestUtils : il offre startJob et startStep. L'ancien est déprécié pour suppression." }],
  cues: [{ a: 'L011', s: 'pop' }],
});

SCENES[2] = mk({
  label: 'TESTER', color: b, part: '8.2 · TESTER UN JOB ET UN STEP',
  els: [
    code('L016', 100, 190, 1300, 570, 'BankJobIT.java', [
      ['L016', '@SpringBootTest   // PostgreSQL : parité avec la production', y], ['L017', '@SpringBatchTest', o], ['L018', '@Autowired JobOperatorTestUtils jobTestUtils;   jobTestUtils.setJob(bankJob);', b], ['L019', 'jdbc.update("DELETE FROM bank_transaction");   // état de départ connu', C.text],
      ['L020', 'var params = jobTestUtils.getUniqueJobParametersBuilder()', g], ['L021', '    .addString("runDate", "2026-10-01").addString("inputFile", "…", false)', g], ['L022', 'JobExecution execution = jobTestUtils.startJob(params);', y], ['L023', 'assertThat(step.getReadCount()).isEqualTo(5);  // filtrés 1, écrits 4', g],
      ['L024', 'jobTestUtils.startStep("loadBankStep");', b], ['L027', 'MetaDataInstanceFactory.createStepExecution(params)', C.text], ['L028', 'StepScopeTestUtils.doInStepScope(stepExecution, () -> …)', o]], { size: 21 }),
    rc('L015', 240, 'job complet, vraie base', d), rc('L020', 310, 'paramètres uniques : une instance par test', g, 20), rc('L022', 380, 'startJob attend la fin', b), rc('L025', 450, 'un seul step : diagnostic rapide', d, 20), rc('L026', 520, 'composant StepScope hors job', o), ch('L031', 1550, 1000, 'le test de contenu →', r, { size: 26 }),
  ],
  quiz: [{ q: 'L029', a: 'L030', question: 'Pourquoi des paramètres uniques à chaque test ?', choices: ['pour la vitesse', 'une JobInstance par test', 'pour les logs'], win: 1, answer: 'Pour créer une nouvelle JobInstance à chaque test. Avec les mêmes paramètres, le deuxième recevrait JobInstanceAlreadyComplete.' }],
  cues: [{ a: 'L022', s: 'success' }],
});

SCENES[3] = mk({
  label: 'TEST_CONTENU', color: r, part: '8.3 · LE TEST DE CONTENU',
  els: [
    code('L034', 100, 190, 1350, 480, 'les_valeurs_en_base_sont_exactes', [
      ['L034', 'jdbc.queryForMap("SELECT … FROM bank_transaction WHERE id = 1");', C.text], ['L035', 'assertThat(date).isEqualTo(LocalDateTime.of(2026, 10, 1, 9, 15));', y], ['L036', 'assertThat(amount).isEqualByComparingTo("120.50");', g],
      ['L037', 'SELECT SUM(amount) …  isEqualByComparingTo("2486.25")', b], ['L038', 'SELECT COUNT(*) … WHERE id = 4   →   isZero()   // ligne filtrée absente', o], ['L039', 'deux lancements : analyticsService.totals() inchangé', p]], { size: 21 }),
    ch('L032', 1650, 240, 'base fausse, test vert', r, { size: 24 }), ch('L033', 1650, 320, 'COMPLETED + count : insuffisant', r, { size: 22 }), ch('L040', 1650, 400, 'statut · compteurs · valeurs · total · exclusions', g, { size: 18 }),
    ch('L043', 1550, 1000, 'les métriques →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L041', a: 'L042', question: 'Un processor met LocalDateTime.now() à la place de la date. Quel test reste vert ?', choices: ['le test de valeur', 'COMPLETED + nombre de lignes', 'la somme'], win: 1, answer: 'Celui qui vérifie COMPLETED et le nombre de lignes. Seul le contrôle de la valeur de la date le détecte.' }],
  cues: [{ a: 'L033', s: 'error' }],
});

SCENES[4] = mk({
  label: 'METRIQUES', color: o, part: '8.4 · LES MÉTRIQUES AVEC MICROMETER',
  els: [
    ch('L044', 960, 150, "savoir si la nuit s'est bien passée", d, { size: 24, b: 'L045' }),
    tb('L045', 100, 190, [640, 900], ['métrique fournie par Spring Batch', 'contenu'], [
      row('L045', ['spring.batch.job', 'durée d\'un job'], b), row('L046', ['spring.batch.job.launch.count · spring.batch.step', 'lancements · durée d\'un step'], b), row('L047', ['spring.batch.item.read / .process · chunk.write', 'durée par élément · par chunk'], b)], { size: 21, rh: 56, noBold: true }),
    ch('L048', 1650, 250, 'étiquettes : job, step, statut', d, { size: 22 }), ch('L049', 1650, 330, '.observationRegistry(…)', y, { size: 22 }),
    code('L050', 100, 470, 1300, 250, 'BankMetricsListener', [['L051', 'Counter.builder("bank.transactions.rejected").tag("step", step)…', g], ['L052', 'Timer.builder("bank.load.duration")…record(BatchMetrics.calculateDuration(…))', b], ['L053', 'return stepExecution.getExitStatus();', C.text]], { size: 21 }),
    ch('L054', 480, 780, 'alerte : pas de succès avant l\'heure', y, { size: 22 }), ch('L055', 480, 840, 'job FAILED · durée anormale · trop de rejets', o, { size: 20 }),
    ch('L056', 1200, 780, 'pull : le pod de 20 s a disparu', r, { size: 22 }), ch('L057', 1200, 840, 'scrape toutes les 30 s : le job passe entre deux lectures', r, { size: 18 }), ch('L058', 1200, 900, 'solutions : Pushgateway, OTLP, ou lire le dépôt', g, { size: 20 }),
    ch('L061', 1550, 1000, 'JFR et journaux →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L059', a: 'L060', question: 'Un job dure 20 s, Prometheus interroge toutes les 30 s. Que voit-on ?', choices: ['tout', 'parfois rien', 'un doublon'], win: 1, answer: 'Parfois rien : le job a disparu entre deux lectures. Il faut pousser les métriques, ou lire le dépôt.' }],
  cues: [{ a: 'L056', s: 'error' }],
});

SCENES[5] = mk({
  label: 'JFR_LOGS', color: p, part: '8.5 · JFR ET JOURNAUX STRUCTURÉS',
  els: [
    ch('L062', 960, 170, 'job deux fois plus lent qu\'hier', d, { size: 26 }),
    bx('L063', 400, 290, 360, 90, 'JFR : enregistre la JVM', b, { size: 24 }), bx('L064', 960, 290, 420, 90, 'événements natifs Spring Batch', g, { size: 24 }), ch('L065', 1500, 290, 'beaucoup de ChunkScan = rejeu élément par élément', r, { size: 18 }), ch('L066', 960, 370, 'partitionnement : split, aggregate', d, { size: 22 }),
    code('L068', 100, 450, 1300, 400, 'StructuredLoggingListener', [['L068', 'MDC.put("jobName", …);  MDC.put("jobExecutionId", …);', y], ['L069', 'log.atInfo().addKeyValue("params", …).log("job démarré");', g], ['L070', '.addKeyValue("read", step.getReadCount()) … .log("step terminé");', b], ['L071', 'MDC.clear();', C.text], ['L072', 'logging.structured.format.console=ecs', o]], { size: 21 }),
    ch('L067', 1650, 500, 'retrouver une exécution', d, { size: 22 }), ch('L073', 1650, 580, 'MDC propre au thread', r, { size: 22 }), ch('L076', 1550, 1000, 'les douze facteurs →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L074', a: 'L075', question: 'Pourquoi des journaux en JSON, plutôt que du texte libre ?', choices: ['plus joli', 'champs exploitables', 'plus court'], win: 1, answer: "Parce que les champs sont exploitables sans analyse de texte : on filtre par exécution, par job, par statut." }],
  cues: [{ a: 'L065', s: 'pop' }],
});

SCENES[6] = mk({
  label: 'CLOUD_NATIVE', color: g, part: '8.6 · UN BATCH CLOUD NATIVE',
  els: [
    ch('L077', 960, 160, 'un batch qu\'on peut jeter et relancer', d, { size: 26 }),
    tb('L078', 100, 200, [560, 1100], ['facteur', 'appliqué au batch'], [
      row('L078', ['config dans l\'environnement', 'URL, utilisateur, secrets : variables'], g), row('L079', ['services attachés', 'la base PostgreSQL est une ressource configurée'], b), row('L080', ['processus sans état', 'l\'état vit dans le JobRepository'], p),
      row('L081', ['concurrence par processus', 'instances, pas seulement threads'], o), row('L082', ['jetable', 'démarrage rapide, arrêt gracieux'], r), row('L083', ['parité dev / prod', 'tester sur PostgreSQL'], g), row('L084', ['journaux en flux', 'sortie standard'], b), row('L085', ['tâche ponctuelle', 'un batch est cette tâche'], p)], { size: 20, rh: 56, noBold: true }),
    ch('L088', 1550, 1000, 'lancer sans bloquer →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L086', a: 'L087', question: "Où doit vivre l'état d'un batch pour qu'un nœud puisse en remplacer un autre ?", choices: ['dans la JVM', 'dans le JobRepository', 'dans un fichier local'], win: 1, answer: 'Dans le JobRepository, en base partagée : aucun état local au processus.' }],
  cues: [{ a: 'L080', s: 'pop' }],
});

SCENES[7] = mk({
  label: 'LANCER_ASYNC', color: b, part: '8.7 · LANCER SANS BLOQUER EN PRODUCTION (THÉORIE)',
  els: [
    ch('L089', 960, 170, 'THÉORIQUE : classes de Spring Batch 6.0.6, non exécutées', o, { size: 24 }),
    tb('L090', 100, 220, [420, 640, 640], ['', 'exécuteur applicatif (module 2)', 'TaskExecutorJobOperator'], [
      row('L091', ['qui crée le thread', 'ton code (executor.submit)', 'le lanceur'], b), row('L092', ['où est la règle', 'dans chaque contrôleur', 'à un seul endroit'], g), row('L093', ['start(…) retourne', 'rien d\'utile', 'la JobExecution, tout de suite'], g), row('L094', ['erreurs de lancement', 'perdues dans le thread', 'levées avant le thread'], o)], { size: 21, rh: 62 }),
    code('L095', 100, 560, 1300, 300, 'jobLaunchExecutor', [['L095', 'pool.setThreadNamePrefix("job-");  pool.setCorePoolSize(2);  pool.setQueueCapacity(10);', C.text], ['L095', 'pool.setWaitForTasksToCompleteOnShutdown(true);', g], ['L096', 'pool.setAwaitTerminationSeconds(120);', y], ['L097', 'new TaskExecutorJobOperator()   // dépôt, registre de jobs, pool', b]], { size: 21 }),
    ch('L100', 1550, 1000, 'Kubernetes →', o, { size: 26 }),
  ],
  quiz: [{ q: 'L098', a: 'L099', question: 'Un job déjà terminé est relancé avec les mêmes paramètres, par le lanceur asynchrone. Où apparaît l\'erreur ?', choices: ['dans le thread, perdue', "à l'appel, avant le thread", 'dans la base'], win: 1, answer: "À l'appel, avant la création du thread : l'appelant la reçoit directement." }],
  cues: [{ a: 'L093', s: 'success' }],
});

SCENES[8] = mk({
  label: 'KUBERNETES', color: o, part: '8.8 · KUBERNETES : JOB, CRONJOB, REPRISE (THÉORIE)',
  els: [
    ch('L101', 960, 160, 'THÉORIQUE : manifeste non exécuté', o, { size: 24 }),
    bx('L102', 300, 260, 360, 90, 'Deployment : redémarre sans fin', r, { size: 20 }), cr('L102', 300, 260, 30, r), bx('L103', 800, 260, 260, 80, 'CronJob', g, { size: 26 }), bx('L103', 1100, 260, 260, 80, 'Job', g, { size: 26 }), bx('L103', 1400, 260, 260, 80, 'Pod', g, { size: 26 }), ar('L103', 930, 260, 970, 260, d), ar('L103', 1230, 260, 1270, 260, d),
    code('L104', 100, 340, 1400, 600, 'bank-load (CronJob)', [
      ['L104', 'schedule: "0 2 * * *"   timeZone: "Europe/Paris"', y], ['L105', 'concurrencyPolicy: Forbid', r], ['L106', 'startingDeadlineSeconds: 600', C.text], ['L107', 'backoffLimit: 2', o], ['L108', 'activeDeadlineSeconds: 7200', r], ['L109', 'ttlSecondsAfterFinished: 86400', d],
      ['L110', 'restartPolicy: OnFailure', b], ['L111', 'terminationGracePeriodSeconds: 120', g], ['L112', 'secretKeyRef: bank-db   (DB_URL, DB_USER, DB_PASSWORD)', y], ['L113', 'SPRING_MAIN_WEBAPPLICATIONTYPE: "none"', r], ['L114', 'SPRING_BATCH_JOB_ENABLED: "true"', g], ['L115', 'SPRING_BATCH_JOB_NAME: "bankJob"', b]], { size: 21 }),
    rc('L105', 420, 'Allow : deux exécutions en parallèle', r, 20), rc('L108', 490, 'durée maximale du Job', r, 22), rc('L111', 560, 'délai > durée d\'un chunk', g, 22), rc('L113', 630, 'pas de serveur web dans un batch', r, 20), rc('L114', 700, 'réactivé ici (module 2 : désactivé)', o, 20),
    ch('L116', 1650, 780, 'code de sortie ≠ 0 → nouvelle tentative', d, { size: 18 }), ch('L117', 1650, 850, 'même paramètres : reprise de l\'instance', g, { size: 18 }), ch('L120', 1650, 1000, 'Data Flow →', r, { size: 26 }),
  ],
  quiz: [{ q: 'L118', a: 'L119', question: "backoffLimit 6, restartPolicy OnFailure, pas d'activeDeadlineSeconds, échec de configuration à chaque fois. Que se passe-t-il ?", choices: ['un seul essai', "7 essais toute la nuit", 'arrêt immédiat'], win: 1, answer: 'Sept tentatives pendant la nuit, sans limite de durée. Un backoffLimit bas et une durée maximale corrigent.' }],
  cues: [{ a: 'L102', s: 'error' }, { a: 'L108', s: 'pop' }],
});

SCENES[9] = mk({
  label: 'DATA_FLOW', color: p, part: '8.9 · SPRING CLOUD DATA FLOW ET SPRING CLOUD TASK (THÉORIE)',
  els: [
    ch('L121', 960, 170, 'THÉORIQUE', o, { size: 24 }),
    cd('L122', 100, 220, 820, 200, '1 à 5 jobs', ['CronJob Kubernetes + métriques : suffisant'], g), cd('L123', 980, 220, 840, 200, 'Beaucoup de tâches', ['définitions, planifications, tableau central : Data Flow'], p),
    pl('L124', 200, 520, 1, '@EnableTask (spring-cloud-starter-task)', b, { size: 22 }), pl('L125', 200, 600, 2, 'app register --name fileImport --type task', g, { size: 22 }), pl('L126', 200, 680, 3, 'task create · task launch', o, { size: 22 }), pl('L127', 200, 760, 4, 'tableau de bord : Tasks / Executions, Jobs', p, { size: 22 }),
    ch('L128', 1400, 600, 'deux bases : serveur Data Flow + JobRepository', y, { size: 24 }), ch('L129', 1400, 680, 'mal configuré : métadonnées perdues au redémarrage', r, { size: 20 }), ch('L132', 1550, 1000, 'Top 10 →', r, { size: 28 }),
  ],
  quiz: [{ q: 'L130', a: 'L131', question: 'Quand Data Flow est-il justifié ?', choices: ['pour 1 à 5 jobs', 'beaucoup de tâches, tableau central', 'jamais'], win: 1, answer: 'Quand on gère beaucoup de tâches avec un tableau de bord central. Pour un à cinq jobs, un CronJob suffit.' }],
  cues: [{ a: 'L129', s: 'error' }],
});

SCENES[10] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L133', 100, 190, PC2, PH2, [
      row('L134', ['1', 'test vert, données fausses', 'base fausse, COMPLETED', 'tests de contenu'], r), row('L136', ['2', 'aucun monitoring', 'échec découvert par un utilisateur', 'métriques + alertes'], r),
      row('L138', ['3', 'batch en Deployment / Job mal réglé', 'redémarre après chaque fin', 'CronJob, deadline, backoffLimit'], o), row('L140', ['4', 'Data Flow mal configuré', 'métadonnées perdues', 'base dédiée, JobRepository lu'], o),
      row('L142', ['5', 'métriques tirées d\'un pod court', 'le job disparaît', 'push, OTLP'], o)], { size: 21, rh: 70, noBold: true }),
    extrait2('L135', 'L136', [['amount = 0.00     status = COMPLETED     tests : ✔', r]]), extrait2('L137', 'L138', [['status = FAILED     end_time = 03:12     alerte reçue : aucune', r]]),
    extrait2('L139', 'L140', [['RESTARTS = 14     STATUS = CrashLoopBackOff', r]]), extrait2('L141', 'L142', [['onglet Jobs : 0 résultat', r]]),
    extrait2('L143', null, [['spring_batch_job_seconds : aucune série', r]]),
  ],
  cues: [{ a: 'L134', s: 'alarm', g: -12 }, { a: 'L136', s: 'pop' }, { a: 'L138', s: 'pop' }, { a: 'L140', s: 'pop' }, { a: 'L142', s: 'pop' }],
});

SCENES[11] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L144', 100, 190, PC2, PH2, [
      row('L145', ['6', 'serveur web dans un Job K8s', 'le processus ne se termine jamais', 'web-application-type=none'], o), row('L147', ['7', 'secrets dans l\'image ou le dépôt', 'fuite d\'identifiants', 'Secret Kubernetes'], r),
      row('L149', ['8', 'CronJob avec Allow', 'deux exécutions du même lot', 'Forbid + JobRepository'], r), row('L151', ['9', 'délai d\'arrêt < un chunk', 'pod tué, exécution orpheline', 'délai > chunk, hook'], r),
      row('L153', ['10', 'tests sur base en mémoire, logs non structurés', 'défauts seulement en production', 'PostgreSQL, JSON'], o)], { size: 21, rh: 70, noBold: true }),
    extrait2('L146', 'L147', [['STATUS = Running      (job COMPLETED depuis 2 h)', r]]), extrait2('L148', 'L149', [['DB_PASSWORD=…   dans un fichier versionné', r]]),
    extrait2('L150', 'L151', [['bank-load-1  Running', r], ['bank-load-2  Running', r]]), extrait2('L152', 'L153', [['status = STARTED     end_time = NULL', r]]),
    extrait2('L154', null, [['ERROR: could not serialize access     SQLSTATE 40001', r]]), ch('L155', 960, 990, 'la production : là où tout se rejoint, et où on regarde en dernier', y, { size: 22 }),
  ],
  cues: [{ a: 'L145', s: 'pop' }, { a: 'L147', s: 'pop' }, { a: 'L149', s: 'pop' }, { a: 'L151', s: 'alarm', g: -12 }, { a: 'L153', s: 'pop' }],
});

SCENES[12] = mk({
  label: 'BILAN_FORMATION', color: g, part: 'BILAN DE LA FORMATION',
  els: [
    ic('L156', 200, 270, 'clock', r, { sz: 60 }), tx('L156', 200, 360, '09:00', { size: 30, fam: MONO, c: r }),
    tb('L157', 340, 190, [260, 1300], ['module', 'à retenir · piège phare'], [
      row('L157', ['1', 'JobInstance = Job + paramètres · JobRepository PostgreSQL · piège : isolation abaissée'], b), row('L158', ['2', 'singleton, proxy StepScope, JobOperator · piège : job long dans la requête HTTP'], g),
      row('L159', ['3', 'un chunk = une transaction · piège : chunk jamais mesuré, curseur sans auto-commit'], p), row('L160', ['4', 'processor sans état, null filtre · piège : double comptage'], o),
      row('L161', ['5', 'BatchStatus ≠ ExitStatus, decider, split · piège : ExitStatus non aiguillé'], b), row('L162', ['6', 'skip, retry, restart, arrêt gracieux · piège : skip silencieux'], g),
      row('L163', ['7', 'mesurer, partitionner, SKIP LOCKED · piège : plages qui se chevauchent'], p), row('L164', ['8', 'tests de contenu, métriques, Kubernetes · piège : test vert, données fausses'], r)], { size: 17, rh: 46, noBold: true }),
    cd('L165', 100, 640, 410, 250, 'Exercice 1', ['now() à la place de la date : quel test reste vert ?'], r, { size: 18 }), cd('L166', 540, 640, 410, 250, 'Exercice 2', ['backoffLimit 6, pas de durée max : que se passe-t-il ?'], o, { size: 18 }),
    cd('L167', 980, 640, 410, 250, 'Exercice 3', ['job de 20 s, scrape toutes les 30 s : que voit-on ?'], b, { size: 18 }), cd('L168', 1420, 640, 400, 250, 'Exercice 4', ['2× plus lent : quels événements JFR ? ChunkScan ?'], p, { size: 18 }),
    bar('L169', 960, 960, 800, 34, [['L169', 1], ['L170', 0]], y, { label: 'réfléchis…', b: 'L170' }),
    ch('L170', 305, 930, 'test de comptage', g, { size: 18 }), ch('L171', 745, 930, '7 essais, sans limite', g, { size: 18 }), ch('L172', 1185, 930, 'parfois rien : pousser', g, { size: 18 }), ch('L173', 1620, 930, 'chunks rejoués un à un', g, { size: 18 }),
    ch('L174', 960, 1010, 'TP de synthèse à venir', o, { size: 24 }), ch('L175', 1500, 1010, 'merci !', y, { size: 26 }),
  ],
  cues: [{ a: 'L164', s: 'pop' }, { a: 'L170', s: 'success' }, { a: 'L175', s: 'levelup', g: -10 }],
});
