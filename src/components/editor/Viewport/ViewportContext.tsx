import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback, useMemo } from 'react';
import { AssetSaveModal } from '../components/AssetSaveModal';
import { FileSelectModal } from '../components/FileSelectModal';
import { FontSelectModal } from '../components/FontSelectModal';
import { IconPickerModal } from '../components/IconPickerModal';
import { ParticleEffectsModal } from '../components/ParticleEffectsModal';
import { AudioSettingsModal } from '../components/AudioSettingsModal';
import { CustomHtmlSettingsModal } from '../components/CustomHtmlSettingsModal';
import { CustomEffectsModal } from '../components/CustomEffectsModal';
import { SEOSettingsModal } from '../components/SEOSettingsModal';
import { zIndex } from '@/utils/zIndex';
import { NotificationSettingsModal } from '../components/NotificationSettingsModal';
import { FileManagementModal } from '../components/FileManagementModal';
import { HtmlEditorModal } from '../../selectors/HtmlSelector/HtmlEditorModal';
import { ViewportSettingsModal, ViewportSettings } from '../components/ViewportSettingsModal';
import { useViewportSettings, isMobileOnly } from '../contexts/ViewportSettingsContext';

import { FileType } from '@/features/files/fileAPI';
import { NodeId, useEditor } from '@craftjs/core';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Effects, AudioSettings, SEOSettings, NotificationSettings, CustomEffect, useUpdateTemplate } from '@/features/template/templateAPI';
import { useUpdatePageContent } from '@/features/page/pageAPI';
import { toaster } from '@/components/ui/toaster';
import lz from 'lzutf8';
import { convertDesktopContentToMobile } from '@/utils/desktopToMobileConverter';
import { bidirectionalSync, hasStructuralChanges } from '@/utils/crossPlatformSync';



interface ViewportContextType {
  id: string;
  weddingPageId: string | null; // Add wedding page ID
  setWeddingPageId: (id: string | null) => void; // Add setter for wedding page ID
  sidebarMode: 'fixed' | 'draggable' | 'hidden';
  toggleSidebarMode: () => void;
  showSidebar: () => void;
  hideSidebar: () => void;
  toggleLayer: (force?: boolean) => void;
  previousMode: 'fixed' | 'draggable';
  isSidebarVisible: boolean;
  isLayerVisible: boolean;
  isElementsPopupOpen: boolean;
  toggleElementsPopup: () => void;
  closeAllPopups: () => void;
  closeAllModalComponents: () => void;
  showMiddleGuides: boolean;
  setShowMiddleGuides: (show: boolean) => void;
  currentDragParent: string | null; setCurrentDragParent: (parentId: string | null) => void;
  // Section switching control
  isSectionSwitchingDisabled: boolean;
  // Copy/Paste state
  copiedNode: any | null;
  setCopiedNode: (node: any | null) => void;
  showAssetSaveModal: (elementName: string, nodeId: NodeId) => void;
  showFileSelectModal: (fileType: FileType, onSelectFile: (fileUrl: string) => void) => void;
  showMultiImageSelectModal: (onSelectFiles: (fileUrls: string[]) => void, maxSelection?: number) => void;
  showFontSelectModal: (onSelectFont: (fontName: string) => void) => void;
  showIconPickerModal: (onSelectIcon: (svgCode: string) => void) => void;
  showParticleEffectsModal: (initialValues: Partial<Effects>) => void;
  showAudioSettingsModal: (initialValues: Partial<AudioSettings>) => void;
  showCustomHtmlSettingsModal: (initialValues: string) => void;
  showSEOSettingsModal: (initialValues?: Partial<SEOSettings>) => void;
  showNotificationSettingsModal: (initialValues?: Partial<NotificationSettings>) => void;
  showCustomEffectsModal: (initialValues: Partial<CustomEffect>) => void;
  showFileManagementModal: () => void;
  showHtmlEditorModal: (initialValue: string, onSave: (html: string) => void) => void;
  showViewportSettingsModal: (initialValues?: Partial<ViewportSettings>) => void;
  setPageContent: (content: PageContent | null) => void;
  pageContent: PageContent | null;
  isPage: boolean;
  setIsPage: (isPage: boolean) => void;
  setId: (id: string) => void;
  // Popup management
  currentPopupIdOpen: string | null;
  openPopup: (popupId: string, nodeId?: NodeId) => void;
  closePopup: (popupId?: string) => void;
  // Auto-open popup management
  registerAutoOpenPopup: (popupId: string, delay: number) => void;
  // Dropbox management
  currentDropboxIdOpen: string | null;
  dropboxPosition: string;
  dropboxDistance: number;
  dropboxTriggerElementId: string | null;
  openDropbox: (dropboxId: string, position?: string, distance?: number, triggerElementId?: string) => void;
  closeDropbox: () => void;
  // Dropbox editor mode management
  currentDropboxEditorIdOpen: string | null;
  openDropboxEditor: (dropboxId: string) => void;
  closeDropboxEditor: () => void;
  // Dropbox hover management
  setDropboxHoverState: (triggerElementId: string, isHovering: boolean) => void;
  scheduleDropboxClose: (dropboxId: string) => void;
  cancelDropboxClose: (dropboxId: string) => void;
  // LightBox management
  currentLightBoxOpen: any | null;
  openLightBox: (eventData: any) => void;
  closeLightBox: () => void;
  // Album Modal management
  currentAlbumModalOpen: string | null;
  openAlbumModal: (albumModalId: string) => void;
  closeAlbumModal: () => void;
  // Responsive editing functionality
  currentEditingPlatform: 'desktop' | 'mobile';
  setCurrentEditingPlatform: (platform: 'desktop' | 'mobile') => void;
  desktopContent: string | null;
  mobileContent: string | null;
  setDesktopContent: (content: string) => void;
  setMobileContent: (content: string) => void;
  getCurrentContent: () => string | null;
  switchToPlatform: (platform: 'desktop' | 'mobile') => void;
  autoSaveCurrentContent: () => void;
  autoSaveToAPI: () => void;
  saveAndSwitchToPlatform: (platform: 'desktop' | 'mobile') => void;
  syncFromDesktop: () => void;
  crossPlatformSync: (sourcePlatform: 'desktop' | 'mobile') => void;
  lastAutoSaveTime: Date | null;
}

