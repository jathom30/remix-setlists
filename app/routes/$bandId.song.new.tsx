import { json } from '@remix-run/node'
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/server-runtime";
import { isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";
import invariant from "tiny-invariant";
import { MaxHeightContainer, ErrorContainer, CatchContainer, Breadcrumbs, Navbar, FlexHeader, AvatarTitle, MobileMenu } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { getFeels } from '~/models/feel.server';
import { SongNew } from '~/routes/resource.songNew';

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  return json({ feels })
}

export const meta: V2_MetaFunction = () => ([{
  title: 'New song'
}]);

export default function NewSong() {
  const { feels } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <>
          <Navbar>
            <FlexHeader>
              <AvatarTitle title="New" />
              <MobileMenu />
            </FlexHeader>
          </Navbar>
          <Navbar shrink>
            <Breadcrumbs breadcrumbs={[
              { label: 'Songs', to: `/${bandId}/songs` },
              { label: 'New', to: '.' },
            ]} />
          </Navbar>
        </>
      }
    >
      <SongNew feels={feels} cancelTo={`/${bandId}/songs`} />
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