'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalysisResultProps {
  analysis: any
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function CalificacionBadge({ cal }: { cal: string }) {
  const variant =
    cal === 'Excelente' || cal === 'Muy Bueno'
      ? 'success'
      : cal === 'Bueno'
      ? 'default'
      : cal === 'Regular'
      ? 'warning'
      : 'destructive'
  return <Badge variant={variant as any}>{cal}</Badge>
}

function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const variant = prioridad === 'Alta' ? 'destructive' : prioridad === 'Media' ? 'warning' : 'secondary'
  return <Badge variant={variant as any}>{prioridad}</Badge>
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  if (!analysis) return null

  const nivelCognitivoColors: Record<string, string> = {
    conocimiento: 'bg-purple-100 text-purple-800',
    comprension: 'bg-blue-100 text-blue-800',
    aplicacion: 'bg-cyan-100 text-cyan-800',
    analisis: 'bg-green-100 text-green-800',
    sintesis: 'bg-yellow-100 text-yellow-800',
    evaluacion: 'bg-orange-100 text-orange-800'
  }

  const nivelCognitivoLabels: Record<string, string> = {
    conocimiento: 'Conocimiento',
    comprension: 'Comprensión',
    aplicacion: 'Aplicación',
    analisis: 'Análisis',
    sintesis: 'Síntesis',
    evaluacion: 'Evaluación'
  }

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumen del Análisis</CardTitle>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">{analysis.puntajeGeneral}</div>
                <div className="text-xs text-gray-500">/ 100</div>
              </div>
              <CalificacionBadge cal={analysis.calificacionGeneral} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysis.resumenEjecutivo}</p>
        </CardContent>
      </Card>

      {/* Dimensiones */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Dimensión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.dimensiones && (
            <>
              <ScoreBar score={analysis.dimensiones.validezContenido?.puntaje} label="Validez de Contenido" />
              <ScoreBar score={analysis.dimensiones.coherenciaCurricular?.puntaje} label="Coherencia Curricular" />
              <ScoreBar score={analysis.dimensiones.calidadItems?.puntaje} label="Calidad de Ítems" />
              <ScoreBar score={analysis.dimensiones.distribucionCognitiva?.puntaje} label="Distribución Cognitiva" />
              <ScoreBar score={analysis.dimensiones.aspectosTecnicos?.puntaje} label="Aspectos Técnicos" />
              <ScoreBar score={analysis.dimensiones.cumplimientoDecreto67?.puntaje} label="Cumplimiento Decreto 67" />
            </>
          )}
        </CardContent>
      </Card>

      {/* Distribución cognitiva */}
      {analysis.dimensiones?.distribucionCognitiva?.niveles && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Niveles Cognitivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(analysis.dimensiones.distribucionCognitiva.niveles).map(([nivel, count]) => (
                <div
                  key={nivel}
                  className={`rounded-lg px-3 py-2.5 text-center ${nivelCognitivoColors[nivel] || 'bg-gray-100 text-gray-800'}`}
                >
                  <div className="text-2xl font-bold">{count as number}</div>
                  <div className="text-xs font-medium mt-0.5">{nivelCognitivoLabels[nivel] || nivel}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-600">{analysis.dimensiones.distribucionCognitiva.descripcion}</p>
          </CardContent>
        </Card>
      )}

      {/* Fortalezas y debilidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Fortalezas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(analysis.fortalezas || []).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Áreas de Mejora</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(analysis.debilidades || []).map((d: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">!</span>
                  {d}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por ítems */}
      {analysis.itemsDetalle && analysis.itemsDetalle.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Ítems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Ítem</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Tipo</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Nivel Cognitivo</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Calidad</th>
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.itemsDetalle.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900">{item.numero}</td>
                      <td className="py-2 px-3 text-gray-600">{item.tipo}</td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.nivelCognitivo}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <CalificacionBadge cal={item.calidad} />
                      </td>
                      <td className="py-2 px-3 text-gray-600 max-w-xs">{item.observacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones */}
      {analysis.recomendaciones && analysis.recomendaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.recomendaciones.map((rec: any, i: number) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PrioridadBadge prioridad={rec.prioridad} />
                    <span className="text-xs text-gray-500 font-medium">{rec.categoria}</span>
                  </div>
                  <p className="text-sm text-gray-700">{rec.descripcion}</p>
                  {rec.ejemploMejora && (
                    <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1">
                      Ejemplo: {rec.ejemploMejora}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cumplimiento normativo */}
      {analysis.cumplimientoNormativo && (
        <Card>
          <CardHeader>
            <CardTitle>Cumplimiento Normativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analysis.cumplimientoNormativo).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <span className={`text-lg ${val.cumple ? 'text-green-500' : 'text-red-500'}`}>
                    {val.cumple ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {key === 'decreto67'
                        ? 'Decreto 67/2018'
                        : key === 'basesCurriculares'
                        ? 'Bases Curriculares MINEDUC'
                        : 'Orientaciones de Evaluación'}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{val.observaciones}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
