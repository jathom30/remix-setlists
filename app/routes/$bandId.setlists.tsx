import {
  faArrowDownWideShort,
  faArrowUpAZ,
  faArrowUpWideShort,
  faArrowUpZA,
  faBoxOpen,
  faMagnifyingGlass,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
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
import toast from "react-hot-toast";
import invariant from "tiny-invariant";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import { getSetlists } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useFeatureFlags, useMemberRole } from "~/utils";
import { capitalizeFirstLetter } from "~/utils/assorted";
import { RoleEnum } from "~/utils/enums";
import { getSortFromParam } from "~/utils/params";
import { getColor } from "~/utils/tailwindColors";

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
  const { rebranding } = useFeatureFlags();
  if (rebranding) {
    return <SetlistsNew />;
  }
  return <SetlistsOld />;
}

function SetlistsNew() {
  const showToast = () => {
    toast("Setlists updated!", {
      duration: 2000,
      style: {
        backgroundColor: getColor("success"),
        color: getColor("success-content"),
      },
    });
  };
  const { setlists, sort } = useLiveLoader<typeof loader>(showToast);

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const setQuery = (value: string) => {
    setSearchParams((prev) => {
      prev.set("query", value);
      return prev;
    });
  };

  return (
    <MaxWidth>
      <div className="p-2 space-y-2">
        <H1>Setlists</H1>

        <FlexList direction="row" items="center" justify="end" gap={2}>
          <div className="relative ml-auto flex-1 md:grow-0">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <SortSetlists value={sort || ""} onChange={console.log} />
        </FlexList>

        {setlists.length ? (
          <FlexList gap={2}>
            {setlists.map((setlist) => (
              <SetlistLink
                key={setlist.id}
                setlist={setlist}
                publicRemark="You can remove the public link by clicking on this setlist's settings."
              />
            ))}
          </FlexList>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No setlists Found</CardTitle>
              <CardDescription>
                {query
                  ? "We couldn't find any setlists matching your search."
                  : "This band has no setlists yet."}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              {query ? (
                <Button onClick={() => setQuery("")} variant="secondary">
                  Clear search
                </Button>
              ) : (
                <Button asChild>
                  <Link to=".">Create your first setlist here</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </MaxWidth>
  );
}

const sortOptions = [
  {
    label: "Updated: Newest first",
    value: "updated-desc",
    icon: faArrowUpWideShort,
  },
  {
    label: "Updated: Oldest first",
    value: "updated-asc",
    icon: faArrowDownWideShort,
  },
  { label: "Name: A-Z", value: "name-asc", icon: faArrowUpAZ },
  { label: "Name: Z-A", value: "name-desc", icon: faArrowUpZA },
];

const SortSetlists = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <FontAwesomeIcon icon={faSort} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Setlist Sort</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                defaultValue={value}
                onValueChange={onChange}
              >
                {sortOptions.map(({ label, value: val, icon }) => (
                  <DropdownMenuRadioItem key={val} value={val}>
                    <FontAwesomeIcon icon={icon} className="mr-2" />
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <FontAwesomeIcon icon={faSort} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Setlist Sort</SheetTitle>
              <SheetDescription>
                <RadioGroup defaultValue={value} onValueChange={onChange}>
                  <FlexList gap={0}>
                    {sortOptions.map(({ label, value: val, icon }) => (
                      <div
                        key={val}
                        className="p-2 rounded hover:bg-accent hover:text-accent-foreground"
                      >
                        <FlexList direction="row" items="center" gap={2}>
                          <RadioGroupItem value={val} id={val} />
                          <Label className="w-full text-start" htmlFor={val}>
                            <FontAwesomeIcon icon={icon} className="mr-2" />
                            {label}
                          </Label>
                        </FlexList>
                      </div>
                    ))}
                  </FlexList>
                </RadioGroup>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

function SetlistsOld() {
  const showToast = () => {
    toast("Setlists updated!", {
      duration: 2000,
      style: {
        backgroundColor: getColor("success"),
        color: getColor("success-content"),
      },
    });
  };
  const { setlists, sort: serverSort } =
    useLiveLoader<typeof loader>(showToast);
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
