/**
 * Desktop to Mobile Conversion Utilities
 * 
 * This module provides functions to convert desktop layouts to mobile-friendly formats
 * by adjusting dimensions, positioning, typography, and layout properties.
 */

// Constants for conversion
const DESKTOP_MAX_WIDTH = 960;
const MOBILE_MAX_WIDTH = 380;
const MOBILE_SCALE_FACTOR = MOBILE_MAX_WIDTH / DESKTOP_MAX_WIDTH; // ~0.44

// Font size conversion rules
const FONT_SIZE_SCALE_FACTOR = 0.85; // Reduce font sizes by 15% for mobile
const MIN_FONT_SIZE = 12; // Minimum readable font size on mobile
const MAX_FONT_SIZE = 48; // Maximum font size on mobile

// Spacing conversion rules
const SPACING_SCALE_FACTOR = 0.7; // Reduce spacing by 30% for mobile
const MIN_SPACING = 4; // Minimum spacing on mobile

/**
 * Converts a pixel value to mobile-scaled equivalent
 */
export const scaleDimensionForMobile = (value: string | number): string => {
  if (typeof value === 'string') {
    // Handle percentage values
    if (value.includes('%')) {
      return value; // Keep percentages as-is
    }
    
    // Handle pixel values
    if (value.includes('px')) {
      const numValue = parseInt(value);
      return `${Math.round(numValue * MOBILE_SCALE_FACTOR)}px`;
    }
    
    // Handle auto, inherit, etc.
    if (value === 'auto' || value === 'inherit' || value === 'initial') {
      return value;
    }
    
    // Try to parse as number
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      return `${Math.round(numValue * MOBILE_SCALE_FACTOR)}px`;
    }
  }
  
  if (typeof value === 'number') {
    return `${Math.round(value * MOBILE_SCALE_FACTOR)}px`;
  }
  
  return value as string;
};

/**
 * Converts font size for mobile readability
 */
export const scaleFontSizeForMobile = (fontSize: string | number): string => {
  let numValue: number;
  
  if (typeof fontSize === 'string') {
    if (fontSize.includes('px')) {
      numValue = parseInt(fontSize);
    } else {
      numValue = parseInt(fontSize);
    }
  } else {
    numValue = fontSize;
  }
  
  if (isNaN(numValue)) {
    return '16px'; // Default mobile font size
  }
  
  // Scale font size and apply constraints
  const scaledSize = Math.round(numValue * FONT_SIZE_SCALE_FACTOR);
  const constrainedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, scaledSize));
  
  return `${constrainedSize}px`;
};

/**
 * Converts spacing values (padding, margin) for mobile
 */
export const scaleSpacingForMobile = (spacing: number[] | string | number): number[] | string => {
  if (typeof spacing === 'string') {
    return spacing; // Keep string values as-is (e.g., 'auto')
  }
  
  if (typeof spacing === 'number') {
    return [Math.max(MIN_SPACING, Math.round(spacing * SPACING_SCALE_FACTOR))];
  }
  
  if (Array.isArray(spacing)) {
    return spacing.map(value => 
      Math.max(MIN_SPACING, Math.round(value * SPACING_SCALE_FACTOR))
    );
  }
  
  return spacing;
};

/**
 * Converts absolute positioning to mobile-friendly positioning
 */
export const convertPositioningForMobile = (props: any): any => {
  const converted = { ...props };

  // Reset absolute positions to 0 for mobile layout
  if (converted.top !== undefined && converted.top !== 'auto') {
    converted.top = 0;
  }

  if (converted.left !== undefined && converted.left !== 'auto') {
    converted.left = 0;
  }

  return converted;
};

/**
 * Converts layout properties for mobile stacking
 */
