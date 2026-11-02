// Module 1 : Fondations
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 7' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 7' };

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
    ic('L001', 360, 330, 'clock', g, { sz: 80 }), tx('L001', 360, 450, 'SLA : 06:00', { size: 44, fam: MONO, c: g }), ic('L001', 960, 330, 'clock', r, { sz: 80 }), tx('L001', 960, 450, 'réel : 08:00', { size: 44, fam: MONO, c: r }), ch('L001', 1500, 330, 'volume × 2 par an', o, { size: 28 }),
    ch('L002', 960, 560, 'mesurer, puis choisir', y, { size: 40 }), ic('L003', 400, 720, 'server', g, { s: 'serveur A', w: 240, h: 130 }), ic('L003', 800, 720, 'server', p, { s: 'serveur B', w: 240, h: 130 }), db('L003', 1150, 720, 150, 120, b, ''),
    ch('L004', 1500, 680, 'singleton + threads : aléatoire', r, { size: 24 }), ch('L005', 1500, 750, 'split : steps ≠ · ici : un même step', b, { size: 22 }),
    ...pills('L006', [[1, 'mesurer', g, 90], [2, 'panorama', b, 330], [3, 'multithread', p, 590], [4, 'async', o, 850], [5, 'partitions', g, 1070], [6, 'restart', b, 1320], [7, 'distribué', p, 1540], [8, 'SKIP LOCKED', r, 1720]], 960, 18),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L006', s: 'blip' }],
});

SCENES[1] = mk({
  label: 'MESURER', color: g, part: "7.1 · MESURER AVANT D'OPTIMISER",
  els: [
    ch('L007', 960, 150, 'un job qui ne tient plus dans ses délais', d, { size: 24 }),
    ch('L008', 960, 200, 'ne pas optimiser… pour les experts : pas encore', y, { size: 30 }),
    ch('L009', 500, 290, 'boucle accidentelle', r, { size: 24 }), ch('L009', 960, 290, 'requête par élément', r, { size: 24 }), ch('L009', 1420, 290, 'chaîne qui grossit', r, { size: 24 }), ch('L010', 960, 360, 'paralléliser un défaut : le même défaut, plus vite', o, { size: 26 }),
    bx('L011', 400, 500, 360, 100, 'processeur', b, { size: 30 }), bx('L011', 960, 500, 360, 100, 'mémoire', p, { size: 30 }), bx('L011', 1520, 500, 360, 100, 'entrées-sorties', o, { size: 30 }),
    ch('L012', 960, 600, 'Java Flight Recorder (JDK) · VisualVM', g, { size: 26 }), ch('L013', 960, 660, 'profil CPU : les méthodes les plus coûteuses', d, { size: 22 }),
    ...pills('L014', [[1, 'mesurer', g, 400], [2, 'corriger le code', b, 800], [3, 'choisir une stratégie', o, 1250]], 760, 24), ch('L015', 960, 850, 'la plupart des lots : limités par les E/S', y, { size: 26 }),
    ch('L016', 500, 930, 'volume', b, { size: 26 }), ch('L017', 960, 930, 'SLA · fenêtre', o, { size: 26 }), ch('L017', 1400, 930, 'disponibilité', r, { size: 26 }),
  ],
  quiz: [{ q: 'L018', a: 'L019', question: 'Le processeur est à 10 %, la base à 90 %. Que fais-tu ?', choices: ['plus de threads de calcul', 'optimiser les écritures', 'autre langage'], win: 1, answer: "Le goulot est la base : j'optimise les écritures, ou je partitionne en respectant le pool de connexions." }],
  cues: [{ a: 'L010', s: 'error' }],
});

