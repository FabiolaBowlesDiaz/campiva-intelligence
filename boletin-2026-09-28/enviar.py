# Crea la campaña del boletín semanal en Brevo, programada para AHORA + 4 horas.
# La clave se lee del .env local; no se guarda en este archivo.
import requests, datetime as dt, os

ENV = r"C:\Users\Lenovo\dev\campiva-intelligence\.env"
HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), "boletin.html")

key = [l.split("=", 1)[1].strip() for l in open(ENV, encoding="utf-8") if l.startswith("BREVO_API_KEY=")][0]
h = {"api-key": key, "accept": "application/json"}
now = dt.datetime.now(dt.timezone.utc)
at = (now + dt.timedelta(hours=4)).replace(second=0, microsecond=0)
body = {
    "name": f"Boletín semanal {now.date().isoformat()}",
    "subject": "EE.UU. mira su diésel; Bolivia ya lo paga a Houston",
    "sender": {"name": "Campiva Intelligence", "email": "rcampbell@campivacorp.com"},
    "type": "classic",
    "htmlContent": open(HTML, encoding="utf-8").read(),
    "recipients": {"listIds": [3]},
    "scheduledAt": at.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
}
r = requests.post("https://api.brevo.com/v3/emailCampaigns", json=body, headers=h, timeout=30)
print(r.status_code, r.text)
print("Programada para", body["scheduledAt"], "UTC =", (at - dt.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M"), "hora Bolivia")
