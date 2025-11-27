import { useQuery } from '@tanstack/react-query'
import { scriptApi } from '../api/scriptApi'

// Query Keys Factory
export const scriptKeys = {
  all: ['scripts'] as const,
  types: () => [...scriptKeys.all, 'types'] as const,
}

// Query Hooks
export const useScriptTypes = () =>
  useQuery({
    queryKey: scriptKeys.types(),
    queryFn: () => scriptApi.getTypes(),
  })
