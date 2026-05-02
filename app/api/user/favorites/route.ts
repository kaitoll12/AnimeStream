import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''
const redis = redisUrl ? new Redis(redisUrl) : null

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!redis) throw new Error('Redis no inicializado')

    const key = `user:${session.user.email.toLowerCase()}:favorites`
    const data = await redis.get(key)
    return NextResponse.json(data ? JSON.parse(data) : [])
  } catch (error) {
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (!redis) throw new Error('Redis no inicializado')

    const { animeId } = await request.json()
    if (!animeId) return NextResponse.json({ error: 'Falta animeId' }, { status: 400 })

    const key = `user:${session.user.email.toLowerCase()}:favorites`
    const data = await redis.get(key)
    let favorites: string[] = data ? JSON.parse(data) : []

    if (favorites.includes(animeId)) {
      favorites = favorites.filter(id => id !== animeId)
    } else {
      favorites.push(animeId)
    }

    await redis.set(key, JSON.stringify(favorites))
    return NextResponse.json(favorites)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
