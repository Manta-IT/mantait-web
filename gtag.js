// Manta IT - Google Ads mereni + Consent Mode v2 + minimalisticka cookie lista.
// Vanilla JS, zadna zavislost. Consent default = denied (EU/EHP), lista ho meni.
(function () {
  var TAG = 'AW-18329667650';
  var CONVERSION = 'AW-18329667650/EdGxCMzp7NEcEMKQoqRE';
  var KEY = 'mantait-consent'; // 'granted' | 'denied'

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2: vse zamitnuto, dokud uzivatel nesouhlasi.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });

  gtag('js', new Date());
  gtag('config', TAG);

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === 'granted') grantConsent();
  else if (stored !== 'denied') showBanner();

  function grantConsent() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  }

  function persist(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function showBanner() {
    // Texty podle jazyka stranky (/sk/ a /en/ mutace sdileji tento skript).
    var lang = (document.documentElement.lang || 'cs').slice(0, 2);
    var texts = {
      cs: { aria: 'Souhlas s cookies', msg: 'Používám cookies k měření návštěvnosti a účinnosti reklamy. Bez souhlasu se nesledujete.', reject: 'Odmítnout', accept: 'Souhlasím' },
      sk: { aria: 'Súhlas s cookies', msg: 'Používam cookies na meranie návštevnosti a účinnosti reklamy. Bez súhlasu vás nesledujem.', reject: 'Odmietnuť', accept: 'Súhlasím' },
      en: { aria: 'Cookie consent', msg: 'I use cookies to measure traffic and ad performance. Without your consent, you are not tracked.', reject: 'Decline', accept: 'Accept' }
    };
    var t = texts[lang] || texts.cs;
    var bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', t.aria);
    bar.innerHTML =
      '<p>' + t.msg + '</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-reject">' + t.reject + '</button>' +
      '<button type="button" class="consent-accept">' + t.accept + '</button>' +
      '</div>';
    document.body.appendChild(bar);

    bar.querySelector('.consent-accept').addEventListener('click', function () {
      grantConsent();
      persist('granted');
      bar.remove();
    });
    bar.querySelector('.consent-reject').addEventListener('click', function () {
      persist('denied');
      bar.remove();
    });
  }

  // Konverze: odeslany formular. Worker po ulozeni presmeruje na /dekujeme,
  // takze konverzi hlasi ta stranka. Bez tohoto se formularovy lead nemeri
  // vubec a kampan se vyhodnoti jako nulova (nalez oponentury 2026-08-11).
  if (/^\/dekujeme/.test(location.pathname)) {
    gtag('event', 'conversion', { send_to: CONVERSION, value: 1.0, currency: 'CZK' });
  }

  // Konverze: klik na telefon.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (t) gtag('event', 'conversion', { send_to: CONVERSION, value: 1.0, currency: 'CZK' });
  });
})();