export const convertLayoutForMobile = (props: any): any => {
  const converted = { ...props };
  
  // Convert flex layouts to mobile-friendly stacking
  if (converted.flexDirection === 'row') {
    converted.flexDirection = 'column';
  }
  
  // Adjust grid layouts for mobile
  if (converted.gridColumns && converted.gridColumns > 2) {
    converted.gridColumns = 2; // Max 2 columns on mobile
  }
  
  // Adjust album layouts
  if (converted.layoutType === 'horizontal' && converted.gridColumns > 2) {
    converted.gridColumns = 1; // Single column for horizontal layouts on mobile
  }
  
  return converted;
};

/**
 * Component-specific conversion functions
 */

/**
 * Converts Text component properties for mobile
 */
export const convertTextPropsForMobile = (props: any): any => {
  const converted = { ...props };

  // Scale font size
  if (converted.fontSize) {
    converted.fontSize = scaleFontSizeForMobile(converted.fontSize);
  }

  // Scale line height if it's a pixel value
  if (converted.lineHeight && typeof converted.lineHeight === 'string' && converted.lineHeight.includes('px')) {
    converted.lineHeight = scaleDimensionForMobile(converted.lineHeight);
  }

  // Scale letter spacing
  if (converted.letterSpacing && typeof converted.letterSpacing === 'string' && converted.letterSpacing.includes('px')) {
    converted.letterSpacing = scaleDimensionForMobile(converted.letterSpacing);
  }

  // Scale text shadow
  if (converted.textShadow) {
    converted.textShadow = {
      ...converted.textShadow,
      x: Math.round(converted.textShadow.x * MOBILE_SCALE_FACTOR),
      y: Math.round(converted.textShadow.y * MOBILE_SCALE_FACTOR),
      blur: Math.round(converted.textShadow.blur * MOBILE_SCALE_FACTOR)
    };
  }

  // Scale text stroke
  if (converted.textStroke) {
    converted.textStroke = {
      ...converted.textStroke,
      width: Math.round(converted.textStroke.width * MOBILE_SCALE_FACTOR)
    };
  }

  return converted;
};

/**
 * Converts Image component properties for mobile
 */
export const convertImagePropsForMobile = (props: any): any => {
  const converted = { ...props };

  // Scale dimensions
  if (converted.width && converted.width !== 'auto' && converted.width !== '100%') {
    converted.width = scaleDimensionForMobile(converted.width);
  }

  if (converted.height && converted.height !== 'auto') {
    converted.height = scaleDimensionForMobile(converted.height);
  }

  // Scale crop dimensions
  if (converted.cropWidth) {
    converted.cropWidth = scaleDimensionForMobile(converted.cropWidth);
  }

  if (converted.cropHeight) {
    converted.cropHeight = scaleDimensionForMobile(converted.cropHeight);
  }

  // Scale crop position
  if (converted.cropX) {
    converted.cropX = Math.round(converted.cropX * MOBILE_SCALE_FACTOR);
  }

  if (converted.cropY) {
    converted.cropY = Math.round(converted.cropY * MOBILE_SCALE_FACTOR);
  }

  // Scale border radius
  if (converted.borderRadius && Array.isArray(converted.borderRadius)) {
    converted.borderRadius = converted.borderRadius.map((radius: number) =>
      Math.round(radius * MOBILE_SCALE_FACTOR)
    );
  }

  return converted;
};

/**
 * Converts Button component properties for mobile
 */
export const convertButtonPropsForMobile = (props: any): any => {
  const converted = { ...props };

  // Scale dimensions
  if (converted.width && converted.width !== 'auto') {
    converted.width = scaleDimensionForMobile(converted.width);
  }

  if (converted.height && converted.height !== 'auto') {
    converted.height = scaleDimensionForMobile(converted.height);
  }

  // Scale padding and margin
  if (converted.padding) {
    converted.padding = scaleSpacingForMobile(converted.padding);
  }

  if (converted.margin) {
    converted.margin = scaleSpacingForMobile(converted.margin);
  }

  // Scale border radius
  if (converted.borderRadius && Array.isArray(converted.borderRadius)) {
    converted.borderRadius = converted.borderRadius.map((radius: number) =>
      Math.round(radius * MOBILE_SCALE_FACTOR)
    );
  }

  return converted;
};

