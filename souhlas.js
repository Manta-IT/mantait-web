// Hlidac dotacnich vyzev (specs/web-hlidac-dotacnich-vyzev-prihlaseni-k/): prihlaseni,
// potvrzovaci odkaz a zapis udalosti souhlasu do D1. Jen WebCrypto (Workers i Node 20+).
//
// Token MUSI byt bajtove stejny jako token() ve scripts/stroj/souhlasy.py:
// b64url("adresa|cas|ucel") bez "=" + "." + HMAC-SHA256 jako hex malymi pismeny.
// Worker.js se odsud neimportuje (cyklus) -- posilani mailu predava volajici.

export const UCELY = ['potvrdit', 'odhlasit'];
export const ZDROJE_WEB = ['web-hlidac', 'dotaznik'];
export const PLATNOST_POTVRZENI_DNU = 30;          // odhlaseni neexpiruje

const enc = new TextEncoder();
const DEN_MS = 86400000;
const EMAIL_RE = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hmacKlic(klic, pouziti) {
  return crypto.subtle.importKey('raw', enc.encode(klic), { name: 'HMAC', hash: 'SHA-256' }, false, [pouziti]);
}

// Tvar Pythonu datetime.isoformat(timespec="seconds") v UTC: 2026-09-26T12:00:00+00:00
export const casIso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, '+00:00');

/** Tvar = souhlasy.token(): b64url("adresa|cas|ucel") + "." + hex(HMAC-SHA256). */
export async function podpisSouhlas(adresa, cas, ucel, klic) {
  if (!UCELY.includes(ucel)) throw new Error(`neznamy ucel: ${ucel}`);
  const zprava = enc.encode(`${adresa}|${cas}|${ucel}`);
  const s = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKlic(klic, 'sign'), zprava));
  return `${b64url(zprava)}.${Array.from(s, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

export async function overSouhlasToken(t, ucel, klic, ted) {
  if (!klic || typeof t !== 'string' || t.length > 1024) return null;
  const i = t.lastIndexOf('.');
  if (i < 0) return null;
  const b64 = t.slice(0, i);
  const podpis = t.slice(i + 1);
  if (!/^[A-Za-z0-9_-]*$/.test(b64) || !/^[0-9a-f]{64}$/.test(podpis)) return null;
  let bajty;
  let zprava;
  try {
    bajty = Uint8Array.from(atob(b64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    zprava = new TextDecoder('utf-8', { fatal: true }).decode(bajty);
  } catch {
    return null;
  }
  const podpisBajty = Uint8Array.from(podpis.match(/../g), (h) => parseInt(h, 16));
  // verify porovnava v konstantnim case
  if (!await crypto.subtle.verify('HMAC', await hmacKlic(klic, 'verify'), podpisBajty, bajty)) return null;
  const j = zprava.lastIndexOf('|');
  const k = j < 0 ? -1 : zprava.lastIndexOf('|', j - 1);
  if (k < 0) return null;
  const adresa = zprava.slice(0, k);
  const cas = zprava.slice(k + 1, j);
  if (zprava.slice(j + 1) !== ucel) return null;
  if (ucel === 'potvrdit') {
    const vydano = Date.parse(cas);
    if (Number.isNaN(vydano) || ted - vydano > PLATNOST_POTVRZENI_DNU * DEN_MS) return null;
  }
  return { adresa, cas };
}

const radek = (v) => String(v || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 200);

/** @returns {{adresa:string, region:string, obor:string} | {chyba:string}} */
export function validujPrihlaseni(data) {
  const adresa = String(data.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(adresa)) return { chyba: 'E-mailová adresa nevypadá platně.' };
  if (data.souhlas !== 'ano') return { chyba: 'Bez souhlasu se zasíláním upozornění vás nemohu přihlásit.' };
  const region = radek(data.region);
  const obor = radek(data.obor);
  if (!region || !obor) return { chyba: 'Vyplňte prosím region i obor.' };
  return { adresa, region, obor };
}

async function zapisUdalost(db, { adresa, udalost, zdroj, cas, zneni, region, obor, ip }) {
  await db.prepare('INSERT INTO souhlas_udalosti (adresa, udalost, zdroj, cas, zneni, region, obor, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(adresa, udalost, zdroj, cas, zneni ?? null, region ?? null, obor ?? null, ip ?? null).run();
}

const PREDMET = 'Potvrďte přihlášení k hlídači výzev';
// ZNENI_V0: placeholder, finalni text schvaluje Petr (T0926-219).
const teloMailu = (odkaz) => `Přihlášení k hlídači dotačních výzev potvrďte tímto odkazem: ${odkaz}\n\n`
  + 'Petr Kokoška\nManta IT | mantait.cz';

/** Zapise 'zapsan' a posle potvrzovaci mail. Bez env.DB / klice -> Response 503.
 *  posta = { posli(to, predmet, telo), puvod: 'https://host' } -- odesilani dodava worker.js. */
export async function prihlas(env, ctx, udaje, zdroj, zneniVerze, ip, posta) {
  const klic = env.MANTA_SOUHLAS_KLIC;
  if (!env.DB || !klic) return new Response('Service unavailable', { status: 503 });
  if (!ZDROJE_WEB.includes(zdroj)) throw new Error(`neznamy zdroj: ${zdroj}`);
  const cas = casIso(Date.now());
  await zapisUdalost(env.DB, { ...udaje, udalost: 'zapsan', zdroj, cas, zneni: zneniVerze, ip });
  console.log(JSON.stringify({ event: 'hlidac.zapsan', zdroj }));
  const t = await podpisSouhlas(udaje.adresa, cas, 'potvrdit', klic);
  const odkaz = `${posta.puvod}/api/souhlas/potvrd?t=${encodeURIComponent(t)}`;
  const mail = posta.posli(udaje.adresa, PREDMET, teloMailu(odkaz))
    .catch((e) => console.error(JSON.stringify({ event: 'hlidac.mail_selhal', zdroj, chyba: String(e?.message || e) })));
  if (ctx) ctx.waitUntil(mail); else await mail;
  return null;
}

const ODKAZ_NEPLATI = '<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="robots" content="noindex">'
  + '<title>Odkaz neplatí</title><body><h1>Odkaz neplatí</h1>'
  + '<p>Platnost odkazu vypršela nebo je poškozený. Přihlaste se prosím znovu na <a href="/hlidac-vyzev">mantait.cz/hlidac-vyzev</a>.</p></body></html>';

export async function potvrd(request, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  const klic = env.MANTA_SOUHLAS_KLIC;
  if (!env.DB || !klic) return new Response('Service unavailable', { status: 503 });
  const t = new URL(request.url).searchParams.get('t');
  const r = await overSouhlasToken(t, 'potvrdit', klic, Date.now());
  if (!r) {
    return new Response(ODKAZ_NEPLATI, { status: 403, headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer',
    } });
  }
  await zapisUdalost(env.DB, { adresa: r.adresa, udalost: 'potvrzen', zdroj: 'odkaz', cas: casIso(Date.now()) });
  console.log(JSON.stringify({ event: 'hlidac.potvrzen', zdroj: 'odkaz' }));
  return Response.redirect(new URL('/hlidac-vyzev/potvrzeno', request.url), 303);
}
