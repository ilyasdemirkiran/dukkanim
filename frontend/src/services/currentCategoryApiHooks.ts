import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { currentCategoryQueryKeys } from './currentCategoryQueryKeys';
import { CurrentCategory } from '../types/currentAccount';

export function useCurrentCategoriesQuery() {
  return useQuery<CurrentCategory[]>({
    queryKey: currentCategoryQueryKeys.all,
    queryFn: async () => {
      const res = await apiClient.get<CurrentCategory[]>('/api/current-categories');
      return res.data;
    },
  });
}

export function useSaveCurrentCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CurrentCategory, Error, { id?: string; name: string; description?: string }>({
    mutationFn: async ({ id, name, description }) => {
      if (id) {
        const res = await apiClient.put<CurrentCategory>(`/api/current-categories/${id}`, { name, description });
        return res.data;
      } else {
        const res = await apiClient.post<CurrentCategory>('/api/current-categories', { name, description });
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentCategoryQueryKeys.all });
    },
  });
}

export function useDeleteCurrentCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<{ message: string }>(`/api/current-categories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentCategoryQueryKeys.all });
    },
  });
}
