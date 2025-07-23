import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import {
  Box,
  Button,
  Grid,
  HStack,
  Text,
  VStack,
  Input,
  Stack,
  Combobox,
  Portal,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaImage, FaImages, FaCrop, FaExpand } from 'react-icons/fa';
import { EventItem, EventManager } from '../../editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, AnimationManager } from '../../editor/components/AnimationManager';
import { PinningSettings, PinningManager } from '../../editor/components/PinningManager';
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { CrossPlatformSyncToggle } from '../../editor/components/CrossPlatformSyncToggle';
import { FileType } from '@/features/files/fileAPI';
import { AlbumSectionProps } from './index';
import { AlbumImageCropModal, AlbumCropData } from './AlbumImageCropModal';
import { AlbumImageResizeModal, AlbumResizeData } from './AlbumImageResizeModal';
import { SectionsNodeControlsPanel } from '@/components/editor/components/SectionsNodeControlsPanel';
import { blendModeOptions, overlayTypeOptions } from '@/utils/settingProfile';
import { Tooltip } from '@/components/ui/tooltip';

// Design constants and options (from SectionsSettings)
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



const gradientTemplates = [
  { name: 'Blue to Purple', colors: ['#4158D0', '#C850C0'] },
  { name: 'Orange to Red', colors: ['#FF8008', '#FFC837'] },
];

