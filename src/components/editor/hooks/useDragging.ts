import { useCallback, useEffect, useRef } from 'react';
import { NodeId } from '@craftjs/core';
import { useSmartAlignment } from './useSmartAlignment';
import { useIsMobile } from './useMobile';

// Helper function to get coordinates from mouse or touch event
const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e && e.touches.length > 0) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
  }
  return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
};

interface UseDraggingProps {
  dom: HTMLElement | null;
  isLocked: boolean;
  isActive: boolean;
  parentNode: any;
  parent: NodeId | null;
  setIsDragging: (isDragging: boolean) => void;
  setIsNearVerticalCenter: (isNear: boolean) => void;
  setIsNearHorizontalCenter: (isNear: boolean) => void;
  setShowMiddleGuides: (show: boolean) => void;
  setCurrentDragParent: (parent: NodeId | null) => void;
  setParentRect: (rect: DOMRect | null) => void;
  actions: any;
  id: NodeId;
  props: any;
  name: string;
  query: any; // Add query for section detection
  isSectionSwitchingDisabled?: boolean; // Add flag to disable section switching
}

export const useDragging = ({
  dom,
  isLocked,
  isActive,
  parentNode,
  parent,
  setIsDragging,
  setIsNearVerticalCenter,
  setIsNearHorizontalCenter,
  setShowMiddleGuides,
  setCurrentDragParent,
  setParentRect,
  actions,
  id,
  props,
  name,
  query,
  isSectionSwitchingDisabled = false
}: UseDraggingProps) => {
  // Mobile detection
  const isMobile = useIsMobile();

  // Components that should skip dragging behavior
  const NON_DRAGGABLE_COMPONENTS = ['Popup', 'Dropbox', 'Content Wrapper', 'Sections', 'AlbumSection', 'Album Modal', 'QuickActions'];
  const skipDragging = NON_DRAGGABLE_COMPONENTS.includes(name) || props.isChildOfButton || props.isChildOfGroup || props.isChildOfForm;

  // Constants for snapping sensitivity (in pixels)
  const SNAP_THRESHOLD = 8; // Reduced for more precise snapping
  const SHOW_GUIDE_THRESHOLD = 20;

  // Mobile gesture detection constants
  const MOBILE_DRAG_THRESHOLD = 15; // Minimum movement to start drag on mobile
  const MOBILE_HOLD_DELAY = 150; // Delay before considering touch as potential drag
  const SCROLL_DIRECTION_THRESHOLD = 10; // Minimum vertical movement to consider as scroll intent

  // Keyboard movement constants
  const KEYBOARD_MOVE_INCREMENT = 1; // Pixels to move per arrow key press

  // Initialize smart alignment hook with auto-snapping enabled
  const smartAlignment = useSmartAlignment({
    query,
    activeNodeId: id,
    snapThreshold: SNAP_THRESHOLD,
    autoSnapEnabled: true,
    magneticStrength: 0.9 // Stronger magnetic attraction for testing
  });

  // History throttling configuration
  const DRAG_HISTORY_THROTTLE = 1000; // Throttle drag operations to 300ms for cleaner undo/redo

  // Ref to track current drag state for cross-section logic and history management
  const dragStateRef = useRef<{
    originalParent: NodeId | null;
    originalParentRect: DOMRect | null;
    currentTargetSection: NodeId | null;
    lastMouseY: number;
    isDragging: boolean;
    startPosition: { x: number; y: number } | null;
    lastSectionSwitchTime: number; // Add throttling for section switches
    // Flag to temporarily disable normal drag calculation after section switch
    skipNextDragCalculation: boolean;
    // New reference points after section switch
    newStartPosX: number;
    newStartPosY: number;
    newStartMouseX: number;
    newStartMouseY: number;
    hasNewStartPosition: boolean;
    // Mobile gesture detection state
    touchStartTime: number;
    touchStartX: number;
    touchStartY: number;
    hasMoved: boolean;
    isWaitingForDragConfirmation: boolean;
    dragConfirmationTimeout: number | null;
  }>({
    originalParent: null,
    originalParentRect: null,
    currentTargetSection: null,
    lastMouseY: 0,
    isDragging: false,
    startPosition: null,
    lastSectionSwitchTime: 0,
    skipNextDragCalculation: false,
    newStartPosX: 0,
    newStartPosY: 0,
    newStartMouseX: 0,
    newStartMouseY: 0,
    hasNewStartPosition: false,
    // Mobile gesture detection state
    touchStartTime: 0,
    touchStartX: 0,
    touchStartY: 0,
    hasMoved: false,
    isWaitingForDragConfirmation: false,
    dragConfirmationTimeout: null
  });

  // Helper function to find all sections in the editor
  const getAllSections = useCallback(() => {
    if (!query) return [];

    try {
      const rootNode = query.node('ROOT').get();
      const sections = rootNode.data.nodes.filter((nodeId: NodeId) => {
        try {
          const node = query.node(nodeId).get();
          return node.data.displayName === 'Sections' || node.data.name === 'Sections';
        } catch (error) {
          return false;
        }
      });
      return sections;
    } catch (error) {
      return [];
    }
  }, [query]);



  // Helper function to get section DOM element and its rect
  const getSectionInfo = useCallback((sectionId: NodeId) => {
    if (!query) return null;

    try {
      const sectionNode = query.node(sectionId).get();
      const sectionDom = sectionNode.dom;
      if (!sectionDom) {
        return null;
      }

      const rect = sectionDom.getBoundingClientRect();

      return {
        dom: sectionDom,
        rect: rect,
        id: sectionId
      };
    } catch (error) {
      return null;
    }
  }, [query]);



  // Cross-section drag detection with immediate boundary-based switching
  const handleCrossSectionDrag = useCallback((
    mouseX: number,
    mouseY: number,
    _elementRect: DOMRect
  ) => {

    // Only proceed if we have query and are dragging
    if (!query || !dragStateRef.current.isDragging) {
      return;
    }

    // Get all sections
    const sections = getAllSections();
    if (sections.length === 0) {
      return;
    }

    // Find which section the mouse is currently over - immediate detection
    let targetSection: NodeId | null = null;

    for (const sectionId of sections) {
      const sectionInfo = getSectionInfo(sectionId);
      if (!sectionInfo) {
        continue;
      }

      const { rect: sectionRect } = sectionInfo;

      // Immediate boundary detection - no buffer zones to prevent element hiding
      const isMouseOver = mouseY >= sectionRect.top && mouseY <= sectionRect.bottom;


      if (isMouseOver) {
        if (sectionId !== dragStateRef.current.currentTargetSection) {
          targetSection = sectionId;
          break;
        }
      }
    }

    if (targetSection && targetSection !== dragStateRef.current.currentTargetSection) {
      if (isSectionSwitchingDisabled) {
        return;
      }

      const now = Date.now();
      const timeSinceLastSwitch = now - dragStateRef.current.lastSectionSwitchTime;
      const cooldownPeriod = 50; // Very short cooldown - just enough to prevent excessive calls

      if (timeSinceLastSwitch < cooldownPeriod) {
        return;
      }


      try {
        // Get current element position before move
        const currentDom = query.node(id).get().dom;

        if (!currentDom) {
          return;
        }

        // Get current element's left position to maintain it
        const currentLeft = parseInt(currentDom.style.left || '0');

        // Get the current section (where element is now) BEFORE updating the state
        const currentSection = dragStateRef.current.currentTargetSection || dragStateRef.current.originalParent;

        // Update current target and timestamp AFTER getting current section
        dragStateRef.current.currentTargetSection = targetSection;
        dragStateRef.current.lastSectionSwitchTime = now;

        // Perform the move operation first
        actions.move(id, targetSection, 0);

        // Get target section height for positioning
        const targetSectionDom = query.node(targetSection).get().dom;
        if (!targetSectionDom) {
          return;
        }

        const sectionHeight = targetSectionDom.offsetHeight || 400; // fallback to 400px

        // Keep the left position
        const newLeftPx = Math.max(20, currentLeft) + 'px';
        let newTopPx: string;

        // Get all sections and their positions to determine direction
        const sections = getAllSections();
        const currentSectionIndex = sections.indexOf(currentSection);
        const targetSectionIndex = sections.indexOf(targetSection);


        if (currentSectionIndex !== -1 && targetSectionIndex !== -1) {
          if (targetSectionIndex > currentSectionIndex) {
            // Moving down (e.g., section 1 to section 2) - set top to 0
            newTopPx = '0px';
          } else if (targetSectionIndex < currentSectionIndex) {
            // Moving up (e.g., section 2 to section 1) - place near bottom based on section height
            const bottomPosition = Math.max(50, sectionHeight - 100); // 100px from bottom, minimum 50px from top
            newTopPx = bottomPosition + 'px';
          } else {
            // Same section (shouldn't happen but fallback)
            newTopPx = '50px';
          }
        } else {
          // Fallback if section indices not found
          newTopPx = '50px';
        }

        // Apply position immediately to DOM for instant visual feedback
        currentDom.style.top = newTopPx;
        currentDom.style.left = newLeftPx;


        // Update props with minimal throttling for history management
        actions.history.throttle(100).setProp(id, (props: any) => {
          props.top = newTopPx;
          props.left = newLeftPx;
        });

        // CRITICAL: Update drag reference points to continue from new position
        // Store the new position as the reference point for continued dragging
        dragStateRef.current.newStartPosX = parseInt(newLeftPx);
        dragStateRef.current.newStartPosY = parseInt(newTopPx);
        dragStateRef.current.newStartMouseX = mouseX; // Use current mouse position
        dragStateRef.current.newStartMouseY = mouseY;
        dragStateRef.current.hasNewStartPosition = true;


      } catch (error) {
        // Reset target section on error
        dragStateRef.current.currentTargetSection = dragStateRef.current.originalParent;
      }
    }
  }, [query, getAllSections, getSectionInfo, actions, id]);

  // Keyboard movement handler for fine-tuned positioning
  const handleKeyboardMovement = useCallback((e: KeyboardEvent) => {
    // Only handle arrow keys when element is active and not locked
    if (!isActive || isLocked || !dom) return;

    // Skip if any modifier keys are pressed (to avoid conflicts with other shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

    // Skip if focus is on an input element
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.contentEditable === 'true'
    )) return;

    // Skip for non-draggable components
    if (skipDragging) {
      return;
    }

    let deltaX = 0;
    let deltaY = 0;

    switch (e.key) {
      case 'ArrowUp':
        deltaY = -KEYBOARD_MOVE_INCREMENT;
        break;
      case 'ArrowDown':
        deltaY = KEYBOARD_MOVE_INCREMENT;
        break;
      case 'ArrowLeft':
        deltaX = -KEYBOARD_MOVE_INCREMENT;
        break;
      case 'ArrowRight':
        deltaX = KEYBOARD_MOVE_INCREMENT;
        break;
      default:
        return; // Not an arrow key, ignore
    }

    // Prevent default behavior for arrow keys
    e.preventDefault();
    e.stopPropagation();

    // Get current position from DOM style instead of props for real-time updates
    const currentX = parseInt(dom.style.left || props.left || '0');
    const currentY = parseInt(dom.style.top || props.top || '0');

    // Calculate new position
    let newX = currentX + deltaX;
    let newY = currentY + deltaY;

    // Get element dimensions for smart alignment
    const elementRect = dom.getBoundingClientRect();

    // Apply smart alignment if available
    if (elementRect) {
      const snappedPosition = smartAlignment.applySmartAlignment(elementRect, newX, newY);
      newX = snappedPosition.x;
      newY = snappedPosition.y;

      // Show guides when snapping occurs
      const shouldShowGuides = snappedPosition.hasVerticalSnap ||
        snappedPosition.hasHorizontalSnap ||
        (snappedPosition.snapStrength && snappedPosition.snapStrength > 0.3);

      setShowMiddleGuides(Boolean(shouldShowGuides));
      setCurrentDragParent(parent);

      // Update visual feedback for section center alignment
      if (snappedPosition.isSnappedToSectionCenter) {
        setIsNearVerticalCenter(!!snappedPosition.verticalSnapPosition);
        setIsNearHorizontalCenter(!!snappedPosition.horizontalSnapPosition);
      }
    }

    // Apply boundary constraints (keep element within reasonable bounds)
    // Get parent rect for boundary checking
    const pRect = parentNode?.dom?.getBoundingClientRect();
    if (pRect) {
      // Ensure element stays within parent bounds with some padding
      const minX = 0;
      const maxX = pRect.width - elementRect.width;
      const minY = 0;
      const maxY = pRect.height - elementRect.height;

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));
    } else {
      // Fallback: ensure element doesn't go negative
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
    }

    // Apply new position to DOM immediately for visual feedback
    dom.style.top = `${newY}px`;
    dom.style.left = `${newX}px`;

    // Update props with throttling to prevent excessive history entries
    actions.history.throttle(100).setProp(id, (props: any) => {
      props.top = `${newY}px`;
      props.left = `${newX}px`;
    });

    // Clear guides after a short delay
    setTimeout(() => {
      setShowMiddleGuides(false);
      setCurrentDragParent(null);
      setIsNearVerticalCenter(false);
      setIsNearHorizontalCenter(false);
    }, 200);

  }, [isActive, isLocked, dom, name, smartAlignment, setShowMiddleGuides, setCurrentDragParent, parent, parentNode, setIsNearVerticalCenter, setIsNearHorizontalCenter, actions, id]);

  useEffect(() => {
    if (!dom || isLocked) return;

    // Skip dragging for non-draggable components
    if (skipDragging) {
      return;
    }

    // Add keyboard event listener for arrow key movement when element is active
    if (isActive) {
      document.addEventListener('keydown', handleKeyboardMovement);
    }

    // Add direct dragging capability when the element is selected
    const makeDraggable = () => {
      // Add draggable styling
      if (isActive) {
        if (!dom.dataset.draggableSetup) {
          dom.dataset.draggableSetup = 'true';

          // Add the mousedown/touchstart event for dragging
          const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            if (isLocked) return;

            // Only handle primary mouse button for mouse events
            if ('button' in e && e.button !== 0) return;

            // Check if click is from node controls or indicator area
            const target = e.target as HTMLElement;

            // Ignore clicks on node controls, indicators, or resize handles
            // BUT allow clicks on drag handle
            if (
              (target.closest('.node-controls') && !target.closest('.drag-handle')) ||
              target.closest('[style*="pointer-events: none"]') ||
              target.closest('.resize-handle-top') ||
              target.closest('.resize-handle-right') ||
              target.closest('.resize-handle-bottom') ||
              target.closest('.resize-handle-left') ||
              target.closest('.resize-handle-top-left') ||
              target.closest('.resize-handle-top-right') ||
              target.closest('.resize-handle-bottom-left') ||
              target.closest('.resize-handle-bottom-right') ||
              target.closest('.react-resizable-handle') ||
              target.classList.contains('react-resizable-handle') ||
              target.closest('[class*="resize-handle"]')
            ) return;

            // Get initial coordinates
            const { clientX: startX, clientY: startY } = getEventCoordinates(e);

            // Mobile-specific gesture detection
            if (isMobile && 'touches' in e) {
              // For mobile, don't prevent default immediately - let's detect intent first
              // Store touch start information for gesture detection
              dragStateRef.current.touchStartTime = Date.now();
              dragStateRef.current.touchStartX = startX;
              dragStateRef.current.touchStartY = startY;
              dragStateRef.current.hasMoved = false;
              dragStateRef.current.isWaitingForDragConfirmation = true;

              // Set up a timeout to confirm drag intent after hold delay
              dragStateRef.current.dragConfirmationTimeout = window.setTimeout(() => {
                // If user hasn't moved significantly and is still touching, consider it a potential drag
                if (dragStateRef.current.isWaitingForDragConfirmation && !dragStateRef.current.hasMoved) {
                  // Now prevent default and start drag behavior
                  e.preventDefault();
                  e.stopPropagation();
                  initiateDragBehavior(startX, startY);
                }
              }, MOBILE_HOLD_DELAY);

              // Set up temporary move listener to detect scroll intent
              const tempMoveHandler = (moveEvent: TouchEvent) => {
                const { clientX: moveX, clientY: moveY } = getEventCoordinates(moveEvent);
                const deltaX = Math.abs(moveX - startX);
                const deltaY = Math.abs(moveY - startY);

                dragStateRef.current.hasMoved = deltaX > 5 || deltaY > 5;

                // If user moves vertically more than horizontally, likely scrolling
                if (deltaY > SCROLL_DIRECTION_THRESHOLD && deltaY > deltaX * 1.5) {
                  // Clear timeout and allow normal scrolling
                  if (dragStateRef.current.dragConfirmationTimeout) {
                    clearTimeout(dragStateRef.current.dragConfirmationTimeout);
                    dragStateRef.current.dragConfirmationTimeout = null;
                  }
                  dragStateRef.current.isWaitingForDragConfirmation = false;

                  // Remove temporary listeners
                  document.removeEventListener('touchmove', tempMoveHandler);
                  document.removeEventListener('touchend', tempEndHandler);
                  return;
                }

                // If user moves horizontally significantly, likely dragging
                if (deltaX > MOBILE_DRAG_THRESHOLD || (deltaX > 5 && deltaX > deltaY)) {
                  // Clear timeout and start drag immediately
                  if (dragStateRef.current.dragConfirmationTimeout) {
                    clearTimeout(dragStateRef.current.dragConfirmationTimeout);
                    dragStateRef.current.dragConfirmationTimeout = null;
                  }

                  // Prevent default and start drag
                  moveEvent.preventDefault();
                  moveEvent.stopPropagation();

                  // Remove temporary listeners
                  document.removeEventListener('touchmove', tempMoveHandler);
                  document.removeEventListener('touchend', tempEndHandler);

                  // Start drag behavior
                  initiateDragBehavior(startX, startY);
                }
              };

              const tempEndHandler = () => {
                // Clean up timeout and temporary listeners
                if (dragStateRef.current.dragConfirmationTimeout) {
                  clearTimeout(dragStateRef.current.dragConfirmationTimeout);
                  dragStateRef.current.dragConfirmationTimeout = null;
                }
                dragStateRef.current.isWaitingForDragConfirmation = false;

                document.removeEventListener('touchmove', tempMoveHandler);
                document.removeEventListener('touchend', tempEndHandler);
              };

              // Add temporary listeners with passive: false for preventDefault capability
              document.addEventListener('touchmove', tempMoveHandler, { passive: false });
              document.addEventListener('touchend', tempEndHandler);

              return; // Exit early for mobile - drag will be initiated by gesture detection
            }

            // For desktop (mouse events), proceed with immediate drag behavior
            e.preventDefault();
            e.stopPropagation();
            initiateDragBehavior(startX, startY);
          };

          // Separate function to initiate drag behavior (used by both desktop and mobile)
          const initiateDragBehavior = (startX: number, startY: number) => {
            const startPosX = parseInt(props.left || '0');
            const startPosY = parseInt(props.top || '0');

            // Get element and parent dimensions
            const elementRect = dom.getBoundingClientRect();

            // Make sure to get the most up-to-date parent rect
            let pRect = parentNode?.dom?.getBoundingClientRect() || null;

            if (pRect) {
              setParentRect(pRect);
            }

            // Initialize drag state for cross-section logic and history management
            dragStateRef.current = {
              originalParent: parent,
              originalParentRect: pRect,
              currentTargetSection: parent,
              lastMouseY: startY,
              isDragging: true,
              startPosition: { x: startPosX, y: startPosY },
              lastSectionSwitchTime: 0,
              skipNextDragCalculation: false,
              newStartPosX: 0,
              newStartPosY: 0,
              newStartMouseX: 0,
              newStartMouseY: 0,
              hasNewStartPosition: false,
              // Mobile gesture detection state
              touchStartTime: 0,
              touchStartX: 0,
              touchStartY: 0,
              hasMoved: false,
              isWaitingForDragConfirmation: false,
              dragConfirmationTimeout: null
            };


            // Set dragging state to true
            setIsDragging(true);

            // Initialize smart alignment cache when dragging starts
            smartAlignment.initializeCache();

            // Show middle guides on parent when dragging starts
            if (parent) {
              setCurrentDragParent(parent);
              setShowMiddleGuides(true);
            }

            // Visual feedback
            dom.style.opacity = '0.8';

            const handlePointerMove = (moveEvent: MouseEvent | TouchEvent) => {
              // Prevent default behavior (especially important for touch to prevent scrolling)
              moveEvent.preventDefault();

              // Skip drag calculation if we just switched sections to prevent conflict
              if (dragStateRef.current.skipNextDragCalculation) {
                dragStateRef.current.skipNextDragCalculation = false;
                return;
              }

              // Get coordinates from mouse or touch event
              const { clientX: moveX, clientY: moveY } = getEventCoordinates(moveEvent);

              // Calculate new position using updated reference points if available
              let newX, newY;

              if (dragStateRef.current.hasNewStartPosition) {
                // Use updated reference points from section switch
                const newDx = moveX - dragStateRef.current.newStartMouseX;
                const newDy = moveY - dragStateRef.current.newStartMouseY;
                newX = dragStateRef.current.newStartPosX + newDx;
                newY = dragStateRef.current.newStartPosY + newDy;
              } else {
                // Use original reference points
                const dx = moveX - startX;
                const dy = moveY - startY;
                newX = startPosX + dx;
                newY = startPosY + dy;
              }

              // Get the most up-to-date parent rect for each move
              pRect = parentNode?.dom?.getBoundingClientRect() || pRect;

              // Handle cross-section drag detection with improved error handling
              try {
                const currentElementRect = dom.getBoundingClientRect();
                handleCrossSectionDrag(moveX, moveY, currentElementRect);

                // If section switch just happened, skip the rest of the drag calculation
                if (dragStateRef.current.skipNextDragCalculation) {
                  dragStateRef.current.skipNextDragCalculation = false;
                  return;
                }
              } catch (error) {
                // Reset target section on error to prevent stuck state
                if (dragStateRef.current) {
                  dragStateRef.current.currentTargetSection = dragStateRef.current.originalParent;
                }
              }

              // Apply Smart Alignment snapping if we have element dimensions
              if (elementRect) {
                // Apply smart alignment with magnetic auto-snapping
                const snappedPosition = smartAlignment.applySmartAlignment(elementRect, newX, newY);

                // Debug logging for alignment
                if (snappedPosition.snapStrength && snappedPosition.snapStrength > 0) {
                  console.log(`🎯 Drag Alignment: (${newX}, ${newY}) -> (${snappedPosition.x}, ${snappedPosition.y})`);
                }

                newX = snappedPosition.x;
                newY = snappedPosition.y;

                // Show guides when any snapping occurs or when magnetically attracted
                const shouldShowGuides = snappedPosition.hasVerticalSnap ||
                  snappedPosition.hasHorizontalSnap ||
                  (snappedPosition.snapStrength && snappedPosition.snapStrength > 0.3);

                setShowMiddleGuides(Boolean(shouldShowGuides));
                setCurrentDragParent(parent);

                // Enhanced visual feedback for section center alignment
                if (snappedPosition.isSnappedToSectionCenter) {
                  // Provide stronger visual feedback when snapped to section center
                  setIsNearVerticalCenter(!!snappedPosition.verticalSnapPosition);
                  setIsNearHorizontalCenter(!!snappedPosition.horizontalSnapPosition);
                }

                // Legacy parent center snapping (keep for backward compatibility)
                if (pRect) {
                  const elementWidth = elementRect.width;
                  const elementHeight = elementRect.height;
                  const elementCenterX = newX + elementWidth / 2;
                  const elementCenterY = newY + elementHeight / 2;
                  const parentCenterX = pRect.width / 2;
                  const parentCenterY = pRect.height / 2;

                  // Check if near parent center for legacy behavior
                  const isNearVertical = Math.abs(elementCenterX - parentCenterX) < SHOW_GUIDE_THRESHOLD;
                  const isNearHorizontal = Math.abs(elementCenterY - parentCenterY) < SHOW_GUIDE_THRESHOLD;

                  setIsNearVerticalCenter(isNearVertical);
                  setIsNearHorizontalCenter(isNearHorizontal);

                  // Parent center snapping (lower priority than smart alignment)
                  if (Math.abs(elementCenterX - parentCenterX) < SNAP_THRESHOLD) {
                    newX = parentCenterX - elementWidth / 2;
                  }
                  if (Math.abs(elementCenterY - parentCenterY) < SNAP_THRESHOLD) {
                    newY = parentCenterY - elementHeight / 2;
                  }
                }
              }

              // Apply new position to DOM immediately for smooth visual feedback
              dom.style.top = `${newY}px`;
              dom.style.left = `${newX}px`;

              // Update props with history throttling to prevent excessive history entries
              actions.history.throttle(DRAG_HISTORY_THROTTLE).setProp(id, (props: any) => {
                props.top = `${newY}px`;
                props.left = `${newX}px`;
              });
            };

            const handlePointerUp = () => {
              // Clean up mobile gesture detection timeout if it exists
              if (dragStateRef.current.dragConfirmationTimeout) {
                clearTimeout(dragStateRef.current.dragConfirmationTimeout);
                dragStateRef.current.dragConfirmationTimeout = null;
              }

              // Remove both mouse and touch event listeners
              document.removeEventListener('mousemove', handlePointerMove);
              document.removeEventListener('mouseup', handlePointerUp);
              document.removeEventListener('touchmove', handlePointerMove);
              document.removeEventListener('touchend', handlePointerUp);

              // Reset visual feedback
              dom.style.opacity = '1';

              // Hide middle guides when dragging stops
              setShowMiddleGuides(false);
              setCurrentDragParent(null);

              // Clear smart alignment cache when dragging ends
              smartAlignment.clearCache();

              // Reset alignment states
              setIsNearVerticalCenter(false);
              setIsNearHorizontalCenter(false);

              // Create a final history entry to ensure the drag operation is properly recorded
              // This ensures that undo will return the element to its original position in one step
              const finalX = parseInt(dom.style.left || '0');
              const finalY = parseInt(dom.style.top || '0');

              // Only create final entry if position actually changed
              if (dragStateRef.current.startPosition &&
                (finalX !== dragStateRef.current.startPosition.x ||
                  finalY !== dragStateRef.current.startPosition.y)) {

                // Use merge to combine this with the last throttled entry
                actions.history.merge().setProp(id, (props: any) => {
                  props.top = `${finalY}px`;
                  props.left = `${finalX}px`;
                });

              }

              // Reset drag state for cross-section logic
              dragStateRef.current = {
                originalParent: null,
                originalParentRect: null,
                currentTargetSection: null,
                lastMouseY: 0,
                isDragging: false,
                startPosition: null,
                lastSectionSwitchTime: 0,
                skipNextDragCalculation: false,
                newStartPosX: 0,
                newStartPosY: 0,
                newStartMouseX: 0,
                newStartMouseY: 0,
                hasNewStartPosition: false,
                // Mobile gesture detection state
                touchStartTime: 0,
                touchStartX: 0,
                touchStartY: 0,
                hasMoved: false,
                isWaitingForDragConfirmation: false,
                dragConfirmationTimeout: null
              };

              // Clear smart alignment cache when dragging ends
              smartAlignment.clearCache();

              // End dragging state
              setIsDragging(false);
            };

            // Add both mouse and touch event listeners
            document.addEventListener('mousemove', handlePointerMove);
            document.addEventListener('mouseup', handlePointerUp);
            document.addEventListener('touchmove', handlePointerMove, { passive: false });
            document.addEventListener('touchend', handlePointerUp);
          };

          // Add both mouse and touch event listeners to the element
          dom.addEventListener('mousedown', handlePointerDown);
          dom.addEventListener('touchstart', handlePointerDown, { passive: false });

          // Return cleanup function
          return () => {
            dom.removeEventListener('mousedown', handlePointerDown);
            dom.removeEventListener('touchstart', handlePointerDown);
            delete dom.dataset.draggableSetup;
          };
        }
      }

      return undefined;
    };

    // Set up draggable behavior
    const cleanup = makeDraggable();

    return () => {
      if (cleanup) cleanup();
      // Remove keyboard event listener
      document.removeEventListener('keydown', handleKeyboardMovement);
    };
  }, [
    dom,
    isActive,
    isLocked,
    parentNode,
    parent,
    setIsDragging,
    setIsNearVerticalCenter,
    setIsNearHorizontalCenter,
    setShowMiddleGuides,
    setCurrentDragParent,
    setParentRect,
    actions,
    id,
    props,
    name,
    query,
    isSectionSwitchingDisabled,
    handleCrossSectionDrag,
    handleKeyboardMovement
  ]);
};