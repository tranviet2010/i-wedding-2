import { generateCroppedImageUrl } from '@/utils/cropImage';
import { useEditor, useNode } from '@craftjs/core';
import React, { useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { zIndex } from '@/utils/zIndex';
import { useViewport } from '../../editor/Viewport/ViewportContext';
import { AlbumModalSettings } from './AlbumModalSettings';
import { useIsMobile } from '@/components/editor/hooks/useMobile';
import { AlbumCropData } from '../AlbumSection/AlbumImageCropModal';
import { createImage } from '@/utils/cropImage';

// Album image interface
export interface AlbumImage {
  id: string;
  url: string;
  title?: string;
  alt?: string;
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
}

// Function to generate cropped URL for album images using react-image-crop data
const generateAlbumReactImageCroppedUrl = async (
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
    console.error('Error generating album react-image-crop cropped URL:', error);
    return null;
  }
};

export interface AlbumModalProps {
  id?: string;
  albumImages: AlbumImage[];
}

const defaultProps: AlbumModalProps = {
  albumImages: [],
};

export const AlbumModal = (props: Partial<AlbumModalProps>) => {
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const { albumImages } = mergedProps;
  const { query, enabled, actions } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    connectors: { connect },
    id,
    selected,
  } = useNode((node) => ({
    selected: node.events.selected
  }));
  const [generatedCroppedUrls, setGeneratedCroppedUrls] = useState<Record<string, string | null>>({});
  const { closePopup, currentPopupIdOpen, openPopup } = useViewport();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);
  const isMobile = useIsMobile();

  // Get popup open state from viewport context (same pattern as Popup component)
  const isOpen = id === currentPopupIdOpen;

  // Debug logging (same pattern as Popup component)
  React.useEffect(() => {
    console.log('🔍 AlbumModal state:', { id, currentPopupIdOpen, isOpen, enabled, selected });
  }, [id, currentPopupIdOpen, isOpen, enabled, selected]);

  // Auto-open AlbumModal when selected in editor mode (same pattern as Popup component)
  React.useEffect(() => {
    if (enabled && selected && !isOpen) {
      console.log('🔥 Opening AlbumModal for editing:', { id, selected, enabled });
      openPopup(id);
      // Select the node when modal opens
      actions.selectNode(id);
    }
  }, [enabled, selected, isOpen, id, openPopup, actions]);



  // Get the album modal data from the current open modal
  const albumModalData = React.useMemo(() => {
    if (!currentPopupIdOpen) return null;

    try {
      const nodes = query.getNodes();
      const node = nodes[currentPopupIdOpen];
      if (node && node.data && node.data.displayName === 'Album Modal') {
        return node.data.props as AlbumModalProps;
      }
    } catch (error) {
      console.error('Error getting album modal data:', error);
    }
    return null;
  }, [currentPopupIdOpen, query]);
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
            const croppedUrl = await generateAlbumReactImageCroppedUrl(
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

  React.useEffect(() => {
    if (isOpen && selectedImageIndex === null && albumImages.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [isOpen, selectedImageIndex, albumImages.length]);
  // Handle backdrop click to close modal (same pattern as Popup component)
  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('Backdrop clicked:', { target: e.target, currentTarget: e.currentTarget, enabled });
    if (e.target === e.currentTarget && !enabled) {
      closePopup();
      setSelectedImageIndex(null);
    }
  };

  // Handle close button click (same pattern as Popup component)
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enabled) {
      // In editor mode, close the popup and deselect the node
      closePopup();
      actions.selectNode([]);
    } else {
      // In preview mode, actually close the modal
      closePopup();
    }
    setSelectedImageIndex(null);
  };



  // Navigation functions
  const navigateToPrevious = () => {
    if (selectedImageIndex !== null && albumModalData && albumModalData.albumImages.length > 0) {
      const newIndex = selectedImageIndex === 0 ? albumModalData.albumImages.length - 1 : selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
    }
  };

  const navigateToNext = () => {
    if (selectedImageIndex !== null && albumModalData && albumModalData.albumImages.length > 0) {
      const newIndex = selectedImageIndex === albumModalData.albumImages.length - 1 ? 0 : selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
    }
  };

  // Keyboard event handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events when the modal is open
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          if (enabled) {
            // In editor mode, close the popup and deselect the node
            closePopup();
            actions.selectNode([]);
          } else {
            // In preview mode, actually close the modal
            closePopup();
          }
          setSelectedImageIndex(null);
          break;

        case 'ArrowLeft':
          event.preventDefault();
          navigateToPrevious();
          break;

        case 'ArrowRight':
          event.preventDefault();
          navigateToNext();
          break;
      }
    };

    // Add event listener when modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, enabled, closePopup, actions, navigateToPrevious, navigateToNext]);

  // Follow same pattern as Popup component - only show when modal should be open
  const shouldShowModal = isOpen;

  if (!shouldShowModal) {
    return null;
  }

  // Helper function to get the correct image URL (cropped or original)
  const getImageUrl = (image: typeof mergedProps.albumImages[0]): string => {
    if (image.croppedImageUrl) {
      return image.croppedImageUrl;
    }
    if (generatedCroppedUrls[image.id]) {
      return generatedCroppedUrls[image.id]!;
    }
    return image.url;
  };



  // In editor mode, show a simplified modal for editing (same pattern as Popup component)
  if (enabled) {
    return (
      <div
        ref={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: zIndex.albumModal,
          backdropFilter: 'blur(2px)',
        }}
        onClick={handleCloseClick}
      >
        <div
          ref={containerRef}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '400px',
            overflow: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button at top of modal in editor mode */}
          <button
            onClick={handleCloseClick}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
            title="Close Album Modal"
          >
            ×
          </button>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Album Modal - Editor Mode
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              Album contains {albumImages.length} image{albumImages.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {albumImages.slice(0, 6).map((image, index) => (
                <div key={image.id} style={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt || `Image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                    }}
                  />
                </div>
              ))}
              {albumImages.length > 6 && (
                <div style={{
                  width: '100%',
                  height: '60px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#666',
                }}>
                  +{albumImages.length - 6}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always render a hidden connectable element for craft.js settings
  const hiddenConnectableElement = (
    <div
      ref={(dom: HTMLDivElement | null) => {
        if (dom) connect(dom);
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: zIndex.behind,
      }}
      data-album-modal-id={id}
    />
  );

  // In preview mode, show full album modal experience
  if (selectedImageIndex === null || !albumImages[selectedImageIndex]) {
    return hiddenConnectableElement;
  }

  const image = albumImages[selectedImageIndex];
  const showNavigation = albumImages.length > 1;

  return (
    <>
      {hiddenConnectableElement}
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
          zIndex: zIndex.albumModalContent,
          padding: '20px',
          boxSizing: 'border-box',
        }}
        onClick={handleBackdropClick}
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
              left: isMobile ? '0px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: 'none',
              borderRadius: '50%',
              width: isMobile ? '30px' : '50px',
              height: isMobile ? '30px' : '50px',
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
              right: isMobile ? '0px' : '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: 'none',
              borderRadius: '50%',
              width: isMobile ? '30px' : '50px',
              height: isMobile ? '30px' : '50px',
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
            maxWidth: isMobile ? '100vw' : 'calc(100vw - 140px)', // Account for arrow buttons and padding
            maxHeight: isMobile ? '60vh' : 'calc(100vh - 160px)', // Account for thumbnails and padding
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
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

          {/* Close button - fixed to screen (only show in preview mode, same pattern as Popup) */}
          {!enabled && (
            <button
              className="album-modal-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseClick(e);
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
          )}

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
              maxWidth: 'calc(100vw - 40px)',
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              padding: isMobile ? '8px' : '16px',
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
    </>
  );

};

AlbumModal.craft = {
  displayName: 'Album Modal',
  props: defaultProps,
  rules: {
    canDrag: () => false,
    canDrop: () => false,
    canMoveIn: () => false, // Section-based components don't accept child components
  },
  related: {
    toolbar: AlbumModalSettings,
  },
};
