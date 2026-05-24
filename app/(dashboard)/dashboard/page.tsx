'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const modules = [
  {
    href: '/analizar',
    icon: '🔍',
    title: 'Analizar Instrumento',
    description: 'Sube tu prueba, guía, rúbrica o lista de cotejo y recibe un análisis técnico completo con 6 dimensiones de calidad según el currículum chileno y Decreto 67/2018.',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100',
    iconBg: 'bg-blue-100 text-blue-700',
    badge: 'PDF · Word · Imagen · Texto',
  },
  {
    href: '/crear',
    icon: '✏️',
    title: 'Crear Evaluación',
    description: 'Genera evaluaciones desde cero con ítems, pauta de corrección y tabla de especificaciones alineadas a los OA del nivel y asignatura seleccionados.',
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badge: 'Pruebas · Guías · Rúbricas',
  },
  {
    href: '/pauta',
    icon: '📋',
    title: 'Generar Pauta',
    description: 'Crea pautas de corrección con criterios detallados, escala de calificaciones (Decreto 67), puntaje parcial y orientaciones para el docente corrector.',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100',
    iconBg: 'bg-purple-100 text-purple-700',
    badge: 'Con escala de calificación',
  },
  {
    href: '/tabla',
    icon: '📊',
    title: 'Tabla de Especificaciones',
    description: 'Genera tablas técnicas con distribución por OA, niveles cognitivos de Bloom, tipos de ítems y porcentajes de evaluación.',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100',
    iconBg: 'bg-orange-100 text-orange-700',
    badge: 'Taxonomía de Bloom',
  },
]

const fuentes = [
  { label: 'Currículum Nacional', url: 'https://www.curriculumnacional.cl', icon: '📚', desc: 'Bases y programas' },
  { label: 'MINEDUC', url: 'https://www.mineduc.cl', icon: '🏛️', desc: 'Ministerio de Educación' },
  { label: 'Agencia de Calidad', url: 'https://www.agenciaeducacion.cl', icon: '✅', desc: 'Evaluación nacional' },
  { label: 'CPEIP', url: 'https://www.cpeip.cl', icon: '🎓', desc: 'Formación docente' },
  { label: 'DocenteMás', url: 'https://www.docentemas.cl', icon: '👩‍🏫', desc: 'Evaluación docente' },
  { label: 'Decreto 67/2018', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1118448', icon: '📜', desc: 'Norma de evaluación' },
]

type HistorialStats = {
  total: number
  porTipo: Record<string, number>
  recientes: { id: string; titulo: string; tipo: string; asignatura: string; createdAt: string; puntajeGeneral: number | null }[]
}

const tipoLabels: Record<string, string> = {
  prueba: 'Prueba', guia: 'Guía', pauta: 'Pauta',
  rubrica: 'Rúbrica', lista_cotejo: 'Lista de cotejo',
  autoevaluacion: 'Autoevaluación', coevaluacion: 'Coevaluación'
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as { name?: string; role?: string } | undefined
  const [stats, setStats] = useState<HistorialStats | null>(null)

  useEffect(() => {
    fetch('/api/historial?limit=3')
      .then((r) => r.json())
      .then((data) => {
        const porTipo: Record<string, number> = {}
        data.evaluaciones?.forEach((e: { tipo: string }) => {
          porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1
        })
        setStats({ total: data.total || 0, porTipo, recientes: data.evaluaciones || [] })
      })
      .catch(() => {})
  }, [])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div>
      {/* Bienvenida */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {saludo}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Plataforma de evaluación educativa — Currículum Nacional Chileno · Decreto 67/2018
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Mis evaluaciones', value: stats ? String(stats.total) : '—', icon: '📁', desc: 'guardadas en total', color: 'bg-blue-50 border-blue-100' },
          { label: 'Asignaturas', value: '25+', icon: '📚', desc: 'básica y media', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Niveles', value: '12', icon: '🎯', desc: '1° Básico a 4° Medio', color: 'bg-purple-50 border-purple-100' },
          { label: 'Decreto', value: '67', icon: '📜', desc: 'cumplimiento 2018', color: 'bg-orange-50 border-orange-100' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 shadow-sm ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs font-semibold text-gray-700">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Módulos */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">¿Qué deseas hacer?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`block border-2 rounded-xl p-5 transition-all cursor-pointer ${mod.color}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${mod.iconBg}`}>
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{mod.title}</h3>
                  <span className="text-xs text-gray-400 bg-white/80 px-2 py-0.5 rounded-full border border-gray-100 whitespace-nowrap">
                    {mod.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">{mod.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recientes */}
      {stats && stats.recientes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Evaluaciones recientes</h2>
            <Link href="/historial" className="text-xs text-blue-600 hover:underline">Ver todo →</Link>
          </div>
          <div className="space-y-2">
            {stats.recientes.map((ev) => (
              <Link
                key={ev.id}
                href={`/historial/${ev.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                  {ev.tipo === 'prueba' ? '📝' : ev.tipo === 'pauta' ? '📋' : ev.tipo === 'rubrica' ? '🎯' : '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ev.titulo || 'Sin título'}</p>
                  <p className="text-xs text-gray-400">
                    {tipoLabels[ev.tipo] || ev.tipo} · {ev.asignatura} ·{' '}
                    {new Date(ev.createdAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                {ev.puntajeGeneral !== null && (
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    ev.puntajeGeneral >= 80 ? 'bg-green-100 text-green-700' :
                    ev.puntajeGeneral >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {ev.puntajeGeneral}/100
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fuentes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          🔗 Fuentes del sistema educativo chileno
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fuentes.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
            >
              <span className="text-lg flex-shrink-0">{r.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{r.label}</p>
                <p className="text-xs text-gray-400 truncate">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
