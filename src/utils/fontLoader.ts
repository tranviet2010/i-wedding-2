/**
 * Keeps track of which fonts have been loaded to avoid loading duplicates
 */
const loadedFonts: Set<string> = new Set();

/**
 * Loads a font from URL and injects the necessary @font-face style
 * 
 * @param fontName The name to use for the font-family
 * @param fontUrl The URL to the font file
 * @param fontFormat The format of the font file (e.g., 'truetype', 'woff2')
 * @returns The font family name that can be used in CSS
 */
export const loadFontFromUrl = (fontName: string, fontUrl: string, fontFormat: string = 'truetype'): string => {
  // Skip if already loaded
  if (loadedFonts.has(fontName)) {
    return fontName;
  }
  // Get or create the font manager style element
  let style = document.getElementById('font-manager-style') as HTMLStyleElement;
  if (!style) {
    style = document.createElement('style');
    style.id = 'font-manager-style';
    style.type = 'text/css';
    document.head.appendChild(style);
  }

  // Append the new font-face declaration to the style element
  // THIS IS THE PART THAT MAKES THE FONT AVAILABLE VIA CSS
  const fontFaceDeclaration = `
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}') format('${fontFormat}');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  // Append the CSS text to the style element's content
  // This makes the browser parse the @font-face rule.
  style.appendChild(document.createTextNode(fontFaceDeclaration));

  // Add to loaded fonts set
  loadedFonts.add(fontName);

  return fontName; // Returns immediately, font loads asynchronously
};

/**
 * Gets the font format based on MIME type
 * 
 * @param mimeType The MIME type of the font file
 * @returns The format string for use in @font-face
 */
export const getFontFormat = (mimeType: string): string => {
  switch (mimeType) {
    case 'font/ttf': return 'truetype';
    case 'font/otf': return 'opentype';
    case 'font/woff': return 'woff';
    case 'font/woff2': return 'woff2';
    default: return 'truetype'; // Default
  }
};

/**
 * Loads all custom fonts from the provided list
 * 
 * @param fonts Array of font objects with fileName and filePath properties
 * @param domainPrefix Domain prefix to prepend to relative paths
 */
export const loadAllCustomFonts = (fonts: Array<{fileName: string, filePath: string, mimeType: string}>, domainPrefix: string): void => {
  fonts.forEach(font => {
    const fontUrl = `${domainPrefix}${font.filePath}`;
    loadFontFromUrl(font.fileName, fontUrl, getFontFormat(font.mimeType));
  });
};

/**
 * Check if a font is loaded in the document
 * 
 * @param fontFamily The font-family name to check
 * @returns True if the font is loaded and available
 */
export const isFontLoaded = (fontFamily: string): boolean => {
  return loadedFonts.has(fontFamily);
};
