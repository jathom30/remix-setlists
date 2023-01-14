import { Outlet, useLoaderData, useLocation, useNavigate, Link as RemixLink } from "@remix-run/react";
import { json } from "@remix-run/node"
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Avatar, AvatarTitle, Badge, CatchContainer, Divider, ErrorContainer, FeelTag, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MaxWidth, MobileModal, Navbar } from "~/components";
import { getBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { getUsersById } from "~/models/user.server";
import { RoleEnum } from "~/utils/enums";
import { faCamera, faEdit, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useMemberRole } from "~/utils";
import { getFeels } from "~/models/feel.server";
import pluralize from "pluralize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const meta: MetaFunction = () => ({
  title: "Band settings",
});

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
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // sub routes can include member id if user is updating member's role
  const subRoutes = ['newMember', 'avatar', 'edit', 'updateMember', 'removeSelf', 'delete', ...members.map(m => m.id), 'feel']
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <AvatarTitle title="Band" />
            {isAdmin ? (
              <Link to="edit" icon={faPencil} isCollapsing kind="ghost">Edit</Link>
            ) : null}
          </FlexHeader>
        </Navbar>
      }
      footer={
        <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          <FlexHeader pad={2}>
            <h1 className="text-xl sm:text-2xl font-bold">{band.name}</h1>
            <RemixLink className="indicator" to="avatar">
              {isSub ? (
                <div className="indicator-item indicator-bottom">
                  <div className="btn btn-sm btn-circle">
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                </div>
              ) : null}
              <Avatar bandName={band.name || ''} icon={band.icon} size="lg" />
            </RemixLink>
          </FlexHeader>
          <ItemBox>
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
          </ItemBox>

          <Divider />

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
                    {isAdmin ? <Link to={member.id} kind="ghost"><FontAwesomeIcon icon={faEdit} /></Link> : null}
                  </FlexHeader>
                ))}
                {isAdmin ? (
                  <Link to="newMember" kind="outline">Add new member</Link>
                ) : null}
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          <FlexList gap={2}>
            <Label>Feels</Label>
            <ItemBox>
              <FlexList>
                {feels.length === 0 ? (
                  <Label>No feels created yet</Label>
                ) : null}
                {feels.map(feel => (
                  <FlexHeader key={feel.id}>
                    <FlexList direction="row" items="center" gap={2}>
                      {!isSub ? <Link to={`feel/${feel.id}/edit`} kind="ghost" isRounded><FontAwesomeIcon icon={faPencil} /></Link> : null}
                      <FlexList gap={1}>
                        <FeelTag feel={feel} />
                        <span className="text-xs">Found in {pluralize('song', feel.songs.length, true)}</span>
                      </FlexList>
                    </FlexList>
                    {!isSub ? <Link to={`feel/${feel.id}/delete`} kind="error" isRounded>
                      <FontAwesomeIcon icon={faTrash} />
                    </Link> : null}
                  </FlexHeader>
                ))}
                {!isSub ? <Link to="feel/new" kind="outline">Add new feel</Link> : null}
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          {isAdmin ? (
            <FlexList gap={2}>
              <Label isDanger>Danger Zone</Label>
              <ItemBox>
                <FlexList>
                  <FlexList>
                    <span className="font-bold">Delete this band</span>
                    <p className="text-sm text-text-subdued">Deleting this band will perminantly remove all setlists and songs</p>
                  </FlexList>
                  <Link to="delete" kind="error" icon={faTrash}>Delete</Link>
                </FlexList>
              </ItemBox>
            </FlexList>
          ) : null}
        </FlexList>
      </MaxWidth>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}