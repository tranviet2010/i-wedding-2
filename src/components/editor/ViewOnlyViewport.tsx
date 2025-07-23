import { Editor, Frame, useEditor } from '@craftjs/core';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { zIndex } from '@/utils/zIndex';
import { ViewOnlyRenderNode } from './ViewOnlyRenderNode'
import { Selectors } from '@/components/selectors';
import { LightBox } from '@/components/selectors/LightBox';
import { Effects, AudioSettings, NotificationSettings, CustomEffect } from '@/features/template/templateAPI';
import ParticlesBackground from '@/pages/ViewTemplate/ParticlesBackground';
import { MultiSelectProvider } from './contexts/MultiSelectContext';
import { ViewportProvider, useViewport } from './Viewport/ViewportContext';
import { ResponsivePlatformContext } from './contexts/ResponsivePlatformContext';
import { ViewportSettingsProvider, useViewportSettings, getDesktopBreakpoint, isMobileOnly } from './contexts/ViewportSettingsContext';
import { AudioPlayer } from './components/AudioPlayer';
import { toast, ToastContainer, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GiPartyPopper } from 'react-icons/gi';

// Hook to detect responsive platform based on window size (view-only, with page reload on platform change)
const useResponsivePlatform = (viewportSettings?: any) => {
  const [platform] = useState<'desktop' | 'mobile'>(() => {
    // Initialize platform based on current window size
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const breakpoint = viewportSettings ? getDesktopBreakpoint(viewportSettings) : 960;
      return width <= breakpoint ? 'mobile' : 'desktop';
    }
    return 'desktop';
  });

  useEffect(() => {
    const checkPlatform = () => {
      const width = window.innerWidth;
      const breakpoint = viewportSettings ? getDesktopBreakpoint(viewportSettings) : 960;
      // Use viewport settings breakpoint: Desktop: > breakpoint, Mobile: <= breakpoint
      const newPlatform: 'desktop' | 'mobile' = width <= breakpoint ? 'mobile' : 'desktop';

      if (newPlatform !== platform) {
        console.log(`🔄 Platform change detected: ${platform} → ${newPlatform}. Reloading page to apply new content...`);
        // Reload the page to prevent Frame component destruction and Craft.js node errors
        window.location.reload();
      }
    };

    // Listen for resize events with debounce to prevent excessive checks
    let resizeTimeout: number;
    const debouncedCheckPlatform = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(checkPlatform, 300); // 300ms debounce
    };

    window.addEventListener('resize', debouncedCheckPlatform);
    return () => {
      window.removeEventListener('resize', debouncedCheckPlatform);
      clearTimeout(resizeTimeout);
    };
  }, [platform]);

  return platform;
};
import { useGetGuestWishes, GuestWish } from '../../features/guest/guestsAPI';
import DOMPurify from 'dompurify';

// Custom Toast Component
interface ToastData {
  name: string;
  message: string;
  notificationSettings?: Partial<NotificationSettings>;
}

