import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { DraggableNumberInput } from './DraggableNumberInput';
import { useViewport } from '../Viewport/ViewportContext';
import { CustomEffect, useUpdateTemplate } from '@/features/template/templateAPI';
import { zIndex } from '@/utils/zIndex';

interface CustomEffectsModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialValues: Partial<CustomEffect>;
}

export const CustomEffectsModal: React.FC<CustomEffectsModalProps> = ({
	isOpen,
	onClose,
	initialValues
}) => {
	const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
	const [autoScrollSpeed, setAutoScrollSpeed] = useState(1);
	const { mutate: updateTemplate } = useUpdateTemplate();
	const { id } = useViewport();

	useEffect(() => {
		if (initialValues?.autoScroll) {
			setAutoScrollEnabled(initialValues.autoScroll.enabled || false);
			setAutoScrollSpeed(initialValues.autoScroll.speed || 1);
		} else {
			// Set default values
			setAutoScrollEnabled(false);
			setAutoScrollSpeed(1);
		}
	}, [initialValues]);

	if (!isOpen) return null;

	const handleSave = async () => {
		const customEffects: CustomEffect = {
			autoScroll: {
				enabled: autoScrollEnabled,
				speed: autoScrollSpeed,
			}
		};

		await updateTemplate({ id: Number(id), data: { customEffects } });
		onClose();
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
			style={{ zIndex: zIndex.customEffects, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
		>
			<div
				className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] max-h-[80vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold">Cài đặt Hiệu ứng Tùy chỉnh</h3>
					<button onClick={onClose} className="p-1">
						<FiX className="text-2xl text-gray-600 hover:text-gray-800" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto space-y-6">
					{/* Auto-scroll Settings Section */}
					<div className="space-y-4">
						<h4 className="text-lg font-medium text-gray-800">Cài đặt Cuộn Tự động</h4>
						
						{/* Enable Auto-scroll Toggle */}
						<div className="flex items-center justify-between">
							<label className="text-sm font-medium text-gray-700">
								Bật cuộn tự động
							</label>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={autoScrollEnabled}
									onChange={(e) => setAutoScrollEnabled(e.target.checked)}
									className="sr-only"
								/>
								<div className={`w-11 h-6 rounded-full transition-colors ${
									autoScrollEnabled ? 'bg-blue-600' : 'bg-gray-200'
								}`}>
									<div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
										autoScrollEnabled ? 'translate-x-5' : 'translate-x-0'
									} mt-0.5 ml-0.5`}></div>
								</div>
							</label>
						</div>

						{/* Auto-scroll Speed */}
						{autoScrollEnabled && (
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									Tốc độ cuộn (1-10)
								</label>
								<div className="flex items-center space-x-4">
									<DraggableNumberInput
										value={autoScrollSpeed}
										onChange={setAutoScrollSpeed}
										min={1}
										max={10}
										step={1}
									/>
									<input
										type="range"
										min={1}
										max={10}
										step={1}
										value={autoScrollSpeed}
										onChange={(e) => setAutoScrollSpeed(Number(e.target.value))}
										className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									/>
									<span className="text-sm text-gray-600 w-8 text-center">
										{autoScrollSpeed}
									</span>
								</div>
								<p className="text-xs text-gray-500">
									Tốc độ cuộn từ chậm (1) đến nhanh (10)
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
					>
						Hủy
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						Lưu
					</button>
				</div>
			</div>
		</div>
	);
};
