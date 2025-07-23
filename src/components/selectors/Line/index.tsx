import React, { useEffect, useRef } from 'react';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import { minimizeStyle } from '@/utils/helper';
import { LineSettings } from './LineSettings';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { EventItem, useEventHandling } from '@/components/editor/components/EventManager';
import { Resizer } from '../Resizer';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';

interface LineProps {
  // Size
  width: string;
  height: string;
  minHeight: string;
  top: number;
  left: number;
  direction: 'vertical' | 'horizontal';
  padding: number;

  // Border & Border Radius
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;
  radius: number | string;
  borderRadius: number[];

  // Filter
  blendMode: string;
  contrast: number;
  brightness: number;
  saturate: number;
  grayscale: number;
  opacity: number;
  invert: number;
  sepia: number;
  hueRotate: number;
  blur: number;

  // Transform
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  transformOrigin: string;
  scale: number;

  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden: boolean;
  syncCrossPlatform: boolean; // Cross-platform sync control
}

const defaultProps: LineProps = {
  width: '100px',
  height: '100px',
  minHeight: 'none',
  top: 0,
  left: 0,
  direction: 'horizontal',
  padding: 0,
  borderWidth: [5, 0, 0, 0],
  borderStyle: 'solid',
  borderColor: '#000000',
  radius: 0,
  borderRadius: [0, 0, 0, 0],
  blendMode: 'normal',
  contrast: 100,
  brightness: 100,
  saturate: 100,
  grayscale: 0,
  opacity: 100,
  invert: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  perspective: 0,
  transformOrigin: 'center center',
  scale: 100,
  events: [],
  displayAnimation: null,
  hoverAnimation: { enabled: false },  // Advanced pinning properties
  pinning: {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  },
  hidden: false,
  syncCrossPlatform: true, // Default to enabled
};

export const Line: UserComponent<Partial<LineProps>> = (props) => {
  const {
    connectors: { connect },
    id
  } = useNode((node) => ({
    id: node.id,
  }));
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const mergedProps = { ...defaultProps, ...props }; const {
    width,
    height,
    minHeight,
    top,
    left,
    direction,
    padding,
    borderWidth,
    borderStyle,
    borderColor,
    radius,
    borderRadius,
    blendMode,
    contrast,
    brightness,
    saturate,
    grayscale,
    opacity,
    invert,
    sepia,
    hueRotate,
    rotate,
    rotateX,
    rotateY,
    skewX,
    skewY,
    perspective,
    transformOrigin,
    scale,
    events,
    displayAnimation,
    hoverAnimation,
    pinning,
    hidden
  } = mergedProps;
  const containerRef = useRef<HTMLDivElement>(null);
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);
  const { handleContainerClick, handleHover } = useEventHandling(events, id);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // Enhanced hover handler to include animations
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    if (!enabled) {
      handleHover();
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
  };

  // Enhanced click handler to only execute events in preview mode
  const handleClick = (e: React.MouseEvent) => {
    if (!enabled) {
      handleContainerClick();
    }
  };
  // Generate filter CSS
  const getFilterCSS = () => {
    let filterString = '';

    // Add other filters
    filterString += `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturate}%) grayscale(${grayscale}%) opacity(${opacity}%) invert(${invert}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;

    return filterString.trim();
  };  // Container styles - positioning, sizing, effects, transforms
  const fullContainerStyles = {
    width: direction === 'vertical' ? `${borderWidth[0] + (padding * 2)}px` : width,
    height: direction === 'vertical' ? height : `${borderWidth[0] + (padding * 2)}px`,
    padding: direction === 'vertical' ? `0 10px` : `10px 0`,
    position: 'absolute',
    top: (top != defaultProps.top ? `${top.toString().includes("px") ? top : top + "px"}` : undefined),
    left: (left != defaultProps.left ? `${left.toString().includes("px") ? left : left + "px"}` : undefined),
    opacity: (mergedProps.opacity || 100) / 100,
    mixBlendMode: blendMode !== defaultProps.blendMode ? blendMode : undefined,
    filter: getFilterCSS() !== 'contrast(100%) brightness(100%) saturate(100%) grayscale(0%) opacity(100%) invert(0%) sepia(0%) hue-rotate(0deg)'
      ? getFilterCSS()
      : undefined,
    transform: [
      scale !== defaultProps.scale ? `scale(${scale / 100})` : '',
      rotate !== defaultProps.rotate ? `rotate(${rotate}deg)` : '',
      rotateX !== defaultProps.rotateX ? `rotateX(${rotateX}deg)` : '',
      rotateY !== defaultProps.rotateY ? `rotateY(${rotateY}deg)` : '',
      skewX !== defaultProps.skewX ? `skewX(${skewX}deg)` : '',
      skewY !== defaultProps.skewY ? `skewY(${skewY}deg)` : '',
      perspective !== defaultProps.perspective ? `perspective(${perspective}px)` : '',
    ].filter(Boolean).join(' ') || undefined,
    transformOrigin: transformOrigin !== defaultProps.transformOrigin ? transformOrigin : undefined,
  };

  // Line styles - only border-related properties, adjusted for direction
  const fullLineStyles = {
    width: '100%',
    height: '100%',
    borderWidth: direction === 'vertical'
      ? `0 0 0 ${borderWidth[0]}px`
      : `${borderWidth[0]}px 0 0 0`,
    borderStyle,
    borderColor,
    borderRadius: typeof radius === 'string' && radius.includes('%')
      ? radius
      : borderRadius[0] === borderRadius[1] &&
        borderRadius[1] === borderRadius[2] &&
        borderRadius[2] === borderRadius[3]
        ? `${borderRadius[0]}px`
        : `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`,
  };

  const containerStyles = minimizeStyle(fullContainerStyles);
  const lineStyles = minimizeStyle(fullLineStyles);
  if (enabled) {
    return (
      <Resizer
        propKey={direction === 'vertical' ? { height: 'height' } : { width: 'width' }}
        style={containerStyles}
        className='container'
      >
        <div
          style={lineStyles}
        />
        {hidden && <OverlayHidden />}
      </Resizer>
    );
  }

  if (hidden) {
    return null;
  }
  return (
    <div
      ref={containerRef}
      style={containerStyles}
      className='container'
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={lineStyles} />
    </div>
  );
};

Line.craft = {
  displayName: 'Line',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: LineSettings,
  },
};