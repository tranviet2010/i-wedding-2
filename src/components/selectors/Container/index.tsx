import React, { useRef } from 'react';

import { useEditor, useNode } from '@craftjs/core';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '../../../components/editor/components/AnimationManager';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { PinningSettings } from '../../../components/editor/components/PinningManager';
import { ContainerSettings } from './ContainerSettings';

import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';

export type ContainerProps = {
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientType: string; // Added (for consistency, though Sections might handle gradients differently)
  gradientAngle: number; // Renamed from gradientDeg for consistency
  gradientColor1: string; // Renamed from gradientFrom
  gradientColor2: string; // Renamed from gradientTo
  backgroundImage: string;
  backgroundVideo: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string; // Added
  backgroundAttachment: string; // Added
  color: string;
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  fillSpace: string;
  width: string;
  height: string;
  padding: number[];
  margin: number[];
  shadow: number;
  shadowType: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  children: React.ReactNode;
  radius: number | string;
  borderRadius: number[];
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;
  minHeight: string;
  top: number;
  left: number;
  blendMode: string;
  contrast: number;
  brightness: number;
  saturate: number;
  grayscale: number;
  opacity: number;
  invert: number;
  sepia: number;
  hueRotate: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  transformOrigin: string;
  lockAspectRatio?: boolean;
  overlayType: 'none' | 'color' | 'gradient' | 'image';
  overlayBlendMode: string;
  overlayOpacity: number;
  overlayColor: string;
  overlayGradientType: string;
  overlayGradientAngle: number;
  overlayGradientColor1: string;
  overlayGradientColor2: string;
  overlayImage: string;
  overlayImageSize: string;
  overlayImagePosition: string;
  overlayImageRepeat: string;
  overlayImageAttachment: string;
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean; // Added for advanced pinning properties
  syncCrossPlatform?: boolean; // Cross-platform sync control
};

