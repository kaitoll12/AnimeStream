"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAnime } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { EpisodeCard } from "@/components/episode-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Heart, Play, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = use(params)
  const { getAnimeById, toggleFavorite } = useAnime()
  const anime = getAnimeById(id)

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
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Episodes ({anime.episodes.length})
          </h2>
          {anime.episodes.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anime.episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  animeId={anime.id}
                  animeTitle={anime.title}
                />
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
