'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SessionProvider from '@/components/SessionProvider'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Inicio' },
  { href: '/analizar', icon: '🔍', label: 'Analizar Instrumento' },
  { href: '/crear', icon: '✏️', label: 'Crear Evaluación' },
  { href: '/pauta', icon: '📋', label: 'Generar Pauta' },
  { href: '/tabla', icon: '📊', label: 'Tabla de Especificaciones' },
]

function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = session?.user as { name?: string; email?: string; role?: string; institution?: string } | undefined

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-blue-800 text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <span className="font-bold text-lg">EvalUA</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-blue-700">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-40 flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">EvalUA</h1>
              <p className="text-blue-300 text-xs">Evaluación Chile</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  active ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                pathname === '/admin' ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="text-lg">⚙️</span>
              Administración
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="mb-3 px-2">
            <p className="text-white font-medium text-sm truncate">{user?.name}</p>
            <p className="text-blue-300 text-xs truncate">{user?.email}</p>
            {user?.institution && <p className="text-blue-400 text-xs truncate">{user.institution}</p>}
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-yellow-500 text-yellow-900' : 'bg-blue-600 text-blue-100'}`}>
              {user?.role === 'admin' ? 'Administrador' : 'Docente'}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-xl transition-colors text-sm"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 min-w-0">
          <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}
