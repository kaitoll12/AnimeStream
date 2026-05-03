"use client"

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Camera, Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  
  const [nickname, setNickname] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (session?.user) {
      setNickname(session.user.name || '')
      setAvatarUrl(session.user.image || null)
    }
  }, [session])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        let errorMsg = `Error ${res.status}: Upload failed`
        try {
          const errorData = await res.json()
          errorMsg = errorData.message || errorData.error || errorMsg
        } catch (e) {
          const text = await res.text().catch(() => '')
          if (text) errorMsg += ` - ${text}`
        }
        throw new Error(errorMsg)
      }

      const newBlob = await res.json()
      setAvatarUrl(newBlob.url)
      setMessage({ text: 'Imagen subida correctamente.', type: 'success' })
    } catch (error) {
      console.error('Error uploading image', error)
      setMessage({ text: `Error al subir la imagen: ${error instanceof Error ? error.message : String(error)}`, type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setMessage(null)
    setIsSaving(true)

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas nuevas no coinciden.', type: 'error' })
      setIsSaving(false)
      return
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          avatarUrl,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ text: 'Perfil actualizado correctamente.', type: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        // Refresca la sesión para que navbar u otras cosas actualicen el UI
        await update({ name: nickname, image: avatarUrl })
      } else {
        setMessage({ text: data.error || 'Error al actualizar el perfil.', type: 'error' })
      }
    } catch (error) {
      console.error('Save error', error)
      setMessage({ text: 'Error inesperado.', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">Cargando o debes iniciar sesión...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Opciones de Usuario</h1>
        
        <div className="bg-[#1a1b26] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
          
          {message && (
            <div className={`p-4 mb-6 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          {/* Profile Picture */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Foto de perfil</h2>
            <div className="flex items-center gap-6">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shrink-0 border-2 border-gray-600">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden" 
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Subiendo...' : 'Cambiar imagen'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">Formatos permitidos: JPG, PNG, GIF, WEBP</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          {/* Basic Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nickname</label>
                <Input 
                  type="text" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)} 
                  className="bg-background border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
                <Input 
                  type="email" 
                  value={session.user.email || ''} 
                  disabled
                  className="bg-background/50 border-gray-800 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">El correo no puede cambiarse.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          {/* Password */}
          {(session.user as any)?.provider !== 'google' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña Actual</label>
                  <Input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Necesario para realizar cambios"
                    className="bg-background border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nueva Contraseña</label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="bg-background border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirmar Nueva Contraseña</label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="bg-background border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>

        </div>
      </div>
    </main>
  )
}
