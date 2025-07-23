import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { loadAllCustomFonts } from '@/utils/fontLoader';
import { domainFile } from '@/api/apiClient';

// Template interface definition
export interface File {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    userId: number;
    originalName: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    size: number;
    isActive: boolean;
    tag: string;
}

export enum FileType {
    IMAGE = 'image',
    VIDEO = 'video',
    DOCUMENT = 'document',
    AUDIO = 'audio',
    FONT = 'font',
    ICON = 'icon',
    OTHER = 'other'
}

export const FILE_TYPE_MIME_MAP: Record<FileType, string[]> = {
    [FileType.IMAGE]: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff'
    ],
    [FileType.VIDEO]: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/webm',
        'video/ogg',
        'video/3gpp'
    ],
    [FileType.DOCUMENT]: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    ],
    [FileType.AUDIO]: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/midi',
        'audio/webm',
        'audio/aac'
    ],
    [FileType.FONT]: [
        'font/ttf',
        'font/otf',
        'font/woff',
        'font/woff2'
    ],
    [FileType.ICON]: [
        'image/svg+xml'
    ],
    [FileType.OTHER]: []
};

export const useGetFiles = (type?: FileType) => {
    return useQuery<File[], Error>({
        queryKey: ['files', type],
        queryFn: async () => {
            const response = await apiClient.get('/files/user', {
                params: {
                    type
                }
            });
            return response.data.data;
        },
    });
};

export const useGetFonts = () => {
    return useQuery<File[], Error>({
        queryKey: ['fonts'],
        queryFn: async () => {
            const response = await apiClient.get('/files/user', {
                params: {
                    type: FileType.FONT
                }
            });
            const fonts = response.data.data;

            // Automatically load all font styles when fonts are fetched
            if (fonts && fonts.length > 0) {
                loadAllCustomFonts(fonts, domainFile);
            }

            return fonts;
        },
    });
}

export const uploadFile = async (file: globalThis.File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data.success === false) {
        throw new Error('Upload failed');
    }

    return response.data.data;
};

// Batch delete files for admin (can delete any files)
export const useBatchDeleteFilesAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { fileIds: number[] }>({
        mutationFn: async ({ fileIds }) => {
            await apiClient.delete('/files/admin/batch', {
                data: { fileIds }
            });
        },
        onSuccess: () => {
            // Invalidate all file queries to refresh the lists
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['fonts'] });
        },
    });
};

// Batch delete files for user (can only delete own files)
export const useBatchDeleteFilesUser = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { fileIds: number[] }>({
        mutationFn: async ({ fileIds }) => {
            await apiClient.delete('/files/user/batch', {
                data: { fileIds }
            });
        },
        onSuccess: () => {
            // Invalidate all file queries to refresh the lists
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['fonts'] });
        },
    });
};

// Update file properties (like tags)
export const useUpdateFile = () => {
    const queryClient = useQueryClient();

    return useMutation<File, Error, { id: number; data: Partial<File> }>({
        mutationFn: async ({ id, data }) => {
            const response = await apiClient.patch(`/files/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate all file queries to refresh the lists
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['fonts'] });
        },
    });
};

// Upload file with tag using query parameter
export const uploadFileWithTag = async (file: globalThis.File, tag?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    // Build the URL with tag as query parameter
    const url = tag ? `/files/upload?tag=${encodeURIComponent(tag)}` : '/files/upload';

    const response = await apiClient.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data.success === false) {
        throw new Error('Upload failed');
    }

    return response.data.data;
};

export const useGetAllTags = () => {
    return useQuery<string[], Error>({
        queryKey: ['files', 'tags'],
        queryFn: async () => {
            const response = await apiClient.get('/files/tags/all');
            return response.data.data;
        },
    });
};

