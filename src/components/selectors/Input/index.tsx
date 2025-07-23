import { OverlayHidden } from '@/components/editor/components/OverlayHidden';
import { minimizeStyle } from '@/utils/helper';
import { useEditor, useNode } from '@craftjs/core';
import React, { useRef } from 'react';
import { Resizer } from '../Resizer';
import { InputSettings } from './InputSettings.tsx';

export type InputProps = {
  inputType?: string;
  dataName?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  elementPosition?: number;
  options?: string;
  width?: string;
  height?: string;
  padding?: string;
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
  hueRotate?: number;
  position?: string;
  top?: number;
  left?: number;
  hidden?: boolean;
  isChildOfButton?: boolean;
  isChildOfForm?: boolean;
  lockAspectRatio?: boolean;
  // Border & Corner Radius
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: number[];
  borderRadius?: number[];
  // Color & Background
  backgroundColor?: string;
  backgroundType?: 'color' | 'gradient' | 'image';
  gradientType?: string;
  gradientAngle?: number;
  gradientColor1?: string;
  gradientColor2?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  // Shadow
  shadowType?: string;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  // Text Settings
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
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
  syncCrossPlatform?: boolean; // Cross-platform sync control
};

const defaultProps = {
  inputType: 'text',
  dataName: 'input_field',
  required: false,
  placeholder: 'Nhập nội dung...',
  defaultValue: '',
  elementPosition: 1,
  options: '',
  width: '200px',
  height: '40px',
  fontSize: '14px',
  color: '#000000',
  padding: '8px 12px',
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
  hueRotate: 0,
  position: 'absolute',
  top: 0,
  left: 0,
  hidden: false,
  isChildOfButton: false,
  isChildOfForm: false,
  lockAspectRatio: false,
  // Border & Corner Radius
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  borderWidth: [1, 1, 1, 1],
  borderRadius: [4, 4, 4, 4],
  // Color & Background
  backgroundColor: '#ffffff',
  backgroundType: 'color',
  gradientType: 'linear',
  gradientAngle: 0,
  gradientColor1: '#ffffff',
  gradientColor2: '#000000',
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  // Shadow
  shadowType: 'none',
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  shadowSpread: 0,
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  // Text Settings
  fontFamily: 'inherit',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
  lineHeight: '1.4',
  letterSpacing: '0px',
  textTransform: 'none',
  textDecoration: 'none',
  textShadow: { x: 0, y: 0, blur: 0, color: '#000000', enabled: false },
  textStroke: { width: 0, color: '#000000' },
  syncCrossPlatform: true, // Default to enabled
};

