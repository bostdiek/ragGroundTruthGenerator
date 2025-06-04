/**
 * Pagination utilities for the retrieval feature
 */

/**
 * Calculate total pages based on total count and limit
 *
 * @param totalCount - Total number of items
 * @param limit - Number of items per page
 * @returns Total number of pages
 */
export const calculateTotalPages = (
  totalCount: number,
  limit: number
): number => {
  return Math.ceil(totalCount / limit);
};

/**
 * Generate page numbers for pagination UI
 *
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @param maxPageNumbers - Maximum number of page numbers to show
 * @returns Array of page numbers to display
 */
export const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxPageNumbers = 5
): number[] => {
  // If we have fewer pages than the max, just return all page numbers
  if (totalPages <= maxPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculate the start and end of the page numbers to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
  let endPage = startPage + maxPageNumbers - 1;

  // Adjust if we're near the end
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageNumbers + 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
};

/**
 * Create a paginated response from a list of items
 *
 * @param items - Array of items to paginate
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number
) {
  const totalCount = items.length;
  const totalPages = calculateTotalPages(totalCount, limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalCount);
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  };
}

/**
 * Create a paginated result from a list of documents
 *
 * @param documents - Array of documents to paginate
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Search result with pagination
 */
export const createPaginatedSearchResult = (
  documents: any[],
  page: number,
  limit: number
) => {
  const totalCount = documents.length;
  const totalPages = calculateTotalPages(totalCount, limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalCount);
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  return {
    documents: paginatedDocuments,
    totalCount,
    page,
    totalPages,
  };
};
