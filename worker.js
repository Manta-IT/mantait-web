// Manta IT web: staticke assets + jeden POST endpoint pro formulare.
// Formular je jediny vstupni bod dotacni kampane -- lead se NESMI tise ztratit.
// Pri selhani odeslani vraci stranku s telefonem, ne prazdnou 500.

const NOTIFY_TO = 'petr.kokoska@mantait.cz';
const FROM = { email: 'formular@manta-it.cz', name: 'Manta IT - formular' };
const TEL = '+420 732 329 431';

const FORMS = {
  dotaznik: {
    subject: 'Dotace MAS: overeni zpusobilosti',
    fields: ['ico', 'obec', 'zamestnanci', 'ucetni_roky', 'vazby', 'bezdluznost',
             'datovka', 'zamer', 'investice', 'drivejsi_dotace', 'jmeno', 'telefon', 'email', 'mas'],
    reply: (d) => `Dobry den${d.jmeno ? ', ' + d.jmeno : ''},

diky za odeslany dotaznik. Mam ho a projdu ho osobne.

Ozvu se vam do jednoho pracovniho dne s jasnou odpovedi: ano splnujete, ano
s doplnenim (a cim), nebo ne a proc -- vcetne toho, co jde delat misto toho.

Kdyby to bylo naspech nebo chcete cokoliv doresit driv, volejte ${TEL}.

Petr Kokoska
Manta IT | mantait.cz | ${TEL}`,
  },
  kontakt: {
    subject: 'Zprava z kontaktniho formulare',
    fields: ['jmeno', 'firma', 'telefon', 'email', 'zprava'],
    reply: (d) => `Dobry den${d.jmeno ? ', ' + d.jmeno : ''},

diky za zpravu, dorazila mi. Ozvu se vam do jednoho pracovniho dne.
Kdyby to spechalo, volejte ${TEL}.

Petr Kokoska
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

async function sendMail(key, to, subject, text, replyTo) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: FROM,
      ...(replyTo ? { reply_to: { email: replyTo } } : {}),
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
  });
  if (!res.ok) throw new Error(`SendGrid ${res.status}: ${await res.text()}`);
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

  const key = env.SENDGRID_API_KEY;
  if (!key) return errorPage('Odesilani e-mailu neni na serveru nastavene.');

  try {
    await sendMail(key, NOTIFY_TO, form.subject, body, email || undefined);
  } catch (e) {
    console.error('notifikace selhala', e);
    return errorPage('Server odmitl zpravu odeslat.');
  }
  if (email) {
    // potvrzeni klientovi je nice-to-have: lead uz mame, tohle nesmi shodit request
    try {
      await sendMail(key, email, 'Mam vas dotaznik - Manta IT', form.reply(data));
    } catch (e) {
      console.error('potvrzeni klientovi selhalo', e);
    }
  }
  return Response.redirect(new URL('/dekujeme', request.url), 303);
}

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
