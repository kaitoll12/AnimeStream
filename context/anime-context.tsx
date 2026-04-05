"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"

export interface Episode {
  id: string
  number: number
  title: string
  videoUrl: string
  thumbnail?: string
}

export interface Anime {
  id: string
  title: string
  synopsis: string
  categories: string[]
  imageUrl: string
  bannerUrl?: string
  rating?: number
  episodes: Episode[]
  isFavorite?: boolean
}

interface AnimeContextType {
  animes: Anime[]
  addAnime: (anime: Omit<Anime, "id" | "episodes">) => void
  updateAnime: (id: string, anime: Partial<Omit<Anime, "id" | "episodes">>) => void
  deleteAnime: (id: string) => void
  addEpisode: (animeId: string, episode: Omit<Episode, "id">) => void
  updateEpisode: (animeId: string, episodeId: string, episode: Partial<Omit<Episode, "id">>) => void
  deleteEpisode: (animeId: string, episodeId: string) => void
  toggleFavorite: (animeId: string) => void
  getAnimeById: (id: string) => Anime | undefined
  searchAnimes: (query: string) => Anime[]
  filterByCategory: (category: string) => Anime[]
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined)

const STORAGE_KEY = "animestream_data"
const DATA_VERSION_KEY = "animestream_version"
const CURRENT_VERSION = "2"

export function AnimeProvider({ children }: { children: ReactNode }) {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  // Fetch from Global DB
  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const response = await fetch('/api/anime')
        if (response.ok) {
          const data = await response.json()
          setAnimes(data || [])
        }
      } catch (error) {
        console.error('Error fetching animes:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    fetchAnimes()

    // Load favorites from localStorage
    const storedFavs = localStorage.getItem('animestream_favorites')
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs))
      } catch {
        setFavorites([])
      }
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('animestream_favorites', JSON.stringify(favorites))
  }, [favorites])

  const saveToDB = async (newAnimes: Anime[]) => {
    try {
      const response = await fetch('/api/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnimes)
      })
      if (!response.ok) {
        throw new Error('Error al guardar en la base de datos')
      }
    } catch (error) {
      console.error('Error saving to DB:', error)
      toast.error("No se pudo guardar en la nube. Verifica la conexión a Redis en Vercel.")
    }
  }

  const addAnime = async (anime: Omit<Anime, "id" | "episodes">) => {
    const newAnime: Anime = {
      ...anime,
      id: Date.now().toString(),
      episodes: [],
    }
    const newState = [...animes, newAnime]
    setAnimes(newState)
    await saveToDB(newState)
  }

  const updateAnime = async (id: string, anime: Partial<Omit<Anime, "id" | "episodes">>) => {
    const newState = animes.map((a) =>
      a.id === id ? { ...a, ...anime } : a
    )
    setAnimes(newState)
    await saveToDB(newState)
  }

  const deleteAnime = async (id: string) => {
    const newState = animes.filter((a) => a.id !== id)
    setAnimes(newState)
    await saveToDB(newState)
  }

  const addEpisode = async (animeId: string, episode: Omit<Episode, "id">) => {
    const newState = animes.map((anime) =>
      anime.id === animeId
        ? {
            ...anime,
            episodes: [
              ...anime.episodes,
              { ...episode, id: `${animeId}-${Date.now()}` },
            ],
          }
        : anime
    )
    setAnimes(newState)
    await saveToDB(newState)
  }

  const updateEpisode = async (animeId: string, episodeId: string, episode: Partial<Omit<Episode, "id">>) => {
    const newState = animes.map((anime) =>
      anime.id === animeId
        ? {
            ...anime,
            episodes: anime.episodes.map((ep) =>
              ep.id === episodeId ? { ...ep, ...episode } : ep
            ),
          }
        : anime
    )
    setAnimes(newState)
    await saveToDB(newState)
  }

  const deleteEpisode = async (animeId: string, episodeId: string) => {
    const newState = animes.map((anime) =>
      anime.id === animeId
        ? {
            ...anime,
            episodes: anime.episodes.filter((ep) => ep.id !== episodeId),
          }
        : anime
    )
    setAnimes(newState)
    await saveToDB(newState)
  }

  const toggleFavorite = (animeId: string) => {
    setFavorites((prev) =>
      prev.includes(animeId)
        ? prev.filter((id) => id !== animeId)
        : [...prev, animeId]
    )
  }

  const getAnimeById = (id: string) => animes.find((anime) => anime.id === id)

  // Inject favorite status for UI
  const animesWithFavs = animes.map(anime => ({
    ...anime,
    isFavorite: favorites.includes(anime.id)
  }))

  const searchAnimes = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return animesWithFavs.filter(
      (anime) =>
        anime.title.toLowerCase().includes(lowerQuery) ||
        anime.categories.some((cat) => cat.toLowerCase().includes(lowerQuery))
    )
  }

  const filterByCategory = (category: string) => {
    if (category === "All") return animesWithFavs
    return animesWithFavs.filter((anime) =>
      anime.categories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase()
      )
    )
  }

  return (
    <AnimeContext.Provider
      value={{
        animes: animesWithFavs,
        addAnime,
        updateAnime,
        deleteAnime,
        addEpisode,
        updateEpisode,
        deleteEpisode,
        toggleFavorite,
        getAnimeById,
        searchAnimes,
        filterByCategory,
      }}
    >
      {children}
    </AnimeContext.Provider>
  )
}

export function useAnime() {
  const context = useContext(AnimeContext)
  if (context === undefined) {
    throw new Error("useAnime must be used within an AnimeProvider")
  }
  return context
}
