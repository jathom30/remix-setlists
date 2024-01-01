import { faBoxOpen, faSort } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import {
  AvatarTitle,
  CreateNewButton,
  FlexHeader,
  FlexList,
  Link,
  MaxHeightContainer,
  MaxWidth,
  MobileMenu,
  MobileModal,
  Navbar,
  SearchInput,
  SetlistLink,
} from "~/components";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import { getSetlists } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { capitalizeFirstLetter } from "~/utils/assorted";
import { RoleEnum } from "~/utils/enums";
import { getSortFromParam } from "~/utils/params";

export const meta: MetaFunction = () => [
  {
    title: "Setlists",
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const bandId = params.bandId;
  invariant(bandId, "bandId not found");

  const urlSearchParams = new URL(request.url).searchParams;
  const q = urlSearchParams.get("query");
  const intent = urlSearchParams.get("intent");
  let sort = urlSearchParams.get("sort");
  if (intent === "clear") {
    urlSearchParams.delete("query");
  }

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  if (cookie && typeof cookie === "object" && "setlistSort" in cookie) {
    sort = String(cookie.setlistSort);
  }

  const filterParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
  };

  const setlists = await getSetlists(bandId, filterParams);
  return json({
    setlists: setlists.filter((setlist) => !setlist.editedFromId),
    sort,
  });
}

const subRoutes = ["sortBy", "filters"];

export default function SetlistsRoute() {
  const { setlists, sort: serverSort } = useLiveLoader<typeof loader>();
  const memberRole = useMemberRole();
  const isSub = memberRole === RoleEnum.SUB;
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query"));
  const { bandId } = useParams();
  const submit = useSubmit();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const hasSetlists = setlists.length;

  const sortByLabel = () => {
    const sortObject = getSortFromParam(serverSort ?? undefined);
    const [entry] = Object.entries(sortObject);
    // probably not the best solution, but removes At from createdAt and updatedAt keys
    const sort = capitalizeFirstLetter(entry[0]).replace("At", "");
    const direction = () => {
      switch (sort.toLowerCase()) {
        case "name":
          return entry[1] === "asc" ? "A-Z" : "Z-A";
        case "tempo":
          return entry[1] === "asc" ? "slow-fast" : "fast-slow";
        case "updated":
          return entry[1] === "asc" ? "oldest first" : "newest first";
        case "created":
          return entry[1] === "asc" ? "oldest first" : "newest first";
        default:
          return "";
      }
    };
    return `${sort} ${direction()}`;
  };

  const handleClearQuery = () => {
    setQuery("");
    setSearchParams({});
  };

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <AvatarTitle title="Setlists" />
            <MobileMenu />
            {!isSub ? (
              <div className="hidden sm:block">
                <Link to={`/${bandId}/setlist/new`} kind="primary">
                  New setlist
                </Link>
              </div>
            ) : null}
          </FlexHeader>
        </Navbar>
      }
      footer={
        <>
          {!isSub && hasSetlists ? (
            <CreateNewButton
              to={`/${bandId}/setlist/new`}
              ariaLabel="New setlist"
            />
          ) : null}
          <MobileModal
            open={subRoutes.some((path) => pathname.includes(path))}
            onClose={() =>
              navigate({ pathname: `/${bandId}/setlists`, search })
            }
          >
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <MaxWidth>
        <MaxHeightContainer
          fullHeight
          header={
            <FlexList pad={4} gap={4}>
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
                    <span>{sortByLabel()}</span>
                  </FlexList>
                </Link>
              </FlexList>
            </FlexList>
          }
        >
          <FlexList height="full">
            {hasSetlists ? (
              <FlexList pad={4} gap={2}>
                {setlists.map((setlist) => (
                  <SetlistLink
                    key={setlist.id}
                    setlist={setlist}
                    publicRemark="You can remove the public link by clicking on this setlist's settings."
                  />
                ))}
              </FlexList>
            ) : (
              <FlexList pad={4}>
                <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                <p className="text-center">
                  Looks like this band doesn't have any setlists yet.
                </p>
                {!isSub ? (
                  <Link to={`/${bandId}/setlist/new`} kind="primary">
                    Create your first setlist
                  </Link>
                ) : null}
              </FlexList>
            )}
          </FlexList>
        </MaxHeightContainer>
      </MaxWidth>
    </MaxHeightContainer>
  );
}
