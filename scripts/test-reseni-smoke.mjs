// Smoke 6 stranek reseni-* (T0926-279): pisma ze sluzba.css (bez pisma.css),
// defer skriptu, konzole bez chyb, zalozky celku u AI zamestnance.
// Spoustet z korene workspace: node web/scripts/test-reseni-smoke.mjs
// Server si test spusti sam v procesu (nahodny port) a na konci zavre.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from './_puppeteer.mjs';

const KOREN = fileURLToPath(new URL('..', import.meta.url));
const STRANKY = ['/reseni-vedeni-it', '/reseni-nova-aplikace', '/reseni-propojeni',
  '/reseni-bezpecnost', '/reseni-ai-zamestnanec', '/reseni-mapa-firmy'];
const SIRKY = [[390, 844], [1440, 900]];
const TYPY = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.json': 'application/json'};

setTimeout(() => { console.log('CHYBA: timeout 90 s'); process.exit(1); }, 90_000).unref();

// mapovani jako web/scripts/serve.py: bez pripony -> .html, slozka -> index.html
function najdiSoubor(urlCesta) {
  const cesta = decodeURIComponent(urlCesta.split('?')[0]);
  if (cesta.split('/').includes('..')) return {status: 403};
  let p = path.join(KOREN, cesta);
  if (!fs.existsSync(p) && fs.existsSync(p + '.html')) p += '.html';
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return {status: 404};
  return {status: 200, soubor: p};
}

const server = http.createServer((req, res) => {
  const {status, soubor} = najdiSoubor(req.url);
  if (status !== 200) { res.writeHead(status); res.end(); return; }
  res.writeHead(200, {'Content-Type': TYPY[path.extname(soubor)] || 'application/octet-stream'});
  fs.createReadStream(soubor).pipe(res);
});

async function zkontrolujStranku(prohlizec, origin, url, [w, h]) {
  const chyby = [];
  const abortovane = new Set();
  const p = await prohlizec.newPage();
  try {
    await p.setViewport({width: w, height: h});
    await p.setRequestInterception(true);
    p.on('request', r => (r.url().startsWith(origin) || r.url().startsWith('data:')) ? r.continue() : r.abort());
    p.on('requestfailed', r => { if (!r.url().startsWith(origin)) abortovane.add(r.url()); });
    p.on('pageerror', e => chyby.push('pageerror: ' + e.message));
    p.on('console', m => {
      if (m.type() !== 'error') return;
      const zdroj = m.location()?.url || '';
      if (abortovane.has(zdroj) || (zdroj && !zdroj.startsWith(origin))) return;
      chyby.push('console: ' + m.text());
    });
    p.on('response', r => { if (r.url().startsWith(origin) && r.status() >= 400) chyby.push(`${r.status()} ${r.url()}`); });

    await p.goto(origin + url, {waitUntil: 'networkidle0'});
    const stav = await p.evaluate(async () => {
      await document.fonts.ready;
      const nacteno = rodina => [...document.fonts].some(f => f.family.replace(/['"]/g, '') === rodina && f.status === 'loaded');
      for (const rodina of ['Outfit', 'Manrope']) {
        if (!nacteno(rodina)) { try { await document.fonts.load(`16px ${rodina}`); } catch (e) { /* posoudi se nize */ } }
      }
      return {
        check: document.fonts.check('16px Outfit') && document.fonts.check('16px Manrope'),
        outfit: nacteno('Outfit'), manrope: nacteno('Manrope'),
        pismaCss: !!document.querySelector('link[rel=stylesheet][href*="pisma.css"]'),
        sluzbaCss: !!document.querySelector('link[href*="sluzba.css"]'),
        deferSluzba: !!document.querySelector('script[src*="sluzba.js"]')?.hasAttribute('defer'),
        deferMobil: !!document.querySelector('script[src*="mobil.js"]')?.hasAttribute('defer'),
      };
    });
    if (!stav.check || !stav.outfit || !stav.manrope) chyby.push(`pisma: outfit=${stav.outfit} manrope=${stav.manrope} check=${stav.check}`);
    if (stav.pismaCss) chyby.push('stranka nese pisma.css');
    if (!stav.sluzbaCss) chyby.push('chybi sluzba.css');
    if (!stav.deferSluzba || !stav.deferMobil) chyby.push(`defer: sluzba.js=${stav.deferSluzba} mobil.js=${stav.deferMobil}`);

    let celky = '-';
    if (url === '/reseni-ai-zamestnanec') {
      if (await p.$eval('#celky-zalozky', e => e.hidden)) chyby.push('#celky-zalozky je hidden');
      for (const celek of ['recenze', 'obchod']) {
        await p.$$eval('#celky-zalozky label', (ls, c) => ls.find(l => l.querySelector(`input[value="${c}"]`)).click(), celek);
        await new Promise(r => setTimeout(r, 200));
        const aktivni = await p.$$eval('#celky .celek.aktivni', es => es.map(e => e.dataset.celek));
        if (aktivni.length !== 1 || aktivni[0] !== celek) chyby.push(`celky po kliku na ${celek}: ${JSON.stringify(aktivni)}`);
      }
      celky = chyby.some(c => c.startsWith('celky') || c.startsWith('#celky')) ? 'CHYBA' : 'OK';
    }
    return {pisma: stav.outfit && stav.manrope ? 'OK' : 'CHYBA', celky, chyby};
  } finally {
    await p.close();
  }
}

let prohlizec;
let selhalo = 0;
try {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  prohlizec = await puppeteer.launch({executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox']});
  for (const url of STRANKY) {
    for (const sirka of SIRKY) {
      const v = await zkontrolujStranku(prohlizec, origin, url, sirka);
      if (v.chyby.length) selhalo++;
      console.log(`${url} ${sirka[0]}px pisma=${v.pisma} celky=${v.celky} ${v.chyby.length ? 'CHYBA: ' + v.chyby.join('; ') : 'OK'}`);
    }
  }
} catch (e) {
  selhalo++;
  console.log('CHYBA: ' + (e.stack || e));
} finally {
  if (prohlizec) await prohlizec.close();
  server.close();
}
const celkem = STRANKY.length * SIRKY.length;
console.log(selhalo ? `SOUHRN: ${selhalo} z ${celkem} s chybou` : `SOUHRN: ${celkem}/${celkem} OK`);
process.exit(selhalo ? 1 : 0);
