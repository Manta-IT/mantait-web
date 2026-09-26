// Manta IT web: staticke assets + jeden POST endpoint pro formulare.
// Formular je jediny vstupni bod dotacni kampane -- lead se NESMI tise ztratit.
// Pri selhani odeslani vraci stranku s telefonem, ne prazdnou 500.

// Odesila se pres Gmail API primo z pracovni schranky. Puvodni cesta
// (SendGrid, odesilatel formular@manta-it.cz) skoncila 10. 8.: Gmail tu
// domenu s pomlckou oznacoval za pokus vydavat se za mantait.cz a pripsal
// prijemci varovani "zprava muze byt nebezpecna". Posta k webovemu formulari
// musi chodit z tehoz jmena jako web, jinak je podezrela uz z principu.
import PORTAL from './_pristup/portal.js';
import { overToken, validujDavku, vlozVodoznak } from './pristup.js';
import { odhlas, potvrd, prihlas, validujPrihlaseni } from './souhlas.js';

// Verze zneni souhlasu u checkboxu hlidace v dotazniku; finalni verzi nastavi rez 5 (T0926-215).
const ZNENI_HLIDAC_DOTAZNIK = 'dotaznik-placeholder-v0';

const NOTIFY_TO = 'petr.kokoska@mantait.cz';
const FROM = { email: 'petr.kokoska@mantait.cz', name: 'Petr Kokoška | Manta IT' };
const TEL = '+420 732 329 431';

