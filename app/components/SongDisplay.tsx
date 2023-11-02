import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Badge } from "./Badge"
import { FlexList } from "./FlexList"
import { TempoIcons } from "./TempoIcons"
import { TextOverflow } from "./TextOverflow"

export const SongDisplay = ({ song, width }: { song: SerializeFrom<Song>; width?: 'full' | 'half' }) => {
  const songKey = song.keyLetter ? `${song.keyLetter} ${song.isMinor ? 'Minor' : 'Major'}` : '--'
  return (
    <div className={`@container flex flex-col grow ${width === 'full' ? `w-full` : ''} ${width === 'half' ? 'w-1/2' : ''}`}>
      <TextOverflow className="font-bold">{song.name}</TextOverflow>
      <FlexList direction="row" gap={2} items="center" wrap>
        {song.author ? <TextOverflow className="text-xs">{song.author}</TextOverflow> : null}
        <div className="hidden @xs:block">
          <TempoIcons tempo={song.tempo} />
        </div>
        <div className="hidden @xs:block">
          <Badge size="sm" kind="outline">{songKey}</Badge>
        </div>
        <div className="hidden @xs:block">
          {song.position === 'opener' ? <Badge size="sm" kind="info">Opener</Badge> : null}
          {song.position === 'closer' ? <Badge size="sm" kind="info">Closer</Badge> : null}
        </div>
      </FlexList>
    </div>
  )
}