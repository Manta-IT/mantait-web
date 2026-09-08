import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const URLS = ['/', '/reseni-podnikova-ai', '/reseni-zadani', '/reseni-mapa-firmy', '/weby',
  '/clanky/', '/clanky/novy-zakon-kyberbezpecnost-3-otazky', '/reseni-vyber-systemu',
  '/reseni-robot-na-zadani', '/reseni-ai-zamestnanec', '/reseni-bezpecnost',
  '/reseni-vedeni-it', '/reseni-nova-aplikace', '/reseni-propojeni', '/o-mne', '/kontakt', '/dotace-mas'];
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:'new', args:['--no-sandbox']});
for (const sirka of [390, 1440]) {
  console.log('##### viewport ' + sirka);
  for (const u of URLS) {
    const p = await b.newPage();
    await p.setViewport({width: sirka, height: sirka===390?844:900});
    await p.goto('http://localhost:8773'+u, {waitUntil:'networkidle0'});
    await p.evaluate(axe);
    const r = await p.evaluate(async () => (await axe.run(document, {
      runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}
    })).violations.map(v => ({id:v.id, impact:v.impact, n:v.nodes.length,
      cil:v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' | ')})));
    console.log(u.padEnd(46), r.length ? JSON.stringify(r) : 'ok');
    await p.close();
  }
}
await b.close();
