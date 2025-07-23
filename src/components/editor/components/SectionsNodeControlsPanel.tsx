/**
 * SectionsNodeControlsPanel - Specialized node controls for Sections selector
 * 
 * This component provides section-specific node controls including:
 * - Section layer controls (move up/down in root)
 * - Section duplication
 * - Add new section functionality
 * - Standard node controls (hide/show, lock/unlock, delete)
 * 
 * Usage in SectionsSettings.tsx:
 * <SectionsNodeControlsPanel />
 */

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, useNode, Element } from '@craftjs/core';
import { Box, Stack, Text } from '@chakra-ui/react';
import { BsFiles, BsThreeDots } from "react-icons/bs";
import { FaLock, FaRegCopy, FaRegEye, FaRegEyeSlash, FaRegSave, FaTrash, FaUnlockAlt, FaSync, FaPlus } from 'react-icons/fa';
import { HiOutlineArrowDownOnSquareStack, HiOutlineArrowUpOnSquareStack } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { Tooltip } from 'react-tooltip';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { useNodeState } from '../hooks/useNodeState';
import { useDuplication } from '../utils/duplicationUtils';
import { Btn } from '../styles/RenderNodeStyles';
import { Sections } from '../../selectors/Sections/index';

export const SectionsNodeControlsPanel: React.FC = () => {
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
    showAssetSaveModal,
    currentEditingPlatform,
    desktopContent,
    mobileContent,
  } = useViewport();

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);

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
  const { duplicateSection: duplicateSectionUtil } = useDuplication();

  // Section-specific control handlers
  const handleDelete = () => {
    try {
      const nodeExists = query.node(id).get();
      if (nodeExists) {
        actions.delete(id);
      }
    } catch (error) {
      console.warn('Error deleting section, hiding instead:', id, error);
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

  // Section-specific layer controls (move within ROOT)
  const handleBringSectionUp = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex > 0) {
      actions.move(id, "ROOT", currentIndex - 1);
    }
  };

  const handleBringSectionDown = () => {
    if (!parent) return;
    const parentData = query.node(parent).get();
    const currentIndex = parentData.data.nodes.indexOf(id);
    if (currentIndex < parentData.data.nodes.length - 1) {
      actions.move(id, "ROOT", currentIndex + 2);
    }
  };

  const handleDuplicateSection = () => {
    try {
      duplicateSectionUtil(id);
    } catch (error) {
      console.error("Error duplicating section:", error);
    }
  };

  // Add new blank section below current section
  const handleAddNewSection = () => {
    try {
      const newSection = () => (
        <Element
          canvas
          is={Sections}
          height="400px"
          backgroundColor="#f8f9fa"
        />
      );

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

  const handleCrossPlatformSync = () => {
    // Cross-platform sync logic would go here
    console.log('Cross-platform sync triggered for section');
  };

  return (
    <Box className='block sm:hidden'>
      <Box borderBottomWidth="1px" borderColor="gray.200" p={4}>
        <Text fontSize="sm" fontWeight={'bold'} mb={3}>Điều khiển Section</Text>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hide/Show Toggle */}
          <Btn
            onClick={handleToggleHidden}
            data-tooltip-id="sections-controls-panel"
            data-tooltip-content={props.hidden ? "Hiện section" : "Ẩn section"}
          >
            {props.hidden ? <FaRegEyeSlash className='text-xl' /> : <FaRegEye className='text-xl' />}
          </Btn>

          {/* Lock/Unlock Toggle */}
          <Btn
            onClick={toggleLock}
            data-tooltip-id="sections-controls-panel"
            data-tooltip-content={isLocked ? "Mở khóa section" : "Khóa section"}
          >
            {isLocked ? <FaLock className='text-xl' /> : <FaUnlockAlt className='text-xl' />}
          </Btn>

          {/* Section Layer Controls */}
          <Btn
            onClick={handleBringSectionUp}
            data-tooltip-id="sections-controls-panel"
            data-tooltip-content="Đưa section lên trước"
          >
            <HiOutlineArrowUpOnSquareStack className='text-xl' />
          </Btn>
          <Btn
            onClick={handleBringSectionDown}
            data-tooltip-id="sections-controls-panel"
            data-tooltip-content="Đưa section xuống sau"
          >
            <HiOutlineArrowDownOnSquareStack className='text-xl' />
          </Btn>

          {/* Add New Section */}
          <Btn
            onClick={handleAddNewSection}
            data-tooltip-id="sections-controls-panel"
            data-tooltip-content="Thêm section mới"
          >
            <FaPlus className='text-xl' />
          </Btn>

          {/* Duplicate Section */}
          <Btn
            onClick={handleDuplicateSection}
            data-tooltip-id="sections-controls-panel"
            data-tooltip-content="Nhân bản section"
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
              data-tooltip-id="sections-controls-panel"
              data-tooltip-content="Xóa section"
            >
              <FaTrash className='text-xl' />
            </Btn>
          )}
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

        <Tooltip id="sections-controls-panel" />
      </Box>
    </Box>
  );
};
