import React, { useEffect, useRef, useState } from 'react';

import { Element, useEditor, useNode } from '@craftjs/core';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '../../editor/components/AnimationManager';
import { PinningSettings } from '../../editor/components/PinningManager';

import { getYouTubeVideoId, minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';
import { VideoSettings } from './VideoSettings';
import { Icon } from '../Icon';
import { FaPlay } from 'react-icons/fa';
import { MdOutlineTouchApp, MdOutlineEdit } from 'react-icons/md';
import ReactDOMServer from 'react-dom/server';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { zIndex } from '@/utils/zIndex';

export type VideoProps = {
  videoType: 'youtube' | 'meHappyVideo';
  videoUrl: string;
  showControls: boolean;
  autoPlay: boolean;
  backgroundType: 'color' | 'gradient' | 'image';
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
  iconComponent?: any;
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
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean; // Added for advanced pinning properties
  syncCrossPlatform?: boolean; // Cross-platform sync control
};

const defaultProps = {
  videoType: 'youtube' as const,
  videoUrl: '',
  showControls: true,
  autoPlay: false,
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
  iconComponent: {
    ...(Icon.craft?.props || {}),
    isChildOfButton: true,
  },
  hidden: false,
  syncCrossPlatform: true, // Default to enabled
};

export const Video = (props: Partial<VideoProps>) => {
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const {
    videoType,
    videoUrl,
    showControls,
    autoPlay,
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
    iconComponent,
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
    displayAnimation,
    hoverAnimation,
    hidden,
    pinning,
  } = mergedProps;
  const currentPadding = padding || defaultProps.padding;
  const currentMargin = margin || defaultProps.margin;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;  // Use the event handling hook
  const {
    id,
  } = useNode((node) => ({
    id: node.id,
  }));
  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Use the hover animation hook
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // State to manage video play status
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoPlay);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(true);
  const [showToggleButton, setShowToggleButton] = useState(false);

  // Auto-hide toggle button after 3 seconds
  useEffect(() => {
    if (showToggleButton) {
      const timer = setTimeout(() => {
        setShowToggleButton(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToggleButton]);

  // Update playing state when autoPlay prop changes
  useEffect(() => {
    setIsVideoPlaying(autoPlay);
  }, [autoPlay]);




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
    cursor: (!isVideoPlaying && !enabled) ? 'pointer' : 'default',
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

  // Function to render video content
  const renderVideoContent = () => {
    if (!videoUrl) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '14px'
        }}>
          Nhập URL video
        </div>
      );
    }

    if (videoType === 'youtube') {
      const videoId = getYouTubeVideoId(videoUrl);
      if (!videoId) {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#666',
            fontSize: '14px'
          }}>
            URL YouTube không hợp lệ
          </div>
        );
      }

      // Disable autoplay in editor mode
      const shouldAutoPlay = autoPlay && !enabled;
      const embedUrl = `https://www.youtube.com/embed/${videoId}?${shouldAutoPlay ? 'autoplay=1&' : ''}${showControls ? 'controls=1' : 'controls=0'}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

      return (
        <iframe
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="YouTube video player"
          frameBorder="0"
          loading="lazy"
        />
      );
    } else if (videoType === 'meHappyVideo') {
      // Disable autoplay in editor mode
      const shouldAutoPlay = autoPlay && !enabled;
      return (
        <video
          src={videoUrl}
          controls={showControls}
          autoPlay={shouldAutoPlay}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      );
    }

    return null;
  };
  const renderIconPlay = () => (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: zIndex.videoControls,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Element
        id={'icon'}
        is={Icon}
        {...iconComponent}
        width='20px'
        height='20px'
        svgCode={ReactDOMServer.renderToString(<FaPlay />)}
        isChildOfButton={true}
        canvas
      />
    </div>
  )
  // Enhanced click handler
  const handleClick = () => {
    // Prevent video from playing in editor mode
    if (enabled) {
      return;
    }

    if (!isVideoPlaying) {
      setIsVideoPlaying(true);
    }
  };

  // Enhanced hover handlers to include hover animations
  const handleMouseEnter = () => {
    if (enabled) {
      setShowToggleButton(true);
    } else {
      // Apply hover animations in preview mode
      if (containerRef.current) {
        applyHoverStyles(containerRef.current, true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (enabled) {
      setShowToggleButton(false);
    } else {
      // Remove hover animations in preview mode
      if (containerRef.current) {
        applyHoverStyles(containerRef.current, false);
      }
    }
  };

  const containerContent = (
    <div className='flex items-center justify-center'
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isVideoPlaying && !enabled ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {renderVideoContent()}
          {enabled && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: zIndex.videoOverlay,
                  cursor: isOverlayEnabled ? 'pointer' : 'default',
                  pointerEvents: isOverlayEnabled ? 'auto' : 'none',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: isOverlayEnabled ? 'transparent' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (isOverlayEnabled) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={(e) => {
                  if (!isOverlayEnabled) return;
                  e.stopPropagation();
                  const iframe = e.currentTarget.parentElement?.querySelector('iframe');
                  if (iframe) {
                    iframe.style.pointerEvents = 'none';
                    setTimeout(() => {
                      if (iframe) {
                        iframe.style.pointerEvents = 'auto';
                      }
                    }, 100);
                  }
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  zIndex: zIndex.videoControls,
                  opacity: showToggleButton ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOverlayEnabled(!isOverlayEnabled);
                  setShowToggleButton(true); // Reset the auto-hide timer
                }}
                title={isOverlayEnabled ? "Tắt overlay để điều khiển video" : "Bật overlay để chọn element"}
              >
                {isOverlayEnabled ? (
                  <MdOutlineTouchApp color="white" size={16} />
                ) : (
                  <MdOutlineEdit color="white" size={16} />
                )}
                <span style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {isOverlayEnabled ? 'Bật điều khiển video' : 'Tắt điều khiển video'}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {renderIconPlay()}
        </div>
      )}
      {children}
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
        {hidden && <OverlayHidden borderRadius={fullContainerStyles.borderRadius} />}
      </Resizer>
    );
  }

  if (hidden) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={containerStyles}
      className='container'
      data-node-id={id}
    >
      {containerContent}
    </div>
  );
};

Video.craft = {
  displayName: 'Video',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: VideoSettings,
  },
};
