import { useEffect, useState } from 'react'
import Header from './components/Header'
import Catalogo from './components/Catalogo'
import MovieDetail from './components/MovieDetail'
import MovieForm from './components/MovieForm'
import Reports from './components/Reports'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [view, setView] = useState('catalogo') // catalogo | detalle | form | listados
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [total, setTotal] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [catalogoFilter, setCatalogoFilter] = useState(null)

  useEffect(() => {
    supabase.from('peliculas').select('*', { count: 'exact', head: true }).then(({ count }) => {
      if (count != null) setTotal(count)
    })
  }, [refreshKey])

  function goCatalogo() {
    setView('catalogo')
    setSelectedId(null)
    setEditingId(null)
    setRefreshKey((k) => k + 1)
  }

  function openDetail(id) {
    setSelectedId(id)
    setView('detalle')
  }

  function openNew() {
    setEditingId(null)
    setView('form')
  }

  function openEdit(id) {
    setEditingId(id)
    setView('form')
  }

  // Desde "Listados": abrir el catálogo filtrado por género / director / actor
  function pickFromReport(tab, name) {
    const filter =
      tab === 'genero' ? { genero: name }
      : tab === 'director' ? { director: name }
      : { actor: name }
    setCatalogoFilter(filter)
    setSelectedId(null)
    setEditingId(null)
    setView('catalogo')
  }

  // Navegación desde el Header: al ir al Catálogo se limpia el filtro activo
  function navFromHeader(v) {
    if (v === 'catalogo') setCatalogoFilter(null)
    setView(v)
    setSelectedId(null)
    setEditingId(null)
  }

  return (
    <div>
      <Header view={view} setView={navFromHeader} total={total} onNew={openNew} />

      <div className="shell">
        {view === 'catalogo' && (
          <Catalogo onOpen={openDetail} refreshKey={refreshKey} initialFilter={catalogoFilter} />
        )}

        {view === 'detalle' && selectedId != null && (
          <MovieDetail
            id={selectedId}
            onBack={goCatalogo}
            onEdit={() => openEdit(selectedId)}
            onDeleted={goCatalogo}
          />
        )}

        {view === 'form' && (
          <MovieForm
            id={editingId}
            onSaved={(id) => openDetail(id)}
            onCancel={() => (editingId ? openDetail(editingId) : goCatalogo())}
          />
        )}

        {view === 'listados' && <Reports onPick={pickFromReport} />}
      </div>
    </div>
  )
}
