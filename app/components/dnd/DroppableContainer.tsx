import type { UniqueIdentifier } from "@dnd-kit/core";
import type { AnimateLayoutChanges } from "@dnd-kit/sortable";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faGripVertical, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import pluralize from "pluralize";
import type { ReactNode } from "react";
import { Collapsible } from "../Collapsible";
import { FlexHeader } from "../FlexHeader";
import { FlexList } from "../FlexList";
import { Label } from "../Label";
import { Link } from "../Link";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export function DroppableContainer({
  children,
  id,
  index,
  items,
  onPointerDown,
  onPointerUp,
  isOpen,
  length,
}: {
  children?: ReactNode;
  id: UniqueIdentifier;
  index: number;
  items: UniqueIdentifier[];
  onPointerDown: () => void;
  onPointerUp: () => void;
  isOpen: boolean;
  length: number;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "default",
  };

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
      className="relative bg-base-200"
      {...attributes}
    >
      <Collapsible
        isOpen={isOpen}
        header={
          <FlexHeader pad={4}>
            <FlexList direction="row" items="center">
              <div
                className="btn btn-accent btn-sm cursor-grab"
                {...listeners}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              <Label>
                Set {index + 1} - {pluralize("minute", length, true)}
              </Label>
            </FlexList>
            <Link to={`${id}/addSongs`} icon={faPlus} isOutline isCollapsing>
              Add songs
            </Link>
          </FlexHeader>
        }
      >
        {children}
      </Collapsible>
      {isDragging ? <div className="absolute inset-0 bg-base-300" /> : null}
    </div>
  );
}
