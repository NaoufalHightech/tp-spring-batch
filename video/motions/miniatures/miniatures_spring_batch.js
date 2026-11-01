// Miniatures de la formation Spring Batch (1920x1080, YouTube réduit en 1280x720).
// À coller dans motions/tools/thumbs/thumbs.js, dans l'objet THUMBS (avant la ligne « const i = new URLSearchParams »),
// puis : node tools/shoot_thumbs.mjs tools/thumbs/out sb_m1a sb_m1b
THUMBS.sb_m1a = function () {
  bg(C.red, 0.2);
  chip('SPRING BATCH · MODULE 1', 90, 70, { size: 30, color: C.orange, align: 'left', padX: 18 });
  // horloge 03:12
  const cx = 470, cy = 400, R = 210;
  circle(cx, cy, R, 'rgba(10,14,22,0.95)'); ring(cx, cy, R, C.red, 16);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(cx + Math.sin(a) * (R - 36), cy - Math.cos(a) * (R - 36), cx + Math.sin(a) * (R - 12), cy - Math.cos(a) * (R - 12), hexA(C.red, 0.8), 8); }
  line(cx, cy, cx + Math.sin(3.2 / 12 * 6.283) * R * 0.5, cy - Math.cos(3.2 / 12 * 6.283) * R * 0.5, C.red, 18);
  line(cx, cy, cx + Math.sin(0.2 * 6.283) * R * 0.78, cy - Math.cos(0.2 * 6.283) * R * 0.78, C.red, 11);
  circle(cx, cy, 16, C.red);
  txt('3 H 12', cx, cy + R + 100, { size: 150, weight: 900, fam: DISP, color: C.red, glowC: 'rgba(255,58,82,0.5)', blur: 50, track: 2 });
  // job interrompu + base
  const bx0 = 860, bw = 900, by = 300;
  panel(bx0, by - 40, bw, 80, { r: 40, stroke: 'rgba(255,255,255,0.25)', fill: 'rgba(14,17,26,0.9)' });
  ctx.fillStyle = hexA(C.red, 0.9); rrect(bx0 + 6, by - 34, (bw - 12) * 0.62, 68, 34); ctx.fill();
  txt('62 %', bx0 + bw * 0.62 - 60, by + 2, { size: 44, weight: 900, fam: MONO, color: C.text });
  txt('✗', bx0 + bw * 0.62 + 52, by + 2, { size: 80, weight: 900, fam: DISP, color: C.red, glowC: C.red, blur: 30 });
  txt('job de nuit : arrêté', bx0, by - 80, { size: 34, weight: 700, fam: MONO, color: C.dim, align: 'left' });
  dbIcon(1010, 560, 220, 170, C.cyan, { bands: 2 }); txt('PostgreSQL', 1010, 725, { size: 36, weight: 800, fam: MONO, color: C.cyan });
  line(1130, 560, 1330, 560, C.green, 8); chip('REPRISE', 1520, 560, { size: 54, color: C.green, padX: 28, padY: 16 });
  txt('REPRENDRE', 1310, 830, { size: 150, weight: 900, fam: DISP, color: C.text, track: 2 });
  txt('SANS TOUT REJOUER', 1310, 960, { size: 92, weight: 900, fam: DISP, color: C.green, glowC: 'rgba(56,245,166,0.4)', blur: 40, track: 2 });
};
THUMBS.sb_m1b = function () {
  bg(C.cyan, 0.2);
  chip('SPRING BATCH 6 · SPRING BOOT 4 · POSTGRESQL', 90, 70, { size: 30, color: C.cyan, align: 'left', padX: 18 });
  txt('MODULE 1', CXt, 250, { size: 230, weight: 900, fam: DISP, color: C.text, glowC: 'rgba(76,201,255,0.4)', blur: 60, track: 4 });
  txt('FONDATIONS DE PRODUCTION', CXt, 410, { size: 70, weight: 900, fam: DISP, color: C.cyan, track: 3 });
  const items = [['JobInstance', C.green], ['JobExecution', C.orange], ['ExecutionContext', C.purple], ['JobRepository', C.red]];
  items.forEach(([s, c], i) => { const x = 330 + i * 420; panel(x - 190, 520, 380, 130, { r: 24, stroke: c, fill: hexA(c, 0.14), glowC: hexA(c, 0.35), blur: 40, lw: 5 }); txt(s, x, 585, { size: s.length > 14 ? 32 : 40, weight: 900, fam: MONO, color: c }); });
  txt('TA PREMIÈRE NUIT', CXt, 800, { size: 130, weight: 900, fam: DISP, color: C.text, track: 2 });
  txt('EN PRODUCTION', CXt, 940, { size: 130, weight: 900, fam: DISP, color: C.orange, glowC: 'rgba(255,122,61,0.45)', blur: 50, track: 2 });
};
