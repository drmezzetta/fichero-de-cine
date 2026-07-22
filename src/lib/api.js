import { supabase } from './supabaseClient'

const PAGE_SIZE = 24

export async function fetchPeliculas({ search = '', genero = '', formato = '', page = 0 }) {
  let query = supabase.from('peliculas').select('*', { count: 'exact' })

  if (search.trim()) {
    const term = `%${search.trim()}%`
    query = query.or(
      `titulo.ilike.${term},actor1.ilike.${term},actor2.ilike.${term},actor3.ilike.${term},director.ilike.${term}`
    )
  }
  if (genero) query = query.eq('genero', genero)
  if (formato) query = query.eq('formato', formato)

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await query
    .order('titulo', { ascending: true })
    .range(from, to)

  if (error) throw error
  return { data, count, pageSize: PAGE_SIZE }
}

export async function fetchPelicula(id) {
  const { data, error } = await supabase.from('peliculas').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createPelicula(payload) {
  const { data, error } = await supabase.from('peliculas').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updatePelicula(id, payload) {
  const { data, error } = await supabase.from('peliculas').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePelicula(id) {
  const { error } = await supabase.from('peliculas').delete().eq('id', id)
  if (error) throw error
}

export async function fetchGeneros() {
  const { data, error } = await supabase.from('generos').select('nombre').order('nombre')
  if (error) throw error
  return data.map((r) => r.nombre)
}

export async function fetchFormatos() {
  const { data, error } = await supabase.from('formatos').select('nombre').order('nombre')
  if (error) throw error
  return data.map((r) => r.nombre)
}

export async function addGenero(nombre) {
  const { error } = await supabase.from('generos').upsert({ nombre })
  if (error) throw error
}

export async function addFormato(nombre) {
  const { error } = await supabase.from('formatos').upsert({ nombre })
  if (error) throw error
}

export async function uploadPoster(file, id) {
  const ext = file.name.split('.').pop()
  const path = `${id}.${ext}`
  const { error } = await supabase.storage.from('afiches').upload(path, file, {
    upsert: true,
    cacheControl: '3600',
  })
  if (error) throw error
  const { data } = supabase.storage.from('afiches').getPublicUrl(path)
  return data.publicUrl
}

// ----- Listados / reportes -----

async function fetchAllForReport() {
  // trae solo las columnas necesarias para agregaciones en el cliente
  const { data, error } = await supabase
    .from('peliculas')
    .select('genero, director, actor1, actor2, actor3')
  if (error) throw error
  return data
}

export async function reportPorGenero() {
  const rows = await fetchAllForReport()
  const counts = {}
  rows.forEach((r) => {
    const g = r.genero || 'Sin género'
    counts[g] = (counts[g] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export async function reportPorDirector() {
  const rows = await fetchAllForReport()
  const counts = {}
  rows.forEach((r) => {
    const d = (r.director || '').trim()
    if (!d) return
    counts[d] = (counts[d] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export async function reportPorActor() {
  const rows = await fetchAllForReport()
  const counts = {}
  rows.forEach((r) => {
    ;[r.actor1, r.actor2, r.actor3].forEach((a) => {
      const name = (a || '').trim()
      if (!name) return
      counts[name] = (counts[name] || 0) + 1
    })
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export { PAGE_SIZE }
