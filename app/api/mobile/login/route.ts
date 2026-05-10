import { NextResponse } from 'next/server'
import Redis from 'ioredis'
import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''
const redis = redisUrl ? new Redis(redisUrl) : null

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ error: 'Base de datos no conectada' }, { status: 500 })
    }

    const userKey = `user:${email.toLowerCase()}`
    const userDataStr = await redis.get(userKey)

    if (!userDataStr) {
      return NextResponse.json({ error: 'El usuario no existe' }, { status: 401 })
    }

    const user = JSON.parse(userDataStr)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https'
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

    // Generate a NextAuth JWT manually so mobile app can use it
    const token = await encode({
      token: {
        id: user.id || email,
        name: user.username,
        email: user.email,
        picture: user.image || null,
      },
      secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development_only_123",
      salt: cookieName,
    })

    return NextResponse.json({ session_token: token, user })
  } catch (error) {
    console.error("Mobile login error:", error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
