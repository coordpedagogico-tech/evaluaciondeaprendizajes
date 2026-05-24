import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando base de datos...')

  // Crear usuario administrador
  const adminEmail = 'coordpedagogico@salesianoconcepcion.cl'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existing) {
    const hashedPassword = await bcrypt.hash('EvalUA2024!', 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Coordinador Pedagógico',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        institution: 'Colegio Salesiano Concepción',
      },
    })
    console.log('✅ Administrador creado:', admin.email)
  } else {
    console.log('ℹ️  Administrador ya existe:', existing.email)
  }

  console.log('✅ Base de datos lista')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
