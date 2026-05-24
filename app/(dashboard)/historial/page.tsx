'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ASIGNATURAS, NIVELES, TIPOS_INSTRUMENTO } from '@/lib/curriculum'
import { useRouter } from 'next/navigation'

const allAsignaturas = [...new Set([...ASIGNATURAS.basica, ...ASIGNATURAS.media])].sort()

type Evaluacion = {
  id: string
  titulo: string
  asignatura: string
  nivel: string
  tipo: string
  createdAt: string
  puntajeGeneral: number | null
}

function TipoIcon({ tipo }: { tipo: string }) {
  const icons: Record<string, string> = {
    prueba: '📝',
    guia: '📖',
    pauta: '📋',
    rubrica: '🎯',
    lista_cotejo: '✅',
    autoevaluacion: '🪞',
    coevaluacion: '👥',
  }
  return <span>{icons[tipo] || '📄'}</span>
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Sin análisis</span>
  const color = score >= 80 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}/100</span>
}

function TipoLabel({ tipo }: { tipo: string }) {
  const labels: Record<string, string> = {
    prueba: 'Prueba Escrita',
    guia: 'Guía de Trabajo',
    pauta: 'Pauta de Corrección',
    rubrica: 'Rúbrica',
    lista_cotejo: 'Lista de Cotejo',
    autoevaluacion: 'Autoevaluación',
    coevaluacion: 'Coevaluación',
  }
  return <>{labels[tipo] || tipo}</>
}

export default function HistorialPage() {
  const router = useRouter()
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filters, setFilters] = useState({ tipo: '', asignatura: '', search: '' })

  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' })
      if (filters.tipo) params.set('tipo', filters.tipo)
      if (filters.asignatura) params.set('asignatura', filters.asignatura)
      const res = await fetch(`/api/historial?${params}`)
      if (!res.ok) throw new Error('Error al cargar historial')
      const data = await res.json()
      setEvaluaciones(data.evaluaciones)
      setTotal(data.total)
      setPages(data.pages)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchHistorial()
  }, [fetchHistorial])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta evaluación del historial?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/historial/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEvaluaciones((prev) => prev.filter((e) => e.id !== id))
        setTotal((prev) => prev - 1)
      }
    } finally {
      setDeleting(null)
    }
  }

  const filtered = filters.search
    ? evaluaciones.filter((e) =>
        e.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.asignatura.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.nivel.toLowerCase().includes(filters.search.toLowerCase())
      )
    : evaluaciones

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🗂️ Historial de Evaluaciones</h1>
          <p className="text-gray-500 mt-1">
            {total} evaluación{total !== 1 ? 'es' : ''} guardada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/analizar"
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          + Nuevo análisis
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar por título, asignatura..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filters.tipo}
              onChange={(e) => { setFilters({ ...filters, tipo: e.target.value }); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_INSTRUMENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.asignatura}
              onChange={(e) => { setFilters({ ...filters, asignatura: e.target.value }); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las asignaturas</option>
              {allAsignaturas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Cargando historial...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay evaluaciones aún</h3>
          <p className="text-gray-500 text-sm mb-6">
            {filters.search || filters.tipo || filters.asignatura
              ? 'No se encontraron resultados con estos filtros'
              : 'Comienza analizando o creando tu primera evaluación'}
          </p>
          <Link
            href="/analizar"
            className="inline-flex px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Analizar mi primera evaluación
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filtered.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => router.push(`/historial/${ev.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl"><TipoIcon tipo={ev.tipo} /></span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                          {ev.titulo || 'Sin título'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <TipoLabel tipo={ev.tipo} />
                        </p>
                      </div>
                    </div>
                    <ScorePill score={ev.puntajeGeneral} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ev.asignatura && (
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                        {ev.asignatura}
                      </span>
                    )}
                    {ev.nivel && (
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">
                        {ev.nivel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(ev.createdAt).toLocaleDateString('es-CL', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="px-4 pb-3 pt-0 flex gap-2 border-t border-gray-100">
                  <Link
                    href={`/historial/${ev.id}`}
                    className="flex-1 text-center text-xs font-medium text-blue-700 hover:text-blue-800 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Ver detalle →
                  </Link>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={deleting === ev.id}
                    className="text-xs font-medium text-red-500 hover:text-red-700 py-1.5 px-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === ev.id ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
