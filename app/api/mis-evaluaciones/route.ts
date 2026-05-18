import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  const evaluaciones = await prisma.evaluacion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titulo: true,
      asignatura: true,
      nivel: true,
      tipo: true,
      contenido: true,
      analisis: true,
      createdAt: true,
    },
  })

  return NextResponse.json(evaluaciones)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await req.json()
  const userId = (session.user as { id: string }).id

  const evaluacion = await prisma.evaluacion.findUnique({ where: { id } })
  if (!evaluacion || evaluacion.userId !== userId) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  await prisma.evaluacion.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
