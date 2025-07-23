import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX, FiCheckCircle, FiFile, FiSearch } from 'react-icons/fi';
import { useGetFonts, uploadFile, File as APIFile, FileType } from '../../../features/files/fileAPI';
import apiClient, { domainFile } from '@/api/apiClient';
import { getFontFormat, loadFontFromUrl } from '@/utils/fontLoader';
import { zIndex } from '@/utils/zIndex';

interface FontSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectFont: (fontName: string) => void;
}

export const FontSelectModal: React.FC<FontSelectModalProps> = ({
	isOpen,
	onClose,
	onSelectFont,
}) => {
	try {
		const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');
		const [previewUrl, setPreviewUrl] = useState<string | null>(null);
		const [isUploading, setIsUploading] = useState(false);
		const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
		const [searchTerm, setSearchTerm] = useState<string>('');
		const fileInputRef = useRef<HTMLInputElement>(null);

		const { data: fonts, isLoading: isLoadingFonts, error: fontsError, refetch: refetchFonts } = useGetFonts();		
		useEffect(() => {
			if (isOpen) {
				refetchFonts(); // Refetch fonts when modal opens
				setActiveTab('select'); // Default to select tab
				setPreviewUrl(null); // Reset preview
				setSearchTerm(''); // Reset search term
			}
		}, [isOpen, refetchFonts]);
		// Function to load font styles

		const loadFontStyle = (font: APIFile) => {
			// Only load font once
			if (loadedFonts.includes(font.fileName)) return;

			const fontUrl = `${domainFile}${font.filePath}`;
			const fontName = font.fileName;

			// Use the fontLoader utility
			loadFontFromUrl(fontName, fontUrl, getFontFormat(font.mimeType));

			// Add to loaded fonts
			setLoadedFonts(prev => [...prev, fontName]);
		};

		// Load all fonts when fonts data is available
		useEffect(() => {
			if (fonts && fonts.length > 0) {
				fonts.forEach(font => loadFontStyle(font));
			}
		}, [fonts]);

		if (!isOpen) {
			return null;
		}


		const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setIsUploading(true);
			setPreviewUrl(null);

			try {
				const uploadedFileData = await uploadFile(file);
				// Assuming uploadFile returns an object with a 'path' property
				const filePath = `${domainFile}${uploadedFileData.path}`;
				setPreviewUrl(filePath); // Show preview of uploaded file
				refetchFonts(); // Refresh the list of fonts
				setActiveTab('select'); // Switch to select tab to see the new font
			} catch (error) {
				console.error('Error uploading font:', error);
				// TODO: Show an error message to the user
			} finally {
				setIsUploading(false);
				if (fileInputRef.current) {
					fileInputRef.current.value = ''; // Reset file input
				}
			}
		};

		const handleFontSelect = (font: APIFile) => {
			// Load the font style if not already loaded
			loadFontStyle(font);

			// Call the callback with the font name
			onSelectFont(font.fileName);
			onClose();
		};

		const handleBackdropClick = (e: React.MouseEvent) => {
			if (e.target === e.currentTarget) {
				onClose();
			}
		};
		return (
			<div
				className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
				onClick={handleBackdropClick}
				style={{ zIndex: zIndex.fontSelect }} // Increase z-index to ensure it's above everything else
			>
				<div
					className="bg-white rounded-lg p-6 w-[800px] max-w-[90%] max-h-[80vh] flex flex-col"
					onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
					style={{ zIndex: zIndex.fontSelectOverlay }}
				>
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-xl font-semibold">Chọn hoặc Tải lên Font chữ</h3>
						<button onClick={onClose} className="p-1">
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
							Tải lên Font mới
						</button>
					</div>

					<div className="flex-grow overflow-y-auto">						{activeTab === 'select' && (
							<div>
								{isLoadingFonts && <p>Đang tải danh sách font...</p>}
								{fontsError && <p className="text-red-500">Lỗi khi tải font: {fontsError.message}</p>}
								{!isLoadingFonts && !fontsError && fonts && fonts.length === 0 && (
									<p>Chưa có font nào được tải lên.</p>
								)}
								
								<div className="mb-4 relative">
									<div className="relative">
										<input
											type="text"
											placeholder="Tìm kiếm font theo tên..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
										<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
									</div>								</div>
								
								<div className="grid grid-cols-3 gap-4">
									{fonts?.filter(font => 
										font.originalName.toLowerCase().includes(searchTerm.toLowerCase())
									).map((font) => (
										<div
											key={font.id}
											className="relative group cursor-pointer border border-gray-200 rounded-md p-4 hover:border-blue-500 transition"
											onClick={() => handleFontSelect(font)}
										>
											<div className="flex justify-between items-center">
												<p
													className='w-full'
												>
													{font.originalName}
												</p>
												<div className="opacity-0 group-hover:opacity-100 transition-opacity">
													<FiCheckCircle className="text-blue-500 text-xl" />
												</div>
											</div>
											<div
												className="mt-3 text-lg"
												style={{ fontFamily: `"${font.fileName}"` }}
											>
												meHappy
											</div>
											<div
												className="mt-1 text-sm"
												style={{ fontFamily: `"${font.fileName}"` }}
											>
												0123456789 !@#$%^&*()
											</div>
										</div>
									))}
									{fonts && 
									  fonts.filter(font => font.originalName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && 
									  searchTerm && (
										<div className="col-span-3 py-8 text-center text-gray-500">
											Không tìm thấy font nào phù hợp với "{searchTerm}"
										</div>
									)}
								</div>
							</div>
						)}

						{activeTab === 'upload' && (
							<div className="flex flex-col items-center justify-center h-full">
								<input
									ref={fileInputRef}
									type="file"
									accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
									onChange={handleFileUpload}
									className="hidden"
									disabled={isUploading}
								/>
								{!previewUrl && !isUploading && (
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="flex flex-col items-center justify-center gap-2 w-full h-64 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
									>
										<FiUpload className="text-5xl text-gray-400" />
										<span className="text-gray-600">Nhấn để chọn font tải lên</span>
										<span className="text-xs text-gray-500">Hỗ trợ định dạng TTF, OTF, WOFF, WOFF2</span>
									</button>
								)}
								{isUploading && (
									<div className="flex flex-col items-center">
										<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
										<p>Đang tải lên...</p>
									</div>
								)}
								{previewUrl && !isUploading && (
									<div className="mt-4 text-center">
										<h4 className="font-medium mb-2">Tải lên thành công!</h4>
										<div className="p-4 border rounded-md flex items-center gap-2">
											<FiFile className="text-2xl" />
											<span>{previewUrl.substring(previewUrl.lastIndexOf('/') + 1)}</span>
										</div>
										<p className="text-sm text-gray-600 mt-2">Bạn có thể chuyển qua tab "Chọn từ Thư viện" để sử dụng font này.</p>
									</div>
								)}
							</div>
						)}
					</div>

					<div className="mt-6 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							Đóng
						</button>
					</div>      </div>
			</div>
		);
	} catch (error) {
		console.error('Error rendering FontSelectModal:', error);
		// Return a minimal fallback UI if there's an error
		return isOpen ? (
			<div
				className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
				style={{ zIndex: zIndex.fontSelect }}
			>
				<div className="bg-white rounded-lg p-6 w-[400px] flex flex-col items-center">
					<h3 className="text-xl font-semibold mb-4 text-red-500">Error Loading Font Selector</h3>
					<p className="mb-4">There was a problem loading the font selector.</p>
					<button
						onClick={onClose}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Close
					</button>
				</div>
			</div>
		) : null;
	}
};
