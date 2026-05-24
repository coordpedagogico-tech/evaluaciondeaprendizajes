'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type DimKey = 'validezContenido' | 'coherenciaCurricular' | 'calidadItems' | 'distribucionCognitiva' | 'aspectosTecnicos' | 'cumplimientoDecreto67'

const dimLabels: Record<DimKey, string> = {
  validezContenido: 'Validez de Contenido',
  coherenciaCurricular: 'Coherencia Curricular',
  calidadItems: 'Calidad de Ítems',
  distribucionCognitiva: 'Distribución Cognitiva',
  aspectosTecnicos: 'Aspectos Técnicos',
  cumplimientoDecreto67: 'Decreto 67/2018',
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

type EvalData = {
  id: string
  titulo: string
  asignatura: string
  nivel: string
  tipo: string
  createdAt: string
  contenido: unknown
  analisis: {
    puntajeGeneral?: number
    calificacionGeneral?: string
    resumenEjecutivo?: string
    fortalezas?: string[]
    debilidades?: string[]
    dimensiones?: Record<DimKey, { puntaje: number; descripcion: string; observaciones?: string[]; niveles?: Record<string, number> }>
    recomendaciones?: { prioridad: string; categoria: string; descripcion: string; ejemploMejora?: string }[]
    itemsDetalle?: { numero: number; tipo: string; nivelCognitivo: string; calidad: string; observacion: string; sugerencia?: string }[]
    tablaEspecificaciones?: { existe?: boolean; sugerida?: { oa: string; indicador: string; nivelCognitivo: string; tipoItem: string; cantidadItems: number; puntaje: number; porcentaje: number }[] }
    cumplimientoNormativo?: Record<string, { cumple: boolean; observaciones: string }>
  } | null
}

export default function EvaluacionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<EvalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'analisis' | 'items' | 'recomendaciones' | 'tabla'>('analisis')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/historial/${params.id}`)
        if (!res.ok) throw new Error('No encontrado')
        const json = await res.json()
        setData(json)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Evaluación no encontrada</h3>
        <Link href="/historial" className="text-blue-700 hover:underline text-sm">← Volver al historial</Link>
      </div>
    )
  }

  const analisis = data.analisis
  const puntaje = analisis?.puntajeGeneral ?? 0
  const scoreColor = puntaje >= 80 ? 'text-green-600' : puntaje >= 60 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg = puntaje >= 80 ? 'bg-green-50 border-green-200' : puntaje >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  const tipoLabels: Record<string, string> = {
    prueba: 'Prueba Escrita', guia: 'Guía de Trabajo', pauta: 'Pauta de Corrección',
    rubrica: 'Rúbrica', lista_cotejo: 'Lista de Cotejo', autoevaluacion: 'Autoevaluación', coevaluacion: 'Coevaluación'
  }

  const cognitiveColors: Record<string, string> = {
    conocimiento: 'bg-purple-100 text-purple-800',
    comprension: 'bg-blue-100 text-blue-800',
    aplicacion: 'bg-cyan-100 text-cyan-800',
    analisis: 'bg-green-100 text-green-800',
    sintesis: 'bg-yellow-100 text-yellow-800',
    evaluacion: 'bg-orange-100 text-orange-800'
  }
  const cognitiveLabels: Record<string, string> = {
    conocimiento: 'Conocimiento', comprension: 'Comprensión', aplicacion: 'Aplicación',
    analisis: 'Análisis', sintesis: 'Síntesis', evaluacion: 'Evaluación'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/historial" className="hover:text-blue-700">🗂️ Historial</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{data.titulo || 'Sin título'}</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.titulo || 'Sin título'}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                {tipoLabels[data.tipo] || data.tipo}
              </span>
              {data.asignatura && (
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full">
                  {data.asignatura}
                </span>
              )}
              {data.nivel && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
                  {data.nivel}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {new Date(data.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🖨️ Imprimir / PDF
            </button>
            <button
              onClick={() => router.back()}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>

      {!analisis ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          Esta evaluación fue guardada sin análisis de IA. Puedes volver a analizarla desde el módulo correspondiente.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score summary */}
          <div className={`rounded-xl border-2 p-6 ${scoreBg}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Resultado del Análisis</h2>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    puntaje >= 80 ? 'bg-green-100 text-green-700' : puntaje >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>{analisis.calificacionGeneral}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{analisis.resumenEjecutivo}</p>
              </div>
              <div className="text-center min-w-[80px]">
                <div className={`text-5xl font-bold ${scoreColor}`}>{puntaje}</div>
                <div className="text-gray-500 text-sm">/100</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {[
                { key: 'analisis', label: '📊 Dimensiones' },
                { key: 'items', label: '📝 Ítems' },
                { key: 'recomendaciones', label: '💡 Recomendaciones' },
                { key: 'tabla', label: '📋 Tabla de Especificaciones' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.key ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Tab: Dimensiones */}
              {activeTab === 'analisis' && (
                <div className="space-y-6">
                  {analisis.dimensiones && (
                    <div className="space-y-4">
                      {(Object.keys(dimLabels) as DimKey[]).map((key) => {
                        const dim = analisis.dimensiones?.[key]
                        if (!dim) return null
                        return (
                          <div key={key} className="border border-gray-100 rounded-xl p-5">
                            <ScoreBar score={dim.puntaje} label={dimLabels[key]} />
                            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{dim.descripcion}</p>
                            {dim.observaciones && dim.observaciones.length > 0 && (
                              <ul className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                                {dim.observaciones.map((obs, i) => (
                                  <li key={i} className="text-xs text-gray-500 flex gap-2">
                                    <span className="text-gray-400 flex-shrink-0">•</span><span>{obs}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {key === 'distribucionCognitiva' && dim.niveles && (
                              <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
                                {Object.entries(dim.niveles).map(([nivel, count]) => (
                                  <div key={nivel} className={`rounded-lg px-2 py-2 text-center ${cognitiveColors[nivel] || 'bg-gray-100'}`}>
                                    <div className="text-xl font-bold">{count}</div>
                                    <div className="text-xs font-medium">{cognitiveLabels[nivel] || nivel}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Fortalezas y debilidades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <h3 className="font-bold text-green-800 mb-3">✅ Fortalezas</h3>
                      <ul className="space-y-2">
                        {analisis.fortalezas?.map((f, i) => (
                          <li key={i} className="text-sm text-green-700 flex gap-2"><span>•</span><span>{f}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                      <h3 className="font-bold text-orange-800 mb-3">⚠️ Aspectos a mejorar</h3>
                      <ul className="space-y-2">
                        {analisis.debilidades?.map((d, i) => (
                          <li key={i} className="text-sm text-orange-700 flex gap-2"><span>•</span><span>{d}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cumplimiento normativo */}
                  {analisis.cumplimientoNormativo && (
                    <div className="border border-gray-200 rounded-xl p-5">
                      <h3 className="font-bold text-gray-900 mb-4">📜 Cumplimiento Normativo</h3>
                      <div className="space-y-3">
                        {Object.entries(analisis.cumplimientoNormativo).map(([key, val]) => (
                          <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <span className={`text-lg flex-shrink-0 ${val.cumple ? 'text-green-500' : 'text-red-500'}`}>
                              {val.cumple ? '✓' : '✗'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {key === 'decreto67' ? 'Decreto 67/2018'
                                  : key === 'basesCurriculares' ? 'Bases Curriculares MINEDUC'
                                  : 'Orientaciones de Evaluación'}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">{val.observaciones}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Ítems */}
              {activeTab === 'items' && (
                <div>
                  {analisis.itemsDetalle && analisis.itemsDetalle.length > 0 ? (
                    <div className="space-y-3">
                      {analisis.itemsDetalle.map((item, i) => {
                        const qColors: Record<string, string> = {
                          Excelente: 'bg-green-100 text-green-700',
                          Bueno: 'bg-blue-100 text-blue-700',
                          Regular: 'bg-yellow-100 text-yellow-700',
                          Deficiente: 'bg-red-100 text-red-700'
                        }
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-bold text-gray-900 text-base">Ítem {item.numero}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.tipo}</span>
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{item.nivelCognitivo}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${qColors[item.calidad] || 'bg-gray-100 text-gray-700'}`}>
                                {item.calidad}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Observación:</span> {item.observacion}</p>
                            {item.sugerencia && (
                              <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 mt-2">
                                💡 <span className="font-medium">Sugerencia:</span> {item.sugerencia}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No hay análisis por ítem disponible</p>
                  )}
                </div>
              )}

              {/* Tab: Recomendaciones */}
              {activeTab === 'recomendaciones' && (
                <div>
                  {analisis.recomendaciones && analisis.recomendaciones.length > 0 ? (
                    <div className="space-y-4">
                      {['Alta', 'Media', 'Baja'].map((prioridad) => {
                        const items = analisis.recomendaciones?.filter((r) => r.prioridad === prioridad) || []
                        if (items.length === 0) return null
                        const pColors: Record<string, string> = {
                          Alta: 'bg-red-50 border-red-200',
                          Media: 'bg-yellow-50 border-yellow-200',
                          Baja: 'bg-green-50 border-green-200'
                        }
                        const pTextColors: Record<string, string> = {
                          Alta: 'text-red-700 bg-red-100',
                          Media: 'text-yellow-700 bg-yellow-100',
                          Baja: 'text-green-700 bg-green-100'
                        }
                        return (
                          <div key={prioridad}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${pTextColors[prioridad]}`}>
                                Prioridad {prioridad}
                              </span>
                              <span className="text-xs text-gray-400">{items.length} recomendación{items.length !== 1 ? 'es' : ''}</span>
                            </div>
                            <div className="space-y-2">
                              {items.map((rec, i) => (
                                <div key={i} className={`border rounded-xl p-4 ${pColors[prioridad]}`}>
                                  <p className="text-xs text-gray-500 font-medium mb-1">{rec.categoria}</p>
                                  <p className="text-sm text-gray-800">{rec.descripcion}</p>
                                  {rec.ejemploMejora && (
                                    <p className="mt-2 text-xs text-blue-700 bg-white rounded px-2 py-1.5 border border-blue-100 italic">
                                      📌 Ejemplo: {rec.ejemploMejora}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">No hay recomendaciones disponibles</p>
                  )}
                </div>
              )}

              {/* Tab: Tabla de especificaciones */}
              {activeTab === 'tabla' && (
                <div>
                  {analisis.tablaEspecificaciones?.sugerida && analisis.tablaEspecificaciones.sugerida.length > 0 ? (
                    <div>
                      <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${
                        analisis.tablaEspecificaciones.existe
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {analisis.tablaEspecificaciones.existe
                          ? '✅ El instrumento incluye tabla de especificaciones'
                          : '⚠️ Se sugiere la siguiente tabla de especificaciones'}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-blue-700 text-white">
                              <th className="text-left p-3">Objetivo de Aprendizaje</th>
                              <th className="text-left p-3">Indicador</th>
                              <th className="text-left p-3">Nivel Cognitivo</th>
                              <th className="text-left p-3">Tipo de Ítem</th>
                              <th className="text-center p-3">Cant.</th>
                              <th className="text-center p-3">Ptaje.</th>
                              <th className="text-center p-3">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analisis.tablaEspecificaciones.sugerida.map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-3 text-gray-800 border-b border-gray-100">{row.oa}</td>
                                <td className="p-3 text-gray-600 border-b border-gray-100 text-xs">{row.indicador}</td>
                                <td className="p-3 border-b border-gray-100">
                                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{row.nivelCognitivo}</span>
                                </td>
                                <td className="p-3 text-gray-600 border-b border-gray-100 text-xs">{row.tipoItem}</td>
                                <td className="p-3 text-center text-gray-800 border-b border-gray-100 font-medium">{row.cantidadItems}</td>
                                <td className="p-3 text-center text-gray-800 border-b border-gray-100 font-medium">{row.puntaje}</td>
                                <td className="p-3 text-center text-gray-600 border-b border-gray-100">{row.porcentaje}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">
                      No hay tabla de especificaciones disponible para este análisis.{' '}
                      <Link href="/tabla" className="text-blue-700 hover:underline">Crear una tabla →</Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
