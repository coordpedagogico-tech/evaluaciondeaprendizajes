'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

const modules = [
  {
    href: '/analizar',
    icon: '🔍',
    title: 'Analizar Instrumento',
    description: 'Sube o pega tu prueba, guía o rúbrica y obtén un análisis técnico completo con sugerencias de mejora según el currículum chileno.',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-100',
  },
  {
    href: '/crear',
    icon: '✏️',
    title: 'Crear Evaluación',
    description: 'Genera evaluaciones desde cero con ítems, pauta de corrección y tabla de especificaciones alineadas a los OA del nivel seleccionado.',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconBg: 'bg-green-100',
  },
  {
    href: '/pauta',
    icon: '📋',
    title: 'Generar Pauta',
    description: 'Crea o mejora pautas de corrección con criterios detallados, escala de calificaciones y orientaciones para el docente.',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-100',
  },
  {
    href: '/tabla',
    icon: '📊',
    title: 'Tabla de Especificaciones',
    description: 'Genera tablas de especificaciones técnicas con distribución por OA, niveles cognitivos de Bloom y tipos de ítems.',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    iconBg: 'bg-orange-100',
  },
]

const recursos = [
  { label: 'Curriculum en Línea', url: 'https://www.curriculumnacional.cl', icon: '📚' },
  { label: 'MINEDUC', url: 'https://www.mineduc.cl', icon: '🏛️' },
  { label: 'Agencia de Calidad', url: 'https://www.agenciaeducacion.cl', icon: '✅' },
  { label: 'CPEIP', url: 'https://www.cpeip.cl', icon: '🎓' },
  { label: 'DocenteMás', url: 'https://www.docentemas.cl', icon: '👩‍🏫' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as { name?: string; role?: string } | undefined

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido/a, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Plataforma de evaluación alineada al currículum nacional chileno y Decreto 67/2018
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Asignaturas', value: '25+', icon: '📚', desc: 'básica y media' },
          { label: 'Niveles', value: '12', icon: '🎯', desc: '1° básico a 4° medio' },
          { label: 'Tipos de análisis', value: '6', icon: '🔬', desc: 'dimensiones técnicas' },
          { label: 'Decreto', value: '67', icon: '📜', desc: 'cumplimiento normativo' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Main modules */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">¿Qué deseas hacer?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className={`block border-2 rounded-xl p-5 transition-all cursor-pointer ${mod.color}`}
          >
            <div className={`w-12 h-12 ${mod.iconBg} rounded-xl flex items-center justify-center text-2xl mb-3`}>
              {mod.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{mod.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>

      {/* Fuentes y recursos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Fuentes del sistema educativo chileno</h2>
        <div className="flex flex-wrap gap-2">
          {recursos.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-600 hover:text-blue-700 transition-colors"
            >
              <span>{r.icon}</span>
              {r.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
