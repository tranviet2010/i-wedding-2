import {
  Box,
  Button,
  Combobox, // Keep HStack
  Grid, // Keep Stack
  HStack,
  Input,
  Portal,
  Stack,
  Tabs,
  Text,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { useNode } from '@craftjs/core';
import React, { useEffect, useState } from 'react';

import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { Tooltip } from '@/components/ui/tooltip';
import { FileType } from '@/features/files/fileAPI';
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { overlayTypeOptions } from '@/utils/settingProfile';
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings } from '@/components/editor/components/AnimationManager';
import { PinningManager, PinningSettings } from '@/components/editor/components/PinningManager';
import { EventItem } from '@/components/editor/components/EventManager';
import CrossPlatformSyncToggle from '@/components/editor/components/CrossPlatformSyncToggle';
import { SectionsNodeControlsPanel } from '../../editor/components/SectionsNodeControlsPanel';

interface SectionsProps {
  height: string;
  width: string;
  padding: number[];
  margin: number[];
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  fillSpace: string;

  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundVideoType: 'youtube' | 'meHappyVideo';
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;

  backgroundOpacity: number;
  opacity: number;
  blendMode: string;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  invert: number;

  overlayType: string;
  overlayBlendMode: string;
  overlayOpacity: number;
  overlayColor: string;
  overlayGradientType: string;
  overlayGradientAngle: number;
  overlayGradientColor1: string;
  overlayGradientColor2: string;
  overlayImage: string;
  overlayImageSize: string;
  overlayImageAttachment: string;
  overlayImagePosition: string;
  overlayImageRepeat: string;

  radius: number | string;
  borderRadius: number[];
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;

  shadow: number;
  shadowType: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;

  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;

  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
}

const backgroundTypeOptions = [
  { value: 'color', label: 'Màu nền' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Hình ảnh' },
  { value: 'video', label: 'Video' },
];

const gradientTypeOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
];

const advancedBackgroundSizeOptions = [
  { value: 'auto', label: 'Mặc định' },
  { value: 'cover', label: 'Vừa khung cao (Cover)' },
  { value: 'contain', label: 'Vừa khung rộng (Contain)' },
  { value: 'parallax', label: 'Parallax' },
  { value: 'custom', label: 'Tuỳ chỉnh' },
];

const backgroundPositionOptions = [
  { value: 'left top', label: 'Left Top' },
  { value: 'left center', label: 'Left Center' },
  { value: 'left bottom', label: 'Left Bottom' },
  { value: 'center top', label: 'Center Top' },
  { value: 'center center', label: 'Center Center' },
  { value: 'center bottom', label: 'Center Bottom' },
  { value: 'right top', label: 'Right Top' },
  { value: 'right center', label: 'Right Center' },
  { value: 'right bottom', label: 'Right Bottom' },
];

const backgroundRepeatOptions = [
  { value: 'no-repeat', label: 'Không lặp' },
  { value: 'repeat-x', label: 'Lặp ngang (X)' },
  { value: 'repeat-y', label: 'Lặp dọc (Y)' },
  { value: 'repeat', label: 'Lặp tất cả' },
];


const blendModeOptions = [
  { value: 'normal', label: 'Normal' },
];

const gradientTemplates = [
  { name: 'Blue to Purple', colors: ['#4158D0', '#C850C0'] },
  { name: 'Orange to Red', colors: ['#FF8008', '#FFC837'] },
];

