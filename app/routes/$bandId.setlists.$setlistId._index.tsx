import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { Feel, Link as PLink, Set, Setlist, Song } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import {
  AreaChart,
  AudioLines,
  Check,
  CircleMinus,
  Copy,
  EllipsisVertical,
  ExternalLink,
  Link as LinkIcon,
  Maximize,
  MicVocal,
  Minimize,
  Pencil,
  Replace,
  Search,
  Shrink,
  Trash,
  X,
} from "lucide-react";
import pluralize from "pluralize";
import { ReactNode, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FlexList, MaxWidth } from "~/components";
import { SongContainer } from "~/components/song-container";
import { H1, Muted, P } from "~/components/typography";
import { useContainerHeight } from "~/hooks/use-container-height";
import {
  copySetlist,
  deleteSetlist,
  getSetlist,
  updateMultiSetSetlist,
  updateSetlist,
  updateSetlistName,
} from "~/models/setlist.server";
import { getSongs } from "~/models/song.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { getDomainUrl } from "~/utils/assorted";
import { DroppableIdEnums, TSet, compareSets, onDragEnd } from "~/utils/dnd";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }

  // const availableSongs = await getSongsNotInSetlist(bandId, setlistId);
  const allSongs = await getSongs(bandId);

  const domainUrl = getDomainUrl(request);
  const setlistLink = `${domainUrl}/${setlist.bandId}/setlists/${setlist.id}`;

  const publicSearchParams = new URLSearchParams();
  publicSearchParams.set("bandId", bandId);
  publicSearchParams.set("setlistId", setlistId);
  const setlistPublicUrl = `${domainUrl}/publicSetlist?${publicSearchParams.toString()}`;
  return json({
    setlist,
    setlistLink,
    allSongs,
    // availableSongs,
    ...(setlist.isPublic ? { setlistPublicUrl } : {}),
  });
}

const IntentSchema = z.enum([
  "update-setlist",
  "update-name",
  "delete-setlist",
  "clone-setlist",
  "create-public-link",
  "remove-public-link",
  "remove-song",
]);

const FormSchema = z.object({
  sets: z.string(),
  intent: z.literal(IntentSchema.Enum["update-setlist"]),
});

const ActionSetSchema = z.record(z.array(z.string()));

const SetlistNameSchema = z
  .object({
    setlist_name: z.string().min(1),
    intent: z.literal(IntentSchema.Enum["update-name"]),
  })
  .required();

const DeleteSetlistSchema = z.object({
  intent: z.literal(IntentSchema.Enum["delete-setlist"]),
});
const CloneSetlistSchema = z.object({
  intent: z.literal(IntentSchema.Enum["clone-setlist"]),
});

