# -*- coding: utf-8 -*-
"""Extractor de agregados de Infonecta para el pipeline editorial (PER-30).

Uso:  python tools/infonecta_espejo.py
Lee INFONECTA_LOGIN / INFONECTA_PASSWORD del .env del repo.

Mecánica descubierta (2026-07-10, documentada en BLUEPRINT §14):
1. POST login a /comex/xlogin.asp (campos username/password + hidden postback*).
2. GET /comex/{pais}/{e|i}_main.asp  ← OBLIGATORIO: fija el contexto de la base
   en la sesión ASP; sin esto todo reporte responde "No hay información".
3. GET /comex/{pais}/{e|i}_report.asp?rpt=sum_p&db={pais}&d=AAAAMM&h=AAAAMM&p={partida}
   (&pp=XX filtra por país de procedencia en importaciones).
   Partidas: Bolivia 11 dígitos (p.ej. 15079090000); Perú 10 (1507909000).
4. Rangos de carga verificados el 10-jul-2026: BO hasta 2025-12; PE al día
   (mes corriente parcial — excluirlo de comparativas).

GUARDRAIL (plan maestro §10 / blueprint §14.5): publicar SOLO agregados
(totales, series mensuales, precios implícitos, países). Nunca empresas,
compradores ni operaciones individuales.
"""
import os
import re
import sys
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BASE = "https://beta.infonecta.com"
MESES = {"ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
         "JULIO": 7, "AGOSTO": 8, "SEPTIEMBRE": 9, "SETIEMBRE": 9, "OCTUBRE": 10,
         "NOVIEMBRE": 11, "DICIEMBRE": 12}


def credenciales():
    envf = Path(__file__).resolve().parent.parent / ".env"
    valores = dict(
        line.split("=", 1)
        for line in envf.read_text(encoding="utf-8-sig").splitlines()
        if "=" in line and not line.strip().startswith("#")
    )
    return valores["INFONECTA_LOGIN"].strip(), valores["INFONECTA_PASSWORD"].strip()


def sesion():
    user, pw = credenciales()
    s = requests.Session()
    s.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126"
    r = s.get(f"{BASE}/comex/xlogin.asp", timeout=30)
    hidden = dict(re.findall(r'name=["\']?(postback\w*)["\']?[^>]*value=["\']([^"\']*)', r.text, re.I))
    r2 = s.post(f"{BASE}/comex/xlogin.asp", data={**hidden, "username": user, "password": pw}, timeout=30)
    if "xmain" not in r2.url:
        raise RuntimeError("login de Infonecta falló")
    return s


def serie_mensual(html):
    """[(mes, fob_usd, kg)] de la tabla 'Año|Mes|Total FOB|Peso Neto|...' del reporte."""
    out = []
    for t in re.findall(r"<table[^>]*>(.*?)</table>", html, re.S | re.I):
        filas = [[re.sub(r"<[^>]+>", "", c).replace("&nbsp;", " ").strip()
                  for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", f, re.S | re.I)]
                 for f in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S | re.I)]
        if not filas or not any("MES" in (c or "").upper() for c in filas[0]):
            continue
        for f in filas[1:]:
            c = [x for x in f if x != ""] or f
            if c and re.match(r"^20\d\d$", c[0]):
                c = c[1:]
            if c and c[0].upper() in MESES and len(c) >= 3:
                try:
                    out.append((MESES[c[0].upper()], float(c[1].replace(",", "")), float(c[2].replace(",", ""))))
                except ValueError:
                    pass
        if out:
            break
    return sorted(out)


def consultar(s, pais, flujo, partida, desde, hasta, procedencia=None):
    """Serie mensual agregada de una partida. flujo: 'e' export / 'i' import."""
    s.get(f"{BASE}/comex/{pais}/{flujo}_main.asp", timeout=45)
    pp = f"&pp={procedencia}" if procedencia else ""
    url = f"{BASE}/comex/{pais}/{flujo}_report.asp?rpt=sum_p&db={pais}&d={desde}&h={hasta}&p={partida}{pp}"
    html = s.get(url, timeout=60).text
    return [] if "No hay informaci" in html else serie_mensual(html)


if __name__ == "__main__":
    s = sesion()
    print("Espejo peruano — importaciones desde Bolivia (sum_p, agregados):")
    for nombre, partida in [("Aceite refinado 1507.90.90", "1507909000"), ("Torta/harina 2304", "2304000000")]:
        for anio in ("2025", "2026"):
            serie = consultar(s, "pe", "i", partida, f"{anio}01", f"{anio}06", procedencia="BO")
            tot = sum(x[1] for x in serie)
            kg = sum(x[2] for x in serie)
            print(f"  {nombre} {anio} (meses {len(serie)}): US$ {tot:,.0f} | {kg:,.0f} kg")
