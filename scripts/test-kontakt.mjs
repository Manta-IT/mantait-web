import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox'],
});
const p = await b.newPage();
const chyby = [];
p.on('console', m => m.type() === 'error' && chyby.push(m.text()));
p.on('pageerror', e => chyby.push('PAGEERROR ' + e.message));
await p.goto('http://localhost:8773/', {waitUntil: 'networkidle0'});

const stav = s => p.evaluate(() => ({
  cesta: document.getElementById('poleCesta').value,
  terminSkryty: document.getElementById('blokTermin').hidden,
  vybrana: [...document.querySelectorAll('.cesta')].find(c=>c.getAttribute('aria-selected')==='true')?.dataset.cesta,
  dny: document.getElementById('dny').children.length,
  konkretni: document.getElementById('konkretniDny').children.length,
  casti: document.getElementById('casti').children.length,
  termin: document.getElementById('poleTermin').value,
  souhrn: document.getElementById('souhrn').classList.contains('videt'),
}));
console.log('vychozi   ', JSON.stringify(await stav()));
await p.click('.cesta[data-cesta="termin"]');
console.log('po termin ', JSON.stringify(await stav()));
await p.click('#dny button:nth-child(3)');
console.log('po dnu    ', JSON.stringify(await stav()));
await new Promise(r=>setTimeout(r,500));
await p.click('#konkretniDny button:nth-child(2)');
console.log('po datu   ', JSON.stringify(await stav()));
await new Promise(r=>setTimeout(r,200));
await p.click('#casti button:nth-child(2)');
await new Promise(r=>setTimeout(r,200));
console.log('po vyberu ', JSON.stringify(await stav()));
await p.click('.cesta[data-cesta="zavolat"]');
console.log('po zavolat', JSON.stringify(await stav()));

// pisma se skutecne pouzila?
console.log('pisma:', await p.evaluate(() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight).join(', ')));
console.log('nav posunuto po scrollu:', await p.evaluate(async () => {
  window.scrollTo(0, 2000);
  await new Promise(r => setTimeout(r, 400));
  return document.getElementById('nav').classList.contains('posunuto');
}));
console.log('console errors:', chyby.length ? chyby : 'zadne');
await b.close();
