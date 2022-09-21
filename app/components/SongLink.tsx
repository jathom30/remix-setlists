import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { FlexList } from "./FlexList"
import { TempoIcons } from "./TempoIcons"

export const SongLink = ({ song }: { song: SerializeFrom<Song> }) => {
  return (
    <Link className="hover:bg-slate-200 w-full" to={`/${song.bandId}/songs/${song.id}`}>
      <FlexList pad={{ x: 4, y: 2 }} gap={0}>
        <span className="font-bold">{song.name}</span>
        <FlexList direction="row" justify="between">
          <FlexList direction="row" gap={2} items="center">
            <span className="text-xs text-text-subdued whitespace-nowrap">{song.keyLetter} {song.isMinor ? 'Minor' : 'Major'} - {song.isCover ? 'Cover' : 'Original'}</span>
            <TempoIcons tempo={song.tempo} />
          </FlexList>
          <span className="text-xs text-text-subdued whitespace-nowrap">{new Date(song.updatedAt).toDateString()}</span>
        </FlexList>
      </FlexList>
    </Link>
  )
}