import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiFile, FiImage, FiVideo, FiMusic, FiFileText, FiTrash2, FiType, FiStar } from 'react-icons/fi';
import { useGetFiles, File as APIFile, FileType, useBatchDeleteFilesAdmin, useBatchDeleteFilesUser } from '../../../features/files/fileAPI';
import { domainFile } from '@/api/apiClient';
import { useViewport } from '../Viewport/ViewportContext';
import { zIndex } from '@/utils/zIndex';

interface FileManagementModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// Helper functions for file type handling
const getFileTypeTitle = (fileType: FileType): string => {
	switch (fileType) {
		case FileType.IMAGE:
			return 'Hình ảnh';
		case FileType.VIDEO:
			return 'Video';
		case FileType.AUDIO:
			return 'Âm thanh';
		case FileType.DOCUMENT:
			return 'Tài liệu';
		case FileType.FONT:
			return 'Font';
		case FileType.ICON:
			return 'Icon';
		default:
			return 'Khác';
	}
};

const getFileTypeTabIcon = (fileType: FileType, isActive: boolean = false) => {
	const size = 'text-lg';
	
	switch (fileType) {
		case FileType.IMAGE:
			return <FiImage className={`${size} text-blue-500`} />;
		case FileType.VIDEO:
			return <FiVideo className={`${size} text-purple-500`} />;
		case FileType.AUDIO:
			return <FiMusic className={`${size} text-green-500`} />;
		case FileType.DOCUMENT:
			return <FiFileText className={`${size} text-red-500`} />;
		case FileType.FONT:
			return <FiType className={`${size} text-orange-500`} />;
		case FileType.ICON:
			return <FiStar className={`${size} text-yellow-500`} />;
		default:
			return <FiFile className={`${size} text-gray-600`} />;
	}
};

const getFileTypeTabColors = (fileType: FileType, isActive: boolean) => {
	if (!isActive) {
		return 'text-gray-500';
	}
	
	switch (fileType) {
		case FileType.IMAGE:
			return 'border-b-2 border-blue-500 text-blue-500 ';
		case FileType.VIDEO:
			return 'border-b-2 border-purple-500 text-purple-500 ';
		case FileType.AUDIO:
			return 'border-b-2 border-green-500 text-green-500 ';
		case FileType.DOCUMENT:
			return 'border-b-2 border-red-500 text-red-500 ';
		case FileType.FONT:
			return 'border-b-2 border-orange-500 text-orange-500 ';
		case FileType.ICON:
			return 'border-b-2 border-yellow-500 text-yellow-500 ';
		default:
			return 'text-gray-500';
	}
};

const getFileTypeIcon = (mimeType: string, size: string = 'text-4xl') => {
	if (mimeType.startsWith('image/')) {
		return <FiImage className={`${size} text-blue-500`} />;
	} else if (mimeType.startsWith('video/')) {
		return <FiVideo className={`${size} text-purple-500`} />;
	} else if (mimeType.startsWith('audio/')) {
		return <FiMusic className={`${size} text-green-500`} />;
	} else if (mimeType.startsWith('application/pdf') || mimeType.startsWith('text/') || mimeType.includes('document')) {
		return <FiFileText className={`${size} text-red-500`} />;
	} else {
		return <FiFile className={`${size} text-gray-400`} />;
	}
};

const FILE_TYPES = [
	FileType.IMAGE,
	FileType.VIDEO,
	FileType.AUDIO,
	FileType.DOCUMENT,
	FileType.FONT,
	FileType.ICON,
	FileType.OTHER
];

