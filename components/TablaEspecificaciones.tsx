'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TablaEspecificacionesProps {
  tabla: any
}

const nivelColors: Record<string, string> = {
  Conocimiento: 'bg-purple-100 text-purple-800',
  Comprensión: 'bg-blue-100 text-blue-800',
  Aplicación: 'bg-cyan-100 text-cyan-800',
  Análisis: 'bg-green-100 text-green-800',
  Síntesis: 'bg-yellow-100 text-yellow-800',
  Evaluación: 'bg-orange-100 text-orange-800'
}

export function TablaEspecificaciones({ tabla }: TablaEspecificacionesProps) {
  if (!tabla) return null

  return (
    <div className="space-y-6">
      {/* Header info */}
      <Card>
        <CardHeader>
          <CardTitle>{tabla.titulo || 'Tabla de Especificaciones'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{tabla.cantidadItems}</div>
              <div className="text-xs text-gray-600 mt-1">Total Ítems</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{tabla.puntajeTotal}</div>
              <div className="text-xs text-gray-600 mt-1">Puntaje Total</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-semibold text-purple-700">{tabla.asignatura}</div>
              <div className="text-xs text-gray-600 mt-1">Asignatura</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm font-semibold text-orange-700">{tabla.nivel}</div>
              <div className="text-xs text-gray-600 mt-1">Nivel</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución cognitiva */}
      {tabla.distribucionCognitiva && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Niveles Cognitivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(tabla.distribucionCognitiva).map(([nivel, data]: [string, any]) => {
                const label =
                  nivel === 'conocimiento'
                    ? 'Conocimiento'
                    : nivel === 'comprension'
                    ? 'Comprensión'
                    : nivel === 'aplicacion'
                    ? 'Aplicación'
                    : nivel === 'analisis'
                    ? 'Análisis'
                    : nivel === 'sintesis'
                    ? 'Síntesis'
                    : 'Evaluación'
                return (
                  <div key={nivel} className="text-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xl font-bold text-gray-800">{data.items}</div>
                    <div className="text-xs text-gray-500">{data.porcentaje}%</div>
                    <div className="text-xs font-medium text-gray-700 mt-1">{label}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla principal */}
      {tabla.filas && tabla.filas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Especificaciones por Objetivo de Aprendizaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="text-left px-3 py-3 font-medium rounded-tl-lg">Objetivo de Aprendizaje</th>
                    <th className="text-left px-3 py-3 font-medium">Indicadores</th>
                    <th className="text-center px-3 py-3 font-medium">Nivel Cognitivo</th>
                    <th className="text-center px-3 py-3 font-medium">Tipo de Ítem</th>
                    <th className="text-center px-3 py-3 font-medium">N° Ítems</th>
                    <th className="text-center px-3 py-3 font-medium">Puntaje</th>
                    <th className="text-center px-3 py-3 font-medium rounded-tr-lg">%</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.filas.map((fila: any, i: number) => (
                    <tr key={i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-3 text-gray-900 font-medium max-w-xs">
                        <div className="text-xs">{fila.oa}</div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 max-w-xs">
                        <ul className="list-disc list-inside space-y-0.5">
                          {(fila.indicadoresEvaluacion || []).map((ind: string, j: number) => (
                            <li key={j} className="text-xs">
                              {ind}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            nivelColors[fila.nivelCognitivo] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {fila.nivelCognitivo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600 text-xs">{fila.tipoItem}</td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-900">{fila.cantidadItems}</td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-900">{fila.puntajeItems}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{fila.porcentaje}%</td>
                    </tr>
                  ))}
                  {/* Totales */}
                  {tabla.totales && (
                    <tr className="bg-blue-50 font-bold border-t-2 border-blue-200">
                      <td className="px-3 py-3 text-blue-900 rounded-bl-lg" colSpan={4}>
                        TOTALES
                      </td>
                      <td className="px-3 py-3 text-center text-blue-900">{tabla.totales.items}</td>
                      <td className="px-3 py-3 text-center text-blue-900">{tabla.totales.puntaje}</td>
                      <td className="px-3 py-3 text-center text-blue-900 rounded-br-lg">{tabla.totales.porcentaje}%</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas */}
      {tabla.notas && tabla.notas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notas Metodológicas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {tabla.notas.map((nota: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                  {nota}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
