#!/usr/bin/env python3
"""
Sube los afiches de tu carpeta local a Supabase Storage y los vincula
a cada película en la base de datos.

CÓMO USARLO (correr en TU computadora, donde está la carpeta de fotos):

  1) pip install supabase
  2) Definí las variables de entorno (o pasalas por línea de comando):
       export SUPABASE_URL="https://TU-PROYECTO.supabase.co"
       export SUPABASE_KEY="TU-ANON-KEY-PUBLICA"

  3) Primera pasada (solo revisar, no sube nada todavía):
       python upload_posters.py --carpeta "C:/Fotos/Afiches"

     Esto genera un archivo "afiche_matches.csv" con la propuesta de
     qué archivo va con qué película (por número de ficha, o por
     coincidencia de título si el archivo no es numérico).

  4) Abrí afiche_matches.csv (por ejemplo en Excel), revisá la columna
     "id_pelicula" y "titulo" para confirmar que cada foto matchea con
     la película correcta. Borrá o corregí las filas que estén mal.
     Las filas con match_ok=NO no se van a subir hasta que las corrijas.

  5) Cuando estés conforme, corré de nuevo con --confirmar para subir
     de verdad los archivos y actualizar poster_url en la base:

       python upload_posters.py --carpeta "C:/Fotos/Afiches" --confirmar

TIP DE NOMBRES DE ARCHIVO:
  - Si tus fotos se llaman "23.jpg", "145.png", etc. (el número de
    ficha del catálogo viejo de Access), el matching es exacto y no
    hace falta revisar casi nada.
  - Si se llaman por título ("Tiburon.jpg", "rambo 1982.jpg", etc.)
    el script busca la película más parecida por nombre — por eso es
    importante revisar el CSV antes de confirmar.
"""

import argparse
import csv
import os
import re
import sys
import difflib

IMG_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}


def normalize(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9áéíóúñü ]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def main():
    ap = argparse.ArgumentParser(description='Sube afiches a Supabase Storage')
    ap.add_argument('--carpeta', required=True, help='Carpeta con los afiches')
    ap.add_argument('--url', default=os.environ.get('SUPABASE_URL'))
    ap.add_argument('--key', default=os.environ.get('SUPABASE_KEY'))
    ap.add_argument('--confirmar', action='store_true',
                     help='Sube de verdad usando afiche_matches.csv ya revisado')
    ap.add_argument('--umbral', type=float, default=0.55,
                     help='Similitud mínima (0-1) para sugerir un match por título')
    args = ap.parse_args()

    if not args.url or not args.key:
        sys.exit('Falta SUPABASE_URL / SUPABASE_KEY (variables de entorno o --url/--key)')

    try:
        from supabase import create_client
    except ImportError:
        sys.exit('Falta instalar la librería: pip install supabase')

    sb = create_client(args.url, args.key)

    print('Descargando catálogo de películas...')
    peliculas = []
    page = 0
    while True:
        res = sb.table('peliculas').select('id,titulo').range(page * 1000, page * 1000 + 999).execute()
        rows = res.data
        if not rows:
            break
        peliculas.extend(rows)
        if len(rows) < 1000:
            break
        page += 1
    print(f'  {len(peliculas)} películas en el catálogo.')

    by_id = {p['id']: p['titulo'] for p in peliculas}
    norm_titles = [(p['id'], p['titulo'], normalize(p['titulo'])) for p in peliculas]

    archivos = [
        f for f in os.listdir(args.carpeta)
        if os.path.splitext(f)[1].lower() in IMG_EXTENSIONS
    ]
    print(f'{len(archivos)} imágenes encontradas en la carpeta.')

    matches_path = os.path.join(os.getcwd(), 'afiche_matches.csv')

    if not args.confirmar:
        rows_out = []
        for archivo in sorted(archivos):
            base = os.path.splitext(archivo)[0]
            if base.strip().isdigit():
                pid = int(base.strip())
                titulo = by_id.get(pid)
                if titulo:
                    rows_out.append([archivo, pid, titulo, 1.0, 'SI'])
                else:
                    rows_out.append([archivo, '', f'(no existe ficha N.º {pid})', 0, 'NO'])
            else:
                nb = normalize(base)
                best = max(
                    norm_titles,
                    key=lambda t: difflib.SequenceMatcher(None, nb, t[2]).ratio(),
                    default=None,
                )
                if best:
                    score = difflib.SequenceMatcher(None, nb, best[2]).ratio()
                    ok = 'SI' if score >= args.umbral else 'NO'
                    rows_out.append([archivo, best[0], best[1], round(score, 2), ok])
                else:
                    rows_out.append([archivo, '', '(sin catálogo)', 0, 'NO'])

        with open(matches_path, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['archivo', 'id_pelicula', 'titulo', 'similitud', 'match_ok'])
            w.writerows(rows_out)

        ok_count = sum(1 for r in rows_out if r[4] == 'SI')
        print(f'\nListo. Revisá "{matches_path}"')
        print(f'  {ok_count} de {len(rows_out)} quedaron con match_ok = SI')
        print('  Corregí a mano las que digan NO (o borrá la fila si no corresponde).')
        print('  Cuando esté todo bien, volvé a correr este script agregando --confirmar')
        return

    # --- modo confirmar: subir de verdad ---
    if not os.path.exists(matches_path):
        sys.exit(f'No encontré {matches_path}. Corré primero sin --confirmar.')

    subidos, saltados, errores = 0, 0, 0
    with open(matches_path, encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            if row['match_ok'] != 'SI' or not row['id_pelicula']:
                saltados += 1
                continue
            archivo = row['archivo']
            pid = int(row['id_pelicula'])
            ruta = os.path.join(args.carpeta, archivo)
            ext = os.path.splitext(archivo)[1].lstrip('.')
            storage_path = f'{pid}.{ext}'

            try:
                with open(ruta, 'rb') as img:
                    sb.storage.from_('afiches').upload(
                        storage_path, img,
                        file_options={'upsert': 'true'},
                    )
                public_url = sb.storage.from_('afiches').get_public_url(storage_path)
                sb.table('peliculas').update({'poster_url': public_url}).eq('id', pid).execute()
                subidos += 1
                print(f'  OK  N.º {pid:>5}  {archivo}')
            except Exception as e:
                errores += 1
                print(f'  ERROR  {archivo}: {e}')

    print(f'\nSubidos: {subidos}   Saltados: {saltados}   Errores: {errores}')


if __name__ == '__main__':
    main()
