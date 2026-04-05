"use client"

import { useMemo } from "react"
import { useAnime } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { AnimeCard } from "@/components/anime-card"
import { Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FavoritesPage() {
  const { animes, toggleFavorite } = useAnime()

  const favorites = useMemo(() => {
    return animes.filter((anime) => anime.isFavorite)
  }, [animes])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding anime to your favorites to see them here.
            </p>
            <Link href="/">
              <Button>Browse Anime</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            AnimeStream - Your favorite anime streaming platform
          </p>
        </div>
      </footer>
    </main>
  )
}
