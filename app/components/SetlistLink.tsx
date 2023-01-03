import type { Setlist, Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link, useLocation, useParams } from "@remix-run/react"
import { FlexHeader } from "./FlexHeader"
import { FlexList } from "./FlexList"
import { Label } from "./Label"

const setCount = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

export const SetlistLink = ({ setlist }: { setlist: SerializeFrom<Setlist & { sets: { songs: { song: { length: Song['length'] } }[] }[] }> }) => {
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const getDisplaySetLength = Math.ceil(setlist.sets.reduce((total, set) => {
    const setLength = set.songs.reduce((total, song) => total += song.song.length, 0)
    return total += setLength
  }, 0) / setlist.sets.length)

  return (
    <Link
      to={`/${bandId}/setlist/${setlist.id}`}
      prefetch="intent"
      state={pathname}
    >
      <div className="bg-neutral p-2 rounded hover:bg-neutral-focus">
        <FlexList gap={0}>
          <FlexHeader>
            <span className="font-bold">{setlist.name}</span>
            <Label>Last updated:</Label>
          </FlexHeader>
          <FlexHeader>
            <span className="text-xs">{setCount[setlist.sets.length]} {getDisplaySetLength} minute set(s)</span>
            <span className="text-xs whitespace-nowrap">{new Date(setlist.updatedAt).toDateString()}</span>
          </FlexHeader>
        </FlexList>
      </div>
    </Link>
  )
}