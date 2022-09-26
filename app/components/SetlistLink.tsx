import type { Setlist, Set } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"
import { Link, useParams } from "@remix-run/react"
import { FlexList } from "./FlexList"

const setCount = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

export const SetlistLink = ({ setlist }: { setlist: SerializeFrom<Setlist & { sets: Set[] }> }) => {
  const { bandId } = useParams()

  const getDisplaySetLength = Math.ceil(setlist.sets.reduce((total, set) => {
    return total += set.length
  }, 0) / setlist.sets.length)

  return (
    <Link className="hover:bg-slate-200" to={`/${bandId}/setlists/${setlist.id}`} prefetch="intent">
      <FlexList pad={{ x: 4, y: 2 }} gap={0}>
        <span className="font-bold">{setlist.name}</span>
        <FlexList direction="row" justify="between">
          <span className="text-xs text-text-subdued">{setCount[setlist.sets.length]} {getDisplaySetLength} minute set(s)</span>
          <span className="text-xs text-text-subdued whitespace-nowrap">{new Date(setlist.updatedAt).toDateString()}</span>
        </FlexList>
      </FlexList>
    </Link>
  )
}