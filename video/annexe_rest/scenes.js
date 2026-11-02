// Annexe REST : Consommer des API dans un batch
'use strict';

const EP = { tag: 'SPRING BATCH // ANNEXE REST' };

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

window.HUD_BRAND = { log: 'SPRING_BATCH_LOG', pied: 'FORMATION · ANNEXE REST' };

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
const P = 'ANNEXE REST · ';

// ---------- Scène 1 : l'accroche et les risques ----------
SCENES[1] = mk({
  label: 'ACCROCHE', color: o, part: P + 'LES RISQUES',
  els: [
    code('L001', 160, 200, 1600, 190, 'terminal', [[{ id: 'L001', w: 'secondes' }, 'GET /accounts   →   30 000 ms', r], [{ id: 'L001', w: 'millisecondes' }, 'GET /accounts   →   30 ms', g]], { size: 30, accent: r, b: 'L002' }),
    tx('L002', 960, 320, '1 000 000 appels', { size: 96, c: r, glow: true, fam: MONO, b: 'L003' }),
    ch('L002', 960, 450, 'même à 30 ms l\'appel : 8 h 20 de pur réseau', o, { size: 30, b: 'L003' }),
    bx('L003', 480, 330, 420, 110, 'writer', b, { b: 'L004' }), ar('L003', 690, 330, 1230, 330, o, { b: 'L004' }), bx('L003', 1440, 330, 420, 110, 'API', o, { b: 'L004' }),
    ch('L003', 960, 470, 'job arrêté à 50 % : l\'API a déjà reçu 500 000 écritures', r, { size: 28, b: 'L004' }),
    ch('L004', 560, 330, 'Module 1 : exposer une API', b, { size: 28, b: 'L005' }), ch('L004', 1360, 330, 'Module 6 : le retry', p, { size: 28, b: 'L005' }),
    tx('L004', 960, 500, 'ici : consommer une API', { size: 58, c: o, b: 'L005' }),
    bx('L005', 330, 330, 340, 110, 'lenteur', o, { b: 'L006' }), bx('L005', 710, 330, 340, 110, 'panne', r, { b: 'L006' }), bx('L005', 1090, 330, 340, 110, 'quotas', y, { b: 'L006' }), bx('L005', 1470, 330, 340, 110, 'transaction', p, { b: 'L006' }),
    tx('L006', 960, 330, 'Consommer une API REST', { size: 84, c: o, glow: true, fam: DISP, b: 'L007' }), tx('L006', 960, 440, 'sans roulette russe', { size: 44, c: d, b: 'L007' }),
    bx('L007', 400, 330, 340, 110, 'reader', b, { b: 'L008' }), bx('L007', 960, 330, 340, 110, 'processor', p, { b: 'L008' }), bx('L007', 1520, 330, 340, 110, 'writer', o, { b: 'L008' }),
    ar('L007', 580, 330, 780, 330, w, { b: 'L008' }), ar('L007', 1140, 330, 1340, 330, w, { b: 'L008' }),
    ch('L007', 960, 480, 'un piège par position', r, { size: 32, b: 'L008' }),
    tx('L008', 960, 860, 'Le socle →', { size: 52, c: o }),
  ],
  cues: [{ a: 'L001', s: 'error' }, { a: 'L003', s: 'error' }, { a: 'L005', s: 'pop' }, { a: 'L007', s: 'blip' }],
});

