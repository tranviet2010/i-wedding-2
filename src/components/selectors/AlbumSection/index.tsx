/**
 * Album Section Component
 *
 * A section-based photo album component with carousel layout:
 * - Carousel layout: Interactive slideshow with navigation controls and auto-play
 *
 * Features:
 * - Section-based architecture with full-width backgrounds
 * - Raw HTML pattern: placeholder in editor mode, rendered content in view mode
 * - Uses react-multi-carousel for slider functionality
 * - Responsive design with desktop/mobile breakpoints
 * - Modal functionality for full-size image viewing
 * - Relative positioning within section container
 *
 * @author Augment Agent
 * @version 3.0.0
 */

import React, { useRef, useState } from 'react';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { AlbumSectionSettings } from './AlbumSectionSettings';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { zIndex } from '@/utils/zIndex';
import { EventItem, useEventHandling } from '@/components/editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { createImage, generateCroppedImageUrl } from '@/utils/cropImage';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { useResponsivePlatformContext } from '@/components/editor/contexts/ResponsivePlatformContext';
import { useViewportSettings, getMobileWidth, getDesktopWidth, getDesktopBreakpoint } from '@/components/editor/contexts/ViewportSettingsContext';
import { AlbumCropData } from './AlbumImageCropModal';

export interface AlbumSectionProps {
  children: React.ReactNode;
  
  // Section-specific properties (inherited from Sections component)
  height: string;
  width: string;
  padding: number[];
  margin: number[];
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  fillSpace: string;
  
  // Album-specific settings (carousel only)

  // Image padding settings
  imagePadding: number;
  imagePaddingTop: number;
  imagePaddingRight: number;
  imagePaddingBottom: number;
  imagePaddingLeft: number;
  useIndividualPadding: boolean;

  // Wrapper padding settings
  wrapperPadding: number;
  wrapperPaddingTop: number;
  wrapperPaddingRight: number;
  wrapperPaddingBottom: number;
  wrapperPaddingLeft: number;
  useIndividualWrapperPadding: boolean;

  // Album images data (stored as HTML content for raw HTML pattern)
  albumImages: Array<{
    id: string;
    url: string;
    alt?: string;
    title?: string;
    // New crop data structure using react-image-crop
    reactImageCropData?: AlbumCropData;
    // Legacy crop properties (keep for backward compatibility)
    cropArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    cropZoom?: number;
    cropRotation?: number;
    croppedImageUrl?: string;
    // Individual image dimensions for resizing
    width?: string;
    height?: string;
  }>;
  
  // Carousel settings
  carouselAutoPlay: boolean;
  carouselSpeed: number;
  carouselShowDots: boolean;
  carouselShowArrows: boolean;
  carouselInfinite: boolean;
  carouselItemsDesktop: number;
  carouselItemsTablet: number;
  carouselItemsMobile: number;
  carouselCenterMode: boolean;
  carouselInactiveScale: number;
  carouselInactiveOpacity: number;
  carouselTransformDuration: number;
  
  // Section background settings (inherited from Sections)
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundVideoType: 'youtube' | 'meHappyVideo';
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;
  backgroundOpacity: number;
  
  // Border and styling
  borderWidth: number[];
  borderStyle: string;
  borderColor: string;
  borderRadius: number[];
  
  // Shadow
  shadow: number;
  shadowType: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowColor: string;
  
  // Transform and effects
  opacity: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  invert: number;
  sepia: number;
  hueRotate: number;
  blur: number;
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  blendMode: string;
  
  // Overlay
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
  
