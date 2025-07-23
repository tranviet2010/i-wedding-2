import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import {
  Box,
  Text,
  Stack,
  Input as ChakraInput,
  Tabs,
  HStack,
  Button,
  MenuContent,
  MenuRoot,
} from '@chakra-ui/react';
import { WishListProps } from './index';
import { EventManager, EventItem } from '../../editor/components/EventManager';
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings as HoverAnimationSettingsType } from '../../editor/components/AnimationManager';
import { PinningManager, PinningSettings as PinningSettingsType } from '../../editor/components/PinningManager';
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { StyledFontSelector } from '../../editor/components/StyledFontSelector';
import { useGetFonts } from '@/features/files/fileAPI';
import { CiSettings } from 'react-icons/ci';
import { Tooltip } from '@/components/ui/tooltip';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { CgBorderTop, CgBorderRight, CgBorderBottom, CgBorderLeft } from 'react-icons/cg';
import { TbRadiusTopLeft, TbRadiusTopRight, TbRadiusBottomRight, TbRadiusBottomLeft } from 'react-icons/tb';
import { MenuRadioItem, MenuRadioItemGroup, MenuTrigger } from '@/components/ui/menu';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { borderStyleOptions, backgroundTypeOptions, gradientTypeOptions, gradientTemplates, backgroundPositionOptions, backgroundRepeatOptions, advancedBackgroundSizeOptions } from '@/utils/settingProfile';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { FileType } from '@/features/files/fileAPI';
import CrossPlatformSyncToggle from '@/components/editor/components/CrossPlatformSyncToggle';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';