export const AlbumSectionSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as AlbumSectionProps
  }));

  const { showFileSelectModal, showMultiImageSelectModal } = useViewport();
  const [settingType, setSettingType] = useState<string>('design');

  // Color picker states
  const [isBackgroundColorPickerOpen, setIsBackgroundColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);

  // Additional color picker states for advanced design features
  const [isOverlayColorPickerOpen, setIsOverlayColorPickerOpen] = useState(false);
  const [isOverlayGradientColor1PickerOpen, setIsOverlayGradientColor1PickerOpen] = useState(false);
  const [isOverlayGradientColor2PickerOpen, setIsOverlayGradientColor2PickerOpen] = useState(false);

  // Background position and size states
  const [currentBgSizeSetting, setCurrentBgSizeSetting] = useState('cover');
  const [customBgWidth, setCustomBgWidth] = useState('');
  const [customBgHeight, setCustomBgHeight] = useState('');
  const [bgPositionInput, setBgPositionInput] = useState('center center');

  // Crop and resize modal states
  const [cropModalState, setCropModalState] = useState<{
    isOpen: boolean;
    imageId: string | null;
    imageUrl: string;
    imageAlt?: string;
  }>({
    isOpen: false,
    imageId: null,
    imageUrl: '',
    imageAlt: '',
  });

  const [resizeModalState, setResizeModalState] = useState<{
    isOpen: boolean;
    imageId: string | null;
    imageUrl: string;
    imageAlt?: string;
    currentWidth?: string;
    currentHeight?: string;
  }>({
    isOpen: false,
    imageId: null,
    imageUrl: '',
    imageAlt: '',
    currentWidth: '200px',
    currentHeight: '150px',
  });

  // Utility functions for design settings (from SectionsSettings)
  const updateProp = (key: keyof AlbumSectionProps, value: any) => {
    setProp((props: AlbumSectionProps) => {
      (props as any)[key] = value;
    });
  };

  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseInt(value.toString().replace(/[^\d]/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleHeightChange = (value: number) => {
    updateProp('height', `${value}px`);
  };

  const handleBackgroundTypeChange = (newType: string) => {
    updateProp('backgroundType', newType);
    // Reset related properties when changing background type
    if (newType === 'color') {
      updateProp('backgroundImage', '');
      updateProp('backgroundVideo', '');
    } else if (newType === 'image') {
      updateProp('backgroundColor', '#ffffff');
      updateProp('backgroundVideo', '');
    } else if (newType === 'video') {
      updateProp('backgroundColor', '#ffffff');
      updateProp('backgroundImage', '');
    }
  };

  const applyGradientTemplate = (colors: string[]) => {
    updateProp('gradientColor1', colors[0]);
    updateProp('gradientColor2', colors[1]);
  };

  const handleBgSizeSettingChange = (value: string) => {
    setCurrentBgSizeSetting(value);
    if (value !== 'custom') {
      updateProp('backgroundSize', value);
    }
  };

  const handleCustomBgWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBgWidth(value);
    updateProp('backgroundSize', `${value} ${customBgHeight || 'auto'}`);
  };

  const handleCustomBgHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBgHeight(value);
    updateProp('backgroundSize', `${customBgWidth || 'auto'} ${value}`);
  };

  const handleBgPositionChange = (value: string) => {
    setBgPositionInput(value);
    updateProp('backgroundPosition', value);
  };

  // Background position collection for combobox
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection: bgPositionCollection, filter: filterBgPosition } = useListCollection({
    initialItems: backgroundPositionOptions,
    filter: contains,
  });

  // Carousel only - no layout selection needed

  // Handle adding new images
  const handleAddImages = () => {
    showMultiImageSelectModal((fileUrls: string[]) => {
      if (fileUrls && fileUrls.length > 0) {
        const newImages = fileUrls.map((url, index) => ({
          id: `${Date.now()}-${index}`,
          url: url,
          alt: `Image ${props.albumImages.length + index + 1}`,
          title: '',
        }));

        setProp((props: AlbumSectionProps) => {
          props.albumImages = [...props.albumImages, ...newImages];
        });
      }
    });
  };

  // Handle removing an image
  const handleRemoveImage = (imageId: string) => {
    setProp((props: AlbumSectionProps) => {
      props.albumImages = props.albumImages.filter(img => img.id !== imageId);
    });
  };

  // Handle replacing an image
  const handleReplaceImage = (imageId: string) => {
    showFileSelectModal(FileType.IMAGE, (fileUrl: string) => {
      if (fileUrl) {
        setProp((props: AlbumSectionProps) => {
          const imageIndex = props.albumImages.findIndex(img => img.id === imageId);
          if (imageIndex !== -1) {
            props.albumImages[imageIndex] = {
              ...props.albumImages[imageIndex],
              url: fileUrl,
              alt: props.albumImages[imageIndex].alt,
              title: props.albumImages[imageIndex].title,
            };
          }
        });
      }
    });
  };

  // Handle opening crop modal for an image
  const handleCropImage = (imageId: string) => {
    const image = props.albumImages.find(img => img.id === imageId);
    if (image) {
      setCropModalState({
        isOpen: true,
        imageId,
        imageUrl: image.url,
        imageAlt: image.alt,
      });
    }
  };

  // Handle crop completion
  const handleCropComplete = async (cropData: AlbumCropData) => {
    if (cropModalState.imageId) {
      setProp((props: AlbumSectionProps) => {
        const imageIndex = props.albumImages.findIndex(img => img.id === cropModalState.imageId);
        if (imageIndex !== -1) {
          // Update crop data using new react-image-crop structure
          props.albumImages[imageIndex].reactImageCropData = cropData;
          // Clear any existing croppedImageUrl to force regeneration
          props.albumImages[imageIndex].croppedImageUrl = '';
        }
      });
    }
    setCropModalState({ isOpen: false, imageId: null, imageUrl: '', imageAlt: '' });
  };

  // Handle opening resize modal for an image
  const handleResizeImage = (imageId: string) => {
    const image = props.albumImages.find(img => img.id === imageId);
    if (image) {
      setResizeModalState({
        isOpen: true,
        imageId,
        imageUrl: image.url,
        imageAlt: image.alt,
        currentWidth: image.width || '200px',
        currentHeight: image.height || '150px',
      });
    }
  };

  // Handle resize completion
  const handleResizeComplete = (resizeData: AlbumResizeData) => {
    if (resizeModalState.imageId) {
      setProp((props: AlbumSectionProps) => {
        const imageIndex = props.albumImages.findIndex(img => img.id === resizeModalState.imageId);
        if (imageIndex !== -1) {
          props.albumImages[imageIndex].width = resizeData.width;
          props.albumImages[imageIndex].height = resizeData.height;
        }
      });
    }
    setResizeModalState({
      isOpen: false,
      imageId: null,
      imageUrl: '',
      imageAlt: '',
      currentWidth: '200px',
      currentHeight: '150px'
    });
  };

  return (
    <Box p={4}>
      <VStack gap={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Cài đặt Album Section</Text>

        {/* Tab Navigation */}
        <HStack gap={2} flexWrap="wrap">
          {[
            { key: 'design', label: 'Thiết kế' },
            { key: 'carousel', label: 'Carousel' },
            { key: 'images', label: 'Hình ảnh' },
            { key: 'events', label: 'Sự kiện' },
            { key: 'animations', label: 'Hiệu ứng' },
            { key: 'pinning', label: 'Ghim' },
          ].map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={settingType === tab.key ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setSettingType(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </HStack>

        {/* Design Tab */}
        {settingType === 'design' && (
          <Stack gap="4">
            {/* Sections Node Controls Panel */}
            <SectionsNodeControlsPanel />

            {/* Kích thước (Dimensions) Section */}
            <Box borderBottomWidth="1px" borderColor="gray.200" >
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
            <Box borderBottomWidth="1px" borderColor="gray.200" >
              <Text fontSize="sm" fontWeight="bold" mb={2}>Màu & Hình nền</Text>
              <HStack justifyContent="space-between" mb={2}>
                <Text fontSize="xs">Loại nền</Text>
                <select
                  className="outline-none p-2 rounded-md text-sm"
                  value={props.backgroundType || 'color'}
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
                  <Button size="xs" variant="outline" onClick={() => setIsBackgroundColorPickerOpen(true)}>
                    <Box w="16px" h="16px" borderRadius="sm" bg={props.backgroundColor || '#ffffff'} border="1px solid gray" />
                  </Button>
                  <ColorPickerModal
                    isOpen={isBackgroundColorPickerOpen}
                    onClose={() => setIsBackgroundColorPickerOpen(false)}
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
                        handleBgPositionChange(details.value[0] ?? '');
                      }}
                      value={bgPositionInput ? [bgPositionInput] : []}
                      width="60%"
                      openOnClick
                      multiple={false}
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
            <Box borderBottomWidth="1px" borderColor="gray.200" >
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

            {/* Overlay Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} >
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
                      </Stack>
                    )}

                    {/* Overlay Opacity */}
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
        )}

        {/* Carousel Tab */}
        {settingType === 'carousel' && (
          <VStack gap={4} align="stretch">
            <Text fontWeight="bold">Cài đặt Carousel</Text>

            {/* Image Padding Settings - Available for all layout types */}
            <VStack gap={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium">Padding ảnh</Text>

              <HStack>
                <Text fontSize="xs">Padding riêng biệt</Text>
                <Button
                  size="xs"
                  variant={props.useIndividualPadding ? 'solid' : 'outline'}
                  onClick={() => setProp((props: AlbumSectionProps) => props.useIndividualPadding = !props.useIndividualPadding)}
                >
                  {props.useIndividualPadding ? 'Bật' : 'Tắt'}
                </Button>
              </HStack>

              {!props.useIndividualPadding ? (
                <Box>
                  <Text mb={2} fontSize="xs">Padding chung</Text>
                  <DraggableNumberInput
                    value={props.imagePadding}
                    onChange={(value) => setProp((props: AlbumSectionProps) => props.imagePadding = value)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </Box>
              ) : (
                <VStack gap={2} align="stretch">
                  <Box>
                    <Text mb={1} fontSize="xs">Padding trên</Text>
                    <DraggableNumberInput
                      value={props.imagePaddingTop}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.imagePaddingTop = value)}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontSize="xs">Padding phải</Text>
                    <DraggableNumberInput
                      value={props.imagePaddingRight}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.imagePaddingRight = value)}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontSize="xs">Padding dưới</Text>
                    <DraggableNumberInput
                      value={props.imagePaddingBottom}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.imagePaddingBottom = value)}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontSize="xs">Padding trái</Text>
                    <DraggableNumberInput
                      value={props.imagePaddingLeft}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.imagePaddingLeft = value)}
                      min={0}
                      max={50}
                      step={1}
                    />
                  </Box>
                </VStack>
              )}
            </VStack>

            {/* Wrapper Padding Settings - Available for all layout types */}
            <VStack gap={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium">Padding khung album</Text>

              <HStack>
                <Text fontSize="xs">Padding riêng biệt</Text>
                <Button
                  size="xs"
                  variant={props.useIndividualWrapperPadding ? 'solid' : 'outline'}
                  onClick={() => setProp((props: AlbumSectionProps) => props.useIndividualWrapperPadding = !props.useIndividualWrapperPadding)}
                >
                  {props.useIndividualWrapperPadding ? 'Bật' : 'Tắt'}
                </Button>
              </HStack>

              {!props.useIndividualWrapperPadding ? (
                <Box>
                  <Text mb={2} fontSize="xs">Padding chung</Text>
                  <DraggableNumberInput
                    value={props.wrapperPadding}
                    onChange={(value) => setProp((props: AlbumSectionProps) => props.wrapperPadding = value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </Box>
              ) : (
                <VStack gap={2} align="stretch">
                  <Box>
                    <Text mb={1} fontSize="xs">Padding trên</Text>
                    <DraggableNumberInput
                      value={props.wrapperPaddingTop}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.wrapperPaddingTop = value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontSize="xs">Padding phải</Text>
                    <DraggableNumberInput
                      value={props.wrapperPaddingRight}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.wrapperPaddingRight = value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontSize="xs">Padding dưới</Text>
                    <DraggableNumberInput
                      value={props.wrapperPaddingBottom}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.wrapperPaddingBottom = value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </Box>
                  <Box>
                    <Text mb={1} fontSize="xs">Padding trái</Text>
                    <DraggableNumberInput
                      value={props.wrapperPaddingLeft}
                      onChange={(value) => setProp((props: AlbumSectionProps) => props.wrapperPaddingLeft = value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </Box>
                </VStack>
              )}
            </VStack>

            {/* Carousel Settings - Always available since we only have carousel layout */}
            <VStack gap={3} align="stretch">
              <HStack>
                <Text fontSize="sm" fontWeight="medium">Tự động chạy</Text>
                <Button
                  size="xs"
                  variant={props.carouselAutoPlay ? 'solid' : 'outline'}
                  onClick={() => setProp((props: AlbumSectionProps) => props.carouselAutoPlay = !props.carouselAutoPlay)}
                >
                  {props.carouselAutoPlay ? 'Bật' : 'Tắt'}
                </Button>
              </HStack>

              {props.carouselAutoPlay && (
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">Tốc độ (ms)</Text>
                  <DraggableNumberInput
                    value={props.carouselSpeed}
                    onChange={(value) => setProp((props: AlbumSectionProps) => props.carouselSpeed = value)}
                    min={1000}
                    max={10000}
                    step={500}
                  />
                </Box>
              )}

              <HStack>
                <Text fontSize="sm" fontWeight="medium">Hiện mũi tên</Text>
                <Button
                  size="xs"
                  variant={props.carouselShowArrows ? 'solid' : 'outline'}
                  onClick={() => setProp((props: AlbumSectionProps) => props.carouselShowArrows = !props.carouselShowArrows)}
                >
                  {props.carouselShowArrows ? 'Bật' : 'Tắt'}
                </Button>
              </HStack>

              <HStack>
                <Text fontSize="sm" fontWeight="medium">Hiện chấm</Text>
                <Button
                  size="xs"
                  variant={props.carouselShowDots ? 'solid' : 'outline'}
                  onClick={() => setProp((props: AlbumSectionProps) => props.carouselShowDots = !props.carouselShowDots)}
                >
                  {props.carouselShowDots ? 'Bật' : 'Tắt'}
                </Button>
              </HStack>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Số ảnh hiển thị (Desktop)</Text>
                <DraggableNumberInput
                  value={props.carouselItemsDesktop}
                  onChange={(value) => setProp((props: AlbumSectionProps) => props.carouselItemsDesktop = value)}
                  min={1}
                  max={5}
                  step={1}
                />
              </Box>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Số ảnh hiển thị (Tablet)</Text>
                <DraggableNumberInput
                  value={props.carouselItemsTablet}
                  onChange={(value) => setProp((props: AlbumSectionProps) => props.carouselItemsTablet = value)}
                  min={1}
                  max={4}
                  step={1}
                />
              </Box>

              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Số ảnh hiển thị (Mobile)</Text>
                <DraggableNumberInput
                  value={props.carouselItemsMobile}
                  onChange={(value) => setProp((props: AlbumSectionProps) => props.carouselItemsMobile = value)}
                  min={1}
                  max={3}
                  step={1}
                />
              </Box>
            </VStack>
          </VStack>
        )}

        {/* Images Tab */}
        {settingType === 'images' && (
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold">Quản lý hình ảnh</Text>
              <Button
                onClick={handleAddImages}
                size="sm"
                colorScheme="blue"
              >
                <HStack gap={2}>
                  <FaPlus />
                  <Text>Thêm ảnh</Text>
                </HStack>
              </Button>
            </HStack>

            <Text fontSize="sm" color="gray.600">
              Tổng cộng: {props.albumImages.length} hình ảnh
            </Text>

            {/* Image List */}
            <VStack gap={2} align="stretch" maxH="400px" overflowY="auto">
              {props.albumImages.map((image, index) => (
                <HStack key={image.id} p={2} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <img
                    src={image.url}
                    alt={image.alt}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <VStack align="start" flex={1} gap={0}>
                    <Text fontSize="sm" fontWeight="medium" truncate>
                      {image.alt || `Image ${index + 1}`}
                    </Text>
                    <Text fontSize="xs" color="gray.500" truncate maxW={'80px'}>
                      {image.url}
                    </Text>
                  </VStack>
                  <VStack gap={1}>
                    <HStack gap={1}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleCropImage(image.id)}
                        title="Cắt ảnh"
                        minW="24px"
                        h="24px"
                        p={0}
                      >
                        <FaCrop size={10} />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleResizeImage(image.id)}
                        title="Thay đổi kích thước"
                        minW="24px"
                        h="24px"
                        p={0}
                      >
                        <FaExpand size={10} />
                      </Button>
                    </HStack>
                    <HStack gap={1}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleReplaceImage(image.id)}
                        title="Thay thế ảnh"
                        minW="24px"
                        h="24px"
                        p={0}
                      >
                        <FaImage size={10} />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleRemoveImage(image.id)}
                        title="Xóa ảnh"
                        minW="24px"
                        h="24px"
                        p={0}
                      >
                        <FaTrash size={10} />
                      </Button>
                    </HStack>
                  </VStack>
                </HStack>
              ))}
            </VStack>

            {props.albumImages.length === 0 && (
              <Box textAlign="center" py={8} color="gray.500">
                <FaImages size={48} style={{ margin: '0 auto 16px' }} />
                <Text>Chưa có hình ảnh nào</Text>
                <Text fontSize="sm">Nhấn "Thêm ảnh" để bắt đầu</Text>
              </Box>
            )}
          </VStack>
        )}

        {/* Events Tab */}
        {settingType === 'events' && (
          <EventManager
            events={props.events}
            onEventsChange={(events: EventItem[]) => setProp((props: AlbumSectionProps) => props.events = events)}
          />
        )}

        {/* Animations Tab */}
        {settingType === 'animations' && (
          <AnimationManager
            displayAnimation={props.displayAnimation}
            hoverAnimation={props.hoverAnimation}
            onDisplayAnimationChange={(animation: DisplayAnimationItem | null) =>
              setProp((props: AlbumSectionProps) => props.displayAnimation = animation)
            }
            onHoverAnimationChange={(animation: HoverAnimationSettings) =>
              setProp((props: AlbumSectionProps) => props.hoverAnimation = animation)
            }
          />
        )}

        {/* Pinning Tab */}
        {settingType === 'pinning' && (
          <VStack gap={4}>
            <CrossPlatformSyncToggle />
            <PinningManager
              pinning={props.pinning}
              onPinningChange={(pinning: PinningSettings) => setProp((props: AlbumSectionProps) => props.pinning = pinning)}
            />
          </VStack>
        )}
      </VStack>

      {/* Crop Modal */}
      <AlbumImageCropModal
        isOpen={cropModalState.isOpen}
        onClose={() => setCropModalState({ isOpen: false, imageId: null, imageUrl: '', imageAlt: '' })}
        imageUrl={cropModalState.imageUrl}
        imageId={cropModalState.imageId || ''}
        imageAlt={cropModalState.imageAlt}
        onCropComplete={handleCropComplete}
        aspectRatio={undefined} // Allow free cropping for album items
      />

      {/* Resize Modal */}
      <AlbumImageResizeModal
        isOpen={resizeModalState.isOpen}
        onClose={() => setResizeModalState({
          isOpen: false,
          imageId: null,
          imageUrl: '',
          imageAlt: '',
          currentWidth: '200px',
          currentHeight: '150px'
        })}
        imageUrl={resizeModalState.imageUrl}
        imageId={resizeModalState.imageId || ''}
        imageAlt={resizeModalState.imageAlt}
        initialWidth={resizeModalState.currentWidth}
        initialHeight={resizeModalState.currentHeight}
        onResizeComplete={handleResizeComplete}
        lockAspectRatio={true}
      />
    </Box>
  );
};
