import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Feel, Song } from "@prisma/client";
import { Form, useActionData, useFetcher } from "@remix-run/react";
import type { ActionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { CatchContainer, ErrorContainer, FlexHeader, Link, MaxHeightContainer, Navbar, SaveButtons, SongForm, Title } from "~/components";
import { handleSongFormData, updateSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const bandId = formData.get('bandId')?.toString()
  const songId = formData.get('songId')?.toString()
  const redirectTo = formData.get('redirectTo')?.toString()
  invariant(bandId, 'bandId not found')
  invariant(songId, 'songId not found')
  invariant(redirectTo, 'redirectTo not found')

  await requireNonSubMember(request, bandId)

  const { formFields, errors, validFeels } = handleSongFormData(formData)

  if (errors) {
    return json({ errors })
  }

  await updateSong(songId, formFields, validFeels)
  return redirect(redirectTo)
}

export function SongEdit({ song, feels, redirectTo }: { song: SerializeFrom<Song & { feels: Feel[] }>; feels: SerializeFrom<Feel>[]; redirectTo: string }) {
  const fetcher = useFetcher<typeof action>()

  return (
    <fetcher.Form method="put" action="/resource/songEdit">
      <MaxHeightContainer
        fullHeight
        header={
          <Navbar>
            <FlexHeader>
              <Title>Edit {song.name}</Title>
              <Link to=".." isRounded size="sm"><FontAwesomeIcon icon={faTimes} /></Link>
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
        <div className="bg-base-200">
          <SongForm
            song={song}
            feels={feels}
            errors={fetcher.data?.errors}
          />
        </div>
        <input hidden type="hidden" name="songId" value={song.id} />
        <input hidden type="hidden" name="bandId" value={song.bandId || ''} />
        <input hidden type="hidden" name="redirectTo" value={redirectTo} />
      </MaxHeightContainer>
    </fetcher.Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <ErrorContainer error={error} />
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}