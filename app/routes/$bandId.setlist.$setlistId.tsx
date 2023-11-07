import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import {
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useRouteError,
} from "@remix-run/react";
import {
  AvatarTitle,
  Breadcrumbs,
  Button,
  CatchContainer,
  Collapsible,
  CreateNewButton,
  ErrorContainer,
  FlexHeader,
  FlexList,
  ItemBox,
  Label,
  Link,
  MaxHeightContainer,
  MaxWidth,
  MobileMenu,
  MobileModal,
  Navbar,
  SongLink,
} from "~/components";
import {
  faCompress,
  faDatabase,
  faEllipsisV,
  faExpand,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { getSetLength } from "~/utils/setlists";
import pluralize from "pluralize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Popover } from "react-tiny-popover";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);

  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId not found");
  invariant(bandId, "bandId not found");

  const setlist = await getSetlist(setlistId);

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  return json({ setlist });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      {
        title: "Songs",
      },
    ];
  }
  const {
    setlist: { name },
  } = data;
  return [{ title: name }];
};

const subRoutes = [
  "rename",
  "edit",
  "condensed",
  "data",
  "delete",
  "menu",
  "song",
  "confirmPublicLink",
];

export default function Setlist() {
  const role = useMemberRole();
  const isSub = role === RoleEnum.SUB;
  const [showTooltip, setShowTooltip] = useState(false);
  const { setlist } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { bandId } = useParams();
  const setKeyDefaults = setlist.sets.reduce(
    (acc, set) => ({ ...acc, [set.id]: true }),
    {} as Record<string, boolean>,
  );
  const [isOpen, setIsOpen] = useState(setKeyDefaults);

  const handleOpenSet = (setId: string) => {
    setIsOpen((prevOpen) => {
      return {
        ...prevOpen,
        [setId]: !prevOpen[setId],
      };
    });
  };

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <>
          <Navbar>
            <FlexHeader>
              <FlexList direction="row" gap={2} items="center">
                <AvatarTitle title={setlist.name} />
                {setlist.isPublic ? (
                  <Popover
                    isOpen={showTooltip}
                    positions={["bottom"]}
                    content={
                      <div className="max-w-sm shadow-2xl">
                        <ItemBox>
                          <p>
                            This setlist is public, meaning anyone with the
                            appropriate URL can see its condensed view.
                          </p>
                          <p>
                            If you want this setlist to be private, click the
                            menu button and then "View public link".
                          </p>
                        </ItemBox>
                      </div>
                    }
                  >
                    <FontAwesomeIcon
                      icon={faEye}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    />
                  </Popover>
                ) : null}
              </FlexList>
              <MobileMenu />
              {!isSub ? (
                <div className="hidden sm:block">
                  <Link kind="ghost" to="menu" icon={faEllipsisV}>
                    Settings
                  </Link>
                </div>
              ) : null}
            </FlexHeader>
          </Navbar>
          <Navbar shrink>
            <FlexHeader>
              <Breadcrumbs
                breadcrumbs={[
                  { label: "Setlists", to: `/${bandId}/setlists` },
                  { label: setlist.name, to: "." },
                ]}
              />
            </FlexHeader>
          </Navbar>
        </>
      }
      footer={
        <>
          {!isSub ? (
            <CreateNewButton
              to="menu"
              icon={faEllipsisV}
              ariaLabel="Setlist options"
            />
          ) : null}
          <MobileModal
            open={subRoutes.some((route) => pathname.includes(route))}
            onClose={() => navigate(".")}
          >
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          {setlist.sets.map((set, i) => (
            <Collapsible
              key={set.id}
              isOpen={isOpen[set.id]}
              header={
                <div className="pb-4">
                  <FlexHeader>
                    <FlexList direction="row" items="center">
                      <Button
                        kind="accent"
                        isOutline
                        onClick={() => handleOpenSet(set.id)}
                      >
                        <FontAwesomeIcon
                          icon={!isOpen[set.id] ? faCompress : faExpand}
                        />
                      </Button>
                      <Label>
                        Set {i + 1} -{" "}
                        {pluralize("minute", getSetLength(set.songs), true)}
                      </Label>
                    </FlexList>
                    <Link
                      to={`data/${set.id}`}
                      isCollapsing
                      isOutline
                      icon={faDatabase}
                    >
                      Data metrics
                    </Link>
                  </FlexHeader>
                </div>
              }
            >
              <FlexList gap={2}>
                {set.songs.map((song) => {
                  if (!song.song) {
                    return null;
                  }
                  return (
                    <SongLink
                      key={song.songId}
                      song={song.song}
                      to={`song/${song.songId}`}
                    />
                  );
                })}
              </FlexList>
            </Collapsible>
          ))}
        </FlexList>
      </MaxWidth>
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
