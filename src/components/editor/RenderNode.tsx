import { Element, NodeId, useEditor, useNode } from '@craftjs/core';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { MdRotateLeft } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';
import { Sections } from '../selectors/Sections';
import { useViewport } from './Viewport/ViewportContext';
import { GroupActionButtons } from './components/GroupActionButtons';
import { NodeControls } from './components/NodeControls';
import { SectionBottomIndicator } from './components/SectionBottomIndicator';
import { SmartAlignmentGuides } from './components/SmartAlignmentGuides';
import { useMultiSelectContext } from './contexts/MultiSelectContext';
import { useViewportSettings, getMobileWidth, getDesktopWidth } from './contexts/ViewportSettingsContext';
import { useDragging } from './hooks/useDragging';
import { useNodeState } from './hooks/useNodeState';
import { useIsMobile } from './hooks/useMobile';
import { SafeAreaBorders } from './styles/RenderNodeStyles';
import { RenderNodeProps } from './types/RenderNodeTypes';
import { useDuplication } from './utils/duplicationUtils';
import { zIndex } from '@/utils/zIndex';

export const RenderNode: React.FC<RenderNodeProps> = ({ render }) => {
  const { id } = useNode();
  const { actions, query, isActive, enabled } = useEditor((state, query) => ({
    isActive: query.getEvent('selected').contains(id),
    enabled: state.options.enabled,
  }));

  // Components that should skip multi-selection behavior
  const NON_MULTI_SELECTABLE_COMPONENTS = ['Sections', 'Content Wrapper', 'Popup', 'Dropbox', 'Album Modal'];

  const {
    showMiddleGuides,
    setShowMiddleGuides,
    currentDragParent,
    setCurrentDragParent,
    closePopup,
    closeDropboxEditor,
    currentEditingPlatform,
    isSectionSwitchingDisabled,
    isSidebarVisible,
    hideSidebar,
    showSidebar,
    closeAllModalComponents,
    openPopup,
    openDropboxEditor,
    openAlbumModal
  } = useViewport();

  // Get viewport settings
  const { settings: viewportSettings } = useViewportSettings();

  // Mobile detection
  const isMobile = useIsMobile();

  // Multi-select functionality
  const multiSelect = useMultiSelectContext();
  const {
    isNodeSelected,
    toggleSelection,
    isCtrlPressed,
    setCurrentSelection,
    addToSelectionIfNotPresent,
    selectedNodes,
    canCreateGroup
  } = multiSelect;

  const {
    isHover,
    dom,
    name,
    deletable,
    parent,
    props,
  } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom.displayName || node.data.displayName,
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props,
  }));
  const currentRef = React.useRef<HTMLDivElement | null>(null);
  const groupActionRef = React.useRef<HTMLDivElement | null>(null);
  const isSection = name === 'Sections' || name === 'AlbumSection';
  const shouldShowSafeArea = isSection;

  // Use the node state hook
  const nodeState = useNodeState({
    id,
    dom,
    locked: props.locked || props.isChildOfButton || props.isEditing || props.isChildOfForm || props.isChildOfGroup,
    parentNode: parent ? query.node(parent).get() : null,
    actions,
    props
  });

  const {
    isLocked,
    isDragging,
    parentRect,
    toggleLock,
    setIsNearVerticalCenter,
    setIsNearHorizontalCenter,
    setParentRect,
    setIsDragging
  } = nodeState;
  // Use the dragging hook
  useDragging({
    dom,
    isLocked,
    isActive,
    parentNode: parent ? query.node(parent).get() : null,
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
    isSectionSwitchingDisabled
  });

  const getPos = React.useCallback(() => {
    if (!dom) return { top: '0px', left: '0px' };

    const { top, left, bottom } = dom.getBoundingClientRect();
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`,
    };
  }, [dom]);

  const getRotatePos = React.useCallback(() => {
    if (!dom) return { top: '0px', left: '0px' };

    const { top, left, width, height, bottom } = dom.getBoundingClientRect();
    return {
      top: `${bottom + 10}px`, // Position below the element with some padding
      left: `${left + width / 2}px`, // Center horizontally
    };
  }, [dom]);

  // Function to calculate mobile indicator position
  const getMobileIndicatorPos = React.useCallback(() => {
    if (!dom) return { top: '0px', left: '0px' };

    const { top, left, bottom, width } = dom.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const indicatorHeight = 50; // Estimated height of mobile indicator
    const margin = 10; // Margin from element and viewport edges

    // Check available space below the element
    const spaceBelow = viewportHeight - bottom;
    
    // Check available space above the element
    const spaceAbove = top;

    let finalTop: number;

    // Primary preference: position below if there's sufficient space
    if (spaceBelow >= indicatorHeight + margin) {
      finalTop = bottom + margin;
    }
    // Secondary preference: position above if there's sufficient space
    else if (spaceAbove >= indicatorHeight + margin) {
      finalTop = top - indicatorHeight - margin;
    }
    // Fallback: position at bottom of viewport with margin
    else {
      finalTop = viewportHeight - indicatorHeight - margin;
    }

    return {
      top: `${finalTop}px`,
      left: `${left + width / 2}px`, // Center horizontally on the element
    };
  }, [dom]);

  // Function to get position for GroupActionButtons below the latest/bottommost children
  const getGroupActionPos = React.useCallback(() => {
    if (!enabled) return { top: '0px', left: '0px' };

    if (selectedNodes.length === 0) return { top: '0px', left: '0px' };

    let bottomMost = 0;
    let leftMost = Infinity;
    let rightMost = 0;

    // Find the bounds of all selected nodes
    selectedNodes.forEach(nodeId => {
      try {
        const node = query.node(nodeId).get();
        const nodeDOM = node.dom;
        if (nodeDOM) {
          const rect = nodeDOM.getBoundingClientRect();
          bottomMost = Math.max(bottomMost, rect.bottom);
          leftMost = Math.min(leftMost, rect.left);
          rightMost = Math.max(rightMost, rect.right);
        }
      } catch (error) {
        console.warn('Error getting node DOM for', nodeId, error);
      }
    });

    // Position the GroupActionButtons below the bottommost element, centered horizontally
    const centerX = (leftMost + rightMost) / 2;

    return {
      top: `${bottomMost + 20}px`, // Position below with some padding
      left: `${centerX}px`, // Center horizontally
    };
  }, [enabled, selectedNodes, query]);

  // Function to calculate section indicator position - position on left side of screen
  const getSectionIndicatorPos = React.useCallback(() => {
    if (!dom) return { left: '20px', top: '50%' };

    const sectionRect = dom.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check if section covers most of the screen (at least 80% of viewport height)
    const sectionCoversScreen = sectionRect.height >= viewportHeight * 0.8;

    if (sectionCoversScreen) {
      // For full-screen sections, position at absolute screen center on the left
      const screenCenterY = viewportHeight / 2;

      // For horizontal positioning, try to position on left side outside content area
      const contentContainer = dom.querySelector('.content-container');
      if (contentContainer) {
        const contentRect = contentContainer.getBoundingClientRect();
        const spaceOnLeft = contentRect.left;

        if (spaceOnLeft >= 220) {
          // Position outside content area on the left at screen center
          return {
            left: `${spaceOnLeft - 210}px`,
            top: `${screenCenterY}px`,
            right: 'auto',
            position: 'fixed' as const // Use fixed positioning for screen-center
          };
        } else {
          // Position inside content area on the left at screen center  
          return {
            left: '20px',
            top: `${screenCenterY}px`,
            right: 'auto',
            position: 'fixed' as const // Use fixed positioning for screen-center
          };
        }
      } else {
        // Fallback to simple left positioning at screen center
        return {
          left: '20px',
          top: `${screenCenterY}px`,
          right: 'auto',
          position: 'fixed' as const // Use fixed positioning for screen-center
        };
      }
    } else {
      // For shorter sections, position on the left (vertically centered within section)
      const contentContainer = dom.querySelector('.content-container');
      if (!contentContainer) {
        return {
          left: '20px',
          top: '50%',
          right: 'auto'
        };
      }

      const contentRect = contentContainer.getBoundingClientRect();
      const spaceOnLeft = contentRect.left;
      const offsetFromSectionLeft = contentRect.left - sectionRect.left;

      if (spaceOnLeft >= 220) {
        // Position outside content area on the left
        return {
          left: `${offsetFromSectionLeft - 210}px`,
          top: '50%',
          right: 'auto'
        };
      } else {
        // Position at the left edge with some padding
        return {
          left: '20px',
          top: '50%',
          right: 'auto'
        };
      }
    }
  }, [dom]);

  const scroll = React.useCallback(() => {
    const { current: currentDOM } = currentRef;
    if (!currentDOM || !dom) return;

    // For the main node indicator
    if (currentDOM.classList.contains('node-indicator')) {
      const { top, left } = getPos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;
    }
    // For the section indicator - use custom positioning
    else if (currentDOM.classList.contains('section-indicator')) {
      const { top, left } = getPos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;

      // Update the section controls positioning with our custom logic
      const sectionControls = currentDOM.querySelector('.section-controls') as HTMLElement;
      if (sectionControls) {
        const customPos = getSectionIndicatorPos();
        // Apply all positioning styles from our custom function
        sectionControls.style.left = customPos.left || 'auto';
        sectionControls.style.right = customPos.right || 'auto';
        sectionControls.style.top = customPos.top || '50%';
      }
    }
    // For the rotate indicator
    else if (currentDOM.classList.contains('rotate-indicator')) {
      const { top, left } = getRotatePos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;
    }
    // For the group action buttons
    else if (currentDOM.classList.contains('group-action-indicator')) {
      const { top, left } = getGroupActionPos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;
    }
    // For the mobile indicator
    else if (currentDOM.classList.contains('mobile-indicator')) {
      const { top, left } = getMobileIndicatorPos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;
    }
  }, [dom, getPos, getRotatePos, getGroupActionPos, getSectionIndicatorPos, getMobileIndicatorPos]);

  React.useEffect(() => {
    const craftRenderer = document.querySelector('.craftjs-renderer');
    if (craftRenderer) {
      craftRenderer.addEventListener('scroll', scroll);
      return () => {
        craftRenderer.removeEventListener('scroll', scroll);
      };
    }
  }, [scroll]);

  // Add window resize listener to update section indicator positioning
  React.useEffect(() => {
    const handleResize = () => {
      // Trigger a scroll event to update positioning
      scroll();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scroll]);


  // Layer index control functions
  const bringForward = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();

    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex < parentData.data.nodes.length - 1) {
      actions.move(id, parent, currentIndex + 2);
    }
  };

  const sendBackward = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex > 0) {
      actions.move(id, parent, currentIndex - 1);
    }
  };

  const bringSectionUp = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex > 0) {
      actions.move(id, "ROOT", currentIndex - 1);
    }
  };

  const bringSectionDown = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex < parentData.data.nodes.length - 1) {
      actions.move(id, "ROOT", currentIndex + 2);
    }
  };
  const getTargetNode = (): NodeId => {
    const node = query.node('ROOT').toNodeTree().nodes;
    const sections = Object.values(node).filter((n: any) => n && n.data && n.data.name === 'Sections') as any[];
    const sectionIdContainingSelected = sections.find((section: any) => {
      return section.data.nodes.includes(id)
    }) as any;
    if (sectionIdContainingSelected) {
      return sectionIdContainingSelected.id;
    }
    return sections[0]?.id || 'ROOT';
  };

  // Use the duplication utility hook
  const {
    duplicateNode: duplicateNodeUtil,
    duplicateSection: duplicateSectionUtil,
    duplicateModalComponent,
    isModalComponent
  } = useDuplication();

  const duplicateNode = () => {
    try {
      const currentNode = query.node(id).get();

      // Check if this is a modal component that needs special handling
      if (isModalComponent(currentNode)) {
        duplicateModalComponent(id, query, actions, {
          closeAllModalComponents,
          openPopup,
          openDropboxEditor,
          openAlbumModal
        });
      } else {
        duplicateNodeUtil(id);
      }
    } catch (error) {
      console.error("Error duplicating node:", error);
    }
  };

  // Add resize handler for sections
  const handleResizePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dom || !isSection) return;

    // Get coordinates from mouse or touch event
    let initialY;
    if ('touches' in e && e.touches.length > 0) {
      initialY = e.touches[0].clientY;
    } else {
      initialY = (e as React.MouseEvent).clientY;
    }

    const initialHeight = dom.clientHeight;
    document.body.style.cursor = 'ns-resize';

    const handlePointerMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dom) return;

      moveEvent.preventDefault(); // Prevent scrolling on touch

      // Get coordinates from mouse or touch event
      let clientY;
      if ('touches' in moveEvent && moveEvent.touches.length > 0) {
        clientY = moveEvent.touches[0].clientY;
      } else if ('changedTouches' in moveEvent && moveEvent.changedTouches.length > 0) {
        clientY = moveEvent.changedTouches[0].clientY;
      } else {
        clientY = (moveEvent as MouseEvent).clientY;
      }

      const deltaY = clientY - initialY;
      const newHeight = Math.max(100, initialHeight + deltaY);

      dom.style.height = `${newHeight}px`;
    };

    const handlePointerUp = () => {
      // Remove both mouse and touch event listeners
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
      document.body.style.cursor = '';

      if (dom) {
        actions.setProp(id, (props: any) => {
          props.height = `${dom.clientHeight}px`;
        });
      }
    };

    // Add both mouse and touch event listeners
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
  };

  // Function to duplicate the current section with all its children
  const duplicateSection = () => {
    if (!isSection) return;

    try {
      duplicateSectionUtil(id);
    } catch (error) {
      console.error("Error duplicating section:", error);
    }
  };

  // Function to add a new blank section below current section
  const newSection = () => {
    return (
      <Element
        canvas
        is={Sections}
        height="400px"
        backgroundColor="#f8f9fa"
      />
    );
  };

  const addNewSection = () => {
    if (!isSection) return;

    try {
      const tree = query.parseReactElement(newSection()).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];
      const rootData = query.node('ROOT').get();
      const currentIndex = rootData.data.nodes.indexOf(id);

      // Add the new section after the current section
      actions.add(node, "ROOT", currentIndex + 1);
    } catch (error) {
      console.error("Error adding new section:", error);
    }
  };
  const isChildElement = props.isChildOfButton || props.isChildOfGroup || props.isChildOfForm;
  // Handle multi-select click
  const handleNodeClick = React.useCallback((e: MouseEvent) => {
    if (!enabled) return;

    // Skip multi-select for non-multi-selectable components
    if (NON_MULTI_SELECTABLE_COMPONENTS.includes(name)) return;

    // Skip multi-select entirely for child elements of buttons and groups
    if (props.isChildOfButton || props.isChildOfGroup || props.isChildOfForm) return;

    // Check modifier keys at the time of click for better reliability
    // Support both Ctrl (Windows/Linux) and Cmd (Mac)
    const isModifierPressed = e.ctrlKey || e.metaKey || isCtrlPressed;

    if (isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();

      // Use toggleSelection for Ctrl+click or Cmd+click
      toggleSelection(id);
    } else {
      // For normal clicks, clear current selection and select only this node
      setCurrentSelection(id);
    }
  }, [enabled, isCtrlPressed, toggleSelection, setCurrentSelection, id, name, props.isChildOfButton, props.isChildOfGroup]);

  // Sync craft.js selection with multi-select system
  React.useEffect(() => {
    if (!enabled) return;

    // Skip multi-select for non-multi-selectable components
    if (NON_MULTI_SELECTABLE_COMPONENTS.includes(name)) return;

    // Skip multi-select entirely for child elements of buttons and groups
    if (props.isChildOfButton || props.isChildOfGroup || props.isChildOfForm) return;

    if (isActive && !isNodeSelected(id) && selectedNodes.length == 0) {
      addToSelectionIfNotPresent(id);
    }
  }, [isActive, enabled, name, id, isNodeSelected, addToSelectionIfNotPresent, props.isChildOfButton, props.isChildOfGroup, selectedNodes.length]);

  // Add click listener for multi-select
  React.useEffect(() => {
    if (!dom || !enabled) return;

    dom.addEventListener('click', handleNodeClick);
    return () => {
      dom.removeEventListener('click', handleNodeClick);
    };
  }, [dom, enabled, handleNodeClick]);

  // Add mouse listener for Group corner resize handles to update lockAspectRatio
  React.useEffect(() => {
    if (!dom || !enabled || !['Group', 'Form'].includes(name)) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if click is on one of the 4 corner resize handles
      const isCornerHandle =
        target.closest('.resize-handle-top-left') ||
        target.closest('.resize-handle-top-right') ||
        target.closest('.resize-handle-bottom-left') ||
        target.closest('.resize-handle-bottom-right');

      if (isCornerHandle) {
        // Update lockAspectRatio to true for Group components when using corner handles
        actions.setProp(id, (props: any) => {
          props.lockAspectRatio = true;
        });
      } else {
        actions.setProp(id, (props: any) => {
          props.lockAspectRatio = false;
        });
      }
    };

    dom.addEventListener('mousedown', handleMouseDown);
    return () => {
      dom.removeEventListener('mousedown', handleMouseDown);
    };
  }, [dom, enabled, name, actions, id]);

  // Apply visual styles based on selection state
  React.useEffect(() => {
    if (!dom || !enabled) return;

    const shouldSkipMultiSelect = NON_MULTI_SELECTABLE_COMPONENTS.includes(name) || props.isChildOfButton || props.isChildOfGroup || props.isChildOfForm;
    const isMultiSelected = !shouldSkipMultiSelect ? isNodeSelected(id) : false;

    if (isActive || isMultiSelected) {
      dom.style.outline = '2px solid #4a90e2';
    } else if (isHover) {
      dom.style.outline = '1px dashed #4a90e2';
      dom.style.outlineStyle = 'dashed';
    } else {
      dom.style.outline = '';
    }
  }, [isActive, isHover, dom, enabled, isNodeSelected, id, name, props.isChildOfButton, props.isChildOfGroup, props.isChildOfForm]);

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Only render the node controls if we have a DOM element
  if (!dom) return render;

  // Create the indicator component
  const nodeIndicator = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className="node-indicator hidden sm:block"
      style={{
        position: 'absolute',
        zIndex: zIndex.renderNodeHighlight,
        pointerEvents: 'none',
        ...getPos(),
      }}
    >
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className="node-controls h-[60px] sm:h-[30px] translate-y-[-300%] sm:translate-y-[-400%] translate-x-[-10%] text-xs leading-3 bg-white flex items-center px-2 rounded-sm text-black pointer-events-auto relative z-[1]"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <NodeControls
          id={id}
          name={name}
          deletable={deletable}
          isLocked={isLocked}
          onDelete={() => {
            try {
              // Check if node exists before attempting to delete
              const nodeExists = query.node(id).get();
              if (nodeExists) {
                actions.setHidden(id, true);
                actions.delete(id);
              }
            } catch (error) {
              console.warn('Error deleting node, hiding instead:', id, error);
              // Fallback: hide the node and deselect it
              try {
                actions.setProp(id, (props: any) => {
                  props.opacity = 0;
                  props.pointerEvents = 'none';
                });
                actions.selectNode();
              } catch (fallbackError) {
                console.error('Fallback hide also failed:', fallbackError);
              }
            }
          }}
          onToggleLock={toggleLock}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onDuplicate={duplicateNode}
          onClosePopup={name === 'Popup' ? () => {
            closePopup();
          } : undefined}
          onCloseDropbox={name === 'Dropbox' ? () => {
            closeDropboxEditor();
          } : undefined}
          actions={actions}
          isHidden={props.hidden}
          onToggleHidden={() => actions.setProp(id, (props: any) => { props.hidden = !props.hidden; })}
          query={query}
          props={props}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      </div>
    </div>
  );

  const handleRotatePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dom) return;

    // Get coordinates from mouse or touch event
    let startX, startY;
    if ('touches' in e && e.touches.length > 0) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = (e as React.MouseEvent).clientX;
      startY = (e as React.MouseEvent).clientY;
    }
    // Get center of element for angle calculation
    const rect = dom.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate initial angle
    const initialAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);

    // Get current rotation or default to 0
    const currentRotation = props.rotate || 0;

    document.body.style.cursor = 'grabbing';

    const handlePointerMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!dom) return;
      moveEvent.preventDefault(); // Prevent scrolling on touch
      setIsDragging(true);

      // Get coordinates from mouse or touch event
      let mouseX, mouseY;
      if ('touches' in moveEvent && moveEvent.touches.length > 0) {
        mouseX = moveEvent.touches[0].clientX;
        mouseY = moveEvent.touches[0].clientY;
      } else if ('changedTouches' in moveEvent && moveEvent.changedTouches.length > 0) {
        mouseX = moveEvent.changedTouches[0].clientX;
        mouseY = moveEvent.changedTouches[0].clientY;
      } else {
        mouseX = (moveEvent as MouseEvent).clientX;
        mouseY = (moveEvent as MouseEvent).clientY;
      }

      // Calculate new angle
      const newAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);

      // Calculate rotation change and add to current rotation
      let angleDelta = newAngle - initialAngle;

      // Round to nearest 5 degrees for smoother rotation
      angleDelta = Math.round(angleDelta / 5) * 5;

      const newRotation = Math.round(currentRotation + angleDelta);

      // Apply rotation to the element
      actions.setProp(id, (props: any) => {
        props.rotate = newRotation;
      });
    };

    const handlePointerUp = () => {
      // Remove both mouse and touch event listeners
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
      setIsDragging(false);
      document.body.style.cursor = '';
    };

    // Add both mouse and touch event listeners
    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
  };

  const nodeRorateIndicator = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className="rotate-indicator hidden sm:block"
      style={{
        position: 'absolute',
        zIndex: zIndex.renderNodeHighlight,
        pointerEvents: 'none',
        ...getRotatePos(), // Using our new positioning function
      }}
    >
      <div
        className="node-controls-rotate translate-y-[-300%] sm:translate-y-[-150%] translate-x-[-50%] "
        style={{
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px',
          borderRadius: '100%',
          color: 'black',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: zIndex.content,
          transition: 'all 0.2s ease',
          cursor: 'grab',
          touchAction: 'none' // Prevent default touch behaviors
        }}
        onMouseDown={handleRotatePointerDown}
        onTouchStart={handleRotatePointerDown}
      >
        <MdRotateLeft className='w-6 h-6' />
      </div>
    </div>
  );

  // Create the GroupActionButtons indicator component
  const groupActionIndicator = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className="group-action-indicator"
      style={{
        position: 'fixed',
        zIndex: zIndex.renderNodeHighlight,
        pointerEvents: 'none',
        ...getGroupActionPos(),
      }}
    >
      <div
        style={{
          transform: 'translateX(-50%)', // Center horizontally
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: zIndex.content,
        }}
      >
        <GroupActionButtons />
      </div>
    </div>
  );

  // Create the mobile indicator component
  const mobileIndicator = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className="mobile-indicator block sm:hidden"
      style={{
        position: 'fixed',
        zIndex: zIndex.renderNodeHighlight,
        pointerEvents: 'auto', // Changed from 'none' to 'auto'
        ...getMobileIndicatorPos(),
      }}
    >
      <div
        style={{
          transform: 'translateX(-50%)', // Center horizontally
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: zIndex.content,
          display: 'flex',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #E5E7EB'
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Settings Button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            backgroundColor: isSidebarVisible ? '#EBF8FF' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#374151',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Settings button clicked'); // Debug log
            isSidebarVisible ? hideSidebar() : showSidebar();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Settings button touched'); // Debug log
            isSidebarVisible ? hideSidebar() : showSidebar();
          }}
        >
          <IoSettingsOutline size={20} />
        </button>

        {/* Delete Button */}
        {deletable && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#DC2626',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Delete button clicked'); // Debug log
              try {
                // Check if node exists before attempting to delete
                const nodeExists = query.node(id).get();
                if (nodeExists) {
                  actions.delete(id);
                }
              } catch (error) {
                console.warn('Error deleting node, hiding instead:', id, error);
                // Fallback: hide the node and deselect it
                try {
                  actions.setProp(id, (props: any) => {
                    props.opacity = 0;
                    props.pointerEvents = 'none';
                  });
                  actions.selectNode();
                } catch (fallbackError) {
                  console.error('Fallback hide also failed:', fallbackError);
                }
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Delete button touched'); // Debug log
              try {
                // Check if node exists before attempting to delete
                const nodeExists = query.node(id).get();
                if (nodeExists) {
                  actions.delete(id);
                }
              } catch (error) {
                console.warn('Error deleting node, hiding instead:', id, error);
                // Fallback: hide the node and deselect it
                try {
                  actions.setProp(id, (props: any) => {
                    props.opacity = 0;
                    props.pointerEvents = 'none';
                  });
                  actions.selectNode();
                } catch (fallbackError) {
                  console.error('Fallback hide also failed:', fallbackError);
                }
              }
            }}
          >
            <FaTrash size={18} />
          </button>
        )}
      </div>
    </div>
  );

  const sectionIndicator = (ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className="section-indicator hidden sm:block"
      style={{
        position: 'absolute',
        zIndex: zIndex.renderNodeHighlight,
        pointerEvents: 'none',
        ...getPos(),
      }}
    >
      <div
        className="section-controls flex flex-col gap-2 absolute bg-white p-2 rounded shadow-lg pointer-events-auto z-[1]"
        style={getSectionIndicatorPos()}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <NodeControls
          id={id}
          name={name}
          deletable={deletable}
          isLocked={isLocked}
          onDelete={() => {
            try {
              // Check if node exists before attempting to delete
              const nodeExists = query.node(id).get();
              if (nodeExists) {
                actions.delete(id);
              }
            } catch (error) {
              console.warn('Error deleting node, hiding instead:', id, error);
              // Fallback: hide the node and deselect it
              try {
                actions.setProp(id, (props: any) => {
                  props.opacity = 0;
                  props.pointerEvents = 'none';
                });
                actions.selectNode();
              } catch (fallbackError) {
                console.error('Fallback hide also failed:', fallbackError);
              }
            }
          }}
          isHidden={props.hidden}
          onToggleHidden={() => actions.setProp(id, (props: any) => { props.hidden = !props.hidden; })}
          onToggleLock={toggleLock}
          onBringForward={bringSectionUp}
          onSendBackward={bringSectionDown}
          onDuplicate={duplicateSection}
          onClosePopup={name === 'Popup' ? () => {
            closePopup();
          } : undefined}
          onCloseDropbox={name === 'Dropbox' ? () => {
            closeDropboxEditor();
          } : undefined}
          actions={actions}
          query={query}
          props={props}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      </div>
    </div>
  );

  // Section safe area visualization
  const safeAreaIndicator = shouldShowSafeArea && (
    <SafeAreaBorders
      platform={currentEditingPlatform}
      mobileWidth={getMobileWidth(viewportSettings)}
      desktopWidth={getDesktopWidth(viewportSettings)}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20px',
          cursor: 'ns-resize',
          zIndex: zIndex.renderNodeHighlight,
          touchAction: 'none' // Prevent default touch behaviors
        }}
        onMouseDown={handleResizePointerDown}
        onTouchStart={handleResizePointerDown}
      />
      <SectionBottomIndicator
        dom={dom}
        isSection={isSection}
        isActive={isActive}
        handleResizeMouseDown={handleResizePointerDown}
        addNewSection={addNewSection}
        duplicateSection={duplicateSection}
      />
    </SafeAreaBorders>
  );

  const shouldShowSmartAlignment = isDragging && isActive;


  const smartAlignmentGuides = shouldShowSmartAlignment && (
    <SmartAlignmentGuides
      className="smart-alignment-guides"
      activeNodeId={id}
      isDragging={isDragging}
      query={query}
      isSection={isSection}
    />
  );

  return (
    <div className={`w-full`}>
      {enabled && isActive && !isDragging && !isChildElement && !props.isCropMode && (name !== 'Sections' && name !== 'Content Wrapper' && name !== 'AlbumSection' && name !== 'Album Modal' && name !== 'QuickActions') ?
        (
          <>
            {/* Desktop indicators - hidden on mobile */}
            {ReactDOM.createPortal(nodeRorateIndicator(currentRef), document.querySelector('.page-container') as Element)}
            {ReactDOM.createPortal(nodeIndicator(currentRef), document.querySelector('.page-container') as Element)}
            {/* Mobile indicator - visible only on mobile */}
            {isMobile && ReactDOM.createPortal(mobileIndicator(currentRef), document.querySelector('.page-container') as Element)}
          </>
        ) : null
      }
      {enabled && isActive && !isDragging && isSection &&
        ReactDOM.createPortal(sectionIndicator(currentRef), document.querySelector('.page-container') as Element)
      }
      {enabled && isSection && isActive && !isDragging &&
        <SectionBottomIndicator
          dom={dom}
          isSection={isSection}
          isActive={isActive}
          handleResizeMouseDown={handleResizePointerDown}
          addNewSection={addNewSection}
          duplicateSection={duplicateSection}
        />
      }
      {enabled && shouldShowSafeArea && dom &&
        document.body.contains(dom) &&
        ReactDOM.createPortal(safeAreaIndicator, dom)
      }
      {enabled && shouldShowSmartAlignment &&
        ReactDOM.createPortal(smartAlignmentGuides, document.body)
      }
      {enabled && !isDragging && (canCreateGroup() || (isActive && name === 'Group')) &&
        ReactDOM.createPortal(groupActionIndicator(groupActionRef), document.querySelector('.page-container') as Element)
      }
      {render}
    </div>
  );
};
