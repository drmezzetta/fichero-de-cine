# Fichero de Cine — guía de despliegue (gratis, ~20-30 min)

Esta guía te lleva de cero a tener tu catálogo de películas andando en internet,
con tu propio dominio gratuito, sin pagar nada. Vas a usar dos servicios:

- **Supabase** → la base de datos en la nube (reemplaza el .mdb de Access) + el
  almacenamiento de los afiches. Plan gratis: 500 MB de base de datos y 1 GB de
  almacenamiento de archivos, más que suficiente para tu catálogo.
- **Vercel** → aloja el sitio web (el front-end) y te da una URL pública
  gratis (algo como `fichero-de-cine.vercel.app`).

No hace falta tarjeta de crédito para ninguno de los dos.

---

## Parte 1 — Crear la base de datos en Supabase

### 1.1 Crear cuenta y proyecto

1. Andá a **https://supabase.com** → "Start your project" → registrate con tu
   cuenta de GitHub o con email.
2. "New project" → ponele un nombre, por ejemplo `fichero-cine`.
3. Elegí una contraseña de base de datos (guardala, no la vas a necesitar para
   esta guía pero es buena práctica anotarla) y una región (elegí la más
   cercana, ej. South America - São Paulo).
4. Esperá 1-2 minutos a que el proyecto se cree.

### 1.2 Crear las tablas

1. En el menú izquierdo, andá a **SQL Editor** → **New query**.
2. Abrí el archivo `supabase/schema.sql` que te entrego, copiá **todo** el
   contenido, pegalo en el editor, y apretá **Run**.
3. Debería decir "Success. No rows returned". Esto creó las tablas
   `peliculas`, `generos`, `formatos`, y el espacio para los afiches.

### 1.3 Importar tus 3.373 películas

1. Andá a **Table Editor** (menú izquierdo) → seleccioná la tabla `peliculas`.
2. Botón **Insert** → **Import data from CSV**.
3. Subí el archivo `supabase/peliculas_import.csv` que te entrego.
4. Confirmá el mapeo de columnas (debería coincidir automáticamente porque
   los nombres son iguales) → **Import**.
5. Esperá a que termine (son ~3.373 filas, puede tardar uno o dos minutos).

Repetí el mismo paso para:
- Tabla `generos` → archivo `supabase/generos_import.csv`
- Tabla `formatos` → archivo `supabase/formatos_import.csv`

### 1.4 Confirmar que el bucket de afiches existe

El script `schema.sql` ya creó el bucket `afiches` automáticamente. Para
confirmarlo: andá a **Storage** (menú izquierdo) → deberías ver un bucket
llamado `afiches` marcado como **Public**. Si por algún motivo no aparece,
creálo a mano: **New bucket** → nombre `afiches` → activá **Public bucket**.

### 1.5 Obtener las claves de conexión

1. Andá a **Project Settings** (ícono de engranaje) → **API**.
2. Vas a necesitar dos valores para el paso siguiente:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)

Dejá esta pestaña abierta, los vas a usar en la Parte 2 y en la Parte 3.

---

## Parte 2 — Subir tus afiches

Tenés las fotos de los afiches en tu PC. Vamos a subirlas con un script
que te entrego, que además las vincula automáticamente a cada película.

1. Instalá Python si no lo tenés (https://www.python.org/downloads/, marcá
   "Add to PATH" durante la instalación).
2. Abrí una terminal (CMD o PowerShell en Windows) en la carpeta
   `scripts/` que te entrego.
3. Instalá la librería necesaria:
   ```
   pip install supabase
   ```
4. Configurá las claves (reemplazá por las tuyas de la Parte 1.5):
   ```
   set SUPABASE_URL=https://abcdefgh.supabase.co
   set SUPABASE_KEY=eyJ...tu-clave-anon...
   ```
   (En Mac/Linux es `export` en vez de `set`.)
5. Primera pasada, solo para revisar (no sube nada todavía):
   ```
   python upload_posters.py --carpeta "C:\ruta\a\tu\carpeta\de\afiches"
   ```
