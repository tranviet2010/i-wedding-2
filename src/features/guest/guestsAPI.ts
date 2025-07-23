import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';

// Guest wish interface
export interface GuestWish {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  weddingPageId: number;
  guestName: string;
  message: string;
  isPublic: boolean;
}

// Guest interface for the new guest form
export interface Guest {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  fullName: string;
  phone: string;
  email: string;
  pageId: number;
  guestOf?: string;
  numberOfPeople?: number;
  extraInfo?: {
    questions: Array<{
      question: string;
      answer: string;
      type?: string;
    }>;
  };
}

// Create guest data interface (without auto-generated fields)
export interface CreateGuestData {
  fullName: string;
  phone: string;
  email: string;
  pageId: number;
  guestOf?: string;
  numberOfPeople?: number;
  extraInfo?: {
    questions: Array<{
      question: string;
      answer: string;
      type?: string;
    }>;
  };
}

// Get guest wishes for a specific wedding page
export const useGetGuestWishes = (weddingPageId: string | number | null) => {
  return useQuery<GuestWish[], Error>({
    queryKey: ['guest-wishes', weddingPageId],
    queryFn: async () => {
      if (!weddingPageId) {
        throw new Error('Wedding page ID is required');
      }

      console.log('🔍 Fetching guest wishes for wedding page:', weddingPageId);

      const response = await apiClient.get('/guests/wishes', {
        params: {
          weddingPageId: weddingPageId
        }
      });

      console.log('✅ Guest wishes fetched:', response.data.data);
      return response.data.data;
    },
    // Only run query if weddingPageId is available
    enabled: !!weddingPageId,
    // Refetch every 30 seconds to get new wishes
    refetchInterval: 30000,
    // Refetch when window gains focus
    refetchOnWindowFocus: true,
  });
};

// Create a new guest wish (handled by form submission)
export const useCreateGuestWish = () => {
  const queryClient = useQueryClient();

  return useMutation<GuestWish, Error, Omit<GuestWish, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>({
    mutationFn: async (data) => {
      console.log('📝 Creating guest wish:', data);
      const response = await apiClient.post('/guests/wishes', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ Guest wish created:', data);
      // Invalidate and refetch guest wishes for this wedding page
      queryClient.invalidateQueries({ queryKey: ['guest-wishes', data.weddingPageId] });
    },
  });
};

// Get guests for a specific page
export const useGetGuests = (pageId: string | number | null) => {
  return useQuery<Guest[], Error>({
    queryKey: ['guests', pageId],
    queryFn: async () => {
      if (!pageId) {
        throw new Error('Page ID is required');
      }

      console.log('🔍 Fetching guests for page:', pageId);

      const response = await apiClient.get('/guests', {
        params: {
          pageId: pageId
        }
      });

      console.log('✅ Guests fetched:', response.data.data);
      return response.data.data;
    },
    // Only run query if pageId is available
    enabled: !!pageId,
    // Refetch every 30 seconds to get new guests
    refetchInterval: 30000,
    // Refetch when window gains focus
    refetchOnWindowFocus: true,
  });
};

// Create a new guest (handled by form submission)
export const useCreateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation<Guest, Error, CreateGuestData>({
    mutationFn: async (data) => {
      console.log('📝 Creating guest:', data);
      const response = await apiClient.post('/guests', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ Guest created:', data);
      // Invalidate and refetch guests for this page
      queryClient.invalidateQueries({ queryKey: ['guests', data.pageId] });
    },
  });
};
