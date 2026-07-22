# Fichero de Cine

Catálogo web de películas: migración de una base de datos MS Access de
25 años (títulos, actores, directores, reseñas y afiches) a una app
en la nube, gratis.

- **Frontend**: React + Vite, sin frameworks pesados.
- **Backend**: Supabase (base de datos Postgres + almacenamiento de afiches),
  consumido directo desde el navegador — no hace falta servidor propio.
- **Hosting**: pensado para desplegarse gratis en Vercel.

## Guía completa

Empezá por **[DEPLOY.md](./DEPLOY.md)** — tiene el paso a paso completo,
desde crear la base de datos hasta publicar el sitio.

## Estructura del proyecto

```
src/
  components/    Catalogo, MovieCard, MovieDetail, MovieForm, Reports, Header
  lib/           supabaseClient.js (conexión), api.js (todas las consultas)
  App.jsx        enrutamiento simple entre vistas
  styles.css     diseño (tema "fichero de archivo de cine")
supabase/
  schema.sql             crea las tablas, índices, seguridad y el bucket de afiches
  peliculas_import.csv   tus 3.373 películas migradas del .mdb
  generos_import.csv     lista de géneros
  formatos_import.csv    lista de formatos (DVD, VHS, Super 8, 16mm)
scripts/
  upload_posters.py      sube tus afiches locales a Supabase y los vincula
```

## Desarrollo local

```
npm install
cp .env.example .env   # completar con tus claves de Supabase
npm run dev
```
