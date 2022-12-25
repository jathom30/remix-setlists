export const getSortFromParam = (sortParam?: string) => {
  const splitSort = sortParam?.split(':')
  const orderBy: Record<string, string> = splitSort?.length ? { [splitSort[0]]: splitSort[1] } : { name: 'asc' }
  return orderBy
}