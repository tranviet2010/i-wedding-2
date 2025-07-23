import React from 'react';
import { useNode } from '@craftjs/core';
import {
  Box,
  Text,
  Input,
  Stack,
  Select,
  createListCollection,
} from '@chakra-ui/react';

interface ContentWrapperProps {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  direction: 'ltr' | 'rtl';
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDeg: number;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundOpacity: number;
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  overlayColor: string;
  overlayOpacity: number;
  padding: string;
}

export const ContentWrapperSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as ContentWrapperProps
  }));

  const updateProp = (key: keyof ContentWrapperProps, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  const handleNumberChange = (key: keyof ContentWrapperProps, value: string, min: number, max: number) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      updateProp(key, Math.min(Math.max(num, min), max));
    }
  };

  return (
    <Box p={4}>
      <Stack gap={4}>
        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Typography</Text>
          <Stack gap={2}>
            <Box>
              <Text fontSize="xs" mb={1}>Font Family</Text>
              <Select.Root
                value={[props.fontFamily || 'Arial, sans-serif']}
                onValueChange={(e) => updateProp('fontFamily', e.value[0])}
                collection={createListCollection({
                  items: [
                    { label: "Arial", value: "Arial, sans-serif" },
                    { label: "Helvetica", value: "'Helvetica Neue', Helvetica, sans-serif" },
                    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
                    { label: "Georgia", value: "Georgia, serif" },
                    { label: "Courier New", value: "'Courier New', Courier, monospace" },
                    { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
                    { label: "Open Sans", value: "'Open Sans', sans-serif" },
                    { label: "Roboto", value: "'Roboto', sans-serif" },
                  ]
                })}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select font" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {createListCollection({
                      items: [
                        { label: "Arial", value: "Arial, sans-serif" },
                        { label: "Helvetica", value: "'Helvetica Neue', Helvetica, sans-serif" },
                        { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
                        { label: "Georgia", value: "Georgia, serif" },
                        { label: "Courier New", value: "'Courier New', Courier, monospace" },
                        { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
                        { label: "Open Sans", value: "'Open Sans', sans-serif" },
                        { label: "Roboto", value: "'Roboto', sans-serif" },
                      ]
                    }).items.map((font) => (
                      <Select.Item item={font} key={font.value}>
                        {font.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Font Size</Text>
              <Input
                value={props.fontSize || '16px'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('fontSize', e.target.value)}
                placeholder="16px, 1rem, etc."
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Font Weight</Text>
              <Select.Root
                value={[props.fontWeight || 'normal']}
                onValueChange={(e) => updateProp('fontWeight', e.value[0])}
                collection={createListCollection({
                  items: [
                    { label: "Normal", value: "normal" },
                    { label: "Bold", value: "bold" },
                    { label: "100", value: "100" },
                    { label: "200", value: "200" },
                    { label: "300", value: "300" },
                    { label: "400", value: "400" },
                    { label: "500", value: "500" },
                    { label: "600", value: "600" },
                    { label: "700", value: "700" },
                    { label: "800", value: "800" },
                    { label: "900", value: "900" },
                  ]
                })}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select weight" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {createListCollection({
                      items: [
                        { label: "Normal", value: "normal" },
                        { label: "Bold", value: "bold" },
                        { label: "100", value: "100" },
                        { label: "200", value: "200" },
                        { label: "300", value: "300" },
                        { label: "400", value: "400" },
                        { label: "500", value: "500" },
                        { label: "600", value: "600" },
                        { label: "700", value: "700" },
                        { label: "800", value: "800" },
                        { label: "900", value: "900" },
                      ]
                    }).items.map((weight) => (
                      <Select.Item item={weight} key={weight.value}>
                        {weight.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Text Color</Text>
              <Input
                type="color"
                value={props.textColor || '#333333'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('textColor', e.target.value)}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Text Align</Text>
              <Select.Root
                value={[props.textAlign || 'left']}
                onValueChange={(e) => updateProp('textAlign', e.value[0] as 'left' | 'center' | 'right' | 'justify')}
                collection={createListCollection({
                  items: [
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                    { label: "Justify", value: "justify" },
                  ]
                })}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select alignment" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {createListCollection({
                      items: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                        { label: "Right", value: "right" },
                        { label: "Justify", value: "justify" },
                      ]
                    }).items.map((align) => (
                      <Select.Item item={align} key={align.value}>
                        {align.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Direction</Text>
              <Select.Root
                value={[props.direction || 'ltr']}
                onValueChange={(e) => updateProp('direction', e.value[0] as 'ltr' | 'rtl')}
                collection={createListCollection({
                  items: [
                    { label: "Left to Right (LTR)", value: "ltr" },
                    { label: "Right to Left (RTL)", value: "rtl" },
                  ]
                })}
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select direction" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {createListCollection({
                      items: [
                        { label: "Left to Right (LTR)", value: "ltr" },
                        { label: "Right to Left (RTL)", value: "rtl" },
                      ]
                    }).items.map((dir) => (
                      <Select.Item item={dir} key={dir.value}>
                        {dir.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Padding</Text>
              <Input
                value={props.padding || '0'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('padding', e.target.value)}
                placeholder="0, 10px, 1rem 2rem, etc."
              />
            </Box>
          </Stack>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Background</Text>
          <Box>
            <Text fontSize="xs" mb={1}>Background Type</Text>
            <Select.Root
              value={[props.backgroundType || 'color']}
              onValueChange={(e) => updateProp('backgroundType', e.value[0] as 'color' | 'gradient' | 'image' | 'video')}
              collection={createListCollection({
                items: [
                  { label: "Solid Color", value: "color" },
                  { label: "Gradient", value: "gradient" },
                  { label: "Image", value: "image" },
                  { label: "Video", value: "video" },
                ]
              })}
            >
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select background type" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {createListCollection({
                    items: [
                      { label: "Solid Color", value: "color" },
                      { label: "Gradient", value: "gradient" },
                      { label: "Image", value: "image" },
                      { label: "Video", value: "video" },
                    ]
                  }).items.map((type) => (
                    <Select.Item item={type} key={type.value}>
                      {type.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Box>

          {props.backgroundType === 'color' && (
            <Box mt={2}>
              <Text fontSize="xs" mb={1}>Background Color</Text>
              <Input
                type="color"
                value={props.backgroundColor || '#ffffff'}
                onChange={(e) => updateProp('backgroundColor', e.target.value)}
              />
            </Box>
          )}

          {props.backgroundType === 'gradient' && (
            <Stack gap={2} mt={2}>
              <Box>
                <Text fontSize="xs" mb={1}>Gradient Start Color</Text>
                <Input
                  type="color"
                  value={props.gradientFrom || '#6366f1'}
                  onChange={(e) => updateProp('gradientFrom', e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1}>Gradient End Color</Text>
                <Input
                  type="color"
                  value={props.gradientTo || '#8b5cf6'}
                  onChange={(e) => updateProp('gradientTo', e.target.value)}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1}>Gradient Angle</Text>
                <Input
                  type="number"
                  value={props.gradientDeg || 45}
                  onChange={(e) => handleNumberChange('gradientDeg', e.target.value, 0, 360)}
                  min={0}
                  max={360}
                />
              </Box>
            </Stack>
          )}

          {props.backgroundType === 'image' && (
            <Stack gap={2} mt={2}>
              <Box>
                <Text fontSize="xs" mb={1}>Image URL</Text>
                <Input
                  value={props.backgroundImage || ''}
                  onChange={(e) => updateProp('backgroundImage', e.target.value)}
                  placeholder="Enter image URL"
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1}>Image Size</Text>
                <Select.Root
                  value={[props.backgroundSize || 'cover']}
                  onValueChange={(e) => updateProp('backgroundSize', e.value[0])}
                  collection={createListCollection({
                    items: [
                      { label: "Cover", value: "cover" },
                      { label: "Contain", value: "contain" },
                      { label: "Stretch", value: "100% 100%" },
                      { label: "Auto", value: "auto" },
                    ]
                  })}
                >
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select size" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {createListCollection({
                        items: [
                          { label: "Cover", value: "cover" },
                          { label: "Contain", value: "contain" },
                          { label: "Stretch", value: "100% 100%" },
                          { label: "Auto", value: "auto" },
                        ]
                      }).items.map((size) => (
                        <Select.Item item={size} key={size.value}>
                          {size.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
              <Box>
                <Text fontSize="xs" mb={1}>Image Position</Text>
                <Select.Root
                  value={[props.backgroundPosition || 'center']}
                  onValueChange={(e) => updateProp('backgroundPosition', e.value[0])}
                  collection={createListCollection({
                    items: [
                      { label: "Center", value: "center" },
                      { label: "Top", value: "top" },
                      { label: "Bottom", value: "bottom" },
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                    ]
                  })}
                >
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select position" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {createListCollection({
                        items: [
                          { label: "Center", value: "center" },
                          { label: "Top", value: "top" },
                          { label: "Bottom", value: "bottom" },
                          { label: "Left", value: "left" },
                          { label: "Right", value: "right" },
                        ]
                      }).items.map((position) => (
                        <Select.Item item={position} key={position.value}>
                          {position.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
            </Stack>
          )}

          {props.backgroundType === 'video' && (
            <Box mt={2}>
              <Text fontSize="xs" mb={1}>Video URL</Text>
              <Input
                value={props.backgroundVideo || ''}
                onChange={(e) => updateProp('backgroundVideo', e.target.value)}
                placeholder="Enter video URL (MP4)"
              />
              <Text fontSize="xs" mt={1} color="gray.500">
                Use direct links to MP4 files for best compatibility
              </Text>
            </Box>
          )}

          {props.backgroundType !== 'color' && (
            <Box mt={2}>
              <Text fontSize="xs" mb={1}>Background Opacity ({props.backgroundOpacity || 100}%)</Text>
              <Input
                type="number"
                value={props.backgroundOpacity || 100}
                onChange={(e) => handleNumberChange('backgroundOpacity', e.target.value, 0, 100)}
                min={0}
                max={100}
              />
            </Box>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Filters</Text>
          <Stack gap={2}>
            <Box>
              <Text fontSize="xs" mb={1}>Brightness ({props.brightness || 100}%)</Text>
              <Input
                type="number"
                value={props.brightness || 100}
                onChange={(e) => handleNumberChange('brightness', e.target.value, 0, 200)}
                min={0}
                max={200}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Contrast ({props.contrast || 100}%)</Text>
              <Input
                type="number"
                value={props.contrast || 100}
                onChange={(e) => handleNumberChange('contrast', e.target.value, 0, 200)}
                min={0}
                max={200}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Saturation ({props.saturate || 100}%)</Text>
              <Input
                type="number"
                value={props.saturate || 100}
                onChange={(e) => handleNumberChange('saturate', e.target.value, 0, 200)}
                min={0}
                max={200}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Hue Rotate ({props.hueRotate || 0}°)</Text>
              <Input
                type="number"
                value={props.hueRotate || 0}
                onChange={(e) => handleNumberChange('hueRotate', e.target.value, 0, 360)}
                min={0}
                max={360}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Blur ({props.blur || 0}px)</Text>
              <Input
                type="number"
                value={props.blur || 0}
                onChange={(e) => handleNumberChange('blur', e.target.value, 0, 20)}
                min={0}
                max={20}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Sepia ({props.sepia || 0}%)</Text>
              <Input
                type="number"
                value={props.sepia || 0}
                onChange={(e) => handleNumberChange('sepia', e.target.value, 0, 100)}
                min={0}
                max={100}
              />
            </Box>
          </Stack>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Overlay</Text>
          <Stack gap={2}>
            <Box>
              <Text fontSize="xs" mb={1}>Color</Text>
              <Input
                type="color"
                value={props.overlayColor || '#000000'}
                onChange={(e) => updateProp('overlayColor', e.target.value)}
              />
            </Box>
            <Box>
              <Text fontSize="xs" mb={1}>Opacity ({props.overlayOpacity || 0}%)</Text>
              <Input
                type="number"
                value={props.overlayOpacity || 0}
                onChange={(e) => handleNumberChange('overlayOpacity', e.target.value, 0, 100)}
                min={0}
                max={100}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};