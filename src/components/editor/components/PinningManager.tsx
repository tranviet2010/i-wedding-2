import {
	Box,
	HStack,
	Input,
	Stack,
	Text,
	Select,
	Switch,
	createListCollection
} from '@chakra-ui/react';
import { zIndex } from '@/utils/zIndex';
import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useEditor } from '@craftjs/core';

// Types for pinning
export interface PinningSettings {
	enabled: boolean;
	position: string;
	topDistance: number;
	bottomDistance: number;
	leftDistance: number;
	rightDistance: number;
}

interface PinningManagerProps {
	pinning: PinningSettings;
	onPinningChange: (settings: PinningSettings) => void;
}

// Position options for element pinning (Vietnamese labels)
const pinPositionOptions = [
	{ label: 'Trên dưới tự động', value: 'auto' },
	{ label: 'Trên cùng trái', value: 'top-left' },
	{ label: 'Trên cùng giữa', value: 'top-center' },
	{ label: 'Trên cùng phải', value: 'top-right' },
	{ label: 'Giữa trái', value: 'middle-left' },
	{ label: 'Giữa phải', value: 'middle-right' },
	{ label: 'Dưới cùng trái', value: 'bottom-left' },
	{ label: 'Dưới cùng giữa', value: 'bottom-center' },
	{ label: 'Dưới cùng phải', value: 'bottom-right' },
];



// Hook for handling pinning functionality with react-sticky-el and pure CSS positioning
export const usePinning = (settings: PinningSettings, componentName?: string) => {
	// Get editor state to check if we're in edit mode
	const { enabled } = useEditor((state) => ({
		enabled: state.options.enabled,
	}));

	// Create wrapper component using pure CSS positioning for fixed positions
	const PinnedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
		// Only apply pinning in preview mode (when editor is disabled)
		if (!settings || !settings.enabled || enabled) {
			return <>{children}</>;
		}

		// Auto positioning is handled in ViewOnlyRenderNode with react-sticky-el
		if (settings.position === 'auto') {
			return <>{children}</>;
		}

		// Generate CSS styles based on position
		const getPositionStyles = (): React.CSSProperties => {
			// Ensure we have valid numeric values
			const topDistance = typeof settings.topDistance === 'number' ? settings.topDistance : 0;
			const leftDistance = typeof settings.leftDistance === 'number' ? settings.leftDistance : 0;
			const rightDistance = typeof settings.rightDistance === 'number' ? settings.rightDistance : 0;
			const bottomDistance = typeof settings.bottomDistance === 'number' ? settings.bottomDistance : 0;

			const baseStyles: React.CSSProperties = {
				position: 'fixed',
				zIndex: zIndex.pinningManager,
			};

			switch (settings.position) {

				case 'top':
					// Auto top positioning - will be handled in ViewOnlyRenderNode for viewport detection
					return {
						...baseStyles,
						top: `${topDistance}px`,
						left: '50%',
						transform: 'translateX(-50%)',
					};

				case 'bottom':
					// Auto bottom positioning - will be handled in ViewOnlyRenderNode for viewport detection
					return {
						...baseStyles,
						bottom: `${bottomDistance}px`,
						left: '50%',
						transform: 'translateX(-50%)',
					};

				case 'top-left':
					// Fixed dính đầu viewport, căn trái
					return {
						...baseStyles,
						top: `${topDistance}px`,
						left: `${leftDistance}px`,
					};

				case 'top-center':
					// Fixed dính đầu viewport, căn giữa
					return {
						...baseStyles,
						top: `${topDistance}px`,
						left: '50%',
						transform: 'translateX(-50%)',
					};

				case 'top-right':
					// Fixed dính đầu viewport, căn phải
					return {
						...baseStyles,
						top: `${topDistance}px`,
						right: `${rightDistance}px`,
					};

				case 'bottom-left':
					// Fixed dính cuối viewport, căn trái
					return {
						...baseStyles,
						bottom: `${bottomDistance}px`,
						left: `${leftDistance}px`,
					};

				case 'bottom-center':
					// Fixed dính cuối viewport, căn giữa
					return {
						...baseStyles,
						bottom: `${bottomDistance}px`,
						left: '50%',
						transform: 'translateX(-50%)',
					};

				case 'bottom-right':
					// Fixed dính cuối viewport, căn phải
					return {
						...baseStyles,
						bottom: `${bottomDistance}px`,
						right: `${rightDistance}px`,
					};

				case 'middle-left':
					// Fixed position cho giữa màn hình theo chiều dọc, căn trái
					return {
						...baseStyles,
						top: '50%',
						left: `${leftDistance}px`,
						transform: 'translateY(-50%)',
					};

				case 'middle-right':
					// Fixed position cho giữa màn hình theo chiều dọc, căn phải
					return {
						...baseStyles,
						top: '50%',
						right: `${rightDistance}px`,
						transform: 'translateY(-50%)',
					};

				default:
					// Fallback to top-left if unknown position
					return {
						...baseStyles,
						top: `${topDistance}px`,
						left: `${leftDistance}px`,
					};
			}
		};

		// Determine if we should apply positioning override based on component type
		const shouldApplyOverride = componentName !== 'Group';
		const wrapperClassName = shouldApplyOverride ? "pinned-content-override" : "pinned-content-preserve";

		return (
			<div style={getPositionStyles()}>
				<div
					className={wrapperClassName}
					style={{
						// Ensure the content takes full space of the pinned container
						width: '100%',
						height: '100%'
					}}
				>
					{children}
				</div>
			</div>
		);
	};

	// Legacy function for compatibility (returns empty object since we use wrapper now)
	const getPinningStyles = () => {
		return {};
	};

	// Legacy function for compatibility (returns baseStyles unchanged)
	const applyPinningToStyles = (baseStyles: any) => {
		return baseStyles;
	};

	return { 
		getPinningStyles, 
		applyPinningToStyles, 
		PinnedWrapper 
	};
};

