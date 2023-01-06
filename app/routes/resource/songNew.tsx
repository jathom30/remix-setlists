import type { Feel, Song } from "@prisma/client";
import { Form, useActionData, useParams } from "@remix-run/react";
import type { ActionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { MaxHeightContainer, MaxWidth, SaveButtons, SongForm } from "~/components";
import { createSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { getFields } from "~/utils/form";
import type { ReactNode } from "react";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const bandId = formData.get('bandId')?.toString()
  const redirectTo = formData.get('redirectTo')?.toString()
  invariant(bandId, 'bandId not found')

  await requireNonSubMember(request, bandId)

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
  if (!redirectTo) {
    return redirect(`/${bandId}/song/${song.id}`)
  }
  return redirect(redirectTo)
}

export function SongNew({ feels, header, redirectTo, cancelTo }: { feels: SerializeFrom<Feel>[]; redirectTo?: string; cancelTo: string; header?: ReactNode }) {
  const actionData = useActionData()
  const { bandId } = useParams()

  return (
    <Form method="post" action="/resource/songNew">
      <MaxHeightContainer
        fullHeight
        header={header}
        footer={
          <SaveButtons
            saveLabel="Create song"
            cancelTo={cancelTo}
          />
        }
      >
        <MaxWidth>
          <div className="bg-base-200">
            <SongForm
              feels={feels}
              song={{
                position: 'other',
                rank: 'no_preference'
              }}
              errors={actionData?.errors}
            />
          </div>
          <input hidden type="hidden" name="bandId" value={bandId} />
          <input hidden type="hidden" name="redirectTo" value={redirectTo} />
        </MaxWidth>
      </MaxHeightContainer>
    </Form>
  )
}