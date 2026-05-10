import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = cookies()
  
  const returnUrl = cookieStore.get('mobile_return_url')?.value
  if (!returnUrl) {
    return NextResponse.json({ error: 'Missing return URL from cookie' }, { status: 400 })
  }

  // Get the session token set by NextAuth
  const sessionToken = cookieStore.get('next-auth.session-token')?.value || cookieStore.get('__Secure-next-auth.session-token')?.value
  
  if (!sessionToken) {
    // If there's no session token, login failed or was cancelled
    return NextResponse.redirect(`${returnUrl}?error=login_failed`)
  }

  // Redirect back to the mobile app with the session token
  const urlObj = new URL(returnUrl)
  urlObj.searchParams.append('session_token', sessionToken)
  
  return NextResponse.redirect(urlObj.toString())
}
