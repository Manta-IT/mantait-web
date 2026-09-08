import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
const p = await b.newPage(); await p.setViewport({width:390,height:844});
const chyby=[]; p.on('pageerror',e=>chyby.push(e.message));
await p.goto('http://localhost:8773/reseni-vedeni-it',{waitUntil:'networkidle0'});
const stav = () => p.evaluate(() => {
  const d = document.querySelector('.doklady.skladatelne .doklad');
  const s = d.querySelector(':scope > h3 > .doklad-spinac');
  return {nadpis: s.textContent.trim().slice(0,28), expanded: s.getAttribute('aria-expanded'),
    otevreny: d.classList.contains('otevreny'),
    vyskaTela: Math.round(d.querySelector(':scope > div').getBoundingClientRect().height),
    pocitadlo: document.querySelector('.pocitadlo')?.textContent.trim().slice(0,3),
    mame: d.classList.contains('mame'),
    pressed: d.querySelector('.mam')?.getAttribute('aria-pressed')};
});
console.log('pred     ', JSON.stringify(await stav()));
await p.click('.doklady.skladatelne .doklad:first-child > h3 > .doklad-spinac');
await new Promise(r=>setTimeout(r,450));
console.log('rozbaleno', JSON.stringify(await stav()));
await p.click('.doklady.skladatelne .doklad:first-child .mam');
await new Promise(r=>setTimeout(r,200));
console.log('odskrtnuto', JSON.stringify(await stav()));
// klavesnice: Tab na spinac a Enter
await p.evaluate(()=>document.querySelector('.doklady.skladatelne .doklad:first-child .doklad-spinac').focus());
await p.keyboard.press('Enter'); await new Promise(r=>setTimeout(r,450));
console.log('po Enteru', JSON.stringify(await stav()));
// siroke okno: nadpis zpatky jako nadpis
await p.setViewport({width:1440,height:900}); await new Promise(r=>setTimeout(r,300));
console.log('1440     ', JSON.stringify(await p.evaluate(()=>{
  const h=document.querySelector('.doklady .doklad > h3');
  return {role:h.getAttribute('role')||'(zadna)', aria:h.querySelector('.doklad-spinac')?.getAttribute('aria-expanded')||'(zadna)',
    text:h.textContent.trim().slice(0,30)};
})));
console.log('pageerrors:', chyby.length?chyby:'zadne');
await b.close();
