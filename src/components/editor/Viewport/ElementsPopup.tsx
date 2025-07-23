import { AlbumSection, Container, Calendar as CalendarComponent, HtmlSelector, Icon as IconComponent, Image as ImageComponent, Input as InputComponent, Line as LineComponent, Text as TextComponent, Video as VideoComponent, Popup, Dropbox, Count as CountComponent, Form as FormComponent, WishList as WishListComponent, AlbumModal, QuickActions } from '@/components/selectors';
import { Button as CustomButton } from '@/components/selectors/Button';
import {
  Box,
  Flex,
  Icon,
  Text,
  Tabs,
  Portal,
} from '@chakra-ui/react';
import { zIndex } from '@/utils/zIndex';
import { Element, NodeId, useEditor } from '@craftjs/core';
import { getRandomId } from '@craftjs/utils';
import React, { useEffect, useState } from 'react';
import { BsFillMenuButtonFill } from 'react-icons/bs';
import { FaAudible, FaCalendarAlt, FaClock, FaCode, FaGripLinesVertical, FaImage, FaImages, FaRegSave, FaSquare, FaTrash, FaVideo, FaWpforms, FaLayerGroup, FaHeart, FaPlus } from 'react-icons/fa';
import { FaCube, FaFont, FaMousePointer, FaKeyboard, FaFileAlt, FaPhotoVideo, FaSmile, FaMinus, FaPlay, FaCalendar, FaStopwatch, FaCodepen, FaThLarge, FaGift, FaEllipsisH, FaFolder, FaWindowMaximize, FaBoxOpen } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import { MdInsertEmoticon, MdOutlineTextFormat, MdInput } from 'react-icons/md';
import { RiWindow2Line } from 'react-icons/ri';
import { useViewport } from './ViewportContext';
import { Asset, useGetAssets, useDeleteAsset } from '@/features/assets/assetsAPI';
import { FileSelectModal } from '@/components/editor/components/FileSelectModal';
import { FileType, useGetFiles, File as APIFile } from '@/features/files/fileAPI';
import { domainFile, domain } from '@/api/apiClient';

import lz from 'lzutf8';
import { DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogRoot } from '@/components/ui/dialog';
import { CloseButton } from '@/components/ui/close-button';
import { useIsMobile } from '../hooks/useMobile';

interface ElementItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

const ElementItem: React.FC<ElementItemProps> = ({ icon, label, onClick, active }) => (
  <Box
    p={3}
    cursor="pointer"
    _hover={{ bg: 'blue.50' }}
    bg={active ? 'blue.100' : 'white'}
    borderRadius={'lg'}
    onClick={onClick}
    display="flex"
    alignItems="center"
    justifyContent="flex-start"
    gap={3}
    transition="all 0.2s"
  >
    <Box color={active ? 'blue.600' : 'gray.600'} fontSize="lg">
      {icon}
    </Box>
    <Text fontSize="sm" fontWeight={active ? 'semibold' : 'medium'} color={active ? 'blue.700' : 'gray.700'}>
      {label}
    </Text>
  </Box>
);

// Custom scrollbar styles for webkit browsers
const scrollbarStyles = {
  overflowY: 'auto' as const,
  scrollbarWidth: 'thin' as const,
  scrollbarColor: '#c1c1c1 #f1f1f1',
} as React.CSSProperties;

// Add CSS for webkit scrollbars
const scrollbarCSS = `
.elements-popup-scroll {
  overflow-y: auto !important;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

.elements-popup-scroll::-webkit-scrollbar {
  width: 8px;
}

.elements-popup-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.elements-popup-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.elements-popup-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
`;

