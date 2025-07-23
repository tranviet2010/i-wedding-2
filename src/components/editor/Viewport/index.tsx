import { LightBox } from '@/components/selectors/LightBox';
import { Page } from '@/features/page/pageAPI';
import { AudioSettings, CustomEffect, Effects, NotificationSettings, SEOSettings } from '@/features/template/templateAPI';
import { useEditor } from '@craftjs/core';
import cx from 'classnames';
import lz from 'lzutf8';
import React, { useEffect, useRef, useState } from 'react';
import { BiCollapse, BiExpand } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { RxDragHandleDots2 } from "react-icons/rx";
import { zIndex } from '@/utils/zIndex';
import { SelectionBox } from '../components/SelectionBox';
import { MultiSelectProvider } from '../contexts/MultiSelectContext';
import { useCopyPaste } from '../hooks/useCopyPaste';
import { ElementsPopup } from './ElementsPopup'; // Added import
import { Header } from './Header';
import { LayerPopup } from './LayerPopup';
import { Sidebar } from './Sidebar';
import { ViewportProvider, useViewport } from './ViewportContext';

// Separate inner component to use the context
const ViewportContent: React.FC<{
  children?: React.ReactNode,
  data?: string,
  mobileData?: string,
  id?: string,
  isEditor?: boolean,
  pageData?: Page,
  isPage?: boolean,
  effects?: Partial<Effects>,
  audioSettings?: Partial<AudioSettings>,
  customHtmlSettings?: string,
  seoSettings?: Partial<SEOSettings>,
  notificationSettings?: Partial<NotificationSettings>,
  customEffects?: Partial<CustomEffect>,
  refetchData?: () => void
}> = ({
  children,
  data,
  mobileData,
  id,
  isEditor,
  pageData,
  isPage,
  effects = {},
  audioSettings = {},
  customHtmlSettings = "",
  seoSettings = {},
  notificationSettings = {},
  customEffects = {},
  refetchData
}) => {
    const { actions, query } = useEditor();
    const [sidebarPosition, setSidebarPosition] = useState({
      x: window.innerWidth - 330, // Position 300px from right with 30px margin
      y: (window.innerHeight - 600) / 2 // Center vertically with 600px height
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const dragRef = useRef<HTMLDivElement>(null);
    const initialMousePosition = useRef({ x: 0, y: 0 });
    const initialElementPosition = useRef({ x: 0, y: 0 });

    const {
      closeAllPopups,
      isLayerVisible,
      isElementsPopupOpen,
      sidebarMode,
      toggleSidebarMode,
      hideSidebar,
      isSidebarVisible,
      setPageContent,
      setIsPage,
      setId,
      setDesktopContent,
      setMobileContent,
      currentEditingPlatform
    } = useViewport();
    setId(id || '');
    // Add copy-paste functionality
    useCopyPaste();

    const SIDEBAR_HEIGHT = 600; // Fixed height in pixels
    const SIDEBAR_WIDTH = 300; // Fixed width in pixels
    const MOBILE_SIDEBAR_HEIGHT = 300; // Bottom sheet height on mobile

    // Track if content has been initially loaded to prevent overriding editor state
    const [initialContentLoaded, setInitialContentLoaded] = useState(false);

    useEffect(() => {
      if (data && !initialContentLoaded) {
        const desktopJson = lz.decompress(lz.decodeBase64(data));
        setDesktopContent(desktopJson);

        // Only load into editor if we're on desktop platform AND editor is empty
        if (currentEditingPlatform === 'desktop') {
          try {
            const currentEditorContent = query.serialize();
            const isEditorEmpty = !currentEditorContent || currentEditorContent === '{}' || Object.keys(JSON.parse(currentEditorContent)).length === 0;

            if (isEditorEmpty) {
              actions.deserialize(desktopJson);
            } else {
            }
          } catch (error) {
            // If there's an error reading editor content, load the desktop content
            actions.deserialize(desktopJson);
          }
        }
        setInitialContentLoaded(true);
      }
    }, [data, actions, setDesktopContent, currentEditingPlatform, initialContentLoaded, query]);

    // Track if mobile content has been initially loaded
    const [initialMobileContentLoaded, setInitialMobileContentLoaded] = useState(false);

    // Initialize mobile content when mobileData is loaded or create default (only once and only if editor is empty)
    useEffect(() => {
      if (!initialMobileContentLoaded) {
        if (mobileData) {
          const mobileJson = lz.decompress(lz.decodeBase64(mobileData));
          setMobileContent(mobileJson);

          // Only load into editor if we're on mobile platform AND editor is empty
          if (currentEditingPlatform === 'mobile') {
            try {
              const currentEditorContent = query.serialize();
              const isEditorEmpty = !currentEditorContent || currentEditorContent === '{}' || Object.keys(JSON.parse(currentEditorContent)).length === 0;

              if (isEditorEmpty) {
                actions.deserialize(mobileJson);
              } else {
              }
            } catch (error) {
              // If there's an error reading editor content, load the mobile content
              actions.deserialize(mobileJson);
            }
          }
          setInitialMobileContentLoaded(true);
        } else if (data && !mobileData) {
          // Create default mobile content when mobile content is null
          const defaultMobileContent = {
            "ROOT": {
              "type": { "resolvedName": "ContentWrapper" },
              "isCanvas": true,
              "props": {
                "fontSize": "16px",
                "fontFamily": "Arial, sans-serif",
                "textColor": "#333333"
              },
              "displayName": "Content Wrapper",
              "custom": {},
              "hidden": false,
              "nodes": ["section-1"],
              "linkedNodes": {}
            },
            "section-1": {
              "type": { "resolvedName": "Sections" },
              "isCanvas": true,
              "props": {
                "height": "400px",
                "backgroundColor": "#f8f9fa"
              },
              "displayName": "Sections",
              "custom": {},
              "hidden": false,
              "nodes": [],
              "linkedNodes": {},
              "parent": "ROOT"
            }
          };

          const defaultContentString = JSON.stringify(defaultMobileContent);
          setMobileContent(defaultContentString);

          // Only load into editor if we're on mobile platform AND editor is empty
          if (currentEditingPlatform === 'mobile') {
            try {
              const currentEditorContent = query.serialize();
              const isEditorEmpty = !currentEditorContent || currentEditorContent === '{}' || Object.keys(JSON.parse(currentEditorContent)).length === 0;

              if (isEditorEmpty) {
                actions.deserialize(defaultContentString);
              } else {
              }
            } catch (error) {
              // If there's an error reading editor content, load the default content
              actions.deserialize(defaultContentString);
            }
          }
          setInitialMobileContentLoaded(true);
        }
      }
    }, [mobileData, data, actions, setMobileContent, currentEditingPlatform, initialMobileContentLoaded, query]);

    useEffect(() => {
      if (isPage) {
        if (pageData) {
          setPageContent({
            bride: pageData.bride || '',
            groom: pageData.groom || '',
            date: pageData.date || '',
            location: pageData.location || '',
            isInit: pageData.isInit || false,
          });
        }
        setIsPage(true);
      }
    }, [pageData, isPage]);
    const {
      enabled,
      connectors,
      actions: { setOptions },
    } = useEditor((state) => ({
      enabled: state.options.enabled,
    }));

    useEffect(() => {
      const handleResize = () => {
        setSidebarPosition({
          x: window.innerWidth - SIDEBAR_WIDTH - 30, // 30px margin from right
          y: (window.innerHeight - SIDEBAR_HEIGHT) / 2 // Keep centered vertically
        });
        setIsMobile(window.innerWidth < 640); // Update mobile state
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      if (!window) {
        return;
      }

      window.requestAnimationFrame(() => {
        // Notify doc site
        window.parent.postMessage(
          {
            LANDING_PAGE_LOADED: true,
          },
          '*'
        );

        setTimeout(() => {
          setOptions((options) => {
            options.enabled = true;
          });
        }, 200);
      });
    }, [setOptions]);

    // Note: Keyboard shortcuts for undo/redo are now handled by useKeyboardShortcuts hook in Header component
    // This provides better safeguards and prevents undoing past initial loaded state

    const handleMouseDown = (e: React.MouseEvent) => {
      // Prevent the event from propagating to editor components
      e.stopPropagation();
      e.preventDefault();

      if (!dragRef.current) return;
      setIsDragging(true);
      initialMousePosition.current = { x: e.clientX, y: e.clientY };
      initialElementPosition.current = { ...sidebarPosition };

      // Add a class to the body to disable text selection during drag
      document.body.classList.add('sidebar-dragging');
    };

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        // Prevent default behavior during drag
        e.preventDefault();
        e.stopPropagation();

        const dx = e.clientX - initialMousePosition.current.x;
        const dy = e.clientY - initialMousePosition.current.y;

        // Calculate new position with boundary constraints
        let newX = initialElementPosition.current.x + dx;
        let newY = initialElementPosition.current.y + dy;

        // Keep sidebar within viewport bounds
        newX = Math.max(0, Math.min(window.innerWidth - SIDEBAR_WIDTH, newX));
        newY = Math.max(0, Math.min(window.innerHeight - SIDEBAR_HEIGHT, newY));

        setSidebarPosition({
          x: newX,
          y: newY
        });
      };

      const handleMouseUp = (e: MouseEvent) => {
        // Prevent default behavior
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);
        // Remove the class that disables text selection
        document.body.classList.remove('sidebar-dragging');
      };

      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove, { capture: true });
        document.addEventListener('mouseup', handleMouseUp, { capture: true });

        // Add a style to prevent user selection during drag
        const style = document.createElement('style');
        style.id = 'drag-style';
        style.innerHTML = `
        body.sidebar-dragging {
          user-select: none;
          -webkit-user-select: none;
          cursor: grabbing !important;
        }
        body.sidebar-dragging * {
          cursor: grabbing !important;
        }
      `;
        document.head.appendChild(style);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove, { capture: true });
        document.removeEventListener('mouseup', handleMouseUp, { capture: true });

        // Clean up the style element
        const style = document.getElementById('drag-style');
        if (style) {
          style.remove();
        }
      };
    }, [isDragging]);

    const handleToggleSidebarMode = (e: React.MouseEvent) => {
      // Prevent event propagation to avoid affecting editor
      e.stopPropagation();
      e.preventDefault();
      toggleSidebarMode();
    };
    return (
      <div className="viewport">
        {/* Overlay to prevent editor interaction during dragging */}
        {isDragging && (
          <div
            className="fixed inset-0"
            style={{ cursor: 'grabbing', zIndex: zIndex.settingsModal }}
          />
        )}

        <div
          className={cx(['flex h-full overflow-hidden w-full flex-col fixed top-0 left-0'])}
        >
          <Header id={id || ''} effects={effects} audioSettings={audioSettings} customHtmlSettings={customHtmlSettings} seoSettings={seoSettings} notificationSettings={notificationSettings} customEffects={customEffects} pageData={pageData} isPageProp={isPage} />
          <div className="page-container relative flex flex-1 h-[calc(100vh-60px)] flex-row">
            <LayerPopup />
            <ElementsPopup />
            <SelectionBox />

            {/* <Toolbox /> */}
            <div
              className={cx([
                'craftjs-renderer flex-1 h-full w-full transition overflow-auto',
                {
                  'bg-renderer-gray': enabled,
                  'pointer-events-none': isDragging, // Disable pointer events during drag
                },
              ])}
              style={{
                paddingBottom: enabled && isSidebarVisible && isMobile
                  ? `${MOBILE_SIDEBAR_HEIGHT + 140}px`
                  : '140px'
              }}
              ref={(ref) => {
                if (ref) {
                  connectors.select(connectors.hover(ref, ""), "");
                }
              }}
            >
              <div
                className={`relative flex-col flex items-center pt-8 pb-2 ${isEditor ? 'py-10' : ''}`}
                onClick={() => {
                  if (isLayerVisible || isElementsPopupOpen) {
                    closeAllPopups();
                  }
                }}
              >
                {children}
              </div>
            </div>

            {enabled && isSidebarVisible && (
              <div className="fixed sm:hidden inset-x-0 bottom-0 bg-white rounded-t-xl shadow-2xl transform transition-transform duration-300 ease-out"
                style={{
                  height: `${MOBILE_SIDEBAR_HEIGHT}px`,
                  maxHeight: '70vh',
                  zIndex: zIndex.settingsModal
                }}>
                {/* Mobile Bottom Sheet Header */}
                <div className="flex justify-end items-center bg-gray-50 rounded-t-xl border-b border-gray-200">
                  <button
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      hideSidebar();
                    }}
                  >
                    <IoClose size={18} />
                  </button>
                </div>
                <div className="h-full overflow-y-auto overscroll-contain w-full"
                  style={{ height: `${MOBILE_SIDEBAR_HEIGHT - 60}px` }}>
                  <Sidebar isFixed={true} />
                </div>
              </div>
            )}

            {/* Desktop Fixed Sidebar - screens sm and larger */}
            {sidebarMode === 'fixed' && enabled && isSidebarVisible && (
              <div className='flex flex-col hidden sm:block'>
                <div className="flex justify-between items-center bg-gray-200 p-2 text-xs text-gray-600">
                  <button
                    className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      hideSidebar();
                    }}
                    title="Đóng sidebar"
                  >
                    <IoClose size={14} />
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                    onClick={handleToggleSidebarMode}
                    title="Chuyển sang sidebar có thể kéo"
                  >
                    <BiCollapse size={14} />
                  </button>
                </div>
                <div style={{ overflow: 'scroll' }}>
                  <Sidebar isFixed={true} />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Draggable Sidebar - screens sm and larger */}
          {sidebarMode === 'draggable' && enabled && isSidebarVisible && (
            <div
              ref={dragRef}
              className="absolute shadow-lg rounded-md overflow-hidden hidden sm:block"
              style={{
                zIndex: zIndex.settingsModal, // Increased z-index to be above the overlay
                transform: `translate(${sidebarPosition.x}px, ${sidebarPosition.y}px)`,
                cursor: isDragging ? 'grabbing' : 'auto',
                height: `${SIDEBAR_HEIGHT}px`,
                width: `${SIDEBAR_WIDTH}px`
              }}
            >
              <div
                className="sidebar-handle bg-gray-200 p-2 text-center text-xs text-gray-600 flex justify-between items-center"
              >
                <button
                  className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    hideSidebar();
                  }}
                  title="Đóng sidebar"
                >
                  <IoClose size={14} />
                </button>
                <RxDragHandleDots2 className='cursor-grab ' size={14} transform='rotate(90)' onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }} />
                <button
                  className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors cursor-pointer"
                  onClick={handleToggleSidebarMode}
                  title="Chuyển sang sidebar cố định"
                >
                  <BiExpand size={14} />
                </button>
              </div>
              <div className={`sidebar-content bg-white`} style={{ height: `${SIDEBAR_HEIGHT - 30}px`, overflow: 'auto' }}>
                <Sidebar isFixed={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

// Wrapper component that provides the context
export const Viewport: React.FC<{
  children?: React.ReactNode,
  data?: string,
  mobileData?: string,
  id?: string,
  isEditor?: boolean,
  pageData?: Page,
  isPage?: boolean,
  effects?: Partial<Effects>,
  audioSettings?: Partial<AudioSettings>,
  customHtmlSettings?: string,
  seoSettings?: Partial<SEOSettings>,
  notificationSettings?: Partial<NotificationSettings>,
  customEffects?: Partial<CustomEffect>,
  refetchData?: () => void
}> = (props) => {
  return (
    <ViewportProvider
      refetchData={props.refetchData}
      templateId={props.id}
      isPage={props.isPage}
    >
      <MultiSelectProvider>
        <ViewportContent {...props} />
        {/* LightBox Modal Overlay */}
        <LightBox id="global-lightbox" />
        {/* Album Modal Overlay */}
      </MultiSelectProvider>
    </ViewportProvider>
  );
};
