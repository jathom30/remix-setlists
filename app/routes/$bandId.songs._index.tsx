import {
  faArrowDownWideShort,
  faArrowUpAZ,
  faArrowUpWideShort,
  faArrowUpZA,
  faBackwardStep,
  faForwardStep,
  faMagnifyingGlass,
  faPlusCircle,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Song } from "@prisma/client";
import { LoaderFunctionArgs, SerializeFrom, json } from "@remix-run/node";
import { Link, MetaFunction, useSearchParams } from "@remix-run/react";
import toast from "react-hot-toast";
import invariant from "tiny-invariant";

import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FlexList } from "~/components";
import { H1, Large, Muted, P, Small } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { getColor } from "~/utils/tailwindColors";

export const meta: MetaFunction = () => [
  {
    title: "Songs",
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const url = new URL(request.url);
  const q = url.searchParams.get("query");

  let sort = url.searchParams.get("sort");
  const feelParams = url.searchParams.getAll("feels");
  const tempoParams = url.searchParams.getAll("tempos");
  const isCoverParam = url.searchParams.get("isCover");
  const positionParams = url.searchParams.getAll("positions");

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  if (cookie && typeof cookie === "object" && "songSort" in cookie) {
    sort = String(cookie.songSort);
  }

  const songParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
    feels: feelParams,
    tempos: tempoParams.map((tempo) => parseInt(tempo)),
    ...(isCoverParam ? { isCover: isCoverParam === "true" } : null),
    positions: positionParams,
  };

  const songs = await getSongs(bandId, songParams);

  return json({ songs, sort });
}

export default function SongsIndex() {
  return <SongsListNew />;
}

function SongsListNew() {
  const showToast = () => {
    toast("Songs updated!", {
      duration: 2000,
      style: {
        backgroundColor: getColor("success"),
        color: getColor("success-content"),
      },
    });
  };
  const { songs, sort } = useLiveLoader<typeof loader>(showToast);

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const setQuery = (value: string) => {
    setSearchParams((prev) => {
      prev.set("query", value);
      return prev;
    });
  };
  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <H1>Songs</H1>
        <Button asChild>
          <Link to="new">
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Create Song
          </Link>
        </Button>
      </FlexList>

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

      {songs.length ? (
        <FlexList gap={2}>
          {songs.map((song) => (
            <Link key={song.id} to={song.id}>
              <SongContainer song={song} />
            </Link>
          ))}
        </FlexList>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Songs Found</CardTitle>
            <CardDescription>
              {query
                ? "We couldn't find any songs matching your search."
                : "This band has no songs yet."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {query ? (
              <Button onClick={() => setQuery("")} variant="secondary">
                Clear search
              </Button>
            ) : (
              <Button asChild>
                <Link to="new">Create your first song here</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

const SongContainer = ({ song }: { song: SerializeFrom<Song> }) => {
  const positionIcon =
    {
      opener: faBackwardStep,
      closer: faForwardStep,
    }[song.position] || null;
  const positionText =
    {
      opener:
        "This song is marked as an opener when automatically generating setlists.",
      closer:
        "This song is marked as a closer when automatically generating setlists.",
    }[song.position] || "";
  return (
    <Card className="p-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Large>{song.name}</Large>
        <FlexList direction="row" items="center" gap={2}>
          <Muted>{song.tempo} BPM</Muted>
          <Muted>{song.length} minutes</Muted>
        </FlexList>
      </FlexList>
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <Small>{song.author}</Small>
        <FlexList direction="row" gap={2} items="center">
          {positionIcon ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <FontAwesomeIcon icon={positionIcon} />
                </TooltipTrigger>
                <TooltipContent>
                  <P>{positionText}</P>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <Badge variant="outline">
            {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
          </Badge>
        </FlexList>
      </FlexList>
    </Card>
  );
};

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
