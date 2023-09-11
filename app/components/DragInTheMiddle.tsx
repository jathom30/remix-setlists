import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines } from "@fortawesome/free-solid-svg-icons";

export const DragInTheMiddle = ({ topContent, bottomContent, splitRatio = 0.5 }: { topContent: ReactNode; bottomContent: ReactNode; splitRatio?: number }) => {
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // get container height
  useEffect(() => {
    if (!containerRef.current) { return }

    const getHeight = () => {
      const containerHeight = containerRef.current?.clientHeight || 0
      setContainerHeight(containerHeight)
    }
    getHeight()
    window.addEventListener('resize', getHeight)
    return () => window.removeEventListener('resize', getHeight)
  }, [])

  const [y, setY] = useState(0)
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <DndContext
      key="drawer"
      sensors={sensors}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={({ delta }) => {
        const minHeight = 120
        const initialHeight = containerHeight * splitRatio
        const maxHeight = containerHeight - minHeight
        setY(prevY => {
          const nextY = prevY - delta.y
          const nextHeight = initialHeight - nextY
          if (nextHeight < minHeight) {
            return initialHeight - minHeight
          }
          if (nextHeight > maxHeight) {
            return (maxHeight - initialHeight) * -1
          }
          return nextY
        })
      }}
    >
      <DraggableContainer
        ref={containerRef}
        y={y}
        splitRatio={splitRatio}
        containerHeight={containerHeight}
        topContent={topContent}
        bottomContent={bottomContent}
      />
    </DndContext>
  )
}

const DraggableContainer = forwardRef<HTMLDivElement, { splitRatio: number; y: number; containerHeight: number; topContent: ReactNode; bottomContent: ReactNode }>(({ splitRatio, y, containerHeight, topContent, bottomContent }, ref) => {
  const btnHeight = 40
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: 'draggable',
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

DraggableContainer.displayName = 'DraggableContainer'