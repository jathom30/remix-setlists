import type { Feel, Song } from "@prisma/client";
import { Form } from "@remix-run/react";
import type { ActionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { FlexHeader, MaxHeightContainer, Navbar, SaveButtons, SongForm, Title } from "~/components";
import { updateSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { getFields } from "~/utils/form";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const bandId = formData.get('bandId')?.toString()
  const songId = formData.get('songId')?.toString()
  const redirectTo = formData.get('redirectTo')?.toString()
  invariant(bandId, 'bandId not found')
  invariant(songId, 'songId not found')
  invariant(redirectTo, 'redirectTo not found')

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

  // iscover is not getting passed to the form object I THINK
  console.log({ field: fields.isCover, form: formData.get('isCover') })

  await updateSong(songId, fields, validFeels)
  return redirect(redirectTo)
}

export function SongEdit({ song, feels, redirectTo }: { song: SerializeFrom<Song & { feels: Feel[] }>; feels: SerializeFrom<Feel>[]; redirectTo: string }) {
  return (
    <Form method="put" action="/resource/songEdit">
      <MaxHeightContainer
        fullHeight
        header={
          <Navbar>
            <FlexHeader pad={4}>
              <Title>Edit {song.name}</Title>
            </FlexHeader>
          </Navbar>
        }
        footer={
          <SaveButtons
            saveLabel="Save"
            cancelTo=".."
          />
        }
      >
        <SongForm
          song={song}
          feels={feels}
        />
        <input hidden type="hidden" name="songId" value={song.id} />
        <input hidden type="hidden" name="bandId" value={song.bandId || ''} />
        <input hidden type="hidden" name="redirectTo" value={redirectTo} />
      </MaxHeightContainer>
    </Form>
  )
}