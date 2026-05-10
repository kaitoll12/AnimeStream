"use client"

import { useSession } from "next-auth/react"
import { AuthModal } from "@/components/auth-modal"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function MobileLogin() {
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      // Send message to React Native WebView that login was successful
      if (typeof window !== "undefined" && (window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGIN_SUCCESS' }));
      }
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#11131a]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#11131a] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Inicio de sesión exitoso.</p>
        <p className="text-gray-400 text-sm mt-2">Volviendo a la aplicación...</p>
      </div>
    )
  }

  // Force AuthModal to be open over a dark background
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#11131a]">
      {/* We pass a dummy onClose because we don't want the user to close it without logging in. */}
      {/* If they want to cancel, they use the mobile app's back button / modal close. */}
      <AuthModal isOpen={true} onClose={() => {}} />
    </div>
  )
}
