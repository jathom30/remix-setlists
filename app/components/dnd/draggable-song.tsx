import { Draggable } from "@hello-pangea/dnd";
import { ReactNode } from "react";

import { TSong } from "~/routes/$bandId.setlists.$setlistId._index";

import { FlexList } from "../FlexList";
import { SongContainer } from "../song-container";

export const DraggableSong = ({
  song,
  songIndex,
  children,
}: {
  song: TSong;
  songIndex: number;
  children?: ReactNode;
}) => {
  return (
    <Draggable draggableId={song.id} key={song.id} index={songIndex}>
      {(dragprovided) => (
        <div
          className="py-1"
          ref={dragprovided.innerRef}
          {...dragprovided.dragHandleProps}
          {...dragprovided.draggableProps}
        >
          <SongContainer.Card>
            <FlexList direction="row" items="center" gap={2}>
              <SongContainer.Song song={song} />
              {children}
            </FlexList>
          </SongContainer.Card>
        </div>
      )}
    </Draggable>
  );
};
