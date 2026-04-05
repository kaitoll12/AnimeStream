"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Info, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Anime } from "@/context/anime-context"

interface HeroSectionProps {
  anime: Anime
}

export function HeroSection({ anime }: HeroSectionProps) {
  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={anime.bannerUrl || anime.imageUrl}
          alt={anime.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-2xl">
          {/* Rating & Categories */}
          <div className="flex items-center gap-3 mb-4">
            {anime.rating && (
              <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-yellow-500">
                  {anime.rating.toFixed(1)}
                </span>
              </div>
            )}
            {anime.categories.slice(0, 3).map((cat) => (
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            {anime.title}
          </h1>

          {/* Synopsis */}
          <p className="text-muted-foreground text-lg mb-6 line-clamp-3 text-pretty">
            {anime.synopsis}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={
                anime.episodes.length > 0
                  ? `/watch/${anime.id}/${anime.episodes[0].id}`
                  : `/anime/${anime.id}`
              }
            >
              <Button size="lg" className="gap-2 px-8">
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Button>
            </Link>
            <Link href={`/anime/${anime.id}`}>
              <Button variant="outline" size="lg" className="gap-2 px-8">
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </Link>
          </div>

          {/* Episode Count */}
          <p className="mt-6 text-sm text-muted-foreground">
            {anime.episodes.length} Episodes Available
          </p>
        </div>
      </div>
    </section>
  )
}