export const SectionsSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as SectionsProps
  }));

  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);
  const [isOverlayColorPickerOpen, setIsOverlayColorPickerOpen] = useState(false);
  const [isOverlayGradientColor1PickerOpen, setIsOverlayGradientColor1PickerOpen] = useState(false);
  const [isOverlayGradientColor2PickerOpen, setIsOverlayGradientColor2PickerOpen] = useState(false);
  const [currentBgSizeSetting, setCurrentBgSizeSetting] = useState('auto');
  const [customBgWidth, setCustomBgWidth] = useState('100%');
  const [customBgHeight, setCustomBgHeight] = useState('auto');
  const [settingType, setSettingType] = useState('default');
  const [bgPositionInput, setBgPositionInput] = useState(props.backgroundPosition || 'center center');
  const { showFileSelectModal } = useViewport();

  // Animation management functions
  const handleDisplayAnimationChange = (newAnimation: DisplayAnimationItem | null) => {
    updateProp('displayAnimation', newAnimation);
  };

  const handleHoverAnimationChange = (newHoverAnimation: HoverAnimationSettings) => {
    updateProp('hoverAnimation', newHoverAnimation);
  };
  // Initialize animation arrays if not present
  const currentDisplayAnimation = props.displayAnimation || null;
  const currentHoverAnimation = props.hoverAnimation || { enabled: false };

  // Pinning management functions
  const handlePinningChange = (newPinning: PinningSettings) => {
    updateProp('pinning', newPinning);
  };
  // Initialize pinning if not present
  const currentPinning = props.pinning || {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0
  };

  useEffect(() => {
    if (props.backgroundAttachment === 'fixed' && props.backgroundSize === 'cover') {
      setCurrentBgSizeSetting('parallax');
    } else if (props.backgroundSize && !['auto', 'cover', 'contain'].includes(props.backgroundSize)) {
      const parts = props.backgroundSize.split(' ');
      if (parts.length === 2) {
        setCurrentBgSizeSetting('custom');
        setCustomBgWidth(parts[0]);
        setCustomBgHeight(parts[1]);
      } else {
        setCurrentBgSizeSetting('auto');
      }
    } else if (props.backgroundSize && ['auto', 'cover', 'contain'].includes(props.backgroundSize)) {
      setCurrentBgSizeSetting(props.backgroundSize);
    } else {
      setCurrentBgSizeSetting('auto'); // Default if undefined or not matching
    }

    setBgPositionInput(props.backgroundPosition || 'center center');

  }, [props.backgroundSize, props.backgroundAttachment, props.backgroundPosition]);


  const updateProp = (key: keyof SectionsProps, value: any) => {
    setProp((props: SectionsProps) => {
      (props as any)[key] = value;
    });
  };

  const parseNumericValue = (value: string | undefined): number => {
    if (value === undefined || value === null || String(value).trim() === '') return 100; // Default for undefined, null, or empty string
    const numericString = String(value).endsWith('px') ? String(value).slice(0, -2) : String(value);
    const numValue = parseInt(numericString, 10);
    return isNaN(numValue) ? 100 : numValue; // Default to 100 if parsing fails
  };


  const handleBackgroundTypeChange = (newType: string) => {
    const oldType = props.backgroundType || 'color';
    if (oldType !== newType) {
      // Reset relevant props when type changes
      updateProp('gradientType', undefined as any);
      updateProp('gradientAngle', undefined as any);
      updateProp('gradientColor1', undefined as any);
      updateProp('gradientColor2', undefined as any);
      updateProp('backgroundImage', undefined as any);
      updateProp('backgroundVideo', undefined as any);
      updateProp('backgroundSize', undefined as any);
      updateProp('backgroundPosition', undefined as any);
      updateProp('backgroundRepeat', undefined as any);
      updateProp('backgroundAttachment', undefined as any);

      if (newType === 'gradient') {
        updateProp('gradientType', props.gradientType || 'linear');
        updateProp('gradientAngle', props.gradientAngle || 90);
        updateProp('gradientColor1', props.gradientColor1 || '#4158D0');
        updateProp('gradientColor2', props.gradientColor2 || '#C850C0');
      } else if (newType === 'image') {
        updateProp('backgroundSize', 'cover'); // Default for new image
        updateProp('backgroundPosition', 'center center');
        updateProp('backgroundRepeat', 'no-repeat');
        updateProp('backgroundAttachment', 'scroll');
        // Re-initialize local state for image settings
        setCurrentBgSizeSetting('cover');
        setCustomBgWidth('100%');
        setCustomBgHeight('auto');
        setBgPositionInput('center center');

      }
    }
    updateProp('backgroundType', newType as any);
  };

  const applyGradientTemplate = (colors: string[]) => {
    updateProp('gradientColor1', colors[0]);
    updateProp('gradientColor2', colors[1]);
  };

  const handleHeightChange = (value: number) => {
    updateProp('height', `${value}px`);
  };

  const handleBgSizeSettingChange = (value: string) => {
    setCurrentBgSizeSetting(value);
    if (value === 'parallax') {
      updateProp('backgroundSize', 'cover');
      updateProp('backgroundAttachment', 'fixed');
    } else if (value === 'custom') {
      updateProp('backgroundSize', `${customBgWidth} ${customBgHeight}`);
      updateProp('backgroundAttachment', 'scroll');
    } else { // auto, cover, contain
      updateProp('backgroundSize', value);
      updateProp('backgroundAttachment', 'scroll');
    }
  };

  const handleCustomBgWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value;
    setCustomBgWidth(newWidth);
    if (currentBgSizeSetting === 'custom') {
      updateProp('backgroundSize', `${newWidth} ${customBgHeight}`);
    }
  };

  const handleCustomBgHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value;
    setCustomBgHeight(newHeight);
    if (currentBgSizeSetting === 'custom') {
      updateProp('backgroundSize', `${customBgWidth} ${newHeight}`);
    }
  };

  const handleBgPositionChange = (value: string) => {
    setBgPositionInput(value);
    updateProp('backgroundPosition', value);
  };


  const { contains } = useFilter({ sensitivity: "base" });
  const { collection: bgPositionCollection, filter: filterBgPosition } = useListCollection({
    initialItems: backgroundPositionOptions, // Assuming backgroundPositionOptions is an array of { label: string, value: string }
    filter: contains,
  });


  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'buttonsetting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="animation" className='!text-xs'>
            Hiệu ứng
          </Tabs.Trigger>
          <Tabs.Trigger value="advanced" className='!text-xs'>
            Nâng cao
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="default">
          <Stack gap="4">
            {/* Sections Node Controls Panel */}

            <SectionsNodeControlsPanel />


            {/* Kích thước (Dimensions) Section */}
            <Box borderBottomWidth="1px" borderColor="gray.200" p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Kích thước</Text>
              <HStack gap="2">
                <Box flex={1}>
                  <HStack alignItems="center" gap="2">
                    <Text fontSize="xs" transform="translateY(1px)">H</Text>
                    <DraggableNumberInput
                      value={parseNumericValue(props.height)}
                      onChange={handleHeightChange}
                      min={1}

                    />
                  </HStack>
                </Box>
              </HStack>
            </Box>

            {/* Màu & Hình nền (Background) Section */}
            <Box borderBottomWidth="1px" borderColor="gray.200" p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Màu & Hình nền</Text>
              <HStack justifyContent="space-between" mb={2}>
                <Text fontSize="xs">Loại nền</Text>
                <select
                  className="outline-none p-2 rounded-md text-sm"
                  value={props.backgroundType || 'solid'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newType = e.target.value;
                    handleBackgroundTypeChange(newType);
                  }}
                >
                  {backgroundTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </HStack>

              {props.backgroundType === 'color' && (
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs">Màu nền</Text>
                  <Button size="xs" variant="outline" onClick={() => setIsBgColorPickerOpen(true)}>
                    <Box w="16px" h="16px" borderRadius="sm" bg={props.backgroundColor || '#ffffff'} border="1px solid gray" />
                  </Button>
                  <ColorPickerModal
                    isOpen={isBgColorPickerOpen}
                    onClose={() => setIsBgColorPickerOpen(false)}
                    initialColor={props.backgroundColor || '#ffffff'}
                    onColorChange={(color: string) => updateProp('backgroundColor', color)}
                  />
                </HStack>
              )}

              {props.backgroundType === 'gradient' && (
                <Stack gap="2">
                  <HStack justifyContent="space-between">
                    <Text fontSize="xs">Kiểu Gradient</Text>
                    <select
                      className="outline-none p-2 rounded-md text-sm"
                      value={props.gradientType || 'linear'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('gradientType', e.target.value)} >
                      {gradientTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </HStack>
                  {props.gradientType === 'linear' && (
                    <HStack alignItems="center">
                      <Text fontSize="xs">Góc</Text>
                      <DraggableNumberInput value={props.gradientAngle || 0} onChange={(val: number) => updateProp('gradientAngle', val)} min={0} max={360} />
                    </HStack>
                  )}
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="xs">Màu 1</Text>
                    <Button size="xs" variant="outline" onClick={() => setIsGradientColor1PickerOpen(true)}>
                      <Box w="16px" h="16px" borderRadius="sm" bg={props.gradientColor1 || '#ffffff'} border="1px solid gray" />
                    </Button>
                    <ColorPickerModal isOpen={isGradientColor1PickerOpen} onClose={() => setIsGradientColor1PickerOpen(false)} initialColor={props.gradientColor1 || '#ffffff'} onColorChange={(color: string) => updateProp('gradientColor1', color)} />
                  </HStack>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="xs">Màu 2</Text>
                    <Button size="xs" variant="outline" onClick={() => setIsGradientColor2PickerOpen(true)}>
                      <Box w="16px" h="16px" borderRadius="sm" bg={props.gradientColor2 || '#000000'} border="1px solid gray" />
                    </Button>
                    <ColorPickerModal isOpen={isGradientColor2PickerOpen} onClose={() => setIsGradientColor2PickerOpen(false)} initialColor={props.gradientColor2 || '#000000'} onColorChange={(color: string) => updateProp('gradientColor2', color)} />
                  </HStack>
                  <Text fontSize="xs" mt={2}>Mẫu Gradient:</Text>
                  <HStack gap="2" flexWrap="wrap">
                    {gradientTemplates.map((template, index) => (
                      <Tooltip key={index} content={template.name} positioning={{ placement: 'top' }}>
                        <Box
                          as="button"
                          onClick={() => applyGradientTemplate(template.colors)}
                          width="24px"
                          height="24px"
                          borderRadius="sm"
                          background={`linear-gradient(45deg, ${template.colors[0]}, ${template.colors[1]})`}
                          border="1px solid"
                          borderColor="gray.300"
                          cursor="pointer"
                        />
                      </Tooltip>
                    ))}
                  </HStack>
                </Stack>
              )}
              {props.backgroundType === 'image' && (
                <Stack gap="3" mt={2}>
                  <Text fontSize="xs">URL Hình ảnh</Text>
                  <HStack>
                    <Input
                      size="sm"
                      value={props.backgroundImage || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('backgroundImage', e.target.value)}
                      placeholder="https://..."
                    />
                    <Button size="sm" onClick={() => showFileSelectModal(
                      FileType.IMAGE,
                      (fileUrl: string) => {
                        updateProp('backgroundImage', fileUrl);
                      }
                    )}>
                      Chọn hình ảnh
                    </Button>
                  </HStack>
                  <HStack justifyContent="space-between" alignItems="center" mt={2}>
                    <Text fontSize="xs">Kiểu</Text>
                    <select
                      className="outline-none p-2 rounded-md text-sm"
                      value={props.backgroundSize || 'auto'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBgSizeSettingChange(e.target.value)}
                    >
                      {advancedBackgroundSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </HStack>

                  {currentBgSizeSetting === 'custom' && (
                    <HStack gap="2" mt={1}>
                      <Box flex={1}>
                        <Text fontSize="xs" mb={1}>W</Text>
                        <Input
                          size="sm"
                          value={customBgWidth}
                          onChange={handleCustomBgWidthChange}
                          placeholder="e.g., 200px or 50%"
                        />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="xs" mb={1}>H</Text>
                        <Input
                          size="sm"
                          value={customBgHeight}
                          onChange={handleCustomBgHeightChange}
                          placeholder="e.g., 300px or auto"
                        />
                      </Box>
                    </HStack>
                  )}

                  <HStack justifyContent="space-between" alignItems="center" mt={2}>
                    <Text fontSize="xs">Vị trí</Text>
                    <Combobox.Root
                      collection={bgPositionCollection}
                      onInputValueChange={(e: { inputValue: string }) => filterBgPosition(e.inputValue)}
                      onValueChange={(details: { value: string[] }) => {
                        // If details.value is an array, take the first element or an empty string.
                        handleBgPositionChange(details.value[0] ?? '');
                      }}
                      // Pass an array for the value prop.
                      value={bgPositionInput ? [bgPositionInput] : []}
                      width="60%"
                      openOnClick
                      multiple={false} // Explicitly set to single selection
                    >
                      <Combobox.Control>
                        <Combobox.Input as={Input} placeholder="Chọn hoặc nhập vị trí" />
                      </Combobox.Control>
                      <Portal>
                        <Combobox.Positioner zIndex="popover">
                          <Combobox.Content maxHeight="150px" overflowY="auto">
                            <Combobox.Empty>Không tìm thấy vị trí</Combobox.Empty>
                            {bgPositionCollection.items.map((item) => (
                              <Combobox.Item item={item} key={item.value} justifyContent="flex-start" width="100%">
                                {item.label}
                                <Combobox.ItemIndicator />
                              </Combobox.Item>
                            ))}
                          </Combobox.Content>
                        </Combobox.Positioner>
                      </Portal>
                    </Combobox.Root>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center" mt={2}>
                    <Text fontSize="xs">Lặp lại</Text>
                    <select
                      className="outline-none p-2 rounded-md text-sm"
                      value={props.backgroundRepeat || 'no-repeat'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('backgroundRepeat', e.target.value)}
                    >
                      {backgroundRepeatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </HStack>
                </Stack>
              )}
              {props.backgroundType === 'video' && (
                <>
                  <Stack gap="2" mt={2}>
                    <Text fontSize="xs">URL Video (MP4)</Text>
                    <HStack>
                      <Input
                        size="sm"
                        value={props.backgroundVideo || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('backgroundVideo', e.target.value)}
                        placeholder="https://..."
                      />
                      {props.backgroundVideoType == 'meHappyVideo' ? <Button
                        size="sm"
                        onClick={() => showFileSelectModal(
                          FileType.VIDEO,
                          (fileUrl: string) => {
                            updateProp('backgroundVideo', fileUrl);
                          }
                        )}
                      >
                        Chọn
                      </Button> : null
                      }
                    </HStack>
                  </Stack>
                  <Box className='w-full flex items-center justify-between'>
                    <Text fontSize="xs">Loại Video</Text>
                    <select
                      className="outline-none p-2 rounded-md text-sm w-[60%]"
                      value={props.backgroundVideoType || 'youtube'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        updateProp('backgroundVideoType', e.target.value);
                        updateProp('backgroundVideo', '');
                      }}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="meHappyVideo">meHappy Video</option>
                    </select>
                  </Box>
                </>
              )}
              {(props.backgroundType === 'image' || props.backgroundType === 'video' || props.backgroundType === 'gradient') && (
                <HStack alignItems="center" mt={3}>
                  <Text fontSize="xs">Độ mờ nền</Text>
                  <DraggableNumberInput value={props.backgroundOpacity === undefined ? 100 : props.backgroundOpacity} onChange={(val: number) => updateProp('backgroundOpacity', val)} min={0} max={100} />
                  <Text fontSize="xs">%</Text>
                </HStack>
              )}
            </Box>

            {/* Filter Section */}
            <Box borderBottomWidth="1px" borderColor="gray.200" p={4}>
              <Text fontSize="sm" fontWeight="bold" mb={2}>Filter</Text>
              <Stack gap="3">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" >Blend Mode</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.blendMode || 'normal'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateProp('blendMode', e.target.value);
                    }}
                  >
                    {blendModeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </HStack>
                <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Tương phản</Text>
                      <DraggableNumberInput
                        value={props.contrast === undefined ? 100 : props.contrast}
                        onChange={(value: number) => updateProp('contrast', value)}
                        min={0}
                        max={200}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Độ sáng</Text>
                      <DraggableNumberInput
                        value={props.brightness === undefined ? 100 : props.brightness}
                        onChange={(value: number) => updateProp('brightness', value)}
                        min={0}
                        max={200}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Hòa màu</Text>
                      <DraggableNumberInput
                        value={props.saturate === undefined ? 100 : props.saturate}
                        onChange={(value: number) => updateProp('saturate', value)}
                        min={0}
                        max={200}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Trắng đen</Text>
                      <DraggableNumberInput
                        value={props.grayscale === undefined ? 0 : props.grayscale}
                        onChange={(value: number) => updateProp('grayscale', value)}
                        min={0}
                        max={100}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Độ mờ</Text>
                      <DraggableNumberInput
                        value={props.opacity === undefined ? 100 : props.opacity}
                        onChange={(value: number) => updateProp('opacity', value)}
                        min={0}
                        max={100}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Đảo ngược</Text>
                      <DraggableNumberInput
                        value={props.invert === undefined ? 0 : props.invert}
                        onChange={(value: number) => updateProp('invert', value)}
                        min={0}
                        max={100}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Sepia</Text>
                      <DraggableNumberInput
                        value={props.sepia === undefined ? 0 : props.sepia}
                        onChange={(value: number) => updateProp('sepia', value)}
                        min={0}
                        max={100}
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs" >Xoay màu</Text>
                      <DraggableNumberInput
                        value={props.hueRotate === undefined ? 0 : props.hueRotate}
                        onChange={(value: number) => updateProp('hueRotate', value)}
                        min={0}
                        max={360}
                      />
                    </HStack>
                  </Box>
                </Grid>
              </Stack>
            </Box>

            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Overlay</Text>
              <Stack gap="3" mt={2}>
                <Box className='w-full flex items-center justify-between'>
                  <Text fontSize="xs">Chọn kiểu</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.overlayType || 'none'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateProp('overlayType', e.target.value);
                    }}
                  >
                    {overlayTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </Box>

                {props.overlayType !== 'none' && (
                  <>
                    {/* Overlay Blend Mode */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Blend mode</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.overlayBlendMode || 'normal'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('overlayBlendMode', e.target.value)}
                      >
                        {blendModeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </HStack>

                    {/* Solid Color Overlay */}
                    {props.overlayType === 'color' && (
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs">Màu lớp phủ</Text>
                        <Button size="xs" variant="outline" onClick={() => setIsOverlayColorPickerOpen(true)}>
                          <Box w="16px" h="16px" borderRadius="sm" bg={props.overlayColor || 'rgba(0, 0, 0, 0.5)'} border="1px solid gray" />
                        </Button>
                        <ColorPickerModal
                          isOpen={isOverlayColorPickerOpen}
                          onClose={() => setIsOverlayColorPickerOpen(false)}
                          initialColor={props.overlayColor || 'rgba(0, 0, 0, 0.5)'}
                          onColorChange={(color: string) => updateProp('overlayColor', color)}
                        />
                      </HStack>
                    )}

                    {/* Gradient Overlay */}
                    {props.overlayType === 'gradient' && (
                      <Stack gap="2">
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Kiểu Gradient</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.overlayGradientType || 'linear'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('overlayGradientType', e.target.value)}
                          >
                            {gradientTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </HStack>
                        {props.overlayGradientType === 'linear' && (
                          <HStack alignItems="center">
                            <Text fontSize="xs">Góc</Text>
                            <DraggableNumberInput
                              value={props.overlayGradientAngle || 90}
                              onChange={(val: number) => updateProp('overlayGradientAngle', val)}
                              min={0}
                              max={360}
                            />
                          </HStack>
                        )}
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontSize="xs">Màu 1</Text>
                          <Button size="xs" variant="outline" onClick={() => setIsOverlayGradientColor1PickerOpen(true)}>
                            <Box w="16px" h="16px" borderRadius="sm" bg={props.overlayGradientColor1 || '#4158D0'} border="1px solid gray" />
                          </Button>
                          <ColorPickerModal
                            isOpen={isOverlayGradientColor1PickerOpen}
                            onClose={() => setIsOverlayGradientColor1PickerOpen(false)}
                            initialColor={props.overlayGradientColor1 || '#4158D0'}
                            onColorChange={(color: string) => updateProp('overlayGradientColor1', color)}
                          />
                        </HStack>
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontSize="xs">Màu 2</Text>
                          <Button size="xs" variant="outline" onClick={() => setIsOverlayGradientColor2PickerOpen(true)}>
                            <Box w="16px" h="16px" borderRadius="sm" bg={props.overlayGradientColor2 || '#C850C0'} border="1px solid gray" />
                          </Button>
                          <ColorPickerModal
                            isOpen={isOverlayGradientColor2PickerOpen}
                            onClose={() => setIsOverlayGradientColor2PickerOpen(false)}
                            initialColor={props.overlayGradientColor2 || '#C850C0'}
                            onColorChange={(color: string) => updateProp('overlayGradientColor2', color)}
                          />
                        </HStack>
                        <Text fontSize="xs" mt={2}>Mẫu Gradient:</Text>
                        <HStack gap="2" flexWrap="wrap">
                          {gradientTemplates.map((template, index) => (
                            <Tooltip key={index} content={template.name} positioning={{ placement: 'top' }}>
                              <Box
                                as="button"
                                onClick={() => {
                                  updateProp('overlayGradientColor1', template.colors[0]);
                                  updateProp('overlayGradientColor2', template.colors[1]);
                                }}
                                width="24px"
                                height="24px"
                                borderRadius="sm"
                                background={`linear-gradient(45deg, ${template.colors[0]}, ${template.colors[1]})`}
                                border="1px solid"
                                borderColor="gray.300"
                                cursor="pointer"
                              />
                            </Tooltip>
                          ))}
                        </HStack>
                      </Stack>
                    )}

                    {/* Image Overlay */}
                    {props.overlayType === 'image' && (
                      <Stack gap="3" mt={2}>
                        <Text fontSize="xs">URL Hình ảnh lớp phủ</Text>
                        <HStack>
                          <Input
                            size="sm"
                            value={props.overlayImage || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('overlayImage', e.target.value)}
                            placeholder="https://..."
                          />
                          <Button size="sm" onClick={() => showFileSelectModal(
                            FileType.IMAGE,
                            (fileUrl: string) => {
                              updateProp('overlayImage', fileUrl);
                            }
                          )}>
                            Chọn hình ảnh
                          </Button>
                        </HStack>
                        <HStack justifyContent="space-between" alignItems="center" mt={2}>
                          <Text fontSize="xs">Kích thước</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.overlayImageSize || 'cover'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('overlayImageSize', e.target.value)}
                          >
                            <option value="auto">Mặc định</option>
                            <option value="cover">Vừa khung cao (Cover)</option>
                            <option value="contain">Vừa khung rộng (Contain)</option>
                          </select>
                        </HStack>
                        <HStack justifyContent="space-between" alignItems="center" mt={2}>
                          <Text fontSize="xs">Vị trí</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.overlayImagePosition || 'center center'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('overlayImagePosition', e.target.value)}
                          >
                            {backgroundPositionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </HStack>
                        <HStack justifyContent="space-between" alignItems="center" mt={2}>
                          <Text fontSize="xs">Lặp lại</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.overlayImageRepeat || 'no-repeat'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('overlayImageRepeat', e.target.value)}
                          >
                            {backgroundRepeatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </HStack>
                        {/* Overlay Opacity */}

                      </Stack>
                    )}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Trong suốt</Text>
                      <Box width="60%">
                        <DraggableNumberInput
                          value={props.overlayOpacity || 50}
                          onChange={(value: number) => updateProp('overlayOpacity', value)}
                          min={0}
                          max={100}
                        />
                      </Box>
                    </HStack>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="animation" className="p-4">
          <Stack>
            <AnimationManager
              displayAnimation={currentDisplayAnimation}
              onDisplayAnimationChange={handleDisplayAnimationChange}
              hoverAnimation={currentHoverAnimation}
              onHoverAnimationChange={handleHoverAnimationChange}
              hideHoverSection
            />
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="advanced" className="p-4">
          <Stack gap={4}>
            <CrossPlatformSyncToggle />
            <PinningManager
              pinning={currentPinning}
              onPinningChange={handlePinningChange}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};