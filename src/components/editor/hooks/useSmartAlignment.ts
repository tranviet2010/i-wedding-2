import { useCallback, useRef } from 'react';

interface SnappingPoint {
  left: number;
  center: number;
  right: number;
  top: number;
  middle: number;
  bottom: number;
}

interface StaticElementData {
  nodeId: string;
  snappingPoints: SnappingPoint;
  rect: DOMRect;
  isSection?: boolean;
}

interface SmartAlignmentResult {
  x: number;
  y: number;
  hasVerticalSnap: boolean;
  hasHorizontalSnap: boolean;
  verticalSnapPosition?: number;
  horizontalSnapPosition?: number;
  isSnappedToSectionCenter?: boolean;
  snapStrength?: number; // 0-1, indicates how strong the snap is
}

interface UseSmartAlignmentProps {
  query: any;
  activeNodeId: string;
  snapThreshold?: number;
  autoSnapEnabled?: boolean; // Enable automatic magnetic snapping
  magneticStrength?: number; // 0-1, how strong the magnetic effect is
}

export const useSmartAlignment = ({
  query,
  activeNodeId,
  snapThreshold = 8,
  autoSnapEnabled = true,
  magneticStrength = 0.7
}: UseSmartAlignmentProps) => {
  const staticElementsCache = useRef<StaticElementData[]>([]);
  const PROXIMITY_THRESHOLD = 200; // Only consider elements within this distance for snapping
  const MAGNETIC_THRESHOLD = snapThreshold * 3; // Larger threshold for magnetic attraction (24px)
  const CENTER_HORIZONTAL_THRESHOLD = MAGNETIC_THRESHOLD * 1.5; // 36px - enhanced for center horizontal alignment
  const CENTER_VERTICAL_THRESHOLD = MAGNETIC_THRESHOLD * 2.5; // 60px - stronger magnetic attraction for center vertical alignment

  const calculateSnappingPoints = useCallback((rect: DOMRect): SnappingPoint => {
    return {
      left: rect.left,
      center: rect.left + rect.width / 2,
      right: rect.left + rect.width,
      top: rect.top,
      middle: rect.top + rect.height / 2,
      bottom: rect.top + rect.height
    };
  }, []);

  // Build cache of static elements for snapping
  const buildStaticElementsCache = useCallback(() => {
    if (!query) return [];

    try {
      const nodeTree = query.node('ROOT').toNodeTree();
      const allNodes = Object.values(nodeTree.nodes);
      const staticElements: StaticElementData[] = [];

      allNodes.forEach((node: any) => {
        // Skip the active element, ROOT, and certain elements, but INCLUDE Sections for center guides
        if (
          !node ||
          !node.id ||
          node.id === activeNodeId ||
          node.id === 'ROOT' ||
          node.data?.displayName === 'Content Wrapper' ||
          node.data?.props?.isChildOfButton ||
          node.data?.props?.isChildOfForm ||
          node.data?.props?.isChildOfGroup
        ) {
          return;
        }

        try {
          const craftNode = query.node(node.id).get();
          if (craftNode && craftNode.dom) {
            const rect = craftNode.dom.getBoundingClientRect();

            // Only include elements that are visible and have meaningful dimensions
            if (rect.width > 0 && rect.height > 0) {
              staticElements.push({
                nodeId: node.id,
                snappingPoints: calculateSnappingPoints(rect),
                rect: rect,
                isSection: node.data?.displayName === 'Sections'
              });
            }
          }
        } catch (error) {
          // Skip nodes that can't be accessed
        }
      });

      staticElementsCache.current = staticElements;
      return staticElements;
    } catch (error) {
      console.error('Error building static elements cache:', error);
      return [];
    }
  }, [query, activeNodeId, calculateSnappingPoints]);

  // Apply magnetic auto-snapping with smooth attraction to alignment guides
  const applyMagneticSnapping = useCallback((
    elementRect: DOMRect,
    newX: number,
    newY: number
  ): SmartAlignmentResult => {
    if (!autoSnapEnabled || !query || staticElementsCache.current.length === 0) {
      // Build cache if not available
      buildStaticElementsCache();
    }

    let snappedX = newX;
    let snappedY = newY;
    let minVerticalDistance = MAGNETIC_THRESHOLD + 1;
    let minHorizontalDistance = MAGNETIC_THRESHOLD + 1;
    let verticalSnapPosition: number | undefined;
    let horizontalSnapPosition: number | undefined;
    let isSnappedToSectionCenter = false;
    let snapStrength = 0;

    // Calculate active element's snapping points based on new position
    const activeLeft = newX;
    const activeCenter = newX + elementRect.width / 2;
    const activeRight = newX + elementRect.width;
    const activeTop = newY;
    const activeMiddle = newY + elementRect.height / 2;
    const activeBottom = newY + elementRect.height;

    // Debug: Log the active element's calculated positions

    staticElementsCache.current.forEach(staticElement => {
      const { snappingPoints: staticPoints, rect: staticRect, isSection } = staticElement;

      // Calculate distance between element centers to prioritize nearby elements
      const activeCenterX = newX + elementRect.width / 2;
      const activeCenterY = newY + elementRect.height / 2;
      const staticCenterX = staticRect.left + staticRect.width / 2;
      const staticCenterY = staticRect.top + staticRect.height / 2;
      const elementDistance = Math.sqrt(
        Math.pow(activeCenterX - staticCenterX, 2) + Math.pow(activeCenterY - staticCenterY, 2)
      );

      // For sections, use a larger proximity threshold
      const proximityThreshold = isSection ? PROXIMITY_THRESHOLD * 2 : PROXIMITY_THRESHOLD;
      if (elementDistance > proximityThreshold) {
        return;
      }


      if (isSection) {
        // Special handling for sections - prioritize center/middle lines with magnetic attraction
        const sectionVerticalChecks = [
          { active: activeCenter, static: staticPoints.center, offset: -elementRect.width / 2, priority: 0 }, // Element center to section center
          { active: activeLeft, static: staticPoints.left, offset: 0, priority: 2 }, // Element left to section left
          { active: activeRight, static: staticPoints.right, offset: -elementRect.width, priority: 2 }, // Element right to section right
          { active: activeLeft, static: staticPoints.right, offset: 0, priority: 3 }, // Element left to section right
          { active: activeRight, static: staticPoints.left, offset: -elementRect.width, priority: 3 } // Element right to section left
        ];

        const sectionHorizontalChecks = [
          { active: activeMiddle, static: staticPoints.middle, offset: -elementRect.height / 2, priority: 0 }, // Element middle to section middle
          { active: activeTop, static: staticPoints.top, offset: 0, priority: 2 }, // Element top to section top
          { active: activeBottom, static: staticPoints.bottom, offset: -elementRect.height, priority: 2 }, // Element bottom to section bottom
          { active: activeTop, static: staticPoints.bottom, offset: 0, priority: 3 }, // Element top to section bottom
          { active: activeBottom, static: staticPoints.top, offset: -elementRect.height, priority: 3 } // Element bottom to section top
        ];

        sectionVerticalChecks.forEach((check, index) => {
          const snapDistance = Math.abs(check.active - check.static);
          if (snapDistance <= MAGNETIC_THRESHOLD) {
            // Apply magnetic attraction - stronger pull as element gets closer
            const attractionStrength = 1 - (snapDistance / MAGNETIC_THRESHOLD);

            const adjustedDistance = snapDistance + check.priority;
            if (adjustedDistance < minVerticalDistance) {
              minVerticalDistance = adjustedDistance;

              // Apply magnetic snapping with smooth transition
              if (snapDistance <= snapThreshold) {
                // Full snap when within snap threshold
                snappedX = check.static + check.offset;
              } else {
                // Magnetic attraction when within magnetic threshold
                const targetX = check.static + check.offset;
                const pullDistance = (targetX - newX) * magneticStrength * attractionStrength;
                snappedX = newX + pullDistance;
              }

              verticalSnapPosition = check.static;
              isSnappedToSectionCenter = (index === 0); // Only true for center alignment
              snapStrength = Math.max(snapStrength, attractionStrength);
            }
          }
        });

        sectionHorizontalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          if (snapDistance <= MAGNETIC_THRESHOLD) {
            // Apply magnetic attraction - stronger pull as element gets closer
            const attractionStrength = 1 - (snapDistance / MAGNETIC_THRESHOLD);

            const adjustedDistance = snapDistance + check.priority;
            if (adjustedDistance < minHorizontalDistance) {
              minHorizontalDistance = adjustedDistance;

              // Apply magnetic snapping with smooth transition
              if (snapDistance <= snapThreshold) {
                // Full snap when within snap threshold
                snappedY = check.static + check.offset;
              } else {
                // Magnetic attraction when within magnetic threshold
                const targetY = check.static + check.offset;
                const pullDistance = (targetY - newY) * magneticStrength * attractionStrength;
                snappedY = newY + pullDistance;
              }

              horizontalSnapPosition = check.static;
              isSnappedToSectionCenter = true;
              snapStrength = Math.max(snapStrength, attractionStrength);
            }
          }
        });
      } else {
        // Regular element alignment checks with magnetic attraction
        const verticalChecks = [
          { active: activeCenter, static: staticPoints.center, offset: -elementRect.width / 2, priority: 1 },
          { active: activeLeft, static: staticPoints.left, offset: 0, priority: 2 },
          { active: activeRight, static: staticPoints.right, offset: -elementRect.width, priority: 2 },
          { active: activeLeft, static: staticPoints.right, offset: 0, priority: 3 },
          { active: activeRight, static: staticPoints.left, offset: -elementRect.width, priority: 3 }
        ];

        verticalChecks.forEach((check, index) => {
          const snapDistance = Math.abs(check.active - check.static);
          // Enhanced threshold for center horizontal alignment (index 0)
          const threshold = index === 0 ? CENTER_HORIZONTAL_THRESHOLD : MAGNETIC_THRESHOLD;

          if (snapDistance <= threshold) {
            // Apply magnetic attraction
            const attractionStrength = 1 - (snapDistance / threshold);

            const adjustedDistance = snapDistance + (elementDistance * 0.1) + (check.priority * 2);
            if (adjustedDistance < minVerticalDistance) {
              minVerticalDistance = adjustedDistance;

              // Debug logging for center alignment
              if (index === 0) {
                console.log(`🎯 Magnetic Center Horizontal Snapping:`, {
                  snapDistance: snapDistance.toFixed(1),
                  threshold: threshold.toFixed(1),
                  attractionStrength: attractionStrength.toFixed(2),
                  adjustedDistance: adjustedDistance.toFixed(1),
                  activeCenter: check.active.toFixed(1),
                  staticCenter: check.static.toFixed(1)
                });
              }

              // Apply magnetic snapping with smooth transition
              if (snapDistance <= snapThreshold) {
                // Full snap when within snap threshold
                snappedX = check.static + check.offset;
              } else {
                // Enhanced magnetic attraction for center horizontal alignment
                const targetX = check.static + check.offset;
                // Boost magnetic strength for center horizontal alignment (index 0)
                const enhancedMagneticStrength = index === 0 ? Math.min(1.0, magneticStrength * 1.2) : magneticStrength;
                const pullDistance = (targetX - newX) * enhancedMagneticStrength * attractionStrength;
                snappedX = newX + pullDistance;
              }

              verticalSnapPosition = check.static;
              snapStrength = Math.max(snapStrength, attractionStrength);
            }
          }
        });

        // Check horizontal alignments with magnetic attraction
        const horizontalChecks = [
          { active: activeMiddle, static: staticPoints.middle, offset: -elementRect.height / 2, priority: 1 },
          { active: activeTop, static: staticPoints.top, offset: 0, priority: 2 },
          { active: activeBottom, static: staticPoints.bottom, offset: -elementRect.height, priority: 2 },
          { active: activeTop, static: staticPoints.bottom, offset: 0, priority: 3 },
          { active: activeBottom, static: staticPoints.top, offset: -elementRect.height, priority: 3 }
        ];

        horizontalChecks.forEach((check, index) => {
          const snapDistance = Math.abs(check.active - check.static);
          // Enhanced threshold for center vertical alignment (index 0) - 2.5x stronger!
          const threshold = index === 0 ? CENTER_VERTICAL_THRESHOLD : MAGNETIC_THRESHOLD;

          if (snapDistance <= threshold) {
            // Apply magnetic attraction
            const attractionStrength = 1 - (snapDistance / threshold);

            const adjustedDistance = snapDistance + (elementDistance * 0.1) + (check.priority * 2);
            if (adjustedDistance < minHorizontalDistance) {
              minHorizontalDistance = adjustedDistance;

              // Enhanced debug logging for center vertical alignment
              if (index === 0) {
                console.log(`🎯 Enhanced Magnetic Center Vertical Snapping (2.5x threshold):`, {
                  snapDistance: snapDistance.toFixed(1),
                  threshold: threshold.toFixed(1),
                  enhancedThreshold: `${CENTER_VERTICAL_THRESHOLD}px (2.5x magnetic)`,
                  attractionStrength: attractionStrength.toFixed(2),
                  adjustedDistance: adjustedDistance.toFixed(1),
                  activeMiddle: check.active.toFixed(1),
                  staticMiddle: check.static.toFixed(1),
                  magneticStrength: magneticStrength
                });
              }

              // Apply magnetic snapping with smooth transition
              if (snapDistance <= snapThreshold) {
                // Full snap when within snap threshold
                snappedY = check.static + check.offset;
              } else {
                // Enhanced magnetic attraction for center vertical alignment
                const targetY = check.static + check.offset;
                // Boost magnetic strength for center vertical alignment (index 0)
                const enhancedMagneticStrength = index === 0 ? Math.min(1.0, magneticStrength * 1.3) : magneticStrength;
                const pullDistance = (targetY - newY) * enhancedMagneticStrength * attractionStrength;
                snappedY = newY + pullDistance;
              }

              horizontalSnapPosition = check.static;
              snapStrength = Math.max(snapStrength, attractionStrength);
            }
          }
        });
      }
    });

    // Optional: Debug logging for magnetic snapping
    if (snapStrength > 0) {
    }

    return {
      x: snappedX,
      y: snappedY,
      hasVerticalSnap: minVerticalDistance <= MAGNETIC_THRESHOLD,
      hasHorizontalSnap: minHorizontalDistance <= MAGNETIC_THRESHOLD,
      verticalSnapPosition,
      horizontalSnapPosition,
      isSnappedToSectionCenter,
      snapStrength
    };
  }, [query, snapThreshold, buildStaticElementsCache, autoSnapEnabled, magneticStrength, MAGNETIC_THRESHOLD]);

  // Apply smart alignment snapping to a position
  const applySmartAlignment = useCallback((
    elementRect: DOMRect,
    newX: number,
    newY: number
  ): SmartAlignmentResult => {
    // Use magnetic snapping if enabled for smoother experience
    if (autoSnapEnabled) {
      return applyMagneticSnapping(elementRect, newX, newY);
    }

    if (!query || staticElementsCache.current.length === 0) {
      // Build cache if not available
      buildStaticElementsCache();
    }

    let snappedX = newX;
    let snappedY = newY;
    let minVerticalDistance = snapThreshold + 1;
    let minHorizontalDistance = snapThreshold + 1;
    let verticalSnapPosition: number | undefined;
    let horizontalSnapPosition: number | undefined;

    // Calculate active element's snapping points based on new position
    const activeLeft = newX;
    const activeCenter = newX + elementRect.width / 2;
    const activeRight = newX + elementRect.width;
    const activeTop = newY;
    const activeMiddle = newY + elementRect.height / 2;
    const activeBottom = newY + elementRect.height;

    staticElementsCache.current.forEach(staticElement => {
      const { snappingPoints: staticPoints, rect: staticRect, isSection } = staticElement;

      // Calculate distance between element centers to prioritize nearby elements
      const activeCenterX = newX + elementRect.width / 2;
      const activeCenterY = newY + elementRect.height / 2;
      const staticCenterX = staticRect.left + staticRect.width / 2;
      const staticCenterY = staticRect.top + staticRect.height / 2;
      const elementDistance = Math.sqrt(
        Math.pow(activeCenterX - staticCenterX, 2) + Math.pow(activeCenterY - staticCenterY, 2)
      );

      // For sections, use a larger proximity threshold
      const proximityThreshold = isSection ? PROXIMITY_THRESHOLD * 2 : PROXIMITY_THRESHOLD;
      if (elementDistance > proximityThreshold) return;

      if (isSection) {
        // Special handling for sections - prioritize center/middle lines heavily
        const sectionVerticalChecks = [
          { active: activeCenter, static: staticPoints.center, offset: -elementRect.width / 2, priority: 0 }, // Highest priority
          { active: activeLeft, static: staticPoints.center, offset: 0, priority: 0 },
          { active: activeRight, static: staticPoints.center, offset: -elementRect.width, priority: 0 }
        ];

        const sectionHorizontalChecks = [
          { active: activeMiddle, static: staticPoints.middle, offset: -elementRect.height / 2, priority: 0 }, // Highest priority
          { active: activeTop, static: staticPoints.middle, offset: 0, priority: 0 },
          { active: activeBottom, static: staticPoints.middle, offset: -elementRect.height, priority: 0 }
        ];

        sectionVerticalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          const adjustedDistance = snapDistance + check.priority; // Section center lines get priority 0
          if (snapDistance <= snapThreshold * 2 && adjustedDistance < minVerticalDistance) { // Larger threshold for sections
            minVerticalDistance = adjustedDistance;
            snappedX = check.static + check.offset;
            verticalSnapPosition = check.static;
          }
        });

        sectionHorizontalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          const adjustedDistance = snapDistance + check.priority; // Section center lines get priority 0
          if (snapDistance <= snapThreshold * 2 && adjustedDistance < minHorizontalDistance) { // Larger threshold for sections
            minHorizontalDistance = adjustedDistance;
            snappedY = check.static + check.offset;
            horizontalSnapPosition = check.static;
          }
        });
      } else {
        // Regular element alignment checks
        const verticalChecks = [
          { active: activeCenter, static: staticPoints.center, offset: -elementRect.width / 2, priority: 1 },
          { active: activeLeft, static: staticPoints.left, offset: 0, priority: 2 },
          { active: activeRight, static: staticPoints.right, offset: -elementRect.width, priority: 2 },
          { active: activeLeft, static: staticPoints.right, offset: 0, priority: 3 },
          { active: activeRight, static: staticPoints.left, offset: -elementRect.width, priority: 3 }
        ];

        verticalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          const adjustedDistance = snapDistance + (elementDistance * 0.1) + (check.priority * 2);
          if (snapDistance <= snapThreshold && adjustedDistance < minVerticalDistance) {
            minVerticalDistance = adjustedDistance;
            snappedX = check.static + check.offset;
            verticalSnapPosition = check.static;
          }
        });

        // Check horizontal alignments (prioritize middle alignment)
        const horizontalChecks = [
          { active: activeMiddle, static: staticPoints.middle, offset: -elementRect.height / 2, priority: 1 },
          { active: activeTop, static: staticPoints.top, offset: 0, priority: 2 },
          { active: activeBottom, static: staticPoints.bottom, offset: -elementRect.height, priority: 2 },
          { active: activeTop, static: staticPoints.bottom, offset: 0, priority: 3 },
          { active: activeBottom, static: staticPoints.top, offset: -elementRect.height, priority: 3 }
        ];

        horizontalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          const adjustedDistance = snapDistance + (elementDistance * 0.1) + (check.priority * 2);
          if (snapDistance <= snapThreshold && adjustedDistance < minHorizontalDistance) {
            minHorizontalDistance = adjustedDistance;
            snappedY = check.static + check.offset;
            horizontalSnapPosition = check.static;
          }
        });
      }
    });

    return {
      x: snappedX,
      y: snappedY,
      hasVerticalSnap: minVerticalDistance <= snapThreshold,
      hasHorizontalSnap: minHorizontalDistance <= snapThreshold,
      verticalSnapPosition,
      horizontalSnapPosition,
      isSnappedToSectionCenter: false,
      snapStrength: minVerticalDistance <= snapThreshold || minHorizontalDistance <= snapThreshold ? 1 : 0
    };
  }, [query, snapThreshold, buildStaticElementsCache]);

  // Clear the cache (call when drag starts)
  const clearCache = useCallback(() => {
    staticElementsCache.current = [];
  }, []);

  // Initialize cache (call when drag starts)
  const initializeCache = useCallback(() => {
    buildStaticElementsCache();
  }, [buildStaticElementsCache]);

  // Apply smart alignment for resize operations
  const applySmartAlignmentForResize = useCallback((
    elementRect: DOMRect,
    newWidth: number,
    newHeight: number,
    newX?: number,
    newY?: number
  ): { width: number; height: number; x?: number; y?: number } => {
    if (!query || staticElementsCache.current.length === 0) {
      buildStaticElementsCache();
    }

    const currentX = newX ?? elementRect.left;
    const currentY = newY ?? elementRect.top;

    // Create a virtual rect with the new dimensions
    const virtualRect = new DOMRect(currentX, currentY, newWidth, newHeight);

    // Apply alignment to the new dimensions and position
    const alignmentResult = applySmartAlignment(virtualRect, currentX, currentY);

    return {
      width: newWidth,
      height: newHeight,
      x: alignmentResult.x,
      y: alignmentResult.y
    };
  }, [query, applySmartAlignment, buildStaticElementsCache]);

  return {
    applySmartAlignment,
    applyMagneticSnapping,
    applySmartAlignmentForResize,
    clearCache,
    initializeCache,
    staticElementsCache: staticElementsCache.current
  };
};
