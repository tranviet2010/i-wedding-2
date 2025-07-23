import { useState } from 'react';
import { useNode } from '@craftjs/core';
import {
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Tabs,
  Text,
  IconButton,
  VStack,
  Flex,
  Select,
  Slider,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiSearch, FiEdit } from 'react-icons/fi';
import { FaGripVertical } from 'react-icons/fa';
import { QuickActionsProps, ActionButton } from './index';
import { EventItem, EventManager } from '@/components/editor/components/EventManager';
import { ColorPickerModal } from '@/components/editor/components/ColorPickerModal';
import { DraggableNumberInput } from '@/components/editor/components/DraggableNumberInput';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { gradientTemplates, gradientTypeOptions } from '@/utils/settingProfile';
import { heartIcon } from '@/utils/iconTemplate';

const backgroundTypeOptions = [
  { value: 'color', label: 'Màu sắc' },
  { value: 'gradient', label: 'Gradient' },
];

const expandDirectionOptions = [
  { value: 'up', label: 'Lên trên' },
  { value: 'down', label: 'Xuống dưới' },
  { value: 'left', label: 'Sang trái' },
  { value: 'right', label: 'Sang phải' },
];



export const QuickActionsSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as QuickActionsProps
  }));

  const { showIconPickerModal } = useViewport();
  const [settingType, setSettingType] = useState('default');
  const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(null);
  
  // Color picker states
  const [isTriggerBackgroundColorPickerOpen, setIsTriggerBackgroundColorPickerOpen] = useState(false);
  const [isTriggerIconColorPickerOpen, setIsTriggerIconColorPickerOpen] = useState(false);
  const [isTriggerOpenBackgroundColorPickerOpen, setIsTriggerOpenBackgroundColorPickerOpen] = useState(false);
  const [isTriggerOpenIconColorPickerOpen, setIsTriggerOpenIconColorPickerOpen] = useState(false);
  const [isTriggerOpenGradient1ColorPickerOpen, setIsTriggerOpenGradient1ColorPickerOpen] = useState(false);
  const [isTriggerOpenGradient2ColorPickerOpen, setIsTriggerOpenGradient2ColorPickerOpen] = useState(false);
  const [isActionIconColorPickerOpen, setIsActionIconColorPickerOpen] = useState(false);
  const [actionColorPickerIndex, setActionColorPickerIndex] = useState<number | null>(null);

  const updateProp = (key: keyof QuickActionsProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  const updateActionButton = (index: number, key: keyof ActionButton, value: any) => {
    setProp((props: any) => {
      if (props.actionButtons[index]) {
        props.actionButtons[index][key] = value;
      }
    });
  };

  const addActionButton = () => {
    // Limit to maximum 8 action buttons
    if ((props.actionButtons || []).length >= 8) {
      return;
    }

    const newButton: ActionButton = {
      id: `action-${Date.now()}`,
      svgCode: heartIcon,
      iconColor: '#ffffff',
      background: '#4158D0',
      backgroundType: 'color',
      gradientType: 'linear',
      gradientAngle: 90,
      gradientColor1: '#4158D0',
      gradientColor2: '#C850C0',
      borderWidth: [0, 0, 0, 0],
      borderColor: '#000000',
      borderStyle: 'solid',
      borderRadius: [25, 25, 25, 25],
      events: [],
      // Tooltip defaults
      tooltipEnabled: false,
      tooltipText: 'Hành động',
      tooltipPosition: 'left',
      tooltipDelay: 10
    };

    setProp((props: any) => {
      props.actionButtons = [...(props.actionButtons || []), newButton];
    });
  };

  const removeActionButton = (index: number) => {
    setProp((props: any) => {
      props.actionButtons = props.actionButtons.filter((_: any, i: number) => i !== index);
    });
    if (selectedActionIndex === index) {
      setSelectedActionIndex(null);
    }
  };

  const updateTriggerBackground = (backgroundType: string) => {
    updateProp('triggerBackgroundType', backgroundType);

    if (backgroundType === 'color') {
      updateProp('triggerBackground', '#4158D0');
    } else if (backgroundType === 'gradient') {
      const template = gradientTemplates[0];
      updateProp('triggerGradientColor1', template.colors[0]);
      updateProp('triggerGradientColor2', template.colors[1]);
      updateProp('triggerBackground', `linear-gradient(90deg, ${template.colors[0]}, ${template.colors[1]})`);
    }
  };

  const updateActionBackground = (index: number, backgroundType: string) => {
    updateActionButton(index, 'backgroundType', backgroundType);

    if (backgroundType === 'color') {
      updateActionButton(index, 'background', '#4158D0');
    } else if (backgroundType === 'gradient') {
      const template = gradientTemplates[0];
      updateActionButton(index, 'gradientColor1', template.colors[0]);
      updateActionButton(index, 'gradientColor2', template.colors[1]);
      updateActionButton(index, 'background', `linear-gradient(90deg, ${template.colors[0]}, ${template.colors[1]})`);
    }
  };

  const updateTriggerOpenBackground = (backgroundType: string) => {
    updateProp('triggerOpenBackgroundType', backgroundType);

    if (backgroundType === 'color') {
      updateProp('triggerOpenBackground', '#ff4757');
    } else if (backgroundType === 'gradient') {
      const template = gradientTemplates[0];
      updateProp('triggerOpenGradientColor1', template.colors[0]);
      updateProp('triggerOpenGradientColor2', template.colors[1]);
      updateProp('triggerOpenBackground', `linear-gradient(90deg, ${template.colors[0]}, ${template.colors[1]})`);
    }
  };

  // Handle action button events change
  const handleActionEventsChange = (events: EventItem[]) => {
    if (selectedActionIndex !== null) {
      updateActionButton(selectedActionIndex, 'events', events);
    }
  };


  return (
    <Box className='w-full h-full'>
      <Tabs.Root value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="opened" className='!text-xs'>
            Khi mở
          </Tabs.Trigger>
          <Tabs.Trigger value="actions" className='!text-xs'>
            Hành động
          </Tabs.Trigger>
          <Tabs.Trigger value="position" className='!text-xs'>
            Vị trí
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="default">
          <Stack gap={4}>

            {/* Trigger Button Settings */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight="500" mb={3}>Nút chính</Text>
              <Stack gap={3}>
                {/* Trigger Icon */}
                <Box className='flex gap-2 items-center'>
                  <Input
                    value={props.triggerIcon || ''}
                    onChange={(e) => updateProp('triggerIcon', e.target.value)}
                    placeholder="Nhập code svg của biểu tượng"
                    flex={1}
                  />
                  <Button
                    size="sm"
                    onClick={() => showIconPickerModal((svgCode: string) => updateProp('triggerIcon', svgCode))}
                    colorScheme="blue"
                    variant="outline"
                  >
                    <FiSearch />
                  </Button>
                </Box>

                {/* Trigger Icon Color */}
                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Màu biểu tượng</Text>
                  <Button
                    size="sm"
                    onClick={() => setIsTriggerIconColorPickerOpen(true)}
                    style={{ backgroundColor: props.triggerIconColor, border: '1px solid #ccc' }}
                    width="40px"
                    height="30px"
                  />
                </HStack>

                {/* Trigger Background Type */}
                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Kiểu nền</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.triggerBackgroundType || 'color'}
                    onChange={(e) => updateTriggerBackground(e.target.value)}
                  >
                    {backgroundTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </HStack>

                {/* Trigger Background Color/Gradient */}
                {props.triggerBackgroundType === 'color' && (
                  <HStack justifyContent="space-between">
                    <Text fontSize="xs">Màu nền</Text>
                    <Button
                      size="sm"
                      onClick={() => setIsTriggerBackgroundColorPickerOpen(true)}
                      style={{ backgroundColor: props.triggerBackground }}
                      width="40px"
                      height="30px"
                    />
                  </HStack>
                )}

                {props.triggerBackgroundType === 'gradient' && (
                  <Stack gap="2">
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Kiểu Gradient</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.triggerGradientType || 'linear'}
                        onChange={(e) => updateProp('triggerGradientType', e.target.value)}
                      >
                        {gradientTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </HStack>
                    {props.triggerGradientType === 'linear' && (
                      <HStack alignItems="center">
                        <Text fontSize="xs">Góc</Text>
                        <DraggableNumberInput
                          value={props.triggerGradientAngle || 0}
                          onChange={(val: number) => updateProp('triggerGradientAngle', val)}
                          min={0}
                          max={360}
                        />
                      </HStack>
                    )}
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Màu 1</Text>
                      <Button
                        size="sm"
                        onClick={() => setIsTriggerBackgroundColorPickerOpen(true)}
                        style={{ backgroundColor: props.triggerGradientColor1 }}
                        width="40px"
                        height="30px"
                      />
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Màu 2</Text>
                      <Button
                        size="sm"
                        onClick={() => setIsTriggerBackgroundColorPickerOpen(true)}
                        style={{ backgroundColor: props.triggerGradientColor2 }}
                        width="40px"
                        height="30px"
                      />
                    </HStack>
                  </Stack>
                )}

                {/* Layout Settings */}
                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Kích thước nút</Text>
                  <DraggableNumberInput
                    value={props.buttonSize || 50}
                    onChange={(val: number) => updateProp('buttonSize', val)}
                    min={30}
                    max={100}
                  />
                </HStack>

                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Khoảng cách</Text>
                  <DraggableNumberInput
                    value={props.spacing || 10}
                    onChange={(val: number) => updateProp('spacing', val)}
                    min={5}
                    max={50}
                  />
                </HStack>

                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Hướng mở rộng</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.expandDirection || 'up'}
                    onChange={(e) => updateProp('expandDirection', e.target.value)}
                  >
                    {expandDirectionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </HStack>

                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Thời gian animation (ms)</Text>
                  <DraggableNumberInput
                    value={props.animationDuration || 300}
                    onChange={(val: number) => updateProp('animationDuration', val)}
                    min={100}
                    max={1000}
                  />
                </HStack>
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="opened">
          <Stack gap={4}>
            {/* Opened State Trigger Button Settings */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight="500" mb={3}>Nút chính khi mở</Text>
              <Stack gap={3}>
                {/* Opened Trigger Icon */}
                <Box className='flex gap-2 items-center'>
                  <Input
                    value={props.triggerOpenIcon || ''}
                    onChange={(e) => updateProp('triggerOpenIcon', e.target.value)}
                    placeholder="Nhập code svg của biểu tượng khi mở"
                    flex={1}
                  />
                  <Button
                    size="sm"
                    onClick={() => showIconPickerModal((svgCode: string) => updateProp('triggerOpenIcon', svgCode))}
                    colorScheme="blue"
                    variant="outline"
                  >
                    <FiSearch />
                  </Button>
                </Box>

                {/* Opened Trigger Icon Color */}
                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Màu biểu tượng khi mở</Text>
                  <Button
                    size="sm"
                    onClick={() => setIsTriggerOpenIconColorPickerOpen(true)}
                    style={{ backgroundColor: props.triggerOpenIconColor, border: '1px solid #ccc' }}
                    width="40px"
                    height="30px"
                  />
                </HStack>

                {/* Opened Trigger Background Type */}
                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Kiểu nền khi mở</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.triggerOpenBackgroundType || 'color'}
                    onChange={(e) => updateTriggerOpenBackground(e.target.value)}
                  >
                    {backgroundTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </HStack>

                {/* Opened Trigger Background Color/Gradient */}
                {props.triggerOpenBackgroundType === 'color' && (
                  <HStack justifyContent="space-between">
                    <Text fontSize="xs">Màu nền khi mở</Text>
                    <Button
                      size="sm"
                      onClick={() => setIsTriggerOpenBackgroundColorPickerOpen(true)}
                      style={{ backgroundColor: props.triggerOpenBackground }}
                      width="40px"
                      height="30px"
                    />
                  </HStack>
                )}

                {props.triggerOpenBackgroundType === 'gradient' && (
                  <Stack gap="2">
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Kiểu Gradient khi mở</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.triggerOpenGradientType || 'linear'}
                        onChange={(e) => updateProp('triggerOpenGradientType', e.target.value)}
                      >
                        {gradientTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </HStack>
                    {props.triggerOpenGradientType === 'linear' && (
                      <HStack alignItems="center">
                        <Text fontSize="xs">Góc</Text>
                        <DraggableNumberInput
                          value={props.triggerOpenGradientAngle || 0}
                          onChange={(val: number) => updateProp('triggerOpenGradientAngle', val)}
                          min={0}
                          max={360}
                        />
                      </HStack>
                    )}
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Màu 1 khi mở</Text>
                      <Button
                        size="sm"
                        onClick={() => setIsTriggerOpenGradient1ColorPickerOpen(true)}
                        style={{ backgroundColor: props.triggerOpenGradientColor1 }}
                        width="40px"
                        height="30px"
                      />
                    </HStack>
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Màu 2 khi mở</Text>
                      <Button
                        size="sm"
                        onClick={() => setIsTriggerOpenGradient2ColorPickerOpen(true)}
                        style={{ backgroundColor: props.triggerOpenGradientColor2 }}
                        width="40px"
                        height="30px"
                      />
                    </HStack>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="actions">
          <Stack gap={4}>
            {/* Action Buttons Management */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <HStack justifyContent="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="500">Nút hành động ({(props.actionButtons || []).length}/8)</Text>
                <Button
                  size="sm"
                  onClick={addActionButton}
                  colorScheme="blue"
                  disabled={(props.actionButtons || []).length >= 8}
                  title={(props.actionButtons || []).length >= 8 ? "Đã đạt giới hạn tối đa 8 nút" : "Thêm nút hành động"}
                >
                  <FiPlus />
                </Button>
              </HStack>

              {props.actionButtons && props.actionButtons.length > 0 ? (
                <Stack gap={3}>
                  {props.actionButtons.map((actionButton, index) => (
                    <Box key={actionButton.id} border="1px solid #e0e0e0" borderRadius={4} p={3}>
                      <HStack justifyContent="space-between" mb={2}>
                        <Text fontSize="xs" fontWeight="500">Nút {index + 1}</Text>
                        <HStack>
                          <Button
                            size="xs"
                            onClick={() => setSelectedActionIndex(selectedActionIndex === index ? null : index)}
                            variant={selectedActionIndex === index ? "solid" : "outline"}
                          >
                            {selectedActionIndex === index ? 'Thu gọn' : 'Chỉnh sửa'}
                          </Button>
                          <IconButton
                            size="xs"
                            onClick={() => removeActionButton(index)}
                            colorScheme="red"
                            variant="outline"
                          >
                            <FiTrash2 />
                          </IconButton>
                        </HStack>
                      </HStack>

                      {selectedActionIndex === index && (
                        <Stack gap={2}>
                          {/* Action Button Icon */}
                          <Box className='flex gap-2 items-center'>
                            <Input
                              value={actionButton.svgCode || ''}
                              onChange={(e) => updateActionButton(index, 'svgCode', e.target.value)}
                              placeholder="Nhập code svg"
                              flex={1}
                              size="sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => showIconPickerModal((svgCode: string) => updateActionButton(index, 'svgCode', svgCode))}
                              colorScheme="blue"
                              variant="outline"
                            >
                              <FiSearch />
                            </Button>
                          </Box>

                          {/* Action Button Icon Color */}
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs">Màu biểu tượng</Text>
                            <Button
                              size="sm"
                              onClick={() => {
                                setActionColorPickerIndex(index);
                                setIsActionIconColorPickerOpen(true);
                              }}
                              style={{ backgroundColor: actionButton.iconColor, border: '1px solid #ccc' }}
                              width="30px"
                              height="20px"
                            />
                          </HStack>

                          {/* Action Button Background */}
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs">Kiểu nền</Text>
                            <select
                              className="outline-none p-1 rounded-md text-xs"
                              value={actionButton.backgroundType || 'color'}
                              onChange={(e) => updateActionBackground(index, e.target.value)}
                            >
                              {backgroundTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </HStack>

                          {/* Action Button Events */}
                          <Box mt={3} pt={3} borderTop="1px solid #e0e0e0">
                            <Text fontSize="xs" fontWeight="500" mb={2}>Sự kiện</Text>
                            <EventManager
                              events={actionButton.events || []}
                              onEventsChange={(events) => updateActionButton(index, 'events', events)}
                            />
                          </Box>

                          {/* Tooltip Settings */}
                          <Box mt={3} pt={3} borderTop="1px solid #e0e0e0">
                            <Text fontSize="xs" fontWeight="500" mb={2}>Tooltip</Text>
                            <Stack gap={2}>
                              {/* Enable Tooltip */}
                              <HStack justifyContent="space-between">
                                <Text fontSize="xs">Bật tooltip</Text>
                                <input
                                  type="checkbox"
                                  checked={actionButton.tooltipEnabled || false}
                                  onChange={(e) => updateActionButton(index, 'tooltipEnabled', e.target.checked)}
                                />
                              </HStack>

                              {actionButton.tooltipEnabled && (
                                <>
                                  {/* Tooltip Text */}
                                  <Box>
                                    <Text fontSize="xs" mb={1}>Nội dung tooltip</Text>
                                    <Input
                                      size="sm"
                                      value={actionButton.tooltipText || ''}
                                      onChange={(e) => updateActionButton(index, 'tooltipText', e.target.value)}
                                      placeholder="Nhập nội dung tooltip"
                                    />
                                  </Box>

                                  {/* Tooltip Position */}
                                  <HStack justifyContent="space-between">
                                    <Text fontSize="xs">Vị trí tooltip</Text>
                                    <select
                                      className="outline-none p-1 rounded-md text-xs"
                                      value={actionButton.tooltipPosition || 'left'}
                                      onChange={(e) => updateActionButton(index, 'tooltipPosition', e.target.value)}
                                    >
                                      <option value="top">Trên</option>
                                      <option value="bottom">Dưới</option>
                                      <option value="left">Trái</option>
                                      <option value="right">Phải</option>
                                    </select>
                                  </HStack>

                                  {/* Tooltip Delay */}
                                  <HStack justifyContent="space-between">
                                    <Text fontSize="xs">Độ trễ hiển thị (ms)</Text>
                                    <Input
                                      size="sm"
                                      type="number"
                                      value={actionButton.tooltipDelay || 10}
                                      onChange={(e) => updateActionButton(index, 'tooltipDelay', parseInt(e.target.value) || 10)}
                                      min={0}
                                      max={5000}
                                      width="80px"
                                    />
                                  </HStack>
                                </>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                  Chưa có nút hành động nào. Nhấn + để thêm.
                </Text>
              )}
            </Box>
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="position">
          <Stack gap={4}>
            {/* Position Settings */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight="500" mb={3}>Cài đặt vị trí</Text>
              <Stack gap={3}>
                {/* Enable Position */}
                <HStack justifyContent="space-between">
                  <Text fontSize="xs">Bật cài đặt vị trí</Text>
                  <input
                    type="checkbox"
                    checked={props.position?.enabled || false}
                    onChange={(e) => updateProp('position', {
                      enabled: e.target.checked,
                      position: props.position?.position || 'bottom-right',
                      topDistance: props.position?.topDistance || 20,
                      bottomDistance: props.position?.bottomDistance || 20,
                      leftDistance: props.position?.leftDistance || 20,
                      rightDistance: props.position?.rightDistance || 20,
                    })}
                  />
                </HStack>

                {props.position?.enabled && (
                  <>
                    {/* Position Selection */}
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Vị trí</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.position?.position || 'bottom-right'}
                        onChange={(e) => updateProp('position', {
                          enabled: props.position?.enabled || true,
                          position: e.target.value,
                          topDistance: props.position?.topDistance || 20,
                          bottomDistance: props.position?.bottomDistance || 20,
                          leftDistance: props.position?.leftDistance || 20,
                          rightDistance: props.position?.rightDistance || 20,
                        })}
                      >
                        <option value="top-left">Trên cùng trái</option>
                        <option value="top-center">Trên cùng giữa</option>
                        <option value="top-right">Trên cùng phải</option>
                        <option value="middle-left">Giữa trái</option>
                        <option value="middle-right">Giữa phải</option>
                        <option value="bottom-left">Dưới cùng trái</option>
                        <option value="bottom-center">Dưới cùng giữa</option>
                        <option value="bottom-right">Dưới cùng phải</option>
                      </select>
                    </HStack>

                    {/* Distance Controls based on position */}
                    {(props.position?.position === 'top-left' || props.position?.position === 'top-center' || props.position?.position === 'top-right') && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="xs">Khoảng cách từ trên (px)</Text>
                        <Input
                          size="sm"
                          type="number"
                          value={props.position?.topDistance || 20}
                          onChange={(e) => updateProp('position', {
                            enabled: props.position?.enabled || true,
                            position: props.position?.position || 'bottom-right',
                            topDistance: parseInt(e.target.value) || 20,
                            bottomDistance: props.position?.bottomDistance || 20,
                            leftDistance: props.position?.leftDistance || 20,
                            rightDistance: props.position?.rightDistance || 20,
                          })}
                          min={0}
                          max={1000}
                          width="80px"
                        />
                      </HStack>
                    )}

                    {(props.position?.position === 'bottom-left' || props.position?.position === 'bottom-center' || props.position?.position === 'bottom-right') && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="xs">Khoảng cách từ dưới (px)</Text>
                        <Input
                          size="sm"
                          type="number"
                          value={props.position?.bottomDistance || 20}
                          onChange={(e) => updateProp('position', {
                            enabled: props.position?.enabled || true,
                            position: props.position?.position || 'bottom-right',
                            topDistance: props.position?.topDistance || 20,
                            bottomDistance: parseInt(e.target.value) || 20,
                            leftDistance: props.position?.leftDistance || 20,
                            rightDistance: props.position?.rightDistance || 20,
                          })}
                          min={0}
                          max={1000}
                          width="80px"
                        />
                      </HStack>
                    )}

                    {(props.position?.position === 'top-left' || props.position?.position === 'middle-left' || props.position?.position === 'bottom-left') && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="xs">Khoảng cách từ trái (px)</Text>
                        <Input
                          size="sm"
                          type="number"
                          value={props.position?.leftDistance || 20}
                          onChange={(e) => updateProp('position', {
                            enabled: props.position?.enabled || true,
                            position: props.position?.position || 'bottom-right',
                            topDistance: props.position?.topDistance || 20,
                            bottomDistance: props.position?.bottomDistance || 20,
                            leftDistance: parseInt(e.target.value) || 20,
                            rightDistance: props.position?.rightDistance || 20,
                          })}
                          min={0}
                          max={1000}
                          width="80px"
                        />
                      </HStack>
                    )}

                    {(props.position?.position === 'top-right' || props.position?.position === 'middle-right' || props.position?.position === 'bottom-right') && (
                      <HStack justifyContent="space-between">
                        <Text fontSize="xs">Khoảng cách từ phải (px)</Text>
                        <Input
                          size="sm"
                          type="number"
                          value={props.position?.rightDistance || 20}
                          onChange={(e) => updateProp('position', {
                            enabled: props.position?.enabled || true,
                            position: props.position?.position || 'bottom-right',
                            topDistance: props.position?.topDistance || 20,
                            bottomDistance: props.position?.bottomDistance || 20,
                            leftDistance: props.position?.leftDistance || 20,
                            rightDistance: parseInt(e.target.value) || 20,
                          })}
                          min={0}
                          max={1000}
                          width="80px"
                        />
                      </HStack>
                    )}

                    {/* Position Preview */}
                    <Box>
                      <Text fontSize="xs" mb={2}>Xem trước vị trí</Text>
                      <Box
                        position="relative"
                        width="200px"
                        height="120px"
                        border="2px dashed #e0e0e0"
                        borderRadius="md"
                        bg="gray.50"
                      >
                        <Text
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          fontSize="xs"
                          color="gray.400"
                        >
                          Trang web
                        </Text>
                        <Box
                          position="absolute"
                          width="20px"
                          height="20px"
                          bg="blue.500"
                          borderRadius="50%"
                          style={(() => {
                            const pos = props.position?.position || 'bottom-right';
                            const styles: any = {};

                            switch (pos) {
                              case 'top-left':
                                styles.top = '8px';
                                styles.left = '8px';
                                break;
                              case 'top-center':
                                styles.top = '8px';
                                styles.left = '50%';
                                styles.transform = 'translateX(-50%)';
                                break;
                              case 'top-right':
                                styles.top = '8px';
                                styles.right = '8px';
                                break;
                              case 'middle-left':
                                styles.top = '50%';
                                styles.left = '8px';
                                styles.transform = 'translateY(-50%)';
                                break;
                              case 'middle-right':
                                styles.top = '50%';
                                styles.right = '8px';
                                styles.transform = 'translateY(-50%)';
                                break;
                              case 'bottom-left':
                                styles.bottom = '8px';
                                styles.left = '8px';
                                break;
                              case 'bottom-center':
                                styles.bottom = '8px';
                                styles.left = '50%';
                                styles.transform = 'translateX(-50%)';
                                break;
                              case 'bottom-right':
                              default:
                                styles.bottom = '8px';
                                styles.right = '8px';
                                break;
                            }

                            return styles;
                          })()}
                        />
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>

      </Tabs.Root>

      {/* Color Picker Modals */}
      <ColorPickerModal
        isOpen={isTriggerBackgroundColorPickerOpen}
        onClose={() => setIsTriggerBackgroundColorPickerOpen(false)}
        initialColor={props.triggerBackground || '#4158D0'}
        onColorChange={(color: string) => updateProp('triggerBackground', color)}
      />

      <ColorPickerModal
        isOpen={isTriggerIconColorPickerOpen}
        onClose={() => setIsTriggerIconColorPickerOpen(false)}
        initialColor={props.triggerIconColor || '#ffffff'}
        onColorChange={(color: string) => updateProp('triggerIconColor', color)}
      />

      <ColorPickerModal
        isOpen={isTriggerOpenBackgroundColorPickerOpen}
        onClose={() => setIsTriggerOpenBackgroundColorPickerOpen(false)}
        initialColor={props.triggerOpenBackground || '#ff4757'}
        onColorChange={(color: string) => updateProp('triggerOpenBackground', color)}
      />

      <ColorPickerModal
        isOpen={isTriggerOpenIconColorPickerOpen}
        onClose={() => setIsTriggerOpenIconColorPickerOpen(false)}
        initialColor={props.triggerOpenIconColor || '#ffffff'}
        onColorChange={(color: string) => updateProp('triggerOpenIconColor', color)}
      />

      <ColorPickerModal
        isOpen={isTriggerOpenGradient1ColorPickerOpen}
        onClose={() => setIsTriggerOpenGradient1ColorPickerOpen(false)}
        initialColor={props.triggerOpenGradientColor1 || '#ff4757'}
        onColorChange={(color: string) => updateProp('triggerOpenGradientColor1', color)}
      />

      <ColorPickerModal
        isOpen={isTriggerOpenGradient2ColorPickerOpen}
        onClose={() => setIsTriggerOpenGradient2ColorPickerOpen(false)}
        initialColor={props.triggerOpenGradientColor2 || '#ff3838'}
        onColorChange={(color: string) => updateProp('triggerOpenGradientColor2', color)}
      />

      <ColorPickerModal
        isOpen={isActionIconColorPickerOpen}
        onClose={() => {
          setIsActionIconColorPickerOpen(false);
          setActionColorPickerIndex(null);
        }}
        initialColor={
          actionColorPickerIndex !== null && props.actionButtons[actionColorPickerIndex]
            ? props.actionButtons[actionColorPickerIndex].iconColor
            : '#ffffff'
        }
        onColorChange={(color: string) => {
          if (actionColorPickerIndex !== null) {
            updateActionButton(actionColorPickerIndex, 'iconColor', color);
          }
        }}
      />
    </Box>
  );
};
