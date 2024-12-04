import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Song } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  data,
} from "@remix-run/node";
import { Form, Link, MetaFunction, useSearchParams } from "@remix-run/react";
import {
  CirclePlus,
  EllipsisVertical,
  Pencil,
  SearchIcon,
  Trash,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FlexList } from "~/components";
import { SongContainer } from "~/components/song-container";
import { SongFilters, useSongFilters } from "~/components/song-filters";
import { SortItems } from "~/components/sort-items";
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { getThinFeels } from "~/models/feel.server";
import { deleteSong, getSongs } from "~/models/song.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";
import { updateSortCookie } from "~/utils/sort-cookie.server";
import { createToastHeaders } from "~/utils/toast.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const url = new URL(request.url);
  const q = url.searchParams.get("query");

  const sortQuery = url.searchParams.get("sort");
  const { header, sort } = await updateSortCookie({
    request,
    sortQuery,
    defaultSort: "updatedAt:desc",
    cookieKey: "songSort",
  });

  const songParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
  };

  const songs = await getSongs(bandId, songParams);
  const feels = await getThinFeels(bandId);
  return data({ songs, sort, feels }, { headers: header });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Songs" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete-song") {
    await requireNonSubMember(request, bandId);
    const submission = parseWithZod(formData, { schema: DeleteSongSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await deleteSong(submission.value.song_id);
    const toastHeaders = await createToastHeaders({
      title: "Deleted!",
      description: "This song has been deleted successfully.",
      type: "success",
    });
    emitter.emit(emitterKeys.songs);
    emitter.emit(emitterKeys.dashboard);
    return data({ success: true }, { headers: toastHeaders });
  }
  return null;
}

export default function SongsList() {
  const {
    data: { songs, sort, feels },
  } = useLiveLoader<typeof loader>(() => toast("Songs updated"));
  const isSub = useMemberRole() === RoleEnum.SUB;

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    filters: { artist, selectedFeels, position, tempo },
    filterParams: { artistParam, feelsParam, positionParam, tempoParam },
    hasFilters,
    onClear,
    onSubmit,
    onChange,
    submitOnChange,
  } = useSongFilters();

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

  const filteredSongs = songs.filter((song) => {
    if (tempoParam.min && (song.tempo || 0) < tempoParam.min) {
      return false;
    }
    if (tempoParam.max && (song.tempo || 0) > tempoParam.max) {
      return false;
    }
    if (
      positionParam.length &&
      !positionParam.includes(song.position as "opener" | "closer" | "other")
    ) {
      return false;
    }
    if (
      feelsParam.length &&
      !song.feels.some((f) => feelsParam.includes(f.id))
    ) {
      return false;
    }
    if (
      artistParam &&
      !song.author?.toLowerCase().includes(artistParam.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

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
        <div className="md:hidden">
          <SongFilters
            onClear={onClear}
            onSubmit={onSubmit}
            hasFilters={hasFilters}
          >
            <SongFilters.Body
              feelOptions={feels}
              filters={{
                artist,
                position,
                tempo,
                feels: selectedFeels,
              }}
              onChange={onChange}
            />
          </SongFilters>
        </div>
        <SortItems value={sort || "updatedAt:desc"} onChange={setSort} />
      </FlexList>
      <div className="flex gap-2">
        <div className="hidden md:block">
          <Card>
            <CardHeader className="p-4">
              <CardDescription>Song Filters</CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <SongFilters.Body
                feelOptions={feels}
                filters={{
                  artist,
                  position,
                  tempo,
                  feels: selectedFeels,
                }}
                onChange={submitOnChange}
              />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="secondary" className="w-full" onClick={onClear}>
                Clear
              </Button>
            </CardFooter>
          </Card>
        </div>
        {filteredSongs.length ? (
          <FlexList gap={1} width="full">
            {filteredSongs.map((song) => (
              <SongContainer.Card key={song.id}>
                <FlexList direction="row" items="center" gap={2}>
                  <Link className="w-full" key={song.id} to={song.id}>
                    <SongContainer.Song song={song} />
                  </Link>
                  {!isSub ? <SongActions song={song} /> : null}
                </FlexList>
              </SongContainer.Card>
            ))}
          </FlexList>
        ) : (
          <Card className="w-full">
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
    </div>
  );
}

const SongActions = ({ song }: { song: SerializeFrom<Song> }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Song Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                to={{
                  pathname: `/${song.bandId}/songs/${song.id}/edit`,
                  search: `redirectTo=${`/${song.bandId}/songs`}`,
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Song?</DialogTitle>
            <DialogDescription>
              This is a perminent action and cannot be undone. This song will be
              removed from all associated setlists.
            </DialogDescription>
          </DialogHeader>
          <DeleteSongForm id={song.id}>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowDeleteDialog(false)}>
                Delete
              </Button>
            </DialogFooter>
          </DeleteSongForm>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DeleteSongSchema = z.object({
  song_id: z.string().min(1),
  intent: z.literal("delete-song"),
});

const DeleteSongForm = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: "delete-song",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteSongSchema });
    },
    defaultValue: {
      song_id: id,
      intent: "delete-song",
    },
  });

  return (
    <Form
      method="post"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      <input hidden {...getInputProps(fields.song_id, { type: "hidden" })} />
      {children}
    </Form>
  );
};
