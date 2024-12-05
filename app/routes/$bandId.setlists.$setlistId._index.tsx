import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { FoldVertical, Search, UnfoldVertical, X } from "lucide-react";
import pluralize from "pluralize";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FlexList } from "~/components";
import { DraggableSong } from "~/components/dnd";
import { AvailableSongsCardDesktop } from "~/components/dnd/available-songs-card-desktop";
import { setlistAction } from "~/components/setlists/action.server";
import { setlistLoader } from "~/components/setlists/loader.server";
import { ResizableSetlistContainer } from "~/components/setlists/resizeable-setlist-container";
import { SetlistActions } from "~/components/setlists/setlist-actions";
import { SongActions } from "~/components/setlists/song-actions";
import { SongSwapSheet } from "~/components/setlists/song-swap-sheet";
import { SongContainer } from "~/components/song-container";
import { H1, Muted } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { useContainerHeight } from "~/hooks/use-container-height";
import { useMemberRole } from "~/utils";
import {
  DroppableIdEnums,
  compareSets,
  getAvailableSongs,
  onDragEnd,
} from "~/utils/dnd";
import { RoleEnum } from "~/utils/enums";
import { totalSetLength } from "~/utils/sets";

export async function loader(args: LoaderFunctionArgs) {
  return await setlistLoader(args);
}

type TLoader = ReturnType<typeof useLoaderData<typeof loader>>;
export type TSong = TLoader["allSongs"][number];
export type TSet = Record<string, TSong[]>;

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.setlist.name || "Setlist Detail" }];
};

export async function action(args: ActionFunctionArgs) {
  return setlistAction(args);
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

export default function SetlistPage() {
  const { setlist, allSongs } = useLiveLoader<typeof loader>();
  const isSub = useMemberRole() === RoleEnum.SUB;

  const fetcher = useFetcher({ key: `setlist-${setlist.id}` });
  const [showAvailableSongs, setShowAvailableSongs] = useState(false);
  const [songToSwap, setSongToSwap] = useState<{
    setId: string;
    songId: string;
  }>();
  const [query, setQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth > 900;

  const availableSongs = getAvailableSongs(setlist, allSongs);

  const intitialSets = setlist.sets.reduce((acc: TSet, set) => {
    const setSongs = set.songs
      ?.filter((song) => Boolean(song) && Boolean(song.song))
      .map((song) => song.song) as unknown as TSong[];
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

  const [collapsed, setCollapsed] = useState<string[]>(Object.keys(sets));
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
    if (isSub) return;
    setSets((prev) => {
      const updatedSets = onDragEnd(drop, sets)(prev);
      setIsChangedSetlist(compareSets(defaultSets, updatedSets));
      return updatedSets;
    });
  };

  const handleSwapSong = (newSong: TSong) => {
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

  if (isDesktop) {
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
            isDesktop={isDesktop}
          />
        </FlexList>
        <DragDropContext key={setlist.id} onDragEnd={handleDragEnd}>
          <div className="grid h-full grid-cols-3 gap-2 p-2 overflow-hidden max-w-5xl">
            <AvailableSongsCardDesktop
              query={query}
              setQuery={setQuery}
              songs={filteredSongs}
            />
            <div className="h-full w-full px-1 flex flex-col gap-2 col-span-2 overflow-auto">
              {Object.entries(sets)
                .filter(
                  ([setId]) =>
                    setId !== DroppableIdEnums.Enum["available-songs"],
                )
                .map(([setId, set], index) => (
                  <div key={setId}>
                    <Collapsible
                      open={collapsed.includes(setId)}
                      onOpenChange={(val) =>
                        setCollapsed((prev) =>
                          val
                            ? [...prev, setId]
                            : prev.filter((id) => id !== setId),
                        )
                      }
                    >
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
                            <div className="sticky top-0 bg-background border-b flex gap-2 pb-1 items-center">
                              <CollapsibleTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  {collapsed.includes(setId) ? (
                                    <FoldVertical size={20} />
                                  ) : (
                                    <UnfoldVertical size={20} />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <FlexList
                                direction="row"
                                items="center"
                                justify="between"
                                width="full"
                              >
                                <Label
                                  className={
                                    dropSnapshot.isDraggingOver
                                      ? "font-bold"
                                      : ""
                                  }
                                >
                                  Set {index + 1}
                                </Label>
                                <Muted>
                                  {pluralize(
                                    "Minute",
                                    totalSetLength(set),
                                    true,
                                  )}
                                </Muted>
                              </FlexList>
                            </div>
                            <CollapsibleContent>
                              {set?.map((song, songIndex) => (
                                <DraggableSong
                                  key={song.id}
                                  song={song}
                                  songIndex={songIndex}
                                >
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
                                </DraggableSong>
                              ))}
                            </CollapsibleContent>
                            {dropProvided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </Collapsible>
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
          </div>
          <SongSwapSheet
            open={Boolean(songToSwap)}
            onSubmit={handleSwapSong}
            onOpenChange={() => setSongToSwap(undefined)}
            availableSongs={
              sets[DroppableIdEnums.Enum["available-songs"]] || []
            }
          />
        </DragDropContext>
        {isChangedSetlist ? (
          <div className="sticky bottom-2 inset-x-0 bg-card">
            <Card className="p-2 mx-2">
              <FlexList justify="end" direction="row" gap={2}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSets(defaultSets);
                    setIsChangedSetlist(false);
                  }}
                >
                  Revert
                </Button>
                {!isSub ? (
                  <Button onClick={onSubmit}>Save Changes?</Button>
                ) : null}
              </FlexList>
            </Card>
          </div>
        ) : null}
      </div>
    );
  }
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
        <ResizableSetlistContainer
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
                        key={`${song.id}-${songIndex}`}
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
          <div className="h-full px-2 rounded-b-none flex flex-col gap-1 overflow-auto">
            {Object.entries(sets)
              .filter(
                ([setId]) => setId !== DroppableIdEnums.Enum["available-songs"],
              )
              .map(([setId, set], index) => (
                <div key={setId}>
                  <Collapsible
                    open={collapsed.includes(setId)}
                    onOpenChange={(val) =>
                      setCollapsed((prev) =>
                        val
                          ? [...prev, setId]
                          : prev.filter((id) => id !== setId),
                      )
                    }
                  >
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
                          <div className="sticky top-0 bg-background border-b flex gap-2 pb-1 items-center">
                            <CollapsibleTrigger asChild>
                              <Button size="icon" variant="ghost">
                                {collapsed.includes(setId) ? (
                                  <FoldVertical size={20} />
                                ) : (
                                  <UnfoldVertical size={20} />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <FlexList
                              direction="row"
                              items="center"
                              justify="between"
                              width="full"
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
                          </div>
                          <CollapsibleContent>
                            {set?.map((song, songIndex) => (
                              <DraggableSong
                                key={song.id}
                                song={song}
                                songIndex={songIndex}
                              >
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
                              </DraggableSong>
                            ))}
                          </CollapsibleContent>
                          {dropProvided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Collapsible>
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
        </ResizableSetlistContainer>
        <SongSwapSheet
          open={Boolean(songToSwap)}
          onSubmit={handleSwapSong}
          onOpenChange={() => setSongToSwap(undefined)}
          availableSongs={sets[DroppableIdEnums.Enum["available-songs"]] || []}
        />
      </DragDropContext>
      {isChangedSetlist ? (
        <div className="sticky bottom-2 inset-x-0 bg-card">
          <Card className="p-2 mx-1">
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
              {!isSub ? (
                <Button className="w-full" onClick={onSubmit}>
                  Save Changes?
                </Button>
              ) : null}
            </FlexList>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
