import React from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { ContentWrapperSettings } from './ContentWrapperSettings';
import { zIndex } from '@/utils/zIndex';

interface ContentWrapperProps {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  textColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  direction: 'ltr' | 'rtl';
  backgroundType: 'color' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDeg: number;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundOpacity: number;
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  blur: number;
  sepia: number;
  overlayColor: string;
  overlayOpacity: number;
  padding: string;
  children: React.ReactNode;
  locked: boolean;
  syncCrossPlatform?: boolean; // Cross-platform sync control
}

const defaultProps: ContentWrapperProps = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  textColor: '#333333',
  textAlign: 'left',
  direction: 'ltr',
  backgroundType: 'color',
  backgroundColor: '#ffffff',
  gradientFrom: '#6366f1',
  gradientTo: '#8b5cf6',
  gradientDeg: 45,
  backgroundImage: '',
  backgroundVideo: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundOpacity: 100,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hueRotate: 0,
  blur: 0,
  sepia: 0,
  overlayColor: '#000000',
  overlayOpacity: 0,
  padding: '0',
  children: null,
  locked: true,
  syncCrossPlatform: true, // Default to enabled
};

export const ContentWrapper: UserComponent<Partial<ContentWrapperProps>> = (props) => {
  const {
    connectors: { connect },
  } = useNode();

  const mergedProps = { ...defaultProps, ...props };

  const getBackgroundStyle = () => {
    if (mergedProps.backgroundType === 'color') {
      return mergedProps.backgroundColor;
    } else if (mergedProps.backgroundType === 'gradient') {
      return `linear-gradient(${mergedProps.gradientDeg}deg, ${mergedProps.gradientFrom}, ${mergedProps.gradientTo})`;
    } else if (mergedProps.backgroundType === 'image') {
      return `url(${mergedProps.backgroundImage})`;
    }
    return '';
  };

  const filterStyle = `
    brightness(${mergedProps.brightness}%)
    contrast(${mergedProps.contrast}%)
    saturate(${mergedProps.saturate}%)
    hue-rotate(${mergedProps.hueRotate}deg)
    blur(${mergedProps.blur}px)
    sepia(${mergedProps.sepia}%)
  `;

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: mergedProps.fontFamily,
    fontSize: mergedProps.fontSize,
    fontWeight: mergedProps.fontWeight,
    color: mergedProps.textColor,
    textAlign: mergedProps.textAlign,
    direction: mergedProps.direction,
    padding: mergedProps.padding,
  };

  const beforeStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: zIndex.base,
    background: mergedProps.backgroundType !== 'video' ? getBackgroundStyle() : undefined,
    backgroundSize: mergedProps.backgroundType === 'image' ? mergedProps.backgroundSize : 'auto',
    backgroundPosition: mergedProps.backgroundType === 'image' ? mergedProps.backgroundPosition : 'center',
    opacity: mergedProps.backgroundOpacity / 100,
    filter: filterStyle,
  };

  const afterStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: mergedProps.overlayColor,
    opacity: mergedProps.overlayOpacity / 100,
    zIndex: zIndex.content,
  };

  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: zIndex.base,
    filter: filterStyle,
    opacity: mergedProps.backgroundOpacity / 100,
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: zIndex.contentOverlay,
    width: '100%',
  };

  return (
    <div
      className='content-wrapper'
      // ref={(dom: HTMLDivElement | null) => {
      //   if (dom) connect(dom);
      // }}
      style={wrapperStyle}
    >
      <div style={beforeStyle} />
      <div style={afterStyle} />
      {mergedProps.backgroundType === 'video' && mergedProps.backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          src={mergedProps.backgroundVideo}
          style={videoStyle}
        />
      )}
      <div style={contentStyle}>
        {props.children}
      </div>
    </div>
  );
};

ContentWrapper.craft = {
  displayName: 'Content Wrapper',
  props: defaultProps,
  rules: {
    canDrag: () => false,
    canDrop: () => false,
    canMoveIn: () => true,
  },
  related: {
    toolbar: ContentWrapperSettings,
  },
}; 