const FORMS = {
  // Zadost o pristup k prototypu Podnikove AI (T0924-471, tracer brany).
  // Predmet a pole `text` cte tools/podnikova-ai-pristup/zadosti.py -- menit jen spolu.
  // Bez `reply`: PRAVE 1 mail Petrovi s Reply-To zadatele, potvrzeni by byl text ven bez copy.
  pristup: {
    subject: 'Pristup: podnikova-ai',
    fields: ['email', 'text'],
    dekujeme: '/podnikova-ai-dekujeme',
    povinne: ['email', 'text'],
  },
  // Onboarding dodavatelu (T0831-17). Klice MUSI sedet na
  // specs/dodavatele/sloupce.json (zdroj: formular) -- hlida
  // scripts/dodavatele_formular.py --worker-check. Predmet MUSI sedet na
  // PREDMET ve scripts/dodavatele_prijem.py (parser mailu -> Google Sheet).
  dodavatel: {
    subject: 'Dodavatel: onboarding',
    replySubject: 'Mám váš dotazník - Manta IT',
    // vlastni potvrzeni v kontextu dodavatelu (Petruv test 31. 8.)
    dekujeme: '/dodavatele-dekujeme',
    // telo mailu cte stroj (parser dodavatele_prijem.py) -> tvrda validace
    strojove: true,
    ciselna: ['velikost_tymu', 'rok_zalozeni', 'kapacita_md_mesic',
              'nastupnost_tydny', 'min_zakazka_kc', 'max_zakazka_kc',
              'sazba_od', 'splatnost_dni', 'servis_od_kc',
              'reakcni_doba_h'],
    fields: ['nazev', 'ico', 'web', 'mesto', 'kontakt_osoba', 'kontakt_role',
             'email', 'telefon', 'typ_dodavatele', 'specializace',
             'technologie', 'velikost_tymu', 'rok_zalozeni', 'misto_prace',
             'kapacita_md_mesic', 'nastupnost_tydny', 'min_zakazka_kc',
             'max_zakazka_kc', 'sazba_od', 'cenovy_model',
             'platce_dph', 'splatnost_dni', 'predani_kodu', 'proces_kvality',
             'sla_nabizi', 'servis_od_kc', 'reakcni_doba_h', 'hosting_nabizi',
             'reference', 'reference_kontakt', 'nda_ochota',
             'pojisteni_odpovednosti', 'pozn_partnera',
             // rozsireni 31. 8. (vyzkum RFI + Petr): sluzby, procesy, cloudy
             'sluzby', 'cloudy', 'metodika_rizeni', 'role_tymu',
             'nastroje_rizeni', 'subdodavky', 'jazyky', 'certifikace',
             // validace proti plnym RFI zdrojum (T0831-32)
             'rytmus_komunikace', 'ai_ve_vyvoji', 'recenze_profily',
             'cenik_roli'],
    reply: (d) => `Dobrý den,

díky za vyplněný dotazník. Zařadím vás do databáze dodavatelů a ozvu se,
jakmile budu mít zakázku, která odpovídá vašemu profilu.

Kdybyste chtěli cokoliv doplnit nebo probrat, stačí odpovědět na tento e-mail.

Petr Kokoška
Manta IT | mantait.cz`,
  },
  dotaznik: {
    subject: 'Dotace MAS: ověření způsobilosti',
    replySubject: 'Mám váš dotazník - Manta IT',
    fields: ['ico', 'obec', 'zamestnanci', 'ucetni_roky', 'vazby', 'bezdluznost',
             'datovka', 'zamer', 'investice', 'drivejsi_dotace', 'jmeno', 'telefon', 'email', 'mas'],
    // Jmeno z formulare je v 1. padu a JS ho neumi sklonit ("Dobry den,
    // Robin Mrtvy" -- nalez DK12). Osloveni bez jmena je spravne vzdy.
    reply: (d) => `Dobrý den,

díky za odeslaný dotazník. Mám ho a projdu ho osobně.

Ozvu se vám do jednoho pracovního dne s jasnou odpovědí: ano splňujete, ano
s doplněním (a čím), nebo ne a proč, včetně toho, co jde dělat místo toho.

Kdyby to bylo naspěch nebo chcete cokoliv dořešit dřív, volejte ${TEL}.

Petr Kokoška
Manta IT | mantait.cz | ${TEL}`,
  },
  kontakt: {
    subject: 'Zpráva z kontaktního formuláře',
    replySubject: 'Mám vaši zprávu - Manta IT',
    // `cesta` a `termin` prisly s novym kontaktem (napsat / zavolat / poslat
    // termin). Bez nich by vybrany termin nikdy nedorazil -- formular by ho
    // sebral a Worker zahodil.
    // `zdroj` + `utm_campaign`: odkud lead prisel (/?zdroj=kalkulacka, T0924-185).
    fields: ['cesta', 'jmeno', 'firma', 'telefon', 'email', 'zprava', 'termin', 'zdroj', 'utm_campaign'],
    reply: (d) => {
      if (d.cesta === 'zavolat') {
        return `Dobrý den,

mám vaše číslo a zavolám vám do jednoho pracovního dne.
Kdyby to spěchalo dřív, volejte ${TEL}.

Petr Kokoška
Manta IT | mantait.cz | ${TEL}`;
      }
      if (d.cesta === 'termin') {
        // Tenhle mail jde na adresu z formulare, tedy potencialne na adresu
        // obeti. Bez srazeni a stropu by utocnik psal odstavce cizim lidem
        // z nasi domeny s platnym SPF i DKIM (OWASP review 8. 9., H2).
        const t = String(d.termin || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 60);
        return `Dobrý den,

termín ${t || 'jste vybrali'} jsem si poznamenal a potvrdím vám ho
mailem i s odkazem na hovor. Kdyby se čas nehodil, napište jiný.

Petr Kokoška
Manta IT | mantait.cz | ${TEL}`;
      }
      return `Dobrý den,

díky za zprávu, dorazila mi. Ozvu se vám do jednoho pracovního dne.
Kdyby to spěchalo, volejte ${TEL}.

Petr Kokoška
Manta IT | mantait.cz | ${TEL}`;
    },
  },
};

