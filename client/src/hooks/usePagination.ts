import { useState } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export const usePagination = (initialPage: number = 1, initialLimit: number = 10) => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const setTotal = (total: number) => {
    setPagination((prev) => ({ ...prev, total }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return {
    ...pagination,
    goToPage,
    setLimit,
    setTotal,
    totalPages,
  };
};
