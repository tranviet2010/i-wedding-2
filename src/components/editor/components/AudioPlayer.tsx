import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AudioSettings } from '@/features/template/templateAPI';
import styled, { keyframes, css } from 'styled-components';
import { Tooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/utils/zIndex';

// Keyframe animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05) rotate(1deg); }
  100% { transform: scale(1) rotate(-1deg); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 10px rgba(139, 0, 0, 0.2), 0 0 20px rgba(139, 0, 0, 0.2); }
  50% { box-shadow: 0 0 20px rgba(139, 0, 0, 0.6), 0 0 30px rgba(139, 0, 0, 0.5); }
  100% { box-shadow: 0 0 10px rgba(139, 0, 0, 0.2), 0 0 20px rgba(139, 0, 0, 0.2); }
`;

const growFromLeft = keyframes`
  0% {
    transform: scaleX(0);
    transform-origin: left center;
  }
  100% {
    transform: scaleX(1);
    transform-origin: left center;
  }
`;

// Styled components
const MusicToggle = styled.button<{ $isVibrating?: boolean }>`
  position: fixed;
  bottom: 15px;
  left: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${zIndex.audioPlayer};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  img {
    width: 25px;
    height: 25px;
    pointer-events: none;
  }

  /* Animation effects when playing */
  ${props => props.$isVibrating && css`
    animation: ${rotate} 4s linear infinite, ${glow} 2s ease-in-out infinite;
    box-shadow: 0 0 15px rgba(139, 0, 0, 0.6), 0 0 25px rgba(139, 0, 0, 0.4);
  `}
`;

interface AudioPlayerProps {
  audioSettings: Partial<AudioSettings>;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioSettings,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTooltipOnFirstVisit, setShowTooltipOnFirstVisit] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-show tooltip on first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('audioPlayerTooltipShown');
    if (!hasVisitedBefore && audioSettings.audioUrl) {
      setShowTooltipOnFirstVisit(true);
      localStorage.setItem('audioPlayerTooltipShown', 'true');

      const timer = setTimeout(() => {
        setShowTooltipOnFirstVisit(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [audioSettings.audioUrl]);

  // Auto-play on user interaction (scroll, touch, click)
  const startMusic = useCallback(() => {
    if (!audioRef.current || !audioSettings.audioUrl || hasStarted) {
      return;
    }

    audioRef.current.volume = volume;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      })
      .catch((error) => {
        console.warn('Không thể phát nhạc tự động:', error);
      });
  }, [audioSettings.audioUrl, hasStarted, volume]);

  // Set up user interaction listeners for auto-play
  useEffect(() => {
    if (!audioSettings.autoPlay || hasStarted) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (hasStarted) return;

      let isSwipe = false;
      if (e.changedTouches && e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - touchStartX;
        const diffY = endY - touchStartY;
        if (Math.abs(diffX) > 30 || Math.abs(diffY) > 30) {
          isSwipe = true;
        }
      }

      // Trigger on swipe or tap
      if (isSwipe || !isSwipe) {
        startMusic();
      }
    };

    const handlePointerDown = () => {
      startMusic();
    };

    const handleScroll = () => {
      startMusic();
    };

    // Add event listeners
    document.body.addEventListener('touchstart', handleTouchStart);
    document.body.addEventListener('touchend', handleTouchEnd);
    document.body.addEventListener('pointerdown', handlePointerDown, { once: true });
    document.addEventListener('scroll', handleScroll, { once: true });

    return () => {
      document.body.removeEventListener('touchstart', handleTouchStart);
      document.body.removeEventListener('touchend', handleTouchEnd);
      document.body.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [audioSettings.autoPlay, hasStarted, startMusic]);

  // Handle play/pause
  const togglePlayPause = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling

    // Hide tooltip when user interacts with the button
    if (showTooltipOnFirstVisit) {
      setShowTooltipOnFirstVisit(false);
    }

    if (!audioRef.current || !audioSettings.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // User interaction - this should work even if auto-play failed
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch((error) => {
          console.error('Play failed:', error);
          setIsPlaying(false);
        });
    }
  };



  // Audio event handlers
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    console.error('Audio playback error');
    setIsPlaying(false);
  };

  // Don't render if no audio URL
  if (!audioSettings.audioUrl) {
    return null;
  }

  // Get the appropriate icon with default paths
  const getPlayPauseIcon = () => {
    if (!isPlaying) {
      // Use default pause icon if useDefaultIcons is true, otherwise use custom or fallback
      const pauseIconSrc = audioSettings.useDefaultIcons
        ? '/icons/pause.jpg'
        : (audioSettings.pauseIconUrl || '/icons/pause.jpg');
      return (
        <img
          src={pauseIconSrc}
          alt="Pause Icon"
          className="w-6 h-6 object-contain pointer-events-none"
          style={{ display: 'block' }}
        />
      );
    } else {
      // Use default play icon if useDefaultIcons is true, otherwise use custom or fallback
      const playIconSrc = audioSettings.useDefaultIcons
        ? '/icons/play.png'
        : (audioSettings.playIconUrl || '/icons/play.png');
      return (
        <img
          src={playIconSrc}
          alt="Play Icon"
          className="w-6 h-6 object-contain pointer-events-none"
          style={{ display: 'block' }}
        />
      );
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSettings.audioUrl}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="auto"
        loop
      />

      {/* Fixed audio control in bottom left */}
      <Tooltip
        content="Click vào đây nếu bạn muốn phát nhạc"
        positioning={{ placement: "left" }}
        openDelay={showTooltipOnFirstVisit ? 0 : 10}
        closeDelay={300}
        open={showTooltipOnFirstVisit}
        onOpenChange={(details) => {
          if (!details.open) {
            setShowTooltipOnFirstVisit(false);
          }
        }}
        contentProps={{
          css: css`
            animation: ${growFromLeft} 0.2s ease-out;
            transform-origin: left center;
            font-size: 14px;
            padding: 8px 12px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 6px;
            white-space: nowrap;
            z-index: ${zIndex.audioPlayerControls};
          `
        }}
      >
        <MusicToggle
          onClick={togglePlayPause}
          className={className}
          $isVibrating={isPlaying && audioSettings.enableAnimations}
        >
          {getPlayPauseIcon()}
        </MusicToggle>
      </Tooltip>
    </>
  );
};