// ---------- Scène 2 : le client HTTP ----------
SCENES[2] = mk({
  label: 'LE CLIENT HTTP', color: b, part: P + 'LE SOCLE',
  els: [
    bx('L009', 480, 300, 420, 110, 'RestClient', g, { b: 'L010' }), bx('L009', 960, 300, 420, 110, 'RestTemplate', d, { lit: 0, b: 'L010' }), bx('L009', 1440, 300, 420, 110, 'WebClient', d, { lit: 0, b: 'L010' }),
    ch('L009', 480, 420, 'synchrone · recommandé', g, { size: 26, b: 'L010' }), ch('L009', 960, 420, 'maintenance', d, { size: 26, b: 'L010' }), ch('L009', 1440, 420, 'réactif : inutile ici', d, { size: 24, b: 'L010' }),
    code('L010', 100, 200, 1720, 220, 'RestClientConfig.java', [
      ['L010', '@Bean', p],
      ['L010', 'RestClient accountClient(RestClient.Builder builder) {', w],
      ['L010', '    return builder.baseUrl("https://api.example.com").build();', g],
      ['L010', '}', w]], { size: 26, accent: b, b: 'L011' }),
    code('L011', 100, 200, 1720, 140, 'terminal', [['L011', 'GET /accounts?page=7 ... en attente depuis 4 h 12', r]], { size: 28, accent: r, b: 'L012' }),
    ch('L011', 960, 420, 'aucun délai : le step reste bloqué', r, { size: 32, b: 'L012' }),
    code('L012', 100, 200, 1720, 170, 'application.properties', [['L012', 'spring.http.client.connect-timeout=2s', g], ['L012', 'spring.http.client.read-timeout=5s', g]], { size: 28, accent: g, b: 'L014' }),
    ln('L013', 300, 560, 1620, 560, d, { lw: 4, b: 'L014' }),
    ch('L013', 480, 490, 'latence normale : 30 ms', g, { size: 26, b: 'L014' }), ch('L013', 960, 490, 'marge', o, { size: 26, b: 'L014' }), ch('L013', 1400, 490, 'délai : 5 s', b, { size: 26, b: 'L014' }),
    code('L014', 100, 200, 1100, 250, 'AccountApi.java', [
      ['L014', '@HttpExchange("/accounts")', p],
      ['L014', 'interface AccountApi {', w],
      ['L015', '    @GetExchange   AccountPage list(int page, int size);', p],
      ['L015', '    @PostExchange  void send(@RequestBody Payment p);', p],
      ['L015', '}', w]], { size: 22, accent: p }),
    code('L015', 100, 500, 1720, 150, 'création', [['L015', 'HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient))', w], ['L015', '    .build().createClient(AccountApi.class);', g]], { size: 22, accent: g }),
    bx('L016', 1560, 260, 400, 80, 'AccountApi (bean)', p, { size: 24 }),
    ch('L016', 1380, 380, 'reader', b, { size: 24 }), ch('L016', 1560, 380, 'processor', p, { size: 24 }), ch('L016', 1740, 380, 'writer', o, { size: 24 }),
    tx('L017', 960, 990, 'Classer les erreurs →', { size: 44, c: b }),
  ],
  cues: [{ a: 'L009', s: 'pop' }, { a: 'L011', s: 'error' }, { a: 'L012', s: 'success' }, { a: 'L014', s: 'blip' }],
});

