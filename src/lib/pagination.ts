export interface PaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Safely constrain user-requested pagination limits.
 * @param requestedLimit The limit provided by the client
 * @param maxLimit The maximum allowed limit to prevent DB abuse
 * @param defaultLimit The fallback limit if invalid
 */
export function getPaginationLimits(requestedLimit?: number, maxLimit = 50, defaultLimit = 20): number {
  if (requestedLimit === undefined || requestedLimit === null || requestedLimit <= 0) {
    return defaultLimit;
  }
  return Math.min(requestedLimit, maxLimit);
}

/**
 * Process a raw DB query array (which fetched limit + 1 items) 
 * to determine cursor metadata and slice the payload.
 * 
 * @param items Array of items fetched from DB (limit + 1)
 * @param limit The constrained limit
 */
export function processCursorPagination<T extends { id: string }>(
  items: T[],
  limit: number
): PaginationResult<T> {
  let hasMore = false;
  let nextCursor: string | null = null;
  
  if (items.length > limit) {
    hasMore = true;
    items.pop(); // Remove the extra `+1` item fetched for the hasMore check
    const lastItem = items[items.length - 1];
    nextCursor = lastItem?.id ?? null;
  }
  
  return {
    data: items,
    hasMore,
    nextCursor
  };
}
