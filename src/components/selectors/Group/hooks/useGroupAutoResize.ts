import { useCallback, useRef, useEffect } from 'react';
import { useEditor } from '@craftjs/core';

interface ChildBounds {
  width: number;
  height: number;
  minLeft: number;
  minTop: number;
}

interface UseGroupInitialSizingProps {
  id: string;
  width: string;
  height: string;
  left: string;
  top: string;
  setProp: (callback: (props: any) => void) => void;
}

export const useGroupInitialSizing = ({
  id,
  width,
  height,
  left,
  top,
  setProp,
}: UseGroupInitialSizingProps) => {
  const { query } = useEditor();
  const hasInitialSized = useRef(false);
  const isCurrentlySizing = useRef(false);

  // Helper function to parse numeric value from dimension string
  const parseNumericValue = useCallback((value: string): number => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    }
    return typeof value === 'number' ? value : 0;
  }, []);

  // Calculate the bounding box of all child elements (for initial sizing only)
  const calculateInitialBounds = useCallback((): ChildBounds => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    if (childNodeIds.length === 0) {
      return {
        width: 200,
        height: 100,
        minLeft: 0,
        minTop: 0
      };
    }

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;


    childNodeIds.forEach((childId: string) => {
      try {
        const childNode = query.node(childId).get();
        const childProps = childNode.data.props;

        // Simply use the props as they are - no complex DOM calculations
        const left = parseNumericValue(childProps.left || '0');
        const top = parseNumericValue(childProps.top || '0');
        const width = parseNumericValue(childProps.width || '100');
        const height = parseNumericValue(childProps.height || '50');

        const right = left + width;
        const bottom = top + height;

        minLeft = Math.min(minLeft, left);
        minTop = Math.min(minTop, top);
        maxRight = Math.max(maxRight, right);
        maxBottom = Math.max(maxBottom, bottom);

       
      } catch (error) {
        console.error('Error processing child node:', childId, error);
      }
    });

    // Add minimal padding around the content - just enough to contain the children
    const padding = 10;
    const contentWidth = maxRight - minLeft;
    const contentHeight = maxBottom - minTop;
    const calculatedWidth = contentWidth + (padding * 2);
    const calculatedHeight = contentHeight + (padding * 2);

    // Safety check: ensure we have reasonable bounds
    if (minLeft === Infinity || minTop === Infinity || maxRight === -Infinity || maxBottom === -Infinity) {
      return {
        width: 200,
        height: 100,
        minLeft: -padding,
        minTop: -padding,
      };
    }

    // Use calculated dimensions directly - no artificial minimums
    const finalWidth = Math.max(calculatedWidth, 50); // Very small minimum just to prevent zero width
    const finalHeight = Math.max(calculatedHeight, 30); // Very small minimum just to prevent zero height

    return {
      width: finalWidth,
      height: finalHeight,
      minLeft: minLeft - padding,
      minTop: minTop - padding,
    };
  }, [query, id, parseNumericValue]);

  // Perform initial sizing operation (only once during group creation)
  const performInitialSizing = useCallback((attempt: number = 1) => {
    if (hasInitialSized.current || isCurrentlySizing.current) return;

    // Skip auto-sizing if the group already has proper dimensions (not default 200x100)
    const currentWidth = parseNumericValue(width);
    const currentHeight = parseNumericValue(height);
    const isDefaultSize = (currentWidth === 200 && currentHeight === 100);

    if (!isDefaultSize) {
      hasInitialSized.current = true;
      return;
    }

    isCurrentlySizing.current = true;

    const bounds = calculateInitialBounds();
    const currentLeft = parseNumericValue(left);
    const currentTop = parseNumericValue(top);

    setProp((props: any) => {
      props.width = `${bounds.width}px`;
      props.height = `${bounds.height}px`;

      // Adjust position if children extend beyond current boundaries
      if (bounds.minLeft < 0) {
        props.left = `${currentLeft + bounds.minLeft}px`;
      }
      if (bounds.minTop < 0) {
        props.top = `${currentTop + bounds.minTop}px`;
      }
    });

    hasInitialSized.current = true;
    isCurrentlySizing.current = false;
  }, [calculateInitialBounds, width, height, left, top, parseNumericValue, setProp, id]);

  // Initial sizing on mount (only once)
  useEffect(() => {
    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    if (childNodeIds.length === 0 || hasInitialSized.current) return;

    // Multiple attempts with increasing delays to ensure DOM is fully rendered
    // and children are properly positioned within the group
    const timeouts: number[] = [];

    // First attempt after 200ms (allow time for children to be moved into group)
    timeouts.push(window.setTimeout(() => {
      if (!hasInitialSized.current) {
        performInitialSizing(1);
      }
    }, 200));

    // Second attempt after 600ms (allow more time for DOM rendering and positioning)
    timeouts.push(window.setTimeout(() => {
      if (!hasInitialSized.current) {
        performInitialSizing(2);
      }
    }, 600));

    // Final attempt after 1200ms (ensure everything is settled)
    timeouts.push(window.setTimeout(() => {
      if (!hasInitialSized.current) {
        performInitialSizing(3);
      }
    }, 1200));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [performInitialSizing, query, id]);

  // Add MutationObserver to detect when child elements are fully rendered
  useEffect(() => {
    if (hasInitialSized.current) return;

    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    if (childNodeIds.length === 0) return;

    // Observe changes to child elements to detect when they're fully rendered
    const observer = new MutationObserver((mutations) => {
      if (hasInitialSized.current) return;

      let shouldResize = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' &&
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          const target = mutation.target as HTMLElement;
          const nodeId = target.getAttribute('data-node-id');
          if (nodeId && childNodeIds.includes(nodeId)) {
            shouldResize = true;
          }
        }
      });

      if (shouldResize) {
        setTimeout(() => {
          if (!hasInitialSized.current) {
            performInitialSizing();
          }
        }, 100);
      }
    });

    // Start observing after a short delay
    const observerTimeout = setTimeout(() => {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: true
      });
    }, 50);

    return () => {
      clearTimeout(observerTimeout);
      observer.disconnect();
    };
  }, [query, id, performInitialSizing]);

  // Add ResizeObserver to detect when child elements change size
  useEffect(() => {
    if (hasInitialSized.current) return;

    const currentNode = query.node(id).get();
    const childNodeIds = currentNode?.data?.nodes || [];

    if (childNodeIds.length === 0) return;

    let resizeObserver: ResizeObserver | null = null;

    // Set up ResizeObserver after a delay to ensure elements exist
    const setupTimeout = setTimeout(() => {
      if (hasInitialSized.current) return;

      const elementsToObserve: HTMLElement[] = [];

      childNodeIds.forEach((childId) => {
        const element = document.querySelector(`[data-node-id="${childId}"]`) as HTMLElement;
        if (element) {
          elementsToObserve.push(element);
        }
      });

      if (elementsToObserve.length > 0) {
        resizeObserver = new ResizeObserver((entries) => {
          if (hasInitialSized.current) return;

          setTimeout(() => {
            if (!hasInitialSized.current) {
              performInitialSizing();
            }
          }, 50);
        });

        elementsToObserve.forEach((element) => {
          resizeObserver!.observe(element);
        });
      }
    }, 200);

    return () => {
      clearTimeout(setupTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [query, id, performInitialSizing]);

  return {
    hasInitialSized: hasInitialSized.current,
    performInitialSizing,
  };
};
