import { useRef, useEffect } from 'react';
import { useEditor, useNode, UserComponent } from '@craftjs/core';
import DOMPurify from 'dompurify';
import { DisplayAnimationItem, HoverAnimationSettings, useAutoDisplayAnimations, useHoverAnimations } from '../../editor/components/AnimationManager';
import { EventItem, useEventHandling } from '../../editor/components/EventManager';
import { PinningSettings } from '../../editor/components/PinningManager';
import { HtmlSelectorSettings } from './HtmlSelectorSettings';
import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { minimizeStyle } from '@/utils/helper';
import { Resizer } from '../Resizer';

export interface HtmlSelectorProps {
  width: string;
  height: string;
  lockAspectRatio: boolean;
  htmlContent: string;

  // Filter properties
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  invert: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  opacity: number;
  blendMode: string;

  // Transform properties
  transformOrigin: string;
  rotate: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  skewX: number;
  skewY: number;
  perspective: number;
  top: number;
  left: number;
  // Standard component properties
  events: EventItem[];
  displayAnimation: DisplayAnimationItem | null;
  hoverAnimation: HoverAnimationSettings;
  pinning: PinningSettings;
  hidden: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps: HtmlSelectorProps = {
  width: '300px',
  height: '200px',
  lockAspectRatio: false,
  htmlContent: '<div style="padding: 20px; text-align: center; border: 2px dashed #ccc; background: #f9f9f9;"><p>Click the HTML button to edit content</p></div>',

  // Filter defaults
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  invert: 0,
  hueRotate: 0,
  blur: 0,
  sepia: 0,
  opacity: 100,
  blendMode: 'normal',

  // Transform defaults
  transformOrigin: 'center center',
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 100,
  skewX: 0,
  skewY: 0,
  perspective: 0,

  // Standard defaults
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
  top: 0,
  left: 0,
};

export const HtmlSelector: UserComponent<Partial<HtmlSelectorProps>> = (props) => {
  const {
    connectors: { connect },
    id
  } = useNode((node) => ({
    id: node.id,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const mergedProps = { ...defaultProps, ...props };

  // Use animation hooks
  const { applyHoverStyles } = useHoverAnimations(mergedProps.hoverAnimation);

  // Use the enhanced animation hook that prevents unnecessary re-applications
  useAutoDisplayAnimations(containerRef, mergedProps.displayAnimation);

  // Use event handling hook
  const { handleContainerClick, handleTriggerMouseEnter, handleTriggerMouseLeave } = useEventHandling(mergedProps.events, id);

  const handleClick = () => {
    if (!enabled) {
      handleContainerClick();
    }
  };

  const handleMouseEnter = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, true);
    }
    if (!enabled) {
      handleTriggerMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      applyHoverStyles(containerRef.current, false);
    }
    if (!enabled) {
      handleTriggerMouseLeave();
    }
  };

  // Build container styles
  const containerStyles = minimizeStyle({
    width: mergedProps.width,
    height: mergedProps.height,
    position: 'absolute',
    top: (mergedProps.top != defaultProps.top ? `${mergedProps.top.toString().includes("px") ? mergedProps.top : mergedProps.top + "px"}` : undefined),
    left: (mergedProps.left != defaultProps.left ? `${mergedProps.left.toString().includes("px") ? mergedProps.left : mergedProps.left + "px"}` : undefined),
    overflow: enabled ? 'visible' : 'hidden',
    opacity: (mergedProps.opacity || 100) / 100,
    mixBlendMode: mergedProps.blendMode !== 'normal' ? mergedProps.blendMode as any : undefined,
    filter: `
      brightness(${mergedProps.brightness}%)
      contrast(${mergedProps.contrast}%)
      saturate(${mergedProps.saturate}%)
      grayscale(${mergedProps.grayscale}%)
      invert(${mergedProps.invert}%)
      hue-rotate(${mergedProps.hueRotate}deg)
      blur(${mergedProps.blur}px)
      sepia(${mergedProps.sepia}%)
    `.replace(/\s+/g, ' ').trim(),
    transformOrigin: mergedProps.transformOrigin,
    transform: `
      rotate(${mergedProps.rotate}deg)
      rotateX(${mergedProps.rotateX}deg)
      rotateY(${mergedProps.rotateY}deg)
      rotateZ(${mergedProps.rotateZ}deg)
      scale(${mergedProps.scale / 100})
      skewX(${mergedProps.skewX}deg)
      skewY(${mergedProps.skewY}deg)
    `.replace(/\s+/g, ' ').trim(),
    perspective: mergedProps.perspective > 0 ? `${mergedProps.perspective}px` : 'none',
  });

  // Sanitize HTML content for safe rendering
  const sanitizeHtml = (html: string): string => {
    // Allow everything without sanitization
    return html;

    // Alternative: Use DOMPurify with maximum permissiveness (uncomment to use)
    /*
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ['iframe', 'script', 'style', 'object', 'embed', 'link', 'meta', 'base'],
      ADD_ATTR: ['allowfullscreen', 'frameborder', 'scrolling', 'sandbox', 'srcdoc', 'onload', 'onerror'],
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: true,
      ALLOW_ARIA_ATTR: true,
      KEEP_CONTENT: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      FORBID_TAGS: [],
      FORBID_ATTR: [],
      FORCE_BODY: false,
      SANITIZE_DOM: false
    });
    */
  };

  // Editor mode - show placeholder/container outline
  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={containerStyles}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        lockAspectRatio={mergedProps.lockAspectRatio}
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #ccc',
          background: '#f9f9f9',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>HTML Selector</div>
            <div style={{ fontSize: '12px' }}>Use settings panel to edit HTML content</div>
          </div>
        </div>
        {mergedProps.hidden && <OverlayHidden />}
      </Resizer>
    );
  }

  // View mode - render actual HTML content
  if (mergedProps.hidden) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={containerStyles}
      data-node-id={id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto'
        }}
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(mergedProps.htmlContent)
        }}
      />
    </div>
  );
};

HtmlSelector.craft = {
  displayName: 'HtmlSelector',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    toolbar: HtmlSelectorSettings,
  },
};