// Status rozlisuje, kdo chybu udelal: 400 kdyz chybi udaj ve formulari,
// 502 kdyz selhal Gmail. Jeden kod pro oboji delal z preklepu v e-mailu
// serverovou chybu. Zpetny odkaz vede tam, odkud formular prisel -- drive
// mirilo natvrdo na /dotace-mas i z kontaktniho formulare.
function errorPage(msg, { status = 502, zpet = '/kontakt' } = {}) {
  return new Response(
    `<!doctype html><html lang="cs"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Formulář se neodeslal | Manta IT</title>
<link rel="stylesheet" href="/style.css"></head><body>
<main style="max-width:640px;margin:80px auto;padding:0 24px">
<h1>Formulář se neodeslal</h1>
<p>${msg} Omlouvám se. Napište mi prosím přímo na
<a href="mailto:${NOTIFY_TO}">${NOTIFY_TO}</a> nebo volejte
<a href="tel:+420732329431">${TEL}</a> -- odpovím stejně rychle.</p>
<p><a href="${zpet}">Zpět na stránku</a></p>
</main></body></html>`,
    { status, headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; style-src 'self'; base-uri 'none'; form-action 'none'",
    } },
  );
}

function b64url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// Hlavicka s diakritikou musi byt zakodovana (RFC 2047), jinak z "Kokoška"
// dorazi rozsypany caj.
const hlavicka = (s) => (/[^\x20-\x7E]/.test(s) ? `=?UTF-8?B?${b64(s)}?=` : s);

