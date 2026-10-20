import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { productQueryKeys } from './productQueryKeys';
import { Product } from '../types/product';

export interface SaveProductPayload {
  name: string;
  description: string;
  price: number;
  unitId: string;
  stockQuantity: number;
  vatRate: number;
  status: 'ACTIVE' | 'PASSIVE' | 'DELETED';
}

// 1. Ürün Listesi Çekme Hook'u
export function useProductsQuery(unitIdFilter?: string) {
  return useQuery<Product[]>({
    queryKey: productQueryKeys.list(unitIdFilter),
    queryFn: async () => {
      let url = '/api/products';
      if (unitIdFilter) {
        url += `?unitId=${unitIdFilter}`;
      }
      const res = await apiClient.get<Product[]>(url);
      return res.data;
    },
  });
}

// 2. Tekil Ürün Detayı Çekme Hook'u
export function useProductDetailQuery(productId?: string) {
  return useQuery<Product>({
    queryKey: productQueryKeys.detail(productId || ''),
    queryFn: async () => {
      const res = await apiClient.get<Product>(`/api/products/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });
}

// 3. Ürün Ekle / Güncelle Mutation Hook'u
export function useSaveProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id?: string; payload: SaveProductPayload }>({
    mutationFn: async ({ id, payload }) => {
      if (id) {
        const res = await apiClient.put<Product>(`/api/products/${id}`, payload);
        return res.data;
      } else {
        const res = await apiClient.post<Product>('/api/products', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

// 4. Ürün Silme (Soft-delete) Mutation Hook'u
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (productId: string) => {
      const res = await apiClient.delete<{ message: string }>(`/api/products/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
