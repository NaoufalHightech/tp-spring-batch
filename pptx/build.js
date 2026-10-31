'use strict';
// Génère build/raw.pptx (sans animations) + build/anim.json ; animate.py ajoute ensuite transitions et animations.
const fs = require('fs');
const path = require('path');
const SKILL = process.env.PPTX_SKILL || '/root/.claude/skills/synced/432251b9-8e23-4258-9d98-092348e51457_05349990-6be9-48bb-b7fe-7192cd146ed7/pptx';
const { applyTheme } = require(path.join(SKILL, 'scripts/apply_theme.js'));
const lib = require('./lib');
require('./part1')(); require('./part2')(); require('./part3')(); require('./part4')();
(async () => {
  fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
  const raw = path.join(__dirname, 'build', 'raw.pptx');
  await lib.pres.writeFile({ fileName: raw });
  await applyTheme(raw, lib.THEME);
  fs.writeFileSync(path.join(__dirname, 'build', 'anim.json'), JSON.stringify(lib.ANIM, null, 1));
  console.log('diapositives :', lib.ANIM.slides.length, '· animations :', lib.ANIM.slides.reduce((n, s) => n + s.anims.length, 0));
})();
