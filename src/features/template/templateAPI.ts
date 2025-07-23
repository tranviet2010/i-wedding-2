import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

export interface TemplateConfig {
  allowFontChange: boolean;
  allowColorChange: boolean;
  effects: string[];
}

export interface TemplatePageSettings {
  mobileWidth: string;
  desktopWidth: string;
  mobileOnly: boolean;
}

export interface Effects {
  imageUrl: string;
  coverageLevel: number; // Mức độ phủ (0-100)
  fallSpeed: number; // Tốc độ rơi (1-10)
  minSize: number; // Kích thước nhỏ nhất (px)
  maxSize: number; // Kích thước lớn nhất (px)
}

export interface AudioSettings {
  audioUrl: string; // URL của file âm thanh
  playIconUrl: string; // URL của biểu tượng mở
  pauseIconUrl: string; // URL của biểu tượng tắt
  playIconColor?: string; // Màu của biểu tượng mở
  pauseIconColor?: string; // Màu của biểu tượng tắt
  enableAnimations?: boolean; // Hiệu ứng chuyển động
  useDefaultIcons?: boolean; // Sử dụng biểu tượng mặc định
  autoPlay?: boolean; // Tự động phát khi cuộn đến component
}

export interface SEOSettings {
  title: string;
  description: string;
  keywords: string[];
  imageUrl: string;
  favoriteIconUrl: string;
  password?: string; // Optional password for page protection
}

export interface NotificationSettings {
  displayDuration: number; // Duration in milliseconds
  size: 'small' | 'medium' | 'large'; // Size of the toast notification
  iconUrl?: string; // URL of the custom icon
  iconColor?: string; // Color of the icon
  showIcon: boolean; // Whether to show icon in the toast
  useDefaultIcon: boolean; // Whether to use default system notification icon
  enabled: boolean; // Whether notification system is enabled
}

export interface CustomEffect {
  autoScroll: {
    enabled: boolean;
    speed: number;
  }
}

export interface Template {
  id?: number;
  name: string;
  description?: string;
  previewUrl?: string;
  content?: string;
  contentMobile?: string;
  tier?: 'free' | 'pro' | 'vip';
  category?: 'wedding' | 'birthday' | 'baby';
  isActive?: boolean;
  isPublished?: boolean;
  config?: TemplateConfig;
  effects?: Effects;
  audioSettings?: AudioSettings;
  customHtml?: string;
  seoSettings?: SEOSettings;
  notificationSettings?: NotificationSettings;
  customEffects?: CustomEffect;
  pageSettings?: TemplatePageSettings;
}

export interface CreateTemplate {
  name: string;
  description: string;
  imageUrl: string;
  tier: 'free' | 'pro' | 'vip';
  category: 'wedding' | 'birthday' | 'baby';
  isActive: boolean;
}

export interface TemplateQueryParams {
  tier?: 'free' | 'pro' | 'vip';
  category?: 'wedding' | 'birthday' | 'baby';
}

// Create a new template (Admin only)
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<Template, Error, CreateTemplate>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/templates', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      if (data.id) {
        navigate(`/editor/${data.id}`);
      }
    },
  });
};

// Get all templates with optional filtering
export const useGetTemplates = (params?: TemplateQueryParams) => {
  return useQuery<Template[], Error>({
    queryKey: ['templates', params],
    queryFn: async () => {
      const response = await apiClient.get('/templates', { params });
      return response.data.data;
    },
  });
};

export const useGetLookupTemplate = (id: number) => {
  return useQuery<Template, Error>({
    queryKey: ['templates', id],
    queryFn: async () => {
      // Don't make API call for invalid IDs
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid template ID');
      }

      const response = await apiClient.get(`/templates/lookup/${id}`);
      return response.data.data;
    },
    // Don't retry for invalid IDs
    retry: (failureCount, error) => {
      if (error.message === 'Invalid template ID') {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Get a single template by ID
export const useGetTemplate = (id: number) => {
  return useQuery<Template, Error>({
    queryKey: ['templates', id],
    queryFn: async () => {
      // Don't make API call for invalid IDs
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid template ID');
      }

      const response = await apiClient.get(`/templates/${id}`);
      return response.data.data;
    },
    // Don't retry for invalid IDs
    retry: (failureCount, error) => {
      if (error.message === 'Invalid template ID') {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Update a template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<Template, Error, { id: number; data: Partial<Template> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/templates/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', variables.id] });
    },
  });
};

// Delete a template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};