export const ElementsPopup: React.FC = () => {
  const { actions, selected, query } = useEditor((state, query) => ({
    selected: state.events.selected,
    nodes: state.nodes, // Subscribe to nodes state to trigger updates
  }));

  // State to force re-render when items are removed
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Inject CSS for scrollbars
  React.useEffect(() => {
    const styleId = 'elements-popup-scrollbar-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = scrollbarCSS;
      document.head.appendChild(style);
    }
  }, []);
  const { isLoading, data: assets } = useGetAssets();
  const deleteAssetMutation = useDeleteAsset();
  const { isElementsPopupOpen, closeAllPopups: toggleElementsPopup, openPopup, currentPopupIdOpen, openDropboxEditor, currentDropboxEditorIdOpen, closeAllModalComponents, showIconPickerModal, desktopContent, mobileContent, currentEditingPlatform } = useViewport();
  const isMobile = useIsMobile();

  // Monitor content changes from ViewportContext to trigger refresh
  React.useEffect(() => {
    // When content changes in viewport context, trigger a refresh
    setRefreshKey(prev => prev + 1);
  }, [desktopContent, mobileContent, currentEditingPlatform]);
  const [activeSection, setActiveSection] = useState<'basic' | 'file' | 'popup' | 'dropbox' | 'album-modal' | 'quickactions'>('basic');
  const [assetSection, setAssetSection] = useState<'container' | 'text' | 'image' | 'button' | 'line' | 'icon' | 'form' | 'input' | 'video' | 'calendar' | 'count' | 'albumsection' | 'html' | 'section' | 'popup' | 'dropbox' | 'wishlist' | 'quickactions' | 'other'>('text');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [fileSection, setFileSection] = useState<FileType>(FileType.IMAGE);
  const [selectedFileTag, setSelectedFileTag] = useState<string>('');
  const [popupSection, setPopupSection] = useState<'page' | 'template'>('page');
  const [dropboxSection, setDropboxSection] = useState<'page' | 'template'>('page');
  const [quickactionsSection, setQuickactionsSection] = useState<'page' | 'template'>('page');
  const [isFileSelectOpen, setIsFileSelectOpen] = useState(false);

  // Get files for the current file section (must be after fileSection state is declared)
  const { data: files, isLoading: isLoadingFiles } = useGetFiles(fileSection);
  useEffect(() => {
    if (isFileSelectOpen) {
      toggleElementsPopup();
    }
  }, [isFileSelectOpen]);

  // Function to handle asset deletion
  const handleDeleteAsset = async (assetId: number, assetName: string) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa mẫu "${assetName}"? Hành động này không thể hoàn tác.`);

    if (confirmed) {
      try {
        await deleteAssetMutation.mutateAsync(assetId);
        // Success message could be added here if needed
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Có lỗi xảy ra khi xóa mẫu. Vui lòng thử lại.');
      }
    }
  };

  // Get existing popup nodes from the editor state
  const getExistingPopups = () => {
    if (!isContentLoaded) return [];
    try {
      const nodeTree = query.node('ROOT').toNodeTree();
      const allNodes = Object.values(nodeTree.nodes);

      // Filter nodes to find Popup components
      const popupNodes = allNodes.filter((node: any) => {
        return node && node.data && (
          node.data.displayName === 'Popup' ||
          node.data.name === 'Popup' ||
          (node.data.custom && node.data.custom.displayName === 'Popup')
        );
      });

      return popupNodes.map((node: any) => ({
        id: node.id,
        displayName: node.data.custom?.displayName || node.data.displayName || 'Popup',
        props: node.data.props || {},
        customId: node.data.custom?.customId
      }));
    } catch (error) {
      console.error('Error getting existing popups:', error);
      return [];
    }
  };

  // Check if editor content has been loaded by checking if there are nodes besides ROOT
  const isContentLoaded = React.useMemo(() => {
    try {
      const nodeTree = query.node('ROOT').toNodeTree();
      const allNodes = Object.values(nodeTree.nodes);
      // Content is loaded if there are nodes other than just ROOT, or if ROOT has child nodes
      const rootNode = allNodes.find((node: any) => node.id === 'ROOT') as any;
      const loaded = allNodes.length > 1 || (rootNode && rootNode.data && rootNode.data.nodes && rootNode.data.nodes.length > 0);

      // Also check if we have platform content available but editor is empty - this indicates loading is in progress
      const hasContentInContext = (currentEditingPlatform === 'desktop' && desktopContent) ||
        (currentEditingPlatform === 'mobile' && mobileContent);
      const editorIsEmpty = allNodes.length <= 1 && (!rootNode || !rootNode.data || !rootNode.data.nodes || rootNode.data.nodes.length === 0);

      // If we have content in context but editor is empty, content is still loading
      const isLoading = hasContentInContext && editorIsEmpty;

      return loaded && !isLoading;
    } catch (error) {
      console.error('ElementsPopup - Error checking content loaded:', error);
      return false;
    }
  }, [query, refreshKey, desktopContent, mobileContent, currentEditingPlatform]);

  // Fallback effect to periodically check for content loading
  React.useEffect(() => {
    if (!isContentLoaded) {
      const interval = setInterval(() => {
        // Force refresh to check content loading status
        setRefreshKey(prev => prev + 1);
      }, 1000); // Check every second

      // Clear interval after 10 seconds to avoid infinite checking
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isContentLoaded]);

  const existingPopups = React.useMemo(() => {
    if (!isContentLoaded) {
      return [];
    }
    const popups = getExistingPopups().filter(popup => popup.id !== currentPopupIdOpen);
    return popups;
  }, [currentPopupIdOpen, refreshKey, query, isContentLoaded]);

  // Get existing dropbox nodes from the editor state
  const getExistingDropboxes = () => {
    if (!isContentLoaded) return [];
    try {
      const nodeTree = query.node('ROOT').toNodeTree();
      const allNodes = Object.values(nodeTree.nodes);

      // Filter nodes to find Dropbox components
      const dropboxNodes = allNodes.filter((node: any) => {
        return node && node.data && (
          node.data.displayName === 'Dropbox' ||
          node.data.name === 'Dropbox' ||
          (node.data.custom && node.data.custom.displayName === 'Dropbox')
        );
      });

      return dropboxNodes.map((node: any) => ({
        id: node.id,
        displayName: node.data.custom?.displayName || node.data.displayName || 'Dropbox',
        props: node.data.props || {},
        customId: node.data.custom?.customId
      }));
    } catch (error) {
      console.error('Error getting existing dropboxes:', error);
      return [];
    }
  };

  const existingDropboxes = React.useMemo(() => {
    if (!isContentLoaded) {
      return [];
    }
    const dropboxes = getExistingDropboxes().filter(dropbox => dropbox.id !== currentDropboxEditorIdOpen);
    return dropboxes;
  }, [currentDropboxEditorIdOpen, refreshKey, query, isContentLoaded]);

  // Get existing album modal nodes from the editor state
  const getExistingAlbumModals = () => {
    if (!isContentLoaded) return [];
    try {
      const nodeTree = query.node('ROOT').toNodeTree();
      const allNodes = Object.values(nodeTree.nodes);

      // Filter nodes to find Album Modal components
      const albumModalNodes = allNodes.filter((node: any) => {
        return node && node.data && (
          node.data.displayName === 'Album Modal' ||
          node.data.name === 'Album Modal' ||
          (node.data.custom && node.data.custom.displayName === 'Album Modal')
        );
      });

      return albumModalNodes.map((node: any) => ({
        id: node.id,
        displayName: node.data.custom?.displayName || node.data.displayName || 'Album Modal',
        props: node.data.props || {},
        customId: node.data.custom?.customId
      }));
    } catch (error) {
      console.error('Error getting existing album modals:', error);
      return [];
    }
  };

  const existingAlbumModals = React.useMemo(() => {
    const albumModals = getExistingAlbumModals().filter(modal => modal.id !== currentPopupIdOpen);
    return albumModals;
  }, [currentPopupIdOpen, refreshKey, query, isContentLoaded]);

  // Get existing QuickActions nodes from the editor state
  const getExistingQuickActions = () => {
    if (!isContentLoaded) return [];
    try {
      const nodeTree = query.node('ROOT').toNodeTree();
      const allNodes = Object.values(nodeTree.nodes);

      // Filter nodes to find QuickActions components
      const quickActionsNodes = allNodes.filter((node: any) => {
        return node && node.data && (
          node.data.displayName === 'QuickActions' ||
          node.data.name === 'QuickActions' ||
          (node.data.custom && node.data.custom.displayName === 'QuickActions')
        );
      });

      return quickActionsNodes.map((node: any) => ({
        id: node.id,
        displayName: node.data.custom?.displayName || node.data.displayName || 'QuickActions',
        props: node.data.props || {},
        customId: node.data.custom?.customId
      }));
    } catch (error) {
      console.error('Error getting existing QuickActions:', error);
      return [];
    }
  };

  const existingQuickActions = React.useMemo(() => {
    const quickActions = getExistingQuickActions();
    return quickActions;
  }, [refreshKey, query, isContentLoaded]);

  // Function to remove a node (popup, dropbox, album modal, or QuickActions)
  const removeNode = (nodeId: string, nodeType: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${nodeType} này không?`)) {
      try {
        // Close the modal if it's currently open
        if (nodeId === currentPopupIdOpen) {
          closeAllModalComponents();
        }
        // Remove the node from the editor
        actions.delete(nodeId);
        // Force re-render to update the lists
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error(`Error removing ${nodeType}:`, error);
        alert(`Có lỗi xảy ra khi xóa ${nodeType}`);
      }
    }
  };

  // Function to get unique tags for a given asset section
  const getTagsForSection = (sectionKey: string): string[] => {
    if (!assets) return [];

    const sectionAssets = assets.filter((asset: Asset) =>
      asset.key === sectionKey &&
      asset.key !== 'popup' &&
      asset.key !== 'dropbox'
    );

    const tags = sectionAssets
      .map((asset: Asset) => asset.tag)
      .filter((tag: string) => tag && tag.trim() !== '') // Filter out empty tags
      .filter((tag: string, index: number, array: string[]) => array.indexOf(tag) === index); // Remove duplicates

    return tags.sort(); // Sort alphabetically
  };

  // Function to handle asset section change and reset tag selection
  const handleAssetSectionChange = (newSection: typeof assetSection) => {
    setAssetSection(newSection);
    setSelectedTag(''); // Reset tag selection when section changes
  };

  // Function to find the section that is most visible in the center of the viewport
  const getViewportCenterSection = (): NodeId | null => {
    try {
      const node = query.node('ROOT').toNodeTree().nodes;
      const sections = Object.values(node).filter((n: any) => n && n.data && n.data.name === 'Sections') as any[];

      if (sections.length === 0) {
        return null;
      }

      // Get editor viewport center point instead of full window
      const editorViewport = document.querySelector('.craftjs-renderer') as HTMLElement;
      let viewportHeight: number;
      let viewportCenterY: number;

      if (editorViewport) {
        const editorRect = editorViewport.getBoundingClientRect();
        viewportHeight = editorRect.height;
        viewportCenterY = editorRect.top + (editorRect.height / 2);
      } else {
        // Fallback to window dimensions if editor viewport not found
        viewportHeight = window.innerHeight;
        viewportCenterY = viewportHeight / 2;
      }

      let bestSection: NodeId | null = null;
      let bestScore = -1;

      // Find the section that has the most area in the center portion of the viewport
      for (const section of sections) {
        const sectionDOM = document.querySelector(`[data-node-id="${section.id}"]`) as HTMLElement;
        if (!sectionDOM) continue;

        const rect = sectionDOM.getBoundingClientRect();

        // Get editor viewport bounds for proper visibility calculation
        let viewportTop = 0;
        let viewportBottom = viewportHeight;

        if (editorViewport) {
          const editorRect = editorViewport.getBoundingClientRect();
          viewportTop = editorRect.top;
          viewportBottom = editorRect.bottom;
        }

        // Skip sections that are completely outside the editor viewport
        if (rect.bottom < viewportTop || rect.top > viewportBottom) {
          continue;
        }

        // Calculate how much of the section is visible in the editor viewport
        const visibleTop = Math.max(viewportTop, rect.top);
        const visibleBottom = Math.min(viewportBottom, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        // Calculate distance from viewport center to section center
        const sectionCenterY = rect.top + (rect.height / 2);
        const distanceFromCenter = Math.abs(sectionCenterY - viewportCenterY);

        // Score based on visible area and proximity to center
        // Higher score for sections that are more visible and closer to center
        const visibilityScore = visibleHeight / rect.height; // 0-1 based on how much is visible
        const centerScore = Math.max(0, 1 - (distanceFromCenter / viewportHeight)); // 0-1 based on distance from center

        // Combined score: prioritize sections that are both visible and centered
        const totalScore = (visibilityScore * 0.6) + (centerScore * 0.4);

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestSection = section.id;
        }
      }

      return bestSection;
    } catch (error) {
      console.error("Error finding viewport center section:", error);
      return null;
    }
  };

  const getTargetNode = (): NodeId => {
    // If a popup is currently open, add new elements to that popup
    if (currentPopupIdOpen) {
      return currentPopupIdOpen;
    }

    // If a dropbox is currently open in editor mode, add new elements to that dropbox
    if (currentDropboxEditorIdOpen) {
      return currentDropboxEditorIdOpen;
    }

    // Try to get the section that's in the center of the viewport
    const viewportCenterSection = getViewportCenterSection();
    if (viewportCenterSection) {
      return viewportCenterSection;
    }

    // Fallback to the original logic if viewport detection fails
    const selectedId = selected.entries().next().value?.[0]
    const node = query.node('ROOT').toNodeTree().nodes;

    // If selection is section, return the selected section ID
    if (selectedId && node[selectedId] && node[selectedId].data.name === 'Sections') {
      return selectedId;
    }

    const sections = Object.values(node).filter((n: any) => n && n.data && n.data.name === 'Sections') as any[];
    const sectionIdContainingSelected = sections.find((section: any) => {
      return section && section.data && section.data.nodes && section.data.nodes.includes(selectedId)
    }) as any;
    if (sectionIdContainingSelected) {
      return sectionIdContainingSelected.id;
    }
    return sections[0]?.id || 'ROOT';
  };
  const getSectionCenterPosition = (sectionId: NodeId) => {
    try {
      const sectionDOM = document.querySelector(`[data-node-id="${sectionId}"]`) as HTMLElement;
      if (!sectionDOM) {
        return { top: 0, left: 0 };
      }

      const sectionRect = sectionDOM.getBoundingClientRect();

      const centerX = sectionRect.width / 2;
      const centerY = window.innerHeight / 2;

      return {
        left: centerX,
        top: centerY
      };
    } catch (error) {
      console.error("Error calculating section center position:", error);
      return { top: 0, left: 0 };
    }
  };

  // Function to position elements in the center of the viewport screen
  const getViewportCenterPosition = (sectionId: NodeId) => {
    try {
      const sectionDOM = document.querySelector(`[data-node-id="${sectionId}"]`) as HTMLElement;
      if (!sectionDOM) {
        return { top: 0, left: 0 };
      }

      // Find the actual editor viewport (craftjs-renderer) instead of using full window
      const editorViewport = document.querySelector('.craftjs-renderer') as HTMLElement;
      if (!editorViewport) {
        // Fallback to window dimensions if editor viewport not found
        console.warn('Editor viewport not found, using window dimensions');
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        const sectionRect = sectionDOM.getBoundingClientRect();

        const relativeLeft = viewportCenterX - sectionRect.left;
        const relativeTop = viewportCenterY;

        return { left: relativeLeft, top: relativeTop };
      }

      // Get the actual editor viewport dimensions and position
      const editorRect = editorViewport.getBoundingClientRect();
      const editorCenterX = editorRect.left + (editorRect.width / 2);
      const editorCenterY = editorRect.top + (editorRect.height / 2);

      const sectionRect = sectionDOM.getBoundingClientRect();

      // Hybrid approach: Use section's horizontal center + simple vertical center
      // Horizontal: Use section-relative center (not viewport coordinates!)
      const sectionRelativeHorizontalCenter = sectionRect.width / 2;

      // Vertical: Use a simple center position within the viewport
      // Use window.innerHeight / 2 for a reasonable center position
      const relativeTop = window.innerHeight / 2;

      // Final positioning: section-relative horizontal center + viewport vertical center
      const constrainedLeft = sectionRelativeHorizontalCenter;
      const constrainedTop = relativeTop;
      return {
        left: constrainedLeft,
        top: constrainedTop
      };
    } catch (error) {
      console.error("Error calculating viewport center position:", error);
      // Fallback to section center if viewport calculation fails
      return getSectionCenterPosition(sectionId);
    }
  };

  const addElement = (element: React.ReactElement) => {
    const targetSectionId = getTargetNode();
    const centerPosition = getViewportCenterPosition(targetSectionId);

    try {
      const tree = query.parseReactElement(element).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];

      if (node.data.props) {
        node.data.props = {
          ...node.data.props,
          left: `${centerPosition.left}px`,
          top: `${centerPosition.top}px`,
        };

      }

      actions.add(node, targetSectionId);

      if (typeof node.id === 'string') {
        actions.selectNode([]);

        setTimeout(() => {
          actions.selectNode(node.id);
          triggerScroll();
        }, 100);
      }
      toggleElementsPopup();
    } catch (error) {
      console.error("Error adding element:", error);
    }
  };

  // Special function for adding Icon elements with automatic icon picker
  const addIconElement = () => {
    const targetSectionId = getTargetNode();
    const centerPosition = getViewportCenterPosition(targetSectionId);

    try {
      const iconElement = (
        <IconComponent
          width='50px'
          height='50px'
        />
      );

      const tree = query.parseReactElement(iconElement).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];

      if (node.data.props) {
        node.data.props = {
          ...node.data.props,
          left: `${centerPosition.left}px`,
          top: `${centerPosition.top}px`,
        };
      }

      actions.add(node, targetSectionId);
      if (typeof node.id === 'string') {
        const iconNodeId = node.id;
        actions.selectNode([]);

        setTimeout(() => {
          actions.selectNode(iconNodeId);
          triggerScroll();

          // Open the icon picker modal after the element is created and selected
          setTimeout(() => {
            showIconPickerModal((svgCode: string) => {
              // Update the newly created icon with the selected SVG
              actions.setProp(iconNodeId, (props: any) => {
                props.svgCode = svgCode;
              });
            });
          }, 200);
        }, 100);
      }
      toggleElementsPopup();
    } catch (error) {
      console.error("Error adding icon element:", error);
    }
  };

  // Mapping of basic elements - determines which ones can have "Thêm phần tử mới" button
  const basicElementsMapping = {
    'container': () => addElement(
      <Element
        id={getRandomId()}
        canvas
        is={Container}
        backgroundType='color'
        backgroundColor='#ffffff'
        color="#000000"
        height="150px"
        width="150px"
      />
    ),
    'text': () => addElement(
      <TextComponent
        text="Heading 3"
        fontSize="20px"
      />
    ),
    'button': () => addElement(
      <CustomButton
        background="#ffffff"
        color="#000000"
        text="Button"
        width="100px"
      />
    ),
    'input': () => addElement(
      <InputComponent
        inputType="text"
        placeholder="Nhập nội dung..."
        dataName="input_field"
        width="200px"
        height="40px"
        options=""
      />
    ),
    'form': () => addElement(
      <Element
        id={getRandomId()}
        canvas
        is={FormComponent}
        width="400px"
        height="auto"
        isWeddingWishForm={true}
        isGuestForm={false}
        formType="wedding-wish"
        apiUrl={`${domain}/guests/wishes`}
      />
    ),
    'image': () => setIsFileSelectOpen(true),
    'albumsection': () => addSectionElement(
      <Element
        id={getRandomId()}
        canvas
        is={AlbumSection}
        height="400px"
        backgroundColor="#ffffff"
      />
    ),
    'icon': addIconElement,
    'line': () => addElement(
      <LineComponent />
    ),
    'video': () => addElement(
      <Element
        id={getRandomId()}
        canvas
        is={VideoComponent}
        backgroundType='color'
        backgroundColor='#ffffff'
        color="#000000"
        height="150px"
        width="150px"
      />
    ),
    'calendar': () => addElement(
      <CalendarComponent
        width="380px"
        height="380px"
        backgroundColor="#ffffff"
        selectedDateMode="today"
        highlightColor="#4ade80"
        highlightType="color"
        highlightSvg=""
        calendarBorderColor="#000000"
        headerTextColor="#000000"
        dateTextColor="#000000"
        selectedDateTextColor="#ffffff"
      />
    ),
    'count': () => addElement(
      <CountComponent
        countType="minutes"
        countMode="countdown"
        minutes={10}
        fontSize="24px"
        fontWeight="bold"
        color="#000000"
      />
    ),
    'html': () => addElement(
      <HtmlSelector
        width="300px"
        height="200px"
        htmlContent='<div style="padding: 20px; text-align: center; border: 2px dashed #ccc; background: #f9f9f9;"><p>Click the HTML button to edit content</p></div>'
      />
    ),
    'wishlist': () => addElement(
      <WishListComponent
        width="400px"
        height="300px"
        maxWishes={10}
        showMockData={false}
      />
    ),
    'quickactions': () => addQuickActionsElement()
  };

  // Check if current asset section has a basic element equivalent
  const hasBasicElement = (sectionKey: string): boolean => {
    return sectionKey in basicElementsMapping;
  };

  const addPopupElement = (element: React.ReactElement) => {
    try {
      // Close all existing modal components before adding new popup
      closeAllModalComponents();

      const tree = query.parseReactElement(element).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];

      // Add popup directly to ROOT without positioning
      actions.add(node, 'ROOT');
      if (typeof node.id === 'string') {
        actions.selectNode([]);

        setTimeout(() => {
          const popupId = node.id;
          openPopup(popupId);
          actions.selectNode(popupId);
        }, 100);
      }
      toggleElementsPopup();
    } catch (error) {
      console.error("Error adding popup element:", error);
    }
  };

  const addDropboxElement = (element: React.ReactElement) => {
    try {
      // Close all existing modal components before adding new dropbox
      closeAllModalComponents();

      const tree = query.parseReactElement(element).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];

      // Add dropbox directly to ROOT without positioning
      actions.add(node, 'ROOT');
      if (typeof node.id === 'string') {
        actions.selectNode([]);

        setTimeout(() => {
          const dropboxId = node.id;
          openDropboxEditor(dropboxId); // Open dropbox in editor mode
          actions.selectNode(dropboxId);
        }, 100);
      }
      toggleElementsPopup();
    } catch (error) {
      console.error("Error adding dropbox element:", error);
    }
  };

  const addSectionElement = (element: React.ReactElement) => {
    try {
      const tree = query.parseReactElement(element).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];

      // Find the currently active/selected section to add below it
      const selectedId = selected.entries().next().value?.[0];
      const nodeTree = query.node('ROOT').toNodeTree().nodes;

      let currentSectionId = null;
      let targetIndex = -1;

      if (selectedId && nodeTree[selectedId] && nodeTree[selectedId].data && nodeTree[selectedId].data.name === 'Sections') {
        // Currently selected node is a section
        currentSectionId = selectedId;
      } else {
        // Find the section containing the selected element
        const sections = Object.values(nodeTree).filter((n: any) => n && n.data && n.data.name === 'Sections') as any[];
        const sectionContainingSelected = sections.find((section: any) => {
          return section && section.data && section.data.nodes && section.data.nodes.includes(selectedId);
        });
        currentSectionId = sectionContainingSelected?.id;
      }

      if (currentSectionId) {
        const rootData = query.node('ROOT').get();
        targetIndex = rootData.data.nodes.indexOf(currentSectionId) + 1;
      }

      // Add the section to ROOT at the target index (below current section)
      if (targetIndex >= 0) {
        actions.add(node, 'ROOT', targetIndex);
      } else {
        actions.add(node, 'ROOT');
      }

      if (typeof node.id === 'string') {
        actions.selectNode([]);

        setTimeout(() => {
          actions.selectNode(node.id);
          triggerScroll();
        }, 100);
      }

      toggleElementsPopup();
    } catch (error) {
      console.error("Error adding section element:", error);
    }
  };

  // Function to add QuickActions (multiple instances allowed)
  const addQuickActionsElement = () => {
    try {

      const quickActionsElement = (
        <QuickActions
          buttonSize={50}
          spacing={10}
          expandDirection="up"
          animationDuration={300}
        />
      );

      const tree = query.parseReactElement(quickActionsElement).toNodeTree();
      const nodeId = Object.keys(tree.nodes)[0];
      const node = tree.nodes[nodeId];

      // Add QuickActions directly to ROOT (it will position itself fixed)
      actions.add(node, 'ROOT');

      if (typeof node.id === 'string') {
        actions.selectNode([]);

        setTimeout(() => {
          actions.selectNode(node.id);
          triggerScroll();
        }, 100);
      }

      toggleElementsPopup();

      // Trigger refresh to update the QuickActions list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error adding QuickActions element:", error);
    }
  };

  // Helper function to scroll to element using Y position calculation
  const scrollToElement = (
    element: HTMLElement,
    options: {
      behavior?: 'smooth' | 'auto',
      offset?: number,
      block?: 'start' | 'center' | 'end'
    } = {}
  ) => {
    try {
      const { behavior = 'smooth', offset = 0, block = 'center' } = options;

      // Get the element's position relative to the document
      const elementRect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate target Y position based on block positioning
      let targetY: number;

      switch (block) {
        case 'start':
          targetY = elementRect.top + scrollTop + offset;
          break;
        case 'end':
          targetY = elementRect.bottom + scrollTop - window.innerHeight + offset;
          break;
        case 'center':
        default:
          targetY = elementRect.top + scrollTop - (window.innerHeight / 2) + (elementRect.height / 2) + offset;
          break;
      }

      // Scroll to the calculated position
      window.scrollTo({
        top: targetY,
        behavior: behavior
      });
    } catch (error) {
      console.error('Error scrolling to element:', error);
      // Fallback to scrollIntoView if our method fails
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const triggerScroll = () => {
    setTimeout(() => {
      const nodeDOM = document.querySelector(`.component-selected`);
      if (nodeDOM) {
        // Use our custom scroll method with Y position calculation
        scrollToElement(nodeDOM as HTMLElement, {
          behavior: 'smooth',
          block: 'center',
          offset: 0
        });
      }
    }, 300);
  }

  // Function to calculate optimal image dimensions
  const calculateImageDimensions = (naturalWidth: number, naturalHeight: number) => {
    const maxWidth = 400;
    const maxHeight = 300;

    // If image is smaller than max constraints, use natural size
    if (naturalWidth <= maxWidth && naturalHeight <= maxHeight) {
      return {
        width: `${naturalWidth}px`,
        height: `${naturalHeight}px`
      };
    }

    // Calculate aspect ratio
    const aspectRatio = naturalWidth / naturalHeight;

    // Determine which dimension to constrain
    let finalWidth = naturalWidth;
    let finalHeight = naturalHeight;

    if (naturalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = finalWidth / aspectRatio;
    }

    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = finalHeight * aspectRatio;
    }

    return {
      width: `${Math.round(finalWidth)}px`,
      height: `${Math.round(finalHeight)}px`
    };
  };

  // Function to handle file selection and create Image component
  const handleFileSelect = (filePath: string) => {
    // Close the file select modal immediately
    setIsFileSelectOpen(false);

    // Create a temporary image to get natural dimensions
    const img = new Image();

    img.onload = () => {
      try {
        const dimensions = calculateImageDimensions(img.naturalWidth, img.naturalHeight);

        // Create Image component with calculated dimensions
        addElement(
          <ImageComponent
            url={filePath}
            width={dimensions.width}
            height={dimensions.height}
            lockAspectRatio={true}
            objectFit="cover"
          />
        );
      } catch (error) {
        console.error('Error creating image component:', error);
        // Fallback to default dimensions
        addElement(
          <ImageComponent
            url={filePath}
            width="200px"
            height="150px"
            lockAspectRatio={true}
            objectFit="cover"
          />
        );
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image for dimension calculation:', filePath);
      // If image fails to load, use default dimensions
      addElement(
        <ImageComponent
          url={filePath}
          width="200px"
          height="150px"
          lockAspectRatio={true}
          objectFit="cover"
        />
      );
    };

    // Set a timeout to handle cases where the image takes too long to load
    const timeout = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      console.warn('Image loading timeout, using default dimensions');
      addElement(
        <ImageComponent
          url={filePath}
          width="200px"
          height="150px"
          lockAspectRatio={true}
          objectFit="cover"
        />
      );
    }, 5000); // 5 second timeout

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const dimensions = calculateImageDimensions(img.naturalWidth, img.naturalHeight);

        // Create Image component with calculated dimensions
        addElement(
          <ImageComponent
            url={filePath}
            width={dimensions.width}
            height={dimensions.height}
            lockAspectRatio={true}
            objectFit="cover"
          />
        );
      } catch (error) {
        console.error('Error creating image component:', error);
        // Fallback to default dimensions
        addElement(
          <ImageComponent
            url={filePath}
            width="200px"
            height="150px"
            lockAspectRatio={true}
            objectFit="cover"
          />
        );
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('Failed to load image for dimension calculation:', filePath);
      // If image fails to load, use default dimensions
      addElement(
        <ImageComponent
          url={filePath}
          width="200px"
          height="150px"
          lockAspectRatio={true}
          objectFit="cover"
        />
      );
    };

    img.src = filePath;
  };

  const renderContent = (isMobile: boolean = false) => (
    <>
      {isElementsPopupOpen && (
        <Box
          className={`${isMobile ? 'relative' : 'absolute'} absolute top-0 left-0 w-full sm:w-[860px] h-full bg-white flex flex-col gap-2 border-r border-[#E0E0E0] shadow-md`}
          style={{ zIndex: zIndex.elementsPopup }}
        >
          <Tabs.Root value={activeSection} onValueChange={(e) => setActiveSection(e.value as 'basic' | 'file' | 'popup' | 'dropbox' | 'album-modal' | 'quickactions')} variant="line" className="h-full flex flex-col">
            <Flex className="border-b border-gray-200 px-2" alignItems="center" justifyContent="space-between">
              <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
                <Tabs.List className="flex-nowrap min-w-max">
                  <Tabs.Trigger value="basic" className="!text-sm flex items-center gap-2 whitespace-nowrap">
                    <div className='hidden sm:block'>
                      <FaThLarge style={{ color: '#3B82F6' }} />
                    </div>
                    Cơ bản
                  </Tabs.Trigger>
                  <Tabs.Trigger value="file" className="!text-sm flex items-center gap-2 whitespace-nowrap">
                    <div className='hidden sm:block'>
                      <FaFolder style={{ color: '#10B981' }} />
                    </div>
                    File
                  </Tabs.Trigger>
                  <Tabs.Trigger value="popup" className="!text-sm flex items-center gap-2 whitespace-nowrap">
                    <div className='hidden sm:block'>
                      <FaWindowMaximize style={{ color: '#8B5CF6' }} />
                    </div>
                    Popup
                  </Tabs.Trigger>
                  <Tabs.Trigger value="dropbox" className="!text-sm flex items-center gap-2 whitespace-nowrap">
                    <div className='hidden sm:block'>
                      <FaBoxOpen style={{ color: '#F59E0B' }} />
                    </div>
                    Dropbox
                  </Tabs.Trigger>
                  <Tabs.Trigger value="album-modal" className="!text-sm flex items-center gap-2 whitespace-nowrap">
                    <div className='hidden sm:block'>
                      <FaPhotoVideo style={{ color: '#EF4444' }} />
                    </div>
                    Album Modal
                  </Tabs.Trigger>
                  <Tabs.Trigger value="quickactions" className="!text-sm flex items-center gap-2 whitespace-nowrap">
                    <div className='hidden sm:block'>
                      <FaPlus style={{ color: '#06B6D4' }} />
                    </div>
                    QuickActions
                  </Tabs.Trigger>
                </Tabs.List>
              </div>
              <Icon
                as={IoMdClose}
                cursor="pointer"
                color="gray.500"
                _hover={{ color: 'gray.700' }}
                onClick={toggleElementsPopup}
                fontSize="lg"
                mr={2}
              />
            </Flex>

            {/* Basic Elements Tab */}
            <Tabs.Content value="basic" className="flex-1 overflow-hidden">
              <Flex direction={'row'} h='full'>
                <Flex direction={'column'} gap={2} className='w-[40%] sm:w-[20%] border-r border-[#E0E0E0] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <ElementItem
                    icon={<FaCube />}
                    label="Khối/ Hộp"
                    onClick={() => handleAssetSectionChange('container')}
                    active={assetSection === 'container'}
                  />
                  <ElementItem
                    icon={<FaFont />}
                    label="Văn bản"
                    onClick={() => handleAssetSectionChange('text')}
                    active={assetSection === 'text'}
                  />
                  <ElementItem
                    icon={<FaMousePointer />}
                    label="Nút bấm"
                    onClick={() => handleAssetSectionChange('button')}
                    active={assetSection === 'button'}
                  />
                  <ElementItem
                    icon={<FaKeyboard />}
                    label="Input"
                    onClick={() => handleAssetSectionChange('input')}
                    active={assetSection === 'input'}
                  />
                  <ElementItem
                    icon={<FaFileAlt />}
                    label="Form"
                    onClick={() => handleAssetSectionChange('form')}
                    active={assetSection === 'form'}
                  />
                  <ElementItem
                    icon={<FaImage />}
                    label="Hình ảnh"
                    onClick={() => handleAssetSectionChange('image')}
                    active={assetSection === 'image'}
                  />
                  <ElementItem
                    icon={<FaPhotoVideo />}
                    label="Album ảnh"
                    onClick={() => handleAssetSectionChange('albumsection')}
                    active={assetSection === 'albumsection'}
                  />
                  <ElementItem
                    icon={<FaSmile />}
                    label="Biểu tượng"
                    onClick={() => handleAssetSectionChange('icon')}
                    active={assetSection === 'icon'}
                  />
                  <ElementItem
                    icon={<FaMinus />}
                    label="Đường kẻ"
                    onClick={() => handleAssetSectionChange('line')}
                    active={assetSection === 'line'}
                  />
                  <ElementItem
                    icon={<FaPlay />}
                    label="Video"
                    onClick={() => handleAssetSectionChange('video')}
                    active={assetSection === 'video'}
                  />
                  <ElementItem
                    icon={<FaCalendar />}
                    label="Lịch"
                    onClick={() => handleAssetSectionChange('calendar')}
                    active={assetSection === 'calendar'}
                  />
                  <ElementItem
                    icon={<FaStopwatch />}
                    label="Đếm ngược"
                    onClick={() => handleAssetSectionChange('count')}
                    active={assetSection === 'count'}
                  />
                  <ElementItem
                    icon={<FaCodepen />}
                    label="HTML"
                    onClick={() => handleAssetSectionChange('html')}
                    active={assetSection === 'html'}
                  />
                  <ElementItem
                    icon={<FaThLarge />}
                    label="Section"
                    onClick={() => handleAssetSectionChange('section')}
                    active={assetSection === 'section'}
                  />
                  <ElementItem
                    icon={<FaGift />}
                    label="Lời chúc"
                    onClick={() => handleAssetSectionChange('wishlist')}
                    active={assetSection === 'wishlist'}
                  />
                  <ElementItem
                    icon={<FaEllipsisH />}
                    label="Khác"
                    onClick={() => handleAssetSectionChange('other')}
                    active={assetSection === 'other'}
                  />
                </Flex>
                <Flex direction={'column'} gap={2} className='w-[60%] sm:w-[80%] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  {isLoading && <Text>Loading ...</Text>}
                  {!isLoading && assets && (
                    <>
                      {/* Show "Thêm phần tử mới" button if current section has basic element */}
                      {hasBasicElement(assetSection) && (
                        <Box mb={4}>
                          <Box
                            as="button"
                            px={4}
                            py={3}
                            bg="blue.500"
                            color="white"
                            borderRadius="lg"
                            cursor="pointer"
                            fontWeight={'semibold'}
                            fontSize="sm"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            gap={2}
                            _hover={{ bg: 'blue.600', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                            transition="all 0.2s"
                            width="100%"
                            border="none"
                            onClick={() => {
                              const elementHandler = basicElementsMapping[assetSection as keyof typeof basicElementsMapping];
                              if (elementHandler) {
                                elementHandler();
                              }
                            }}
                          >
                            <FaPlus fontSize="12px" />
                            Thêm mới
                          </Box>
                        </Box>
                      )}

                      {/* Tags filter */}
                      {(() => {
                        const tagsForSection = getTagsForSection(assetSection);
                        if (tagsForSection.length > 0) {
                          return (
                            <Box mb={4}>
                              <Text fontSize="sm" fontWeight="medium" mb={2}>Chọn nhóm:</Text>
                              <Flex wrap="wrap" gap={2}>
                                <Box
                                  px={3}
                                  py={1}
                                  bg={selectedTag === '' ? 'blue.500' : 'gray.100'}
                                  color={selectedTag === '' ? 'white' : 'gray.700'}
                                  borderRadius="md"
                                  cursor="pointer"
                                  fontSize="sm"
                                  _hover={{ bg: selectedTag === '' ? 'blue.600' : 'gray.200' }}
                                  onClick={() => setSelectedTag('')}
                                >
                                  Tất cả ({assets.filter((asset: Asset) => asset.key === assetSection && asset.key !== 'popup' && asset.key !== 'dropbox').length})
                                </Box>
                                {tagsForSection.map((tag: string) => (
                                  <Box
                                    key={tag}
                                    px={3}
                                    py={1}
                                    bg={selectedTag === tag ? 'blue.500' : 'gray.100'}
                                    color={selectedTag === tag ? 'white' : 'gray.700'}
                                    borderRadius="md"
                                    cursor="pointer"
                                    fontSize="sm"
                                    _hover={{ bg: selectedTag === tag ? 'blue.600' : 'gray.200' }}
                                    onClick={() => setSelectedTag(tag)}
                                  >
                                    {tag} ({assets.filter((asset: Asset) => asset.key === assetSection && asset.tag === tag).length})
                                  </Box>
                                ))}
                              </Flex>
                            </Box>
                          );
                        }
                        return null;
                      })()}

                      {/* Assets display area */}
                      <Box>
                        {(() => {
                          const filteredAssets = assets.filter((asset: Asset) => {
                            const matchesSection = asset.key === assetSection && asset.key !== 'popup' && asset.key !== 'dropbox';
                            const matchesTag = selectedTag === '' || asset.tag === selectedTag;
                            return matchesSection && matchesTag;
                          });

                          if (filteredAssets.length === 0) {
                            return (
                              <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
                                {selectedTag === '' ? 'Không có mẫu nào trong danh mục này' : `Không có mẫu nào trong nhóm "${selectedTag}"`}
                              </Text>
                            );
                          }

                          return filteredAssets.map((asset: Asset, index: number) => (
                            <Box
                              key={asset.id}
                              p={2}
                              cursor="pointer"
                              _hover={{ bg: 'gray.50' }}
                              border="1px solid #e0e0e0"
                              borderRadius="md"
                              mb={2}
                              onClick={() => {
                                if (asset.content) {
                                  try {
                                    const json = lz.decompress(lz.decodeBase64(asset.content));
                                    const parsedContent = JSON.parse(json);

                                    // Safety check for parsedContent
                                    if (!parsedContent) {
                                      throw new Error('Parsed content is null or undefined');
                                    }

                                    delete parsedContent.parent;

                                    let newNode;

                                    // Check if this is a section or albumsection asset
                                    if (asset.key === 'section' || asset.key === 'albumsection') {
                                      // Handle section and albumsection assets - add to ROOT
                                      try {
                                        // Parse the serialized section node
                                        const nodeCopy = query.parseSerializedNode(parsedContent).toNode();
                                        newNode = query.parseFreshNode({ data: nodeCopy.data }).toNode();

                                        // Add section to ROOT
                                        actions.add(newNode, 'ROOT');

                                      } catch (sectionError) {
                                        console.error("Error loading section asset:", sectionError);
                                        alert('Không thể tải mẫu section. Vui lòng thử lại.');
                                        return;
                                      }
                                    } else {
                                      // Handle regular (non-section) assets
                                      const targetNodeId = getTargetNode();
                                      const centerPosition = getViewportCenterPosition(targetNodeId);

                                      try {
                                        // Parse the serialized node first
                                        const nodeCopy = query.parseSerializedNode(parsedContent).toNode();

                                        // Create new node data with updated positioning
                                        const newNodeData = {
                                          ...nodeCopy.data,
                                          props: {
                                            ...nodeCopy.data.props,
                                            left: `${centerPosition.left}px`,
                                            top: `${centerPosition.top}px`,
                                          }
                                        };

                                        // Create a fresh node from the modified data
                                        newNode = query.parseFreshNode({ data: newNodeData }).toNode();

                                        actions.add(newNode, targetNodeId);

                                      } catch (regularError) {
                                        console.error("Error loading regular asset:", regularError);
                                        alert('Không thể tải mẫu phần tử. Vui lòng thử lại.');
                                        return;
                                      }
                                    }

                                    // Select the newly added node
                                    if (newNode && newNode.id) {
                                      actions.selectNode([]);
                                      setTimeout(() => {
                                        actions.selectNode(newNode.id);
                                        triggerScroll();
                                      }, 100);
                                    }

                                    // Close the popup
                                    toggleElementsPopup();
                                  } catch (e) {
                                    console.error("Error processing asset data:", e);
                                    alert('Không thể tải mẫu phần tử. Vui lòng thử lại.');
                                  }
                                }
                              }}
                            >
                              <Flex direction="row" gap={2} alignItems="center">
                                <img
                                  src={asset.previewUrl}
                                  alt={asset.key + index}
                                  style={{ width: '60px', height: '35px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <Box flex="1">
                                  <Text fontSize="sm" fontWeight="medium">
                                    {asset.tag || 'Không có tên'}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {asset.key}
                                  </Text>
                                </Box>
                                <Box
                                  p={1}
                                  cursor="pointer"
                                  _hover={{ bg: 'red.100', color: 'red.600' }}
                                  borderRadius="md"
                                  color="gray.400"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation(); // Prevent triggering the asset click
                                    if (asset.id) {
                                      handleDeleteAsset(asset.id, asset.tag || 'Không có tên');
                                    }
                                  }}
                                  title="Xóa mẫu"
                                >
                                  <Icon as={FaTrash} boxSize={3} />
                                </Box>
                              </Flex>
                            </Box>
                          ));
                        })()}
                      </Box>
                    </>
                  )}
                </Flex>
              </Flex>
            </Tabs.Content>

            {/* File Tab */}
            {/* File Tab */}
            <Tabs.Content value="file" className="flex-1 overflow-hidden">
              <Flex direction={'row'} h='full'>
                <Flex direction={'column'} gap={2} className='w-[40%] sm:w-[20%] order-first border-r border-[#E0E0E0] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <ElementItem
                    icon={<FaImage />}
                    label="Hình ảnh"
                    onClick={() => setFileSection(FileType.IMAGE)}
                    active={fileSection === FileType.IMAGE}
                  />
                  <ElementItem
                    icon={<FaPlay />}
                    label="Video"
                    onClick={() => setFileSection(FileType.VIDEO)}
                    active={fileSection === FileType.VIDEO}
                  />
                  <ElementItem
                    icon={<FaAudible />}
                    label="Âm thanh"
                    onClick={() => setFileSection(FileType.AUDIO)}
                    active={fileSection === FileType.AUDIO}
                  />
                  <ElementItem
                    icon={<FaFileAlt />}
                    label="Tài liệu"
                    onClick={() => setFileSection(FileType.DOCUMENT)}
                    active={fileSection === FileType.DOCUMENT}
                  />
                  <ElementItem
                    icon={<FaFont />}
                    label="Font"
                    onClick={() => setFileSection(FileType.FONT)}
                    active={fileSection === FileType.FONT}
                  />
                </Flex>
                <Flex direction={'column'} gap={2} className='w-[60%] sm:w-[80%] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  {(() => {
                    if (isLoadingFiles) {
                      return <Text>Đang tải file...</Text>;
                    }

                    if (!files || files.length === 0) {
                      return (
                        <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
                          Không có file nào trong danh mục này
                        </Text>
                      );
                    }

                    // Get unique tags for the current file type
                    const tagsForFileType = files
                      .map((file: APIFile) => file.tag)
                      .filter((tag: string) => tag && tag.trim() !== '')
                      .filter((tag: string, index: number, array: string[]) => array.indexOf(tag) === index)
                      .sort();

                    return (
                      <Flex direction="column" gap={4}>
                        {/* Tag selection area */}
                        {tagsForFileType.length > 0 && (
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                              Chọn nhóm:
                            </Text>
                            <Flex direction="row" gap={2} flexWrap="wrap">
                              <Box
                                px={3}
                                py={1}
                                bg={selectedFileTag === '' ? 'blue.500' : 'gray.100'}
                                color={selectedFileTag === '' ? 'white' : 'gray.700'}
                                borderRadius="md"
                                cursor="pointer"
                                fontSize="sm"
                                _hover={{ bg: selectedFileTag === '' ? 'blue.600' : 'gray.200' }}
                                onClick={() => setSelectedFileTag('')}
                              >
                                Tất cả ({files.length})
                              </Box>
                              {tagsForFileType.map((tag: string) => (
                                <Box
                                  key={tag}
                                  px={3}
                                  py={1}
                                  bg={selectedFileTag === tag ? 'blue.500' : 'gray.100'}
                                  color={selectedFileTag === tag ? 'white' : 'gray.700'}
                                  borderRadius="md"
                                  cursor="pointer"
                                  fontSize="sm"
                                  _hover={{ bg: selectedFileTag === tag ? 'blue.600' : 'gray.200' }}
                                  onClick={() => setSelectedFileTag(tag)}
                                >
                                  {tag} ({files.filter((file: APIFile) => file.tag === tag).length})
                                </Box>
                              ))}
                            </Flex>
                          </Box>
                        )}

                        {/* Files display area */}
                        <Box>
                          {(() => {
                            const filteredFiles = files.filter((file: APIFile) => {
                              const matchesTag = selectedFileTag === '' || file.tag === selectedFileTag;
                              return matchesTag;
                            });

                            if (filteredFiles.length === 0) {
                              return (
                                <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
                                  {selectedFileTag === '' ? 'Không có file nào trong danh mục này' : `Không có file nào trong nhóm "${selectedFileTag}"`}
                                </Text>
                              );
                            }

                            return (
                              <div className="grid grid-cols-3 gap-2">
                                {filteredFiles.map((file: APIFile) => {
                                  const filePath = `${domainFile}${file.filePath}`;

                                  return (
                                    <Box
                                      key={file.id}
                                      p={2}
                                      cursor="pointer"
                                      _hover={{ bg: 'gray.50' }}
                                      border="1px solid #e0e0e0"
                                      borderRadius="md"
                                      onClick={() => {
                                        if (fileSection === FileType.IMAGE) {
                                          handleFileSelect(filePath);
                                        } else {
                                          // For non-image files, you might want to handle differently
                                          // For now, just copy the path to clipboard or show a message
                                          navigator.clipboard.writeText(filePath);
                                          alert('Đường dẫn file đã được sao chép vào clipboard');
                                        }
                                        toggleElementsPopup();
                                      }}
                                      className="aspect-square flex flex-col"
                                    >
                                      <div className="flex-1 flex items-center justify-center overflow-hidden rounded">
                                        {file.mimeType.startsWith('image/') ? (
                                          <img
                                            src={filePath}
                                            alt={file.originalName}
                                            className="object-cover w-full h-full"
                                          />
                                        ) : (
                                          <div className="text-4xl text-gray-400">
                                            {file.mimeType.startsWith('video/') && <FaVideo />}
                                            {file.mimeType.startsWith('audio/') && <FaAudible />}
                                            {(file.mimeType.includes('document') || file.mimeType.includes('pdf')) && <FaCode />}
                                            {file.mimeType.includes('font') && <MdOutlineTextFormat />}
                                          </div>
                                        )}
                                      </div>
                                      <Box mt={1}>
                                        <Text fontSize="xs" fontWeight="medium" className="truncate">
                                          {file.originalName}
                                        </Text>
                                        {file.tag && (
                                          <Text fontSize="xs" color="blue.500" className="truncate">
                                            #{file.tag}
                                          </Text>
                                        )}
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </Box>
                      </Flex>
                    );
                  })()}
                </Flex>
              </Flex>
            </Tabs.Content>

            {/* Popup Tab */}
            <Tabs.Content value="popup" className="flex-1 overflow-hidden">
              <Flex direction={'row'} h='full'>
                <Flex direction={'column'} gap={2} className='w-[40%] sm:w-[20%] border-r border-[#E0E0E0] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <ElementItem
                    icon={<RiWindow2Line />}
                    label="Tạo mới"
                    onClick={() => {
                      // Close all existing modal components before adding new popup
                      closeAllModalComponents();
                      addPopupElement(
                        <Element
                          id={getRandomId()}
                          canvas
                          is={Popup}
                          width="400px"
                          height="300px"
                          backgroundColor="#ffffff"
                        />
                      );
                    }}
                  />

                </Flex>
                <Flex direction={'column'} gap={2} className='w-[60%] sm:w-[80%] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <Tabs.Root value={popupSection} onValueChange={(e) => setPopupSection(e.value as 'page' | 'template')} variant="line">
                    <Tabs.List>
                      <Tabs.Trigger value="page" className="!text-xs">
                        Popup trong trang
                      </Tabs.Trigger>
                      <Tabs.Trigger value="template" className="!text-xs">
                        Mẫu
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="page" className="p-2">
                      {!isContentLoaded ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="200px" gap={2}>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Đang tải nội dung...
                          </Text>
                          <Text fontSize="xs" color="gray.400" textAlign="center">
                            Vui lòng đợi trong giây lát
                          </Text>
                        </Box>
                      ) : existingPopups.length > 0 ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {existingPopups.map((popup) => (
                            <Box
                              key={popup.id}
                              p={2}
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              bg="white"
                              border="1px solid #e0e0e0"
                              borderRadius="md"
                              onClick={() => {
                                // Close all existing modal components before opening popup
                                closeAllModalComponents();
                                openPopup(popup.id);
                                actions.selectNode(popup.id);
                                toggleElementsPopup();
                              }}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Box>
                                <Text fontSize="lg" fontWeight="medium">
                                  {popup.customId || popup.id}
                                </Text>
                              </Box>
                              <Flex alignItems="center" gap={2}>
                                <Icon as={RiWindow2Line} color="gray.400" />
                                <Box
                                  cursor="pointer"
                                  _hover={{ color: "red.600" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNode(popup.id, 'Popup');
                                  }}
                                  title="Xóa Popup"
                                >
                                  <Icon as={FaTrash} color="red.400" />
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Chưa có popup nào. Tạo popup mới để bắt đầu.
                        </Text>
                      )}
                    </Tabs.Content>
                    <Tabs.Content value="template" className="p-2">
                      {!isLoading && assets ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {/* Empty popup template */}
                          <Box
                            p={2}
                            cursor="pointer"
                            _hover={{ bg: 'gray.100' }}
                            bg="white"
                            border="1px solid #e0e0e0"
                            borderRadius="md"
                            onClick={() => {
                              // Close all existing modal components before adding new popup
                              closeAllModalComponents();
                              addPopupElement(
                                <Element
                                  id={getRandomId()}
                                  canvas
                                  is={Popup}
                                  width="400px"
                                  height="300px"
                                  backgroundColor="#ffffff"
                                />
                              );
                            }}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                Popup trống
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Tạo popup mới với nội dung trống
                              </Text>
                            </Box>
                            <Icon as={RiWindow2Line} color="gray.400" />
                          </Box>

                          {/* Popup assets from database */}
                          {assets
                            .filter((asset: Asset) => asset.key === 'popup')
                            .map((asset: Asset, index: number) => (
                              <Box
                                key={asset.id}
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.100' }}
                                bg="white"
                                border="1px solid #e0e0e0"
                                borderRadius="md"
                                onClick={() => {
                                  if (asset.content) {
                                    try {
                                      // Close all existing modal components before adding popup template
                                      closeAllModalComponents();

                                      const json = lz.decompress(lz.decodeBase64(asset.content));
                                      const parsedContent = JSON.parse(json);
                                      delete parsedContent.parent;

                                      // Parse the serialized node first
                                      const nodeCopy = query.parseSerializedNode(parsedContent).toNode();

                                      // Create a fresh node from the parsed data (popups don't need positioning changes)
                                      const newNode = query.parseFreshNode({ data: nodeCopy.data }).toNode();

                                      // Add popup directly to ROOT without positioning (popups don't need positioning)
                                      actions.add(newNode, 'ROOT');

                                      // Select the newly added popup and open it
                                      actions.selectNode([]);
                                      setTimeout(() => {
                                        actions.selectNode(newNode.id);
                                        openPopup(newNode.id); // Open the popup for editing
                                        triggerScroll();
                                      }, 100);

                                      // Close the popup
                                      toggleElementsPopup();
                                    } catch (e) {
                                      console.error("Error processing popup asset data:", e);
                                    }
                                  }
                                }}
                                display="flex"
                                flexDirection="column"
                                gap={2}
                              >
                                <img
                                  src={asset.previewUrl}
                                  alt={`popup-template-${index}`}
                                  style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
                                />
                                <Flex direction="row" alignItems="center" justifyContent="space-between">
                                  <Box flex="1">
                                    <Text fontSize="sm" fontWeight="medium">
                                      {asset.tag || `Popup mẫu ${index + 1}`}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      Nhấn để thêm popup mẫu
                                    </Text>
                                  </Box>
                                  <Box
                                    p={1}
                                    cursor="pointer"
                                    _hover={{ bg: 'red.100', color: 'red.600' }}
                                    borderRadius="md"
                                    color="gray.400"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the asset click
                                      if (asset.id) {
                                        handleDeleteAsset(asset.id, asset.tag || `Popup mẫu ${index + 1}`);
                                      }
                                    }}
                                    title="Xóa mẫu popup"
                                  >
                                    <Icon as={FaTrash} boxSize={3} />
                                  </Box>
                                </Flex>
                              </Box>
                            ))
                          }
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Đang tải popup mẫu...
                        </Text>
                      )}
                    </Tabs.Content>
                  </Tabs.Root>
                </Flex>
              </Flex>
            </Tabs.Content>
            {/* Dropbox Tab */}
            <Tabs.Content value="dropbox" className="flex-1 overflow-hidden">
              <Flex direction={'row'} h='full'>
                <Flex direction={'column'} gap={2} className='w-[40%] sm:w-[20%] border-r border-[#E0E0E0] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <ElementItem
                    icon={<RiWindow2Line />}
                    label="Tạo mới"
                    onClick={() => {
                      // Close all existing modal components before adding new dropbox
                      closeAllModalComponents();
                      addDropboxElement(
                        <Element
                          id={getRandomId()}
                          canvas
                          is={Dropbox}
                          width="200px"
                          height="150px"
                          backgroundColor="#ffffff"
                        />
                      );
                    }}
                  />
                </Flex>
                <Flex direction={'column'} gap={2} className='w-[60%] sm:w-[80%] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <Tabs.Root value={dropboxSection} onValueChange={(e) => setDropboxSection(e.value as 'page' | 'template')} variant="line">
                    <Tabs.List>
                      <Tabs.Trigger value="page" className="!text-xs">
                        Dropbox trong trang
                      </Tabs.Trigger>
                      <Tabs.Trigger value="template" className="!text-xs">
                        Mẫu
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="page" className="p-2">
                      {!isContentLoaded ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="200px" gap={2}>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Đang tải nội dung...
                          </Text>
                          <Text fontSize="xs" color="gray.400" textAlign="center">
                            Vui lòng đợi trong giây lát
                          </Text>
                        </Box>
                      ) : existingDropboxes.length > 0 ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {existingDropboxes.map((dropbox) => (
                            <Box
                              key={dropbox.id}
                              p={2}
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              bg="white"
                              border="1px solid #e0e0e0"
                              borderRadius="md"
                              onClick={() => {
                                // Close all existing modal components before opening dropbox editor
                                closeAllModalComponents();
                                openDropboxEditor(dropbox.id);
                                actions.selectNode(dropbox.id);
                                toggleElementsPopup();
                              }}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">
                                  {dropbox.displayName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  ID: {dropbox.id.substring(0, 8)}...
                                </Text>
                              </Box>
                              <Flex alignItems="center" gap={2}>
                                <Icon as={RiWindow2Line} color="gray.400" />
                                <Box
                                  cursor="pointer"
                                  _hover={{ color: "red.600" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNode(dropbox.id, 'Dropbox');
                                  }}
                                  title="Xóa Dropbox"
                                >
                                  <Icon as={FaTrash} color="red.400" />
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Chưa có dropbox nào. Tạo dropbox mới để bắt đầu.
                        </Text>
                      )}
                      <Box mt={4}>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          Dropbox hoạt động như tooltip xuất hiện khi có sự kiện kích hoạt
                        </Text>
                      </Box>
                    </Tabs.Content>
                    <Tabs.Content value="template" className="p-2">
                      {!isLoading && assets ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {/* Empty dropbox template */}
                          <Box
                            p={2}
                            cursor="pointer"
                            _hover={{ bg: 'gray.100' }}
                            bg="white"
                            border="1px solid #e0e0e0"
                            borderRadius="md"
                            onClick={() => {
                              // Close all existing modal components before adding new dropbox
                              closeAllModalComponents();
                              addDropboxElement(
                                <Element
                                  id={getRandomId()}
                                  canvas
                                  is={Dropbox}
                                  width="200px"
                                  height="150px"
                                  backgroundColor="#ffffff"
                                />
                              );
                            }}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                Dropbox trống
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Tạo dropbox mới với nội dung trống
                              </Text>
                            </Box>
                            <Icon as={RiWindow2Line} color="gray.400" />
                          </Box>

                          {/* Dropbox assets from database */}
                          {assets
                            .filter((asset: Asset) => asset.key === 'dropbox')
                            .map((asset: Asset, index: number) => (
                              <Box
                                key={asset.id}
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.100' }}
                                bg="white"
                                border="1px solid #e0e0e0"
                                borderRadius="md"
                                onClick={() => {
                                  if (asset.content) {
                                    try {
                                      // Close all existing modal components before adding dropbox template
                                      closeAllModalComponents();

                                      const json = lz.decompress(lz.decodeBase64(asset.content));
                                      const parsedContent = JSON.parse(json);
                                      delete parsedContent.parent;

                                      // Parse the serialized node first
                                      const nodeCopy = query.parseSerializedNode(parsedContent).toNode();

                                      // Create a fresh node from the parsed data (dropboxes don't need positioning changes)
                                      const newNode = query.parseFreshNode({ data: nodeCopy.data }).toNode();

                                      // Add dropbox directly to ROOT without positioning (dropboxes don't need positioning)
                                      actions.add(newNode, 'ROOT');

                                      // Select the newly added dropbox and open it
                                      actions.selectNode([]);
                                      setTimeout(() => {
                                        actions.selectNode(newNode.id);
                                        openDropboxEditor(newNode.id); // Open the dropbox for editing
                                        triggerScroll();
                                      }, 100);

                                      // Close the popup
                                      toggleElementsPopup();
                                    } catch (e) {
                                      console.error("Error processing dropbox asset data:", e);
                                    }
                                  }
                                }}
                                display="flex"
                                flexDirection="column"
                                gap={2}
                              >
                                <img
                                  src={asset.previewUrl}
                                  alt={`dropbox-template-${index}`}
                                  style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
                                />
                                <Flex direction="row" alignItems="center" justifyContent="space-between">
                                  <Box flex="1">
                                    <Text fontSize="sm" fontWeight="medium">
                                      {asset.tag || `Dropbox mẫu ${index + 1}`}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      Nhấn để thêm dropbox mẫu
                                    </Text>
                                  </Box>
                                  <Box
                                    p={1}
                                    cursor="pointer"
                                    _hover={{ bg: 'red.100', color: 'red.600' }}
                                    borderRadius="md"
                                    color="gray.400"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the asset click
                                      if (asset.id) {
                                        handleDeleteAsset(asset.id, asset.tag || `Dropbox mẫu ${index + 1}`);
                                      }
                                    }}
                                    title="Xóa mẫu dropbox"
                                  >
                                    <Icon as={FaTrash} boxSize={3} />
                                  </Box>
                                </Flex>
                              </Box>
                            ))
                          }
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Đang tải dropbox mẫu...
                        </Text>
                      )}
                    </Tabs.Content>
                  </Tabs.Root>
                </Flex>
              </Flex>
            </Tabs.Content>

            {/* Album Modal Tab */}
            <Tabs.Content value="album-modal" className="flex-1 overflow-hidden">
              <Flex direction={'row'} h='full'>
                <Flex direction={'column'} gap={2} className='w-[40%] sm:w-[20%] border-r border-[#E0E0E0] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <ElementItem
                    icon={<FaImages />}
                    label="Tạo mới"
                    onClick={() => {
                      // Close all existing modal components before adding new album modal
                      closeAllModalComponents();
                      addPopupElement(
                        <Element
                          id={getRandomId()}
                          canvas
                          is={AlbumModal}
                        />
                      );
                    }}
                  />
                </Flex>
                <Flex direction={'column'} gap={2} className='w-[60%] sm:w-[80%] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <Tabs.Root value="page" variant="line">
                    <Tabs.List>
                      <Tabs.Trigger value="page" className="!text-xs">
                        Album Modal trong trang
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="page" className="p-2">
                      {!isContentLoaded ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="200px" gap={2}>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Đang tải nội dung...
                          </Text>
                          <Text fontSize="xs" color="gray.400" textAlign="center">
                            Vui lòng đợi trong giây lát
                          </Text>
                        </Box>
                      ) : existingAlbumModals.length > 0 ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {existingAlbumModals.map((albumModal) => (
                            <Box
                              key={albumModal.id}
                              p={2}
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              bg="white"
                              border="1px solid #e0e0e0"
                              borderRadius="md"
                              onClick={() => {
                                // Close all existing modal components before opening album modal
                                closeAllModalComponents();
                                openPopup(albumModal.id);
                                actions.selectNode(albumModal.id);
                                toggleElementsPopup();
                              }}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">
                                  {albumModal.displayName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  ID: {albumModal.id.substring(0, 8)}...
                                </Text>
                              </Box>
                              <Flex alignItems="center" gap={2}>
                                <Icon as={FaImages} color="gray.400" />
                                <Box
                                  cursor="pointer"
                                  _hover={{ color: "red.600" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNode(albumModal.id, 'Album Modal');
                                  }}
                                  title="Xóa Album Modal"
                                >
                                  <Icon as={FaTrash} color="red.400" />
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Chưa có Album Modal nào. Tạo Album Modal mới để bắt đầu.
                        </Text>
                      )}
                    </Tabs.Content>
                  </Tabs.Root>

                  <Box mt={4}>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Album Modal cho phép bạn tạo modal hiển thị album ảnh có thể được kích hoạt từ các thành phần khác thông qua sự kiện.
                    </Text>
                  </Box>
                </Flex>
              </Flex>
            </Tabs.Content>

            {/* QuickActions Tab */}
            <Tabs.Content value="quickactions" className="flex-1 overflow-hidden">
              <Flex direction={'row'} h='full'>
                <Flex direction={'column'} gap={2} className='w-[40%] sm:w-[20%] border-r border-[#E0E0E0] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <ElementItem
                    icon={<FaPlus />}
                    label="Tạo mới"
                    onClick={() => {
                      // Close all existing modal components before adding new QuickActions
                      closeAllModalComponents();
                      addQuickActionsElement();
                    }}
                  />
                </Flex>
                <Flex direction={'column'} gap={2} className='w-[60%] sm:w-[80%] elements-popup-scroll' h='calc(100vh - 120px)' p={2} style={scrollbarStyles}>
                  <Tabs.Root value={quickactionsSection} onValueChange={(e) => setQuickactionsSection(e.value as 'page' | 'template')} variant="line">
                    <Tabs.List>
                      <Tabs.Trigger value="page" className="!text-xs">
                        QuickActions trong trang
                      </Tabs.Trigger>
                      <Tabs.Trigger value="template" className="!text-xs">
                        Mẫu
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="page" className="p-2">
                      {!isContentLoaded ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" h="200px" gap={2}>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Đang tải nội dung...
                          </Text>
                          <Text fontSize="xs" color="gray.400" textAlign="center">
                            Vui lòng đợi trong giây lát
                          </Text>
                        </Box>
                      ) : existingQuickActions.length > 0 ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {existingQuickActions.map((quickAction) => (
                            <Box
                              key={quickAction.id}
                              p={2}
                              cursor="pointer"
                              _hover={{ bg: 'gray.100' }}
                              bg="white"
                              border="1px solid #e0e0e0"
                              borderRadius="md"
                              onClick={() => {
                                // Close all existing modal components before opening QuickActions
                                closeAllModalComponents();
                                openPopup(quickAction.id);
                                actions.selectNode(quickAction.id);
                                toggleElementsPopup();
                              }}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">
                                  {quickAction.displayName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  ID: {quickAction.id.substring(0, 8)}...
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {quickAction.props?.actionButtons?.length || 0} action button(s)
                                </Text>
                                <Text fontSize="xs" color="blue.500">
                                  Position: {(() => {
                                    const position = quickAction.props?.position;
                                    if (!position || !position.enabled) return 'bottom-right (default)';

                                    const positionLabels: { [key: string]: string } = {
                                      'top-left': 'Trên cùng trái',
                                      'top-center': 'Trên cùng giữa',
                                      'top-right': 'Trên cùng phải',
                                      'middle-left': 'Giữa trái',
                                      'middle-right': 'Giữa phải',
                                      'bottom-left': 'Dưới cùng trái',
                                      'bottom-center': 'Dưới cùng giữa',
                                      'bottom-right': 'Dưới cùng phải'
                                    };

                                    return positionLabels[position.position] || position.position;
                                  })()}
                                </Text>
                              </Box>
                              <Flex alignItems="center" gap={2}>
                                <Icon as={FaPlus} color="gray.400" />
                                <Box
                                  cursor="pointer"
                                  _hover={{ color: "red.600" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNode(quickAction.id, 'QuickActions');
                                  }}
                                  title="Xóa QuickActions"
                                >
                                  <Icon as={FaTrash} color="red.400" />
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Chưa có QuickActions nào. Tạo QuickActions mới để bắt đầu.
                        </Text>
                      )}
                      <Box mt={4}>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          QuickActions là nút hành động nhanh nổi cho phép người dùng thực hiện các hành động quan trọng một cách nhanh chóng
                        </Text>
                      </Box>
                    </Tabs.Content>
                    <Tabs.Content value="template" className="p-2">
                      {!isLoading && assets ? (
                        <Box gap={2} display="flex" flexDirection="column">
                          {/* Empty QuickActions template */}
                          <Box
                            p={2}
                            cursor="pointer"
                            _hover={{ bg: 'gray.100' }}
                            bg="white"
                            border="1px solid #e0e0e0"
                            borderRadius="md"
                            onClick={() => {
                              // Close all existing modal components before adding new QuickActions
                              closeAllModalComponents();
                              addQuickActionsElement();
                            }}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                QuickActions trống
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Tạo QuickActions mới với nội dung trống
                              </Text>
                            </Box>
                            <Icon as={FaPlus} color="gray.400" />
                          </Box>

                          {/* QuickActions assets from database */}
                          {assets
                            .filter((asset: Asset) => asset.key === 'quickactions')
                            .map((asset: Asset, index: number) => (
                              <Box
                                key={asset.id}
                                p={2}
                                cursor="pointer"
                                _hover={{ bg: 'gray.100' }}
                                bg="white"
                                border="1px solid #e0e0e0"
                                borderRadius="md"
                                onClick={() => {
                                  if (asset.content) {
                                    try {
                                      // Close all existing modal components before adding QuickActions template
                                      closeAllModalComponents();

                                      const json = lz.decompress(lz.decodeBase64(asset.content));
                                      const parsedContent = JSON.parse(json);
                                      delete parsedContent.parent;

                                      // Parse the serialized node first
                                      const nodeCopy = query.parseSerializedNode(parsedContent).toNode();

                                      // Create a fresh node from the parsed data (QuickActions don't need positioning changes)
                                      const newNode = query.parseFreshNode({ data: nodeCopy.data }).toNode();

                                      // Add QuickActions directly to ROOT without positioning (QuickActions don't need positioning)
                                      actions.add(newNode, 'ROOT');

                                      // Select the newly added QuickActions and open it
                                      actions.selectNode([]);
                                      setTimeout(() => {
                                        actions.selectNode(newNode.id);
                                        openPopup(newNode.id); // Open the QuickActions for editing
                                        triggerScroll();
                                      }, 100);

                                      // Close the popup
                                      toggleElementsPopup();
                                    } catch (e) {
                                      console.error("Error processing QuickActions asset data:", e);
                                    }
                                  }
                                }}
                                display="flex"
                                flexDirection="column"
                                gap={2}
                              >
                                <img
                                  src={asset.previewUrl}
                                  alt={`quickactions-template-${index}`}
                                  style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
                                />
                                <Flex direction="row" alignItems="center" justifyContent="space-between">
                                  <Box flex="1">
                                    <Text fontSize="sm" fontWeight="medium">
                                      {asset.tag || `QuickActions mẫu ${index + 1}`}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      Nhấn để thêm QuickActions mẫu
                                    </Text>
                                  </Box>
                                  <Box
                                    p={1}
                                    cursor="pointer"
                                    _hover={{ bg: 'red.100', color: 'red.600' }}
                                    borderRadius="md"
                                    color="gray.400"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering the asset click
                                      if (asset.id) {
                                        handleDeleteAsset(asset.id, asset.tag || `QuickActions mẫu ${index + 1}`);
                                      }
                                    }}
                                    title="Xóa mẫu QuickActions"
                                  >
                                    <Icon as={FaTrash} boxSize={3} />
                                  </Box>
                                </Flex>
                              </Box>
                            ))
                          }
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Đang tải QuickActions mẫu...
                        </Text>
                      )}
                    </Tabs.Content>
                  </Tabs.Root>
                  <Box mt={4}>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      QuickActions cho phép bạn tạo nút hành động nhanh nổi với nhiều action button có thể được cấu hình để thực hiện các sự kiện khác nhau. Bạn có thể tạo nhiều QuickActions và đặt chúng ở các vị trí khác nhau trên trang.
                    </Text>
                  </Box>
                </Flex>
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      )}
    </>
  )

  return (
    <>
      <div className='hidden sm:block'>
        {renderContent()}
      </div>
      <DialogRoot size={'full'} lazyMount open={isElementsPopupOpen && isMobile} onOpenChange={(e) => e.open ? null : toggleElementsPopup()}>
        <Portal>
          <DialogBackdrop style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
          <DialogContent >
            <DialogBody backgroundColor={'white'} p={0}>
              {renderContent(true)}
            </DialogBody>
            <DialogCloseTrigger asChild>
              <CloseButton size="sm" />
            </DialogCloseTrigger>
          </DialogContent>
        </Portal>
      </DialogRoot>
      <FileSelectModal
        isOpen={isFileSelectOpen}
        onClose={() => setIsFileSelectOpen(false)}
        onSelectFile={handleFileSelect}
        fileType={FileType.IMAGE}
      />
    </>
  );
};