import { json } from '@remix-run/node'
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { useActionData, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { SaveButtons, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, SongForm, ErrorContainer, CatchContainer } from "~/components";
import { requireNonSubMember } from "~/session.server";
import { createFeel, getFeels } from '~/models/feel.server';
import { getFields } from '~/utils/form';
import type { Feel, Song } from '@prisma/client';
import { createSong } from '~/models/song.server';

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  return json({ feels })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const newFeel = formData.get('newFeel')

  if (newFeel && typeof newFeel === 'string') {
    return json({
      newFeel: await createFeel(newFeel, bandId)
    })
  }

  const { fields, errors } = getFields<SerializeFrom<Song & { feels: Feel['id'][] }>>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'length', type: 'number', isRequired: true },
    { name: 'keyLetter', type: 'string', isRequired: false },
    { name: 'isMinor', type: 'boolean', isRequired: false },
    { name: 'tempo', type: 'number', isRequired: true },
    { name: 'isCover', type: 'boolean', isRequired: false },
    { name: 'position', type: 'string', isRequired: true },
    { name: 'rank', type: 'string', isRequired: true },
    { name: 'note', type: 'string', isRequired: false },
  ])
  const feels = formData.getAll('feels')

  if (!Array.isArray(feels)) {
    return json({ errors: { feels: 'Invalid feels' } })
  }

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }

  const validFeels = feels.reduce((acc: string[], feelId) => {
    if (feelId.toString().length) {
      return [
        ...acc, feelId.toString()
      ]
    }
    return acc
  }, [])

  const song = await createSong(bandId, fields, validFeels)
  return redirect(`/${bandId}/songs/${song.id}`)
}

export default function NewSong() {
  const { feels } = useLoaderData<typeof loader>()
  const actionData = useActionData()
  const { bandId } = useParams()
  const fetcher = useFetcher<typeof action>()

  const handleCreateFeel = (newFeel: string) => {
    fetcher.submit({ newFeel }, { method: 'post' })
  }

  return (
    <fetcher.Form method="post" className='h-full'>
      <MaxHeightContainer
        fullHeight
        header={
          <RouteHeader
            mobileChildren={<RouteHeaderBackLink label='New song' />}
            desktopChildren={
              <RouteHeaderBackLink label='New song' invert={false} />
            }
          />
        }
        footer={
          <SaveButtons saveLabel="Create song" cancelTo={`/${bandId}/songs`} />
        }
      >
        <SongForm
          feels={feels}
          song={{
            position: 'other',
            rank: 'no_preference'
          }}
          errors={actionData?.errors}
          onCreateFeel={handleCreateFeel}
        />
      </MaxHeightContainer>
    </fetcher.Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}