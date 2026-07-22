export default function MovieCard({ pelicula, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <div className="card-perf" />
      <div className="card-poster">
        {pelicula.poster_url ? (
          <img src={pelicula.poster_url} alt={pelicula.titulo} loading="lazy" />
        ) : (
          <div className="card-poster-placeholder">SIN AFICHE</div>
        )}
      </div>
      <div className="card-body">
        <div className="card-num">N.º {String(pelicula.id).padStart(4, '0')}</div>
        <div className="card-title">{pelicula.titulo}</div>
        <div className="card-meta">
          {pelicula.anio && <span className="stamp">{pelicula.anio}</span>}
          {pelicula.formato && <span className="stamp formato">{pelicula.formato}</span>}
        </div>
      </div>
    </div>
  )
}