async function accessToken(env) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`OAuth ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function sendMail(token, to, subject, text, replyTo) {
  const zprava = [
    `To: ${to}`,
    `From: ${hlavicka(FROM.name)} <${FROM.email}>`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: ${hlavicka(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text),
  ].join('\r\n');
  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: b64url(zprava) }),
    },
  );
  if (!res.ok) throw new Error(`Gmail ${res.status}: ${await res.text()}`);
}

/* Roboti z kontaktniho formulare (T0923-92). 20.-23. 9. prislo pet zprav, ktere
   proslo honeypotem: jmeno jen prijmeni, cizi gmail/hotmail, zadna firma ani
   telefon a sablona "Kontaktujte me prosim e-mailem -- manta it." nebo prosba
   o newsletter ("confirm my subscription"). Je to subscription bombing: adresa
   patri obeti a nase potvrzeni by ji zasypavalo. Robot proto nedostane
   potvrzeni a notifikace jde bez Reply-To s jinym predmetem -- stav kampane
   (scripts/stav_kampane.py) formular pozna jen podle Reply-To, takze z toho
   nevznikne triaz, task ani kvantum. Mail ale do schranky dorazi: kdyby se
   filtr spletl, clovek se neztrati, jen neni ve fronte. */
const ROBOT_SUBJECT = 'Robot z kontaktního formuláře (bez odpovědi)';
const ROBOT_TEXT =/subscri|newsletter|news and updates|email updates|company news|kontaktujte mě prosím e-mailem\s*[—–-]/i;

function jeRobot(formName, data) {
  if (formName !== 'kontakt') return false;
  const ma = (f) => String(data[f] || '').trim() !== '';
  return !ma('telefon') && !ma('firma') && ROBOT_TEXT.test(String(data.zprava || ''));
}

async function handleForm(request, env, formName, ctx) {
  const form = FORMS[formName];
  // Nejdelsi poctivy formular (dodavatele) ma pod 8 kB. 64 kB je strop, po
  // kterem uz nejde o vyplneny formular, ale o zatez na isolate.
  if (Number(request.headers.get('content-length') || 0) > 64 * 1024) {
    return errorPage('Odeslaná data jsou příliš velká.', { status: 413, zpet: '/#napiste' });
  }
  const data = Object.fromEntries(await request.formData());

  // honeypot: bot vyplni skryte pole, clovek ne
  // dva honeypoty: `website` (stare stranky) + `kontrolni_udaj` (nove --
  // "website" umi vyplnit autofill prohlizece i poctivemu cloveku a lead
  // by se tise ztratil; OWASP review M2)
  if (data.website || data.kontrolni_udaj) return Response.redirect(new URL(form.dekujeme || '/dekujeme', request.url), 303);

  const zpet = { dotaznik: '/dotace-mas', dodavatel: '/dodavatele', pristup: '/podnikova-ai/#pristup' }[formName] || '/kontakt';
  const chybaUzivatele = (msg) => errorPage(msg, { status: 400, zpet });

  const email = (data.email || '').trim();
  const telefon = (data.telefon || '').trim();
  if (!email && !telefon) {
    return chybaUzivatele('Chybí e-mail i telefon, takže bych neměl jak odpovědět.');
  }
  if (email && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return chybaUzivatele('E-mailová adresa nevypadá platně.');
  }
  for (const f of form.povinne || []) {
    if (!String(data[f] || '').trim()) return chybaUzivatele('Vyplňte prosím e-mail i to, o co vám jde.');
  }

  // Serverova validace strojovych formularu (OWASP review M1): klientske
  // type=number a formatovani jsou jen pohodli. ICO je parovaci klic
  // upsertu -- nesmyslne ICO nikdy nesmi vzniknout jako klic.
  if (form.strojove) {
    if (!/^\d{8}$/.test((data.ico || '').trim())) {
      return chybaUzivatele('IČO musí být přesně 8 číslic.');
    }
    for (const f of form.ciselna || []) {
      const v = (data[f] || '').replace(/\s+/g, '');
      if (v && !/^\d+([.,]\d+)?$/.test(v)) {
        return chybaUzivatele('Pole „' + f + '" musí být číslo.');
      }
      if (v) data[f] = v;
    }
  }

  const lines = form.fields
    .filter((f) => (data[f] || '').trim())
    // `strojove`: telo mailu cte parser radek po radku (`klic: hodnota`).
    // Novy radek uvnitr hodnoty by utocnikovi dovolil podvrhnout dalsi
    // klice ("\nnazev: KOALA42" -> prepis ciziho radku v tabulce), proto
    // se u strojovych formularu hodnoty srazi na jeden radek.
    // radky se srazeji u VSECH formularu: u strojovych proti injekci klicu,
    // u lidskych proti podvrzenym radkum v mailu (OWASP review L1)
    .map((f) => `${f}: ${String(data[f]).trim().slice(0, 2000).replace(/[\r\n]+/g, ' ')}`);
  const robot = jeRobot(formName, data);
  const subject = robot ? ROBOT_SUBJECT : form.subject;
  const body = `${subject}\n\n${lines.join('\n')}\n\n---\nOdeslano z ${(request.headers.get('referer') || 'webu').replace(/[\r\n]+/g, ' ').slice(0, 200)}`;

  if (!env.GMAIL_REFRESH_TOKEN) {
    return errorPage('Odesílání e-mailu není na serveru nastavené.', { zpet });
  }
  let token;
  try {
    token = await accessToken(env);
    await sendMail(token, NOTIFY_TO, subject, body, robot ? undefined : email || undefined);
  } catch (e) {
    console.error('notifikace selhala', e);
    return errorPage('Server odmítl zprávu odeslat.', { zpet });
  }
  if (robot) {
    console.log(JSON.stringify({ event: 'form.robot', form: formName }));
  } else if (email && form.reply) {
    // potvrzeni klientovi je nice-to-have: lead uz mame, tohle nesmi shodit
    // request. waitUntil: bezi az PO odpovedi -- cekani na druhy mail drzelo
    // redirect 2-4 s a svadelo k opakovanemu kliknuti (4 maily, 31. 8.).
    const potvrzeni = sendMail(token, email, form.replySubject, form.reply(data))
      .catch((e) => console.error('potvrzeni klientovi selhalo', e));
    if (ctx) ctx.waitUntil(potvrzeni); else await potvrzeni;
  }
  // Hlidac vyzev z dotazniku (rez 3): az za notifikaci, aby chyba D1 nikdy neshodila lead.
  // Redirect prihlas() se zahazuje -- dotaznik vzdy konci na /dekujeme.
  if (formName === 'dotaznik' && data.hlidac === 'ano' && email) {
    const udaje = { adresa: email.toLowerCase(), region: String(data.mas || '').trim().slice(0, 100), obor: '' };
    const posta = {
      puvod: new URL(request.url).origin,
      posli: async (to, predmet, telo) => sendMail(await accessToken(env), to, predmet, telo),
    };
    let selhal = false;
    try {
      const r = await prihlas(env, ctx, udaje, 'dotaznik', ZNENI_HLIDAC_DOTAZNIK,
                              request.headers.get('cf-connecting-ip') || '', posta);
      selhal = Boolean(r && r.status >= 400);
    } catch {
      selhal = true;
    }
    if (selhal) console.log(JSON.stringify({ event: 'hlidac.selhal', zdroj: 'dotaznik' }));
  }
  // Jen delka: e-mail ani text zadosti do logu nepatri (kriterium 12).
  if (formName === 'pristup') console.log(JSON.stringify({ event: 'pristup.zadost', delka: String(data.text || '').length }));
  // Lead s platnym zdrojem nese zdroj az do konverze Ads na /dekujeme (T0924-185).
  // Regex = web/gtag.js; cokoli jineho do URL neprojde.
  const zdroj = formName === 'kontakt' && !robot && /^[a-z0-9-]{1,40}$/.test(String(data.zdroj || '')) ? data.zdroj : '';
  return Response.redirect(new URL((form.dekujeme || '/dekujeme') + (zdroj ? `?zdroj=${zdroj}` : ''), request.url), 303);
}

// Prihlaseni k hlidaci vyzev (T0926-211). Honeypot i chyby jako handleForm, ale bez
// notifikace Petrovi: zapis `zapsan` + potvrzovaci mail resi prihlas() v souhlas.js.
async function handleHlidac(request, env, ctx) {
  if (Number(request.headers.get('content-length') || 0) > 64 * 1024) {
    return errorPage('Odeslaná data jsou příliš velká.', { status: 413, zpet: '/hlidac-vyzev' });
  }
  const data = Object.fromEntries(await request.formData());
  const hotovo = Response.redirect(new URL('/hlidac-vyzev/zkontrolujte-postu', request.url), 303);
  if (data.website || data.kontrolni_udaj) return hotovo;
  const udaje = validujPrihlaseni(data);
  if (udaje.chyba) return errorPage(udaje.chyba, { status: 400, zpet: '/hlidac-vyzev' });
  const posta = {
    puvod: new URL(request.url).origin,
    posli: async (to, predmet, telo) => sendMail(await accessToken(env), to, predmet, telo),
  };
  const r = await prihlas(env, ctx, udaje, 'web-hlidac', 'ZNENI_V0',
                          request.headers.get('cf-connecting-ip') || '', posta);
  return r || hotovo;
}

const ODKAZ_NEPLATI = '<!doctype html><html lang="cs"><meta charset="utf-8"><title>Odkaz neplatí</title>'
  + '<body><h1>Odkaz neplatí</h1><p>Platnost odkazu vypršela nebo byl zrušen.</p></body></html>';

// Osobni odkaz /p/<token> na prototyp. `_headers` se na odpovedi Workeru
// neaplikuje, proto hlavicky nastavuje primo tady.
async function handlePristup(request, env, retezec) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  const zrusene = new Set(String(env.PRISTUP_ZRUSENE || '').split(',').map((s) => s.trim()).filter(Boolean));
  // UTC: na prelomu dne plati odkaz o par hodin dele/kratsi, vedome (T0924-477).
  const dnes = new Date().toISOString().slice(0, 10);
  const token = await overToken(retezec, env.PRISTUP_KLIC, dnes, zrusene);
  if (!token) {
    return new Response(ODKAZ_NEPLATI, { status: 403, headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer',
    } });
  }
  console.log(JSON.stringify({ event: 'pristup.otevreno', z: token.z }));
  return new Response(vlozVodoznak(PORTAL, token, retezec), { headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',   // token je v URL
    'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
      + "img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  } });
}

// Davka udalosti mereni z portalu -> D1. Bez env.DB (produkce do nastaveni
// D1 Petrem) 503, nic se netvari jako ulozene.
async function handleMereni(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > 16 * 1024) return new Response('Too large', { status: 413 });
  let telo;
  try {
    telo = JSON.parse(await request.text());
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  const d = validujDavku(telo);
  if (!d) return new Response('Bad request', { status: 400 });
  const zrusene = new Set(String(env.PRISTUP_ZRUSENE || '').split(',').map((s) => s.trim()).filter(Boolean));
  const token = await overToken(d.t, env.PRISTUP_KLIC, new Date().toISOString().slice(0, 10), zrusene);
  if (!token) return new Response('Forbidden', { status: 403 });
  if (!env.DB) return new Response('Service unavailable', { status: 503 });
  const prijato = Date.now();
  await env.DB.batch(d.u.map((x) => env.DB
    .prepare('INSERT INTO udalosti (z, v, o, ts, prijato) VALUES (?, ?, ?, ?, ?)')
    .bind(token.z, x.v, x.o, x.ts, prijato)));
  console.log(JSON.stringify({ event: 'mereni.prijato', z: token.z, pocet: d.u.length }));
  return new Response(null, { status: 204 });
}

// Pro scripts/test-mail.mjs -- overuje sestaveni MIME a odeslani proti
// skutecnemu Gmail API bez toho, aby bezel cely Worker.
export { b64, b64url, hlavicka, accessToken, sendMail };

/* Presmerovani po nasazeni redesignu 26. 8. 2026.

   Stranky, ktere jeste nemaji novou podobu, se stahuji z webu. Nemazou se:
   301 posle navstevnika i vyhledavac na nejblizsi zive misto, takze se
   neztrati ani pozice ve vyhledavani, ani clovek, ktery prisel ze stareho
   odkazu nebo z rozeslaneho mailu.

   POZOR, zmereno 8. 9. 2026 na produkci: co vidi navstevnik, urcuje
   `_redirects`, ne tenhle kod. `wrangler.jsonc` nema `run_worker_first`,
   takze staticke assety (a mezi nimi `_redirects`) se vyhodnocuji DRIV nez
   Worker; sem se dostane jen cesta, pro kterou zadny asset ani zadne
   pravidlo v `_redirects` neexistuje. Puvodni komentar tvrdil opak a mapa
   se za tu dobu tise rozesla se souborem ve dvou cilech (/reseni-ai vedlo
   na /, /reseni-nastroje na vedeni IT). Menit se tedy musi `_redirects`;
   tahle mapa je jen zaloha pro pripad, ze by asset layer vypadl, a MUSI
   s tim souborem souhlasit -- hlida to scripts/kontrola_webu.py. */
const PRESMEROVANI = new Map([
  ['/ai', '/'],
  // Pet zanikajicich cest: v nove strukture jsou to radky v ceniku, ne stranky.
  ['/reseni-ai', '/reseni-podnikova-ai'],
  ['/reseni-naklady', '/reseni-vedeni-it'],
  ['/reseni-nastroje', '/reseni-vyber-systemu'],
  ['/reseni-projekt', '/reseni-vedeni-it'],
  ['/reseni-web', '/weby'],
  // Zadani nove sluzby nahradil Navrh aplikace (24. 9. 2026).
  ['/reseni-zadani', '/navrh-aplikace'],
  // Novy web ma formular primo na hlavni strance.
  ['/kontakt', '/#napiste'],
]);

// Pracovni verze brandu nemaji byt verejne vubec.
const STAZENE_PREFIXY = ['/sk/', '/en/', '/brand-lab'];

/* Brzda na odesilani formularu. Endpoint posila postu z Petrovy schranky:
   bez limitu staci skript, aby za par minut vycerpal denni kvotu Gmailu a
   zastavil VESKEROU odchozi postu, vcetne cold mailu kampane (OWASP review
   8. 9., C1).

   ponytail: pamet je per isolate, ne sdilena -- distribuovany provoz nebo
   novy isolate limit obejde. Zastavi to naivni flood z jedne adresy, coz je
   vetsina. Tvrda obrana je WAF rate limiting rule v Cloudflare dashboardu
   (Security -> WAF, `http.request.uri.path contains "/api/"`, 5 req / 1 min,
   Managed Challenge) nebo Turnstile na formulare -- oboje je Petrovo
   rozhodnuti, tohle bezi mezitim a nic nestoji. */
const BRZDA = new Map();
const BRZDA_OKNO = 60000;
const BRZDA_POCET = 5;

function pustDal(klic) {
  const ted = Date.now();
  const casy = (BRZDA.get(klic) || []).filter((c) => ted - c < BRZDA_OKNO);
  if (casy.length >= BRZDA_POCET) { BRZDA.set(klic, casy); return false; }
  casy.push(ted);
  BRZDA.set(klic, casy);
  if (BRZDA.size > 5000) BRZDA.clear();   // strop pameti isolate
  return true;
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const match = pathname.match(/^\/api\/(dotaznik|kontakt|dodavatel|pristup|hlidac)$/);
    if (match) {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      // Cizi stranka nesmi odeslat formular jmenem navstevnika. Origin muze
      // chybet (curl) nebo byt retezec "null" (sandboxovany ramec) -- oboji
      // je "neni to nase stranka", ale jen "null" by shodilo new URL().
      const origin = request.headers.get('origin');
      if (origin && origin !== new URL(request.url).origin) {
        return new Response('Forbidden', { status: 403 });
      }
      if (!pustDal(request.headers.get('cf-connecting-ip') || 'neznamy')) {
        console.log(JSON.stringify(match[1] === 'hlidac'
          ? { event: 'hlidac.rate_limited', zdroj: 'web-hlidac' }
          : { event: 'form.rate_limited', form: match[1] }));
        const zpet = { pristup: '/podnikova-ai/#pristup', hlidac: '/hlidac-vyzev' }[match[1]] || '/#napiste';
        return errorPage('Formulář jste odeslali několikrát po sobě. Zkuste to prosím za minutu.',
                         { status: 429, zpet });
      }
      if (match[1] === 'hlidac') return handleHlidac(request, env, ctx);
      return handleForm(request, env, match[1], ctx);
    }

    // Osobni odkaz a mereni nepodlehaji brzde pustDal (ta hlida posilani mailu).
    const p = pathname.match(/^\/p\/([A-Za-z0-9_.-]{1,512})$/);
    if (p) return handlePristup(request, env, p[1]);
    if (pathname === '/mereni') return handleMereni(request, env);
    if (pathname === '/api/souhlas/potvrd') return potvrd(request, env);
    if (pathname === '/api/souhlas/odhlas') return odhlas(request, env);

    // Bez koncoveho lomitka, at /kontakt a /kontakt/ konci stejne.
    const cesta = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    const cil = PRESMEROVANI.get(cesta);
    if (cil) return Response.redirect(new URL(cil, request.url), 301);
    if (STAZENE_PREFIXY.some(p => cesta === p.replace(/\/$/, '') || cesta.startsWith(p))) {
      return Response.redirect(new URL('/', request.url), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
