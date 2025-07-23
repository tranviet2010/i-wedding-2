import axios, { AxiosError, AxiosResponse } from 'axios';
import { signIn, signOut } from '../features/auth/authSlice';
export const domain = "https://api.mehappy.vn/api";
export const domainFile = "https://storage.mehappy.vn";
// export const domain = "http://192.168.1.151:8000/api";
// export const domainFile = "http://192.168.1.151:8001";

// Define the API response structure
interface ApiResponse<T> {
  status_code: number;
  data: T;
  metadata: {
    total: number;
    perPage: number;
    currentPage: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    timestamp: string;
  };
  success: boolean;
  message: string;
}

export interface PaginationResponse<T> {
  data: T;
  metadata: Pagination;
}

export interface Pagination {
  total: number;
  perPage: number;
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

const apiClient = axios.create({
  baseURL: domain,
  headers: { 'Content-Type': 'application/json' },
});

let store: any;

export const injectStore = (_store: any) => {
  store = _store
}

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.auth?.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    if (
      response.data &&
      response.data.hasOwnProperty('status_code') &&
      response.data.hasOwnProperty('data') &&
      response.data.hasOwnProperty('success')
    ) {
      if (response.data.success) {
        return response;
      } else {
        return Promise.reject({
          message: response.data.message || 'Unknown error occurred',
          code: response.data.status_code,
          response: response
        });
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth?.auth?.refreshToken;

        if (!refreshToken) {
          store.dispatch(signOut());
          return Promise.reject(error);
        }

        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          '/auth/refresh-token',
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' }}
        );

        if (response.data && response.data.success && response.data.data) {
          const newTokens = response.data.data;
          
          store.dispatch(signIn({
            ...state.auth.auth!,
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token
          }));

          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          
          return axios(originalRequest);
        } else {
          store.dispatch(signOut());
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        store.dispatch(signOut());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  store.dispatch(signIn({
    ...store.getState().auth.auth!,
    accessToken,
    refreshToken
  }));
};

export default apiClient;