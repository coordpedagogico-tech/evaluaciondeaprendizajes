'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
  institution: string | null
  createdAt: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const currentUser = session?.user as { id?: string; role?: string } | undefined

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [currentUser])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    } else {
      setError('Error al cargar usuarios')
    }
    setLoading(false)
  }

  async function changeRole(userId: string, newRole: string) {
    setActionLoading(userId)
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole })
    })
    if (res.ok) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    }
    setActionLoading(null)
  }

  async function deleteUser(userId: string) {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return
    setActionLoading(userId)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== userId))
    } else {
      const data = await res.json()
      alert(data.error || 'Error al eliminar usuario')
    }
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Gestión de usuarios del sistema EvalUA</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500">Total usuarios</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-700">{users.filter((u) => u.role === 'teacher').length}</div>
          <div className="text-sm text-gray-500">Docentes</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{users.filter((u) => u.role === 'admin').length}</div>
          <div className="text-sm text-gray-500">Administradores</div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Usuarios registrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Establecimiento</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Rol</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Registrado</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                      {user.id === currentUser?.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Tú</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.institution || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Docente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {user.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => changeRole(user.id, user.role === 'admin' ? 'teacher' : 'admin')}
                            disabled={actionLoading === user.id}
                            className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-gray-600"
                          >
                            {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-xs px-2.5 py-1 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">Decreto 67/2018 - Referencia normativa</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Los docentes no pueden recibir calificaciones en 1° a 6° básico durante el primer semestre.</li>
          <li>• La evaluación formativa debe ser el eje central del proceso de enseñanza-aprendizaje.</li>
          <li>• Las instituciones deben contar con un reglamento de evaluación aprobado por el MINEDUC.</li>
        </ul>
      </div>
    </div>
  )
}
