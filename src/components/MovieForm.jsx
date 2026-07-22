import { useEffect, useState } from 'react'
import {
  fetchPelicula,
  createPelicula,
  updatePelicula,
  uploadPoster,
  fetchGeneros,
  fetchFormatos,
  addGenero,
  addFormato,
} from '../lib/api'

const empty = {
  titulo: '', genero: '', actor1: '', actor2: '', actor3: '',
  director: '', anio: '', calidad: '', formato: '', sinopsis: '',
}

export default function MovieForm({ id, onSaved, onCancel }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [generos, setGeneros] = useState([])
  const [formatos, setFormatos] = useState([])
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [newGenero, setNewGenero] = useState(false)
  const [newFormato, setNewFormato] = useState(false)

  useEffect(() => {
    fetchGeneros().then(setGeneros).catch(() => {})
    fetchFormatos().then(setFormatos).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    fetchPelicula(id).then((p) => {
      setForm({
        titulo: p.titulo || '', genero: p.genero || '', actor1: p.actor1 || '',
        actor2: p.actor2 || '', actor3: p.actor3 || '', director: p.director || '',
        anio: p.anio || '', calidad: p.calidad || '', formato: p.formato || '',
        sinopsis: p.sinopsis || '',
      })
      setPosterPreview(p.poster_url || null)
      setLoading(false)
    }).catch((e) => { setError(e.message); setLoading(false) })
  }, [id])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handlePosterChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        titulo: form.titulo.trim(),
        genero: form.genero || null,
        actor1: form.actor1 || null,
        actor2: form.actor2 || null,
        actor3: form.actor3 || null,
        director: form.director || null,
        anio: form.anio ? Number(form.anio) : null,
        calidad: form.calidad || null,
        formato: form.formato || null,
        sinopsis: form.sinopsis || null,
      }

      let saved
      if (id) {
        saved = await updatePelicula(id, payload)
      } else {
        saved = await createPelicula(payload)
      }

      if (posterFile) {
        const url = await uploadPoster(posterFile, saved.id)
        saved = await updatePelicula(saved.id, { poster_url: url })
      }

      onSaved(saved.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loader-line">cargando ficha…</div>

  return (
    <div className="form-wrap">
      <div className="ficha-num">{id ? `EDITANDO FICHA N.º ${String(id).padStart(4, '0')}` : 'NUEVA FICHA'}</div>
      <h1 className="detail-title" style={{ fontSize: 26, marginBottom: 20 }}>
        {id ? 'Editar película' : 'Alta de película'}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field full">
            <label>Título *</label>
            <input required value={form.titulo} onChange={(e) => update('titulo', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Género</label>
            {!newGenero ? (
              <select value={form.genero} onChange={(e) => e.target.value === '__new__' ? setNewGenero(true) : update('genero', e.target.value)}>
                <option value="">— sin especificar —</option>
                {generos.map((g) => <option key={g} value={g}>{g}</option>)}
                <option value="__new__">+ Agregar nuevo género…</option>
              </select>
            ) : (
              <input
                autoFocus
                placeholder="Nombre del nuevo género"
                value={form.genero}
                onChange={(e) => update('genero', e.target.value)}
                onBlur={async () => {
                  if (form.genero.trim()) { await addGenero(form.genero.trim()); setGeneros(await fetchGeneros()) }
                  setNewGenero(false)
                }}
              />
            )}
          </div>

          <div className="form-field">
            <label>Año</label>
            <input type="number" value={form.anio} onChange={(e) => update('anio', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Director</label>
            <input value={form.director} onChange={(e) => update('director', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Formato</label>
            {!newFormato ? (
              <select value={form.formato} onChange={(e) => e.target.value === '__new__' ? setNewFormato(true) : update('formato', e.target.value)}>
                <option value="">— sin especificar —</option>
                {formatos.map((f) => <option key={f} value={f}>{f}</option>)}
                <option value="__new__">+ Agregar nuevo formato…</option>
              </select>
            ) : (
              <input
                autoFocus
                placeholder="Nombre del nuevo formato"
                value={form.formato}
                onChange={(e) => update('formato', e.target.value)}
                onBlur={async () => {
                  if (form.formato.trim()) { await addFormato(form.formato.trim()); setFormatos(await fetchFormatos()) }
                  setNewFormato(false)
                }}
              />
            )}
          </div>

          <div className="form-field">
            <label>Actor 1</label>
            <input value={form.actor1} onChange={(e) => update('actor1', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Actor 2</label>
            <input value={form.actor2} onChange={(e) => update('actor2', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Actor 3</label>
            <input value={form.actor3} onChange={(e) => update('actor3', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Calidad</label>
            <input value={form.calidad} onChange={(e) => update('calidad', e.target.value)} placeholder="Color, Blanco y negro…" />
          </div>

          <div className="form-field full">
            <label>Reseña</label>
            <textarea value={form.sinopsis} onChange={(e) => update('sinopsis', e.target.value)} />
          </div>

          <div className="form-field full">
            <label>Afiche</label>
            <div className="file-drop">
              {posterPreview && (
                <img src={posterPreview} alt="" style={{ width: 48, height: 72, objectFit: 'cover', borderRadius: 2 }} />
              )}
              <input type="file" accept="image/*" onChange={handlePosterChange} />
            </div>
            <div className="form-hint">JPG o PNG. Se sube al guardar la ficha.</div>
          </div>
        </div>

        {error && <div className="form-hint" style={{ color: 'var(--rust)', marginTop: 12 }}>Error: {error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar ficha'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
