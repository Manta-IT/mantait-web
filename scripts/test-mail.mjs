// Overi odesilaci cestu formulare proti skutecnemu Gmail API.
// Testuje funkce primo z worker.js, takze kontroluje produkcni kod,
// ne jeho kopii. Wrangler dev se pri kazdem POSTu restartoval, proto
// tudy.
//
// Spusteni (z adresare web/):
//   node scripts/test-mail.mjs                # jen sestavi MIME, neodesila
//   node scripts/test-mail.mjs --odeslat      # posle testovaci mail
//
// Cte stejne promenne jako Worker, z .dev.vars.
import { readFileSync } from 'node:fs';
import { b64, hlavicka, accessToken, sendMail } from '../worker.js';

// .dev.vars psany na Windows ma CRLF; \r na konci hodnoty udela
// z client_id neplatny udaj a OAuth vrati "invalid_client".
const env = Object.fromEntries(
  readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(Boolean).map((r) => {
      const i = r.indexOf('=');
      return [r.slice(0, i).trim(), r.slice(i + 1).trim()];
    }),
);

let chyby = 0;
const overit = (co, podminka) => {
  if (podminka) { console.log(`  OK   ${co}`); } else { console.log(`  FAIL ${co}`); chyby++; }
};

console.log('Kodovani:');
overit('ASCII hlavicka zustava citelna', hlavicka('Dotace MAS') === 'Dotace MAS');
overit('diakritika se koduje dle RFC 2047', hlavicka('Kokoška').startsWith('=?UTF-8?B?'));
overit('base64 diakritiky je zpetne dekodovatelny',
  Buffer.from(b64('Příliš žluťoučký kůň'), 'base64').toString('utf8') === 'Příliš žluťoučký kůň');

if (!process.argv.includes('--odeslat')) {
  console.log('\n(bez --odeslat se nic neposila)');
  process.exit(chyby ? 1 : 0);
}

console.log('\nOdeslani pres Gmail API:');
try {
  const token = await accessToken(env);
  overit('OAuth vratil access token', typeof token === 'string' && token.length > 20);
  await sendMail(
    token,
    'kokoska.petr@gmail.com',
    'Dotace MAS: overeni zpusobilosti (test odesilaci cesty)',
    'Testovaci zprava z formularoveho Workeru pres Gmail API.\n\n'
    + 'Odesilatel je petr.kokoska@mantait.cz, tedy stejna domena jako web.\n'
    + 'Drive to chodilo z formular@manta-it.cz a Gmail k tomu pripisoval\n'
    + 'varovani, ze se adresa muze snazit vydavat za pravou.\n\n'
    + 'Diakritika na kontrolu: Příliš žluťoučký kůň úpěl ďábelské ódy.\n',
    'kokoska.petr@gmail.com',
  );
  overit('mail odeslan bez chyby', true);
} catch (e) {
  console.log(`  FAIL odeslani: ${e.message}`);
  chyby++;
}

console.log(chyby ? `\n${chyby} chyb` : '\nvse proslo');
process.exit(chyby ? 1 : 0);
