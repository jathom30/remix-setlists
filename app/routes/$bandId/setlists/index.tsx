import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node"
import { Form, useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { CreateNewButton, FlexList, Input, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SetlistLink } from "~/components";
import { getMemberRole } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";
import { roleEnums } from "~/utils/enums";
import { getSetlists } from "~/models/setlist.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  const url = new URL(request.url)
  const q = url.searchParams.get('query')

  const role = await getMemberRole(bandId, userId)

  const filterParams = {
    ...(q ? { q } : null)
  }

  const setlists = await getSetlists(bandId, filterParams)

  return json({ setlists, isSub: role === roleEnums.sub })
}

export default function SetlistsRoute() {
  const { setlists, isSub } = useLoaderData<typeof loader>()
  const [params, setParams] = useSearchParams()
  const { bandId } = useParams()
  const searchParam = params.get('query')
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label="Setlists" to={`/${bandId}/home`} />
        </RouteHeader>
      }
      footer={!isSub ? <CreateNewButton to="new" /> : null}
    >
      <FlexList height="full">
        <div className="border-b border-slate-300 w-full">
          <FlexList pad={4} gap={2}>
            <Form action="." className="w-full">
              <Input name="query" placeholder="Search..." defaultValue={searchParam || ''} onChange={e => setParams({ query: e.target.value })} />
            </Form>
          </FlexList>
        </div>
        <FlexList gap={0}>
          {setlists.map(setlist => (
            <SetlistLink key={setlist.id} setlist={setlist} />
          ))}
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}
