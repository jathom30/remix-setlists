import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { Form, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { Button, CreateNewButton, Drawer, FlexList, Input, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongFilters, SongLink } from "~/components";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import { getFeels } from "~/models/feel.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams.entries())
  const q = url.searchParams.get('query')
  const feelParams = url.searchParams.getAll('feels')
  const tempoParams = url.searchParams.getAll('tempos')
  const isCoverParam = url.searchParams.get('isCover')
  const positionParams = url.searchParams.getAll('positions')

  const isCover = isCoverParam === 'isCover' ? true : isCoverParam === 'isOriginal' ? false : undefined

  const songParams = {
    ...(q ? { q } : null),
    ...(feelParams ? { feels: feelParams } : null),
    ...(tempoParams ? { tempos: tempoParams.map(tempo => parseInt(tempo)) } : null),
    ...(isCover !== undefined ? { isCover } : null),
    ...(positionParams ? { positions: positionParams } : null),
  }

  const [feels, songs] = await Promise.all([getFeels(bandId), getSongs(bandId, songParams)])

  return json({ songs, feels, searchParams })
}

export default function SongsList() {
  const { songs, feels, searchParams } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const [params, setParams] = useSearchParams()
  const hasParams = [...params.keys()].filter(key => key !== 'query').length > 0
  const query = params.get('query')
  const { bandId } = useParams()
  const formRef = useRef<HTMLFormElement>(null)

  const [showFilters, setShowFilters] = useState(false)

  const onParamChange = (param: string, value: string | string[]) => {
    setParams({
      ...searchParams,
      [param]: value
    })
  }


  return (
    <Form ref={formRef} className="w-full h-full">
      <MaxHeightContainer
        fullHeight
        header={
          <RouteHeader>
            <RouteHeaderBackLink label="Songs" to={`/${bandId}/home`} />
          </RouteHeader>
        }
        footer={
          <>
            {!isSub ? <CreateNewButton to="new" /> : null}
            <Drawer
              open={showFilters}
              onClose={() => setShowFilters(false)}
            >
              <SongFilters
                filters={params}
                onChange={onParamChange}
                feels={feels}
                onClearAll={() => setParams({})}
              />
            </Drawer>
          </>
        }
      >
        <FlexList height="full">
          <div className="border-b border-slate-300 w-full">
            <FlexList pad={4} gap={2}>
              <Input name="query" placeholder="Search..." defaultValue={query || ''} onChange={e => onParamChange('query', e.target.value)} />
              <div className="relative self-end">
                <Button onClick={() => setShowFilters(true)} kind="secondary" icon={faFilter}>Filters</Button>
                {hasParams ? <div className="w-2 h-2 top-1 right-1 bg-red-600 rounded-full absolute" /> : null}
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
    </Form>
  )
}