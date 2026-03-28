import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Trip, ApiResponse } from '../types';
import toast from 'react-hot-toast';

export function useTrips(status?: string) {
  return useQuery({
    queryKey: ['trips', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const { data } = await api.get<ApiResponse<Trip[]>>('/trips', { params });
      return data.data;
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripData: Partial<Trip>) => {
      const { data } = await api.post<ApiResponse<Trip>>('/trips', tripData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('여행이 생성되었습니다!');
    },
    onError: () => toast.error('여행 생성에 실패했습니다.'),
  });
}

export function useUpdateTrip(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tripData: Partial<Trip>) => {
      const { data } = await api.put<ApiResponse<Trip>>(`/trips/${id}`, tripData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('여행이 삭제되었습니다.');
    },
  });
}