const CustomToast: React.FC<ToastData & { isMobile?: boolean }> = ({ name, message, notificationSettings, isMobile }) => {
  const shouldShowIcon = notificationSettings?.showIcon !== false;
  const useDefaultIcon = notificationSettings?.useDefaultIcon !== false;
  const iconColor = notificationSettings?.iconColor || '#FFD700';
  const size = notificationSettings?.size || 'medium';

  // Size configurations with mobile adjustments
  const sizeConfig = {
    small: {
      fontSize: isMobile ? '11px' : '12px',
      iconSize: isMobile ? '16px' : '18px',
      padding: isMobile ? '6px' : '8px',
      gap: isMobile ? '8px' : '10px'
    },
    medium: {
      fontSize: isMobile ? '12px' : '14px',
      iconSize: isMobile ? '18px' : '22px',
      padding: isMobile ? '8px' : '12px',
      gap: isMobile ? '10px' : '14px'
    },
    large: {
      fontSize: isMobile ? '13px' : '16px',
      iconSize: isMobile ? '20px' : '26px',
      padding: isMobile ? '10px' : '16px',
      gap: isMobile ? '12px' : '18px'
    }
  };

  const config = sizeConfig[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: config.gap,
      padding: config.padding
    }}>
      {shouldShowIcon && (
        useDefaultIcon ? (
          <GiPartyPopper
            style={{
              fontSize: config.iconSize,
              color: '#FFD700', // Keep default golden color for default icon
              flexShrink: 0
            }}
          />
        ) : notificationSettings?.iconUrl ? (
          <div
            style={{
              width: config.iconSize,
              height: config.iconSize,
              flexShrink: 0
            }}
            dangerouslySetInnerHTML={{
              __html: (() => {
                try {
                  if (notificationSettings.iconUrl.startsWith('data:image/svg+xml;base64,')) {
                    const svgCode = atob(notificationSettings.iconUrl.split(',')[1]);
                    return svgCode.replace(/fill="[^"]*"/g, `fill="${iconColor}"`);
                  }
                  return `<img src="${notificationSettings.iconUrl}" alt="notification icon" style="width: 100%; height: 100%; object-fit: contain;" />`;
                } catch (error) {
                  return `<img src="${notificationSettings.iconUrl}" alt="notification icon" style="width: 100%; height: 100%; object-fit: contain;" />`;
                }
              })()
            }}
          />
        ) : (
          <GiPartyPopper
            style={{
              fontSize: config.iconSize,
              color: '#FFD700', // Keep default golden color for fallback icon
              flexShrink: 0
            }}
          />
        )
      )}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: config.fontSize,
          marginBottom: '4px',
          color: '#333'
        }}>
          {name}
        </div>
        <div style={{
          fontSize: `calc(${config.fontSize} - 1px)`,
          color: '#666',
          lineHeight: '1.3'
        }}>
          {message}
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockToastData: ToastData[] = [
  {
    name: "Nguyễn Văn An",
    message: "Chúc mừng sinh nhật! Chúc bạn luôn khỏe mạnh và hạnh phúc!"
  },
  {
    name: "Trần Thị Bình",
    message: "Chúc mừng năm mới! Chúc bạn thành công trong công việc và cuộc sống!"
  },
  {
    name: "Lê Minh Cường",
    message: "Chúc mừng kỷ niệm! Chúc hai bạn trăm năm hạnh phúc!"
  },
  {
    name: "Phạm Thu Dung",
    message: "Chúc mừng tốt nghiệp! Chúc bạn tìm được công việc như ý!"
  },
  {
    name: "Hoàng Văn Em",
    message: "Chúc mừng thăng chức! Chúc bạn ngày càng thành đạt!"
  }
];

interface ViewOnlyViewportProps {
  id?: string;
  children?: React.ReactNode;
  content?: string;
  mobileContent?: string;
  effects?: Partial<Effects>;
  audioSettings?: Partial<AudioSettings>;
  notificationSettings?: Partial<NotificationSettings>;
  customHtmlSettings?: string;
  customEffects?: Partial<CustomEffect>;
  className?: string;
}

// Component to set wedding page ID inside the providers
const WeddingPageIdSetter: React.FC<{ id?: string }> = ({ id }) => {

  const { setWeddingPageId } = useViewport();

  useEffect(() => {
    if (id) {
      setWeddingPageId(id);
    }
  }, [id, setWeddingPageId]);

  return null; // This component doesn't render anything
};



