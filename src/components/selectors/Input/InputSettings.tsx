import { Tooltip } from '@/components/ui/tooltip';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { CrossPlatformSyncToggle } from '../../editor/components/CrossPlatformSyncToggle';
import { FileType } from '@/features/files/fileAPI';
import {
  backgroundPositionOptions,
  backgroundRepeatOptions,
  backgroundTypeOptions,
  blendModeOptions,
  borderStyleOptions,
  gradientTemplates,
  gradientTypeOptions,
  shadowTypeOptions,
  fonts,
  textTransformOptions
} from '@/utils/settingProfile';
import {
  Box,
  Button,
  Combobox,
  createListCollection,
  Grid,
  HStack,
  Input,
  MenuContent,
  MenuRadioItem,
  MenuRadioItemGroup,
  MenuRoot,
  MenuTrigger,
  Portal,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  useFilter,
  useListCollection
} from '@chakra-ui/react';
import { useNode } from '@craftjs/core';
import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CgBorderBottom, CgBorderLeft, CgBorderRight, CgBorderTop } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight, FaLock, FaUnlock } from 'react-icons/fa';
import { GiCube, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { HiBold, HiItalic, HiStrikethrough, HiUnderline } from "react-icons/hi2";
import { MdKeyboardArrowDown, MdRotate90DegreesCcw, MdRotate90DegreesCw } from 'react-icons/md';
import { RiDragMoveLine, RiLetterSpacing2, RiLineHeight2 } from 'react-icons/ri';
import { RxLetterCaseUppercase } from "react-icons/rx";
import { TbRadiusBottomLeft, TbRadiusBottomRight, TbRadiusTopLeft, TbRadiusTopRight } from "react-icons/tb";
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { StyledFontSelector } from '../../editor/components/StyledFontSelector';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';


export const InputSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection: bgPositionCollection, filter: filterBgPosition } = useListCollection({
    initialItems: backgroundPositionOptions,
    filter: contains,
  });

  const { showFileSelectModal } = useViewport();
  const [settingType, setSettingType] = useState<string>('default');

  // Color picker states
  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);
  const [isBorderColorPickerOpen, setIsBorderColorPickerOpen] = useState(false);
  const [isShadowColorPickerOpen, setIsShadowColorPickerOpen] = useState(false);
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [isTextShadowColorPickerOpen, setIsTextShadowColorPickerOpen] = useState(false);
  const [isTextStrokeColorPickerOpen, setIsTextStrokeColorPickerOpen] = useState(false);

  // Advanced settings states
  const [isBorderWidthAdvancedOpen, setIsBorderWidthAdvancedOpen] = useState(false);
  const [isBorderRadiusAdvancedOpen, setIsBorderRadiusAdvancedOpen] = useState(false);
  const [currentBgSizeSetting, setCurrentBgSizeSetting] = useState('auto');
  const [customBgWidth, setCustomBgWidth] = useState('100%');
  const [customBgHeight, setCustomBgHeight] = useState('auto');
  const [bgPositionInput, setBgPositionInput] = useState(props.backgroundPosition || 'center center');
  const inputTypeOptions = createListCollection({
    items: [
      { label: 'Nhập chữ', value: 'text' },
      { label: 'Mật khẩu', value: 'password' },
      { label: 'Nhập số', value: 'number' },
      { label: 'Nhập Email', value: 'email' },
      { label: 'Nhập điện thoại', value: 'tel' },
      { label: 'Ngày tháng', value: 'date' },
      { label: 'Nhập đoạn văn', value: 'textarea' },
      { label: 'Hộp chọn giá trị', value: 'select' },
      { label: 'Chọn một giá trị', value: 'radio' },
      { label: 'Chọn nhiều giá trị', value: 'checkbox' },
      { label: 'Chọn File', value: 'file' },
    ]
  });



  // Check if current input type requires options
  const requiresOptions = ['select', 'radio', 'checkbox'].includes(props.inputType);

  // Update prop helper
  const updateProp = (key: string, value: any) => {
    setProp((props: any) => {
      props[key] = value;

      // Auto-populate default options when switching to select, radio, or checkbox
      if (key === 'inputType' && ['select', 'radio', 'checkbox'].includes(value) && !props.options) {
        props.options = 'Tùy chọn 1\nTùy chọn 2\nTùy chọn 3';
      }
    }, 500);
  };
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

  // Background helper functions
  const handleBackgroundTypeChange = (newType: string) => {
    updateProp('backgroundType', newType);
  };

  const applyGradientTemplate = (colors: string[]) => {
    updateProp('gradientColor1', colors[0]);
    updateProp('gradientColor2', colors[1]);
  };

  const handleBgPositionChange = (value: string) => {
    setBgPositionInput(value);
    updateProp('backgroundPosition', value);
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

  // Border helper functions
  const handleBorderWidthChange = (value: number) => {
    updateProp('borderWidth', [value, value, value, value]);
  };

  const handleSideBorderWidthChange = (index: number, value: number) => {
    const newBorderWidth = [...(props.borderWidth || [0, 0, 0, 0])];
    newBorderWidth[index] = value;
    updateProp('borderWidth', newBorderWidth);
  };

  const handleBorderRadiusChange = (value: number) => {
    updateProp('borderRadius', [value, value, value, value]);
  };

  const handleCornerRadiusChange = (index: number, value: number) => {
    const newBorderRadius = [...(props.borderRadius || [0, 0, 0, 0])];
    newBorderRadius[index] = value;
    updateProp('borderRadius', newBorderRadius);
  };

  // Text helper functions
  const updateTextShadow = (key: string, value: any) => {
    updateProp('textShadow', { ...props.textShadow, [key]: value });
  };

  const updateTextStroke = (key: string, value: any) => {
    updateProp('textStroke', { ...props.textStroke, [key]: value });
  };

  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'inputsetting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs'>
            Thiết kế
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
            {/* Input Configuration Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Cấu hình Input</Text>
              <Stack gap={3}>
                {/* Input Type */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Kiểu</Text>
                  <Select.Root
                    collection={inputTypeOptions}
                    value={[props.inputType]}
                    onValueChange={(e) => updateProp('inputType', e.value[0])}
                    size="sm"
                    width="50%"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Chọn kiểu" />
                    </Select.Trigger>
                    <Select.Content>
                      {inputTypeOptions.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                {/* Data Name */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Tên lấy dữ liệu</Text>
                  <Input
                    value={props.dataName || ''}
                    onChange={(e) => updateProp('dataName', e.target.value)}
                    placeholder="input_field"
                    size="sm"
                    width="50%"
                  />
                </Box>

                {/* Required Field */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Bắt buộc nhập</Text>
                  <Switch.Root
                    checked={props.required}
                    onCheckedChange={(e) => updateProp('required', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </Box>

                {/* Placeholder */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Chữ gợi nhắc</Text>
                  <Input
                    value={props.placeholder || ''}
                    onChange={(e) => updateProp('placeholder', e.target.value)}
                    placeholder="Nhập nội dung..."
                    size="sm"
                    width="50%"
                  />
                </Box>

                {/* Default Value */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Giá trị mặc định</Text>
                  <Input
                    value={props.defaultValue || ''}
                    onChange={(e) => updateProp('defaultValue', e.target.value)}
                    placeholder=""
                    size="sm"
                    width="50%"
                  />
                </Box>

                {/* Element Position */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Vị trí phần tử</Text>
                  <DraggableNumberInput
                    value={props.elementPosition || 1}
                    onChange={(value) => updateProp('elementPosition', value)}
                    min={1}
                    max={100}
                  />
                </Box>

                {/* Options for select, radio, checkbox */}
                {requiresOptions && (
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Tùy chọn (mỗi dòng một tùy chọn)</Text>
                    <textarea
                      value={props.options || ''}
                      onChange={(e) => updateProp('options', e.target.value)}
                      placeholder="Tùy chọn 1&#10;Tùy chọn 2&#10;Tùy chọn 3"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Box>

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

            {/* Color & Background Section */}
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
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('gradientType', e.target.value)}
                      >
                        {gradientTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </HStack>
                    {props.gradientType === 'linear' && (
                      <HStack alignItems="center">
                        <Text fontSize="xs">Góc</Text>
                        <DraggableNumberInput
                          value={props.gradientAngle || 0}
                          onChange={(val: number) => updateProp('gradientAngle', val)}
                          min={0}
                          max={360}
                        />
                      </HStack>
                    )}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Màu 1</Text>
                      <Button size="xs" variant="outline" onClick={() => setIsGradientColor1PickerOpen(true)}>
                        <Box w="16px" h="16px" borderRadius="sm" bg={props.gradientColor1 || '#ffffff'} border="1px solid gray" />
                      </Button>
                      <ColorPickerModal
                        isOpen={isGradientColor1PickerOpen}
                        onClose={() => setIsGradientColor1PickerOpen(false)}
                        initialColor={props.gradientColor1 || '#ffffff'}
                        onColorChange={(color: string) => updateProp('gradientColor1', color)}
                      />
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Màu 2</Text>
                      <Button size="xs" variant="outline" onClick={() => setIsGradientColor2PickerOpen(true)}>
                        <Box w="16px" h="16px" borderRadius="sm" bg={props.gradientColor2 || '#000000'} border="1px solid gray" />
                      </Button>
                      <ColorPickerModal
                        isOpen={isGradientColor2PickerOpen}
                        onClose={() => setIsGradientColor2PickerOpen(false)}
                        initialColor={props.gradientColor2 || '#000000'}
                        onColorChange={(color: string) => updateProp('gradientColor2', color)}
                      />
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
              </Stack>
            </Box>

            {/* Border & Corner Radius Section */}
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
                          <Text fontSize="10px" textAlign="center">
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
                          <Text fontSize="10px" textAlign="center">
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
                          <Text fontSize="10px" textAlign="center">
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
                          <Text fontSize="10px" textAlign="center">
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
                        <Text fontSize="10px" textAlign="center">
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
                        <Text fontSize="10px" textAlign="center">
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
                        <Text fontSize="10px" textAlign="center">
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
                        <Text fontSize="10px" textAlign="center">
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

            {/* Shadow Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Đổ bóng</Text>
              <Stack gap={3}>
                {/* Shadow Type */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Kiểu đổ bóng</Text>
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
                  <Text fontSize="xs">Presets</Text>
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
                    <Box className='w-full flex items-center gap-2'>
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

            {/* Filter Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Filter</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Blend Mode</Text>
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
                  <Box className='w-full flex justify-between items-center gap-2'>
                    <Text fontSize="xs">Tương phản</Text>
                    <DraggableNumberInput
                      value={props.contrast || 100}
                      onChange={(value) => updateProp('contrast', value)}
                      min={0}
                      max={200}
                    />
                  </Box>
                  <Box className='w-full flex justify-between items-center gap-2'>
                    <Text fontSize="xs">Độ sáng</Text>
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
                    <Text fontSize="xs">Hòa màu</Text>
                    <DraggableNumberInput
                      value={props.saturate || 100}
                      onChange={(value) => updateProp('saturate', value)}
                      min={0}
                      max={200}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs">Trắng đen</Text>
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
                    <Text fontSize="xs">Đảo ngược</Text>
                    <DraggableNumberInput
                      value={props.invert || 0}
                      onChange={(value) => updateProp('invert', value)}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs">Sepia</Text>
                    <DraggableNumberInput
                      value={props.sepia || 0}
                      onChange={(value) => updateProp('sepia', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs">Xoay màu</Text>
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

            {/* Text Settings Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Thiết lập chữ</Text>
              <Stack gap={3}>
                {/* Font Size and Family */}
                <HStack gap={2}>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Font chữ</Text>
                    <StyledFontSelector
                      value={props.fontFamily || 'inherit'}
                      options={fonts}
                      onChange={(value) => updateProp('fontFamily', value)}
                      className='w-full'
                    />
                  </Box>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Cỡ chữ</Text>
                    <DraggableNumberInput
                      value={parseInt(props.fontSize || '14')}
                      onChange={(value) => updateProp('fontSize', `${value}px`)}
                      min={8}
                      max={200}
                    />
                  </Box>
                </HStack>

                {/* Text Style Controls */}
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

                {/* Text Alignment and Color */}
                <Box className='w-full flex items-center justify-between gap-1'>
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
                    onClick={() => setIsTextColorPickerOpen(true)}
                  >
                    <Box
                      width="24px"
                      height="24px"
                      borderRadius="md"
                      backgroundColor={props.color || '#000000'}
                      mr={2}
                      border="1px solid"
                      borderColor="gray.200"
                    />
                  </Box>
                  <ColorPickerModal
                    isOpen={isTextColorPickerOpen}
                    onClose={() => setIsTextColorPickerOpen(false)}
                    onColorChange={(color) => updateProp('color', color)}
                    initialColor={props.color || '#000000'}
                  />
                </Box>

                {/* Line Height and Letter Spacing */}
                <HStack gap={2}>
                  <Tooltip content="Khoảng cách dòng">
                    <Box className='flex items-center justify-between gap-2'>
                      <RiLineHeight2 />
                      <DraggableNumberInput
                        value={parseFloat(props.lineHeight || '1.4')}
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
                        value={parseInt(props.letterSpacing || '0')}
                        onChange={(value) => updateProp('letterSpacing', `${value}px`)}
                        min={-10}
                        max={50}
                      />
                    </Box>
                  </Tooltip>
                </HStack>

                {/* Text Transform */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Kiểu chữ</Text>
                  <select
                    value={props.textTransform || 'none'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('textTransform', e.target.value)}
                    className='rounded-md p-2 text-sm w-[50%]'
                  >
                    {textTransformOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>
              </Stack>
            </Box>

            {/* Text Shadow & Stroke Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Viền chữ & Đổ bóng chữ</Text>
              <Stack gap={3}>
                {/* Text Stroke */}
                <Box className='w-full flex gap-2 flex-col'>
                  <Box className='flex items-center gap-2'>
                    <Text fontSize="xs">Kích thước viền</Text>
                    <DraggableNumberInput
                      value={props.textStroke?.width ?? 0}
                      onChange={(value) => updateTextStroke('width', value)}
                      min={0}
                      max={10}
                    />
                  </Box>
                  {(props.textStroke?.width ?? 0) > 0 && (
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">Màu viền</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        borderRadius="md"
                        p={2}
                        cursor="pointer"
                        onClick={() => setIsTextStrokeColorPickerOpen(true)}
                      >
                        <Box
                          width="24px"
                          height="24px"
                          borderRadius="md"
                          backgroundColor={props.textStroke?.color || '#000000'}
                          mr={2}
                          border="1px solid"
                          borderColor="gray.200"
                        />
                        <Text fontSize="xs">{props.textStroke?.color || '#000000'}</Text>
                      </Box>
                      <ColorPickerModal
                        isOpen={isTextStrokeColorPickerOpen}
                        onClose={() => setIsTextStrokeColorPickerOpen(false)}
                        onColorChange={(color) => updateTextStroke('color', color)}
                        initialColor={props.textStroke?.color || '#000000'}
                      />
                    </Box>
                  )}
                </Box>

                {/* Text Shadow */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Đổ bóng chữ</Text>
                  <Switch.Root
                    checked={props.textShadow?.enabled ?? false}
                    onCheckedChange={(e) => updateTextShadow('enabled', e.checked)}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </Box>

                {props.textShadow?.enabled && (
                  <Box className='grid grid-cols-2 gap-2'>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">X</Text>
                      <DraggableNumberInput
                        value={props.textShadow?.x ?? 0}
                        onChange={(value) => updateTextShadow('x', value)}
                        min={-20}
                        max={20}
                      />
                    </Box>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">Y</Text>
                      <DraggableNumberInput
                        value={props.textShadow?.y ?? 0}
                        onChange={(value) => updateTextShadow('y', value)}
                        min={-20}
                        max={20}
                      />
                    </Box>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">Độ mờ</Text>
                      <DraggableNumberInput
                        value={props.textShadow?.blur ?? 0}
                        onChange={(value) => updateTextShadow('blur', value)}
                        min={0}
                        max={20}
                      />
                    </Box>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">Màu</Text>
                      <Box
                        display="flex"
                        alignItems="center"
                        borderRadius="md"
                        p={2}
                        cursor="pointer"
                        onClick={() => setIsTextShadowColorPickerOpen(true)}
                      >
                        <Box
                          width="16px"
                          height="16px"
                          borderRadius="md"
                          backgroundColor={props.textShadow?.color || '#000000'}
                          border="1px solid"
                          borderColor="gray.200"
                        />
                      </Box>
                      <ColorPickerModal
                        isOpen={isTextShadowColorPickerOpen}
                        onClose={() => setIsTextShadowColorPickerOpen(false)}
                        onColorChange={(color) => updateTextShadow('color', color)}
                        initialColor={props.textShadow?.color || '#000000'}
                      />
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>


        <Tabs.Content value="advanced" className="p-4">
          <Stack gap={4}>
            <CrossPlatformSyncToggle />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