  // Advanced settings
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

// Function to generate a cropped image URL for album items (similar to Image component)

const defaultProps: AlbumSectionProps = {
  children: null,
  
  // Section-specific properties
  height: '500px',
  width: '100%',
  padding: [20, 20, 20, 20],
  margin: [0, 0, 0, 0],
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  fillSpace: 'no',
  
  // Album-specific settings (carousel only)

  // Image padding settings
  imagePadding: 8,
  imagePaddingTop: 8,
  imagePaddingRight: 8,
  imagePaddingBottom: 8,
  imagePaddingLeft: 8,
  useIndividualPadding: false,

  // Wrapper padding settings
  wrapperPadding: 10,
  wrapperPaddingTop: 10,
  wrapperPaddingRight: 10,
  wrapperPaddingBottom: 10,
  wrapperPaddingLeft: 10,
  useIndividualWrapperPadding: false,
  
  // Default album images (placeholder data)
  albumImages: [
    { id: '1', url: 'https://via.placeholder.com/300x200/cccccc/666666?text=Image+1', alt: 'Image 1' },
    { id: '2', url: 'https://via.placeholder.com/300x200/cccccc/666666?text=Image+2', alt: 'Image 2' },
    { id: '3', url: 'https://via.placeholder.com/300x200/cccccc/666666?text=Image+3', alt: 'Image 3' },
    { id: '4', url: 'https://via.placeholder.com/300x200/cccccc/666666?text=Image+4', alt: 'Image 4' },
  ],
  
  // Carousel settings
  carouselAutoPlay: false,
  carouselSpeed: 3000,
  carouselShowDots: true,
  carouselShowArrows: true,
  carouselInfinite: true,
  carouselItemsDesktop: 2,
  carouselItemsTablet: 2,
  carouselItemsMobile: 1,
  carouselCenterMode: false,
  carouselInactiveScale: 0.8,
  carouselInactiveOpacity: 0.6,
  carouselTransformDuration: 300,
  
  // Section background settings
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  gradientType: 'linear',
  gradientAngle: 90,
  gradientColor1: '#4158D0',
  gradientColor2: '#C850C0',
  backgroundImage: '',
  backgroundVideo: '',
  backgroundVideoType: 'youtube',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'scroll',
  backgroundOpacity: 100,
  
  // Border and styling
  borderWidth: [0, 0, 0, 0],
  borderStyle: 'solid',
  borderColor: '#000000',
  borderRadius: [0, 0, 0, 0],
  
  // Shadow
  shadow: 0,
  shadowType: 'none',
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: '#000000',
  
  // Transform and effects
  opacity: 100,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  transformOrigin: 'center center',
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  perspective: 0,
  blendMode: 'normal',
  
  // Overlay
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
  
  // Advanced settings
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
};

// Function to generate cropped URL for album section images using react-image-crop data
const generateAlbumSectionReactImageCroppedUrl = async (
  imageUrl: string,
  cropData: AlbumCropData
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
    console.error('Error generating album section react-image-crop cropped URL:', error);
    return null;
  }
};

