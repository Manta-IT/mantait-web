-- append-only; id je kurzor souhlasy_sync.py (T0926-214)
CREATE TABLE IF NOT EXISTS souhlas_udalosti (id INTEGER PRIMARY KEY AUTOINCREMENT, adresa TEXT NOT NULL,
  udalost TEXT NOT NULL CHECK (udalost IN ('zapsan','potvrzen','odvolan')), zdroj TEXT NOT NULL,
  cas TEXT NOT NULL, zneni TEXT, region TEXT, obor TEXT, ip TEXT);