export const PinningManager: React.FC<PinningManagerProps> = ({
	pinning,
	onPinningChange
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const handlePinningToggle = (enabled: boolean) => {
		onPinningChange({
			...pinning,
			enabled
		});
	};

	const handlePositionChange = (position: string) => {
		// Set reasonable default distances when changing position
		const updatedPinning = { ...pinning, position };

		// Set default distances for auto positioning (react-sticky-el)
		if (position === 'auto') {
			if (updatedPinning.topDistance === 0) {
				updatedPinning.topDistance = 0; // Default to stick to top
			}
		}
		// Set default distances for fixed positioning
		else {
			if (position === 'top-left' || position === 'top-center' || position === 'top-right') {
				if (updatedPinning.topDistance === 0) {
					updatedPinning.topDistance = 10;
				}
			}
			if (position === 'bottom-left' || position === 'bottom-center' || position === 'bottom-right') {
				if (updatedPinning.bottomDistance === 0) {
					updatedPinning.bottomDistance = 10;
				}
			}
			if (position === 'top-left' || position === 'bottom-left' || position === 'middle-left') {
				if (updatedPinning.leftDistance === 0) {
					updatedPinning.leftDistance = 10;
				}
			}
			if (position === 'top-right' || position === 'bottom-right' || position === 'middle-right') {
				if (updatedPinning.rightDistance === 0) {
					updatedPinning.rightDistance = 10;
				}
			}
		}

		onPinningChange(updatedPinning);
	};
	const handleTopDistanceChange = (value: string) => {
		const numValue = parseInt(value) || 0;
		onPinningChange({
			...pinning,
			topDistance: numValue
		});
	};

	const handleBottomDistanceChange = (value: string) => {
		const numValue = parseInt(value) || 0;
		onPinningChange({
			...pinning,
			bottomDistance: numValue
		});
	};

	const handleLeftDistanceChange = (value: string) => {
		const numValue = parseInt(value) || 0;
		onPinningChange({
			...pinning,
			leftDistance: numValue
		});
	};

	const handleRightDistanceChange = (value: string) => {
		const numValue = parseInt(value) || 0;
		onPinningChange({
			...pinning,
			rightDistance: numValue
		});
	};

	const positionCollection = createListCollection({
		items: pinPositionOptions
	});

	return (
		<Box>
			<HStack
				onClick={() => setIsExpanded(!isExpanded)}
				cursor="pointer"
				userSelect="none"
				py={2}
			>
				{isExpanded ? <FiChevronDown /> : <FiChevronRight />}
				<Text fontWeight="medium">Ghim phần tử</Text>
			</HStack>

			{isExpanded && (
				<Stack gap={4} pl={6} mt={2}>					{/* Enable/Disable Switch */}
					<Box>
						<Text fontSize="sm" mb={2}>Bật ghim phần tử</Text>
						<Switch.Root
							checked={pinning.enabled}
							onCheckedChange={(e) => handlePinningToggle(e.checked)}
						>
							<Switch.HiddenInput />
							<Switch.Control>
								<Switch.Thumb />
							</Switch.Control>
						</Switch.Root>
					</Box>					{/* Position Settings - only show when pinning is enabled */}
					{pinning.enabled && (
						<>
							{/* Position Selection */}							<Box>
								<Text fontSize="sm" mb={2}>Vị trí</Text>
								<Select.Root
									collection={positionCollection}
									value={[pinning.position]}
									onValueChange={(details) => handlePositionChange(details.value[0])}
								>
									<Select.Trigger>
										<Select.ValueText placeholder="Chọn vị trí" />
									</Select.Trigger>
									<Select.Content>
										{pinPositionOptions.map((option) => (
											<Select.Item item={option} key={option.value}>
												{option.label}
											</Select.Item>
										))}
									</Select.Content>
								</Select.Root>
							</Box>

							{/* Dynamic input fields based on position */}
							{/* Auto position - only top offset for react-sticky-el */}
							{pinning.position === 'auto' && (
								<Box>
									<Text fontSize="sm" mb={2}>Khoảng cách dính từ trên (px)</Text>
									<Input
										size="sm"
										type="number"
										value={pinning.topDistance}
										onChange={(e) => handleTopDistanceChange(e.target.value)}
										min={0}
										max={1000}
										placeholder="0"
									/>
									<Text fontSize="xs" color="gray.500" mt={1}>
										Phần tử sẽ tự động dính vào đầu trang khi cuộn
									</Text>
								</Box>
							)}							{/* Top positions */}
							{(pinning.position === 'top' || pinning.position === 'top-center') && (
								<Box>
									<Text fontSize="sm" mb={2}>Khoảng cách từ trên (px)</Text>
									<Input
										size="sm"
										type="number"
										value={pinning.topDistance}
										onChange={(e) => handleTopDistanceChange(e.target.value)}
										min={0}
										max={1000}
									/>
								</Box>
							)}							{/* Bottom positions */}
							{(pinning.position === 'bottom' || pinning.position === 'bottom-center') && (
								<Box>
									<Text fontSize="sm" mb={2}>Khoảng cách từ dưới (px)</Text>
									<Input
										size="sm"
										type="number"
										value={pinning.bottomDistance}
										onChange={(e) => handleBottomDistanceChange(e.target.value)}
										min={0}
										max={1000}
									/>
								</Box>
							)}							{/* Top-left position */}
							{pinning.position === 'top-left' && (
								<>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ trên (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.topDistance}
											onChange={(e) => handleTopDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ trái (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.leftDistance}
											onChange={(e) => handleLeftDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
								</>
							)}							{/* Top-right position */}
							{pinning.position === 'top-right' && (
								<>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ trên (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.topDistance}
											onChange={(e) => handleTopDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ phải (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.rightDistance}
											onChange={(e) => handleRightDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
								</>
							)}							{/* Middle-left position */}
							{pinning.position === 'middle-left' && (
								<Box>
									<Text fontSize="sm" mb={2}>Khoảng cách từ trái (px)</Text>
									<Input
										size="sm"
										type="number"
										value={pinning.leftDistance}
										onChange={(e) => handleLeftDistanceChange(e.target.value)}
										min={0}
										max={1000}
									/>
								</Box>
							)}							{/* Middle-right position */}
							{pinning.position === 'middle-right' && (
								<Box>
									<Text fontSize="sm" mb={2}>Khoảng cách từ phải (px)</Text>
									<Input
										size="sm"
										type="number"
										value={pinning.rightDistance}
										onChange={(e) => handleRightDistanceChange(e.target.value)}
										min={0}
										max={1000}
									/>
								</Box>
							)}							{/* Bottom-left position */}
							{pinning.position === 'bottom-left' && (
								<>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ dưới (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.bottomDistance}
											onChange={(e) => handleBottomDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ trái (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.leftDistance}
											onChange={(e) => handleLeftDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
								</>
							)}							{/* Bottom-right position */}
							{pinning.position === 'bottom-right' && (
								<>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ dưới (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.bottomDistance}
											onChange={(e) => handleBottomDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
									<Box>
										<Text fontSize="sm" mb={2}>Khoảng cách từ phải (px)</Text>
										<Input
											size="sm"
											type="number"
											value={pinning.rightDistance}
											onChange={(e) => handleRightDistanceChange(e.target.value)}
											min={0}
											max={1000}
										/>
									</Box>
								</>
							)}
						</>
					)}
				</Stack>
			)}
		</Box>
	);
};
