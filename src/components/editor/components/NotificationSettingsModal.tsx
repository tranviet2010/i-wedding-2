import React, { useState, useEffect } from 'react';
import { FiX, FiBell } from 'react-icons/fi';
import { renderToStaticMarkup } from 'react-dom/server';
import { useViewport } from '../Viewport/ViewportContext';
import { NotificationSettings, useUpdateTemplate } from '@/features/template/templateAPI';
import { Switch, HStack, Text, Select, createListCollection } from '@chakra-ui/react';
import { IconPickerModal } from './IconPickerModal';
import { ColorPickerModal } from './ColorPickerModal';
import { DraggableNumberInput } from './DraggableNumberInput';
import { zIndex } from '@/utils/zIndex';

interface NotificationSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValues: Partial<NotificationSettings>;
}

// Default notification icon (bell icon)
const DEFAULT_NOTIFICATION_ICON = (() => {
	const iconElement = <FiBell size={24} />;
	return `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(iconElement))}`;
})();

// Size options for the notification
const sizeOptions = createListCollection({
	items: [
		{ value: 'small', label: 'Bé' },
		{ value: 'medium', label: 'Vừa' },
		{ value: 'large', label: 'Lớn' }
	]
});

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
	isOpen,
	onClose,
	initialValues
}) => {
	const [enabled, setEnabled] = useState(true);
	const [displayDuration, setDisplayDuration] = useState(5000);
	const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
	const [iconUrl, setIconUrl] = useState('');
	const [iconColor, setIconColor] = useState('#000000');
	const [showIcon, setShowIcon] = useState(true);
	const [useDefaultIcon, setUseDefaultIcon] = useState(true);
	const [showIconPicker, setShowIconPicker] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false);

	const { mutate: updateTemplate } = useUpdateTemplate();

	useEffect(() => {
		if (initialValues) {
			setEnabled(initialValues.enabled !== undefined ? initialValues.enabled : true);
			setDisplayDuration(initialValues.displayDuration || 5000);
			setSize(initialValues.size || 'medium');
			setIconUrl(initialValues.iconUrl || DEFAULT_NOTIFICATION_ICON);
			setIconColor(initialValues.iconColor || '#000000');
			setShowIcon(initialValues.showIcon !== undefined ? initialValues.showIcon : true);
			setUseDefaultIcon(initialValues.useDefaultIcon !== undefined ? initialValues.useDefaultIcon : true);
		} else {
			// Set default values when no initial values
			setEnabled(true);
			setDisplayDuration(5000);
			setSize('medium');
			setIconUrl(DEFAULT_NOTIFICATION_ICON);
			setIconColor('#000000');
			setShowIcon(true);
			setUseDefaultIcon(true);
		}
	}, [initialValues]);

	const { id } = useViewport();

	if (!isOpen) return null;

	const handleSave = async () => {
		const notificationSettings: NotificationSettings = {
			enabled,
			displayDuration,
			size,
			iconUrl: getColoredIconUrl(),
			iconColor,
			showIcon,
			useDefaultIcon,
		};

		await updateTemplate({ id: Number(id), data: { notificationSettings } });
		onClose();
	};

	const getColoredIconUrl = () => {
		if (useDefaultIcon || !iconUrl) {
			return DEFAULT_NOTIFICATION_ICON;
		}

		try {
			// If it's a data URL, extract the SVG and apply color
			if (iconUrl.startsWith('data:image/svg+xml;base64,')) {
				const svgCode = atob(iconUrl.split(',')[1]);
				const coloredSvg = svgCode.replace(/fill="[^"]*"/g, `fill="${iconColor}"`);
				return `data:image/svg+xml;base64,${btoa(coloredSvg)}`;
			}
			return iconUrl;
		} catch (error) {
			console.warn('Error processing icon URL:', error);
			return iconUrl;
		}
	};

	const handleIconSelect = () => {
		setShowIconPicker(true);
	};

	const handleIconPicked = (svgCode: string) => {
		// Convert SVG code to data URL for storage
		const dataUrl = `data:image/svg+xml;base64,${btoa(svgCode)}`;
		setIconUrl(dataUrl);
		setUseDefaultIcon(false);
		setShowIconPicker(false);
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
			style={{ zIndex: zIndex.notificationSettings, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Cài đặt thông báo lời chúc</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex-grow overflow-y-auto">
					<div className="space-y-4">
						{/* Enable/Disable Notifications */}
						<div>
							<label className="block text-sm font-medium mb-2">Bật/Tắt thông báo lời chúc:</label>
							<HStack>
								<Switch.Root
									checked={enabled}
									onCheckedChange={(e) => setEnabled(e.checked)}
								>
									<Switch.HiddenInput />
									<Switch.Control>
										<Switch.Thumb />
									</Switch.Control>
								</Switch.Root>
								<Text fontSize="sm">
									{enabled ? 'Bật thông báo lời chúc' : 'Tắt thông báo lời chúc'}
								</Text>
							</HStack>
							<Text fontSize="xs" color="gray.500" mt={1}>
								Tắt tính năng này nếu trang không có lời chúc hoặc để tắt trong xem trước template
							</Text>
						</div>

						{/* Display Duration */}
						<div style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
							<label className="block text-sm font-medium mb-2">Thời gian hiển thị (ms):</label>
							<div className="flex items-center gap-3">
								<DraggableNumberInput
									value={displayDuration}
									onChange={(value) => setDisplayDuration(value)}
									min={1000}
									max={30000}
									step={500}
								/>
								<Text fontSize="xs" color="gray.500">
									{(displayDuration / 1000).toFixed(1)} giây
								</Text>
							</div>
						</div>

						{/* Size Selection */}
						<div style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
							<label className="block text-sm font-medium mb-2">Kích cỡ:</label>
							<Select.Root
								collection={sizeOptions}
								value={[size]}
								onValueChange={(e) => setSize(e.value[0] as 'small' | 'medium' | 'large')}
							>
								<Select.Trigger className="w-full">
									<Select.ValueText placeholder="Chọn kích cỡ" />
								</Select.Trigger>
								<Select.Content>
									{sizeOptions.items.map((option) => (
										<Select.Item key={option.value} item={option}>
											{option.label}
										</Select.Item>
									))}
								</Select.Content>
							</Select.Root>
						</div>

						{/* Icon Display Settings */}
						<div style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
							<label className="block text-sm font-medium mb-2">Icon hiển thị:</label>
							
							{/* Show Icon Toggle */}
							<div className="mb-3">
								<HStack>
									<Switch.Root
										checked={showIcon}
										onCheckedChange={(e) => setShowIcon(e.checked)}
									>
										<Switch.HiddenInput />
										<Switch.Control>
											<Switch.Thumb />
										</Switch.Control>
									</Switch.Root>
									<Text fontSize="sm">Hiển thị icon</Text>
								</HStack>
							</div>

							{showIcon && (
								<>
									{/* Use Default Icon Toggle */}
									<div className="mb-3">
										<HStack>
											<Switch.Root
												checked={useDefaultIcon}
												onCheckedChange={(e) => setUseDefaultIcon(e.checked)}
											>
												<Switch.HiddenInput />
												<Switch.Control>
													<Switch.Thumb />
												</Switch.Control>
											</Switch.Root>
											<Text fontSize="sm">Sử dụng icon mặc định</Text>
										</HStack>
									</div>

									{/* Custom Icon Selection */}
									{!useDefaultIcon && (
										<div>
											<div className="flex items-center gap-3 mb-2">
												<input
													type="url"
													value={iconUrl}
													onChange={(e) => setIconUrl(e.target.value)}
													placeholder="Nhập URL icon hoặc chọn từ thư viện"
													className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
												/>
												<button
													type="button"
													onClick={handleIconSelect}
													className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-2"
												>
													<FiBell />
													Chọn icon
												</button>
											</div>
											{iconUrl && (
												<div className="flex items-center gap-3">
													<div
														className="w-8 h-8 flex items-center justify-center"
														dangerouslySetInnerHTML={{
															__html: (() => {
																try {
																	if (iconUrl.startsWith('data:image/svg+xml;base64,')) {
																		const svgCode = atob(iconUrl.split(',')[1]);
																		return svgCode.replace(/fill="[^"]*"/g, `fill="${iconColor}"`);
																	}
																	return `<img src="${iconUrl}" alt="icon" style="width: 100%; height: 100%; object-fit: contain;" />`;
																} catch (error) {
																	return `<img src="${iconUrl}" alt="icon" style="width: 100%; height: 100%; object-fit: contain;" />`;
																}
															})()
														}}
													/>
													<button
														type="button"
														onClick={() => setShowColorPicker(true)}
														className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
														style={{ backgroundColor: iconColor }}
													>
														Màu icon
													</button>
												</div>
											)}
										</div>
									)}
								</>
							)}
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

			{/* Icon Picker Modal */}
			<IconPickerModal
				isOpen={showIconPicker}
				onClose={() => setShowIconPicker(false)}
				onIconSelect={handleIconPicked}
				initialSearchTerm="bell"
			/>

			{/* Color Picker Modal */}
			<ColorPickerModal
				isOpen={showColorPicker}
				onClose={() => setShowColorPicker(false)}
				onColorChange={(color) => setIconColor(color)}
				initialColor={iconColor}
			/>
		</div>
	);
};
