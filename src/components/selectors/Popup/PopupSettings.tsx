import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { FileType } from '@/features/files/fileAPI';
import { advancedBackgroundSizeOptions, backgroundPositionOptions, backgroundRepeatOptions, backgroundTypeOptions, blendModeOptions, borderStyleOptions, gradientTemplates, gradientTypeOptions, overlayTypeOptions, shadowTypeOptions, } from '@/utils/settingProfile';
import {
  Box,
  Button,
  Combobox,
  Grid,
  HStack,
  Input,
  Portal,
  Stack,
  Tabs,
  Text,
  useFilter,
  useListCollection
} from '@chakra-ui/react';
import { useNode } from '@craftjs/core';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CgBorderBottom, CgBorderLeft, CgBorderRight, CgBorderTop } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import { FaLock, FaUnlock } from 'react-icons/fa';
import { GiCube, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { MdKeyboardArrowDown, MdRotate90DegreesCcw, MdRotate90DegreesCw } from "react-icons/md";
import { RiDragMoveLine } from 'react-icons/ri';
import { TbRadiusBottomLeft, TbRadiusBottomRight, TbRadiusTopLeft, TbRadiusTopRight } from "react-icons/tb";
import { PopupProps } from '.';
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings } from '../../editor/components/AnimationManager';
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { EventItem, EventManager } from '../../editor/components/EventManager';
import { PinningManager, PinningSettings } from '../../editor/components/PinningManager';
import {
  MenuContent,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuRoot,
  MenuTrigger
} from '../../ui/menu';
import { Tooltip } from '../../ui/tooltip';

export const PopupSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as PopupProps
  }));

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection: bgPositionCollection, filter: filterBgPosition } = useListCollection({
    initialItems: backgroundPositionOptions, // Assuming backgroundPositionOptions is an array of { label: string, value: string }
    filter: contains,
  });
  // State for color pickers
  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);
  const [isBorderColorPickerOpen, setIsBorderColorPickerOpen] = useState(false);
  const [isShadowColorPickerOpen, setIsShadowColorPickerOpen] = useState(false);
  const [isOverlayColorPickerOpen, setIsOverlayColorPickerOpen] = useState(false);
  const [isOverlayGradientColor1PickerOpen, setIsOverlayGradientColor1PickerOpen] = useState(false);
  const [isOverlayGradientColor2PickerOpen, setIsOverlayGradientColor2PickerOpen] = useState(false);
  const [isBorderWidthAdvancedOpen, setIsBorderWidthAdvancedOpen] = useState(false);
  const [isBorderRadiusAdvancedOpen, setIsBorderRadiusAdvancedOpen] = useState(false);
  const [currentBgSizeSetting, setCurrentBgSizeSetting] = useState('auto');
  const [customBgWidth, setCustomBgWidth] = useState('100%');
  const [customBgHeight, setCustomBgHeight] = useState('auto');
  const [settingType, setSettingType] = useState('default');
  const [bgPositionInput, setBgPositionInput] = useState(props.backgroundPosition || 'center center');

  const { showFileSelectModal } = useViewport();
  const updateProp = (key: keyof PopupProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };
  // Event management functions
  const handleEventsChange = (newEvents: EventItem[]) => {
    updateProp('events', newEvents);
  };

  // Initialize events array if not present
  const currentEvents = props.events || [];
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

  // Parse string values to numbers for width and height
  const parseNumericValue = (value: string): number => {
    if (!value) return 100;
    const numValue = parseInt(value);
    return isNaN(numValue) ? 100 : numValue;
  };

  const handleWidthChange = (newWidthValue: number) => {
    if (props.lockAspectRatio) {
      const currentW = parseNumericValue(props.width);
      const currentH = parseNumericValue(props.height);

      if (currentW > 0 && currentH > 0) {
        const aspectRatio = currentH / currentW;
        const newHeightValue = Math.round(newWidthValue * aspectRatio);
        setProp((prop: any) => {
          prop.width = `${newWidthValue}px`;
          prop.height = `${Math.max(1, newHeightValue)}px`;
        });
        return;
      }
    }
    updateProp('width', `${newWidthValue}px`);
  };

  const handleHeightChange = (newHeightValue: number) => {
    if (props.lockAspectRatio) {
      const currentW = parseNumericValue(props.width);
      const currentH = parseNumericValue(props.height);

      if (currentW > 0 && currentH > 0) {
        const aspectRatio = currentW / currentH;
        const newWidthValue = Math.round(newHeightValue * aspectRatio);
        setProp((prop: any) => {
          prop.height = `${newHeightValue}px`;
          prop.width = `${Math.max(1, newWidthValue)}px`;
        });
        return;
      }
    }
    updateProp('height', `${newHeightValue}px`);
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

  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'popupsetting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
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
          <Stack >
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
                  p={2} // Added padding for better clickability
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {props.lockAspectRatio ? <FaLock size={14} /> : <FaUnlock size={14} />}
                </Box>
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={3}>Tự động mở</Text>
              <Stack gap={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Text fontSize="xs">Bật tự động mở</Text>
                  <Button
                    size="xs"
                    variant={props.autoOpen ? 'solid' : 'outline'}
                    colorScheme={props.autoOpen ? 'blue' : 'gray'}
                    onClick={() => updateProp('autoOpen', !props.autoOpen)}
                  >
                    {props.autoOpen ? 'Bật' : 'Tắt'}
                  </Button>
                </Stack>

                {props.autoOpen && (
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Text fontSize="xs">Độ trễ (giây)</Text>
                    <Box display="flex" alignItems="center" gap={2}>
                      <DraggableNumberInput
                        value={props.autoOpenDelay || 3}
                        onChange={(value) => updateProp('autoOpenDelay', Math.max(0.1, value))}
                        min={0.1}
                        max={60}
                        step={0.1}
                      />
                    </Box>
                  </Stack>
                )}
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

            {/* Border Settings Section */}
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

            {/* Filter Settings Section */}
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

            {/* Transform Settings Section */}
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

            {/* Overlay Settings Section */}
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
