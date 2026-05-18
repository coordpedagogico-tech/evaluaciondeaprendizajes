'use client'

import { useEffect, useState } from 'react'

interface Evaluacion {
  id: string
  titulo: string
  asignatura: string
  nivel: string
  tipo: string
  contenido: string
  analisis: string | null
  createdAt: string
}

const tipoConfig: Record<string, { label: string; icon: string; color: string }> = {
  prueba: { label: 'Prueba', icon: '✏️', color: 'bg-blue-100 text-blue-800' },
  guia: { label: 'Guía', icon: '📄', color: 'bg-green-100 text-green-800' },
  rubrica: { label: 'Rúbrica', icon: '📐', color: 'bg-indigo-100 text-indigo-800' },
  lista_cotejo: { label: 'Lista de Cotejo', icon: '☑️', color: 'bg-cyan-100 text-cyan-800' },
  autoevaluacion: { label: 'Autoevaluación', icon: '🪞', color: 'bg-yellow-100 text-yellow-800' },
  coevaluacion: { label: 'Coevaluación', icon: '🤝', color: 'bg-orange-100 text-orange-800' },
  pauta: { label: 'Pauta', icon: '📋', color: 'bg-purple-100 text-purple-800' },
  tabla: { label: 'Tabla Esp.', icon: '📊', color: 'bg-orange-100 text-orange-800' },
}

const TIPOS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: 'prueba', label: 'Pruebas' },
  { value: 'guia', label: 'Guías' },
  { value: 'pauta', label: 'Pautas' },
  { value: 'tabla', label: 'Tablas' },
  { value: 'rubrica', label: 'Rúbricas' },
]

