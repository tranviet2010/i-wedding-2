import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Element, NodeId, useEditor } from '@craftjs/core';
import { Group } from '../../selectors/Group';

export interface MultiSelectState {
  selectedNodes: NodeId[];
  isMultiSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
  isCtrlPressed: boolean;
}

export interface UseMultiSelectReturn extends MultiSelectState {
  addToSelection: (nodeId: NodeId) => void;
  addToSelectionIfNotPresent: (nodeId: NodeId) => void;
  removeFromSelection: (nodeId: NodeId) => void;
  clearSelection: () => void;
  setCurrentSelection: (nodeId: NodeId) => void;
  toggleSelection: (nodeId: NodeId) => void;
  startBoxSelection: (startX: number, startY: number) => void;
  updateBoxSelection: (endX: number, endY: number) => void;
  endBoxSelection: () => void;
  forceEndSelection: () => void;
  isNodeSelected: (nodeId: NodeId) => boolean;
  canCreateGroup: () => boolean;
  createGroup: () => void;
  ungroupSelection: () => void;
  shouldPreventClearSelection: (target: HTMLElement) => boolean;
}

export const useMultiSelect = (): UseMultiSelectReturn => {
  const { actions, query, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Components that should skip multi-selection behavior
  const NON_SELECTABLE_COMPONENTS = ['Popup', 'Dropbox', 'Album Modal', 'Sections', 'Content Wrapper'];

  const [selectedNodes, setSelectedNodes] = useState<NodeId[]>([]);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<MultiSelectState['selectionBox']>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Debounce refs for drag selection
  const dragStartTimeRef = useRef<number>(0);
  const isDragSelectionRef = useRef(false);
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Support both Ctrl (Windows/Linux) and Cmd (Mac)
      if (e.key === 'Control' || e.key === 'Meta' || e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset when either Ctrl or Cmd is released
      if (e.key === 'Control' || e.key === 'Meta' || (!e.ctrlKey && !e.metaKey)) {
        setIsCtrlPressed(false);
      }
    };

    // Also handle window blur to reset state
    const handleWindowBlur = () => {
      setIsCtrlPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled]);

  const addToSelection = useCallback((nodeId: NodeId) => {
    // Check if the node is a non-selectable component and prevent adding to selection
    const nodes = query.getNodes();
    const node = nodes[nodeId];
    if (node && NON_SELECTABLE_COMPONENTS.includes(node.data.displayName)) {
      return;
    }

    setSelectedNodes(prev => {
      if (!prev.includes(nodeId)) {
        return [...prev, nodeId];
      }
      return prev;
    });
  }, [query]);

  // Function to set the current selection (for normal clicks)
  // This clears the current selection and selects only the clicked component
  const setCurrentSelection = useCallback((nodeId: NodeId) => {

    // Check if the node is a non-selectable component and prevent adding to selection
    const nodes = query.getNodes();
    const node = nodes[nodeId];
    if (node && NON_SELECTABLE_COMPONENTS.includes(node.data.displayName)) {
      // Clear selection instead of adding these components
      setSelectedNodes([]);
      return;
    }
    setSelectedNodes([nodeId]);
  }, [query]);

  // Function to add a node to selection when selected normally (without Ctrl)
  // This ensures the node is in the selectedNodes array as mentioned in project architecture
  const addToSelectionIfNotPresent = useCallback((nodeId: NodeId) => {
    // Check if the node is a non-selectable component and prevent adding to selection
    const nodes = query.getNodes();
    const node = nodes[nodeId];
    if (node && NON_SELECTABLE_COMPONENTS.includes(node.data.displayName)) {
      return;
    }


    setSelectedNodes(prev => {
      if (!prev.includes(nodeId)) {
        return [...prev, nodeId];
      }
      return prev;
    });
  }, [query, selectedNodes.length]);

  const removeFromSelection = useCallback((nodeId: NodeId) => {
    setSelectedNodes(prev => prev.filter(id => id !== nodeId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  // Helper function to check if we should prevent clearing selection
  const shouldPreventClearSelection = useCallback((target: HTMLElement) => {
    // Don't clear selection if clicking on text elements or editable content
    const isTextElement = target.tagName === 'SPAN' || target.tagName === 'P' ||
                         target.tagName === 'H1' || target.tagName === 'H2' ||
                         target.tagName === 'H3' || target.tagName === 'H4' ||
                         target.tagName === 'H5' || target.tagName === 'H6';
    const hasTextContent = target.textContent && target.textContent.trim().length > 0;
    const isEditableElement = target.contentEditable === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    const shouldPrevent = (isTextElement && hasTextContent) || isEditableElement;

    return shouldPrevent;
  }, []);

  const toggleSelection = useCallback((nodeId: NodeId) => {
    // Check if the node is a non-selectable component and prevent adding to selection
    const nodes = query.getNodes();
    const node = nodes[nodeId];
    if (node && NON_SELECTABLE_COMPONENTS.includes(node.data.displayName)) {
      return;
    }

    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  }, [query]);

  const isNodeSelected = useCallback((nodeId: NodeId) => {
    return selectedNodes.includes(nodeId);
  }, [selectedNodes]);

  const startBoxSelection = useCallback((startX: number, startY: number) => {
    // Record drag start time for debouncing
    dragStartTimeRef.current = Date.now();
    isDragSelectionRef.current = false;

    // Initialize the selection box immediately but don't show it yet
    setSelectionBox({
      startX,
      startY,
      endX: startX,
      endY: startY,
    });
  }, []);

  const updateBoxSelection = useCallback((endX: number, endY: number) => {
    // Mark that we're actively dragging
    isDragSelectionRef.current = true;

    // Show the selection box when we start dragging
    if (!isMultiSelecting) {
      setIsMultiSelecting(true);
    }

    setSelectionBox(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endX,
        endY,
      };
    });
  }, [isMultiSelecting]);

  // Helper function to check if a node is a descendant of another node
  const isNodeDescendantOf = useCallback((childNodeId: NodeId, potentialParentId: NodeId, nodes: Record<NodeId, any>): boolean => {
    const childNode = nodes[childNodeId];
    if (!childNode || !childNode.data.parent) return false;

    let currentParent = childNode.data.parent;

    // Traverse up the parent chain
    while (currentParent && currentParent !== 'ROOT') {
      if (currentParent === potentialParentId) {
        return true;
      }
      const parentNode = nodes[currentParent];
      if (!parentNode) break;
      currentParent = parentNode.data.parent;
    }

    return false;
  }, []);

  // Helper function to filter out child nodes when their parents are already selected
  const filterTopLevelNodes = useCallback((nodeIds: NodeId[], nodes: Record<NodeId, any>): NodeId[] => {
    return nodeIds.filter(nodeId => {
      // Check if this node is a descendant of any other node in the selection
      return !nodeIds.some(otherNodeId => {
        if (nodeId === otherNodeId) return false;
        return isNodeDescendantOf(nodeId, otherNodeId, nodes);
      });
    });
  }, [isNodeDescendantOf]);

  const processSelectionBox = useCallback((currentSelectionBox: NonNullable<MultiSelectState['selectionBox']>) => {
    // Find all nodes within the selection box
    const craftRenderer = document.querySelector('.craftjs-renderer');
    if (!craftRenderer) return;

    const rendererRect = craftRenderer.getBoundingClientRect();
    const boxRect = {
      left: Math.min(currentSelectionBox.startX, currentSelectionBox.endX) - rendererRect.left,
      top: Math.min(currentSelectionBox.startY, currentSelectionBox.endY) - rendererRect.top,
      right: Math.max(currentSelectionBox.startX, currentSelectionBox.endX) - rendererRect.left,
      bottom: Math.max(currentSelectionBox.startY, currentSelectionBox.endY) - rendererRect.top,
    };

    // Get all nodes and check which ones intersect with the selection box
    const nodes = query.getNodes();
    const nodesInBox: NodeId[] = [];

    Object.keys(nodes).forEach(nodeId => {
      const node = nodes[nodeId];
      if (!node.dom) return;

      // Skip non-selectable components and child elements of buttons/groups
      if (NON_SELECTABLE_COMPONENTS.includes(node.data.displayName) ||
        node.data.props.isChildOfButton ||
        node.data.props.isChildOfForm ||
        node.data.props.isChildOfGroup) return;

      const nodeRect = node.dom.getBoundingClientRect();
      const relativeNodeRect = {
        left: nodeRect.left - rendererRect.left,
        top: nodeRect.top - rendererRect.top,
        right: nodeRect.right - rendererRect.left,
        bottom: nodeRect.bottom - rendererRect.top,
      };

      // Check if node intersects with selection box
      const intersects = !(
        relativeNodeRect.right < boxRect.left ||
        relativeNodeRect.left > boxRect.right ||
        relativeNodeRect.bottom < boxRect.top ||
        relativeNodeRect.top > boxRect.bottom
      );

      if (intersects) {
        nodesInBox.push(nodeId);
      }
    });

    // Filter out child nodes when their parents are already selected
    const topLevelNodes = filterTopLevelNodes(nodesInBox, nodes);

    setSelectedNodes(topLevelNodes);
  }, [query, filterTopLevelNodes]);

  const endBoxSelection = useCallback(() => {
    setSelectionBox(currentSelectionBox => {
      if (!currentSelectionBox) {
        setIsMultiSelecting(false);
        isDragSelectionRef.current = false;
        return null;
      }

      const boxWidth = Math.abs(currentSelectionBox.endX - currentSelectionBox.startX);
      const boxHeight = Math.abs(currentSelectionBox.endY - currentSelectionBox.startY);

      if (boxWidth >= 50 || boxHeight >= 50) {
        processSelectionBox(currentSelectionBox);
      }

      setIsMultiSelecting(false);
      isDragSelectionRef.current = false;
      return null;
    });
  }, [processSelectionBox]);

  const forceEndSelection = useCallback(() => {
    // Force clear all selection states immediately
    setIsMultiSelecting(false);
    setSelectionBox(null);
    isDragSelectionRef.current = false;
    dragStartTimeRef.current = 0;
  }, []);

  // Handle escape key to clear selection
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Escape key clears all selection
        forceEndSelection();
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, forceEndSelection, clearSelection]);

  const canCreateGroup = useCallback(() => {
    return selectedNodes.length >= 2;
  }, [selectedNodes]);

  const createGroup = useCallback(() => {
    if (!canCreateGroup()) return;

    try {
      // Calculate bounding box of selected nodes using their actual props
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const nodes = query.getNodes();
      const selectedNodeData: Array<{ id: NodeId; node: any; left: number; top: number; width: number; height: number }> = [];

      // Get node data for all selected nodes using their actual properties
      selectedNodes.forEach(nodeId => {
        const node = nodes[nodeId];
        const props = node.data.props;

        // Parse numeric values from the props
        const left = parseFloat(String(props.left || '0').replace('px', '')) || 0;
        const top = parseFloat(String(props.top || '0').replace('px', '')) || 0;
        const width = parseFloat(String(props.width || '100').replace('px', '')) || 100;
        const height = parseFloat(String(props.height || '50').replace('px', '')) || 50;

        selectedNodeData.push({ id: nodeId, node, left, top, width, height });

        minX = Math.min(minX, left);
        minY = Math.min(minY, top);
        maxX = Math.max(maxX, left + width);
        maxY = Math.max(maxY, top + height);
      });

      if (selectedNodeData.length === 0) return;

      // Calculate proper group dimensions to contain all selected items with padding
      const padding = 10;
      const groupLeft = minX - padding;
      const groupTop = minY - padding;
      const groupWidth = (maxX - minX) + (padding * 2);
      const groupHeight = (maxY - minY) + (padding * 2);

      // Find the target section (where the first selected node is)
      const firstNode = selectedNodeData[0].node;
      const targetSectionId = firstNode.data.parent || 'ROOT';

      // Create Group element using Element approach (similar to how Sections/ContentWrapper are created)
      const groupElement = React.createElement(Element, {
        canvas: true,
        is: Group,
        width: `${groupWidth}px`,
        height: `${groupHeight}px`,
        left: `${groupLeft}px`,
        top: `${groupTop}px`,
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
      });

      // Parse the element to get the node tree
      const groupNodeTree = query.parseReactElement(groupElement).toNodeTree();
      const groupNodeId = Object.keys(groupNodeTree.nodes)[0];
      const groupNode = groupNodeTree.nodes[groupNodeId];

      // Add the group to the target section
      actions.add(groupNode, targetSectionId);

      // Move selected nodes into the group and update their positions
      selectedNodeData.forEach(({ id: nodeId, left, top }, index) => {
        // Calculate position relative to the group (subtract group's position)
        // The group position already includes padding, so this will position children correctly
        const relativeToGroupX = left - groupLeft;
        const relativeToGroupY = top - groupTop;


        // Update node position to be relative to group
        actions.setProp(nodeId, (props: any) => {
          props.left = `${relativeToGroupX}px`;
          props.top = `${relativeToGroupY}px`;
          props.isChildOfGroup = true;
        });

        // Move node into the group
        actions.move(nodeId, groupNodeId, index);
      });

      // Clear multi-selection and select the new group
      clearSelection();

      // Select the new group after a short delay
      setTimeout(() => {
        actions.selectNode(groupNodeId);
      }, 100);


    } catch (error) {
      console.error('Error creating group:', error);
    }
  }, [selectedNodes, canCreateGroup, actions, query, clearSelection]);

  const ungroupSelection = useCallback(() => {
    const currentSelection = query.getEvent('selected').first();
    if (!currentSelection) return;

    const groupNode = query.node(currentSelection).get();
    if (groupNode.data.displayName !== 'Group') return;

    try {
      // Get the group's position from its props
      const groupProps = groupNode.data.props;
      const groupLeft = parseFloat(String(groupProps.left || '0').replace('px', '')) || 0;
      const groupTop = parseFloat(String(groupProps.top || '0').replace('px', '')) || 0;

      // Get the parent where the group is located
      const groupParent = groupNode.data.parent || 'ROOT';

      // Move all children out of the group
      const childNodes = groupNode.data.nodes || [];
      childNodes.forEach((childId: NodeId) => {
        const childNode = query.node(childId).get();
        const childProps = childNode.data.props;

        // Get child's current position relative to the group
        const childRelativeLeft = parseFloat(String(childProps.left || '0').replace('px', '')) || 0;
        const childRelativeTop = parseFloat(String(childProps.top || '0').replace('px', '')) || 0;

        // Calculate absolute position by adding group's position
        const absoluteLeft = groupLeft + childRelativeLeft;
        const absoluteTop = groupTop + childRelativeTop;

        // Update child position to absolute coordinates
        actions.setProp(childId, (props: any) => {
          props.left = `${absoluteLeft}px`;
          props.top = `${absoluteTop}px`;
          props.isChildOfGroup = false;
        });

        // Move child back to the group's parent
        actions.move(childId, groupParent, 0);
      });

      // Delete the group safely
      try {
        const nodeExists = query.node(currentSelection).get();
        if (nodeExists) {
          actions.delete(currentSelection);
        }
      } catch (deleteError) {
        console.warn('Error deleting group, hiding instead:', currentSelection, deleteError);
        // Fallback: hide the group
        try {
          actions.setProp(currentSelection, (props: any) => {
            props.opacity = 0;
            props.pointerEvents = 'none';
          });
        } catch (hideError) {
          console.error('Fallback hide also failed:', hideError);
        }
      }

      // Clear selection to ensure UI updates properly
      setTimeout(() => {
        actions.clearEvents();
      }, 50);

    } catch (error) {
      console.error('Error ungrouping:', error);
      // Fallback: just delete the group safely
      try {
        const nodeExists = query.node(currentSelection).get();
        if (nodeExists) {
          actions.delete(currentSelection);
        }
      } catch (deleteError) {
        console.warn('Fallback delete failed, hiding instead:', currentSelection, deleteError);
        try {
          actions.setProp(currentSelection, (props: any) => {
            props.opacity = 0;
            props.pointerEvents = 'none';
          });
        } catch (hideError) {
          console.error('Fallback hide also failed:', hideError);
        }
      }
      // Clear selection in fallback case too
      setTimeout(() => {
        actions.clearEvents();
      }, 50);
    }
  }, [actions, query]);

  return {
    selectedNodes,
    isMultiSelecting,
    selectionBox,
    isCtrlPressed,
    addToSelection,
    addToSelectionIfNotPresent,
    removeFromSelection,
    clearSelection,
    setCurrentSelection,
    toggleSelection,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    forceEndSelection,
    isNodeSelected,
    canCreateGroup,
    createGroup,
    ungroupSelection,
    shouldPreventClearSelection,
  };
};
