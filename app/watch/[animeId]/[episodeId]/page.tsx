"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAnime, type Server } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { VideoPlayer } from "@/components/video-player"
import { EpisodeCard } from "@/components/episode-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Server as ServerIcon } from "lucide-react"

interface WatchPageProps {
  params: Promise<{ animeId: string; episodeId: string }>
}

export default function WatchPage({ params }: WatchPageProps) {
  const { animeId, episodeId } = use(params)
  const router = useRouter()
  const { getAnimeById } = useAnime()
  const anime = getAnimeById(animeId)

  const currentEpisode = useMemo(() => {
    return anime?.episodes.find((ep) => ep.id === episodeId)
  }, [anime, episodeId])

  const [currentServer, setCurrentServer] = useState<string | null>(null)

  const videoSrc = useMemo(() => {
    if (!currentEpisode) return ""
    if (!currentServer) return currentEpisode.videoUrl
    const server = currentEpisode.servers?.find(s => s.id === currentServer)
    return server ? server.url : currentEpisode.videoUrl
  }, [currentEpisode, currentServer])

  const episodeIndex = useMemo(() => {
    return anime?.episodes.findIndex((ep) => ep.id === episodeId) ?? -1
  }, [anime, episodeId])

  const previousEpisode = useMemo(() => {
    if (!anime || episodeIndex <= 0) return null
    return anime.episodes[episodeIndex - 1]
  }, [anime, episodeIndex])

  const nextEpisode = useMemo(() => {
    if (!anime || episodeIndex >= anime.episodes.length - 1) return null
    return anime.episodes[episodeIndex + 1]
  }, [anime, episodeIndex])

  if (!anime || !currentEpisode) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Episode Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The episode you are looking for does not exist.
            </p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleEpisodeEnd = () => {
    if (nextEpisode) {
      router.push(`/watch/${animeId}/${nextEpisode.id}`)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12">
        {/* Video Player Section */}
        <div className="bg-black">
          <div className="max-w-7xl mx-auto">
            <VideoPlayer
              src={videoSrc}
              title={`${anime.title} - Episode ${currentEpisode.number}: ${currentEpisode.title}`}
              onEnded={handleEpisodeEnd}
            />
          </div>
        </div>

        {/* Server Selector */}
        {(currentEpisode.servers && currentEpisode.servers.length > 0) && (
          <div className="max-w-7xl mx-auto px-4 mt-4">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 px-3 border-r border-border shrink-0">
                <ServerIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">Servers:</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={currentServer === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentServer(null)}
                  className="whitespace-nowrap"
                >
                  Principal
                </Button>
                {currentEpisode.servers.map((server) => (
                  <Button
                    key={server.id}
                    variant={currentServer === server.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentServer(server.id)}
                    className="whitespace-nowrap"
                  >
                    {server.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          {/* Back Button & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link href={`/anime/${animeId}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to {anime.title}
              </Button>
            </Link>

            {/* Episode Navigation */}
            <div className="flex items-center gap-2">
              {previousEpisode ? (
                <Link href={`/watch/${animeId}/${previousEpisode.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}

              {nextEpisode ? (
                <Link href={`/watch/${animeId}/${nextEpisode.id}`}>
                  <Button variant="default" size="sm" className="gap-1">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="default" size="sm" disabled className="gap-1">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Episode Info */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Episode {currentEpisode.number}: {currentEpisode.title}
            </h1>
            <p className="text-muted-foreground">{anime.title}</p>
          </div>

          {/* More Episodes */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">
              More Episodes
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anime.episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  animeId={animeId}
                  animeTitle={anime.title}
                  isActive={episode.id === episodeId}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Aniflex - Your favorite anime streaming platform
          </p>
        </div>
      </footer>
    </main>
  )
}
