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
