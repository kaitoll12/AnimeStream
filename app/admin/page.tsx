"use client"

import { upload } from "@vercel/blob/client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAnime, type Anime, type Episode } from "@/context/anime-context"
import { useAdminAuth } from "@/context/admin-auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Film,
  Tv,
  ArrowLeft,
  Check,
  LogOut,
  Lock,
  User,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  Server as ServerIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ALL_CATEGORIES = [
  "Acción",
  "Romance",
  "Shonen",
  "Drama",
  "Fantasía",
  "Sobrenatural",
  "Aventura",
  "Escolares",
  "Comedia",
  "Horror",
  "Slice of Life",
  "Ecchi",
  "Ciencia Ficción",
  "Deportes",
  "Misterio",
  "Seinen",
  "Shoujo",
  "Artes Marciales",
]

type Tab = "animes" | "add-anime" | "add-episode"

function LoginForm() {
  const { login } = useAdminAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      const success = login(username, password)
      if (!success) {
        setError("Credenciales incorrectas")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground mt-2">
              Ingresa tus credenciales para acceder al panel de administración
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

// Edit Anime Modal
function EditAnimeModal({
  anime,
  onClose,
  onSave,
}: {
  anime: Anime
  onClose: () => void
  onSave: (data: Partial<Omit<Anime, "id" | "episodes">>) => void
}) {
  const [title, setTitle] = useState(anime.title)
  const [synopsis, setSynopsis] = useState(anime.synopsis)
  const [imageUrl, setImageUrl] = useState(anime.imageUrl)
  const [bannerUrl, setBannerUrl] = useState(anime.bannerUrl || "")
  const [rating, setRating] = useState(anime.rating?.toString() || "")
  const [categories, setCategories] = useState<string[]>(anime.categories)

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      title,
      synopsis,
      imageUrl,
      bannerUrl: bannerUrl || undefined,
      rating: rating ? parseFloat(rating) : undefined,
      categories,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Editar Anime</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Título *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sinopsis *
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL de Imagen de Portada
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL de Imagen de Banner
            </label>
            <Input
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Rating (1-10)
            </label>
            <Input
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              type="number"
              min="1"
              max="10"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Categorías *
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    categories.includes(category)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/20"
                  )}
                >
                  {categories.includes(category) && (
                    <Check className="w-3 h-3 inline-block mr-1" />
                  )}
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!title || !synopsis || categories.length === 0}
              className="flex-1"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Episode Modal
