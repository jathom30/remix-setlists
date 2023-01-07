import type { UniqueIdentifier } from "@dnd-kit/core";
import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export function DroppableContainer({
  children,
  id,
  items,
}: {
  children: ReactNode
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
    items.includes(over.id)
    : false;

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
    // hover={isOverContainer}
    // handleProps={{
    //   ...attributes,
    //   ...listeners,
    // }}
    // columns={columns}
    // {...props}
    >
      <div {...listeners}>
        <FontAwesomeIcon icon={faGripVertical} />
      </div>
      {children}
    </div>
  );
}