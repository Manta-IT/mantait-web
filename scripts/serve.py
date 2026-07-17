"""Lokalni preview server s extensionless URL jako Cloudflare Pages.

Spusteni z adresare web/:  python scripts/serve.py  ->  http://localhost:8773
"""
import http.server
import os


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p) and os.path.exists(p + ".html"):
            return p + ".html"
        return p


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("", 8773), Handler).serve_forever()
