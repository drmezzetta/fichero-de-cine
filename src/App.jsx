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

  return (
    <div>
      <Header view={view} setView={(v) => { setView(v); setSelectedId(null); setEditingId(null) }} total={total} onNew={openNew} />

      <div className="shell">
        {view === 'catalogo' && <Catalogo onOpen={openDetail} refreshKey={refreshKey} />}

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

        {view === 'listados' && <Reports />}
      </div>
    </div>
  )
}
