import React, { useEffect, useRef } from 'react';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import { SectionsSettings } from './SectionsSettings';
import { getYouTubeVideoId, minimizeStyle } from '@/utils/helper';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations } from '@/components/editor/components/AnimationManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { useMultiSelectContext } from '@/components/editor/contexts/MultiSelectContext';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { useResponsivePlatformContext } from '@/components/editor/contexts/ResponsivePlatformContext';
import { useViewportSettings, getMobileWidth, getDesktopWidth } from '@/components/editor/contexts/ViewportSettingsContext';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import Sticky from 'react-sticky-el';
import { zIndex } from '@/utils/zIndex';

interface SectionsProps {
  children: React.ReactNode;
  height: string;
  width: string; // Added
  padding: number[]; // Added
  margin: number[]; // Added
  flexDirection: string; // Added
  alignItems: string; // Added
  justifyContent: string; // Added
  fillSpace: string; // Added

  // Background props (existing and new)
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

  // Filter and Opacity props (existing and new)
  backgroundOpacity: number; // Existing, might be combined or work with new opacity
  opacity: number; // Added (overall element opacity)
  blendMode: string; // Added
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number; // Added
  hueRotate: number;
  blur: number; // Existing filter blur
  sepia: number;
  invert: number; // Added

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
  backgroundVideoType: 'youtube' | 'meHappyVideo';

  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean; // Added for advanced pinning properties
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps = {
  height: 'auto',
  width: '100%', // Added
  flexDirection: 'column', // Added
  alignItems: 'center', // Added
  justifyContent: 'center', // Added
  fillSpace: 'no', // Added

  backgroundType: 'color',
  backgroundColor: '#ffffff',
  gradientType: 'linear', // Added
  gradientAngle: 90, // Renamed from gradientDeg
  gradientColor1: '#6366f1', // Renamed from gradientFrom
  gradientColor2: '#8b5cf6', // Renamed from gradientTo
  backgroundImage: '',
  backgroundVideo: '',
  backgroundVideoType: 'youtube',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat', // Added
  backgroundAttachment: 'scroll', // Added

  backgroundOpacity: 100,
  opacity: 100, // Added
  blendMode: 'normal', // Added
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0, // Added
  hueRotate: 0,
  blur: 0,
  sepia: 0,
  invert: 0, // Added

  locked: true,

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

export const Sections = (props: Partial<SectionsProps>) => {
  const {
    connectors: { connect },
    id
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  const {
    // Destructure all props for use
    height, flexDirection, alignItems, justifyContent, fillSpace,
    backgroundType, backgroundColor, gradientType, gradientAngle, gradientColor1, gradientColor2,
    backgroundImage, backgroundVideo, backgroundSize, backgroundPosition, backgroundRepeat, backgroundAttachment,
    backgroundOpacity, opacity: elementOpacity, // Renamed to avoid conflict
    blendMode, brightness, contrast, saturate, grayscale, hueRotate, blur, sepia, invert,
    children, displayAnimation,
    hoverAnimation,
    pinning, backgroundVideoType,
    hidden

  } = mergedProps;
  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // Get current platform - use ResponsivePlatformContext if available (ViewOnlyViewport), otherwise use ViewportContext (Editor)
  const { currentEditingPlatform } = useViewport();
  const responsivePlatform = useResponsivePlatformContext();

  // Use ResponsivePlatformContext if available (ViewOnlyViewport), otherwise use ViewportContext (Editor)
  const currentPlatform = responsivePlatform || currentEditingPlatform;

  // Get viewport settings
  const { settings: viewportSettings } = useViewportSettings();

  // Multi-select functionality
  const multiSelect = useMultiSelectContext();
  const { startBoxSelection, updateBoxSelection, endBoxSelection, forceEndSelection, clearSelection, isMultiSelecting, shouldPreventClearSelection } = multiSelect;

  // Custom pinning hook for Sections that handles full-width backgrounds
  const useSectionPinning = (settings: PinningSettings) => {
    // Get editor state to check if we're in edit mode
    const { enabled } = useEditor((state) => ({
      enabled: state.options.enabled,
    }));

    // Only apply pinning in preview mode and when enabled
    const shouldPin = settings?.enabled && !enabled;
    const isAutoPin = shouldPin && settings.position === 'auto';
    const isFixedPin = shouldPin && settings.position !== 'auto';

    // For auto pinning, we'll use react-sticky-el
    const getStickyProps = () => {
      if (!isAutoPin) return {};

      return {
        topOffset: -(settings.topDistance || 0),
        bottomOffset: 0,
        stickyClassName: 'auto-pinned-element sticky',
        stickyStyle: {
          zIndex: zIndex.sectionsControls,
        }
      };
    };

    // For fixed positioning, we need to handle the full-width background
    const getFixedPositionStyles = (): React.CSSProperties | null => {
      if (!isFixedPin) return null;

      const topDistance = typeof settings.topDistance === 'number' ? settings.topDistance : 0;
      const leftDistance = typeof settings.leftDistance === 'number' ? settings.leftDistance : 0;
      const rightDistance = typeof settings.rightDistance === 'number' ? settings.rightDistance : 0;
      const bottomDistance = typeof settings.bottomDistance === 'number' ? settings.bottomDistance : 0;

      const baseStyles: React.CSSProperties = {
        position: 'fixed',
        zIndex: zIndex.sectionsControls,
        width: '100vw', // Maintain full-width for sections
      };

      switch (settings.position) {
        case 'top-left':
          return {
            ...baseStyles,
            top: `${topDistance}px`,
            left: `${leftDistance}px`,
          };
        case 'top-center':
          return {
            ...baseStyles,
            top: `${topDistance}px`,
            left: '50%',
            transform: 'translateX(-50%)',
          };
        case 'top-right':
          return {
            ...baseStyles,
            top: `${topDistance}px`,
            right: `${rightDistance}px`,
          };
        case 'bottom-left':
          return {
            ...baseStyles,
            bottom: `${bottomDistance}px`,
            left: `${leftDistance}px`,
          };
        case 'bottom-center':
          return {
            ...baseStyles,
            bottom: `${bottomDistance}px`,
            left: '50%',
            transform: 'translateX(-50%)',
          };
        case 'bottom-right':
          return {
            ...baseStyles,
            bottom: `${bottomDistance}px`,
            right: `${rightDistance}px`,
          };
        case 'middle-left':
          return {
            ...baseStyles,
            top: '50%',
            left: `${leftDistance}px`,
            transform: 'translateY(-50%)',
          };
        case 'middle-right':
          return {
            ...baseStyles,
            top: '50%',
            right: `${rightDistance}px`,
            transform: 'translateY(-50%)',
          };
        default:
          return {
            ...baseStyles,
            top: `${topDistance}px`,
            left: `${leftDistance}px`,
          };
      }
    };

    return {
      shouldPin,
      isAutoPin,
      isFixedPin,
      getStickyProps,
      getFixedPositionStyles,
    };
  };

  const sectionPinning = useSectionPinning(pinning);



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
    }
    // For 'color', 'gradient', or 'image' with no actual image.
    return baseBackground;
  };

  // Generate filter CSS (adapted from Container, extended for Sections)
  const getFilterCSS = (isForVideo = false) => {
    let filterString = '';
    // Existing filters from Sections + new ones from Container
    filterString += `brightness(${brightness}%)`;
    filterString += ` contrast(${contrast}%)`;
    filterString += ` saturate(${saturate}%)`;
    filterString += ` hue-rotate(${hueRotate}deg)`;
    filterString += ` blur(${blur}px)`; // This is the filter blur, not shadowBlur
    filterString += ` sepia(${sepia}%)`;
    filterString += ` grayscale(${grayscale}%)`;
    filterString += ` invert(${invert}%)`;
    // Opacity for the element itself is handled by the 'opacity' prop directly on wrapperStyle
    // backgroundOpacity is handled on the ::before pseudo-element or video element.
    return filterString.trim() || 'none';
  };

  // Full-width background container style
  const backgroundContainerStyle: React.CSSProperties = minimizeStyle({
    position: 'relative',
    width: '100vw', // Full viewport width for background
    height,
    left: '50%',
    transform: 'translateX(-50%)', // Center the full-width container
    mixBlendMode: blendMode !== defaultProps.blendMode ? blendMode : undefined,
    opacity: elementOpacity !== defaultProps.opacity ? elementOpacity / 100 : undefined,
    filter: getFilterCSS() !== 'none' ? getFilterCSS() : undefined, // Applied to wrapper, affects children
    isolation: 'isolate', // Create stacking context to prevent section overlap issues
    // overflow: 'hidden', // Clip the oversized video to container bounds
  });

  // Content wrapper style (constrained to safe area)
  const wrapperStyle: React.CSSProperties = minimizeStyle({
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex', // Added for flex props
    flexDirection,
    alignItems,
    justifyContent,
    flex: fillSpace === 'yes' ? 1 : undefined,
  });

  const beforeStyle: React.CSSProperties = minimizeStyle({ // For main background (color, gradient, image)
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%', // Full width of the background container
    height: '100%',
    zIndex: zIndex.base,
    background: backgroundType !== 'video' ? getCombinedBackgroundCSS() : undefined,
    // backgroundSize, backgroundPosition, backgroundRepeat, backgroundAttachment are now part of the 'background' shorthand above for image type.
    opacity: backgroundType !== 'video' && backgroundOpacity !== defaultProps.backgroundOpacity ? backgroundOpacity / 100 : undefined,
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%)`.trim() || undefined,
  });


  const videoStyle: React.CSSProperties = minimizeStyle({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%', // Full width of the background container
    height: '100%', // Full height of the background container
    minWidth: '100%',
    minHeight: '100%',
    transform: 'translate(-50%, -50%)', // Center the video perfectly
    zIndex: zIndex.base,
    opacity: backgroundOpacity !== defaultProps.backgroundOpacity ? backgroundOpacity / 100 : undefined,
    filter: getFilterCSS(true), // Pass true to exclude drop-shadow for video
  });

  const contentStyle: React.CSSProperties = minimizeStyle({
    position: 'relative',
    zIndex: zIndex.contentOverlay, // Above background and overlay
    width: '100%', // Full width for mobile, constrained by maxWidth for desktop
    maxWidth: currentPlatform === 'mobile' ? getMobileWidth(viewportSettings) : getDesktopWidth(viewportSettings),
    height: '100%', // To allow content to fill section height
    margin: '0 auto', // Center content if maxWidth is applied
    minHeight: '100px', // Ensure there's always space for content
    display: 'flex', // Added for consistency if children need flex alignment
    flexDirection: 'column', // Default for content flow
    alignItems: 'stretch', // Default for content
    justifyContent: 'flex-start', // Default for content
    padding: currentPlatform === 'mobile' ? '0 16px' : '0', // Add padding for mobile
  });

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
    pointerEvents: 'none',
    ...(mergedProps.overlayType === 'image' ? {
      backgroundSize: mergedProps.overlayImageSize || 'cover',
      backgroundPosition: mergedProps.overlayImagePosition || 'center',
      backgroundRepeat: mergedProps.overlayImageRepeat || 'no-repeat',
      backgroundAttachment: mergedProps.overlayImageAttachment || 'scroll',
    } : {})
  }) : null;

  // Render video function (moved before usage)
  const renderVideo = () => {
    if (!backgroundVideo) {
      return (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '14px',
          zIndex: zIndex.base,
        }}>
          ...
        </div>
      );
    }

    if (backgroundVideoType === 'youtube') {
      const videoId = getYouTubeVideoId(backgroundVideo);
      if (!videoId) {
        return (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#666',
            fontSize: '14px',
            zIndex: zIndex.base,
          }}>
            Invalid YouTube URL
          </div>
        );
      }

      const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&controls=0&autoplay=1&mute=1&loop=1&showinfo=0`;

      return (
        <iframe
          key={`${videoId}-${backgroundVideoType}`}
          id="section_background_video"
          className="section-background-video"
          src={embedUrl}
          style={videoStyle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={false}
          referrerPolicy="strict-origin-when-cross-origin"
          title="Background Video"
        />
      );
    } else if (backgroundVideoType === 'meHappyVideo') {
      return (
        <video
          key={`${backgroundVideo}-${backgroundVideoType}`}
          src={backgroundVideo}
          autoPlay
          loop
          muted
          style={videoStyle}
        />
      );
    }

    return null;
  };

  // Zone selection handlers with debounce
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled) return;

