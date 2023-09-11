import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines } from "@fortawesome/free-solid-svg-icons";

export default function Test() {
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

  // console.log({ y })

  return (
    <DndContext
      key="drawer"
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={({ delta }) => {
        const minBottom = 120
        const initialBottom = containerHeight / 3
        const maxBottom = (containerHeight - initialBottom - initialBottom) * -1
        setY(prevY => {
          const nextY = prevY + delta.y
          if (nextY >= minBottom) {
            return minBottom
          }
          if (nextY <= maxBottom) {
            return maxBottom
          }
          return nextY
        })
      }}
    >
      <DraggableDrawer
        ref={containerRef}
        containerHeight={containerHeight}
        y={y}
        drawerContent={
          <>
            <h1 className="font-bold text-lg p-4">Content Title</h1>
            <div className="overflow-auto p-4 pt-0">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
            </div>
          </>
        }
        bodyContent={
          <>
            <h1 className="font-bold text-lg p-4">Drawer Title</h1>
            <div className="overflow-auto p-4 pt-0">
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo error atque molestias! Hic quae iste eos eaque, quas autem animi nesciunt quos eligendi rem optio explicabo delectus temporibus qui aspernatur.</p>
            </div>
          </>
        }
      />
    </DndContext>
  )
}

const DraggableDrawer = forwardRef<HTMLDivElement, { containerHeight: number; y: number; drawerContent: ReactNode; bodyContent: ReactNode }>(({ containerHeight, y, drawerContent, bodyContent }, ref) => {

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: 'draggable',
  });

  const minBottom = 120
  const initialBottom = containerHeight / 3
  const currentBottom = initialBottom - y
  const maxBottom = containerHeight - containerHeight / 3
  const getContentBottom = () => {
    // if (isDragging && transform?.y) {
    //   return initialBottom - (y + transform.y)
    // }
    if (minBottom >= currentBottom) { return minBottom }
    if (maxBottom <= currentBottom) { return maxBottom }
    return currentBottom
  }

  console.log({ y, localY: transform?.y, calc: y + (transform?.y || 0) })

  const contentBottom = getContentBottom()
  const drawerTop = containerHeight - contentBottom

  const getTransformY = () => {
    const currentTransform = transform?.y || 0
    const futureY = drawerTop + currentTransform
    const lowestTop = containerHeight - minBottom
    // 2/3 of the way to the top of window is the max top
    const greatestTop = containerHeight - (containerHeight / 3 * 2)
    if (futureY > lowestTop) {
      const maxTransform = contentBottom - minBottom
      return maxTransform
    }
    if (futureY < greatestTop) {
      const minTransform = (drawerTop - greatestTop) * -1
      return minTransform
    }

    return currentTransform
  }

  return (
    <div ref={ref} className="relative h-full overflow-hidden">
      <div
        style={{
          bottom: contentBottom
        }}
        className="absolute top-0 flex flex-col overflow-hidden"
      >
        {bodyContent}
      </div>

      <div
        ref={setNodeRef}
        className="absolute bottom-0 w-full flex flex-col border-t rounded-t-lg overflow-hidden border"
        style={{
          transform: `translate3d(0, ${getTransformY()}px, 0)`,
          top: drawerTop,
        } as React.CSSProperties}
      >
        <button
          {...listeners}
          {...attributes}
          className={`bg-base-200 w-full p-2 rounded cursor-grab hover:bg-base-100 ${isDragging ? 'bg-base-100' : ''}`}
          aria-label="Draggable"
          data-cypress="draggable-item"
        >
          <FontAwesomeIcon icon={faGripLines} />
        </button>
        {drawerContent}
      </div>
    </div>
  )
})