// Miniatures de la formation Spring Batch (1920x1080, YouTube réduit en 1280x720).
// À coller dans motions/tools/thumbs/thumbs.js, dans l'objet THUMBS (avant la ligne « const i = new URLSearchParams »),
// puis : node tools/shoot_thumbs.mjs tools/thumbs/out sb_m1a sb_m1b
function sbHead(mod) {
  txt('FORMATION', 130, 78, { size: 44, weight: 900, fam: MONO, color: C.dim, align: 'left', track: 10 });
  txt('SPRING BATCH', 130, 178, { size: 140, weight: 900, fam: DISP, color: C.green, align: 'left', glowC: 'rgba(56,245,166,0.4)', blur: 50, track: 2 });
  panel(1380, 40, 450, 200, { r: 36, stroke: C.orange, fill: hexA(C.orange, 0.16), glowC: hexA(C.orange, 0.5), blur: 50, lw: 8 });
  txt('MODULE ' + mod, 1605, 142, { size: 80, weight: 900, fam: DISP, color: C.orange, glowC: 'rgba(255,122,61,0.5)', blur: 40 });
}
THUMBS.sb_m1a = function () {
  bg(C.red, 0.2);
  sbHead(1);
  const cx = 400, cy = 520, R = 170;
  circle(cx, cy, R, 'rgba(10,14,22,0.95)'); ring(cx, cy, R, C.red, 14);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(cx + Math.sin(a) * (R - 30), cy - Math.cos(a) * (R - 30), cx + Math.sin(a) * (R - 10), cy - Math.cos(a) * (R - 10), hexA(C.red, 0.8), 7); }
  line(cx, cy, cx + Math.sin(3.2 / 12 * 6.283) * R * 0.5, cy - Math.cos(3.2 / 12 * 6.283) * R * 0.5, C.red, 15);
  line(cx, cy, cx + Math.sin(0.2 * 6.283) * R * 0.78, cy - Math.cos(0.2 * 6.283) * R * 0.78, C.red, 9);
  circle(cx, cy, 13, C.red);
  txt('3 H 12', cx, cy + R + 85, { size: 120, weight: 900, fam: DISP, color: C.red, glowC: 'rgba(255,58,82,0.5)', blur: 50, track: 2 });
  const bx0 = 760, bw = 1000, by = 400;
  panel(bx0, by - 36, bw, 72, { r: 36, stroke: 'rgba(255,255,255,0.25)', fill: 'rgba(14,17,26,0.9)' });
  ctx.fillStyle = hexA(C.red, 0.9); rrect(bx0 + 6, by - 30, (bw - 12) * 0.62, 60, 30); ctx.fill();
  txt('62 %', bx0 + bw * 0.62 - 60, by + 2, { size: 40, weight: 900, fam: MONO, color: C.text });
  txt('✗', bx0 + bw * 0.62 + 50, by + 2, { size: 70, weight: 900, fam: DISP, color: C.red, glowC: C.red, blur: 30 });
  txt('job de nuit : arrêté', bx0, by - 70, { size: 32, weight: 700, fam: MONO, color: C.dim, align: 'left' });
  dbIcon(900, 600, 190, 150, C.cyan, { bands: 2 }); txt('PostgreSQL', 900, 730, { size: 34, weight: 800, fam: MONO, color: C.cyan });
  line(1010, 600, 1210, 600, C.green, 8); chip('REPRISE', 1400, 600, { size: 50, color: C.green, padX: 28, padY: 14 });
  txt('REPRENDRE SANS TOUT REJOUER', CXt, 905, { size: 84, weight: 900, fam: DISP, color: C.text, track: 1 });
  txt('Spring Boot 4 · Spring Batch 6 · PostgreSQL', CXt, 1015, { size: 40, weight: 700, fam: MONO, color: C.cyan });
};
THUMBS.sb_m1b = function () {
  bg(C.cyan, 0.2);
  txt('FORMATION', CXt, 110, { size: 70, weight: 900, fam: MONO, color: C.dim, track: 18 });
  txt('SPRING BATCH', CXt, 290, { size: 200, weight: 900, fam: DISP, color: C.green, glowC: 'rgba(56,245,166,0.45)', blur: 70, track: 3 });
  panel(CXt - 360, 400, 720, 190, { r: 40, stroke: C.orange, fill: hexA(C.orange, 0.16), glowC: hexA(C.orange, 0.55), blur: 60, lw: 9 });
  txt('MODULE 1', CXt, 497, { size: 112, weight: 900, fam: DISP, color: C.orange, glowC: 'rgba(255,122,61,0.5)', blur: 40 });
  txt('FONDATIONS DE PRODUCTION', CXt, 680, { size: 66, weight: 900, fam: DISP, color: C.cyan, track: 3 });
  const items = [['JobInstance', C.green], ['JobExecution', C.orange], ['ExecutionContext', C.purple], ['JobRepository', C.red]];
  items.forEach(([s, c], i) => { const x = 330 + i * 420; panel(x - 190, 770, 380, 110, { r: 24, stroke: c, fill: hexA(c, 0.14), glowC: hexA(c, 0.35), blur: 40, lw: 5 }); txt(s, x, 825, { size: s.length > 14 ? 30 : 38, weight: 900, fam: MONO, color: c }); });
  txt('Spring Boot 4 · Spring Batch 6 · PostgreSQL 16', CXt, 985, { size: 44, weight: 700, fam: MONO, color: C.text });
};

