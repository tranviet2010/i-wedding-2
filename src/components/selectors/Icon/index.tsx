import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { minimizeStyle } from '@/utils/helper';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import React, { useEffect, useRef } from 'react';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { Resizer } from '../Resizer';
import { IconSettings } from './IconSettings';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';

export interface IconsProps {
  svgCode: string;
  iconColor: string;
  width: string;
  height: string;
  objectFit: string;
  borderWidth: number[] | number;
  borderColor: string;
  borderStyle: string;
  borderRadius: number[] | number;
  radius: number;
  shadow: number;
  shadowType: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  opacity: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  invert: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  skewX: number;
  skewY: number;
  perspective: number;
  overlayColor: string;
  overlayOpacity: number;
  blendMode: string; top: number;
  left: number;
  lockAspectRatio?: boolean;
  isChildOfButton?: boolean;
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps: IconsProps = {
  svgCode: '',
  iconColor: '',
  lockAspectRatio: true,
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  borderWidth: [0, 0, 0, 0],
  borderColor: '#000000',
  borderStyle: 'solid',
  borderRadius: [0, 0, 0, 0],
  radius: 0,
  shadow: 0,
  shadowType: 'none',
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: '#000000',
  opacity: 100,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  hueRotate: 0,
  blur: 0,
  sepia: 0,
  transformOrigin: 'center center',
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 100,
  skewX: 0,
  skewY: 0,
  perspective: 0,
  overlayColor: '#000000',
  overlayOpacity: 0, blendMode: 'normal',
  top: 0,
  left: 0,
  isChildOfButton: false,
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

export const Icon: UserComponent<Partial<IconsProps>> = (props) => {
  const {
    connectors: { connect },
    actions: { setProp },
    parent,
    selected,
    id
  } = useNode((node) => ({
    parent: node.data.parent,
    selected: node.events.selected,
    id: node.id,
  }));
  const { actions, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const mergedProps = { ...defaultProps, ...props };
  const {
    svgCode,
    iconColor,
    width,
    height,
    objectFit,
    borderWidth,
    borderColor,
    borderStyle,
    borderRadius,
    radius,
    shadow,
    shadowType,
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    shadowColor,
    opacity,
    brightness,
    contrast,
    saturate,
    grayscale,
    invert,
    hueRotate,
    blur,
    sepia,
    transformOrigin,
    rotate,
    rotateX,
    rotateY,
    rotateZ,
    scale,
    skewX,
    skewY,
    perspective,
    lockAspectRatio,
    blendMode,
    top,
    left,
    pinning,
    events,
    displayAnimation,
    hoverAnimation,
    hidden
  } = mergedProps;
  // Use the event handling hook
  const { handleContainerClick, handleHover } = useEventHandling(events, id);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to apply icon color to SVG
  const applyIconColorToSvg = (svgString: string, color: string): string => {
    if (!svgString || !color) return svgString;

    // Parse the SVG and apply the fill color
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (svgElement) {
      // Apply fill color to the SVG element and all its children
      svgElement.setAttribute('fill', color);

      // Also apply to path elements that might not inherit the fill
      const pathElements = svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');
      pathElements.forEach(element => {
        // Only set fill if it's not already set to 'none' or if it's currently set to a color
        const currentFill = element.getAttribute('fill');
        if (!currentFill || (currentFill !== 'none' && currentFill !== 'transparent')) {
          element.setAttribute('fill', color);
        }
      });

      return new XMLSerializer().serializeToString(svgDoc);
    }

    return svgString;
  };

  // Apply icon color to SVG code if color is specified
  const processedSvgCode = iconColor ? applyIconColorToSvg(svgCode, iconColor) : svgCode;

  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

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
  const [isInsideButton, setIsInsideButton] = React.useState(mergedProps.isChildOfButton);
  React.useEffect(() => {
    if (mergedProps.isChildOfButton) {
      setIsInsideButton(true);
      return;
    }

    if (parent) {
      const isButton = parent.includes('Button');
      setIsInsideButton(isButton);

      if (isButton) {
        setProp((props: any) => {
          props.position = 'static';
          props.top = 'auto';
          props.left = 'auto';
        });
      }
    }
  }, [parent, mergedProps.isChildOfButton, setProp]);
  React.useEffect(() => {
    if (selected && isInsideButton) {
      actions.setProp(parent!, (props: any) => {
        props.currentSetting = 'icon';
      });
    }
  }, [selected, isInsideButton]);

  // Generate filter CSS
  const getFilterCSS = () => {
    return `
      opacity(${opacity}%)
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturate}%)
      grayscale(${grayscale}%)
      invert(${invert}%)
      hue-rotate(${hueRotate}deg)
      blur(${blur}px)
      sepia(${sepia}%)
    `.trim();
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

    // Format based on shadow type
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

  // Generate border radius CSS
  const getBorderRadiusCSS = () => {
    // If borderRadius array is provided, use it
    if (Array.isArray(borderRadius) && borderRadius.length === 4) {
      // If all values are the same, use the single value
      if (
        borderRadius[0] === borderRadius[1] &&
        borderRadius[1] === borderRadius[2] &&
        borderRadius[2] === borderRadius[3]
      ) {
        return `${borderRadius[0]}px`;
      }
      // Otherwise use individual corner values
      return `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`;
    }

    // Fall back to the legacy radius property or simple borderRadius
    if (typeof radius === 'number' && radius > 0) {
      return `${radius}px`;
    } else if (typeof borderRadius === 'number' && borderRadius > 0) {
      return `${borderRadius}px`;
    }

    return '0px';
  };

  // Handle border width
  const getBorderCSS = () => {
    if (borderStyle === 'none') {
      return undefined;
    }

    if (Array.isArray(borderWidth) && borderWidth.length === 4) {
      if (
        borderWidth[0] === borderWidth[1] &&
        borderWidth[1] === borderWidth[2] &&
        borderWidth[2] === borderWidth[3] &&
        borderWidth[0] === 0
      ) {
        return undefined;
      }

      if (
        borderWidth[0] === borderWidth[1] &&
        borderWidth[1] === borderWidth[2] &&
        borderWidth[2] === borderWidth[3]
      ) {
        return `${borderWidth[0]}px ${borderStyle} ${borderColor}`;
      }

      return {
        borderTopWidth: `${borderWidth[0]}px`,
        borderRightWidth: `${borderWidth[1]}px`,
        borderBottomWidth: `${borderWidth[2]}px`,
        borderLeftWidth: `${borderWidth[3]}px`,
        borderStyle,
        borderColor
      };
    }

    // Fallback for simple number
    const bw = typeof borderWidth === 'number' ? borderWidth : 0;
    return bw > 0 ? `${bw}px ${borderStyle} ${borderColor}` : undefined;
  };

  // Create full container style object
  const fullContainerStyles = {
    width: isInsideButton ? '20px' : width,
    height: isInsideButton ? '20px' : height,
    ...(typeof getBorderCSS() === 'string' ? { border: getBorderCSS() as string } : {}),
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    boxShadow: getShadowCSS() !== 'none' ? getShadowCSS() : undefined,
    transformOrigin,
    mixBlendMode: blendMode !== 'normal' ? blendMode : '',
    transform: [
      rotate !== 0 ? `rotate(${rotate}deg)` : '',
      scale !== 100 ? `scale(${scale / 100})` : '',
      rotateX !== 0 ? `rotateX(${rotateX}deg)` : '',
      rotateY !== 0 ? `rotateY(${rotateY}deg)` : '',
      rotateZ !== 0 ? `rotateZ(${rotateZ}deg)` : '',
      skewX !== 0 ? `skewX(${skewX}deg)` : '',
      skewY !== 0 ? `skewY(${skewY}deg)` : '',
      perspective !== 0 ? `perspective(${perspective}px)` : '',
    ].filter(Boolean).join(' ') || undefined,
    opacity: (mergedProps.opacity || 100) / 100,
    position:  isInsideButton ? 'static' : 'absolute',
    top:  mergedProps.top !== defaultProps.top ? `${top.toString().includes("px") ? top : top + "px"}` : undefined,
    left:  mergedProps.left !== defaultProps.left ? `${left.toString().includes("px") ? left : left + "px"}` : undefined,
  };

  // Minimize container styles
  const containerStyles = minimizeStyle(fullContainerStyles);

  // Drop-shadow filter if shadowType is 'filter'
  let filterString = '';
  if (shadowType === 'filter') {
    const x = shadowX || 0;
    const y = shadowY || 0;
    const blur = shadowBlur || 0;
    const color = shadowColor || 'rgba(0, 0, 0, 0.2)';
    filterString += `drop-shadow(${x}px ${y}px ${blur}px ${color}) `;
  }

  // Create image style
  const fullImageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    overflow: 'hidden',
    filter: (getFilterCSS() !== 'opacity(100%) brightness(100%) contrast(100%) saturate(100%) grayscale(0%) invert(0%) hue-rotate(0deg) blur(0px) sepia(0%)')
      ? `${filterString}${getFilterCSS()}`
      : undefined,
  };

  // Minimize image styles
  const imageStyles = minimizeStyle(fullImageStyles);

  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        className='icon-container'
        lockAspectRatio={lockAspectRatio}
        enable={!isInsideButton}
        isChildOfButton={isInsideButton}
        onClick={isInsideButton ? handleContainerClick : null}
        onMouseEnter={isInsideButton ? handleHover : null}
      >
        {processedSvgCode ? (
          <div
            className='wrapper-svg'
            dangerouslySetInnerHTML={{ __html: processedSvgCode }}
            style={imageStyles}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            border: '1px dashed #ccc',
            fontSize: '12px'
          }}>
            No SVG code
          </div>
        )}
        {hidden && <OverlayHidden borderRadius={fullContainerStyles.borderRadius} />}
      </Resizer>
    )
  };

  if (hidden) {
    return null;
  }
  return (
    <div
      ref={containerRef}
      style={containerStyles}
      className='icon-container'
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {processedSvgCode ? (
        <div
          className='wrapper-svg'
          dangerouslySetInnerHTML={{ __html: processedSvgCode }}
          style={imageStyles}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          border: '1px dashed #ccc',
          fontSize: '12px'
        }}>
          No SVG code
        </div>
      )}
    </div>
  )
};

Icon.craft = {
  displayName: 'Icon',
  props: defaultProps,
  rules: {
    canDrag: (node) => {
      const isChildOfButton = node.data.props.isChildOfButton ||
        (node.data.parent && node.data.parent.includes('Button'));
      const isChildOfGroup = node.data.props.isChildOfGroup ||
        (node.data.parent && node.data.parent.includes('Group'));
      return !isChildOfButton && !isChildOfGroup;
    },
  },
  related: {
    toolbar: IconSettings,
  },
};