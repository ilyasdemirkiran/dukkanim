export const unitQueryKeys = {
  all: ['units'] as const,
  lists: () => [...unitQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...unitQueryKeys.all, 'detail', id] as const,
};
