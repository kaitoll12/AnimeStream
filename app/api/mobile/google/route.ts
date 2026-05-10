import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const returnUrl = searchParams.get('returnUrl')
  
  if (!returnUrl) {
    return NextResponse.json({ error: 'Missing returnUrl parameter' }, { status: 400 })
  }

  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') || host.includes('192.168') || host.includes('172.') ? 'http' : 'https'
  
  const callback = `${protocol}://${host}/api/mobile/google/callback`

  // Redirect to NextAuth Google Sign In
  const response = NextResponse.redirect(`${protocol}://${host}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callback)}`)
  
  // Save the return deep link URL in a temporary cookie
  response.cookies.set('mobile_return_url', returnUrl, { path: '/', maxAge: 600 })
  
  return response
}
