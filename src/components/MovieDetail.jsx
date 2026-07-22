import { useEffect, useState } from 'react'
import { fetchPelicula, deletePelicula } from '../lib/api'

export default function MovieDetail({ id, onBack, onEdit, onDeleted }) {
  const [pelicula, setPelicula] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchPelicula(id)
      .then(setPelicula)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    await deletePelicula(id)
    onDeleted()
  }

  if (loading) return <div className="loader-line">abriendo ficha…</div>
  if (error) return <div className="loader-line">Error: {error}</div>
  if (!pelicula) return null

  const actores = [pelicula.actor1, pelicula.actor2, pelicula.actor3].filter(Boolean)

  return (
    <div>
      <button className="btn-secondary" onClick={onBack}>← volver al catálogo</button>

      <div className="detail-wrap">
        <div className="detail-poster">
          {pelicula.poster_url ? (
            <img src={pelicula.poster_url} alt={pelicula.titulo} />
          ) : (
            <div className="card-poster-placeholder">SIN AFICHE</div>
          )}
        </div>

        <div>
          <div className="ficha-num">FICHA N.º {String(pelicula.id).padStart(4, '0')}</div>
          <h1 className="detail-title">{pelicula.titulo}</h1>
          <div className="detail-subrow">
            {pelicula.anio && <span className="stamp">{pelicula.anio}</span>}
            {pelicula.genero && <span className="stamp">{pelicula.genero}</span>}
            {pelicula.formato && <span className="stamp formato">{pelicula.formato}</span>}
            {pelicula.calidad && <span className="stamp">{pelicula.calidad}</span>}
          </div>

          {actores.length > 0 || pelicula.director ? (
            <div className="detail-section">
              <div className="credit-grid">
                {pelicula.director && (
                  <div className="credit-item">
                    <div className="credit-role">Director</div>
                    <div className="credit-name">{pelicula.director}</div>
                  </div>
                )}
                {actores.map((a, i) => (
                  <div className="credit-item" key={i}>
                    <div className="credit-role">Actor {i + 1}</div>
                    <div className="credit-name">{a}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detail-section">
            <div className="detail-label">Reseña</div>
            {pelicula.sinopsis ? (
              <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{pelicula.sinopsis}</div>
            ) : (
              <div className="detail-value muted">Todavía no hay reseña cargada para esta ficha.</div>
            )}
          </div>

          <div className="detail-actions">
            <button className="btn-primary" onClick={onEdit}>Editar ficha</button>
            {!confirmDelete ? (
              <button className="btn-danger" onClick={() => setConfirmDelete(true)}>Eliminar</button>
            ) : (
              <>
                <button className="btn-danger" onClick={handleDelete}>Confirmar borrado</button>
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
