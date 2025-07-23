import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';

export interface AudioTemplate {
  id: number;
  name: string;
  tier: 'free' | 'pro' | 'vip';
  fileName: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAudioTemplateData {
  file: File;
  name: string;
  tier?: 'free' | 'pro' | 'vip';
}

export interface UpdateAudioTemplateData {
  file?: File;
  name?: string;
  tier?: 'free' | 'pro' | 'vip';
}

export interface AudioTemplateQueryParams {
  tier?: 'free' | 'pro' | 'vip';
}

// Get all audio templates with optional filtering
export const useGetAudioTemplates = (params?: AudioTemplateQueryParams) => {
  return useQuery<AudioTemplate[], Error>({
    queryKey: ['audioTemplates', params],
    queryFn: async () => {
      const response = await apiClient.get('/audio-templates', {
        params
      });
      return response.data.data;
    },
  });
};

// Get single audio template by ID
export const useGetAudioTemplate = (id: number) => {
  return useQuery<AudioTemplate, Error>({
    queryKey: ['audioTemplates', id],
    queryFn: async () => {
      const response = await apiClient.get(`/audio-templates/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create new audio template
export const useCreateAudioTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AudioTemplate, Error, CreateAudioTemplateData>({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      if (data.tier) {
        formData.append('tier', data.tier);
      }

      const response = await apiClient.post('/audio-templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioTemplates'] });
    },
  });
};

// Update audio template
export const useUpdateAudioTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AudioTemplate, Error, { id: number; data: UpdateAudioTemplateData }>({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      
      if (data.file) {
        formData.append('file', data.file);
      }
      if (data.name) {
        formData.append('name', data.name);
      }
      if (data.tier) {
        formData.append('tier', data.tier);
      }

      const response = await apiClient.put(`/audio-templates/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audioTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['audioTemplates', variables.id] });
    },
  });
};

// Delete audio template
export const useDeleteAudioTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/audio-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audioTemplates'] });
    },
  });
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get audio format from mime type
export const getAudioFormat = (mimeType: string): string => {
  const formatMap: { [key: string]: string } = {
    'audio/mpeg': 'MP3',
    'audio/wav': 'WAV',
    'audio/ogg': 'OGG',
    'audio/midi': 'MIDI',
    'audio/aac': 'AAC',
    'audio/webm': 'WebM',
  };
  
  return formatMap[mimeType] || 'Unknown';
};

// Helper function to validate audio file
export const validateAudioFile = (file: File): { isValid: boolean; error?: string } => {
  const supportedFormats = [
    'audio/mpeg',
    'audio/wav', 
    'audio/ogg',
    'audio/midi',
    'audio/aac',
    'audio/webm'
  ];

  if (!supportedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: 'Định dạng file không được hỗ trợ. Vui lòng chọn file MP3, WAV, OGG, MIDI, AAC hoặc WebM.'
    };
  }

  // File size limits based on format
  const sizeLimits: { [key: string]: number } = {
    'audio/mpeg': 10 * 1024 * 1024, // 10MB
    'audio/aac': 10 * 1024 * 1024,  // 10MB
    'audio/wav': 20 * 1024 * 1024,  // 20MB
    'audio/ogg': 20 * 1024 * 1024,  // 20MB
    'audio/webm': 20 * 1024 * 1024, // 20MB
    'audio/midi': 1 * 1024 * 1024,  // 1MB
  };

  const maxSize = sizeLimits[file.type];
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File quá lớn. Kích thước tối đa cho ${getAudioFormat(file.type)} là ${formatFileSize(maxSize)}.`
    };
  }

  return { isValid: true };
};
