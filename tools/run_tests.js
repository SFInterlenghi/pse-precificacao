'use strict';
// Runner único da suíte de testes do PSE.
// Roda todos os tools/test_*.js em processos separados e falha (exit 1) se qualquer um falhar.
//   node tools/run_tests.js
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const dir = __dirname;
const tests = fs.readdirSync(dir)
  .filter(f => /^test_.*\.js$/.test(f))
  .sort();

let failed = 0;
const t0 = Date.now();
for (const f of tests) {
  process.stdout.write(`• ${f} ... `);
  try {
    const out = execFileSync(process.execPath, [path.join(dir, f)], { encoding: 'utf8' });
    const last = out.trim().split('\n').filter(Boolean).pop() || 'OK';
    console.log(last.replace(/^.*?:\s*/, '').trim() ? last : 'OK');
  } catch (e) {
    failed++;
    console.log('FALHOU');
    const out = (e.stdout || '') + (e.stderr || '');
    console.error(out.trim().split('\n').slice(-12).join('\n'));
    console.error('—'.repeat(40));
  }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n${tests.length - failed}/${tests.length} suítes OK em ${secs}s`);
process.exit(failed ? 1 : 0);
