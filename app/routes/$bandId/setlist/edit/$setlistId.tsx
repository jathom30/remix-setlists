import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from '@remix-run/node'
import { Form, Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { AvatarTitle, Breadcrumbs, Button, CatchContainer, ErrorContainer, FlexHeader, MaxHeightContainer, MobileMenu, MobileModal, Navbar, SaveButtons, SetlistDndInterface } from "~/components";
import { getSetlist, newUpdateSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { getSongs } from "~/models/song.server";
import { emitter } from "~/utils/emitter.server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";


export async function loader({ request, params }: LoaderArgs) {
  const { setlistId, bandId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const setlist = await getSetlist(setlistId)
  const songs = await getSongs(bandId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist, songs })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId, setlistId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)
  const formData = await request.formData()
  const entries = formData.entries()

  // key is position in setlist, value is array of song ids
  const sets: Record<string, string[]> = {}
  for (const entry of entries) {
    const [index, songIds] = entry
    if (typeof songIds !== 'string') { return null }
    sets[index] = songIds.split(',')
  }
  // remove any sets that do not have songs
  const cleanedSets = Object.entries(sets).reduce((all: Record<string, string[]>, [positionInSetlist, songIds]) => {
    // remove "empty" song ids
    const cleanedSongIds = songIds.filter(id => Boolean(id))
    if (!cleanedSongIds.length) {
      return all
    }
    return { ...all, [positionInSetlist]: cleanedSongIds }
  }, {})

  const newSetlist = await newUpdateSetlist(setlistId, cleanedSets)

  emitter.emit('setlist', newSetlist.id)
  return redirect(`/${bandId}/setlist/${newSetlist.id}`)
}

const subRoutes = ['addSongs', 'newSong', 'removeSong', 'createSet', 'createSong', 'saveChanges', 'confirmCancel']

export default function EditSetlist() {
  const { setlist, songs } = useLoaderData<typeof loader>()
  const { bandId, setlistId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()


  const { sets, name } = setlist
  // get sets for DND interface
  const setsByPosition = sets
    // sort by positionInSetlist
    .sort((a, b) => {
      if (a.positionInSetlist < b.positionInSetlist) { return -1 }
      if (a.positionInSetlist > b.positionInSetlist) { return 1 }
      return 0
    })
    // reduce to object for DND interface
    .reduce((all: Record<string, string[]>, set) => {
      return {
        ...all,
        [set.id]: set.songs.map(song => song.songId)
      }
    }, {})


  return (
    <Form method="put" className="h-full">
      <MaxHeightContainer
        fullHeight
        header={
          <>
            <Navbar>
              <FlexHeader>
                <AvatarTitle title={`Editing ${setlist.name}`} />
                <MobileMenu />
              </FlexHeader>
            </Navbar>
            <Navbar shrink>
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: `/${bandId}/setlist/${setlist.id}` },
                { label: 'Edit', to: '.' },
              ]} />
            </Navbar>
          </>
        }
        footer={
          <>
            <div className="sticky sm:hidden">
              <div className="absolute bottom-4 right-4">
                <Button
                  size="lg"
                  ariaLabel="Save setlist"
                  kind="primary"
                  isRounded
                  type="submit"
                >
                  <FontAwesomeIcon icon={faSave} size="2x" />
                </Button>
              </div>
            </div>
            <div className="hidden sm:block">
              <SaveButtons
                saveLabel="Save"
                cancelTo={`/${bandId}/setlist/${setlistId}`}
              />
            </div>
            <MobileModal isPortal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
              <Outlet />
            </MobileModal>
          </>
        }
      >
        <div className="h-full flex">
          <SetlistDndInterface songs={songs} initialSetsState={setsByPosition} setlistTitle={name} />
        </div>
      </MaxHeightContainer>
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}
export function CatchBoundary() {
  return <CatchContainer />
}
