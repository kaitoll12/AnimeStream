"use client"

import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Anime, Episode } from "@/context/anime-context"

interface LatestEpisodeCardProps {
  anime: Anime
  episode: Episode
}

export function LatestEpisodeCard({ anime, episode }: LatestEpisodeCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
      {/* Image Container */}
      <Link href={`/watch/${anime.id}/${episode.id}`} className="block aspect-video relative overflow-hidden">
        <Image
          src={episode.thumbnail || anime.bannerUrl || anime.imageUrl}
          alt={`${anime.title} - Episodio ${episode.number}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Episode Number Badge */}
        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="text-xs font-bold text-primary-foreground">
            EP {episode.number}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link href={`/watch/${anime.id}/${episode.id}`} className="block min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-sm">
            {anime.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {episode.title || `Episodio ${episode.number}`}
          </p>
        </Link>
      </div>
    </div>
  )
}
