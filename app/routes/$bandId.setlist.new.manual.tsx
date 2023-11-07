import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import {
  CatchContainer,
  ErrorContainer,
  FlexList,
  MaxHeightContainer,
  MobileModal,
  MulitSongSelect,
  Link,
  SaveButtons,
  Title,
  SearchInput,
} from "~/components";
import { getSongs } from "~/models/song.server";
import {
  Form,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useRouteError,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { createSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { faFilter, faSort } from "@fortawesome/free-solid-svg-icons";
import { sortByLabel } from "~/utils/params";
import { useState } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId);
  await requireNonSubMember(request, bandId);

  const url = new URL(request.url);
  const q = url.searchParams.get("query");

  const sort = url.searchParams.get("sort");
  const feelParams = url.searchParams.getAll("feels");
  const tempoParams = url.searchParams.getAll("tempos");
  const isCoverParam = url.searchParams.get("isCover");
  const positionParams = url.searchParams.getAll("positions");

  const songParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
    feels: feelParams,
    tempos: tempoParams.map((tempo) => parseInt(tempo)),
    ...(isCoverParam ? { isCover: isCoverParam === "true" } : null),
    positions: positionParams,
  };

  const songs = await getSongs(bandId, songParams);
  return json({ songs });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);

  const formData = request.formData();
  const songIds = (await formData)
    .getAll("songs")
    .map((songId) => songId.toString());

  const setlist = await createSetlist(bandId, songIds);
  return redirect(`/${bandId}/setlist/creatingSetlist?setlistId=${setlist.id}`);
}

const subRoutes = ["sortBy", "filters"];

export default function ManualSetlistCreation() {
  const { songs } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { bandId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query"));
  const submit = useSubmit();
  const hasParams =
    [...searchParams.keys()].filter((key) => key !== "query" && key !== "sort")
      .length > 0;
  const hasAvailableSongs = !query ? songs.length > 0 : true;

  if (!hasAvailableSongs) {
    return (
      <FlexList pad={4}>
        <h3 className="font-bold text-2xl">No available songs</h3>
        <p className="text-text-subdued text-sm">
          It looks like this setlist has used all your available songs.
        </p>
        <Link to={`/${bandId}/song/new`} kind="primary">
          Create a new song?
        </Link>
        <Link to="..">Cancel</Link>
      </FlexList>
    );
  }

  const handleClearQuery = () => {
    setQuery("");
    setSearchParams({});
  };

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <div className="bg-base-100 shadow-lg p-4 xl:rounded-md xl:mt-2">
          <FlexList gap={2}>
            <Title>Create your first set</Title>
            <Form method="get" onChange={(e) => submit(e.currentTarget)}>
              <SearchInput
                value={query}
                onClear={handleClearQuery}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Form>
            <FlexList direction="row" items="center" justify="end" gap={2}>
              <Link
                to={{ pathname: "sortBy", search: searchParams.toString() }}
                isOutline
                icon={faSort}
              >
                <FlexList direction="row" gap={2}>
                  <span>Sort by:</span>
                  <span>{sortByLabel(searchParams)}</span>
                </FlexList>
              </Link>
              <div className="indicator">
                {hasParams ? (
                  <div className="indicator-item badge badge-secondary" />
                ) : null}
                <Link
                  to={{ pathname: "filters", search: searchParams.toString() }}
                  kind="secondary"
                  isCollapsing
                  isOutline
                  icon={faFilter}
                >
                  Filters
                </Link>
              </div>
            </FlexList>
          </FlexList>
        </div>
      }
      footer={
        <MobileModal
          open={subRoutes.some((route) => pathname.includes(route))}
          onClose={() => navigate(`.?${searchParams}`)}
        >
          <Outlet />
        </MobileModal>
      }
    >
      <Form method="put" className="h-full">
        <MaxHeightContainer
          fullHeight
          footer={
            <div className="xl:mb-2">
              <SaveButtons saveLabel="Create set" cancelTo=".." />
            </div>
          }
        >
          <MulitSongSelect songs={songs} />
        </MaxHeightContainer>
      </Form>
    </MaxHeightContainer>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
