"use client"

import { use, useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAnime, type Server } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { VideoPlayer } from "@/components/video-player"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Server as ServerIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const episodesPerPage = 50;
  const totalEpisodes = anime?.episodes.length || 0;
  
  const episodeRanges = useMemo(() => {
    if (!anime) return [];
    const ranges = [];
    for (let i = 0; i < totalEpisodes; i += episodesPerPage) {
      const start = i + 1;
      const end = Math.min(i + episodesPerPage, totalEpisodes);
      ranges.push({ start, end, index: ranges.length });
    }
    return ranges;
  }, [anime, totalEpisodes]);

  const initialRangeIndex = useMemo(() => {
    if (!currentEpisode || episodeRanges.length === 0) return 0;
    const index = episodeRanges.findIndex(
      (range) => currentEpisode.number >= range.start && currentEpisode.number <= range.end
    );
    return index !== -1 ? index : 0;
  }, [currentEpisode, episodeRanges]);

  const [selectedRangeIndex, setSelectedRangeIndex] = useState(initialRangeIndex);

  useEffect(() => {
    setSelectedRangeIndex(initialRangeIndex);
  }, [initialRangeIndex]);

  const visibleEpisodes = useMemo(() => {
    if (!anime) return [];
    if (episodeRanges.length <= 1) return anime.episodes;
    
    const range = episodeRanges[selectedRangeIndex];
    if (!range) return anime.episodes;
    
    return anime.episodes.filter(ep => ep.number >= range.start && ep.number <= range.end);
  }, [anime, episodeRanges, selectedRangeIndex]);

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

      <div className="pt-36 pb-12 max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column (Video & Controls) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Video Player Section */}
            <div className="bg-black rounded-lg overflow-hidden border border-border/50 aspect-video shadow-lg">
              <VideoPlayer
                src={videoSrc}
                title={`${anime.title} - Episode ${currentEpisode.number}${currentEpisode.title ? `: ${currentEpisode.title}` : ""}`}
                onEnded={handleEpisodeEnd}
              />
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card border border-border/50 rounded-xl p-4 shadow-sm">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                {previousEpisode ? (
                  <Link href={`/watch/${animeId}/${previousEpisode.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="gap-2 border-white/10 opacity-50">
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                )}

                {nextEpisode ? (
                  <Link href={`/watch/${animeId}/${nextEpisode.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 transition-colors">
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="gap-2 border-white/10 opacity-50">
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Server Selector */}
              {(currentEpisode.servers && currentEpisode.servers.length > 0) && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 px-3 border-r border-border/50 shrink-0">
                    <ServerIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">SUB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={currentServer === null ? "default" : "secondary"}
                      size="sm"
                      onClick={() => setCurrentServer(null)}
                      className={`whitespace-nowrap transition-colors ${currentServer === null ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary/30 hover:bg-secondary/80 text-muted-foreground hover:text-foreground"}`}
                    >
                      Principal
                    </Button>
                    {currentEpisode.servers.map((server) => (
                      <Button
                        key={server.id}
                        variant={currentServer === server.id ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setCurrentServer(server.id)}
                        className={`whitespace-nowrap transition-colors ${currentServer === server.id ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary/30 hover:bg-secondary/80 text-muted-foreground hover:text-foreground"}`}
                      >
                        {server.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Anime Title Link */}
            <div className="mt-2 px-2">
              <Link href={`/anime/${animeId}`} className="text-primary hover:text-primary/80 transition-colors font-medium text-sm md:text-base flex items-center gap-2 w-fit">
                <ArrowLeft className="w-4 h-4" />
                Volver a {anime.title}
              </Link>
            </div>
          </div>

          {/* Right Column (Episodes List) */}
          <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0">
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border/50 bg-secondary/10 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Estás viendo</p>
                  <h2 className="text-2xl font-bold text-foreground">
                    Episodio {currentEpisode.number}
                  </h2>
                </div>
                {episodeRanges.length > 1 && (
                  <Select 
                    value={selectedRangeIndex.toString()} 
                    onValueChange={(val) => setSelectedRangeIndex(parseInt(val))}
                  >
                    <SelectTrigger className="w-fit min-w-[100px] h-9 bg-background">
                      <SelectValue placeholder="Capítulos" />
                    </SelectTrigger>
                    <SelectContent>
                      {episodeRanges.map((range) => (
                        <SelectItem key={range.index} value={range.index.toString()}>
                          {range.start} - {range.end}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {visibleEpisodes.map((episode) => {
                    const isActive = episode.id === episodeId;
                    return (
                      <Link key={episode.id} href={`/watch/${animeId}/${episode.id}`}>
                        <Button
                          variant={isActive ? "outline" : "secondary"}
                          className={`w-full p-0 h-10 transition-all font-medium ${
                            isActive 
                              ? "border-primary text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary ring-1 ring-primary/50" 
                              : "bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {episode.number}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

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
