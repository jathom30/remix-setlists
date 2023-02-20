import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { Form, Outlet, useLoaderData, useLocation, useNavigate, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import { AvatarTitle, CatchContainer, CreateNewButton, ErrorContainer, FlexHeader, FlexList, Link, MaxHeightContainer, MaxWidth, MobileMenu, MobileModal, Navbar, SearchInput, SongLink } from "~/components";
import { faBoxOpen, faFilter, faSort } from "@fortawesome/free-solid-svg-icons";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sortByLabel } from "~/utils/params";
import { useState } from "react";
import { deleteUnneededClonedSetlists } from "~/models/setlist.server";

export const meta: MetaFunction = () => ({
  title: "Songs",
});

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

  const [songs] = await Promise.all([getSongs(bandId, songParams), deleteUnneededClonedSetlists(bandId)])

  return json({ songs })
}

const subRoutes = ['sortBy', 'filters']

export default function SongsList() {
  const { songs } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const submit = useSubmit()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('query'))
  const hasParams = [...searchParams.keys()].filter(key => key !== 'query' && key !== 'sort').length > 0
  const { bandId } = useParams()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const hasSongs = songs.length

  const sortBy = sortByLabel(searchParams)

  const handleClearQuery = () => {
    setQuery('')
    setSearchParams({})
  }

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <AvatarTitle title="Songs" />
            <MobileMenu />
            {!isSub ? (
              <div className="hidden sm:block">
                <Link to={`/${bandId}/song/new`} kind="primary">New song</Link>
              </div>
            ) : null}
          </FlexHeader>
        </Navbar>
      }
      footer={
        <>
          {(!isSub && hasSongs) ? <CreateNewButton to={`/${bandId}/song/new`} ariaLabel="New song" /> : null}
          <MobileModal
            open={subRoutes.some(path => pathname.includes(path))}
            onClose={() => navigate({ pathname: `/${bandId}/songs`, search })}
          >
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <MaxHeightContainer
        fullHeight
        header={
          <MaxWidth>
            <FlexList pad="md" gap="md">
              <Form method="get" onChange={e => submit(e.currentTarget)}>
                <SearchInput value={query} onClear={handleClearQuery} onChange={e => setQuery(e.target.value)} />
              </Form>
              <FlexList direction="row" items="center" justify="end" gap="sm">
                <Link to={{ pathname: 'sortBy', search: searchParams.toString() }} isOutline icon={faSort}>
                  <FlexList direction="row" gap="sm">
                    <span>Sort by:</span>
                    <span>{sortBy}</span>
                  </FlexList>
                </Link>
                <div className="indicator">
                  {hasParams ? <div className="indicator-item badge badge-secondary" /> : null}
                  <Link to={{ pathname: 'filters', search: searchParams.toString() }} kind="secondary" isCollapsing isOutline icon={faFilter}>Filters</Link>
                </div>
              </FlexList>
            </FlexList>
          </MaxWidth>
        }
      >
        <MaxWidth>
          <FlexList height="full">
            {hasSongs ? (
              <FlexList pad="md" gap="sm">
                {songs.map(song => (
                  <SongLink key={song.id} song={song} />
                ))}
              </FlexList>
            ) : (
              <FlexList pad="md">
                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                <p className="text-center">Looks like this band doesn't have any songs yet.</p>
                {!isSub ? <Link to={`/${bandId}/song/new`} kind="primary">Create your first song</Link> : null}
              </FlexList>
            )}
          </FlexList>
        </MaxWidth>
      </MaxHeightContainer>
    </MaxHeightContainer>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}