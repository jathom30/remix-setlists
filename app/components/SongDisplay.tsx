import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Badge } from "./Badge"
import { FlexList } from "./FlexList"
import { TempoIcons } from "./TempoIcons"
import { TextOverflow } from "./TextOverflow"

export const SongDisplay = ({ song, width }: { song: SerializeFrom<Song>; width?: 'full' | 'half' }) => {
  const songKey = song.keyLetter ? `${song.keyLetter} ${song.isMinor ? 'Minor' : 'Major'}` : '--'
  return (
    <FlexList gap={0} grow width={width}>
      <TextOverflow className="font-bold">{song.name}</TextOverflow>
      <FlexList direction="row" justify="between" gap={2} wrap>
        <FlexList direction="row" gap={2} items="center" wrap>
          {song.author ? <span className="text-xs">{song.author}</span> : null}
          <TempoIcons tempo={song.tempo} />
          <Badge size="sm" kind="outline">{songKey}</Badge>
          {song.position === 'opener' ? <Badge size="sm" kind="info">Opener</Badge> : null}
          {song.position === 'closer' ? <Badge size="sm" kind="info">Closer</Badge> : null}
        </FlexList>
        <span className="text-xs text-text-subdued whitespace-nowrap">
          {new Date(song.updatedAt).toLocaleDateString('en-us', { month: 'numeric', day: 'numeric', year: '2-digit' })}
        </span>
      </FlexList>
    </FlexList>
  )
}