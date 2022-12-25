import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { Form, Outlet, useLoaderData, useLocation, useNavigate, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import { CreateNewButton, FlexList, Input, Link, MaxHeightContainer, MobileModal, RouteHeader, RouteHeaderBackLink, SongLink, Title } from "~/components";
import { faBoxOpen, faFilter, faSort } from "@fortawesome/free-solid-svg-icons";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getSortFromParam } from "~/utils/params";
import { capitalizeFirstLetter } from "~/utils/assorted";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const sort = url.searchParams.get('sort')
  const feelParams = url.searchParams.getAll('feels')
  const tempoParams = url.searchParams.getAll('tempos')
  const isCoverParam = url.searchParams.get('isCover')
  const positionParams = url.searchParams.getAll('positions')

  const songParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
    feels: feelParams,
    tempos: tempoParams.map(tempo => parseInt(tempo)),
    ...(isCoverParam ? { isCover: isCoverParam === 'true' } : null),
    positions: positionParams,
  }

  const songs = await getSongs(bandId, songParams)

  return json({ songs })
}

const subRoutes = ['sortBy', 'filters']

export default function SongsList() {
  const { songs } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const [params] = useSearchParams()
  const hasParams = [...params.keys()].filter(key => key !== 'query' && key !== 'sort').length > 0
  const query = params.get('query')
  const { bandId } = useParams()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const hasSongs = songs.length

  const sortByLabel = () => {
    const sortObject = getSortFromParam(params.get('sort') ?? undefined)
    const [entry] = Object.entries(sortObject)
    const sort = capitalizeFirstLetter(entry[0])
    const direction = () => {
      switch (sort.toLowerCase()) {
        case 'name':
          return entry[1] === 'asc' ? 'A-Z' : 'Z-A'
        case 'tempo':
          return entry[1] === 'asc' ? 'slow-fast' : 'fast-slow'
        default:
          return ''
      }
    }
    return `${sort} ${direction()}`
  }

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <>
          <RouteHeader
            mobileChildren={
              <RouteHeaderBackLink label="Songs" to={`/${bandId}/home`} />
            }
            desktopChildren={<Title>Songs</Title>}
            desktopAction={<Link to={`/${bandId}/song/new`} kind="primary">New song</Link>}
          />
          <FlexList pad={4} gap={2}>
            <Form method="get" onChange={e => submit(e.currentTarget)}>
              <Input name="query" placeholder="Search..." defaultValue={query || ''} />
            </Form>
            <FlexList direction="row" items="center" justify="end" gap={2}>
              <Link to={{ pathname: 'sortBy', search: params.toString() }} kind="secondary" icon={faSort}>
                <FlexList direction="row" gap={2}>
                  <span>Sort by:</span>
                  <span>{sortByLabel()}</span>
                </FlexList>
              </Link>
              <div className="relative">
                <Link to={{ pathname: 'filters', search: params.toString() }} kind="secondary" icon={faFilter}>Filters</Link>
                {hasParams ? <div className="w-2 h-2 top-1 right-1 bg-red-600 rounded-full absolute" /> : null}
              </div>
            </FlexList>
          </FlexList>
        </>
      }
      footer={
        <>
          {(!isSub && hasSongs) ? <CreateNewButton to={`/${bandId}/song/new`} /> : null}
          <MobileModal
            open={subRoutes.some(path => pathname.includes(path))}
            onClose={() => navigate({ pathname: `/${bandId}/songs`, search })}
          >
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <FlexList height="full">
        <div className="border-b border-slate-300 w-full">

        </div>
        {hasSongs ? (
          <div className="flex flex-col sm:gap-2 sm:p-2">
            {songs.map(song => (
              <div key={song.id} className="sm:rounded sm:overflow-hidden sm:shadow">
                <SongLink song={song} />
              </div>
            ))}
          </div>
        ) : (
          <FlexList pad={4}>
            <FontAwesomeIcon icon={faBoxOpen} size="3x" />
            <p className="text-center">Looks like this band doesn't have any songs yet.</p>
            <Link to="new" kind="primary">Create your first song</Link>
          </FlexList>
        )}
      </FlexList>
    </MaxHeightContainer>
  )
}