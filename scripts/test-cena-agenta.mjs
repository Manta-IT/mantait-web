/* Test: cena za agenta (89 000 Kc, EN/SK 3 700 EUR, provoz od 8 000 Kc) nikde na webu nesmi stat.
   Spousti se z korene workspace: `node --test web/scripts/test-cena-agenta.mjs` */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const KOREN = new URL('..', import.meta.url);
const VYNECHAT = new Set(['docs', 'scripts', 'node_modules', '.wrangler', '.git']);
const ZAKAZANO = /89(\s|&nbsp;)?000|3(\s|&nbsp;)?700 EUR|EUR 3,700|"price":\s*"3700"|osm tisíc měsíčně|od 8(\s|&nbsp;)000 Kč|8(\s|&nbsp;)000 Kč měsíčně|330 (to|až) 620 EUR|od (cca )?330 EUR|from (approx\. )?(EUR )?330/;

function soubory(slozka) {
  const vysledek = [];
  for (const d of readdirSync(slozka, {withFileTypes: true})) {
    if (d.isDirectory()) {
      if (!VYNECHAT.has(d.name)) vysledek.push(...soubory(join(slozka, d.name)));
    } else if (/\.(html|txt|json)$/.test(d.name)) {
      vysledek.push(join(slozka, d.name));
    }
  }
  return vysledek;
}

const koren = KOREN.pathname.replace(/^\/([A-Za-z]:)/, '$1');

test('zadny soubor webu nenese cenu za agenta ani provoz od 8 000 Kc', () => {
  const nalezy = [];
  for (const f of soubory(decodeURIComponent(koren))) {
    const m = readFileSync(f, 'utf8').match(ZAKAZANO);
    if (m) nalezy.push(`${f}: ${m[0]}`);
  }
  assert.deepEqual(nalezy, []);
});

test('reseni-ai-zamestnanec (CZ, EN, SK) nema JSON-LD offers', () => {
  for (const p of ['', 'en/', 'sk/']) {
    const t = readFileSync(new URL(`../${p}reseni-ai-zamestnanec.html`, import.meta.url), 'utf8');
    assert.ok(!t.includes('"offers"'), `${p}reseni-ai-zamestnanec.html nese "offers"`);
  }
});

test('sluzby.json: cena AI zamestnance nema cislici', () => {
  const j = JSON.parse(readFileSync(new URL('../sluzby.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(j['reseni-ai-zamestnanec'].cena, /\d/);
});
