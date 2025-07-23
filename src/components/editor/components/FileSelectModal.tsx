import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX, FiCheckCircle, FiFile, FiImage, FiVideo, FiMusic, FiFileText } from 'react-icons/fi';
import { useGetFiles, uploadFile, uploadFileWithTag, File as APIFile, FileType, FILE_TYPE_MIME_MAP, useGetAllTags } from '../../../features/files/fileAPI';
import apiClient, { domainFile } from '@/api/apiClient';
import { zIndex } from '@/utils/zIndex';


interface FileSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectFile?: (filePath: string) => void;
	onSelectFiles?: (filePaths: string[]) => void;
	fileType: FileType | undefined;
	maxSelection?: number;
	allowMultiSelect?: boolean;
}

// Helper functions for file type handling
const getFileTypeTitle = (fileType?: FileType): string => {
	const prefix = 'Chọn hoặc Tải lên';
	switch (fileType) {
		case FileType.IMAGE:
			return `${prefix} Hình ảnh`;
		case FileType.VIDEO:
			return `${prefix} Video`;
		case FileType.AUDIO:
			return `${prefix} Âm thanh`;
		case FileType.DOCUMENT:
			return `${prefix} Tài liệu`;
		case FileType.FONT:
			return `${prefix} Font`;
		default:
			return `${prefix} File`;
	}
};

