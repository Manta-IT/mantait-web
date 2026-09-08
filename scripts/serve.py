"""Lokalni preview server s extensionless URL jako Cloudflare Workers.

Spusteni z adresare web/:  python scripts/serve.py  ->  http://localhost:8773

Komprimuje a posila stejne cache hlavicky jako produkce (`_headers`). Bez toho
Lighthouse lokalne meril o 10-20 bodu Performance min nez zivy web a rozdil
nesel odlisit od dopadu vlastni zmeny (nalez 8. 9. 2026).
"""
import gzip
import http.server
import io
import os

IMMUTABLE = ('.css', '.js', '.woff2', '.svg', '.png', '.jpg', '.webp')
KOMPRIMOVAT = ('.html', '.css', '.js', '.svg', '.json', '.xml', '.txt')


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p) and os.path.exists(p + ".html"):
            return p + ".html"
        # Slozka -> index.html rovnou tady. Kdyz se to nechalo na zakladni
        # tride, "/" a "/clanky/" ji propadly i s jejimi hlavickami, takze
        # dve nejmerenejsi URL jely bez komprese a bez Cache-Control.
        if os.path.isdir(p) and os.path.isfile(os.path.join(p, 'index.html')):
            return os.path.join(p, 'index.html')
        return p

    def send_head(self):
        cesta = self.translate_path(self.path)
        if not os.path.isfile(cesta):
            self.send_error(404)
            return None

        pripona = os.path.splitext(cesta)[1].lower()
        data = open(cesta, 'rb').read()
        hlavicky = [('Content-Type', self.guess_type(cesta))]
        if pripona in IMMUTABLE:
            hlavicky.append(('Cache-Control', 'public, max-age=31536000, immutable'))
        else:
            hlavicky.append(('Cache-Control', 'public, max-age=0, must-revalidate'))

        if pripona in KOMPRIMOVAT and 'gzip' in self.headers.get('Accept-Encoding', ''):
            data = gzip.compress(data, 6)
            hlavicky.append(('Content-Encoding', 'gzip'))

        self.send_response(200)
        for k, v in hlavicky:
            self.send_header(k, v)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        return io.BytesIO(data)


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("", 8773), Handler).serve_forever()