// Component to handle content loading inside the Editor context
const ContentLoader: React.FC<{
  contentToRender: string | null | undefined;
  currentPlatform: 'desktop' | 'mobile';
}> = ({ contentToRender, currentPlatform }) => {
  const { actions, query } = useEditor();
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  useEffect(() => {

    if (contentToRender) {
      try {
        actions.deserialize(contentToRender);

        // Use MutationObserver to wait for DOM nodes to be actually created
        const waitForDOM = () => {
          const checkDOMNodes = () => {
            try {
              const nodes = query.getNodes();
              const nodeIds = Object.keys(nodes);

              // Check if at least one node has a DOM element
              const hasDOM = nodeIds.some(nodeId => {
                try {
                  const node = query.node(nodeId).get();
                  return node && node.dom;
                } catch {
                  return false;
                }
              });

              if (hasDOM) {
                setIsContentLoaded(true);
                return true;
              }
              return false;
            } catch (error) {
              return false;
            }
          };

          // Check immediately
          if (checkDOMNodes()) return;

          // Set up MutationObserver to watch for DOM changes
          const observer = new MutationObserver(() => {
            if (checkDOMNodes()) {
              observer.disconnect();
            }
          });

          // Observe the entire document for changes
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });

          // Fallback timeout in case observer doesn't work
          setTimeout(() => {
            observer.disconnect();
            if (!isContentLoaded) {
              setIsContentLoaded(true);
            }
          }, 2000);
        };

        // Small delay before starting to wait for DOM
        setTimeout(waitForDOM, 50);

      } catch (error) {
        console.error('❌ Failed to load content:', error);
        setIsContentLoaded(false);
      }
    } else {
      // No content to load, mark as loaded so children can render
      setIsContentLoaded(true);
    }
  }, [contentToRender, currentPlatform, actions, query, isContentLoaded]);

  return null; // Frame will handle the actual rendering
};

