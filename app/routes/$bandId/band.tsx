import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Avatar, Badge, CatchContainer, ErrorContainer, FeelTag, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MobileModal, RouteHeader, RouteHeaderBackLink, Title } from "~/components";
import { getBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { getUsersById } from "~/models/user.server";
import { RoleEnum } from "~/utils/enums";
import { faEdit, faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useMemberRole } from "~/utils";
import { getFeels } from "~/models/feel.server";
import pluralize from "pluralize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  const feels = await getFeels(bandId)

  return json({ band, members: augmentedMembers, feels })
}


export default function BandSettingsPage() {
  const { band, members, feels } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isAdmin = memberRole === RoleEnum.ADMIN
  const isSub = memberRole === RoleEnum.SUB
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // sub routes can include member id if user is updating member's role
  const subRoutes = ['newMember', 'edit', 'updateMember', 'removeSelf', 'delete', ...members.map(m => m.id), 'feel']
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={
            <RouteHeaderBackLink label="Band" to={`/${bandId}/home`} />
          }
          action={isAdmin ? <Link to="edit" kind="invert">Edit</Link> : null}
          desktopChildren={<Title>Band Settings</Title>}
          desktopAction={isAdmin ? <Link to="edit" kind="secondary">Edit</Link> : null}
        />
      }
      footer={
        <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
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

        <FlexList gap={2}>
          <Label>Members</Label>
          <ItemBox>
            <FlexList>
              {members.map(member => (
                <FlexHeader key={member.id}>
                  <FlexList direction="row">
                    <span className="font-bold">{member.name}</span>
                    <Badge>{member.role}</Badge>
                  </FlexList>
                  {!isSub ? <Link to={member.id} kind="secondary"><FontAwesomeIcon icon={faEdit} /></Link> : null}
                </FlexHeader>
              ))}
              {isAdmin ? (
                <Link to="newMember">Add new member</Link>
              ) : null}
            </FlexList>
          </ItemBox>
        </FlexList>

        <FlexList gap={2}>
          <FlexHeader>
            <Label>Feels</Label>
            {!isSub ? <Link to="feel/new" isRounded><FontAwesomeIcon icon={faPlus} /></Link> : null}
          </FlexHeader>
          <ItemBox>
            <FlexList>
              {feels.length === 0 ? (
                <Label>No feels created yet</Label>
              ) : null}
              {feels.map(feel => (
                <FlexHeader key={feel.id}>
                  <FlexList direction="row" gap={2}>
                    {!isSub ? <Link to={`feel/${feel.id}/edit`} kind="text" isRounded><FontAwesomeIcon icon={faPencil} /></Link> : null}
                    <FeelTag feel={feel} />
                  </FlexList>
                  <FlexList direction="row" items="center">
                    <Label>Found in {pluralize('song', feel.songs.length, true)}</Label>
                    {!isSub ? <Link to={`feel/${feel.id}/delete`} kind="danger" icon={faTrash} isCollapsing isRounded>Delete</Link> : null}
                  </FlexList>
                </FlexHeader>
              ))}

            </FlexList>
          </ItemBox>
        </FlexList>

        {isAdmin ? (
          <FlexList gap={2}>
            <Label>Danger Zone</Label>
            <ItemBox isDanger>
              <FlexList>
                <FlexList>
                  <span className="font-bold">Delete this band</span>
                  <p className="text-sm text-text-subdued">Deleting this band will perminantly remove all setlists and songs</p>
                </FlexList>
                <Link to="delete" kind="danger" icon={faTrash}>Delete</Link>
              </FlexList>
            </ItemBox>
          </FlexList>
        ) : null}
      </FlexList>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}