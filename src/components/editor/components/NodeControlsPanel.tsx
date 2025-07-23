/**
 * NodeControlsPanel - Reusable component for node controls in selector settings
 *
 * This component extracts the node control functionality from RenderNode.tsx
 * and provides it as a reusable panel that can be integrated into any selector's
 * settings component.
 *
 * Usage Pattern for other selectors:
 * 1. Import this component in your selector's settings file
 * 2. Add it to the "Thiết kế" (Design) tab
 * 3. Configure the props to show/hide specific controls as needed
 *
 * Example:
 * <NodeControlsPanel
 *   showDragHandle={false}
 *   showLayerControls={true}
 *   showContainerSpecificControls={false}
 * />
 */

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { Box, Stack, Text } from '@chakra-ui/react';
import { BsFiles, BsThreeDots } from "react-icons/bs";
import { FaLock, FaRegCopy, FaRegEye, FaRegEyeSlash, FaRegSave, FaTrash, FaUnlockAlt, FaSync } from 'react-icons/fa';
import { HiOutlineArrowDownOnSquareStack, HiOutlineArrowUpOnSquareStack } from "react-icons/hi2";
import { MdOutlineColorLens, MdImageSearch, MdClose } from "react-icons/md";
import { RxDragHandleDots2 } from "react-icons/rx";
import { Tooltip } from 'react-tooltip';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { ColorPickerModal } from './ColorPickerModal';
import { DraggableNumberInput } from './DraggableNumberInput';
import { FileType } from '@/features/files/fileAPI';
import { useIsMobile } from '../hooks/useMobile';
import { useNodeState } from '../hooks/useNodeState';
import { useDuplication } from '../utils/duplicationUtils';
import { Btn } from '../styles/RenderNodeStyles';

interface NodeControlsPanelProps {
  // Optional props to override default behavior
  showDragHandle?: boolean;
  showLayerControls?: boolean;
  showContainerSpecificControls?: boolean;
}

