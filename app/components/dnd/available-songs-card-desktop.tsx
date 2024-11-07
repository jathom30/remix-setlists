import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Feel, Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Search } from "lucide-react";

import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DroppableIdEnums } from "~/utils/dnd";

import { SongContainer } from "../song-container";

export const AvailableSongsCardDesktop = ({
  query,
  setQuery,
  songs,
}: {
  query: string;
  setQuery: (query: string) => void;
  songs: SerializeFrom<Song & { feels: Feel[] }>[];
}) => {
  return (
    <Card className="h-full flex-grow px-2 flex flex-col gap-2 overflow-auto w-full">
      <div className="pt-2 sticky space-y-2 top-0 inset-x-0 bg-card">
        <CardDescription>Available Songs</CardDescription>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8"
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
            {songs.map((song, songIndex) => (
              <Draggable draggableId={song.id} key={song.id} index={songIndex}>
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
            {songs.length === 0 ? (
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
  );
};
