/* Test T1014-99: /reseni-podnikova-ai je 301 na /podnikova-ai/ a web na starou cestu neodkazuje.
   Spousti se z korene workspace: `node --test web/scripts/test-podnikova-ai-presmerovani.mjs` */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const VYNECHAT = new Set(['docs', 'scripts', 'node_modules', '.wrangler', '.git']);
const ARCHIV = new Set(['reseni-podnikova-ai.html', 'en/reseni-podnikova-ai.html']);
const cti = (cesta) => readFileSync(join(WEB, cesta), 'utf8');

function soubory(slozka) {
  const vysledek = [];
  for (const d of readdirSync(slozka, {withFileTypes: true})) {
    if (d.isDirectory()) {
      if (!VYNECHAT.has(d.name)) vysledek.push(...soubory(join(slozka, d.name)));
    } else if (/\.(html|json|txt|xml)$/.test(d.name)) {
      vysledek.push(join(slozka, d.name));
    }
  }
  return vysledek;
}

test('_redirects ma 301 na /podnikova-ai/', () => {
  const radky = cti('_redirects').split(/\r?\n/).map((r) => r.trim().split(/\s+/).join(' '));
  for (const r of ['/reseni-podnikova-ai /podnikova-ai/ 301',
    '/en/reseni-podnikova-ai /podnikova-ai/en/ 301',
    '/reseni-ai /podnikova-ai/ 301']) {
    assert.ok(radky.includes(r), `chybi radek: ${r}`);
  }
});

test('web mimo archiv neodkazuje na reseni-podnikova-ai', () => {
  const nalezy = soubory(WEB)
    .map((s) => relative(WEB, s).split(sep).join('/'))
    .filter((s) => !ARCHIV.has(s) && cti(s).includes('reseni-podnikova-ai'));
  assert.deepEqual(nalezy, []);
});

test('worker.js: zaloha presmerovani a zadna zverejnena EN stranka', () => {
  const w = cti('worker.js');
  const zverejnene = w.match(/ZVEREJNENE = new Set\(\[(.*?)\]\)/s);
  assert.ok(zverejnene, 'ZVEREJNENE nenalezeno');
  assert.ok(!zverejnene[1].includes('reseni-podnikova-ai'));
  assert.ok(w.includes("['/reseni-podnikova-ai', '/podnikova-ai/']"));
  assert.ok(w.includes("['/en/reseni-podnikova-ai', '/podnikova-ai/en/']"));
});

test('sluzby.json a sitemap.xml znaji /podnikova-ai/', () => {
  const sluzby = JSON.parse(cti('sluzby.json'));
  assert.ok('podnikova-ai/' in sluzby);
  assert.ok(!('reseni-podnikova-ai' in sluzby));
  const sitemap = cti('sitemap.xml');
  assert.ok(sitemap.includes('<loc>https://mantait.cz/podnikova-ai/</loc>'));
  assert.ok(sitemap.includes('<loc>https://mantait.cz/podnikova-ai/en/</loc>'));
});

test('/podnikova-ai/ (cs i en) je indexovatelna a ma vyzvu', () => {
  const cs = cti('podnikova-ai/index.html');
  const en = cti('podnikova-ai/en/index.html');
  assert.ok(!cs.includes('noindex') && !en.includes('noindex'));
  assert.ok(cs.includes('9 900 Kč'));
  assert.ok(cs.includes('href="#pristup"') && en.includes('href="#pristup"'));
});
