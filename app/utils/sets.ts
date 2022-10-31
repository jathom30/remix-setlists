function removeAtIndex<T>(array: T[], index: number) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
};

function insertAtIndex<T>(array: T[], index: number, item: T) {
  return [...array.slice(0, index), item, ...array.slice(index)];
};

export function moveBetweenContainers<T>(
  items: Record<string, T[]>,
  activeContainer: string,
  activeIndex: number,
  overContainer: string,
  overIndex: number,
  item: T
) {
  return {
    ...items,
    [activeContainer]: removeAtIndex(items[activeContainer], activeIndex) ?? [],
    [overContainer]: insertAtIndex(items[overContainer], overIndex, item) ?? []
  };
};