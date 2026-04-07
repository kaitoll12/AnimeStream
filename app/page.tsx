"use client"

import { useState, useMemo } from "react"
import { useAnime } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AnimeCard } from "@/components/anime-card"
import { CategoryFilter } from "@/components/category-filter"
import { TrendingUp, Clock, Sparkles } from "lucide-react"

const ALL_CATEGORIES = [
  "Todos",
  "Acción",
  "Romance",
  "Shonen",
  "Drama",
  "Fantasia",
  "Sobrenatural",
  "Aventura",
  "Escolares",
  "Ecchi",
  "Ciencia Ficción",
  "Deportes",
  "Misterio",
  "Seinen",
  "Shoujo",
  "Artes Marciales",
]

export default function HomePage() {
  const { animes, toggleFavorite, searchAnimes, filterByCategory } = useAnime()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const featuredAnime = useMemo(() => {
    const topRated = [...animes].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return topRated[0]
  }, [animes])

  const filteredAnimes = useMemo(() => {
    let result = animes
    if (searchQuery) {
      result = searchAnimes(searchQuery)
    } else if (selectedCategory !== "All") {
      result = filterByCategory(selectedCategory)
    }
    return result
  }, [animes, searchQuery, selectedCategory, searchAnimes, filterByCategory])

  const popularAnimes = useMemo(() => {
    return [...animes].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
  }, [animes])

  const latestEpisodes = useMemo(() => {
    return animes
      .filter((a) => a.episodes.length > 0)
      .sort((a, b) => b.episodes.length - a.episodes.length)
      .slice(0, 6)
  }, [animes])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      setSelectedCategory("All")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />

      {/* Hero Section */}
      {featuredAnime && !searchQuery && selectedCategory === "All" && (
        <div className="pt-28">
          <HeroSection anime={featuredAnime} />
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 ${featuredAnime && !searchQuery && selectedCategory === "All" ? "py-12" : "pt-36 pb-12"}`}>
        {/* Search Results */}
        {searchQuery && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Search Results for &quot;{searchQuery}&quot;
            </h2>
            {filteredAnimes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredAnimes.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay resultados para &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </section>
        )}

        {/* Categories Section */}
        {!searchQuery && (
          <>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Filtrar por Categoría</h2>
              </div>
              <CategoryFilter
                categories={ALL_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </section>

            {selectedCategory !== "All" ? (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {selectedCategory} Anime
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredAnimes.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
                {filteredAnimes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No anime found in this category</p>
                  </div>
                )}
              </section>
            ) : (
              <>
                {/* Popular Section */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Animes Populares</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {popularAnimes.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </section>

                {/* Latest Episodes */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Últimos Episodios</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {latestEpisodes.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </section>

                {/* All Anime */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Catálogo de Animes</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {animes.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        anime={anime}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Aniflex - Plataforma de Anime
          </p>
        </div>
      </footer>
    </main>
  )
}
