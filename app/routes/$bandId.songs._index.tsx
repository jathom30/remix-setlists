import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Song } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
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
import toast from "react-hot-toast";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
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
import { SortItems } from "~/components/sort-items";
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import { deleteSong, getSongs } from "~/models/song.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { createToastHeaders } from "~/utils/toast.server";

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
    return json({ success: true }, { headers: toastHeaders });
  }
  return null;
}

export default function SongsList() {
  const showToast = () => {
    toast("Songs updated!", {
      duration: 2000,
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
            <SongContainer.Card key={song.id}>
              <FlexList direction="row" items="center" gap={2}>
                <Link className="w-full" key={song.id} to={song.id}>
                  <SongContainer.Song song={song} />
                </Link>
                <SongActions song={song} />
              </FlexList>
            </SongContainer.Card>
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

const SongActions = ({ song }: { song: SerializeFrom<Song> }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isSub = useMemberRole() === RoleEnum.SUB;
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
            {!isSub ? (
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            ) : null}
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
