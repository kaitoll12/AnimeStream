import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('GET /api/anime: Fetching animes from KV...')
    const animes = await kv.get('animes')
    const result = Array.isArray(animes) ? animes : []
    console.log(`GET /api/anime: Found ${result.length} animes`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching animes from KV:', error)
    return NextResponse.json([], { status: 500 }) // Return empty array on error to avoid crashing
  }
}

export async function POST(request: Request) {
  try {
    const animes = await request.json()
    console.log(`POST /api/anime: Saving ${animes.length} animes to KV...`)
    await kv.set('animes', animes)
    console.log('POST /api/anime: Save successful')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving animes to KV:', error)
    return NextResponse.json({ error: 'Failed to save animes' }, { status: 500 })
  }
}
