import Redis from 'ioredis'
import { NextResponse } from 'next/server'

// Use the REDIS_URL from your .env or Vercel Environment Variables
const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''

// Initialize Redis client only if URL is available
let redis: Redis | null = null
try {
  if (redisUrl) {
    redis = new Redis(redisUrl)
    console.log('Redis client initialized successfully')
  } else {
    console.error('MISSING REDIS_URL: Please check your Environment Variables')
  }
} catch (error) {
  console.error('Failed to initialize Redis:', error)
}

export async function GET() {
  try {
    if (!redis) throw new Error('Redis not initialized')
    
    console.log('GET /api/anime: Fetching from Redis Labs...')
    const data = await redis.get('animes_db')
    const result = data ? JSON.parse(data) : []
    
    console.log(`GET /api/anime: Found ${result.length} animes`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching animes:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!redis) throw new Error('Redis not initialized')
    
    const animes = await request.json()
    console.log(`POST /api/anime: Saving ${animes.length} animes to Redis Labs...`)
    
    await redis.set('animes_db', JSON.stringify(animes))
    
    console.log('POST /api/anime: Save successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving animes:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
