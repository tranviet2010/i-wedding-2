import { useRef } from 'react';
import { useNode, UserComponent, useEditor } from '@craftjs/core';
import { minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';
import { useViewport } from '../../editor/Viewport/ViewportContext';
import { useGetGuestWishes, GuestWish } from '../../../features/guest/guestsAPI';
import { EventItem, useEventHandling } from '../../editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '../../editor/components/AnimationManager';
import { PinningSettings } from '../../editor/components/PinningManager';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import DOMPurify from 'dompurify';
import { WishListSettings } from './WishListSettings';

export interface WishListProps {
  // Container structure properties (following Container pattern)
  width: string;
  height: string;
  left: string;
  top: string;
  // Background properties (following Container pattern)
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;
  borderRadius: number[];
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;
  padding: number[];
  margin: number[];
  lockAspectRatio?: boolean;
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden: boolean;

  // WishList specific properties
  maxWishes: number;
  showMockData: boolean;
  htmlContent: string;

  // Font styling properties for wish items
  wishNameFontSize: string;
  wishNameFontFamily: string;
  wishNameFontColor: string;
  wishContentFontSize: string;
  wishContentFontFamily: string;
  wishContentFontColor: string;

  // Individual wish item styling
  wishItemPadding: number[];
  wishItemBorderWidth: number[];
  wishItemBorderStyle: string;
  wishItemBorderColor: string;
  wishItemBorderRadius: number[];
  wishItemBackgroundColor: string;

  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps: WishListProps = {
  // Container structure properties
  width: '400px',
  height: '300px',
  left: '0px',
  top: '0px',
  // Background properties (following Container pattern)
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  gradientType: 'linear',
  gradientAngle: 0,
  gradientColor1: '#ffffff',
  gradientColor2: '#000000',
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'scroll',
  borderRadius: [8, 8, 8, 8],
  borderWidth: [1, 1, 1, 1],
  borderStyle: 'solid',
  borderColor: '#e5e7eb',
  padding: [16, 16, 16, 16],
  margin: [0, 0, 0, 0],
  lockAspectRatio: false,
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

  // WishList specific properties
  maxWishes: 10,
  showMockData: false,
  htmlContent: '',

  // Font styling properties for wish items
  wishNameFontSize: '16px',
  wishNameFontFamily: 'inherit',
  wishNameFontColor: '#1f2937',
  wishContentFontSize: '14px',
  wishContentFontFamily: 'inherit',
  wishContentFontColor: '#374151',

  // Individual wish item styling
  wishItemPadding: [12, 0, 12, 0],
  wishItemBorderWidth: [0, 0, 1, 0],
  wishItemBorderStyle: 'solid',
  wishItemBorderColor: '#f3f4f6',
  wishItemBorderRadius: [0, 0, 0, 0],
  wishItemBackgroundColor: 'transparent',

  syncCrossPlatform: true, // Default to enabled
};

// Mock data for demonstration (same as ViewOnlyViewport)
const mockWishData: GuestWish[] = [
  {
    id: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    weddingPageId: 1,
    guestName: "Ngọc Anh",
    message: "Chú chúa đẹp cha mạ, chúc mừng anh chị trăm năm hạnh phúc hẻ",
    isPublic: true
  },
  {
    id: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    weddingPageId: 1,
    guestName: "Thảo xinh gái",
    message: "Ảnh cưới đẹp quá em ơi! Chúc mừng hạnh phúc hai em!",
    isPublic: true
  },
  {
    id: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    weddingPageId: 1,
    guestName: "Hoa Phương",
    message: "Chúc mừng hạnh phúc 2 bạn nhà. Chúc cho đôi trai tài gái sắc mình hạnh phúc vẹn tròn. ❤️",
    isPublic: true
  },
  {
    id: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    weddingPageId: 1,
    guestName: "Em Bích",
    message: "Chúc anh chị hạnh phúc, hôn nhân viên mãn, đầu bạc răng long",
    isPublic: true
  }
];

export const WishList: UserComponent<Partial<WishListProps>> = (props) => {
  const {
    connectors: { connect },
    id,
  } = useNode((node) => ({
    id: node.id,
  }));

  const mergedProps = { ...defaultProps, ...props };
  const {
    width,
    height,
    left,
    top,
    // Background properties
    backgroundType,
    backgroundColor,
    gradientType,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
    backgroundAttachment,
    borderRadius,
    borderWidth,
    borderStyle,
    borderColor,
    padding,
    margin,
    lockAspectRatio,
    events,
    displayAnimation,
    hoverAnimation,
    hidden,
    maxWishes,
    showMockData,
    htmlContent,
    // Font styling properties
    wishNameFontSize,
    wishNameFontFamily,
    wishNameFontColor,
    wishContentFontSize,
    wishContentFontFamily,
    wishContentFontColor,
    // Individual wish item styling
    wishItemPadding,
    wishItemBorderWidth,
    wishItemBorderStyle,
    wishItemBorderColor,
    wishItemBorderRadius,
    wishItemBackgroundColor,
  } = mergedProps;

  const currentPadding = padding || defaultProps.padding;
  const currentMargin = margin || defaultProps.margin;
  const currentBorderRadius = borderRadius || defaultProps.borderRadius;
  const currentBorderWidth = borderWidth || defaultProps.borderWidth;

  // Use the event handling hook (following Container pattern)
  const { handleContainerClick, handleHover, handleTriggerMouseEnter, handleTriggerMouseLeave } = useEventHandling(events, id);

  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Get wedding page ID from ViewportContext
  const { weddingPageId } = useViewport();

  // Fetch guest wishes for this wedding page
  const { data: guestWishes, isLoading: isLoadingWishes } = useGetGuestWishes(weddingPageId || null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { applyHoverStyles } = useHoverAnimations(hoverAnimation);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, displayAnimation);

  // Enhanced hover handler to include animations and dropbox trigger management (following Container pattern)
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

  // Enhanced click handler to only execute events in preview mode (following Container pattern)
  const handleClick = (e: React.MouseEvent) => {
    if (!enabled) {
      handleContainerClick();
    }
  };

  // Generate border radius CSS (following Container pattern)
  const getBorderRadiusCSS = () => {
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
    return '0px';
  };

  // Background CSS generation functions (following Container pattern)
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
    return backgroundColor; // Fallback to color
  };

  // Combined background CSS shorthand (following Container pattern)
  const getCombinedBackgroundCSS = () => {
    const baseBackground = getMainBackgroundCSS();

    if (backgroundType === 'image' && backgroundImage && baseBackground !== backgroundColor) {
      // Construct the full shorthand for images
      // Format: url(path) position / size repeat attachment
      return `${baseBackground} ${backgroundPosition} / ${backgroundSize} ${backgroundRepeat} ${backgroundAttachment}`;
    }
    // For 'color', 'gradient', or 'image' with no actual image.
    return baseBackground;
  };

  // Generate HTML content for wishes
  const generateWishListHTML = (): string => {
    if (htmlContent && htmlContent.trim()) {
      return htmlContent;
    }

    // Get wishes to display
    const getWishesToDisplay = (): GuestWish[] => {
      if (guestWishes && weddingPageId) {
        const publicWishes = guestWishes.filter(wish => wish.isPublic);
        return publicWishes.slice(0, maxWishes);
      }
      
      if (showMockData) {
        return mockWishData.slice(0, maxWishes);
      }


      return mockWishData.slice(0, maxWishes);
    };

    const wishesToDisplay = getWishesToDisplay();

    if (isLoadingWishes && !showMockData) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280; font-size: 14px;">
          Đang tải lời chúc...
        </div>
      `;
    }

    if (wishesToDisplay.length === 0) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280; font-size: 14px; text-align: center;">
          Chưa có lời chúc nào
        </div>
      `;
    }

    const wishItemsHTML = wishesToDisplay.map((wish, index) => {
      const sanitizedMessage = DOMPurify.sanitize(wish.message);
      const isLast = index === wishesToDisplay.length - 1;

      // Build wish item styles using the new styling properties
      const wishItemStyles = `
        margin-bottom: ${isLast ? '0' : '12px'};
        padding-top: ${wishItemPadding[0]}px;
        padding-right: ${wishItemPadding[1]}px;
        padding-bottom: ${wishItemPadding[2]}px;
        padding-left: ${wishItemPadding[3]}px;
        border-top-width: ${wishItemBorderWidth[0]}px;
        border-right-width: ${wishItemBorderWidth[1]}px;
        border-bottom-width: ${isLast ? '0' : wishItemBorderWidth[2]}px;
        border-left-width: ${wishItemBorderWidth[3]}px;
        border-style: ${wishItemBorderStyle};
        border-color: ${wishItemBorderColor};
        border-top-left-radius: ${wishItemBorderRadius[0]}px;
        border-top-right-radius: ${wishItemBorderRadius[1]}px;
        border-bottom-right-radius: ${wishItemBorderRadius[2]}px;
        border-bottom-left-radius: ${wishItemBorderRadius[3]}px;
        background-color: ${wishItemBackgroundColor};
      `;

      return `
        <div style="${wishItemStyles}">
          <div style="
            font-size: ${wishNameFontSize};
            font-family: ${wishNameFontFamily};
            font-weight: bold;
            color: ${wishNameFontColor};
            margin-bottom: 4px;
          ">
            ${wish.guestName}
          </div>
          <div style="
            font-size: ${wishContentFontSize};
            font-family: ${wishContentFontFamily};
            font-weight: normal;
            color: ${wishContentFontColor};
            line-height: 1.5;
            word-break: break-word;
          ">
            ${sanitizedMessage}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="height: 100%; overflow: auto;">
        ${wishItemsHTML}
      </div>
    `;
  };

  // Create full style object (following Container pattern)
  const baseContainerStyles = {
    width,
    height,
    background: getCombinedBackgroundCSS(),
    padding: currentPadding.some((val, i) => val !== defaultProps.padding[i])
      ? `${currentPadding[0]}px ${currentPadding[1]}px ${currentPadding[2]}px ${currentPadding[3]}px`
      : undefined,
    margin: currentMargin.some((val, i) => val !== defaultProps.margin[i])
      ? `${currentMargin[0]}px ${currentMargin[1]}px ${currentMargin[2]}px ${currentMargin[3]}px`
      : undefined,
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    // Regular positioning
    position: 'absolute' as const,
    top: (top != defaultProps.top ? `${top.toString().includes("px") ? top : top + "px"}` : undefined),
    left: (left != defaultProps.left ? `${left.toString().includes("px") ? left : left + "px"}` : undefined),
    // Remove overflow from container - let inner content handle scrolling
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

  const fullContainerStyles = baseContainerStyles;
  const containerStyles = minimizeStyle(fullContainerStyles);


  const htmlContentToRender = generateWishListHTML();

  // Create the container content (following Container pattern)
  const containerContent = (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{ height: '100%', overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: htmlContentToRender }}
      />
      {hidden && <OverlayHidden borderRadius={fullContainerStyles.borderRadius} />}
    </div>
  );

  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        className='wish-list-container'
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

  // In preview mode, return container (following Container pattern)
  return (
    <div
      ref={containerRef}
      style={containerStyles}
      className='wish-list-container'
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {containerContent}
    </div>
  );
};

WishList.craft = {
  displayName: 'WishList',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => false,
  },
  related: {
    toolbar: WishListSettings,
  },
};
