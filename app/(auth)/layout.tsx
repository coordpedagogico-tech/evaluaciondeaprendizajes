export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-700/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">EvalUA</h1>
          <p className="text-blue-200 mt-1.5 text-sm font-medium">Plataforma de Evaluación de Aprendizajes</p>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <span className="text-xs text-blue-300 bg-blue-800/50 px-2.5 py-1 rounded-full border border-blue-700/50">🏛️ MINEDUC</span>
            <span className="text-xs text-blue-300 bg-blue-800/50 px-2.5 py-1 rounded-full border border-blue-700/50">📜 Decreto 67</span>
            <span className="text-xs text-blue-300 bg-blue-800/50 px-2.5 py-1 rounded-full border border-blue-700/50">🤖 IA Claude</span>
          </div>
        </div>

        {children}

        {/* Footer */}
        <p className="text-center text-blue-400/70 text-xs mt-6">
          Sistema para docentes del currículum nacional chileno
        </p>
      </div>
    </div>
  )
}