const defaultContext: ViewportContextType = {
  id: '',
  weddingPageId: null,
  setWeddingPageId: () => { },
  sidebarMode: 'draggable',
  toggleSidebarMode: () => { },
  showSidebar: () => { },
  hideSidebar: () => { },
  toggleLayer: () => { },
  previousMode: 'draggable',
  isSidebarVisible: true,
  isLayerVisible: true,
  isElementsPopupOpen: false,
  toggleElementsPopup: () => { },
  closeAllPopups: () => { },
  closeAllModalComponents: () => { },
  showMiddleGuides: false,
  setShowMiddleGuides: () => { },
  currentDragParent: null,
  setCurrentDragParent: () => { },
  isSectionSwitchingDisabled: false,
  copiedNode: null,
  setCopiedNode: () => { },
  showAssetSaveModal: () => { },
  showFileSelectModal: () => { },
  showMultiImageSelectModal: () => { },
  showFontSelectModal: () => { },
  showIconPickerModal: () => { },
  showParticleEffectsModal: () => { },
  showAudioSettingsModal: () => { },
  showCustomHtmlSettingsModal: () => { },
  showSEOSettingsModal: () => { },
  showNotificationSettingsModal: () => { },
  showCustomEffectsModal: () => { },
  showFileManagementModal: () => { },
  showHtmlEditorModal: () => { },
  showViewportSettingsModal: () => { },
  setPageContent: () => { },
  pageContent: null,
  isPage: false,
  setIsPage: () => { },
  setId: () => { },
  currentPopupIdOpen: null,
  openPopup: () => { },
  closePopup: () => { },
  registerAutoOpenPopup: () => { },
  currentDropboxIdOpen: null,
  dropboxPosition: 'bottom-center',
  dropboxDistance: 10,
  dropboxTriggerElementId: null,
  openDropbox: () => { },
  closeDropbox: () => { },
  currentDropboxEditorIdOpen: null,
  openDropboxEditor: () => { },
  closeDropboxEditor: () => { },
  setDropboxHoverState: () => { },
  scheduleDropboxClose: () => { },
  cancelDropboxClose: () => { },
  currentLightBoxOpen: null,
  openLightBox: () => { },
  closeLightBox: () => { },
  currentAlbumModalOpen: null,
  openAlbumModal: () => { },
  closeAlbumModal: () => { },
  // Responsive editing defaults
  currentEditingPlatform: 'desktop',
  setCurrentEditingPlatform: () => { },
  desktopContent: null,
  mobileContent: null,
  setDesktopContent: () => { },
  setMobileContent: () => { },
  getCurrentContent: () => null,
  switchToPlatform: () => { },
  autoSaveCurrentContent: () => { },
  autoSaveToAPI: () => { },
  saveAndSwitchToPlatform: () => { },
  syncFromDesktop: () => { },
  crossPlatformSync: () => { },
  lastAutoSaveTime: null,
};

const ViewportContext = createContext<ViewportContextType>(defaultContext);

export const useViewport = () => useContext(ViewportContext);

