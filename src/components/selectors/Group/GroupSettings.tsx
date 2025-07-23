import { useNode } from '@craftjs/core';
import { Box, Stack, Tabs } from '@chakra-ui/react';
import { EventItem, EventManager } from '../../editor/components/EventManager';
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings } from '../../editor/components/AnimationManager';
import { PinningManager, PinningSettings } from '../../editor/components/PinningManager';
import { useState } from 'react';
import { GroupProps } from '.';
import CrossPlatformSyncToggle from '@/components/editor/components/CrossPlatformSyncToggle';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';

export const GroupSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));
  const [settingType, setSettingType] = useState('event');
  const updateProp = (key: keyof GroupProps, value: any) => {
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
  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'buttonsetting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs block sm:!hidden'>
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
        <Tabs.Content value="default" className="p-4">
          <Stack>
            <NodeControlsPanel
              showDragHandle={false}
              showLayerControls={true}
              showContainerSpecificControls={true}
            />
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
