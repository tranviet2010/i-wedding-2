import { NodeId } from '@craftjs/core';
import React, { useState } from 'react';
import { BsFiles, BsThreeDots } from "react-icons/bs";
import { FaLock, FaRegCopy, FaRegEye, FaRegEyeSlash, FaRegSave, FaTrash, FaUnlockAlt, FaSync, FaSyncAlt } from 'react-icons/fa';
import { HiOutlineArrowDownOnSquareStack, HiOutlineArrowUpOnSquareStack } from "react-icons/hi2";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineColorLens, MdImageSearch, MdClose } from "react-icons/md";
import { RxDragHandleDots2 } from "react-icons/rx";
import { Tooltip } from 'react-tooltip';
import { Btn } from '../styles/RenderNodeStyles';
import { zIndex } from '@/utils/zIndex';
import { useViewport } from '../Viewport/ViewportContext';
import { ColorPickerModal } from './ColorPickerModal';
import { DraggableNumberInput } from './DraggableNumberInput';
import { FileType } from '@/features/files/fileAPI';
import { useIsMobile } from '../hooks/useMobile';

interface NodeControlsProps {
  id: NodeId;
  name: string;
  deletable: boolean;
  isLocked: boolean;
  isHidden: boolean;
  onDelete: () => void;
  onToggleLock: () => void;
  onToggleHidden: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onClosePopup?: () => void;
  onCloseDropbox?: () => void;
  actions: any;
  query?: any;
  props?: any;
  isDragging?: boolean;
  setIsDragging?: (isDragging: boolean) => void;
}

// Custom draggable number input component
// Removed - now imported from separate file

