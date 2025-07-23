import LogoMehappy from '@/assets/images/logo-mehappy.png';
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@/components/ui/menu';
import { useUpdatePageContent } from '@/features/page/pageAPI';
import { AudioSettings, CustomEffect, Effects, NotificationSettings, SEOSettings, useUpdateTemplate, useGetTemplate } from '@/features/template/templateAPI';
import { Box, Button as ChakraButton, Flex, IconButton, Image, Text } from '@chakra-ui/react';
import { useEditor } from '@craftjs/core';
import cx from 'classnames';
import lz from 'lzutf8';
import React, { useState } from 'react';
import { CiDesktop, CiMobile4 } from 'react-icons/ci';
import { FaArrowLeft, FaCheck, FaCog, FaPencilAlt, FaPlus, FaRedo, FaSync, FaUndo, FaGlobe, FaEyeSlash, FaVolumeUp, FaCode, FaSearch, FaBell, FaMagic, FaFolder, FaDesktop } from 'react-icons/fa';
import { GiSettingsKnobs } from "react-icons/gi";
import { SlLayers } from "react-icons/sl";
import { useLocation, useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ShareButton } from './ShareButton';
import { useViewport } from './ViewportContext';
import { toaster } from '@/components/ui/toaster';
import { useViewportSettings, isMobileOnly } from '../contexts/ViewportSettingsContext';
import { zIndex } from '@/utils/zIndex';

interface ItemProps {
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
}

const Item: React.FC<ItemProps> = ({ disabled, children, onClick, title }) => (
  <Box
    as="a"
    display="flex"
    alignItems="center"
    marginRight="10px"
    cursor={disabled ? "not-allowed" : "pointer"}
    opacity={disabled ? 0.5 : 1}
    onClick={!disabled ? onClick : undefined}
    title={title}
  >
    {children}
  </Box>
);

import { Page } from '@/features/page/pageAPI';