export const FileManagementModal: React.FC<FileManagementModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [activeTab, setActiveTab] = useState<FileType>(FileType.IMAGE);
	const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
	const [isDeleting, setIsDeleting] = useState(false);

	const { isPage } = useViewport();
	
	// Get files for the current tab
	const { data: files, isLoading: isLoadingFiles, error: filesError, refetch: refetchFiles } = useGetFiles(activeTab);
	
	// Use appropriate delete mutation based on context
	const { mutate: batchDeleteAdmin } = useBatchDeleteFilesAdmin();
	const { mutate: batchDeleteUser } = useBatchDeleteFilesUser();

	// Reset selected files when tab changes
	useEffect(() => {
		setSelectedFiles(new Set());
	}, [activeTab]);

	if (!isOpen) return null;

	const handleFileSelect = (file: APIFile) => {
		const newSelectedFiles = new Set(selectedFiles);
		if (newSelectedFiles.has(file.id)) {
			newSelectedFiles.delete(file.id);
		} else {
			newSelectedFiles.add(file.id);
		}
		setSelectedFiles(newSelectedFiles);
	};

	const handleSelectAll = () => {
		if (files) {
			if (selectedFiles.size === files.length) {
				// Deselect all
				setSelectedFiles(new Set());
			} else {
				// Select all
				setSelectedFiles(new Set(files.map(file => file.id)));
			}
		}
	};

	const handleBatchDelete = async () => {
		if (selectedFiles.size === 0) {
			alert('Vui lòng chọn ít nhất một file để xóa.');
			return;
		}

		const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedFiles.size} file đã chọn? Hành động này không thể hoàn tác.`;
		if (!window.confirm(confirmMessage)) {
			return;
		}

		setIsDeleting(true);
		try {
			// Convert file IDs to strings as expected by the API
			const fileIds = Array.from(selectedFiles);

			// Use admin endpoint for templates, user endpoint for pages
			if (isPage) {
				batchDeleteUser({ fileIds });
			} else {
				batchDeleteAdmin({ fileIds });
			}
			
			// Clear selection after successful deletion
			setSelectedFiles(new Set());
			
			// Refetch files to update the list
			refetchFiles();
		} catch (error) {
			console.error('Error deleting files:', error);
			alert('Có lỗi xảy ra khi xóa file. Vui lòng thử lại.');
		} finally {
			setIsDeleting(false);
		}
	};

	const isFileSelected = (fileId: number) => {
		return selectedFiles.has(fileId);
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-opacity-50"
			onClick={handleBackdropClick}
			style={{ zIndex: zIndex.fileManagement , backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg w-[800px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center p-6 border-b">
					<h3 className="text-xl font-semibold">Quản lý File</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				{/* Tab Navigation */}
				<div className="flex border-b overflow-x-auto min-h-[60px]">
					{FILE_TYPES.map((fileType) => {
						const isActive = activeTab === fileType;
						return (
							<button
								key={fileType}
								className={`py-3 px-4 font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${getFileTypeTabColors(fileType, isActive)}`}
								onClick={() => setActiveTab(fileType)}
							>
								{getFileTypeTabIcon(fileType, isActive)}
								{getFileTypeTitle(fileType)}
							</button>
						);
					})}
				</div>

				{/* Action Bar */}
				<div className="flex justify-between items-center p-4 border-b bg-gray-50">
					<div className="flex items-center gap-4">
						<button
							onClick={handleSelectAll}
							className="text-sm text-blue-500 hover:text-blue-700"
						>
							{files && selectedFiles.size === files.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
						</button>
						{selectedFiles.size > 0 && (
							<span className="text-sm text-gray-600">
								Đã chọn {selectedFiles.size} file
							</span>
						)}
					</div>
					<button
						onClick={handleBatchDelete}
						disabled={selectedFiles.size === 0 || isDeleting}
						className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
							selectedFiles.size === 0 || isDeleting
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-red-500 text-white hover:bg-red-600'
						}`}
					>
						<FiTrash2 />
						{isDeleting ? 'Đang xóa...' : 'Xóa đã chọn'}
					</button>
				</div>

				{/* File Grid */}
				<div className="flex-grow overflow-y-auto p-4">
					{isLoadingFiles && <p className="text-center py-8">Đang tải danh sách file...</p>}
					{filesError && <p className="text-red-500 text-center py-8">Lỗi khi tải file: {filesError.message}</p>}
					{!isLoadingFiles && !filesError && files && files.length === 0 && (
						<p className="text-center py-8 text-gray-500">Chưa có file nào thuộc loại này.</p>
					)}
					
					{files && files.length > 0 && (
						<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
							{files.map((file) => {
								const filePath = `${domainFile}${file.filePath}`;
								const isSelected = isFileSelected(file.id);

								return (
									<div
										key={file.id}
										className={`relative group cursor-pointer border rounded-md overflow-hidden aspect-square flex items-center justify-center transition-all ${
											isSelected
												? 'border-blue-500 border-2 bg-blue-50'
												: 'border-gray-200 hover:border-blue-500'
										}`}
										onClick={() => handleFileSelect(file)}
									>
										{file.mimeType.startsWith('image/') ? (
											<img
												src={filePath}
												alt={file.originalName}
												className="object-cover w-full h-full"
											/>
										) : (
											getFileTypeIcon(file.mimeType)
										)}

										{/* Selection Checkbox */}
										<div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
											isSelected
												? 'bg-blue-500 border-blue-500'
												: 'bg-white border-gray-300'
										}`}>
											{isSelected && <FiCheckCircle className="text-white text-sm" />}
										</div>

										{/* File Name */}
										<p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate">
											{file.originalName}
										</p>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
