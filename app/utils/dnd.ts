import type {
  DroppableContainer,
  KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { closestCorners, getFirstCollision, KeyboardCode } from "@dnd-kit/core";
import { DropResult } from "@hello-pangea/dnd";
import { Song } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { z } from "zod";

const directions: string[] = [
  KeyboardCode.Down,
  KeyboardCode.Right,
  KeyboardCode.Up,
  KeyboardCode.Left,
];

export const coordinateGetter: KeyboardCoordinateGetter = (
  event,
  { context: { active, droppableRects, droppableContainers, collisionRect } },
) => {
  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !collisionRect) {
      return;
    }

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry?.disabled) {
        return;
      }

      const rect = droppableRects.get(entry.id);

      if (!rect) {
        return;
      }

      const data = entry.data.current;

      if (data) {
        const { type, children } = data;

        if (type === "container" && children?.length > 0) {
          if (active.data.current?.type !== "container") {
            return;
          }
        }
      }

      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left >= rect.left + rect.width) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (collisionRect.left + collisionRect.width <= rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    });

    const collisions = closestCorners({
      active,
      collisionRect: collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null,
    });
    const closestId = getFirstCollision(collisions, "id");

    if (closestId != null) {
      const newDroppable = droppableContainers.get(closestId);
      const newNode = newDroppable?.node.current;
      const newRect = newDroppable?.rect.current;

      if (newNode && newRect) {
        if (newDroppable.id === "placeholder") {
          return {
            x: newRect.left + (newRect.width - collisionRect.width) / 2,
            y: newRect.top + (newRect.height - collisionRect.height) / 2,
          };
        }

        if (newDroppable.data.current?.type === "container") {
          return {
            x: newRect.left + 20,
            y: newRect.top + 74,
          };
        }

        return {
          x: newRect.left,
          y: newRect.top,
        };
      }
    }
  }

  return undefined;
};

// NEW DND HELPER

export type TSet = Record<string, SerializeFrom<Song>[]>;
export const DroppableIdEnums = z.enum(["available-songs", "new-set"]);

export const onDragEnd = (
  { destination, source }: DropResult,
  sets: TSet,
): ((prev: TSet) => TSet) => {
  if (!destination) return (state: TSet) => state;
  // Make sure we're actually moving the item
  if (
    source.droppableId === destination.droppableId &&
    destination.index === source.index
  )
    return (state: TSet) => state;

  // Set start and end variables
  const start = sets[source.droppableId];
  const end = sets[destination.droppableId];

  // If start is the same as end, we're in the same column
  if (start === end) {
    // Move the item within the list
    // Start by making a new list without the dragged item
    const newList = start.filter((_, idx) => idx !== source.index);

    // Then insert the item at the right location
    newList.splice(destination.index, 0, start[source.index]);

    // Then create a new copy of the column object
    const newCol = { [source.droppableId]: newList };

    // Update the state
    // setSets((state) => ({ ...state, ...newCol }));
    return (state: TSet) => ({ ...state, ...newCol });
  }

  if (destination.droppableId === DroppableIdEnums.Enum["new-set"]) {
    // create a new set id
    const newSetId = `set-${Date.now()}`;
    // add the song to the set
    const newSet = { [newSetId]: [start[source.index]] };
    // update the state
    return (state: TSet) => {
      // remove song from the available songs
      const newStartList = start.filter((_, idx) => idx !== source.index);
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
  const newStartList = start.filter((_, idx) => idx !== source.index);

  // Create a new start column
  const newStartCol = { [source.droppableId]: newStartList };

  // Make a new end list array
  const newEndList = end;

  // Insert the item into the end list
  newEndList.splice(destination.index, 0, start[source.index]);

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