export const Header = ({ id, effects, audioSettings, customHtmlSettings, seoSettings, notificationSettings, customEffects, pageData, isPageProp }: { id: string, effects: Partial<Effects>, audioSettings?: Partial<AudioSettings>, customHtmlSettings?: string, seoSettings?: Partial<SEOSettings>, notificationSettings?: Partial<NotificationSettings>, customEffects?: Partial<CustomEffect>, pageData?: Page, isPageProp?: boolean }) => {
  const { enabled, canUndo, canRedo, actions, query } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAtInitialState } = useKeyboardShortcuts();

  const {
    isSidebarVisible,
    showSidebar,
    hideSidebar,
    toggleLayer,
    toggleElementsPopup,
    isPage,
    showParticleEffectsModal,
    showAudioSettingsModal,
    showCustomHtmlSettingsModal,
    showSEOSettingsModal,
    showNotificationSettingsModal,
    showCustomEffectsModal,
    showFileManagementModal,
    showViewportSettingsModal,
    currentEditingPlatform,
    switchToPlatform,
    autoSaveCurrentContent,
    saveAndSwitchToPlatform,
    syncFromDesktop,
    crossPlatformSync,
    lastAutoSaveTime
  } = useViewport();
  const { mutate: updateTemplate } = useUpdateTemplate();
  const { mutate: updatePage } = useUpdatePageContent();

  // Get viewport settings to check for mobileOnly mode
  const { settings: viewportSettings } = useViewportSettings();

  // Fetch template data for publish functionality (only for templates, not pages)
  const templateId = !isPageProp && !isPage && id ? parseInt(id, 10) : 0;
  const { data: templateData } = useGetTemplate(templateId > 0 ? templateId : 0);

  // State for publish operation
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleSidebarVisibility = () => {
    if (isSidebarVisible) {
      hideSidebar();
    } else {
      showSidebar();
    }
  };

  const handleSave = isPage ? updatePage : updateTemplate;

  // Handle back navigation with rejectUrl check
  const handleBackNavigation = () => {
    const params = new URLSearchParams(location.search);
    const rejectUrl = params.get('rejectUrl');

    if (rejectUrl) {
      console.log('📍 Navigating to rejectUrl:', rejectUrl);
      // Use window.location.href for Flutter WebView to catch navigation
      window.location.href = rejectUrl;
    } else {
      console.log('📍 No rejectUrl found, navigating to home');
      navigate("/");
    }
  };

  // Handle publish/unpublish template
  const handleTogglePublish = () => {
    if (!templateData?.id) {
      toaster.create({
        title: "Lỗi",
        description: "Không thể tìm thấy thông tin template",
        type: "error",
      });
      return;
    }

    setIsPublishing(true);
    const newPublishStatus = !templateData.isPublished;

    updateTemplate(
      {
        id: templateData.id,
        data: { isPublished: newPublishStatus }
      },
      {
        onSuccess: () => {
          toaster.create({
            title: "Thành công",
            description: newPublishStatus
              ? "Template đã được xuất bản thành công"
              : "Template đã được hủy xuất bản",
            type: "success",
          });
          setIsPublishing(false);
        },
        onError: (error) => {
          console.error('Error updating template publish status:', error);
          toaster.create({
            title: "Lỗi",
            description: "Có lỗi xảy ra khi cập nhật trạng thái xuất bản",
            type: "error",
          });
          setIsPublishing(false);
        }
      }
    );
  };

  return (
    <Box
      width="100%"
      zIndex={zIndex.headerControls}
      position="relative"
      padding="8px 16px"
      background="white"
      borderBottom="1px solid #e0e0e0"
      display="flex"
      className="header transition w-full px-2 py-1 sm:px-4 sm:py-2 h-[120px] sm:h-[60px]"
    >
      <Box width="100%" alignItems="center" position="relative" className="hidden sm:flex items-center justify-between gap-1 sm:gap-3">
        {/* Left Section */}
        <Flex gap={3} alignItems="center" flex="1" className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <IconButton
            size="sm"
            variant="outline"
            onClick={handleBackNavigation}
            title="Quay về"
            className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 text-xs sm:text-sm"
          >
            <FaArrowLeft size={10} className="sm:w-3.5 sm:h-3.5" />
          </IconButton>
          {
            enabled && (
              <>
                <IconButton
                  size="sm"
                  variant="outline"
                  onClick={() => toggleElementsPopup()}
                  title="Thêm elements"
                  className={`w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 text-xs sm:text-sm`}
                >
                  <FaPlus size={10} className="sm:w-3.5 sm:h-3.5" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="outline"
                  onClick={() => toggleLayer()}
                  title="Layer"
                  className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 text-xs sm:text-sm"
                >
                  <SlLayers size={10} className="sm:w-3.5 sm:h-3.5" />
                </IconButton>
              </>
            )
          }
          <Text fontSize="sm" color="blue.500" cursor="pointer" fontWeight="medium" className="hidden sm:block text-xs sm:text-sm">
            Xem hướng dẫn
          </Text>
        </Flex>

        {/* Center Section - Logo */}
        <Flex
          alignItems="center"
          gap={2}
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          zIndex={zIndex.ui}
          className="flex items-center gap-1 sm:gap-2 absolute left-1/2 transform -translate-x-1/2"
        >
          <div style={{
            // borderWidth: '1px',
            // borderRadius: '100%',
            // borderStyle: 'solid',
            // borderColor: '#d25142',
          }}>

            <Image
              src={LogoMehappy}
              alt="meHappy"
              height="45px"
              className="h-8 sm:h-10 md:h-12"
              style={{
                mixBlendMode: 'multiply',
                backgroundColor: 'transparent'
              }}
            />
          </div>
          <Text
            fontSize="xl"
            fontWeight="700"
            color="#e53e3e"
            fontFamily="Quicksand, sans-serif"
            lineHeight="1"
            display="flex"
            alignItems="center"
            height="45px"
            className="text-sm sm:text-lg md:text-xl font-bold text-red-500 leading-none flex items-center h-8 sm:h-10 md:h-12"
          >
            meHappy
          </Text>
        </Flex>

        {/* Right Section */}
        <Flex gap={2} alignItems="center" flex="1" justifyContent="flex-end" className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
          {enabled && (
            <Flex gap={1} alignItems="center" className="hidden sm:flex items-center gap-1">
              <Flex alignItems="center" direction={"column-reverse"} className="flex flex-col-reverse items-center">
                <Text fontSize="xs" color="gray.600" marginRight={2} className="text-2xs sm:text-xs text-gray-600 mr-1 sm:mr-2">
                  Hoàn tác
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  disabled={!canUndo || isAtInitialState}
                  onClick={() => {
                    console.log('🔍 Undo button clicked - canUndo:', canUndo, 'isAtInitialState:', isAtInitialState);
                    if (!isAtInitialState && canUndo) {
                      actions.history.undo();
                    } else if (isAtInitialState) {
                      console.log('🚫 Undo blocked: Cannot undo past initial loaded state from backend');
                    }
                  }}
                  title={isAtInitialState ? "Undo (Ctrl+Z) - Cannot undo past initial state" : "Undo (Ctrl+Z)"}
                  className="w-5 h-5 p-1 sm:w-6 sm:h-6 sm:p-1.5"
                >
                  <FaUndo
                    size={8}
                    color={isAtInitialState ? "#cccccc" : "#707070"}
                    className="w-2 h-2 sm:w-3 sm:h-3"
                  />
                </IconButton>
              </Flex>
              <Flex alignItems="center" direction={"column-reverse"} className="flex flex-col-reverse items-center">
                <Text fontSize="xs" color="gray.600" marginX={2} className="text-2xs sm:text-xs text-gray-600 mx-1 sm:mx-2">
                  Làm lại
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  disabled={!canRedo}
                  onClick={() => actions.history.redo()}
                  title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
                  className="w-5 h-5 p-1 sm:w-6 sm:h-6 sm:p-1.5"
                >
                  <FaRedo size={8} color="#707070" className="w-2 h-2 sm:w-3 sm:h-3" />
                </IconButton>
              </Flex>
              <Flex alignItems="center" direction={"column-reverse"} className="flex flex-col-reverse items-center">
                <Text fontSize="xs" color="gray.600" marginX={2} className="text-2xs sm:text-xs text-gray-600 mx-1 sm:mx-2 hidden sm:block">
                  Cài đặt
                </Text>
                <MenuRoot>
                  <MenuTrigger asChild>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      title="Cài đặt"
                      className="w-5 h-5 p-1 sm:w-6 sm:h-6 sm:p-1.5"
                    >
                      <FaCog size={8} color="#707070" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </IconButton>
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem
                      value="option1"
                      onClick={() => showParticleEffectsModal(effects)}
                    >
                      <FaMagic size={14} color="#8B5CF6" style={{ marginRight: '8px' }} />
                      Cài đặt hiệu ứng
                    </MenuItem>
                    <MenuItem
                      value="option2"
                      onClick={() => showAudioSettingsModal(audioSettings || {})}
                    >
                      <FaVolumeUp size={14} color="#10B981" style={{ marginRight: '8px' }} />
                      Cài đặt âm thanh nền
                    </MenuItem>
                    <MenuItem
                      value="option3"
                      onClick={() => showCustomHtmlSettingsModal(customHtmlSettings || "")}
                    >
                      <FaCode size={14} color="#F59E0B" style={{ marginRight: '8px' }} />
                      Cài đặt HTML tùy chỉnh
                    </MenuItem>
                    <MenuItem
                      value="option4"
                      onClick={() => showSEOSettingsModal(seoSettings)}
                    >
                      <FaSearch size={14} color="#3B82F6" style={{ marginRight: '8px' }} />
                      Cài đặt SEO
                    </MenuItem>
                    <MenuItem
                      value="option5"
                      onClick={() => showNotificationSettingsModal(notificationSettings)}
                    >
                      <FaBell size={14} color="#EF4444" style={{ marginRight: '8px' }} />
                      Cài đặt thông báo lời chúc
                    </MenuItem>
                    <MenuItem
                      value="option6"
                      onClick={() => showCustomEffectsModal(customEffects || {})}
                    >
                      <FaMagic size={14} color="#EC4899" style={{ marginRight: '8px' }} />
                      Cài đặt hiệu ứng tùy chỉnh
                    </MenuItem>
                    <MenuItem
                      value="option7"
                      onClick={() => showFileManagementModal()}
                    >
                      <FaFolder size={14} color="#6B7280" style={{ marginRight: '8px' }} />
                      Quản lý File
                    </MenuItem>
                    <MenuItem
                      value="option8"
                      onClick={() => showViewportSettingsModal(viewportSettings)}
                    >
                      <FaDesktop size={14} color="#059669" style={{ marginRight: '8px' }} />
                      Cài đặt toàn trang
                    </MenuItem>
                  </MenuContent>
                </MenuRoot>
              </Flex>
            </Flex>
          )}
          {/* Hide platform toggle buttons when mobileOnly is enabled */}
          {!isMobileOnly(viewportSettings) && (
            <>
              <IconButton
                size="sm"
                onClick={() => {
                  saveAndSwitchToPlatform('desktop');
                }}
                title="Desktop - Edit desktop version (saves current changes)"
                variant={currentEditingPlatform === 'desktop' ? "solid" : "outline"}
                colorScheme={currentEditingPlatform === 'desktop' ? "blue" : "gray"}
                className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
              >
                <CiDesktop size={12} color={currentEditingPlatform === 'desktop' ? "#ffffff" : "#707070"} className="w-3 h-3 sm:w-4 sm:h-4" />
              </IconButton>

              <IconButton
                size="sm"
                onClick={() => {
                  console.log(`📱 Current platform: ${currentEditingPlatform}, switching to mobile`);
                  saveAndSwitchToPlatform('mobile');
                }}
                title="Mobile - Edit mobile version (saves current changes)"
                variant={currentEditingPlatform === 'mobile' ? "solid" : "outline"}
                colorScheme={currentEditingPlatform === 'mobile' ? "blue" : "gray"}
                className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
              >
                <CiMobile4 size={12} color={currentEditingPlatform === 'mobile' ? "#ffffff" : "#707070"} className="w-3 h-3 sm:w-4 sm:h-4" />
              </IconButton>
            </>
          )}

          {currentEditingPlatform === 'mobile' && enabled && (
            <IconButton
              onClick={() => {
                console.log('🔄 Syncing from desktop to mobile');
                syncFromDesktop();
              }}
              title={isMobileOnly(viewportSettings)
                ? "Đồng bộ từ desktop - Sync desktop content to mobile (works in mobile-only mode)"
                : "Đồng bộ từ desktop - Copy and adapt desktop layout to mobile"}
              variant="outline"
              colorScheme="orange"
              size="sm"
              className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
            >
              <FaSync size={10} color="#f56500" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </IconButton>
          )}

          <ChakraButton
            size="sm"
            colorScheme="green"
            className={cx([
              'transition cursor-pointer text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 h-6 sm:h-8',
              {
                'bg-green-400': enabled,
                'bg-primary': !enabled,
              },
            ])}
            onClick={() => {
              // Auto-save current content to preserve state
              autoSaveCurrentContent();

              // Trigger cross-platform sync before manual save
              crossPlatformSync(currentEditingPlatform);

              actions.setOptions((options) => (options.enabled = !enabled));
              const json = query.serialize();

              // Save to appropriate field based on current editing platform
              const saveData: any = {
                id: Number(id),
                data: {}
              };

              if (currentEditingPlatform === 'desktop') {
                saveData.data.content = lz.encodeBase64(lz.compress(json));
              } else {
                saveData.data.contentMobile = lz.encodeBase64(lz.compress(json));
              }

              handleSave(saveData);
            }}
          >
            {enabled ? (
              <FaCheck style={{ marginRight: '2px' }} size={8} className="mr-0.5 sm:mr-1 w-2 h-2 sm:w-3 sm:h-3" />
            ) : (
              <FaPencilAlt style={{ marginRight: '2px' }} size={8} className="mr-0.5 sm:mr-1 w-2 h-2 sm:w-3 sm:h-3" />
            )}
            <span className="hidden sm:block sm:text-sm">{enabled ? 'Lưu' : 'Sửa'}</span>
          </ChakraButton>

          {/* Publish Template Button - Only show in view-only mode for templates */}
          {!enabled && !isPageProp && !isPage && templateData && (
            <ChakraButton
              size="sm"
              colorScheme={templateData.isPublished ? "red" : "green"}
              variant="outline"
              loading={isPublishing}
              onClick={handleTogglePublish}
              className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 h-6 sm:h-8"
              title={templateData.isPublished ? "Hủy xuất bản template" : "Xuất bản template"}
            >
              {templateData.isPublished ? (
                <FaEyeSlash style={{ marginRight: '4px' }} size={8} className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              ) : (
                <FaGlobe style={{ marginRight: '4px' }} size={8} className="mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              )}
              <span className="text-2xs sm:text-sm">
                {templateData.isPublished ? 'Hủy xuất bản' : 'Xuất bản'}
              </span>
            </ChakraButton>
          )}

          {/* Share Button - Only show for pages or published templates */}
          {(isPageProp || isPage || (templateData && templateData.isPublished)) && (
            <ShareButton
              templateId={id}
              pageData={pageData}
              isPage={isPageProp || isPage}
            />
          )}

          {/* Sidebar toggle button */}
          {
            enabled && (
              <IconButton
                size="sm"
                variant="outline"
                onClick={toggleSidebarVisibility}
                title={isSidebarVisible ? "Ẩn sidebar" : "Hiển thị sidebar"}
                className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
              >
                <GiSettingsKnobs size={12} color="#707070" className="w-3 h-3 sm:w-4 sm:h-4" />
              </IconButton>
            )
          }
        </Flex>
      </Box>
      <Box width="100%" alignItems="center" position="relative" className="sm:hidden flex flex-col items-center justify-between gap-1 sm:gap-3">
        {/* Left Section */}
        <Flex gap={3} alignItems="center" flex="1" className="flex items-center gap-1 w-full justify-between">
          <div className='flex-1'>


            <IconButton
              size="sm"
              variant="outline"
              onClick={handleBackNavigation}
              title="Quay về"
              className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 text-xs sm:text-sm"
            >
              <FaArrowLeft size={10} className="sm:w-3.5 sm:h-3.5" />
            </IconButton>
            {
              enabled && (
                <IconButton
                  size="sm"
                  variant="outline"
                  onClick={() => toggleElementsPopup()}
                  title="Thêm elements"
                  className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 text-xs sm:text-sm"
                >
                  <FaPlus size={10} className="sm:w-3.5 sm:h-3.5" />
                </IconButton>
              )
            }
          </div>
          <div className='flex items-center gap-1 flex-1'>
            <div >

            <Image
              src={LogoMehappy}
              alt="meHappy"
              className="h-8 w-8 "
              style={{
                mixBlendMode: 'multiply',
                backgroundColor: 'transparent',
              }}
              />
              </div>
            <Text
              fontSize="xl"
              fontWeight="700"
              color="#e53e3e"
              fontFamily="Quicksand, sans-serif"
              lineHeight="1"
              display="flex"
              alignItems="center"
              height="45px"
              className="text-sm sm:text-lg md:text-xl font-bold text-red-500 leading-none flex items-center h-8 sm:h-10 md:h-12"
            >
              meHappy
            </Text>
          </div>
          <div className='flex justify-end flex-1 gap-2'>
            {
              enabled && (
                <MenuRoot>
                  <MenuTrigger asChild>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      title="Cài đặt"
                      className="w-5 h-5 p-1 sm:w-6 sm:h-6 sm:p-1.5"
                    >
                      <FaCog size={8} color="#707070" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </IconButton>
                  </MenuTrigger>
                  <MenuContent>
                    <MenuItem
                      value="option1"
                      onClick={() => showParticleEffectsModal(effects)}
                    >
                      <FaMagic size={14} color="#8B5CF6" style={{ marginRight: '8px' }} />
                      Cài đặt hiệu ứng
                    </MenuItem>
                    <MenuItem
                      value="option2"
                      onClick={() => showAudioSettingsModal(audioSettings || {})}
                    >
                      <FaVolumeUp size={14} color="#10B981" style={{ marginRight: '8px' }} />
                      Cài đặt âm thanh nền
                    </MenuItem>
                    <MenuItem
                      value="option3"
                      onClick={() => showCustomHtmlSettingsModal(customHtmlSettings || "")}
                    >
                      <FaCode size={14} color="#F59E0B" style={{ marginRight: '8px' }} />
                      Cài đặt HTML tùy chỉnh
                    </MenuItem>
                    <MenuItem
                      value="option4"
                      onClick={() => showSEOSettingsModal(seoSettings)}
                    >
                      <FaSearch size={14} color="#3B82F6" style={{ marginRight: '8px' }} />
                      Cài đặt SEO
                    </MenuItem>
                    <MenuItem
                      value="option5"
                      onClick={() => showNotificationSettingsModal(notificationSettings)}
                    >
                      <FaBell size={14} color="#EF4444" style={{ marginRight: '8px' }} />
                      Cài đặt thông báo lời chúc
                    </MenuItem>
                    <MenuItem
                      value="option6"
                      onClick={() => showCustomEffectsModal(customEffects || {})}
                    >
                      <FaMagic size={14} color="#EC4899" style={{ marginRight: '8px' }} />
                      Cài đặt hiệu ứng tùy chỉnh
                    </MenuItem>
                    <MenuItem
                      value="option7"
                      onClick={() => showFileManagementModal()}
                    >
                      <FaFolder size={14} color="#6B7280" style={{ marginRight: '8px' }} />
                      Quản lý File
                    </MenuItem>
                    <MenuItem
                      value="option8"
                      onClick={() => showViewportSettingsModal(viewportSettings)}
                    >
                      <FaDesktop size={14} color="#059669" style={{ marginRight: '8px' }} />
                      Cài đặt toàn trang
                    </MenuItem>
                  </MenuContent>
                </MenuRoot>
              )
            }

            <ChakraButton
              size="sm"
              colorScheme="green"
              className={cx([
                'transition cursor-pointer text-xs w-6 h-6 p-1 ',
                {
                  'bg-green-400': enabled,
                  'bg-primary': !enabled,
                },
              ])}
              onClick={() => {
                // Auto-save current content to preserve state
                autoSaveCurrentContent();

                // Trigger cross-platform sync before manual save
                crossPlatformSync(currentEditingPlatform);

                actions.setOptions((options) => (options.enabled = !enabled));
                const json = query.serialize();

                // Save to appropriate field based on current editing platform
                const saveData: any = {
                  id: Number(id),
                  data: {}
                };

                if (currentEditingPlatform === 'desktop') {
                  saveData.data.content = lz.encodeBase64(lz.compress(json));
                } else {
                  saveData.data.contentMobile = lz.encodeBase64(lz.compress(json));
                }

                handleSave(saveData);
              }}
            >
              {enabled ? (
                <FaCheck style={{ marginRight: '2px' }} size={8} className="mr-0.5 sm:mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              ) : (
                <FaPencilAlt style={{ marginRight: '2px' }} size={8} className="mr-0.5 sm:mr-1 w-2 h-2 sm:w-3 sm:h-3" />
              )}
              <span className="hidden sm:block sm:text-sm">{enabled ? 'Lưu' : 'Sửa'}</span>
            </ChakraButton>

            {/* Publish Template Button - Mobile version - Only show in view-only mode for templates */}
            {!enabled && !isPageProp && !isPage && templateData && (
              <ChakraButton
                size="sm"
                colorScheme={templateData.isPublished ? "red" : "green"}
                variant="outline"
                loading={isPublishing}
                onClick={handleTogglePublish}
                className="text-xs w-6 h-6 p-1 "
                title={templateData.isPublished ? "Hủy xuất bản template" : "Xuất bản template"}
              >
                {templateData.isPublished ? (
                  <FaEyeSlash style={{ marginRight: '2px' }} size={6} className="mr-0.5 w-1.5 h-1.5" />
                ) : (
                  <FaGlobe style={{ marginRight: '2px' }} size={6} className="mr-0.5 w-1.5 h-1.5" />
                )}
                <span className="text-2xs hidden sm:block">
                  {templateData.isPublished ? 'Hủy xuất bản' : 'Xuất bản'}
                </span>
              </ChakraButton>
            )}

            {/* Share Button - Mobile version - Only show for pages or published templates */}
            {(isPageProp || isPage || (templateData && templateData.isPublished)) && (
              <ShareButton
                templateId={id}
                pageData={pageData}
                isPage={isPageProp || isPage}
              />
            )}
          </div>
        </Flex>

        {/* Right Section */}
        <Box className="flex items-center gap-1 sm:gap-2 w-full min-w-0">
          {enabled && (
            <Flex gap={1} alignItems="center" className="flex items-center justify-between gap-1 w-full">
              <Text fontSize="sm" color="blue.500" cursor="pointer" fontWeight="medium" className="text-xs sm:text-sm">
                Xem hướng dẫn
              </Text>
              <div className='flex items-center gap-1'>
                <IconButton
                  size="xs"
                  variant="ghost"
                  disabled={!canUndo || isAtInitialState}
                  onClick={() => {
                    console.log('🔍 Mobile Undo button clicked - canUndo:', canUndo, 'isAtInitialState:', isAtInitialState);
                    if (!isAtInitialState && canUndo) {
                      actions.history.undo();
                    } else if (isAtInitialState) {
                      console.log('🚫 Undo blocked: Cannot undo past initial loaded state from backend');
                    }
                  }}
                  title={isAtInitialState ? "Undo (Ctrl+Z) - Cannot undo past initial state" : "Undo (Ctrl+Z)"}
                  className="w-5 h-5 p-1 sm:w-6 sm:h-6 sm:p-1.5"
                >
                  <FaUndo
                    size={8}
                    color={isAtInitialState ? "#cccccc" : "#707070"}
                    className="w-2 h-2 sm:w-3 sm:h-3"
                  />
                </IconButton>
                <IconButton
                  size="xs"
                  variant="ghost"
                  disabled={!canRedo}
                  onClick={() => actions.history.redo()}
                  title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
                  className="w-5 h-5 p-1 sm:w-6 sm:h-6 sm:p-1.5"
                >
                  <FaRedo size={8} color="#707070" className="w-2 h-2 sm:w-3 sm:h-3" />
                </IconButton>
                {currentEditingPlatform === 'mobile' && enabled && (
                  <IconButton
                    onClick={() => {
                      console.log('🔄 Syncing from desktop to mobile');
                      syncFromDesktop();
                    }}
                    title={isMobileOnly(viewportSettings)
                      ? "Đồng bộ từ desktop - Sync desktop content to mobile (works in mobile-only mode)"
                      : "Đồng bộ từ desktop - Copy and adapt desktop layout to mobile"}
                    variant="outline"
                    colorScheme="orange"
                    size="sm"
                    className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
                  >
                    <FaSync size={10} color="#f56500" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </IconButton>
                )}
                {
                  enabled && (
                    <IconButton
                      size="sm"
                      variant="outline"
                      onClick={toggleSidebarVisibility}
                      title={isSidebarVisible ? "Ẩn sidebar" : "Hiển thị sidebar"}
                      className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2"
                    >
                      <GiSettingsKnobs size={12} color="#707070" className="w-3 h-3 sm:w-4 sm:h-4" />
                    </IconButton>
                  )
                }
              </div>
            </Flex>
          )}
        </Box>
      </Box>
    </Box >
  );
};