    // Only start zone selection if clicking directly on the section (not on children)
    const target = e.target as HTMLElement;
    const isDirectClick = e.target === e.currentTarget ||
      target.classList.contains('content-container') ||
      target.classList.contains('sections-wrapper');

    // Additional checks to prevent interference with text selection and button child elements
    const isTextElement = target.tagName === 'SPAN' || target.tagName === 'P' || target.tagName === 'H1' ||
                         target.tagName === 'H2' || target.tagName === 'H3' || target.tagName === 'H4' ||
                         target.tagName === 'H5' || target.tagName === 'H6';
    const isEditableElement = target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    const hasTextContent = target.textContent && target.textContent.trim().length > 0;
    const isInsideComponent = target.closest('[data-node-id]')?.getAttribute('data-node-id') !== target.closest('.sections-wrapper')?.getAttribute('data-node-id');

    // Check if clicking inside a button or its child elements
    const isInsideButton = target.closest('.button-container') !== null;

    // Don't start multi-select if:
    // 1. Not a direct click on section containers
    // 2. Clicking on text elements with content
    // 3. Clicking on editable elements
    // 4. Clicking inside other components (like buttons, text elements, etc.)
    // 5. Clicking inside button containers
    if (!isDirectClick || (isTextElement && hasTextContent) || isEditableElement || isInsideComponent || isInsideButton) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let hasMoved = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const MOVE_THRESHOLD = 5; // pixels