const CreatePublicLinkSchema = z.object({
  intent: z.literal(IntentSchema.Enum["create-public-link"]),
});
const RemovePublicLinkSchema = z.object({
  intent: z.literal(IntentSchema.Enum["remove-public-link"]),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentSchema.Enum["update-setlist"]) {
    const submission = parseWithZod(formData, { schema: FormSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const parsedSets = ActionSetSchema.parse(JSON.parse(submission.value.sets));
    const sets = Object.values(parsedSets);
    const updatedSetlist = await updateMultiSetSetlist(setlistId, sets);
    return json({ updatedSetlist });
  }

  if (intent === IntentSchema.Enum["update-name"]) {
    const submission = parseWithZod(formData, { schema: SetlistNameSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }

    const updatedSetlist = await updateSetlistName(
      setlistId,
      submission.value.setlist_name,
    );
    return json({ updatedSetlist });
  }

  if (intent === IntentSchema.Enum["delete-setlist"]) {
    const submission = parseWithZod(formData, { schema: DeleteSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // delete setlist
    await deleteSetlist(setlistId);
    return redirect(`/${bandId}/setlists`);
  }

  if (intent === IntentSchema.Enum["clone-setlist"]) {
    const submission = parseWithZod(formData, { schema: CloneSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // clone setlist
    const newSetlist = await copySetlist(setlistId);
    if (!newSetlist) {
      throw new Response("Failed to clone setlist", { status: 500 });
    }
    return redirect(`/${bandId}/setlists/${newSetlist.id}`);
  }

  if (intent === IntentSchema.Enum["create-public-link"]) {
    const submission = parseWithZod(formData, {
      schema: CreatePublicLinkSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // create public link
    await updateSetlist(setlistId, { isPublic: true });
    return json(submission.payload);
  }

  if (intent === IntentSchema.Enum["remove-public-link"]) {
    const submission = parseWithZod(formData, {
      schema: RemovePublicLinkSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // create public link
    await updateSetlist(setlistId, { isPublic: false });
    return json(submission.payload);
  }

  return null;
}

const FetcherDataSchema = z.object({
  updatedSetlist: z.object({
    id: z.string(),
    name: z.string(),
    sets: z.array(
      z.object({
        id: z.string(),
        songs: z.array(
          z.object({
            positionInSet: z.number(),
            song: z.object({
              id: z.string(),
              name: z.string(),
              length: z.number(),
              isCover: z.boolean(),
              author: z.string(),
              note: z.string().nullable(),
              keyLetter: z.string(),
              isMinor: z.boolean(),
              tempo: z.number(),
              position: z.string(),
              rank: z.string(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
              bandId: z.string(),
              feels: z.array(
                z.object({
                  bandId: z.string(),
                  color: z.string().nullish(),
                  createdAt: z.coerce.date(),
                  id: z.string(),
                  label: z.string(),
                  updatedAt: z.coerce.date(),
                }),
              ),
              links: z.array(z.any()),
            }),
          }),
        ),
      }),
    ),
  }),
});

type TSong = SerializeFrom<Song & { feels: Feel[]; links?: PLink[] }>;

const getAvailableSongs = (
  setlist: SerializeFrom<
    Setlist & { sets: (Set & { songs: { song: Song | null }[] })[] }
  >,
  allSongs: SerializeFrom<Song & { feels: Feel[]; links?: PLink[] }>[],
) => {
  const setlistSongIds = setlist.sets.reduce((songs: string[], set) => {
    const songsInSet = set.songs
      .map((song) => song.song?.id)
      .filter((id): id is string => Boolean(id));
    return [...songs, ...songsInSet];
  }, []);
  return allSongs.filter((song) => !setlistSongIds.includes(song.id));
};

export default function SetlistPage() {
  const { setlist, allSongs } = useLoaderData<typeof loader>();
  const fetcher = useFetcher({ key: `setlist-${setlist.id}` });
  const [showAvailableSongs, setShowAvailableSongs] = useState(false);
  const [songToSwap, setSongToSwap] = useState<{
    setId: string;
    songId: string;
  }>();
  const [query, setQuery] = useState("");

  const availableSongs = getAvailableSongs(setlist, allSongs);

  const intitialSets = setlist.sets.reduce((acc: TSet, set) => {
    const setSongs = set.songs
      ?.filter((song) => Boolean(song) && Boolean(song.song))
      .map((song) => song.song) as TSong[];
    acc[set.id] = setSongs;
    return acc;
  }, {} as TSet);
  const defaultSets = {
    ...intitialSets,
    [DroppableIdEnums.Enum["available-songs"]]: availableSongs,
  };
  const [sets, setSets] = useState<TSet>(defaultSets);
  const filteredSongs =
    sets[DroppableIdEnums.Enum["available-songs"]]?.filter((song) =>
      song.name.toLowerCase().includes(query.toLowerCase()),
    ) || [];

  console.log(sets);

  // update sets when fetcher is done
  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "loading") return;

    const parsedData = FetcherDataSchema.safeParse(fetcher.data);
    if (!parsedData.success) return;
    const returnedSets = parsedData.data.updatedSetlist.sets.reduce(
      (acc: TSet, set) => {
        const setSongs = set.songs
          .filter((song) => Boolean(song) && Boolean(song.song))
          .map((song) => song.song) as unknown as TSong[];
        acc[set.id] = setSongs;
        return acc;
      },
      {} as TSet,
    );
    const songsInSets = Object.values(returnedSets).flat();
    setSets({
      ...returnedSets,
      [DroppableIdEnums.Enum["available-songs"]]: allSongs.filter((song) => {
        return !songsInSets.some((setSong) => setSong.id === song.id);
      }),
    });
  }, [allSongs, fetcher.data, fetcher.state]);

  const [isChangedSetlist, setIsChangedSetlist] = useState(false);

  const handleDragEnd = (drop: DropResult) => {
    setSets((prev) => {
      const updatedSets = onDragEnd(drop, sets)(prev);
      setIsChangedSetlist(compareSets(defaultSets, updatedSets));
      return updatedSets;
    });
  };

  const handleSwapSong = (newSong: SerializeFrom<Song & { feels: Feel[] }>) => {
    setSets((prev) => {
      const updatedSets = { ...prev };
      if (!songToSwap) return updatedSets;
      const { setId, songId } = songToSwap;
      const removedSong = updatedSets[setId].find((song) => song.id === songId);
      if (!removedSong) return updatedSets;
      const updatedSet = updatedSets[setId].map((song) => {
        if (song.id === songId) {
          return newSong;
        }
        return song;
      });
      updatedSets[setId] = updatedSet;
      const updatedAvailableSongs = updatedSets[
        DroppableIdEnums.Enum["available-songs"]
      ].filter((song) => song.id !== newSong.id);
      updatedSets[DroppableIdEnums.Enum["available-songs"]] = [
        ...updatedAvailableSongs,
        removedSong,
      ];
      setIsChangedSetlist(true);
      return updatedSets;
    });
    setSongToSwap(undefined);
  };

  const handleRemoveSong = (setId: string, songId: string) => {
    setSets((prev) => {
      const updatedSets = { ...prev };
      const updatedSet = updatedSets[setId].filter(
        (song) => song.id !== songId,
      );
      // add song to available songs
      const song = sets[setId]?.find((song) => song.id === songId);
      if (!song) return updatedSets;
      updatedSets[DroppableIdEnums.Enum["available-songs"]] = [
        ...updatedSets[DroppableIdEnums.Enum["available-songs"]],
        song,
      ];
      updatedSets[setId] = updatedSet;
      setIsChangedSetlist(compareSets(defaultSets, updatedSets));
      return Object.keys(updatedSets).reduce((acc: TSet, key) => {
        // remove empty sets
        // but keep the "available songs" set and "new" set
        if (
          updatedSets[key].length === 0 &&
          key !== DroppableIdEnums.Enum["available-songs"] &&
          key !== DroppableIdEnums.Enum["new-set"]
        )
          return acc;
        acc[key] = updatedSets[key];
        return acc;
      }, {});
    });
  };

  const onSubmit = () => {
    const reducedSets = Object.entries(sets).reduce(
      (acc: Record<string, string[]>, [setId, set]) => {
        if (setId === DroppableIdEnums.Enum["available-songs"]) return acc;
        const mappedSet = set.map((song) => song.id);
        acc[setId] = mappedSet;
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const formData = {
      sets: JSON.stringify(reducedSets),
      intent: "update-setlist",
    };
    fetcher.submit(formData, {
      method: "post",
    });
    setIsChangedSetlist(false);
  };

  const { containerRef, top } = useContainerHeight();

  const totalSetLength = (set: SerializeFrom<Song>[]) =>
    set.reduce((total, song) => total + song.length, 0);

  return (
    <div
      ref={containerRef}
      style={{
        height: `calc(100svh - ${top}px)`,
      }}
      className="gap-2 flex flex-col"
    >
      <FlexList
        direction="row"
        items="center"
        pad={{ x: 2, t: 2 }}
        gap={2}
        justify="between"
      >
        <H1>{setlist.name}</H1>
        <SetlistActions
          showAvailableSongs={showAvailableSongs}
          onShowAvailableSongChange={setShowAvailableSongs}
        />
      </FlexList>
      <DragDropContext key={setlist.id} onDragEnd={handleDragEnd}>
        <ResizableContainer
          show={showAvailableSongs}
          availableSongs={
            <Card className="h-full px-2 rounded-b-none flex flex-col gap-2 overflow-auto">
              <div className="pt-2 sticky space-y-2 top-0 inset-x-0 bg-card">
                <FlexList
                  direction="row"
                  items="center"
                  gap={2}
                  justify="between"
                >
                  <CardDescription>Available Songs</CardDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAvailableSongs(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </FlexList>
                <div className="relative ml-auto flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Separator />
              </div>
              <Droppable droppableId={DroppableIdEnums.Enum["available-songs"]}>
                {(dropProvided, dropSnapshot) => (
                  <div
                    className="h-full"
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                  >
                    {filteredSongs.map((song, songIndex) => (
                      <Draggable
                        draggableId={song.id}
                        key={song.id}
                        index={songIndex}
                      >
                        {(dragprovided) => (
                          <div
                            className="py-1"
                            ref={dragprovided.innerRef}
                            {...dragprovided.dragHandleProps}
                            {...dragprovided.draggableProps}
                          >
                            <SongContainer.Song.Card>
                              <SongContainer.Song.Song song={song} />
                            </SongContainer.Song.Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {filteredSongs.length === 0 ? (
                      <Card
                        className={`outline-dashed outline-border flex items-center justify-center  border-none h-5/6 ${
                          dropSnapshot.isDraggingOver ? "outline-primary" : ""
                        }`}
                      >
                        <CardDescription className="text-center">
                          No songs found
                        </CardDescription>
                      </Card>
                    ) : null}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          }
        >
          <div className="h-full p-2 rounded-b-none flex flex-col gap-2 overflow-auto">
            {Object.entries(sets)
              .filter(
                ([setId]) => setId !== DroppableIdEnums.Enum["available-songs"],
              )
              .map(([setId, set], index) => (
                <div key={setId} className="pb-4">
                  <Droppable droppableId={setId}>
                    {(dropProvided, dropSnapshot) => (
                      <div
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                        className={
                          dropSnapshot.isDraggingOver
                            ? "outline outline-primary outline-offset-2 rounded bg-card"
                            : ""
                        }
                      >
                        <FlexList
                          direction="row"
                          items="center"
                          justify="between"
                        >
                          <Label
                            className={
                              dropSnapshot.isDraggingOver ? "font-bold" : ""
                            }
                          >
                            Set {index + 1}
                          </Label>
                          <Muted>
                            {pluralize("Minute", totalSetLength(set), true)}
                          </Muted>
                        </FlexList>
                        {set?.map((song, songIndex) => (
                          <Draggable
                            draggableId={song.id}
                            key={song.id}
                            index={songIndex}
                          >
                            {(dragprovided) => (
                              <div
                                className="py-1"
                                ref={dragprovided.innerRef}
                                {...dragprovided.dragHandleProps}
                                {...dragprovided.draggableProps}
                              >
                                <SongContainer.Card>
                                  <FlexList
                                    direction="row"
                                    items="center"
                                    gap={2}
                                  >
                                    <SongContainer.Song song={song} />
                                    <SongActions
                                      song={song}
                                      onSwap={() =>
                                        setSongToSwap({
                                          setId,
                                          songId: song.id,
                                        })
                                      }
                                      onRemove={() =>
                                        handleRemoveSong(setId, song.id)
                                      }
                                    />
                                  </FlexList>
                                </SongContainer.Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {dropProvided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            <Droppable droppableId={DroppableIdEnums.Enum["new-set"]}>
              {(dropProvided, dropSnapshot) => (
                <div
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                >
                  <Card
                    className={`outline-dashed outline-border  border-none ${
                      dropSnapshot.isDraggingOver ? "outline-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardDescription className="text-center">
                        Drag songs here to create a new set
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </ResizableContainer>
        <SongSwapSheet
          open={Boolean(songToSwap)}
          onSubmit={handleSwapSong}
          onOpenChange={() => setSongToSwap(undefined)}
          availableSongs={sets[DroppableIdEnums.Enum["available-songs"]] || []}
        />
      </DragDropContext>
      {isChangedSetlist ? (
        <div className="sticky bottom-2 inset-x-0 bg-card">
          <Card className="p-2">
            <FlexList direction="row" gap={2}>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setSets(defaultSets);
                  setIsChangedSetlist(false);
                }}
              >
                Revert
              </Button>
              <Button className="w-full" onClick={onSubmit}>
                Save Changes?
              </Button>
            </FlexList>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

const SetlistActions = ({
  showAvailableSongs,
  onShowAvailableSongChange,
}: {
  showAvailableSongs: boolean;
  onShowAvailableSongChange: (show: boolean) => void;
}) => {
  const { setlist, setlistLink } = useLoaderData<typeof loader>();
  const [showEditName, setShowEditName] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showPublicLink, setShowPublicLink] = useState(false);

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy);

  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Setlist Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onShowAvailableSongChange(!showAvailableSongs)}
              >
                <AudioLines className="h-4 w-4 mr-2" />
                {showAvailableSongs ? "Hide Available Song Panel" : "Add Songs"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditName(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="metrics">
                  <AreaChart className="h-4 w-4 mr-2" />
                  Metrics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(setlistLink)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPublicLink(true)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {setlist.isPublic ? "View Public Link" : "Create Public Link"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="condensed">
                  <Shrink className="h-4 w-4 mr-2" />
                  Condensed View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowClone(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Clone Setlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDelete(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Setlist
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Setlist Actions</SheetTitle>
            </SheetHeader>
            <FlexList gap={0}>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  onClick={() => onShowAvailableSongChange(!showAvailableSongs)}
                >
                  <AudioLines className="h-4 w-4 mr-2" />
                  {showAvailableSongs
                    ? "Hide Available Song Panel"
                    : "Add Songs"}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={() => setShowEditName(true)} variant="ghost">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Name
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link to="metrics">
                    <AreaChart className="h-4 w-4 mr-2" />
                    Metrics
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => onCopy(setlistLink)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowPublicLink(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {setlist.isPublic ? "View Public Link" : "Create Public Link"}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link to="condensed">
                    <Shrink className="h-4 w-4 mr-2" />
                    Condensed View
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowClone(true)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Setlist
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowDelete(true)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Setlist
                </Button>
              </SheetClose>
            </FlexList>
          </SheetContent>
        </Sheet>
      </div>
      <Dialog open={showEditName} onOpenChange={setShowEditName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>Edit the name of the setlist</DialogDescription>
          </DialogHeader>
          <EditNameForm name={setlist.name}>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowEditName(false)}>
                Save
              </Button>
            </DialogFooter>
          </EditNameForm>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Setlist?</DialogTitle>
            <DialogDescription>
              This is a perminent action and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DeleteSetlistForm>
            <DialogFooter>
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </DialogFooter>
          </DeleteSetlistForm>
        </DialogContent>
      </Dialog>

      <Dialog open={showClone} onOpenChange={setShowClone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Setlist</DialogTitle>
            <DialogDescription>
              Clone this setlist to create a new identical one.
            </DialogDescription>
          </DialogHeader>
          <CloneSetlistForm>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowClone(false)}>
                Clone
              </Button>
            </DialogFooter>
          </CloneSetlistForm>
        </DialogContent>
      </Dialog>

      <PublicLink open={showPublicLink} onOpenChange={setShowPublicLink} />
    </div>
  );
};

const EditNameForm = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["update-name"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SetlistNameSchema });
    },
    defaultValue: {
      setlist_name: name,
      intent: IntentSchema.Enum["update-name"],
    },
  });

  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <div>
        <Label htmlFor={fields.setlist_name.name}>Setlist Name</Label>
        <Input
          {...getInputProps(fields.setlist_name, { type: "text" })}
          placeholder="Setlist name"
        />
        <div
          className="text-sm text-destructive"
          id={fields.setlist_name.errorId}
        >
          {fields.setlist_name.errors}
        </div>
      </div>
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};

const DeleteSetlistForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteSetlistSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["delete-setlist"],
    },
  });

  return (
    <Form
      method="delete"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};

const CloneSetlistForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["clone-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CloneSetlistSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["clone-setlist"],
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
      {children}
    </Form>
  );
};

const PublicLink = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const loaderData = useLoaderData<typeof loader>();
  const publicLink = loaderData.setlistPublicUrl;
  const [showSuccess, setShowSuccess] = useState(false);

  const title = publicLink ? "Public Link" : "Create Public Link";
  const description = publicLink
    ? "Copy the link below to share"
    : "Creating a public link will allow anyone with the link to view a read-only version of the setlist.";

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy).then(() => setShowSuccess(true));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {publicLink ? (
          <FlexList gap={2}>
            <Button
              variant="outline"
              onClick={() => onCopy(publicLink)}
              onMouseLeave={() => setShowSuccess(false)}
            >
              {showSuccess ? (
                "Copied!"
              ) : (
                <span className="truncate max-w-xs">{publicLink}</span>
              )}
              {showSuccess ? (
                <Check className="w-4 h-4 ml-2" />
              ) : (
                <ExternalLink className="w-4 h-4 ml-2" />
              )}
            </Button>
            <FlexList items="center" gap={0}>
              <QRCode value={publicLink} />
            </FlexList>
          </FlexList>
        ) : null}
        {publicLink ? (
          <RemovePublicLinkForm>
            <DialogFooter>
              <Button type="submit" variant="secondary">
                Remove Public Link
              </Button>
            </DialogFooter>
          </RemovePublicLinkForm>
        ) : (
          <CreatePublicLinkForm>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </CreatePublicLinkForm>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CreatePublicLinkForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["create-public-link"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreatePublicLinkSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["create-public-link"],
    },
  });
  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
    >
      <Input {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};

const RemovePublicLinkForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["remove-public-link"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RemovePublicLinkSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["remove-public-link"],
    },
  });
  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
    >
      <Input {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};

const ResizableContainer = ({
  show,
  children,
  availableSongs,
}: {
  show: boolean;
  children: ReactNode;
  availableSongs: ReactNode;
}) => {
  if (!show) return children;
  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>{children}</ResizablePanel>
      <ResizableHandle withHandle className="bg-inherit" />
      <ResizablePanel defaultSize={40}>{availableSongs}</ResizablePanel>
    </ResizablePanelGroup>
  );
};

const SongActions = ({
  song,
  onRemove,
  onSwap,
}: {
  song: TSong;
  onRemove: () => void;
  onSwap: () => void;
}) => {
  const { setlistId } = useParams();
  const [showDetails, setShowDetails] = useState(false);
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
            <DropdownMenuItem onClick={() => setShowDetails(true)}>
              <MicVocal className="h-4 w-4 mr-2" />
              Details
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to={{
                  pathname: `/${song.bandId}/songs/${song.id}/edit`,
                  search: `?redirectTo=${`/${song.bandId}/setlists/${setlistId}`}`,
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSwap}>
              <Replace className="h-4 w-4 mr-2" />
              Swap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRemove}>
              <CircleMinus className="h-4 w-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SongDetailsSheet
        song={song}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </div>
  );
};

const SongDetailsSheet = ({
  song,
  open,
  onOpenChange,
}: {
  song: TSong;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { setlistId } = useParams();
  const [expandNotes, setExpandNotes] = useState(false);

  const splitNote = song.note?.split("\n");
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <MaxWidth>
          <div className="space-y-2 max-h-[70vh] overflow-auto">
            <div className="sticky top-0 bg-card p-2 pt-4">
              <FlexList direction="row" justify="between" items="center">
                <H1>Song Details</H1>
                <Button asChild>
                  <Link
                    to={{
                      pathname: `/${song.bandId}/songs/${song.id}/edit`,
                      search: `?redirectTo=${`/${song.bandId}/setlists/${setlistId}`}`,
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Song
                  </Link>
                </Button>
              </FlexList>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{song.name}</CardTitle>
                <CardDescription>{song.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Length</Label>
                    <P>{pluralize("minute", song.length, true)}</P>
                  </div>
                  <div>
                    <Label>Key</Label>
                    <P>
                      {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
                    </P>
                  </div>
                  <div>
                    <Label>Tempo</Label>
                    <P>{song.tempo} BPM</P>
                  </div>
                </div>
                {song.feels?.length ? (
                  <div className="pt-4">
                    <Label>Feels</Label>
                    <FlexList direction="row" wrap>
                      {song.feels?.map((feel) => (
                        <P key={feel.id}>
                          <span className="flex flex-row items-center gap-1">
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ background: feel.color || undefined }}
                            />
                            {feel.label}
                          </span>
                        </P>
                      ))}
                    </FlexList>
                  </div>
                ) : null}
              </CardContent>
            </Card>
            {splitNote?.length ? (
              <Card>
                <CardHeader>
                  <FlexList direction="row" justify="between" items="center">
                    <CardTitle>Lyrics/Notes</CardTitle>
                    <Button
                      onClick={() => setExpandNotes((prev) => !prev)}
                      variant="ghost"
                      title={
                        expandNotes
                          ? "Collapse note section"
                          : "Expand note section"
                      }
                    >
                      {expandNotes ? (
                        <Maximize className="w-4 h-4" />
                      ) : (
                        <Minimize className="w-4 h-4" />
                      )}
                    </Button>
                  </FlexList>
                </CardHeader>
                <CardContent>
                  {expandNotes ? (
                    splitNote.map((note, i) => <P key={i}>{note}</P>)
                  ) : (
                    <ScrollArea className="p-2 h-24">
                      {splitNote.map((note, i) => (
                        <P key={i}>{note}</P>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            ) : null}
            {song.links?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <FlexList items="start">
                    {song.links.map((link) => (
                      <Button asChild variant="link" key={link.id}>
                        <a href={link.href} target="_blank" rel="noreferrer">
                          {link.href}
                        </a>
                      </Button>
                    ))}
                  </FlexList>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </MaxWidth>
      </SheetContent>
    </Sheet>
  );
};

const SongSwapSheet = ({
  availableSongs,
  onSubmit,
  onOpenChange,
  open,
}: {
  availableSongs: SerializeFrom<Song & { feels: Feel[] }>[];
  onSubmit: (newSongId: SerializeFrom<Song & { feels: Feel[] }>) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const [query, setQuery] = useState("");
  const filteredSongs = availableSongs.filter((song) =>
    song.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="space-y-2" side="bottom">
        <div className="pt-2 sticky space-y-2 top-0 inset-x-0 bg-card">
          <FlexList direction="row" items="center" gap={2} justify="between">
            <CardDescription>Available Songs</CardDescription>
          </FlexList>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Separator />
        </div>
        {filteredSongs.map((song) => (
          <button
            className="w-full"
            key={song.id}
            onClick={() => onSubmit(song)}
          >
            <SongContainer.Song.Card key={song.id}>
              <SongContainer.Song.Song song={song} />
            </SongContainer.Song.Card>
          </button>
        ))}
        {filteredSongs.length === 0 ? (
          <Card className="outline-dashed outline-border flex items-center justify-center  border-none h-12">
            <CardDescription className="text-center">
              No songs found
            </CardDescription>
          </Card>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
