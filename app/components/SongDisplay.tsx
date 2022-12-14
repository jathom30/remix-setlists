import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { FlexList } from "./FlexList"
import { TempoIcons } from "./TempoIcons"
import { TextOverflow } from "./TextOverflow"

export const SongDisplay = ({ song }: { song: SerializeFrom<Song> }) => {
  const songKey = song.keyLetter ? `${song.keyLetter} ${song.isMinor ? 'Minor' : 'Major'}` : '--'
  return (
    <div className="w-full">
      <FlexList gap={0}>
        <TextOverflow className="font-bold">{song.name}</TextOverflow>
        <FlexList direction="row" justify="between" gap={2} wrap>
          <FlexList direction="row" gap={2} items="center">
            <span className="text-xs text-text-subdued whitespace-nowrap">
              {songKey} | {song.isCover ? 'Cover' : 'Original'} |
            </span>
            <TempoIcons tempo={song.tempo} />
          </FlexList>
          <span className="text-xs text-text-subdued whitespace-nowrap">
            {new Date(song.updatedAt).toLocaleDateString('en-us', { month: 'numeric', day: 'numeric', year: '2-digit' })}
          </span>
        </FlexList>
      </FlexList>
    </div>
  )
}