// ---------- Série « fiche » : modules 4 à 8 et Annexe 1 (même gabarit que la planche des modules 1 à 3B) ----------
function sbLeaf(x, y, R) {
  circle(x, y, R, '#3ddc4b'); ring(x, y, R, 'rgba(255,255,255,0.35)', 5);
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.moveTo(-R * 0.55, R * 0.45); ctx.bezierCurveTo(-R * 0.75, -R * 0.2, -R * 0.1, -R * 0.75, R * 0.6, -R * 0.55);
  ctx.bezierCurveTo(R * 0.75, -R * 0.1, R * 0.35, R * 0.55, -R * 0.55, R * 0.45); ctx.fill(); ctx.restore();
}
function sbCheck(x, y, c) { panel(x - 22, y - 22, 44, 44, { r: 10, stroke: c, fill: hexA(c, 0.25), lw: 3 }); ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x - 2, y + 10); ctx.lineTo(x + 13, y - 10); ctx.stroke(); ctx.restore(); }
function sbBox(x, y, w_, h_, s, c, size = 40) { panel(x - w_ / 2, y - h_ / 2, w_, h_, { r: 18, stroke: c, fill: hexA(c, 0.14), glowC: hexA(c, 0.35), blur: 30, lw: 5 }); txt(s, x, y + 2, { size, weight: 900, fam: MONO, color: c }); }
function sbArrow(x1, y1, x2, y2, c) { line(x1, y1, x2, y2, c, 8); const a = Math.atan2(y2 - y1, x2 - x1); ctx.save(); ctx.translate(x2, y2); ctx.rotate(a); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-18, -14); ctx.lineTo(-18, 14); ctx.fill(); ctx.restore(); }
function sbGear(x, y, R, c) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = hexA(c, 0.85); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a0 = i / 16 * 6.283, a1 = (i + 0.5) / 16 * 6.283, r0 = i % 2 ? R * 0.82 : R; ctx.lineTo(Math.cos(a0) * r0, Math.sin(a0) * r0); ctx.lineTo(Math.cos(a1) * r0, Math.sin(a1) * r0); } ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 0, R * 0.38, 0, 6.283); ctx.fill(); ctx.restore(); }
function sbFiche(o) {
  bg(o.tint, 0.2);
  txt('FORMATION', CXt, 60, { size: 40, weight: 700, fam: MONO, color: C.text, track: 14 });
  line(430, 60, 700, 60, 'rgba(255,255,255,0.4)', 3); line(1220, 60, 1490, 60, 'rgba(255,255,255,0.4)', 3);
  sbLeaf(230, 200, 105);
  txt('SPRING', 760, 205, { size: 150, weight: 900, fam: DISP, color: C.text, glowC: 'rgba(255,255,255,0.25)', blur: 40 });
  txt('BATCH', 1370, 205, { size: 150, weight: 900, fam: DISP, color: C.green, glowC: 'rgba(56,245,166,0.45)', blur: 50 });
  panel(CXt - 330, 330, 660, 130, { r: 34, stroke: o.badge, fill: hexA(o.badge, 0.9), glowC: hexA(o.badge, 0.6), blur: 50, lw: 4 });
  txt(o.mod, CXt, 398, { size: o.modSize || 86, weight: 900, fam: DISP, color: '#0a0d14' });
  txt(o.t1, 1000, 590, { size: 68, weight: 900, fam: DISP, color: C.text, glowC: 'rgba(255,255,255,0.2)', blur: 30 });
  txt(o.t2, 1000, 700, { size: 76, weight: 900, fam: DISP, color: o.accent, glowC: hexA(o.accent, 0.5), blur: 40 });
  o.items.forEach((s, i) => { const y = 575 + i * 74; sbCheck(1500, y, C.green); txt(s, 1542, y + 2, { size: 38, weight: 800, fam: DISP, color: C.text, align: 'left' }); });
  line(50, 1020, 250, 1020, hexA(C.green, 0.8), 4); line(1670, 1020, 1870, 1020, hexA(C.green, 0.8), 4);
  txt('Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16', CXt, 1022, { size: 36, weight: 700, fam: MONO, color: C.text });
  ctx.save(); ctx.translate(10, 700 * 0.42); ctx.scale(0.58, 0.58); o.draw(); ctx.restore();
}
THUMBS.sb_m4 = () => sbFiche({ tint: C.cyan, badge: C.cyan, accent: C.green, mod: 'MODULE 4', t1: 'Les Processors :', t2: 'Transformer & Valider', items: ['Transformer', 'Valider', 'Filtrer', 'Chaîner'],
  draw() { sbBox(190, 640, 220, 100, 'CSV', C.orange); sbArrow(310, 640, 400, 640, C.text); sbGear(480, 640, 70, C.green); sbArrow(560, 640, 640, 640, C.text); sbBox(740, 640, 150, 100, 'DTO', C.cyan, 34); sbBox(190, 820, 220, 90, 'filtré', C.red, 34); sbArrow(300, 790, 420, 720, C.red); } });
