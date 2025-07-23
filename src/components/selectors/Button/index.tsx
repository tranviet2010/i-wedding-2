import React, { useEffect, useRef } from 'react';


import { minimizeStyle } from '@/utils/helper';
import { Element, useEditor, useNode } from '@craftjs/core';
import { Resizer } from '../Resizer';
import { Text } from '../Text';
import { ButtonMenuSettings, ButtonSettings } from './ButtonSettings';
import { Icon } from '../Icon';
import { heartIcon } from '@/utils/iconTemplate';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { useButtonInteraction } from './hooks/useButtonInteraction';
import { zIndex } from '@/utils/zIndex';
export type ButtonProps = {
  lockAspectRatio?: boolean;
  text?: string;
  textComponent?: any;
  iconComponent?: any;
  background: string;
  backgroundType: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;
  color: string;
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
  overlayImagePosition: string; overlayImageRepeat: string;
  overlayImageAttachment: string;
  currentSetting: 'button' | 'text' | 'icon' | null;
  showIcon: boolean;
  iconHorizontalPosition: number;
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean;
  isChildOfForm?: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
};

const defaultProps = {
  text: 'Button',
  textComponent: {
    ...(Text.craft?.props || {}),
    textAlign: 'center',
    width: '100%',
    isChildOfButton: true,
  },
  iconComponent: {
    ...(Icon.craft?.props || {}),
    isChildOfButton: true,
  },
  fillSpace: 'no',
  padding: [0, 0, 0, 0],
  background: '#ffffff',
  backgroundType: 'solid',
  gradientType: 'linear',
  gradientAngle: 90,
  gradientColor1: '#4158D0',
  gradientColor2: '#C850C0',
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'scroll',
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
  lockAspectRatio: false,
  overlayType: 'none',
  overlayBlendMode: 'normal',
  overlayOpacity: 50,
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  overlayGradientType: 'linear',
  overlayGradientAngle: 90,
  overlayGradientColor1: '#4158D0',
  overlayGradientColor2: '#C850C0',
  overlayImage: '',
  overlayImageSize: 'cover', overlayImagePosition: 'center',
  overlayImageRepeat: 'no-repeat',
  overlayImageAttachment: 'scroll',
  currentSetting: null,
  events: [],
  displayAnimation: null,
  hoverAnimation: { enabled: false },
  showIcon: false,
  iconHorizontalPosition: 16,
  pinning: {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  },
  hidden: false,
  isChildOfForm: false,
  syncCrossPlatform: true, // Default to enabled
};

