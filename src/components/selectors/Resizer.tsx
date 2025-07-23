import { useNode, useEditor } from '@craftjs/core';
import cx from 'classnames';
import { Resizable } from 're-resizable';
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { styled } from 'styled-components';
import { zIndex } from '@/utils/zIndex';

import {
  isPercentage,
  pxToPercent,
  percentToPx,
  getElementDimensions,
} from '../../utils/numToMeasurement';
import { debounce } from '@/utils/helper';

interface NodeDimensions {
  width: string | number;
  height: string | number;
}

interface InitialPosition {
  left: number;
  top: number;
}

// Optimized throttle function
const throttle = (func: Function, limit: number) => {
  let lastRun = 0;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastRun >= limit) {
      func.apply(this, args);
      lastRun = now;
    }
  };
};

const Indicators = styled.div<{ $bound?: 'row' | 'column' }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  span {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 100%;
    display: block;
    box-shadow: 0px 0px 12px -1px rgba(0, 0, 0, 0.25);
    z-index: ${zIndex.resizer};
    pointer-events: none;
    border: 2px solid #36a9e0;
    &:nth-child(1) {
      ${(props) =>
    props.$bound
      ? props.$bound === 'row'
        ? `
                left: 50%;
                top: -5px;
                transform:translateX(-50%);
              `
        : `
              top: 50%;
              left: -5px;
              transform:translateY(-50%);
            `
      : `
              left: -5px;
              top:-5px;
            `}
    }
    &:nth-child(2) {
      right: -5px;
      top: -5px;
      display: ${(props) => (props.$bound ? 'none' : 'block')};
    }
    &:nth-child(3) {
      ${(props) =>
    props.$bound
      ? props.$bound === 'row'
        ? `
                left: 50%;
                bottom: -5px;
                transform:translateX(-50%);
              `
        : `
                bottom: 50%;
                left: -5px;
                transform:translateY(-50%);
              `
      : `
              left: -5px;
              bottom:-5px;
            `}
    }
    &:nth-child(4) {
      bottom: -5px;
      right: -5px;
      display: ${(props) => (props.$bound ? 'none' : 'block')};
    }
  }