6. Esto genera un archivo `afiche_matches.csv`. Abrilo (con Excel, por
   ejemplo) y revisá que cada foto quedó vinculada a la película correcta.
   - Si tus fotos ya se llaman con el número de ficha (ej. `23.jpg`), el
     match es exacto y no hay casi nada que revisar.
   - Si se llaman por título, el script busca la película más parecida por
     nombre — revisá especialmente las filas marcadas `match_ok = NO` y
     corregilas o borralas.
7. Cuando estés conforme con el CSV, subí de verdad:
   ```
   python upload_posters.py --carpeta "C:\ruta\a\tu\carpeta\de\afiches" --confirmar
   ```

Podés correr este script las veces que quieras (por ejemplo si escaneás más
afiches más adelante); vuelve a matchear todo lo que encuentre en la carpeta.

---

## Parte 3 — Publicar el sitio web (Vercel)

### 3.1 Subir el código a GitHub

1. Si no tenés cuenta, creála gratis en **https://github.com**.
2. Creá un repositorio nuevo (por ejemplo `fichero-de-cine`), vacío.
3. Subí la carpeta del proyecto que te entrego (todo excepto la carpeta
   `node_modules` si la llegaste a generar, y excepto el archivo `.env`,
   que **no** debe subirse a GitHub por seguridad). Si sabés usar git:
   ```
   cd peliculas-app
   git init
   git add .
   git commit -m "Fichero de cine"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/fichero-de-cine.git
   git push -u origin main
   ```
   Si preferís no usar la terminal, GitHub también permite arrastrar los
   archivos directamente desde la web ("uploading an existing file").

### 3.2 Conectar con Vercel

1. Andá a **https://vercel.com** → registrate con tu cuenta de GitHub.
2. **Add New** → **Project** → elegí el repositorio `fichero-de-cine`.
3. Vercel detecta automáticamente que es un proyecto Vite/React. No cambies
   nada en "Build settings".
4. Antes de darle a "Deploy", abrí la sección **Environment Variables** y
   cargá las dos claves de la Parte 1.5:
   - `VITE_SUPABASE_URL` = tu Project URL
   - `VITE_SUPABASE_ANON_KEY` = tu anon public key
5. **Deploy**. En 1-2 minutos te da una URL pública, algo como
   `https://fichero-de-cine.vercel.app` — ese es tu sitio, andá a probarlo.

### 3.3 Actualizaciones futuras

Cada vez que quieras cambiar algo del sitio (pedime a mí el cambio de
código, o modificalo vos), con solo subir el cambio a GitHub (`git push`)
Vercel vuelve a publicar el sitio solo, automáticamente, en un minuto.

---

## ¿Qué podés hacer en el sitio?

- **Catálogo**: buscar por título, actor o director; filtrar por género y
  formato; ver el afiche y la ficha de cada película.
- **+ Nueva ficha**: dar de alta una película nueva, con actores, director,
  reseña y afiche.
- **Editar / Eliminar**: desde la ficha de detalle de cada película.
- **Listados**: rankings por género, por director y por actor — cuántas
  películas tenés de cada uno.
- Los desplegables de **género** y **formato** se pueden extender vos mismo
  desde el formulario de alta ("+ Agregar nuevo género/formato…"), igual que
  antes lo hacías con las tablas de referencia de Access.

## Costo

Con 3.373 películas y sus afiches, vas a estar usando una fracción mínima
de los límites gratuitos de Supabase (500 MB de base de datos + 1 GB de
archivos) y Vercel (100 GB de tráfico/mes). No deberías necesitar pagar
nada a menos que el catálogo crezca muchísimo más o quieras funciones
avanzadas (dominio propio con tu nombre, por ejemplo, tiene un costo aparte
pero es opcional).

## Si algo no funciona

- Pantalla en blanco o error de conexión → revisá que las variables de
  entorno (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) estén bien
  cargadas en Vercel, y que coincidan exactamente con las de tu proyecto
  de Supabase.
- Los afiches no aparecen → confirmá en Supabase → Storage → bucket
  `afiches` que los archivos se subieron, y que el bucket está marcado
  como **Public**.
- Cualquier otra cosa: pegame el mensaje de error tal cual aparece y lo
  vemos juntos.
