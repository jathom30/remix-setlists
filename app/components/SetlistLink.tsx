import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Setlist, Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { Link, useLocation, useParams } from "@remix-run/react";
import { useState } from "react";
import { Popover } from "react-tiny-popover";

import { hoverAndFocusContainerStyles } from "~/styleUtils";

import { FlexHeader } from "./FlexHeader";
import { FlexList } from "./FlexList";
import { ItemBox } from "./ItemBox";
import { Label } from "./Label";

const setCount = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

export const SetlistLink = ({
  setlist,
  publicRemark,
}: {
  setlist: SerializeFrom<
    Setlist & {
      sets: {
        updatedAt: string;
        songs: { song: { length: Song["length"] } | null }[];
      }[];
    }
  >;
  publicRemark?: string;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { bandId } = useParams();
  const { pathname } = useLocation();
  const getDisplaySetLength = Math.ceil(
    setlist.sets.reduce((total, set) => {
      const setLength = set.songs.reduce(
        (total, song) => (total += song.song?.length || 0),
        0,
      );
      return (total += setLength);
    }, 0) / setlist.sets.length,
  );

  const updatedAt = () => {
    const [mostRecentSetlist] = setlist.sets.sort(
      (a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt),
    );
    return new Date(mostRecentSetlist.updatedAt).toDateString();
  };

  return (
    <Link
      to={`/${bandId}/setlist/${setlist.id}`}
      prefetch="intent"
      state={pathname}
      className={hoverAndFocusContainerStyles}
    >
      <FlexList gap={0}>
        <FlexHeader>
          <FlexList direction="row" gap={2} items="center">
            <span className="font-bold">{setlist.name}</span>
            {setlist.isPublic ? (
              <Popover
                isOpen={showTooltip}
                positions={["bottom"]}
                content={
                  <div className="max-w-sm shadow-2xl">
                    <ItemBox>
                      <p>
                        This setlist is public, meaning anyone with the
                        appropriate URL can see its condensed view.
                      </p>
                      <p>
                        {publicRemark ??
                          'If you want this setlist to be private, click the menu button and then "View public link".'}
                      </p>
                    </ItemBox>
                  </div>
                }
              >
                <FontAwesomeIcon
                  icon={faEye}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
              </Popover>
            ) : null}
          </FlexList>
          <Label>Last updated:</Label>
        </FlexHeader>
        <FlexHeader>
          <span className="text-xs">
            {setCount[setlist.sets.length]} {getDisplaySetLength} minute set(s)
          </span>
          <span className="text-xs whitespace-nowrap">{updatedAt()}</span>
        </FlexHeader>
      </FlexList>
    </Link>
  );
};
