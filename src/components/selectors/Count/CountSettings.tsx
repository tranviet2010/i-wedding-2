import {
  Box,
  Button,
  Combobox,
  Grid,
  HStack,
  Input,
  Portal,
  Stack,
  Switch,
  Tabs,
  Text,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { useNode } from '@craftjs/core';
import { useEffect, useState } from 'react';
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import { RiDragMoveLine, RiLetterSpacing2, RiLineHeight2 } from "react-icons/ri";
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { StyledFontSelector } from '../../editor/components/StyledFontSelector';

import { advancedBackgroundSizeOptions, backgroundPositionOptions, backgroundRepeatOptions, backgroundTypeOptions, blendModeOptions, borderStyleOptions, fonts, gradientTemplates, gradientTypeOptions, shadowTypeOptions, textTransformOptions } from '@/utils/settingProfile';
import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CgBorderBottom, CgBorderLeft, CgBorderRight, CgBorderTop } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import { GiCube, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { HiBold, HiItalic, HiStrikethrough, HiUnderline } from 'react-icons/hi2';
import { MdKeyboardArrowDown, MdRotate90DegreesCcw, MdRotate90DegreesCw } from 'react-icons/md';
import { RxLetterCaseUppercase } from 'react-icons/rx';
import { TbRadiusBottomLeft, TbRadiusBottomRight, TbRadiusTopLeft, TbRadiusTopRight } from "react-icons/tb";
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings } from '../../editor/components/AnimationManager';
import { EventItem, EventManager } from '../../editor/components/EventManager';
import { PinningManager, PinningSettings } from '../../editor/components/PinningManager';
import {
  MenuContent,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuRoot,
  MenuTrigger
} from '../../ui/menu';
import { Tooltip } from '@/components/ui/tooltip';
import { FileType } from '@/features/files/fileAPI';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import CrossPlatformSyncToggle from '@/components/editor/components/CrossPlatformSyncToggle';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';

export interface CountProps {
  // Countdown settings
  countType: 'minutes' | 'endTime'; // Kiểu
  countMode: 'countdown' | 'countup'; // Loại
  minutes: number; // Phút (when countType is 'minutes')
  endTime: string; // Thời gian kết thúc (when countType is 'endTime')
  autoSwitchToCountUp: boolean; // Auto switch to count up when countdown reaches zero

  // Display options
  showDays: boolean; // Hiện ngày
  showHours: boolean; // Hiện giờ
  showMinutes: boolean; // Hiện phút
  showSeconds: boolean; // Hiện giây
  spacing: number; // Khoảng cách ô chữ (in px)

  fontSize: string;
  textAlign: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  shadow: number;
  text: string;
  enabled: boolean;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
  textDecoration: string;
  width: string;
  opacity: number;
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  blendMode: string;
  contrast: number;
  brightness: number;
  saturate: number;
  grayscale: number;
  invert: number;
  sepia: number;
  hueRotate: number;
  position: string;
  top: number;
  left: number;
  radius: number;
  borderRadius: number[];
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;
  shadowType: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;

