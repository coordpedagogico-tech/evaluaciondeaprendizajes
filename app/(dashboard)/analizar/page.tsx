'use client'

import { useState, useRef } from 'react'
import { ASIGNATURAS, NIVELES, TIPOS_INSTRUMENTO } from '@/lib/curriculum'

const allAsignaturas = [...new Set([...ASIGNATURAS.basica, ...ASIGNATURAS.media])].sort()

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
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-800">{score}/100</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function AnalizarPage() {
  const [form, setForm] = useState({
    titulo: '',
    asignatura: '',
    nivel: '',
    tipo: 'prueba',
    texto: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setError('')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file && !form.texto.trim()) {
      setError('Debes cargar un archivo o pegar el texto del instrumento')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const fd = new FormData()
    fd.append('titulo', form.titulo)
    fd.append('asignatura', form.asignatura)
    fd.append('nivel', form.nivel)
    fd.append('tipo', form.tipo)
    fd.append('texto', form.texto)
    if (file) fd.append('file', file)

    const res = await fetch('/api/analizar', { method: 'POST', body: fd })
    const data = await res.json()

    if (res.ok) {
      setResult(data.analisis)
    } else {
      setError(data.error || 'Error al analizar')
    }
    setLoading(false)
  }

  const analisis = result as {
    puntajeGeneral?: number
    calificacionGeneral?: string
    resumenEjecutivo?: string
    fortalezas?: string[]
    debilidades?: string[]
    dimensiones?: Record<DimKey, { puntaje: number; descripcion: string; observaciones?: string[] }>
    recomendaciones?: { prioridad: string; categoria: string; descripcion: string; ejemploMejora?: string }[]
    itemsDetalle?: { numero: number; tipo: string; nivelCognitivo: string; calidad: string; observacion: string; sugerencia: string }[]
  } | null

  const puntaje = analisis?.puntajeGeneral ?? 0
  const scoreColor = puntaje >= 80 ? 'text-green-600' : puntaje >= 60 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg = puntaje >= 80 ? 'bg-green-50 border-green-200' : puntaje >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔍 Analizar Instrumento</h1>
        <p className="text-gray-500 mt-1">Análisis técnico según currículum chileno, Decreto 67/2018 y estándares MINEDUC</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del instrumento</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Prueba Unidad 3 - Fracciones"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de instrumento</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {TIPOS_INSTRUMENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
            <select
              value={form.asignatura}
              onChange={(e) => setForm({ ...form, asignatura: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccionar...</option>
              {allAsignaturas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccionar...</option>
              {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* File upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cargar archivo</label>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-2">{file ? '📄' : '☁️'}</div>
            {file ? (
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }} className="mt-2 text-red-500 text-sm hover:underline">Quitar archivo</button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">Arrastra aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-400 mt-1">PDF, Word (.docx), PNG, JPG</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            O pega el texto del instrumento
          </label>
          <textarea
            value={form.texto}
            onChange={(e) => setForm({ ...form, texto: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            placeholder="Pega aquí el texto completo de la prueba, guía o rúbrica..."
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          {loading ? '⏳ Analizando instrumento... (puede tomar 30-60 segundos)' : '🔍 Analizar Instrumento'}
        </button>
      </form>

      {/* Results */}
      {analisis && (
        <div className="space-y-6">
          {/* Score summary */}
          <div className={`rounded-xl border-2 p-6 ${scoreBg}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Resultado del Análisis</h2>
                <p className="text-gray-600 mt-1">{analisis.resumenEjecutivo}</p>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${scoreColor}`}>{puntaje}</div>
                <div className="text-gray-500 text-sm">/100</div>
                <div className={`font-semibold mt-1 ${scoreColor}`}>{analisis.calificacionGeneral}</div>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          {analisis.dimensiones && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Análisis por Dimensión</h3>
              <div className="space-y-4">
                {(Object.keys(dimLabels) as DimKey[]).map((key) => {
                  const dim = analisis.dimensiones?.[key]
                  if (!dim) return null
                  return (
                    <div key={key} className="border border-gray-100 rounded-lg p-4">
                      <ScoreBar score={dim.puntaje} label={dimLabels[key]} />
                      <p className="text-sm text-gray-600 mt-2">{dim.descripcion}</p>
                      {dim.observaciones && dim.observaciones.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {dim.observaciones.map((obs, i) => (
                            <li key={i} className="text-xs text-gray-500 flex gap-2">
                              <span>•</span><span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="font-bold text-red-800 mb-3">⚠️ Aspectos a mejorar</h3>
              <ul className="space-y-2">
                {analisis.debilidades?.map((d, i) => (
                  <li key={i} className="text-sm text-red-700 flex gap-2"><span>•</span><span>{d}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recomendaciones */}
          {analisis.recomendaciones && analisis.recomendaciones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">💡 Recomendaciones</h3>
              <div className="space-y-3">
                {analisis.recomendaciones.map((rec, i) => {
                  const colors = { Alta: 'bg-red-100 text-red-700', Media: 'bg-yellow-100 text-yellow-700', Baja: 'bg-green-100 text-green-700' }
                  const c = colors[rec.prioridad as keyof typeof colors] || 'bg-gray-100 text-gray-700'
                  return (
                    <div key={i} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c}`}>Prioridad {rec.prioridad}</span>
                        <span className="text-xs text-gray-500">{rec.categoria}</span>
                      </div>
                      <p className="text-sm text-gray-700">{rec.descripcion}</p>
                      {rec.ejemploMejora && <p className="text-sm text-blue-600 mt-1 italic">Ejemplo: {rec.ejemploMejora}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items detalle */}
          {analisis.itemsDetalle && analisis.itemsDetalle.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">📝 Análisis por Ítem</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">N°</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Tipo</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Nivel Cognitivo</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Calidad</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analisis.itemsDetalle.map((item, i) => {
                      const qColors = { Excelente: 'text-green-600', Bueno: 'text-blue-600', Regular: 'text-yellow-600', Deficiente: 'text-red-600' }
                      const qc = qColors[item.calidad as keyof typeof qColors] || 'text-gray-600'
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{item.numero}</td>
                          <td className="py-2 px-3 text-gray-600">{item.tipo}</td>
                          <td className="py-2 px-3 text-gray-600">{item.nivelCognitivo}</td>
                          <td className={`py-2 px-3 font-medium ${qc}`}>{item.calidad}</td>
                          <td className="py-2 px-3 text-gray-600">{item.observacion}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
