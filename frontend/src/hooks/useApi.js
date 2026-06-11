import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axios';
import toast from 'react-hot-toast';

// ─── Dashboard Stats ──────────────────────────────────────────
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/v1/dashboard/stats');
      return data.data;
    },
  });
}

// ─── Categories ──────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/v1/categories');
      return data.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/v1/categories', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category created!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/v1/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success("Category deleted!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

// ─── Providers ───────────────────────────────────────────────
export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/v1/providers');
      return data.data;
    },
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/v1/providers', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success("Provider added!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await axiosClient.put(`/v1/providers/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success("Provider updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/v1/providers/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['providers'] });
      const previous = queryClient.getQueryData(['providers']);
      if (previous) {
        queryClient.setQueryData(
          ['providers'],
          previous.filter((p) => p.id !== id)
        );
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Provider deleted!");
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['providers'], context.previous);
      }
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

// ─── Items ───────────────────────────────────────────────────
export function useItems(filters = {}) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.provider_id) params.append('provider_id', filters.provider_id);
      if (filters.search) params.append('search', filters.search);
      const { data } = await axiosClient.get(`/v1/items?${params.toString()}`);
      return data.data;
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axiosClient.post('/v1/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData(['items', {}]);
      if (previous) {
        const optimistic = {
          id: `temp-${Date.now()}`,
          name: formData.get('name'),
          unit_price: formData.get('unit_price'),
          boxes_quantity: formData.get('boxes_quantity'),
          pieces_per_box: formData.get('pieces_per_box'),
          description: formData.get('description'),
          category: null,
          provider: null,
          image_path: null,
          _optimistic: true,
        };
        queryClient.setQueryData(['items', {}], [...previous, optimistic]);
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Item added to stock!");
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['items', {}], context.previous);
      }
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await axiosClient.post(`/v1/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onMutate: async ({ id, formData }) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData(['items', {}]);
      if (previous) {
        queryClient.setQueryData(
          ['items', {}],
          previous.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name: formData.get('name') || item.name,
                  unit_price: formData.get('unit_price') || item.unit_price,
                  boxes_quantity: formData.get('boxes_quantity') || item.boxes_quantity,
                  pieces_per_box: formData.get('pieces_per_box') || item.pieces_per_box,
                  _optimistic: true,
                }
              : item
          )
        );
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Stock item updated!");
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['items', {}], context.previous);
      }
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axiosClient.delete(`/v1/items/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData(['items', {}]);
      if (previous) {
        queryClient.setQueryData(
          ['items', {}],
          previous.filter((item) => item.id !== id)
        );
      }
      return { previous };
    },
    onSuccess: () => {
      toast.success("Item removed!");
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['items', {}], context.previous);
      }
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useReassignStockAddition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, provider_id }) => {
      const { data } = await axiosClient.put(`/v1/stock-additions/${id}`, { provider_id });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success("Stock transaction reassigned!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

// ─── Buyers ──────────────────────────────────────────────────
export function useBuyers(search = '') {
  return useQuery({
    queryKey: ['buyers', search],
    queryFn: async () => {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await axiosClient.get(`/v1/buyers${params}`);
      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateBuyer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/v1/buyers', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer registered!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

// ─── Invoices ────────────────────────────────────────────────
export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/v1/invoices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/v1/invoices', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success("Invoice generated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong.");
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/v1/invoices');
      return data.data;
    },
  });
}

// ─── Authentication ──────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/v1/me');
      return data.user;
    },
    retry: false,
    staleTime: Infinity, // Keep user info fresh and cacheable
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await axiosClient.post('/v1/login', { email, password });
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['me'], user);
      toast.success("Successfully logged in!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axiosClient.post('/v1/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
      toast.success("Logged out successfully.");
    },
    onError: (err) => {
      queryClient.setQueryData(['me'], null);
      queryClient.clear();
      toast.error("Logged out from session.");
    },
  });
}

