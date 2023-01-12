import { json } from '@remix-run/node'
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { MaxHeightContainer, ErrorContainer, CatchContainer, Breadcrumbs, Navbar, FlexHeader, AvatarTitle, FlexList } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { getFeels } from '~/models/feel.server';
import { SongNew } from '~/routes/resource/songNew';

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  return json({ feels })
}

export const meta: MetaFunction = () => ({
  title: 'New song'
});

export default function NewSong() {
  const { feels } = useLoaderData<typeof loader>()
  const { bandId } = useParams()

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <FlexList gap={2}>
              <AvatarTitle title="New" />
              <Breadcrumbs breadcrumbs={[
                { label: 'Songs', to: `/${bandId}/songs` },
                { label: 'New', to: '.' },
              ]} />
            </FlexList>
          </FlexHeader>
        </Navbar>
      }
    >
      <SongNew feels={feels} cancelTo={`/${bandId}/songs`} />
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}