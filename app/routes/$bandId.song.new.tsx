import { json } from '@remix-run/node'
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { useLoaderData, useParams } from "@remix-run/react";
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

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}