THUMBS.sb_m5 = () => sbFiche({ tint: C.purple, badge: C.orange, accent: C.purple, mod: 'MODULE 5', t1: 'Maîtriser', t2: 'le Flux des Steps', items: ['Flows', 'Decider', 'Split', 'Statuts'],
  draw() { sbBox(170, 640, 190, 90, 'step A', C.cyan, 34); sbArrow(265, 640, 350, 640, C.text); ctx.save(); ctx.translate(430, 640); ctx.rotate(Math.PI / 4); panel(-50, -50, 100, 100, { r: 12, stroke: C.orange, fill: hexA(C.orange, 0.2), lw: 5 }); ctx.restore(); txt('?', 430, 646, { size: 60, weight: 900, fam: DISP, color: C.orange }); sbArrow(485, 615, 590, 560, C.green); sbArrow(485, 665, 590, 720, C.red); sbBox(680, 560, 170, 80, 'ok', C.green, 34); sbBox(680, 720, 170, 80, 'erreur', C.red, 34); } });
THUMBS.sb_m6 = () => sbFiche({ tint: C.red, badge: C.orange, accent: C.orange, mod: 'MODULE 6', t1: 'La Fiabilité :', t2: 'Skip, Retry, Restart', items: ['Skip', 'Retry', 'Restart', 'Arrêt propre'], modSize: 86,
  draw() { ctx.save(); ctx.translate(300, 700); ctx.fillStyle = hexA(C.green, 0.22); ctx.strokeStyle = C.green; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(120, -105); ctx.lineTo(105, 50); ctx.quadraticCurveTo(60, 125, 0, 155); ctx.quadraticCurveTo(-60, 125, -105, 50); ctx.lineTo(-120, -105); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = C.green; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-12, 40); ctx.lineTo(55, -45); ctx.stroke(); ctx.restore(); ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(300, 700, 215, -0.6, 3.6); ctx.stroke(); ctx.restore(); sbArrow(214, 553, 190, 590, C.orange); } });
THUMBS.sb_m7 = () => sbFiche({ tint: C.green, badge: C.green, accent: C.cyan, mod: 'MODULE 7', t1: 'Passer', t2: "à l'Échelle", items: ['Multi-thread', 'Partitioning', 'SKIP LOCKED', 'Mesurer'],
  draw() { sbBox(170, 640, 190, 90, 'master', C.orange, 34); [0, 1, 2].forEach(i => { const y = 540 + i * 100; sbArrow(270, 640, 400, y, C.text); sbBox(500, y, 190, 70, 'worker ' + (i + 1), C.cyan, 28); sbArrow(600, y, 690, y, C.text); }); dbIcon(790, 640, 120, 150, C.cyan, { bands: 2 }); } });
THUMBS.sb_m8 = () => sbFiche({ tint: C.orange, badge: C.orange, accent: C.orange, mod: 'MODULE 8', t1: 'Production,', t2: 'Monitoring & Cloud', items: ['Tests', 'Métriques', 'Kubernetes', 'Data Flow'],
  draw() { [[90, 0.55, C.green], [180, 0.8, C.orange], [270, 0.4, C.cyan]].forEach(([x, v, c]) => { panel(x, 560, 70, 240, { r: 12, stroke: 'rgba(255,255,255,0.25)', fill: 'rgba(14,17,26,0.9)' }); ctx.fillStyle = hexA(c, 0.9); rrect(x + 6, 560 + 234 - 228 * v, 58, 228 * v, 8); ctx.fill(); }); ctx.save(); ctx.translate(560, 680); ctx.strokeStyle = C.cyan; ctx.lineWidth = 10; ctx.fillStyle = hexA(C.cyan, 0.15); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 - 1.5708; ctx.lineTo(Math.cos(a) * 130, Math.sin(a) * 130); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); txt('K8s', 560, 690, { size: 70, weight: 900, fam: DISP, color: C.cyan }); } });
THUMBS.sb_a1 = () => sbFiche({ tint: C.purple, badge: C.purple, accent: C.purple, mod: 'ANNEXE 1', t1: 'Paramètres de Job', t2: '& RunIdIncrementer', items: ['run.id', 'JOB_KEY', 'Reprise', 'Piège timestamp'], modSize: 86,
  draw() { [1, 2, 3].forEach((n, i) => sbBox(170 + i * 190, 600, 160, 100, 'run.id=' + n, C.purple, 24)); sbArrow(255, 700, 255, 760, C.text); sbBox(250, 830, 380, 90, 'job_key (MD5)', C.green, 30); sbBox(640, 830, 190, 90, 'ts ✗', C.red, 40); } });
