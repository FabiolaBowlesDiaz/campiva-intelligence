# -*- coding: utf-8 -*-
import json, html, io, sys, datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

d = json.load(open('semana.json', encoding='utf-8'))
analisis = d.get('analisis', [])
radar = d.get('radar', [])

if len(analisis) < 1:
    print('SIN_CONTENIDO')
    sys.exit(0)

MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
         'septiembre','octubre','noviembre','diciembre']

hoy = datetime.date.today()
desde = datetime.date.fromisoformat(d['desde'])
if desde.month == hoy.month:
    rango = f"{desde.day} al {hoy.day} de {MESES[hoy.month-1]} de {hoy.year}"
else:
    rango = f"{desde.day} de {MESES[desde.month-1]} al {hoy.day} de {MESES[hoy.month-1]} de {hoy.year}"

def recorta(t, lim=300):
    t = (t or '').strip()
    if len(t) <= lim:
        return t
    corte = t[:lim]
    p = corte.rfind('. ')
    if p > 120:
        return corte[:p+1]
    return corte.rsplit(' ', 1)[0].rstrip(',;:') + '…'

e = html.escape
top = sorted(analisis, key=lambda a: a.get('score') or 0, reverse=True)[:5]

tarjetas = []
for a in top:
    kicker = (a.get('kicker') or '').strip()
    k_html = (f'<p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;'
              f'letter-spacing:1.5px;color:#a87b24;">{e(kicker)}</p>') if kicker else ''
    tarjetas.append(
f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
<tr><td style="padding:18px 20px;">
{k_html}<a href="{e(a['url'])}" style="font-size:17px;font-weight:bold;color:#0b1a2e;text-decoration:none;font-family:Georgia,serif;line-height:1.3;">{e(a['title'])}</a>
<p style="margin:8px 0 0;font-size:13px;color:#475569;line-height:1.5;">{e(recorta(a.get('lectura')))}</p>
</td></tr></table>''')

items = []
for r in radar[:6]:
    items.append(
f'''<tr><td style="padding:0 0 14px;">
<a href="{e(r['url'])}" style="font-size:14px;font-weight:bold;color:#0b1a2e;text-decoration:none;line-height:1.4;">{e(r['titular'])}</a>
<p style="margin:4px 0 0;font-size:11px;color:#94a3b8;line-height:1.4;">{e(r.get('fuente',''))}</p>
</td></tr>''')

gancho = ('La semana la movió lo que rodea al precio: el flete del crudo y del granel subió muy por encima '
          'de la mercancía que transporta, la carne brasileña cambió de destino tras la salvaguardia china '
          'y la revisión del empleo en EE.UU. dio vuelta la lectura de julio.')

body = f'''<p style="margin:0 0 22px;font-size:14px;color:#334155;line-height:1.6;">Lo publicado del {rango}. {gancho}</p>

<p style="margin:0 0 14px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#0b1a2e;border-bottom:2px solid #95b444;padding-bottom:6px;">Los análisis de la semana</p>
{''.join(tarjetas)}

<p style="margin:28px 0 14px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#0b1a2e;border-bottom:2px solid #95b444;padding-bottom:6px;">En el radar</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{''.join(items)}</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;"><tr><td align="center">
<a href="https://intelligence.campivacorp.com" style="display:inline-block;background:#0b1a2e;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:13px 28px;border-radius:8px;">Ver todo en Campiva Intelligence</a>
</td></tr></table>'''

heading = 'El resumen de la semana'
preheader = 'Flete, carne brasileña, café y el dato de empleo: lo que dejó la semana.'

html_out = f'''<div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{e(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#0b1a2e;padding:12px 0;border-top:6px solid #95b444;text-align:center;">
<span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">campiva</span><span style="font-size:20px;font-weight:300;color:#b9cbe0;"> intelligence</span><span style="font-size:20px;font-weight:800;color:#cbdc53;">.</span>
</td></tr>
<tr><td style="padding:34px 40px;">
<h1 style="margin:0 0 18px;font-size:23px;line-height:1.25;color:#0b1a2e;font-family:Georgia,serif;">{heading}</h1>
{body}
</td></tr>
<tr><td style="background:#060f1c;padding:18px 40px;text-align:center;">
<p style="margin:0 0 6px;font-size:11px;color:#7c8da6;line-height:1.5;">Campiva Intelligence · el desk de mercados agro de Campivacorp</p>
<p style="margin:0;font-size:11px;color:#5f6f86;line-height:1.5;"><a href="{{{{ unsubscribe }}}}" style="color:#7c8da6;">Darte de baja</a></p>
</td></tr>
</table></td></tr></table></div>'''

open('boletin.html', 'w', encoding='utf-8').write(html_out)
print('OK rango:', rango)
print('tarjetas:', len(tarjetas), 'radar:', len(items), 'bytes:', len(html_out))
for a in top:
    print(' -', a['score'], a['title'][:80])
    print('     lectura recortada:', recorta(a.get('lectura')))
