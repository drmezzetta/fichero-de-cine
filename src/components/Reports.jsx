import { useEffect, useState } from 'react'
import { reportPorGenero, reportPorDirector, reportPorActor } from '../lib/api'

const TABS = [
  { key: 'genero', label: 'Por género', fn: reportPorGenero },
  { key: 'director', label: 'Por director', fn: reportPorDirector },
  { key: 'actor', label: 'Por actor', fn: reportPorActor },
]

export default function Reports({ onPick }) {
  const [tab, setTab] = useState('genero')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const active = TABS.find((t) => t.key === tab)
    active.fn().then(setRows).finally(() => setLoading(false))
  }, [tab])

  const max = rows.length ? rows[0][1] : 1

  return (
    <div>
      <div className="ficha-num">LISTADOS</div>
      <h1 className="detail-title" style={{ fontSize: 26 }}>Listados del fichero</h1>
      <p className="report-hint" style={{ opacity: 0.6, marginTop: -4, fontSize: 13 }}>
        Tocá una fila para ver esas películas en el catálogo.
      </p>

      <div className="report-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={'report-tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loader-line">calculando…</div>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>{TABS.find((t) => t.key === tab).label.replace('Por ', '')}</th>
              <th style={{ width: '55%' }}>Cantidad de películas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, count]) => (
              <tr
                key={name}
                className="report-row"
                style={{ cursor: 'pointer' }}
                title={`Ver "${name}" en el catálogo`}
                onClick={() => onPick && onPick(tab, name)}
              >
                <td>{name}</td>
                <td>
                  <div className="report-bar-cell">
                    <div className="report-bar-track">
                      <div className="report-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="count-chip">{count}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