// ---------- Scène 3 : classer les erreurs ----------
SCENES[3] = mk({
  label: 'ERREURS ET RETRY', color: y, part: P + 'LE SOCLE',
  els: [
    tb('L018', 100, 200, [720, 440, 560], ['signal', 'nature', 'décision'], [
      row('L018', ['5xx · HttpServerErrorException', 'transitoire', 'réessayer'], g),
      row('L019', ['réseau · ResourceAccessException', 'transitoire', 'réessayer'], g),
      row('L020', ['4xx · HttpClientErrorException', 'permanente', 'ne pas réessayer'], r),
      row('L021', ['408 et 429', 'transitoires', 'réessayer'], o),
    ], { size: 26, rh: 62, b: 'L023' }),
    ch('L022', 960, 620, '5xx et réseau : on réessaie · 4xx : non, sauf 408 et 429', y, { size: 32, b: 'L023' }),
    code('L023', 100, 200, 1720, 250, 'Retries.java', [
      ['L023', 'RetryPolicy policy = RetryPolicy.builder()', w],
      ['L023', '    .maxRetries(3)', w],
      ['L023', '    .delay(Duration.ofMillis(500)).multiplier(2.0).jitter(Duration.ofMillis(100))', w],
      ['L024', '    .predicate(Retries::isTransient)', p],
      ['L024', '    .build();', w]], { size: 23, accent: p, b: 'L026' }),
    code('L025', 100, 500, 1720, 170, 'appel', [
      ['L025', 'RetryTemplate retry = new RetryTemplate(policy);', w],
      ['L025', 'Account a = retry.execute(() -> api.find(id));   // RetryException si épuisé', g]], { size: 23, accent: g, b: 'L026' }),
    ch('L027', 960, 330, '404 : pas de retry → skip ou échec du step', g, { size: 38, b: 'L028' }),
    bx('L028', 480, 330, 560, 110, 'chunk de 100 rejoué', r, { size: 26, b: 'L030' }), ar('L028', 770, 330, 1170, 330, r, { b: 'L030' }), ch('L028', 1440, 330, '100 appels refaits', r, { size: 30, b: 'L030' }),
    bx('L029', 480, 560, 560, 110, 'appel local rejoué', g, { size: 26, b: 'L030' }), ar('L029', 770, 560, 1170, 560, g, { b: 'L030' }), ch('L029', 1440, 560, '1 seul appel refait', g, { size: 30, b: 'L030' }),
    tx('L030', 960, 900, 'En entrée →', { size: 48, c: b }),
  ],
  quiz: [{ q: 'L026', a: 'L027', question: "L'API répond 404 pour une ligne. Que fait ton batch ?", choices: ['il réessaie 3 fois', 'il ne réessaie pas', 'il attend'], win: 1, answer: 'Il ne réessaie pas : un 404 ne se corrige pas en attendant. Tu choisis entre skip de la ligne et échec du step.' }],
  cues: [{ a: 'L018', s: 'pop' }, { a: 'L020', s: 'error' }, { a: 'L025', s: 'success' }],
});

// ---------- Scène 4 : l'API en entrée ----------
SCENES[4] = mk({
  label: 'EN ENTRÉE', color: b, part: P + 'LE READER',
  els: [
    bx('L031', 480, 300, 300, 110, 'page 0', b, { b: 'L033' }), bx('L031', 960, 300, 300, 110, 'page 1', b, { b: 'L033' }), bx('L031', 1440, 300, 300, 110, 'page 2', b, { b: 'L033' }),
    ch('L031', 960, 420, 'GET /accounts?page=0&size=500', d, { size: 26, b: 'L033' }),
    ch('L032', 960, 540, 'mémoire limitée : on lit page après page', o, { size: 30, b: 'L033' }),
    code('L033', 100, 200, 1720, 300, 'AccountApiReader.java', [
      ['L033', 'public class AccountApiReader extends AbstractPaginatedDataItemReader<Account> {', w],
      ['L034', '    @Override protected Iterator<Account> doPageRead() {', w],
      ['L034', '        return api.list(page, pageSize).items().iterator();', g],
      ['L034', '    }', w],
      ['L036', '    // constructeur : setName("accountApiReader"); setPageSize(500);', p],
      ['L036', '}', w]], { size: 23, accent: b, b: 'L041' }),
    ch('L035', 960, 560, 'page vide → itérateur vide → fin de lecture', g, { size: 30, b: 'L037' }),
    ch('L037', 960, 640, 'ExecutionContext : accountApiReader.read.count = 3400', p, { size: 26, b: 'L038' }),
    ch('L038', 960, 720, 'restart : 3400 / 500 → page 6, on saute 400 éléments', o, { size: 26, b: 'L039' }),
    ch('L040', 960, 330, 'doublons ou trous : les éléments glissent', r, { size: 38, b: 'L041' }),
    cd('L041', 100, 200, 540, 300, '1 · Tri stable + filtre figé', ['sort=id', 'createdBefore = heure de lancement'], g, { b: 'L044' }),
    cd('L042', 690, 200, 540, 300, '2 · Curseur', ['afterId=1250&limit=500', 'pas de glissement'], b, { b: 'L044' }),
    cd('L043', 1280, 200, 540, 300, '3 · Staging', ['step 1 : copie en table', 'step 2 : lecture locale'], p, { b: 'L044' }),
    bx('L044', 560, 300, 640, 100, 'ItemReaderAdapter', r, { b: 'L046' }), ch('L044', 560, 400, 'pas un ItemStream : aucune position', r, { size: 24, b: 'L046' }),
    ch('L045', 1400, 300, 'restart : repart de zéro', r, { size: 32, b: 'L046' }),
    bx('L046', 560, 640, 360, 100, 'page = 500', b, { b: 'L047' }), tx('L046', 960, 640, '=', { size: 60, c: w, b: 'L047' }), bx('L046', 1360, 640, 360, 100, 'chunk = 500', g, { b: 'L047' }),
    tx('L047', 960, 900, 'Dans le processor →', { size: 48, c: p }),
  ],
  quiz: [{ q: 'L039', a: 'L040', question: 'Pendant que ton job lit, quelqu\'un crée des comptes sur la première page. Que se passe-t-il ?', choices: ['rien', 'doublons ou trous', 'une erreur'], win: 1, answer: 'Des doublons ou des trous : les éléments glissent d\'une page à l\'autre. Une pagination par numéro de page n\'est pas stable si les données bougent.' }],
  cues: [{ a: 'L033', s: 'blip' }, { a: 'L037', s: 'pop' }, { a: 'L044', s: 'error' }],
});

