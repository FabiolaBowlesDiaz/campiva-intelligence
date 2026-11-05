# -*- coding: utf-8 -*-
# Crea la campaña del boletín semanal en Brevo, PROGRAMADA para dentro de 4 horas.
# No envía nada de inmediato. Lee la clave de ..\.env y no la imprime.
# Uso:  python enviar.py
import io, sys, json, datetime, urllib.request, urllib.error, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

AQUI = os.path.dirname(os.path.abspath(__file__))
ENV = r'C:\Users\Lenovo\dev\campiva-intelligence\.env'

KEY = None
for line in open(ENV, encoding='utf-8'):
    line = line.strip()
    if line.startswith('BREVO_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
if not KEY:
    print('ERROR: BREVO_API_KEY no encontrada en', ENV)
    sys.exit(1)

H = {'api-key': KEY, 'content-type': 'application/json', 'accept': 'application/json'}


def call(url, data=None, method='GET'):
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body, headers=H, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read().decode('utf-8') or '{}')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')


st, lista = call('https://api.brevo.com/v3/contacts/lists/3')
print('LISTA status:', st)
if st == 200:
    print('  nombre:', lista.get('name'),
          '| suscriptores:', lista.get('totalSubscribers'),
          '| blacklisted:', lista.get('totalBlacklisted'))
else:
    print('  ', str(lista)[:400])

ahora = datetime.datetime.now(datetime.timezone.utc)
sched = (ahora + datetime.timedelta(hours=4)).replace(second=0, microsecond=0)
sched_iso = sched.strftime('%Y-%m-%dT%H:%M:00.000Z')
bolivia = sched - datetime.timedelta(hours=4)
print('AHORA UTC :', ahora.strftime('%Y-%m-%d %H:%M'))
print('SCHEDULED :', sched_iso, '| hora Bolivia:', bolivia.strftime('%Y-%m-%d %H:%M'))

html = open(os.path.join(AQUI, 'boletin.html'), encoding='utf-8').read()
if '{{ unsubscribe }}' not in html:
    print('ERROR: falta el enlace de baja {{ unsubscribe }}')
    sys.exit(1)

payload = {
    "name": "Boletín semanal " + datetime.date.today().isoformat(),
    "subject": "La soya le ganó al gas, pero cobra menos por tonelada",
    "sender": {"name": "Campiva Intelligence", "email": "rcampbell@campivacorp.com"},
    "type": "classic",
    "htmlContent": html,
    "recipients": {"listIds": [3]},
    "scheduledAt": sched_iso,
}
st, resp = call('https://api.brevo.com/v3/emailCampaigns', payload, 'POST')
print('CAMPANA status:', st)
print('CAMPANA resp  :', str(resp)[:800])
if st == 201:
    print('OK -> campaña programada. Revisala en Brevo > Campañas antes de esa hora.')