    // Start the selection process (with debounce built into startBoxSelection)
    startBoxSelection(startX, startY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);

      // Only start visual selection if moved beyond threshold
      if (!hasMoved && (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD)) {
        hasMoved = true;
      }

      if (hasMoved) {
        updateBoxSelection(moveEvent.clientX, moveEvent.clientY);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (hasMoved) {
        endBoxSelection();
      } else {
        // Check if we should prevent clearing selection based on the target
        const target = upEvent.target as HTMLElement;
        const shouldPreventClear = shouldPreventClearSelection(target);

        // Force clear if no movement happened and it's safe to clear the selection
        forceEndSelection();
        if (!shouldPreventClear) {
          clearSelection();
        }
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (enabled) {
    return (
      <div
        data-node-id={id}
        className='sections-wrapper'
        ref={(dom: HTMLDivElement | null) => {
          if (dom) connect(dom);
        }}
        style={backgroundContainerStyle}
        onMouseDown={handleMouseDown}
      >
        {backgroundType !== 'video' && <div style={beforeStyle} />}
        {backgroundType === 'video' && renderVideo()}
        {overlayStyle && <div style={overlayStyle} />}
        {hidden && <OverlayHidden borderRadius={backgroundContainerStyle.borderRadius} />}
        <div
          className='content-wrapper'
          style={wrapperStyle}
        >
          <div
            className='content-container'
            style={contentStyle}
            onMouseDown={handleMouseDown}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }

  if (hidden) {
    // If hidden, return null
    return null;
  }

  // Render the section content
  const sectionContent = (
    <div
      data-node-id={id}
      className='sections-wrapper'
      ref={containerRef}
      style={sectionPinning.isFixedPin ?
        { ...backgroundContainerStyle, ...sectionPinning.getFixedPositionStyles() } :
        backgroundContainerStyle
      }
    >
      {backgroundType !== 'video' && <div style={beforeStyle} />}
      {backgroundType === 'video' && renderVideo()}
      {hidden && <OverlayHidden borderRadius={backgroundContainerStyle.borderRadius} />}
      {overlayStyle && <div style={overlayStyle} />}
      <div
        className='content-wrapper'
        style={wrapperStyle}
      >
        <div className='content-container' style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );

  // Handle different pinning modes
  if (sectionPinning.isAutoPin) {
    // Use react-sticky-el for auto pinning
    return (
      <Sticky {...sectionPinning.getStickyProps()}>
        {sectionContent}
      </Sticky>
    );
  }

  if (sectionPinning.isFixedPin) {
    // Fixed positioning is handled in the style above
    return sectionContent;
  }

  // No pinning - normal render
  return sectionContent;
};

Sections.craft = {
  displayName: 'Sections',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  related: {
    toolbar: SectionsSettings,
  },
};