import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Form, Outlet, useLoaderData, useLocation, useNavigate, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CreateNewButton, FlexList, Input, Link, MaxHeightContainer, MobileModal, RouteHeader, RouteHeaderBackLink, SetlistLink, Title } from "~/components";
import { getSetlists } from "~/models/setlist.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faSort } from "@fortawesome/free-solid-svg-icons";
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

  const setlists = await getSetlists(bandId, filterParams)

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
  const submit = useSubmit()
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
        <>
          <RouteHeader
            mobileChildren={<RouteHeaderBackLink label="Setlists" to={`/${bandId}/home`} />}
            desktopChildren={<Title>Setlists</Title>}
            desktopAction={<Link to="new" kind="primary">New setlist</Link>}
          />
          <div className="border-b border-slate-300 w-full">
            <FlexList pad={4} gap={4}>
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
              </FlexList>
            </FlexList>
          </div>
        </>
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
      <FlexList height="full">
        {hasSetlists ? (
          <div className="flex flex-col sm:gap-2 sm:p-2">
            {setlists.map(setlist => (
              <div key={setlist.id} className="sm:rounded sm:overflow-hidden sm:shadow">
                <SetlistLink setlist={setlist} />
              </div>
            ))}
          </div>
        ) : (
          <FlexList pad={4}>
            <FontAwesomeIcon icon={faBoxOpen} size="3x" />
            <p className="text-center">Looks like this band doesn't have any setlists yet.</p>
            <Link to="new" kind="primary">Create your first setlist</Link>
          </FlexList>
        )}
      </FlexList>
    </MaxHeightContainer>
  )
}