SCENES[2] = mk({
  label: 'PANORAMA', color: b, part: '7.2 · LE PANORAMA DES APPROCHES',
  els: [
    ch('L020', 960, 150, 'sept approches, de la plus simple à la plus complexe', d, { size: 24 }),
    tb('L021', 100, 190, [520, 720, 560], ['approche', 'ce qui est parallélisé', 'un seul serveur ?'], [
      row('L021', ['1 · multithread', 'les chunks d\'un step', 'une JVM'], b), row('L022', ['2 · flux parallèles (split)', 'des steps différents', 'une JVM'], b), row('L022', ['3 · AsyncItemProcessor', 'seulement le processor', 'une JVM'], b),
      row('L023', ['4 · partitionnement local', 'même step, plages disjointes', 'une JVM'], g), row('L024', ['5 · partitionnement distribué', 'idem, sur plusieurs JVM', 'plusieurs serveurs'], o), row('L024', ['6 · remote chunking', 'le processor, ailleurs', 'plusieurs serveurs'], o), row('L024', ['7 · SKIP LOCKED', 'lignes réservées par instance', 'plusieurs serveurs'], p)], { size: 21, rh: 52, noBold: true }),
    ch('L025', 960, 640, 'multithread : si le reader est déjà thread-safe', b, { size: 22, b: 'L030' }), ch('L026', 960, 695, 'async : seul le processor est lent', b, { size: 22, b: 'L030' }), ch('L027', 960, 750, 'partitionnement local : gros volume, un serveur', g, { size: 22, b: 'L030' }),
    ch('L028', 960, 805, 'remote chunking : le traitement est le goulot', o, { size: 22, b: 'L030' }), ch('L029', 960, 860, 'SKIP LOCKED : instances interchangeables', p, { size: 22, b: 'L030' }),
    ch('L030', 960, 650, 'deux situations très différentes', y, { size: 30 }), ch('L031', 500, 730, 'éviter les doublons : même job, même date', b, { size: 24 }), ch('L032', 500, 800, 'JobRepository : un seul démarre', g, { size: 24 }),
    ch('L033', 1400, 730, 'se partager le travail : un volume', p, { size: 24 }), ch('L034', 1400, 800, 'partitionnement ou SKIP LOCKED', o, { size: 24 }),
  ],
  quiz: [{ q: 'L035', a: 'L036', question: 'Deux serveurs lancent le même job, avec la même date, à deux heures. Partage de travail ?', choices: ['oui', 'non'], win: 1, answer: 'Non : un doublon. Le JobRepository en laisse passer un seul. Pour partager un volume, il faut partitionner ou réserver.' }],
  cues: [{ a: 'L032', s: 'success' }],
});

SCENES[3] = mk({
  label: 'MULTITHREAD', color: p, part: '7.3 · LE STEP MULTITHREAD ET SES LIMITES',
  els: [
    code('L038', 100, 190, 1300, 440, 'MultithreadStep', [
      ['L038', 'new SimpleAsyncTaskExecutor("chunk-")', C.text], ['L039', 'executor.setConcurrencyLimit(4);', y], ['L040', '.<RawTransaction, BankTransaction>chunk(100).transactionManager(tx)', C.text], ['L042', '.taskExecutor(chunkExecutor)', g],
      ['L047', 'new SynchronizedItemStreamReader<>(bankCsvReader)', b], ['L048', '.reader(shared).stream(shared)', b], ['L050', 'reader.saveState(false)', o]], { size: 21 }),
    rc('L037', 240, 'plusieurs chunks en parallèle', d), rc('L041', 310, 'une transaction par thread', g), rc('L043', 380, 'reader thread-safe obligatoire', o), rc('L049', 450, 'chunks terminés dans le désordre', r), rc('L051', 520, 'reprise précise : partitionner', y, 22),
    tb('L044', 100, 690, [520, 220, 760], ['reader', 'thread-safe', 'pourquoi'], [
      row('L044', ['JdbcPagingItemReader', 'oui', 'chaque page = requête indépendante'], g), row('L045', ['JdbcCursorItemReader', 'non', 'un seul ResultSet partagé'], r), row('L045', ['FlatFileItemReader', 'non', 'un flux, un compteur'], r), row('L046', ['Stax / Json', 'non', 'idem'], r), row('L046', ['Synchronized…Reader', 'oui', 'un verrou autour de read()'], g)], { size: 18, rh: 40, noBold: true }),
  ],
  quiz: [{ q: 'L052', a: 'L053', question: 'Un FlatFileItemReader est utilisé par 4 threads sans précaution. Que risque-t-on ?', choices: ['rien', 'lignes sautées ou dupliquées', 'erreur claire'], win: 1, answer: 'Des lignes sautées ou dupliquées, sans erreur : le flux de lecture et le compteur sont partagés.' }],
  cues: [{ a: 'L045', s: 'error' }, { a: 'L046', s: 'success' }],
});

