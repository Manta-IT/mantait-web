// Manta IT web: staticke assets + jeden POST endpoint pro formulare.
// Formular je jediny vstupni bod dotacni kampane -- lead se NESMI tise ztratit.
// Pri selhani odeslani vraci stranku s telefonem, ne prazdnou 500.

// Odesila se pres Gmail API primo z pracovni schranky. Puvodni cesta
// (SendGrid, odesilatel formular@manta-it.cz) skoncila 10. 8.: Gmail tu
// domenu s pomlckou oznacoval za pokus vydavat se za mantait.cz a pripsal
// prijemci varovani "zprava muze byt nebezpecna". Posta k webovemu formulari
// musi chodit z tehoz jmena jako web, jinak je podezrela uz z principu.
const NOTIFY_TO = 'petr.kokoska@mantait.cz';
const FROM = { email: 'petr.kokoska@mantait.cz', name: 'Petr Kokoška | Manta IT' };
const TEL = '+420 732 329 431';

const FORMS = {
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
    fields: ['cesta', 'jmeno', 'firma', 'telefon', 'email', 'zprava', 'termin'],
    reply: (d) => {
      if (d.cesta === 'zavolat') {
        return `Dobrý den,

mám vaše číslo a zavolám vám do jednoho pracovního dne.
Kdyby to spěchalo dřív, volejte ${TEL}.

Petr Kokoška
Manta IT | mantait.cz | ${TEL}`;
      }
      if (d.cesta === 'termin') {
        return `Dobrý den,

termín ${d.termin || 'jste vybrali'} jsem si poznamenal a potvrdím vám ho
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
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
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

async function handleForm(request, env, formName, ctx) {
  const form = FORMS[formName];
  const data = Object.fromEntries(await request.formData());

  // honeypot: bot vyplni skryte pole, clovek ne
  // dva honeypoty: `website` (stare stranky) + `kontrolni_udaj` (nove --
  // "website" umi vyplnit autofill prohlizece i poctivemu cloveku a lead
  // by se tise ztratil; OWASP review M2)
  if (data.website || data.kontrolni_udaj) return Response.redirect(new URL(form.dekujeme || '/dekujeme', request.url), 303);

  const zpet = { dotaznik: '/dotace-mas', dodavatel: '/dodavatele' }[formName] || '/kontakt';
  const chybaUzivatele = (msg) => errorPage(msg, { status: 400, zpet });

  const email = (data.email || '').trim();
  const telefon = (data.telefon || '').trim();
  if (!email && !telefon) {
    return chybaUzivatele('Chybí e-mail i telefon, takže bych neměl jak odpovědět.');
  }
  if (email && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return chybaUzivatele('E-mailová adresa nevypadá platně.');
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
  const body = `${form.subject}\n\n${lines.join('\n')}\n\n---\nOdeslano z ${request.headers.get('referer') || 'webu'}`;

  if (!env.GMAIL_REFRESH_TOKEN) {
    return errorPage('Odesílání e-mailu není na serveru nastavené.', { zpet });
  }
  let token;
  try {
    token = await accessToken(env);
    await sendMail(token, NOTIFY_TO, form.subject, body, email || undefined);
  } catch (e) {
    console.error('notifikace selhala', e);
    return errorPage('Server odmítl zprávu odeslat.', { zpet });
  }
  if (email) {
    // potvrzeni klientovi je nice-to-have: lead uz mame, tohle nesmi shodit
    // request. waitUntil: bezi az PO odpovedi -- cekani na druhy mail drzelo
    // redirect 2-4 s a svadelo k opakovanemu kliknuti (4 maily, 31. 8.).
    const potvrzeni = sendMail(token, email, form.replySubject, form.reply(data))
      .catch((e) => console.error('potvrzeni klientovi selhalo', e));
    if (ctx) ctx.waitUntil(potvrzeni); else await potvrzeni;
  }
  return Response.redirect(new URL(form.dekujeme || '/dekujeme', request.url), 303);
}

// Pro scripts/test-mail.mjs -- overuje sestaveni MIME a odeslani proti
// skutecnemu Gmail API bez toho, aby bezel cely Worker.
export { b64, b64url, hlavicka, accessToken, sendMail };

/* Presmerovani po nasazeni redesignu 26. 8. 2026.

   Stranky, ktere jeste nemaji novou podobu, se stahuji z webu. Nemazou se:
   301 posle navstevnika i vyhledavac na nejblizsi zive misto, takze se
   neztrati ani pozice ve vyhledavani, ani clovek, ktery prisel ze stareho
   odkazu nebo z rozeslaneho mailu.

   Proc tady a ne v `_redirects`: web bezi jako Worker se statickymi assety,
   ne jako Pages. Zpracovani `_redirects` se u Workers lisi podle nastaveni,
   takze pravidlo, na kterem zavisi zive URL, patri do kodu, kde je jiste.
   Soubor `_redirects` zustava jako citelny seznam tehoz. */
const PRESMEROVANI = new Map([
  ['/ai', '/'],
  // Pet zanikajicich cest: v nove strukture jsou to radky v ceniku, ne stranky.
  ['/reseni-ai', '/'],
  ['/reseni-naklady', '/reseni-vedeni-it'],
  ['/reseni-nastroje', '/reseni-vedeni-it'],
  ['/reseni-projekt', '/reseni-vedeni-it'],
  ['/reseni-web', '/weby'],
  // Novy web ma formular primo na hlavni strance.
  ['/kontakt', '/#napiste'],
]);

// Pracovni verze brandu nemaji byt verejne vubec.
const STAZENE_PREFIXY = ['/sk/', '/en/', '/brand-lab'];

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const match = pathname.match(/^\/api\/(dotaznik|kontakt|dodavatel)$/);
    if (match) {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      return handleForm(request, env, match[1], ctx);
    }

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
