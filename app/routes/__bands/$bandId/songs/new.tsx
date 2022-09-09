import { json } from '@remix-run/node'
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { Form, useActionData, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { FlexList, SongForm } from "~/components";
import { requireUserId } from "~/session.server";
import { getFeels } from '~/models/feel.server';
import { getFields } from '~/utils/form';
import type { Feel, Song } from '@prisma/client';
import { createSong } from '~/models/song.server';

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const feels = await getFeels(bandId)
  return json({ feels })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { bandId } = params
  const formData = await request.formData()

  invariant(bandId, 'bandId not found')

  const { fields, errors } = getFields<SerializeFrom<Song & { feels: Feel['id'][] }>>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'length', type: 'number', isRequired: true },
    { name: 'keyLetter', type: 'string', isRequired: false },
    { name: 'isMinor', type: 'boolean', isRequired: false },
    { name: 'tempo', type: 'number', isRequired: true },
    // { name: 'feels', type: 'array', isRequired: false },
    { name: 'isCover', type: 'boolean', isRequired: false },
    { name: 'position', type: 'string', isRequired: true },
    { name: 'rank', type: 'string', isRequired: true },
    { name: 'note', type: 'string', isRequired: false },
  ])

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }

  const song = await createSong(bandId, fields)
  return redirect(`/${bandId}/songs/${song.id}`)
}

export default function NewSong() {
  const { feels } = useLoaderData<typeof loader>()
  const actionData = useActionData()
  const { bandId } = useParams()
  return (
    <FlexList pad={4}>
      <h1 className="font-bold text-3xl">New Song</h1>
      <Form method="post">
        <SongForm
          feels={feels}
          song={{
            position: 'other',
            rank: 'no_preference'
          }}
          errors={actionData?.errors}
          cancelTo={`/${bandId}`}
        />
      </Form>
    </FlexList>
  )
}