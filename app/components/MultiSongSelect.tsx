import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";

import { hoverAndFocusContainerStyles } from "~/styleUtils";

import { FlexList } from "./FlexList";
import { SongDisplay } from "./SongDisplay";

export const MulitSongSelect = ({
  songs,
}: {
  songs: SerializeFrom<Song[]>;
}) => {
  return (
    <div className="bg-base-200 h-full min-h-[24rem]">
      <FlexList pad={4} gap={2}>
        {songs.length === 0 ? (
          <FlexList>
            <FontAwesomeIcon icon={faMagnifyingGlass} size="3x" />
            <p className="text-center">
              We couldn't find any songs that match your search...
            </p>
          </FlexList>
        ) : (
          songs.map((song) => (
            <label key={song.id} htmlFor={song.id}>
              <div className={hoverAndFocusContainerStyles}>
                <FlexList direction="row" gap={4} items="center">
                  <input
                    id={song.id}
                    value={song.id}
                    type="checkbox"
                    name="songs"
                    className="checkbox checkbox-sm"
                  />
                  <SongDisplay song={song} width="half" />
                </FlexList>
              </div>
            </label>
          ))
        )}
      </FlexList>
    </div>
  );
};
