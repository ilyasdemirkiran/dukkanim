export const saleQueryKeys = {
  all: ['sales'] as const,
  lists: () => [...saleQueryKeys.all, 'list'] as const,
  list: (filter?: { currentAccountId?: string; status?: string; search?: string }) =>
    [...saleQueryKeys.lists(), filter] as const,
  details: () => [...saleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleQueryKeys.details(), id] as const,
};
