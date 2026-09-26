// Brana k prototypu Podnikove AI (specs/brana-o-tri-otazky-formular-proverka-fir/):
// bezstavovy HMAC token osobniho odkazu, vodoznak a validace davky mereni.
// Cista logika bez I/O -- jen WebCrypto a TextEncoder (Workers i Node 20+).
//
// Kanonicky tvar tokenu MUSI sedet s tools/podnikova-ai-pristup/pristup.py
// (poradi klicu z,j,d,e,n; JSON bez mezer; non-ASCII neescapovane; b64url bez =).
// Shodu hlida spolecny literal VEKTOR v test-pristup.mjs a test_pristup.py.

const enc = new TextEncoder();
const TOKEN_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const DATUM_RE = /^\d{4}-\d{2}-\d{2}$/;

// Klice TIT ze specs/podnikova-ai/prototyp/portal.html (r. 1700-1724) + 'odd', 'agent'.
// Po zmene obrazovek v portalu doplnit i sem, jinak /mereni udalost odmitne (400).
export const VIEWS = new Set([
  'uvod', 'dal', 'prehled', 'schvaleni', 'notifikace', 'nastaveni', 'chat', 'soubory',
  'agenti', 'pipeliny', 'reporty', 'tym', 'projev', 'kdebezi', 'prezkoumani', 'vyjimky',
  'konektory', 'znalost', 'stroje', 'modely', 'opravneni', 'bezpecnost', 'audit', 'naklady',
  'rozvoj', 'odd', 'agent',
]);

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function zB64url(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

function hmacKlic(klic, pouziti) {
  return crypto.subtle.importKey('raw', enc.encode(klic), { name: 'HMAC', hash: 'SHA-256' }, false, [pouziti]);
}

export async function podpisToken(payload, klic) {
  const n = String(payload.n ?? '1');
  const p = b64url(enc.encode(JSON.stringify({ z: payload.z, j: payload.j, d: payload.d, e: payload.e, n })));
  const s = await crypto.subtle.sign('HMAC', await hmacKlic(klic, 'sign'), enc.encode(p));
  return `${p}.${b64url(new Uint8Array(s))}`;
}

const VYDANI_RE = /^[1-9]\d{0,3}$/;

export async function overToken(retezec, klic, dnes, zrusene) {
  if (!klic || typeof retezec !== 'string' || retezec.length > 512 || !TOKEN_RE.test(retezec)) return null;
  const [p, s] = retezec.split('.');
  let platny;
  try {
    platny = await crypto.subtle.verify('HMAC', await hmacKlic(klic, 'verify'), zB64url(s), enc.encode(p));
  } catch {
    return null;   // rozbite base64 podpisu = neplatny token, ne chyba serveru
  }
  if (!platny) return null;
  let t;
  try {
    t = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(zB64url(p)));
  } catch {
    return null;
  }
  if (!t || typeof t !== 'object' || Array.isArray(t)) return null;
  const klice = Object.keys(t).sort().join(',');
  if (klice !== 'd,e,j,n,z' || !['z', 'j', 'd', 'e', 'n'].every((k) => typeof t[k] === 'string')) return null;
  if (!DATUM_RE.test(t.e) || !VYDANI_RE.test(t.n) || dnes > t.e) return null;
  if (zrusene.has(t.z) || zrusene.has(`${t.z}:${t.n}`)) return null;
  return { z: t.z, j: t.j, d: t.d, e: t.e, n: t.n };
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapuj = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

export function vlozVodoznak(html, token, retezec) {
  const vlozka = '<div class="pristup-vodoznak" aria-hidden="true" style="position:fixed;right:12px;'
    + 'bottom:12px;opacity:.55;font-size:12px;pointer-events:none;z-index:9999">'
    + `${escapuj(`${token.j} · ${token.d}`)}</div>`
    + `<script>window.PRISTUP_T=${JSON.stringify(retezec).replace(/</g, '\\u003c')};</script>`;
  const i = html.lastIndexOf('</body>');
  return i < 0 ? html + vlozka : html.slice(0, i) + vlozka + html.slice(i);
}

export function validujDavku(telo) {
  if (!telo || typeof telo !== 'object') return null;
  const { t, u } = telo;
  if (typeof t !== 'string' || t.length > 512) return null;
  if (!Array.isArray(u) || u.length < 1 || u.length > 50) return null;
  const vystup = [];
  for (const x of u) {
    if (!x || typeof x !== 'object') return null;
    const { v, o, ts } = x;
    if (typeof v !== 'string' || v.length > 40 || !VIEWS.has(v.split(':')[0])) return null;
    if (typeof o !== 'string' || o.length > 20) return null;
    if (!Number.isInteger(ts) || ts <= 0) return null;
    vystup.push({ v, o, ts });
  }
  return { t, u: vystup };
}
