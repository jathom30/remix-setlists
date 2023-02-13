import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { AvatarTitle, Breadcrumbs, CatchContainer, CreateNewButton, ErrorContainer, FlexHeader, Link, MaxHeightContainer, MaxWidth, MobileMenu, MobileModal, Navbar, SongDetails } from "~/components";
import { getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { RoleEnum } from "~/utils/enums";
import { useMemberRole } from "~/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  const song = await getSong(songId, bandId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song })
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  if (!data) {
    return {
      title: "Songs",
    }
  }
  const { song: { name } } = data
  return { title: name }
};

export default function SongDetailsRoute() {
  const { song } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const { pathname } = useLocation()
  const { bandId } = useParams()
  const navigate = useNavigate()

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <>
          <Navbar>
            <FlexHeader items="baseline">
              <AvatarTitle title={song.name} />
              {!isSub ? <div className="hidden sm:block">
                <Link kind="ghost" to="edit" icon={faPencil}>Edit</Link>
              </div> : null}
              <MobileMenu />
            </FlexHeader>
          </Navbar>
          <Navbar shrink>
            <Breadcrumbs breadcrumbs={[
              { label: 'Songs', to: `/${bandId}/songs` },
              { label: song.name, to: '.' },
            ]}
            />
          </Navbar>
        </>
      }
      footer={
        <>
          {!isSub ? <CreateNewButton to="edit" icon={faPencil} ariaLabel="Edit song" /> : null}
          <MobileModal open={['edit', 'delete'].some(path => pathname.includes(path))} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <MaxWidth>
        <SongDetails song={song} />
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