SCENES[4] = mk({
  label: 'ASYNC', color: o, part: '7.4 · ASYNCITEMPROCESSOR',
  els: [
    code('L055', 100, 190, 1300, 360, 'AsyncItemProcessor', [['L055', 'new AsyncItemProcessor<RawTransaction, BankTransaction>()', C.text], ['L056', 'async.setDelegate(bankProcessor);  async.setTaskExecutor(processorExecutor);', b], ['L057', 'new AsyncItemWriter<BankTransaction>()   // va toujours avec', g], ['L058', '.<RawTransaction, Future<BankTransaction>>chunk(100)', y]], { size: 21 }),
    rc('L054', 240, 'processor lent, lecture inchangée', d), rc('L059', 330, '5 ms × 1 M ≈ 1 h 23', r), rc('L060', 410, '8 threads ≈ 10 min', g),
    ch('L062', 960, 700, 'seul le processor est parallélisé : lecture et écriture restent séquentielles', y, { size: 26 }),
  ],
  quiz: [{ q: 'L061', a: 'L062', question: "Le processor est rapide, l'écriture est lente. L'AsyncItemProcessor aide-t-il ?", choices: ['oui', 'non'], win: 1, answer: 'Non : lecture et écriture restent séquentielles. Il ne parallélise que le processor.' }],
  cues: [{ a: 'L060', s: 'success' }],
});

SCENES[5] = mk({
  label: 'PARTITION_LOCAL', color: g, part: '7.5 · LE PARTITIONNEMENT LOCAL, LIGNE PAR LIGNE',
  els: [
    code('L068', 100, 190, 1250, 330, 'IdRangePartitioner', [['L068', 'implements Partitioner { Map<String, ExecutionContext> partition(int gridSize)', y], ['L069', '  min = SELECT MIN(id)    max = SELECT MAX(id)', C.text], ['L070', '  long size = Math.ceilDiv(max - min + 1, gridSize);', g], ['L072', '  context.putLong("minId", start);  context.putLong("maxId", end);', b], ['L073', '  partitions.put("partition" + i, context);', o]], { size: 21 }),
    code('L074', 100, 550, 1250, 270, 'ouvrier et maître', [['L074', '@Value("#{stepExecutionContext[\'minId\']}") Long minId   // reader @StepScope', y], ['L076', '.partitioner("loadWorkerStep", partitioner)', g], ['L077', '.step(loadWorkerStep).gridSize(4)', g], ['L078', '.taskExecutor(partitionExecutor)', r]], { size: 21 }),
    rc('L063', 240, 'gros volume, un serveur, reprise précise', d, 20), rc('L064', 310, 'maître : partition(gridSize)', b), rc('L065', 380, 'un ouvrier complet par plage', g), rc('L071', 450, 'chaque id : une seule plage', y), rc('L075', 520, 'plage lue dans le contexte du step', b, 20),
    rc('L079', 590, 'sans exécuteur : aucun gain', r), rc('L080', 660, 'pool borné < pool de connexions', o, 20), rc('L081', 730, '16 partitions, 4 threads', d), rc('L083', 800, 'loadWorkerStep:partition0…3', b, 20), rc('L084', 870, 'compteurs du maître = somme', g, 20),
    ch('L066', 700, 880, '1–2500 · 2501–5000 · 5001–7500 · 7501–10000', y, { size: 24 }), ch('L067', 700, 940, 'le maître agrège les statuts', d, { size: 22 }), ch('L082', 700, 990, 'un thread = une StepExecution = ses connexions', d, { size: 20 }),
    ch('L089', 1550, 1000, 'restart →', b, { size: 24 }),
  ],
  quiz: [{ q: 'L085', a: 'L086', question: 'min = 1, max = 10 000, quatre partitions : quelles plages ?', choices: ['4 × 2 500', '4 × 2 501', '5 × 2 000'], win: 0, answer: 'Un à 2 500, 2 501 à 5 000, 5 001 à 7 500, 7 501 à 10 000.' },
         { q: 'L087', a: 'L088', question: 'Avec max = 10 002 : combien d\'identifiants dans la dernière plage ?', choices: ['2 500', '2 499', '2 501'], win: 1, answer: 'La taille devient 2 501 : la dernière plage va de 7 504 à 10 002, soit 2 499 identifiants.' }],
  cues: [{ a: 'L078', s: 'alarm', g: -12 }, { a: 'L071', s: 'stamp' }],
});

