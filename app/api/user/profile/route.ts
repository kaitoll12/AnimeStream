import { NextResponse } from 'next/server'
import Redis from 'ioredis'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import bcrypt from 'bcryptjs'

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''
const redis = redisUrl ? new Redis(redisUrl) : null

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!redis) {
      return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 500 })
    }

    const { nickname, avatarUrl, currentPassword, newPassword } = await request.json()

    const userKey = `user:${session.user.email.toLowerCase()}`
    const userDataStr = await redis.get(userKey)

    if (!userDataStr) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const user = JSON.parse(userDataStr)

    // Handle password change if requested
    if (newPassword) {
      if (!user.passwordHash) {
        return NextResponse.json({ error: 'Los usuarios de Google no pueden cambiar contraseña de esta forma.' }, { status: 400 })
      }
      
      if (!currentPassword) {
        return NextResponse.json({ error: 'Debes proporcionar la contraseña actual para cambiarla.' }, { status: 400 })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'La contraseña actual es incorrecta.' }, { status: 400 })
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    // Update other fields
    if (nickname) {
      user.username = nickname
    }
    
    if (avatarUrl !== undefined) {
      user.image = avatarUrl
    }

    await redis.set(userKey, JSON.stringify(user))

    return NextResponse.json({ success: true, user: { username: user.username, image: user.image } })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
