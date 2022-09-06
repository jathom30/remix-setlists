import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { Link, FlexList, Header, Button, Label } from "~/components";
import { getBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { useLoaderData } from "@remix-run/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId note found')
  const band = await getBand(bandId)
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ band })
}

export default function BandIndex() {
  const { band } = useLoaderData<typeof loader>()
  return (
    <FlexList pad={4}>
      <Header>
        <h1 className="font-bold text-3xl">Band Settings</h1>
        <Button kind="danger" isRounded isCollapsing icon={faTrash}>Delete band</Button>
      </Header>
      <h2>{band.name}</h2>
      <h3>Members</h3>
      {band.members.map(member => (
        <p key={member.userId}>{member.userId}</p>
      ))}
      <Label>Creation</Label>
      <Link to="setlists/new">New Setlist</Link>
      <Link to="songs/new">New Song</Link>
      <Link to="feels/new">New Feel</Link>
    </FlexList>
  )
}