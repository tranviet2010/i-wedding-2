import { UserComponent, useEditor, useNode } from '@craftjs/core';
import React from 'react';
import ContentEditable from 'react-contenteditable';
import { styled } from 'styled-components';
import { minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';
import { EventItem, useEventHandling } from '../../../components/editor/components/EventManager';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '@/components/editor/components/AnimationManager';
import { TextSettings } from './TextSettings';
import { useViewport } from '@/components/editor/Viewport/ViewportContext';
import { PinningSettings } from '@/components/editor/components/PinningManager';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';

// HTML sanitization for safe rendering
const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // Create a temporary div to parse and sanitize HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Allow only safe formatting tags - preserve line breaks and formatting
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'br', 'div', 'p', 'span'];

  // Remove any script tags or dangerous content
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Convert div elements to br tags for proper line breaks
  const divElements = tempDiv.querySelectorAll('div');
  divElements.forEach(div => {
    // If div is empty or only contains whitespace, convert to br
    if (!div.textContent?.trim()) {
      const br = document.createElement('br');
      div.parentNode?.replaceChild(br, div);
    } else {
      // If div has content, add br before it and unwrap the content
      const br = document.createElement('br');
      div.parentNode?.insertBefore(br, div);

      // Move all child nodes out of the div
      while (div.firstChild) {
        div.parentNode?.insertBefore(div.firstChild, div);
      }
      div.remove();
    }
  });

  // Process all elements
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach(element => {
    const tagName = element.tagName.toLowerCase();

    // Remove elements that are not in allowed tags list
    if (!allowedTags.includes(tagName)) {
      // Replace with text content to preserve the text
      const textNode = document.createTextNode(element.textContent || '');
      element.parentNode?.replaceChild(textNode, element);
      return;
    }

    if (element.hasAttribute('style')) {
      const style = element.getAttribute('style') || '';
      const allowedStyles: string[] = [];

      // Parse and filter style properties - allow common text formatting styles
      const allowedStyleProps = [
        'color', 'font-size', 'font-weight', 'font-style', 'font-family',
        'text-decoration', 'text-align', 'line-height', 'letter-spacing',
        'text-transform', 'background-color', 'background', 'padding', 'margin'
      ];

      style.split(';').forEach(property => {
        const [prop, value] = property.split(':').map(s => s.trim());
        if (prop && value && allowedStyleProps.some(allowed => prop.toLowerCase().includes(allowed.toLowerCase()))) {
          allowedStyles.push(`${prop}: ${value}`);
        }
      });

      if (allowedStyles.length > 0) {
        element.setAttribute('style', allowedStyles.join('; '));
      } else {
        element.removeAttribute('style');
      }
    }
  });

  return tempDiv.innerHTML;
};

export type TextProps = {
  isEditing?: boolean;
  fontSize?: string;
  textAlign?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  shadow?: number;
  text?: string;
  enabled?: boolean;
  isChildOfButton?: boolean;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
  width?: string;
  textShadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
    enabled: boolean;
  };
  textStroke?: {
    width: number;
    color: string;
  };
  // Background properties
  backgroundType?: 'color' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientType?: string;
  gradientAngle?: number;
  gradientColor1?: string;
  gradientColor2?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  opacity?: number;
  transformOrigin?: string;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  skewX?: number;
  skewY?: number;
  perspective?: number;
  blendMode?: string;
  contrast?: number;
  brightness?: number;
  saturate?: number;
  grayscale?: number;
  invert?: number;
  sepia?: number;
  hueRotate?: number; initField?: string; position?: string;
  top?: number;
  left?: number;
  events?: EventItem[];
  displayAnimation?: DisplayAnimationItem | null;
  hoverAnimation?: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden?: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
};

type StyledTextProps = {
  $isSelected?: boolean;
  $isChildOfButton?: boolean;
};

const defaultProps = {
  fontSize: '15',
  textAlign: 'left',
  fontWeight: '400',
  fontStyle: 'normal',
  color: '#000000',
  shadow: 0,
  text: 'Text',
  enabled: true,
  isChildOfButton: false,
  fontFamily: 'inherit',
  lineHeight: '1.4',
  letterSpacing: '0',
  textTransform: 'none',
  textDecoration: 'none',
  width: 'auto',
  textShadow: { x: 0, y: 0, blur: 0, color: '#000000', enabled: false },
  textStroke: { width: 0, color: '#000000' },
  // Background defaults
  backgroundType: 'color',
  backgroundColor: 'transparent',
  gradientType: 'linear',
  gradientAngle: 90,
  gradientColor1: '#4158D0',
  gradientColor2: '#C850C0',
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'scroll',
  opacity: 100,
  transformOrigin: 'center center',
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  skewX: 0,
  skewY: 0,
  perspective: 0,
  blendMode: 'normal',
  contrast: 100,
  brightness: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  sepia: 0,
  hueRotate: 0, initField: 'none',
  position: 'absolute',
  top: 0, left: 0,
  isEditing: false,
  events: [],
  displayAnimation: null,
  hoverAnimation: { enabled: false },
  pinning: {
    enabled: false,
    position: 'auto',
    topDistance: 0,
    bottomDistance: 0,
    leftDistance: 0,
    rightDistance: 0,
  },
  hidden: false,
  syncCrossPlatform: true, // Default to enabled
};

