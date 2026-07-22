import { useEffect, useState, useCallback } from 'react'
import { fetchPeliculas, fetchGeneros, fetchFormatos, PAGE_SIZE } from '../lib/api'
import MovieCard from './MovieCard'

export default function Catalogo({ onOpen, refreshKey }) {
  const [search, setSearch] = useState('')
  const [genero, setGenero] = useState('')
  const [formato, setFormato] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generos, setGeneros] = useState([])
  const [formatos, setFormatos] = useState([])

  useEffect(() => {
    fetchGeneros().then(setGeneros).catch(() => {})
    fetchFormatos().then(setFormatos).catch(() => {})
  }, [refreshKey])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, count } = await fetchPeliculas({ search, genero, formato, page })
      setData(data)
      setCount(count)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, genero, formato, page])

  useEffect(() => { load() }, [load, refreshKey])

  useEffect(() => { setPage(0) }, [search, genero, formato])

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div>
      <div className="search-strip">
        <span className="search-label">Buscar</span>
        <input
          className="search-input"
          placeholder="Título, actor o director…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select-field" value={genero} onChange={(e) => setGenero(e.target.value)}>
          <option value="">Todos los géneros</option>
          {generos.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="select-field" value={formato} onChange={(e) => setFormato(e.target.value)}>
          <option value="">Todos los formatos</option>
          {formatos.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <span className="result-count">{count} resultado{count === 1 ? '' : 's'}</span>
      </div>

      {loading && <div className="loader-line">buscando en el fichero…</div>}
      {error && <div className="loader-line">Error: {error}</div>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">
          <h3>No hay fichas que coincidan</h3>
          <p>Probá con otro título, actor o director.</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="grid">
            {data.map((p) => (
              <MovieCard key={p.id} pelicula={p} onClick={() => onOpen(p.id)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← anterior
              </button>
              <span>página {page + 1} / {totalPages}</span>
              <button
                className="btn-secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
