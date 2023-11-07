import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import type { LoaderArgs, V2_MetaFunction, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useLocation, useRouteError } from "@remix-run/react";
import pluralize from "pluralize";
import invariant from "tiny-invariant";
import { CatchContainer, Divider, ErrorContainer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, MaxWidth, Navbar, Title } from "~/components";
import { getPublicSetlist } from "~/models/setlist.server";

export async function loader({ request }: LoaderArgs) {
  const urlSearchParams = (new URL(request.url)).searchParams
  const setlistId = urlSearchParams.get('setlistId')
  invariant(setlistId, 'setlistId not found')

  const setlist = await getPublicSetlist(setlistId)
  return json({ setlist })
}

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
  if (!data) {
    return [{
      title: "Setlist",
    }]
  }
  const { setlist: { name } } = data
  return [{ title: name }]
};

export default function PublicSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { search } = useLocation()
  const urlSearchParams = new URLSearchParams(search)
  const setlistId = urlSearchParams.get('setlistId')
  const bandId = urlSearchParams.get('bandId')

  const setLength = (set: SerializeFrom<typeof setlist['sets']>[number]) => set.songs.reduce((acc, song) => acc += song.song?.length || 0, 0)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>{setlist.name}</Title>
            <Link to={`/${bandId}/setlist/${setlistId}`} icon={faEllipsisV} isCollapsing kind="ghost">Details</Link>
          </FlexHeader>
        </Navbar>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          {setlist.sets.map(set => (
            <div key={set.id}>
              <Label>Set {set.positionInSetlist + 1} - {pluralize('minutes', setLength(set), true)}</Label>
              <FlexList gap={0}>
                <ul>
                  {set.songs.map(song => (
                    <li key={song.songId}>{song.positionInSet + 1}. {song.song?.name}</li>
                  ))}
                </ul>
                <Divider />
              </FlexList>
            </div>
          ))}
        </FlexList>
      </MaxWidth>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return (
      <ErrorContainer error={error as Error} />
    )
  }
  return <CatchContainer status={error.status} data={error.data} />
}