import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { minimizeStyle } from '@/utils/helper';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import React, { useEffect, useMemo } from 'react';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { Resizer } from '../Resizer';
import { ImageSettings } from './ImageSettings';
import { createImage } from '@/utils/imgPreview';
import { PixelCrop } from 'react-image-crop';
import { canvasPreview } from '@/utils/canvasPreview';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// New crop data structure for react-image-crop
export interface ReactImageCropData {
  crop: PixelCrop;
  scale: number;
  rotate: number;
  imageDimensions?: {
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
  };
}

export interface ImageProps {
  url: string;
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
  blendMode: string;
  top: number;
  left: number;
  lockAspectRatio?: boolean;
  croppedImageUrl?: string; // Keep for backward compatibility
  cropArea?: CropArea; // Legacy crop area data
  cropZoom?: number; // Legacy crop zoom level
  cropRotation?: number; // Legacy crop rotation
  reactImageCropData?: ReactImageCropData; // New react-image-crop data
  originalDimensions?: { width: string; height: string }; // Store original dimensions before crop
  events?: EventItem[];
  displayAnimation?: DisplayAnimationItem | null;
  hoverAnimation?: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean;
  initField?: string;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps: ImageProps = {
  url: '',
  width: '100%',
  lockAspectRatio: true,
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
  blendMode: 'normal',
  top: 0,
  left: 0,
  croppedImageUrl: '',
  cropArea: undefined,
  cropZoom: 1,
  cropRotation: 0,
  reactImageCropData: undefined,
  originalDimensions: undefined,
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
  initField: 'none',
  syncCrossPlatform: true, // Default to enabled
};

// Function to generate cropped image URL using react-image-crop data
// Fixed version that properly scales crop coordinates
const generateReactImageCroppedUrl = async (
  imageUrl: string,
  cropData: ReactImageCropData
): Promise<string | null> => {
  try {
    const { crop, scale, rotate, imageDimensions } = cropData;
    
    const image = await createImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    let cropX, cropY, cropWidth, cropHeight;

    if (imageDimensions) {
      // Scale crop coordinates from modal display size to natural image size
      const scaleX = image.naturalWidth / imageDimensions.width;
      const scaleY = image.naturalHeight / imageDimensions.height;
      
      cropX = crop.x * scaleX;
      cropY = crop.y * scaleY;
      cropWidth = crop.width * scaleX;
      cropHeight = crop.height * scaleY;
    } else {
      // Fallback: assume crop coordinates are already in natural image pixels
      cropX = crop.x;
      cropY = crop.y;
      cropWidth = crop.width;
      cropHeight = crop.height;
    }
    
    // Set canvas size to the crop size
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);

    ctx.imageSmoothingQuality = 'high';

    // Apply scale and rotation if needed
    if (scale !== 1 || rotate !== 0) {
      const centerX = cropWidth / 2;
      const centerY = cropHeight / 2;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
    }

    // Draw the cropped portion
    ctx.drawImage(
      image,
      Math.round(cropX),
      Math.round(cropY),
      Math.round(cropWidth),
      Math.round(cropHeight),
      0,
      0,
      Math.round(cropWidth),
      Math.round(cropHeight)
    );

    if (scale !== 1 || rotate !== 0) {
      ctx.restore();
    }

    // Convert to blob URL
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(null);
        }
      }, 'image/jpeg');
    });
  } catch (error) {
    console.error('Error generating react-image-crop cropped URL:', error);
    return null;
  }
};

// Function to generate a cropped image URL using legacy crop area data
const generateCroppedImageUrl = async (
  imageUrl: string,
  cropArea: CropArea,
  zoom: number = 1,
  rotation: number = 0
): Promise<string | null> => {
  try {
    const image = await createImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas size to match crop area (pixelCrop from react-easy-crop)
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Fill with white background (like in your example)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped portion directly using the pixel crop coordinates
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Convert to blob URL (like in your example)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(null);
        }
      }, 'image/jpeg');
    });
  } catch (error) {
    console.error('Error generating cropped image URL:', error);
    return null;
  }
};

