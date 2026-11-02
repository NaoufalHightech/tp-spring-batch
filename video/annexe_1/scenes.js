// Annexe 1 : Paramètres de Job et RunIdIncrementer
'use strict';

const EP = { tag: 'SPRING BATCH // ANNEXE 1' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · ANNEXE 1' };

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

// ---------- Scène 1 : l'accroche ----------
SCENES[1] = mk({
  label: 'ACCROCHE', color: r, part: 'ANNEXE 1 · RUNIDINCREMENTER',
  els: [
    code('L001', 160, 200, 1600, 170, 'terminal', [['L001', 'JobInstanceAlreadyCompleteException', r]], { size: 32, accent: r, b: 'L002' }),
    ch('L001', 960, 450, 'instance COMPLETED : relance refusée', r, { size: 30, b: 'L002' }),
    code('L002', 160, 200, 1600, 170, 'Launcher.java', [['L002', '.addLong("timestamp", System.currentTimeMillis())', y]], { size: 28, accent: y, b: 'L003' }),
    ch({ id: 'L002', w: 'marche' }, 960, 450, 'et ça marche…', g, { size: 30, b: 'L003' }),
    stp('L003', 960, 360, 'PIÈGE 5 · MODULE 1', r, { size: 60, b: 'L004' }),
    tx('L003', 960, 500, 'la reprise est cassée', { size: 44, c: r, b: 'L004' }),
    bx('L004', 300, 330, 300, 110, 'JOB', b, { b: 'L005' }), tx('L004', 500, 330, '+', { size: 60, c: w, b: 'L005' }),
    bx('L004', 840, 330, 460, 110, 'PARAMS IDENTIFIANTS', p, { size: 24, b: 'L005' }), tx('L004', 1130, 330, '=', { size: 60, c: w, b: 'L005' }),
    bx('L004', 1450, 330, 380, 110, 'JOBINSTANCE', g, { b: 'L005' }),
    ch('L004', 960, 500, 'le timestamp change à chaque lancement', r, { size: 28, b: 'L005' }),
    bx('L005', 480, 340, 640, 120, 'exéc. 1 · ts=…001 · ÉCHEC', r, { size: 26, b: 'L006' }),
    bx('L005', 1440, 340, 640, 120, 'exéc. 2 · ts=…002 · de zéro', o, { size: 26, b: 'L006' }),
    ar('L005', 800, 340, 1120, 340, r, { b: 'L006' }),
    ch('L005', 960, 500, 'ligne 900 000 : tout est à refaire', r, { size: 28, b: 'L006' }),
    tx('L006', 960, 340, 'mais le besoin, lui, est légitime', { size: 54, c: o, glow: true, b: 'L007' }),
    ...pills('L007', [[1, 'le besoin', o, 360], [2, 'la solution', g, 700], [3, 'sous le capot', b, 1080], [4, 'le piège', r, 1480]], 560, 26),
    tx('L008', 960, 860, 'Le besoin légitime →', { size: 52, c: o }),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L003', s: 'pop' }, { a: 'L006', s: 'blip' }],
});

// ---------- Scène 2 : le besoin légitime ----------
SCENES[2] = mk({
  label: 'LE BESOIN', color: o, part: 'ANNEXE 1 · LE BESOIN',
  els: [
    cd('L009', 100, 220, 800, 260, 'Rapport à la demande', ['chaque demande = un nouveau travail', 'aucune date métier à mettre'], o, { b: 'L011' }),
    ic('L010', 1100, 340, 'file', b, { lab: 'PDF', b: 'L011' }), ic('L010', 1300, 340, 'file', b, { lab: 'PDF', b: 'L011' }),
    ch('L010', 1200, 480, 'même job · deux demandes', y, { size: 26, b: 'L011' }),
    cd('L011', 100, 220, 800, 260, 'Nettoyage toutes les heures', ['pas de runDate', 'chaque exécution est distincte'], o, { b: 'L012' }),
    ic('L011', 1200, 340, 'clock', o, { sz: 80, b: 'L012' }),
    tx('L012', 960, 340, '?', { size: 200, c: o, glow: true, b: 'L013' }),
    ch('L012', 960, 560, 'aucun paramètre naturel ne distingue deux lancements', r, { size: 30, b: 'L013' }),
    bx('L013', 480, 340, 300, 110, 'run.id = 1', p, { b: 'L014' }), bx('L013', 960, 340, 300, 110, 'run.id = 2', p, { b: 'L014' }), bx('L013', 1440, 340, 300, 110, 'run.id = 3', p, { b: 'L014' }),
    ar('L013', 640, 340, 800, 340, g, { b: 'L014' }), ar('L013', 1120, 340, 1280, 340, g, { b: 'L014' }),
    ch('L013', 960, 520, 'un compteur simple · la reprise reste intacte', g, { size: 28, b: 'L014' }),
    tx('L014', 960, 600, 'RunIdIncrementer', { size: 90, c: p, glow: true, fam: DISP }),
  ],
  cues: [{ a: 'L012', s: 'blip' }, { a: 'L013', s: 'success' }],
});

// ---------- Scène 3 : la solution ----------
SCENES[3] = mk({
  label: 'LA SOLUTION', color: p, part: 'ANNEXE 1 · RUNIDINCREMENTER',
  els: [
    code('L015', 100, 200, 1150, 330, 'RapportClientConfig.java', [
      ['L015', 'Job rapportClient(JobRepository jobRepository, Step step) {', w],
      ['L015', '  return new JobBuilder("rapportClient", jobRepository)', w],
      ['L016', '      .incrementer(new RunIdIncrementer())', p],
      ['L016', '      .start(step)', w],
      ['L016', '      .build();', w],
    ], { size: 24, accent: p }),
    ch('L017', 1560, 260, 'run.id : Long', p, { size: 30 }),
    tx('L017', 1560, 340, 'run.id = 1 → 2 → 3', { size: 34, fam: MONO, c: p }),
    ch('L018', 1560, 430, 'paramètre identifiant', g, { size: 28 }),
    bx('L019', 1560, 560, 520, 90, 'start(job, params)', r, { size: 26, b: 'L020' }),
    cr('L019', 1860, 560, 26, r, { b: 'L020' }),
    ch('L019', 1560, 650, 'incrémenteur ignoré', r, { size: 26, b: 'L020' }),
    code('L020', 100, 580, 1150, 110, 'Lancement', [['L020', 'jobOperator.startNextInstance(job);', g]], { size: 28, accent: g }),
    bx('L020', 300, 860, 360, 100, 'derniers params', b, { size: 24 }), ar('L020', 490, 860, 670, 860, w),
    bx('L020', 860, 860, 360, 100, 'getNext()', p, { size: 24 }), ar('L020', 1050, 860, 1230, 860, w),
    bx('L020', 1420, 860, 360, 100, 'nouvelle instance', g, { size: 24 }),
    ch('L022', 1560, 780, 'premier lancement : run.id = 1', g, { size: 26 }),
    tx('L023', 960, 990, 'Sous le capot →', { size: 44, c: b }),
  ],
  quiz: [{ q: 'L021', a: 'L022', question: "Base vide, premier lancement avec startNextInstance. Quelle valeur prend run.id ?", choices: ['0', '1', 'rien'], win: 1, answer: "1 : l'incrémenteur part de zéro quand le paramètre n'existe pas, et ajoute un. Puis 2, puis 3." }],
  cues: [{ a: 'L016', s: 'pop' }, { a: 'L019', s: 'error' }, { a: 'L020', s: 'success' }],
});

// ---------- Scène 4 : sous le capot, la JOB_KEY ----------
SCENES[4] = mk({
  label: 'JOB_KEY', color: b, part: 'ANNEXE 1 · SOUS LE CAPOT',
  els: [
    tx('L024', 100, 190, 'batch_job_instance', { align: 'left', size: 30, c: b, fam: MONO }),
    tb('L024', 100, 220, [120, 420, 520], ['id', 'job_name', 'job_key'], [
      row('L028', ['1', 'rapportClient', '9c1f…e07'], g),
      row({ id: 'L028', w: 'deux' }, ['2', 'rapportClient', '4b8a…d52'], g),
    ], { size: 26, fam: MONO }),
    bx('L025', 1560, 300, 440, 90, 'params identifiants', p, { size: 24, b: 'L029' }), ar('L025', 1560, 345, 1560, 420, w, { b: 'L029' }),
    bx('L025', 1560, 470, 440, 90, 'MD5 (triés par nom)', o, { size: 24, b: 'L029' }), ar('L025', 1560, 515, 1560, 590, w, { b: 'L029' }),
    bx('L025', 1560, 640, 440, 90, 'job_key · 32 car.', g, { size: 24, b: 'L029' }),
    ch('L026', 1560, 760, 'non identifiant : ignoré', o, { size: 26, b: 'L029' }),
    ch('L027', 580, 520, 'unique (job_name, job_key)', y, { size: 28, b: 'L029' }),
    ch('L028', 580, 580, 'clé A ≠ clé B → nouvelle ligne', g, { size: 26, b: 'L029' }),
    tx('L029', 100, 590, 'batch_job_execution_params', { align: 'left', size: 30, c: p, fam: MONO }),
    tb('L029', 100, 620, [130, 190, 270, 250, 140], ['exéc.', 'name', 'type', 'value', 'ident.'], [
      row('L029', ['1', 'run.id', 'java.lang.Long', '1', 'Y'], g),
      row('L029', ['2', 'run.id', 'java.lang.Long', '2', 'Y'], g),
    ], { size: 22, fam: MONO, rh: 54 }),
    tx('L030', 1500, 660, 'key_name · type_cd', { size: 28, c: d, fam: MONO }),
    ln('L030', 1330, 660, 1670, 660, r, { lw: 5 }),
    ch('L030', 1500, 740, 'v6 : parameter_name · _type · _value', g, { size: 22 }),
    tx('L031', 960, 990, 'Le piège, en base →', { size: 44, c: r }),
  ],
  cues: [{ a: 'L025', s: 'blip' }, { a: 'L028', s: 'success' }, { a: 'L030', s: 'pop' }],
});

// ---------- Scène 5 : le piège en base ----------
SCENES[5] = mk({
  label: 'LE PIÈGE EN BASE', color: r, part: 'ANNEXE 1 · SQL',
  els: [
    code('L032', 100, 190, 1720, 200, 'psql', [
      ['L032', 'psql -d batchdb', g],
      ['L033', 'SELECT job_execution_id, parameter_name, parameter_type, parameter_value', w],
      ['L033', "FROM batch_job_execution_params WHERE identifying = 'Y';", w],
    ], { size: 22, accent: g }),
    tb('L034', 100, 420, [270, 330, 420, 480], ['job_execution_id', 'parameter_name', 'parameter_type', 'parameter_value'], [
      row('L034', ['41', 'runDate', 'java.time.LocalDate', '2026-11-01'], g),
      row('L035', ['42', 'runDate', 'java.time.LocalDate', '2026-11-01'], g),
      row('L036', ['43', 'timestamp', 'java.lang.Long', '1793491200000'], r),
      row({ id: 'L036', w: 'autre' }, ['44', 'timestamp', 'java.lang.Long', '1793577600000'], r),
    ], { size: 24, fam: MONO, rh: 54 }),
    ch('L035', 960, 780, 'une instance · deux exécutions : reprise', g, { size: 28, b: 'L036' }),
    ch('L037', 960, 780, '13 chiffres = millisecondes depuis 1970', r, { size: 28, b: 'L038' }),
    ch('L038', 400, 860, 'nom : timestamp, now…', o, { size: 24, b: 'L039' }), ch('L038', 960, 860, 'type : Long', o, { size: 24, b: 'L039' }), ch('L038', 1500, 860, 'valeur ≠ à chaque ligne', o, { size: 24, b: 'L039' }),
    ch('L039', 520, 940, 'runDate : lisible · métier · se répète', g, { size: 24, b: 'L040' }), ch('L039', 1400, 940, 'timestamp : opaque · unique', r, { size: 24, b: 'L040' }),
    tx('L040', 960, 900, 'Reprise et validation →', { size: 48, c: o }),
  ],
  cues: [{ a: 'L033', s: 'blip' }, { a: 'L036', s: 'error' }, { a: 'L039', s: 'pop' }],
});

// ---------- Scène 6 : reprise et validation ----------
SCENES[6] = mk({
  label: 'REPRISE', color: o, part: 'ANNEXE 1 · REPRISE ET VALIDATION',
  els: [
    bx('L042', 480, 340, 560, 130, 'run.id = 3 · reprise', g, { size: 28, b: 'L043' }),
    bx('L042', 1440, 340, 560, 130, 'run.id = 4 · de zéro', r, { size: 28, b: 'L043' }),
    ch('L042', 960, 520, 'restart(executionId) : paramètres repris tout seuls', y, { size: 26, b: 'L043' }),
    code('L043', 100, 220, 1050, 220, 'JobConfig.java', [
      ['L043', 'new DefaultJobParametersValidator(', w],
      ['L043', '    new String[] {"customerId"},', w],
      ['L043', '    new String[] {"format"});   // run.id oublié', r],
    ], { size: 24, accent: o, b: 'L046' }),
    stp('L044', 1540, 330, 'REJETÉ', r, { size: 48, b: 'L045' }),
    ch('L044', 1540, 440, 'run.id absent des clés', r, { size: 26, b: 'L045' }),
    code('L045', 100, 520, 1050, 130, 'JobConfig.java', [['L045', '    new String[] {"format", "run.id"});', g]], { size: 24, accent: g, b: 'L046' }),
    ck('L045', 1540, 380, 1, g, { b: 'L046' }),
    tx('L046', 960, 900, 'La règle →', { size: 52, c: g }),
  ],
  quiz: [{ q: 'L041', a: 'L042', question: 'Ton job a échoué avec run.id = 3. Tu veux le reprendre sans repartir de zéro. Quel run.id utilises-tu ?', choices: ['run.id = 4', 'run.id = 3', 'aucun'], win: 1, answer: 'Le même, 3. Avec 4, tu crées une nouvelle instance et tu repars de zéro. Avec restart sur l\'identifiant d\'exécution, les paramètres sont repris tout seuls.' }],
  cues: [{ a: 'L044', s: 'error' }, { a: 'L045', s: 'success' }],
});

// ---------- Scène 7 : la règle et la clôture ----------
SCENES[7] = mk({
  label: 'LA RÈGLE', color: g, part: 'ANNEXE 1 · CONCLUSION',
  els: [
    cd('L047', 100, 220, 800, 280, 'Identité métier', ['date · client · fichier', '→ paramètre métier (runDate…)', 'la règle du Module 1'], g),
    cd('L048', 1020, 220, 800, 280, 'Aucune identité métier', ['une demande = un travail distinct', '→ RunIdIncrementer', 'startNextInstance'], p),
    ch('L049', 480, 590, 'timestamp identifiant', r, { size: 28 }), cr('L049', 700, 590, 24, r),
    ch('L049', 1380, 590, 'timestamp non identifiant : traçabilité', g, { size: 26 }),
    pl('L050', 380, 700, 1, 'instance = job + params identifiants', g, { size: 28, b: 'L051' }),
    pl('L050', 380, 770, 2, 'incrémenteur : startNextInstance seulement', p, { size: 28, b: 'L051' }),
    pl('L050', 380, 840, 3, 'reprise : on garde le même run.id', o, { size: 28, b: 'L051' }),
    ch('L051', 480, 760, 'Module 1 · paramètres', b, { size: 28, b: 'L052' }), ch('L051', 960, 760, 'Module 2 · lancer un job', b, { size: 28, b: 'L052' }), ch('L051', 1440, 760, 'Module 6 · reprise', b, { size: 28, b: 'L052' }),
    tx('L052', 960, 880, 'Annexe 1 terminée', { size: 64, c: g, glow: true, fam: DISP }),
  ],
  cues: [{ a: 'L047', s: 'pop' }, { a: 'L049', s: 'error' }, { a: 'L050', s: 'success' }, { a: 'L052', s: 'levelup', g: -10 }],
});
