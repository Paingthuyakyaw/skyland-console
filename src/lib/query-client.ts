import { MutationCache, QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5,
        retry: 0,
      },
    },
    // configure global cache callbacks to show toast notifications
    mutationCache: new MutationCache({}),
  })