export const Image: UserComponent<Partial<ImageProps>> = (props) => {
  const {
    connectors: { connect },
    actions: { setProp },
    selected,
    id
  } = useNode((node => ({
    id: node.id,
    selected: node.events.selected,
  })));



  const mergedProps = { ...defaultProps, ...props };

  // Get page content for initialization
  const { pageContent, setPageContent } = useViewport();

  // Generate cropped image URL from crop area data
  const [generatedCroppedUrl, setGeneratedCroppedUrl] = React.useState<string | null>(null);

  // Determine which image URL to use (priority: generated cropped URL > legacy croppedImageUrl > original URL)
  const imageUrl = generatedCroppedUrl || mergedProps.croppedImageUrl || mergedProps.url;

  // Initialize image URL from page data
  if (!pageContent?.isInit && !!pageContent && mergedProps.initField !== 'none') {
    // Helper function to get nested property value
    const getNestedValue = (obj: any, path: string): string => {
      if (!path || path === 'none') return '';

      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current && typeof current === 'object') {
          // Handle array indices
          if (Array.isArray(current) && !isNaN(Number(key))) {
            current = current[Number(key)];
          } else if (key in current) {
            current = current[key];
          } else {
            return '';
          }
        } else {
          return '';
        }
      }

      return typeof current === 'string' ? current : '';
    };

    const imageUrl = getNestedValue(pageContent, mergedProps.initField || 'none');
    if (imageUrl) {
      setProp((props: any) => {
        props.url = imageUrl;
      }, 500);
    }
    setPageContent({
      ...pageContent,
      isInit: true,
    });
  }

  // Use the event handling hook
  const { handleContainerClick, handleHover } = useEventHandling(mergedProps.events, id);

  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  // Animation hooks
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { applyHoverStyles } = useHoverAnimations(mergedProps.hoverAnimation || { enabled: false });

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, mergedProps.displayAnimation || null);

  // Enhanced hover handler to include animations
  const handleMouseEnter = (e: React.MouseEvent) => {
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
  const handleClick = (e: React.MouseEvent) => {
    handleContainerClick();
  };

  // Touch-compatible handlers
  const handleTouchClick = (e: React.TouchEvent) => {
    handleContainerClick();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    handleHover();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
    // Also trigger click for touch devices
    handleContainerClick();
  };

  const {
    url,
    width: originalWidth,
    height: originalHeight,
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
    overlayColor,
    overlayOpacity,
    blendMode,
    top,
    left,
    lockAspectRatio,
    croppedImageUrl,
    pinning,
    hidden
  } = mergedProps;

  // Calculate dimensions based on crop data
  const { width, height } = useMemo(() => {
    if (mergedProps.reactImageCropData?.crop) {
      const { crop } = mergedProps.reactImageCropData;
      const cropAspectRatio = crop.width / crop.height;
      
      // Parse original dimensions to get numeric values
      const parseNumericValue = (value: string | number): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const numMatch = value.match(/(\d+(?:\.\d+)?)/);
          return numMatch ? parseFloat(numMatch[1]) : 300; // Default fallback
        }
        return 300;
      };
      
      const originalWidthNum = parseNumericValue(originalWidth);
      const originalHeightNum = parseNumericValue(originalHeight);
      const originalAspectRatio = originalWidthNum / originalHeightNum;
      
      // Adjust dimensions to match crop aspect ratio while maintaining relative size
      let newWidth = originalWidthNum;
      let newHeight = originalHeightNum;
      
      if (cropAspectRatio > originalAspectRatio) {
        // Crop is wider than original - adjust height
        newHeight = newWidth / cropAspectRatio;
      } else {
        // Crop is taller than original - adjust width
        newWidth = newHeight * cropAspectRatio;
      }
      
      // Return dimensions with 'px' unit
      return {
        width: `${Math.round(newWidth)}px`,
        height: `${Math.round(newHeight)}px`
      };
    }
    
    // No crop data, return original dimensions
    return {
      width: originalWidth,
      height: originalHeight
    };
  }, [mergedProps.reactImageCropData, originalWidth, originalHeight]);

  // Update component props when dimensions change due to crop
  React.useEffect(() => {
    if (mergedProps.reactImageCropData?.crop) {
      const newWidth = width;
      const newHeight = height;
      
      // Store original dimensions if not already stored and dimensions are changing
      if (!mergedProps.originalDimensions && (newWidth !== originalWidth || newHeight !== originalHeight)) {
        setProp((props: any) => {
          props.originalDimensions = {
            width: originalWidth,
            height: originalHeight
          };
        }, 100);
      }
      
      // Only update if dimensions are different from current props
      if (newWidth !== originalWidth || newHeight !== originalHeight) {
        setProp((props: any) => {
          props.width = newWidth;
          props.height = newHeight;
        }, 200);
      }
    }
  }, [width, height, originalWidth, originalHeight, mergedProps.reactImageCropData, mergedProps.originalDimensions, setProp]);

  // Generate cropped URL when crop data or dimensions change
  React.useEffect(() => {
    const generateCropUrl = async () => {
      // Priority: react-image-crop data > legacy crop area > no cropping
      if (mergedProps.reactImageCropData && mergedProps.url) {
        try {
          const croppedUrl = await generateReactImageCroppedUrl(
            mergedProps.url,
            mergedProps.reactImageCropData
          );
          setGeneratedCroppedUrl(croppedUrl);
        } catch (error) {
          console.error('Failed to generate react-image-crop cropped URL:', error);
          setGeneratedCroppedUrl(null);
        }
      } else if (mergedProps.cropArea && mergedProps.url) {
        try {
          const croppedUrl = await generateCroppedImageUrl(
            mergedProps.url,
            mergedProps.cropArea,
            mergedProps.cropZoom || 1,
            mergedProps.cropRotation || 0
          );
          setGeneratedCroppedUrl(croppedUrl);
        } catch (error) {
          console.error('Failed to generate legacy cropped image URL:', error);
          setGeneratedCroppedUrl(null);
        }
      } else {
        setGeneratedCroppedUrl(null);
      }
    };

    generateCropUrl();
  }, [mergedProps.url, mergedProps.reactImageCropData, mergedProps.cropArea, mergedProps.cropZoom, mergedProps.cropRotation, width, height]);

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
    width,
    height,
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
    position: 'absolute',
    top: (top != defaultProps.top ? `${top.toString().includes("px") ? top : top + "px"}` : undefined),
    left: (left != defaultProps.left ? `${left.toString().includes("px") ? left : left + "px"}` : undefined),
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
    objectFit: objectFit as any,
    filter: (getFilterCSS() !== 'opacity(100%) brightness(100%) contrast(100%) saturate(100%) grayscale(0%) invert(0%) hue-rotate(0deg) blur(0px) sepia(0%)')
      ? `${filterString}${getFilterCSS()}`
      : undefined,
    ...(typeof getBorderCSS() === 'string' ? { border: getBorderCSS() as string } : {}),
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    boxShadow: getShadowCSS() !== 'none' ? getShadowCSS() : undefined,
  };

  // Minimize image styles
  const imageStyles = minimizeStyle(fullImageStyles);

  // Only show overlay if opacity is greater than 0
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
    pointerEvents: 'none',
    borderRadius: getBorderRadiusCSS() !== '0px' ? getBorderRadiusCSS() : undefined,
    ...(mergedProps.overlayType === 'image' ? {
      backgroundSize: mergedProps.overlayImageSize || 'cover',
      backgroundPosition: mergedProps.overlayImagePosition || 'center',
      backgroundRepeat: mergedProps.overlayImageRepeat || 'no-repeat',
      backgroundAttachment: mergedProps.overlayImageAttachment || 'scroll',
    } : {})
  }) : null;



  // Editor mode rendering
  if (enabled) {
    return (
      <Resizer
        id={id}
        propKey={{
          width: 'width',
          height: 'height'
        }}
        style={containerStyles}
        className={'image-container'}
        lockAspectRatio={lockAspectRatio}
        enable={true}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
      >
        <img
          src={imageUrl}
          alt=""
          style={imageStyles}
        />
        {overlayStyle && <div style={overlayStyle} />}
        {hidden && <OverlayHidden borderRadius={imageStyles.borderRadius} />}
      </Resizer>
    );
  }
  if (hidden) {
    return null;
  }
  // Preview mode rendering with animations and events
  return (
    <div
      ref={containerRef}
      style={containerStyles}
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      <img src={imageUrl} alt="" style={imageStyles} />
      {overlayStyle && <div style={overlayStyle} />}
    </div>
  );
};

Image.craft = {
  displayName: 'Image',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: ImageSettings,
  },
};