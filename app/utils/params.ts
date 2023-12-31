import { capitalizeFirstLetter } from "./assorted";

export const getSortFromParam = (sortParam?: string) => {
  const splitSort = sortParam?.split(":");
  const orderBy: Record<string, string> = splitSort?.length
    ? { [splitSort[0]]: splitSort[1] }
    : { name: "asc" };
  return orderBy;
};

export const sortByLabel = (sortBy: string) => {
  const sortObject = getSortFromParam(sortBy ?? undefined);
  const [entry] = Object.entries(sortObject);
  // probably not the best solution, but removes At from createdAt and updatedAt keys
  const sort = capitalizeFirstLetter(entry[0]).replace("At", "");
  const direction = () => {
    switch (sort.toLowerCase()) {
      case "name":
        return entry[1] === "asc" ? "A-Z" : "Z-A";
      case "tempo":
        return entry[1] === "asc" ? "slow-fast" : "fast-slow";
      case "updated":
        return entry[1] === "asc" ? "oldest first" : "newest first";
      case "created":
        return entry[1] === "asc" ? "oldest first" : "newest first";
      default:
        return "";
    }
  };
  return `${sort} ${direction()}`;
};

export const sortOptions = [
  { label: "Name: A-Z", value: "name:asc" },
  { label: "Name: Z-A", value: "name:desc" },
  { label: "Tempo: slow-fast", value: "tempo:asc" },
  { label: "Tempo: fast-slow", value: "tempo:desc" },
  { label: "Updated: newest first", value: "updatedAt:desc" },
  { label: "Updated: oldest first", value: "updatedAt:asc" },
  { label: "Created: newest first", value: "createdAt:desc" },
  { label: "Created: oldest first", value: "createdAt:asc" },
];
