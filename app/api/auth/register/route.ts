import { NextResponse } from 'next/server'
import Redis from 'ioredis'
import bcrypt from 'bcryptjs'

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''
const redis = redisUrl ? new Redis(redisUrl) : null

export async function POST(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Base de datos no disponible' }, { status: 500 })
    }

    const { email, username, password } = await request.json()

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const userKey = `user:${email.toLowerCase()}`
    const existingUser = await redis.get(userKey)

    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      username,
      passwordHash,
      createdAt: new Date().toISOString()
    }

    await redis.set(userKey, JSON.stringify(newUser))

    return NextResponse.json({ success: true, message: 'Usuario registrado exitosamente' }, { status: 201 })
  } catch (error: any) {
    console.error('Error in /api/auth/register:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