function EditEpisodeModal({
  episode,
  onClose,
  onSave,
}: {
  episode: Episode
  onClose: () => void
  onSave: (data: Partial<Omit<Episode, "id">>) => void
}) {
  const [number, setNumber] = useState(episode.number.toString())
  const [title, setTitle] = useState(episode.title)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState(episode.videoUrl)
  const [server1, setServer1] = useState(episode.servers?.[0]?.url || "")
  const [server1Name, setServer1Name] = useState(episode.servers?.[0]?.name || "")
  const [server2, setServer2] = useState(episode.servers?.[1]?.url || "")
  const [server2Name, setServer2Name] = useState(episode.servers?.[1]?.name || "")
  const [server3, setServer3] = useState(episode.servers?.[2]?.url || "")
  const [server3Name, setServer3Name] = useState(episode.servers?.[2]?.name || "")
  const [uploadType, setUploadType] = useState<"file" | "url">(
    episode.videoUrl.startsWith("http") && !episode.videoUrl.includes("vercel-storage.com") ? "url" : "file"
  )
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    let finalVideoUrl = videoUrl

    // If a new file was selected, upload it
    if (uploadType === "file" && videoFile) {
      setIsUploading(true)
      try {
        const newBlob = await upload(videoFile.name, videoFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
        })
        finalVideoUrl = newBlob.url
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir el video")
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    } else if (uploadType === "url" && !videoUrl) {
      setError("Por favor ingresa una URL de video")
      return
    }

    // Build servers array
    const servers: Server[] = []
    const detectName = (url: string, providedName: string, fallback: string) => {
      if (providedName) return providedName
      if (url.includes("drive.google.com")) return "Google Drive"
      if (url.includes("streamtape.com")) return "Streamtape"
      if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube"
      if (url.includes("voe.sx")) return "Voe.sx"
      return fallback
    }

    if (server1) servers.push({ id: "s1", name: detectName(server1, server1Name, "Servidor 2"), url: server1 })
    if (server2) servers.push({ id: "s2", name: detectName(server2, server2Name, "Servidor 3"), url: server2 })
    if (server3) servers.push({ id: "s3", name: detectName(server3, server3Name, "Servidor 4"), url: server3 })

    onSave({
      number: parseInt(number),
      title,
      videoUrl: finalVideoUrl,
      servers: servers.length > 0 ? servers : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Editar Episodio</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Número de Episodio *
            </label>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              type="number"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Título del Episodio *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Método de Video
            </label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadType("file")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border-2 transition-all",
                  uploadType === "file"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                )}
              >
                Subir Archivo
              </button>
              <button
                type="button"
                onClick={() => setUploadType("url")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border-2 transition-all",
                  uploadType === "url"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                )}
              >
                Enlace Externo
              </button>
            </div>

            {uploadType === "file" ? (
              <div className="relative">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setVideoFile(file)
                      setError("")
                    }
                  }}
                  className="hidden"
                  id="edit-video-upload"
                />
                <label
                  htmlFor="edit-video-upload"
                  className={cn(
                    "flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    videoFile
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  {videoFile ? (
                    <div className="text-center">
                      <Film className="w-6 h-6 mx-auto mb-1 text-primary" />
                      <p className="font-medium text-foreground text-sm">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {episode.videoUrl.includes("vercel-storage.com") ? "Cambiar archivo" : "Seleccionar video"}
                      </p>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Link Principal (Drive, YouTube, etc.)"
                required
              />
            )}
          </div>

          {uploadType === "url" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ServerIcon className="w-4 h-4 text-primary" />
                  Servidores Opcionales
                </div>
                <span className="text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">Auto-detección activa</span>
              </h3>
              <div className="grid gap-4">
                <div className="flex gap-2">
                  <Input
                    value={server1}
                    onChange={(e) => setServer1(e.target.value)}
                    placeholder="Link Servidor 2"
                    className="flex-[2]"
                  />
                  <Input
                    value={server1Name}
                    onChange={(e) => setServer1Name(e.target.value)}
                    placeholder="Nombre (ej. Drive)"
                    className="flex-1 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={server2}
                    onChange={(e) => setServer2(e.target.value)}
                    placeholder="Link Servidor 3"
                    className="flex-[2]"
                  />
                  <Input
                    value={server2Name}
                    onChange={(e) => setServer2Name(e.target.value)}
                    placeholder="Nombre"
                    className="flex-1 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={server3}
                    onChange={(e) => setServer3(e.target.value)}
                    placeholder="Link Servidor 4"
                    className="flex-[2]"
                  />
                  <Input
                    value={server3Name}
                    onChange={(e) => setServer3Name(e.target.value)}
                    placeholder="Nombre"
                    className="flex-1 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isUploading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!number || !title || isUploading || (uploadType === "url" && !videoUrl)}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  title,
  message,
  onClose,
  onConfirm,
}: {
  title: string
  message: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

// Anime Card with Edit/Delete
function AnimeAdminCard({
  anime,
  onEdit,
  onDelete,
  onEditEpisode,
  onDeleteEpisode,
}: {
  anime: Anime
  onEdit: () => void
  onDelete: () => void
  onEditEpisode: (episode: Episode) => void
  onDeleteEpisode: (episodeId: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-16 h-24 relative rounded-lg overflow-hidden shrink-0">
          <Image
            src={anime.imageUrl}
            alt={anime.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{anime.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{anime.synopsis}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {anime.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">
              Episodios ({anime.episodes.length})
            </h4>
          </div>

          {anime.episodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay episodios todavía. Agrega uno desde la pestaña &quot;Agregar Episodio&quot;.
            </p>
          ) : (
            <div className="space-y-2">
              {anime.episodes
                .sort((a, b) => a.number - b.number)
                .map((episode) => (
                  <div
                    key={episode.id}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        Ep. {episode.number}: {episode.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {episode.videoUrl}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditEpisode(episode)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDeleteEpisode(episode.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { animes, addAnime, updateAnime, deleteAnime, addEpisode, updateEpisode, deleteEpisode } = useAnime()
  const { isLoggedIn, logout } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<Tab>("animes")

  // Add Anime Form State
  const [animeTitle, setAnimeTitle] = useState("")
  const [animeSynopsis, setAnimeSynopsis] = useState("")
  const [animeImageUrl, setAnimeImageUrl] = useState("")
  const [animeBannerUrl, setAnimeBannerUrl] = useState("")
  const [animeRating, setAnimeRating] = useState("")
  const [animeCategories, setAnimeCategories] = useState<string[]>([])
  const [isAnimeSubmitting, setIsAnimeSubmitting] = useState(false)
  const [animeSuccess, setAnimeSuccess] = useState(false)

  // Add Episode Form State
  const [selectedAnimeId, setSelectedAnimeId] = useState("")
  const [episodeNumber, setEpisodeNumber] = useState("")
  const [episodeTitle, setEpisodeTitle] = useState("")
  const [episodeVideoFile, setEpisodeVideoFile] = useState<File | null>(null)
  const [episodeVideoUrl, setEpisodeVideoUrl] = useState("")
  const [episodeServer1, setEpisodeServer1] = useState("")
  const [episodeServer1Name, setEpisodeServer1Name] = useState("")
  const [episodeServer2, setEpisodeServer2] = useState("")
  const [episodeServer2Name, setEpisodeServer2Name] = useState("")
  const [episodeServer3, setEpisodeServer3] = useState("")
  const [episodeServer3Name, setEpisodeServer3Name] = useState("")
  const [uploadType, setUploadType] = useState<"file" | "url">("file")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [isEpisodeSubmitting, setIsEpisodeSubmitting] = useState(false)
  const [episodeSuccess, setEpisodeSuccess] = useState(false)
  const [episodeError, setEpisodeError] = useState("")

  // Edit Modal State
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null)
  const [editingEpisode, setEditingEpisode] = useState<{ animeId: string; episode: Episode } | null>(null)

  // Delete Modal State
  const [deletingAnime, setDeletingAnime] = useState<Anime | null>(null)
  const [deletingEpisode, setDeletingEpisode] = useState<{ animeId: string; animeTitle: string; episode: Episode } | null>(null)

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return <LoginForm />
  }

  const toggleCategory = (category: string) => {
    setAnimeCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleAddAnime = (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnimeSubmitting(true)

    setTimeout(() => {
      addAnime({
        title: animeTitle,
        synopsis: animeSynopsis,
        imageUrl: animeImageUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
        bannerUrl: animeBannerUrl,
        rating: animeRating ? parseFloat(animeRating) : undefined,
        categories: animeCategories,
      })

      setAnimeTitle("")
      setAnimeSynopsis("")
      setAnimeImageUrl("")
      setAnimeBannerUrl("")
      setAnimeRating("")
      setAnimeCategories([])
      setIsAnimeSubmitting(false)
      setAnimeSuccess(true)

      setTimeout(() => setAnimeSuccess(false), 3000)
    }, 500)
  }

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsEpisodeSubmitting(true)
    setEpisodeError("")

    try {
      let url = episodeVideoUrl

      if (uploadType === "file" && episodeVideoFile) {
        setIsUploading(true)
        setUploadProgress("Subiendo video...")
        
        const newBlob = await upload(episodeVideoFile.name, episodeVideoFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
        })
        url = newBlob.url
      } else if (uploadType === "url" && !episodeVideoUrl) {
        throw new Error("Por favor ingresa una URL de video")
      }

      setUploadProgress("Guardando episodio...")

      // Build servers array if extra links are provided
      const servers: Server[] = []
      const detectName = (url: string, providedName: string, fallback: string) => {
        if (providedName) return providedName
        if (url.includes("drive.google.com")) return "Google Drive"
        if (url.includes("streamtape.com")) return "Streamtape"
        if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube"
        if (url.includes("voe.sx")) return "Voe.sx"
        return fallback
      }

      if (episodeServer1) servers.push({ id: "s1", name: detectName(episodeServer1, episodeServer1Name, "Servidor 2"), url: episodeServer1 })
      if (episodeServer2) servers.push({ id: "s2", name: detectName(episodeServer2, episodeServer2Name, "Servidor 3"), url: episodeServer2 })
      if (episodeServer3) servers.push({ id: "s3", name: detectName(episodeServer3, episodeServer3Name, "Servidor 4"), url: episodeServer3 })

      // Add episode with the video URL and extra servers
      addEpisode(selectedAnimeId, {
        number: parseInt(episodeNumber),
        title: episodeTitle,
        videoUrl: url,
        servers: servers.length > 0 ? servers : undefined
      })

      setEpisodeNumber("")
      setEpisodeTitle("")
      setEpisodeVideoFile(null)
      setEpisodeVideoUrl("")
      setEpisodeServer1("")
      setEpisodeServer1Name("")
      setEpisodeServer2("")
      setEpisodeServer2Name("")
      setEpisodeServer3("")
      setEpisodeServer3Name("")
      setIsEpisodeSubmitting(false)
      setIsUploading(false)
      setUploadProgress("")
      setEpisodeSuccess(true)

      setTimeout(() => setEpisodeSuccess(false), 3000)
    } catch (error) {
      setEpisodeError(error instanceof Error ? error.message : "Error al subir el video")
      setIsEpisodeSubmitting(false)
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  const handleUpdateAnime = (data: Partial<Omit<Anime, "id" | "episodes">>) => {
    if (editingAnime) {
      updateAnime(editingAnime.id, data)
      setEditingAnime(null)
    }
  }

  const handleDeleteAnime = () => {
    if (deletingAnime) {
      deleteAnime(deletingAnime.id)
      setDeletingAnime(null)
    }
  }

  const handleUpdateEpisode = (data: Partial<Omit<Episode, "id">>) => {
    if (editingEpisode) {
      updateEpisode(editingEpisode.animeId, editingEpisode.episode.id, data)
      setEditingEpisode(null)
    }
  }

  const handleDeleteEpisode = () => {
    if (deletingEpisode) {
      deleteEpisode(deletingEpisode.animeId, deletingEpisode.episode.id)
      setDeletingEpisode(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 mb-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Button>
            </Link>
            <div className="flex items-center mb-8">
            </div>
            <p className="text-muted-foreground mt-1">
              Administra tu colección de anime y episodios
            </p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          <Button
            variant={activeTab === "animes" ? "default" : "ghost"}
            onClick={() => setActiveTab("animes")}
            className="gap-2"
          >
            <Tv className="w-4 h-4" />
            Todos los Animes ({animes.length})
          </Button>
          <Button
            variant={activeTab === "add-anime" ? "default" : "ghost"}
            onClick={() => setActiveTab("add-anime")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Anime
          </Button>
          <Button
            variant={activeTab === "add-episode" ? "default" : "ghost"}
            onClick={() => setActiveTab("add-episode")}
            className="gap-2"
          >
            <Film className="w-4 h-4" />
            Agregar Episodio
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "animes" && (
          <div>
            {animes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tv className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No hay animes todavía
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comienza agregando tu primer anime a la colección
                </p>
                <Button onClick={() => setActiveTab("add-anime")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Anime
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {animes.map((anime) => (
                  <AnimeAdminCard
                    key={anime.id}
                    anime={anime}
                    onEdit={() => setEditingAnime(anime)}
                    onDelete={() => setDeletingAnime(anime)}
                    onEditEpisode={(episode) =>
                      setEditingEpisode({ animeId: anime.id, episode })
                    }
                    onDeleteEpisode={(episodeId) => {
                      const episode = anime.episodes.find((e) => e.id === episodeId)
                      if (episode) {
                        setDeletingEpisode({
                          animeId: anime.id,
                          animeTitle: anime.title,
                          episode,
                        })
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "add-anime" && (
          <div className="max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Agregar Nuevo Anime
              </h2>

              {animeSuccess && (
                <div className="flex items-center gap-2 p-4 mb-6 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
                  <Check className="w-5 h-5" />
                  Anime agregado exitosamente
                </div>
              )}

              <form onSubmit={handleAddAnime} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título *
                  </label>
                  <Input
                    value={animeTitle}
                    onChange={(e) => setAnimeTitle(e.target.value)}
                    placeholder="Ingresa el título del anime"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sinopsis *
                  </label>
                  <textarea
                    value={animeSynopsis}
                    onChange={(e) => setAnimeSynopsis(e.target.value)}
                    placeholder="Ingresa la sinopsis del anime"
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL de Imagen de Portada
                  </label>
                  <Input
                    value={animeImageUrl}
                    onChange={(e) => setAnimeImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    type="url"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL de Imagen de Banner
                  </label>
                  <Input
                    value={animeBannerUrl}
                    onChange={(e) => setAnimeBannerUrl(e.target.value)}
                    placeholder="https://ejemplo.com/banner.jpg"
                    type="url"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rating (1-10)
                  </label>
                  <Input
                    value={animeRating}
                    onChange={(e) => setAnimeRating(e.target.value)}
                    placeholder="8.5"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Categorías *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                          animeCategories.includes(category)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-primary/20"
                        )}
                      >
                        {animeCategories.includes(category) && (
                          <Check className="w-3 h-3 inline-block mr-1" />
                        )}
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isAnimeSubmitting ||
                    !animeTitle ||
                    !animeSynopsis ||
                    animeCategories.length === 0
                  }
                  className="w-full"
                >
                  {isAnimeSubmitting ? "Agregando..." : "Agregar Anime"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "add-episode" && (
          <div className="max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Agregar Nuevo Episodio
              </h2>

              {animes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Primero debes agregar al menos un anime
                  </p>
                  <Button onClick={() => setActiveTab("add-anime")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Anime
                  </Button>
                </div>
              ) : (
                <>
                  {episodeSuccess && (
                    <div className="flex items-center gap-2 p-4 mb-6 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
                      <Check className="w-5 h-5" />
                      Episodio agregado exitosamente
                    </div>
                  )}

                  {episodeError && (
                    <div className="flex items-center gap-2 p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      {episodeError}
                    </div>
                  )}

                  <form onSubmit={handleAddEpisode} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Seleccionar Anime *
                      </label>
                      <Select
                        value={selectedAnimeId}
                        onValueChange={setSelectedAnimeId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un anime" />
                        </SelectTrigger>
                        <SelectContent>
                          {animes.map((anime) => (
                            <SelectItem key={anime.id} value={anime.id}>
                              {anime.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Número de Episodio *
                      </label>
                      <Input
                        value={episodeNumber}
                        onChange={(e) => setEpisodeNumber(e.target.value)}
                        placeholder="1"
                        type="number"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Título del Episodio *
                      </label>
                      <Input
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                        placeholder="Ingresa el título del episodio"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-4">
                        Método de Video *
                      </label>
                      <div className="flex gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() => setUploadType("file")}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg border-2 transition-all",
                            uploadType === "file"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          Subir Archivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadType("url")}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg border-2 transition-all",
                            uploadType === "url"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-transparent text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          Enlace Externo
                        </button>
                      </div>

                      {uploadType === "file" ? (
                        <div className="relative">
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setEpisodeVideoFile(file)
                                setEpisodeError("")
                              }
                            }}
                            className="hidden"
                            id="video-upload"
                          />
                          <label
                            htmlFor="video-upload"
                            className={cn(
                              "flex items-center justify-center gap-3 w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                              episodeVideoFile
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            {episodeVideoFile ? (
                              <div className="text-center">
                                <Film className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <p className="font-medium text-foreground">{episodeVideoFile.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {(episodeVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="font-medium text-foreground">Haz clic para seleccionar un video</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  MP4, WebM, OGG o MOV
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      ) : (
                        <Input
                          value={episodeVideoUrl}
                          onChange={(e) => setEpisodeVideoUrl(e.target.value)}
                          placeholder="Link Principal (Drive, YouTube, etc.)"
                          required
                        />
                      )}
                    </div>

                    {uploadType === "url" && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-sm font-medium text-foreground flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ServerIcon className="w-4 h-4 text-primary" />
                            Servidores Opcionales
                          </div>
                          <span className="text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">Auto-detección activa</span>
                        </h3>
                        <div className="grid gap-4">
                          <div className="flex gap-2">
                            <Input
                              value={episodeServer1}
                              onChange={(e) => setEpisodeServer1(e.target.value)}
                              placeholder="Link Servidor 2"
                              className="flex-[2]"
                            />
                            <Input
                              value={episodeServer1Name}
                              onChange={(e) => setEpisodeServer1Name(e.target.value)}
                              placeholder="Nombre (ej. Drive)"
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={episodeServer2}
                              onChange={(e) => setEpisodeServer2(e.target.value)}
                              placeholder="Link Servidor 3"
                              className="flex-[2]"
                            />
                            <Input
                              value={episodeServer2Name}
                              onChange={(e) => setEpisodeServer2Name(e.target.value)}
                              placeholder="Nombre"
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={episodeServer3}
                              onChange={(e) => setEpisodeServer3(e.target.value)}
                              placeholder="Link Servidor 4"
                              className="flex-[2]"
                            />
                            <Input
                              value={episodeServer3Name}
                              onChange={(e) => setEpisodeServer3Name(e.target.value)}
                              placeholder="Nombre"
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          * Los servidores vacíos no se mostrarán en la página de reproducción.
                        </p>
                      </div>
                    )}

                    {isUploading && (
                      <div className="flex items-center gap-2 p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {uploadProgress}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={
                        isEpisodeSubmitting ||
                        !selectedAnimeId ||
                        !episodeNumber ||
                        !episodeTitle ||
                        (uploadType === "file" ? !episodeVideoFile : !episodeVideoUrl)
                      }
                      className="w-full"
                    >
                      {isEpisodeSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        "Agregar Episodio"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingAnime && (
        <EditAnimeModal
          anime={editingAnime}
          onClose={() => setEditingAnime(null)}
          onSave={handleUpdateAnime}
        />
      )}

      {editingEpisode && (
        <EditEpisodeModal
          episode={editingEpisode.episode}
          onClose={() => setEditingEpisode(null)}
          onSave={handleUpdateEpisode}
        />
      )}

      {deletingAnime && (
        <DeleteConfirmModal
          title="Eliminar Anime"
          message={`¿Estás seguro de que deseas eliminar "${deletingAnime.title}"? Esta acción también eliminará todos sus episodios y no se puede deshacer.`}
          onClose={() => setDeletingAnime(null)}
          onConfirm={handleDeleteAnime}
        />
      )}

      {deletingEpisode && (
        <DeleteConfirmModal
          title="Eliminar Episodio"
          message={`¿Estás seguro de que deseas eliminar el episodio ${deletingEpisode.episode.number} "${deletingEpisode.episode.title}" de "${deletingEpisode.animeTitle}"? Esta acción no se puede deshacer.`}
          onClose={() => setDeletingEpisode(null)}
          onConfirm={handleDeleteEpisode}
        />
      )}
    </main>
  )
}