/**
 * Converts Container component properties for mobile
 */
export const convertContainerPropsForMobile = (props: any): any => {
  let converted = { ...props };

  // Scale dimensions
  if (converted.width && converted.width !== 'auto' && converted.width !== '100%') {
    converted.width = scaleDimensionForMobile(converted.width);
  }

  if (converted.height && converted.height !== 'auto') {
    converted.height = scaleDimensionForMobile(converted.height);
  }

  if (converted.minHeight) {
    converted.minHeight = scaleDimensionForMobile(converted.minHeight);
  }

  // Scale padding and margin
  if (converted.padding) {
    converted.padding = scaleSpacingForMobile(converted.padding);
  }

  if (converted.margin) {
    converted.margin = scaleSpacingForMobile(converted.margin);
  }

  // Apply positioning conversion
  converted = convertPositioningForMobile(converted);

  // Apply layout conversion
  converted = convertLayoutForMobile(converted);

  return converted;
};

/**
 * Converts Section component properties for mobile
 */
export const convertSectionPropsForMobile = (props: any): any => {
  const converted = { ...props };

  // Scale height
  if (converted.height && converted.height !== 'auto') {
    converted.height = scaleDimensionForMobile(converted.height);
  }

  if (converted.minHeight) {
    converted.minHeight = scaleDimensionForMobile(converted.minHeight);
  }

  // Scale padding
  if (converted.padding) {
    converted.padding = scaleSpacingForMobile(converted.padding);
  }

  return converted;
};

/**
 * Main conversion function that processes the entire content structure
 */
export const convertDesktopContentToMobile = (desktopContent: string): string => {
  try {
    const contentObj = JSON.parse(desktopContent);
    const convertedContent = { ...contentObj };

    // Process each node in the content
    Object.keys(convertedContent).forEach(nodeId => {
      const node = convertedContent[nodeId];
      if (!node || !node.type || !node.type.resolvedName) return;

      const componentType = node.type.resolvedName;
      let convertedProps = { ...node.props };

      // Apply component-specific conversions
      switch (componentType) {
        case 'Text':
          convertedProps = convertTextPropsForMobile(convertedProps);
          break;
        case 'Image':
          convertedProps = convertImagePropsForMobile(convertedProps);
          break;
        case 'Button':
          convertedProps = convertButtonPropsForMobile(convertedProps);
          break;
        case 'Container':
          convertedProps = convertContainerPropsForMobile(convertedProps);
          break;
        case 'Sections':
          convertedProps = convertSectionPropsForMobile(convertedProps);
          break;
        case 'Album':
          // Apply layout conversion for albums
          convertedProps = convertLayoutForMobile(convertedProps);
          break;
        case 'Form':
          // Apply positioning conversion for forms
          convertedProps = convertPositioningForMobile(convertedProps);
          break;
        default:
          // For other components, apply general positioning and layout conversions
          convertedProps = convertPositioningForMobile(convertedProps);
          convertedProps = convertLayoutForMobile(convertedProps);

          // Scale common properties if they exist
          if (convertedProps.width && convertedProps.width !== 'auto' && convertedProps.width !== '100%') {
            convertedProps.width = scaleDimensionForMobile(convertedProps.width);
          }
          if (convertedProps.height && convertedProps.height !== 'auto') {
            convertedProps.height = scaleDimensionForMobile(convertedProps.height);
          }
          if (convertedProps.padding) {
            convertedProps.padding = scaleSpacingForMobile(convertedProps.padding);
          }
          if (convertedProps.margin) {
            convertedProps.margin = scaleSpacingForMobile(convertedProps.margin);
          }
          break;
      }

      // Update the node with converted properties
      convertedContent[nodeId] = {
        ...node,
        props: convertedProps
      };
    });

    return JSON.stringify(convertedContent);
  } catch (error) {
    console.error('Error converting desktop content to mobile:', error);
    return desktopContent; // Return original content if conversion fails
  }
};
