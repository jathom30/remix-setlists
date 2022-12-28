import type { Setlist, Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link, useLocation, useParams } from "@remix-run/react"
import { FlexList } from "./FlexList"

const setCount = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

export const SetlistLink = ({ setlist }: { setlist: SerializeFrom<Setlist & { sets: { songs: { song: { length: Song['length'] } }[] }[] }> }) => {
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const getDisplaySetLength = Math.ceil(setlist.sets.reduce((total, set) => {
    const setLength = set.songs.reduce((total, song) => total += song.song.length, 0)
    return total += setLength
  }, 0) / setlist.sets.length)

  return (
    <div className="hover:bg-slate-200 sm:bg-white">
      <Link
        className="hover:bg-slate-200"
        to={`/${bandId}/setlist/${setlist.id}`}
        prefetch="intent"
        state={pathname}
      >
        <FlexList pad={{ x: 4, y: 2 }} gap={0}>
          <span className="font-bold">{setlist.name}</span>
          <FlexList direction="row" justify="between">
            <span className="text-xs text-text-subdued">{setCount[setlist.sets.length]} {getDisplaySetLength} minute set(s)</span>
            <span className="text-xs text-text-subdued whitespace-nowrap">{new Date(setlist.updatedAt).toDateString()}</span>
          </FlexList>
        </FlexList>
      </Link>
    </div>
  )
}