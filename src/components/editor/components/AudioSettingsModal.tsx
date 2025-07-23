import React, { useState, useEffect } from 'react';
import { FiX, FiPlay, FiPause } from 'react-icons/fi';
import { FaPlay, FaPause } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { useViewport } from '../Viewport/ViewportContext';
import { AudioSettings, useUpdateTemplate } from '@/features/template/templateAPI';
import { useGetAudioTemplates } from '@/features/audioTemplates/audioTemplatesAPI';
import { domainFile } from '@/api/apiClient';
import { zIndex } from '@/utils/zIndex';

import { IconPickerModal } from './IconPickerModal';
import { ColorPickerModal } from './ColorPickerModal';

interface AudioSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValues: Partial<AudioSettings>;
}

// Helper function to convert React Icon to SVG data URL
const iconToDataUrl = (IconComponent: React.ComponentType<any>): string => {
	try {
		const iconElement = React.createElement(IconComponent, {
			size: 24,
			style: { width: '100%', height: '100%' }
		});
		const svgCode = renderToStaticMarkup(iconElement);
		return `data:image/svg+xml;base64,${btoa(svgCode)}`;
	} catch (error) {
		console.error('Error converting icon to data URL:', error);
		return '';
	}
};

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



// Default icons
const DEFAULT_PLAY_ICON = iconToDataUrl(FaPlay);
const DEFAULT_PAUSE_ICON = iconToDataUrl(FaPause);

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
	isOpen,
	onClose,
	initialValues
}) => {
	const [audioUrl, setAudioUrl] = useState('');
	const [selectedAudioTemplateId, setSelectedAudioTemplateId] = useState<string>('');
	const [playIconUrl, setPlayIconUrl] = useState('');
	const [pauseIconUrl, setPauseIconUrl] = useState('');
	const [playIconColor, setPlayIconColor] = useState('#000000');
	const [pauseIconColor, setPauseIconColor] = useState('#000000');
	const [showPlayIconPicker, setShowPlayIconPicker] = useState(false);
	const [showPauseIconPicker, setShowPauseIconPicker] = useState(false);
	const [showPlayColorPicker, setShowPlayColorPicker] = useState(false);
	const [showPauseColorPicker, setShowPauseColorPicker] = useState(false);
	const [enableAnimations, setEnableAnimations] = useState(true);
	const [useDefaultIcons, setUseDefaultIcons] = useState(false);
	const [autoPlay, setAutoPlay] = useState(false);
	const { mutate: updateTemplate } = useUpdateTemplate();
	const { data: audioTemplates, isLoading: isLoadingTemplates } = useGetAudioTemplates();

	useEffect(() => {
		if (initialValues) {
			setAudioUrl(initialValues.audioUrl || '');
			setPlayIconUrl(initialValues.playIconUrl || DEFAULT_PLAY_ICON);
			setPauseIconUrl(initialValues.pauseIconUrl || DEFAULT_PAUSE_ICON);
			setPlayIconColor(initialValues.playIconColor || '#000000');
			setPauseIconColor(initialValues.pauseIconColor || '#000000');
			setEnableAnimations(initialValues.enableAnimations !== undefined ? initialValues.enableAnimations : true);
			setUseDefaultIcons(initialValues.useDefaultIcons !== undefined ? initialValues.useDefaultIcons : false);
			setAutoPlay(initialValues.autoPlay !== undefined ? initialValues.autoPlay : false);

			// Try to find matching audio template if audioUrl is set
			if (initialValues.audioUrl && audioTemplates) {
				const matchingTemplate = audioTemplates.find(template =>
					`${domainFile}${template.fileUrl}` === initialValues.audioUrl
				);
				if (matchingTemplate) {
					setSelectedAudioTemplateId(matchingTemplate.id.toString());
				}
			}
		} else {
			// Set default icons and colors when no initial values
			setPlayIconUrl(DEFAULT_PLAY_ICON);
			setPauseIconUrl(DEFAULT_PAUSE_ICON);
			setPlayIconColor('#000000');
			setPauseIconColor('#000000');
			setEnableAnimations(true);
			setUseDefaultIcons(false);
			setAutoPlay(false);
		}
	}, [initialValues, audioTemplates]);

	const { id } = useViewport();

	if (!isOpen) return null;

	const handleSave = async () => {
		if (!audioUrl) {
			alert('Vui lòng chọn file âm thanh.');
			return;
		}
		const audioSettings: AudioSettings = {
			audioUrl,
			playIconUrl: useDefaultIcons ? '' : getColoredPlayIconUrl(),
			pauseIconUrl: useDefaultIcons ? '' : getColoredPauseIconUrl(),
			playIconColor,
			pauseIconColor,
			enableAnimations,
			useDefaultIcons,
			autoPlay,
		};

		await updateTemplate({ id: Number(id), data: { audioSettings } });
		onClose();
	};



	const handleAudioTemplateSelect = (templateId: string) => {
		setSelectedAudioTemplateId(templateId);
		if (templateId && audioTemplates) {
			const selectedTemplate = audioTemplates.find(t => t.id.toString() === templateId);
			if (selectedTemplate) {
				setAudioUrl(`${domainFile}${selectedTemplate.fileUrl}`);
			}
		} else {
			setAudioUrl(''); // Clear audio URL when no template is selected
		}
	};

	const handlePlayIconSelect = () => {
		setShowPlayIconPicker(true);
	};

	const handlePauseIconSelect = () => {
		setShowPauseIconPicker(true);
	};

	// Helper function to get colored play icon URL
	const getColoredPlayIconUrl = () => {
		if (playIconUrl.startsWith('data:image/svg+xml;base64,')) {
			const svgContent = atob(playIconUrl.replace('data:image/svg+xml;base64,', ''));
			const coloredSvg = applyColorToSvg(svgContent, playIconColor);
			return 'data:image/svg+xml;base64,' + btoa(coloredSvg);
		}
		return playIconUrl;
	};

	// Helper function to get colored pause icon URL
	const getColoredPauseIconUrl = () => {
		if (pauseIconUrl.startsWith('data:image/svg+xml;base64,')) {
			const svgContent = atob(pauseIconUrl.replace('data:image/svg+xml;base64,', ''));
			const coloredSvg = applyColorToSvg(svgContent, pauseIconColor);
			return 'data:image/svg+xml;base64,' + btoa(coloredSvg);
		}
		return pauseIconUrl;
	};

	const handlePlayIconPicked = (svgCode: string) => {
		// Convert SVG code to data URL for storage
		const dataUrl = `data:image/svg+xml;base64,${btoa(svgCode)}`;
		setPlayIconUrl(dataUrl);
		setShowPlayIconPicker(false);
	};

	const handlePauseIconPicked = (svgCode: string) => {
		// Convert SVG code to data URL for storage
		const dataUrl = `data:image/svg+xml;base64,${btoa(svgCode)}`;
		setPauseIconUrl(dataUrl);
		setShowPauseIconPicker(false);
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
			style={{ zIndex: zIndex.audioSettings, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Cài đặt Âm thanh Nền</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex-grow overflow-y-auto">
					<div className="space-y-4">
						{/* Audio Template Selection */}
						<div>
							<label className="block text-sm font-medium mb-2">Chọn âm thanh:</label>
							<select
								value={selectedAudioTemplateId}
								onChange={(e) => handleAudioTemplateSelect(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
								disabled={isLoadingTemplates}
							>
								<option value="">
									{isLoadingTemplates ? "Đang tải..." : "-- Chọn audio template --"}
								</option>
								{audioTemplates?.map((template) => (
									<option key={template.id} value={template.id.toString()}>
										{template.name} ({template.tier.toUpperCase()})
									</option>
								))}
							</select>

							{audioUrl && (
								<div className="mt-2">
									<audio controls className="w-full">
										<source src={audioUrl} type="audio/mpeg" />
										Trình duyệt của bạn không hỗ trợ audio.
									</audio>
								</div>
							)}
						</div>

						{/* Icon Type Selection */}
						<div>
							<div className="flex justify-between items-center">
								<label className="text-sm font-medium">
									Sử dụng biểu tượng mặc định:
								</label>
								<input
									type="checkbox"
									checked={useDefaultIcons}
									onChange={(e) => setUseDefaultIcons(e.target.checked)}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
								/>
							</div>
							<p className="text-xs text-gray-600 mt-1">
								Bật để sử dụng biểu tượng mặc định của hệ thống, tắt để tùy chỉnh biểu tượng riêng
							</p>
						</div>

						{/* Play Icon Selection */}
						{!useDefaultIcons && (
						<div>
							<label className="block text-sm font-medium mb-2">Biểu tượng mở:</label>
							<div className="flex items-center gap-3">
								<input
									type="url"
									value={playIconUrl}
									onChange={(e) => setPlayIconUrl(e.target.value)}
									placeholder="Nhập URL biểu tượng mở hoặc chọn từ thư viện"
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
								/>
								<button
									type="button"
									onClick={handlePlayIconSelect}
									className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-2"
								>
									<FiPlay />
									Chọn biểu tượng
								</button>
							</div>
							{playIconUrl && (
								<div className="mt-2 flex items-center gap-3">
									<div
										className="w-8 h-8 flex items-center justify-center"
										dangerouslySetInnerHTML={{
											__html: (() => {
												const coloredUrl = getColoredPlayIconUrl();
												if (coloredUrl.startsWith('data:image/svg+xml;base64,')) {
													return atob(coloredUrl.replace('data:image/svg+xml;base64,', ''));
												} else if (coloredUrl) {
													return `<img src="${coloredUrl}" alt="Preview" style="width: 100%; height: 100%; object-fit: contain;" />`;
												}
												return '<div style="width: 100%; height: 100%; background: #f0f0f0; border: 1px dashed #ccc;"></div>';
											})()
										}}
									/>
									<div className="flex items-center gap-2">
										<label className="text-sm font-medium">Màu:</label>
										<div
											className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
											onClick={() => setShowPlayColorPicker(true)}
										>
											<div
												className="w-6 h-6 rounded border border-gray-200"
												style={{ backgroundColor: playIconColor }}
											/>
											<span className="text-sm text-gray-700">{playIconColor}</span>
										</div>
										<button
											type="button"
											onClick={() => setPlayIconColor('#000000')}
											className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
										>
											Đặt lại
										</button>
									</div>
								</div>
							)}
						</div>
						)}

						{/* Pause Icon Selection */}
						{!useDefaultIcons && (
						<div>
							<label className="block text-sm font-medium mb-2">Biểu tượng tắt:</label>
							<div className="flex items-center gap-3">
								<input
									type="url"
									value={pauseIconUrl}
									onChange={(e) => setPauseIconUrl(e.target.value)}
									placeholder="Nhập URL biểu tượng tắt hoặc chọn từ thư viện"
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
								/>
								<button
									type="button"
									onClick={handlePauseIconSelect}
									className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-2"
								>
									<FiPause />
									Chọn biểu tượng
								</button>
							</div>
							{pauseIconUrl && (
								<div className="mt-2 flex items-center gap-3">
									<div
										className="w-8 h-8 flex items-center justify-center"
										dangerouslySetInnerHTML={{
											__html: (() => {
												const coloredUrl = getColoredPauseIconUrl();
												if (coloredUrl.startsWith('data:image/svg+xml;base64,')) {
													return atob(coloredUrl.replace('data:image/svg+xml;base64,', ''));
												} else if (coloredUrl) {
													return `<img src="${coloredUrl}" alt="Preview" style="width: 100%; height: 100%; object-fit: contain;" />`;
												}
												return '<div style="width: 100%; height: 100%; background: #f0f0f0; border: 1px dashed #ccc;"></div>';
											})()
										}}
									/>
									<div className="flex items-center gap-2">
										<label className="text-sm font-medium">Màu:</label>
										<div
											className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
											onClick={() => setShowPauseColorPicker(true)}
										>
											<div
												className="w-6 h-6 rounded border border-gray-200"
												style={{ backgroundColor: pauseIconColor }}
											/>
											<span className="text-sm text-gray-700">{pauseIconColor}</span>
										</div>
										<button
											type="button"
											onClick={() => setPauseIconColor('#000000')}
											className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
										>
											Đặt lại
										</button>
									</div>
								</div>
							)}
						</div>
						)}

						{/* Animation Toggle */}
						<div>
							<div className="flex justify-between items-center">
								<label className="text-sm font-medium">
									Hiệu ứng chuyển động:
								</label>
								<input
									type="checkbox"
									checked={enableAnimations}
									onChange={(e) => setEnableAnimations(e.target.checked)}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
								/>
							</div>
							<p className="text-xs text-gray-600 mt-1">
								Bật/tắt hiệu ứng rung, xoay và phát sáng khi phát nhạc
							</p>
						</div>

						{/* Auto-play Toggle */}
						<div>
							<div className="flex justify-between items-center">
								<label className="text-sm font-medium">
									Tự động phát khi cuộn đến:
								</label>
								<input
									type="checkbox"
									checked={autoPlay}
									onChange={(e) => setAutoPlay(e.target.checked)}
									className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
								/>
							</div>
							<p className="text-xs text-gray-600 mt-1">
								Tự động phát nhạc khi người dùng cuộn đến component (chỉ một lần mỗi lần truy cập)
							</p>
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

			{/* Icon Picker Modals */}
			<IconPickerModal
				isOpen={showPlayIconPicker}
				onClose={() => setShowPlayIconPicker(false)}
				onIconSelect={handlePlayIconPicked}
				initialSearchTerm="play"
			/>
			<IconPickerModal
				isOpen={showPauseIconPicker}
				onClose={() => setShowPauseIconPicker(false)}
				onIconSelect={handlePauseIconPicked}
				initialSearchTerm="pause"
			/>

			{/* Color Picker Modals */}
			<ColorPickerModal
				isOpen={showPlayColorPicker}
				onClose={() => setShowPlayColorPicker(false)}
				onColorChange={(color) => setPlayIconColor(color)}
				initialColor={playIconColor}
			/>
			<ColorPickerModal
				isOpen={showPauseColorPicker}
				onClose={() => setShowPauseColorPicker(false)}
				onColorChange={(color) => setPauseIconColor(color)}
				initialColor={pauseIconColor}
			/>
		</div>
	);
};