export const WishListSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as WishListProps
  }));

  const [settingType, setSettingType] = useState<string>('default');

  // Color picker states
  const [isBackgroundColorPickerOpen, setIsBackgroundColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);
  const [isWishNameColorPickerOpen, setIsWishNameColorPickerOpen] = useState(false);
  const [isWishContentColorPickerOpen, setIsWishContentColorPickerOpen] = useState(false);
  const [isWishItemBgColorPickerOpen, setIsWishItemBgColorPickerOpen] = useState(false);
  const [isWishItemBorderColorPickerOpen, setIsWishItemBorderColorPickerOpen] = useState(false);

  // Advanced controls states
  const [isWishItemPaddingAdvancedOpen, setIsWishItemPaddingAdvancedOpen] = useState(false);
  const [isWishItemBorderWidthAdvancedOpen, setIsWishItemBorderWidthAdvancedOpen] = useState(false);
  const [isWishItemBorderRadiusAdvancedOpen, setIsWishItemBorderRadiusAdvancedOpen] = useState(false);

  // Get fonts for font selector
  const { data: customFonts = [] } = useGetFonts();

  // Get viewport context for file selection
  const { showFileSelectModal } = useViewport();

  // Standard font options (following the same pattern as other components)
  const fonts = [
    { label: 'Inherit', value: 'inherit' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: "'Helvetica Neue', Helvetica, sans-serif" },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Open Sans', value: "'Open Sans', sans-serif" },
    { label: 'Roboto', value: "'Roboto', sans-serif" },
  ];

  const updateProp = (key: keyof WishListProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  // Helper functions (following Container pattern)
  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseInt(value.toString().replace(/[^\d]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleWidthChange = (value: number) => {
    updateProp('width', `${value}px`);
  };

  const handleHeightChange = (value: number) => {
    updateProp('height', `${value}px`);
  };

  // Background handling functions (following Container pattern)
  const handleBackgroundTypeChange = (newType: string) => {
    updateProp('backgroundType', newType);
  };

  const applyGradientTemplate = (colors: string[]) => {
    updateProp('gradientColor1', colors[0]);
    updateProp('gradientColor2', colors[1]);
  };

  const handleEventsChange = (newEvents: EventItem[]) => {
    updateProp('events', newEvents);
  };

  const handleDisplayAnimationChange = (newAnimation: DisplayAnimationItem | null) => {
    updateProp('displayAnimation', newAnimation);
  };

  const handleHoverAnimationChange = (newHoverAnimation: HoverAnimationSettingsType) => {
    updateProp('hoverAnimation', newHoverAnimation);
  };

  const handlePinningChange = (newPinning: PinningSettingsType) => {
    updateProp('pinning', newPinning);
  };

  const handleBorderRadiusChange = (index: number, value: number) => {
    const newBorderRadius = [...props.borderRadius];
    newBorderRadius[index] = value;
    updateProp('borderRadius', newBorderRadius);
  };

  const handleBorderWidthChange = (index: number, value: number) => {
    const newBorderWidth = [...props.borderWidth];
    newBorderWidth[index] = value;
    updateProp('borderWidth', newBorderWidth);
  };

  const handlePaddingChange = (index: number, value: number) => {
    const newPadding = [...props.padding];
    newPadding[index] = value;
    updateProp('padding', newPadding);
  };

  const handleMarginChange = (index: number, value: number) => {
    const newMargin = [...props.margin];
    newMargin[index] = value;
    updateProp('margin', newMargin);
  };

  // Wish item styling handlers
  const handleWishItemPaddingChange = (index: number, value: number) => {
    const newPadding = [...props.wishItemPadding];
    newPadding[index] = value;
    updateProp('wishItemPadding', newPadding);
  };

  const handleWishItemBorderWidthChange = (index: number, value: number) => {
    const newBorderWidth = [...props.wishItemBorderWidth];
    newBorderWidth[index] = value;
    updateProp('wishItemBorderWidth', newBorderWidth);
  };

  const handleWishItemBorderRadiusChange = (index: number, value: number) => {
    const newBorderRadius = [...props.wishItemBorderRadius];
    newBorderRadius[index] = value;
    updateProp('wishItemBorderRadius', newBorderRadius);
  };



  const currentEvents = props.events || [];
  const currentDisplayAnimation = props.displayAnimation || null;
  const currentHoverAnimation = props.hoverAnimation || { enabled: false };
  const currentPinning = props.pinning || {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  };

  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'wishlist-setting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="event" className='!text-xs'>
            Sự kiện
          </Tabs.Trigger>
          <Tabs.Trigger value="animation" className='!text-xs'>
            Hiệu ứng
          </Tabs.Trigger>
          <Tabs.Trigger value="advanced" className='!text-xs'>
            Nâng cao
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="default">
          <Stack>
            <NodeControlsPanel
              showDragHandle={false}
              showLayerControls={true}
              showContainerSpecificControls={true}
            />
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Kích thước</Text>
              <Stack gap={2} direction="row" alignItems="center" justifyContent="space-between">
                <Box flex={1} display="flex" alignItems="center" gap={2}>
                  <Text fontSize="xs" className='translate-y-[2px]'>W</Text>
                  <DraggableNumberInput
                    value={parseNumericValue(props.width)}
                    onChange={handleWidthChange}
                    min={1}
                  />
                </Box>
                <Box flex={1} display="flex" alignItems="center" gap={2}>
                  <Text fontSize="xs" className='translate-y-[2px]'>H</Text>
                  <DraggableNumberInput
                    value={parseNumericValue(props.height)}
                    onChange={handleHeightChange}
                    min={1}
                  />
                </Box>
                <Box
                  onClick={() => updateProp('lockAspectRatio', !props.lockAspectRatio)}
                  cursor="pointer"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {props.lockAspectRatio ? <FaLock size={14} /> : <FaUnlock size={14} />}
                </Box>
              </Stack>
            </Box>

            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Màu & Hình nền</Text>
              <Stack gap="3" mt={2}>
                <Box className='w-full flex items-center justify-between'>
                  <Text fontSize="xs">Loại nền</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.backgroundType || 'color'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const newType = e.target.value;
                      handleBackgroundTypeChange(newType);
                    }}
                  >
                    {backgroundTypeOptions.filter(opt => opt.value !== 'video').map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </Box>

                {/* Solid Color Background */}
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

                {/* Gradient Background */}
                {props.backgroundType === 'gradient' && (
                  <Stack gap="2">
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Kiểu Gradient</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.gradientType || 'linear'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('gradientType', e.target.value)}
                      >
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

                {/* Image Background */}
                {props.backgroundType === 'image' && (
                  <Stack gap="2">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Hình ảnh</Text>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => showFileSelectModal(
                          FileType.IMAGE,
                          (fileUrl: string) => {
                            updateProp('backgroundImage', fileUrl);
                          }
                        )}
                      >
                        Chọn ảnh
                      </Button>
                    </HStack>
                    {props.backgroundImage && (
                      <>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Kích thước</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.backgroundSize || 'cover'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('backgroundSize', e.target.value)}
                          >
                            {advancedBackgroundSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Vị trí</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.backgroundPosition || 'center center'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('backgroundPosition', e.target.value)}
                          >
                            {backgroundPositionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Lặp lại</Text>
                          <select
                            className="outline-none p-2 rounded-md text-sm"
                            value={props.backgroundRepeat || 'no-repeat'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('backgroundRepeat', e.target.value)}
                          >
                            {backgroundRepeatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </HStack>
                      </>
                    )}
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* Border Settings Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Viền & Bo góc</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between'>
                  <Text fontSize="xs">Kiểu viền</Text>
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <Box
                        className="w-[120px] p-2 rounded-md text-sm cursor-pointer flex items-center gap-2 flex-row"
                      >
                        <Box
                          width="40px"
                          height="2px"
                          borderColor={props.borderColor || '#000000'}
                          borderWidth="2px"
                          borderStyle={props.borderStyle || 'none'}
                        />
                        {props.borderStyle === 'none' || !props.borderStyle ? "None" : ""}
                        <MdKeyboardArrowDown />
                      </Box>
                    </MenuTrigger>
                    <MenuContent>
                      <MenuRadioItemGroup
                        value={props.borderStyle || 'none'}
                        onValueChange={(value) => updateProp('borderStyle', value.value)}
                      >
                        {borderStyleOptions.map(option => (
                          <MenuRadioItem
                            key={option.value}
                            value={option.value}
                            className="flex items-center gap-2"
                          >
                            <Box
                              py={3}
                              width="40px"
                              height="2px"
                              borderColor={props.borderColor || '#000000'}
                              borderWidth="2px"
                              borderStyle={option.value}
                            />
                          </MenuRadioItem>
                        ))}
                      </MenuRadioItemGroup>
                    </MenuContent>
                  </MenuRoot>
                </Box>

                {/* Border Color */}
                {props.borderStyle && props.borderStyle !== 'none' && (
                  <Box className='w-full flex items-center justify-between'>
                    <Text fontSize="xs">Màu viền</Text>
                    <Box
                      display="flex"
                      alignItems="center"
                      borderRadius="md"
                      p={2}
                      cursor="pointer"
                      onClick={() => setIsWishItemBorderColorPickerOpen(true)}
                    >
                      <Box
                        width="24px"
                        height="24px"
                        borderRadius="md"
                        backgroundColor={props.borderColor || '#000000'}
                        mr={2}
                        border="1px solid"
                        borderColor="gray.200"
                      />
                      <Text fontSize="xs">{props.borderColor || '#000000'}</Text>
                    </Box>
                    <ColorPickerModal
                      isOpen={isWishItemBorderColorPickerOpen}
                      onClose={() => setIsWishItemBorderColorPickerOpen(false)}
                      onColorChange={(color) => updateProp('borderColor', color)}
                      initialColor={props.borderColor || '#000000'}
                    />
                  </Box>
                )}

                {/* Border Width */}
                {props.borderStyle && props.borderStyle !== 'none' && (
                  <>
                    <Box className='w-full flex items-center gap-2'>
                      <Tooltip content="Độ dày viền" positioning={{ placement: "top" }}>
                        <Box className='flex items-center gap-2'>
                          <Text fontSize="xs" display="flex" alignItems="center">
                            <CgBorderTop />
                          </Text>
                          <DraggableNumberInput
                            value={props.borderWidth?.[0] || 0}
                            onChange={(value) => {
                              const newBorderWidth = [...props.borderWidth];
                              newBorderWidth[0] = value;
                              newBorderWidth[1] = value;
                              newBorderWidth[2] = value;
                              newBorderWidth[3] = value;
                              updateProp('borderWidth', newBorderWidth);
                            }}
                            min={0}
                            max={20}
                          />
                        </Box>
                      </Tooltip>
                      <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                        <Box className='cursor-pointer' onClick={() => setIsWishItemBorderWidthAdvancedOpen((prev) => !prev)}>
                          <CiSettings />
                        </Box>
                      </Tooltip>
                    </Box>
                    <Box className={`${isWishItemBorderWidthAdvancedOpen ? 'block' : 'hidden'}`}>
                      <Stack direction="row" gap={2}>
                        {/* Top */}
                        <Box className='flex flex-col gap-1'>
                          <Tooltip content="Top" positioning={{ placement: "top" }}>
                            <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                              <CgBorderTop />
                            </Text>
                          </Tooltip>
                          <DraggableNumberInput
                            value={props.borderWidth?.[0] || 0}
                            onChange={(value) => handleBorderWidthChange(0, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                        {/* Right */}
                        <Box className='flex flex-col gap-1'>
                          <Tooltip content="Right" positioning={{ placement: "top" }}>
                            <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                              <CgBorderRight />
                            </Text>
                          </Tooltip>
                          <DraggableNumberInput
                            value={props.borderWidth?.[1] || 0}
                            onChange={(value) => handleBorderWidthChange(1, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                        {/* Bottom */}
                        <Box className='flex flex-col gap-1'>
                          <Tooltip content="Bottom" positioning={{ placement: "top" }}>
                            <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                              <CgBorderBottom />
                            </Text>
                          </Tooltip>
                          <DraggableNumberInput
                            value={props.borderWidth?.[2] || 0}
                            onChange={(value) => handleBorderWidthChange(2, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                        {/* Left */}
                        <Box className='flex flex-col gap-1'>
                          <Tooltip content="Left" positioning={{ placement: "top" }}>
                            <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                              <CgBorderLeft />
                            </Text>
                          </Tooltip>
                          <DraggableNumberInput
                            value={props.borderWidth?.[3] || 0}
                            onChange={(value) => handleBorderWidthChange(3, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </>
                )}

                {/* Border Radius */}
                <Box>
                  <Box className='w-full flex items-center gap-2'>
                    <Tooltip content="Bo góc" positioning={{ placement: "top" }}>
                      <Box className='flex items-center gap-2'>
                        <Text fontSize="xs" display="flex" alignItems="center">
                          <TbRadiusTopLeft />
                        </Text>
                        <DraggableNumberInput
                          value={props.borderRadius?.[0] || 0}
                          onChange={(value) => {
                            const newBorderRadius = [...props.borderRadius];
                            newBorderRadius[0] = value;
                            newBorderRadius[1] = value;
                            newBorderRadius[2] = value;
                            newBorderRadius[3] = value;
                            updateProp('borderRadius', newBorderRadius);
                          }}
                          min={0}
                        />
                      </Box>
                    </Tooltip>
                    <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                      <Box className='cursor-pointer' onClick={() => setIsWishItemBorderRadiusAdvancedOpen((prev) => !prev)}>
                        <CiSettings />
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box className={`${isWishItemBorderRadiusAdvancedOpen ? 'block' : 'hidden'}`}>
                    <Stack direction="row" gap={2}>
                      {/* Top Left */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Top Left" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusTopLeft />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.borderRadius?.[0] || 0}
                          onChange={(value) => handleBorderRadiusChange(0, value)}
                          min={0}
                        />
                      </Box>
                      {/* Top Right */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Top Right" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusTopRight />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.borderRadius?.[1] || 0}
                          onChange={(value) => handleBorderRadiusChange(1, value)}
                          min={0}
                        />
                      </Box>
                      {/* Bottom Right */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Bottom Right" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusBottomRight />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.borderRadius?.[2] || 0}
                          onChange={(value) => handleBorderRadiusChange(2, value)}
                          min={0}
                        />
                      </Box>
                      {/* Bottom Left */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Bottom Left" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusBottomLeft />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.borderRadius?.[3] || 0}
                          onChange={(value) => handleBorderRadiusChange(3, value)}
                          min={0}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Padding Settings */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Khoảng cách</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center gap-2'>
                  <Tooltip content="Khoảng cách trong" positioning={{ placement: "top" }}>
                    <Box className='flex items-center gap-2'>
                      <Text fontSize="xs">Padding</Text>
                      <DraggableNumberInput
                        value={props.padding?.[0] || 0}
                        onChange={(value) => {
                          const newPadding = [...props.padding];
                          newPadding[0] = value;
                          newPadding[1] = value;
                          newPadding[2] = value;
                          newPadding[3] = value;
                          updateProp('padding', newPadding);
                        }}
                        min={0}
                        max={100}
                      />
                    </Box>
                  </Tooltip>
                  <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                    <Box className='cursor-pointer' onClick={() => setIsWishItemPaddingAdvancedOpen((prev) => !prev)}>
                      <CiSettings />
                    </Box>
                  </Tooltip>
                </Box>

                <Box className={`${isWishItemPaddingAdvancedOpen ? 'block' : 'hidden'}`}>
                  <Stack direction="row" gap={2}>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Top</Text>
                      <DraggableNumberInput
                        value={props.padding?.[0] || 0}
                        onChange={(value) => handlePaddingChange(0, value)}
                        min={0}
                        max={100}
                      />
                    </Box>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Right</Text>
                      <DraggableNumberInput
                        value={props.padding?.[1] || 0}
                        onChange={(value) => handlePaddingChange(1, value)}
                        min={0}
                        max={100}
                      />
                    </Box>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Bottom</Text>
                      <DraggableNumberInput
                        value={props.padding?.[2] || 0}
                        onChange={(value) => handlePaddingChange(2, value)}
                        min={0}
                        max={100}
                      />
                    </Box>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Left</Text>
                      <DraggableNumberInput
                        value={props.padding?.[3] || 0}
                        onChange={(value) => handlePaddingChange(3, value)}
                        min={0}
                        max={100}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Wish List Settings */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Cài đặt lời chúc</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Số lời chúc tối đa</Text>
                  <input
                    type="number"
                    style={{ width: '60%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    value={props.maxWishes}
                    onChange={(e) => updateProp('maxWishes', parseInt(e.target.value) || 10)}
                    min={1}
                    max={50}
                  />
                </Box>

                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Hiển thị dữ liệu mẫu</Text>
                  <input
                    type="checkbox"
                    checked={props.showMockData}
                    onChange={(e) => updateProp('showMockData', e.target.checked)}
                  />
                </Box>
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Cài đặt lời chúc</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Số lời chúc tối đa</Text>
                  <input
                    type="number"
                    style={{ width: '60%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    value={props.maxWishes}
                    onChange={(e) => updateProp('maxWishes', parseInt(e.target.value) || 10)}
                    min={1}
                    max={50}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Font Settings for Wish Names */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Font chữ tên người chúc</Text>
              <Stack gap={3}>
                <HStack gap={2}>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Font chữ</Text>
                    <StyledFontSelector
                      value={props.wishNameFontFamily || 'inherit'}
                      options={fonts}
                      onChange={(value) => updateProp('wishNameFontFamily', value)}
                      className='w-full'
                    />
                  </Box>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Cỡ chữ</Text>
                    <DraggableNumberInput
                      value={parseInt(props.wishNameFontSize || '16')}
                      onChange={(value) => updateProp('wishNameFontSize', `${value}px`)}
                      min={8}
                      max={200}
                    />
                  </Box>
                </HStack>

                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Màu chữ</Text>
                  <Button size="xs" variant="outline" onClick={() => setIsWishNameColorPickerOpen(true)}>
                    <Box w="16px" h="16px" borderRadius="sm" bg={props.wishNameFontColor || '#1f2937'} border="1px solid gray" />
                  </Button>
                  <ColorPickerModal
                    isOpen={isWishNameColorPickerOpen}
                    onClose={() => setIsWishNameColorPickerOpen(false)}
                    initialColor={props.wishNameFontColor || '#1f2937'}
                    onColorChange={(color: string) => updateProp('wishNameFontColor', color)}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Font Settings for Wish Content */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Font chữ nội dung lời chúc</Text>
              <Stack gap={3}>
                <HStack gap={2}>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Font chữ</Text>
                    <StyledFontSelector
                      value={props.wishContentFontFamily || 'inherit'}
                      options={fonts}
                      onChange={(value) => updateProp('wishContentFontFamily', value)}
                      className='w-full'
                    />
                  </Box>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Cỡ chữ</Text>
                    <DraggableNumberInput
                      value={parseInt(props.wishContentFontSize || '14')}
                      onChange={(value) => updateProp('wishContentFontSize', `${value}px`)}
                      min={8}
                      max={200}
                    />
                  </Box>
                </HStack>

                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Màu chữ</Text>
                  <Button size="xs" variant="outline" onClick={() => setIsWishContentColorPickerOpen(true)}>
                    <Box w="16px" h="16px" borderRadius="sm" bg={props.wishContentFontColor || '#374151'} border="1px solid gray" />
                  </Button>
                  <ColorPickerModal
                    isOpen={isWishContentColorPickerOpen}
                    onClose={() => setIsWishContentColorPickerOpen(false)}
                    initialColor={props.wishContentFontColor || '#374151'}
                    onColorChange={(color: string) => updateProp('wishContentFontColor', color)}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Wish Item Styling Settings */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Kiểu dáng từng lời chúc</Text>
              <Stack gap={3}>
                {/* Wish Item Text Padding */}
                <Box className='w-full flex items-center gap-2'>
                  <Tooltip content="Khoảng cách từ viền đến chữ" positioning={{ placement: "top" }}>
                    <Box className='flex items-center gap-2'>
                      <Text fontSize="xs">Padding chữ</Text>
                      <DraggableNumberInput
                        value={props.wishItemPadding?.[0] || 0}
                        onChange={(value) => {
                          const newPadding = [...props.wishItemPadding];
                          newPadding[0] = value;
                          newPadding[1] = value;
                          newPadding[2] = value;
                          newPadding[3] = value;
                          updateProp('wishItemPadding', newPadding);
                        }}
                        min={0}
                        max={50}
                      />
                    </Box>
                  </Tooltip>
                  <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                    <Box className='cursor-pointer' onClick={() => setIsWishItemPaddingAdvancedOpen((prev) => !prev)}>
                      <CiSettings />
                    </Box>
                  </Tooltip>
                </Box>

                <Box className={`${isWishItemPaddingAdvancedOpen ? 'block' : 'hidden'}`}>
                  <Stack direction="row" gap={2}>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Top</Text>
                      <DraggableNumberInput
                        value={props.wishItemPadding?.[0] || 0}
                        onChange={(value) => handleWishItemPaddingChange(0, value)}
                        min={0}
                        max={50}
                      />
                    </Box>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Right</Text>
                      <DraggableNumberInput
                        value={props.wishItemPadding?.[1] || 0}
                        onChange={(value) => handleWishItemPaddingChange(1, value)}
                        min={0}
                        max={50}
                      />
                    </Box>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Bottom</Text>
                      <DraggableNumberInput
                        value={props.wishItemPadding?.[2] || 0}
                        onChange={(value) => handleWishItemPaddingChange(2, value)}
                        min={0}
                        max={50}
                      />
                    </Box>
                    <Box className='flex flex-col gap-1'>
                      <Text fontSize="xs">Left</Text>
                      <DraggableNumberInput
                        value={props.wishItemPadding?.[3] || 0}
                        onChange={(value) => handleWishItemPaddingChange(3, value)}
                        min={0}
                        max={50}
                      />
                    </Box>
                  </Stack>
                </Box>

                {/* Wish Item Background Color */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Màu nền lời chúc</Text>
                  <Button size="xs" variant="outline" onClick={() => setIsWishItemBgColorPickerOpen(true)}>
                    <Box w="16px" h="16px" borderRadius="sm" bg={props.wishItemBackgroundColor || 'transparent'} border="1px solid gray" />
                  </Button>
                  <ColorPickerModal
                    isOpen={isWishItemBgColorPickerOpen}
                    onClose={() => setIsWishItemBgColorPickerOpen(false)}
                    initialColor={props.wishItemBackgroundColor || 'transparent'}
                    onColorChange={(color: string) => updateProp('wishItemBackgroundColor', color)}
                  />
                </Box>

                {/* Wish Item Border Color */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Màu viền lời chúc</Text>
                  <Button size="xs" variant="outline" onClick={() => setIsWishItemBorderColorPickerOpen(true)}>
                    <Box w="16px" h="16px" borderRadius="sm" bg={props.wishItemBorderColor || '#f3f4f6'} border="1px solid gray" />
                  </Button>
                  <ColorPickerModal
                    isOpen={isWishItemBorderColorPickerOpen}
                    onClose={() => setIsWishItemBorderColorPickerOpen(false)}
                    initialColor={props.wishItemBorderColor || '#f3f4f6'}
                    onColorChange={(color: string) => updateProp('wishItemBorderColor', color)}
                  />
                </Box>

                {/* Wish Item Border Radius */}
                <Box>
                  <Box className='w-full flex items-center gap-2'>
                    <Tooltip content="Bo góc lời chúc" positioning={{ placement: "top" }}>
                      <Box className='flex items-center gap-2'>
                        <Text fontSize="xs" display="flex" alignItems="center">
                          <TbRadiusTopLeft />
                        </Text>
                        <DraggableNumberInput
                          value={props.wishItemBorderRadius?.[0] || 0}
                          onChange={(value) => {
                            const newBorderRadius = [...props.wishItemBorderRadius];
                            newBorderRadius[0] = value;
                            newBorderRadius[1] = value;
                            newBorderRadius[2] = value;
                            newBorderRadius[3] = value;
                            updateProp('wishItemBorderRadius', newBorderRadius);
                          }}
                          min={0}
                          max={50}
                        />
                      </Box>
                    </Tooltip>
                    <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                      <Box className='cursor-pointer' onClick={() => setIsWishItemBorderRadiusAdvancedOpen((prev) => !prev)}>
                        <CiSettings />
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box className={`${isWishItemBorderRadiusAdvancedOpen ? 'block' : 'hidden'}`}>
                    <Stack direction="row" gap={2}>
                      {/* Top Left */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Top Left" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusTopLeft />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.wishItemBorderRadius?.[0] || 0}
                          onChange={(value) => handleWishItemBorderRadiusChange(0, value)}
                          min={0}
                          max={50}
                        />
                      </Box>
                      {/* Top Right */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Top Right" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusTopRight />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.wishItemBorderRadius?.[1] || 0}
                          onChange={(value) => handleWishItemBorderRadiusChange(1, value)}
                          min={0}
                          max={50}
                        />
                      </Box>
                      {/* Bottom Right */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Bottom Right" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusBottomRight />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.wishItemBorderRadius?.[2] || 0}
                          onChange={(value) => handleWishItemBorderRadiusChange(2, value)}
                          min={0}
                          max={50}
                        />
                      </Box>
                      {/* Bottom Left */}
                      <Box className='flex flex-col gap-1'>
                        <Tooltip content="Bottom Left" positioning={{ placement: "top" }}>
                          <Text fontSize="xs" display="flex" alignItems="center" justifyContent="center">
                            <TbRadiusBottomLeft />
                          </Text>
                        </Tooltip>
                        <DraggableNumberInput
                          value={props.wishItemBorderRadius?.[3] || 0}
                          onChange={(value) => handleWishItemBorderRadiusChange(3, value)}
                          min={0}
                          max={50}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="event" className="p-4">
          <Stack>
            <EventManager
              events={currentEvents}
              onEventsChange={handleEventsChange}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="animation" className="p-4">
          <Stack>
            <AnimationManager
              displayAnimation={currentDisplayAnimation}
              onDisplayAnimationChange={handleDisplayAnimationChange}
              hoverAnimation={currentHoverAnimation}
              onHoverAnimationChange={handleHoverAnimationChange}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="advanced" className="p-4">
          <Stack gap={4}>
            {/* Pin Element Section */}
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
