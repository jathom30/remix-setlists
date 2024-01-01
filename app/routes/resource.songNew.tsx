import type { Feel } from "@prisma/client";
import type { ActionFunctionArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useFetcher,
  useParams,
  useRouteError,
} from "@remix-run/react";
import type { ReactNode } from "react";
import invariant from "tiny-invariant";

import {
  CatchContainer,
  ErrorContainer,
  MaxHeightContainer,
  MaxWidth,
  SaveButtons,
  SongForm,
} from "~/components";
import { deleteLink, upsertLink } from "~/models/links.server";
import { createSong, handleSongFormData } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { emitter } from "~/utils/emitter.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const bandId = formData.get("bandId")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString();
  invariant(bandId, "bandId not found");

  await requireNonSubMember(request, bandId);

  const { formFields, errors, validFeels, links, deletedLinks } =
    handleSongFormData(formData);

  if (errors) {
    return json({ errors });
  }
  const song = await createSong(bandId, formFields, validFeels);

  await Promise.all([
    ...links.map(async (link) => {
      return await upsertLink({ href: link.href, songId: song.id }, link.id);
    }),
    ...(deletedLinks.length > 0
      ? deletedLinks.map(async (deletedId) => {
          return await deleteLink(deletedId);
        })
      : []),
  ]);

  emitter.emit("songs");
  if (!redirectTo) {
    return redirect(`/${bandId}/song/${song.id}`);
  }
  return redirect(redirectTo);
}

export function SongNew({
  feels,
  header,
  redirectTo,
  cancelTo,
}: {
  feels: SerializeFrom<Feel>[];
  redirectTo?: string;
  cancelTo: string;
  header?: ReactNode;
}) {
  const fetcher = useFetcher<typeof action>();
  const { bandId } = useParams();

  return (
    <fetcher.Form method="post" action="/resource/songNew">
      <MaxHeightContainer
        fullHeight
        header={header}
        footer={<SaveButtons saveLabel="Create song" cancelTo={cancelTo} />}
      >
        <MaxWidth>
          <div className="bg-base-200">
            <SongForm
              feels={feels}
              song={{
                position: "other",
                rank: "no_preference",
              }}
              errors={fetcher.data?.errors}
            />
          </div>
          <input hidden type="hidden" name="bandId" value={bandId} />
          <input hidden type="hidden" name="redirectTo" value={redirectTo} />
        </MaxWidth>
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
