import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines } from "@fortawesome/free-solid-svg-icons";

// This needs to be wrapped in a DndContext
// See SetlistDndInterface for example
export const DragInTheMiddle = forwardRef<HTMLDivElement, { id: string; splitRatio: number; y: number; containerHeight: number; topContent: ReactNode; bottomContent: ReactNode }>(({ id, splitRatio, y, containerHeight, topContent, bottomContent }, ref) => {
  const btnHeight = 40
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
  });

  const initialButtonTop = containerHeight * splitRatio
  const buttonTop = initialButtonTop - y
  const topHeight = buttonTop + (transform?.y || 0)
  const bottomHeight = containerHeight - buttonTop - btnHeight - (transform?.y || 0)
  return (
    <div ref={ref} className="h-full overflow-hidden">
      <div
        style={{ height: topHeight }}
        className="w-full flex flex-col overflow-hidden"
      >
        {topContent}
      </div>
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{ top: buttonTop }}
        className={`bg-base-200 w-full p-2 rounded cursor-grab hover:bg-base-100 ${isDragging ? 'bg-base-100' : ''}`}
        aria-label="Draggable"
        data-cypress="draggable-item"
        type="button"
      >
        <FontAwesomeIcon icon={faGripLines} />
      </button>
      <div
        style={{ height: bottomHeight }}
        className="w-full flex flex-col overflow-hidden"
      >
        {bottomContent}
      </div>
    </div>
  )
})

DragInTheMiddle.displayName = 'DragInTheMiddle'