export const AlbumSection: UserComponent<Partial<AlbumSectionProps>> = (props) => {
  const {
    connectors: { connect },
    id
  } = useNode((node) => ({
    id: node.id,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Get current platform for responsive max-width
  const { currentEditingPlatform } = useViewport();
  const responsivePlatform = useResponsivePlatformContext();
  const currentPlatform = responsivePlatform || currentEditingPlatform;

  // Get viewport settings
  const { settings: viewportSettings } = useViewportSettings();

  const containerRef = useRef<HTMLDivElement>(null);
  const mergedProps = { ...defaultProps, ...props };
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // State for managing generated cropped URLs for album items
  const [generatedCroppedUrls, setGeneratedCroppedUrls] = useState<Record<string, string | null>>({});

  // Use animation hooks
  const { applyHoverStyles } = useHoverAnimations(mergedProps.hoverAnimation);

  // Generate cropped URLs for album items when crop data changes
  React.useEffect(() => {
    const generateCroppedUrls = async () => {
      // Clean up old blob URLs to prevent memory leaks
      Object.values(generatedCroppedUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      const newCroppedUrls: Record<string, string | null> = {};

      for (const image of mergedProps.albumImages) {
        // Try new react-image-crop data first, then fallback to legacy crop data
        if (image.reactImageCropData && image.url) {
          try {
            const croppedUrl = await generateAlbumSectionReactImageCroppedUrl(
              image.url,
              image.reactImageCropData
            );
            newCroppedUrls[image.id] = croppedUrl;
          } catch (error) {
            console.error(`Failed to generate cropped image URL for ${image.id} (react-image-crop):`, error);
            newCroppedUrls[image.id] = null;
          }
        } else if (image.cropArea && image.url) {
          // Fallback to legacy crop data
          try {
            const croppedUrl = await generateCroppedImageUrl(
              image.url,
              image.cropArea,
              image.cropZoom || 1,
              image.cropRotation || 0
            );
            newCroppedUrls[image.id] = croppedUrl;
          } catch (error) {
            console.error(`Failed to generate cropped image URL for ${image.id} (legacy):`, error);
            newCroppedUrls[image.id] = null;
          }
        } else {
          newCroppedUrls[image.id] = null;
        }
      }

      setGeneratedCroppedUrls(newCroppedUrls);
    };

    generateCroppedUrls();
  }, [mergedProps.albumImages]);

  // Cleanup blob URLs on component unmount
  React.useEffect(() => {
    return () => {
      Object.values(generatedCroppedUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Helper function to get the correct image URL (cropped or original)
  const getImageUrl = (image: typeof mergedProps.albumImages[0]): string => {
    // Priority: croppedImageUrl (stored) > generatedCroppedUrls (runtime) > original url
    if (image.croppedImageUrl) {
      return image.croppedImageUrl;
    }
    if (generatedCroppedUrls[image.id]) {
      return generatedCroppedUrls[image.id]!;
    }
    return image.url;
  };

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, mergedProps.displayAnimation);

  // Use event handling hook
  const { handleContainerClick, handleTriggerMouseEnter, handleTriggerMouseLeave } = useEventHandling(mergedProps.events, id);

  const {
    albumImages,
    carouselAutoPlay,
    carouselSpeed,
    carouselShowDots,
    carouselShowArrows,
    carouselInfinite,
    carouselItemsDesktop,
    carouselItemsTablet,
    carouselItemsMobile,
    carouselCenterMode,
    carouselInactiveScale,
    carouselInactiveOpacity,
    carouselTransformDuration,
    imagePadding,
    imagePaddingTop,
    imagePaddingRight,
    imagePaddingBottom,
    imagePaddingLeft,
    useIndividualPadding,
    wrapperPadding,
    wrapperPaddingTop,
    wrapperPaddingRight,
    wrapperPaddingBottom,
    wrapperPaddingLeft,
    useIndividualWrapperPadding,
    hidden,
  } = mergedProps;

  // Helper function to get image padding
  const getImagePadding = () => {
    if (useIndividualPadding) {
      return {
        paddingTop: `${imagePaddingTop}px`,
        paddingRight: `${imagePaddingRight}px`,
        paddingBottom: `${imagePaddingBottom}px`,
        paddingLeft: `${imagePaddingLeft}px`,
      };
    } else {
      return {
        padding: `${imagePadding}px`,
      };
    }
  };

  // Helper function to get wrapper padding
  const getWrapperPadding = () => {
    if (useIndividualWrapperPadding) {
      return {
        paddingTop: `${wrapperPaddingTop}px`,
        paddingRight: `${wrapperPaddingRight}px`,
        paddingBottom: `${wrapperPaddingBottom}px`,
        paddingLeft: `${wrapperPaddingLeft}px`,
      };
    } else {
      return {
        padding: `${wrapperPadding}px`,
      };
    }
  };

  const handleClick = () => {
    if (!enabled) {
      handleContainerClick();
    }
  };

  const handleMouseEnter = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    if (!enabled) {
      handleTriggerMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
    if (!enabled) {
      handleTriggerMouseLeave();
    }
  };

  // Handle image click for modal viewing
  const handleImageClick = (index: number) => {
    if (!enabled) {
      setSelectedImageIndex(index);
    }
  };

  // Close image modal
  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  // Navigate to previous image
  const navigateToPrevious = () => {
    if (selectedImageIndex !== null && albumImages.length > 0) {
      const newIndex = selectedImageIndex === 0 ? albumImages.length - 1 : selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
    }
  };

  // Navigate to next image
  const navigateToNext = () => {
    if (selectedImageIndex !== null && albumImages.length > 0) {
      const newIndex = selectedImageIndex === albumImages.length - 1 ? 0 : selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImageIndex === null) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        navigateToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigateToNext();
        break;
      case 'Escape':
        e.preventDefault();
        closeImageModal();
        break;
    }
  };

  // Add keyboard event listener when modal is open
  React.useEffect(() => {
    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedImageIndex, albumImages.length]);

  // Styling functions (adapted from Sections component)
  const getMainBackgroundCSS = () => {
    if (mergedProps.backgroundType === 'color') {
      return mergedProps.backgroundColor;
    } else if (mergedProps.backgroundType === 'gradient') {
      const type = mergedProps.gradientType || 'linear';
      const angle = mergedProps.gradientAngle || 0;
      const color1 = mergedProps.gradientColor1 || '#ffffff';
      const color2 = mergedProps.gradientColor2 || '#000000';
      return type === 'linear'
        ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
        : `radial-gradient(circle, ${color1}, ${color2})`;
    } else if (mergedProps.backgroundType === 'image' && mergedProps.backgroundImage) {
      return `url(${mergedProps.backgroundImage})`;
    }
    return 'none'; // No background if video or none
  };

  const getCombinedBackgroundCSS = () => {
    if (mergedProps.backgroundType === 'image' && mergedProps.backgroundImage) {
      const size = mergedProps.backgroundSize || 'cover';
      const position = mergedProps.backgroundPosition || 'center center';
      const repeat = mergedProps.backgroundRepeat || 'no-repeat';
      const attachment = mergedProps.backgroundAttachment || 'scroll';
      return `url(${mergedProps.backgroundImage}) ${position}/${size} ${repeat} ${attachment}`;
    }
    return getMainBackgroundCSS();
  };

  const getOverlayBackgroundCSS = () => {
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

  // Generate filter CSS
  const getFilterCSS = () => {
    let filterString = '';
    filterString += `brightness(${mergedProps.brightness || 100}%)`;
    filterString += ` contrast(${mergedProps.contrast || 100}%)`;
    filterString += ` saturate(${mergedProps.saturate || 100}%)`;
    filterString += ` hue-rotate(${mergedProps.hueRotate || 0}deg)`;
    filterString += ` blur(${mergedProps.blur || 0}px)`;
    filterString += ` sepia(${mergedProps.sepia || 0}%)`;
    filterString += ` grayscale(${mergedProps.grayscale || 0}%)`;
    filterString += ` invert(${mergedProps.invert || 0}%)`;
    return filterString.trim() || 'none';
  };

  // Responsive configuration for react-multi-carousel
  const desktopBreakpoint = getDesktopBreakpoint(viewportSettings);
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1200 },
      items: carouselCenterMode ? Math.max(1, carouselItemsDesktop + 2) : Math.max(1, carouselItemsDesktop),
      slidesToSlide: 1,
      partialVisibilityGutter: carouselCenterMode ? 40 : 0
    },
    desktop: {
      breakpoint: { max: 1200, min: desktopBreakpoint },
      items: carouselCenterMode ? Math.max(1, carouselItemsDesktop + 1) : Math.max(1, carouselItemsDesktop),
      slidesToSlide: 1,
      partialVisibilityGutter: carouselCenterMode ? 30 : 0
    },
    tablet: {
      breakpoint: { max: desktopBreakpoint, min: 600 },
      items: carouselCenterMode ? Math.max(1, carouselItemsTablet + 1) : Math.max(1, carouselItemsTablet),
      slidesToSlide: 1,
      partialVisibilityGutter: carouselCenterMode ? 20 : 0
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: Math.max(1, carouselItemsMobile),
      slidesToSlide: 1,
      partialVisibilityGutter: carouselCenterMode ? 15 : 0
    }
  };

  // Custom arrow components for react-multi-carousel
  const CustomLeftArrow = ({ onClick }: { onClick?: () => void }) => (
    <button
      aria-label="Previous slide"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#333',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.albumSectionNavigation,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      }}
    >
      <FaChevronLeft size={14} />
    </button>
  );

  const CustomRightArrow = ({ onClick }: { onClick?: () => void }) => (
    <button
      aria-label="Next slide"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#333',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.albumSectionNavigation,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      }}
    >
      <FaChevronRight size={14} />
    </button>
  );

  // Render carousel layout using react-multi-carousel
  const renderCarouselLayout = () => {
    if (albumImages.length === 0) return null;

    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Carousel
          responsive={responsive}
          infinite={carouselInfinite}
          autoPlay={carouselAutoPlay}
          autoPlaySpeed={carouselSpeed || 3000}
          keyBoardControl={true}
          customTransition={`transform ${carouselTransformDuration}ms ease-in-out`}
          transitionDuration={carouselTransformDuration}
          containerClass="album-carousel-container"
          removeArrowOnDeviceType={carouselShowArrows ? [] : ["tablet", "mobile", "desktop", "superLargeDesktop"]}
          dotListClass="album-carousel-dots"
          showDots={carouselShowDots}
          customLeftArrow={<CustomLeftArrow />}
          customRightArrow={<CustomRightArrow />}
          itemClass="album-carousel-item"
          sliderClass="album-carousel-slider"
          centerMode={carouselCenterMode}
          partialVisible={carouselCenterMode}
        >
          {albumImages.map((image, index) => (
            <div
              key={image.id}
              className={`album-carousel-slide ${carouselCenterMode ? 'center-mode' : ''}`}
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: `all ${carouselTransformDuration}ms ease`,
                ...getImagePadding(),
              }}
            >
              <div
                className="album-image-container"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  transition: `all ${carouselTransformDuration}ms ease`,
                  cursor: 'pointer',
                }}
                onClick={() => handleImageClick(index)}
                onMouseEnter={(e) => {
                  if (!carouselCenterMode) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!carouselCenterMode) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <img
                  src={getImageUrl(image)}
                  alt={image.alt || `Slide ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: `all ${carouselTransformDuration}ms ease`,
                  }}
                />
              </div>
            </div>
          ))}
        </Carousel>

        {/* Custom CSS styles for section-based carousel */}
        <style>{`
          .album-carousel-container {
            height: 100% !important;
            position: relative !important;
          }

          .album-carousel-container .react-multi-carousel-list {
            height: 100% !important;
          }

          .album-carousel-container .react-multi-carousel-track {
            height: 100% !important;
          }

          .album-carousel-item {
            height: 100% !important;
          }

          /* Center mode styles */
          ${carouselCenterMode ? `
          .album-carousel-slide.center-mode:not(.react-multi-carousel-item--active) .album-image-container {
            transform: scale(${carouselInactiveScale}) !important;
            opacity: ${carouselInactiveOpacity} !important;
          }

          .album-carousel-slide.center-mode.react-multi-carousel-item--active .album-image-container {
            transform: scale(1) !important;
            opacity: 1 !important;
            z-index: ${zIndex.albumSectionCSS} !important;
          }

          .album-carousel-slide.center-mode .album-image-container {
            transition: all ${carouselTransformDuration}ms ease !important;
          }

          /* Enhanced center item styling */
          .album-carousel-slide.center-mode.react-multi-carousel-item--active .album-image-container {
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2) !important;
          }
          ` : ''}

          .album-carousel-dots {
            position: absolute !important;
            bottom: 15px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            display: flex !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
            list-style: none !important;
          }

          .album-carousel-dots li {
            margin: 0 !important;
          }

          .album-carousel-dots li button {
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            border: none !important;
            background-color: rgba(255, 255, 255, 0.5) !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
          }

          .album-carousel-dots li.react-multi-carousel-dot--active button {
            background-color: rgba(255, 255, 255, 1) !important;
            transform: scale(1.2) !important;
          }

          .album-carousel-dots li button:hover {
            background-color: rgba(255, 255, 255, 0.8) !important;
          }

          /* Custom scrollbar styles for thumbnail navigation */
          .album-thumbnail-container::-webkit-scrollbar {
            height: 6px;
          }

          .album-thumbnail-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }

          .album-thumbnail-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }

          .album-thumbnail-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }

          /* Mobile responsive adjustments for modal */
          @media (max-width: 768px) {
            .album-modal-nav-arrow {
              width: 40px !important;
              height: 40px !important;
              left: 15px !important;
            }

            .album-modal-nav-arrow.right {
              right: 15px !important;
              left: auto !important;
            }

            .album-thumbnail-item {
              min-width: 50px !important;
              width: 50px !important;
              height: 50px !important;
            }

            .album-modal-close-btn {
              top: 15px !important;
              right: 15px !important;
              width: 35px !important;
              height: 35px !important;
              font-size: 18px !important;
            }

            .album-modal-counter {
              top: 15px !important;
              font-size: 13px !important;
              padding: 6px 12px !important;
            }
          }

          @media (max-width: 480px) {
            .album-modal-nav-arrow {
              width: 35px !important;
              height: 35px !important;
              left: 10px !important;
            }

            .album-modal-nav-arrow.right {
              right: 10px !important;
              left: auto !important;
            }

            .album-thumbnail-item {
              min-width: 45px !important;
              width: 45px !important;
              height: 45px !important;
            }

            .album-modal-close-btn {
              top: 10px !important;
              right: 10px !important;
              width: 32px !important;
              height: 32px !important;
              font-size: 16px !important;
            }

            .album-modal-counter {
              top: 10px !important;
              font-size: 12px !important;
              padding: 5px 10px !important;
            }
          }
        `}</style>
      </div>
    );
  };



  // Render carousel layout only
  const renderLayout = () => {
    return renderCarouselLayout();
  };

  // Enhanced image modal with navigation and thumbnails
  const renderImageModal = () => {
    if (selectedImageIndex === null || !albumImages[selectedImageIndex]) return null;

    const image = albumImages[selectedImageIndex];
    const showNavigation = albumImages.length > 1;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: zIndex.albumSection,
          padding: '20px',
          boxSizing: 'border-box',
        }}
        onClick={closeImageModal}
      >
        {/* Left navigation arrow - fixed to screen edge */}
        {showNavigation && (
          <button
            className="album-modal-nav-arrow"
            onClick={(e) => {
              e.stopPropagation();
              navigateToPrevious();
            }}
            style={{
              position: 'fixed',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: zIndex.albumModalItem,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              fontSize: '18px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <FaChevronLeft />
          </button>
        )}

        {/* Right navigation arrow - fixed to screen edge */}
        {showNavigation && (
          <button
            className="album-modal-nav-arrow right"
            onClick={(e) => {
              e.stopPropagation();
              navigateToNext();
            }}
            style={{
              position: 'fixed',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: zIndex.albumModalItem,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              fontSize: '18px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <FaChevronRight />
          </button>
        )}

        {/* Main image container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            maxWidth: 'calc(100vw - 140px)', // Account for arrow buttons and padding
            maxHeight: 'calc(100vh - 160px)', // Account for thumbnails and padding
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main image */}
          <img
            src={getImageUrl(image)}
            alt={image.alt || `Image ${selectedImageIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          />

          {/* Close button - fixed to screen */}
          <button
            className="album-modal-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              closeImageModal();
            }}
            style={{
              position: 'fixed',
              top: '10%',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              zIndex: zIndex.albumModalSelected,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Image counter - fixed to screen */}
          {showNavigation && (
            <div
              className="album-modal-counter"
              style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                zIndex: zIndex.albumModalSelected,
              }}
            >
              {selectedImageIndex + 1} / {albumImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail navigation bar */}
        {showNavigation && (
          <div
            className="album-thumbnail-container"
            style={{
              width: '100%',
              maxWidth: 'calc(100vw - 40px)', // Account for screen padding
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              overflowX: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {albumImages.map((thumbImage, index) => (
              <div
                key={thumbImage.id}
                className="album-thumbnail-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(index);
                }}
                style={{
                  minWidth: '60px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: index === selectedImageIndex ? '3px solid #ffffff' : '3px solid transparent',
                  opacity: index === selectedImageIndex ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  boxShadow: index === selectedImageIndex
                    ? '0 4px 12px rgba(255, 255, 255, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  transform: index === selectedImageIndex ? 'scale(1.1)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (index !== selectedImageIndex) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== selectedImageIndex) {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <img
                  src={getImageUrl(thumbImage)}
                  alt={thumbImage.alt || `Thumbnail ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Generate comprehensive styles (adapted from Sections component) - moved before edit mode
  const backgroundContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100vw', // Full viewport width for background
    height: mergedProps.height || '400px',
    left: '50%',
    transform: 'translateX(-50%)', // Center the full-width container
    mixBlendMode: mergedProps.blendMode !== 'normal' ? mergedProps.blendMode as any : undefined,
    opacity: mergedProps.opacity !== undefined ? mergedProps.opacity / 100 : undefined,
    filter: getFilterCSS() !== 'none' ? getFilterCSS() : undefined,
    isolation: 'isolate', // Create stacking context
  };

  const beforeStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: zIndex.base,
    background: mergedProps.backgroundType !== 'video' ? getCombinedBackgroundCSS() : undefined,
    opacity: mergedProps.backgroundType !== 'video' && mergedProps.backgroundOpacity !== undefined ? mergedProps.backgroundOpacity / 100 : undefined,
  };

  const overlayStyle = mergedProps.overlayType && mergedProps.overlayType !== 'none' ? {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: getOverlayBackgroundCSS(),
    mixBlendMode: (mergedProps.overlayBlendMode || 'normal') as any,
    opacity: (mergedProps.overlayOpacity || 100) / 100,
    pointerEvents: 'none' as const,
    zIndex: zIndex.content,
    ...(mergedProps.overlayType === 'image' ? {
      backgroundSize: mergedProps.overlayImageSize || 'cover',
      backgroundPosition: mergedProps.overlayImagePosition || 'center',
      backgroundRepeat: mergedProps.overlayImageRepeat || 'no-repeat',
      backgroundAttachment: mergedProps.overlayImageAttachment || 'scroll',
    } : {})
  } : null;

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    boxSizing: 'border-box',
    zIndex: zIndex.contentOverlay, // Above background and overlay
    ...getWrapperPadding(),
  };

  const contentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: currentPlatform === 'mobile' ? getMobileWidth(viewportSettings) : getDesktopWidth(viewportSettings),
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
  };

  // Editor mode - show placeholder/container outline with full styling
  if (enabled) {
    return (
      <div
        ref={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        data-node-id={id}
        style={backgroundContainerStyle}
      >
        {/* Background layer */}
        {mergedProps.backgroundType !== 'video' && <div style={beforeStyle} />}

        {/* Video background (if applicable) */}
        {mergedProps.backgroundType === 'video' && mergedProps.backgroundVideo && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: zIndex.base,
              overflow: 'hidden',
            }}
          >
            {mergedProps.backgroundVideoType === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${mergedProps.backgroundVideo}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100%',
                  transform: 'translate(-50%, -50%)',
                  border: 'none',
                  opacity: mergedProps.backgroundOpacity !== undefined ? mergedProps.backgroundOpacity / 100 : 1,
                }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100%',
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'cover',
                  opacity: mergedProps.backgroundOpacity !== undefined ? mergedProps.backgroundOpacity / 100 : 1,
                }}
              >
                <source src={mergedProps.backgroundVideo} type="video/mp4" />
              </video>
            )}
          </div>
        )}

        {/* Overlay layer */}
        {overlayStyle && <div style={overlayStyle} />}

        {/* Content wrapper */}
        <div style={wrapperStyle}>
          <div style={contentStyle}>
            {albumImages.length > 0 ? renderLayout() : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #ccc',
                background: '#f9f9f9',
                color: '#666',
                fontSize: '16px',
                textAlign: 'center',
                padding: '20px',
                boxSizing: 'border-box',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '18px' }}>
                    Album Section (Carousel)
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                    No images • Carousel layout
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Use settings panel to add images and configure layout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {hidden && <OverlayHidden />}
      </div>
    );
  }

  // View mode - render actual album content wrapped in Sections
  if (hidden) {
    return null;
  }

  return (
    <>
      <div
        ref={(dom: HTMLDivElement | null) => {
          if (dom) {
            connect(dom);
            containerRef.current = dom;
          }
        }}
        data-node-id={id}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={backgroundContainerStyle}
      >
        {/* Background layer */}
        {mergedProps.backgroundType !== 'video' && <div style={beforeStyle} />}

        {/* Video background (if applicable) */}
        {mergedProps.backgroundType === 'video' && mergedProps.backgroundVideo && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: zIndex.base,
              overflow: 'hidden',
            }}
          >
            {mergedProps.backgroundVideoType === 'youtube' ? (
              <iframe
                src={`https://www.youtube.com/embed/${mergedProps.backgroundVideo}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100%',
                  transform: 'translate(-50%, -50%)',
                  border: 'none',
                  opacity: mergedProps.backgroundOpacity !== undefined ? mergedProps.backgroundOpacity / 100 : 1,
                }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  minWidth: '100%',
                  minHeight: '100%',
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'cover',
                  opacity: mergedProps.backgroundOpacity !== undefined ? mergedProps.backgroundOpacity / 100 : 1,
                }}
              >
                <source src={mergedProps.backgroundVideo} type="video/mp4" />
              </video>
            )}
          </div>
        )}

        {/* Overlay layer */}
        {overlayStyle && <div style={overlayStyle} />}

        {/* Content wrapper */}
        <div style={wrapperStyle}>
          <div style={contentStyle}>
            {renderLayout()}
          </div>
        </div>
      </div>
      {renderImageModal()}
    </>
  );
};

AlbumSection.craft = {
  displayName: 'AlbumSection',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false, // Section-based components don't accept child components
  },
  related: {
    toolbar: AlbumSectionSettings,
  },
};
