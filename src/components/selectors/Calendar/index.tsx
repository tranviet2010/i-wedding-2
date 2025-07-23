import React, { useEffect, useRef } from 'react';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import { Box, Grid, Text } from '@chakra-ui/react';
import { Resizer } from '../Resizer';
import { CalendarSettings } from './CalendarSettings';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { EventItem, useEventHandling } from '@/components/editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { minimizeStyle } from '@/utils/helper';

export interface CalendarProps {
  selectedDate: string;
  selectedDateMode: 'custom' | 'today';
  highlightColor: string;
  highlightType: 'color' | 'svg';
  highlightSvg: string;
  headerTextColor: string;
  dateTextColor: string;
  selectedDateTextColor: string;
  calendarBorderColor: string;

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
  fontFamily: string;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps = {
  selectedDate: new Date().toISOString().split('T')[0],
  selectedDateMode: 'today' as 'custom' | 'today',
  highlightColor: '#4ade80',
  highlightType: 'color' as 'color' | 'svg',
  highlightSvg: '',
  headerTextColor: '#000000',
  dateTextColor: '#000000',
  selectedDateTextColor: '#ffffff',
  calendarBorderColor: '#000000',

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
  width: '380px',
  height: '380px',
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
  fontFamily: 'inherit',
  fontWeight: 'normal',
  hidden: false,
  syncCrossPlatform: true, // Default to enabled
};

export const Calendar = (props: Partial<CalendarProps>) => {
  const {
    connectors: { connect },
    actions: { setProp },
    id
  } = useNode((node) => ({
    id: node.id,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const mergedProps = { ...defaultProps, ...props };
  const {
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
    gradientAngle,
    gradientType,
    gradientColor1,
    gradientColor2,
    events,
    displayAnimation,
    hoverAnimation,
    pinning,
    fontWeight,
    hidden
  } = mergedProps;
  const currentPadding = padding || defaultProps.padding;
  const currentMargin = margin || defaultProps.margin;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;  // 
  // Calendar state - use current date or highlighted date for display
  const today = new Date();

  // Determine which date should be highlighted based on selectedDateMode
  const getHighlightedDate = () => {
    if (mergedProps.selectedDateMode === 'today') {
      return today;
    } else {
      return mergedProps.selectedDate ? new Date(mergedProps.selectedDate) : new Date();
    }
  };

  const highlightedDate = getHighlightedDate();

  // Use the highlighted date's month/year for calendar display
  const currentDate = highlightedDate;

  // Use event handling hook
  const { handleContainerClick, handleTriggerMouseEnter, handleTriggerMouseLeave } = useEventHandling(events || [], id);
  const { applyAnimation } = useDisplayAnimations(displayAnimation);
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);
  useEffect(() => {
    if (containerRef.current && displayAnimation && displayAnimation.effect !== 'none') {
      applyAnimation(containerRef.current);
    }
  }, [displayAnimation, applyAnimation]);


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
  // Calendar helper functions
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Adjust for Monday-first week: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    return day === 0 ? 6 : day - 1;
  };





  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Calculate font size based on width and height
  const calculateFontSize = () => {
    // Parse width and height to get numeric values
    const widthValue = typeof width === 'string' ? parseInt(width.replace(/px|%/, '')) : width;
    const heightValue = typeof height === 'string' && height !== 'auto' ? parseInt(height.replace(/px|%/, '')) : null;

    // Improved font size calculation based on calendar dimensions
    // For width: use a more conservative ratio for better readability
    let baseFontSize = Math.max(8, Math.min(24, widthValue / 22));

    // If height is specified and not 'auto', also consider height for better scaling
    if (heightValue && heightValue > 0) {
      // Height-based calculation: divide by 20 for better height utilization
      const heightBasedSize = Math.max(8, Math.min(24, heightValue / 20));
      // Use the smaller of the two to ensure text fits well
      baseFontSize = Math.min(baseFontSize, heightBasedSize);
    }

    return Math.round(baseFontSize);
  };

  // Calculate different font sizes for different elements
  const baseFontSize = calculateFontSize();
  const headerFontSize = `${baseFontSize}px`;
  const dayNameFontSize = `${Math.max(7, Math.round(baseFontSize * 0.7))}px`;
  const dateFontSize = `${Math.max(8, Math.round(baseFontSize * 0.8))}px`;

  // Calculate dynamic spacing and sizes based on calendar dimensions
  const widthValue = typeof width === 'string' ? parseInt(width.replace(/px|%/, '')) : width;
  const heightValue = typeof height === 'string' && height !== 'auto' ? parseInt(height.replace(/px|%/, '')) : null;

  // Dynamic button size calculation - increased for better background display
  const buttonSize = Math.max(32, Math.min(56, baseFontSize + 20));
  const headerSpacing = Math.max(8, Math.round(baseFontSize * 0.6));
  const gridGap = Math.max(2, Math.round(baseFontSize * 0.15));

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
  // Check if pinning is enabled and we're in preview mode
  const baseContainerStyles = {
    width,
    height,
    fontWeight: fontWeight !== defaultProps.fontWeight ? fontWeight : undefined,
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

  const renderCalendar = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      width="100%"
      height="100%"
      p={`${Math.max(4, headerSpacing / 2)}px`}
      gap={`${Math.max(2, gridGap)}px`}
      fontFamily={mergedProps.fontFamily !== defaultProps.fontFamily ?
        (mergedProps.fontFamily.includes("'") || mergedProps.fontFamily.includes('"') ||
          mergedProps.fontFamily.includes(',') || mergedProps.fontFamily === 'inherit') ?
          mergedProps.fontFamily :
          `'${mergedProps.fontFamily}'`
        : undefined}
    >
      {/* Calendar Header */}
      <Box width="100%" mb={`${headerSpacing}px`}>
        <Text
          fontWeight="bold"
          color={mergedProps.headerTextColor}
          fontSize={headerFontSize}
          textAlign="center"
        >
          {monthNames[currentDate.getMonth()]} / {currentDate.getFullYear()}
        </Text>
      </Box>

      {/* Day Names Header */}
      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={gridGap}
        mb={`${Math.max(4, headerSpacing / 2)}px`}
        width="100%"
        borderTop="1px solid"
        borderTopColor={mergedProps.calendarBorderColor}
        borderBottom="1px solid"
        borderBottomColor={mergedProps.calendarBorderColor}
      >
        {dayNames.map((day) => (
          <Box
            key={day}
            p={`${Math.max(2, gridGap + 4)}px`}
            textAlign="center"
            fontWeight="bold"
            fontSize={dayNameFontSize}
            color={mergedProps.headerTextColor}
            minH={`${Math.max(20, baseFontSize + 8)}px`}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {day}
          </Box>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Grid
        templateColumns="repeat(7, 1fr)"
        gap={gridGap}
        width="100%"
        flex="1"
        borderBottom="1px solid"
        borderBottomColor={mergedProps.calendarBorderColor}
        pb={2}
      >
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <Box key={index} display="flex" alignItems="center" justifyContent="center" />;
          }

          const isHighlighted = highlightedDate.getDate() === day &&
            highlightedDate.getMonth() === currentDate.getMonth() &&
            highlightedDate.getFullYear() === currentDate.getFullYear();

          // Create highlight style based on highlightType
          const getHighlightStyle = () => {
            if (!isHighlighted) return {};

            if (mergedProps.highlightType === 'svg' && mergedProps.highlightSvg) {
              // For SVG highlight, replace fill attributes with highlight color
              let processedSvg = mergedProps.highlightSvg;

              // Replace existing fill attributes with the highlight color
              processedSvg = processedSvg.replace(/fill\s*=\s*["'][^"']*["']/gi, `fill="${mergedProps.highlightColor}"`);

              // If no fill attribute exists, add one to the SVG element
              if (!processedSvg.includes('fill=')) {
                processedSvg = processedSvg.replace(/<svg([^>]*)>/i, `<svg$1 fill="${mergedProps.highlightColor}">`);
              }

              return {
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(processedSvg)}")`,
                backgroundSize: '80%', // Slightly smaller than container for better visibility
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                color: mergedProps.selectedDateTextColor,
              };
            } else {
              // For color highlight, use solid background
              return {
                backgroundColor: mergedProps.highlightColor,
                color: mergedProps.selectedDateTextColor,
              };
            }
          };

          return (
            <Box key={day} display="flex" alignItems="center" justifyContent="center" width="100%">
              <Box
                minH={`${buttonSize}px`}
                minW={`${buttonSize}px`}
                maxH={`${buttonSize}px`}
                maxW={`${buttonSize}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
                aspectRatio="1"
                p={1}
                {...getHighlightStyle()}
              >
                <Text
                  fontSize={dateFontSize}
                  color={isHighlighted ? mergedProps.selectedDateTextColor : mergedProps.dateTextColor}
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                >
                  {day}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );

  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {overlayStyle && <div style={overlayStyle} />}
          {renderCalendar()}
          {hidden && <OverlayHidden borderRadius={fullContainerStyles.borderRadius} />}
        </div>
      </Resizer>
    );
  }

  if (hidden) {
    return null;
  }

  return (
    <Box
      ref={containerRef}
      style={containerStyles}
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {overlayStyle && <div style={overlayStyle} />}
        {renderCalendar()}
      </div>
    </Box>
  );
};

Calendar.craft = {
  displayName: 'Calendar',
  props: defaultProps,
  related: {
    toolbar: CalendarSettings,
  },
  rules: {
    canDrag: (node: any) => {
      const isChildOfButton = node.data.props.isChildOfButton ||
        (node.data.parent && node.data.parent.includes('Button'));
      const isChildOfGroup = node.data.props.isChildOfGroup ||
        (node.data.parent && node.data.parent.includes('Group'));
      return !isChildOfButton && !isChildOfGroup;
    },
  },
};
