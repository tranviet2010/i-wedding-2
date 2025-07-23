import React from 'react';
import { useViewport } from '../../editor/Viewport/ViewportContext';
import { getYouTubeVideoId } from '@/utils/helper';
import { zIndex } from '@/utils/zIndex';

export interface LightBoxProps {
  id: string;
}

export const LightBox: React.FC<LightBoxProps> = () => {
  const { currentLightBoxOpen, closeLightBox } = useViewport();

  // Handle backdrop click to close lightbox
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeLightBox();
    }
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeLightBox();
  };

  // Check if this lightbox should be open
  const isOpen = currentLightBoxOpen && currentLightBoxOpen.lightboxMediaType;

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  // Render media content based on type
  const renderMediaContent = () => {
    if (currentLightBoxOpen.lightboxMediaType === 'image' && currentLightBoxOpen.lightboxImageUrl) {
      return (
        <img
          src={currentLightBoxOpen.lightboxImageUrl}
          alt="LightBox Image"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      );
    }

    if (currentLightBoxOpen.lightboxMediaType === 'video' && currentLightBoxOpen.lightboxVideoUrl) {
      if (currentLightBoxOpen.lightboxVideoType === 'youtube') {
        const videoId = getYouTubeVideoId(currentLightBoxOpen.lightboxVideoUrl);
        if (videoId) {
          return (
            <iframe
              width="800"
              height="450"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              style={{
                border: 'none',
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: '8px'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          );
        }
      } else if (currentLightBoxOpen.lightboxVideoType === 'meHappyVideo') {
        return (
          <video
            controls
            autoPlay
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px'
            }}
          >
            <source src={currentLightBoxOpen.lightboxVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      }
    }

    return (
      <div style={{ color: 'white', padding: '20px' }}>
        <p>No media content available</p>
      </div>
    );
  };

  // Render as full-screen modal
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.lightBox,
        cursor: 'pointer'
      }}
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={handleCloseClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: zIndex.lightBoxContent
        }}
      >
        ×
      </button>

      {/* Media content */}
      <div
        style={{ cursor: 'default' }}
        onClick={(e) => e.stopPropagation()}
      >
        {renderMediaContent()}
      </div>
    </div>
  );
};