const StyledText = styled(ContentEditable) <StyledTextProps>`
  width: ${props => props.width || 'auto'};
  outline: ${({ $isSelected }) => ($isSelected ? '2px dashed #2680eb' : 'none')};
  outline-offset: ${({ $isSelected }) => ($isSelected ? '2px' : '0')};
  position: ${({ $isChildOfButton }) => ($isChildOfButton ? 'static' : 'absolute')};
`;


export const Text = (props: Partial<TextProps>) => {
  const {
    connectors: { connect },
    actions: { setProp },
    selected,
    parent,
    id
  } = useNode((node) => ({
    enabled: node.data.props.enabled,
    selected: node.events.selected,
    parent: node.data.parent,
    id: node.id,
  }));

  // Since we're using the simpler document.execCommand approach,
  // we don't need complex formatting functions in the Text component
  const { actions } = useEditor();
  const { pageContent, setPageContent } = useViewport();
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  // Use the event handling hook
  const { handleContainerClick, handleHover } = useEventHandling(mergedProps.events, id);
  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // Animation hooks
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { applyHoverStyles } = useHoverAnimations(mergedProps.hoverAnimation);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, mergedProps.displayAnimation);

  // Enhanced hover handler to include animations
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    handleHover();
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
  };

  // Enhanced click handler to execute events in preview mode
  const handleClick = (e: React.MouseEvent) => {
    handleContainerClick();
  };

  const [isInsideButton, setIsInsideButton] = React.useState(mergedProps.isChildOfButton);
  React.useEffect(() => {
    if (selected && isInsideButton) {
      actions.setProp(parent!, (props: any) => {
        props.currentSetting = 'text';
      });
    }
  }, [selected, isInsideButton]);

  React.useEffect(() => {
    if (mergedProps.isChildOfButton) {
      setIsInsideButton(true);
      return;
    }

    if (parent) {
      const isButton = parent.includes('Button');
      setIsInsideButton(isButton);

      if (isButton) {
        setProp((props: any) => {
          props.position = 'static';
          props.top = 'auto';
          props.left = 'auto';
        });
      }
    }
  }, [parent, mergedProps.isChildOfButton, setProp]);
  // Generate background styles
  const getBackgroundStyle = () => {
    if (mergedProps.backgroundType === 'color' && mergedProps.backgroundColor !== defaultProps.backgroundColor) {
      return mergedProps.backgroundColor;
    } else if (mergedProps.backgroundType === 'gradient') {
      const type = mergedProps.gradientType === 'radial' ? 'radial-gradient' : 'linear-gradient';
      const angle = mergedProps.gradientType === 'linear' ? `${mergedProps.gradientAngle}deg, ` : '';
      return `${type}(${angle}${mergedProps.gradientColor1}, ${mergedProps.gradientColor2})`;
    } else if (mergedProps.backgroundType === 'image' && mergedProps.backgroundImage) {
      return `url(${mergedProps.backgroundImage})`;
    }
    return undefined;
  };

  const textStyles = minimizeStyle({
    color: mergedProps.color !== defaultProps.color ? mergedProps.color : undefined,
    fontSize: mergedProps.fontSize !== defaultProps.fontSize ? `${mergedProps.fontSize.includes('px') ? mergedProps.fontSize : mergedProps.fontSize + 'px'}` : undefined,
    // Ensure custom fonts are applied by adding quotes if needed and checking for special characters
    fontFamily: mergedProps.fontFamily !== defaultProps.fontFamily ?
      (mergedProps.fontFamily.includes("'") || mergedProps.fontFamily.includes('"') ||
        mergedProps.fontFamily.includes(',') || mergedProps.fontFamily === 'inherit') ?
        mergedProps.fontFamily :
        `'${mergedProps.fontFamily}'`
      : undefined,
    fontStyle: mergedProps.fontStyle !== defaultProps.fontStyle ? mergedProps.fontStyle : undefined, lineHeight: mergedProps.lineHeight !== defaultProps.lineHeight ? mergedProps.lineHeight : undefined,
    letterSpacing: mergedProps.letterSpacing !== defaultProps.letterSpacing ? mergedProps.letterSpacing : undefined,
    textTransform: mergedProps.textTransform !== defaultProps.textTransform ? mergedProps.textTransform : undefined,
    textDecoration: mergedProps.textDecoration !== defaultProps.textDecoration ? mergedProps.textDecoration : undefined,
    width: mergedProps.width !== defaultProps.width ? mergedProps.width : 'auto',
    textShadow: mergedProps.textShadow?.enabled && (mergedProps.textShadow.x !== defaultProps.textShadow.x ||
      mergedProps.textShadow.y !== defaultProps.textShadow.y ||
      mergedProps.textShadow.blur !== defaultProps.textShadow.blur ||
      mergedProps.textShadow.color !== defaultProps.textShadow.color)
      ? `${mergedProps.textShadow.x}px ${mergedProps.textShadow.y}px ${mergedProps.textShadow.blur}px ${mergedProps.textShadow.color}`
      : undefined,
    WebkitTextStroke: mergedProps.textStroke && (mergedProps.textStroke.width !== defaultProps.textStroke.width ||
      mergedProps.textStroke.color !== defaultProps.textStroke.color)
      ? `${mergedProps.textStroke.width}px ${mergedProps.textStroke.color}`
      : undefined,
    fontWeight: mergedProps.fontWeight !== defaultProps.fontWeight ? mergedProps.fontWeight : undefined,
    textAlign: mergedProps.textAlign !== defaultProps.textAlign ? mergedProps.textAlign : undefined,
    // Background properties
    background: getBackgroundStyle(),
    backgroundSize: mergedProps.backgroundType === 'image' && mergedProps.backgroundSize !== defaultProps.backgroundSize ? mergedProps.backgroundSize : undefined,
    backgroundPosition: mergedProps.backgroundType === 'image' && mergedProps.backgroundPosition !== defaultProps.backgroundPosition ? mergedProps.backgroundPosition : undefined,
    backgroundRepeat: mergedProps.backgroundType === 'image' && mergedProps.backgroundRepeat !== defaultProps.backgroundRepeat ? mergedProps.backgroundRepeat : undefined,
    backgroundAttachment: mergedProps.backgroundType === 'image' && mergedProps.backgroundAttachment !== defaultProps.backgroundAttachment ? mergedProps.backgroundAttachment : undefined,
    transformOrigin: mergedProps.transformOrigin !== defaultProps.transformOrigin ? mergedProps.transformOrigin : undefined,
    transform: [
      mergedProps.rotate !== defaultProps.rotate ? `rotate(${mergedProps.rotate}deg)` : '',
      mergedProps.rotateX !== defaultProps.rotateX ? `rotateX(${mergedProps.rotateX}deg)` : '',
      mergedProps.rotateY !== defaultProps.rotateY ? `rotateY(${mergedProps.rotateY}deg)` : '',
      mergedProps.skewX !== defaultProps.skewX ? `skewX(${mergedProps.skewX}deg)` : '',
      mergedProps.skewY !== defaultProps.skewY ? `skewY(${mergedProps.skewY}deg)` : '',
    ].filter(Boolean).join(' ') || undefined,
    perspective: mergedProps.perspective !== defaultProps.perspective ? `${mergedProps.perspective}px` : undefined,
    mixBlendMode: mergedProps.blendMode !== defaultProps.blendMode ? mergedProps.blendMode : undefined,
    filter: [
      mergedProps.contrast !== defaultProps.contrast ? `contrast(${mergedProps.contrast}%)` : '',
      mergedProps.brightness !== defaultProps.brightness ? `brightness(${mergedProps.brightness}%)` : '',
      mergedProps.saturate !== defaultProps.saturate ? `saturate(${mergedProps.saturate}%)` : '',
      mergedProps.grayscale !== defaultProps.grayscale ? `grayscale(${mergedProps.grayscale}%)` : '',
      mergedProps.invert !== defaultProps.invert ? `invert(${mergedProps.invert}%)` : '',
      mergedProps.sepia !== defaultProps.sepia ? `sepia(${mergedProps.sepia}%)` : '',
      mergedProps.hueRotate !== defaultProps.hueRotate ? `hue-rotate(${mergedProps.hueRotate}deg)` : '',
    ].filter(Boolean).join(' ') || undefined,
    opacity: (mergedProps.opacity || 100) / 100,
    position: isInsideButton ? 'static' : 'absolute',
    display: isInsideButton ? 'block' : '',
    top: mergedProps.top !== defaultProps.top ? `${mergedProps.top.toString().includes("px") ? mergedProps.top : mergedProps.top + "px"}` : undefined,
    left: mergedProps.left !== defaultProps.left ? `${mergedProps.left.toString().includes("px") ? mergedProps.left : mergedProps.left + "px"}` : undefined,
  });
  if (!pageContent?.isInit && !!pageContent && mergedProps.initField !== 'none') {
    // Helper function to get nested property value
    const getNestedValue = (obj: any, path: string): string => {
      if (!path || path === 'none') return '';

      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current && typeof current === 'object') {
          // Handle array indices
          if (Array.isArray(current) && !isNaN(Number(key))) {
            current = current[Number(key)];
          } else if (key in current) {
            current = current[key];
          } else {
            return '';
          }
        } else {
          return '';
        }
      }

      return typeof current === 'string' ? current : '';
    };

    const text = getNestedValue(pageContent, mergedProps.initField);
    setProp((props: any) => {
      props.text = text;
    }, 500);
    setPageContent({
      ...pageContent,
      isInit: true,
    });
  }

  const handleChangeIsEditing = (isEditing: boolean) => {
    setProp((props: any) => {
      props.isEditing = isEditing;
    }, 100);
  };

  // Handle paste event to clean up pasted content
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    // Get the pasted text (plain text to avoid formatting issues)
    const pastedText = e.clipboardData.getData('text/plain');

    if (pastedText) {
      // Insert the plain text at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create text node and insert
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);

        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);

        // Update the prop with the new content
        const target = e.currentTarget as HTMLElement;
        setProp((props: any) => {
          props.text = target.innerHTML || '';
        }, 500);
      }
    }
  };

  if (isInsideButton) {
    return (
      <StyledText
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        html={mergedProps.text || ''}
        disabled={!selected}
        onChange={(e: React.FormEvent<HTMLDivElement>) => {
          setProp((props: any) => {
            props.text = e.currentTarget.innerHTML || '';
          }, 500);
        }}
        tagName="span"
        style={textStyles}
        $isSelected={selected}
        $isChildOfButton={isInsideButton}
      />
    );
  }

  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width' }}
        style={textStyles}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        onDoubleClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleChangeIsEditing(true);
        }}
        onBlur={() => {
          handleChangeIsEditing(false);
        }}
        // Disable drag when in editing mode to prevent conflicts
        enableDrag={!props.isEditing}
        onMouseDown={(e: React.MouseEvent) => {
          // Prevent drag when clicking on text in edit mode
          if (props.isEditing) {
            e.stopPropagation();
          }
        }}
      >
        <ContentEditable
          html={mergedProps.text || ''}
          disabled={!props.isEditing}
          onChange={(e: React.FormEvent<HTMLDivElement>) => {
            setProp((props: any) => {
              props.text = e.currentTarget.innerHTML || '';
            }, 500);
          }}
          onPaste={handlePaste}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          style={{
            width: '100%',
            outline: 'none',
          }}
          tagName="span"
        />
        {mergedProps.hidden && <OverlayHidden />}
      </Resizer>
    );
  }

  if (mergedProps.hidden) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={textStyles}
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        style={{
          width: '100%',
          outline: 'none',
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(mergedProps.text || '') }}
      />
    </div>
  );
};

Text.craft = {
  displayName: 'Text',
  props: defaultProps,
  related: {
    toolbar: TextSettings,
  },
  rules: {
    canDrag: (node: any) => {
      const isChildOfButton = node.data.props.isChildOfButton ||
        (node.data.parent && node.data.parent.includes('Button'));
      const isChildOfGroup = node.data.props.isChildOfGroup ||
        (node.data.parent && node.data.parent.includes('Group'));
      const isEditing = node.data.props.isEditing;

      // Don't allow drag when text is being edited to prevent conflicts
      if (isEditing) {
        return false;
      }

      return !isChildOfButton && !isChildOfGroup;
    },
    canMoveIn: () => false, // Text elements shouldn't accept children
    canMoveOut: (node: any) => {
      // Allow moving out unless it's a child of button or group
      const isChildOfButton = node.data.props.isChildOfButton ||
        (node.data.parent && node.data.parent.includes('Button'));
      const isChildOfGroup = node.data.props.isChildOfGroup ||
        (node.data.parent && node.data.parent.includes('Group'));
      return !isChildOfButton && !isChildOfGroup;
    },
  },
};
