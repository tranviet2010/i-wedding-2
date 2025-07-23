import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';

export interface Asset {
  id?: number;
  key: string;
  content: string;
  tag: string;
  previewUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create a new asset
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Asset, Error, Omit<Asset, 'id'>>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/assets', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

// Get all assets
export const useGetAssets = () => {
  return useQuery<Asset[], Error>({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await apiClient.get('/assets');
      return response.data.data;
    },
  });
};

// Update an asset
export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<Asset, Error, { id: number; data: Partial<Asset> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/assets/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets', variables.id] });
    },
  });
};

// Delete an asset
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}; 

export const useGetAllTags = () => {
  return useQuery<string[], Error>({
    queryKey: ['assets', 'tags'],
    queryFn: async () => {
      const response = await apiClient.get('/assets/tags/all');
      return response.data.data;
    },
  });
};
