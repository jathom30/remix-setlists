import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Form, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CreateNewButton, FlexList, Input, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SetlistLink } from "~/components";
import { getSetlists } from "~/models/setlist.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request, params }: LoaderArgs) {
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const filterParams = {
    ...(q ? { q } : null)
  }

  const setlists = await getSetlists(bandId, filterParams)

  return json({ setlists })
}

export default function SetlistsRoute() {
  const { setlists } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const [params, setParams] = useSearchParams()
  const { bandId } = useParams()
  const searchParam = params.get('query')

  const hasSetlists = setlists.length && searchParam === ''
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label="Setlists" to={`/${bandId}/home`} />
        </RouteHeader>
      }
      footer={(!isSub && hasSetlists) ? <CreateNewButton to="new" /> : null}
    >
      <FlexList height="full">
        <div className="border-b border-slate-300 w-full">
          <FlexList pad={4} gap={2}>
            <Form action="." className="w-full">
              <Input name="query" placeholder="Search..." defaultValue={searchParam || ''} onChange={e => setParams({ query: e.target.value })} />
            </Form>
          </FlexList>
        </div>
        {hasSetlists ? (
          <FlexList gap={0}>
            {setlists.map(setlist => (
              <SetlistLink key={setlist.id} setlist={setlist} />
            ))}
          </FlexList>
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
