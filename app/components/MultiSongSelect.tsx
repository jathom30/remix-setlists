import type { Song } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/server-runtime"
import { Form, useParams, useSearchParams } from "@remix-run/react"
import { FlexList } from "./FlexList"
import { Input } from "./Input"
import { Link } from "./Link"
import { SaveButtons } from "./SaveButtons"
import { SongDisplay } from "./SongDisplay"
import { FlexHeader } from "./FlexHeader"
import { MaxHeightContainer } from "./MaxHeightContainer"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export const MulitSongSelect = ({ songs, label }: { songs: SerializeFrom<Song[]>; label?: string }) => {

  const { setlistId, bandId } = useParams()
  const [params, setParams] = useSearchParams()
  const searchParam = params.get('query')
  const hasAvailableSongs = !searchParam ? songs.length > 0 : true

  if (!hasAvailableSongs) {
    return (
      <FlexList pad={4}>
        <h3 className="font-bold text-2xl">No available songs</h3>
        <p className="text-text-subdued text-sm">It looks like this setlist has used all your available songs.</p>
        <Link to={`/${bandId}/song/new`} kind="primary">Create a new song?</Link>
        <Link to="..">Cancel</Link>
      </FlexList>
    )
  }

  return (
    <Form method="put" action="." className="w-full h-full">
      <MaxHeightContainer
        fullHeight
        header={
          <div className="border-b border-slate-300 p-4 w-full">
            <FlexList gap={2}>
              <FlexHeader>
                {label ? <span>{label}</span> : null}
                <Link to={`/${bandId}/songs/new`} kind="secondary" icon={faPlus} isCollapsing isRounded>New song</Link>
              </FlexHeader>
              <Input name="query" placeholder="Search..." defaultValue={searchParam || ''} onChange={e => setParams({ query: e.target.value })} />
            </FlexList>
          </div>
        }
        footer={
          <SaveButtons
            saveLabel={label}
            cancelTo={`/${bandId}/setlists/edit/${setlistId}`}
          />
        }
      >
        {songs.map(song => (
          <label key={song.id} htmlFor={song.id} className="hover:bg-slate-200">
            <FlexList direction="row" gap={0}>
              <input id={song.id} value={song.id} type="checkbox" name="songs" className="ml-4" />
              <SongDisplay song={song} />
            </FlexList>
          </label>
        ))}
      </MaxHeightContainer>
    </Form>
  )
}