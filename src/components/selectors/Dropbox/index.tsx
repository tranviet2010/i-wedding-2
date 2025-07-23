import { minimizeStyle } from '@/utils/helper';
import { useEditor, useNode, Element } from '@craftjs/core';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { zIndex } from '@/utils/zIndex';
import { DisplayAnimationItem, HoverAnimationSettings, useDisplayAnimations, useHoverAnimations } from '../../editor/components/AnimationManager';
import { EventItem, useEventHandling } from '../../editor/components/EventManager';
import { PinningSettings } from '../../editor/components/PinningManager';
import { useViewport } from '../../editor/Viewport/ViewportContext';
import { Resizer } from '../Resizer';
import { DropboxSettings } from './DropboxSettings';

export interface DropboxProps {
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;
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
}

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
  gradientType: 'linear',
  gradientAngle: 90,
  gradientColor1: '#6366f1',
  gradientColor2: '#8b5cf6',
  backgroundImage: '',
  backgroundVideo: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
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
  width: '200px',
  height: '150px',
  minHeight: 'none',
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
  hoverAnimation: { enabled: false },
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
}

// Animation utility functions
const getAnimationDirection = (position: string): 'top' | 'bottom' | 'left' | 'right' => {
  if (position.startsWith('top-')) return 'top';
  if (position.startsWith('bottom-')) return 'bottom';
  if (position.startsWith('left-')) return 'left';
  if (position.startsWith('right-')) return 'right';
  return 'bottom'; // default
};

const getInitialTransform = (direction: 'top' | 'bottom' | 'left' | 'right'): string => {
  switch (direction) {
    case 'top':
      return 'scale(0.95) translateY(-5px)';
    case 'bottom':
      return 'scale(0.95) translateY(5px)';
    case 'left':
      return 'scale(0.95) translateX(-5px)';
    case 'right':
      return 'scale(0.95) translateX(5px)';
    default:
      return 'scale(0.95) translateY(5px)';
  }
};

const getFinalTransform = (): string => {
  return 'scale(1) translate(0)';
};

// Animation state type
type AnimationState = 'hidden' | 'appearing' | 'visible' | 'disappearing';

