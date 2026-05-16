import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeWithAI } from '@/lib/ai'
import { buildPautaPrompt } from '@/lib/curriculum'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { instrumento, titulo, asignatura, nivel } = body

    if (!instrumento) {
      return NextResponse.json({ error: 'Se requiere el instrumento' }, { status: 400 })
    }

    const prompt = buildPautaPrompt(instrumento)
    const rawResponse = await analyzeWithAI(prompt)

    let pauta
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      pauta = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse)
    } catch {
      return NextResponse.json({ error: 'Error al procesar la respuesta de IA' }, { status: 500 })
    }

    const userId = (session.user as { id: string }).id
    await prisma.evaluacion.create({
      data: {
        titulo: titulo || 'Pauta de corrección',
        asignatura: asignatura || 'General',
        nivel: nivel || 'General',
        tipo: 'pauta',
        contenido: instrumento.substring(0, 5000),
        analisis: JSON.stringify(pauta),
        userId,
      },
    })

    return NextResponse.json({ pauta })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al generar la pauta' }, { status: 500 })
  }
}
