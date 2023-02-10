import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { AvatarTitle, Breadcrumbs, CatchContainer, CreateNewButton, Divider, ErrorContainer, FeelTag, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MaxWidth, MobileMenu, MobileModal, Navbar, TempoIcons } from "~/components";
import { getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import pluralize from 'pluralize'
import { RoleEnum, setlistAutoGenImportanceEnums } from "~/utils/enums";
import { useMemberRole } from "~/utils";
import { capitalizeFirstLetter } from "~/utils/assorted";

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

export default function SongDetails() {
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
        <FlexList pad={4}>
          <FlexList gap={2}>
            <Label>Details</Label>
            <ItemBox>
              <div className="grid grid-cols-[max-content_1fr] items-center gap-2">
                <Label align="right">Name</Label>
                <span>{song.name}</span>

                <Label align="right">Artist</Label>
                <span>{song.author || '--'}</span>

                <Label align="right">Key</Label>
                {song.keyLetter ? <span>{song.keyLetter} {song.isMinor ? 'Minor' : 'Major'}</span> : <span>--</span>}

                <Label align="right">Tempo</Label>
                <TempoIcons tempo={song.tempo} />

                <Label align="right">Length</Label>
                <span>{pluralize('Minutes', song.length, true)}</span>

                <Label align="right">Position</Label>
                <span>{capitalizeFirstLetter(song.position) || 'Other'}</span>

                <Label align="right">Feels</Label>
                <FlexList direction="row" gap={2} wrap>
                  {song.feels.map(feel => (
                    <FeelTag key={feel.id} feel={feel} />
                  ))}
                  {song.feels.length === 0 ? "--" : null}
                </FlexList>

                <Label align="right">Found in</Label>
                <span>{pluralize('setlist', song.sets.length, true)}</span>
              </div>
            </ItemBox>
          </FlexList>

          <Divider />

          <FlexList gap={2}>
            <Label>Notes/Lyrics</Label>
            <ItemBox>
              <FlexList gap={2}>
                {!song.note ? (
                  <span>--</span>
                ) : (
                  song.note?.split('\n').map((section, i) => (
                    <p key={i}>{section}</p>
                  ))
                )}
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          {song.links.length ? (
            <>
              <FlexList gap={2}>
                <Label>Links</Label>
                <ItemBox>
                  <FlexList gap={2}>
                    {song.links.map(link => (
                      <a
                        className="link link-accent"
                        key={link.id}
                        href={'https://' + link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.href}
                      </a>
                    ))}
                  </FlexList>
                </ItemBox>
              </FlexList>

              <Divider />
            </>
          ) : null}

          <FlexList gap={2}>
            <Label>Settings</Label>
            <ItemBox>
              <FlexList gap={2} direction="row" items="center">
                <Label>Setlist auto-generation importance</Label>
                <span>{setlistAutoGenImportanceEnums[song.rank as keyof typeof setlistAutoGenImportanceEnums]}</span>
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          {!isSub ? (
            <FlexList gap={2}>
              <Label isDanger>Danger zone</Label>
              <ItemBox>
                <FlexList>
                  <FlexList>
                    <span className="font-bold">Delete this song</span>
                    <p className="text-sm text-text-subdued">Once you delete this song, it will be removed from this band and any setlists it was used in.</p>
                  </FlexList>
                  <Link to="delete" kind="error" type="submit" icon={faTrash}>Delete</Link>
                </FlexList>
              </ItemBox>
            </FlexList>
          ) : null}
        </FlexList >
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