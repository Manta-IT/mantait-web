"""Meri prepinani zalozek celku a robotu a vodorovny scroll na 390 a 1440 px.
T0924-426: AI zamestnanec (celky) a robot na zadani (roboti), system Chrome + Playwright."""
import functools
import http.server
import os
import sys
import threading

from playwright.sync_api import sync_playwright

WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
STRANKY = {
    'reseni-ai-zamestnanec.html': ('#celky-zalozky', '#celky .celek', 'celek'),
    'reseni-robot-na-zadani.html': ('#zalozky', '#roboti .robot', 'robot'),
}
SIRKY = ((390, 844), (1440, 900))

VIDITELNE = """([sel, atr]) => {
  const v = [...document.querySelectorAll(sel)].filter(el => el.offsetParent !== null);
  return {n: v.length, hodnota: v.length ? v[0].dataset[atr] : null,
          scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth};
}"""


class TichyHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def over_stranku(page, port, soubor, sirka, chyby):
    zalozky, clanky, atr = STRANKY[soubor]
    page.goto('http://127.0.0.1:%d/%s' % (port, soubor), wait_until='networkidle')
    fieldset = page.locator(zalozky)
    if fieldset.get_attribute('hidden') is not None:
        chyby.append('%d %s: zalozky jsou hidden (JS nebezi)' % (sirka, soubor))
        return
    radia = fieldset.locator('input[type=radio]')
    hodnoty = [radia.nth(i).get_attribute('value') for i in range(radia.count())]
    max_scroll, inner, prepnuti = 0, 0, []
    for hodnota in hodnoty:
        fieldset.locator('label', has=page.locator('input[value="%s"]' % hodnota)).click()
        s = page.evaluate(VIDITELNE, [clanky, atr])
        max_scroll, inner = max(max_scroll, s['scrollWidth']), s['innerWidth']
        ok = s['n'] == 1 and s['hodnota'] == hodnota
        prepnuti.append('%s:%s' % (hodnota, 'ok' if ok else 'CHYBA'))
        if not ok:
            chyby.append('%d %s: po kliku na %s viditelnych %d, zobrazen %s'
                         % (sirka, soubor, hodnota, s['n'], s['hodnota']))
        if s['scrollWidth'] > s['innerWidth']:
            chyby.append('%d %s: po %s scrollWidth %d > innerWidth %d'
                         % (sirka, soubor, hodnota, s['scrollWidth'], s['innerWidth']))
    print('%d %-30s scrollWidth=%d innerWidth=%d zalozek=%d prepnuti=%s'
          % (sirka, soubor, max_scroll, inner, len(hodnoty), ','.join(prepnuti)))


def main():
    server = http.server.ThreadingHTTPServer(
        ('127.0.0.1', 0), functools.partial(TichyHandler, directory=WEB))
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    chyby = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=CHROME, headless=True)
            for sirka, vyska in SIRKY:
                for soubor in STRANKY:
                    page = browser.new_page(viewport={'width': sirka, 'height': vyska})
                    page.on('pageerror', lambda e, s=soubor, w=sirka: chyby.append(
                        '%d %s: chyba JS %s' % (w, s, e)))
                    over_stranku(page, port, soubor, sirka, chyby)
                    page.close()
            browser.close()
    finally:
        server.shutdown()
    if chyby:
        print('SELHALO:')
        for c in chyby:
            print('  ' + c)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