SCENES[6] = mk({
  label: 'RESTART_PARTITION', color: b, part: '7.6 · PARTITIONNEMENT, RESTART ET CHEVAUCHEMENT',
  els: [
    bx('L090', 300, 300, 340, 100, 'partition0', g, { size: 26 }), bx('L090', 700, 300, 340, 100, 'partition1', g, { size: 26 }), bx('L091', 1100, 300, 340, 100, 'partition2 : FAILED', r, { size: 24 }), bx('L090', 1500, 300, 340, 100, 'partition3', g, { size: 26 }),
    ch('L091', 960, 420, 'restart : seule la partition échouée est rejouée', y, { size: 28 }), ch('L092', 960, 490, 'nom déterministe : la partition est retrouvée', g, { size: 26 }), ch('L093', 960, 560, 'une position de lecture par partition', b, { size: 24 }), ch('L094', 960, 640, 'reprise précise : partitionnement > multithread', y, { size: 28 }),
    ch('L095', 500, 760, 'plages qui se chevauchent : lignes en double', r, { size: 24 }), ch('L095', 1400, 760, 'ou un trou : lignes jamais traitées', r, { size: 24 }),
    ch('L096', 500, 840, 'test : chaque id dans exactement une plage', g, { size: 24 }), ch('L097', 1400, 840, 'première plage = min, dernière = max', g, { size: 24 }), ch('L100', 1550, 1000, 'distribué →', p, { size: 26 }),
  ],
  quiz: [{ q: 'L098', a: 'L099', question: 'Les plages se chevauchent de 10 identifiants. Que se passe-t-il ?', choices: ['rien', '10 lignes traitées deux fois', 'erreur SQL'], win: 1, answer: 'Dix lignes traitées deux fois : doublons ou totaux faux, sans aucune erreur.' }],
  cues: [{ a: 'L091', s: 'error' }],
});

SCENES[7] = mk({
  label: 'DISTRIBUE', color: p, part: '7.7 · DISTRIBUÉ ET REMOTE CHUNKING (THÉORIE)',
  els: [
    code('L103', 100, 190, 1300, 520, 'ManagerConfig (théorique)', [['L103', 'RemotePartitioningManagerStepBuilderFactory factory;', y], ['L103', 'factory.get("managerStep").partitioner("workerStep", partitioner)', C.text], ['L104', '    .outputChannel(requests).inputChannel(replies)', g], ['L105', 'RemotePartitioningWorkerStepBuilderFactory   // côté ouvrier', b], ['L106', '@EnableBatchIntegration', o], ['L107', '@Profile("manager")   // le job n\'existe que sur le maître', r]], { size: 21 }),
    rc('L101', 240, 'THÉORIQUE : code non exécuté', o), rc('L102', 310, 'seule la plage voyage (messages)', b), rc('L108', 380, 'un JobRepository partagé', g), rc('L109', 450, 'ouvrier : hors du contexte du job', r, 20), rc('L110', 520, 'courtier : messages persistants', y), rc('L111', 590, 'lancement dynamique : Spring Cloud Task', d, 18),
    rc('L112', 660, 'remote chunking : le maître lit', p), rc('L113', 730, 'données par le réseau : plus lent si E/S', r, 20),
    ch('L116', 1550, 1000, 'SKIP LOCKED →', r, { size: 26 }),
  ],
  quiz: [{ q: 'L114', a: 'L115', question: "Le goulot est l'écriture en base. Remote chunking ou partitionnement ?", choices: ['remote chunking', 'partitionnement'], win: 1, answer: 'Partitionnement : chaque ouvrier lit et écrit sa plage. Le remote chunking ferait transiter toutes les données par le réseau.' }],
  cues: [{ a: 'L107', s: 'pop' }],
});

