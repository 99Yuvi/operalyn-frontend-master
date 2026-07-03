import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getConversations } from '@/api/conversations'
import { conversationKeys } from '@/lib/queryKeys'

/**
 * Paginated conversation list with server-side search.
 * Search is debounced 300ms so we don't hit the API on every keystroke.
 */
export function useConversationsList(search = '') {
  const [debounced, setDebounced] = useState(search)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const query = useInfiniteQuery({
    queryKey: conversationKeys.list(debounced),
    queryFn: ({ pageParam }) =>
      getConversations({ page: pageParam, search: debounced || undefined }),
    initialPageParam: 1,
    getNextPageParam: (last) => last?.meta?.next_page ?? undefined,
    refetchInterval: 30_000, // refresh unread counts every 30s
  })

  // Flatten pages + dedupe by id (a conversation can shift pages between refetches)
  const seen = new Set()
  const conversations = (query.data?.pages ?? [])
    .flatMap(p => p.data ?? [])
    .filter(c => !seen.has(c.id) && seen.add(c.id))

  return {
    conversations,
    isLoading:          query.isLoading,
    fetchNextPage:      query.fetchNextPage,
    hasNextPage:        query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}

/** Scroll handler for the list container — loads the next page near the bottom */
export function makeListScrollHandler({ hasNextPage, isFetchingNextPage, fetchNextPage }) {
  return (e) => {
    if (!hasNextPage || isFetchingNextPage) return
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) fetchNextPage()
  }
}
