import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import { GroupSettings } from './GroupSettings';
import { EventItem, useEventHandling } from '../../editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '../../editor/components/AnimationManager';
import { PinningSettings } from '../../editor/components/PinningManager';
import { minimizeStyle } from '@/utils/helper';
import { zIndex } from '@/utils/zIndex';

// Custom hooks for better separation of concerns
import { useGroupInitialSizing } from './hooks/useGroupAutoResize';
import { useGroupInteraction } from './hooks/useGroupInteraction';
import { useGroupAutoUngroup } from './hooks/useGroupAutoUngroup';

export interface GroupProps {
  children: React.ReactNode;
  width: string;
  height: string;
  left: string;
  top: string;
  events: EventItem[];
  // Animation properties
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  // Pinning properties
  pinning: PinningSettings;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps: GroupProps = {
  children: null,
  width: '200px',
  height: '100px',
  left: '0px',
  top: '0px',
  events: [],
  displayAnimation: null,
  hoverAnimation: { enabled: false },
  pinning: {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  },
  syncCrossPlatform: true, // Default to enabled
};

export const Group: UserComponent<Partial<GroupProps>> = (props) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    id,
  } = useNode((node) => ({
    childNodes: node.data.nodes || [],
  }));

  const { enabled, isActive } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    isActive: query.getEvent('selected').contains(id),
  }));

  const mergedProps = { ...defaultProps, ...props };
  const {
    children,
    width,
    height,
    left,
    top,
    events,
    displayAnimation,
    hoverAnimation,
  } = mergedProps;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Use custom hooks for better separation of concerns
  useGroupInitialSizing({
    id,
    width,
    height,
    left,
    top,
    setProp,
  });

  // Auto-ungroup when child elements are moved
  useGroupAutoUngroup({
    id,
    enabled,
  });

  const interaction = useGroupInteraction({
    id,
    enabled,
    containerRef,
  });

  // Use event handling hook
  const { handleContainerClick, handleHover } = useEventHandling(events, id);

  // Use animation hooks
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // Determine if group is selected
  const isGroupSelected = enabled && isActive;

  // Create container styles
  const containerStyles: React.CSSProperties = minimizeStyle({
    position: 'absolute',
    left,
    top,
    width,
    height,
    ...(enabled && {
      outline: isGroupSelected
        ? '2px solid #2563eb'
        : isHovered
          ? '2px dashed #6366f1'
          : '2px dashed #9c88ff',
      outlineOffset: '2px',
    }),
    ...(isGroupSelected && {
      backgroundColor: 'rgba(37, 99, 235, 0.1)', // Light blue background when selected
    }),
    ...(isHovered && !isGroupSelected && enabled && {
      backgroundColor: 'rgba(99, 102, 241, 0.05)', // Very light purple background when hovered
    }),
  });

  // Create selection overlay styles
  const selectionOverlayStyles: React.CSSProperties = minimizeStyle({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    cursor: 'move', // Always show move cursor since single click enables drag
    zIndex: zIndex.groupControls, // High z-index to ensure it's above child components
    pointerEvents: interaction.shouldShowOverlay ? 'auto' : 'none', // Enable only when overlay should be shown
  });

  // Create selection corner indicator styles
  const cornerIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#2563eb',
    border: '1px solid white',
    borderRadius: '2px',
    zIndex: zIndex.selectionControls,
  };

  const cornerIndicators = isGroupSelected ? [
    { ...cornerIndicatorStyle, top: '-4px', left: '-4px' }, // Top-left
    { ...cornerIndicatorStyle, top: '-4px', right: '-4px' }, // Top-right
    { ...cornerIndicatorStyle, bottom: '-4px', left: '-4px' }, // Bottom-left
    { ...cornerIndicatorStyle, bottom: '-4px', right: '-4px' }, // Bottom-right
  ] : [];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleContainerClick();
  };

  const handleMouseEnterGroup = () => {
    setIsHovered(true);
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    handleHover();
  };

  const handleMouseLeaveGroup = () => {
    setIsHovered(false);
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
  };

  if (enabled) {
    return (
      <div
        ref={(ref) => {
          if (ref) {
            containerRef.current = ref;
            // Connect both drag and connect for proper craft.js integration
            connect(drag(ref));
          }
        }}
        style={containerStyles}
        className='group-container'
        data-node-id={id}
        onClick={handleClick}
        onMouseEnter={handleMouseEnterGroup}
        onMouseLeave={handleMouseLeaveGroup}
      >
        {children}
        {/* Selection overlay - visible when not in child access mode */}
        {interaction.shouldShowOverlay && (
          <div
            style={selectionOverlayStyles}
            onClick={interaction.handleOverlayClick}
            onTouchEnd={interaction.isMobile ? interaction.handleOverlayTouch : undefined}
            title={interaction.isChildAccessMode ? "Child access mode - click outside to exit" : "Click to select and drag group, double-click/double-tap to access child components"}
          />
        )}
        {/* Selection corner indicators */}
        {cornerIndicators.map((style, index) => (
          <div key={index} style={style} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={(ref) => {
        if (ref) {
          containerRef.current = ref;
          // Connect both drag and connect for proper craft.js integration
          connect(drag(ref));
        }
      }}
      style={containerStyles}
      className='group-container'
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnterGroup}
      onMouseLeave={handleMouseLeaveGroup}
    >
      {children}
      {/* Selection overlay for preview mode - visible when not in child access mode */}
      {interaction.shouldShowOverlay && (
        <div
          style={selectionOverlayStyles}
          onClick={interaction.handleOverlayClick}
          onTouchEnd={interaction.isMobile ? interaction.handleOverlayTouch : undefined}
          title={interaction.isChildAccessMode ? "Child access mode - click outside to exit" : "Click to select and drag group, double-click/double-tap to access child components"}
        />
      )}
      {/* Selection corner indicators */}
      {cornerIndicators.map((style, index) => (
        <div key={index} style={style} />
      ))}
    </div>
  );
};

Group.craft = {
  displayName: 'Group',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  related: {
    toolbar: GroupSettings,
  },
};
