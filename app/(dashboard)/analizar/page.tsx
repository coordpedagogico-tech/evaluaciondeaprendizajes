'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
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

const dimDescriptions: Record<DimKey, string> = {
  validezContenido: 'Qué tan bien mide lo que debe medir según OA',
  coherenciaCurricular: 'Alineación con Bases Curriculares MINEDUC',
  calidadItems: 'Claridad, redacción y pertinencia de los ítems',
  distribucionCognitiva: 'Distribución en niveles de Taxonomía de Bloom',
  aspectosTecnicos: 'Instrucciones, puntajes, tiempo y formato',
  cumplimientoDecreto67: 'Cumplimiento del Decreto 67/2018',
}

function ScoreBar({ score, label, desc }: { score: number; label: string; desc?: string }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'
  const bgColor = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-yellow-50' : score >= 40 ? 'bg-orange-50' : 'bg-red-50'
  return (
    <div className={`rounded-xl border p-4 ${bgColor} border-opacity-50`} style={{ borderColor: score >= 80 ? '#d1fae5' : score >= 60 ? '#fef3c7' : score >= 40 ? '#ffedd5' : '#fee2e2' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{label}</p>
          {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        <span className="text-2xl font-bold text-gray-900 ml-3">{score}<span className="text-sm font-normal text-gray-400">/100</span></span>
      </div>
      <div className="w-full bg-white/70 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

const cognitiveColors: Record<string, string> = {
  conocimiento: 'bg-purple-100 text-purple-800 border-purple-200',
  comprension: 'bg-blue-100 text-blue-800 border-blue-200',
  aplicacion: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  analisis: 'bg-green-100 text-green-800 border-green-200',
  sintesis: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  evaluacion: 'bg-orange-100 text-orange-800 border-orange-200',
}
const cognitiveLabels: Record<string, string> = {
  conocimiento: 'Conocimiento', comprension: 'Comprensión', aplicacion: 'Aplicación',
  analisis: 'Análisis', sintesis: 'Síntesis', evaluacion: 'Evaluación',
}

type AnalisisResult = {
  puntajeGeneral?: number
  calificacionGeneral?: string
  resumenEjecutivo?: string
  fortalezas?: string[]
  debilidades?: string[]
  dimensiones?: Record<DimKey, { puntaje: number; descripcion: string; observaciones?: string[]; niveles?: Record<string, number> }>
  recomendaciones?: { prioridad: string; categoria: string; descripcion: string; ejemploMejora?: string }[]
  itemsDetalle?: { numero: number; tipo: string; nivelCognitivo: string; calidad: string; observacion: string; sugerencia?: string }[]
  tablaEspecificaciones?: { existe?: boolean; sugerida?: { oa: string; indicador?: string; nivelCognitivo: string; tipoItem: string; cantidadItems: number; puntaje: number; porcentaje: number }[] }
  cumplimientoNormativo?: Record<string, { cumple: boolean; observaciones: string }>
}

export default function AnalizarPage() {
  const [form, setForm] = useState({ titulo: '', asignatura: '', nivel: '', tipo: 'prueba', texto: '' })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [result, setResult] = useState<AnalisisResult | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState<'dimensiones' | 'items' | 'recomendaciones' | 'tabla'>('dimensiones')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    const allowed = ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg', 'webp']
    if (!allowed.includes(ext)) {
      setError(`Formato no soportado. Use: ${allowed.join(', ')}`)
      return
    }
    if (f.size > 15 * 1024 * 1024) { setError('El archivo excede 15 MB'); return }
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
    setStreamText('')
    setSavedId(null)

    const fd = new FormData()
    fd.append('titulo', form.titulo || 'Sin título')
    fd.append('asignatura', form.asignatura)
    fd.append('nivel', form.nivel)
    fd.append('tipo', form.tipo)
    fd.append('texto', form.texto)
    if (file) fd.append('file', file)

    try {
      const res = await fetch('/api/analizar/stream', { method: 'POST', body: fd })
      if (!res.ok || !res.body) {
        // Fallback a no-stream
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.error) { setError(data.error); continue }
            if (data.text) setStreamText((prev) => prev + data.text)
            if (data.done) {
              if (data.analisis) setResult(data.analisis)
              if (data.id) setSavedId(data.id)
              if (data.raw && !data.analisis) {
                try {
                  const m = data.raw.match(/\{[\s\S]*\}/)
                  if (m) setResult(JSON.parse(m[0]))
                } catch { setError('No se pudo parsear el análisis') }
              }
            }
          } catch { /* ignore malformed */ }
        }
      }
    } catch (err) {
      // Fallback to old API
      try {
        const res = await fetch('/api/analizar', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) { setResult(data.analisis); setSavedId(data.id) }
        else setError(data.error || 'Error al analizar')
      } catch {
        setError(`Error de conexión: ${err instanceof Error ? err.message : String(err)}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const analisis = result
  const puntaje = analisis?.puntajeGeneral ?? 0
  const scoreColor = puntaje >= 80 ? 'text-green-600' : puntaje >= 60 ? 'text-yellow-600' : puntaje >= 40 ? 'text-orange-600' : 'text-red-600'
  const scoreBg = puntaje >= 80 ? 'bg-green-50 border-green-300' : puntaje >= 60 ? 'bg-yellow-50 border-yellow-300' : puntaje >= 40 ? 'bg-orange-50 border-orange-300' : 'bg-red-50 border-red-300'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔍 Analizar Instrumento de Evaluación</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Análisis técnico en 6 dimensiones · Currículum Chileno · Decreto 67/2018 · Taxonomía de Bloom
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del instrumento</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              placeholder="Ej: Prueba Unidad 3 — Fracciones equivalentes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de instrumento</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            >
              <option value="">Seleccionar (recomendado)...</option>
              <optgroup label="Enseñanza Básica">
                {ASIGNATURAS.basica.map((a) => <option key={`b-${a}`} value={a}>{a}</option>)}
              </optgroup>
              <optgroup label="Enseñanza Media">
                {ASIGNATURAS.media.map((a) => <option key={`m-${a}`} value={a}>{a}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            >
              <option value="">Seleccionar (recomendado)...</option>
              <optgroup label="Enseñanza Básica">
                {NIVELES.filter(n => n.includes('Básico')).map((n) => <option key={n} value={n}>{n}</option>)}
              </optgroup>
              <optgroup label="Enseñanza Media">
                {NIVELES.filter(n => n.includes('Medio')).map((n) => <option key={n} value={n}>{n}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Mientras más información sobre asignatura y nivel, más preciso y alineado al currículum será el análisis.</label>
          </div>
        </div>

        {/* Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargar archivo del instrumento
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-blue-400 bg-blue-50 scale-[1.01]' :
              file ? 'border-green-400 bg-green-50' :
              'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-2">{file ? '✅' : '📁'}</div>
            {file ? (
              <div>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="mt-2 text-red-500 text-sm hover:underline"
                >
                  ✕ Quitar archivo
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 font-medium">Arrastra aquí o haz clic para seleccionar</p>
                <p className="text-sm text-gray-400 mt-1">
                  📄 PDF · 📝 Word (.docx) · 🖼️ PNG · JPG · WebP — máx. 15 MB
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  También puedes cargar fotos de pruebas escritas a mano
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            O pega el texto del instrumento
          </label>
          <textarea
            value={form.texto}
            onChange={(e) => setForm({ ...form, texto: e.target.value })}
            rows={7}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm font-mono"
            placeholder={`Pega aquí el texto completo del instrumento. Por ejemplo:\n\nNombre: _________________ Fecha: _______\n\nI. SELECCIÓN MÚLTIPLE (20 pts)\nSelecciona la alternativa correcta:\n\n1. ¿Cuál es el resultado de 3/4 + 1/4?\na) 1   b) 2   c) 1/2   d) 3/8\n\n...`}
          />
          <p className="text-xs text-gray-400 mt-1">Puedes usar archivo Y texto simultáneamente — ambos serán analizados</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-start gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all text-sm shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analizando con IA... puede tomar 30–60 segundos
            </span>
          ) : '🔍 Analizar Instrumento con IA'}
        </button>
      </form>

      {/* Streaming indicator */}
      {loading && streamText && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">EvalUA está analizando...</span>
          </div>
          <p className="text-xs text-blue-600 font-mono line-clamp-3">{streamText.slice(-200)}</p>
        </div>
      )}

      {/* Results */}
      {analisis && (
        <div className="space-y-6 print:space-y-4">
          {/* Score header */}
          <div className={`rounded-xl border-2 p-6 ${scoreBg}`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">Resultado del Análisis</h2>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    puntaje >= 80 ? 'bg-green-100 text-green-700' :
                    puntaje >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    puntaje >= 40 ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>{analisis.calificacionGeneral}</span>
                  {savedId && (
                    <Link
                      href={`/historial/${savedId}`}
                      className="text-xs text-blue-700 hover:underline"
                    >
                      ✅ Guardado · Ver en historial →
                    </Link>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">{analisis.resumenEjecutivo}</p>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${scoreColor}`}>{puntaje}</div>
                <div className="text-gray-400 text-sm">/100 pts</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {[
                { key: 'dimensiones', label: '📊 Dimensiones' },
                { key: 'items', label: `📝 Ítems${analisis.itemsDetalle?.length ? ` (${analisis.itemsDetalle.length})` : ''}` },
                { key: 'recomendaciones', label: `💡 Recomendaciones${analisis.recomendaciones?.length ? ` (${analisis.recomendaciones.length})` : ''}` },
                { key: 'tabla', label: '📋 Especificaciones' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Dimensiones */}
              {activeTab === 'dimensiones' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.keys(dimLabels) as DimKey[]).map((key) => {
                      const dim = analisis.dimensiones?.[key]
                      if (!dim) return null
                      return (
                        <div key={key}>
                          <ScoreBar score={dim.puntaje} label={dimLabels[key]} desc={dimDescriptions[key]} />
                          {dim.descripcion && (
                            <p className="text-xs text-gray-500 mt-1.5 px-1">{dim.descripcion}</p>
                          )}
                          {dim.observaciones && dim.observaciones.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5 px-1">
                              {dim.observaciones.map((obs, i) => (
                                <li key={i} className="text-xs text-gray-400 flex gap-1.5">
                                  <span>•</span><span>{obs}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Distribución cognitiva visual */}
                  {analisis.dimensiones?.distribucionCognitiva?.niveles && (
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución por Taxonomía de Bloom</h3>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(analisis.dimensiones.distribucionCognitiva.niveles).map(([nivel, count]) => (
                          <div key={nivel} className={`rounded-xl px-2 py-3 text-center border ${cognitiveColors[nivel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-xs font-medium mt-0.5">{cognitiveLabels[nivel] || nivel}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fortalezas/debilidades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h3 className="font-semibold text-green-800 mb-2 text-sm">✅ Fortalezas</h3>
                      <ul className="space-y-1.5">
                        {analisis.fortalezas?.map((f, i) => (
                          <li key={i} className="text-sm text-green-700 flex gap-2"><span className="flex-shrink-0">•</span><span>{f}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h3 className="font-semibold text-orange-800 mb-2 text-sm">⚠️ Aspectos a mejorar</h3>
                      <ul className="space-y-1.5">
                        {analisis.debilidades?.map((d, i) => (
                          <li key={i} className="text-sm text-orange-700 flex gap-2"><span className="flex-shrink-0">•</span><span>{d}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cumplimiento normativo */}
                  {analisis.cumplimientoNormativo && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">📜 Cumplimiento Normativo</h3>
                      <div className="space-y-2">
                        {Object.entries(analisis.cumplimientoNormativo).map(([key, val]) => (
                          <div key={key} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                            <span className={`text-base flex-shrink-0 mt-0.5 ${val.cumple ? 'text-green-500' : 'text-red-500'}`}>
                              {val.cumple ? '✓' : '✗'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {key === 'decreto67' ? 'Decreto 67/2018'
                                  : key === 'basesCurriculares' ? 'Bases Curriculares MINEDUC'
                                  : 'Orientaciones de Evaluación'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{val.observaciones}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ítems */}
              {activeTab === 'items' && (
                <div>
                  {analisis.itemsDetalle && analisis.itemsDetalle.length > 0 ? (
                    <div className="space-y-3">
                      {analisis.itemsDetalle.map((item, i) => {
                        const qColors: Record<string, string> = {
                          Excelente: 'bg-green-100 text-green-700',
                          Bueno: 'bg-blue-100 text-blue-700',
                          Regular: 'bg-yellow-100 text-yellow-700',
                          Deficiente: 'bg-red-100 text-red-700',
                        }
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-bold text-gray-900">Ítem {item.numero}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.tipo}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${cognitiveColors[item.nivelCognitivo?.toLowerCase() as keyof typeof cognitiveColors] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {item.nivelCognitivo}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${qColors[item.calidad] || 'bg-gray-100 text-gray-700'}`}>
                                {item.calidad}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{item.observacion}</p>
                            {item.sugerencia && (
                              <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-2">
                                💡 {item.sugerencia}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-10">
                      No se detectaron ítems individuales en el análisis.
                      Intenta con el texto completo de la prueba para obtener análisis ítem por ítem.
                    </p>
                  )}
                </div>
              )}

              {/* Recomendaciones */}
              {activeTab === 'recomendaciones' && (
                <div className="space-y-5">
                  {['Alta', 'Media', 'Baja'].map((prioridad) => {
                    const items = analisis.recomendaciones?.filter((r) => r.prioridad === prioridad) || []
                    if (!items.length) return null
                    const colors: Record<string, string> = {
                      Alta: 'border-red-200 bg-red-50',
                      Media: 'border-yellow-200 bg-yellow-50',
                      Baja: 'border-green-200 bg-green-50',
                    }
                    const badgeColors: Record<string, string> = {
                      Alta: 'bg-red-100 text-red-700',
                      Media: 'bg-yellow-100 text-yellow-700',
                      Baja: 'bg-green-100 text-green-700',
                    }
                    return (
                      <div key={prioridad}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColors[prioridad]}`}>
                            🔺 Prioridad {prioridad}
                          </span>
                          <span className="text-xs text-gray-400">{items.length} recomendación{items.length !== 1 ? 'es' : ''}</span>
                        </div>
                        <div className="space-y-2">
                          {items.map((rec, i) => (
                            <div key={i} className={`border rounded-xl p-4 ${colors[prioridad]}`}>
                              <p className="text-xs font-medium text-gray-500 mb-1">{rec.categoria}</p>
                              <p className="text-sm text-gray-800 leading-relaxed">{rec.descripcion}</p>
                              {rec.ejemploMejora && (
                                <div className="mt-2.5 text-xs text-blue-700 bg-white rounded-lg px-3 py-2 border border-blue-100">
                                  📌 <strong>Ejemplo:</strong> {rec.ejemploMejora}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Tabla de especificaciones */}
              {activeTab === 'tabla' && (
                <div>
                  {analisis.tablaEspecificaciones?.sugerida && analisis.tablaEspecificaciones.sugerida.length > 0 ? (
                    <div>
                      <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${
                        analisis.tablaEspecificaciones.existe
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {analisis.tablaEspecificaciones.existe
                          ? '✅ El instrumento incluye tabla de especificaciones'
                          : '💡 Tabla de especificaciones sugerida para este instrumento'}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-blue-700 text-white">
                              <th className="text-left p-3 rounded-tl-lg">Objetivo de Aprendizaje</th>
                              <th className="text-left p-3">Nivel Cognitivo</th>
                              <th className="text-left p-3">Tipo de Ítem</th>
                              <th className="text-center p-3">Cant.</th>
                              <th className="text-center p-3">Ptaje.</th>
                              <th className="text-center p-3 rounded-tr-lg">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analisis.tablaEspecificaciones.sugerida.map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-3 text-gray-800 border-b border-gray-100 text-xs">{row.oa}</td>
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
                    <div className="text-center py-10">
                      <p className="text-gray-500 text-sm mb-3">Tabla de especificaciones no disponible en este análisis.</p>
                      <Link href="/tabla" className="text-sm text-blue-700 hover:underline">
                        Crear tabla de especificaciones →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Acciones post-análisis */}
          <div className="flex flex-wrap gap-3 justify-end print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🖨️ Imprimir / Guardar PDF
            </button>
            <Link
              href="/crear"
              className="px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
            >
              ✏️ Crear nueva evaluación
            </Link>
            <Link
              href="/pauta"
              className="px-4 py-2 border border-purple-200 bg-purple-50 rounded-lg text-sm text-purple-700 hover:bg-purple-100 transition-colors"
            >
              📋 Generar pauta de corrección
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
