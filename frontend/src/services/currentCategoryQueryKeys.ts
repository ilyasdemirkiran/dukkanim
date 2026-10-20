export const currentCategoryQueryKeys = {
  all: ['current-categories'] as const,
  lists: () => [...currentCategoryQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...currentCategoryQueryKeys.all, 'detail', id] as const,
};
