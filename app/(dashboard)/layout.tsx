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
  { href: '/historial', icon: '🗂️', label: 'Mi Historial' },
]

function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = session?.user as { name?: string; email?: string; role?: string; institution?: string } | undefined

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-blue-900 text-white px-4 py-3 flex items-center justify-between shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-base">📋</span>
          </div>
          <div>
            <span className="font-bold text-lg">EvalUA</span>
            <span className="text-blue-300 text-xs ml-1.5">Chile</span>
          </div>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-blue-800 transition-colors">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm print:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-950 text-white z-40 flex flex-col transition-transform duration-300 print:hidden
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight tracking-tight">EvalUA</h1>
              <p className="text-blue-300 text-xs">Evaluación Chile</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />}
              </Link>
            )
          })}

          {/* Separador admin */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Administración</p>
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  pathname === '/admin'
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">⚙️</span>
                <span>Panel de Admin</span>
              </Link>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-blue-800">
          <div className="mb-2 px-3 py-2 bg-white/10 rounded-xl">
            <p className="text-white font-medium text-sm truncate">{user?.name}</p>
            <p className="text-blue-300 text-xs truncate">{user?.email}</p>
            {user?.institution && (
              <p className="text-blue-400 text-xs truncate mt-0.5">🏫 {user.institution}</p>
            )}
            <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
              user?.role === 'admin'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
            }`}>
              {user?.role === 'admin' ? '👑 Administrador' : '👩‍🏫 Docente'}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-sm"
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
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
          <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}