export const Dropbox = (props: Partial<DropboxProps>) => {
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const { enabled, actions } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const {
    connectors: { connect },
    id,
    selected
  } = useNode((node) => ({
    id: node.id,
    selected: node.events.selected
  }));

  const {
    closeDropbox,
    currentDropboxIdOpen,
    dropboxPosition,
    dropboxDistance,
    dropboxTriggerElementId,
    currentDropboxEditorIdOpen,
    closeDropboxEditor,
    setDropboxHoverState,
    scheduleDropboxClose,
    cancelDropboxClose
  } = useViewport();

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
  } = mergedProps;

  // Get dropbox open state from viewport context
  const isOpenInPreview = id === currentDropboxIdOpen;
  const isOpenInEditor = id === currentDropboxEditorIdOpen;
  const isOpen = isOpenInPreview || isOpenInEditor;



  // High-performance animation state management
  const [animationState, setAnimationState] = useState<AnimationState>('hidden');
  const animationTimeoutRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);

  // Determine animation direction based on position
  const animationDirection = getAnimationDirection(dropboxPosition);

  // Clear animation timeout on unmount
  const clearAnimationTimeout = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const currentPadding = padding || defaultProps.padding;
  const currentMargin = margin || defaultProps.margin;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;

  // Use the event handling hook
  const { handleContainerClick, handleHover } = useEventHandling(events, id);

  const containerRef = useRef<HTMLDivElement>(null);
  const { applyAnimation } = useDisplayAnimations(displayAnimation);
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

  const hoverTimeoutRef = useRef<number | null>(null);
  // Apply display animations on mount and when animations change
  useEffect(() => {
    if (containerRef.current && displayAnimation && displayAnimation.effect !== 'none') {
      applyAnimation(containerRef.current);
    }
  }, [displayAnimation, applyAnimation]);

  // High-performance animation lifecycle management
  useEffect(() => {
    // Clear any existing timeout first
    clearAnimationTimeout();

    if (isOpen && !enabled) {
      // Dropbox should be opening - immediate state transition for performance
      if (animationState === 'hidden' || animationState === 'disappearing') {
        // CRITICAL: Set to appearing immediately for instant DOM presence
        setAnimationState('appearing');

        // Use requestAnimationFrame for smooth transition to visible state
        // This ensures the element is rendered immediately but animates smoothly
        requestAnimationFrame(() => {
          setAnimationState('visible');
        });
      }
    } else if (!isOpen && !enabled) {
      // Dropbox should be closing
      if (animationState === 'visible' || animationState === 'appearing') {
        setAnimationState('disappearing');

        // Transition to hidden after animation completes
        animationTimeoutRef.current = window.setTimeout(() => {
          setAnimationState('hidden');
        }, 150);
      }
    }
    // Note: In editor mode (enabled=true), we don't manage animation state
  }, [isOpen, enabled, animationState, clearAnimationTimeout]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      clearHoverTimeout();
      clearAnimationTimeout();
    };
  }, [clearAnimationTimeout]);

  // Update position on scroll when dropbox is open in preview mode
  useEffect(() => {
    if (!isOpenInPreview || enabled || isOpenInEditor) return;

    let animationFrameId: number | null = null;

    const updatePosition = () => {
      if (containerRef.current) {
        const newPosition = calculatePosition();
        Object.assign(containerRef.current.style, newPosition);
      }
    };

    const scheduleUpdate = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    // Update position on scroll, resize, and focus events
    const handleScroll = () => scheduleUpdate();
    const handleResize = () => scheduleUpdate();
    const handleFocus = () => {
      // Small delay to ensure DOM is updated after focus
      setTimeout(scheduleUpdate, 10);
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again, update position
        setTimeout(scheduleUpdate, 10);
      }
    };

    // Also listen for trigger element changes (in case it moves)
    const handleMutation = () => {
      scheduleUpdate();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    // Watch for DOM changes that might affect trigger element position
    let mutationObserver: MutationObserver | null = null;
    if (dropboxTriggerElementId) {
      const triggerElement = document.querySelector(`[data-node-id="${dropboxTriggerElementId}"]`);
      if (triggerElement) {
        mutationObserver = new MutationObserver(handleMutation);
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
    }

    // Initial position update
    scheduleUpdate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [isOpenInPreview, enabled, isOpenInEditor, dropboxTriggerElementId, dropboxPosition, dropboxDistance]);

  // Hover management functions
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };
  // Enhanced hover handler to include animations and hover management
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    if (!enabled && id) {
      // Tell the global system that dropbox is being hovered
      setDropboxHoverState(id, true);
      cancelDropboxClose(id);
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
    if (!enabled && id) {
      // Tell the global system that dropbox is no longer being hovered
      setDropboxHoverState(id, false);
      scheduleDropboxClose(id);
    }
  };

  // Enhanced click handler to only execute events in preview mode
  const handleClick = (e: React.MouseEvent) => {
    if (!enabled) {
      handleContainerClick();
    }
  };

  // Handle outside click to close dropbox
  useEffect(() => {
    if (!isOpenInPreview || enabled) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Don't close if clicking on the dropbox itself
      if (containerRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking on the trigger element
      if (dropboxTriggerElementId) {
        const triggerElement = document.querySelector(`[data-node-id="${dropboxTriggerElementId}"]`);
        if (triggerElement?.contains(target)) {
          return;
        }
      }

      // Close the dropbox
      closeDropbox();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpenInPreview, enabled, dropboxTriggerElementId, closeDropbox]);

  // Generate shadow CSS
  const getShadowCSS = () => {
    if (!shadowType || shadowType === 'none') {
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

    if (shadowType === 'outer') {
      return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    } else if (shadowType === 'inner') {
      return `inset ${x}px ${y}px ${blur}px ${spread}px ${color}`;
    } else if (shadowType === 'filter') {
      return 'none';
    }

    return 'none';
  };

  // Generate filter CSS for drop-shadow
  const getFilterCSS = () => {
    let filterString = '';

    if (shadowType === 'filter') {
      const x = shadowX || 0;
      const y = shadowY || 0;
      const blur = shadowBlur || 0;
      const color = shadowColor || 'rgba(0, 0, 0, 0.2)';
      filterString += `drop-shadow(${x}px ${y}px ${blur}px ${color}) `;
    }

    filterString += `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturate}%) grayscale(${grayscale}%) opacity(${opacity}%) invert(${invert}%) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;

    return filterString.trim();
  };

  // Generate border radius CSS
  const getBorderRadiusCSS = () => {
    if (typeof radius === 'string' && radius.includes('%')) {
      return radius;
    }

    if (borderRadius && borderRadius.length === 4) {
      if (
        currentBorderRadius[0] === currentBorderRadius[1] &&
        currentBorderRadius[1] === currentBorderRadius[2] &&
        currentBorderRadius[2] === currentBorderRadius[3]
      ) {
        return `${currentBorderRadius[0]}px`;
      }
      return `${currentBorderRadius[0]}px ${currentBorderRadius[1]}px ${currentBorderRadius[2]}px ${currentBorderRadius[3]}px`;
    }

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
    return 'none';
  };

  const getCombinedBackgroundCSS = () => {
    const baseBackground = getMainBackgroundCSS();

    if (backgroundType === 'image' && backgroundImage && baseBackground !== 'none') {
      return `${baseBackground} ${backgroundPosition} / ${backgroundSize} ${backgroundRepeat} ${backgroundAttachment}`;
    }
    return baseBackground;
  };

  // High-performance animation styles with immediate visual feedback
  const getAnimationStyles = (positionTransform?: string) => {
    // Don't apply animations in editor mode
    if (enabled || isOpenInEditor) {
      return {};
    }

    // Combine position transform with animation transform
    const combineTransforms = (animationTransform: string) => {
      if (positionTransform) {
        return `${positionTransform} ${animationTransform}`;
      }
      return animationTransform;
    };

    // Optimized animation states for immediate feedback
    switch (animationState) {
      case 'hidden':
        return {
          opacity: 0,
          transform: combineTransforms(getInitialTransform(animationDirection)),
          pointerEvents: 'none' as const,
          // No transition on hidden state for immediate appearance
        };
      case 'appearing':
        return {
          opacity: 0,
          transform: combineTransforms(getInitialTransform(animationDirection)),
          // No transition yet - will be added when transitioning to visible
        };
      case 'visible':
        return {
          opacity: 1,
          transform: combineTransforms(getFinalTransform()),
          transition: 'opacity 200ms cubic-bezier(0, 0, 0.2, 1), transform 200ms cubic-bezier(0, 0, 0.2, 1)',
        };
      case 'disappearing':
        return {
          opacity: 0,
          transform: combineTransforms(getInitialTransform(animationDirection)),
          transition: 'opacity 150ms cubic-bezier(0.4, 0, 1, 1), transform 150ms cubic-bezier(0.4, 0, 1, 1)',
        };
      default:
        return {};
    }
  };

  // Calculate position based on mode (editor vs preview)
  const calculatePosition = () => {
    // In editor mode, display as centered modal overlay
    if (isOpenInEditor) {
      return {
                position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: zIndex.dropbox
      };
    }

    // In preview mode, position relative to trigger element
    if (!dropboxTriggerElementId) {
      return {
                position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: zIndex.dropbox
      };
    }

    // Find trigger element using data-node-id attribute (more reliable than getElementById)
    const triggerElement = document.querySelector(`[data-node-id="${dropboxTriggerElementId}"]`) as HTMLElement;
    if (!triggerElement) {
      console.warn(`Trigger element not found for dropbox: ${dropboxTriggerElementId}`);
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: zIndex.dropboxMain
      };
    }

    const triggerRect = triggerElement.getBoundingClientRect();
    const distance = dropboxDistance || 10;

    // Find the section container to calculate relative position
    const sectionElement = triggerElement.closest('.sections-wrapper') as HTMLElement;
    const sectionRect = sectionElement ? sectionElement.getBoundingClientRect() : { top: 0, left: 0 };

    // Calculate position relative to the section container
    let top = 0;
    let left = 0;
    let transform = '';

    switch (dropboxPosition) {
      case 'top-left':
        top = triggerRect.top - sectionRect.top - distance;
        left = triggerRect.left - sectionRect.left;
        transform = 'translateY(-100%)';
        break;
      case 'top-center':
        top = triggerRect.top - sectionRect.top - distance;
        left = triggerRect.left - sectionRect.left + triggerRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'top-right':
        top = triggerRect.top - sectionRect.top - distance;
        left = triggerRect.right - sectionRect.left;
        transform = 'translate(-100%, -100%)';
        break;
      case 'bottom-left':
        top = triggerRect.bottom - sectionRect.top + distance;
        left = triggerRect.left - sectionRect.left;
        break;
      case 'bottom-center':
        top = triggerRect.bottom - sectionRect.top + distance;
        left = triggerRect.left - sectionRect.left + triggerRect.width / 2;
        transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
        top = triggerRect.bottom - sectionRect.top + distance;
        left = triggerRect.right - sectionRect.left;
        transform = 'translateX(-100%)';
        break;
      case 'left-top':
        top = triggerRect.top - sectionRect.top;
        left = triggerRect.left - sectionRect.left - distance;
        transform = 'translateX(-100%)';
        break;
      case 'left-center':
        top = triggerRect.top - sectionRect.top + triggerRect.height / 2;
        left = triggerRect.left - sectionRect.left - distance;
        transform = 'translate(-100%, -50%)';
        break;
      case 'left-bottom':
        top = triggerRect.bottom - sectionRect.top;
        left = triggerRect.left - sectionRect.left - distance;
        transform = 'translate(-100%, -100%)';
        break;
      case 'right-top':
        top = triggerRect.top - sectionRect.top;
        left = triggerRect.right - sectionRect.left + distance;
        break;
      case 'right-center':
        top = triggerRect.top - sectionRect.top + triggerRect.height / 2;
        left = triggerRect.right - sectionRect.left + distance;
        transform = 'translateY(-50%)';
        break;
      case 'right-bottom':
        top = triggerRect.bottom - sectionRect.top;
        left = triggerRect.right - sectionRect.left + distance;
        transform = 'translateY(-100%)';
        break;
      default:
        top = triggerRect.bottom - sectionRect.top + distance;
        left = triggerRect.left - sectionRect.left + triggerRect.width / 2;
        transform = 'translateX(-50%)';
    }

    // Ensure the dropbox stays within section bounds
    const sectionWidth = sectionElement ? sectionElement.offsetWidth : window.innerWidth;
    const sectionHeight = sectionElement ? sectionElement.offsetHeight : window.innerHeight;

    const dropboxWidth = parseFloat(width.toString()) || 200;
    const dropboxHeight = parseFloat(height.toString()) || 150;

    if (left < 0) {
      left = 10;
      transform = transform.replace(/translateX\([^)]*\)/, '');
    } else if (left + dropboxWidth > sectionWidth) {
      left = sectionWidth - dropboxWidth - 10;
      transform = transform.replace(/translateX\([^)]*\)/, '');
    }

    if (top < 0) {
      top = 10;
      transform = transform.replace(/translateY\([^)]*\)/, '');
    } else if (top + dropboxHeight > sectionHeight) {
      top = sectionHeight - dropboxHeight - 10;
      transform = transform.replace(/translateY\([^)]*\)/, '');
    }

    return {
      position: 'absolute' as const,
      top: `${top}px`,
      left: `${left}px`,
      transform: transform || undefined,
      zIndex: zIndex.dropbox
    };
  };

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
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    flex: fillSpace === 'yes' ? 1 : undefined,
    minHeight: minHeight !== defaultProps.minHeight ? minHeight : undefined,
    mixBlendMode: blendMode != defaultProps.blendMode ? blendMode as any : undefined,
    transform: [
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

  // Apply positioning and animations
  const positionStyles = calculatePosition();
  const animationStyles = getAnimationStyles(positionStyles.transform);

  // Merge styles, but let animation styles override transform if present
  const fullContainerStyles = {
    ...baseContainerStyles,
    ...positionStyles,
    ...animationStyles
  };
  const containerStyles = minimizeStyle(fullContainerStyles);

  // Find the nearest section container to render the dropbox within (must be before any returns)
  const sectionContainer = React.useMemo(() => {
    if (!dropboxTriggerElementId || !isOpenInPreview) return null;

    const triggerElement = document.querySelector(`[data-node-id="${dropboxTriggerElementId}"]`);
    if (!triggerElement) return null;

    // Find the nearest section wrapper
    const sectionWrapper = triggerElement.closest('.sections-wrapper');
    return sectionWrapper;
  }, [dropboxTriggerElementId, isOpenInPreview]);

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


  // Handle escape key to close dropbox
  useEffect(() => {
    if (!isOpen || enabled) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isOpenInEditor) {
          closeDropboxEditor();
        } else {
          closeDropbox();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, enabled, isOpenInEditor, closeDropbox, closeDropboxEditor]);

  // High-performance render condition for immediate visual feedback
  const shouldRender =
    // Always render in editor mode when selected
    (enabled && selected) ||
    // Always render when open in editor mode
    isOpenInEditor ||
    // CRITICAL: Render immediately when isOpen becomes true, regardless of animation state
    // This ensures sub-16ms response time
    (!enabled && isOpen) ||
    // Also render during animation states (appearing, disappearing)
    (!enabled && animationState !== 'hidden');

  if (!shouldRender) {
    return null;
  }

  // Create the dropbox content
  const dropboxContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {overlayStyle && <div style={overlayStyle} />}
      <div style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );

  // In editor mode, render with backdrop for modal behavior
  if (isOpenInEditor) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: zIndex.dropboxOverlay,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Resizer
          propKey={{ width: 'width', height: 'height' }}
          style={containerStyles}
          className='dropbox-modal'
          lockAspectRatio={lockAspectRatio}
          innerref={(dom: HTMLDivElement | null) => {
            if (dom) connect(dom);
          }}
        >
          {dropboxContent}
        </Resizer>
      </div>
    );
  }

  // In edit mode (but not editor mode), render with resizer
  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        className='dropbox-tooltip'
        lockAspectRatio={lockAspectRatio}
        innerref={(dom: HTMLDivElement | null) => {
          if (dom) connect(dom);
        }}
      >
        {dropboxContent}
      </Resizer>
    )
  }

  // In preview mode, render positioned relative to trigger using portal to section

  // Create the dropbox element with performance optimizations
  const dropboxElement = (
    <div
      ref={containerRef}
      style={{
        ...containerStyles,
        // Performance optimization: Use will-change to hint browser for GPU acceleration
        willChange: animationState !== 'hidden' ? 'opacity, transform' : 'auto',
        // Ensure element is on its own layer for smooth animations
        backfaceVisibility: 'hidden',
        // Prevent layout shifts during animation
        contain: 'layout style paint',
      }}
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {dropboxContent}
    </div>
  );

  // If we have a section container, render the dropbox within it using portal
  if (sectionContainer) {
    return ReactDOM.createPortal(dropboxElement, sectionContainer);
  }

  // Fallback: render normally if no section container found
  return dropboxElement;
};

Dropbox.craft = {
  displayName: 'Dropbox',
  props: defaultProps,
  related: {
    toolbar: DropboxSettings,
  },
};
