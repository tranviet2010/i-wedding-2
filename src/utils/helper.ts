export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

/**
 * Creates a minimal style object by removing default or unset properties
 * 
 * @param styleObject The original style object with all properties
 * @param defaultValues Default values for the style properties
 * @returns A minimal style object with only the necessary properties
 */
export const minimizeStyle = (styleObject: Record<string, any>, defaultValues: Record<string, any> = {}) => {
  // If no style object, return empty object
  if (!styleObject) return {};

  // Create a new object for minimal styles
  const minimalStyle: Record<string, any> = {};

  // Process each property
  Object.entries(styleObject).forEach(([key, value]) => {
    // Skip if value is null or undefined
    if (value === null || value === undefined) return;

    // Skip empty strings
    if (value === '') return;

    // Skip values that match defaults
    if (defaultValues[key] === value) return;

    // Skip 'auto' values for certain properties
    if (value === 'auto' && ['width', 'height', 'minWidth', 'minHeight'].includes(key)) return;

    // Skip 'normal' values for font properties
    if (value === 'normal' && ['fontWeight', 'fontStyle', 'letterSpacing'].includes(key)) return;

    // Skip 'none' values for certain properties
    if (value === 'none' && ['textDecoration', 'boxShadow', 'transform'].includes(key)) return;

    // Skip '0px' or '0' values for spacing properties
    if ((value === '0px' || value === '0') &&
      ['margin', 'padding', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
        'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)) return;

    // Keep the value in the minimal style
    minimalStyle[key] = value;
  });

  return minimalStyle;
};
// Function to get YouTube video ID from URL
export const getYouTubeVideoId = (url: string) => {
  if (!url) return null;

  // Handle youtu.be short URLs
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1];
    return id.split('?')[0];
  }

  // Handle youtube.com URLs
  if (url.includes('youtube.com')) {
    // Handle embed URLs
    if (url.includes('/embed/')) {
      const id = url.split('/embed/')[1];
      return id.split('?')[0];
    }

    // Handle watch URLs
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1];
      return id.split('&')[0];
    }

    // Handle other formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  return null;
};