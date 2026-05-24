import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as { id: string }).id
    const isAdmin = (session.user as { role: string }).role === 'admin'

    const evaluacion = await prisma.evaluacion.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
    })

    if (!evaluacion) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    let analisisParsed = null
    if (evaluacion.analisis) {
      try { analisisParsed = JSON.parse(evaluacion.analisis) } catch { /* ignore */ }
    }

    let contenidoParsed: unknown = evaluacion.contenido
    try {
      const parsed = JSON.parse(evaluacion.contenido)
      if (typeof parsed === 'object') contenidoParsed = parsed
    } catch { /* keep as string */ }

    return NextResponse.json({
      ...evaluacion,
      analisis: analisisParsed,
      contenido: contenidoParsed,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener evaluación' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as { id: string }).id
    const isAdmin = (session.user as { role: string }).role === 'admin'

    const evaluacion = await prisma.evaluacion.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
    })

    if (!evaluacion) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    await prisma.evaluacion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al eliminar evaluación' }, { status: 500 })
  }
}
