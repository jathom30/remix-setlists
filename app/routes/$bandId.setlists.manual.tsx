import { parseWithZod } from "@conform-to/zod";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { FlexList } from "~/components";
import { SongContainer } from "~/components/song-container";
import { H1 } from "~/components/typography";
import { useContainerHeight } from "~/hooks/use-container-height";
import { createMultiSetSetlist } from "~/models/setlist.server";
import { getSongs } from "~/models/song.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { DroppableIdEnums, TSet, onDragEnd } from "~/utils/dnd";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const songs = await getSongs(bandId);

  return json({ songs });
}

const FormSchema = z.record(z.string());

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  // string array is serialized as comma separated string onSubmit
  const sets = Object.entries(submission.value)
    .filter(([key]) => key !== "setlist_name")
    .map(([, songIds]) => songIds.split(","));
  const name = Object.entries(submission.value).find(
    ([key]) => key === "setlist_name",
  )?.[1];
  const setlist = await createMultiSetSetlist(bandId, sets, name);

  return redirect(`/${bandId}/setlists/${setlist.id}`);
}

export default function ManualCreateSetlist() {
  const { songs } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");
  const { containerRef, top } = useContainerHeight();

  const [sets, setSets] = useState<TSet>({
    [DroppableIdEnums.Enum["available-songs"]]: songs,
  });

  const filteredSongs = sets[DroppableIdEnums.Enum["available-songs"]].filter(
    (song) => song.name.toLowerCase().includes(query.toLowerCase()),
  );

  const handleDragEnd = (drop: DropResult) => setSets(onDragEnd(drop, sets));

  const fetcher = useFetcher({ key: "manual-setlist-create" });

  const onSubmit = (setlistName: string) => {
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
      ...reducedSets,
      setlist_name: setlistName,
    };
    fetcher.submit(formData, { method: "post" });
  };

  const isDisabledSubmit = Object.entries(sets)
    .filter(([setId]) => setId !== DroppableIdEnums.Enum["available-songs"])
    .every(([, set]) => set.length === 0);

  return (
    <div
      ref={containerRef}
      className={`gap-2 flex flex-col`}
      style={{
        height: `calc(100svh - ${top}px)`,
      }}
    >
      <div className="p-2 pb-0">
        <H1>Manual</H1>
      </div>
      <DragDropContext key="setlist" onDragEnd={handleDragEnd}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>
            <div className="h-full p-2 rounded-b-none flex flex-col gap-2 overflow-auto">
              {Object.entries(sets)
                .filter(
                  ([setId]) =>
                    setId !== DroppableIdEnums.Enum["available-songs"],
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
                          <Label
                            className={
                              dropSnapshot.isDraggingOver ? "font-bold" : ""
                            }
                          >
                            Set {index + 1}
                          </Label>
                          {set.map((song, songIndex) => (
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
                                  <SongContainer song={song} />
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
                          Drop songs here to create a new set
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-inherit" />
          <ResizablePanel defaultSize={40}>
            <Card className="h-full px-2 rounded-b-none flex flex-col gap-2 overflow-auto">
              <div className="pt-2 sticky space-y-2 top-0 inset-x-0 bg-card">
                <CardDescription>Available Songs</CardDescription>
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
                            <SongContainer song={song} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {filteredSongs.length === 0 ? (
                      <Card
                        className={`outline-dashed outline-border flex items-center justify-center  border-none h-full ${
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </DragDropContext>
      <FlexList pad={2}>
        <SetlistNameDialog onSubmit={onSubmit} disabled={isDisabledSubmit} />
      </FlexList>
    </div>
  );
}

const SetlistNameDialog = ({
  onSubmit,
  disabled = true,
}: {
  onSubmit: (name: string) => void;
  disabled?: boolean;
}) => {
  const [name, setName] = useState("");
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(name);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Save</Button>
      </DialogTrigger>
      <DialogContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Last Step</DialogTitle>
            <DialogDescription>
              Give your setlist a name so you can find it later
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              placeholder="Setlist name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create Setlist</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