`;

interface ResizerProps {
  propKey: {
    width?: string;
    height?: string;
    left?: string;
    top?: string;
  };
  children: React.ReactNode;
  lockAspectRatio?: boolean;
  enable?: boolean;
  [key: string]: any;
}

export const Resizer = ({ propKey, children, lockAspectRatio, enable = true, ...props }: ResizerProps) => {
  // Flag to check if width or height resizing is enabled
  const canResizeWidth = useMemo(() => Boolean(propKey.width), [propKey.width]);
  const canResizeHeight = useMemo(() => Boolean(propKey.height), [propKey.height]);

  const {
    id,
    actions: { setProp },
    connectors: { connect },
    fillSpace,
    nodeWidth,
    nodeHeight,
    nodeLeft,
    nodeTop,
    parent,
    active,
    inNodeContext,
    isChildOfButton,
    isChildOfGroup,
    isChildOfForm,
  } = useNode((node) => ({
    parent: node.data.parent,
    active: node.events.selected,
    nodeWidth: propKey.width ? node.data.props[propKey.width] : undefined,
    nodeHeight: propKey.height ? node.data.props[propKey.height] : undefined,
    nodeLeft: node.data.props.left,
    nodeTop: node.data.props.top,
    fillSpace: node.data.props.fillSpace,
    isChildOfButton: node.data.props.isChildOfButton,
    isChildOfGroup: node.data.props.isChildOfGroup,
    isChildOfForm: node.data.props.isChildOfForm,
  }));

  const { isRootNode, parentDirection } = useEditor((state, query) => {
    return {
      parentDirection:
        parent &&
        state.nodes[parent] &&
        state.nodes[parent].data.props.flexDirection,
      isRootNode: query.node(id).isRoot(),
    };
  });

  const resizable = useRef<Resizable | null>(null);
  const isResizing = useRef<boolean>(false);
  const editingDimensions = useRef<{ width: number; height: number } | null>(null);
  const nodeDimensions = useRef<NodeDimensions>({ width: nodeWidth, height: nodeHeight });
  const initialPosition = useRef<InitialPosition | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const resizeQueue = useRef<{ width: string, height: string } | null>(null);
  const positionQueue = useRef<{ left?: string, top?: string } | null>(null);
  const isComponentMounted = useRef<boolean>(true);
  const lastConnectedNode = useRef<HTMLElement | null>(null);


  const effectiveLockAspectRatio = useMemo(() => {
    return lockAspectRatio;
  }, [lockAspectRatio]);

  /**
   * Using an internal value to ensure the width/height set in the node is converted to px
   * because for some reason the <re-resizable /> library does not work well with percentages.
   */
  const [internalDimensions, setInternalDimensions] = useState({
    width: nodeWidth,
    height: nodeHeight,
  });

  // Memoized dimension conversion functions
  const convertDimensions = useMemo(() => {
    return {
      toPx: (value: string | number, parentSize: number) => {
        return typeof value === 'string' ? percentToPx(value, parentSize) : value;
      },
      toPercent: (value: number, parentSize: number) => {
        return pxToPercent(value, parentSize) + '%';
      }
    };
  }, []);



  const updateInternalDimensionsWithOriginal = useCallback(() => {
    if (!isComponentMounted.current) return;

    const { width, height } = nodeDimensions.current;
    setInternalDimensions({
      width,
      height,
    });
  }, []);

  const getUpdatedDimensions = (width: number, height: number) => {
    if (!resizable.current?.resizable || !editingDimensions.current) return null;

    const currentWidth = editingDimensions.current.width;
    const currentHeight = editingDimensions.current.height;

    // For re-resizable, the delta values represent the change in size
    // The library handles position adjustments internally for left/top handles
    // We just need to calculate the new absolute dimensions
    return {
      width: currentWidth + width,
      height: currentHeight + height,
    };
  };

  // Safely attempt to connect or disconnect nodes
  const safeConnect = useCallback((node: HTMLElement | null) => {
    try {
      // If there's a previous node and it's different, disconnect it first
      if (lastConnectedNode.current && lastConnectedNode.current !== node) {
        // This is just a safeguard, craftjs handles disconnection internally
        // but we keep track for our own state management
        lastConnectedNode.current = null;
      }

      // Only connect if there's a new node to connect
      if (node && isComponentMounted.current) {
        connect(node);
        lastConnectedNode.current = node;
      }
    } catch (err) {
      console.warn('Error while connecting node:', err);
    }
  }, [connect]);

  // Update throttledSetProp to respect width/height flags and handle position adjustments
  const throttledSetProp = useMemo(() => {
    return throttle((newDimensions: { width: string, height: string }, positionAdjustments?: { left?: string, top?: string }) => {
      if (!isComponentMounted.current) return;

      setProp((prop: any) => {
        if (canResizeWidth && propKey.width) {
          prop[propKey.width] = newDimensions.width;
        }
        if (canResizeHeight && propKey.height) {
          prop[propKey.height] = newDimensions.height;
        }
        // Apply position adjustments if provided and component has position properties
        if (positionAdjustments) {
          if (positionAdjustments.left !== undefined && nodeLeft !== undefined) {
            prop.left = positionAdjustments.left;
          }
          if (positionAdjustments.top !== undefined && nodeTop !== undefined) {
            prop.top = positionAdjustments.top;
          }
        }
      });
    }, 50);
  }, [setProp, propKey, canResizeWidth, canResizeHeight, nodeLeft, nodeTop]);

  // Update requestUpdate to handle dimensions and apply position adjustments to DOM directly
  const requestUpdate = useCallback((newDimensions: { width: string, height: string }, positionAdjustments?: { left?: string, top?: string }) => {
    if (!isComponentMounted.current) return;

    resizeQueue.current = newDimensions;
    if (positionAdjustments) {
      positionQueue.current = positionAdjustments;
    }

    if (!lastUpdateTime.current) {
      lastUpdateTime.current = Date.now();
      requestAnimationFrame(() => {
        if (resizeQueue.current && isComponentMounted.current) {
          // Update internal dimensions
          setInternalDimensions(resizeQueue.current);

          // Apply position adjustments directly to DOM for immediate visual feedback
          if (positionQueue.current && resizable.current?.resizable) {
            const dom = resizable.current.resizable;
            if (positionQueue.current.left !== undefined) {
              dom.style.left = positionQueue.current.left;
            }
            if (positionQueue.current.top !== undefined) {
              dom.style.top = positionQueue.current.top;
            }
          }

          // Update the actual DOM element size
          if (resizable.current?.resizable) {
            const dom = resizable.current.resizable;
            dom.style.width = resizeQueue.current.width;
            dom.style.height = resizeQueue.current.height;
          }

          resizeQueue.current = null;
          lastUpdateTime.current = 0;
        }
      });
    }
  }, []);

  useEffect(() => {
    // Update dimensions ref when props change
    nodeDimensions.current = { width: nodeWidth, height: nodeHeight };

    if (!isResizing.current && isComponentMounted.current) {
      updateInternalDimensionsWithOriginal();
    }
  }, [nodeWidth, nodeHeight, updateInternalDimensionsWithOriginal]);

  useEffect(() => {
    const listener = debounce(updateInternalDimensionsWithOriginal, 1);
    window.addEventListener('resize', listener);

    // Set mounted flag
    isComponentMounted.current = true;

    return () => {
      // Prevent state updates after unmount
      isComponentMounted.current = false;

      // Clear any pending updates
      resizeQueue.current = null;
      lastUpdateTime.current = 0;

      // Clean up event listener
      window.removeEventListener('resize', listener);
    };
  }, [updateInternalDimensionsWithOriginal]);

  // Update resizeHandlers to properly handle optional dimensions
  const resizeHandlers = useMemo(() => {
    const calculateFinalDimensions = (width: number, height: number, parentElement: HTMLElement) => {
      const parentWidth = getElementDimensions(parentElement).width;
      const parentHeight = getElementDimensions(parentElement).height;

      let finalWidth = isPercentage(String(nodeWidth))
        ? convertDimensions.toPercent(width, parentWidth)
        : `${width}px`;

      let finalHeight = isPercentage(String(nodeHeight))
        ? convertDimensions.toPercent(height, parentHeight)
        : `${height}px`;

      if (isPercentage(String(finalWidth)) && parentElement.style.width === 'auto' && editingDimensions.current) {
        finalWidth = `${editingDimensions.current.width + width}px`;
      }
      if (isPercentage(String(finalHeight)) && parentElement.style.height === 'auto' && editingDimensions.current) {
        finalHeight = `${editingDimensions.current.height + height}px`;
      }

      // Return only dimensions that are allowed to be changed
      return {
        width: canResizeWidth ? finalWidth : internalDimensions.width,
        height: canResizeHeight ? finalHeight : internalDimensions.height
      };
    };

    return {
      onResizeStart: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
        if (!isComponentMounted.current) return;

        e.preventDefault();
        e.stopPropagation();

        if (!resizable.current?.resizable) return;

        const dom = resizable.current.resizable;
        editingDimensions.current = {
          width: dom.getBoundingClientRect().width,
          height: dom.getBoundingClientRect().height,
        };

        // Capture initial position for position adjustment calculations
        initialPosition.current = {
          left: parseFloat(String(nodeLeft || '0')),
          top: parseFloat(String(nodeTop || '0'))
        };

        isResizing.current = true;
      },
      onResize: (_: unknown, direction: any, _ref: HTMLElement, d: { width: number, height: number }) => {
        if (!isComponentMounted.current || !resizable.current?.resizable) return;

        const dom = resizable.current.resizable;
        const updatedDimensions = getUpdatedDimensions(
          canResizeWidth ? d.width : 0,
          canResizeHeight ? d.height : 0
        );
        if (!updatedDimensions || !dom.parentElement) return;

        // Only update width or height based on resize direction
        let finalDimensions = {
          width: internalDimensions.width,
          height: internalDimensions.height
        };

        // Handle edge resizing
        if (direction === 'left' || direction === 'right') {
          finalDimensions.width = calculateFinalDimensions(
            updatedDimensions.width,
            updatedDimensions.height,
            dom.parentElement
          ).width;
        } else if (direction === 'top' || direction === 'bottom') {
          finalDimensions.height = calculateFinalDimensions(
            updatedDimensions.width,
            updatedDimensions.height,
            dom.parentElement
          ).height;
        } else {
          // For corner handles, update both dimensions
          finalDimensions = calculateFinalDimensions(
            updatedDimensions.width,
            updatedDimensions.height,
            dom.parentElement
          );
        }

        // Calculate position adjustments for edge and corner resizing
        const positionAdjustments: { left?: string, top?: string } = {};

        // Only adjust position if component has position properties and we have initial position
        if ((nodeLeft !== undefined || nodeTop !== undefined) && initialPosition.current && editingDimensions.current) {
          // Calculate total size change from initial size
          const totalWidthChange = updatedDimensions.width - editingDimensions.current.width;
          const totalHeightChange = updatedDimensions.height - editingDimensions.current.height;

          // Handle position adjustments based on specific resize directions
          // Each corner handle has a specific anchor point that remains fixed

          if (nodeLeft !== undefined) {
            if (direction === 'left' || direction === 'topLeft' || direction === 'bottomLeft') {
              // Left-side handles: left edge moves, adjust left position
              const newLeft = initialPosition.current.left - totalWidthChange;
              positionAdjustments.left = `${newLeft}px`;
            }
            // topRight and bottomRight: left position stays fixed (no adjustment needed)
          }

          if (nodeTop !== undefined) {
            if (direction === 'top' || direction === 'topLeft' || direction === 'topRight') {
              // Top-side handles: top edge moves, adjust top position
              const newTop = initialPosition.current.top - totalHeightChange;
              positionAdjustments.top = `${newTop}px`;
            }
            // bottomLeft and bottomRight: top position stays fixed (no adjustment needed)
          }
        }

        // Apply position adjustments immediately for real-time visual feedback
        const hasPositionAdjustments = Object.keys(positionAdjustments).length > 0;
        requestUpdate(finalDimensions, hasPositionAdjustments ? positionAdjustments : undefined);
      },
      onResizeStop: () => {
        if (!isComponentMounted.current) return;

        isResizing.current = false;

        // Get the final dimensions from the current state
        const finalDimensions = {
          width: internalDimensions.width,
          height: internalDimensions.height
        };

        // Apply final dimensions and position adjustments to props
        throttledSetProp(finalDimensions, positionQueue.current || undefined);

        // Clear state
        positionQueue.current = null;
        initialPosition.current = null;

        // Update internal state
        updateInternalDimensionsWithOriginal();
      }
    };
  }, [nodeWidth, nodeHeight, convertDimensions, requestUpdate, throttledSetProp, updateInternalDimensionsWithOriginal, internalDimensions, canResizeWidth, canResizeHeight]);
  // Memoize enable object to prevent rerenders and respect width/height flags
  const enableHandles = useMemo(() => {
    const isEnabled = active && inNodeContext && enable;
    
    // Disable resizing if element is child of Button, Group, or Form
    const shouldDisableResize = isChildOfButton || isChildOfGroup || isChildOfForm;
    
    if (shouldDisableResize) {
      return {
        top: false,
        left: false,
        bottom: false,
        right: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false,
      };
    }

    // Configuration for which handles are enabled based on width/height flags
    return {
      top: isEnabled && canResizeHeight,
      left: isEnabled && canResizeWidth,
      bottom: isEnabled && canResizeHeight,
      right: isEnabled && canResizeWidth,
      topLeft: isEnabled && canResizeWidth && canResizeHeight,
      topRight: isEnabled && canResizeWidth && canResizeHeight,
      bottomLeft: isEnabled && canResizeWidth && canResizeHeight,
      bottomRight: isEnabled && canResizeWidth && canResizeHeight,
    };
  }, [active, inNodeContext, canResizeWidth, canResizeHeight, enable, isChildOfButton, isChildOfGroup, isChildOfForm]);

  // Memoize className to prevent rerenders
  const className = useMemo(() => {
    return cx([
      {
        'm-auto': isRootNode,
        flex: true,
      },
    ]);
  }, [isRootNode]);

  return (
    <Resizable
      enable={enableHandles}
      className={className}
      lockAspectRatio={effectiveLockAspectRatio}
      ref={(ref) => {
        if (ref) {
          resizable.current = ref;
          if (ref.resizable) {
            // Use safe connect to handle potential DOM errors
            safeConnect(ref.resizable);
          }
        } else {
          // Component is being unmounted or rerendered
          resizable.current = null;
        }
      }}
      size={internalDimensions}
      onResizeStart={resizeHandlers.onResizeStart}
      onResize={resizeHandlers.onResize}
      onResizeStop={resizeHandlers.onResizeStop}
      handleStyles={{
        top: { height: '10px', cursor: canResizeHeight ? 'ns-resize' : 'default' },
        right: { width: '10px', cursor: canResizeWidth ? 'ew-resize' : 'default' },
        bottom: { height: '10px', cursor: canResizeHeight ? 'ns-resize' : 'default' },
        left: { width: '10px', cursor: canResizeWidth ? 'ew-resize' : 'default' },
        topLeft: { cursor: (canResizeWidth && canResizeHeight) ? 'nwse-resize' : 'default' },
        topRight: { cursor: (canResizeWidth && canResizeHeight) ? 'nesw-resize' : 'default' },
        bottomLeft: { cursor: (canResizeWidth && canResizeHeight) ? 'nesw-resize' : 'default' },
        bottomRight: { cursor: (canResizeWidth && canResizeHeight) ? 'nwse-resize' : 'default' }
      }}
      handleClasses={{
        // Adding larger hit area classes for better touch/mouse interaction
        top: 'resize-handle-top',
        right: 'resize-handle-right',
        bottom: 'resize-handle-bottom',
        left: 'resize-handle-left',
        topLeft: 'resize-handle-top-left',
        topRight: 'resize-handle-top-right',
        bottomLeft: 'resize-handle-bottom-left',
        bottomRight: 'resize-handle-bottom-right'
      }}
      style={{
        ...props.style,
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: internalDimensions.width,
        height: internalDimensions.height
      }}
      {...props}
    >
      {children}
      {active && enable && isComponentMounted.current && (
        <Indicators $bound={fillSpace === 'yes' ? parentDirection : false}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </Indicators>
      )}
    </Resizable>
  );
};
