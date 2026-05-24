import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get('tipo') || undefined
    const asignatura = searchParams.get('asignatura') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: { userId: string; tipo?: string; asignatura?: string } = { userId }
    if (tipo) where.tipo = tipo
    if (asignatura) where.asignatura = asignatura

    const [evaluaciones, total] = await Promise.all([
      prisma.evaluacion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          titulo: true,
          asignatura: true,
          nivel: true,
          tipo: true,
          createdAt: true,
          analisis: true,
        },
      }),
      prisma.evaluacion.count({ where }),
    ])

    return NextResponse.json({
      evaluaciones: evaluaciones.map((e) => ({
        ...e,
        puntajeGeneral: e.analisis ? (() => {
          try { return JSON.parse(e.analisis).puntajeGeneral ?? null } catch { return null }
        })() : null,
        analisis: undefined,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 })
  }
}
