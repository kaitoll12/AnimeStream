import { createClient } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Create a custom KV client that handles both standard and prefixed variables
const kv = createClient({
  url: process.env.STORAGE_REST_API_URL || process.env.KV_REST_API_URL || '',
  token: process.env.STORAGE_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || '',
})

export async function GET() {
  try {
    console.log('GET /api/anime: Fetching animes from KV...')
    
    if (!process.env.STORAGE_REST_API_URL && !process.env.KV_REST_API_URL) {
      console.error('MISSING KV ENVS: Please check Vercel Environment Variables')
    }

    const animes = await kv.get('animes')
    const result = Array.isArray(animes) ? animes : []
    console.log(`GET /api/anime: Found ${result.length} animes`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching animes from KV:', error)
    return NextResponse.json([], { status: 500 })
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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
