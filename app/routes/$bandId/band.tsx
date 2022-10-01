import { Outlet, useCatch, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Avatar, Badge, Drawer, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components";
import { getBand } from "~/models/band.server";
import { getUser, requireUserId } from "~/session.server";
import { getUsersById } from "~/models/user.server";
import { roleEnums } from "~/utils/enums";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')

  const band = await getBand(bandId)
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }

  const members = await getUsersById(band.members.map(member => member.userId))
  const augmentedMembers = members.map(member => ({
    ...member,
    role: band.members.find(m => m.userId === member.id)?.role
  }))

  const user = await getUser(request)
  const isAdmin = augmentedMembers.find(m => m.id === user?.id)?.role === roleEnums.admin

  return json({ band, members: augmentedMembers, isAdmin })
}


export default function BandSettingsPage() {
  const { band, members, isAdmin } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // sub routes can include member id if user is updating member's role
  const subRoutes = ['newMember', 'edit', 'updateMember', 'removeSelf', 'delete', ...members.map(m => m.id)]
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <FlexHeader>
            <RouteHeaderBackLink label="Band" to={`/${bandId}/home`} />
            {isAdmin ? <Link to="edit" kind="invert">Edit</Link> : null}
          </FlexHeader>
        </RouteHeader>
      }
      footer={
        <Drawer open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </Drawer>
      }
    >
      <FlexList pad={4}>
        <FlexHeader>
          <h1 className="text-3xl font-bold">{band.name}</h1>
          <Avatar bandName={band.name || ''} icon={band.icon} size="lg" />
        </FlexHeader>
        <FlexHeader>
          <FlexList gap={0}>
            <Label>Created on</Label>
            <span className="text-sm">{new Date(band.createdAt || '').toDateString()}</span>
          </FlexList>
          <FlexList gap={0}>
            <Label>Last updated</Label>
            <span className="text-sm">{new Date(band.updatedAt || '').toDateString()}</span>
          </FlexList>
        </FlexHeader>

        <ItemBox pad={2}>
          <Label>Members</Label>
          <FlexList gap={2}>
            {members.map(member => (
              <FlexHeader key={member.id}>
                {isAdmin ? (
                  <Link to={member.id} icon={faEdit} kind="secondary">{member.name}</Link>
                ) : (
                  <span className="font-bold">{member.name}</span>
                )}
                <Badge>{member.role}</Badge>
              </FlexHeader>
            ))}
            {isAdmin ? (
              <Link to="newMember">Add new member</Link>
            ) : null}
          </FlexList>
        </ItemBox>

        <FlexList gap={2}>
          <Label>Danger Zone</Label>
          <ItemBox isDanger>
            <FlexList>
              <FlexList>
                <span className="font-bold">Remove self from band</span>
                <p className="text-sm text-text-subdued">This will remove your access to the band, but keep the band intact for other users</p>
              </FlexList>
              <Link to="removeSelf" kind="danger" icon={faTrash}>Remove</Link>
            </FlexList>
          </ItemBox>
          {isAdmin ? (
            <ItemBox isDanger>
              <FlexList>
                <FlexList>
                  <span className="font-bold">Delete this band</span>
                  <p className="text-sm text-text-subdued">Deleting this band will perminantly remove all setlists and songs</p>
                </FlexList>
                <Link to="delete" kind="danger" icon={faTrash}>Delete</Link>
              </FlexList>
            </ItemBox>
          ) : null}
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.log(caught.data)
  return (
    <div>Oops</div>
  )
}