import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeWithAI } from '@/lib/ai'
import { buildCrearEvaluacionPrompt } from '@/lib/curriculum'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  titulo: z.string().min(1),
  asignatura: z.string().min(1),
  nivel: z.string().min(1),
  oas: z.string().min(1),
  tipoEvaluacion: z.string().min(1),
  cantidadItems: z.number().min(1).max(100),
  tiempoMinutos: z.number().min(10).max(300),
  instrucciones: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const params = schema.parse(body)

    const prompt = buildCrearEvaluacionPrompt(params)
    const rawResponse = await analyzeWithAI(prompt)

    let evaluacionGenerada
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      evaluacionGenerada = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse)
    } catch {
      return NextResponse.json({ error: 'Error al procesar la respuesta de IA' }, { status: 500 })
    }

    const userId = (session.user as { id: string }).id
    const evaluacion = await prisma.evaluacion.create({
      data: {
        titulo: params.titulo,
        asignatura: params.asignatura,
        nivel: params.nivel,
        tipo: params.tipoEvaluacion,
        contenido: JSON.stringify(evaluacionGenerada),
        userId,
      },
    })

    return NextResponse.json({ id: evaluacion.id, evaluacion: evaluacionGenerada })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: 'Error al crear la evaluación' }, { status: 500 })
  }
}
