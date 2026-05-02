"use client"

import { use, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAnime } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Heart, Play, ArrowLeft, Search, ArrowUpDown, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = use(params)
  const { getAnimeById, toggleFavorite, watchedEpisodes, toggleWatched } = useAnime()
  const anime = getAnimeById(id)

  const [isDescending, setIsDescending] = useState(false);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

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

  const visibleEpisodes = useMemo(() => {
    if (!anime) return [];
    
    let sorted = [...anime.episodes];
    if (isDescending) {
      sorted.reverse();
    }

    if (episodeRanges.length <= 1) return sorted;
    
    const range = episodeRanges[selectedRangeIndex];
    if (!range) return sorted;
    
    return sorted.filter(ep => ep.number >= range.start && ep.number <= range.end);
  }, [anime, episodeRanges, selectedRangeIndex, isDescending]);

  if (!anime) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-foreground mb-4">Anime Not Found</h1>
            <p className="text-muted-foreground mb-6">The anime you are looking for does not exist.</p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Banner Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={anime.bannerUrl || anime.imageUrl}
            alt={anime.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Back Button */}
        <div className="relative pt-24 px-4 max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 pb-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-6 items-end">
            {/* Poster */}
            <div className="hidden md:block w-48 lg:w-56 shrink-0">
              <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl border border-border">
                <Image
                  src={anime.imageUrl}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="224px"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              {/* Rating & Categories */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {anime.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-yellow-500">
                      {anime.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                {anime.categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="border-foreground/30 text-foreground"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
                {anime.title}
              </h1>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {anime.episodes.length > 0 && (
                  <Link href={`/watch/${anime.id}/${anime.episodes[0].id}`}>
                    <Button size="lg" className="gap-2 px-8">
                      <Play className="w-5 h-5 fill-current" />
                      Watch Episode 1
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "gap-2 px-6",
                    anime.isFavorite && "border-red-500 text-red-500 hover:bg-red-500/10"
                  )}
                  onClick={() => toggleFavorite(anime.id)}
                >
                  <Heart
                    className={cn(
                      "w-5 h-5",
                      anime.isFavorite && "fill-current"
                    )}
                  />
                  {anime.isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Synopsis */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-4">Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {anime.synopsis}
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Episodes</dt>
                <dd className="text-foreground font-medium">{anime.episodes.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Rating</dt>
                <dd className="text-foreground font-medium flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  {anime.rating?.toFixed(1) || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd className="text-foreground font-medium flex items-center gap-2">
                  {anime.status || "En emisión"}
                  <span className={cn("w-2 h-2 rounded-full", anime.status === "Finalizado" ? "bg-red-500" : "bg-green-500")} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Categories</dt>
                <dd className="flex flex-wrap gap-1 mt-1">
                  {anime.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Episodes Section */}
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Episodios
            </h2>
            
            <div className="flex items-center gap-2">
              {episodeRanges.length > 1 && (
                <Select 
                  value={selectedRangeIndex.toString()} 
                  onValueChange={(val) => setSelectedRangeIndex(parseInt(val))}
                >
                  <SelectTrigger className="w-fit min-w-[100px] bg-secondary/50 border-none hover:bg-secondary transition-colors">
                    <SelectValue placeholder="Rango" />
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
              
              <Button variant="secondary" size="icon" className="bg-secondary/50 border-none shrink-0 hover:bg-secondary transition-colors">
                <Search className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                className={cn("bg-secondary/50 border-none shrink-0 hover:bg-secondary transition-colors", isDescending && "rotate-180")}
                onClick={() => setIsDescending(!isDescending)}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {anime.episodes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visibleEpisodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/watch/${anime.id}/${episode.id}`}
                  className="group relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <Image
                    src={episode.thumbnail || anime.bannerUrl || anime.imageUrl}
                    alt={episode.title || `Episode ${episode.number}`}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-300",
                      watchedEpisodes.includes(episode.id) ? "opacity-50 grayscale-[50%]" : "group-hover:scale-105"
                    )}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 text-primary-foreground fill-current ml-1" />
                    </div>
                  </div>

                  {/* Watched Button */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      toggleWatched(episode.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-md transition-all z-10"
                    title={watchedEpisodes.includes(episode.id) ? "Desmarcar" : "Marcar como visto"}
                  >
                    <CheckCircle className={cn("w-5 h-5", watchedEpisodes.includes(episode.id) && "text-green-500 fill-green-500/20")} />
                  </button>

                  {/* Episode Badge */}
                  <div className="absolute bottom-0 left-0 bg-[#1e2029]/95 backdrop-blur-md px-3 py-1.5 rounded-tr-xl border-t border-r border-white/5">
                    <span className="text-xs font-semibold text-gray-300">
                      Episodio <span className="font-bold text-white">{episode.number}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground">No episodes available yet.</p>
            </div>
          )}
        </section>
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
