'use client'

import { useState } from 'react'
import { ASIGNATURAS, NIVELES, TIPOS_ITEM, NIVELES_COGNITIVOS } from '@/lib/curriculum'

const allAsignaturas = [...new Set([...ASIGNATURAS.basica, ...ASIGNATURAS.media])].sort()

export default function TablaPage() {
  const [form, setForm] = useState({
    asignatura: '',
    nivel: '',
    oas: '',
    cantidadItems: 20,
    puntajeTotal: 40,
    tiposItems: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  function toggleTipo(tipo: string) {
    setForm((prev) => ({
      ...prev,
      tiposItems: prev.tiposItems.includes(tipo)
        ? prev.tiposItems.filter((t) => t !== tipo)
        : [...prev.tiposItems, tipo],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asignatura || !form.nivel || !form.oas.trim()) {
      setError('Completa asignatura, nivel y OAs')
      return
    }
    if (form.tiposItems.length === 0) {
      setError('Selecciona al menos un tipo de ítem')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/tabla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cantidadItems: Number(form.cantidadItems),
        puntajeTotal: Number(form.puntajeTotal),
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setResult(data.tabla)
    } else {
      setError(data.error || 'Error al generar la tabla')
    }
    setLoading(false)
  }

  const tabla = result as {
    titulo?: string
    asignatura?: string
    nivel?: string
    puntajeTotal?: number
    cantidadItems?: number
    distribucionCognitiva?: Record<string, { porcentaje: number; items: number }>
    filas?: {
      oa: string
      indicadoresEvaluacion: string[]
      nivelCognitivo: string
      tipoItem: string
      numerosItems: number[]
      cantidadItems: number
      puntajeItems: number
      porcentaje: number
    }[]
    totales?: { items: number; puntaje: number; porcentaje: number }
    notas?: string[]
  } | null

  const cognitiveColors: Record<string, string> = {
    conocimiento: 'bg-blue-100 text-blue-800',
    comprension: 'bg-green-100 text-green-800',
    aplicacion: 'bg-yellow-100 text-yellow-800',
    analisis: 'bg-orange-100 text-orange-800',
    sintesis: 'bg-purple-100 text-purple-800',
    evaluacion: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Tabla de Especificaciones</h1>
        <p className="text-gray-500 mt-1">Genera tablas de especificaciones técnicas alineadas al currículum y Taxonomía de Bloom</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura *</label>
            <select
              required
              value={form.asignatura}
              onChange={(e) => setForm({ ...form, asignatura: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccionar...</option>
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
              <option value="">Seleccionar...</option>
              {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total de ítems</label>
            <input
              type="number" min="5" max="80"
              value={form.cantidadItems}
              onChange={(e) => setForm({ ...form, cantidadItems: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puntaje total</label>
            <input
              type="number" min="10" max="500"
              value={form.puntajeTotal}
              onChange={(e) => setForm({ ...form, puntajeTotal: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">OAs a evaluar *</label>
            <textarea
              required
              value={form.oas}
              onChange={(e) => setForm({ ...form, oas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              placeholder="Ej: OA1: Leer textos literarios..., OA3: Escribir textos narrativos..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de ítems a incluir *</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_ITEM.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => toggleTipo(tipo)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.tiposItems.includes(tipo)
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          {loading ? '⏳ Generando tabla... (puede tomar 30-60 segundos)' : '📊 Generar Tabla de Especificaciones'}
        </button>
      </form>

      {tabla && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tabla.titulo}</h2>
              <p className="text-gray-500 text-sm">{tabla.asignatura} — {tabla.nivel}</p>
            </div>
            <button onClick={() => window.print()} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">🖨️ Imprimir</button>
          </div>

          {/* Cognitive distribution */}
          {tabla.distribucionCognitiva && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Distribución Cognitiva (Taxonomía de Bloom)</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(tabla.distribucionCognitiva).map(([key, val]) => (
                  <div key={key} className={`rounded-lg p-3 text-center ${cognitiveColors[key] || 'bg-gray-100 text-gray-700'}`}>
                    <div className="text-xl font-bold">{val.porcentaje}%</div>
                    <div className="text-xs font-medium capitalize">{key}</div>
                    <div className="text-xs">{val.items} ítems</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="text-left p-3">Objetivo de Aprendizaje</th>
                  <th className="text-left p-3">Indicadores de Evaluación</th>
                  <th className="text-left p-3">Nivel Cognitivo</th>
                  <th className="text-left p-3">Tipo de Ítem</th>
                  <th className="text-center p-3">Ítems</th>
                  <th className="text-center p-3">N° Ítems</th>
                  <th className="text-center p-3">Puntaje</th>
                  <th className="text-center p-3">%</th>
                </tr>
              </thead>
              <tbody>
                {tabla.filas?.map((fila, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 text-gray-800 border-b border-gray-100 align-top font-medium">{fila.oa}</td>
                    <td className="p-3 text-gray-600 border-b border-gray-100 align-top">
                      <ul className="space-y-0.5">
                        {fila.indicadoresEvaluacion?.map((ind, j) => <li key={j} className="text-xs">• {ind}</li>)}
                      </ul>
                    </td>
                    <td className="p-3 border-b border-gray-100 align-top">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cognitiveColors[fila.nivelCognitivo?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                        {fila.nivelCognitivo}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 border-b border-gray-100 align-top text-xs">{fila.tipoItem}</td>
                    <td className="p-3 text-center text-gray-600 border-b border-gray-100 align-top text-xs">{fila.numerosItems?.join(', ')}</td>
                    <td className="p-3 text-center font-medium text-gray-800 border-b border-gray-100 align-top">{fila.cantidadItems}</td>
                    <td className="p-3 text-center font-medium text-gray-800 border-b border-gray-100 align-top">{fila.puntajeItems}</td>
                    <td className="p-3 text-center text-gray-600 border-b border-gray-100 align-top">{fila.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
              {tabla.totales && (
                <tfoot>
                  <tr className="bg-orange-50 font-bold">
                    <td colSpan={5} className="p-3 text-right text-orange-900">TOTALES</td>
                    <td className="p-3 text-center text-orange-900">{tabla.totales.items}</td>
                    <td className="p-3 text-center text-orange-900">{tabla.totales.puntaje}</td>
                    <td className="p-3 text-center text-orange-900">{tabla.totales.porcentaje}%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {tabla.notas && tabla.notas.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Notas metodológicas:</p>
              {tabla.notas.map((nota, i) => <p key={i} className="text-xs text-gray-500">• {nota}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