// ---------- Scène 5 : l'API dans le processor ----------
SCENES[5] = mk({
  label: 'PROCESSOR', color: p, part: P + 'LE PROCESSOR',
  els: [
    bx('L048', 360, 330, 300, 100, 'item', b, { b: 'L049' }), ar('L048', 510, 330, 720, 330, w, { b: 'L049' }), bx('L048', 900, 330, 360, 100, 'processor', p, { b: 'L049' }), ar('L048', 1080, 330, 1290, 330, o, { b: 'L049' }), bx('L048', 1460, 330, 300, 100, 'API', o, { b: 'L049' }),
    tx('L049', 960, 330, '100 000 × 50 ms = 5 000 s', { size: 72, c: r, glow: true, fam: MONO, b: 'L050' }), ch('L049', 960, 450, "plus d'1 h 20", r, { size: 34, b: 'L050' }),
    bx('L050', 560, 330, 520, 110, '100 000 appels', r, { size: 30, b: 'L051' }), bx('L050', 1360, 330, 520, 110, '500 valeurs distinctes', g, { size: 26, b: 'L051' }), ar('L050', 830, 330, 1090, 330, o, { dash: true, b: 'L051' }), ch('L050', 960, 470, 'le piège N+1', r, { size: 34, b: 'L051' }),
    cd('L051', 100, 200, 540, 300, '1 · Cache', ['computeIfAbsent(code, api::rate)', '500 valeurs : 500 appels'], g, { b: 'L055' }),
    cd('L053', 690, 200, 540, 300, '2 · Préchargement', ['1 appel de liste au début du step', 'processor : recherche en mémoire'], b, { b: 'L055' }),
    cd('L054', 1280, 200, 540, 300, '3 · Endpoint en lot', ['100 identifiants par appel', "au lieu d'un seul"], p, { b: 'L055' }),
    ch('L052', 360, 560, 'le cache dure le temps du job', g, { size: 24, b: 'L055' }),
    ch('L056', 960, 330, '≈ 190 appels : 90 + 100', o, { size: 48, b: 'L057' }),
    bx('L057', 560, 330, 420, 110, 'GET : rejouable', g, { size: 26, b: 'L058' }), bx('L057', 1360, 330, 420, 110, 'POST : envoyé deux fois', r, { size: 24, b: 'L058' }),
    stp('L058', 960, 360, 'LECTURE SEULE', g, { size: 60, b: 'L059' }), tx('L058', 960, 480, "l'écriture est le travail du writer", { size: 34, c: w, b: 'L059' }),
    code('L059', 100, 300, 1720, 150, 'journal', [['L059', 'ERROR RateProcessor - compte 1250 : API 404 Not Found', r]], { size: 28, accent: r }),
    tx('L060', 960, 900, 'En sortie →', { size: 48, c: o }),
  ],
  quiz: [{ q: 'L055', a: 'L056', question: 'Un chunk de 100 éléments échoue au 90e. Le retry du step rejoue le chunk. Combien d\'appels API en tout ?', choices: ['100', '190', '10'], win: 1, answer: 'Environ 190 : 90 à la première tentative, 100 au rejeu. Le processor est rappelé : l\'appel doit être sans effet de bord.' }],
  cues: [{ a: 'L049', s: 'error' }, { a: 'L051', s: 'success' }, { a: 'L057', s: 'pop' }, { a: 'L058', s: 'success' }],
});

