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
  dotaznik: {
    subject: 'Dotace MAS: ověření způsobilosti',
    replySubject: 'Mám váš dotazník - Manta IT',
    fields: ['ico', 'obec', 'zamestnanci', 'ucetni_roky', 'vazby', 'bezdluznost',
             'datovka', 'zamer', 'investice', 'drivejsi_dotace', 'jmeno', 'telefon', 'email', 'mas'],
    reply: (d) => `Dobrý den${d.jmeno ? ', ' + d.jmeno : ''},

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
    fields: ['jmeno', 'firma', 'telefon', 'email', 'zprava'],
    reply: (d) => `Dobrý den${d.jmeno ? ', ' + d.jmeno : ''},

díky za zprávu, dorazila mi. Ozvu se vám do jednoho pracovního dne.
Kdyby to spěchalo, volejte ${TEL}.

Petr Kokoška
Manta IT | mantait.cz | ${TEL}`,
  },
};

function errorPage(msg) {
  return new Response(
    `<!doctype html><html lang="cs"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Formular se neodeslal | Manta IT</title>
<link rel="stylesheet" href="/style.css"></head><body>
<main style="max-width:640px;margin:80px auto;padding:0 24px">
<h1>Formular se neodeslal</h1>
<p>${msg} Omlouvam se. Napiste mi prosim primo na
<a href="mailto:${NOTIFY_TO}">${NOTIFY_TO}</a> nebo volejte
<a href="tel:+420732329431">${TEL}</a> -- odpovim stejne rychle.</p>
<p><a href="/dotace-mas">Zpet na stranku</a></p>
</main></body></html>`,
    { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
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

async function handleForm(request, env, formName) {
  const form = FORMS[formName];
  const data = Object.fromEntries(await request.formData());

  // honeypot: bot vyplni skryte pole, clovek ne
  if (data.website) return Response.redirect(new URL('/dekujeme', request.url), 303);

  const email = (data.email || '').trim();
  const telefon = (data.telefon || '').trim();
  if (!email && !telefon) {
    return errorPage('Chybi e-mail i telefon, takze bych nemel jak odpovedet.');
  }
  if (email && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return errorPage('E-mailova adresa nevypada platne.');
  }

  const lines = form.fields
    .filter((f) => (data[f] || '').trim())
    .map((f) => `${f}: ${String(data[f]).trim().slice(0, 2000)}`);
  const body = `${form.subject}\n\n${lines.join('\n')}\n\n---\nOdeslano z ${request.headers.get('referer') || 'webu'}`;

  if (!env.GMAIL_REFRESH_TOKEN) {
    return errorPage('Odesilani e-mailu neni na serveru nastavene.');
  }
  let token;
  try {
    token = await accessToken(env);
    await sendMail(token, NOTIFY_TO, form.subject, body, email || undefined);
  } catch (e) {
    console.error('notifikace selhala', e);
    return errorPage('Server odmitl zpravu odeslat.');
  }
  if (email) {
    // potvrzeni klientovi je nice-to-have: lead uz mame, tohle nesmi shodit request
    try {
      await sendMail(token, email, form.replySubject, form.reply(data));
    } catch (e) {
      console.error('potvrzeni klientovi selhalo', e);
    }
  }
  return Response.redirect(new URL('/dekujeme', request.url), 303);
}

// Pro scripts/test-mail.mjs -- overuje sestaveni MIME a odeslani proti
// skutecnemu Gmail API bez toho, aby bezel cely Worker.
export { b64, b64url, hlavicka, accessToken, sendMail };

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const match = pathname.match(/^\/api\/(dotaznik|kontakt)$/);
    if (match) {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      return handleForm(request, env, match[1]);
    }
    return env.ASSETS.fetch(request);
  },
};
