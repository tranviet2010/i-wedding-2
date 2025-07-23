import React, { useState, useEffect } from 'react';
import { FiX, FiCode, FiEye } from 'react-icons/fi';
import { useViewport } from '../Viewport/ViewportContext';
import { useUpdateTemplate } from '@/features/template/templateAPI';
import DOMPurify from 'dompurify';
import { zIndex } from '@/utils/zIndex';

interface CustomHtmlSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValues: string;
}

export const CustomHtmlSettingsModal: React.FC<CustomHtmlSettingsModalProps> = ({
	isOpen,
	onClose,
	initialValues
}) => {
	const [customHtml, setCustomHtml] = useState('');
	const [showPreview, setShowPreview] = useState(false);
	const [validationError, setValidationError] = useState('');
	const { mutate: updateTemplate } = useUpdateTemplate();

	useEffect(() => {
		if (initialValues) {
			setCustomHtml(initialValues || '');
		}
	}, [initialValues]);

	const { id } = useViewport();

	if (!isOpen) return null;

	const validateHtml = (html: string): boolean => {
		if (!html.trim()) return true; // Empty HTML is valid

		try {
			// Create a temporary DOM element to test parsing
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			setValidationError('');
			return true;
		} catch (error) {
			setValidationError('Mã HTML không hợp lệ. Vui lòng kiểm tra cú pháp.');
			return false;
		}
	};

	const handleHtmlChange = (value: string) => {
		setCustomHtml(value);
		validateHtml(value);
	};

	const handleSave = async () => {
		if (!validateHtml(customHtml)) {
			return;
		}

		// Sanitize HTML before saving
		const sanitizedHtml = DOMPurify.sanitize(customHtml);


		await updateTemplate({
			id: Number(id), data: {
				customHtml: sanitizedHtml,
			}
		});
		onClose();
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const getSanitizedPreview = () => {
		return DOMPurify.sanitize(customHtml);
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center"
			onClick={handleBackdropClick}
			style={{ zIndex: zIndex.customHtmlSettings, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg p-6 w-[800px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Cài đặt HTML Tùy chỉnh</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex-grow overflow-hidden flex flex-col">
					{/* Toggle Preview Button */}
					<div className="flex justify-between items-center mb-4">
						<div className="text-sm text-gray-600">
							Thêm mã HTML tùy chỉnh sẽ được chèn vào cuối trang
						</div>
						<button
							type="button"
							onClick={() => setShowPreview(!showPreview)}
							className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-2"
						>
							{showPreview ? <FiCode /> : <FiEye />}
							{showPreview ? 'Chỉnh sửa' : 'Xem trước'}
						</button>
					</div>

					{/* Content Area */}
					<div className="flex-grow overflow-hidden">
						{!showPreview ? (
							<div className="h-full flex flex-col">
								<label className="block text-sm font-medium mb-2">Mã HTML:</label>
								<textarea
									value={customHtml}
									onChange={(e) => handleHtmlChange(e.target.value)}
									placeholder="Nhập mã HTML tùy chỉnh của bạn..."
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono resize-none"
									style={{ minHeight: '300px' }}
								/>
								{validationError && (
									<div className="mt-2 text-red-600 text-sm">
										{validationError}
									</div>
								)}
							</div>
						) : (
							<div className="h-full flex flex-col">
								<label className="block text-sm font-medium mb-2">Xem trước:</label>
								<div
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm overflow-auto bg-gray-50"
									style={{ minHeight: '300px' }}
									dangerouslySetInnerHTML={{ __html: getSanitizedPreview() }}
								/>
							</div>
						)}
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
						disabled={!!validationError}
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						Lưu cài đặt
					</button>
				</div>
			</div>
		</div>
	);
};
