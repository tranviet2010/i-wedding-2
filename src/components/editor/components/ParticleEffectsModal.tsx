import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { DraggableNumberInput } from './DraggableNumberInput';
import { ColorPickerModal } from './ColorPickerModal';
import { useViewport } from '../Viewport/ViewportContext';
import { Effects, useUpdateTemplate } from '@/features/template/templateAPI';
import { zIndex } from '@/utils/zIndex';

interface ParticleEffectsModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValues: Partial<Effects>;
}

type IconType = 'snow' | 'heart' | 'custom';

export const ParticleEffectsModal: React.FC<ParticleEffectsModalProps> = ({
	isOpen,
	onClose,
	initialValues
}) => {
	const [iconType, setIconType] = useState<IconType>('snow');
	const [imageUrl, setImageUrl] = useState('');
	const [iconColor, setIconColor] = useState('#ffffff');
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const [coverageLevel, setCoverageLevel] = useState(50);
	const [fallSpeed, setFallSpeed] = useState(5);
	const [minSize, setMinSize] = useState(10);
	const [maxSize, setMaxSize] = useState(30);
	const { mutate: updateTemplate } = useUpdateTemplate();

	useEffect(() => {
		if (initialValues) {
			// Determine icon type based on imageUrl
			const url = initialValues.imageUrl || '';

			// Check if it's one of our predefined SVG patterns
			if (!url || url.includes('M12 2L13.09 8.26L19 7L17.74 9.74L24 12')) {
				setIconType('snow');
				setIconColor('#ffffff'); // Default snow color
			} else if (url.includes('M12 21.35L10.55 20.03C5.4 15.36')) {
				setIconType('heart');
				setIconColor('#ff0000'); // Default heart color
			} else {
				setIconType('custom');
				setIconColor('#ffffff'); // Default custom color
			}

			setImageUrl(url);
			setCoverageLevel(initialValues.coverageLevel || 50);
			setFallSpeed(initialValues.fallSpeed || 5);
			setMinSize(initialValues.minSize || 10);
			setMaxSize(initialValues.maxSize || 30);
		}
	}, [initialValues]);

	const { showIconPickerModal, id } = useViewport();

	if (!isOpen) return null;

	// Function to apply color to SVG
	const applyColorToSvg = (svgString: string, color: string): string => {
		if (!svgString || !color) return svgString;

		// Parse the SVG and apply the fill color
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
		const svgElement = svgDoc.querySelector('svg');

		if (svgElement) {
			// Apply fill color to the SVG element and all its children
			svgElement.setAttribute('fill', color);

			// Also apply to path elements that might not inherit the fill
			const pathElements = svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');
			pathElements.forEach(element => {
				// Only set fill if it's not already set to 'none' or if it's currently set to a color
				const currentFill = element.getAttribute('fill');
				if (!currentFill || (currentFill !== 'none' && currentFill !== 'transparent')) {
					element.setAttribute('fill', color);
				}
			});

			return new XMLSerializer().serializeToString(svgDoc);
		}

		return svgString;
	};

	// Helper function to get the appropriate image URL based on icon type
	const getImageUrl = () => {
		switch (iconType) {
			case 'snow':
				const snowSvg = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<defs>
							<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
								<feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.3)"/>
							</filter>
						</defs>
						<circle cx="12" cy="12" r="4" fill="${iconColor}" filter="url(#shadow)"/>
					</svg>
				`;
				return 'data:image/svg+xml;base64,' + btoa(snowSvg);
			case 'heart':
				const heartSvg = `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}">
						<path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
					</svg>
				`;
				return 'data:image/svg+xml;base64,' + btoa(heartSvg);
			case 'custom':
				// Apply color to custom SVG if it's an SVG data URL
				if (imageUrl.startsWith('data:image/svg+xml;base64,')) {
					const svgContent = atob(imageUrl.replace('data:image/svg+xml;base64,', ''));
					const coloredSvg = applyColorToSvg(svgContent, iconColor);
					return 'data:image/svg+xml;base64,' + btoa(coloredSvg);
				}
				return imageUrl;
			default:
				return imageUrl;
		}
	};

	const handleSave = async () => {
		const finalImageUrl = getImageUrl();
		if (!finalImageUrl && iconType === 'custom') {
			alert('Vui lòng chọn biểu tượng để sử dụng hiệu ứng.');
			return;
		}

		const effects: Effects = {
			imageUrl: finalImageUrl,
			coverageLevel,
			fallSpeed,
			minSize,
			maxSize,
		};

		await updateTemplate({ id: Number(id), data: {effects} });
		onClose();
	};

	const handleRemoveEffects = async () => {
		// Confirm before removing effects
		if (window.confirm('Bạn có chắc chắn muốn xóa tất cả hiệu ứng không?')) {
			await updateTemplate({ id: Number(id), data: { effects: {} as Effects } });
			onClose();
		}
	};

	const handleCustomIconSelect = () => {
		showIconPickerModal((svgCode: string) => {
			// Convert SVG code to data URL for storage
			const dataUrl = 'data:image/svg+xml;base64,' + btoa(svgCode);
			setImageUrl(dataUrl);
		});
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center "
			onClick={handleBackdropClick}
			style={{ zIndex: zIndex.particleEffects, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Cài đặt Hiệu ứng Rơi</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex-grow overflow-y-auto">
					<div className="space-y-4">
						{/* Icon Type Selection */}
						<div>
							<label className="block text-sm font-medium mb-2">Loại hiệu ứng:</label>
							<select
								value={iconType}
								onChange={(e) => {
									const newType = e.target.value as IconType;
									setIconType(newType);
									// Set default colors when changing icon type
									if (newType === 'snow') {
										setIconColor('#ffffff');
									} else if (newType === 'heart') {
										setIconColor('#ff0000');
									}
								}}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
							>
								<option value="snow">Hiệu ứng bông tuyết</option>
								<option value="heart">Hiệu ứng trái tim</option>
								<option value="custom">Hiệu ứng tuỳ chọn</option>
							</select>

							{/* Preview of selected icon */}
							<div className="mt-2 flex items-center gap-2">
								<span className="text-sm text-gray-600">Xem trước:</span>
								<div
									className="w-6 h-6 flex items-center justify-center"
									dangerouslySetInnerHTML={{
										__html: (() => {
											const finalImageUrl = getImageUrl();
											if (finalImageUrl.startsWith('data:image/svg+xml;base64,')) {
												return atob(finalImageUrl.replace('data:image/svg+xml;base64,', ''));
											} else if (finalImageUrl) {
												return `<img src="${finalImageUrl}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />`;
											}
											return '<div style="width: 100%; height: 100%; background: #f0f0f0; border: 1px dashed #ccc;"></div>';
										})()
									}}
								/>
							</div>
						</div>

						{/* Color Selection */}
						<div>
							<label className="block text-sm font-medium mb-2">Màu biểu tượng:</label>
							<div className="flex items-center gap-3">
								<div
									className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
									onClick={() => setIsColorPickerOpen(true)}
								>
									<div
										className="w-6 h-6 rounded border border-gray-200"
										style={{ backgroundColor: iconColor }}
									/>
									<span className="text-sm text-gray-700">{iconColor}</span>
								</div>
								<button
									type="button"
									onClick={() => {
										if (iconType === 'snow') {
											setIconColor('#ffffff');
										} else if (iconType === 'heart') {
											setIconColor('#ff0000');
										} else {
											setIconColor('#ffffff');
										}
									}}
									className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
								>
									Đặt lại
								</button>
							</div>
						</div>

						{/* Custom Icon Selection - Only show when custom is selected */}
						{iconType === 'custom' && (
							<div>
								<label className="block text-sm font-medium mb-2">Chọn biểu tượng tuỳ chọn:</label>
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={handleCustomIconSelect}
										className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-2"
									>
										<FiUpload size={16} />
										Chọn biểu tượng
									</button>
									{imageUrl && (
										<span className="text-sm text-gray-600">Đã chọn biểu tượng</span>
									)}
								</div>
								{imageUrl && (
									<div className="mt-2">
										<div
											className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50"
											dangerouslySetInnerHTML={{
												__html: (() => {
													const finalImageUrl = getImageUrl();
													if (finalImageUrl.startsWith('data:image/svg+xml;base64,')) {
														return atob(finalImageUrl.replace('data:image/svg+xml;base64,', ''));
													} else if (finalImageUrl) {
														return `<img src="${finalImageUrl}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />`;
													}
													return '<div style="width: 100%; height: 100%; background: #f0f0f0; border: 1px dashed #ccc;"></div>';
												})()
											}}
										/>
									</div>
								)}
							</div>
						)}

						{/* Coverage Level */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Mức độ phủ: {coverageLevel}%
							</label>
							<div className="flex items-center gap-2">
								<DraggableNumberInput
									value={coverageLevel}
									onChange={setCoverageLevel}
									min={1}
									max={100}
									tooltip="Điều chỉnh mức độ phủ của hiệu ứng"
								/>
								<input
									type="range"
									min="1"
									max="100"
									value={coverageLevel}
									onChange={(e) => setCoverageLevel(parseInt(e.target.value))}
									className="flex-1"
								/>
							</div>
						</div>

						{/* Fall Speed */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Tốc độ rơi: {fallSpeed}
							</label>
							<div className="flex items-center gap-2">
								<DraggableNumberInput
									value={fallSpeed}
									onChange={setFallSpeed}
									min={1}
									max={10}
									tooltip="Điều chỉnh tốc độ rơi của các hạt"
								/>
								<input
									type="range"
									min="1"
									max="10"
									value={fallSpeed}
									onChange={(e) => setFallSpeed(parseInt(e.target.value))}
									className="flex-1"
								/>
							</div>
						</div>

						{/* Min Size */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Kích thước nhỏ nhất: {minSize}px
							</label>
							<div className="flex items-center gap-2">
								<DraggableNumberInput
									value={minSize}
									onChange={(value) => {
										setMinSize(value);
										// Ensure max size is always >= min size
										if (value > maxSize) {
											setMaxSize(value);
										}
									}}
									min={5}
									max={100}
									tooltip="Kích thước nhỏ nhất của các hạt (px)"
								/>
								<input
									type="range"
									min="5"
									max="100"
									value={minSize}
									onChange={(e) => {
										const value = parseInt(e.target.value);
										setMinSize(value);
										if (value > maxSize) {
											setMaxSize(value);
										}
									}}
									className="flex-1"
								/>
							</div>
						</div>

						{/* Max Size */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Kích thước lớn nhất: {maxSize}px
							</label>
							<div className="flex items-center gap-2">
								<DraggableNumberInput
									value={maxSize}
									onChange={(value) => {
										setMaxSize(value);
										// Ensure min size is always <= max size
										if (value < minSize) {
											setMinSize(value);
										}
									}}
									min={5}
									max={100}
									tooltip="Kích thước lớn nhất của các hạt (px)"
								/>
								<input
									type="range"
									min="5"
									max="100"
									value={maxSize}
									onChange={(e) => {
										const value = parseInt(e.target.value);
										setMaxSize(value);
										if (value < minSize) {
											setMinSize(value);
										}
									}}
									className="flex-1"
								/>
							</div>
						</div>

						{/* Preview section */}
						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<h4 className="text-sm font-medium mb-2">Xem trước cài đặt:</h4>
							<div className="text-xs text-gray-600 space-y-1">
								<div>• Loại hiệu ứng: {
									iconType === 'snow' ? 'Bông tuyết' :
									iconType === 'heart' ? 'Trái tim' :
									'Tuỳ chọn'
								}</div>
								<div className="flex items-center gap-2">
									• Màu biểu tượng:
									<div
										className="w-3 h-3 rounded border border-gray-300"
										style={{ backgroundColor: iconColor }}
									/>
									<span>{iconColor}</span>
								</div>
								<div>• Mức độ phủ: {coverageLevel}%</div>
								<div>• Tốc độ rơi: {fallSpeed}/10</div>
								<div>• Kích thước: {minSize}px - {maxSize}px</div>
								{iconType === 'custom' && imageUrl && (
									<div>• Biểu tượng: {
										imageUrl.startsWith('data:image/svg+xml;base64,')
											? 'Biểu tượng SVG tuỳ chọn'
											: imageUrl.substring(imageUrl.lastIndexOf('/') + 1)
									}</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="mt-6 flex justify-between pt-4 border-t">
					<button
						type="button"
						onClick={handleRemoveEffects}
						className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
					>
						<FiX size={16} />
						Xóa hiệu ứng
					</button>

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							Hủy
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
						>
							Áp dụng hiệu ứng
						</button>
					</div>
				</div>
			</div>

			{/* Color Picker Modal */}
			<ColorPickerModal
				isOpen={isColorPickerOpen}
				onClose={() => setIsColorPickerOpen(false)}
				onColorChange={(color) => setIconColor(color)}
				initialColor={iconColor}
			/>
		</div>
	);
};