export const NodeControls: React.FC<NodeControlsProps> = ({
  id,
  name,
  deletable,
  isLocked,
  isHidden,
  onDelete,
  onToggleLock,
  onToggleHidden,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onClosePopup,
  onCloseDropbox,
  actions,
  query,
  props: nodeProps,
  isDragging: externalIsDragging,
  setIsDragging: externalSetIsDragging
}) => {
  const {
    isSidebarVisible,
    hideSidebar,
    showSidebar,
    showAssetSaveModal,
    showFileSelectModal,
    currentEditingPlatform,
    desktopContent,
    mobileContent
  } = useViewport();
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isMobile = useIsMobile();

  // Check if this element has cross-platform sync enabled
  const syncCrossPlatform = nodeProps?.syncCrossPlatform !== false;
  // Use external dragging state if provided, otherwise use local state
  const isDragging = externalIsDragging ?? false;
  const setIsDragging = externalSetIsDragging ?? (() => { });
  // Check if this is a Container component
  const isContainer = name === 'Container';
  // Check if this is a Popup component
  const isPopup = name === 'Popup';
  // Check if this is a Dropbox component
  const isDropbox = name === 'Dropbox';

  // Check if dragging is available for this component
  const canDrag = !isLocked && name !== 'Popup' && name !== 'Content Wrapper' && name !== 'Sections' && name !== 'AlbumSection';

  const handleMoreOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreOptions(!showMoreOptions);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canDrag || !actions || !query) return;

    // Instead of implementing custom drag logic, we'll trigger the element's existing drag functionality
    // by dispatching a mousedown/touchstart event directly to the element
    const node = query.node(id).get();
    const dom = node.dom;

    if (!dom) return;

    // Get coordinates from mouse or touch event
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Create appropriate synthetic event based on the original event type
    if ('touches' in e) {
      // Create a synthetic touchstart event
      const syntheticEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{
          clientX,
          clientY,
          identifier: 0,
          pageX: clientX,
          pageY: clientY,
          screenX: clientX,
          screenY: clientY,
          target: dom
        } as Touch]
      });
      dom.dispatchEvent(syntheticEvent);
    } else {
      // Create a synthetic mousedown event
      const syntheticEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        button: 0
      });
      dom.dispatchEvent(syntheticEvent);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    if (actions && actions.setProp) {
      actions.setProp(id, (props: any) => {
        props.backgroundType = 'color';
        props.backgroundColor = color;
      });
    }
  };

  const handleBackgroundImageSelect = (imageUrl: string) => {
    if (actions && actions.setProp) {
      actions.setProp(id, (props: any) => {
        props.backgroundType = 'image';
        props.backgroundImage = imageUrl;
        props.backgroundSize = 'cover';
        props.backgroundPosition = 'center center';
        props.backgroundRepeat = 'no-repeat';
        props.backgroundAttachment = 'scroll';
      });
    }
  };

  const handleBorderRadiusChange = (radius: number) => {
    if (actions && actions.setProp) {
      actions.setProp(id, (props: any) => {
        // Special case for full rounding (value 9999)
        if (radius === 9999) {
          props.radius = '50%'; // Set to 50% for full rounding
        } else {
          props.radius = radius;
          // Also update the new borderRadius property if it exists
          if (props.borderRadius) {
            props.borderRadius = [radius, radius, radius, radius];
          }
        }
      });
    }
  };

  // Cross-platform sync function for individual node
  const handleCrossPlatformSync = () => {
    if (!actions || !query) return;

    try {
      // Check if current node has cross-platform sync enabled
      const currentNode = query.node(id).get();
      if (currentNode.data.props?.syncCrossPlatform === false) {
        alert('Phần tử này đã tắt đồng bộ đa nền tảng');
        return;
      }

      // Determine source platform content
      const sourcePlatform = currentEditingPlatform === 'desktop' ? 'mobile' : 'desktop';
      const sourceContent = sourcePlatform === 'desktop' ? desktopContent : mobileContent;

      if (!sourceContent) {
        console.warn(`❌ No ${sourcePlatform} content available for sync`);
        alert(`Không có nội dung ${sourcePlatform === 'desktop' ? 'máy tính' : 'di động'} để đồng bộ`);
        return;
      }

      // Parse source content to find the node
      const sourceNodes = JSON.parse(sourceContent);
      const sourceNode = sourceNodes[id];

      if (!sourceNode || !sourceNode.props) {
        console.warn(`❌ Node ${id} not found in ${sourcePlatform} content`);
        alert(`Không tìm thấy phần tử này trên nền tảng ${sourcePlatform === 'desktop' ? 'máy tính' : 'di động'}`);
        return;
      }

      // Check if source node has cross-platform sync enabled
      if (sourceNode.props?.syncCrossPlatform === false) {
        alert(`Phần tử này đã tắt đồng bộ đa nền tảng trên ${sourcePlatform === 'desktop' ? 'máy tính' : 'di động'}`);
        return;
      }

      // Copy ALL properties from source platform to current platform
      actions.setProp(id, (currentProps: any) => {
        // Clear existing properties first
        Object.keys(currentProps).forEach(key => {
          delete currentProps[key];
        });

        // Copy all properties from source
        Object.keys(sourceNode.props).forEach(key => {
          currentProps[key] = sourceNode.props[key];
        });
      });

      console.log(`✅ Successfully synced node ${id} from ${sourcePlatform} to ${currentEditingPlatform}`);

      // Close the more options menu after successful sync
      setShowMoreOptions(false);

    } catch (error) {
      console.error('❌ Error syncing node across platforms:', error);
      alert('Có lỗi xảy ra khi đồng bộ phần tử');
    }
  };

  // Close dialog when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.more-options-dialog') && !target.closest('.more-options-btn')) {
        setShowMoreOptions(false);
      }
    };

    if (showMoreOptions) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMoreOptions]);

  return (
    <div className={`${(name === 'Sections' || name === 'AlbumSection') ? 'flex flex-col' : 'sm:flex flex-row grid grid-cols-5'} items-center gap-2`}>
      {/* Popup specific controls */}
      {isPopup && onClosePopup && (
        <Btn
          onClick={onClosePopup}
          data-tooltip-id="node-controls"
          data-tooltip-content="Đóng popup"
        >
          <MdClose className='text-xl' />
        </Btn>
      )}

      {/* Dropbox specific controls */}
      {isDropbox && onCloseDropbox && (
        <Btn
          onClick={onCloseDropbox}
          data-tooltip-id="node-controls"
          data-tooltip-content="Đóng dropbox"
        >
          <MdClose className='text-xl' />
        </Btn>
      )}

      {/* Drag handle button - only show for draggable components */}
      {canDrag && (
        <Btn
          className="drag-handle"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          data-tooltip-id="node-controls"
          data-tooltip-content="Kéo để di chuyển"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            backgroundColor: isDragging ? '#e2e8f0' : undefined,
            touchAction: 'none' // Prevent default touch behaviors
          }}
        >
          <RxDragHandleDots2 className='text-xl drag-handle' />
        </Btn>
      )}

      <Btn
        onClick={onBringForward}
        data-tooltip-id="node-controls"
        data-tooltip-content="Đưa lên trước"
      >
        <HiOutlineArrowUpOnSquareStack className='text-xl' />
      </Btn>
      <Btn
        onClick={onSendBackward}
        data-tooltip-id="node-controls"
        data-tooltip-content="Đưa xuống sau"
      >
        <HiOutlineArrowDownOnSquareStack className='text-xl' />
      </Btn>

      {/* Container specific controls */}
      {isContainer && (
        <>
          <Btn
            onClick={() => setShowColorPicker(true)}
            data-tooltip-id="node-controls"
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
            data-tooltip-id="node-controls"
            data-tooltip-content="Ảnh nền"
          >
            <MdImageSearch className='text-xl' />
          </Btn>

          {/* Border radius draggable input */}
          <div className="flex items-center px-1">
            <DraggableNumberInput
              value={typeof nodeProps?.radius === 'number' ? nodeProps.radius : 0}
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

      <Btn
        onClick={onDuplicate}
        data-tooltip-id="node-controls"
        data-tooltip-content="Nhân bản phần tử"
      >
        <BsFiles className='text-xl' />
      </Btn>

      {deletable && (
        <Btn
          onMouseDown={(e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete();
          }}
          data-tooltip-id="node-controls"
          data-tooltip-content="Xóa phần tử"
        >
          <FaTrash className='text-xl' />
        </Btn>
      )}

      <Btn
        onClick={() => isSidebarVisible ? hideSidebar() : showSidebar()}
        data-tooltip-id="node-controls"
        data-tooltip-content={isSidebarVisible ? "Ẩn thanh công cụ" : "Hiện thanh công cụ"}
      >
        <IoSettingsOutline className='text-xl' />
      </Btn>

      <div style={{ position: 'relative' }}>
        <Btn
          className="more-options-btn"
          onClick={handleMoreOptionsClick}
          data-tooltip-id="node-controls"
          data-tooltip-content="Thêm tùy chọn"
        >
          <BsThreeDots className='text-xl' />
        </Btn>

        {showMoreOptions && (
          <div
            className="more-options-dialog"
            style={{
              position: 'absolute',
              top: '100%',
              ...(name == 'Sections' || name == 'AlbumSection') ? { left: 0 } : { right: 0 },
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '8px',
              zIndex: zIndex.nodeControls,
              minWidth: '150px'
            }}
          >
            <div className='flex flex-col gap-2'>
              <button
                onClick={onToggleLock}
                className='flex items-center gap-2 w-full p-2 cursor-pointer'
              >
                {isLocked ? <FaLock /> : <FaUnlockAlt />} {isLocked ? "Khoá phần tử" : "Mở khoá phần tử"}
              </button>
              <button
                onClick={onToggleHidden}
                className='flex items-center gap-2 w-full p-2 cursor-pointer'
              >
                {isHidden ? <FaRegEyeSlash /> : <FaRegEye />} {isHidden ? "Hiện phần tử" : "Ẩn phần tử"}
              </button>
              {/* Cross-platform sync button - only show if other platform has content */}
              {((currentEditingPlatform === 'desktop' && mobileContent) ||
                (currentEditingPlatform === 'mobile' && desktopContent)) && (
                  <button
                    onClick={handleCrossPlatformSync}
                    className='flex items-center gap-2 w-full p-2 cursor-pointer hover:bg-gray-100'
                  >
                    <FaSync className='text-xl' />
                    {currentEditingPlatform === 'desktop' ? 'Đồng bộ từ Mobile' : 'Đồng bộ từ Desktop'}
                  </button>
                )}
              <button
                onClick={onDuplicate}
                className='flex items-center gap-2 w-full p-2 cursor-pointer'
              >
                <FaRegCopy className='text-xl' /> Sao chép phần tử
              </button>
              <button
                onClick={() => showAssetSaveModal(name, id)}
                className='flex items-center gap-2 w-full p-2 cursor-pointer'
              >
                <FaRegSave className='text-xl' /> Lưu mẫu phần tử
              </button>
            </div>
          </div>
        )}
      </div>

      <Tooltip id="node-controls" />

      {/* Color Picker Modal */}
      <ColorPickerModal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorChange={handleBackgroundColorChange}
        initialColor={nodeProps?.backgroundColor || '#ffffff'}
      />


    </div>
  );
};