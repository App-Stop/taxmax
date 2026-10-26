// Cursor-paged lists shown with numbered pages. `cursors[i]` opens page i + 1 (page 1's is
// null). A page's cursor is only known once the page before it has loaded, so the pages on
// offer are the ones already reached plus the next one.

export const FIRST_PAGE = { page: 1, cursors: [null] };

export const cursorFor = ({ page, cursors }) => cursors[page - 1] ?? null;

export const pageCountFor = ({ page, cursors }, hasMore) => Math.max(cursors.length, hasMore ? page + 1 : page);

// The filters patch that opens `target`. Moving forward records the loaded page's next cursor
// and drops cursors past it, which may be stale.
export function goToPage({ page, cursors }, target, nextCursor) {
  if (target === page + 1 && nextCursor) return { page: target, cursors: [...cursors.slice(0, page), nextCursor] };
  return { page: target, cursors };
}
