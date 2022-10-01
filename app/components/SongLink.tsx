import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link, useLocation } from "@remix-run/react"
import { SongDisplay } from "./SongDisplay"

export const SongLink = ({ song }: { song: SerializeFrom<Song> }) => {
  const { pathname } = useLocation()
  return (
    <Link
      to={`/${song.bandId}/songs/${song.id}`}
      state={pathname}
      prefetch="intent"
    >
      <SongDisplay song={song} />
    </Link>
  )
}