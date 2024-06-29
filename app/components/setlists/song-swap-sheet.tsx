import { Feel, Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { Search } from "lucide-react";
import { useState } from "react";

import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { FlexList } from "../FlexList";
import { MaxWidth } from "../MaxWidth";
import { SongContainer } from "../song-container";

export const SongSwapSheet = ({
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
      <SheetContent side="bottom">
        <MaxWidth className="space-y-2 max-h-[70vh] overflow-auto">
          <div className="pt-2 px-1 sticky space-y-2 top-0 inset-x-0 bg-card">
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
          <div className="p-1 space-y-1">
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
          </div>
          {filteredSongs.length === 0 ? (
            <Card className="outline-dashed outline-border flex items-center justify-center  border-none h-12">
              <CardDescription className="text-center">
                No songs found
              </CardDescription>
            </Card>
          ) : null}
        </MaxWidth>
      </SheetContent>
    </Sheet>
  );
};
