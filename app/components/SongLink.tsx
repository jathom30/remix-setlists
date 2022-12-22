import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link, useLocation } from "@remix-run/react"
import { SongDisplay } from "./SongDisplay"

export const SongLink = ({ song }: { song: SerializeFrom<Song> }) => {
  const { pathname } = useLocation()
  return (
    <div className="hover:bg-slate-200 sm:bg-white">
      <Link
        to={`/${song.bandId}/song/${song.id}`}
        state={pathname}
        prefetch="intent"
      >
        <SongDisplay song={song} />
      </Link>
    </div>
  )
}