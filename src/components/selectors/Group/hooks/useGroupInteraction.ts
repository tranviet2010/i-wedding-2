import { useState, useRef, useEffect, useCallback } from 'react';
import { useMultiSelectContext } from '../../../editor/contexts/MultiSelectContext';
import { useIsMobile } from '../../../editor/hooks/useMobile';

interface UseGroupInteractionProps {
  id: string;
  enabled: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useGroupInteraction = ({
  id,
  enabled,
  containerRef,
}: UseGroupInteractionProps) => {
  const multiSelect = useMultiSelectContext();
  const { setCurrentSelection } = multiSelect;
  const isMobile = useIsMobile();

  // State for managing overlay visibility and child access mode
  const [isChildAccessMode, setIsChildAccessMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<number | null>(null);
  const childAccessTimeoutRef = useRef<number | null>(null);

  // Touch event state for mobile double tap detection
  const [touchCount, setTouchCount] = useState(0);
  const touchTimeoutRef = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      if (childAccessTimeoutRef.current) {
        clearTimeout(childAccessTimeoutRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  // Add click outside listener to exit child access mode
  useEffect(() => {
    if (!isChildAccessMode || !enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Clicked outside the group, exit child access mode
        setIsChildAccessMode(false);
        if (childAccessTimeoutRef.current) {
          clearTimeout(childAccessTimeoutRef.current);
          childAccessTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChildAccessMode, enabled, containerRef]);

  // Function to enable child access mode temporarily
  const enableChildAccessMode = useCallback(() => {
    setIsChildAccessMode(true);

    // Clear any existing timeout
    if (childAccessTimeoutRef.current) {
      clearTimeout(childAccessTimeoutRef.current);
    }

    // Re-enable overlay after 5 seconds
    childAccessTimeoutRef.current = window.setTimeout(() => {
      setIsChildAccessMode(false);
    }, 5000);
  }, []);

  // Handle touch events for mobile double tap detection
  const handleOverlayTouch = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTouchTime.current;

    // Clear existing timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    // If this touch is within 500ms of the last touch, it's a double tap
    if (timeDiff < 500 && touchCount === 1) {
      // Double tap detected - enable child access mode
      enableChildAccessMode();
      setTouchCount(0);
      lastTouchTime.current = 0;
    } else {
      // First tap or tap after timeout
      setTouchCount(1);
      lastTouchTime.current = currentTime;

      // Handle single tap - select the group and enable drag mode
      if (enabled) {
        setCurrentSelection(id);
      }

      // Set timeout to reset touch count
      touchTimeoutRef.current = window.setTimeout(() => {
        setTouchCount(0);
        lastTouchTime.current = 0;
      }, 500); // 500ms window for double-tap detection (longer than mouse double-click)
    }
  }, [touchCount, enabled, setCurrentSelection, id, enableChildAccessMode]);

  // Handle overlay click with single/double click detection
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Increment click count
    setClickCount(prev => prev + 1);

    // Clear existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Set timeout to reset click count
    clickTimeoutRef.current = window.setTimeout(() => {
      setClickCount(0);
    }, 300); // 300ms window for double-click detection

    // Handle single click - select the group and enable drag mode
    if (clickCount === 0) {
      if (enabled) {
        setCurrentSelection(id);
        // Group is now selected and immediately draggable via craft.js connectors
      }
    }
    // Handle double click - enable child access mode
    else if (clickCount === 1) {
      enableChildAccessMode();
      setClickCount(0); // Reset immediately after double-click
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    }
  }, [clickCount, enabled, setCurrentSelection, id, enableChildAccessMode]);

  // Determine if overlay should be shown (not in child access mode)
  const shouldShowOverlay = enabled && !isChildAccessMode;

  return {
    isChildAccessMode,
    shouldShowOverlay,
    handleOverlayClick,
    handleOverlayTouch,
    enableChildAccessMode,
    isMobile,
  };
};
