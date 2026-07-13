// Helpers reutilizáveis de paginação (client-side e metadados de UI).

export const PAGINATION_PAGE_SIZES = [10, 25, 50];

export const pagination = {
  paginateSlice(items, page, pageSize) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  },

  calcTotalPages(total, pageSize) {
    if (!total) return 1;
    return Math.ceil(total / pageSize);
  },

  clampPage(page, totalPages) {
    return Math.min(Math.max(1, page), Math.max(1, totalPages));
  },

  paginationFrom(page, pageSize, total) {
    if (!total) return 0;
    return (page - 1) * pageSize + 1;
  },

  paginationTo(page, pageSize, total) {
    if (!total) return 0;
    return Math.min(page * pageSize, total);
  },

  paginationPageSizes: PAGINATION_PAGE_SIZES,
};