const getAcceptAttribute = (fileType?: FileType): string => {
	if (!fileType || !FILE_TYPE_MIME_MAP[fileType]) {
		return '*/*';
	}
	return FILE_TYPE_MIME_MAP[fileType].join(',');
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

const getSupportedFormatsText = (fileType?: FileType): string => {
	switch (fileType) {
		case FileType.IMAGE:
			return 'Hỗ trợ: JPG, PNG, GIF, WebP, SVG, BMP, TIFF';
		case FileType.VIDEO:
			return 'Hỗ trợ: MP4, MOV, AVI, WMV, WebM, OGG, 3GP';
		case FileType.AUDIO:
			return 'Hỗ trợ: MP3, WAV, OGG, MIDI, WebM, AAC';
		case FileType.DOCUMENT:
			return 'Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV';
		case FileType.FONT:
			return 'Hỗ trợ: TTF, OTF, WOFF, WOFF2';
		default:
			return 'Hỗ trợ tất cả các loại file';
	}
};

const getMimeTypeFromExtension = (fileName: string): string => {
	const extension = fileName.toLowerCase().split('.').pop();
	switch (extension) {
		case 'pdf':
			return 'application/pdf';
		case 'doc':
		case 'docx':
			return 'application/msword';
		case 'xls':
		case 'xlsx':
			return 'application/vnd.ms-excel';
		case 'mp3':
			return 'audio/mpeg';
		case 'wav':
			return 'audio/wav';
		case 'mp4':
			return 'video/mp4';
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		default:
			return 'application/octet-stream';
	}
};

// File size limits by extension (in bytes)
const fileSizeLimits = {
	// Image files
	'jpg': 5 * 1024 * 1024,    // 5MB
	'jpeg': 5 * 1024 * 1024,   // 5MB
	'png': 5 * 1024 * 1024,    // 5MB
	'gif': 3 * 1024 * 1024,    // 3MB
	'webp': 3 * 1024 * 1024,   // 3MB
	'svg': 2 * 1024 * 1024,    // 2MB
	'bmp': 5 * 1024 * 1024,    // 5MB
	'tiff': 10 * 1024 * 1024,  // 10MB

	// Video files
	'mp4': 20 * 1024 * 1024,   // 20MB
	'mov': 20 * 1024 * 1024,   // 20MB
	'avi': 20 * 1024 * 1024,   // 20MB
	'wmv': 20 * 1024 * 1024,   // 20MB
	'webm': 20 * 1024 * 1024,  // 20MB
	'ogg': 20 * 1024 * 1024,   // 20MB
	'3gp': 20 * 1024 * 1024,   // 20MB

	// Document files
	'pdf': 10 * 1024 * 1024,   // 10MB
	'doc': 5 * 1024 * 1024,    // 5MB
	'docx': 5 * 1024 * 1024,   // 5MB
	'xls': 5 * 1024 * 1024,    // 5MB
	'xlsx': 5 * 1024 * 1024,   // 5MB
	'txt': 1 * 1024 * 1024,    // 1MB
	'csv': 5 * 1024 * 1024,    // 5MB

	// Audio files
	'mp3': 10 * 1024 * 1024,   // 10MB
	'wav': 20 * 1024 * 1024,   // 20MB
	'midi': 1 * 1024 * 1024,   // 1MB
	'mid': 1 * 1024 * 1024,    // 1MB
	'aac': 10 * 1024 * 1024,   // 10MB

	// Font files
	'ttf': 2 * 1024 * 1024,    // 2MB
	'otf': 2 * 1024 * 1024,    // 2MB
	'woff': 1 * 1024 * 1024,   // 1MB
	'woff2': 1 * 1024 * 1024,  // 1MB
};

const getFileExtension = (fileName: string): string => {
	return fileName.toLowerCase().split('.').pop() || '';
};

const getFileSizeLimit = (fileName: string): number => {
	const extension = getFileExtension(fileName);
	return fileSizeLimits[extension as keyof typeof fileSizeLimits] || 10 * 1024 * 1024; // Default 10MB
};

const formatFileSize = (bytes: number): string => {
	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(0)}KB`;
	}
	return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

const validateFile = (file: File, fileType?: FileType): { isValid: boolean; error?: string } => {
	// Get file size limit based on file extension
	const maxSize = getFileSizeLimit(file.name);
	if (file.size > maxSize) {
		return {
			isValid: false,
			error: `File quá lớn. Kích thước tối đa cho ${getFileExtension(file.name).toUpperCase()} là ${formatFileSize(maxSize)} (file hiện tại: ${formatFileSize(file.size)})`
		};
	}

	// Check file type if specified
	if (fileType && FILE_TYPE_MIME_MAP[fileType]) {
		const allowedTypes = FILE_TYPE_MIME_MAP[fileType];
		if (!allowedTypes.includes(file.type)) {
			return {
				isValid: false,
				error: `Loại file không được hỗ trợ. Vui lòng chọn file: ${getSupportedFormatsText(fileType)}`
			};
		}
	}

	return { isValid: true };
};

const renderFilePreview = (fileUrl: string, fileType?: FileType) => {
	const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

	// For images, show image preview
	if (fileType === FileType.IMAGE || fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff)$/i)) {
		return (
			<img
				src={fileUrl}
				alt="Preview"
				className="max-w-xs max-h-48 object-contain rounded border"
			/>
		);
	}

	// For audio files, show audio player
	if (fileType === FileType.AUDIO || fileUrl.match(/\.(mp3|wav|ogg|aac|webm|midi)$/i)) {
		return (
			<div className="p-4 border rounded-md">
				<div className="flex items-center gap-2 mb-2">
					<FiMusic className="text-2xl text-green-500" />
					<span className="font-medium">{fileName}</span>
				</div>
				<audio controls className="w-full">
					<source src={fileUrl} />
					Trình duyệt của bạn không hỗ trợ audio.
				</audio>
			</div>
		);
	}

	// For video files, show video player
	if (fileType === FileType.VIDEO || fileUrl.match(/\.(mp4|mov|avi|wmv|webm|ogg|3gp)$/i)) {
		return (
			<div className="p-4 border rounded-md">
				<div className="flex items-center gap-2 mb-2">
					<FiVideo className="text-2xl text-purple-500" />
					<span className="font-medium">{fileName}</span>
				</div>
				<video controls className="max-w-xs max-h-48 rounded">
					<source src={fileUrl} />
					Trình duyệt của bạn không hỗ trợ video.
				</video>
			</div>
		);
	}

	// For other files, show file icon and name
	const mimeType = getMimeTypeFromExtension(fileName);
	return (
		<div className="p-4 border rounded-md flex items-center gap-2">
			{getFileTypeIcon(mimeType, 'text-2xl')}
			<span>{fileName}</span>
		</div>
	);
};

export const FileSelectModal: React.FC<FileSelectModalProps> = ({
	isOpen,
	onClose,
	onSelectFile,
	onSelectFiles,
	fileType,
	maxSelection = 20,
	allowMultiSelect = false,
}) => {
	const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
	const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([]);

	// Enhanced upload state management
	const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
	const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({});
	const [uploadResults, setUploadResults] = useState<{
		successful: Array<{file: File, url: string}>;
		failed: Array<{file: File, error: string}>;
	}>({ successful: [], failed: [] });

	// Tag-related state
	const [selectedTag, setSelectedTag] = useState<string>('');
	const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);

	// Upload form state
	const [uploadTag, setUploadTag] = useState<string>('');
	const [showUploadForm, setShowUploadForm] = useState(false);

	const { data: files, isLoading: isLoadingFiles, error: filesError, refetch: refetchFiles } = useGetFiles(fileType || FileType.OTHER);
	const { data: existingTags = [], isLoading: isLoadingTags } = useGetAllTags();

	useEffect(() => {
		if (isOpen) {
			refetchFiles(); // Refetch files when modal opens
			setActiveTab('select'); // Default to select tab
			setPreviewUrl(null); // Reset preview
			setUploadProgress({}); // Reset upload progress
			setUploadErrors({}); // Reset upload errors
			setUploadResults({ successful: [], failed: [] }); // Reset upload results
			setSelectedTag(''); // Reset tag selection
			setShowUploadForm(false); // Reset upload form
			setUploadTag(''); // Reset upload tag
			setPendingUploadFiles([]); // Reset pending files
		}
	}, [isOpen, refetchFiles]);

	if (!isOpen) return null;

	// Function to get unique tags for the current file type
	const getTagsForFileType = (): string[] => {
		if (!files) return [];

		const tags = files
			.map((file: APIFile) => file.tag)
			.filter((tag: string) => tag && tag.trim() !== '') // Filter out empty tags
			.filter((tag: string, index: number, array: string[]) => array.indexOf(tag) === index); // Remove duplicates

		return tags.sort(); // Sort alphabetically
	};

	// Get filtered files based on selected tag
	const getFilteredFiles = (): APIFile[] => {
		if (!files) return [];

		if (selectedTag === '') {
			return files; // Show all files if no tag selected
		}

		return files.filter((file: APIFile) => file.tag === selectedTag);
	};

	// Handle file upload with tag support
	const handleFileUploadWithTag = async (file: File, tag: string = '') => {
		const fileKey = `${file.name}-${file.size}`;

		try {
			setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));

			// Simulate progress for better UX
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => ({
					...prev,
					[fileKey]: Math.min((prev[fileKey] || 0) + 10, 90)
				}));
			}, 100);

			const uploadedFileData = await uploadFileWithTag(file, tag);

			clearInterval(progressInterval);
			setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));

			const fileUrl = `${domainFile}${uploadedFileData.path}`;
			return { file, url: fileUrl };

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Upload failed';
			setUploadErrors(prev => ({ ...prev, [fileKey]: errorMessage }));
			throw new Error(errorMessage);
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// Convert FileList to Array for easier handling
		const fileArray = Array.from(files);

		// Show upload form for tag input
		setShowUploadForm(true);
		setPendingUploadFiles(fileArray);

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Handle upload with tag from the form
	const handleUploadWithTag = async () => {
		if (!pendingUploadFiles || pendingUploadFiles.length === 0) return;

		setIsUploading(true);
		setPreviewUrl(null);
		setUploadResults({ successful: [], failed: [] });
		setUploadErrors({});

		const successful: Array<{file: File, url: string}> = [];
		const failed: Array<{file: File, error: string}> = [];

		// Clean up the tag (trim whitespace)
		const cleanTag = uploadTag.trim();

		// Process each file
		for (const file of pendingUploadFiles) {
			// Validate file first
			const validation = validateFile(file, fileType);
			if (!validation.isValid) {
				failed.push({ file, error: validation.error || 'File không hợp lệ' });
				continue;
			}

			try {
				const result = await handleFileUploadWithTag(file, cleanTag);
				successful.push(result);

				// Set preview URL to the first successful upload
				if (successful.length === 1) {
					setPreviewUrl(result.url);
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Upload failed';
				failed.push({ file, error: errorMessage });
			}
		}

		// Update results
		setUploadResults({ successful, failed });

		// Refresh files list if any uploads succeeded
		if (successful.length > 0) {
			refetchFiles();
			setTimeout(() => {
				setActiveTab('select');
			}, 1000);
		}

		setIsUploading(false);
		setShowUploadForm(false);
		setPendingUploadFiles([]);
		setUploadTag('');
	};

	const handleRetryFailedUploads = async () => {
		if (uploadResults.failed.length === 0) return;

		setIsUploading(true);
		const failedFiles = uploadResults.failed.map(result => result.file);
		const successful: Array<{file: File, url: string}> = [...uploadResults.successful];
		const failed: Array<{file: File, error: string}> = [];

		// Reset progress and errors for retry
		setUploadProgress({});
		setUploadErrors({});

		// Retry failed uploads
		for (const file of failedFiles) {
			// Validate file again
			const validation = validateFile(file, fileType);
			if (!validation.isValid) {
				failed.push({ file, error: validation.error || 'File không hợp lệ' });
				continue;
			}

			try {
				const result = await handleFileUploadWithTag(file);
				successful.push(result);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Upload failed';
				failed.push({ file, error: errorMessage });
			}
		}

		// Update results
		setUploadResults({ successful, failed });

		// Refresh files list if any uploads succeeded
		if (successful.length > uploadResults.successful.length) {
			refetchFiles();
		}

		setIsUploading(false);
	};



	// Handle file selection
	const handleFileSelect = (file: APIFile) => {
		const filePath = `${domainFile}${file.filePath}`;
		
		if (allowMultiSelect) {
			const isSelected = selectedFiles.has(file.id);
			const newSelectedFiles = new Set(selectedFiles);
			const newSelectedFilePaths = [...selectedFilePaths];
			
			if (isSelected) {
				// Remove from selection
				newSelectedFiles.delete(file.id);
				const pathIndex = newSelectedFilePaths.indexOf(filePath);
				if (pathIndex > -1) {
					newSelectedFilePaths.splice(pathIndex, 1);
				}
			} else {
				// Add to selection (check max limit)
				if (newSelectedFiles.size >= maxSelection) {
					return; // Don't exceed max selection
				}
				newSelectedFiles.add(file.id);
				newSelectedFilePaths.push(filePath);
			}
			
			setSelectedFiles(newSelectedFiles);
			setSelectedFilePaths(newSelectedFilePaths);
		} else {
			// Single select mode
			if (onSelectFile) {
				onSelectFile(filePath);
				onClose();
			}
		}
	};
	
	// Handle confirming multi-selection
	const handleConfirmSelection = () => {
		if (onSelectFiles && selectedFilePaths.length > 0) {
			onSelectFiles(selectedFilePaths);
			onClose();
		}
	};
	
	// Reset selections when modal closes
	const handleClose = () => {
		setSelectedFiles(new Set());
		setSelectedFilePaths([]);
		onClose();
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	return (
		<>
			<div
				className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
				onClick={handleBackdropClick}
				style={{ zIndex: zIndex.fileSelect }} // Ensure it's above other elements
			>
			<div
				className="bg-white rounded-lg p-6 w-[300px] sm:w-[600px] max-w-[90%] max-h-[80vh] flex flex-col"
				style={{ zIndex: zIndex.fileSelectOverlay }}
				onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
			>
				<div className="flex justify-between items-center mb-4">
					<div>
						<h3 className="text-xl font-semibold">{getFileTypeTitle(fileType)}</h3>
					</div>
					<button onClick={handleClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex border-b mb-4">
					<button
						className={`py-2 px-4 font-medium ${activeTab === 'select' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
						onClick={() => setActiveTab('select')}
					>
						Chọn từ Thư viện
					</button>
					<button
						className={`py-2 px-4 font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
						onClick={() => setActiveTab('upload')}
					>
						Tải lên Mới
					</button>
				</div>

				<div className="flex-grow overflow-y-auto">
					{activeTab === 'select' && (
						<div>
							{isLoadingFiles && <p>Đang tải danh sách file...</p>}
							{filesError && <p className="text-red-500">Lỗi khi tải file: {filesError.message}</p>}
							{!isLoadingFiles && !filesError && files && files.length === 0 && (
								<p>Chưa có file nào được tải lên.</p>
							)}

							{/* Tag filtering section */}
							{!isLoadingFiles && !filesError && files && files.length > 0 && (
								<div className="mb-4">
									{(() => {
										const tagsForFileType = getTagsForFileType();

										if (tagsForFileType.length > 0) {
											return (
												<div>
													<div className="text-sm font-medium mb-2 text-gray-700">
														Lọc theo tag:
													</div>
													<div className="flex flex-wrap gap-2 mb-4">
														<button
															className={`px-3 py-1 text-sm rounded-md border cursor-pointer transition-colors ${
																selectedTag === ''
																	? 'bg-blue-500 text-white border-blue-500'
																	: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
															}`}
															onClick={() => setSelectedTag('')}
														>
															Tất cả ({files.length})
														</button>
														{tagsForFileType.map((tag: string) => (
															<button
																key={tag}
																className={`px-3 py-1 text-sm rounded-md border cursor-pointer transition-colors ${
																	selectedTag === tag
																		? 'bg-blue-500 text-white border-blue-500'
																		: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
																}`}
																onClick={() => setSelectedTag(tag)}
															>
																{tag} ({files.filter((f: APIFile) => f.tag === tag).length})
															</button>
														))}
													</div>
												</div>
											);
										}
										return null;
									})()}
								</div>
							)}

							<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
								{getFilteredFiles().map((file) => {
									const filePath = `${domainFile}${file.filePath}`;
									const isSelected = allowMultiSelect && selectedFiles.has(file.id);

									return (
										<div
											key={file.id}
											className={`relative group cursor-pointer border rounded-md overflow-hidden aspect-square flex items-center justify-center transition-all ${
												isSelected 
													? 'border-blue-500 ring-2 ring-blue-200' 
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

											<div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity ${
												isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
											}`}>
												<FiCheckCircle className={`text-3xl ${isSelected ? 'text-blue-400' : 'text-white'}`} />
											</div>

											{/* Multi-select checkbox */}
											{allowMultiSelect && (
												<div className="absolute top-2 right-2">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => {}} // Handled by parent div click
														className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
													/>
												</div>
											)}

											<div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
												<p className="truncate">{file.originalName}</p>
												{file.tag && (
													<p className="truncate text-blue-200">#{file.tag}</p>
												)}
											</div>
										</div>
									);
								})}
							</div>

							{/* Show message when no files match the selected tag */}
							{selectedTag !== '' && getFilteredFiles().length === 0 && (
								<p className="text-gray-500 text-center mt-4">
									Không có file nào với tag "{selectedTag}"
								</p>
							)}
						</div>
					)}

					{activeTab === 'upload' && (
						<div className="flex flex-col items-center justify-center h-full">
							<input
								ref={fileInputRef}
								type="file"
								accept={getAcceptAttribute(fileType)}
								onChange={handleFileUpload}
								className="hidden"
								disabled={isUploading}
								multiple={true}
							/>

							{!showUploadForm && !previewUrl && !isUploading && (
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex flex-col items-center justify-center gap-2 w-full h-64 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
								>
									<FiUpload className="text-5xl text-gray-400" />
									<span className="text-gray-600 font-medium">
										Nhấn để chọn file tải lên
									</span>
									<span className="text-sm text-blue-600 font-medium">
										Hỗ trợ chọn nhiều file cùng lúc
									</span>
									<span className="text-xs text-gray-500">{getSupportedFormatsText(fileType)}</span>
								</button>
							)}

							{showUploadForm && pendingUploadFiles && pendingUploadFiles.length > 0 && !isUploading && (
								<div className="w-full max-w-md">
									<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
										<h4 className="font-medium mb-2">
											{pendingUploadFiles.length === 1
												? 'File được chọn:'
												: `${pendingUploadFiles.length} file được chọn:`
											}
										</h4>
										<div className="max-h-32 overflow-y-auto space-y-1">
											{pendingUploadFiles.map((file, index) => (
												<div key={index} className="flex justify-between items-center">
													<p className="text-sm text-gray-600 truncate flex-1 mr-2">{file.name}</p>
													<p className="text-xs text-gray-500 flex-shrink-0">
														{(file.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
											))}
										</div>
										{pendingUploadFiles.length > 1 && (
											<p className="text-xs text-gray-500 mt-2">
												Tổng: {(pendingUploadFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
											</p>
										)}
									</div>

									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Tag (tùy chọn)
										</label>
										<input
											type="text"
											value={uploadTag}
											onChange={(e) => setUploadTag(e.target.value)}
											placeholder="Nhập tag cho file (ví dụ: asset, profile-image, ...)"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											list="existing-tags"
										/>
										<datalist id="existing-tags">
											{existingTags.map((tag, index) => (
												<option key={index} value={tag} />
											))}
										</datalist>
										<p className="text-xs text-gray-500 mt-1">
											Tag giúp phân loại và tìm kiếm file dễ dàng hơn.
											{pendingUploadFiles.length > 1
												? ` Tag này sẽ được áp dụng cho tất cả ${pendingUploadFiles.length} file được chọn.`
												: ' Bạn có thể chọn từ danh sách có sẵn hoặc nhập tag mới.'
											}
										</p>
									</div>

									<div className="flex gap-3">
										<button
											onClick={handleUploadWithTag}
											className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
										>
											{pendingUploadFiles.length > 1
												? `Tải lên ${pendingUploadFiles.length} file`
												: 'Tải lên'
											}
										</button>
										<button
											onClick={() => {
												setShowUploadForm(false);
												setPendingUploadFiles([]);
												setUploadTag('');
											}}
											className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
										>
											Hủy
										</button>
									</div>
								</div>
							)}
							{isUploading && (
								<div className="flex flex-col items-center w-full max-w-md">
									<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
									<p className="text-lg font-medium mb-4">Đang tải lên file...</p>

									{/* Individual file progress */}
									<div className="w-full space-y-2">
										{Object.entries(uploadProgress).map(([fileKey, progress]) => {
											const fileName = fileKey.split('-')[0];
											const hasError = uploadErrors[fileKey];

											return (
												<div key={fileKey} className="w-full">
													<div className="flex justify-between items-center mb-1">
														<span className="text-sm text-gray-600 truncate max-w-[200px]">
															{fileName}
														</span>
														<span className="text-sm text-gray-500">
															{hasError ? 'Lỗi' : `${Math.round(progress)}%`}
														</span>
													</div>
													<div className="w-full bg-gray-200 rounded-full h-2">
														<div
															className={`h-2 rounded-full transition-all duration-300 ${
																hasError ? 'bg-red-500' : 'bg-blue-500'
															}`}
															style={{ width: `${hasError ? 100 : progress}%` }}
														></div>
													</div>
													{hasError && (
														<p className="text-xs text-red-500 mt-1">{uploadErrors[fileKey]}</p>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}
							{(previewUrl || uploadResults.successful.length > 0 || uploadResults.failed.length > 0) && !isUploading && (
								<div className="mt-4 text-center w-full">
									{/* Success section */}
									{uploadResults.successful.length > 0 && (
										<div className="mb-4">
											<h4 className="font-medium mb-2 text-green-600">
												{uploadResults.successful.length > 1
													? `✓ Tải lên ${uploadResults.successful.length} file thành công!`
													: '✓ Tải lên thành công!'
												}
											</h4>
											{uploadResults.successful.length > 0 ? (
												<div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
													{uploadResults.successful.map((result, index) => (
														<div key={index} className="border rounded border-green-200">
															{renderFilePreview(result.url, fileType)}
														</div>
													))}
												</div>
											) : previewUrl ? (
												renderFilePreview(previewUrl, fileType)
											) : null}
										</div>
									)}

									{/* Error section */}
									{uploadResults.failed.length > 0 && (
										<div className="mb-4">
											<h4 className="font-medium mb-2 text-red-600">
												✗ {uploadResults.failed.length} file tải lên thất bại:
											</h4>
											<div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-32 overflow-y-auto mb-3">
												{uploadResults.failed.map((result, index) => (
													<div key={index} className="text-sm text-red-700 mb-1">
														<span className="font-medium">{result.file.name}:</span> {result.error}
													</div>
												))}
											</div>
											<button
												onClick={handleRetryFailedUploads}
												disabled={isUploading}
												className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
											>
												{isUploading ? 'Đang thử lại...' : `Thử lại ${uploadResults.failed.length} file`}
											</button>
										</div>
									)}

									{uploadResults.successful.length > 0 && (
										<p className="text-sm text-gray-600 mt-2">
											Bạn có thể chuyển qua tab "Chọn từ Thư viện" để sử dụng file đã tải lên.
										</p>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Multi-select controls */}
				{allowMultiSelect && activeTab === 'select' && (
					<div className="mt-4 p-3 bg-gray-50 rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-gray-700">
								Đã chọn: {selectedFiles.size}/{maxSelection} file
							</span>
							{selectedFiles.size > 0 && (
								<button
									onClick={() => {
										setSelectedFiles(new Set());
										setSelectedFilePaths([]);
									}}
									className="text-xs text-red-600 hover:text-red-800"
								>
									Bỏ chọn tất cả
								</button>
							)}
						</div>
						{selectedFiles.size > 0 && (
							<div className="text-xs text-gray-500">
								Bấm "Xác nhận" để chọn {selectedFiles.size} file này
							</div>
						)}
					</div>
				)}

				<div className="mt-6 flex justify-end gap-3">
					{allowMultiSelect && selectedFiles.size > 0 && (
						<button
							type="button"
							onClick={handleConfirmSelection}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Xác nhận ({selectedFiles.size})
						</button>
					)}
					<button
						type="button"
						onClick={handleClose}
						className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
					>
						{allowMultiSelect && selectedFiles.size > 0 ? 'Hủy' : 'Đóng'}
					</button>
				</div>
			</div>
		</div>


	</>
);
};
