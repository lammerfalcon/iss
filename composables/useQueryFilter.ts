export function useQueryFilter(defaultFilter = {}) {
  const queryFilter = useCookie('queryFilter', defaultFilter)
  return {
    queryFilter,
  }
}
