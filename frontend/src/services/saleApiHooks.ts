import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { saleQueryKeys } from './saleQueryKeys';
import {
  Sale,
  CreateSalePayload,
  AddSaleItemPayload,
  ApplyBulkPayload,
} from '../types/sale';

// 1. Satışları Listeleme
export function useSalesQuery(filter?: { currentAccountId?: string; status?: string; search?: string; date?: string }) {
  return useQuery<Sale[]>({
    queryKey: saleQueryKeys.list(filter),
    queryFn: async () => {
      const res = await apiClient.get<Sale[]>('/api/sales', { params: filter });
      return res.data;
    },
  });
}

// 2. Tekil Satış Detayını Çekme
export function useSaleDetailQuery(saleId?: string) {
  return useQuery<Sale>({
    queryKey: saleQueryKeys.detail(saleId || ''),
    queryFn: async () => {
      const res = await apiClient.get<Sale>(`/api/sales/${saleId}`);
      return res.data;
    },
    enabled: !!saleId,
  });
}

// 3. Yeni Satış Başlatma Mutation
export function useCreateSaleMutation() {
  const queryClient = useQueryClient();

  return useMutation<Sale, Error, CreateSalePayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<Sale>('/api/sales', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.all });
    },
  });
}

// 4. Satışa Ürün Kalemi Ekleme Mutation
export function useAddSaleItemMutation(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation<Sale, Error, AddSaleItemPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<Sale>(`/api/sales/${saleId}/items`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.detail(saleId) });
    },
  });
}

// 4.1. Satıştaki Kalemi Güncelleme Mutation
export function useUpdateSaleItemMutation(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation<Sale, Error, { itemId: string; payload: Partial<AddSaleItemPayload> }>({
    mutationFn: async ({ itemId, payload }) => {
      const res = await apiClient.put<Sale>(`/api/sales/${saleId}/items/${itemId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.detail(saleId) });
    },
  });
}

// 5. Satıştan Kalem Silme Mutation
export function useDeleteSaleItemMutation(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation<Sale, Error, string>({
    mutationFn: async (itemId) => {
      const res = await apiClient.delete<Sale>(`/api/sales/${saleId}/items/${itemId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.detail(saleId) });
    },
  });
}

// 6. Toplu İndirim ve KDV Uygulama Mutation
export function useApplyBulkSaleMutation(saleId: string) {
  const queryClient = useQueryClient();

  return useMutation<Sale, Error, ApplyBulkPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<Sale>(`/api/sales/${saleId}/apply-bulk`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.detail(saleId) });
    },
  });
}

// 7. Satışı Silme Mutation
export function useDeleteSaleMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (saleId) => {
      const res = await apiClient.delete<{ message: string }>(`/api/sales/${saleId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleQueryKeys.all });
    },
  });
}