const defaultProps = {
  lockAspectRatio: false,
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  padding: [0, 0, 0, 0],
  margin: [0, 0, 0, 0],
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  gradientType: 'linear', // Added
  gradientAngle: 90, // Renamed from gradientDeg
  gradientColor1: '#6366f1', // Renamed from gradientFrom
  gradientColor2: '#8b5cf6', // Renamed from gradientTo
  backgroundImage: '',
  backgroundVideo: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat', // Added
  backgroundAttachment: 'scroll', // Added
  color: '#000000',
  shadow: 0,
  shadowType: 'none',
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: '#000000',
  radius: 0,
  borderRadius: [0, 0, 0, 0],
  borderWidth: [0, 0, 0, 0],
  borderStyle: 'none',
  borderColor: '#000000',
  width: '100%',
  height: 'auto',
  minHeight: 'none',
  top: 0,
  left: 0,
  blendMode: 'normal',
  contrast: 100,
  brightness: 100,
  saturate: 100,
  grayscale: 0,
  opacity: 100,
  invert: 0,
  sepia: 0,
  hueRotate: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  perspective: 0,
  transformOrigin: 'center center',
  overlayType: 'none',
  overlayBlendMode: 'normal',
  overlayOpacity: 50,
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  overlayGradientType: 'linear',
  overlayGradientAngle: 90,
  overlayGradientColor1: '#4158D0',
  overlayGradientColor2: '#C850C0',
  overlayImage: '',
  overlayImageSize: 'cover',
  overlayImagePosition: 'center',
  overlayImageRepeat: 'no-repeat',
  overlayImageAttachment: 'scroll',
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

export const Container = (props: Partial<ContainerProps>) => {
  const {
    connectors: { connect },
    id
  } = useNode((node) => ({
    id: node.id,
  }));

  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  const {
    flexDirection,
    alignItems,
    justifyContent,
    fillSpace,
    backgroundImage,
    backgroundType,
    backgroundPosition,
    backgroundSize,
    backgroundRepeat,
    backgroundAttachment,
    backgroundColor,
    color,
    padding,
    margin,
    shadow,
    shadowType,
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    shadowColor,
    radius,
    borderRadius,
    borderWidth,
    borderStyle,
    borderColor,
    width,
    height,
    children,
    minHeight,
    top,
    left,
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
    lockAspectRatio,
    gradientAngle,
    gradientType,
    gradientColor1,
    gradientColor2,
    events,
    displayAnimation,
    hoverAnimation,
    pinning,
    hidden
  } = mergedProps;
  const currentPadding = padding || defaultProps.padding;
  const currentMargin = margin || defaultProps.margin;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;  // Use the event handling hook
  const { handleContainerClick, handleHover, handleTriggerMouseEnter, handleTriggerMouseLeave } = useEventHandling(events, id);

  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const containerRef = useRef<HTMLDivElement>(null);
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // Enhanced hover handler to include animations and dropbox trigger management
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    if (!enabled) {
      handleTriggerMouseEnter(); // This handles both hover events and dropbox hover state
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
    if (!enabled) {
      handleTriggerMouseLeave(); // This handles dropbox hover state cleanup
    }
  };

  // Enhanced click handler to only execute events in preview mode
  const handleClick = (e: React.MouseEvent) => {
    if (!enabled) {
      handleContainerClick();
    }
  };

  // Generate shadow CSS
  const getShadowCSS = () => {
    // If shadow type is none or not set, return none
    if (!shadowType || shadowType === 'none') {
      // Legacy shadow support
      if (shadow && shadow > 0) {
        return `0px 3px ${shadow}px rgba(0, 0, 0, 0.13)`;
      }
      return 'none';
    }

    const x = shadowX || 0;
    const y = shadowY || 0;
    const blur = shadowBlur || 0;
    const spread = shadowSpread || 0;
    const color = shadowColor || 'rgba(0, 0, 0, 0.2)';

    // Format in the requested style: "27px 15px 20px -15px #000"
    if (shadowType === 'outer') {
      return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    } else if (shadowType === 'inner') {
      return `inset ${x}px ${y}px ${blur}px ${spread}px ${color}`;
    } else if (shadowType === 'filter') {
      // For filter type, we'll use drop-shadow filter
      return 'none'; // We'll apply this as a filter instead
    }

    return 'none';
  };

  // Generate filter CSS for drop-shadow
  const getFilterCSS = () => {
    let filterString = '';

    // Add shadow filter if type is 'filter'
    if (shadowType === 'filter') {
      const x = shadowX || 0;
      const y = shadowY || 0;
      const blur = shadowBlur || 0;
      const color = shadowColor || 'rgba(0, 0, 0, 0.2)';
      filterString += `drop-shadow(${x}px ${y}px ${blur}px ${color}) `;
    }

    // Add other filters
    filterString += `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturate}%) grayscale(${grayscale}%) opacity(${opacity}%) invert(${invert}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;

    return filterString.trim();
  };

  // Generate border radius CSS
  const getBorderRadiusCSS = () => {
    // Special case for percentage radius (used for full rounding)
    if (typeof radius === 'string' && radius.includes('%')) {
      return radius;
    }

    // If borderRadius array is provided, use it
    if (borderRadius && borderRadius.length === 4) {
      // If all values are the same, use the single value
      if (
        currentBorderRadius[0] === currentBorderRadius[1] &&
        currentBorderRadius[1] === currentBorderRadius[2] &&
        currentBorderRadius[2] === currentBorderRadius[3]
      ) {
        return `${currentBorderRadius[0]}px`;
      }
      // Otherwise use individual corner values
      return `${currentBorderRadius[0]}px ${currentBorderRadius[1]}px ${currentBorderRadius[2]}px ${currentBorderRadius[3]}px`;
    }

    // Fall back to the legacy radius property
    return typeof radius === 'number' ? `${radius}px` : radius;
  };

  const getMainBackgroundCSS = () => {
    if (backgroundType === 'color') {
      return backgroundColor;
    } else if (backgroundType === 'gradient') {
      const type = gradientType || 'linear';
      const angle = gradientAngle || 0;
      const color1 = gradientColor1 || '#ffffff';
      const color2 = gradientColor2 || '#000000';
      return type === 'linear'
        ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
        : `radial-gradient(circle, ${color1}, ${color2})`;
    } else if (backgroundType === 'image' && backgroundImage) {
      return `url(${backgroundImage})`;
    }
    return 'none'; // No background if video or none
  };

  // New helper function for combined background CSS shorthand
  const getCombinedBackgroundCSS = () => {
    // This function is intended to be called when backgroundType is NOT 'video'.
    const baseBackground = getMainBackgroundCSS();

    if (backgroundType === 'image' && backgroundImage && baseBackground !== 'none') {
      // Construct the full shorthand for images
      // Format: url(path) position / size repeat attachment
      return `${baseBackground} ${backgroundPosition} / ${backgroundSize} ${backgroundRepeat} ${backgroundAttachment}`;
    }    // For 'color', 'gradient', or 'image' with no actual image.
    return baseBackground;
  };

  // Create full style object
  const baseContainerStyles = {
    width,
    height,
    justifyContent: justifyContent !== defaultProps.justifyContent ? justifyContent : undefined,
    flexDirection: flexDirection !== defaultProps.flexDirection ? flexDirection : undefined,
    alignItems: alignItems !== defaultProps.alignItems ? alignItems : undefined,
    background: getCombinedBackgroundCSS(),
    color: color !== defaultProps.color ? color : undefined,
    padding: currentPadding.some((val, i) => val !== defaultProps.padding[i])
      ? `${currentPadding[0]}px ${currentPadding[1]}px ${currentPadding[2]}px ${currentPadding[3]}px`
      : undefined,
    margin: currentMargin.some((val, i) => val !== defaultProps.margin[i])
      ? `${currentMargin[0]}px ${currentMargin[1]}px ${currentMargin[2]}px ${currentMargin[3]}px`
      : undefined,
    boxShadow: getShadowCSS() !== 'none' ? getShadowCSS() : undefined,
    opacity: (mergedProps.opacity || 100) / 100,
    filter: getFilterCSS() !== 'contrast(100%) brightness(100%) saturate(100%) grayscale(0%) opacity(100%) invert(0%) sepia(0%) hue-rotate(0deg)'
      ? getFilterCSS()
      : undefined,
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined, flex: fillSpace === 'yes' ? 1 : undefined,
    minHeight: minHeight !== defaultProps.minHeight ? minHeight : undefined,
    // Regular positioning (disabled when pinning is active in preview mode)
    position: 'absolute',
    top: (top != defaultProps.top ? `${top.toString().includes("px") ? top : top + "px"}` : undefined),
    left: (left != defaultProps.left ? `${left.toString().includes("px") ? left : left + "px"}` : undefined),
    mixBlendMode: blendMode != defaultProps.blendMode ? blendMode as any : undefined, transform: [
      rotate != defaultProps.rotate ? `rotate(${rotate}deg)` : '',
      rotateX != defaultProps.rotateX ? `rotateX(${rotateX}deg)` : '',
      rotateY != defaultProps.rotateY ? `rotateY(${rotateY}deg)` : '',
      skewX != defaultProps.skewX ? `skewX(${skewX}deg)` : '',
      skewY != defaultProps.skewY ? `skewY(${skewY}deg)` : '',
      perspective != defaultProps.perspective ? `perspective(${perspective}px)` : '',
    ].filter(Boolean).join(' ') || undefined,
    transformOrigin: transformOrigin !== defaultProps.transformOrigin ? transformOrigin : undefined,
    ...(borderStyle === 'none'
      ? { border: 'none' }
      : currentBorderWidth[0] === currentBorderWidth[1] &&
        currentBorderWidth[1] === currentBorderWidth[2] &&
        currentBorderWidth[2] === currentBorderWidth[3]
        ? { border: `${currentBorderWidth[0]}px ${borderStyle} ${borderColor}` }
        : {
          borderTopWidth: `${currentBorderWidth[0]}px`,
          borderRightWidth: `${currentBorderWidth[1]}px`,
          borderBottomWidth: `${currentBorderWidth[2]}px`,
          borderLeftWidth: `${currentBorderWidth[3]}px`,
          borderStyle,
          borderColor,
        }),
  };

  // Apply legacy pinning styles (not used anymore with react-stickynode wrapper)
  const fullContainerStyles = baseContainerStyles;

  const containerStyles = minimizeStyle(fullContainerStyles);

  // Generate overlay CSS if overlay type is set
  const getOverlayBackgroundCSS = () => {
    if (!mergedProps.overlayType || mergedProps.overlayType === 'none') {
      return 'none';
    }

    if (mergedProps.overlayType === 'color') {
      return mergedProps.overlayColor || 'rgba(0, 0, 0, 0.5)';
    } else if (mergedProps.overlayType === 'gradient') {
      const type = mergedProps.overlayGradientType || 'linear';
      const angle = mergedProps.overlayGradientAngle || 90;
      const color1 = mergedProps.overlayGradientColor1 || '#4158D0';
      const color2 = mergedProps.overlayGradientColor2 || '#C850C0';
      return type === 'linear'
        ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
        : `radial-gradient(circle, ${color1}, ${color2})`;
    } else if (mergedProps.overlayType === 'image' && mergedProps.overlayImage) {
      return `url(${mergedProps.overlayImage})`;
    }

    return 'none';
  };

  // Create overlay style
  const overlayStyle = mergedProps.overlayType && mergedProps.overlayType !== 'none' ? minimizeStyle({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: getOverlayBackgroundCSS(),
    mixBlendMode: mergedProps.overlayBlendMode || 'normal',
    opacity: (mergedProps.overlayOpacity || 100) / 100,
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    pointerEvents: 'none',
    ...(mergedProps.overlayType === 'image' ? {
      backgroundSize: mergedProps.overlayImageSize || 'cover',
      backgroundPosition: mergedProps.overlayImagePosition || 'center',
      backgroundRepeat: mergedProps.overlayImageRepeat || 'no-repeat',
      backgroundAttachment: mergedProps.overlayImageAttachment || 'scroll',
    } : {})
  }) : null;
  // Create the container content
  const containerContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {overlayStyle && <div style={overlayStyle} />}
      {children}
      {hidden && <OverlayHidden borderRadius={fullContainerStyles.borderRadius} />}
    </div>
  );

  // In edit mode, use Resizer wrapper
  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        className='container'
        lockAspectRatio={lockAspectRatio}
      >
        {containerContent}
      </Resizer>
    );
  }

  if (hidden) {
    // If hidden, return null
    return null;
  }
  // In preview mode, return container wrapped with PinnedWrapper
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
      {containerContent}
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};
