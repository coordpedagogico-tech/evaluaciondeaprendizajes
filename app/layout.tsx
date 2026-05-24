import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EvalUA — Evaluación de Aprendizajes | Chile',
  description:
    'Plataforma de evaluación educativa para docentes chilenos. Analiza, crea y mejora instrumentos de evaluación alineados al currículum nacional, Decreto 67/2018 y estándares MINEDUC.',
  keywords: 'evaluación educativa, Chile, MINEDUC, decreto 67, rubrica, pauta corrección, tabla especificaciones, docentes',
  authors: [{ name: 'EvalUA' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
