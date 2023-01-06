import type { Feel } from "@prisma/client";
import { useActionData, useFetcher, useParams } from "@remix-run/react";
import type { ActionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CatchContainer, ErrorContainer, MaxHeightContainer, MaxWidth, SaveButtons, SongForm } from "~/components";
import { createSong, handleSongFormData } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import type { ReactNode } from "react";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const bandId = formData.get('bandId')?.toString()
  const redirectTo = formData.get('redirectTo')?.toString()
  invariant(bandId, 'bandId not found')

  await requireNonSubMember(request, bandId)

  const { formFields, errors, validFeels } = handleSongFormData(formData)

  if (errors) {
    return json({ errors })
  }
  const song = await createSong(bandId, formFields, validFeels)
  if (!redirectTo) {
    return redirect(`/${bandId}/song/${song.id}`)
  }
  return redirect(redirectTo)
}

export function SongNew({ feels, header, redirectTo, cancelTo }: { feels: SerializeFrom<Feel>[]; redirectTo?: string; cancelTo: string; header?: ReactNode }) {
  const fetcher = useFetcher<typeof action>()
  const { bandId } = useParams()

  return (
    <fetcher.Form method="post" action="/resource/songNew">
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
              errors={fetcher.data?.errors}
            />
          </div>
          <input hidden type="hidden" name="bandId" value={bandId} />
          <input hidden type="hidden" name="redirectTo" value={redirectTo} />
        </MaxWidth>
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