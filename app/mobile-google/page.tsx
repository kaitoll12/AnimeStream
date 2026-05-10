"use client"

import { signIn } from "next-auth/react"
import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function MobileGoogleLogin() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (returnUrl && !hasTriggered.current) {
      hasTriggered.current = true
      
      // Save the returnUrl in cookie so the backend callback can read it and redirect back to the app
      document.cookie = `mobile_return_url=${encodeURIComponent(returnUrl)}; path=/; max-age=600; samesite=lax`
      
      // Auto-trigger NextAuth Google Sign In via POST
      const callback = `${window.location.origin}/api/mobile/google/callback`
      signIn('google', { callbackUrl: callback })
    }
  }, [returnUrl])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#8b5cf6] mb-4" />
        <p className="text-white text-lg font-medium">Redirigiendo a Google...</p>
      </div>
    </div>
  )
}
