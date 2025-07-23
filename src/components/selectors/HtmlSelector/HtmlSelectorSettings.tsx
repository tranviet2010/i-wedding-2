import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import {
  Box,
  Button,
  Grid,
  HStack,
  Input,
  Stack,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { FaLock, FaUnlock, FaCode } from 'react-icons/fa';
import { DisplayAnimationItem, HoverAnimationSettings } from '@/components/editor/components/AnimationManager';
import { EventItem } from '@/components/editor/components/EventManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { AnimationManager } from '@/components/editor/components/AnimationManager';
import { PinningManager } from '@/components/editor/components/PinningManager';
import { DraggableNumberInput } from '@/components/editor/components/DraggableNumberInput';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Tooltip } from '@/components/ui/tooltip';
import { MdRotate90DegreesCcw, MdRotate90DegreesCw } from 'react-icons/md';
import { GiCube, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { RiDragMoveLine } from 'react-icons/ri';
import CrossPlatformSyncToggle from '@/components/editor/components/CrossPlatformSyncToggle';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';

const blendModeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' }
];

interface HtmlSelectorProps {
  width: string;
  height: string;
  lockAspectRatio: boolean;
  htmlContent: string;

  // Filter properties
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  invert: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  opacity: number;
  blendMode: string;

  // Transform properties
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  skewX: number;
  skewY: number;
  perspective: number;

  // Standard component properties
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden: boolean;
}

export const HtmlSelectorSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as HtmlSelectorProps
  }));

  const { showHtmlEditorModal } = useViewport();
  const [settingType, setSettingType] = useState<string>('design');

  const updateProp = (key: keyof HtmlSelectorProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleWidthChange = (value: number) => {
    updateProp('width', `${value}px`);
  };

  const handleHeightChange = (value: number) => {
    updateProp('height', `${value}px`);
  };



  const handleDisplayAnimationChange = (animation: DisplayAnimationItem | null) => {
    updateProp('displayAnimation', animation);
  };

  const handleHoverAnimationChange = (animation: HoverAnimationSettings) => {
    updateProp('hoverAnimation', animation);
  };

  const handlePinningChange = (pinning: PinningSettings) => {
    updateProp('pinning', pinning);
  };

  const openHtmlEditor = () => {
    console.log('Opening HTML editor with current content:', props.htmlContent);
    showHtmlEditorModal(props.htmlContent || '', (newHtml: string) => {
      console.log('HTML editor onSave called with:', newHtml);
      console.log('Previous htmlContent was:', props.htmlContent);
      updateProp('htmlContent', newHtml);
      console.log('updateProp called for htmlContent');
    });
  };

  return (
    <Box className='w-full h-full'>
      <Tabs.Root value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="design" className='!text-xs'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="effects" className='!text-xs'>
            Hiệu ứng
          </Tabs.Trigger>
          <Tabs.Trigger value="advanced" className='!text-xs'>
            Nâng cao
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="design">
          <Stack gap={4}>
            {/* Size Settings */}
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
                  color={props.lockAspectRatio ? 'blue.500' : 'gray.400'}
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

            {/* HTML Content Editor */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Nội dung HTML</Text>
              <Button
                onClick={openHtmlEditor}
                size="sm"
                colorScheme="blue"
                variant="outline"
                width="100%"
              >
                <FaCode style={{ marginRight: '8px' }} />
                Chỉnh sửa HTML
              </Button>
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

          </Stack>
        </Tabs.Content>

        <Tabs.Content value="effects" className="p-4">
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
