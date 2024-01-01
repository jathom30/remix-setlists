import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Feel, Song } from "@prisma/client";
import type { ActionFunctionArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useFetcher,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  CatchContainer,
  ErrorContainer,
  FlexHeader,
  Link,
  MaxHeightContainer,
  Navbar,
  SaveButtons,
  SongForm,
  Title,
} from "~/components";
import { deleteLink, upsertLink } from "~/models/links.server";
import { handleSongFormData, updateSong } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { emitter } from "~/utils/emitter.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const bandId = formData.get("bandId")?.toString();
  const songId = formData.get("songId")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString();
  invariant(bandId, "bandId not found");
  invariant(songId, "songId not found");
  invariant(redirectTo, "redirectTo not found");

  await requireNonSubMember(request, bandId);

  const { formFields, errors, validFeels, links, deletedLinks } =
    handleSongFormData(formData);

  if (errors) {
    return json({ errors });
  }

  await Promise.all([
    ...links.map(async (link) => {
      return await upsertLink({ href: link.href, songId }, link.id);
    }),
    ...(deletedLinks.length > 0
      ? deletedLinks.map(async (deletedId) => {
          return await deleteLink(deletedId);
        })
      : []),
  ]);

  await updateSong(songId, formFields, validFeels);
  emitter.emit("songs");
  return redirect(redirectTo);
}

export function SongEdit({
  song,
  feels,
  redirectTo,
}: {
  song: SerializeFrom<Song & { feels: Feel[] }>;
  feels: SerializeFrom<Feel>[];
  redirectTo: string;
}) {
  const fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="put" action="/resource/songEdit">
      <MaxHeightContainer
        fullHeight
        header={
          <Navbar>
            <FlexHeader>
              <Title>Edit {song.name}</Title>
              <Link to=".." kind="ghost" isRounded size="sm">
                <FontAwesomeIcon icon={faTimes} />
              </Link>
            </FlexHeader>
          </Navbar>
        }
        footer={<SaveButtons saveLabel="Save" cancelTo=".." />}
      >
        <div className="bg-base-200">
          <SongForm song={song} feels={feels} errors={fetcher.data?.errors} />
        </div>
        <input hidden type="hidden" name="songId" value={song.id} />
        <input hidden type="hidden" name="bandId" value={song.bandId || ""} />
        <input hidden type="hidden" name="redirectTo" value={redirectTo} />
      </MaxHeightContainer>
    </fetcher.Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
