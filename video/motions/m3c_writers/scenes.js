// Module 3C : Le catalogue des writers
'use strict';

const EP = { tag: 'SPRING BATCH // MODULE 3C' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · MODULE 3C' };

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

const row = (a, cells, c) => ({ a, cells, c });
const pills = (a, items, y_, sz = 22) => items.map(([n, s, c_, x]) => pl(a, x, y_, n, s, c_, { size: sz }));

// ---------- Scène 0 : ouverture ----------
SCENES[0] = mk({
  label: 'OUVERTURE', color: o, part: '3C · LE CATALOGUE DES WRITERS',
  els: [
    code('L001', 160, 200, 1600, 230, 'releve.csv', [['L001', '1;ACC-001;2026-10-01;D;120.50', w], ['L001', '2;ACC-002;2026-10-01;C;80.00', w], ['L001', '2;ACC-002;2026-10-01;C;80.00', r], ['L001', '3;ACC-003;2026-10-0', r]], { size: 26, accent: r, b: 'L002' }),
    ch('L001', 960, 500, 'doublons et ligne coupée', r, { size: 32, b: 'L002' }),
    bx('L002', 330, 330, 300, 110, 'base', g, { b: 'L003' }), bx('L002', 710, 330, 300, 110, 'fichier', b, { b: 'L003' }), bx('L002', 1090, 330, 300, 110, 'message', p, { b: 'L003' }), bx('L002', 1470, 330, 300, 110, 'API', o, { b: 'L003' }),
    ch('L002', 960, 470, 'pas les mêmes garanties', y, { size: 32, b: 'L003' }),
    ch('L003', 560, 330, 'Module 3 : JdbcBatchItemWriter', b, { size: 28, b: 'L004' }), ch('L003', 1360, 330, 'Module 3B : ItemStream', p, { size: 28, b: 'L004' }),
    code('L004', 460, 250, 1000, 150, 'contrat', [['L004', 'void write(Chunk<? extends T> chunk)', g]], { size: 30, accent: g, b: 'L005' }),
    ch('L004', 960, 460, 'tout le chunk, un seul appel', o, { size: 30, b: 'L005' }),
    ...pills('L005', [[1, 'catalogue', b, 150], [2, 'fichiers', g, 510], [3, 'transaction', o, 870], [4, 'destinations', p, 1230], [5, 'son writer', y, 1590]], 330, 24),
    tx('L006', 960, 860, '3C.1 · Le catalogue →', { size: 52, c: b }),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L004', s: 'pop' }, { a: 'L005', s: 'blip' }],
});

// ---------- Scène 1 : le catalogue ----------
SCENES[1] = mk({
  label: 'CATALOGUE', color: b, part: '3C.1 · LE CATALOGUE DES WRITERS',
  els: [
    ch('L007', 960, 330, 'quel writer ? et que risque-t-on ?', o, { size: 36, b: 'L008' }),
    code('L008', 460, 250, 1000, 170, 'contrat', [['L008', 'write(Chunk<? extends T> chunk)', g], ['L008', 'open · update · close   // ItemStream', b]], { size: 28, accent: b, b: 'L009' }),
    tb('L009', 100, 200, [420, 1300], ['destination', 'writers'], [
      row('L009', ['fichiers', 'FlatFile · Json · Stax'], b),
      row('L010', ['base', 'Jdbc · Jpa · Repository'], g),
      row('L011', ['messages et autres', 'Jms · Amqp · Kafka · Mongo · Redis · Avro · courriel'], p),
      row('L012', ['composition', 'Composite · Classifier · MultiResource'], o),
      row('L013', ['adaptateurs, tests, threads', 'ItemWriterAdapter · ListItemWriter · SynchronizedItemStreamWriter'], y),
    ], { size: 26, rh: 66, b: 'L014' }),
    bx('L014', 560, 330, 520, 110, 'HibernateItemWriter', d, { lit: 0, size: 26, b: 'L018' }), ln('L014', 320, 330, 800, 330, r, { lw: 6, b: 'L018' }),
    ch('L015', 1360, 330, 'JpaItemWriter', g, { size: 36, b: 'L018' }),
    ch('L016', 560, 470, 'write(Chunk), plus List', o, { size: 28, b: 'L018' }), ch('L016', 1360, 470, 'infrastructure.item.*', o, { size: 28, b: 'L018' }),
    ch('L017', 960, 600, 'sourceType(record) : plus de getters', g, { size: 32, b: 'L018' }),
    ch('L019', 960, 330, 'JpaItemWriter ou JdbcBatchItemWriter', g, { size: 40, b: 'L020' }),
    code('L020', 100, 200, 1100, 150, 'JpaItemWriter', [['L020', 'writer.setUsePersist(true);   // persist au lieu de merge', w], ['L020', 'writer.setClearPersistenceContext(true);', w]], { size: 24, accent: p, b: 'L022' }),
    ch('L021', 1500, 330, 'Module 3B : ORM risqué en batch', o, { size: 26, b: 'L022' }),
    tx('L022', 960, 900, '3C.2 · Écrire un fichier →', { size: 48, c: g }),
  ],
  quiz: [{ q: 'L018', a: 'L019', question: 'Un tutoriel te demande HibernateItemWriter. Que fais-tu en Spring Batch 6 ?', choices: ['je le garde', 'JpaItemWriter', 'je le supprime'], win: 1, answer: "JpaItemWriter, ou JdbcBatchItemWriter. Aucun writer Hibernate natif n'existe en 6.0.6." }],
  cues: [{ a: 'L009', s: 'pop' }, { a: 'L014', s: 'error' }, { a: 'L015', s: 'success' }],
});

// ---------- Scène 2 : écrire un fichier ----------
SCENES[2] = mk({
  label: 'FICHIERS', color: g, part: '3C.2 · CSV, POSITIONS FIXES, JSON',
  els: [
    ic('L023', 1560, 300, 'file', b, { lab: 'csv', w: 110, h: 140, b: 'L034' }),
    code('L024', 100, 190, 1200, 460, 'StatementWriterConfig.java', [
      ['L024', 'FlatFileItemWriter<BankTransaction> statementWriter(WritableResource out) {', w],
      ['L024', '  return new FlatFileItemWriterBuilder<BankTransaction>().resource(out)', w],
      ['L025', '      .name("statementWriter")', g],
      ['L026', '      .delimited().delimiter(";")', b],
      ['L027', '      .sourceType(BankTransaction.class)', p],
      ['L027', '      .names("id", "accountNumber", "transactionDate", "transactionType", "amount")', p],
      ['L030', '      .headerCallback(w -> w.write("id;compte;date;type;montant"))', y],
      ['L031', '      .footerCallback(w -> w.write("# fin du relevé"))', y],
      ['L032', '      .shouldDeleteIfExists(true).build();', o],
      ['L032', '}', w]], { size: 21, accent: g, b: 'L034' }),
    ch('L025', 1560, 430, 'nom obligatoire : état sauvegardé', g, { size: 22, b: 'L034' }),
    ch('L026', 1560, 490, 'la virgule est le séparateur décimal', b, { size: 22, b: 'L034' }),
    ch('L029', 1560, 550, 'record : RecordFieldExtractor', p, { size: 22, b: 'L034' }),
    tx('L033', 1560, 640, '1234.50', { size: 44, c: g, fam: MONO, b: 'L034' }), ch('L033', 1560, 700, 'BigDecimal.toString()', d, { size: 22, b: 'L034' }),
    ch('L034', 960, 330, 'colonnes de largeur fixe', o, { size: 36, b: 'L035' }),
    code('L035', 100, 200, 1300, 150, 'positions fixes', [['L035', '.formatted().format("%-12s%-8s%12.2f")', w], ['L035', '.sourceType(BankTransaction.class).names("accountNumber", "transactionType", "amount")', w]], { size: 23, accent: o, b: 'L040' }),
    ch({ id: 'L036', w: 'texte' }, 1650, 330, 's : du texte', b, { size: 24, b: 'L040' }), ch({ id: 'L036', w: 'gauche' }, 1650, 390, '- : aligné à gauche', g, { size: 24, b: 'L040' }), ch({ id: 'L036', w: 'douze' }, 1650, 450, '12 : douze caractères de large', o, { size: 24, b: 'L040' }), ch({ id: 'L037', w: 'décimales' }, 1650, 510, '.2f : deux décimales', p, { size: 24, b: 'L040' }),
    code('L038', 100, 420, 1300, 150, 'fichier', [['L038', 'ACC-001     D       120.50', g], ['L038', 'ACC-0002-LONGUE D       80.00', r]], { size: 24, accent: r, b: 'L040' }),
    code('L039', 100, 600, 1300, 110, 'garde-fou', [['L039', '.maximumLength(32).minimumLength(32)', g]], { size: 24, accent: g, b: 'L040' }),
    ch('L039', 1560, 650, 'String overflowed in formatter', r, { size: 22, b: 'L040' }),
    ch('L040', 960, 330, 'JSON pour une application web', b, { size: 36, b: 'L041' }),
    code('L041', 100, 200, 1300, 170, 'JsonWriterConfig.java', [['L041', 'new JsonFileItemWriterBuilder<BankTransaction>().name("jsonWriter")', w], ['L041', '    .resource(out).jsonObjectMarshaller(new JacksonJsonObjectMarshaller<>()).build();', b]], { size: 22, accent: b, b: 'L044' }),
    ch('L041', 1560, 330, 'Jackson 3 (tools.jackson)', p, { size: 24, b: 'L044' }),
    code('L042', 100, 420, 1300, 190, 'releve.json', [['L042', '[', w], ['L042', '  { "id": 1, "accountNumber": "ACC-001", ... },', g], ['L042', '  { "id": 2, "accountNumber": "ACC-002", ... }', g], ['L042', ']', w]], { size: 23, accent: g, b: 'L044' }),
    ch('L043', 1560, 520, 'new JacksonJsonObjectMarshaller<>(mapper)', y, { size: 22, b: 'L044' }),
    tx('L044', 960, 900, "3C.3 · La transaction d'un fichier →", { size: 46, c: o }),
  ],
  quiz: [{ q: 'L028', a: 'L029', question: 'Un collègue écrit names(...) sur un record, mais oublie sourceType. Que se passe-t-il ?', choices: ['ça marche', 'ça échoue', 'colonnes vides'], win: 1, answer: "Ça échoue : le builder cherche des getters (getId) que les records n'ont pas. Avec sourceType, il utilise les noms des composants." }],
  cues: [{ a: 'L024', s: 'blip' }, { a: 'L038', s: 'error' }, { a: 'L039', s: 'success' }, { a: 'L042', s: 'pop' }],
});

// ---------- Scène 3 : la transaction d'un fichier ----------
SCENES[3] = mk({
  label: 'TRANSACTION', color: o, part: "3C.3 · POURQUOI UN FICHIER EST TRANSACTIONNEL",
  els: [
    bx('L045', 480, 330, 420, 110, 'fichier', b, { b: 'L046' }), bx('L045', 1440, 330, 420, 110, 'base', g, { b: 'L046' }), ch('L045', 960, 330, 'cohérents ?', y, { size: 34, b: 'L046' }),
    bx('L046', 400, 330, 300, 100, 'chunk', b, { b: 'L049' }), ar('L046', 560, 330, 700, 330, w, { b: 'L049' }), bx('L046', 960, 330, 480, 100, 'brouillon (tampon mémoire)', y, { size: 24, b: 'L049' }),
    ch('L047', 1560, 330, 'commit : recopié au propre', g, { size: 24, b: 'L049' }), ch('L047', 960, 450, 'rollback : brouillon jeté', r, { size: 28, b: 'L049' }),
    stp('L048', 960, 620, 'AUCUNE LIGNE À MOITIÉ ÉCRITE', g, { size: 44, b: 'L049' }),
    code('L049', 100, 200, 1300, 160, 'ExecutionContext', [['L049', 'statementWriter.current.count = 6000', p], ['L050', 'statementWriter.written = 412905', p]], { size: 28, accent: p, b: 'L051' }),
    ch('L050', 960, 420, 'position validée, en octets', b, { size: 28, b: 'L051' }),
    ch('L052', 960, 330, '6 000 lignes : le brouillon de 300 est jeté', g, { size: 36, b: 'L053' }),
    bx('L053', 480, 330, 520, 110, 'fichier : 6 000 lignes', b, { size: 26, b: 'L055' }), ar('L053', 750, 330, 1170, 330, g, { b: 'L055' }), bx('L053', 1440, 330, 520, 110, 'restart : tronque à written', g, { size: 24, b: 'L055' }),
    ch('L054', 960, 470, "l'en-tête n'est pas réécrit", y, { size: 28, b: 'L055' }),
    code('L055', 100, 220, 1400, 170, 'réglages', [['L055', '.transactional(false)    // écriture immédiate : un rollback laisse des lignes', o], ['L056', '.forceSync(true)         // écriture physique à chaque chunk : sûr, lent', y]], { size: 23, accent: o, b: 'L058' }),
    stp('L057', 960, 560, 'GARDE LA VALEUR PAR DÉFAUT', g, { size: 44, b: 'L058' }),
    ch('L058', 960, 330, 'côté base : une écriture a-t-elle eu lieu ?', b, { size: 34, b: 'L059' }),
    code('L059', 100, 220, 1400, 130, 'JdbcBatchItemWriter', [['L059', '.assertUpdates(true)   // défaut : zéro ligne modifiée = échec du chunk', g]], { size: 24, accent: g, b: 'L062' }),
    tb('L060', 100, 420, [600, 700], ['requête', 'zéro ligne modifiée'], [row('L060', ['UPDATE … WHERE id = :id', 'erreur de données'], r), row('L061', ['INSERT … ON CONFLICT DO NOTHING', 'normal : assertUpdates(false)'], g)], { size: 24, rh: 60, b: 'L062' }),
    tx('L062', 960, 900, '3C.4 · Plusieurs destinations →', { size: 48, c: p }),
  ],
  quiz: [{ q: 'L051', a: 'L052', question: 'Un export de 10 000 lignes échoue à la ligne 6 300, après un commit à 6 000. Que contient le fichier ?', choices: ['10 000 lignes', '6 000 lignes', '6 300 lignes'], win: 1, answer: '6 000 lignes : les 300 suivantes étaient dans le tampon, le rollback les a jetées. Aucune ligne coupée.' }],
  cues: [{ a: 'L046', s: 'pop' }, { a: 'L047', s: 'error' }, { a: 'L053', s: 'success' }, { a: 'L057', s: 'success' }],
});

// ---------- Scène 4 : composite, routage, découpage ----------
SCENES[4] = mk({
  label: 'COMPOSITION', color: p, part: '3C.4 · COMPOSITE, ROUTAGE, DÉCOUPAGE',
  els: [
    bx('L063', 480, 330, 420, 110, 'chunk', b, { b: 'L067' }), bx('L063', 1100, 250, 380, 90, 'base', g, { b: 'L067' }), bx('L063', 1100, 410, 380, 90, 'audit.csv', y, { b: 'L067' }),
    ar('L063', 690, 330, 910, 260, w, { b: 'L067' }), ar('L063', 690, 330, 910, 400, w, { b: 'L067' }),
    code('L064', 100, 560, 1500, 110, 'CompositeItemWriter', [['L064', 'new CompositeItemWriterBuilder<BankTransaction>().delegates(bankDbWriter, auditWriter).build()', w]], { size: 22, accent: p, b: 'L067' }),
    ch('L064', 1560, 250, 'photocopieur : copie le chunk entier', y, { size: 22, b: 'L067' }),
    ch('L065', 1560, 330, 'ouvre ses délégués', g, { size: 24, b: 'L067' }), ch('L066', 1560, 420, 'rollback : base et tampon annulés', g, { size: 22, b: 'L067' }),
    bx('L067', 400, 330, 300, 100, 'chunk', b, { b: 'L071' }), bx('L067', 1000, 250, 300, 90, 'debit.csv', r, { size: 24, b: 'L071' }), bx('L067', 1000, 410, 300, 90, 'credit.csv', g, { size: 24, b: 'L071' }),
    ar('L067', 560, 330, 840, 260, w, { b: 'L071' }), ar('L067', 560, 330, 840, 400, w, { b: 'L071' }),
    code('L068', 100, 560, 1500, 110, 'routage', [['L068', '.classifier(tx -> "D".equals(tx.transactionType()) ? debitWriter : creditWriter)', w]], { size: 22, accent: p, b: 'L071' }),
    ch('L068', 1560, 250, 'facteur : une lettre à la fois', y, { size: 22, b: 'L071' }),
    ch('L069', 1560, 330, 'un chunk, deux destinations', p, { size: 24, b: 'L071' }),
    code('L071', 100, 220, 1300, 170, 'step', [['L071', '.writer(routingWriter)', w], ['L071', '.stream(debitWriter).stream(creditWriter)', g]], { size: 26, accent: g, b: 'L073' }),
    tb('L072', 100, 420, [600, 400], ['writer de composition', 'ouvre ses délégués ?'], [row('L072', ['CompositeItemWriter', 'oui'], g), row('L072', ['ClassifierCompositeItemWriter', 'non'], r), row('L072', ['MultiResourceItemWriter', 'oui'], g)], { size: 24, rh: 58, b: 'L073' }),
    bx('L073', 400, 330, 360, 100, '2 000 000 lignes', r, { size: 26, b: 'L074' }), ch('L073', 960, 330, 'trop gros pour un fichier', o, { size: 30, b: 'L074' }),
    code('L074', 100, 200, 1300, 150, 'MultiResource', [['L074', '.resource(base)   // releve', w], ['L074', '.delegate(delegate).itemCountLimitPerResource(500_000)', g]], { size: 23, accent: o, b: 'L079' }),
    ch('L075', 300, 450, 'releve.1', b, { size: 26, b: 'L079' }), ch('L075', 560, 450, 'releve.2', b, { size: 26, b: 'L079' }), ch('L075', 820, 450, 'releve.3', b, { size: 26, b: 'L079' }),
    ch('L076', 1560, 330, 'délégué : pas de ressource fixe', r, { size: 22, b: 'L079' }),
    ch('L077', 960, 560, 'chunk 300 · limite 500 000 → 1 667 chunks = 500 100 lignes', y, { size: 26, b: 'L079' }),
    ch('L078', 960, 640, 'limite multiple du chunk · en-tête dans chaque fichier', g, { size: 26, b: 'L079' }),
    bx('L079', 480, 330, 360, 100, 'thread A', b), bx('L079', 480, 470, 360, 100, 'thread B', b), ar('L079', 670, 330, 880, 400, w), ar('L079', 670, 470, 880, 420, w), bx('L079', 1060, 400, 360, 100, 'FlatFileItemWriter', r, { size: 22 }),
    code('L080', 100, 620, 1500, 110, 'synchronisé', [['L080', 'new SynchronizedItemStreamWriter<>(fileWriter)', g]], { size: 26, accent: g }),
    ch('L081', 1560, 400, 'saveState(false) : plus de reprise précise', o, { size: 22 }),
    tx('L082', 960, 990, '3C.5 · Son propre writer →', { size: 44, c: o }),
  ],
  quiz: [{ q: 'L070', a: 'L071', question: 'Ton job échoue au premier write : « Writer must be open before it can be written to ». Que manque-t-il ?', choices: ['un nom', 'un .stream(...)', 'un commit'], win: 1, answer: "Les writers de fichier n'ont jamais été ouverts : ClassifierCompositeItemWriter n'est pas un ItemStream. Il faut les enregistrer avec .stream(...)." }],
  cues: [{ a: 'L064', s: 'pop' }, { a: 'L070', s: 'error' }, { a: 'L074', s: 'success' }, { a: 'L079', s: 'blip' }],
});

// ---------- Scène 5 : son propre writer, hors transaction, pièges ----------
SCENES[5] = mk({
  label: 'SON WRITER', color: g, part: '3C.5 · SON WRITER ET LES DESTINATIONS HORS TRANSACTION',
  els: [
    bx('L083', 480, 330, 420, 110, 'writer', o, { b: 'L084' }), ar('L083', 690, 330, 1170, 330, o, { b: 'L084' }), bx('L083', 1440, 330, 420, 110, 'service', r, { b: 'L084' }),
    code('L084', 100, 200, 1500, 260, 'AccountApiWriter.java', [
      ['L084', 'public class AccountApiWriter implements ItemWriter<AccountLine> {', w],
      ['L084', '  @Override public void write(Chunk<? extends AccountLine> chunk) {', w],
      ['L085', '    client.registerAll(chunk.getItems());   // un appel pour tout le chunk', g],
      ['L085', '  }', w], ['L085', '}', w]], { size: 23, accent: o, b: 'L087' }),
    ch('L086', 960, 540, 'ressource ouverte : extends AbstractItemStreamItemWriter', b, { size: 26, b: 'L087' }),
    code('L087', 100, 200, 1500, 130, 'ItemWriterAdapter', [['L087', 'adapter.setTargetObject(accountClient);', w], ['L087', 'adapter.setTargetMethod("register");   // un appel PAR ÉLÉMENT', o]], { size: 24, accent: o, b: 'L090' }),
    ch('L088', 960, 400, 'PropertyExtracting… : des propriétés comme arguments', p, { size: 26, b: 'L090' }),
    bx('L089', 480, 540, 420, 100, '1 appel', g, { b: 'L090' }), bx('L089', 1440, 540, 420, 100, '100 appels', r, { b: 'L090' }),
    tb('L090', 100, 200, [500, 500], ['destination', 'suit le chunk ?'], [row('L090', ['base (JDBC)', 'oui'], g), row('L090', ['fichier transactionnel', 'oui'], g), row('L090', ['file de messages', 'non'], r), row('L090', ['API · courriel', 'non'], r)], { size: 26, rh: 62, b: 'L093' }),
    ch('L091', 1560, 330, 'rollback : le message est déjà parti', r, { size: 24, b: 'L093' }),
    bx('L092', 1560, 450, 380, 90, 'idempotence', g, { size: 24, b: 'L093' }), bx('L092', 1560, 560, 380, 90, 'outbox', g, { size: 24, b: 'L093' }),
    ch('L093', 960, 330, 'Annexe REST : écriture vers une API', b, { size: 36, b: 'L094' }),
    pl('L094', 300, 330, 1, 'names sur un record sans sourceType', r, { size: 26 }), pl('L094', 300, 400, 2, 'writer de fichier sans nom', r, { size: 26 }),
    pl('L095', 300, 480, 3, 'Classifier sans stream', r, { size: 26 }), pl('L095', 300, 550, 4, 'assertUpdates + DO NOTHING', r, { size: 26 }),
    pl('L096', 300, 630, 5, 'largeur fixe dépassée', r, { size: 26 }), pl('L096', 300, 700, 6, 'transactional(false) en production', r, { size: 26 }),
    pl('L097', 300, 780, 7, 'writer de fichier partagé entre threads', r, { size: 26 }), pl('L097', 300, 850, 8, 'API traitée comme une base', r, { size: 26 }),
    ch('L098', 1500, 580, 'Exercices 1 à 5', b, { size: 32 }),
    tx('L099', 1400, 800, 'Module 4 : les processors →', { size: 44, c: p }),
  ],
  cues: [{ a: 'L084', s: 'blip' }, { a: 'L090', s: 'pop' }, { a: 'L091', s: 'error' }, { a: 'L099', s: 'levelup', g: -10 }],
});
