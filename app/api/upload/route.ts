import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()?.toLowerCase()

    let content = ''

    if (ext === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(buffer)
      content = data.text
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      content = result.value
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const base64 = buffer.toString('base64')
      const mediaType = (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`) as
        | 'image/jpeg'
        | 'image/png'
        | 'image/gif'
        | 'image/webp'
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              {
                type: 'text',
                text: 'Transcribe el texto de este instrumento de evaluación de forma completa y fiel. Incluye todos los ítems, alternativas, instrucciones y cualquier otro contenido visible.'
              }
            ]
          }
        ]
      })
      const c = message.content[0]
      if (c.type === 'text') content = c.text
    } else {
      return NextResponse.json({ error: 'Formato de archivo no soportado. Use PDF, DOCX, JPG o PNG.' }, { status: 400 })
    }

    if (!content.trim()) {
      return NextResponse.json({ error: 'No se pudo extraer texto del archivo' }, { status: 400 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al procesar el archivo' }, { status: 500 })
  }
}
