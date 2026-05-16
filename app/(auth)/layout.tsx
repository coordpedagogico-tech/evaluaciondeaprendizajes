export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-white">EvalUA</h1>
          <p className="text-blue-200 mt-1 text-sm">Plataforma de Evaluación de Aprendizajes</p>
          <p className="text-blue-300 text-xs mt-1">Sistema Educativo Chileno</p>
        </div>
        {children}
      </div>
    </div>
  )
}