export const NodeControlsPanel: React.FC<NodeControlsPanelProps> = ({
  showDragHandle = true,
  showLayerControls = true,
  showContainerSpecificControls = true
}) => {
  const { id } = useNode();
  const { actions, query } = useEditor();

  const {
    name,
    deletable,
    parent,
    props,
  } = useNode((node) => ({
    name: node.data.custom.displayName || node.data.displayName,
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props,
  }));

  const {
    isSidebarVisible,
    hideSidebar,
    showSidebar,
    showAssetSaveModal,
    showFileSelectModal,
    currentEditingPlatform,
    desktopContent,
    mobileContent,
    closePopup,
    closeDropboxEditor
  } = useViewport();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Close more options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target as Node)) {
        setShowMoreOptions(false);
      }
    };

    if (showMoreOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreOptions]);

  // Use the node state hook
  const nodeState = useNodeState({
    id,
    dom: null, // We don't have direct DOM access in settings panel
    locked: props.locked || props.isChildOfButton || props.isEditing || props.isCropMode,
    parentNode: parent ? query.node(parent).get() : null,
    actions,
    props
  });

  const { isLocked, toggleLock } = nodeState;

  // Use the duplication utility hook
  const { duplicateNode: duplicateNodeUtil } = useDuplication();

  // Control handlers
  const handleDelete = () => {
    try {
      const nodeExists = query.node(id).get();
      if (nodeExists) {
        actions.delete(id);
      }
    } catch (error) {
      console.warn('Error deleting node, hiding instead:', id, error);
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
  };

  const handleToggleHidden = () => {
    actions.setProp(id, (props: any) => {
      props.hidden = !props.hidden;
    });
  };

  const handleBringForward = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex < parentData.data.nodes.length - 1) {
      actions.move(id, parent, currentIndex + 2);
    }
  };

  const handleSendBackward = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex > 0) {
      actions.move(id, parent, currentIndex - 1);
    }
  };

  const handleDuplicate = () => {
    try {
      duplicateNodeUtil(id);
    } catch (error) {
      console.error("Error duplicating node:", error);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    actions.setProp(id, (props: any) => {
      props.backgroundColor = color;
    });
  };

  const handleBackgroundImageSelect = (fileUrl: string) => {
    actions.setProp(id, (props: any) => {
      props.backgroundType = 'image';
      props.backgroundImage = fileUrl;
    });
  };

  const handleBorderRadiusChange = (value: number) => {
    actions.setProp(id, (props: any) => {
      props.radius = value;
    });
  };

  const handleCrossPlatformSync = () => {
    // Cross-platform sync logic would go here
    console.log('Cross-platform sync triggered');
  };

  const isContainer = name === 'Container';
  if (props.isChildOfButton) return null;
  if (props.isChildOfGroup) return null;
  if (props.isChildOfForm) return null;


  return (
    <Box className='block sm:hidden'>
      <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
        <Text fontSize="sm" fontWeight={'bold'} mb={3}>Điều khiển phần tử</Text>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hide/Show Toggle */}
          <Btn
            onClick={handleToggleHidden}
            data-tooltip-id="node-controls-panel"
            data-tooltip-content={props.hidden ? "Hiện phần tử" : "Ẩn phần tử"}
          >
            {props.hidden ? <FaRegEyeSlash className='text-xl' /> : <FaRegEye className='text-xl' />}
          </Btn>

          {/* Lock/Unlock Toggle */}
          <Btn
            onClick={toggleLock}
            data-tooltip-id="node-controls-panel"
            data-tooltip-content={isLocked ? "Mở khóa phần tử" : "Khóa phần tử"}
          >
            {isLocked ? <FaLock className='text-xl' /> : <FaUnlockAlt className='text-xl' />}
          </Btn>

          {/* Layer Controls */}
          {showLayerControls && (
            <>
              <Btn
                onClick={handleBringForward}
                data-tooltip-id="node-controls-panel"
                data-tooltip-content="Đưa lên trước"
              >
                <HiOutlineArrowUpOnSquareStack className='text-xl' />
              </Btn>
              <Btn
                onClick={handleSendBackward}
                data-tooltip-id="node-controls-panel"
                data-tooltip-content="Đưa xuống sau"
              >
                <HiOutlineArrowDownOnSquareStack className='text-xl' />
              </Btn>
            </>
          )}

          {/* Container Specific Controls */}
          {showContainerSpecificControls && isContainer && (
            <>
              <Btn
                onClick={() => setShowColorPicker(true)}
                data-tooltip-id="node-controls-panel"
                data-tooltip-content="Màu nền"
              >
                <MdOutlineColorLens className='text-xl' />
              </Btn>
              <Btn
                onClick={() => showFileSelectModal(
                  FileType.IMAGE,
                  (fileUrl: string) => {
                    handleBackgroundImageSelect(fileUrl);
                  }
                )}
                data-tooltip-id="node-controls-panel"
                data-tooltip-content="Ảnh nền"
              >
                <MdImageSearch className='text-xl' />
              </Btn>

              {/* Border radius draggable input */}
              <div className="flex items-center px-1">
                <DraggableNumberInput
                  value={typeof props?.radius === 'number' ? props.radius : 0}
                  onChange={handleBorderRadiusChange}
                  min={0}
                  max={200}
                  step={1}
                  tooltip="Bo góc (px)"
                  allowFullRound={true}
                />
              </div>
            </>
          )}

          {/* Duplicate */}
          <Btn
            onClick={handleDuplicate}
            data-tooltip-id="node-controls-panel"
            data-tooltip-content="Nhân bản phần tử"
          >
            <BsFiles className='text-xl' />
          </Btn>

          {/* Delete */}
          {deletable && (
            <Btn
              onMouseDown={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleDelete();
              }}
              data-tooltip-id="node-controls-panel"
              data-tooltip-content="Xóa phần tử"
            >
              <FaTrash className='text-xl' />
            </Btn>
          )}

          {name === 'Popup' && (
            <Btn
              onClick={() => closePopup()}
              data-tooltip-id="node-controls-panel"
              data-tooltip-content="Đóng popup"
            >
              <MdClose className='text-xl' />
            </Btn>
          )}

          {name === 'Dropbox' && (
            <Btn
              onClick={closeDropboxEditor}
              data-tooltip-id="node-controls-panel"
              data-tooltip-content="Đóng dropbox"
            >
              <MdClose className='text-xl' />
            </Btn>
          )}

          {/* Cross-platform sync button - only show if other platform has content */}
          {((currentEditingPlatform === 'desktop' && mobileContent) ||
            (currentEditingPlatform === 'mobile' && desktopContent)) && (
              <Btn
                onClick={handleCrossPlatformSync}
                data-tooltip-id="node-controls-panel"
                data-tooltip-content={currentEditingPlatform === 'desktop' ? 'Đồng bộ từ Mobile' : 'Đồng bộ từ Desktop'}
              >
                <FaSync className='text-xl' />
              </Btn>
            )}
          <Btn
            onClick={() => showAssetSaveModal(name, id)}
            data-tooltip-id="node-controls-panel"
            data-tooltip-content="Lưu mẫu phần tử"
          >
            <FaRegSave className='text-xl' />
          </Btn>
        </div>

        <Tooltip id="node-controls-panel" />

        {/* Color Picker Modal */}
        <ColorPickerModal
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          onColorChange={handleBackgroundColorChange}
          initialColor={props?.backgroundColor || '#ffffff'}
        />
      </Box>
    </Box>
  );
};
