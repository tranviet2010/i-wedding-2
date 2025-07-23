import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {
  AlignmentType,
  AlignmentPriority,
  getAlignmentTypeAndPriority,
  calculateSnapStrength
} from '../utils/alignmentPriority';
import { zIndex } from '@/utils/zIndex';

interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  id: string;
  targetNodeId: string;
  alignmentType: AlignmentType;
  priority: AlignmentPriority;
  distance: number;
  elementCount: number; // Number of elements that would align to this guide
  snapStrength: number; // 0-1, how strong the magnetic attraction is
}

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

interface SmartAlignmentGuidesProps {
  className?: string;
  activeNodeId: string;
  isDragging: boolean;
  query: any;
  isSection?: boolean;
}

// Enhanced thresholds for priority-based system - MUST match useSmartAlignment thresholds
const SNAP_THRESHOLD = 8; // Base snap threshold (matches useSmartAlignment default)
const MAGNETIC_THRESHOLD = SNAP_THRESHOLD * 3; // 24px - matches useSmartAlignment magnetic threshold
const CENTER_HORIZONTAL_THRESHOLD = MAGNETIC_THRESHOLD * 1.5; // 36px - enhanced for center horizontal alignment
const CENTER_VERTICAL_THRESHOLD = MAGNETIC_THRESHOLD * 2.5; // 60px - stronger magnetic attraction for center vertical alignment
const SECTION_CENTER_THRESHOLD = MAGNETIC_THRESHOLD * 1.5; // 36px - larger threshold for section center alignment
const GUIDE_VISIBILITY_THRESHOLD = 200; // Only show guides for elements within this distance (matches PROXIMITY_THRESHOLD)
const GUIDE_COLOR = '#ff6b6b'; // Bright red for visibility
const PRIORITY_GUIDE_COLOR = '#00ff88'; // Green for highest priority guides

const GuideContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: ${zIndex.smartAlignment};
`;

const VerticalGuide = styled.div<{ x: number; isPriority?: boolean; snapStrength?: number; alignmentType?: AlignmentType }>`
  position: absolute;
  left: ${props => props.x}px;
  top: 0;
  bottom: 0;
  width: ${props => props.isPriority ? '2px' : '1px'};
  background: linear-gradient(to bottom,
    ${props => props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 0%,
    ${props => props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 100%);
  box-shadow: 0 0 ${props => props.isPriority ? '8px' : '4px'}
    ${props => props.isPriority ? 'rgba(0, 255, 136, 0.9)' : 'rgba(255, 107, 107, 0.8)'};
  z-index: ${zIndex.smartAlignment};
  opacity: ${props => Math.max(0.8, Math.min(1.0, 0.8 + (props.snapStrength || 0) * 0.2))};
  transition: all 0.15s ease-out;

  /* Enhanced visual feedback for different alignment types */
  ${props => props.alignmentType === AlignmentType.CENTER_HORIZONTAL && `
    background: linear-gradient(to bottom,
      ${props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 0%,
      transparent 45%,
      ${props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 50%,
      transparent 55%,
      ${props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 100%);
  `}
`;

const HorizontalGuide = styled.div<{ y: number; isPriority?: boolean; snapStrength?: number; alignmentType?: AlignmentType }>`
  position: absolute;
  top: ${props => props.y}px;
  left: 0;
  right: 0;
  height: ${props => {
    if (props.alignmentType === AlignmentType.CENTER_VERTICAL) return '3px'; // Extra thick for center vertical
    return props.isPriority ? '2px' : '1px';
  }};
  background: linear-gradient(to right,
    ${props => props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 0%,
    ${props => props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 100%);
  box-shadow: 0 0 ${props => {
    if (props.alignmentType === AlignmentType.CENTER_VERTICAL) return '12px'; // Extra glow for center vertical
    return props.isPriority ? '8px' : '4px';
  }}
    ${props => props.isPriority ? 'rgba(0, 255, 136, 0.9)' : 'rgba(255, 107, 107, 0.8)'};
  z-index: ${zIndex.smartAlignment};
  opacity: ${props => {
    const baseOpacity = Math.max(0.8, Math.min(1.0, 0.8 + (props.snapStrength || 0) * 0.2));
    // Enhanced opacity for center vertical alignment
    return props.alignmentType === AlignmentType.CENTER_VERTICAL ? Math.min(1.0, baseOpacity + 0.1) : baseOpacity;
  }};
  transition: all 0.15s ease-out;

  /* Enhanced visual feedback for center vertical alignment */
  ${props => props.alignmentType === AlignmentType.CENTER_VERTICAL && `
    background: linear-gradient(to right,
      ${props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 0%,
      transparent 40%,
      ${props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 50%,
      transparent 60%,
      ${props.isPriority ? PRIORITY_GUIDE_COLOR : GUIDE_COLOR} 100%);
    animation: centerVerticalPulse 1.5s ease-in-out infinite;
  `}

  @keyframes centerVerticalPulse {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.2); }
  }
`;

export const SmartAlignmentGuides: React.FC<SmartAlignmentGuidesProps> = ({
  className,
  activeNodeId,
  isDragging,
  query,
  isSection = false
}) => {
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const staticElementsCache = useRef<StaticElementData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // SSR safety check - don't render on server
  if (typeof window === 'undefined') {
    return null;
  }

  // Optional: Debug logging
  // console.log(`🎯 SmartAlignmentGuides rendered: activeNodeId=${activeNodeId}, isDragging=${isDragging}, guides=${guides.length}`);

  // Helper function to calculate snapping points for an element
  const calculateSnappingPoints = (rect: DOMRect): SnappingPoint => {
    return {
      left: rect.left,
      center: rect.left + rect.width / 2,
      right: rect.left + rect.width,
      top: rect.top,
      middle: rect.top + rect.height / 2,
      bottom: rect.top + rect.height
    };
  };

  // Helper function to get all static elements (excluding the active element)
  const buildStaticElementsCache = () => {
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

      return staticElements;
    } catch (error) {
      console.error('Error building static elements cache:', error);
      return [];
    }
  };





  // Function to find alignment guides for the active element (enhanced priority-based system)
  const findAlignmentGuides = (activeRect: DOMRect): AlignmentGuide[] => {
    const activeSnappingPoints = calculateSnappingPoints(activeRect);
    const candidateGuides: AlignmentGuide[] = [];

    staticElementsCache.current.forEach(staticElement => {
      const { snappingPoints: staticPoints, nodeId: targetNodeId, rect: staticRect, isSection } = staticElement;

      // Calculate distance between element centers to prioritize nearby elements
      const activeCenterX = activeRect.left + activeRect.width / 2;
      const activeCenterY = activeRect.top + activeRect.height / 2;
      const staticCenterX = staticRect.left + staticRect.width / 2;
      const staticCenterY = staticRect.top + staticRect.height / 2;
      const elementDistance = Math.sqrt(
        Math.pow(activeCenterX - staticCenterX, 2) + Math.pow(activeCenterY - staticCenterY, 2)
      );

      // Enhanced visibility threshold based on element type
      const visibilityThreshold = isSection ? GUIDE_VISIBILITY_THRESHOLD * 6 : GUIDE_VISIBILITY_THRESHOLD * 3;
      if (elementDistance > visibilityThreshold) return;

      // Enhanced section alignment handling with priority system
      if (isSection) {
        // Section center alignments get highest priority and larger thresholds
        const sectionVerticalChecks = [
          { active: activeSnappingPoints.center, static: staticPoints.center, type: 'section-center' },
          { active: activeSnappingPoints.left, static: staticPoints.center, type: 'left-section-center' },
          { active: activeSnappingPoints.right, static: staticPoints.center, type: 'right-section-center' }
        ];

        const sectionHorizontalChecks = [
          { active: activeSnappingPoints.middle, static: staticPoints.middle, type: 'section-middle' },
          { active: activeSnappingPoints.top, static: staticPoints.middle, type: 'top-section-middle' },
          { active: activeSnappingPoints.bottom, static: staticPoints.middle, type: 'bottom-section-middle' }
        ];

        sectionVerticalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          if (snapDistance <= SECTION_CENTER_THRESHOLD) {
            const { alignmentType, priority } = getAlignmentTypeAndPriority(
              check.type, true
            );
            const snapStrength = calculateSnapStrength(snapDistance, SECTION_CENTER_THRESHOLD);

            candidateGuides.push({
              type: 'vertical',
              position: check.static,
              id: `vertical-${targetNodeId}-${check.type}`,
              targetNodeId,
              alignmentType,
              priority,
              distance: snapDistance,
              elementCount: 1, // Will be calculated later
              snapStrength
            });
          }
        });

        sectionHorizontalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          if (snapDistance <= SECTION_CENTER_THRESHOLD) {
            const { alignmentType, priority } = getAlignmentTypeAndPriority(
              check.type, true
            );
            const snapStrength = calculateSnapStrength(snapDistance, SECTION_CENTER_THRESHOLD);

            candidateGuides.push({
              type: 'horizontal',
              position: check.static,
              id: `horizontal-${targetNodeId}-${check.type}`,
              targetNodeId,
              alignmentType,
              priority,
              distance: snapDistance,
              elementCount: 1, // Will be calculated later
              snapStrength
            });
          }
        });
      } else {
        // Enhanced regular element alignment checks with 6-point system
        // Center alignment gets priority by being checked first and with enhanced threshold
        const verticalChecks = [
          { active: activeSnappingPoints.center, static: staticPoints.center, type: 'center-center', enhanced: true },
          { active: activeSnappingPoints.left, static: staticPoints.left, type: 'left' },
          { active: activeSnappingPoints.right, static: staticPoints.right, type: 'right' },
          { active: activeSnappingPoints.left, static: staticPoints.right, type: 'left-right' },
          { active: activeSnappingPoints.right, static: staticPoints.left, type: 'right-left' }
        ];

        verticalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          // Enhanced threshold for center alignments with specific thresholds
          let threshold = MAGNETIC_THRESHOLD;
          if (check.enhanced) {
            threshold = check.type === 'center-center' ? CENTER_HORIZONTAL_THRESHOLD : CENTER_HORIZONTAL_THRESHOLD;
          }

          if (snapDistance <= threshold) {
            const { alignmentType, priority } = getAlignmentTypeAndPriority(
              check.type, false
            );
            const snapStrength = calculateSnapStrength(snapDistance, threshold);

            // Debug logging for center alignment
            if (check.type === 'center-center') {
              console.log(`🎯 Center Horizontal Alignment Debug:`, {
                snapDistance: snapDistance.toFixed(1),
                threshold: threshold.toFixed(1),
                activeCenter: check.active.toFixed(1),
                staticCenter: check.static.toFixed(1),
                snapStrength: snapStrength.toFixed(2),
                priority,
                alignmentType
              });
            }

            candidateGuides.push({
              type: 'vertical',
              position: check.static,
              id: `vertical-${targetNodeId}-${check.type}`,
              targetNodeId,
              alignmentType,
              priority,
              distance: snapDistance,
              elementCount: 1, // Will be calculated later
              snapStrength
            });
          }
        });

        // Enhanced horizontal alignments (top, middle, bottom)
        // Center vertical alignment gets priority by being checked first and with enhanced threshold
        const horizontalChecks = [
          { active: activeSnappingPoints.middle, static: staticPoints.middle, type: 'middle-middle', enhanced: true },
          { active: activeSnappingPoints.top, static: staticPoints.top, type: 'top' },
          { active: activeSnappingPoints.bottom, static: staticPoints.bottom, type: 'bottom' },
          { active: activeSnappingPoints.top, static: staticPoints.bottom, type: 'top-bottom' },
          { active: activeSnappingPoints.bottom, static: staticPoints.top, type: 'bottom-top' }
        ];

        horizontalChecks.forEach(check => {
          const snapDistance = Math.abs(check.active - check.static);
          // Enhanced threshold for center alignments with stronger vertical center attraction
          let threshold = MAGNETIC_THRESHOLD;
          if (check.enhanced) {
            threshold = check.type === 'middle-middle' ? CENTER_VERTICAL_THRESHOLD : CENTER_HORIZONTAL_THRESHOLD;
          }

          if (snapDistance <= threshold) {
            const { alignmentType, priority } = getAlignmentTypeAndPriority(
              check.type, false
            );
            const snapStrength = calculateSnapStrength(snapDistance, threshold);

            // Enhanced debug logging for center vertical alignment
            if (check.type === 'middle-middle') {
              console.log(`🎯 Enhanced Center Vertical Alignment Debug:`, {
                snapDistance: snapDistance.toFixed(1),
                threshold: threshold.toFixed(1),
                enhancedThreshold: `${CENTER_VERTICAL_THRESHOLD}px (2.5x magnetic)`,
                activeMiddle: check.active.toFixed(1),
                staticMiddle: check.static.toFixed(1),
                snapStrength: snapStrength.toFixed(2),
                priority,
                alignmentType
              });
            }

            candidateGuides.push({
              type: 'horizontal',
              position: check.static,
              id: `horizontal-${targetNodeId}-${check.type}`,
              targetNodeId,
              alignmentType,
              priority,
              distance: snapDistance,
              elementCount: 1, // Will be calculated later
              snapStrength
            });
          }
        });
      }
    });

    // Calculate element count for each guide position (guides that would align multiple elements)
    const positionCounts = new Map<string, number>();
    candidateGuides.forEach(guide => {
      const key = `${guide.type}-${Math.round(guide.position)}`;
      positionCounts.set(key, (positionCounts.get(key) || 0) + 1);
    });

    // Update element count for each guide
    candidateGuides.forEach(guide => {
      const key = `${guide.type}-${Math.round(guide.position)}`;
      guide.elementCount = positionCounts.get(key) || 1;
    });

    // Enhanced priority-based sorting with special handling for center alignments
    const sortedGuides = candidateGuides.sort((a, b) => {
      // Special boost for center alignments
      const aCenterBoost = (a.alignmentType === AlignmentType.CENTER_HORIZONTAL ||
                           a.alignmentType === AlignmentType.CENTER_VERTICAL) ? -0.5 : 0;
      const bCenterBoost = (b.alignmentType === AlignmentType.CENTER_HORIZONTAL ||
                           b.alignmentType === AlignmentType.CENTER_VERTICAL) ? -0.5 : 0;

      const aEffectivePriority = a.priority + aCenterBoost;
      const bEffectivePriority = b.priority + bCenterBoost;

      // First, sort by effective priority (lower number = higher priority)
      if (aEffectivePriority !== bEffectivePriority) {
        return aEffectivePriority - bEffectivePriority;
      }

      // Then by snap strength (stronger = higher priority)
      if (Math.abs(a.snapStrength - b.snapStrength) > 0.1) {
        return b.snapStrength - a.snapStrength;
      }

      // Then by element count (more elements aligning = higher priority)
      if (a.elementCount !== b.elementCount) {
        return b.elementCount - a.elementCount;
      }

      // Finally by distance (closer = higher priority)
      return a.distance - b.distance;
    });

    // Apply the "one guide per element" preference with enhanced selection
    const selectedGuides: AlignmentGuide[] = [];
    const usedPositions = new Set<string>();

    // First pass: Select highest priority guides
    for (const guide of sortedGuides) {
      const positionKey = `${guide.type}-${Math.round(guide.position)}`;

      // Skip if we already have a guide at this position
      if (usedPositions.has(positionKey)) continue;

      // Limit to one vertical and one horizontal guide for clean UX
      const existingVertical = selectedGuides.find(g => g.type === 'vertical');
      const existingHorizontal = selectedGuides.find(g => g.type === 'horizontal');

      if (guide.type === 'vertical' && !existingVertical) {
        selectedGuides.push(guide);
        usedPositions.add(positionKey);
      } else if (guide.type === 'horizontal' && !existingHorizontal) {
        selectedGuides.push(guide);
        usedPositions.add(positionKey);
      }

      // Stop when we have both vertical and horizontal guides
      if (selectedGuides.length >= 2) break;
    }

    return selectedGuides;
  };

  // Effect to handle drag events and update guides
  useEffect(() => {
    if (!isDragging || !query) {
      setGuides([]);
      return;
    }

    // Build cache when dragging starts
    staticElementsCache.current = buildStaticElementsCache();

    const handleDragMove = () => {
      try {
        const activeNode = query.node(activeNodeId).get();
        if (!activeNode || !activeNode.dom) return;

        const activeRect = activeNode.dom.getBoundingClientRect();
        const newGuides = findAlignmentGuides(activeRect);
        setGuides(newGuides);

        // Enhanced debug logging for priority-based system
        if (newGuides.length > 0) {
          console.log(`🎯 Priority-Based Alignment: Selected ${newGuides.length} guides`,
            newGuides.map(g => ({
              type: g.type,
              alignmentType: g.alignmentType,
              priority: g.priority,
              distance: g.distance.toFixed(1),
              snapStrength: g.snapStrength.toFixed(2),
              elementCount: g.elementCount,
              position: g.position.toFixed(1)
            }))
          );

          // Log center alignment specifically
          const centerGuides = newGuides.filter(g =>
            g.alignmentType === AlignmentType.CENTER_HORIZONTAL ||
            g.alignmentType === AlignmentType.CENTER_VERTICAL
          );
          if (centerGuides.length > 0) {
            console.log(`🎯 Center Alignments Active:`, centerGuides.map(g => g.alignmentType));
          }
        }
      } catch (error) {
        console.warn('Smart Alignment error:', error);
      }
    };

    // Set up a throttled update mechanism
    let animationFrameId: number;
    const throttledUpdate = () => {
      handleDragMove();
      if (isDragging) {
        animationFrameId = requestAnimationFrame(throttledUpdate);
      }
    };

    // Start the update loop
    throttledUpdate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDragging, activeNodeId, query]);

  // Clear guides when not dragging
  useEffect(() => {
    if (!isDragging) {
      setGuides([]);
      staticElementsCache.current = [];
    }
  }, [isDragging]);

  if (!isDragging || guides.length === 0) {
    return null;
  }

  const guidesContent = (
    <GuideContainer ref={containerRef} className={className}>
      {guides.map(guide => {
        const isPriority = guide.priority === AlignmentPriority.HIGHEST ||
                          guide.priority === AlignmentPriority.HIGH;
        // Enhanced priority for center vertical alignment
        const isEnhancedCenterVertical = guide.alignmentType === AlignmentType.CENTER_VERTICAL;

        if (guide.type === 'vertical') {
          return (
            <VerticalGuide
              key={guide.id}
              x={guide.position}
              isPriority={isPriority}
              snapStrength={guide.snapStrength}
              alignmentType={guide.alignmentType}
            />
          );
        } else {
          return (
            <HorizontalGuide
              key={guide.id}
              y={guide.position}
              isPriority={isPriority || isEnhancedCenterVertical}
              snapStrength={guide.snapStrength}
              alignmentType={guide.alignmentType}
            />
          );
        }
      })}
    </GuideContainer>
  );

  // Render guides as a portal to document body for full viewport coverage
  return ReactDOM.createPortal(guidesContent, document.body);
};
