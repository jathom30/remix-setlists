import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Button, CatchContainer, CopyClick, ErrorContainer, FlexHeader, FlexList, Link, Navbar, SaveButtons, Title } from "~/components";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import { getSetlist, updateSetlist } from "~/models/setlist.server";
import { getDomainUrl } from "~/utils/assorted";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { setlistId, bandId } = params
  invariant(setlistId, 'setlistId not found')
  invariant(bandId, 'bandId not found')
  const setlist = await getSetlist(setlistId)
  if (!setlist) { throw new Response("Setlist not found", { status: 404 }) }

  const publicSearchParams = new URLSearchParams()
  publicSearchParams.set('bandId', bandId)
  publicSearchParams.set('setlistId', setlistId)
  const domainUrl = getDomainUrl(request)
  const setlistPublicUrl = `${domainUrl}/publicSetlist?${publicSearchParams.toString()}`

  return json({ setlist, ...(setlist.isPublic ? { setlistPublicUrl } : null) })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { bandId, setlistId } = params
  invariant(bandId, 'bandId not found')
  invariant(setlistId, 'setlistId not found')
  const formData = await request.formData()
  const intent = formData.get('intent')

  const publicSearchParams = new URLSearchParams()
  publicSearchParams.set('bandId', bandId || '')
  publicSearchParams.set('setlistId', setlistId || '')

  const isPublic = intent === 'create' ? true : false
  const setlist = await updateSetlist(setlistId, { isPublic })
  if (!setlist) {
    throw new Response('Setlist not found', { status: 404 })
  }
  if (isPublic) {
    return null
  }
  return redirect(`/${bandId}/setlist/${setlistId}`)
}

export default function ConfirmPublicLink() {
  const { setlist, setlistPublicUrl } = useLoaderData<typeof loader>()

  return (
    <FlexList gap={0}>
      <Navbar>
        <FlexHeader>
          <Title>{setlist.isPublic ? 'Setlist is public' : 'Create public link?'}</Title>
          <Link to=".." isRounded kind="ghost"><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      {setlist.isPublic ? (
        <>
          <FlexList pad={4}>
            <p>This setlist is public. You can <a className="link link-accent" href={setlistPublicUrl} target="_blank" rel="noreferrer">follow this link</a> to see it.</p>
            <CopyClick textToCopy={setlistPublicUrl} copyMessage="Click to copy link" successMessage="Link copied!" />
            <p>If you would like this setlist to no longer be public, you can do so below.</p>
          </FlexList>
          <Form method="put">
            <FlexList pad={4}>
              <input type="hidden" hidden name="intent" value="remove" />
              <Button type="submit" kind="error">Remove public link</Button>
            </FlexList>
          </Form>
        </>
      ) : (
        <>
          <FlexList pad={4}>
            <p>Creating a public link will allow anyone with access to the URL to <strong>view</strong> this setlist. However, they will not be able to add, edit, or alter this setlist in any way.</p>
            <p>This is useful if you want to share your setlists with fans or allow someone access to this setlist without having to join your band.</p>
          </FlexList>
          <Form method="put">
            <input type="hidden" hidden name="intent" value="create" />
            <SaveButtons saveLabel="Create public link" cancelTo=".." />
          </Form>
        </>
      )
      }
    </FlexList>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}
export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}