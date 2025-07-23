import { useEditor, useNode } from '@craftjs/core';
import React, { useEffect, useState, useRef } from 'react';
import { minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { CountSettings } from './CountSettings';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';

export interface CountProps {
  // Countdown settings
  countType: 'minutes' | 'endTime'; // Kiểu
  countMode: 'countdown' | 'countup'; // Loại
  minutes: number; // Phút (when countType is 'minutes')
  endTime: string; // Thời gian kết thúc (when countType is 'endTime')
  autoSwitchToCountUp: boolean; // Auto switch to count up when countdown reaches zero

  // Display options
  showDays: boolean; // Hiện ngày
  showHours: boolean; // Hiện giờ
  showMinutes: boolean; // Hiện phút
  showSeconds: boolean; // Hiện giây
  spacing: number; // Khoảng cách ô chữ (in px)

  fontSize: string;
  textAlign: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  shadow: number;
  text: string;
  enabled: boolean;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
  textDecoration: string;
  width: string;
  opacity: number;
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  blendMode: string;
  contrast: number;
  brightness: number;
  saturate: number;
  grayscale: number;
  invert: number;
  sepia: number;
  hueRotate: number;
  position: string;
  top: number;
  left: number;
  radius: number;
  borderRadius: number[];
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;
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
  shadowType: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;

  // Standard selector properties
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps = {
  countType: 'minutes',
  countMode: 'countdown',
  minutes: 10,
  endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
  autoSwitchToCountUp: true, // Default to enabled
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true,
  spacing: 8,
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#000000',
  textAlign: 'center',
  width: 'auto',
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
  fontFamily: 'inherit',
  fontStyle: 'normal',
  shadow: 0,
  text: 'Text',
  enabled: true,
  isChildOfButton: false,
  lineHeight: '1.4',
  letterSpacing: '0',
  textTransform: 'none',
  textDecoration: 'none',
  opacity: 100,
  transformOrigin: 'center center',
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  perspective: 0,
  blendMode: 'normal',
  contrast: 100,
  brightness: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  sepia: 0,
  hueRotate: 0,
  position: 'absolute',
  top: 0, left: 0,
  backgroundType: 'color',
  backgroundColor: '#ffffff00',
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
  syncCrossPlatform: true, // Default to enabled
};

interface TimeDisplay {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const Count = (props: Partial<CountProps>) => {
  const {
    connectors: { connect },
    parent,
    id
  } = useNode((node) => ({
    parent: node.data.parent,
    id: node.id,
  }));
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const {
    backgroundImage,
    backgroundType,
    backgroundPosition,
    backgroundSize,
    backgroundRepeat,
    backgroundAttachment,
    backgroundColor,
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
    gradientAngle,
    gradientType,
    gradientColor1,
    gradientColor2,
    width,
  } = mergedProps;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;
  const [timeDisplay, setTimeDisplay] = useState<TimeDisplay>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false); // Track if we've auto-switched to count-up
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef<Date | null>(null);
  const countdownEndTimeRef = useRef<Date | null>(null); // Store when countdown ended for count-up reference

  // Use the event handling hook
  const { handleContainerClick } = useEventHandling(mergedProps.events, id);

  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Initialize target time and start time based on countType
  const initializeTargetTime = (): Date => {
    if (mergedProps.countType === 'endTime') {
      return new Date(mergedProps.endTime);
    } else {
      // For minutes type, calculate from current time only once
      return new Date(Date.now() + mergedProps.minutes * 60 * 1000);
    }
  };

  // Store the start time for count up mode
  const startTimeRef = useRef<Date | null>(null);

  // Update countdown/countup
  const updateTime = () => {
    if (!targetTimeRef.current) {
      targetTimeRef.current = initializeTargetTime();
    }

    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }

    const now = new Date();
    const target = targetTimeRef.current;
    const startTime = startTimeRef.current;

    let diff: number;
    let days: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0;

    // Determine current effective mode
    if (mergedProps.countMode === 'countdown' && !hasAutoSwitched) {
      // Countdown: show time remaining until target
      diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        // Countdown has reached zero
        if (mergedProps.autoSwitchToCountUp) {
          // Auto-switch to count-up mode
          if (!hasAutoSwitched) {
            setHasAutoSwitched(true);
            countdownEndTimeRef.current = target; // Store when countdown ended
          }
          // Start counting up from zero immediately
          const elapsed = now.getTime() - target.getTime();
          days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
          hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
          seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        } else {
          // Stay at zero if auto-switch is disabled
          setTimeDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }
      } else {
        // Normal countdown display
        days = Math.floor(diff / (1000 * 60 * 60 * 24));
        hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((diff % (1000 * 60)) / 1000);
      }
    } else if (hasAutoSwitched && countdownEndTimeRef.current) {
      // Auto-switched count-up mode: count up from when countdown ended (indefinitely)
      const elapsed = now.getTime() - countdownEndTimeRef.current.getTime();

      days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    } else if (mergedProps.countMode === 'countup') {
      // Original count-up mode: show time elapsed since start, but cap at target time
      const elapsed = now.getTime() - startTime.getTime();
      const targetDuration = target.getTime() - startTime.getTime();

      // Cap the elapsed time at the target duration for original count-up mode
      const displayTime = Math.min(elapsed, targetDuration);

      days = Math.floor(displayTime / (1000 * 60 * 60 * 24));
      hours = Math.floor((displayTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((displayTime % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((displayTime % (1000 * 60)) / 1000);
    }

    setTimeDisplay({ days, hours, minutes, seconds });
  };

  // Setup interval for countdown
  useEffect(() => {
    // Reset target time, start time, and auto-switch state when countdown settings change
    targetTimeRef.current = initializeTargetTime();
    startTimeRef.current = new Date();
    countdownEndTimeRef.current = null;
    setHasAutoSwitched(false); // Reset auto-switch state
    updateTime(); // Initial update

    if (!enabled) { // Only run countdown in preview mode
      intervalRef.current = setInterval(updateTime, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mergedProps.countType, mergedProps.countMode, mergedProps.minutes, mergedProps.endTime, mergedProps.autoSwitchToCountUp, enabled]);



  // Animation hooks
  const { applyHoverStyles } = useHoverAnimations(mergedProps.hoverAnimation);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, mergedProps.displayAnimation);

  // Enhanced hover handler to include animations
  const handleMouseEnter = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleContainerClick();
  };
  const getBorderRadiusCSS = () => {
    // Special case for percentage radius (used for full rounding)
    if (typeof radius === 'string' && String(radius).includes('%')) {
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

  const getCombinedBackgroundCSS = () => {
    const baseBackground = getMainBackgroundCSS();

    if (backgroundType === 'image' && backgroundImage && baseBackground !== 'none') {
      return `${baseBackground} ${backgroundPosition} / ${backgroundSize} ${backgroundRepeat} ${backgroundAttachment}`;
    }    // For 'color', 'gradient', or 'image' with no actual image.
    return baseBackground;
  };

  const countStyles = minimizeStyle({
    width,
    position: mergedProps.isChildOfButton ? 'static' : 'absolute',
    top: mergedProps.top !== defaultProps.top ? `${mergedProps.top.toString().includes("px") ? mergedProps.top : mergedProps.top + "px"}` : undefined,
    left: mergedProps.left !== defaultProps.left ? `${mergedProps.left.toString().includes("px") ? mergedProps.left : mergedProps.left + "px"}` : undefined,
    opacity: (mergedProps.opacity || 100) / 100,
    transformOrigin: transformOrigin !== defaultProps.transformOrigin ? transformOrigin : undefined,

  });
  const textStyles = minimizeStyle({
    width: '100%',
    filter: getFilterCSS() !== 'contrast(100%) brightness(100%) saturate(100%) grayscale(0%) opacity(100%) invert(0%) sepia(0%) hue-rotate(0deg)'
      ? getFilterCSS()
      : undefined,
    boxShadow: getShadowCSS() !== 'none' ? getShadowCSS() : undefined,
    color: mergedProps.color !== defaultProps.color ? mergedProps.color : undefined,
    fontSize: mergedProps.fontSize !== defaultProps.fontSize ? `${mergedProps.fontSize.includes('px') ? mergedProps.fontSize : mergedProps.fontSize + 'px'}` : undefined,
    fontFamily: mergedProps.fontFamily !== defaultProps.fontFamily ?
      (mergedProps.fontFamily.includes("'") || mergedProps.fontFamily.includes('"') ||
        mergedProps.fontFamily.includes(',') || mergedProps.fontFamily === 'inherit') ?
        mergedProps.fontFamily :
        `'${mergedProps.fontFamily}'`
      : undefined,
    fontStyle: mergedProps.fontStyle !== defaultProps.fontStyle ? mergedProps.fontStyle : undefined, lineHeight: mergedProps.lineHeight !== defaultProps.lineHeight ? mergedProps.lineHeight : undefined,
    letterSpacing: mergedProps.letterSpacing !== defaultProps.letterSpacing ? mergedProps.letterSpacing : undefined,
    textTransform: mergedProps.textTransform !== defaultProps.textTransform ? mergedProps.textTransform : undefined,
    textDecoration: mergedProps.textDecoration !== defaultProps.textDecoration ? mergedProps.textDecoration : undefined,
    fontWeight: mergedProps.fontWeight !== defaultProps.fontWeight ? mergedProps.fontWeight : undefined,
    background: getCombinedBackgroundCSS(),
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    mixBlendMode: blendMode != defaultProps.blendMode ? blendMode as any : undefined, transform: [
      rotate != defaultProps.rotate ? `rotate(${rotate}deg)` : '',
      rotateX != defaultProps.rotateX ? `rotateX(${rotateX}deg)` : '',
      rotateY != defaultProps.rotateY ? `rotateY(${rotateY}deg)` : '',
      skewX != defaultProps.skewX ? `skewX(${skewX}deg)` : '',
      skewY != defaultProps.skewY ? `skewY(${skewY}deg)` : '',
      perspective != defaultProps.perspective ? `perspective(${perspective}px)` : '',
    ].filter(Boolean).join(' ') || undefined,
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
  });

  // Render individual time units
  const renderTimeUnits = () => {
    const units = [];
    if (mergedProps.showDays) {
      units.push(
        <div key="days" style={{
          display: 'inline-block',
          marginRight: mergedProps.spacing + 'px',
          ...textStyles
        }}>
          {timeDisplay.days.toString().padStart(2, '0')}
        </div>
      );
    }
    if (mergedProps.showHours) {
      units.push(
        <div key="hours" style={{
          display: 'inline-block',
          marginRight: mergedProps.spacing + 'px',
          ...textStyles
        }}>
          {timeDisplay.hours.toString().padStart(2, '0')}
        </div>
      );
    }
    if (mergedProps.showMinutes) {
      units.push(
        <div key="minutes" style={{
          display: 'inline-block',
          marginRight: mergedProps.spacing + 'px',
          ...textStyles
        }}>
          {timeDisplay.minutes.toString().padStart(2, '0')}
        </div>
      );
    }
    if (mergedProps.showSeconds) {
      units.push(
        <div key="seconds" style={{
          display: 'inline-block',
          marginRight: '0px',
          ...textStyles
        }}>
          {timeDisplay.seconds.toString().padStart(2, '0')}
        </div>
      );
    }

    return units.length > 0 ? units : [
      <div key="default" style={{
        display: 'inline-block',
        marginRight: mergedProps.spacing + 'px',
        ...textStyles
      }}>00</div>,
      <div key="default2" style={{
        display: 'inline-block',
        marginRight: mergedProps.spacing + 'px',
        ...textStyles
      }}>00</div>,
      <div key="default3" style={{
        display: 'inline-block',
        marginRight: '0px',
        ...textStyles
      }}>00</div>
    ];
  };
  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width' }}
        style={countStyles}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
      >
        <div
          style={{
            width: '100%',
            outline: 'none',
            textAlign: mergedProps.textAlign as any,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {renderTimeUnits()}
        </div>
        {mergedProps.hidden && <OverlayHidden />}
      </Resizer>
    );
  }

  if (mergedProps.hidden) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={countStyles}
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          width: '100%',
          outline: 'none',
          textAlign: mergedProps.textAlign as any,
          display: 'flex',
          alignItems: 'center',
          justifyContent: mergedProps.textAlign === 'center' ? 'center' :
            mergedProps.textAlign === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        {renderTimeUnits()}
      </div>
    </div>
  );
};

Count.craft = {
  displayName: 'Count',
  props: defaultProps,
  related: {
    toolbar: CountSettings,
  },
};