// ---------- Scène 6 : l'API en sortie ----------
SCENES[6] = mk({
  label: 'EN SORTIE', color: o, part: P + 'LE WRITER',
  els: [
    bx('L061', 480, 330, 420, 110, 'writer', o, { b: 'L062' }), ar('L061', 690, 330, 1170, 330, o, { b: 'L062' }), bx('L061', 1440, 330, 420, 110, 'API', r, { b: 'L062' }),
    ch('L061', 960, 470, 'le cas le plus dangereux', r, { size: 34, b: 'L062' }),
    db('L062', 400, 340, 180, 140, g, '', { b: 'L064' }), ch('L062', 400, 470, 'transaction : couvre la base', g, { size: 26, b: 'L064' }),
    bx('L063', 1400, 340, 420, 110, 'API', r, { b: 'L064' }), ch('L063', 1400, 470, 'hors transaction : pas de rollback', r, { size: 26, b: 'L064' }),
    pl('L064', 300, 330, 1, '50 éléments envoyés à l\'API', o, { size: 28, b: 'L067' }),
    pl({ id: 'L064', w: 'commit' }, 300, 410, 2, 'commit en base : ÉCHEC', r, { size: 28, b: 'L067' }),
    pl({ id: 'L064', w: 'annulé' }, 300, 490, 3, 'chunk annulé, puis rejoué', o, { size: 28, b: 'L067' }),
    stp('L065', 1400, 420, '50 DOUBLONS', r, { size: 60, b: 'L067' }),
    ch('L066', 960, 660, 'restart : le dernier chunk est renvoyé', r, { size: 30, b: 'L067' }),
    ch('L068', 960, 330, 'UUID aléatoire ≠ clé stable', r, { size: 44, b: 'L069' }),
    code('L069', 100, 200, 1720, 190, 'PaymentWriter.java', [['L069', 'String key = "payment-" + p.id() + "-" + runDate;', g], ['L069', 'api.send(p, key);   // en-tête Idempotency-Key', w]], { size: 26, accent: g, b: 'L071' }),
    bx('L070', 480, 560, 340, 100, 'envoi 1 · clé K', b, { size: 24, b: 'L071' }), bx('L070', 960, 560, 340, 100, 'envoi 2 · clé K', b, { size: 24, b: 'L071' }), bx('L070', 1440, 560, 360, 100, "résultat d'origine", g, { size: 22, b: 'L071' }),
    ar('L070', 650, 560, 790, 560, w, { b: 'L071' }), ar('L070', 1130, 560, 1250, 560, g, { b: 'L071' }),
    bx('L071', 560, 330, 380, 110, 'PUT /accounts/{id}', g, { size: 24, b: 'L072' }), bx('L071', 1360, 330, 380, 110, 'POST /accounts', r, { size: 24, b: 'L072' }),
    ch('L071', 560, 430, 'idempotent', g, { size: 26, b: 'L072' }), ch('L071', 1360, 430, 'doublon au rejeu', r, { size: 26, b: 'L072' }),
    bx('L072', 400, 330, 420, 110, 'step 1 : écrit outbox', p, { size: 24, b: 'L074' }), ar('L072', 620, 330, 820, 330, w, { b: 'L074' }),
    bx('L072', 1000, 330, 380, 110, 'table EN ATTENTE', g, { size: 22, b: 'L074' }), ar('L072', 1200, 330, 1400, 330, w, { b: 'L074' }), bx('L072', 1560, 330, 320, 110, 'step 2 : envoie', o, { size: 24, b: 'L074' }),
    ch('L073', 1000, 470, 'statut ENVOYÉ : rejeu sans risque', g, { size: 28, b: 'L074' }),
    code('L074', 100, 200, 1720, 260, 'ApiPaymentWriter.java', [
      ['L074', 'public class ApiPaymentWriter implements ItemWriter<Payment> {', w],
      ['L074', '    @Override public void write(Chunk<? extends Payment> chunk) {', w],
      ['L075', '        api.sendAll(chunk.getItems());   // 1 appel pour le chunk', g],
      ['L075', '    }', w],
      ['L075', '}', w]], { size: 23, accent: o }),
    ch('L076', 960, 560, 'ItemWriterAdapter : 1 appel par élément', o, { size: 28, b: 'L077' }),
    ch('L077', 960, 640, 'réponse partielle : 98 acceptés · 2 refusés', y, { size: 30 }),
  ],
  quiz: [{ q: 'L067', a: 'L068', question: "Tu génères un UUID aléatoire par appel dans l'en-tête Idempotency-Key. Ça évite les doublons ?", choices: ['oui', 'non', 'seulement en PUT'], win: 1, answer: "Non : l'UUID change à chaque rejeu, l'API voit une nouvelle demande. La clé doit être stable : opération, identifiant, date de traitement." }],
  cues: [{ a: 'L063', s: 'error' }, { a: 'L065', s: 'error' }, { a: 'L069', s: 'success' }, { a: 'L072', s: 'pop' }],
});

