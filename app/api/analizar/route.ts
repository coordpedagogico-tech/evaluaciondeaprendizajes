import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeWithAI, analyzeImageWithAI } from '@/lib/ai'
import { buildAnalysisPrompt } from '@/lib/curriculum'
import { prisma } from '@/lib/db'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const texto = formData.get('texto') as string
    const titulo = (formData.get('titulo') as string) || 'Sin título'
    const asignatura = (formData.get('asignatura') as string) || ''
    const nivel = (formData.get('nivel') as string) || ''
    const tipo = (formData.get('tipo') as string) || 'prueba'
    const file = formData.get('file') as File | null

    let contenidoTexto = texto || ''

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop()?.toLowerCase()

      if (ext === 'pdf') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse')
        const data = await pdfParse(buffer)
        contenidoTexto = data.text
      } else if (ext === 'docx' || ext === 'doc') {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        contenidoTexto = result.value
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
        const base64 = buffer.toString('base64')
        const mediaType = (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`) as
          'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
        contenidoTexto = await analyzeImageWithAI(
          base64,
          mediaType,
          'Transcribe COMPLETAMENTE y con fidelidad absoluta todo el texto visible en esta imagen de instrumento de evaluación. Incluye todos los ítems, alternativas, instrucciones, puntajes y cualquier otro contenido. Mantén la estructura y numeración original.'
        )
      }
    }

    if (!contenidoTexto.trim()) {
      return NextResponse.json({ error: 'No se pudo extraer texto del instrumento' }, { status: 400 })
    }

    const prompt = buildAnalysisPrompt(contenidoTexto, asignatura, nivel)
    const rawResponse = await analyzeWithAI(prompt)

    let analisis
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      analisis = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse)
    } catch {
      return NextResponse.json({ error: 'Error al procesar la respuesta de IA' }, { status: 500 })
    }

    const userId = (session.user as { id: string }).id
    const evaluacion = await prisma.evaluacion.create({
      data: {
        titulo,
        asignatura,
        nivel,
        tipo,
        contenido: contenidoTexto.substring(0, 5000),
        analisis: JSON.stringify(analisis),
        userId,
      },
    })

    return NextResponse.json({ id: evaluacion.id, analisis })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al analizar el instrumento' }, { status: 500 })
  }
}
