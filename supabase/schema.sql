-- ============================================================
-- Fichero de Cine — esquema de base de datos para Supabase
-- Pegar y ejecutar completo en: Supabase > SQL Editor > New query
-- ============================================================

create table if not exists peliculas (
  id               bigint primary key,
  titulo           text not null,
  genero           text,
  actor1           text,
  actor2           text,
  actor3           text,
  director         text,
  anio             integer,
  calidad          text,
  formato          text,
  sinopsis         text,
  poster_url       text,
  created_at       timestamptz not null default now()
);

create table if not exists generos (
  nombre text primary key
);

create table if not exists formatos (
  nombre text primary key
);

-- Índices para que las búsquedas por título/actor/director/género sean rápidas
create index if not exists idx_peliculas_titulo   on peliculas using gin (to_tsvector('spanish', coalesce(titulo,'')));
create index if not exists idx_peliculas_genero    on peliculas (genero);
create index if not exists idx_peliculas_formato   on peliculas (formato);
create index if not exists idx_peliculas_director  on peliculas (director);

-- Secuencia para que las películas nuevas sigan numerándose después de la última migrada
create sequence if not exists peliculas_id_seq;
select setval(
  'peliculas_id_seq',
  coalesce((select max(id) from peliculas), 1),
  (select max(id) is not null from peliculas)
);
alter table peliculas alter column id set default nextval('peliculas_id_seq');
alter sequence peliculas_id_seq owned by peliculas.id;

-- ============================================================
-- Seguridad: como es una app de un solo usuario sin login,
-- habilitamos RLS y damos acceso completo a la clave "anon".
-- Si más adelante querés agregar login, esto se puede restringir.
-- ============================================================

alter table peliculas enable row level security;
alter table generos   enable row level security;
alter table formatos  enable row level security;

create policy "acceso total peliculas" on peliculas
  for all using (true) with check (true);

create policy "acceso total generos" on generos
  for all using (true) with check (true);

create policy "acceso total formatos" on formatos
  for all using (true) with check (true);

-- ============================================================
-- Storage: bucket público para los afiches
-- (también se puede crear a mano en Storage > New bucket > "afiches" > Public)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('afiches', 'afiches', true)
on conflict (id) do nothing;

create policy "lectura publica afiches" on storage.objects
  for select using (bucket_id = 'afiches');

create policy "escritura publica afiches" on storage.objects
  for insert with check (bucket_id = 'afiches');

create policy "actualizacion publica afiches" on storage.objects
  for update using (bucket_id = 'afiches');