export const Button = (props: Partial<ButtonProps>) => {
  const {
    id,
    linkedNodes,
    selected,
    connectors: { connect },
  } = useNode((node) => ({
    selected: node.events.selected,
    enabled: node.data.props.enabled,
    id: node.id,
    linkedNodes: node.data.linkedNodes,
  }));
  const { actions, enabled, query } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    query,
  }));
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  const {
    text,
    textComponent,
    background,
    color,
    padding,
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
    lockAspectRatio,
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
    iconComponent,
    currentSetting,
    events,
    displayAnimation,
    hoverAnimation,
    showIcon,
    iconHorizontalPosition,
    pinning,
    hidden
  } = mergedProps;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;
  // Get editor state

  const [hasBeenSelected, setHasBeenSelected] = React.useState(false);
  // Use the event handling hook
  const { handleContainerClick, handleHover } = useEventHandling(events, id);
  const containerRef = useRef<HTMLDivElement>(null);
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

  // Use button interaction hook for child access mode (like Group component)
  const interaction = useButtonInteraction({
    id,
    enabled,
    containerRef,
  });

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);
  // Enhanced hover handler to include animations
  const handleMouseEnter = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    handleHover();
  };


  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
  };

  // Enhanced click handler to execute events in preview mode
  const handleClick = () => {
    // If button is inside a form, trigger form submission
    if (mergedProps.isChildOfForm && !enabled) {
      // Find the parent form element and trigger its submit event
      const buttonElement = containerRef.current;
      if (buttonElement) {
        const formElement = buttonElement.closest('form');
        if (formElement) {
          console.log('🔘 Button triggering form submission...');
          // Create and dispatch a submit event
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          formElement.dispatchEvent(submitEvent);
          return; // Don't execute regular click events for form buttons
        }
      }
    }

    // Regular click handling for non-form buttons
    handleContainerClick();
  };
  // Using refs to track component state and prevent auto-selection
  const initialMount = React.useRef(true);
  const selectedRef = React.useRef(selected);
  const currentSettingRef = React.useRef(currentSetting);

  useEffect(() => {
    if (selected && !hasBeenSelected) {
      setHasBeenSelected(true);
    }
  }, [selected])
  useEffect(() => {
    // Skip automatic node selection on initial render
    if (initialMount.current) {
      return; // Don't do anything on first render
    }
    if (currentSetting && currentSetting !== currentSettingRef.current) {
      currentSettingRef.current = currentSetting;

      // Handle tab selection
      switch (currentSetting) {
        case 'button':
          if (hasBeenSelected) {
            actions.selectNode(id);
          }
          break;
        case 'text':
          const textNodeId = linkedNodes['text' + id];
          actions.selectNode(textNodeId);
          break;
        case 'icon':
          const iconNodeId = linkedNodes['icon' + id];
          actions.selectNode(iconNodeId);
          break;
        default:
          break;
      }
    }
  }, [currentSetting, id, linkedNodes, actions]);

  // Handle selection changes
  React.useEffect(() => {
    // Initialize everything on first render
    if (initialMount.current) {
      initialMount.current = false;
      selectedRef.current = selected;
      currentSettingRef.current = currentSetting;
      return; // Skip all actions on first render
    }

    // Only respond to user-initiated selection changes
    if (selected !== selectedRef.current) {
      selectedRef.current = selected;

      if (selected) {
        actions.setProp(id, (props: any) => {
          props.currentSetting = 'button';
        });
      } else {
        actions.setProp(id, (props: any) => {
          props.currentSetting = null;
        });
      }
    }
  }, [selected, id, actions, currentSetting]);
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

  // Generate background CSS based on background type
  const getBackgroundCSS = () => {
    const { backgroundType, background, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, backgroundAttachment } = mergedProps;

    if (backgroundType === 'image' && backgroundImage && backgroundImage.trim() !== '') {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: backgroundSize || 'cover',
        backgroundPosition: backgroundPosition || 'center center',
        backgroundRepeat: backgroundRepeat || 'no-repeat',
        backgroundAttachment: backgroundAttachment || 'scroll',
      };
    }

    // For solid colors and gradients, use the background property as before
    return {
      background: background !== defaultProps.background ? background : defaultProps.background,
    };
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
  // Create full style object
  const backgroundStyles = getBackgroundCSS();
  const fullContainerStyles = {
    width,
    height,
    ...backgroundStyles,
    color: color !== defaultProps.color ? color : undefined,
    padding: "5px 10px",
    boxShadow: getShadowCSS() !== 'none' ? getShadowCSS() : undefined,
    filter: getFilterCSS() !== 'contrast(100%) brightness(100%) saturate(100%) grayscale(0%) opacity(100%) invert(0%) sepia(0%) hue-rotate(0deg)'
      ? getFilterCSS()
      : undefined,
    opacity: (mergedProps.opacity || 100) / 100,
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    minHeight: minHeight !== defaultProps.minHeight ? minHeight : undefined,
    position: 'absolute',
    top: (top != defaultProps.top ? top : undefined),
    left: (left != defaultProps.left ? left : undefined),
    mixBlendMode: blendMode != defaultProps.blendMode ? blendMode as any : undefined,
    cursor: 'pointer',
    transform: [
      rotate != defaultProps.rotate ? `rotate(${rotate}deg)` : '',
      rotateX != defaultProps.rotateX ? `rotateX(${rotateX}deg)` : '',
      rotateY != defaultProps.rotateY ? `rotateY(${rotateY}deg)` : '',
      skewX != defaultProps.skewX ? `skewX(${skewX}deg)` : '',
      skewY != defaultProps.skewY ? `skewY(${skewY}deg)` : '',
      perspective !== defaultProps.perspective ? `perspective(${perspective}px)` : '',
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
        }
    ),
  };

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

  // Create overlay styles based on overlay type
  const getOverlayStyles = () => {
    if (!mergedProps.overlayType || mergedProps.overlayType === 'none') {
      return { backgroundOverlay: null, contentOverlay: null };
    }

    const baseOverlayStyle = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: getOverlayBackgroundCSS(),
      borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
      mixBlendMode: mergedProps.overlayBlendMode || 'normal',
      opacity: (mergedProps.overlayOpacity || 100) / 100,
      pointerEvents: 'none' as const,
      ...(mergedProps.overlayType === 'image' ? {
        backgroundSize: mergedProps.overlayImageSize || 'cover',
        backgroundPosition: mergedProps.overlayImagePosition || 'center',
        backgroundRepeat: mergedProps.overlayImageRepeat || 'no-repeat',
        backgroundAttachment: mergedProps.overlayImageAttachment || 'scroll',
      } : {})
    };

    if (mergedProps.overlayType === 'color' || mergedProps.overlayType === 'gradient') {
      return {
        backgroundOverlay: minimizeStyle({
          ...baseOverlayStyle,
          zIndex: zIndex.behind, // Behind content
        }),
        contentOverlay: null
      };
    }

    if (mergedProps.overlayType === 'image') {
      return {
        backgroundOverlay: null,
        contentOverlay: minimizeStyle({
          ...baseOverlayStyle,
        })
      };
    }

    return { backgroundOverlay: null, contentOverlay: null };
  };

  const { backgroundOverlay, contentOverlay } = getOverlayStyles();  // Conditional rendering based on editor state
  if (enabled) {
    // Editor mode - no animations or event handling
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={{ ...containerStyles }}
        className='button-container'
        lockAspectRatio={lockAspectRatio}
      >
        {/* Background overlay for color/gradient overlays - positioned relative to Resizer */}
        {backgroundOverlay && <div style={backgroundOverlay} />}

        <div className='relative flex items-center w-full h-full overflow-hidden'>
          {/* Icon with absolute positioning */}
          {showIcon && (
            <div style={{
              position: 'absolute',
              left: `${iconHorizontalPosition}px`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}>
              <Element
                id={'icon' + id}
                is={Icon}
                {...iconComponent}
                width='20px'
                height='20px'
                svgCode={iconComponent?.svgCode || heartIcon}
                isChildOfButton={true}
                canvas
              />
            </div>
          )}
          {/* Text centered */}
          <div className='w-full flex items-center justify-center'>
            <Element
              id={'text' + id}
              is={Text}
              text={textComponent?.text || text}
              color={textComponent?.color || color}
              {...textComponent}
              width="100%"
              isChildOfButton={true}
              canvas
            />
          </div>
        </div>

        {/* Content overlay for image overlays - positioned relative to Resizer */}
        {contentOverlay && <div style={contentOverlay} />}

        {/* Selection overlay for child access mode - visible when not in child access mode */}
        {interaction.shouldShowOverlay && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              zIndex: zIndex.ui,
            }}
            onClick={interaction.handleOverlayClick}
            onTouchEnd={interaction.isMobile ? interaction.handleOverlayTouch : undefined}
            title={interaction.isChildAccessMode ? "Child access mode - click outside to exit" : "Click to select and drag button, double-click/double-tap to access child components (text and icon)"}
          />
        )}

        {hidden && <OverlayHidden borderRadius={fullContainerStyles.borderRadius} />}
      </Resizer>
    );
  }
  if (hidden) {
    // If the button is hidden, return null
    return null;
  }
  // Preview mode - with animations and event handling
  return (
    <div
      ref={containerRef}
      style={{ ...containerStyles }}
      className='button-container'
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background overlay for color/gradient overlays - positioned relative to main container */}
      {backgroundOverlay && <div style={backgroundOverlay} />}

      <div className='relative flex items-center justify-center w-full h-full overflow-hidden'>
        {/* Icon with absolute positioning */}
        {showIcon && (
          <div style={{
            position: 'absolute',
            left: `${iconHorizontalPosition}px`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <Element
              id={'icon' + id}
              is={Icon}
              {...iconComponent}
              width='20px'
              height='20px'
              svgCode={iconComponent?.svgCode || heartIcon}
              isChildOfButton={true}
              canvas
            />
          </div>
        )}
        {/* Text centered */}
        <div className='w-full flex items-center justify-center' >
          <Element
            id={'text' + id}
            is={Text}
            text={textComponent?.text || text}
            color={textComponent?.color || color}
            {...textComponent}
            width="100%"
            isChildOfButton={true}
            canvas
          />
        </div>
      </div>

      {/* Content overlay for image overlays - positioned relative to main container */}
      {contentOverlay && <div style={contentOverlay} />}
    </div>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    ...defaultProps,
    background: { r: 255, g: 255, b: 255, a: 0.5 },
    color: { r: 92, g: 90, b: 90, a: 1 },
    buttonStyle: 'full',
    text: 'Button',
    textComponent: {
      ...(Text.craft?.props || {}),
      textAlign: 'center',
      width: '100%',
      isChildOfButton: true,
    },
    enabled: true,
  },
  related: {
    toolbar: ButtonSettings,
    subToolbar: ButtonMenuSettings
  },
  rules: {
    canDrag: () => true,
  },
};
