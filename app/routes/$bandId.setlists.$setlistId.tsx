import { parseWithZod } from "@conform-to/zod";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { Song } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FlexList } from "~/components";
import { SongContainer } from "~/components/song-container";
import { H1 } from "~/components/typography";
import { getSetlist, updateMultiSetSetlist } from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { DroppableIdEnums, TSet, compareSets, onDragEnd } from "~/utils/dnd";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { setlistId } = params;
  invariant(setlistId, "setlistId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  return json({ setlist });
}

const FormSchema = z.record(z.string());

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  // string array is serialized as comma separated string onSubmit
  const sets = Object.entries(submission.value).map(([, songIds]) =>
    songIds.split(","),
  );
  await updateMultiSetSetlist(setlistId, sets);
  return null;
}

export default function SetlistPage() {
  const { setlist } = useLoaderData<typeof loader>();

  const defaultSets = setlist.sets.reduce((acc: TSet, set) => {
    const setSongs = set.songs
      .filter((song) => Boolean(song) && Boolean(song.song))
      .map((song) => song.song) as SerializeFrom<Song>[];
    acc[set.id] = setSongs;
    return acc;
  }, {} as TSet);
  const [sets, setSets] = useState<TSet>(defaultSets);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleDragEnd = (drop: DropResult) => {
    setSets((prev) => {
      const updatedSets = onDragEnd(drop, sets)(prev);
      setIsUpdated(compareSets(defaultSets, updatedSets));
      return updatedSets;
    });
  };

  const fetcher = useFetcher({ key: `setlist-${setlist.id}` });

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
      ...reducedSets,
    };
    fetcher.submit(formData, { method: "post" });
    setIsUpdated(false);
  };

  return (
    <div className="p-2 space-y-2">
      <H1>Setlist</H1>
      <DragDropContext key={setlist.id} onDragEnd={handleDragEnd}>
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
                    <Label
                      className={dropSnapshot.isDraggingOver ? "font-bold" : ""}
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
            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
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
      </DragDropContext>
      {isUpdated ? (
        <div className="sticky bottom-2 inset-x-0 bg-card">
          <Card className="p-2">
            <FlexList>
              <Button onClick={onSubmit}>Save Changes?</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSets(defaultSets);
                  setIsUpdated(false);
                }}
              >
                Revert
              </Button>
            </FlexList>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
