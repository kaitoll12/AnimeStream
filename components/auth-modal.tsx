"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useAdminAuth } from "@/context/admin-auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login: adminLogin } = useAdminAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        // Intentar login de admin primero
        if (adminLogin(email, password)) {
          onClose()
          setIsLoading(false)
          return
        }

        // Login normal
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          onClose()
        }
      } else {
        // Register flow
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Ocurrió un error al registrarse")
        } else {
          // Auto-login after register
          const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
          })
          
          if (!result?.error) {
            onClose()
          }
        }
      }
    } catch (err) {
      setError("Ocurrió un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#111319] border-border text-foreground p-0 overflow-hidden">
        <div className="p-6">
          <DialogTitle className="text-xl font-bold mb-6">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-gray-300">Nombre de Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Tu nombre en la plataforma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#1C1F26] border-none text-white focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-300">Correo electrónico o Usuario Admin</Label>
              <Input
                id="email"
                type="text"
                placeholder="correo@gmail.com o usuario admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1C1F26] border-none text-white focus-visible:ring-1 focus-visible:ring-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-300">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1C1F26] border-none text-white focus-visible:ring-1 focus-visible:ring-primary"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-gray-500 data-[state=checked]:bg-primary" />
                  <label
                    htmlFor="remember"
                    className="text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Recuérdame
                  </label>
                </div>
                <button type="button" className="text-gray-400 hover:text-white transition-colors">
                  Olvidé mi contraseña
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#34d399] hover:bg-[#10b981] text-black font-semibold mt-6 h-11 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Iniciar sesión" : "Registrarse")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            {isLogin ? "¿Aún no tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-[#34d399] font-medium hover:underline"
            >
              {isLogin ? "Registrarme" : "Iniciar sesión"}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111319] px-2 text-gray-500">O</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-11"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Entrar con tu cuenta Google
            </Button>
            {/* Discord button intentionally omitted as per instructions */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
