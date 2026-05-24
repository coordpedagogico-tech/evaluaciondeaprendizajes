import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildAnalysisPrompt } from '@/lib/curriculum'
import { prisma } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response('No autorizado', { status: 401 })
  }

  try {
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
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const base64 = buffer.toString('base64')
        const mediaType = (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`) as
          'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: 'Transcribe COMPLETAMENTE y con fidelidad ABSOLUTA todo el texto visible en esta imagen de instrumento de evaluación. Incluye todos los ítems, alternativas, instrucciones, puntajes y cualquier otro contenido. Mantén la estructura y numeración original.' }
            ]
          }]
        })
        const content = message.content[0]
        if (content.type === 'text') contenidoTexto = content.text
      }
    }

    if (!contenidoTexto.trim()) {
      return new Response(JSON.stringify({ error: 'No se pudo extraer texto del instrumento' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const prompt = buildAnalysisPrompt(contenidoTexto, asignatura, nivel)
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const encoder = new TextEncoder()
    let fullText = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 8000,
            system: `Eres EvalUA, un experto evaluador educativo del sistema escolar chileno con acceso profundo al currículum nacional.
Conoces en detalle:
- Bases Curriculares MINEDUC (1° a 6° Básico 2012, 7° a 2° Medio 2015-2016, 3° y 4° Medio 2019-2020)
- Programas de estudio de TODAS las asignaturas de 1° Básico a 4° Medio
- Decreto 67/2018 sobre evaluación, calificación y promoción escolar
- Orientaciones para la Evaluación de la Agencia de Calidad de la Educación (2022)
- Estándares de la Práctica Profesional Docente (Marco para la Buena Enseñanza)
- Principios de Evaluación Para el Aprendizaje (DocenteMás - Evaluación formativa)
- Taxonomía de Bloom revisada (Anderson & Krathwohl) aplicada al contexto chileno
- Técnicas de construcción de ítems: selección múltiple, desarrollo, producción textual
- Criterios de validez, confiabilidad y objetividad de instrumentos de evaluación
- SIMCE y pruebas estandarizadas del sistema chileno
SIEMPRE responde en español. SIEMPRE responde con JSON válido cuando se solicite.`,
            messages: [{ role: 'user', content: prompt }]
          })

          for await (const chunk of anthropicStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              fullText += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Parse and save to DB
          try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/)
            const analisis = JSON.parse(jsonMatch ? jsonMatch[0] : fullText)
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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, id: evaluacion.id, analisis })}\n\n`))
          } catch {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, raw: fullText })}\n\n`))
          }

          controller.close()
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Error al analizar' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
