"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Anime } from "@/context/anime-context"

interface AnimeCardProps {
  anime: Anime
  onToggleFavorite?: (id: string) => void
}

export function AnimeCard({ anime, onToggleFavorite }: AnimeCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
      {/* Image Container */}
      <Link href={`/anime/${anime.id}`} className="block aspect-[2/3] relative overflow-hidden">
        <Image
          src={anime.imageUrl}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Rating Badge */}
        {anime.rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
            <span className="text-xs font-medium text-foreground">{anime.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Episode Count */}
        <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="text-xs font-medium text-primary-foreground">
            {anime.episodes.length} EP
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/anime/${anime.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 w-8 h-8"
            onClick={() => onToggleFavorite?.(anime.id)}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                anime.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              )}
            />
          </Button>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mt-2">
          {anime.categories.slice(0, 2).map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="text-xs px-2 py-0.5"
            >
              {category}
            </Badge>
          ))}
          {anime.categories.length > 2 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{anime.categories.length - 2}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