SCENES[8] = mk({
  label: 'SKIP_LOCKED', color: r, part: '7.8 · MULTI-INSTANCE : SKIP LOCKED ET BAIL',
  els: [
    code('L119', 100, 190, 1300, 540, 'staging_transaction · claim', [
      ['L119', 'status : NEW → CLAIMED → DONE      claimed_by      claimed_at', y], ['L120', 'CREATE INDEX idx_staging_claim ON staging_transaction (status, claimed_at, id);', b], ['L121', 'UPDATE staging_transaction SET status = \'CLAIMED\', claimed_by = :worker …', C.text],
      ['L121', ' WHERE id IN (SELECT id … ORDER BY id LIMIT :batch', C.text], ['L122', '       FOR UPDATE SKIP LOCKED)', r], ['L124', ' … OR (status = \'CLAIMED\' AND claimed_at < now() - lease)', g], ['L125', 'TransactionTemplate  →  PROPAGATION_REQUIRES_NEW', o], ['L127', 'public synchronized RawTransaction read() { … buffer.poll(); }', b]], { size: 21 }),
    rc('L117', 240, 'file de travail, instances multiples', d), rc('L118', 310, 'verrou distribué : complexe', r), rc('L123', 380, 'deux instances : lignes différentes', g), rc('L126', 450, 'verrou court', b), rc('L128', 520, 'tampon vide → réservation', d), rc('L131', 590, 'verrou de ligne, jamais d\'attente', y, 20), rc('L132', 660, 'sans SKIP LOCKED : attente ou doublon', r, 20),
    ...[0, 1, 2, 3].map(i => bx('L123', 220 + i * 150, 850, 130, 70, 'A', b, { size: 26 })), ...[0, 1, 2, 3].map(i => bx('L123', 820 + i * 150, 850, 130, 70, 'B', g, { size: 26 })), ch('L123', 960, 930, 'lignes réservées par A, puis par B', d, { size: 20 }),
    ch('L133', 1550, 1000, 'JobRepository →', b, { size: 26 }),
  ],
  quiz: [{ q: 'L129', a: 'L130', question: 'Une instance réserve cent lignes, puis plante. Que deviennent ces lignes ?', choices: ['perdues', 'reprises après le bail', 'rejouées tout de suite'], win: 1, answer: "Elles restent CLAIMED jusqu'à l'expiration du bail : alors une autre instance les reprend. Sans bail, elles seraient perdues." }],
  cues: [{ a: 'L122', s: 'pop' }, { a: 'L124', s: 'success' }],
});

SCENES[9] = mk({
  label: 'JOBREPOSITORY_CONCURRENCE', color: o, part: '7.9 · CONCURRENCE SUR LE JOBREPOSITORY',
  els: [
    cd('L134', 100, 200, 560, 250, 'Isolation SERIALIZABLE', ['deux lancements simultanés du même job'], g), cd('L135', 680, 200, 560, 250, 'Exécutions en cours', ['JobExecutionAlreadyRunningException'], b), cd('L136', 1260, 200, 560, 250, 'Colonne version', ['verrouillage optimiste : deux écritures, même ligne'], p),
    ch('L137', 960, 540, 'OptimisticLockingFailureException : deux processus, une StepExecution', o, { size: 24 }), ch('L138', 960, 610, 'ne la masque pas : c\'est un signal', y, { size: 28 }),
    ch('L139', 500, 720, 'message de partition livré en double', r, { size: 24 }), ch('L140', 1350, 720, 'la 2e écriture est refusée : le verrou optimiste travaille', g, { size: 22 }),
    ch('L141', 1550, 1000, 'Top 10 →', r, { size: 28 }),
  ],
  cues: [{ a: 'L137', s: 'pop' }],
});

SCENES[10] = mk({
  label: 'TOP10_1', color: r, part: 'TOP 10 DES PIÈGES (1/2)',
  els: [
    tb('L142', 100, 190, PC2, PH2, [
      row('L143', ['1', 'reader non thread-safe partagé', 'lignes sautées ou dupliquées', 'paginé, synchronisé, ou partitionner'], r), row('L145', ['2', 'singleton avec état en multithread', 'résultats aléatoires', 'sans état, StepScope'], r),
      row('L147', ['3', 'pool de threads mal dimensionné', 'base saturée, blocage', 'pool borné < connexions'], o), row('L149', ['4', 'OptimisticLockingFailureException', 'deux processus, même StepExecution', 'ne pas la masquer'], o),
      row('L151', ['5', 'plages qui se chevauchent', 'lignes en double ou jamais traitées', 'ceilDiv, bornes testées'], r)], { size: 21, rh: 70, noBold: true }),
    extrait2('L144', 'L145', [['source : 1 000 000 lignes      destination : 999 412 lignes', r]]), extrait2('L146', 'L147', [['total = 1 187,00      puis      1 203,50', r]]),
    extrait2('L148', 'L149', [['HikariPool: Connection is not available, request timed out', r]]), extrait2('L150', 'L151', [['OptimisticLockingFailureException … batch_step_execution', r]]),
    extrait2('L152', null, [['count = 1 000 010      (attendu : 1 000 000)', r]]),
  ],
  cues: [{ a: 'L143', s: 'pop' }, { a: 'L145', s: 'pop' }, { a: 'L147', s: 'pop' }, { a: 'L149', s: 'pop' }, { a: 'L151', s: 'alarm', g: -12 }],
});

