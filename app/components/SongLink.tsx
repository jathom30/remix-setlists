import type { Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { Link, useLocation } from "@remix-run/react";
import { hoverAndFocusContainerStyles } from "~/styleUtils";
import { SongDisplay } from "./SongDisplay";

export const SongLink = ({
  song,
  to,
}: {
  song: SerializeFrom<Song>;
  to?: string;
}) => {
  const { pathname } = useLocation();
  return (
    <Link
      to={to ?? `/${song.bandId}/song/${song.id}`}
      state={pathname}
      prefetch="intent"
      className={hoverAndFocusContainerStyles}
    >
      <SongDisplay song={song} />
    </Link>
  );
};
