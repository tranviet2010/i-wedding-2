import React, { useState, useEffect } from 'react';
import { FiX, FiImage, FiGlobe, FiTag, FiPlus, FiMinus, FiLock } from 'react-icons/fi';
import { zIndex } from '@/utils/zIndex';
import { useViewport } from '../Viewport/ViewportContext';
import { FileType } from '@/features/files/fileAPI';
import { SEOSettings, useUpdateTemplate } from '@/features/template/templateAPI';

interface SEOSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValues: Partial<SEOSettings>;
}

export const SEOSettingsModal: React.FC<SEOSettingsModalProps> = ({
	isOpen,
	onClose,
	initialValues
}) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [keywords, setKeywords] = useState<string[]>([]);
	const [imageUrl, setImageUrl] = useState('');
	const [favoriteIconUrl, setFavoriteIconUrl] = useState('');
	const [newKeyword, setNewKeyword] = useState('');
	const [password, setPassword] = useState('');
	const { mutate: updateTemplate } = useUpdateTemplate();

	useEffect(() => {
		if (Object.keys(initialValues || {}).length) {
			setTitle(initialValues.title || '');
			setDescription(initialValues.description || '');
			setKeywords(initialValues.keywords?.length ? initialValues.keywords : []);
			setImageUrl(initialValues.imageUrl || '');
			setFavoriteIconUrl(initialValues.favoriteIconUrl || '');
			setPassword(initialValues.password || '');
		}
	}, [initialValues]);
	const { showFileSelectModal, id } = useViewport();

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!title.trim()) {
			alert('Vui lòng nhập tiêu đề trang.');
			return;
		}
		if (!description.trim()) {
			alert('Vui lòng nhập mô tả trang.');
			return;
		}

		const seoSettings: SEOSettings = {
			title: title.trim(),
			description: description.trim(),
			keywords: keywords.filter(k => k.trim() !== ''),
			imageUrl,
			favoriteIconUrl,
			password: password.trim() || undefined,
		};

		await updateTemplate({ id: Number(id), data: { seoSettings } });
		onClose();
	};

	const handleImageSelect = () => {
		showFileSelectModal(FileType.IMAGE, (fileUrl: string) => {
			setImageUrl(fileUrl);
		});
	};

	const handleFaviconSelect = () => {
		showFileSelectModal(FileType.IMAGE, (fileUrl: string) => {
			setFavoriteIconUrl(fileUrl);
		});
	};

	const addKeyword = () => {
		if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
			setKeywords([...keywords, newKeyword.trim()]);
			setNewKeyword('');
		}
	};

	const removeKeyword = (index: number) => {
		setKeywords(keywords.filter((_, i) => i !== index));
	};

	const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addKeyword();
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center"
			onClick={handleBackdropClick}
			style={{ zIndex: zIndex.seoSettings, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg p-6 w-[600px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Cài đặt SEO</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex-grow overflow-y-auto">
					<div className="space-y-4">
						{/* Title */}
						<div>
							<label className="block text-sm font-medium mb-2">Tiêu đề trang (Tiêu đề thiệp cưới) *:</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Nhập tiêu đề trang (hiển thị trên tab trình duyệt)"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								maxLength={60}
							/>
							<div className="text-xs text-gray-500 mt-1">
								{title.length}/60 ký tự.
								VD: Đám cưới của Xuân Thịnh & Diễm Hằng
							</div>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm font-medium mb-2">Mô tả trang (Thiệp cưới) *:</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Nhập mô tả trang (hiển thị trong kết quả tìm kiếm)"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
								maxLength={160}
							/>
							<div className="text-xs text-gray-500 mt-1">
								{description.length}/160 ký tự. VD: Xuân Thịnh & Diễm Hằng - Our wedding date: 2024-11-10 | Chúng mình cưới
							</div>
						</div>

						{/* Keywords */}
						<div>
							<label className="block text-sm font-medium mb-2">Từ khóa:</label>
							<div className="flex items-center gap-2 mb-2">
								<input
									type="text"
									value={newKeyword}
									onChange={(e) => setNewKeyword(e.target.value)}
									onKeyPress={handleKeywordKeyPress}
									placeholder="Nhập từ khóa và nhấn Enter"
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
								/>
								<button
									type="button"
									onClick={addKeyword}
									className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
								>
									<FiPlus size={14} />
									Thêm
								</button>
							</div>
							{keywords.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{keywords.map((keyword, index) => (
										<span
											key={index}
											className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
										>
											<FiTag size={12} />
											{keyword}
											<button
												type="button"
												onClick={() => removeKeyword(index)}
												className="text-blue-600 hover:text-blue-800"
											>
												<FiMinus size={12} />
											</button>
										</span>
									))}
								</div>
							)}
						</div>

						{/* Social Media Image */}
						<div>
							<label className="block text-sm font-medium mb-2">Hình ảnh chia sẻ mạng xã hội:</label>
							<div className="flex items-center gap-3">
								<input
									type="url"
									value={imageUrl}
									onChange={(e) => setImageUrl(e.target.value)}
									placeholder="Nhập URL hình ảnh hoặc chọn từ thư viện"
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
								/>
								<button
									type="button"
									onClick={handleImageSelect}
									className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-2"
								>
									<FiImage />
									Chọn hình ảnh
								</button>
							</div>
							{imageUrl && (
								<div className="mt-2">
									<img
										src={imageUrl}
										alt="Social Media Preview"
										className="w-20 h-20 object-cover rounded border"
									/>
								</div>
							)}
							<div className="text-xs text-gray-500 mt-1">
								Khuyến nghị: 1200x630px (tỷ lệ 1.91:1) cho Facebook, Twitter
							</div>
						</div>

						{/* Favicon */}
						<div>
							<label className="block text-sm font-medium mb-2">Biểu tượng trang (Favicon):</label>
							<div className="flex items-center gap-3">
								<input
									type="url"
									value={favoriteIconUrl}
									onChange={(e) => setFavoriteIconUrl(e.target.value)}
									placeholder="Nhập URL biểu tượng hoặc chọn từ thư viện"
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
								/>
								<button
									type="button"
									onClick={handleFaviconSelect}
									className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm flex items-center gap-2"
								>
									<FiGlobe />
									Chọn biểu tượng
								</button>
							</div>
							{favoriteIconUrl && (
								<div className="mt-2">
									<img
										src={favoriteIconUrl}
										alt="Favicon Preview"
										className="w-8 h-8 object-cover rounded border"
									/>
								</div>
							)}
							<div className="text-xs text-gray-500 mt-1">
								Khuyến nghị: 32x32px hoặc 16x16px, định dạng ICO, PNG
							</div>
						</div>

						{/* Password Protection */}
						<div>
							<label className="block text-sm font-medium mb-2 flex items-center gap-2">
								<FiLock />
								Bảo vệ trang bằng mật khẩu:
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Nhập mật khẩu để bảo vệ trang (để trống nếu không cần)"
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							/>
							<div className="text-xs text-gray-500 mt-1">
								Nếu đặt mật khẩu, người xem sẽ phải nhập mật khẩu để truy cập trang
							</div>
						</div>
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex justify-end gap-3 mt-6 pt-4 border-t">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
					>
						Hủy
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
					>
						Lưu cài đặt
					</button>
				</div>
			</div>
		</div>
	);
};
