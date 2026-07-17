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
    var bar = document.createElement('div');
    bar.className = 'consent-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Souhlas s cookies');
    bar.innerHTML =
      '<p>Pouzivam cookies k mereni navstevnosti a ucinnosti reklamy. ' +
      'Bez souhlasu se nesledujete.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-reject">Odmitnout</button>' +
      '<button type="button" class="consent-accept">Souhlasim</button>' +
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

  // Konverze: klik na kterekoli CTA s data-calendly (otevreni rezervace).
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-calendly]');
    if (t) gtag('event', 'conversion', { send_to: CONVERSION, value: 1.0, currency: 'CZK' });
  });
})();
