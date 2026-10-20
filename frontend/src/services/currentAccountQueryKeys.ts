export const currentAccountQueryKeys = {
  all: ['current-accounts'] as const,
  lists: () => [...currentAccountQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...currentAccountQueryKeys.all, 'detail', id] as const,
  nextCode: () => [...currentAccountQueryKeys.all, 'next-code'] as const,
};