  // Standard selector properties
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden: boolean;

}
export const CountSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as CountProps
  }));
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection: bgPositionCollection, filter: filterBgPosition } = useListCollection({
    initialItems: backgroundPositionOptions, // Assuming backgroundPositionOptions is an array of { label: string, value: string }
    filter: contains,
  });

  const [settingType, setSettingType] = useState<'default' | 'event' | 'animation' | 'advanced'>('default');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);
  const [isBorderColorPickerOpen, setIsBorderColorPickerOpen] = useState(false);
  const [isShadowColorPickerOpen, setIsShadowColorPickerOpen] = useState(false);
  const [isBorderWidthAdvancedOpen, setIsBorderWidthAdvancedOpen] = useState(false);
  const [isBorderRadiusAdvancedOpen, setIsBorderRadiusAdvancedOpen] = useState(false);
  const [currentBgSizeSetting, setCurrentBgSizeSetting] = useState('auto');
  const [customBgWidth, setCustomBgWidth] = useState('100%');
  const [customBgHeight, setCustomBgHeight] = useState('auto');
  const [bgPositionInput, setBgPositionInput] = useState(props.backgroundPosition || 'center center');
  const updateProp = (key: keyof CountProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  // Event handlers
  const handleEventsChange = (events: any[]) => {
    updateProp('events', events);
  };

  const handleDisplayAnimationChange = (animation: any) => {
    updateProp('displayAnimation', animation);
  };

  const handleHoverAnimationChange = (animation: any) => {
    updateProp('hoverAnimation', animation);
  };

  const handlePinningChange = (pinning: any) => {
    updateProp('pinning', pinning);
  };
  const textColor = props.color || '#000000';


  // Format datetime for input
  const formatDateTimeForInput = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Parse datetime from input
  const parseDateTimeFromInput = (value: string): string => {
    return new Date(value).toISOString();
  };


  // Handle background type change
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

  // Apply gradient template
  const applyGradientTemplate = (colors: string[]) => {
    updateProp('gradientColor1', colors[0]);
    updateProp('gradientColor2', colors[1]);
  };

  // Handle border radius changes
  const handleBorderRadiusChange = (value: number) => {
    // Update all corners with the same value
    updateProp('borderRadius', [value, value, value, value]);

    // Also update the legacy radius property for compatibility
    updateProp('radius', value);
  };

  // Handle individual border radius corner changes
  const handleCornerRadiusChange = (index: number, value: number) => {
    const newBorderRadius = [...(props.borderRadius || [0, 0, 0, 0])];
    newBorderRadius[index] = value;
    updateProp('borderRadius', newBorderRadius);

    // If all corners have the same value, update the legacy radius property too
    if (newBorderRadius.every(r => r === newBorderRadius[0])) {
      updateProp('radius', newBorderRadius[0]);
    } else {
      // If corners have different values, set legacy radius to the first corner's value
      // This is a compromise for compatibility
      updateProp('radius', newBorderRadius[0]);
    }
  };

  // Handle border width changes
  const handleBorderWidthChange = (value: number) => {
    // Update all sides with the same value
    updateProp('borderWidth', [value, value, value, value]);
  };

  // Handle individual border width side changes
  const handleSideBorderWidthChange = (index: number, value: number) => {
    const newBorderWidth = [...(props.borderWidth || [0, 0, 0, 0])];
    newBorderWidth[index] = value;
    updateProp('borderWidth', newBorderWidth);
  };

  const { showFileSelectModal } = useViewport();

  return (
    <Box className='w-full h-full'>
      <Tabs.Root value={settingType} onValueChange={(e) => setSettingType(e.value as any)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-sm'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="event" className='!text-sm'>
            Sự kiện
          </Tabs.Trigger>
          <Tabs.Trigger value="animation" className='!text-sm'>
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
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Cấu hình đếm ngược</Text>

              {/* Count Type */}
              <Box className='w-full flex flex-col gap-2 mb-3'>
                <Text fontSize="xs">Kiểu</Text>
                <select
                  value={props.countType}
                  onChange={(e) => {
                    const newCountType = e.target.value;
                    updateProp('countType', newCountType);

                    // If switching to endTime and current mode is countup, change to countdown
                    if (newCountType === 'endTime' && props.countMode === 'countup') {
                      updateProp('countMode', 'countdown');
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="minutes">Phút</option>
                  <option value="endTime">Thời gian kết thúc</option>
                </select>
              </Box>

              {/* Count Mode */}
              <Box className='w-full flex flex-col gap-2 mb-3'>
                <Text fontSize="xs">Loại</Text>
                <select
                  value={props.countMode}
                  onChange={(e) => updateProp('countMode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="countdown">Count down</option>
                  {props.countType === 'minutes' && (
                    <option value="countup">Count up</option>
                  )}
                </select>
              </Box>

              {/* Minutes or End Time */}
              {props.countType === 'minutes' ? (
                <Box className='w-full flex flex-col gap-2 mb-3'>
                  <Text fontSize="xs">Phút</Text>
                  <DraggableNumberInput
                    value={props.minutes}
                    onChange={(value) => updateProp('minutes', value)}
                    min={1}
                    max={1440} // 24 hours
                  />
                </Box>
              ) : (
                <Box className='w-full flex flex-col gap-2 mb-3'>
                  <Text fontSize="xs">Thời gian kết thúc</Text>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(props.endTime)}
                    onChange={(e) => updateProp('endTime', parseDateTimeFromInput(e.target.value))}
                    size="sm"
                  />
                </Box>
              )}

              {/* Auto Switch to Count Up - only show for countdown mode */}
              {props.countMode === 'countdown' && (
                <Box className='w-full flex items-center justify-between gap-2 mb-3'>
                  <Text fontSize="xs">Tự động chuyển sang đếm lên khi hết thời gian</Text>
                  <Switch.Root
                    checked={props.autoSwitchToCountUp}
                    onCheckedChange={(e) => updateProp('autoSwitchToCountUp', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </Box>
              )}

              {/* Display Options */}
              <Text fontSize="xs" mb={2}>Hiển thị</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                <HStack>
                  <Switch.Root
                    checked={props.showDays}
                    onCheckedChange={(e) => updateProp('showDays', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                  <Text fontSize="xs">Hiện ngày</Text>
                </HStack>
                <HStack>
                  <Switch.Root
                    checked={props.showHours}
                    onCheckedChange={(e) => updateProp('showHours', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                  <Text fontSize="xs">Hiện giờ</Text>
                </HStack>
                <HStack>
                  <Switch.Root
                    checked={props.showMinutes}
                    onCheckedChange={(e) => updateProp('showMinutes', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                  <Text fontSize="xs">Hiện phút</Text>
                </HStack>
                <HStack>
                  <Switch.Root
                    checked={props.showSeconds}
                    onCheckedChange={(e) => updateProp('showSeconds', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                  <Text fontSize="xs">Hiện giây</Text>
                </HStack>
              </Grid>

              {/* Spacing */}
              <Box className='w-full flex flex-col gap-2 mt-3'>
                <Text fontSize="xs">Khoảng cách giữa các ô (px)</Text>
                <DraggableNumberInput
                  value={props.spacing}
                  onChange={(value) => updateProp('spacing', value)}
                  min={0}
                  max={50}
                />
              </Box>
            </Box>
            {/* Typography Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Thiết lập chữ</Text>
              <Stack gap={3}>
                {/* Font Size */}
                <HStack gap={2}>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Font chữ</Text>
                    <StyledFontSelector
                      value={props.fontFamily}
                      options={fonts}
                      onChange={(value) => {
                        updateProp('fontFamily', value)
                      }}
                      className='w-full'
                    />
                  </Box>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Cỡ chữ</Text>
                    <DraggableNumberInput
                      value={parseInt(props.fontSize)}
                      onChange={(value) => updateProp('fontSize', `${value}`)}
                      min={8}
                      max={200}
                    />
                  </Box>
                </HStack>

                <Box className='w-full flex items-center justify-between gap-1'>
                  <Tooltip content="In đậm">
                    <div
                      className='cursor-pointer'
                      onClick={() => updateProp('fontWeight', props.fontWeight === 'bold' ? 'normal' : 'bold')}
                    >
                      <HiBold color={props.fontWeight === 'bold' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="In nghiêng">
                    <div
                      className='text-center gap-2 cursor-pointer'
                      onClick={() => updateProp('fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic')}
                    >
                      <HiItalic color={props.fontStyle === 'italic' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Gạch chân">
                    <div
                      className='cursor-pointer'
                      onClick={() => updateProp('textDecoration', props.textDecoration === 'underline' ? 'none' : 'underline')}
                    >
                      <HiUnderline color={props.textDecoration === 'underline' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Gạch ngang">
                    <div
                      className='cursor-pointer'
                      onClick={() => updateProp('textDecoration', props.textDecoration === 'line-through' ? 'none' : 'line-through')}
                    >
                      <HiStrikethrough color={props.textDecoration === 'line-through' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Chữ hoa">
                    <div
                      className='cursor-pointer'
                      onClick={() => updateProp('textTransform', props.textTransform === 'uppercase' ? 'none' : 'uppercase')}
                    >
                      <RxLetterCaseUppercase color={props.textTransform === 'uppercase' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                </Box>



                {/* Text Align */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Tooltip content="Căn trái">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'left')}
                    >
                      <FaAlignLeft color={props.textAlign === 'left' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Căn giữa">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'center')}
                    >
                      <FaAlignCenter color={props.textAlign === 'center' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Căn phải">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'right')}
                    >
                      <FaAlignRight color={props.textAlign === 'right' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Căn đều">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'justify')}
                    >
                      <FaAlignJustify color={props.textAlign === 'justify' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Box
                    display="flex"
                    alignItems="center"
                    borderRadius="md"
                    p={2}
                    cursor="pointer"
                    onClick={() => setIsColorPickerOpen(true)}
                  >
                    <Box
                      width="24px"
                      height="24px"
                      borderRadius="md"
                      backgroundColor={textColor}
                      mr={2}
                      border="1px solid"
                      borderColor="gray.200"
                    />
                  </Box>
                  <ColorPickerModal
                    isOpen={isColorPickerOpen}
                    onClose={() => setIsColorPickerOpen(false)}
                    onColorChange={(color) => updateProp('color', color)}
                    initialColor={textColor}
                  />
                </Box>

                <HStack gap={2}>
                  <Tooltip content="Khoảng cách dòng">
                    <Box className='flex items-center justify-between gap-2'>
                      <RiLineHeight2 />
                      <DraggableNumberInput
                        value={parseFloat(props.lineHeight)}
                        onChange={(value) => updateProp('lineHeight', `${value}`)}
                        min={0.5}
                        max={3}
                        step={0.1}
                      />
                    </Box>
                  </Tooltip>
                  <Tooltip content="Khoảng cách chữ">
                    <Box className='flex items-center justify-between gap-2'>
                      <RiLetterSpacing2 />
                      <DraggableNumberInput
                        value={parseInt(props.letterSpacing)}
                        onChange={(value) => updateProp('letterSpacing', `${value}px`)}
                        min={-10}
                        max={50}
                      />
                    </Box>
                  </Tooltip>
                </HStack>

                {/* Text Transform */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Text Transform</Text>
                  <select
                    value={props.textTransform}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('textTransform', e.target.value)}
                    className='rounded-md p-2 text-sm w-[50%]'
                  >
                    {textTransformOptions.map((transform) => (
                      <option key={transform.value} value={transform.value}>
                        {transform.label}
                      </option>
                    ))}
                  </select>
                </Box>
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Màu & Hình nền</Text>
              <Stack gap="3" mt={2}>
                <Box className='w-full flex items-center justify-between'>
                  <Text fontSize="xs" >Loại nền</Text>
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
                </Box>

                {/* Solid Color Background */}
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
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Viền & Bo góc</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between'>
                  <Text fontSize="xs" >Kiểu viền</Text>
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
                    <Text fontSize="xs" >Màu viền</Text>
                    <Box
                      display="flex"
                      alignItems="center"
                      borderRadius="md"
                      p={2}
                      cursor="pointer"
                      onClick={() => setIsBorderColorPickerOpen(true)}
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
                      isOpen={isBorderColorPickerOpen}
                      onClose={() => setIsBorderColorPickerOpen(false)}
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
                            onChange={handleBorderWidthChange}
                            min={0}
                            max={20}
                          />
                        </Box>
                      </Tooltip>
                      <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                        <Box className='cursor-pointer' onClick={() => setIsBorderWidthAdvancedOpen((prev) => !prev)}>
                          <CiSettings />
                        </Box>
                      </Tooltip>
                    </Box>
                    <Box className={`${isBorderWidthAdvancedOpen ? 'block' : 'hidden'}`}>
                      <Stack direction="row" gap={2}>
                        {/* Top */}
                        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                          <Text fontSize="10px" textAlign="center" >
                            <CgBorderTop />
                          </Text>
                          <DraggableNumberInput
                            value={props.borderWidth?.[0] || 0}
                            onChange={(value) => handleSideBorderWidthChange(0, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                        {/* Right */}
                        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                          <Text fontSize="10px" textAlign="center" >
                            <CgBorderRight />
                          </Text>
                          <DraggableNumberInput
                            value={props.borderWidth?.[1] || 0}
                            onChange={(value) => handleSideBorderWidthChange(1, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                        {/* Bottom */}
                        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                          <Text fontSize="10px" textAlign="center" >
                            <CgBorderBottom />
                          </Text>
                          <DraggableNumberInput
                            value={props.borderWidth?.[2] || 0}
                            onChange={(value) => handleSideBorderWidthChange(2, value)}
                            min={0}
                            max={20}
                          />
                        </Box>
                        {/* Left */}
                        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                          <Text fontSize="10px" textAlign="center" >
                            <CgBorderLeft />
                          </Text>
                          <DraggableNumberInput
                            value={props.borderWidth?.[3] || 0}
                            onChange={(value) => handleSideBorderWidthChange(3, value)}
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
                          onChange={handleBorderRadiusChange}
                          min={0}
                        />
                      </Box>
                    </Tooltip>
                    <Tooltip content="Nâng cao" positioning={{ placement: "top" }}>
                      <Box className='cursor-pointer' onClick={() => setIsBorderRadiusAdvancedOpen((prev) => !prev)}>
                        <CiSettings />
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box className={`${isBorderRadiusAdvancedOpen ? 'block' : 'hidden'}`}>
                    <Stack direction="row" gap={2}>
                      {/* Top Left */}
                      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="10px" textAlign="center" >
                          <TbRadiusTopLeft />
                        </Text>
                        <DraggableNumberInput
                          value={props.borderRadius?.[0] || 0}
                          onChange={(value) => handleCornerRadiusChange(0, value)}
                          min={0}
                        />
                      </Box>
                      {/* Top Right */}
                      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="10px" textAlign="center" >
                          <TbRadiusTopRight />
                        </Text>
                        <DraggableNumberInput
                          value={props.borderRadius?.[1] || 0}
                          onChange={(value) => handleCornerRadiusChange(1, value)}
                          min={0}
                        />
                      </Box>
                      {/* Bottom Right */}
                      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="10px" textAlign="center" >
                          <TbRadiusBottomRight />
                        </Text>
                        <DraggableNumberInput
                          value={props.borderRadius?.[2] || 0}
                          onChange={(value) => handleCornerRadiusChange(2, value)}
                          min={0}
                        />
                      </Box>
                      {/* Bottom Left */}
                      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="10px" textAlign="center" >
                          <TbRadiusBottomLeft />
                        </Text>
                        <DraggableNumberInput
                          value={props.borderRadius?.[3] || 0}
                          onChange={(value) => handleCornerRadiusChange(3, value)}
                          min={0}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Box>
            {/* Shadow Settings Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Đổ bóng</Text>
              <Stack gap={3}>
                {/* Shadow Type */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Kiểu đổ bóng</Text>
                  <select
                    className="w-[50%] p-2 rounded-md text-sm"
                    value={props.shadowType || 'none'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateProp('shadowType', e.target.value);
                    }}
                  >
                    {shadowTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>

                {/* Shadow Presets */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Presets</Text>
                  <HStack>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('shadowX', 27);
                        updateProp('shadowY', 15);
                        updateProp('shadowBlur', 20);
                        updateProp('shadowSpread', -15);
                        updateProp('shadowColor', '#000000');
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Soft Drop
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('shadowX', 0);
                        updateProp('shadowY', 5);
                        updateProp('shadowBlur', 15);
                        updateProp('shadowSpread', 0);
                        updateProp('shadowColor', 'rgba(0,0,0,0.3)');
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Subtle
                    </Button>
                  </HStack>
                </Box>
                <Box className='w-full flex justify-between gap-2'>
                  <Box className='w-full flex flex-col justify-between gap-2'>
                    <Box className='w-full flex items-center gap-2'>
                      <Text fontSize="xs" display="flex" alignItems="center">
                        X
                      </Text>
                      <DraggableNumberInput
                        value={props.shadowX || 0}
                        onChange={(value) => updateProp('shadowX', value)}
                        min={-50}
                        max={50}
                      />
                    </Box>

                    {/* Y Offset */}
                    <Box className='w-full flex items-center gap-2'>
                      <Text fontSize="xs" display="flex" alignItems="center">
                        Y
                      </Text>
                      <DraggableNumberInput
                        value={props.shadowY || 0}
                        onChange={(value) => updateProp('shadowY', value)}
                        min={-50}
                        max={50}
                      />
                    </Box>
                  </Box>

                  <Box className='w-full flex flex-col justify-between gap-2'>
                    <Box className='w-full flex items-center  gap-2'>
                      <Text fontSize="xs" display="flex" alignItems="center">
                        Độ mờ
                      </Text>
                      <DraggableNumberInput
                        value={props.shadowBlur || 0}
                        onChange={(value) => updateProp('shadowBlur', value)}
                        min={0}
                        max={100}
                      />
                    </Box>

                    {/* Spread (not shown for filter type) */}
                    {props.shadowType !== 'filter' && (
                      <Box className='w-full flex items-center gap-2'>
                        <Text fontSize="xs" display="flex" alignItems="center">
                          Độ tối
                        </Text>
                        <DraggableNumberInput
                          value={props.shadowSpread || 0}
                          onChange={(value) => updateProp('shadowSpread', value)}
                          min={-20}
                          max={100}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Shadow Color */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box
                    display="flex"
                    alignItems="center"
                    borderRadius="md"
                    p={2}
                    cursor="pointer"
                    onClick={() => setIsShadowColorPickerOpen(true)}
                  >
                    <Box
                      width="24px"
                      height="24px"
                      borderRadius="md"
                      backgroundColor={props.shadowColor || 'rgba(0, 0, 0, 0.2)'}
                      mr={2}
                      border="1px solid"
                      borderColor="gray.200"
                    />
                    <Text fontSize="xs">{props.shadowColor || 'rgba(0, 0, 0, 0.2)'}</Text>
                  </Box>
                  <ColorPickerModal
                    isOpen={isShadowColorPickerOpen}
                    onClose={() => setIsShadowColorPickerOpen(false)}
                    onColorChange={(color) => updateProp('shadowColor', color)}
                    initialColor={props.shadowColor || 'rgba(0, 0, 0, 0.2)'}
                  />
                </Box>
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Filter</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Blend Mode</Text>
                  <select
                    className="w-[50%] p-2 rounded-md text-sm"
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
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex  justify-between items-center gap-2'>
                    <Text fontSize="xs">Tương phản</Text>
                    <DraggableNumberInput
                      value={props.contrast || 100}
                      onChange={(value) => updateProp('contrast', value)}
                      min={0}
                      max={200}
                    />
                  </Box>
                  <Box className='w-full  flex   justify-between items-center gap-2'>
                    <Text fontSize="xs" >Độ sáng</Text>
                    <DraggableNumberInput
                      value={props.brightness || 100}
                      onChange={(value) => updateProp('brightness', value)}
                      min={0}
                      max={200}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Hòa màu</Text>
                    <DraggableNumberInput
                      value={props.saturate || 100}
                      onChange={(value) => updateProp('saturate', value)}
                      min={0}
                      max={200}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Trắng đen</Text>
                    <DraggableNumberInput
                      value={props.grayscale || 0}
                      onChange={(value) => updateProp('grayscale', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Độ mờ</Text>
                    <DraggableNumberInput
                      value={props.opacity || 100}
                      onChange={(value) => updateProp('opacity', value)}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Đảo ngược</Text>
                    <DraggableNumberInput
                      value={props.invert || 0}
                      onChange={(value) => updateProp('invert', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Sepia</Text>
                    <DraggableNumberInput
                      value={props.sepia || 0}
                      onChange={(value) => updateProp('sepia', value)}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Xoay màu</Text>
                    <DraggableNumberInput
                      value={props.hueRotate || 0}
                      onChange={(value) => updateProp('hueRotate', value)}
                      min={0}
                      max={360}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Transform Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Transform</Text>
              <Stack gap={3}>
                {/* Transform Origin */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Điểm gốc</Text>
                  <select
                    className="w-[50%] p-2 rounded-md text-sm"
                    value={props.transformOrigin || 'center center'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateProp('transformOrigin', e.target.value);
                    }}
                  >
                    <option value="center center">Giữa</option>
                    <option value="top left">Trên trái</option>
                    <option value="top center">Trên giữa</option>
                    <option value="top right">Trên phải</option>
                    <option value="center left">Giữa trái</option>
                    <option value="center right">Giữa phải</option>
                    <option value="bottom left">Dưới trái</option>
                    <option value="bottom center">Dưới giữa</option>
                    <option value="bottom right">Dưới phải</option>
                  </select>
                </Box>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs">Trong suốt</Text>
                  <Box width="60%">
                    <DraggableNumberInput
                      value={props.opacity || 100}
                      onChange={(value: number) => updateProp('opacity', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </HStack>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {/* Rotation */}
                  <Tooltip content="Xoay đều">
                    <Box className='flex items-center gap-2'>
                      <AiOutlineLoading3Quarters />
                      <DraggableNumberInput
                        value={props.rotate || 0}
                        onChange={(value) => updateProp('rotate', value)}
                        min={-360}
                        max={360}
                      />
                    </Box>
                  </Tooltip>

                  {/* Rotate X */}
                  <Tooltip content="Xoay ngang">
                    <Box className='flex items-center gap-2'>
                      <MdRotate90DegreesCw />
                      <DraggableNumberInput
                        value={props.rotateX || 0}
                        onChange={(value) => updateProp('rotateX', value)}
                        min={-360}
                        max={360}
                      />
                    </Box>
                  </Tooltip>

                  {/* Rotate Y */}
                  <Tooltip content="Xoay dọc">
                    <Box className='flex items-center gap-2'>
                      <MdRotate90DegreesCcw />
                      <DraggableNumberInput
                        value={props.rotateY || 0}
                        onChange={(value) => updateProp('rotateY', value)}
                        min={-360}
                        max={360}
                      />
                    </Box>
                  </Tooltip>

                  {/* Skew X */}
                  <Tooltip content="Nghiêng ngang">
                    <Box className='flex items-center gap-2'>
                      <GiPerspectiveDiceSixFacesRandom />
                      <DraggableNumberInput
                        value={props.skewX || 0}
                        onChange={(value) => updateProp('skewX', value)}
                        min={-89}
                        max={89}
                      />
                    </Box>
                  </Tooltip>

                  {/* Skew Y */}
                  <Tooltip content="Nghiêng dọc">
                    <Box className='flex items-center gap-2'>
                      <RiDragMoveLine />
                      <DraggableNumberInput
                        value={props.skewY || 0}
                        onChange={(value) => updateProp('skewY', value)}
                        min={-89}
                        max={89}
                      />
                    </Box>
                  </Tooltip>

                  {/* Perspective */}
                  <Tooltip content="Chiều sâu 3D">
                    <Box className='flex items-center gap-2'>
                      <GiCube />
                      <DraggableNumberInput
                        value={props.perspective || 0}
                        onChange={(value) => updateProp('perspective', value)}
                        min={0}

                      />
                    </Box>
                  </Tooltip>
                </Grid>

                {/* Transform Presets */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Mẫu có sẵn</Text>
                  <HStack>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('rotate', 0);
                        updateProp('rotateX', 0);
                        updateProp('rotateY', 0);
                        updateProp('skewX', 0);
                        updateProp('skewY', 0);
                        updateProp('perspective', 0);
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Reset
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('rotate', 0);
                        updateProp('rotateX', 15);
                        updateProp('rotateY', 15);
                        updateProp('skewX', 0);
                        updateProp('skewY', 0);
                        updateProp('perspective', 500);
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      3D Card
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('rotate', 0);
                        updateProp('rotateX', 0);
                        updateProp('rotateY', 0);
                        updateProp('skewX', 10);
                        updateProp('skewY', 0);
                        updateProp('perspective', 0);
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Nghiêng
                    </Button>
                  </HStack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="event" className="p-4">
          <Stack>
            <EventManager
              events={props.events}
              onEventsChange={handleEventsChange}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="animation" className="p-4">
          <Stack>
            <AnimationManager
              displayAnimation={props.displayAnimation}
              onDisplayAnimationChange={handleDisplayAnimationChange}
              hoverAnimation={props.hoverAnimation}
              onHoverAnimationChange={handleHoverAnimationChange}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="advanced" className="p-4">
          <Stack gap={4}>
            <CrossPlatformSyncToggle />
            <PinningManager
              pinning={props.pinning}
              onPinningChange={handlePinningChange}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
