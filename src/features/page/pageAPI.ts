import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { SEOSettings } from '../template/templateAPI';

// Page interface definition
export interface Page {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: number;
  slug: string;
  title: string;
  templateId: number;
  content: string;
  contentMobile?: string;
  isTemplate: boolean;
  isActive: boolean;
  publicAt: string | null;
  status: 'draft' | 'published' | string;
  isCustomCodeEnabled: boolean;
  customCode: string | null;
  type: string;
  parentId: number | null;
  groom?: string;
  bride?: string;
  date?: string;
  location?: string;
  domain?: string;
  isInit?: boolean;
  seoSettings?: SEOSettings;
}

export interface UpdatePageContent {
  content?: string;
  contentMobile?: string;
  customCode?: string;
  isCustomCodeEnabled?: boolean;
}

// Get all pages
export const useGetPages = () => {
  return useQuery<Page[], Error>({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await apiClient.get('/pages');
      return response.data.data;
    },
  });
};

// Get a single template by ID
export const useGetPage = (id: number) => {
  return useQuery<Page, Error>({
    queryKey: ['page', id],
    queryFn: async () => {
      if (isNaN(id) || id <= 0) {
        throw new Error('Invalid page ID');
      }
      
      const response = await apiClient.get(`/pages/${id}`);
      return response.data.data;
    },
    // Don't retry for invalid IDs
    retry: (failureCount, error) => {
      if (error.message === 'Invalid page ID') {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// Universal function to get page by domain (works on both server and client)
export const getPageByDomain = async (domain: string | null): Promise<Page> => {
  if (!domain) {
    throw new Error('Domain is required for lookup');
  }

  const response = await apiClient.get('/pages/lookup', {
    params: { domain }
  });
  return response.data.data;
};

// Get page by domain lookup (React hook wrapper)
export const useGetPageByDomain = (domain: string | null, options?: { initialData?: Page }) => {
  return useQuery<Page, Error>({
    queryKey: ['page-lookup', domain],
    queryFn: () => getPageByDomain(domain),
    enabled: !!domain, // Only run query if domain is provided
    initialData: options?.initialData, // Support for SSR initial data
    retry: (failureCount, error) => {
      // Don't retry for domain not found errors
      if (error.message?.includes('not found') || error.message?.includes('Domain is required')) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useUpdatePageContent = () => {
  const queryClient = useQueryClient();
  return useMutation<Page, Error, { id: number; data: UpdatePageContent }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/pages/${id}/content`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
    },
  });
};

