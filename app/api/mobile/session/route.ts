import { NextResponse } from 'next/server'
import { decode } from 'next-auth/jwt'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token missing' }, { status: 400 })
    }

    // Determine the correct salt based on the environment
    const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https'
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'

    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development_only_123",
      salt: cookieName
    })

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({ user: decoded })
  } catch (error) {
    console.error('Mobile session check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