// Main viewport content component
const ViewOnlyViewportContent: React.FC<ViewOnlyViewportProps> = ({
  children,
  content,
  mobileContent,
  id,
  effects,
  audioSettings,
  notificationSettings,
  customHtmlSettings,
  customEffects,
  className = "view-page"
}) => {

  // Get viewport settings and pass to platform detection
  const { settings: viewportSettings } = useViewportSettings();
  const currentPlatform = useResponsivePlatform(viewportSettings);

  // Force mobile platform when mobileOnly is enabled
  const effectivePlatform = isMobileOnly(viewportSettings) ? 'mobile' : currentPlatform;

  const contentToRender = React.useMemo(() => {
    // If mobileOnly is enabled, always use mobile content regardless of screen size
    if (isMobileOnly(viewportSettings)) {
      return mobileContent || content;
    }

    if (effectivePlatform === 'mobile') {
      if (mobileContent) {
        return mobileContent;
      } else if (content) {
        return content;
      }
    } else {
      return content;
    }

    return content; // Final fallback
  }, [effectivePlatform, mobileContent, content, viewportSettings]);

  // Fetch guest wishes for this wedding page
  const { data: guestWishes, isLoading: isLoadingWishes } = useGetGuestWishes(id || null);


  const currentToastId = useRef<Id | null>(null);
  const isToastActive = useRef<boolean>(false);
  const nextToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to show the next toast
  const showNextToast = useCallback(() => {
    // Don't show toasts if notifications are disabled
    if (notificationSettings?.enabled === false) {
      return;
    }

    // Clear any existing timeout
    if (nextToastTimeout.current) {
      clearTimeout(nextToastTimeout.current);
      nextToastTimeout.current = null;
    }

    // Don't show new toast if one is already active
    if (isToastActive.current) {
      return;
    }

    const hasRealData = !!id && guestWishes;

    // Get the toast content based on data type
    const toastContent = hasRealData
      ? (() => {
        const publicWishes = guestWishes.filter(wish => wish.isPublic);
        const randomWish = publicWishes[Math.floor(Math.random() * publicWishes.length)];
        return { name: randomWish.guestName, message: randomWish.message };
      })()
      : (() => {
        const randomToast = mockToastData[Math.floor(Math.random() * mockToastData.length)];
        return { name: randomToast.name, message: randomToast.message };
      })();


    isToastActive.current = true;
    currentToastId.current = toast(<CustomToast name={toastContent.name} message={toastContent.message} notificationSettings={notificationSettings} isMobile={currentPlatform === 'mobile'} />, {
      position: "top-right",
      autoClose: notificationSettings?.displayDuration || 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        borderRadius: currentPlatform === 'mobile' ? '8px' : '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        ...(currentPlatform === 'mobile' && {
          maxWidth: '280px',
          fontSize: '12px'
        })
      },
      onClose: () => {
        // When toast closes, mark as inactive and schedule next toast
        isToastActive.current = false;
        currentToastId.current = null;

        // Schedule next toast immediately after current one closes
        nextToastTimeout.current = setTimeout(() => {
          showNextToast();
        }, 100); // Small delay to ensure smooth transition
      }
    });
  }, [guestWishes, notificationSettings]);

  // Initialize the toast sequence
  useEffect(() => {
    // Only show toasts if notifications are enabled
    if (notificationSettings?.enabled === false) {
      return;
    }

    // Show first toast after 3 seconds
    const initialTimeout = setTimeout(() => {
      showNextToast();
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      if (nextToastTimeout.current) {
        clearTimeout(nextToastTimeout.current);
      }
      // Dismiss any active toast on cleanup
      if (currentToastId.current) {
        toast.dismiss(currentToastId.current);
      }
    };
  }, [showNextToast, notificationSettings?.enabled]);

  // Auto-scroll functionality with permanent stop on user interaction
  useEffect(() => {
    // Only enable auto-scroll if it's configured and enabled
    if (!customEffects?.autoScroll?.enabled) {
      return;
    }

    const speed = customEffects.autoScroll.speed || 1;
    // Convert speed (1-10) to pixels per frame
    // Speed 1 = 0.5px per frame, Speed 10 = 3px per frame
    const pixelsPerFrame = 0.3 + (speed * 0.27); // Range: 0.57 to 3px per frame

    let animationId: number;
    let isScrollingToTop = false;
    let startTime: number | null = null;
    let startScrollTop = 0;
    let targetScrollTop = 0;
    let isDisabled = false; // Permanently disabled once user interacts
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let isAutoScrolling = false; // Flag to distinguish auto-scroll from user scroll

    const stopAutoScrollPermanently = () => {
      if (!isDisabled) {
        isDisabled = true;
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        // Reset scroll-to-top state if interrupted
        if (isScrollingToTop) {
          isScrollingToTop = false;
          startTime = null;
        }
        console.log('🛑 Auto-scroll disabled due to user interaction');
      }
    };

    const handleUserScroll = () => {
      // Only stop if this is not an auto-scroll event
      if (!isAutoScrolling && !isDisabled) {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // Only stop if there's actual scroll movement
        if (Math.abs(currentScrollTop - lastScrollTop) > 1) {
          stopAutoScrollPermanently();
        }
      }
      lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    };

    const smoothScrollToTop = (timestamp: number) => {
      if (isDisabled) return;

      if (!startTime) {
        startTime = timestamp;
        startScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        targetScrollTop = 0;
      }

      const elapsed = timestamp - startTime;
      const duration = 2000; // 2 seconds to scroll to top
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);

      const currentScrollTop = startScrollTop + (targetScrollTop - startScrollTop) * easedProgress;

      isAutoScrolling = true;
      window.scrollTo(0, currentScrollTop);
      isAutoScrolling = false;

      if (progress < 1 && !isDisabled) {
        animationId = requestAnimationFrame(smoothScrollToTop);
      } else if (progress >= 1 && !isDisabled) {
        // Reset for next cycle
        isScrollingToTop = false;
        startTime = null;
        lastScrollTop = 0;
        // Continue normal scrolling after a brief pause
        setTimeout(() => {
          if (customEffects?.autoScroll?.enabled && !isDisabled) {
            animationId = requestAnimationFrame(autoScrollFrame);
          }
        }, 1000);
      }
    };

    const autoScrollFrame = () => {
      if (isDisabled) return;

      // Check if we're at the bottom of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 10) {
        if (!isScrollingToTop) {
          // Start smooth scroll to top
          isScrollingToTop = true;
          startTime = null;
          animationId = requestAnimationFrame(smoothScrollToTop);
        }
      } else if (!isScrollingToTop) {
        // Continue scrolling down smoothly
        isAutoScrolling = true;
        window.scrollBy(0, pixelsPerFrame);
        isAutoScrolling = false;
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        animationId = requestAnimationFrame(autoScrollFrame);
      }
    };

    // Add event listeners for user scroll detection
    const scrollEvents = ['scroll', 'wheel', 'touchstart', 'touchmove'];
    const keyEvents = ['keydown']; // For keyboard navigation (arrow keys, page up/down, etc.)

    scrollEvents.forEach(event => {
      window.addEventListener(event, handleUserScroll, { passive: true });
    });

    const handleKeyDown = (e: Event) => {
      // Check if it's a navigation key
      const keyboardEvent = e as KeyboardEvent;
      const navigationKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (navigationKeys.includes(keyboardEvent.key)) {
        stopAutoScrollPermanently();
      }
    };

    keyEvents.forEach(event => {
      window.addEventListener(event, handleKeyDown, { passive: true });
    });

    // Wait 3 seconds after page load before starting auto-scroll
    const startDelay = setTimeout(() => {
      if (customEffects?.autoScroll?.enabled && !isDisabled) {
        console.log('🚀 Starting auto-scroll after 3 second delay');
        animationId = requestAnimationFrame(autoScrollFrame);
      }
    }, 3000);

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (startDelay) {
        clearTimeout(startDelay);
      }

      // Remove event listeners
      scrollEvents.forEach(event => {
        window.removeEventListener(event, handleUserScroll);
      });
      keyEvents.forEach(event => {
        window.removeEventListener(event, handleKeyDown);
      });
    };
  }, [customEffects?.autoScroll?.enabled, customEffects?.autoScroll?.speed]);

  return (
    <div className={className}>
      {effects && (
        ReactDOM.createPortal(
          <ParticlesBackground effects={effects as Effects} />,
          document.body
        )
      )}
      <Editor
        resolver={Selectors}
        enabled={false}
        onRender={ViewOnlyRenderNode}
      >
        <ResponsivePlatformContext.Provider value={effectivePlatform}>
          <ViewportProvider isViewOnly={true}>
            <MultiSelectProvider>
              <WeddingPageIdSetter id={id} />
              <ContentLoader
                contentToRender={contentToRender}
                currentPlatform={effectivePlatform}
              />
              {/* Frame with platform-specific key ensures proper content isolation.
                  Platform changes trigger page reload (see useResponsivePlatform) to prevent
                  Craft.js "Node does not exist" errors from Frame component destruction. */}
              <Frame key={`${currentPlatform}-frame`}>
                {!contentToRender && children}
              </Frame>
              {/* LightBox Modal Overlay */}
              <LightBox id="global-lightbox" />
            </MultiSelectProvider>
          </ViewportProvider>
        </ResponsivePlatformContext.Provider>
      </Editor>

      {audioSettings && (
        <AudioPlayer audioSettings={audioSettings} />
      )}

      {/* Toast Container - Only render if notifications are enabled */}
      {notificationSettings?.enabled !== false && (
        <ToastContainer
          position="top-right"
          autoClose={notificationSettings?.displayDuration || 6000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={1}
          style={{
            zIndex: zIndex.viewport,
            // Mobile adjustments: smaller size, move to right and down, reduce opacity
            ...(currentPlatform === 'mobile' && {
              '--toastify-toast-width': '280px',
              '--toastify-toast-min-height': '50px',
              opacity: '0.85',
              right: '30px',
              top: '30px'
            })
          }}
          toastStyle={currentPlatform === 'mobile' ? {
            fontSize: '13px',
            padding: '8px 12px',
            minHeight: '50px'
          } : undefined}
        />
      )}

      {/* Custom HTML Injection */}
      {customHtmlSettings && (
        ReactDOM.createPortal(
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(customHtmlSettings)
            }}
          />,
          document.body
        )
      )}
    </div>
  );
};

// Main component - providers are now inside Editor
export const ViewOnlyViewport: React.FC<ViewOnlyViewportProps> = (props) => {
  return <ViewOnlyViewportContent {...props} />;
};
