import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/server-runtime"
import { FlexList } from "./FlexList"
import { SongDisplay } from "./SongDisplay"
import { hoverAndFocusContainerStyles } from "~/styleUtils"

export const MulitSongSelect = ({ songs }: { songs: SerializeFrom<Song[]> }) => {
  return (
    <div className="bg-base-200 min-h-[12rem]">
      <FlexList pad={4} gap={2}>
        {songs.map(song => (
          <label key={song.id} htmlFor={song.id}>
            <div className={hoverAndFocusContainerStyles}>
              <FlexList direction="row" gap={4} items="center">
                <input id={song.id} value={song.id} type="checkbox" name="songs" className="checkbox checkbox-sm" />
                <SongDisplay song={song} width="half" />
              </FlexList>
            </div>
          </label>
        ))}
      </FlexList>
    </div>
  )
}