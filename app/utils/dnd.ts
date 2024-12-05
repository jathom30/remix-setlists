import { DropResult } from "@hello-pangea/dnd";
import { Feel, Link, Song } from "@prisma/client";
import { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import { z } from "zod";

import { getSetlist } from "~/models/setlist.server";
import { TSet } from "~/routes/$bandId.setlists.$setlistId._index";

// export type TSong = Jsonify<Awaited<ReturnType<typeof getSongs>>>[number];
// export type TSet = Record<string, TSong[]>;

export const DroppableIdEnums = z.enum(["available-songs", "new-set"]);

export const getAvailableSongs = (
  setlist: Jsonify<Awaited<ReturnType<typeof getSetlist>>>,
  allSongs: Jsonify<Song & { feels: Feel[]; links?: Link[] }>[],
) => {
  const setlistSongIds = setlist?.sets.reduce((songs: string[], set) => {
    const songsInSet = set.songs
      .map((song) => song.song?.id)
      .filter((id): id is string => Boolean(id));
    return [...songs, ...songsInSet];
  }, []);
  return allSongs.filter((song) => !setlistSongIds?.includes(song.id));
};

export const onDragEnd = (
  { destination, source, draggableId }: DropResult,
  sets: TSet,
): ((prev: TSet) => TSet) => {
  if (!destination) return (state: TSet) => state;
  // find source index from sets and draggableId
  const getSourceIndex = () => {
    const index = sets[source.droppableId].findIndex(
      (song) => song.id === draggableId,
    );
    if (index === -1) return source.index;
    return index;
  };
  const sourceIndex = getSourceIndex();

  // Make sure we're actually moving the item
  if (
    source.droppableId === destination.droppableId &&
    destination.index === sourceIndex
  )
    return (state: TSet) => state;

  // Set start and end variables
  const start = sets[source.droppableId];
  const end = sets[destination.droppableId];

  // If start is the same as end, we're in the same set
  if (start === end) {
    // Move the item within the list
    // Start by making a new list without the dragged item
    const newList = start.filter((_, idx) => idx !== sourceIndex);

    // Then insert the item at the right location
    newList.splice(destination.index, 0, start[sourceIndex]);

    // Then create a new copy of the set object
    const newCol = { [source.droppableId]: newList };

    // Update the state
    // setSets((state) => ({ ...state, ...newCol }));
    return (state: TSet) => ({ ...state, ...newCol });
  }

  if (destination.droppableId === DroppableIdEnums.Enum["new-set"]) {
    // create a new set id
    const newSetId = `set-${Date.now()}`;
    // add the song to the set
    const newSet = { [newSetId]: [start[sourceIndex]] };
    // update the state
    return (state: TSet) => {
      // remove song from the available songs
      const newStartList = start.filter((_, idx) => idx !== sourceIndex);
      const newStartCol = { [source.droppableId]: newStartList };
      const newSets = { ...state, ...newStartCol, ...newSet };
      return Object.keys(newSets).reduce((acc: TSet, key) => {
        // remove empty sets
        // but keep the "available songs" set and "new" set
        if (
          newSets[key].length === 0 &&
          key !== DroppableIdEnums.Enum["available-songs"] &&
          key !== DroppableIdEnums.Enum["new-set"]
        )
          return acc;
        acc[key] = newSets[key];
        return acc;
      }, {});
    };
  }

  // If start is different from end, we need to update multiple columns
  // Filter the start list like before
  const newStartList = start.filter((_, idx) => idx !== sourceIndex);

  // Create a new start column
  const newStartCol = { [source.droppableId]: newStartList };

  // Make a new end list array
  const newEndList = end;

  // Insert the item into the end list
  newEndList.splice(destination.index, 0, start[sourceIndex]);

  // Create a new end column
  const newEndCol = { [destination.droppableId]: newEndList };

  // Update the state
  return (state: TSet) => {
    const newSets = {
      ...state,
      ...newStartCol,
      ...newEndCol,
    };
    return Object.keys(newSets).reduce((acc: TSet, key) => {
      // remove empty sets
      // but keep the "available songs" set and "new" set
      if (
        newSets[key].length === 0 &&
        key !== DroppableIdEnums.Enum["available-songs"] &&
        key !== DroppableIdEnums.Enum["new-set"]
      )
        return acc;
      acc[key] = newSets[key];
      return acc;
    }, {});
  };
};

export const compareSets = (original: TSet, updated: TSet): boolean => {
  const isUpdated = (songIdsSetA: string[], songIdsSetB: string[]) => {
    return JSON.stringify(songIdsSetA) !== JSON.stringify(songIdsSetB);
  };

  return Object.keys(updated).some((setId) => {
    const current = updated[setId]?.map((song) => song.id);
    const old = original[setId]?.map((song) => song.id);
    return isUpdated(current, old);
  });
};
