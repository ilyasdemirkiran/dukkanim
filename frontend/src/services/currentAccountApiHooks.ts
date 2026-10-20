import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { currentAccountQueryKeys } from './currentAccountQueryKeys';
import {
  CurrentAccount,
  CreateCurrentAccountPayload,
  CompanyInfo,
  ContactCard,
} from '../types/currentAccount';

// 1. Carileri Listeleme
export function useCurrentAccountsQuery() {
  return useQuery<CurrentAccount[]>({
    queryKey: currentAccountQueryKeys.all,
    queryFn: async () => {
      const res = await apiClient.get<CurrentAccount[]>('/api/current-accounts');
      return res.data;
    },
  });
}

// 2. Sıradaki Otomatik Cari Kodunu Alma
export function useNextAccountCodeQuery(enabled = true) {
  return useQuery<{ nextCode: number }>({
    queryKey: currentAccountQueryKeys.nextCode(),
    queryFn: async () => {
      const res = await apiClient.get<{ nextCode: number }>('/api/current-accounts/next-code');
      return res.data;
    },
    enabled,
  });
}

// 3. Yeni Cari Oluşturma Mutation
export function useCreateCurrentAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation<CurrentAccount, Error, CreateCurrentAccountPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<CurrentAccount>('/api/current-accounts', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentAccountQueryKeys.all });
    },
  });
}

// 4. Cari Silme Mutation
export function useDeleteCurrentAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id) => {
      const res = await apiClient.delete<{ message: string }>(`/api/current-accounts/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentAccountQueryKeys.all });
    },
  });
}

// 5. Firma Bilgisi Güncelleme Mutation
export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation<CurrentAccount, Error, { accountId: string; company: CompanyInfo }>({
    mutationFn: async ({ accountId, company }) => {
      const res = await apiClient.put<CurrentAccount>(`/api/current-accounts/${accountId}/company`, company);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentAccountQueryKeys.all });
    },
  });
}

// 6. İletişim Kartı Ekleme Mutation
export function useAddContactMutation() {
  const queryClient = useQueryClient();

  return useMutation<CurrentAccount, Error, { accountId: string; contact: ContactCard }>({
    mutationFn: async ({ accountId, contact }) => {
      const res = await apiClient.post<CurrentAccount>(`/api/current-accounts/${accountId}/contacts`, contact);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentAccountQueryKeys.all });
    },
  });
}

// 6.1. İletişim Kartı Güncelleme Mutation
export function useUpdateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation<CurrentAccount, Error, { accountId: string; contactId: string; contact: ContactCard }>({
    mutationFn: async ({ accountId, contactId, contact }) => {
      const res = await apiClient.put<CurrentAccount>(`/api/current-accounts/${accountId}/contacts/${contactId}`, contact);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentAccountQueryKeys.all });
    },
  });
}

// 7. İletişim Kartı Silme Mutation
export function useDeleteContactMutation() {
  const queryClient = useQueryClient();

  return useMutation<CurrentAccount, Error, { accountId: string; contactId: string }>({
    mutationFn: async ({ accountId, contactId }) => {
      const res = await apiClient.delete<CurrentAccount>(`/api/current-accounts/${accountId}/contacts/${contactId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentAccountQueryKeys.all });
    },
  });
}
