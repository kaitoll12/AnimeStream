"use client"

import { useState, useMemo } from "react"
import { useAnime } from "@/context/anime-context"
import { Navbar } from "@/components/navbar"
import { AnimeCard } from "@/components/anime-card"
import { CategoryFilter } from "@/components/category-filter"
import { Layers } from "lucide-react"

const ALL_CATEGORIES = [
  "All",
  "Action",
  "Romance",
  "Shonen",
  "Drama",
  "Fantasy",
  "Supernatural",
  "Adventure",
  "School",
]

export default function CategoriesPage() {
  const { animes, toggleFavorite, filterByCategory } = useAnime()
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredAnimes = useMemo(() => {
    return filterByCategory(selectedCategory)
  }, [selectedCategory, filterByCategory])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-36 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Layers className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Browse Categories</h1>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={ALL_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAnimes.length} anime
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

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
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No anime in this category
            </h2>
            <p className="text-muted-foreground">
              Try selecting a different category.
            </p>
          </div>
        )}
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
