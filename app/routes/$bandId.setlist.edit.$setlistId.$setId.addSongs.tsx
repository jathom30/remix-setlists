import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import { useSpinDelay } from "spin-delay";
import invariant from "tiny-invariant";
import {
  FlexHeader,
  FlexList,
  Link,
  Loader,
  MaxHeightContainer,
  MulitSongSelect,
  SaveButtons,
  SearchInput,
  Title,
} from "~/components";
import { addSongsToSet } from "~/models/set.server";
import { getSongsNotInSetlist } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId, setlistId } = params;
  invariant(bandId, "bandId not found");
  invariant(setlistId, "setlistId not found");
  await requireNonSubMember(request, bandId);
  const url = new URL(request.url);
  const q = url.searchParams.get("query");

  const songParams = {
    ...(q ? { q } : null),
  };

  const songs = await getSongsNotInSetlist(bandId, setlistId, songParams);

  return json({ songs });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { setId, bandId, setlistId } = params;
  invariant(setId, "setId not found");
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  const formData = await request.formData();
  const songIds = formData.getAll("songs").map((songId) => songId.toString());

  await addSongsToSet(setId, songIds);
  // ? Redirects to an intermediate route that quickly redirects to edit view
  return redirect(`/${bandId}/setlist/loadingSetlist?setlistId=${setlistId}`);
}

export default function AddSongsToSet() {
  const { songs } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query"));
  const submit = useSubmit();
  const navigation = useNavigation();
  const songsFormData = navigation.formData?.getAll("songs").toString();
  const formDataHasSongs =
    typeof songsFormData === "string" && !!songsFormData.length;
  const isSearching = useSpinDelay(navigation.state !== "idle" && !!query);
  const isSubmitting = useSpinDelay(
    navigation.state !== "idle" && formDataHasSongs,
  );
  const hasAvailableSongs = !query ? songs.length > 0 : true;

  const handleClearQuery = () => {
    setQuery("");
    setSearchParams({});
  };

  if (!hasAvailableSongs) {
    return (
      <FlexList pad={4}>
        <h3 className="font-bold text-2xl">No available songs</h3>
        <p className="text-text-subdued text-sm">
          It looks like this setlist has used all your available songs.
        </p>
        <Link to={`../createSong`} kind="primary">
          Create a new song?
        </Link>
        <Link to="..">Cancel</Link>
      </FlexList>
    );
  }

  return (
    <FlexList gap={0}>
      <div className="bg-base-100 shadow-lg p-4 relative">
        <div className="sticky top-0">
          <FlexList gap={2}>
            <FlexHeader>
              <FlexList direction="row" items="center">
                <Title>Add songs to set</Title>
                {isSearching ? <Loader /> : null}
              </FlexList>
              {hasAvailableSongs ? (
                <Link isOutline to="../createSong" icon={faPlus}>
                  Create song
                </Link>
              ) : null}
            </FlexHeader>
            <Form method="get" onChange={(e) => submit(e.currentTarget)}>
              <SearchInput
                value={query}
                onClear={handleClearQuery}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Form>
          </FlexList>
        </div>
      </div>
      <Form method="put" className="h-full">
        <MaxHeightContainer
          fullHeight
          footer={
            <SaveButtons
              saveLabel="Add songs to set"
              cancelTo=".."
              isSaving={isSubmitting}
            />
          }
        >
          <MulitSongSelect songs={songs} />
        </MaxHeightContainer>
      </Form>
    </FlexList>
  );
}
