'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  role: string
  institution: string | null
  createdAt: string
}

type Stats = {
  totalUsers: number
  totalEvaluaciones: number
  porTipo: Record<string, number>
  recentEvaluaciones: {
    id: string
    titulo: string
    tipo: string
    asignatura: string
    nivel: string
    createdAt: string
    user: { name: string; email: string }
  }[]
}

const tipoLabels: Record<string, string> = {
  prueba: 'Prueba', guia: 'Guía', pauta: 'Pauta',
  rubrica: 'Rúbrica', lista_cotejo: 'Lista de Cotejo',
  autoevaluacion: 'Autoevaluación', coevaluacion: 'Coevaluación',
}

const tipoIcons: Record<string, string> = {
  prueba: '📝', guia: '📖', pauta: '📋',
  rubrica: '🎯', lista_cotejo: '✅',
  autoevaluacion: '🪞', coevaluacion: '👥',
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const currentUser = session?.user as { id?: string; role?: string } | undefined

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    Promise.all([
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/stats').then((r) => r.json()),
    ]).then(([usersData, statsData]) => {
      if (Array.isArray(usersData)) setUsers(usersData)
      if (statsData.totalUsers !== undefined) setStats(statsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [currentUser, router])

  async function handleRoleChange(userId: string, newRole: string) {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (res.ok) {
        const updated = await res.json()
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)))
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('¿Eliminar este usuario y todas sus evaluaciones?')) return
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setStats((prev) => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev)
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Panel de Administración</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestión de usuarios y estadísticas del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'overview', label: '📊 Vista General' },
          { key: 'users', label: `👥 Usuarios (${users.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vista General */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Usuarios', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 border-blue-100' },
              { label: 'Evaluaciones', value: stats.totalEvaluaciones, icon: '📁', color: 'bg-emerald-50 border-emerald-100' },
              { label: 'Pruebas', value: stats.porTipo['prueba'] || 0, icon: '📝', color: 'bg-purple-50 border-purple-100' },
              { label: 'Rúbricas', value: (stats.porTipo['rubrica'] || 0) + (stats.porTipo['lista_cotejo'] || 0), icon: '🎯', color: 'bg-orange-50 border-orange-100' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Distribución por tipo */}
          {Object.keys(stats.porTipo).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Evaluaciones por tipo</h3>
              <div className="space-y-2">
                {Object.entries(stats.porTipo)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tipo, count]) => {
                    const pct = stats.totalEvaluaciones > 0 ? Math.round((count / stats.totalEvaluaciones) * 100) : 0
                    return (
                      <div key={tipo} className="flex items-center gap-3">
                        <span className="text-xl w-6">{tipoIcons[tipo] || '📄'}</span>
                        <span className="text-sm text-gray-700 w-36">{tipoLabels[tipo] || tipo}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{count} ({pct}%)</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Actividad reciente */}
          {stats.recentEvaluaciones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Actividad reciente</h3>
              <div className="space-y-2">
                {stats.recentEvaluaciones.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                    <span className="text-xl">{tipoIcons[ev.tipo] || '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.titulo || 'Sin título'}</p>
                      <p className="text-xs text-gray-400">
                        {ev.user.name} · {ev.asignatura} {ev.nivel && `· ${ev.nivel}`}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(ev.createdAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usuarios */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Establecimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Registro</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs hidden md:table-cell">
                      {user.institution || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? '👑 Admin' : '👩‍🏫 Docente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {user.id !== currentUser?.id && (
                          <>
                            <button
                              onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'teacher' : 'admin')}
                              disabled={actionLoading === user.id}
                              className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
                              title={user.role === 'admin' ? 'Cambiar a Docente' : 'Cambiar a Admin'}
                            >
                              {actionLoading === user.id ? '...' : user.role === 'admin' ? '↓ Docente' : '↑ Admin'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-xs px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-gray-400 italic">Tú</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
