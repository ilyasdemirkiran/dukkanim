import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { unitQueryKeys } from './unitQueryKeys';
import { Unit } from '../types/product';

export function useUnitsQuery() {
  return useQuery<Unit[]>({
    queryKey: unitQueryKeys.all,
    queryFn: async () => {
      const res = await apiClient.get<Unit[]>('/api/units');
      return res.data;
    },
  });
}

export function useSaveUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation<Unit, Error, { id?: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      if (id) {
        const res = await apiClient.put<Unit>(`/api/units/${id}`, { name });
        return res.data;
      } else {
        const res = await apiClient.post<Unit>('/api/units', { name });
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitQueryKeys.all });
    },
  });
}

export function useDeleteUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<{ message: string }>(`/api/units/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitQueryKeys.all });
    },
  });
}
