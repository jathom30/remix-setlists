import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, MetaFunction, useSearchParams } from "@remix-run/react";
import { CirclePlus, SearchIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { FlexList } from "~/components";
import { SongContainer } from "~/components/song-container";
import { SortItems } from "~/components/sort-items";
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import { getSongs } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { getColor } from "~/utils/tailwindColors";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const url = new URL(request.url);
  const q = url.searchParams.get("query");

  let sort = url.searchParams.get("sort");

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  if (cookie && typeof cookie === "object" && "songSort" in cookie) {
    sort = String(cookie.songSort);
  }

  const songParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
  };

  const songs = await getSongs(bandId, songParams);
  cookie.songSort = sort;
  await userPrefs.serialize(cookie);
  return json({ songs, sort });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Songs" }];
};

export default function SongsList() {
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
  const memberRole = useMemberRole();
  const isSub = memberRole === RoleEnum.SUB;

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const setQuery = (value: string) => {
    setSearchParams((prev) => {
      prev.set("query", value);
      return prev;
    });
  };

  const setSort = (value: string) => {
    setSearchParams((prev) => {
      prev.set("sort", value);
      return prev;
    });
  };

  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <H1>Songs</H1>
        {!isSub ? (
          <Button asChild>
            <Link to="new">
              <CirclePlus className="h-4 w-4 mr-2" />
              Create Song
            </Link>
          </Button>
        ) : null}
      </FlexList>

      <FlexList direction="row" items="center" justify="end" gap={2}>
        <div className="relative ml-auto flex-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SortItems value={sort || "updatedAt:desc"} onChange={setSort} />
      </FlexList>

      {songs.length ? (
        <FlexList gap={1}>
          {songs.map((song) => (
            <Link key={song.id} to={song.id}>
              <SongContainer.Card>
                <SongContainer.Song song={song} />
              </SongContainer.Card>
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
            ) : !isSub ? (
              <Button asChild>
                <Link to="new">Create your first song here</Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
