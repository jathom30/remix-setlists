import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { SongDisplay } from "./SongDisplay"

export const SongLink = ({ song }: { song: SerializeFrom<Song> }) => {
  return (
    <Link
      to={`/${song.bandId}/songs/${song.id}`}
      prefetch="intent"
    >
      <SongDisplay song={song} />
    </Link>
  )
}