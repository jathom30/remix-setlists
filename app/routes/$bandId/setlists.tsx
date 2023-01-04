import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Form, Outlet, useLoaderData, useLocation, useNavigate, useParams, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CreateNewButton, FlexHeader, FlexList, Input, Link, MaxHeightContainer, MaxWidth, MobileModal, Navbar, SetlistLink, Title } from "~/components";
import { getSetlists } from "~/models/setlist.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faMagnifyingGlass, faSort } from "@fortawesome/free-solid-svg-icons";
import { getSortFromParam } from "~/utils/params";
import { capitalizeFirstLetter } from "~/utils/assorted";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')

  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const sort = url.searchParams.get('sort')

  const filterParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
  }

  const setlists = (await getSetlists(bandId, filterParams))
    // ! filtering right now incase a user navigates away from editing a setlist (creating a temp clone in the process)
    // ! in the future, we should have a hook to warn users before navigating away from the edit process
    .filter(setlist => !setlist.editedFromId)

  return json({ setlists })
}

const subRoutes = ['sortBy', 'filters']

export default function SetlistsRoute() {
  const { setlists } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const [params] = useSearchParams()
  const { bandId } = useParams()
  const query = params.get('query')
  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const hasSetlists = setlists.length

  const sortByLabel = () => {
    const sortObject = getSortFromParam(params.get('sort') ?? undefined)
    const [entry] = Object.entries(sortObject)
    // probably not the best solution, but removes At from createdAt and updatedAt keys
    const sort = capitalizeFirstLetter(entry[0]).replace('At', '')
    const direction = () => {
      switch (sort.toLowerCase()) {
        case 'name':
          return entry[1] === 'asc' ? 'A-Z' : 'Z-A'
        case 'tempo':
          return entry[1] === 'asc' ? 'slow-fast' : 'fast-slow'
        case 'updated':
          return entry[1] === 'asc' ? 'oldest first' : 'newest first'
        case 'created':
          return entry[1] === 'asc' ? 'oldest first' : 'newest first'
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
        <Navbar>
          <FlexHeader>
            <Title>Setlists</Title>
            {!isSub ? (
              <div className="hidden sm:block">
                <Link to={`/${bandId}/setlist/new`} kind="primary">New setlist</Link>
              </div>
            ) : null}
          </FlexHeader>
        </Navbar>
      }
      footer={
        <>
          {(!isSub && hasSetlists) ? <CreateNewButton to={`/${bandId}/setlist/new`} /> : null}
          <MobileModal
            open={subRoutes.some(path => pathname.includes(path))}
            onClose={() => navigate({ pathname: `/${bandId}/setlists`, search })}
          >
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <MaxWidth>
        <MaxHeightContainer
          fullHeight
          header={
            <FlexList pad={4} gap={4}>
              <Form method="get">
                <div className="input-group">
                  <Input name="query" placeholder="Search..." defaultValue={query || ''} />
                  <button type="submit" className="btn btn-square">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>
              </Form>
              <FlexList direction="row" items="center" justify="end" gap={2}>
                <Link to={{ pathname: 'sortBy', search: params.toString() }} isOutline icon={faSort}>
                  <FlexList direction="row" gap={2}>
                    <span>Sort by:</span>
                    <span>{sortByLabel()}</span>
                  </FlexList>
                </Link>
              </FlexList>
            </FlexList>
          }
        >
          <FlexList height="full">
            {hasSetlists ? (
              <FlexList pad={4} gap={2}>
                {setlists.map(setlist => (
                  <SetlistLink key={setlist.id} setlist={setlist} />
                ))}
              </FlexList>
            ) : (
              <FlexList pad={4}>
                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                <p className="text-center">Looks like this band doesn't have any setlists yet.</p>
                <Link to={`/${bandId}/setlist/new`} kind="primary">Create your first setlist</Link>
              </FlexList>
            )}
          </FlexList>
        </MaxHeightContainer>
      </MaxWidth>
    </MaxHeightContainer>
  )
}