export const Input = (props: Partial<InputProps>) => {
  const {
    connectors: { connect },
    actions: { setProp },
    id
  } = useNode((node) => ({
    id: node.id,
  }));

  const containerRef = useRef<HTMLDivElement>(null);
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  // Get editor state
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));


  // Get appropriate height based on input type
  const getInputHeight = () => {
    switch (mergedProps.inputType) {
      case 'textarea':
        // In editor mode, let Resizer handle height; in preview mode, use specified height
        return enabled ? 'auto' : mergedProps.height;
      case 'radio':
      case 'checkbox':
        return 'auto'; // Let content determine height
      default:
        return mergedProps.height;
    }
  };

  // Helper function to create background styles
  const getBackgroundStyle = () => {
    switch (mergedProps.backgroundType) {
      case 'gradient':
        if (mergedProps.gradientType === 'linear') {
          return `linear-gradient(${mergedProps.gradientAngle}deg, ${mergedProps.gradientColor1}, ${mergedProps.gradientColor2})`;
        } else {
          return `radial-gradient(circle, ${mergedProps.gradientColor1}, ${mergedProps.gradientColor2})`;
        }
      case 'image':
        return mergedProps.backgroundImage ? `url(${mergedProps.backgroundImage})` : mergedProps.backgroundColor;
      default:
        return mergedProps.backgroundColor;
    }
  };

  // Helper function to create shadow styles
  const getShadowStyle = () => {
    if (mergedProps.shadowType === 'none') return undefined;

    const shadowValue = `${mergedProps.shadowX}px ${mergedProps.shadowY}px ${mergedProps.shadowBlur}px ${mergedProps.shadowSpread}px ${mergedProps.shadowColor}`;

    if (mergedProps.shadowType === 'inset') {
      return `inset ${shadowValue}`;
    }
    return shadowValue;
  };

  // Create input styles
  const inputStyles: React.CSSProperties = {
    ...minimizeStyle({
      width: mergedProps.width,
      height: getInputHeight(),
      opacity: mergedProps.opacity / 100,
      padding: mergedProps.padding,
      background: getBackgroundStyle(),
      backgroundSize: mergedProps.backgroundType === 'image' ? mergedProps.backgroundSize : undefined,
      backgroundPosition: mergedProps.backgroundType === 'image' ? mergedProps.backgroundPosition : undefined,
      backgroundRepeat: mergedProps.backgroundType === 'image' ? mergedProps.backgroundRepeat : undefined,
      // Border styles
      borderStyle: mergedProps.borderStyle,
      borderColor: mergedProps.borderColor,
      borderWidth: mergedProps.borderWidth ? `${mergedProps.borderWidth[0]}px ${mergedProps.borderWidth[1]}px ${mergedProps.borderWidth[2]}px ${mergedProps.borderWidth[3]}px` : undefined,
      borderRadius: mergedProps.borderRadius ? `${mergedProps.borderRadius[0]}px ${mergedProps.borderRadius[1]}px ${mergedProps.borderRadius[2]}px ${mergedProps.borderRadius[3]}px` : undefined,
      // Shadow
      boxShadow: getShadowStyle(),
      // Text styles
      fontSize: mergedProps.fontSize ? `${mergedProps.fontSize.includes('px') ? mergedProps.fontSize : mergedProps.fontSize + 'px'}` : undefined,
      fontFamily: mergedProps.fontFamily !== defaultProps.fontFamily ?
        (mergedProps.fontFamily.includes("'") || mergedProps.fontFamily.includes('"') ||
         mergedProps.fontFamily.includes(',') || mergedProps.fontFamily === 'inherit') ?
          mergedProps.fontFamily : `'${mergedProps.fontFamily}'` : undefined,
      fontWeight: mergedProps.fontWeight,
      fontStyle: mergedProps.fontStyle,
      color: mergedProps.color,
      textAlign: mergedProps.textAlign as any,
      lineHeight: mergedProps.lineHeight,
      letterSpacing: mergedProps.letterSpacing,
      textTransform: mergedProps.textTransform as any,
      textDecoration: mergedProps.textDecoration,
      textShadow: mergedProps.textShadow?.enabled ?
        `${mergedProps.textShadow.x}px ${mergedProps.textShadow.y}px ${mergedProps.textShadow.blur}px ${mergedProps.textShadow.color}` : undefined,
      WebkitTextStroke: mergedProps.textStroke?.width ? `${mergedProps.textStroke.width}px ${mergedProps.textStroke.color}` : undefined,
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
      position: 'absolute',
      top: mergedProps.top !== defaultProps.top ? `${mergedProps.top.toString().includes("px") ? mergedProps.top : mergedProps.top + "px"}` : undefined,
      left: mergedProps.left !== defaultProps.left ? `${mergedProps.left.toString().includes("px") ? mergedProps.left : mergedProps.left + "px"}` : undefined,
    }),
  };

  // Handle input value change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (enabled) {
      setProp((props: any) => {
        props.defaultValue = e.target.value;
      }, 500);
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (enabled) {
      setProp((props: any) => {
        const currentValues = props.defaultValue ? props.defaultValue.split(',') : [];
        if (checked) {
          if (!currentValues.includes(value)) {
            currentValues.push(value);
          }
        } else {
          const index = currentValues.indexOf(value);
          if (index > -1) {
            currentValues.splice(index, 1);
          }
        }
        props.defaultValue = currentValues.join(',');
      }, 500);
    }
  };

  // Parse options from textarea
  const getOptions = () => {
    if (!mergedProps.options) return [];
    return mergedProps.options.split('\n').filter(option => option.trim() !== '');
  };

  // Render input element based on type
  const renderInput = () => {
    const baseProps = {
      name: mergedProps.dataName,
      required: mergedProps.required,
      'data-element-position': mergedProps.elementPosition,
      style: {
        outline: 'none',
        border: 'none',
        boxShadow: 'none',
        width: '100%',
        height: '100%',
        background: 'transparent',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        fontWeight: 'inherit',
        fontStyle: 'inherit',
        color: 'inherit',
        textAlign: 'inherit' as const,
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        textTransform: 'inherit' as const,
        textDecoration: 'inherit' as const,
      }
    };

    switch (mergedProps.inputType) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            placeholder={mergedProps.placeholder}
            defaultValue={mergedProps.defaultValue}
            onChange={handleInputChange}
            rows={enabled ? 4 : undefined} // Only use rows in editor mode
            style={{
              ...baseProps.style,
              resize: 'none', // Prevent user resizing
              minHeight: enabled ? undefined : '100%', // Ensure full height in preview mode
            }}
          />
        );

      case 'select':
        const selectOptions = getOptions();
        if (selectOptions.length === 0) {
          return (
            <select {...baseProps} disabled>
              <option>Chưa có tùy chọn nào</option>
            </select>
          );
        }
        return (
          <select
            {...baseProps}
            defaultValue={mergedProps.defaultValue}
            onChange={handleInputChange}
          >
            {mergedProps.placeholder && (
              <option value="" disabled>
                {mergedProps.placeholder}
              </option>
            )}
            {selectOptions.map((option, index) => (
              <option key={index} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );

      case 'radio':
        const radioOptions = getOptions();
        if (radioOptions.length === 0) {
          return (
            <div style={{ padding: '8px', color: '#666', fontSize: mergedProps.fontSize }}>
              Chưa có tùy chọn nào
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {radioOptions.map((option, index) => {
              const optionValue = option.trim();
              return (
                <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: mergedProps.fontSize, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={mergedProps.dataName}
                    value={optionValue}
                    defaultChecked={mergedProps.defaultValue === optionValue}
                    onChange={handleInputChange}
                    disabled={!enabled}
                    required={mergedProps.required}
                    data-element-position={mergedProps.elementPosition}
                  />
                  <span>{optionValue}</span>
                </label>
              );
            })}
          </div>
        );

      case 'checkbox':
        const checkboxOptions = getOptions();
        if (checkboxOptions.length === 0) {
          return (
            <div style={{ padding: '8px', color: '#666', fontSize: mergedProps.fontSize }}>
              Chưa có tùy chọn nào
            </div>
          );
        }
        const selectedValues = mergedProps.defaultValue ? mergedProps.defaultValue.split(',') : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {checkboxOptions.map((option, index) => {
              const optionValue = option.trim();
              return (
                <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: mergedProps.fontSize, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name={`${mergedProps.dataName}[]`}
                    value={optionValue}
                    defaultChecked={selectedValues.includes(optionValue)}
                    onChange={(e) => handleCheckboxChange(optionValue, e.target.checked)}
                    disabled={!enabled}
                    data-element-position={mergedProps.elementPosition}
                  />
                  <span>{optionValue}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            {...baseProps}
            type={mergedProps.inputType}
            placeholder={mergedProps.placeholder}
            defaultValue={mergedProps.defaultValue}
            onChange={handleInputChange}
          />
        );
    }
  };


  if (enabled) {
    return (
      <Resizer
        propKey={{ width: 'width', height: 'height' }}
        style={inputStyles}
        innerRef={(dom: HTMLElement | null) => {
          if (dom) connect(dom);
        }}
        lockAspectRatio={mergedProps.lockAspectRatio}
      >
        {renderInput()}
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
      style={inputStyles}
      data-node-id={id}
    >
      {renderInput()}
    </div>
  );
};

Input.craft = {
  displayName: 'Input',
  props: defaultProps,
  related: {
    toolbar: InputSettings,
  },
  rules: {
    canDrag: (node: any) => {
      const isChildOfButton = node.data.props.isChildOfButton ||
        (node.data.parent && node.data.parent.includes('Button'));
      const isChildOfGroup = node.data.props.isChildOfGroup ||
        (node.data.parent && node.data.parent.includes('Group'));
      const isChildOfForm = node.data.props.isChildOfForm ||
        (node.data.parent && node.data.parent.includes('Form'));
      return !isChildOfButton && !isChildOfGroup && !isChildOfForm;
    },
  },
};
