import invariant from "tiny-invariant";
import { json } from '@remix-run/node'
import type { LoaderArgs } from "@remix-run/server-runtime";
import { FlexList, Link, SongForm } from "~/components";
import { getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { setFormDefaults, ValidatedForm } from "remix-validated-form";
import { withYup } from "@remix-validated-form/with-yup";
import * as yup from 'yup'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const formName = 'edit_song_form'
export const validator = withYup(
  yup.object({
    name: yup.string().label('Name').required('Name is a required field'),
  })
)

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const songId = params.songId
  invariant(songId, 'songId not found')

  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json(setFormDefaults(formName, song))
}

export default function EditSong() {
  return (
    <FlexList pad={4}>
      <FlexList direction="row" items="center">
        <Link isRounded to="."><FontAwesomeIcon icon={faChevronLeft} /></Link>
        <h1 className="font-bold text-3xl">Song Edit</h1>
      </FlexList>

      <ValidatedForm id={formName} validator={validator}>
        <SongForm />
      </ValidatedForm>
    </FlexList>
  )
}