interface ViewportProviderProps {
  children: ReactNode;
  refetchData?: () => void;
  templateId?: string;
  isPage?: boolean;
  isViewOnly?: boolean; // Add flag to disable auto-save in view-only mode
}
export interface PageContent {
  groom?: string;
  bride?: string;
  date?: string;
  location?: string;
  isInit: boolean;
}
export const ViewportProvider: React.FC<ViewportProviderProps> = ({ children, refetchData, templateId, isPage: isPageProp, isViewOnly = false }) => {
  const { actions, query } = useEditor();

  // Get viewport settings to check for mobileOnly mode
  const { settings: globalViewportSettings } = useViewportSettings();

  // Copy/Paste state
  const [copiedNode, setCopiedNode] = useState<any | null>(null);

  // API hooks for saving content
  const { mutate: updateTemplate } = useUpdateTemplate();
  const { mutate: updatePage } = useUpdatePageContent();
  const [id, setId] = useState<string>('');
  const [weddingPageId, setWeddingPageId] = useState<string | null>(null);
  const [isPage, setIsPage] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'fixed' | 'draggable' | 'hidden'>('draggable');
  const [previousMode, setPreviousMode] = useState<'fixed' | 'draggable'>('draggable');
  const [layer, setLayer] = useState<boolean>(false);
  const [elementsPopupOpen, setElementsPopupOpen] = useState<boolean>(false);
  const [showMiddleGuides, setShowMiddleGuides] = useState<boolean>(false); const [currentDragParent, setCurrentDragParent] = useState<string | null>(null);

  // Responsive editing state - Initialize platform based on device type
  const [currentEditingPlatform, setCurrentEditingPlatform] = useState<'desktop' | 'mobile'>(() => {
    // Force mobile platform for mobile devices to prevent editing issues
    if (typeof window !== 'undefined') {
      const isMobileDevice = window.innerWidth <= 768; // Use same breakpoint as useMobile hook
      // If mobileOnly is enabled, always start with mobile
      if (isMobileOnly(globalViewportSettings)) {
        return 'mobile';
      }
      return isMobileDevice ? 'mobile' : 'desktop';
    }
    return 'desktop';
  });





  const [desktopContent, setDesktopContent] = useState<string | null>(null);
  const [mobileContent, setMobileContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // State for auto-save
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save mechanism with change detection and cross-platform sync (disabled in view-only mode)
  const autoSaveCurrentContent = useCallback(() => {
    // Don't auto-save in view-only mode
    if (isViewOnly) {
      return;
    }

    // Don't auto-save if content is being loaded to prevent conflicts
    if (isLoadingContent) {
      return;
    }

    try {
      const currentContent = query.serialize();
      const existingContent = currentEditingPlatform === 'desktop' ? desktopContent : mobileContent;

      // Only save if content has actually changed
      if (currentContent !== existingContent) {
        // Update current platform content
        if (currentEditingPlatform === 'desktop') {
          setDesktopContent(currentContent);
        } else {
          setMobileContent(currentContent);
        }

        // Trigger cross-platform sync to keep both platforms synchronized
        try {
          const syncResult = bidirectionalSync(
            currentEditingPlatform === 'desktop' ? currentContent : desktopContent,
            currentEditingPlatform === 'mobile' ? currentContent : mobileContent,
            currentEditingPlatform
          );

          // Update both platform contents with synchronized data
          if (syncResult.desktopContent && syncResult.desktopContent !== desktopContent) {
            setDesktopContent(syncResult.desktopContent);
          }
          if (syncResult.mobileContent && syncResult.mobileContent !== mobileContent) {
            setMobileContent(syncResult.mobileContent);
          }

          console.log(`🔄 Auto-save cross-platform sync completed from ${currentEditingPlatform}`);
        } catch (syncError) {
          console.warn('Failed to sync during auto-save:', syncError);
        }
      }
    } catch (error) {
      console.warn('Failed to auto-save content:', error);
    }
  }, [currentEditingPlatform, query, desktopContent, mobileContent, isLoadingContent, isViewOnly]);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Enhanced auto-save function that saves to API
  const autoSaveToAPI = useCallback(() => {
    // Don't auto-save in view-only mode
    if (isViewOnly) {
      return;
    }

    // Don't auto-save if content is being loaded to prevent conflicts
    if (isLoadingContent) {
      return;
    }

    try {
      const currentContent = query.serialize();
      const existingContent = currentEditingPlatform === 'desktop' ? desktopContent : mobileContent;

      // Only save if content has actually changed
      if (currentContent !== existingContent) {

        // Prepare save data
        const compressedContent = lz.encodeBase64(lz.compress(currentContent));
        const saveData: any = {
          id: Number(templateId || id),
          data: {}
        };

        if (currentEditingPlatform === 'desktop') {
          saveData.data.content = compressedContent;
        } else {
          saveData.data.contentMobile = compressedContent;
        }

        // Choose the appropriate API mutation
        const handleSave = isPageProp ? updatePage : updateTemplate;

        // Save to API
        handleSave(saveData, {
          onSuccess: () => {
            // Update local content state
            if (currentEditingPlatform === 'desktop') {
              setDesktopContent(currentContent);
            } else {
              setMobileContent(currentContent);
            }

            // Trigger cross-platform sync after successful API save
            try {
              const syncResult = bidirectionalSync(
                currentEditingPlatform === 'desktop' ? currentContent : desktopContent,
                currentEditingPlatform === 'mobile' ? currentContent : mobileContent,
                currentEditingPlatform
              );

              // Update both platform contents with synchronized data
              if (syncResult.desktopContent && syncResult.desktopContent !== desktopContent) {
                setDesktopContent(syncResult.desktopContent);
              }
              if (syncResult.mobileContent && syncResult.mobileContent !== mobileContent) {
                setMobileContent(syncResult.mobileContent);
              }

              console.log(`🔄 API auto-save cross-platform sync completed from ${currentEditingPlatform}`);
            } catch (syncError) {
              console.warn('Failed to sync during API auto-save:', syncError);
            }

            // Update last auto-save time
            setLastAutoSaveTime(new Date());

            // Show success toast
            toaster.create({
              title: 'Tự động lưu thành công',
              description: `Đã lưu nội dung ${currentEditingPlatform === 'desktop' ? 'máy tính' : 'di động'}`,
              type: 'success',
              duration: 2000,
            });

          },
          onError: (error) => {
            console.error(`❌ Auto-save failed for ${currentEditingPlatform} content:`, error);

            // Show error toast
            toaster.create({
              title: 'Tự động lưu thất bại',
              description: 'Không thể tự động lưu. Vui lòng lưu thủ công.',
              type: 'error',
              duration: 4000,
            });
          }
        });
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      toaster.create({
        title: 'Lỗi tự động lưu',
        description: 'Đã xảy ra lỗi khi tự động lưu',
        type: 'error',
        duration: 4000,
      });
    }
  }, [query, currentEditingPlatform, desktopContent, mobileContent, isViewOnly, isLoadingContent, templateId, id, isPageProp, updatePage, updateTemplate]);


  const [currentPopupIdOpen, setCurrentPopupIdOpen] = useState<NodeId | null>(null);

  // Auto-open popup management
  const autoOpenTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const autoOpenedPopupsRef = useRef<Set<string>>(new Set());

  const [currentDropboxIdOpen, setCurrentDropboxIdOpen] = useState<NodeId | null>(null);
  const [dropboxPosition, setDropboxPosition] = useState<string>('bottom-center');
  const [dropboxDistance, setDropboxDistance] = useState<number>(10);
  const [dropboxTriggerElementId, setDropboxTriggerElementId] = useState<string | null>(null);
  const [currentDropboxEditorIdOpen, setCurrentDropboxEditorIdOpen] = useState<NodeId | null>(null);
  const [currentLightBoxOpen, setCurrentLightBoxOpen] = useState<any | null>(null);
  const [currentAlbumModalOpen, setCurrentAlbumModalOpen] = useState<string | null>(null);

  // Dropbox hover management
  const dropboxHoverTimeouts = useRef<Map<string, number>>(new Map());
  const dropboxHoverStates = useRef<Map<string, boolean>>(new Map());
  const [assetModalData, setAssetModalData] = useState<{ elementName: string; nodeId: NodeId } | null>(null);
  const [isFileSelectModalOpen, setIsFileSelectModalOpen] = useState(false);
  const [fileSelectModalData, setFileSelectModalData] = useState<{
    fileType: FileType;
    onSelectFile?: (fileUrl: string) => void;
    onSelectFiles?: (fileUrls: string[]) => void;
    maxSelection?: number;
    allowMultiSelect?: boolean;
  } | null>(null); const [isFontSelectModalOpen, setIsFontSelectModalOpen] = useState(false);
  const [fontSelectCallback, setFontSelectCallback] = useState<((fontName: string) => void) | null>(null);
  const [isIconPickerModalOpen, setIsIconPickerModalOpen] = useState(false);
  const [iconPickerCallback, setIconPickerCallback] = useState<((svgCode: string) => void) | null>(null);
  const [isParticleEffectsModalOpen, setIsParticleEffectsModalOpen] = useState(false);
  const [isAudioSettingsModalOpen, setIsAudioSettingsModalOpen] = useState(false);
  const [isCustomHtmlSettingsModalOpen, setIsCustomHtmlSettingsModalOpen] = useState(false);
  const [isSEOSettingsModalOpen, setIsSEOSettingsModalOpen] = useState(false);
  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = useState(false);
  const [isCustomEffectsModalOpen, setIsCustomEffectsModalOpen] = useState(false);
  const [isFileManagementModalOpen, setIsFileManagementModalOpen] = useState(false);
  const [isHtmlEditorModalOpen, setIsHtmlEditorModalOpen] = useState(false);
  const [htmlEditorModalData, setHtmlEditorModalData] = useState<{
    initialValue: string;
    onSave: (html: string) => void;
  } | null>(null);
  const [isViewportSettingsModalOpen, setIsViewportSettingsModalOpen] = useState(false);
  const [viewportSettings, setViewportSettings] = useState<Partial<ViewportSettings>>({});
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [effects, setEffects] = useState<Partial<Effects>>({
    imageUrl: ''
  });
  const [audioSettings, setAudioSettings] = useState<Partial<AudioSettings>>({
    audioUrl: ''
  });
  const [customHtmlSettings, setCustomHtmlSettings] = useState<string>(
    ''
  );
  const [seoSettings, setSeoSettings] = useState<Partial<SEOSettings>>({
    title: '',
    description: '',
    keywords: ['mewedding', 'meHappy', 'Wedding', 'Đám cưới', 'Thiệp cưới', 'Tạo Thiệp cưới miễn phí'],
    imageUrl: '',
    favoriteIconUrl: '',
    password: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<Partial<NotificationSettings>>({
    enabled: true,
    displayDuration: 5000,
    size: 'medium',
    showIcon: true,
    useDefaultIcon: true,
    iconColor: '#000000'
  });
  const [customEffects, setCustomEffects] = useState<Partial<CustomEffect>>({
    autoScroll: {
      enabled: false,
      speed: 1
    }
  });

  const toggleSidebarMode = () => {
    if (sidebarMode === 'fixed') {
      setSidebarMode('draggable');
      setPreviousMode('fixed');
    } else if (sidebarMode === 'draggable') {
      setSidebarMode('fixed');
      setPreviousMode('draggable');
    } else if (sidebarMode === 'hidden') {
      // If hidden, restore to the previous mode
      setSidebarMode(previousMode);
    }
  };

  const showSidebar = () => {
    if (sidebarMode === 'hidden') {
      setSidebarMode(previousMode);
    }
  };

  const hideSidebar = () => {
    if (sidebarMode !== 'hidden') {
      // Remember current mode before hiding
      if (sidebarMode === 'fixed' || sidebarMode === 'draggable') {
        setPreviousMode(sidebarMode);
      }
      setSidebarMode('hidden');
    }
  };

  const toggleLayer = (force?: boolean) => {
    if (force) {
      setLayer(force);
    } else {
      setLayer(!layer);
    }
  };

  const toggleElementsPopup = () => {
    setElementsPopupOpen(!elementsPopupOpen);
  };

  const closeAllPopups = () => { // Add this function
    setLayer(false);
    setElementsPopupOpen(false);
  };

  // Centralized function to close all modal-like components for clean state transitions
  const closeAllModalComponents = () => {
    // Close all popup states
    if (currentPopupIdOpen) {
      setCurrentPopupIdOpen(null);
    }
    // Close all dropbox states
    if (currentDropboxIdOpen) {
      setCurrentDropboxIdOpen(null);
      setDropboxTriggerElementId(null);
    }
    // Close dropbox editor state
    if (currentDropboxEditorIdOpen) {
      setCurrentDropboxEditorIdOpen(null);
    }
    // Close LightBox state
    if (currentLightBoxOpen) {
      setCurrentLightBoxOpen(null);
    }
    // Close Album Modal state
    if (currentAlbumModalOpen) {
      setCurrentAlbumModalOpen(null);
    }
    // Clear any pending dropbox hover timeouts
    dropboxHoverTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    dropboxHoverTimeouts.current.clear();
    dropboxHoverStates.current.clear();
    // Clear editor selection
    actions.selectNode([]);
  };

  const openPopup = (nodeId: NodeId) => {
    // Close all other modal components before opening popup
    closeAllModalComponents();
    setCurrentPopupIdOpen(nodeId);
  };
  const closePopup = () => {
    actions.selectNode([]);
    setCurrentPopupIdOpen(null);
  };

  const registerAutoOpenPopup = (popupId: string, delay: number) => {

    if (!isViewOnly) {
      return;
    }

    if (autoOpenedPopupsRef.current.has(popupId)) {
      return;
    }

    // Clear any existing timer for this popup
    const existingTimer = autoOpenTimersRef.current.get(popupId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Mark as registered to prevent duplicates
    autoOpenedPopupsRef.current.add(popupId);

    // Set new timer
    const timer = setTimeout(() => {
      openPopup(popupId);
      autoOpenTimersRef.current.delete(popupId);
    }, delay * 1000);

    autoOpenTimersRef.current.set(popupId, timer);
  };

  const openDropbox = (dropboxId: NodeId, position: string = 'bottom-center', distance: number = 10, triggerElementId?: string) => {
    // Close all other modal components before opening dropbox
    closeAllModalComponents();
    setCurrentDropboxIdOpen(dropboxId);
    setDropboxPosition(position);
    setDropboxDistance(distance);
    setDropboxTriggerElementId(triggerElementId || null);
  };

  const closeDropbox = () => {
    setCurrentDropboxIdOpen(null);
    setDropboxTriggerElementId(null);
  };

  const openDropboxEditor = (dropboxId: NodeId) => {
    // Close all other modal components before opening dropbox editor
    closeAllModalComponents();
    setCurrentDropboxEditorIdOpen(dropboxId);
    // Auto-select the dropbox node for editing
    actions.selectNode(dropboxId);
  };

  const closeDropboxEditor = () => {
    setCurrentDropboxEditorIdOpen(null);
    actions.selectNode([]);
  };

  // LightBox management functions
  const openLightBox = (eventData: any) => {
    // Close all other modal components before opening lightbox
    closeAllModalComponents();
    setCurrentLightBoxOpen(eventData);
  };

  const closeLightBox = () => {
    setCurrentLightBoxOpen(null);
  };

  // Album Modal management functions
  const openAlbumModal = (albumModalId: string) => {
    // Close all other modal components before opening album modal
    closeAllModalComponents();
    setCurrentAlbumModalOpen(albumModalId);
  };

  const closeAlbumModal = () => {
    setCurrentAlbumModalOpen(null);
  };

  // Dropbox hover management functions
  const setDropboxHoverState = (triggerElementId: string, isHovering: boolean) => {
    dropboxHoverStates.current.set(triggerElementId, isHovering);

    if (isHovering) {
      // Cancel any pending close timeout
      const timeoutId = dropboxHoverTimeouts.current.get(triggerElementId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        dropboxHoverTimeouts.current.delete(triggerElementId);
      }
    }
  };

  const scheduleDropboxClose = (dropboxId: string) => {
    // Clear any existing timeout
    const existingTimeout = dropboxHoverTimeouts.current.get(dropboxId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule close after 300ms
    const timeoutId = window.setTimeout(() => {
      // Check if mouse is still not hovering over trigger or dropbox
      const triggerHovering = dropboxHoverStates.current.get(dropboxTriggerElementId || '');
      const dropboxHovering = dropboxHoverStates.current.get(dropboxId);

      if (!triggerHovering && !dropboxHovering) {
        closeDropbox();
      }
      dropboxHoverTimeouts.current.delete(dropboxId);
    }, 300);

    dropboxHoverTimeouts.current.set(dropboxId, timeoutId);
  };

  const cancelDropboxClose = (dropboxId: string) => {
    const timeoutId = dropboxHoverTimeouts.current.get(dropboxId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      dropboxHoverTimeouts.current.delete(dropboxId);
    }
  };

  const showAssetSaveModal = (elementName: string, nodeId: NodeId) => {
    if (!nodeId) {
      console.warn('No node ID provided for asset save');
      return;
    }
    setAssetModalData({ elementName, nodeId });
    setShowAssetModal(true);
  }; const showFileSelectModal = (fileType: FileType, onSelectFile: (fileUrl: string) => void) => {
    setFileSelectModalData({ fileType, onSelectFile, allowMultiSelect: false });
    setIsFileSelectModalOpen(true);
  };

  const showMultiImageSelectModal = (onSelectFiles: (fileUrls: string[]) => void, maxSelection: number = 20) => {
    setFileSelectModalData({
      fileType: FileType.IMAGE,
      onSelectFiles,
      maxSelection,
      allowMultiSelect: true
    });
    setIsFileSelectModalOpen(true);
  }; const showFontSelectModal = (onSelectFont: (fontName: string) => void) => {
    // Set the callback first, then open the modal
    setFontSelectCallback(() => onSelectFont);
    // Use setTimeout to ensure the callback is set before opening the modal
    setTimeout(() => {
      setIsFontSelectModalOpen(true);
    }, 0);
  };

  const showIconPickerModal = (onSelectIcon: (svgCode: string) => void) => {
    // Set the callback first, then open the modal
    setIconPickerCallback(() => onSelectIcon);
    // Use setTimeout to ensure the callback is set before opening the modal
    setTimeout(() => {
      setIsIconPickerModalOpen(true);
    }, 0);
  };
  const showParticleEffectsModal = (initValue: Partial<Effects>) => {
    setIsParticleEffectsModalOpen(true);
    setEffects(initValue);
  };
  const showAudioSettingsModal = (initValue: Partial<AudioSettings>) => {
    setIsAudioSettingsModalOpen(true);
    setAudioSettings(initValue);
  };
  const showCustomHtmlSettingsModal = (initValue: string) => {
    setIsCustomHtmlSettingsModalOpen(true);
    setCustomHtmlSettings(initValue);
  };
  const showSEOSettingsModal = (initValue?: Partial<SEOSettings>) => {
    setIsSEOSettingsModalOpen(true);
    if (initValue) {
      setSeoSettings(initValue);
    }
  };
  const showNotificationSettingsModal = (initValue?: Partial<NotificationSettings>) => {
    setIsNotificationSettingsModalOpen(true);
    if (initValue) {
      setNotificationSettings(initValue);
    }
  };
  const showCustomEffectsModal = (initValue: Partial<CustomEffect>) => {
    setIsCustomEffectsModalOpen(true);
    setCustomEffects(initValue);
  };
  const showFileManagementModal = () => {
    setIsFileManagementModalOpen(true);
  };

  const showHtmlEditorModal = (initialValue: string, onSave: (html: string) => void) => {
    setHtmlEditorModalData({ initialValue, onSave });
    setIsHtmlEditorModalOpen(true);
  };

  const showViewportSettingsModal = (initialValues?: Partial<ViewportSettings>) => {
    setViewportSettings(initialValues || {});
    setIsViewportSettingsModalOpen(true);
  };

  // Section switching control - disable when Popup or LightBox components are in edit mode
  const isSectionSwitchingDisabled = useMemo(() => {
    // Check if any popup is currently open (in edit mode)
    if (currentPopupIdOpen) {
      return true;
    }

    // Check if any dropbox editor is currently open (LightBox edit mode)
    if (currentDropboxEditorIdOpen) {
      return true;
    }

    // Check if LightBox is currently open
    if (currentLightBoxOpen) {
      return true;
    }

    // Check if any settings modals are open that could be for Popup/LightBox components
    if (isFileSelectModalOpen || isFontSelectModalOpen || isIconPickerModalOpen ||
        isParticleEffectsModalOpen || isAudioSettingsModalOpen || isCustomHtmlSettingsModalOpen ||
        isSEOSettingsModalOpen || isNotificationSettingsModalOpen || isCustomEffectsModalOpen || isFileManagementModalOpen ||
        isHtmlEditorModalOpen || isViewportSettingsModalOpen) {
      // Additional check: only disable if a Popup or LightBox component is currently selected
      try {
        const selectedNodes = query.getEvent('selected').all();
        if (selectedNodes.length > 0) {
          const selectedNode = query.node(selectedNodes[0]).get();
          const componentType = selectedNode.data.type;
          // Check if the component is a Popup or LightBox by checking the displayName or component name
          if (componentType && typeof componentType === 'function') {
            const componentName = componentType.displayName || componentType.name;
            if (componentName === 'Popup' || componentName === 'LightBox') {
              return true;
            }
          }
        }
      } catch (error) {
        // If there's an error checking the selected node, don't disable section switching
        console.warn('Error checking selected node for section switching control:', error);
      }
    }

    return false;
  }, [
    currentPopupIdOpen,
    currentDropboxEditorIdOpen,
    currentLightBoxOpen,
    isFileSelectModalOpen,
    isFontSelectModalOpen,
    isIconPickerModalOpen,
    isParticleEffectsModalOpen,
    isAudioSettingsModalOpen,
    isCustomHtmlSettingsModalOpen,
    isSEOSettingsModalOpen,
    isNotificationSettingsModalOpen,
    isCustomEffectsModalOpen,
    isFileManagementModalOpen,
    isHtmlEditorModalOpen,
    isViewportSettingsModalOpen,
    query
  ]);

  // Responsive editing functions
  const getCurrentContent = () => {
    return currentEditingPlatform === 'desktop' ? desktopContent : mobileContent;
  };

  // Enhanced platform switching with proper content isolation and cross-platform sync
  const switchToPlatform = (platform: 'desktop' | 'mobile') => {
    // Don't switch if already on the target platform
    if (currentEditingPlatform === platform) {
      return;
    }

    // Prevent UI switching to desktop if mobileOnly mode is enabled
    // But allow the sync system to work in the background
    if (platform === 'desktop' && isMobileOnly(globalViewportSettings)) {
      console.log('🚫 Desktop UI editing disabled in mobile-only mode (sync system remains active)');
      return;
    }

    setIsLoadingContent(true);

    // Save current content before switching
    const currentContent = query.serialize();

    // Update content states immediately to prevent cross-contamination
    if (currentEditingPlatform === 'desktop') {
      setDesktopContent(currentContent);
    } else {
      setMobileContent(currentContent);
    }

    // Trigger cross-platform sync before switching
    let syncedDesktopContent = currentEditingPlatform === 'desktop' ? currentContent : desktopContent;
    let syncedMobileContent = currentEditingPlatform === 'mobile' ? currentContent : mobileContent;

    try {
      const syncResult = bidirectionalSync(
        syncedDesktopContent,
        syncedMobileContent,
        currentEditingPlatform
      );

      // Update local variables with synchronized data
      syncedDesktopContent = syncResult.desktopContent;
      syncedMobileContent = syncResult.mobileContent;

      // Update state with synchronized data
      if (syncResult.desktopContent) {
        setDesktopContent(syncResult.desktopContent);
      }
      if (syncResult.mobileContent) {
        setMobileContent(syncResult.mobileContent);
      }

      console.log(`🔄 Cross-platform sync completed during platform switch from ${currentEditingPlatform} to ${platform}`);
    } catch (error) {
      console.error('❌ Error during platform switch sync:', error);
    }

    // Switch platform first
    setCurrentEditingPlatform(platform);

    // Load content for new platform using synchronized content
    const targetContent = platform === 'desktop' ? syncedDesktopContent : syncedMobileContent;

    console.log(`🔄 Platform switch to ${platform}:`);
    console.log(`📱 Target content exists:`, targetContent ? 'yes' : 'no');
    console.log(`📱 Target content different from current:`, targetContent !== currentContent);

    if (targetContent && targetContent !== currentContent) {
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log(`📱 Loading ${platform} content into editor`);
        actions.deserialize(targetContent);
        setIsLoadingContent(false);
      }, 100);
    } else if (!targetContent) {
      // If no content exists for this platform, create default content

      if (platform === 'mobile') {
        // Create default mobile content structure
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

        setTimeout(() => {
          actions.deserialize(defaultContentString);
          setIsLoadingContent(false);
        }, 100);
      } else {
        // For desktop, create default content
        setTimeout(() => {
          actions.clearEvents();
          setIsLoadingContent(false);
        }, 100);
      }
    } else {
      // Content is the same, just clear loading state
      setIsLoadingContent(false);
    }
  };

  // Track previous mobileOnly state to detect when it changes from false to true
  const prevMobileOnlyRef = useRef(isMobileOnly(globalViewportSettings));

  // Auto-switch to mobile when mobileOnly is enabled (only when it changes from false to true)
  useEffect(() => {
    const currentMobileOnly = isMobileOnly(globalViewportSettings);

    // Only trigger when mobileOnly changes from false to true and we're on desktop
    if (currentMobileOnly && !prevMobileOnlyRef.current && currentEditingPlatform === 'desktop') {
      console.log('🔄 MobileOnly enabled - auto-switching to mobile platform with proper content loading');
      console.log('📱 Current desktop content:', desktopContent ? 'exists' : 'null');
      console.log('📱 Current mobile content:', mobileContent ? 'exists' : 'null');

      // Use a small delay to ensure all state updates are processed
      setTimeout(() => {
        // Use the proper switchToPlatform function to ensure content is loaded correctly
        switchToPlatform('mobile');
      }, 50);
    }

    // Update the ref for next comparison
    prevMobileOnlyRef.current = currentMobileOnly;
  }, [globalViewportSettings.mobileOnly, currentEditingPlatform, switchToPlatform, desktopContent, mobileContent]); // Include content states for debugging

  // Enhanced platform switching with API save and local switching (no refetch)
  const saveAndSwitchToPlatform = (platform: 'desktop' | 'mobile') => {
    // Don't switch if already on the target platform
    if (currentEditingPlatform === platform) {
      return;
    }

    setIsLoadingContent(true);

    // Save current content before switching
    const currentContent = query.serialize();
    const compressedContent = lz.encodeBase64(lz.compress(currentContent));

    // Update local content state immediately to prevent cross-contamination
    if (currentEditingPlatform === 'desktop') {
      setDesktopContent(currentContent);
    } else {
      setMobileContent(currentContent);
    }

    // Trigger cross-platform sync before saving
    try {
      const syncResult = bidirectionalSync(
        currentEditingPlatform === 'desktop' ? currentContent : desktopContent,
        currentEditingPlatform === 'mobile' ? currentContent : mobileContent,
        currentEditingPlatform
      );

      // Update both platform contents with synchronized data
      if (syncResult.desktopContent) {
        setDesktopContent(syncResult.desktopContent);
      }
      if (syncResult.mobileContent) {
        setMobileContent(syncResult.mobileContent);
      }

      console.log(`🔄 Cross-platform sync completed during save and switch from ${currentEditingPlatform} to ${platform}`);
    } catch (error) {
      console.error('❌ Error during save and switch sync:', error);
    }

    // Prepare save data based on current platform
    const saveData: any = {
      id: Number(templateId || id),
      data: {}
    };

    if (currentEditingPlatform === 'desktop') {
      saveData.data.content = compressedContent;
    } else {
      saveData.data.contentMobile = compressedContent;
    }

    // Choose the appropriate API mutation
    const handleSave = isPageProp ? updatePage : updateTemplate;

    // Save to API but don't refetch to avoid content contamination
    handleSave(saveData, {
      onSuccess: () => {

        // Use local state switching instead of refetch to maintain content isolation
        switchToPlatform(platform);
      },
      onError: (error) => {
        console.error(`❌ Failed to save ${currentEditingPlatform} content:`, error);
        // Fallback to local state switching if API save fails
        setIsLoadingContent(false);
        switchToPlatform(platform);
      }
    });
  };

  // Sync from desktop to mobile with layout conversion
  const syncFromDesktop = () => {
    // Only allow sync when on mobile platform
    if (currentEditingPlatform !== 'mobile') {
      console.warn('🚫 Sync from desktop can only be used when editing mobile version');
      return;
    }

    // Check if desktop content exists
    if (!desktopContent) {
      toaster.create({
        title: "Không có nội dung desktop",
        description: "Không tìm thấy nội dung desktop để đồng bộ. Vui lòng tạo nội dung desktop trước.",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoadingContent(true);

      // Convert desktop content to mobile-friendly format
      const convertedMobileContent = convertDesktopContentToMobile(desktopContent);

      // Update mobile content state
      setMobileContent(convertedMobileContent);

      // Load the converted content into the editor
      setTimeout(() => {
        try {
          actions.deserialize(convertedMobileContent);
          setIsLoadingContent(false);

          toaster.create({
            title: "Đồng bộ thành công",
            description: "Đã đồng bộ và chuyển đổi nội dung từ desktop sang mobile.",
            duration: 3000,
          });
        } catch (error) {
          console.error('Error loading converted content:', error);
          setIsLoadingContent(false);

          toaster.create({
            title: "Lỗi tải nội dung",
            description: "Có lỗi xảy ra khi tải nội dung đã chuyển đổi.",
            duration: 3000,
          });
        }
      }, 100);

    } catch (error) {
      console.error('Error converting desktop content to mobile:', error);
      setIsLoadingContent(false);

      toaster.create({
        title: "Lỗi chuyển đổi",
        description: "Có lỗi xảy ra khi chuyển đổi nội dung desktop sang mobile.",
        duration: 3000,
      });
    }
  };

  // Cross-platform synchronization function
  const crossPlatformSync = useCallback((sourcePlatform: 'desktop' | 'mobile') => {
    // Don't sync in view-only mode
    if (isViewOnly) {
      console.log('🚫 Cross-platform sync disabled in view-only mode');
      return;
    }

    // Don't sync if content is being loaded to prevent conflicts
    if (isLoadingContent) {
      console.log('🚫 Cross-platform sync skipped - content is loading');
      return;
    }

    try {
      console.log(`🔄 Starting cross-platform sync from ${sourcePlatform}`);

      // Get current content from the editor
      const currentContent = query.serialize();

      // Update the source platform content with current editor state
      if (sourcePlatform === 'desktop') {
        setDesktopContent(currentContent);
      } else {
        setMobileContent(currentContent);
      }

      // Perform bidirectional sync
      const syncResult = bidirectionalSync(
        sourcePlatform === 'desktop' ? currentContent : desktopContent,
        sourcePlatform === 'mobile' ? currentContent : mobileContent,
        sourcePlatform
      );

      // Update both platform contents with synchronized data
      if (syncResult.desktopContent !== desktopContent) {
        setDesktopContent(syncResult.desktopContent);
        console.log('🔄 Desktop content synchronized');
      }

      if (syncResult.mobileContent !== mobileContent) {
        setMobileContent(syncResult.mobileContent);
        console.log('🔄 Mobile content synchronized');
      }

      // If we're syncing to the current platform, update the editor
      const targetContent = currentEditingPlatform === 'desktop'
        ? syncResult.desktopContent
        : syncResult.mobileContent;

      if (targetContent && targetContent !== currentContent) {
        console.log(`🔄 Updating ${currentEditingPlatform} editor with synchronized content`);
        setTimeout(() => {
          actions.deserialize(targetContent);
        }, 100);
      }

      console.log('✅ Cross-platform sync completed successfully');

    } catch (error) {
      console.error('❌ Error during cross-platform sync:', error);

      toaster.create({
        title: 'Lỗi đồng bộ',
        description: 'Có lỗi xảy ra khi đồng bộ nội dung giữa các nền tảng.',
        type: 'error',
        duration: 4000,
      });
    }
  }, [
    isViewOnly,
    isLoadingContent,
    query,
    desktopContent,
    mobileContent,
    currentEditingPlatform,
    actions
  ]);

  // Auto-save content periodically to API (disabled in view-only mode)
  useEffect(() => {
    if (isViewOnly) {
      return;
    }

    // Clear existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // Set up new interval for API auto-save every 60 seconds (1 minute)
    autoSaveIntervalRef.current = setInterval(() => {
      autoSaveToAPI();
    }, 60000); // Auto-save every 60 seconds (1 minute)

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveToAPI, isViewOnly]);



  // Auto-save when switching away from the page/component (disabled in view-only mode)
  useEffect(() => {
    if (isViewOnly) {
      return;
    }

    const handleBeforeUnload = () => {
      autoSaveCurrentContent();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        autoSaveCurrentContent();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSaveCurrentContent, isViewOnly]);

  // Add keyboard event handling for popup, dropbox, and lightbox control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close any open popup, dropbox, dropbox editor, or lightbox on Escape key (since only one can be open)
      if (e.key === 'Escape') {
        if (currentLightBoxOpen) {
          closeLightBox();
          e.preventDefault();
          e.stopPropagation();
        } else if (currentPopupIdOpen) {
          closePopup();
          e.preventDefault();
          e.stopPropagation();
        } else if (currentDropboxEditorIdOpen) {
          closeDropboxEditor();
          e.preventDefault();
          e.stopPropagation();
        } else if (currentDropboxIdOpen) {
          closeDropbox();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPopupIdOpen, currentDropboxIdOpen, currentDropboxEditorIdOpen, currentLightBoxOpen]);

  // Auto-switch to mobile platform for mobile devices on window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobileDevice = window.innerWidth <= 768;

      // Force switch to mobile platform if on mobile device and currently on desktop
      if (isMobileDevice && currentEditingPlatform === 'desktop') {
        console.log('📱 Mobile device detected, forcing switch to mobile platform');
        switchToPlatform('mobile');
      }
      // Allow manual switch back to desktop on larger screens (don't force desktop)
      // This gives users flexibility while preventing mobile editing issues
    };

    // Check on mount
    handleResize();

    // Listen for resize events with debounce to prevent excessive switching
    let resizeTimeout: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(resizeTimeout);
    };
  }, [currentEditingPlatform, switchToPlatform]);

  return (
    <ViewportContext.Provider
      value={{
        sidebarMode,
        toggleSidebarMode,
        showSidebar,
        hideSidebar,
        toggleLayer,
        previousMode,
        isSidebarVisible: sidebarMode !== 'hidden',
        isLayerVisible: layer,
        isElementsPopupOpen: elementsPopupOpen,
        toggleElementsPopup,
        closeAllPopups,
        closeAllModalComponents,
        showMiddleGuides,
        setShowMiddleGuides,
        currentDragParent, setCurrentDragParent,
        copiedNode,
        setCopiedNode,
        showAssetSaveModal,
        showFileSelectModal,
        showMultiImageSelectModal,
        showFontSelectModal,
        showIconPickerModal,
        showParticleEffectsModal,
        showAudioSettingsModal,
        showCustomHtmlSettingsModal,
        showSEOSettingsModal,
        showNotificationSettingsModal,
        showCustomEffectsModal,
        showFileManagementModal,
        showHtmlEditorModal,
        showViewportSettingsModal,
        pageContent,
        setPageContent,
        isPage,
        setIsPage,
        id,
        setId,
        weddingPageId,
        setWeddingPageId,
        currentPopupIdOpen,
        openPopup,
        closePopup,
        registerAutoOpenPopup,
        currentDropboxIdOpen,
        dropboxPosition,
        dropboxDistance,
        dropboxTriggerElementId,
        openDropbox,
        closeDropbox,
        currentDropboxEditorIdOpen,
        openDropboxEditor,
        closeDropboxEditor,
        setDropboxHoverState,
        scheduleDropboxClose,
        cancelDropboxClose,
        // LightBox management
        currentLightBoxOpen,
        openLightBox,
        closeLightBox,
        // Album Modal management
        currentAlbumModalOpen,
        openAlbumModal,
        closeAlbumModal,
        // Responsive editing
        currentEditingPlatform,
        setCurrentEditingPlatform,
        desktopContent,
        mobileContent,
        setDesktopContent,
        setMobileContent,
        getCurrentContent,
        switchToPlatform,
        autoSaveCurrentContent,
        autoSaveToAPI,
        saveAndSwitchToPlatform,
        syncFromDesktop,
        crossPlatformSync,
        lastAutoSaveTime,
        isSectionSwitchingDisabled,
      }}
    >      {children}
      {assetModalData && (
        <AssetSaveModal
          isOpen={showAssetModal}
          onClose={() => setShowAssetModal(false)}
          elementName={assetModalData.elementName}
          nodeId={assetModalData.nodeId}
        />
      )}
      {fileSelectModalData && (
        <FileSelectModal
          isOpen={isFileSelectModalOpen}
          onClose={() => setIsFileSelectModalOpen(false)}
          onSelectFile={fileSelectModalData.onSelectFile ? (fileUrl: string) => {
            fileSelectModalData.onSelectFile!(fileUrl);
            setIsFileSelectModalOpen(false);
          } : undefined}
          onSelectFiles={fileSelectModalData.onSelectFiles ? (fileUrls: string[]) => {
            fileSelectModalData.onSelectFiles!(fileUrls);
            setIsFileSelectModalOpen(false);
          } : undefined}
          fileType={fileSelectModalData.fileType}
          maxSelection={fileSelectModalData.maxSelection}
          allowMultiSelect={fileSelectModalData.allowMultiSelect}
        />
      )}      {/* Always render FontSelectModal */}
      <ErrorBoundary fallback={
        isFontSelectModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: zIndex.viewportContext }}>
            <div className="bg-white rounded-lg p-6 w-[400px] flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 text-red-500">Error Loading Font Selector</h3>
              <p className="mb-4">There was a problem loading the font selector.</p>
              <button
                onClick={() => setIsFontSelectModalOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )
      }>
        <FontSelectModal
          isOpen={isFontSelectModalOpen}
          onClose={() => {
            setIsFontSelectModalOpen(false);
          }}
          onSelectFont={(fontName: string) => {
            if (fontSelectCallback) {
              fontSelectCallback(fontName);
            } else {
              console.warn('No font select callback available');
            }
            setIsFontSelectModalOpen(false);
          }}
        />
      </ErrorBoundary>

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerModalOpen}
        onClose={() => {
          setIsIconPickerModalOpen(false);
        }}
        onIconSelect={(svgCode: string) => {
          if (iconPickerCallback) {
            iconPickerCallback(svgCode);
          } else {
            console.warn('No icon picker callback available');
          }
          setIsIconPickerModalOpen(false);
        }}
      />

      {/* Particle Effects Modal */}
      <ParticleEffectsModal
        isOpen={isParticleEffectsModalOpen}
        onClose={() => {
          setIsParticleEffectsModalOpen(false);
        }}
        initialValues={effects}
      />

      {/* Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={isAudioSettingsModalOpen}
        onClose={() => {
          setIsAudioSettingsModalOpen(false);
        }}
        initialValues={audioSettings}
      />

      {/* Custom HTML Settings Modal */}
      <CustomHtmlSettingsModal
        isOpen={isCustomHtmlSettingsModalOpen}
        onClose={() => {
          setIsCustomHtmlSettingsModalOpen(false);
        }}
        initialValues={customHtmlSettings}
      />

      {/* SEO Settings Modal */}
      <SEOSettingsModal
        isOpen={isSEOSettingsModalOpen}
        onClose={() => {
          setIsSEOSettingsModalOpen(false);
        }}
        initialValues={seoSettings}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsModalOpen}
        onClose={() => {
          setIsNotificationSettingsModalOpen(false);
        }}
        initialValues={notificationSettings}
      />

      {/* Custom Effects Modal */}
      <CustomEffectsModal
        isOpen={isCustomEffectsModalOpen}
        onClose={() => {
          setIsCustomEffectsModalOpen(false);
        }}
        initialValues={customEffects}
      />

      {/* File Management Modal */}
      <FileManagementModal
        isOpen={isFileManagementModalOpen}
        onClose={() => {
          setIsFileManagementModalOpen(false);
        }}
      />

      {/* HTML Editor Modal */}
      {htmlEditorModalData && (
        <HtmlEditorModal
          isOpen={isHtmlEditorModalOpen}
          onClose={() => {
            setIsHtmlEditorModalOpen(false);
            setHtmlEditorModalData(null);
          }}
          initialValue={htmlEditorModalData.initialValue}
          onSave={(html: string) => {
            htmlEditorModalData.onSave(html);
            setIsHtmlEditorModalOpen(false);
            setHtmlEditorModalData(null);
          }}
        />
      )}

      {/* Viewport Settings Modal */}
      <ViewportSettingsModal
        isOpen={isViewportSettingsModalOpen}
        onClose={() => {
          setIsViewportSettingsModalOpen(false);
        }}
        initialValues={viewportSettings}
      />

    </ViewportContext.Provider>
  );
};