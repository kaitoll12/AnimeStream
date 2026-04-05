"use client"

import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Episode } from "@/context/anime-context"

interface EpisodeCardProps {
  episode: Episode
  animeId: string
  animeTitle: string
  isActive?: boolean
}

export function EpisodeCard({ episode, animeId, animeTitle, isActive }: EpisodeCardProps) {
  return (
    <Link
      href={`/watch/${animeId}/${episode.id}`}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
        isActive
          ? "bg-primary/10 border-primary"
          : "bg-card border-border hover:border-primary/50 hover:bg-secondary/50"
      )}
    >
      {/* Episode Number */}
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          isActive ? "bg-primary" : "bg-secondary group-hover:bg-primary"
        )}
      >
        <Play
          className={cn(
            "w-5 h-5 fill-current ml-0.5",
            isActive
              ? "text-primary-foreground"
              : "text-foreground group-hover:text-primary-foreground"
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">
          Episode {episode.number}
        </p>
        <h4 className="font-medium text-foreground truncate">
          {episode.title || `${animeTitle} - Episode ${episode.number}`}
        </h4>
      </div>

      {/* Duration placeholder */}
      <span className="text-xs text-muted-foreground shrink-0">24 min</span>
    </Link>
  )
}
