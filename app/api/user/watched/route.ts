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

    const key = `user:${session.user.email.toLowerCase()}:watched`
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

    const { episodeId } = await request.json()
    if (!episodeId) return NextResponse.json({ error: 'Falta episodeId' }, { status: 400 })

    const key = `user:${session.user.email.toLowerCase()}:watched`
    const data = await redis.get(key)
    let watched: string[] = data ? JSON.parse(data) : []

    if (watched.includes(episodeId)) {
      watched = watched.filter(id => id !== episodeId)
    } else {
      watched.push(episodeId)
    }

    await redis.set(key, JSON.stringify(watched))
    return NextResponse.json(watched)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