// ---------- Scène 7 : débit et quotas ----------
SCENES[7] = mk({
  label: 'DÉBIT ET QUOTAS', color: y, part: P + 'LE DÉBIT',
  els: [
    stp('L078', 960, 330, '429', r, { size: 120, b: 'L079' }), ch('L078', 960, 470, 'trop de requêtes', r, { size: 34, b: 'L079' }),
    code('L079', 100, 200, 1720, 150, 'réponse HTTP', [['L079', 'HTTP/1.1 429 Too Many Requests', r], ['L079', 'Retry-After: 30', y]], { size: 28, accent: y, b: 'L080' }),
    bx('L080', 360, 330, 260, 90, '1 s', b, { size: 36, b: 'L081' }), ar('L080', 490, 330, 630, 330, w, { b: 'L081' }), bx('L080', 760, 330, 260, 90, '2 s', b, { size: 36, b: 'L081' }), ar('L080', 890, 330, 1030, 330, w, { b: 'L081' }), bx('L080', 1160, 330, 260, 90, '4 s', b, { size: 36, b: 'L081' }),
    ch('L080', 760, 450, 'exponentiel + jitter', y, { size: 30, b: 'L081' }),
    bx('L081', 360, 330, 240, 90, 'thread 1', b, { size: 24, b: 'L082' }), bx('L081', 360, 440, 240, 90, 'thread 2', b, { size: 24, b: 'L082' }), bx('L081', 360, 550, 240, 90, 'thread 3', b, { size: 24, b: 'L082' }),
    ar('L081', 480, 330, 810, 420, w, { b: 'L082' }), ar('L081', 480, 440, 810, 440, w, { b: 'L082' }), ar('L081', 480, 550, 810, 460, w, { b: 'L082' }),
    bx('L081', 1000, 440, 380, 110, 'API : 1 quota', r, { b: 'L082' }), ch('L081', 1560, 440, 'quota partagé', r, { size: 30, b: 'L082' }),
    bx('L082', 560, 440, 420, 110, 'limiteur global', g, { size: 28, b: 'L083' }), ar('L082', 780, 440, 1000, 440, g, { b: 'L083' }), ch('L082', 1360, 440, '80 % du quota annoncé', g, { size: 30, b: 'L083' }),
    ch('L083', 560, 440, 'le batch consomme 100 % du quota', r, { size: 30, b: 'L084' }), ch('L083', 1360, 440, 'les utilisateurs tombent', r, { size: 30, b: 'L084' }),
    code('L084', 100, 300, 1720, 150, 'application.properties', [['L084', 'batch.api.requests-per-second=40', g]], { size: 28, accent: g }),
    tx('L085', 960, 900, 'Tester et surveiller →', { size: 48, c: b }),
  ],
  cues: [{ a: 'L078', s: 'error' }, { a: 'L082', s: 'success' }, { a: 'L083', s: 'pop' }],
});