export default function MisEvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [selected, setSelected] = useState<Evaluacion | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/mis-evaluaciones')
      .then((r) => r.json())
      .then((data) => {
        setEvaluaciones(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro? No se puede deshacer.')) return
    setDeleting(id)
    const res = await fetch('/api/mis-evaluaciones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setEvaluaciones((prev) => prev.filter((e) => e.id !== id))
      if (selected?.id === id) setSelected(null)
    }
    setDeleting(null)
  }

  const filtradas = evaluaciones.filter((e) => {
    const matchTipo = !filtroTipo || e.tipo === filtroTipo
    const q = busqueda.toLowerCase()
    const matchBusqueda =
      !q ||
      e.titulo.toLowerCase().includes(q) ||
      e.asignatura.toLowerCase().includes(q) ||
      e.nivel.toLowerCase().includes(q)
    return matchTipo && matchBusqueda
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📁 Mis Evaluaciones</h1>
        <p className="text-gray-500 mt-1">Historial de evaluaciones, pautas y tablas generadas</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título, asignatura o nivel..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <div className="flex gap-2 flex-wrap">
          {TIPOS_FILTRO.map((t) => (
            <button
              key={t.value}
              onClick={() => setFiltroTipo(t.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filtroTipo === t.value
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">{evaluaciones.length === 0 ? '📭' : '🔍'}</div>
          <p className="text-gray-500 font-medium">
            {evaluaciones.length === 0
              ? 'Aún no tienes evaluaciones guardadas'
              : 'No hay resultados para esta búsqueda'}
          </p>
          {evaluaciones.length === 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Usa los módulos de Crear, Analizar, Pauta o Tabla para generar tu primera evaluación
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtradas.map((ev) => {
            const cfg = tipoConfig[ev.tipo] ?? { label: ev.tipo, icon: '📄', color: 'bg-gray-100 text-gray-700' }
            return (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{ev.titulo || 'Sin título'}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {ev.asignatura} — {ev.nivel}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(ev.createdAt).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(selected?.id === ev.id ? null : ev)}
                      className="flex-1 px-3 py-1.5 text-sm font-medium border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {selected?.id === ev.id ? 'Cerrar' : 'Ver resultado'}
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={deleting === ev.id}
                      className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {deleting === ev.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                {selected?.id === ev.id && (
                  <div className="border-t border-gray-100 p-5">
                    <ResultadoViewer evaluacion={ev} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ResultadoViewer({ evaluacion }: { evaluacion: Evaluacion }) {
  let data: Record<string, unknown> | null = null
  try {
    data = evaluacion.analisis ? JSON.parse(evaluacion.analisis) : JSON.parse(evaluacion.contenido)
  } catch {
    return <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto max-h-96">{evaluacion.contenido}</pre>
  }

  if (!data) return null

  if (evaluacion.tipo === 'tabla') {
    const tabla = data as {
      titulo?: string
      filas?: { oa: string; nivelCognitivo: string; tipoItem: string; cantidadItems: number; puntajeItems: number; porcentaje: number }[]
      totales?: { items: number; puntaje: number; porcentaje: number }
    }
    return (
      <div className="overflow-x-auto">
        <p className="text-sm font-semibold text-gray-700 mb-3">{tabla.titulo}</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-orange-600 text-white">
              <th className="text-left p-2">OA</th>
              <th className="text-left p-2">Nivel Cogn.</th>
              <th className="text-left p-2">Tipo Ítem</th>
              <th className="text-center p-2">Ítems</th>
              <th className="text-center p-2">Puntaje</th>
              <th className="text-center p-2">%</th>
            </tr>
          </thead>
          <tbody>
            {tabla.filas?.map((f, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2 border-b border-gray-100">{f.oa}</td>
                <td className="p-2 border-b border-gray-100">{f.nivelCognitivo}</td>
                <td className="p-2 border-b border-gray-100">{f.tipoItem}</td>
                <td className="p-2 text-center border-b border-gray-100">{f.cantidadItems}</td>
                <td className="p-2 text-center border-b border-gray-100">{f.puntajeItems}</td>
                <td className="p-2 text-center border-b border-gray-100">{f.porcentaje}%</td>
              </tr>
            ))}
          </tbody>
          {tabla.totales && (
            <tfoot>
              <tr className="bg-orange-50 font-bold">
                <td colSpan={3} className="p-2 text-right text-orange-900 text-xs">TOTALES</td>
                <td className="p-2 text-center text-orange-900">{tabla.totales.items}</td>
                <td className="p-2 text-center text-orange-900">{tabla.totales.puntaje}</td>
                <td className="p-2 text-center text-orange-900">{tabla.totales.porcentaje}%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    )
  }

  if (evaluacion.tipo === 'pauta') {
    const pauta = data as {
      titulo?: string
      puntajeTotal?: number
      escalaCalificacion?: { puntajeMaximo: number; porcentajeExigencia: number }
      items?: { numero: number; tipo: string; respuestaCorrecta: string; puntaje: number }[]
    }
    return (
      <div className="space-y-3">
        <div className="flex gap-4 text-sm">
          {pauta.escalaCalificacion && (
            <>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                Ptje. máx: <strong>{pauta.escalaCalificacion.puntajeMaximo}</strong>
              </span>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                Exigencia: <strong>{pauta.escalaCalificacion.porcentajeExigencia}%</strong>
              </span>
            </>
          )}
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {pauta.items?.map((item) => (
            <div key={item.numero} className="border border-gray-100 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">Ítem {item.numero} — {item.tipo}</span>
                <span className="text-gray-500">{item.puntaje} pt{item.puntaje !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-green-700">{item.respuestaCorrecta}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (['prueba', 'guia', 'rubrica', 'lista_cotejo', 'autoevaluacion', 'coevaluacion'].includes(evaluacion.tipo)) {
    const ev = data as {
      titulo?: string
      secciones?: { numero: number; titulo: string; items: { numero: number; enunciado: string; puntaje: number }[] }[]
      pautaCorreccion?: { escalaCalificacion?: { puntajeMaximo: number; porcentajeExigencia: number } }
    }
    return (
      <div className="space-y-3">
        {ev.pautaCorreccion?.escalaCalificacion && (
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              Ptje. máx: <strong>{ev.pautaCorreccion.escalaCalificacion.puntajeMaximo}</strong>
            </span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              Exigencia: <strong>{ev.pautaCorreccion.escalaCalificacion.porcentajeExigencia}%</strong>
            </span>
          </div>
        )}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {ev.secciones?.map((sec) => (
            <div key={sec.numero}>
              <p className="text-xs font-semibold text-gray-700 mb-1">{sec.titulo}</p>
              {sec.items?.slice(0, 5).map((item) => (
                <p key={item.numero} className="text-xs text-gray-600 border-b border-gray-50 py-1">
                  {item.numero}. {item.enunciado}
                </p>
              ))}
              {(sec.items?.length ?? 0) > 5 && (
                <p className="text-xs text-gray-400 italic">...y {sec.items.length - 5} ítems más</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (evaluacion.tipo === 'analisis') {
    const analisis = data as { puntajeGeneral?: number; calificacionGeneral?: string; resumenEjecutivo?: string }
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">{analisis.puntajeGeneral}</span>
          <span className="text-sm text-gray-500">/100 — {analisis.calificacionGeneral}</span>
        </div>
        {analisis.resumenEjecutivo && (
          <p className="text-sm text-gray-600">{analisis.resumenEjecutivo}</p>
        )}
      </div>
    )
  }

  return (
    <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto max-h-72">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
