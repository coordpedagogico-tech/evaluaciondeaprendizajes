'use client'

import { useState } from 'react'
import { ASIGNATURAS, NIVELES } from '@/lib/curriculum'

const allAsignaturas = [...new Set([...ASIGNATURAS.basica, ...ASIGNATURAS.media])].sort()

export default function PautaPage() {
  const [form, setForm] = useState({
    instrumento: '',
    titulo: '',
    asignatura: '',
    nivel: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.instrumento.trim()) {
      setError('Ingresa el texto del instrumento')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/pauta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setResult(data.pauta)
    } else {
      setError(data.error || 'Error al generar la pauta')
    }
    setLoading(false)
  }

  const pauta = result as {
    titulo?: string
    puntajeTotal?: number
    escalaCalificacion?: {
      puntajeMaximo: number
      notaMinima: number
      porcentajeExigencia: number
      formula: string
      tabla: { puntajeMin: number; puntajeMax: number; nota: number }[]
    }
    criteriosGenerales?: string[]
    items?: {
      numero: number
      tipo: string
      enunciado: string
      respuestaCorrecta: string
      puntaje: number
      criteriosEvaluacion: { criterio: string; puntaje: number; indicadores?: string[] }[]
      erroresComunesEsperados?: string[]
      observacionesDocente?: string
    }[]
    observacionesGenerales?: string
  } | null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📋 Generar Pauta de Corrección</h1>
        <p className="text-gray-500 mt-1">Crea pautas detalladas con criterios, escala de calificaciones y orientaciones docentes</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Título del instrumento"
            />
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Texto del instrumento a corregir *</label>
          <textarea
            required
            value={form.instrumento}
            onChange={(e) => setForm({ ...form, instrumento: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
            placeholder="Pega aquí el texto completo de la prueba o guía para la cual deseas generar la pauta..."
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          {loading ? '⏳ Generando pauta... (puede tomar 30-60 segundos)' : '📋 Generar Pauta de Corrección'}
        </button>
      </form>

      {pauta && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{pauta.titulo || 'Pauta de Corrección'}</h2>
            <button onClick={() => window.print()} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">🖨️ Imprimir</button>
          </div>

          {pauta.escalaCalificacion && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">Escala de Calificación</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{pauta.escalaCalificacion.puntajeMaximo}</div>
                  <div className="text-xs text-blue-600">Ptje. máximo</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{pauta.escalaCalificacion.porcentajeExigencia}%</div>
                  <div className="text-xs text-blue-600">Exigencia</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{pauta.escalaCalificacion.notaMinima}</div>
                  <div className="text-xs text-blue-600">Nota mínima</div>
                </div>
                <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">7.0</div>
                  <div className="text-xs text-blue-600">Nota máxima</div>
                </div>
              </div>
              <p className="text-xs text-blue-700 italic">{pauta.escalaCalificacion.formula}</p>
              {pauta.escalaCalificacion.tabla.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="text-sm w-full">
                    <thead><tr className="bg-blue-100">
                      <th className="py-1 px-3 text-left text-blue-800">Ptje. mín.</th>
                      <th className="py-1 px-3 text-left text-blue-800">Ptje. máx.</th>
                      <th className="py-1 px-3 text-left text-blue-800">Nota</th>
                    </tr></thead>
                    <tbody>
                      {pauta.escalaCalificacion.tabla.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="py-1 px-3 text-blue-900">{row.puntajeMin}</td>
                          <td className="py-1 px-3 text-blue-900">{row.puntajeMax}</td>
                          <td className="py-1 px-3 font-bold text-blue-900">{row.nota.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {pauta.criteriosGenerales && pauta.criteriosGenerales.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Criterios generales de corrección</h3>
              <ul className="space-y-1">
                {pauta.criteriosGenerales.map((c, i) => <li key={i} className="text-sm text-yellow-800">• {c}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {pauta.items?.map((item) => (
              <div key={item.numero} className="border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900">Ítem {item.numero} — {item.tipo}</h4>
                  <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">{item.puntaje} pt{item.puntaje !== 1 ? 's' : ''}</span>
                </div>
                {item.enunciado && <p className="text-sm text-gray-600 mb-3 italic">{item.enunciado}</p>}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <span className="text-sm font-semibold text-green-800">Respuesta correcta: </span>
                  <span className="text-sm text-green-700">{item.respuestaCorrecta}</span>
                </div>
                {item.criteriosEvaluacion?.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Criterios de evaluación:</h5>
                    <div className="space-y-2">
                      {item.criteriosEvaluacion.map((crit, i) => (
                        <div key={i} className="flex justify-between items-start border border-gray-100 rounded-lg p-2">
                          <div className="flex-1">
                            <span className="text-sm text-gray-700">{crit.criterio}</span>
                            {crit.indicadores?.map((ind, j) => <p key={j} className="text-xs text-gray-400 ml-2">- {ind}</p>)}
                          </div>
                          <span className="text-sm font-medium text-gray-600 ml-2">{crit.puntaje} pt{crit.puntaje !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {item.erroresComunesEsperados && item.erroresComunesEsperados.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3 mb-2">
                    <p className="text-xs font-semibold text-orange-800 mb-1">Errores frecuentes:</p>
                    {item.erroresComunesEsperados.map((err, i) => <p key={i} className="text-xs text-orange-700">• {err}</p>)}
                  </div>
                )}
                {item.observacionesDocente && (
                  <p className="text-xs text-gray-500 italic">📌 {item.observacionesDocente}</p>
                )}
              </div>
            ))}
          </div>

          {pauta.observacionesGenerales && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600"><strong>Observaciones generales:</strong> {pauta.observacionesGenerales}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
