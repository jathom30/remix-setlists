import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { Form, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { Button, CreateNewButton, Drawer, FlexList, Input, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongFilters, SongLink } from "~/components";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { getMemberRole } from "~/models/usersInBands.server";
import { roleEnums } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const role = await getMemberRole(bandId, userId)

  const songParams = {
    ...(q ? { q } : null)
  }

  const songs = await getSongs(bandId, songParams)

  return json({ songs, isSub: role === roleEnums.sub })
}

export default function SongsList() {
  const { songs, isSub } = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()
  const searchParam = params.get('query')
  const { bandId } = useParams()

  const [showFilters, setShowFilters] = useState(false)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label="Songs" to={`/${bandId || ''}/home`} />
        </RouteHeader>
      }
      footer={
        <>
          {!isSub ? <CreateNewButton to="new" /> : null}
          <Drawer
            open={showFilters}
            onClose={() => setShowFilters(false)}
          >
            <SongFilters />
          </Drawer>
        </>
      }
    >
      <FlexList height="full">
        <div className="border-b border-slate-300 w-full">
          <FlexList pad={4} gap={2}>
            <Form action="." className="w-full">
              <Input name="query" placeholder="Search..." defaultValue={searchParam || ''} onChange={e => setParams({ query: e.target.value })} />
            </Form>
            <div className="self-end">
              <Button onClick={() => setShowFilters(true)} kind="secondary" icon={faFilter}>Filters</Button>
            </div>
          </FlexList>
        </div>
        <FlexList gap={0}>
          {songs.map(song => (
            <SongLink key={song.id} song={song} />
          ))}
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}