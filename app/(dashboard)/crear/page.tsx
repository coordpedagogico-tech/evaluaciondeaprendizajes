'use client'

import { useState } from 'react'
import { ASIGNATURAS, NIVELES, TIPOS_INSTRUMENTO, TIPOS_ITEM } from '@/lib/curriculum'

const allAsignaturas = [...new Set([...ASIGNATURAS.basica, ...ASIGNATURAS.media])].sort()

export default function CrearPage() {
  const [form, setForm] = useState({
    titulo: '',
    asignatura: '',
    nivel: '',
    oas: '',
    tipoEvaluacion: 'prueba',
    cantidadItems: 20,
    tiempoMinutos: 90,
    instrucciones: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'evaluacion' | 'pauta' | 'tabla'>('evaluacion')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asignatura || !form.nivel || !form.oas.trim()) {
      setError('Completa asignatura, nivel y objetivos de aprendizaje')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cantidadItems: Number(form.cantidadItems),
        tiempoMinutos: Number(form.tiempoMinutos),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setResult(data.evaluacion)
    } else {
      setError(data.error || 'Error al crear la evaluación')
    }
    setLoading(false)
  }

  const ev = result as {
    titulo?: string
    encabezado?: Record<string, string | number>
    instruccionesGenerales?: string
    secciones?: {
      numero: number
      titulo: string
      instrucciones: string
      puntajeTotal: number
      items: {
        numero: number
        tipo: string
        enunciado: string
        alternativas?: string[]
        puntaje: number
        oa: string
        nivelCognitivo: string
      }[]
    }[]
    pautaCorreccion?: {
      items: { numero: number; respuestaCorrecta: string; criterios: string[]; puntaje: number }[]
      escalaCalificacion: { puntajeMaximo: number; notaMinima: number; porcentajeExigencia: number; tabla: { puntajeMin: number; puntajeMax: number; nota: number }[] }
    }
    tablaEspecificaciones?: {
      oa: string
      indicadores: string[]
      nivelCognitivo: string
      tipoItem: string
      numerosItems: number[]
      puntaje: number
      porcentaje: number
    }[]
  } | null

  function handleCopy() {
    if (!ev) return
    const text = JSON.stringify(ev, null, 2)
    navigator.clipboard.writeText(text)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">✏️ Crear Evaluación</h1>
        <p className="text-gray-500 mt-1">Genera evaluaciones completas alineadas al currículum nacional chileno</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la evaluación</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Evaluación Unidad 2 - El ecosistema"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura *</label>
            <select
              required
              value={form.asignatura}
              onChange={(e) => setForm({ ...form, asignatura: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccionar asignatura...</option>
              {allAsignaturas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
            <select
              required
              value={form.nivel}
              onChange={(e) => setForm({ ...form, nivel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccionar nivel...</option>
              {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de instrumento</label>
            <select
              value={form.tipoEvaluacion}
              onChange={(e) => setForm({ ...form, tipoEvaluacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {TIPOS_INSTRUMENTO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de ítems</label>
            <input
              type="number"
              min="5" max="60"
              value={form.cantidadItems}
              onChange={(e) => setForm({ ...form, cantidadItems: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo (minutos)</label>
            <input
              type="number"
              min="30" max="300" step="15"
              value={form.tiempoMinutos}
              onChange={(e) => setForm({ ...form, tiempoMinutos: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos de Aprendizaje (OA) a evaluar *</label>
            <textarea
              required
              value={form.oas}
              onChange={(e) => setForm({ ...form, oas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              placeholder="Ej: OA1: Leer de manera fluente textos... OA3: Escribir textos narrativos..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones adicionales <span className="text-gray-400">(opcional)</span></label>
            <textarea
              value={form.instrucciones}
              onChange={(e) => setForm({ ...form, instrucciones: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              placeholder="Ej: Incluir contextos de la vida cotidiana, priorizar preguntas de aplicación..."
            />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          {loading ? '⏳ Generando evaluación... (puede tomar 30-60 segundos)' : '✨ Generar Evaluación Completa'}
        </button>
      </form>

      {ev && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'evaluacion', label: '📄 Evaluación' },
              { key: 'pauta', label: '📋 Pauta' },
              { key: 'tabla', label: '📊 Tabla de Especificaciones' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex gap-2 mb-4 justify-end">
              <button onClick={handleCopy} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">📋 Copiar JSON</button>
              <button onClick={handlePrint} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">🖨️ Imprimir</button>
            </div>

            {activeTab === 'evaluacion' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{ev.titulo}</h2>
                {ev.encabezado && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(ev.encabezado).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="font-medium text-gray-600 capitalize">{k}:</span>
                        <span className="text-gray-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {ev.instruccionesGenerales && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-800">
                    <strong>Instrucciones generales:</strong> {ev.instruccionesGenerales}
                  </div>
                )}
                {ev.secciones?.map((sec) => (
                  <div key={sec.numero} className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-2">{sec.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-3 italic">{sec.instrucciones}</p>
                    <div className="space-y-4">
                      {sec.items.map((item) => (
                        <div key={item.numero} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-800">{item.numero}. {item.enunciado}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded ml-2 whitespace-nowrap">({item.puntaje} pt{item.puntaje !== 1 ? 's' : ''})</span>
                          </div>
                          {item.alternativas && item.alternativas.length > 0 && (
                            <div className="space-y-1 ml-4">
                              {item.alternativas.map((alt, j) => (
                                <p key={j} className="text-sm text-gray-700">{alt}</p>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs text-gray-400">{item.nivelCognitivo}</span>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-xs text-gray-400">{item.oa}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pauta' && ev.pautaCorreccion && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pauta de Corrección</h2>
                {ev.pautaCorreccion.escalaCalificacion && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Escala de Calificación</h3>
                    <p className="text-sm text-blue-800">Puntaje máximo: <strong>{ev.pautaCorreccion.escalaCalificacion.puntajeMaximo}</strong></p>
                    <p className="text-sm text-blue-800">Exigencia: <strong>{ev.pautaCorreccion.escalaCalificacion.porcentajeExigencia}%</strong></p>
                    {ev.pautaCorreccion.escalaCalificacion.tabla.length > 0 && (
                      <div className="mt-2 overflow-x-auto">
                        <table className="text-sm w-full">
                          <thead><tr className="border-b border-blue-200">
                            <th className="text-left py-1 px-2 text-blue-800">Puntaje mín.</th>
                            <th className="text-left py-1 px-2 text-blue-800">Puntaje máx.</th>
                            <th className="text-left py-1 px-2 text-blue-800">Nota</th>
                          </tr></thead>
                          <tbody>
                            {ev.pautaCorreccion.escalaCalificacion.tabla.slice(0, 10).map((row, i) => (
                              <tr key={i} className="border-b border-blue-100">
                                <td className="py-1 px-2 text-blue-900">{row.puntajeMin}</td>
                                <td className="py-1 px-2 text-blue-900">{row.puntajeMax}</td>
                                <td className="py-1 px-2 font-bold text-blue-900">{row.nota.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  {ev.pautaCorreccion.items.map((item) => (
                    <div key={item.numero} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-800">Ítem {item.numero}</span>
                        <span className="text-sm text-gray-500">{item.puntaje} pt{item.puntaje !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-sm text-green-700"><strong>Respuesta correcta:</strong> {item.respuestaCorrecta}</p>
                      {item.criterios?.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {item.criterios.map((c, i) => <li key={i} className="text-xs text-gray-600">• {c}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tabla' && ev.tablaEspecificaciones && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tabla de Especificaciones</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-700 text-white">
                        <th className="text-left p-3 rounded-tl-lg">Objetivo de Aprendizaje</th>
                        <th className="text-left p-3">Nivel Cognitivo</th>
                        <th className="text-left p-3">Tipo de Ítem</th>
                        <th className="text-center p-3">Ítems N°</th>
                        <th className="text-center p-3">Puntaje</th>
                        <th className="text-center p-3 rounded-tr-lg">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.tablaEspecificaciones.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 text-gray-800 border-b border-gray-100">{row.oa}</td>
                          <td className="p-3 text-gray-600 border-b border-gray-100">{row.nivelCognitivo}</td>
                          <td className="p-3 text-gray-600 border-b border-gray-100">{row.tipoItem}</td>
                          <td className="p-3 text-center text-gray-600 border-b border-gray-100">{row.numerosItems?.join(', ')}</td>
                          <td className="p-3 text-center font-medium text-gray-800 border-b border-gray-100">{row.puntaje}</td>
                          <td className="p-3 text-center text-gray-600 border-b border-gray-100">{row.porcentaje}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
