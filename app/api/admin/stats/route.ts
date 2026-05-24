import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as { role: string }).role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const [totalUsers, totalEvaluaciones, evaluacionesPorTipo, recentEvaluaciones] = await Promise.all([
    prisma.user.count(),
    prisma.evaluacion.count(),
    prisma.evaluacion.groupBy({ by: ['tipo'], _count: { tipo: true } }),
    prisma.evaluacion.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
      select: {
        id: true,
        titulo: true,
        tipo: true,
        asignatura: true,
        nivel: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ])

  const porTipo: Record<string, number> = {}
  for (const entry of evaluacionesPorTipo) {
    porTipo[entry.tipo] = entry._count.tipo
  }

  return NextResponse.json({
    totalUsers,
    totalEvaluaciones,
    porTipo,
    recentEvaluaciones,
  })
}
