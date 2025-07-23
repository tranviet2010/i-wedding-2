import { useEditor } from '@craftjs/core';
import { useCallback, useEffect } from 'react';
import { useViewport } from '../Viewport/ViewportContext';
import { getTargetSection, getCloneTree, isModalComponent } from '../utils/duplicationUtils';
  const NON_COPY_COMPONENTS = ['Popup', 'Dropbox', 'Content Wrapper', 'Album Modal', 'QuickActions'];
export const useCopyPaste = () => {
  const { actions, query } = useEditor();
  const {
    copiedNode,
    setCopiedNode,
    closeAllModalComponents,
    openPopup,
    openDropboxEditor,
    openAlbumModal,
    currentPopupIdOpen,
    currentDropboxEditorIdOpen,
    currentLightBoxOpen
  } = useViewport();

  // Helper function to detect if a modal component is in edit mode and get the target for pasting
  const getModalPasteTarget = useCallback(() => {
    // Check if a Popup component is currently open for editing
    if (currentPopupIdOpen) {
      try {
        const popupNode = query.node(currentPopupIdOpen).get();
        if (popupNode && popupNode.data.displayName === 'Popup') {
          return {
            type: 'popup',
            targetId: currentPopupIdOpen,
            isModal: true
          };
        }
      } catch (error) {
        console.warn('Error checking popup node:', error);
      }
    }

    // Check if a Dropbox component is currently open for editing (LightBox edit mode)
    if (currentDropboxEditorIdOpen) {
      try {
        const dropboxNode = query.node(currentDropboxEditorIdOpen).get();
        if (dropboxNode && dropboxNode.data.displayName === 'Dropbox') {
          return {
            type: 'dropbox',
            targetId: currentDropboxEditorIdOpen,
            isModal: true
          };
        }
      } catch (error) {
        console.warn('Error checking dropbox node:', error);
      }
    }

    // Note: LightBox components (currentLightBoxOpen) don't have editable content areas
    // so we don't handle them for paste operations

    return null;
  }, [currentPopupIdOpen, currentDropboxEditorIdOpen, query]);

  // Check if the current focus is within the editor canvas area
  const isEditorCanvasFocused = useCallback(() => {
    const activeElement = document.activeElement;

    // If no active element, assume canvas is focused
    if (!activeElement) return true;

    // First check: if it's any form control, don't trigger copy/paste
    const isFormControl = activeElement.matches('input, textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"], [role="spinbutton"]');
    if (isFormControl) {
      console.log('Copy/paste blocked: Focus is on form control', activeElement.tagName, activeElement.className);
      return false;
    }

    // Second check: if the element is within any editor UI area, don't trigger copy/paste
    const isInEditorUI = activeElement.closest(`
      .sidebar,
      .header,
      .toolbar,
      .elements-popup,
      .layer-popup,
      .node-controls,
      .sidebar-content,
      .chakra-modal,
      .chakra-drawer,
      [role="dialog"],
      [role="modal"],
      [role="menu"],
      [role="listbox"],
      [data-testid*="modal"],
      [data-testid*="drawer"],
      [data-testid*="popup"]
    `.replace(/\s+/g, ' ').trim());

    if (isInEditorUI) {
      console.log('Copy/paste blocked: Focus is within editor UI', isInEditorUI.className);
      return false;
    }

    // Third check: specifically check if we're within the Sidebar component (which contains Toolbar)
    const sidebarElement = document.querySelector('.sidebar');
    if (sidebarElement && sidebarElement.contains(activeElement)) {
      console.log('Copy/paste blocked: Focus is within sidebar/toolbar area');
      return false;
    }

    // Fourth check: check for Chakra UI components that might be in toolbars
    const isInChakraComponent = activeElement.closest('.chakra-input, .chakra-textarea, .chakra-select, .chakra-button, .chakra-stack, .chakra-box');
    if (isInChakraComponent) {
      console.log('Copy/paste blocked: Focus is within Chakra UI component');
      return false;
    }

    // Fifth check: check for any element with data attributes indicating it's part of settings/toolbar
    const isInSettingsArea = activeElement.closest('[data-settings], [data-toolbar], [data-property-panel]');
    if (isInSettingsArea) {
      console.log('Copy/paste blocked: Focus is within settings/toolbar area');
      return false;
    }

    // Sixth check: if the active element is within the canvas area, allow copy/paste
    const craftRenderer = document.querySelector('.craftjs-renderer');
    if (craftRenderer && craftRenderer.contains(activeElement)) {
      console.log('Copy/paste allowed: Focus is within canvas area');
      return true;
    }

    // Seventh check: if the active element is the body or document, consider canvas focused
    if (activeElement === document.body || activeElement === document.documentElement) {
      console.log('Copy/paste allowed: Focus is on document body');
      return true;
    }

    // Default to false for safety
    console.log('Copy/paste blocked: Default safety check', activeElement.tagName, activeElement.className);
    return false;
  }, []);

  const handleCopy = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      console.log('Copy shortcut detected, checking focus...');

      // Only proceed if the editor canvas is focused
      if (!isEditorCanvasFocused()) {
        console.log('Copy blocked by focus detection');
        return;
      }

      const selectedNode = query.getEvent('selected').first();
      if (!selectedNode) {
        console.log('Copy blocked: No node selected');
        return;
      }

      if (NON_COPY_COMPONENTS.includes(query.node(selectedNode).get().data.displayName)) {
        console.log('Copy blocked: Cannot copy this component');
        return;
      }

      try {
        // Get the complete node tree to support copying with children
        const nodeTree = query.node(selectedNode).toNodeTree();

        // Validate the tree structure before storing
        if (!nodeTree || !nodeTree.nodes || !nodeTree.rootNodeId) {
          console.error('Invalid node tree structure for copying:', nodeTree);
          return;
        }

        // Store the complete tree for proper duplication with children
        setCopiedNode(nodeTree);
        console.log('Node tree copied successfully:', nodeTree);
      } catch (error) {
        console.error('Error copying node:', error);
      }
    }
  }, [query, isEditorCanvasFocused, setCopiedNode]);

  const handleCut = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
      // Only proceed if the editor canvas is focused
      if (!isEditorCanvasFocused()) return;

      const selectedNode = query.getEvent('selected').first();
      if (!selectedNode) return;
      if (NON_COPY_COMPONENTS.includes(query.node(selectedNode).get().data.displayName)) {
        console.log('Cut blocked: Cannot cut this component');
        return;
      }

      try {
        // Get the complete node tree to support cutting with children
        const nodeTree = query.node(selectedNode).toNodeTree();

        // Validate the tree structure before storing
        if (!nodeTree || !nodeTree.nodes || !nodeTree.rootNodeId) {
          console.error('Invalid node tree structure for cutting:', nodeTree);
          return;
        }

        // Store the tree for pasting
        setCopiedNode(nodeTree);

        // Delete the node from the canvas safely
        try {
          const nodeExists = query.node(selectedNode).get();
          if (nodeExists) {
            actions.delete(selectedNode);
          }
        } catch (deleteError) {
          console.warn('Error deleting cut node, hiding instead:', selectedNode, deleteError);
          // Fallback: hide the node
          try {
            actions.setProp(selectedNode, (props: any) => {
              props.opacity = 0;
              props.pointerEvents = 'none';
            });
            actions.selectNode();
          } catch (hideError) {
            console.error('Fallback hide also failed:', hideError);
          }
        }

        console.log('Node tree cut successfully:', nodeTree);
      } catch (error) {
        console.error('Error cutting node:', error);
      }
    }
  }, [query, actions, isEditorCanvasFocused, setCopiedNode]);

  const handlePaste = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      console.log('Paste shortcut detected, checking focus...');

      // Only proceed if the editor canvas is focused
      if (!isEditorCanvasFocused()) {
        console.log('Paste blocked by focus detection');
        return;
      }

      if (!copiedNode) {
        console.log('Paste blocked: No copied node available');
        return;
      }

      const selectedNode = query.getEvent('selected').first();
      if (!selectedNode) {
        console.log('Paste blocked: No node selected');
        return;
      }

      try {
        console.log('Pasting node:', copiedNode);
        console.log('Copied node type:', typeof copiedNode);
        console.log('Copied node keys:', Object.keys(copiedNode || {}));

        // Check if we should paste into a modal component
        const modalTarget = getModalPasteTarget();
        let parent: string;
        let useModalPositioning = false;

        if (modalTarget) {
          // Paste into the modal component
          parent = modalTarget.targetId;
          useModalPositioning = true;
          console.log(`Pasting into ${modalTarget.type} component:`, parent);
        } else {
          // Use the utility function to get target section (existing behavior)
          parent = getTargetSection(query, selectedNode);
          console.log('Pasting into section:', parent);
        }

        // Validate parent exists
        let parentData;
        try {
          parentData = query.node(parent).get();
        } catch (parentError) {
          console.error('Error getting parent node:', parent, parentError);
          return;
        }

        const currentIndex = parentData.data.nodes.indexOf(selectedNode);

        // Check if we have a node tree (new format) or single node (old format)
        if (copiedNode && typeof copiedNode === 'object' && copiedNode.rootNodeId && copiedNode.nodes) {
          // New format: complete node tree - use the proper Craft.js approach
          console.log('Pasting node tree with children...');

          try {
            // Clone the tree with new IDs and position offset
            // For modal components, use smaller offset since they have constrained space
            const positionOffset = useModalPositioning
              ? { top: '20px', left: '20px' }
              : { top: '20px', left: '20px' };
            const newTree = getCloneTree(copiedNode, query, positionOffset);

            // Add the cloned tree to the target parent
            // For modal components, add at the end (no specific index needed)
            const insertIndex = useModalPositioning ? undefined : currentIndex + 1;
            actions.addNodeTree(newTree, parent, insertIndex);

            // Select the new root node
            setTimeout(() => {
              actions.selectNode(newTree.rootNodeId);
            }, 100);

          } catch (treeError) {
            console.error('Error with tree approach:', treeError);
            // Fall back to simple node addition from root node
            const rootNode = copiedNode.nodes && copiedNode.rootNodeId ? copiedNode.nodes[copiedNode.rootNodeId] : null;
            if (rootNode && rootNode.data) {
              const nodeDataWithOffset = {
                ...rootNode.data,
                props: {
                  ...rootNode.data.props,
                  top: rootNode.data.props?.top ? `${parseInt(rootNode.data.props.top) + 20}px` : '20px',
                  left: rootNode.data.props?.left ? `${parseInt(rootNode.data.props.left) + 20}px` : '20px'
                }
              };

              const freshNode = { data: nodeDataWithOffset };
              const newNode = query.parseFreshNode(freshNode).toNode();

              const insertIndex = useModalPositioning ? undefined : currentIndex + 1;
              actions.add(newNode, parent, insertIndex);

              setTimeout(() => {
                actions.selectNode(newNode.id);
              }, 100);
            }
          }
        } else {
          // Old format: single serialized node
          console.log('Pasting single node (legacy format)...');

          try {
            const nodeCopy = query.parseSerializedNode(copiedNode).toNode();

            if (!nodeCopy || !nodeCopy.data) {
              console.error('Invalid node structure:', nodeCopy);
              return;
            }

            const nodeDataWithOffset = {
              ...nodeCopy.data,
              props: {
                ...nodeCopy.data.props,
                top: nodeCopy.data.props?.top ? `${parseInt(nodeCopy.data.props.top) + 20}px` : '20px',
                left: nodeCopy.data.props?.left ? `${parseInt(nodeCopy.data.props.left) + 20}px` : '20px'
              }
            };

            const freshNode = { data: nodeDataWithOffset };
            const newNode = query.parseFreshNode(freshNode).toNode();

            const insertIndex = useModalPositioning ? undefined : currentIndex + 1;
            actions.add(newNode, parent, insertIndex);

            setTimeout(() => {
              actions.selectNode(newNode.id);
            }, 100);
          } catch (legacyError) {
            console.error('Error parsing legacy node format:', legacyError);
            throw legacyError; // Re-throw to trigger fallback
          }
        }

      } catch (error) {
        console.error('Error pasting node:', error);

        // Fallback: try a simpler approach similar to duplicateNode fallback
        try {
          console.log('Attempting fallback paste method...');

          // Reuse the modal detection logic from above
          const modalTarget = getModalPasteTarget();
          let fallbackParent: string;
          let fallbackUseModalPositioning = false;

          if (modalTarget) {
            fallbackParent = modalTarget.targetId;
            fallbackUseModalPositioning = true;
          } else {
            fallbackParent = getTargetSection(query, selectedNode);
          }

          const parentData = query.node(fallbackParent).get();
          const currentIndex = parentData.data.nodes.indexOf(selectedNode);

          // Try to create a fresh node directly from the copied data
          // Handle both tree format and legacy format
          let nodeData;
          if (copiedNode && copiedNode.rootNodeId && copiedNode.nodes) {
            // Tree format - get root node data
            const rootNode = copiedNode.nodes[copiedNode.rootNodeId];
            nodeData = rootNode && rootNode.data ? rootNode.data : rootNode;
          } else {
            // Legacy format - use directly
            nodeData = copiedNode;
          }

          if (!nodeData) {
            console.error('No valid node data found in copied node');
            return;
          }

          const freshNodeData = {
            ...nodeData,
            props: {
              ...nodeData.props,
              top: nodeData.props?.top ? `${parseInt(nodeData.props.top) + 20}px` : '20px',
              left: nodeData.props?.left ? `${parseInt(nodeData.props.left) + 20}px` : '20px'
            }
          };

          const freshNode = { data: freshNodeData };
          const fallbackNode = query.parseFreshNode(freshNode).toNode();

          const insertIndex = fallbackUseModalPositioning ? undefined : currentIndex + 1;
          actions.add(fallbackNode, fallbackParent, insertIndex);

          setTimeout(() => {
            actions.selectNode(fallbackNode.id);
          }, 100);

          console.log('Fallback paste successful');
        } catch (fallbackError) {
          console.error('Fallback paste also failed:', fallbackError);
        }
      }
    }
  }, [actions, query, isEditorCanvasFocused, copiedNode, getModalPasteTarget]);

  useEffect(() => {
    document.addEventListener('keydown', handleCopy);
    document.addEventListener('keydown', handleCut);
    document.addEventListener('keydown', handlePaste);

    return () => {
      document.removeEventListener('keydown', handleCopy);
      document.removeEventListener('keydown', handleCut);
      document.removeEventListener('keydown', handlePaste);
    };
  }, [handleCopy, handleCut, handlePaste]);
}; 