import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EvalUA - Evaluación de Aprendizajes',
  description: 'Plataforma de evaluación educativa para docentes chilenos según estándares MINEDUC'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
