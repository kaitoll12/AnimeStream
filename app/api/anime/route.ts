import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const animes = await kv.get('animes')
    return NextResponse.json(animes || [])
  } catch (error) {
    console.error('Error fetching animes from KV:', error)
    return NextResponse.json({ error: 'Failed to fetch animes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const animes = await request.json()
    await kv.set('animes', animes)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving animes to KV:', error)
    return NextResponse.json({ error: 'Failed to save animes' }, { status: 500 })
  }
}
