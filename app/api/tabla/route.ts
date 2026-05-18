import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeWithAI } from '@/lib/ai'
import { buildTablaEspecificacionesPrompt } from '@/lib/curriculum'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  asignatura: z.string().min(1),
  nivel: z.string().min(1),
  oas: z.string().min(1),
  cantidadItems: z.number().min(1).max(100),
  puntajeTotal: z.number().min(1).max(1000),
  tiposItems: z.array(z.string()).min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const params = schema.parse(body)

    const prompt = buildTablaEspecificacionesPrompt(params)
    const rawResponse = await analyzeWithAI(prompt)

    let tabla
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      tabla = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse)
    } catch {
      return NextResponse.json({ error: 'Error al procesar la respuesta de IA' }, { status: 500 })
    }

    const userId = (session.user as { id: string }).id
    await prisma.evaluacion.create({
      data: {
        titulo: `Tabla de Especificaciones — ${params.asignatura} ${params.nivel}`,
        asignatura: params.asignatura,
        nivel: params.nivel,
        tipo: 'tabla',
        contenido: params.oas.substring(0, 5000),
        analisis: JSON.stringify(tabla),
        userId,
      },
    })

    return NextResponse.json({ tabla })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Error al generar la tabla' }, { status: 500 })
  }
}
