import React, { useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import { Box, Button, Flex, Text, IconButton } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { FaPlus, FaTrash, FaEdit, FaGripVertical, FaRegSave } from 'react-icons/fa';
import { zIndex } from '@/utils/zIndex';
import { QuickActionsSettings } from './QuickActionsSettings';
import { useViewport } from '../../editor/Viewport/ViewportContext';
import { EventItem, useEventHandling } from '@/components/editor/components/EventManager';
import { heartIcon } from '@/utils/iconTemplate';
import { AssetSaveModal } from '@/components/editor/components/AssetSaveModal';
import { css } from 'styled-components';

// Keyframe animation for tooltip
const growFromLeft = css`
  @keyframes growFromLeft {
    from {
      opacity: 0;
      transform: scale(0.8) translateX(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateX(0);
    }
  }
`;

// Interface for individual action button
export interface ActionButton {
  id: string;
  svgCode: string;
  iconColor: string;
  background: string;
  backgroundType: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  borderWidth: number[];
  borderColor: string;
  borderStyle: string;
  borderRadius: number[];
  events: EventItem[];
  // Tooltip settings
  tooltipEnabled: boolean;
  tooltipText: string;
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
  tooltipDelay: number;
}

// Position settings interface (similar to PinningManager)
export interface PositionSettings {
  enabled: boolean;
  position: string;
  topDistance: number;
  bottomDistance: number;
  leftDistance: number;
  rightDistance: number;
}

// Main component props interface (simplified for modal pattern)
export interface QuickActionsProps {
  id?: string;
  // Main trigger button styling
  triggerIcon: string;
  triggerIconColor: string;
  triggerBackground: string;
  triggerBackgroundType: string;
  triggerGradientType: string;
  triggerGradientAngle: number;
  triggerGradientColor1: string;
  triggerGradientColor2: string;
  triggerBorderWidth: number[];
  triggerBorderColor: string;
  triggerBorderStyle: string;
  triggerBorderRadius: number[];

  // Opened state trigger button styling
  triggerOpenIcon: string;
  triggerOpenIconColor: string;
  triggerOpenBackground: string;
  triggerOpenBackgroundType: string;
  triggerOpenGradientType: string;
  triggerOpenGradientAngle: number;
  triggerOpenGradientColor1: string;
  triggerOpenGradientColor2: string;
  triggerOpenBorderWidth: number[];
  triggerOpenBorderColor: string;
  triggerOpenBorderStyle: string;
  triggerOpenBorderRadius: number[];

  // Action buttons array
  actionButtons: ActionButton[];

  // Layout settings
  buttonSize: number;
  spacing: number;
  expandDirection: 'up' | 'down' | 'left' | 'right';
  animationDuration: number;

  // Position settings
  position: PositionSettings;
}

const defaultProps: QuickActionsProps = {
  // Trigger button defaults
  triggerIcon: heartIcon,
  triggerIconColor: '#ffffff',
  triggerBackground: '#4158D0',
  triggerBackgroundType: 'color',
  triggerGradientType: 'linear',
  triggerGradientAngle: 90,
  triggerGradientColor1: '#4158D0',
  triggerGradientColor2: '#C850C0',
  triggerBorderWidth: [0, 0, 0, 0],
  triggerBorderColor: '#000000',
  triggerBorderStyle: 'solid',
  triggerBorderRadius: [25, 25, 25, 25],

  // Opened state trigger button defaults
  triggerOpenIcon: '×', // Default to X icon when opened
  triggerOpenIconColor: '#ffffff',
  triggerOpenBackground: '#ff4757',
  triggerOpenBackgroundType: 'color',
  triggerOpenGradientType: 'linear',
  triggerOpenGradientAngle: 90,
  triggerOpenGradientColor1: '#ff4757',
  triggerOpenGradientColor2: '#ff3838',
  triggerOpenBorderWidth: [0, 0, 0, 0],
  triggerOpenBorderColor: '#000000',
  triggerOpenBorderStyle: 'solid',
  triggerOpenBorderRadius: [25, 25, 25, 25],

  // Action buttons defaults
  actionButtons: [],

  // Layout defaults
  buttonSize: 50,
  spacing: 10,
  expandDirection: 'up',
  animationDuration: 300,

  // Position defaults
  position: {
    enabled: true,
    position: 'bottom-right',
    topDistance: 20,
    bottomDistance: 20,
    leftDistance: 20,
    rightDistance: 20,
  },
};

export const QuickActions: UserComponent<Partial<QuickActionsProps>> = (props) => {
  const mergedProps = {
    ...defaultProps,
    ...props,
    // Ensure position object is properly merged with defaults
    position: {
      ...defaultProps.position,
      ...props.position
    }
  };
  const { actionButtons, triggerIcon, triggerIconColor, buttonSize, spacing, expandDirection, animationDuration, position } = mergedProps;

  const { query, enabled, actions } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    connectors: { connect },
    id,
    selected,
    actions: { setProp }
  } = useNode((node) => ({
    selected: node.events.selected
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const [localExpanded, setLocalExpanded] = useState(false);
  const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(null);
  const [isAssetSaveModalOpen, setIsAssetSaveModalOpen] = useState(false);
  const { closePopup, currentPopupIdOpen, openPopup } = useViewport();
  // Get popup open state from viewport context (same pattern as AlbumModal)
  const isOpen = id === currentPopupIdOpen;
  
  
  // Auto-open QuickActions when selected in editor mode (same pattern as AlbumModal)
  React.useEffect(() => {
    if (enabled && selected && !isOpen) {
      console.log('🔥 Opening QuickActions for editing:', { id, selected, enabled });
      openPopup(id);
      // Select the node when modal opens
      actions.selectNode(id);
    }
  }, [enabled, selected, isOpen, id, openPopup, actions]);

  // Click outside to close QuickActions in preview mode
  React.useEffect(() => {
    if (!enabled && localExpanded) {
      const handleClickOutside = (event: MouseEvent) => {
        if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
          setLocalExpanded(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setLocalExpanded(false);
        }
      };

      // Add event listeners
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, localExpanded]);

  // Create event handlers for action buttons using EventManager's useEventHandling
  // We need to create individual hooks for each action button to avoid calling hooks in a loop
  const actionButton0Handler = useEventHandling(actionButtons[0]?.events || [], actionButtons[0]?.id);
  const actionButton1Handler = useEventHandling(actionButtons[1]?.events || [], actionButtons[1]?.id);
  const actionButton2Handler = useEventHandling(actionButtons[2]?.events || [], actionButtons[2]?.id);
  const actionButton3Handler = useEventHandling(actionButtons[3]?.events || [], actionButtons[3]?.id);
  const actionButton4Handler = useEventHandling(actionButtons[4]?.events || [], actionButtons[4]?.id);
  const actionButton5Handler = useEventHandling(actionButtons[5]?.events || [], actionButtons[5]?.id);
  const actionButton6Handler = useEventHandling(actionButtons[6]?.events || [], actionButtons[6]?.id);
  const actionButton7Handler = useEventHandling(actionButtons[7]?.events || [], actionButtons[7]?.id);

  // Create an array of handlers for easy access
  const actionButtonHandlers = [
    actionButton0Handler,
    actionButton1Handler,
    actionButton2Handler,
    actionButton3Handler,
    actionButton4Handler,
    actionButton5Handler,
    actionButton6Handler,
    actionButton7Handler,
  ];
  

  // Position calculation function (similar to PinningManager)
  const getPositionStyles = (positionSettings: PositionSettings) => {
    // Safety check for position settings
    if (!positionSettings || !positionSettings.enabled) {
      return {
        position: 'fixed' as const,
        bottom: '20px',
        right: '20px',
      };
    }

    const styles: any = {
      position: 'fixed' as const,
    };

    switch (positionSettings.position) {
      case 'top-left':
        styles.top = `${positionSettings.topDistance}px`;
        styles.left = `${positionSettings.leftDistance}px`;
        break;
      case 'top-center':
        styles.top = `${positionSettings.topDistance}px`;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'top-right':
        styles.top = `${positionSettings.topDistance}px`;
        styles.right = `${positionSettings.rightDistance}px`;
        break;
      case 'middle-left':
        styles.top = '50%';
        styles.left = `${positionSettings.leftDistance}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'middle-right':
        styles.top = '50%';
        styles.right = `${positionSettings.rightDistance}px`;
        styles.transform = 'translateY(-50%)';
        break;
      case 'bottom-left':
        styles.bottom = `${positionSettings.bottomDistance}px`;
        styles.left = `${positionSettings.leftDistance}px`;
        break;
      case 'bottom-center':
        styles.bottom = `${positionSettings.bottomDistance}px`;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
      default:
        styles.bottom = `${positionSettings.bottomDistance}px`;
        styles.right = `${positionSettings.rightDistance}px`;
        break;
    }

    return styles;
  };

  // Action button management functions
  const addActionButton = () => {
    // Limit to maximum 8 action buttons
    if (actionButtons.length >= 8) {
      return;
    }

    const newActionButton: ActionButton = {
      id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      svgCode: heartIcon, // Default icon
      iconColor: '#ffffff',
      background: '#4158D0',
      backgroundType: 'color',
      gradientType: 'linear',
      gradientAngle: 90,
      gradientColor1: '#4158D0',
      gradientColor2: '#C850C0',
      borderWidth: [0, 0, 0, 0],
      borderColor: '#000000',
      borderStyle: 'solid',
      borderRadius: [25, 25, 25, 25],
      events: [],
      // Tooltip defaults
      tooltipEnabled: false,
      tooltipText: 'Hành động',
      tooltipPosition: 'left',
      tooltipDelay: 10
    };

    setProp((props: QuickActionsProps) => {
      props.actionButtons = [...props.actionButtons, newActionButton];
    });

    // Select the newly added button
    setSelectedActionIndex(actionButtons.length);
  };

  const removeActionButton = (index: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa action button này không?')) {
      setProp((props: QuickActionsProps) => {
        props.actionButtons = props.actionButtons.filter((_, i) => i !== index);
      });

      // Reset selection if the selected button was removed
      if (selectedActionIndex === index) {
        setSelectedActionIndex(null);
      } else if (selectedActionIndex !== null && selectedActionIndex > index) {
        setSelectedActionIndex(selectedActionIndex - 1);
      }
    }
  };

  const moveActionButton = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setProp((props: QuickActionsProps) => {
      const newActionButtons = [...props.actionButtons];
      const [movedButton] = newActionButtons.splice(fromIndex, 1);
      newActionButtons.splice(toIndex, 0, movedButton);
      props.actionButtons = newActionButtons;
    });

    // Update selection if needed
    if (selectedActionIndex === fromIndex) {
      setSelectedActionIndex(toIndex);
    } else if (selectedActionIndex !== null) {
      if (fromIndex < selectedActionIndex && toIndex >= selectedActionIndex) {
        setSelectedActionIndex(selectedActionIndex - 1);
      } else if (fromIndex > selectedActionIndex && toIndex <= selectedActionIndex) {
        setSelectedActionIndex(selectedActionIndex + 1);
      }
    }
  };

  const updateActionButton = (index: number, updates: Partial<ActionButton>) => {
    setProp((props: QuickActionsProps) => {
      props.actionButtons = props.actionButtons.map((button, i) =>
        i === index ? { ...button, ...updates } : button
      );
    });
  };

  // Handle backdrop click to close modal (same pattern as AlbumModal)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !enabled) {
      closePopup();
      setSelectedActionIndex(null);
    }
  };

  // Handle close button click (same pattern as AlbumModal)
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enabled) {
      // In editor mode, close the popup and deselect the node
      closePopup();
      actions.selectNode([]);
    } else {
      // In preview mode, actually close the modal
      closePopup();
    }
    setSelectedActionIndex(null);
  };

  // Function to apply icon color to SVG
  const applyIconColorToSvg = useCallback((svgString: string, color: string): string => {
    if (!svgString || !color) return svgString;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');

    if (svgElement) {
      svgElement.setAttribute('fill', color);
      const pathElements = svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');
      pathElements.forEach(element => {
        const currentFill = element.getAttribute('fill');
        if (!currentFill || (currentFill !== 'none' && currentFill !== 'transparent')) {
          element.setAttribute('fill', color);
        }
      });
      return new XMLSerializer().serializeToString(svgDoc);
    }

    return svgString;
  }, []);

  // Generate background CSS based on background type
  const getBackgroundCSS = useCallback((
    backgroundType: string,
    background: string,
    gradientType: string,
    gradientAngle: number,
    gradientColor1: string,
    gradientColor2: string
  ) => {
    if (backgroundType === 'gradient') {
      const type = gradientType === 'radial' ? 'radial-gradient' : 'linear-gradient';
      const angle = gradientType === 'linear' ? `${gradientAngle}deg, ` : '';
      return `${type}(${angle}${gradientColor1}, ${gradientColor2})`;
    }
    return background;
  }, []);

  // Generate border radius CSS
  const getBorderRadiusCSS = useCallback((borderRadius: number[]) => {
    if (borderRadius && borderRadius.length === 4) {
      if (
        borderRadius[0] === borderRadius[1] &&
        borderRadius[1] === borderRadius[2] &&
        borderRadius[2] === borderRadius[3]
      ) {
        return `${borderRadius[0]}px`;
      }
      return `${borderRadius[0]}px ${borderRadius[1]}px ${borderRadius[2]}px ${borderRadius[3]}px`;
    }
    return '25px';
  }, []);

  // Handle trigger button click in preview mode
  const handleTriggerClick = useCallback(() => {
    if (enabled) return; // Don't toggle in editor mode
    setLocalExpanded(!localExpanded);
  }, [enabled, localExpanded]);

  // Handle action button click in preview mode - Use EventManager's event handling
  const handleActionClick = useCallback((actionButton: ActionButton, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (enabled) return;

    // Use the pre-created event handler for this action button
    const handler = actionButtonHandlers[index];
    if (handler) {
      handler.handleClick();
    }

    // Close the QuickActions after executing the action
    setLocalExpanded(false);
  }, [enabled, actionButtonHandlers]);

  // Helper function to render action button with tooltip
  const renderActionButtonWithTooltip = useCallback((actionButton: ActionButton, index: number, buttonElement: React.ReactElement) => {
    if (!actionButton.tooltipEnabled || !actionButton.tooltipText) {
      return buttonElement;
    }

    // Ensure tooltipPosition has a valid value, fallback to 'left'
    const tooltipPosition = actionButton.tooltipPosition || 'left';
    
    // Calculate transform-origin based on tooltip position
    const getTransformOrigin = (position: string) => {
      switch (position) {
        case 'left': return 'right center';
        case 'right': return 'left center';
        case 'top': return 'center bottom';
        case 'bottom': return 'center top';
        default: return 'right center';
      }
    };

    return (
      <Tooltip
        content={actionButton.tooltipText}
        positioning={{ placement: tooltipPosition as 'top' | 'bottom' | 'left' | 'right' }}
        openDelay={actionButton.tooltipDelay || 10}
        closeDelay={300}
        contentProps={{
          css: css`
            animation: growFromLeft 0.2s ease-out;
            transform-origin: ${getTransformOrigin(tooltipPosition)};
            font-size: 14px;
            padding: 8px 12px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 6px;
            white-space: nowrap;
            z-index: ${zIndex.tooltipContent};
          `
        }}
      >
        {buttonElement}
      </Tooltip>
    );
  }, []);

  // In editor mode, show a simplified modal for editing when selected
  if (enabled && isOpen) {
    return (
      <div
        ref={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: zIndex.quickActionsMain,
          backdropFilter: 'blur(2px)',
        }}
        onClick={handleCloseClick}
      >
        <div
          ref={containerRef}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button at top of modal in editor mode */}
          <button
            onClick={handleCloseClick}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#666';
            }}
            title="Đóng modal QuickActions"
          >
            ×
          </button>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              QuickActions - Chế độ chỉnh sửa
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              Cấu hình các nút hành động nổi
            </p>
          </div>

          {/* Preview Section */}
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }} >
            <Text fontSize="sm" fontWeight="medium" mb={3}>Xem trước:</Text>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', }} data-quickactions-preview>
              {/* Action buttons preview */}
              {actionButtons.map((actionButton, index) => {
                const offset = (buttonSize + spacing) * (index + 1);
                const actionPosition = expandDirection === 'up' ? { bottom: offset } : { top: offset };

                const processedActionIcon = actionButton.iconColor ?
                  applyIconColorToSvg(actionButton.svgCode, actionButton.iconColor) : actionButton.svgCode;

                return (
                  <div
                    key={actionButton.id}
                    style={{
                      position: 'absolute',
                      ...actionPosition,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: `${buttonSize}px`,
                      height: `${buttonSize}px`,
                      background: getBackgroundCSS(
                        actionButton.backgroundType,
                        actionButton.background,
                        actionButton.gradientType,
                        actionButton.gradientAngle,
                        actionButton.gradientColor1,
                        actionButton.gradientColor2
                      ),
                      borderRadius: getBorderRadiusCSS(actionButton.borderRadius),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: localExpanded ? 1 : 0.3,
                      transition: `all ${animationDuration}ms ease-in-out`,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                    onClick={() => setSelectedActionIndex(index)}
                  >
                    {processedActionIcon ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: processedActionIcon }}
                        style={{
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                    ) : (
                      <Box color="white" fontSize="16px">?</Box>
                    )}
                  </div>
                );
              })}

              {/* Main trigger button preview */}
              <div
                style={{
                  position: 'relative',
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  background: localExpanded ? getBackgroundCSS(
                    mergedProps.triggerOpenBackgroundType,
                    mergedProps.triggerOpenBackground,
                    mergedProps.triggerOpenGradientType,
                    mergedProps.triggerOpenGradientAngle,
                    mergedProps.triggerOpenGradientColor1,
                    mergedProps.triggerOpenGradientColor2
                  ) : getBackgroundCSS(
                    mergedProps.triggerBackgroundType,
                    mergedProps.triggerBackground,
                    mergedProps.triggerGradientType,
                    mergedProps.triggerGradientAngle,
                    mergedProps.triggerGradientColor1,
                    mergedProps.triggerGradientColor2
                  ),
                  borderRadius: localExpanded ? getBorderRadiusCSS(mergedProps.triggerOpenBorderRadius) : getBorderRadiusCSS(mergedProps.triggerBorderRadius),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: `all ${animationDuration}ms ease-in-out`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
                onClick={() => setLocalExpanded(!localExpanded)}
              >
                {localExpanded ? (
                  // Show opened state icon
                  mergedProps.triggerOpenIcon ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: applyIconColorToSvg(mergedProps.triggerOpenIcon, mergedProps.triggerOpenIconColor) }}
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all ${animationDuration}ms ease-in-out`,
                      }}
                    />
                  ) : (
                    <Box
                      color={mergedProps.triggerOpenIconColor}
                      fontSize="20px"
                      style={{
                        transition: `all ${animationDuration}ms ease-in-out`,
                      }}
                    >
                      ×
                    </Box>
                  )
                ) : (
                  // Show default state icon
                  triggerIcon ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: applyIconColorToSvg(triggerIcon, triggerIconColor) }}
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all ${animationDuration}ms ease-in-out`,
                      }}
                    />
                  ) : (
                    <Box
                      color={triggerIconColor}
                      fontSize="20px"
                      style={{
                        transition: `all ${animationDuration}ms ease-in-out`,
                      }}
                    >
                      +
                    </Box>
                  )
                )}
              </div>
            </div>
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              Nhấp vào nút kích hoạt để kiểm tra mở rộng/thu gọn
            </Text>

            {/* Save Asset Button */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => setIsAssetSaveModalOpen(true)}
              >
                <FaRegSave style={{ marginRight: '8px' }} />
                Lưu làm mẫu
              </Button>
            </div>
          </div>

          {/* Action Buttons Management */}
          <div style={{ marginBottom: '20px' }}>
            <Flex justify="space-between" align="center" mb={3}>
              <Text fontSize="sm" fontWeight="medium">Nút hành động ({actionButtons.length}/8)</Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={addActionButton}
                disabled={actionButtons.length >= 8}
                title={actionButtons.length >= 8 ? "Đã đạt giới hạn tối đa 8 nút" : "Thêm nút hành động"}
              >
                <FaPlus style={{ marginRight: '8px' }} />
                Thêm nút
              </Button>
            </Flex>

            {actionButtons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {actionButtons.map((actionButton, index) => (
                  <div
                    key={actionButton.id}
                    style={{
                      padding: '12px',
                      border: selectedActionIndex === index ? '2px solid #3182ce' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: selectedActionIndex === index ? '#f7fafc' : 'white',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedActionIndex(index)}
                  >
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap={3}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          cursor="grab"
                          aria-label="Kéo để sắp xếp lại"
                        >
                          <FaGripVertical />
                        </IconButton>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            background: getBackgroundCSS(
                              actionButton.backgroundType,
                              actionButton.background,
                              actionButton.gradientType,
                              actionButton.gradientAngle,
                              actionButton.gradientColor1,
                              actionButton.gradientColor2
                            ),
                            borderRadius: getBorderRadiusCSS(actionButton.borderRadius),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {actionButton.svgCode ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: applyIconColorToSvg(actionButton.svgCode, actionButton.iconColor)
                              }}
                              style={{
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            />
                          ) : (
                            <Box color="white" fontSize="12px">?</Box>
                          )}
                        </div>
                        <div>
                          <Text fontSize="sm" fontWeight="medium">
                            Nút hành động {index + 1}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {actionButton.events.length} sự kiện đã cấu hình
                          </Text>
                        </div>
                      </Flex>
                      <Flex gap={2}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          aria-label="Chỉnh sửa nút"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActionIndex(index);
                          }}
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Xóa nút"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeActionButton(index);
                          }}
                        >
                          <FaTrash />
                        </IconButton>
                      </Flex>
                    </Flex>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                border: '2px dashed #e2e8f0',
                borderRadius: '8px',
                color: '#718096'
              }}>
                <Text fontSize="sm" mb={2}>Chưa có nút hành động nào được cấu hình</Text>
                <Text fontSize="xs">Nhấp "Thêm nút" để tạo nút hành động đầu tiên</Text>
              </div>
            )}
          </div>
        </div>

        {/* Asset Save Modal */}
        <AssetSaveModal
          isOpen={isAssetSaveModalOpen}
          onClose={() => setIsAssetSaveModalOpen(false)}
          elementName="QuickActions"
          nodeId={id}
        />
      </div>
    );
  }

  // In preview mode (!enabled), always render the floating QuickActions
  if (!enabled) {
    // Always render a hidden connectable element for craft.js settings
  const hiddenConnectableElement = (
    <div
      ref={(dom: HTMLDivElement | null) => {
        if (dom) connect(dom);
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: zIndex.behind,
      }}
      data-quickactions-id={id}
    />
  );



  // In preview mode, show the actual QuickActions floating interface
  return (
    ReactDOM.createPortal(
      <>
        {hiddenConnectableElement}
        <div
          ref={quickActionsRef}
          className='quickactions-floating-container'
          style={{
            ...getPositionStyles(position),
            zIndex: zIndex.quickActions,
          }}
        >
          {/* Action buttons */}
          {actionButtons.map((actionButton, index) => {
            const offset = (buttonSize + spacing) * (index + 1);
            const actionPosition = expandDirection === 'up' ? { bottom: offset } : { top: offset };

            const processedActionIcon = actionButton.iconColor ?
              applyIconColorToSvg(actionButton.svgCode, actionButton.iconColor) : actionButton.svgCode;

            const actionButtonElement = (
              <div
                key={actionButton.id}
                style={{
                  position: 'absolute',
                  ...actionPosition,
                  left: 0,
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  background: getBackgroundCSS(
                    actionButton.backgroundType,
                    actionButton.background,
                    actionButton.gradientType,
                    actionButton.gradientAngle,
                    actionButton.gradientColor1,
                    actionButton.gradientColor2
                  ),
                  borderRadius: getBorderRadiusCSS(actionButton.borderRadius),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: localExpanded ? 1 : 0,
                  transform: localExpanded ? 'scale(1)' : 'scale(0)',
                  transition: `all ${animationDuration}ms ease-in-out`,
                  transitionDelay: localExpanded ? `${index * 50}ms` : '0ms',
                  zIndex: zIndex.quickActionsBackground,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
                onClick={(e) => handleActionClick(actionButton, index, e)}
              >
                {processedActionIcon ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: processedActionIcon }}
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                ) : (
                  <Box color="white" fontSize="16px">?</Box>
                )}
              </div>
            );

            return renderActionButtonWithTooltip(actionButton, index, actionButtonElement);
          })}

          {/* Main trigger button */}
          <div
            style={{
              position: 'relative',
              width: `${buttonSize}px`,
              height: `${buttonSize}px`,
              background: localExpanded ? getBackgroundCSS(
                mergedProps.triggerOpenBackgroundType,
                mergedProps.triggerOpenBackground,
                mergedProps.triggerOpenGradientType,
                mergedProps.triggerOpenGradientAngle,
                mergedProps.triggerOpenGradientColor1,
                mergedProps.triggerOpenGradientColor2
              ) : getBackgroundCSS(
                mergedProps.triggerBackgroundType,
                mergedProps.triggerBackground,
                mergedProps.triggerGradientType,
                mergedProps.triggerGradientAngle,
                mergedProps.triggerGradientColor1,
                mergedProps.triggerGradientColor2
              ),
              borderRadius: localExpanded ? getBorderRadiusCSS(mergedProps.triggerOpenBorderRadius) : getBorderRadiusCSS(mergedProps.triggerBorderRadius),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: `all ${animationDuration}ms ease-in-out`,
              zIndex: zIndex.quickActions,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
            onClick={handleTriggerClick}
          >
            {localExpanded ? (
              // Show opened state icon
              mergedProps.triggerOpenIcon ? (
                <div
                  dangerouslySetInnerHTML={{ __html: applyIconColorToSvg(mergedProps.triggerOpenIcon, mergedProps.triggerOpenIconColor) }}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${animationDuration}ms ease-in-out`,
                  }}
                />
              ) : (
                <Box
                  color={mergedProps.triggerOpenIconColor}
                  fontSize="20px"
                  style={{
                    transition: `all ${animationDuration}ms ease-in-out`,
                  }}
                >
                  ×
                </Box>
              )
            ) : (
              // Show default state icon
              triggerIcon ? (
                <div
                  dangerouslySetInnerHTML={{ __html: applyIconColorToSvg(triggerIcon, triggerIconColor) }}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${animationDuration}ms ease-in-out`,
                  }}
                />
              ) : (
                <Box
                  color={triggerIconColor}
                  fontSize="20px"
                  style={{
                    transition: `all ${animationDuration}ms ease-in-out`,
                  }}
                >
                  +
                </Box>
              )
            )}
          </div>
        </div>
      </>, document.body)
    );
  }

  // If we reach here, it means we're in editor mode but not selected
  // Return hidden connectable element only
  return (
    <div
      ref={(dom: HTMLDivElement | null) => {
        if (dom) connect(dom);
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: zIndex.behind,
      }}
      data-quickactions-id={id}
    />
  );
};

QuickActions.craft = {
  displayName: 'QuickActions',
  props: defaultProps,
  rules: {
    canDrag: () => false,
    canDrop: () => false,
    canMoveIn: () => false, // Modal-based components don't accept child components
  },
  related: {
    toolbar: QuickActionsSettings,
  },
};
