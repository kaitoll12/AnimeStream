"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useUI } from "./ui-context"

export interface Server {
  id: string
  name: string
  url: string
}

export interface Episode {
  id: string
  number: number
  title: string
  videoUrl: string // Default/Primary server
  servers?: Server[]
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
  status?: "En emisión" | "Finalizado"
}

interface AnimeContextType {
  animes: Anime[]
  addAnime: (anime: Omit<Anime, "id" | "episodes">) => void
  updateAnime: (id: string, anime: Partial<Omit<Anime, "id" | "episodes">>) => void
  deleteAnime: (id: string) => void
  addEpisode: (animeId: string, episode: Omit<Episode, "id">) => void
  addBulkEpisodes: (animeId: string, episodes: Omit<Episode, "id">[]) => void
  updateEpisode: (animeId: string, episodeId: string, episode: Partial<Omit<Episode, "id">>) => void
  deleteEpisode: (animeId: string, episodeId: string) => void
  toggleFavorite: (animeId: string) => void
  getAnimeById: (id: string) => Anime | undefined
  searchAnimes: (query: string) => Anime[]
  filterByCategory: (category: string) => Anime[]
  watchedEpisodes: string[]
  toggleWatched: (episodeId: string) => void
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined)

const STORAGE_KEY = "animestream_data"
const DATA_VERSION_KEY = "animestream_version"
const CURRENT_VERSION = "2"

export function AnimeProvider({ children }: { children: ReactNode }) {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([])

  const { data: session, status } = useSession()
  const { openAuthModal } = useUI()

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
  }, [])

  // Fetch user data when session changes
  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/user/favorites')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setFavorites(data) })
        .catch(err => console.error(err))

      fetch('/api/user/watched')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setWatchedEpisodes(data) })
        .catch(err => console.error(err))
    } else if (status === "unauthenticated") {
      setFavorites([])
      setWatchedEpisodes([])
    }
  }, [status])

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

  const addBulkEpisodes = async (animeId: string, newEpisodes: Omit<Episode, "id">[]) => {
    const newState = animes.map((anime) => {
      if (anime.id === animeId) {
        // Gen unique IDs by offsetting Date.now for each to ensure uniqueness
        const episodesToAdd = newEpisodes.map((ep, index) => ({
          ...ep,
          id: `${animeId}-${Date.now()}-${index}`,
        }));
        return {
          ...anime,
          episodes: [...anime.episodes, ...episodesToAdd],
        };
      }
      return anime;
    });
    setAnimes(newState);
    await saveToDB(newState);
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

  const toggleFavorite = async (animeId: string) => {
    if (!session) {
      openAuthModal()
      return
    }

    setFavorites((prev) =>
      prev.includes(animeId)
        ? prev.filter((id) => id !== animeId)
        : [...prev, animeId]
    )

    try {
      await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId })
      })
    } catch(e) {
      console.error(e)
    }
  }

  const toggleWatched = async (episodeId: string) => {
    if (!session) {
      openAuthModal()
      return
    }

    setWatchedEpisodes((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId]
    )

    try {
      await fetch('/api/user/watched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId })
      })
    } catch(e) {
      console.error(e)
    }
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
        addBulkEpisodes,
        updateEpisode,
        deleteEpisode,
        toggleFavorite,
        getAnimeById,
        searchAnimes,
        filterByCategory,
        watchedEpisodes,
        toggleWatched,
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