SCENES[11] = mk({
  label: 'TOP10_2', color: r, part: 'TOP 10 DES PIÈGES (2/2)',
  els: [
    tb('L153', 100, 190, PC2, PH2, [
      row('L154', ['6', 'partitionnement sans TaskExecutor', 'exécuteur synchrone : aucun gain', 'taskExecutor explicite'], o), row('L156', ['7', 'multithread avec reprise', 'restart au mauvais endroit', 'saveState(false) ou partitionner'], r),
      row('L158', ['8', 'remote chunking, E/S goulot', 'plus lent qu\'avant', 'partitionner'], o), row('L160', ['9', 'SKIP LOCKED sans bail', 'lignes CLAIMED pour toujours', 'claimed_at + expiration'], r),
      row('L162', ['10', 'job démarré sur chaque ouvrier', 'le job tourne partout', '@Profile("manager")'], o)], { size: 21, rh: 70, noBold: true }),
    extrait2('L155', 'L156', [['[main] loadWorkerStep:partition0 … partition1 …   (un seul thread)', r]]), extrait2('L157', 'L158', [['read.count = 300  alors que les chunks 4 et 5 sont écrits', r]]),
    extrait2('L159', 'L160', [['débit : 4 200 → 1 900 lignes/s', r]]), extrait2('L161', 'L162', [['status = CLAIMED      claimed_at = il y a 3 jours', r]]),
    extrait2('L163', null, [['Job: [name=bankJob] launched   sur trois machines', r]]), ch('L164', 960, 990, 'en démonstration : un serveur, une base, peu de données', y, { size: 22 }),
  ],
  cues: [{ a: 'L154', s: 'pop' }, { a: 'L156', s: 'pop' }, { a: 'L158', s: 'pop' }, { a: 'L160', s: 'alarm', g: -12 }, { a: 'L162', s: 'pop' }],
});

SCENES[12] = mk({
  label: 'BILAN', color: g, part: 'BILAN ET EXERCICES',
  els: [
    ic('L165', 250, 300, 'clock', g, { sz: 70 }), tx('L165', 250, 400, '06:00', { size: 36, fam: MONO, c: g }),
    pl('L166', 650, 240, 1, 'mesurer · multithread (reader sûr) · async (processor lent)', g, { size: 22 }), pl('L167', 650, 320, 2, 'partitionnement (reprise précise) · remote chunking (processor goulot)', b, { size: 20 }), pl('L168', 650, 400, 3, 'SKIP LOCKED + bail : instances interchangeables', o, { size: 22 }),
    cd('L169', 100, 500, 410, 300, 'Exercice 1', ['40 min, fichier de 4 Go, calcul de 30 ms/ligne : goulot, approches ?'], b, { size: 20 }), cd('L170', 540, 500, 410, 300, 'Exercice 2', ['min 1, max 10 000, 4 partitions : plages ? Avec 10 002 ?'], o, { size: 20 }),
    cd('L171', 980, 500, 410, 300, 'Exercice 3', ['8 partitions, aucun gain : quelle ligne manque ?'], p, { size: 20 }), cd('L172', 1420, 500, 400, 300, 'Exercice 4', ['Instance plantée après 100 lignes réservées : avec / sans bail ?'], r, { size: 20 }),
    bar('L173', 960, 930, 800, 36, [['L173', 1], ['L174', 0]], y, { label: 'réfléchis…', b: 'L174' }),
    ch('L174', 305, 850, 'processor : Async ou remote chunking', g, { size: 18 }), ch('L175', 745, 850, '2 500 · puis 2 501 (dernière : 2 499)', g, { size: 18 }), ch('L176', 1185, 850, 'taskExecutor manquant', g, { size: 22 }), ch('L177', 1620, 850, 'sans bail : perdues', g, { size: 22 }),
    ch('L178', 1500, 990, 'Module 8 : production →', o, { size: 26 }),
  ],
  cues: [{ a: 'L174', s: 'success' }, { a: 'L178', s: 'levelup', g: -10 }],
});
