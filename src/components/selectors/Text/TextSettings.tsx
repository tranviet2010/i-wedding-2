import {
  Box,
  Button,
  Combobox,
  Grid,
  HStack,
  Input,
  Portal,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  useFilter,
  useListCollection
} from '@chakra-ui/react';
import { useNode } from '@craftjs/core';
import React, { useEffect, useState } from 'react';
import { StyledFontSelector } from '../../editor/components/StyledFontSelector';
import { FaAlignCenter, FaAlignJustify, FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import { HiBold, HiItalic, HiStrikethrough, HiUnderline } from "react-icons/hi2";
import { RiDragMoveLine, RiExpandWidthFill, RiLetterSpacing2, RiLineHeight2 } from "react-icons/ri";
import { RxLetterCaseUppercase } from "react-icons/rx";
import { ColorPickerModal } from '../../editor/components/ColorPickerModal';
import { DraggableNumberInput } from '../../editor/components/DraggableNumberInput';
import { Tooltip } from '../../ui/tooltip';
import { GiCube, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdRotate90DegreesCcw, MdRotate90DegreesCw } from 'react-icons/md';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { CrossPlatformSyncToggle } from '../../editor/components/CrossPlatformSyncToggle';
import { fonts, textTransformOptions, backgroundTypeOptions, gradientTypeOptions, gradientTemplates, backgroundPositionOptions, backgroundRepeatOptions, advancedBackgroundSizeOptions } from '@/utils/settingProfile';
import { EventItem, EventManager } from '@/components/editor/components/EventManager';
import { AnimationManager, DisplayAnimationItem, HoverAnimationSettings } from '@/components/editor/components/AnimationManager';
import { PinningManager, PinningSettings } from '@/components/editor/components/PinningManager';
import { FileType } from '@/features/files/fileAPI';
import { NodeControlsPanel } from '@/components/editor/components/NodeControlsPanel';

interface TextProps {
  fontSize: string;
  textAlign: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  shadow: number;
  text: string;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  textTransform: string;
  textDecoration: string;
  textShadow: {
    x: number;
    y: number;
    blur: number;
    color: string;
    enabled: boolean;
  };
  textStroke: {
    width: number;
    color: string;
  };
  // Background properties
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor: string;
  gradientType: string;
  gradientAngle: number;
  gradientColor1: string;
  gradientColor2: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundAttachment: string;

  opacity: number;
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  skewX: number;
  skewY: number;
  perspective: number;
  width: string;
  blendMode?: string;
  contrast?: number;
  brightness?: number;
  saturate?: number;
  grayscale?: number;
  invert?: number;
  sepia?: number;
  hueRotate?: number;
  initField?: string;
  isChildOfButton?: boolean;
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
}

const initFieldOptions = [
  { value: 'none', label: 'None' },
  { value: 'groom', label: 'Tên chú rể' },
  { value: 'bride', label: 'Tên cô dâu' },
  { value: 'date', label: 'Ngày cưới' },
  { value: 'location', label: 'Địa điểm' },
  { value: 'groomPhone', label: 'SĐT chú rể' },
  { value: 'groomLocation', label: 'Địa chỉ chú rể' },
  { value: 'groomDescription', label: 'Mô tả chú rể' },
  { value: 'groomParents.father', label: 'Cha chú rể' },
  { value: 'groomParents.mother', label: 'Mẹ chú rể' },
  { value: 'groomBankInfo.bankName', label: 'Ngân hàng chú rể' },
  { value: 'groomBankInfo.accountNumber', label: 'STK chú rể' },
  { value: 'groomBankInfo.accountHolder', label: 'Chủ TK chú rể' },
  { value: 'bridePhone', label: 'SĐT cô dâu' },
  { value: 'brideLocation', label: 'Địa chỉ cô dâu' },
  { value: 'brideDescription', label: 'Mô tả cô dâu' },
  { value: 'brideParents.father', label: 'Cha cô dâu' },
  { value: 'brideParents.mother', label: 'Mẹ cô dâu' },
  { value: 'brideBankInfo.bankName', label: 'Ngân hàng cô dâu' },
  { value: 'brideBankInfo.accountNumber', label: 'STK cô dâu' },
  { value: 'brideBankInfo.accountHolder', label: 'Chủ TK cô dâu' },
  { value: 'domain', label: 'Tên miền' },
  { value: 'subDomain', label: 'Tên miền phụ' },
  // Social media URLs (for link components)
  { value: 'groomSocialLinks.0.url', label: 'Link MXH 1 chú rể' },
  { value: 'groomSocialLinks.1.url', label: 'Link MXH 2 chú rể' },
  { value: 'groomSocialLinks.2.url', label: 'Link MXH 3 chú rể' },
  { value: 'brideSocialLinks.0.url', label: 'Link MXH 1 cô dâu' },
  { value: 'brideSocialLinks.1.url', label: 'Link MXH 2 cô dâu' },
  { value: 'brideSocialLinks.2.url', label: 'Link MXH 3 cô dâu' },
];

// Add blend mode options
const blendModeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

export const TextSettings = () => {
  const {
    actions: { setProp },
    props,
    node
  } = useNode((node) => ({
    props: {
      ...node.data.props as TextProps,
      textShadow: (node.data.props as TextProps).textShadow || { x: 0, y: 0, blur: 0, color: 'rgba(0,0,0,0)', enabled: false },
      textStroke: (node.data.props as TextProps).textStroke || { width: 0, color: 'rgba(0,0,0,0)' }
    },
    node
  }));
  const { isPage, showFileSelectModal } = useViewport();
  const [settingType, setSettingType] = useState('default');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTextShadowColorPickerOpen, setIsTextShadowColorPickerOpen] = useState(false);
  const [isTextStrokeColorPickerOpen, setIsTextStrokeColorPickerOpen] = useState(false);

  // Background color pickers
  const [isBgColorPickerOpen, setIsBgColorPickerOpen] = useState(false);
  const [isGradientColor1PickerOpen, setIsGradientColor1PickerOpen] = useState(false);
  const [isGradientColor2PickerOpen, setIsGradientColor2PickerOpen] = useState(false);

  // Inline formatting state
  const [isInlineColorPickerOpen, setIsInlineColorPickerOpen] = useState(false);
  const [inlineTextColor, setInlineTextColor] = useState('#000000');
  const [inlineFontFamily, setInlineFontFamily] = useState('inherit');

  // Background settings state
  const [currentBgSizeSetting, setCurrentBgSizeSetting] = useState('auto');
  const [customBgWidth, setCustomBgWidth] = useState('100%');
  const [customBgHeight, setCustomBgHeight] = useState('auto');
  const [bgPositionInput, setBgPositionInput] = useState(props.backgroundPosition || 'center center');

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection: bgPositionCollection, filter: filterBgPosition } = useListCollection({
    initialItems: backgroundPositionOptions,
    filter: contains,
  });

  const updateProp = (key: string, value: any) => {
    setProp((props: any) => {
      props[key] = value;
    });
  };

  // Enhanced formatting function that handles whole content formatting properly
  const executeFormatCommand = (cmd: string, formatType?: string, value?: string) => {
    console.log('🎯 executeFormatCommand called:', { cmd, formatType, value, nodeId: node.id });

    // Store the current selection before any DOM manipulation
    const selection = window.getSelection();

    console.log('🔍 Selection info:', {
      selection,
      isCollapsed: selection?.isCollapsed,
      selectedText: selection?.toString(),
      selectionLength: selection?.toString().length
    });

    // Try multiple approaches to find the contenteditable element
    let nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);

    // If not found by data-node-id, try to find it through the selection
    if (!nodeElement && selection && selection.anchorNode) {
      // Walk up the DOM tree from the selection to find the node element
      let currentElement = selection.anchorNode.nodeType === Node.TEXT_NODE
        ? selection.anchorNode.parentElement
        : selection.anchorNode as Element;

      while (currentElement && currentElement !== document.body) {
        if (currentElement.getAttribute && currentElement.getAttribute('data-node-id')) {
          nodeElement = currentElement as HTMLElement;
          console.log('🎯 Found node element through selection traversal:', currentElement.getAttribute('data-node-id'));
          break;
        }
        currentElement = currentElement.parentElement;
      }
    }

    // Try multiple selectors to find the contenteditable element
    let contentEditableElement: HTMLElement | undefined;

    if (nodeElement) {
      contentEditableElement = nodeElement.querySelector('[contenteditable="true"]') as HTMLElement;
      if (!contentEditableElement) {
        contentEditableElement = nodeElement.querySelector('[contenteditable]') as HTMLElement;
      }
      if (!contentEditableElement) {
        // Look for span elements that might be contenteditable
        contentEditableElement = nodeElement.querySelector('span') as HTMLElement;
      }
      if (!contentEditableElement && nodeElement.getAttribute('contenteditable')) {
        // The node element itself might be contenteditable
        contentEditableElement = nodeElement as HTMLElement;
      }
    }

    // If still not found, try to find contenteditable element through selection
    if (!contentEditableElement && selection && selection.anchorNode) {
      let currentElement = selection.anchorNode.nodeType === Node.TEXT_NODE
        ? selection.anchorNode.parentElement
        : selection.anchorNode as Element;

      while (currentElement && currentElement !== document.body) {
        if (currentElement.getAttribute && currentElement.getAttribute('contenteditable') === 'true') {
          contentEditableElement = currentElement as HTMLElement;
          console.log('🎯 Found contenteditable element through selection traversal');
          break;
        }
        currentElement = currentElement.parentElement;
      }
    }

    console.log('🎯 Element detection:', {
      nodeId: node.id,
      nodeElement,
      contentEditableElement,
      contentEditableAttr: contentEditableElement?.getAttribute('contenteditable'),
      elementTagName: contentEditableElement?.tagName,
      selectionAnchorNode: selection?.anchorNode,
      selectionFocusNode: selection?.focusNode
    });

    if (!contentEditableElement) {
      console.log('⚠️ ContentEditable element not found');

      // Try one more approach: if we have a selection, try to apply execCommand directly
      const hasBasicSelection = selection && !selection.isCollapsed && selection.toString().length > 0;
      if (hasBasicSelection) {
        console.log('🎯 Attempting direct execCommand on selection without element reference');
        try {
          const execResult = value ? document.execCommand(cmd, false, value) : document.execCommand(cmd, false);
          console.log('📝 Direct execCommand result:', { cmd, value, success: execResult });

          if (execResult) {
            console.log('✅ Direct execCommand succeeded, trying to update text prop');
            // Try to find the updated content and update the text prop
            setTimeout(() => {
              // Try to find any contenteditable element that might contain our changes
              const anyContentEditable = document.querySelector('[contenteditable="true"]') as HTMLElement;
              if (anyContentEditable) {
                console.log('🔄 Found contenteditable element for update:', anyContentEditable.innerHTML);
                updateProp('text', anyContentEditable.innerHTML);
              }
            }, 10);
            return;
          }
        } catch (error) {
          console.log('❌ Direct execCommand failed:', error);
        }
      }

      console.log('⚠️ Using text prop fallback');
      // Fallback: apply formatting directly to the text prop
      applyFormattingToTextProp(formatType || cmd, value);
      return;
    }

    // Check if there's a text selection within our contenteditable element
    const hasSelection = selection &&
      !selection.isCollapsed &&
      selection.toString().length > 0 &&
      contentEditableElement.contains(selection.anchorNode) &&
      contentEditableElement.contains(selection.focusNode);

    console.log('✅ Selection validation:', {
      hasSelection,
      selectionExists: !!selection,
      isNotCollapsed: selection && !selection.isCollapsed,
      hasText: selection && selection.toString().length > 0,
      anchorInElement: selection && contentEditableElement.contains(selection.anchorNode),
      focusInElement: selection && contentEditableElement.contains(selection.focusNode)
    });

    if (hasSelection) {
      console.log('🎨 Applying formatting to SELECTED text:', selection.toString());
      // Apply formatting to selected text only using execCommand
      // Focus the element first to ensure the selection is maintained
      contentEditableElement.focus();

      // Use execCommand which respects the current selection
      const execResult = value ? document.execCommand(cmd, false, value) : document.execCommand(cmd, false);
      console.log('📝 execCommand result:', { cmd, value, success: execResult });

      // Update the text prop with the new content
      setTimeout(() => {
        const newContent = contentEditableElement.innerHTML;
        console.log('🔄 Updating text prop after selection formatting:', newContent);
        updateProp('text', newContent);
      }, 10);
    } else {
      console.log('🎨 Applying formatting to ENTIRE content');
      // Apply formatting to entire content
      applyFormattingToTextProp(formatType || cmd, value);
    }
  };

  // Function to check if a formatting type is currently active in the content
  const isFormattingActive = (content: string, formatType: string): boolean => {
    let isActive = false;

    switch (formatType) {
      case 'bold':
        isActive = /<(?:strong|b)>/i.test(content);
        break;
      case 'italic':
        isActive = /<(?:em|i)>/i.test(content);
        break;
      case 'underline':
        isActive = /<u>/i.test(content);
        break;
      case 'strikeThrough':
        isActive = /<s>/i.test(content);
        break;
      default:
        isActive = false;
    }

    console.log('🔍 isFormattingActive check:', { formatType, content, isActive });
    return isActive;
  };

  // Function to apply formatting directly to the text prop (for whole content formatting)
  const applyFormattingToTextProp = (formatType: string, value?: string) => {
    console.log('🎨 applyFormattingToTextProp called:', { formatType, value });

    const content = props.text || '';
    let newContent = content;

    console.log('📝 Original content:', content);

    // Check if the formatting is already active
    const isActive = isFormattingActive(content, formatType);

    console.log('🔄 Toggle logic:', { formatType, isActive, action: isActive ? 'REMOVE' : 'ADD' });

    // First, remove any existing formatting of this type
    switch (formatType) {
      case 'bold':
        // Remove all bold tags first
        newContent = newContent.replace(/<\/?(?:strong|b)>/gi, '');
        console.log('🧹 After removing bold tags:', newContent);
        // If it wasn't active before, wrap entire content in bold
        if (!isActive) {
          newContent = `<strong>${newContent}</strong>`;
          console.log('➕ Added bold formatting:', newContent);
        }
        break;
      case 'italic':
        // Remove all italic tags first
        newContent = newContent.replace(/<\/?(?:em|i)>/gi, '');
        console.log('🧹 After removing italic tags:', newContent);
        // If it wasn't active before, wrap entire content in italic
        if (!isActive) {
          newContent = `<em>${newContent}</em>`;
          console.log('➕ Added italic formatting:', newContent);
        }
        break;
      case 'underline':
        // Remove all underline tags first
        newContent = newContent.replace(/<\/?u>/gi, '');
        console.log('🧹 After removing underline tags:', newContent);
        // If it wasn't active before, wrap entire content in underline
        if (!isActive) {
          newContent = `<u>${newContent}</u>`;
          console.log('➕ Added underline formatting:', newContent);
        }
        break;
      case 'strikeThrough':
        // Remove all strikethrough tags first
        newContent = newContent.replace(/<\/?s>/gi, '');
        console.log('🧹 After removing strikethrough tags:', newContent);
        // If it wasn't active before, wrap entire content in strikethrough
        if (!isActive) {
          newContent = `<s>${newContent}</s>`;
          console.log('➕ Added strikethrough formatting:', newContent);
        }
        break;
      case 'foreColor':
      case 'color':
        // Apply color formatting to entire content
        if (value) {
          // Remove existing color styles first
          newContent = newContent.replace(/<span[^>]*style="[^"]*color:[^;"]*;?[^"]*"[^>]*>/gi, (match) => {
            // Remove only the color property from style attribute
            return match.replace(/color:[^;"]*;?/gi, '').replace(/style=""/gi, '').replace(/<span[^>]*>/gi, '<span>');
          });
          // Clean up empty span tags
          newContent = newContent.replace(/<span[^>]*><\/span>/gi, '');
          newContent = newContent.replace(/<span>/gi, '').replace(/<\/span>/gi, '');

          // Wrap entire content with color
          newContent = `<span style="color: ${value}">${newContent}</span>`;
          console.log('➕ Added color formatting:', newContent);
        }
        break;
      case 'fontName':
        // Apply font family formatting to entire content
        if (value) {
          // Remove existing font-family styles first
          newContent = newContent.replace(/<span[^>]*style="[^"]*font-family:[^;"]*;?[^"]*"[^>]*>/gi, (match) => {
            // Remove only the font-family property from style attribute
            return match.replace(/font-family:[^;"]*;?/gi, '').replace(/style=""/gi, '').replace(/<span[^>]*>/gi, '<span>');
          });
          // Clean up empty span tags
          newContent = newContent.replace(/<span[^>]*><\/span>/gi, '');
          newContent = newContent.replace(/<span>/gi, '').replace(/<\/span>/gi, '');

          // Wrap entire content with font family
          const fontFamily = value.includes("'") || value.includes('"') || value.includes(',') || value === 'inherit' ? value : `'${value}'`;
          newContent = `<span style="font-family: ${fontFamily}">${newContent}</span>`;
          console.log('➕ Added font family formatting:', newContent);
        }
        break;
    }

    console.log('✅ Final content to update:', newContent);
    updateProp('text', newContent);
  };

  // Function to apply inline color formatting to selected text
  const applyInlineColorFormatting = (color: string) => {
    console.log('🎨 applyInlineColorFormatting called:', { color, nodeId: node.id });

    // Check if we have a text selection
    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

    if (hasSelection) {
      console.log('✅ Text selected, applying inline color formatting');
    } else {
      console.log('⚠️ No text selected, will apply to entire content');
    }

    executeFormatCommand('foreColor', 'foreColor', color);
  };

  // Function to apply inline font family formatting to selected text
  const applyInlineFontFormatting = (fontFamily: string) => {
    console.log('🎨 applyInlineFontFormatting called:', { fontFamily, nodeId: node.id });

    // Check if we have a text selection
    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

    if (hasSelection) {
      console.log('✅ Text selected, applying inline font formatting');
    } else {
      console.log('⚠️ No text selected, will apply to entire content');
    }

    executeFormatCommand('fontName', 'fontName', fontFamily);
  };

  // Event management functions
  const handleEventsChange = (newEvents: EventItem[]) => {
    updateProp('events', newEvents);
  };

  // Initialize events array if not present
  const currentEvents = props.events || [];
  // Animation management functions
  const handleDisplayAnimationChange = (newAnimation: DisplayAnimationItem | null) => {
    updateProp('displayAnimation', newAnimation);
  };

  const handleHoverAnimationChange = (newHoverAnimation: HoverAnimationSettings) => {
    updateProp('hoverAnimation', newHoverAnimation);
  };

  // Initialize animation arrays if not present
  const currentDisplayAnimation = props.displayAnimation || null;
  const currentHoverAnimation = props.hoverAnimation || { enabled: false };
  const handlePinningChange = (newPinning: PinningSettings) => {
    updateProp('pinning', newPinning);
  };
  // Initialize pinning if not present
  const currentPinning = props.pinning || {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0
  };
  const updateTextShadow = (key: keyof TextProps['textShadow'], value: any) => {
    updateProp('textShadow', { ...props.textShadow, [key]: value });
  };

  const updateTextStroke = (key: keyof TextProps['textStroke'], value: any) => {
    updateProp('textStroke', { ...props.textStroke, [key]: value });
  };

  // Background handling functions
  useEffect(() => {
    if (props.backgroundAttachment === 'fixed' && props.backgroundSize === 'cover') {
      setCurrentBgSizeSetting('parallax');
    } else if (props.backgroundSize && !['auto', 'cover', 'contain'].includes(props.backgroundSize)) {
      const parts = props.backgroundSize.split(' ');
      if (parts.length === 2) {
        setCurrentBgSizeSetting('custom');
        setCustomBgWidth(parts[0]);
        setCustomBgHeight(parts[1]);
      } else {
        setCurrentBgSizeSetting('auto');
      }
    } else if (props.backgroundSize && ['auto', 'cover', 'contain'].includes(props.backgroundSize)) {
      setCurrentBgSizeSetting(props.backgroundSize);
    } else {
      setCurrentBgSizeSetting('auto');
    }

    setBgPositionInput(props.backgroundPosition || 'center center');
  }, [props.backgroundSize, props.backgroundAttachment, props.backgroundPosition]);

  const handleBackgroundTypeChange = (newType: string) => {
    const oldType = props.backgroundType || 'color';
    if (oldType !== newType) {
      // Reset relevant props when type changes
      updateProp('gradientType', undefined as any);
      updateProp('gradientAngle', undefined as any);
      updateProp('gradientColor1', undefined as any);
      updateProp('gradientColor2', undefined as any);
      updateProp('backgroundImage', undefined as any);
      updateProp('backgroundSize', undefined as any);
      updateProp('backgroundPosition', undefined as any);
      updateProp('backgroundRepeat', undefined as any);
      updateProp('backgroundAttachment', undefined as any);

      if (newType === 'gradient') {
        updateProp('gradientType', props.gradientType || 'linear');
        updateProp('gradientAngle', props.gradientAngle || 90);
        updateProp('gradientColor1', props.gradientColor1 || '#4158D0');
        updateProp('gradientColor2', props.gradientColor2 || '#C850C0');
      } else if (newType === 'image') {
        updateProp('backgroundSize', 'cover');
        updateProp('backgroundPosition', 'center center');
        updateProp('backgroundRepeat', 'no-repeat');
        updateProp('backgroundAttachment', 'scroll');
        setCurrentBgSizeSetting('cover');
        setCustomBgWidth('100%');
        setCustomBgHeight('auto');
        setBgPositionInput('center center');
      }
    }
    updateProp('backgroundType', newType as any);
  };

  const handleBgSizeSettingChange = (value: string) => {
    setCurrentBgSizeSetting(value);
    if (value === 'parallax') {
      updateProp('backgroundSize', 'cover');
      updateProp('backgroundAttachment', 'fixed');
    } else if (value === 'custom') {
      updateProp('backgroundSize', `${customBgWidth} ${customBgHeight}`);
      updateProp('backgroundAttachment', 'scroll');
    } else {
      updateProp('backgroundSize', value);
      updateProp('backgroundAttachment', 'scroll');
    }
  };

  const handleCustomBgWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value;
    setCustomBgWidth(newWidth);
    if (currentBgSizeSetting === 'custom') {
      updateProp('backgroundSize', `${newWidth} ${customBgHeight}`);
    }
  };

  const handleCustomBgHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value;
    setCustomBgHeight(newHeight);
    if (currentBgSizeSetting === 'custom') {
      updateProp('backgroundSize', `${customBgWidth} ${newHeight}`);
    }
  };

  const handleBgPositionChange = (value: string) => {
    setBgPositionInput(value);
    updateProp('backgroundPosition', value);
  };

  const applyGradientTemplate = (colors: string[]) => {
    updateProp('gradientColor1', colors[0]);
    updateProp('gradientColor2', colors[1]);
  };

  const textColor = props.color || '#000000';
  const textShadowColor = props.textShadow?.color || '#000000';
  const textStrokeColor = props.textStroke?.color || '#000000';

  return (
    <Box className='w-full h-full'>
      <Tabs.Root key={'buttonsetting'} value={settingType} onValueChange={(e) => setSettingType(e.value)} variant={'line'}>
        <Tabs.List>
          <Tabs.Trigger value="default" className='!text-xs'>
            Thiết kế
          </Tabs.Trigger>
          <Tabs.Trigger value="event" className='!text-xs' disabled={props.isChildOfButton}>
            Sự kiện
          </Tabs.Trigger>
          <Tabs.Trigger value="animation" className='!text-xs' disabled={props.isChildOfButton}>
            Hiệu ứng
          </Tabs.Trigger>
          <Tabs.Trigger value="advanced" className='!text-xs' disabled={props.isChildOfButton}>
            Nâng cao
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="default">
          <Stack>
              <NodeControlsPanel
                showDragHandle={false}
                showLayerControls={true}
                showContainerSpecificControls={true}
              />
            {/* Text Content Editor Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Nội dung văn bản</Text>
              <Box className='w-full flex flex-col gap-2'>
                <Text fontSize="xs">Chỉnh sửa nội dung</Text>
                <Textarea
                  value={props.text ? props.text.replace(/<[^>]*>/g, '') : ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const newText = e.target.value;
                    updateProp('text', newText);
                  }}
                  placeholder="Nhập nội dung văn bản..."
                  resize="none"
                  rows={4}
                  fontSize="sm"
                  borderColor="gray.300"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                  }}
                />
                <Text fontSize="xs" color="gray.500">
                  Thay đổi nội dung văn bản trực tiếp. Định dạng sẽ được áp dụng từ các cài đặt bên dưới.
                </Text>
              </Box>
            </Box>

            {/* Typography Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Thiết lập chữ</Text>
              <Stack gap={3}>
                {!isPage ? <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Tự điền từ form cho</Text>
                  <select
                    value={props.initField}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('initField', e.target.value)}
                    className='rounded-md p-2 text-sm w-[50%]'
                  >
                    {initFieldOptions.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </Box> : null}
                {/* Font Size */}
                <HStack gap={2}>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Font chữ</Text>
                    <StyledFontSelector
                      value={props.fontFamily}
                      options={fonts}
                      onChange={(value) => {
                        updateProp('fontFamily', value)
                      }}
                      className='w-full'
                    />
                  </Box>
                  <Box className='w-full flex flex-col gap-2'>
                    <Text fontSize="xs">Cỡ chữ</Text>
                    <DraggableNumberInput
                      value={parseInt(props.fontSize)}
                      onChange={(value) => updateProp('fontSize', `${value}`)}
                      min={8}
                      max={200}
                    />
                  </Box>
                </HStack>

                <Box className='w-full flex items-center justify-between gap-1'>
                  <Tooltip content="In đậm">
                    <div
                      className='cursor-pointer'
                      onMouseDown={(evt) => {
                        console.log('🖱️ Bold button clicked');
                        const selection = window.getSelection();
                        const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

                        console.log('🔍 Button click selection check:', {
                          hasSelection,
                          selectedText: selection?.toString(),
                          willPreventDefault: !hasSelection
                        });

                        if (!hasSelection) {
                          evt.preventDefault(); // Only prevent default when no selection
                          console.log('🚫 preventDefault() called - no selection detected');
                        } else {
                          console.log('✅ Selection preserved - preventDefault() NOT called');
                        }

                        executeFormatCommand('bold', 'bold');
                      }}
                    >
                      <HiBold color={props.fontWeight === 'bold' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="In nghiêng">
                    <div
                      className='text-center gap-2 cursor-pointer'
                      onMouseDown={(evt) => {
                        console.log('🖱️ Italic button clicked');
                        const selection = window.getSelection();
                        const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

                        console.log('🔍 Button click selection check:', {
                          hasSelection,
                          selectedText: selection?.toString(),
                          willPreventDefault: !hasSelection
                        });

                        if (!hasSelection) {
                          evt.preventDefault();
                          console.log('🚫 preventDefault() called - no selection detected');
                        } else {
                          console.log('✅ Selection preserved - preventDefault() NOT called');
                        }

                        executeFormatCommand('italic', 'italic');
                      }}
                    >
                      <HiItalic color={props.fontStyle === 'italic' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Gạch chân">
                    <div
                      className='cursor-pointer'
                      onMouseDown={(evt) => {
                        const selection = window.getSelection();
                        const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

                        if (!hasSelection) {
                          evt.preventDefault();
                        }

                        executeFormatCommand('underline', 'underline');
                      }}
                    >
                      <HiUnderline color={props.textDecoration === 'underline' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Gạch ngang">
                    <div
                      className='cursor-pointer'
                      onMouseDown={(evt) => {
                        const selection = window.getSelection();
                        const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

                        if (!hasSelection) {
                          evt.preventDefault();
                        }

                        executeFormatCommand('strikeThrough', 'strikeThrough');
                      }}
                    >
                      <HiStrikethrough color={props.textDecoration === 'line-through' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Chữ hoa">
                    <div
                      className='cursor-pointer'
                      onMouseDown={(evt) => {
                        console.log('🖱️ Uppercase button clicked');
                        const selection = window.getSelection();
                        const hasSelection = selection && !selection.isCollapsed && selection.toString().length > 0;

                        console.log('🔍 Uppercase button selection check:', {
                          hasSelection,
                          selectedText: selection?.toString(),
                          willPreventDefault: !hasSelection
                        });

                        if (!hasSelection) {
                          evt.preventDefault();
                          console.log('🚫 preventDefault() called - no selection detected');
                        } else {
                          console.log('✅ Selection preserved - preventDefault() NOT called');
                        }
                        // For uppercase, we need a custom approach since execCommand doesn't support it
                        const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`);
                        let contentEditableElement = nodeElement?.querySelector('[contenteditable="true"]') as HTMLElement;
                        if (!contentEditableElement) {
                          contentEditableElement = nodeElement?.querySelector('[contenteditable]') as HTMLElement;
                        }
                        if (!contentEditableElement) {
                          contentEditableElement = nodeElement?.querySelector('span') as HTMLElement;
                        }

                        if (!contentEditableElement) return;

                        // Check if there's a text selection within our contenteditable element
                        const hasDetailedSelection = selection &&
                          !selection.isCollapsed &&
                          selection.toString().length > 0 &&
                          contentEditableElement.contains(selection.anchorNode) &&
                          contentEditableElement.contains(selection.focusNode);

                        if (hasDetailedSelection) {
                          console.log('🎨 Applying uppercase to SELECTED text:', selection.toString());
                          // Apply to selected text
                          const range = selection.getRangeAt(0);
                          const selectedText = range.toString();
                          console.log('📝 Selected text for uppercase:', selectedText);

                          const span = document.createElement('span');
                          span.style.textTransform = 'uppercase';
                          span.textContent = selectedText;
                          range.deleteContents();
                          range.insertNode(span);
                          selection.removeAllRanges();

                          console.log('✅ Uppercase span inserted for selection');

                          // Update the text content
                          setTimeout(() => {
                            const newContent = contentEditableElement.innerHTML;
                            console.log('🔄 Updating text prop after uppercase selection:', newContent);
                            updateProp('text', newContent);
                          }, 10);
                        } else {
                          console.log('🎨 Applying uppercase to ENTIRE content');
                          // Apply to entire content using the text prop method
                          const content = props.text || '';
                          console.log('📝 Original content for uppercase:', content);

                          // Check if uppercase is already active
                          const isUppercaseActive = /<span[^>]*style="[^"]*text-transform:\s*uppercase[^"]*"[^>]*>/i.test(content);
                          console.log('🔍 Uppercase active check:', { isUppercaseActive, action: isUppercaseActive ? 'REMOVE' : 'ADD' });

                          let newContent = content;
                          // Remove existing uppercase spans
                          newContent = newContent.replace(/<span[^>]*style="[^"]*text-transform:\s*uppercase[^"]*"[^>]*>(.*?)<\/span>/gi, '$1');
                          console.log('🧹 After removing uppercase spans:', newContent);

                          // If it wasn't active before, wrap entire content in uppercase span
                          if (!isUppercaseActive) {
                            newContent = `<span style="text-transform: uppercase">${newContent}</span>`;
                            console.log('➕ Added uppercase formatting:', newContent);
                          }

                          console.log('✅ Final uppercase content:', newContent);
                          updateProp('text', newContent);
                        }
                      }}
                    >
                      <RxLetterCaseUppercase color={props.textTransform === 'uppercase' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                </Box>



                {/* Text Align */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Tooltip content="Căn trái">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'left')}
                    >
                      <FaAlignLeft color={props.textAlign === 'left' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Căn giữa">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'center')}
                    >
                      <FaAlignCenter color={props.textAlign === 'center' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Căn phải">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'right')}
                    >
                      <FaAlignRight color={props.textAlign === 'right' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Tooltip content="Căn đều">
                    <div
                      className='flex items-center gap-2 cursor-pointer'
                      onClick={() => updateProp('textAlign', 'justify')}
                    >
                      <FaAlignJustify color={props.textAlign === 'justify' ? 'black' : 'gray'} />
                    </div>
                  </Tooltip>
                  <Box
                    display="flex"
                    alignItems="center"
                    borderRadius="md"
                    p={2}
                    cursor="pointer"
                    onClick={() => setIsColorPickerOpen(true)}
                  >
                    <Box
                      width="24px"
                      height="24px"
                      borderRadius="md"
                      backgroundColor={textColor}
                      mr={2}
                      border="1px solid"
                      borderColor="gray.200"
                    />
                  </Box>
                  <ColorPickerModal
                    isOpen={isColorPickerOpen}
                    onClose={() => setIsColorPickerOpen(false)}
                    onColorChange={(color) => updateProp('color', color)}
                    initialColor={textColor}
                  />
                </Box>

                <HStack gap={2}>
                  <Tooltip content="Khoảng cách dòng">
                    <Box className='flex items-center justify-between gap-2'>
                      <RiLineHeight2 />
                      <DraggableNumberInput
                        value={parseFloat(props.lineHeight)}
                        onChange={(value) => updateProp('lineHeight', `${value}`)}
                        min={0.5}
                        max={3}
                        step={0.1}
                      />
                    </Box>
                  </Tooltip>
                  <Tooltip content="Khoảng cách chữ">
                    <Box className='flex items-center justify-between gap-2'>
                      <RiLetterSpacing2 />
                      <DraggableNumberInput
                        value={parseInt(props.letterSpacing)}
                        onChange={(value) => updateProp('letterSpacing', `${value}px`)}
                        min={-10}
                        max={50}
                      />
                    </Box>
                  </Tooltip>
                </HStack>

                {/* Text Transform */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs">Text Transform</Text>
                  <select
                    value={props.textTransform}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('textTransform', e.target.value)}
                    className='rounded-md p-2 text-sm w-[50%]'
                  >
                    {textTransformOptions.map((transform) => (
                      <option key={transform.value} value={transform.value}>
                        {transform.label}
                      </option>
                    ))}
                  </select>
                </Box>
              </Stack>
            </Box>

            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Kích thước</Text>
              <Box className='w-full flex gap-2 items-center'>
                <RiExpandWidthFill />
                <DraggableNumberInput
                  value={parseInt(props.width) || 0}
                  onChange={(value) => updateProp('width', `${value}px`)}
                  min={0}
                  max={1000}
                />
              </Box>
            </Box>

            {/* Background Settings Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Màu & Hình nền</Text>
              <Stack gap="3" mt={2}>
                <Box className='w-full flex items-center justify-between'>
                  <Text fontSize="xs">Loại nền</Text>
                  <select
                    className="outline-none p-2 rounded-md text-sm"
                    value={props.backgroundType || 'color'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const newType = e.target.value;
                      handleBackgroundTypeChange(newType);
                    }}
                  >
                    {backgroundTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </Box>

                {/* Solid Color Background */}
                {props.backgroundType === 'color' && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="xs">Màu nền</Text>
                    <Button size="xs" variant="outline" onClick={() => setIsBgColorPickerOpen(true)}>
                      <Box w="16px" h="16px" borderRadius="sm" bg={props.backgroundColor || 'transparent'} border="1px solid gray" />
                    </Button>
                    <ColorPickerModal
                      isOpen={isBgColorPickerOpen}
                      onClose={() => setIsBgColorPickerOpen(false)}
                      initialColor={props.backgroundColor || 'transparent'}
                      onColorChange={(color: string) => updateProp('backgroundColor', color)}
                    />
                  </HStack>
                )}

                {/* Gradient Background */}
                {props.backgroundType === 'gradient' && (
                  <Stack gap="2">
                    <HStack justifyContent="space-between">
                      <Text fontSize="xs">Kiểu Gradient</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.gradientType || 'linear'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('gradientType', e.target.value)}
                      >
                        {gradientTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </HStack>
                    {props.gradientType === 'linear' && (
                      <HStack alignItems="center">
                        <Text fontSize="xs">Góc</Text>
                        <DraggableNumberInput
                          value={props.gradientAngle || 0}
                          onChange={(val: number) => updateProp('gradientAngle', val)}
                          min={0}
                          max={360}
                        />
                      </HStack>
                    )}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Màu 1</Text>
                      <Button size="xs" variant="outline" onClick={() => setIsGradientColor1PickerOpen(true)}>
                        <Box w="16px" h="16px" borderRadius="sm" bg={props.gradientColor1 || '#4158D0'} border="1px solid gray" />
                      </Button>
                      <ColorPickerModal
                        isOpen={isGradientColor1PickerOpen}
                        onClose={() => setIsGradientColor1PickerOpen(false)}
                        initialColor={props.gradientColor1 || '#4158D0'}
                        onColorChange={(color: string) => updateProp('gradientColor1', color)}
                      />
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="xs">Màu 2</Text>
                      <Button size="xs" variant="outline" onClick={() => setIsGradientColor2PickerOpen(true)}>
                        <Box w="16px" h="16px" borderRadius="sm" bg={props.gradientColor2 || '#C850C0'} border="1px solid gray" />
                      </Button>
                      <ColorPickerModal
                        isOpen={isGradientColor2PickerOpen}
                        onClose={() => setIsGradientColor2PickerOpen(false)}
                        initialColor={props.gradientColor2 || '#C850C0'}
                        onColorChange={(color: string) => updateProp('gradientColor2', color)}
                      />
                    </HStack>
                    <Text fontSize="xs" mt={2}>Mẫu Gradient:</Text>
                    <HStack gap="2" flexWrap="wrap">
                      {gradientTemplates.map((template, index) => (
                        <Tooltip key={index} content={template.name} positioning={{ placement: 'top' }}>
                          <Box
                            as="button"
                            onClick={() => applyGradientTemplate(template.colors)}
                            width="24px"
                            height="24px"
                            borderRadius="sm"
                            background={`linear-gradient(45deg, ${template.colors[0]}, ${template.colors[1]})`}
                            border="1px solid"
                            borderColor="gray.300"
                            cursor="pointer"
                          />
                        </Tooltip>
                      ))}
                    </HStack>
                  </Stack>
                )}

                {/* Image Background */}
                {props.backgroundType === 'image' && (
                  <Stack gap="3" mt={2}>
                    <Text fontSize="xs">URL Hình ảnh</Text>
                    <HStack>
                      <Input
                        size="sm"
                        value={props.backgroundImage || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateProp('backgroundImage', e.target.value)}
                        placeholder="https://..."
                      />
                      <Button size="sm" onClick={() => showFileSelectModal(
                        FileType.IMAGE,
                        (fileUrl: string) => {
                          updateProp('backgroundImage', fileUrl);
                        }
                      )}>
                        Chọn hình ảnh
                      </Button>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center" mt={2}>
                      <Text fontSize="xs">Kiểu</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={currentBgSizeSetting}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleBgSizeSettingChange(e.target.value)}
                      >
                        {advancedBackgroundSizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </HStack>

                    {currentBgSizeSetting === 'custom' && (
                      <HStack gap="2" mt={1}>
                        <Box flex={1}>
                          <Text fontSize="xs" mb={1}>W</Text>
                          <Input
                            size="sm"
                            value={customBgWidth}
                            onChange={handleCustomBgWidthChange}
                            placeholder="e.g., 200px or 50%"
                          />
                        </Box>
                        <Box flex={1}>
                          <Text fontSize="xs" mb={1}>H</Text>
                          <Input
                            size="sm"
                            value={customBgHeight}
                            onChange={handleCustomBgHeightChange}
                            placeholder="e.g., 300px or auto"
                          />
                        </Box>
                      </HStack>
                    )}

                    <HStack justifyContent="space-between" alignItems="center" mt={2}>
                      <Text fontSize="xs">Vị trí</Text>
                      <Combobox.Root
                        collection={bgPositionCollection}
                        onInputValueChange={(e: { inputValue: string }) => filterBgPosition(e.inputValue)}
                        onValueChange={(details: { value: string[] }) => {
                          handleBgPositionChange(details.value[0] ?? '');
                        }}
                        value={bgPositionInput ? [bgPositionInput] : []}
                        width="60%"
                        openOnClick
                        multiple={false}
                      >
                        <Combobox.Control>
                          <Combobox.Input as={Input} placeholder="Chọn hoặc nhập vị trí" />
                        </Combobox.Control>
                        <Portal>
                          <Combobox.Positioner zIndex="popover">
                            <Combobox.Content maxHeight="150px" overflowY="auto">
                              <Combobox.Empty>Không tìm thấy vị trí</Combobox.Empty>
                              {bgPositionCollection.items.map((item) => (
                                <Combobox.Item item={item} key={item.value} justifyContent="flex-start" width="100%">
                                  {item.label}
                                  <Combobox.ItemIndicator />
                                </Combobox.Item>
                              ))}
                            </Combobox.Content>
                          </Combobox.Positioner>
                        </Portal>
                      </Combobox.Root>
                    </HStack>

                    <HStack justifyContent="space-between" alignItems="center" mt={2}>
                      <Text fontSize="xs">Lặp lại</Text>
                      <select
                        className="outline-none p-2 rounded-md text-sm"
                        value={props.backgroundRepeat || 'no-repeat'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProp('backgroundRepeat', e.target.value)}
                      >
                        {backgroundRepeatOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </HStack>
                  </Stack>
                )}
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Viền & Bo góc</Text>
              <Box className='w-full flex gap-2 flex-col'>
                <Box className='flex items-center gap-2'>
                  <Text fontSize="xs">Kích thước</Text>
                  <DraggableNumberInput
                    value={props.textStroke?.width ?? 0}
                    onChange={(value) => updateTextStroke('width', value)}
                    min={0}
                    max={10}
                  />
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  borderRadius="md"
                  p={2}
                  cursor="pointer"
                  onClick={() => setIsTextStrokeColorPickerOpen(true)}
                >
                  <Box
                    width="24px"
                    height="24px"
                    borderRadius="md"
                    backgroundColor={textStrokeColor}
                    mr={2}
                    border="1px solid"
                    borderColor="gray.200"
                  />
                  <Text fontSize="xs">{textStrokeColor}</Text>
                </Box>
                <ColorPickerModal
                  isOpen={isTextStrokeColorPickerOpen}
                  onClose={() => setIsTextStrokeColorPickerOpen(false)}
                  onColorChange={(color) => updateTextStroke('color', color)}
                  initialColor={textStrokeColor}
                />
              </Box>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Đổ bóng</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='flex items-center gap-2'>
                    <Switch.Root
                      checked={props.textShadow?.enabled}
                      onCheckedChange={(e) => updateTextShadow('enabled', e.checked)}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <Switch.Label />
                    </Switch.Root>
                  </Box>
                </Box>

                {props.textShadow?.enabled && (
                  <Box className='grid grid-cols-2 gap-2'>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">X</Text>
                      <DraggableNumberInput
                        value={props.textShadow?.x ?? 0}
                        onChange={(value) => updateTextShadow('x', value)}
                        min={-20}
                        max={20}
                      />
                    </Box>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">Y</Text>
                      <DraggableNumberInput
                        value={props.textShadow?.y ?? 0}
                        onChange={(value) => updateTextShadow('y', value)}
                        min={-20}
                        max={20}
                      />
                    </Box>
                    <Box className='flex items-center justify-between gap-2'>
                      <Text fontSize="xs">Độ mờ</Text>
                      <DraggableNumberInput
                        value={props.textShadow?.blur ?? 0}
                        onChange={(value) => updateTextShadow('blur', value)}
                        min={0}
                        max={20}
                      />
                    </Box>
                    <Box className='flex items-center justify-between gap-2'>
                      <Box
                        display="flex"
                        alignItems="center"
                        borderRadius="md"
                        p={2}
                        cursor="pointer"
                        onClick={() => setIsTextShadowColorPickerOpen(true)}
                      >
                        <Box
                          width="24px"
                          height="24px"
                          borderRadius="md"
                          backgroundColor={textShadowColor}
                          mr={2}
                          border="1px solid"
                          borderColor="gray.200"
                        />
                      </Box>
                      <ColorPickerModal
                        isOpen={isTextShadowColorPickerOpen}
                        onClose={() => setIsTextShadowColorPickerOpen(false)}
                        onColorChange={(color) => updateTextShadow('color', color)}
                        initialColor={textShadowColor}
                      />
                    </Box>
                  </Box>
                )}
              </Stack>
            </Box>
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" fontWeight={'bold'} mb={2}>Filter</Text>
              <Stack gap={3}>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Blend Mode</Text>
                  <select
                    className="w-[50%] p-2 rounded-md text-sm"
                    value={props.blendMode || 'normal'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateProp('blendMode', e.target.value);
                    }}
                  >
                    {blendModeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex  justify-between items-center gap-2'>
                    <Text fontSize="xs">Tương phản</Text>
                    <DraggableNumberInput
                      value={props.contrast || 100}
                      onChange={(value) => updateProp('contrast', value)}
                      min={0}
                      max={200}
                    />
                  </Box>
                  <Box className='w-full  flex   justify-between items-center gap-2'>
                    <Text fontSize="xs" >Độ sáng</Text>
                    <DraggableNumberInput
                      value={props.brightness || 100}
                      onChange={(value) => updateProp('brightness', value)}
                      min={0}
                      max={200}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Hòa màu</Text>
                    <DraggableNumberInput
                      value={props.saturate || 100}
                      onChange={(value) => updateProp('saturate', value)}
                      min={0}
                      max={200}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Trắng đen</Text>
                    <DraggableNumberInput
                      value={props.grayscale || 0}
                      onChange={(value) => updateProp('grayscale', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Độ mờ</Text>
                    <DraggableNumberInput
                      value={props.opacity || 100}
                      onChange={(value) => updateProp('opacity', value)}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Đảo ngược</Text>
                    <DraggableNumberInput
                      value={props.invert || 0}
                      onChange={(value) => updateProp('invert', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </Box>
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Sepia</Text>
                    <DraggableNumberInput
                      value={props.sepia || 0}
                      onChange={(value) => updateProp('sepia', value)}
                      min={0}
                      max={100}
                    />
                  </Box>

                  <Box className='w-full flex items-center justify-between gap-2'>
                    <Text fontSize="xs" >Xoay màu</Text>
                    <DraggableNumberInput
                      value={props.hueRotate || 0}
                      onChange={(value) => updateProp('hueRotate', value)}
                      min={0}
                      max={360}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Transform Section */}
            <Box borderBottom="1px solid #e0e0e0" borderRadius={4} p={4}>
              <Text fontSize="sm" mb={2} fontWeight={'bold'}>Transform</Text>
              <Stack gap={3}>
                {/* Transform Origin */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Điểm gốc</Text>
                  <select
                    className="w-[50%] p-2 rounded-md text-sm"
                    value={props.transformOrigin || 'center center'}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateProp('transformOrigin', e.target.value);
                    }}
                  >
                    <option value="center center">Giữa</option>
                    <option value="top left">Trên trái</option>
                    <option value="top center">Trên giữa</option>
                    <option value="top right">Trên phải</option>
                    <option value="center left">Giữa trái</option>
                    <option value="center right">Giữa phải</option>
                    <option value="bottom left">Dưới trái</option>
                    <option value="bottom center">Dưới giữa</option>
                    <option value="bottom right">Dưới phải</option>
                  </select>
                </Box>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs">Trong suốt</Text>
                  <Box width="60%">
                    <DraggableNumberInput
                      value={props.opacity || 100}
                      onChange={(value: number) => updateProp('opacity', value)}
                      min={0}
                      max={100}
                    />
                  </Box>
                </HStack>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {/* Rotation */}
                  <Tooltip content="Xoay đều">
                    <Box className='flex items-center gap-2'>
                      <AiOutlineLoading3Quarters />
                      <DraggableNumberInput
                        value={props.rotate || 0}
                        onChange={(value) => updateProp('rotate', value)}
                        min={-360}
                        max={360}
                      />
                    </Box>
                  </Tooltip>

                  {/* Rotate X */}
                  <Tooltip content="Xoay ngang">
                    <Box className='flex items-center gap-2'>
                      <MdRotate90DegreesCw />
                      <DraggableNumberInput
                        value={props.rotateX || 0}
                        onChange={(value) => updateProp('rotateX', value)}
                        min={-360}
                        max={360}
                      />
                    </Box>
                  </Tooltip>

                  {/* Rotate Y */}
                  <Tooltip content="Xoay dọc">
                    <Box className='flex items-center gap-2'>
                      <MdRotate90DegreesCcw />
                      <DraggableNumberInput
                        value={props.rotateY || 0}
                        onChange={(value) => updateProp('rotateY', value)}
                        min={-360}
                        max={360}
                      />
                    </Box>
                  </Tooltip>

                  {/* Skew X */}
                  <Tooltip content="Nghiêng ngang">
                    <Box className='flex items-center gap-2'>
                      <GiPerspectiveDiceSixFacesRandom />
                      <DraggableNumberInput
                        value={props.skewX || 0}
                        onChange={(value) => updateProp('skewX', value)}
                        min={-89}
                        max={89}
                      />
                    </Box>
                  </Tooltip>

                  {/* Skew Y */}
                  <Tooltip content="Nghiêng dọc">
                    <Box className='flex items-center gap-2'>
                      <RiDragMoveLine />
                      <DraggableNumberInput
                        value={props.skewY || 0}
                        onChange={(value) => updateProp('skewY', value)}
                        min={-89}
                        max={89}
                      />
                    </Box>
                  </Tooltip>

                  {/* Perspective */}
                  <Tooltip content="Chiều sâu 3D">
                    <Box className='flex items-center gap-2'>
                      <GiCube />
                      <DraggableNumberInput
                        value={props.perspective || 0}
                        onChange={(value) => updateProp('perspective', value)}
                        min={0}

                      />
                    </Box>
                  </Tooltip>
                </Grid>

                {/* Transform Presets */}
                <Box className='w-full flex items-center justify-between gap-2'>
                  <Text fontSize="xs" >Mẫu có sẵn</Text>
                  <HStack>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('rotate', 0);
                        updateProp('rotateX', 0);
                        updateProp('rotateY', 0);
                        updateProp('skewX', 0);
                        updateProp('skewY', 0);
                        updateProp('perspective', 0);
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Reset
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('rotate', 0);
                        updateProp('rotateX', 15);
                        updateProp('rotateY', 15);
                        updateProp('skewX', 0);
                        updateProp('skewY', 0);
                        updateProp('perspective', 500);
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      3D Card
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => {
                        updateProp('rotate', 0);
                        updateProp('rotateX', 0);
                        updateProp('rotateY', 0);
                        updateProp('skewX', 10);
                        updateProp('skewY', 0);
                        updateProp('perspective', 0);
                      }}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Nghiêng
                    </Button>
                  </HStack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="event" className="p-4">
          <Stack>
            <EventManager
              events={currentEvents}
              onEventsChange={handleEventsChange}
            />
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="animation" className="p-4">
          <Stack>
            <AnimationManager
              displayAnimation={currentDisplayAnimation}
              onDisplayAnimationChange={handleDisplayAnimationChange}
              hoverAnimation={currentHoverAnimation}
              onHoverAnimationChange={handleHoverAnimationChange}
            />
          </Stack>
        </Tabs.Content>
        <Tabs.Content value="advanced" className="p-4">
          <Stack gap={4}>
            <CrossPlatformSyncToggle />
            <PinningManager
              pinning={currentPinning}
              onPinningChange={handlePinningChange}
            />
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};