// ---------- Scène 8 : tester et surveiller ----------
SCENES[8] = mk({
  label: 'TESTS ET SUPERVISION', color: b, part: P + 'TESTER ET SURVEILLER',
  els: [
    bx('L086', 480, 330, 420, 110, 'test', g, { b: 'L087' }), ar('L086', 690, 330, 1170, 330, w, { b: 'L087' }), bx('L086', 1440, 330, 420, 110, 'API réelle', r, { b: 'L087' }), cr('L086', 1700, 330, 26, r, { b: 'L087' }),
    ch('L086', 960, 470, 'lente · instable · facturée', r, { size: 30, b: 'L087' }),
    code('L087', 100, 200, 1720, 190, 'AccountReaderTest.java', [['L087', 'RestClient.Builder builder = RestClient.builder();', w], ['L087', 'MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();', g]], { size: 24, accent: g, b: 'L091' }),
    tb('L088', 100, 430, [380, 700, 640], ['scénario', 'réponse simulée', 'attendu'], [
      row('L088', ['1 · panne transitoire', 'withServerError() puis withSuccess()', 'succès après retry'], g),
      row('L089', ['2 · ligne inconnue', 'withStatus(NOT_FOUND)', 'pas de retry · skip'], o),
      row('L090', ['3 · réseau', 'withException(new IOException())', 'retry, puis échec propre'], p),
    ], { size: 24, rh: 58, fam: MONO, b: 'L091' }),
    ch('L091', 960, 330, 'http.client.requests', g, { size: 48, b: 'L092' }), ch('L091', 960, 430, 'builder Spring Boot : appels sortants mesurés', d, { size: 26, b: 'L092' }),
    code('L092', 100, 250, 1720, 150, 'journal', [['L092', 'GET https://api.example.com/accounts?page=7 → 200 (84 ms)', g], ['L092', 'Authorization: ****', d]], { size: 26, accent: g, b: 'L093' }),
    bx('L093', 480, 340, 360, 110, 'appels', b), bx('L093', 960, 340, 360, 110, "taux d'erreur", o), bx('L093', 1440, 340, 360, 110, 'latence', p),
  ],
  cues: [{ a: 'L086', s: 'blip' }, { a: 'L088', s: 'success' }, { a: 'L092', s: 'pop' }],
});

// ---------- Scène 9 : récapitulatif ----------
SCENES[9] = mk({
  label: 'RÉCAPITULATIF', color: g, part: P + 'CONCLUSION',
  els: [
    tb('L094', 100, 200, [380, 1340], ['position', 'règles'], [
      row('L095', ['en entrée', 'reader paginé · tri stable · staging'], b),
      row('L096', ['processor', 'lecture seule · cache · préchargement'], p),
      row('L097', ['en sortie', 'clé stable · outbox · appel par chunk'], o),
      row('L098', ['partout', 'délais · retry limité aux transitoires · débit sous le quota'], g),
    ], { size: 28, rh: 70 }),
    pl('L099', 300, 640, 1, "pas de délai d'attente", r, { size: 26, b: 'L100' }), pl('L099', 300, 700, 2, 'UUID aléatoire comme clé', r, { size: 26, b: 'L100' }),
    pl('L099', 300, 760, 3, 'POST dans le processor', r, { size: 26, b: 'L100' }), pl('L099', 300, 820, 4, 'pagination instable', r, { size: 26, b: 'L100' }),
    pl('L099', 300, 880, 5, 'ItemReaderAdapter sans position', r, { size: 26, b: 'L100' }),
    ch('L100', 560, 680, 'Modules 3 · 4 · 6', b, { size: 28, b: 'L101' }), ch('L100', 1360, 680, 'Module 8 : supervision', b, { size: 28, b: 'L101' }),
    tx('L101', 960, 740, "si l'API tombe à la moitié, je reprends sans doublon ?", { size: 40, c: y, b: 'L102' }),
    tx('L102', 960, 900, 'Annexe REST terminée', { size: 64, c: g, glow: true, fam: DISP }),
  ],
  cues: [{ a: 'L095', s: 'pop' }, { a: 'L099', s: 'error' }, { a: 'L102', s: 'levelup', g: -10 }],
});
