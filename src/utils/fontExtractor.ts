/**
 * Utility to extract custom font references from serialized Craft.js content
 * and determine which fonts need to be preloaded for ViewOnlyViewport
 */

/**
 * Extracts all custom font family references from serialized Craft.js content
 * @param serializedContent - The serialized JSON content from Craft.js
 * @returns Array of unique custom font names that need to be loaded
 */
export const extractCustomFontsFromContent = (serializedContent: string): string[] => {
  if (!serializedContent) {
    return [];
  }

  try {
    const parsedContent = JSON.parse(serializedContent);
    const customFonts = new Set<string>();

    // Recursive function to traverse the node tree
    const traverseNodes = (nodes: any) => {
      if (!nodes || typeof nodes !== 'object') {
        return;
      }

      // If nodes is an object with node IDs as keys
      if (typeof nodes === 'object' && !Array.isArray(nodes)) {
        Object.values(nodes).forEach((node: any) => {
          if (node && typeof node === 'object') {
            extractFontsFromNode(node);
            
            // Recursively check child nodes
            if (node.nodes && Array.isArray(node.nodes)) {
              node.nodes.forEach((childNodeId: string) => {
                if (nodes[childNodeId]) {
                  extractFontsFromNode(nodes[childNodeId]);
                }
              });
            }
          }
        });
      }
    };

    // Extract fonts from a single node
    const extractFontsFromNode = (node: any) => {
      if (!node || typeof node !== 'object') {
        return;
      }

      // Check props for fontFamily
      if (node.props && node.props.fontFamily) {
        const fontFamily = node.props.fontFamily;
        if (isCustomFont(fontFamily)) {
          customFonts.add(cleanFontName(fontFamily));
        }
      }

      // Check for Text component with inline styles in text content
      if (node.type && node.type.resolvedName === 'Text' && node.props && node.props.text) {
        const textContent = node.props.text;
        const inlineFonts = extractFontsFromHTML(textContent);
        inlineFonts.forEach(font => {
          if (isCustomFont(font)) {
            customFonts.add(cleanFontName(font));
          }
        });
      }

      // Check linkedNodes (for components like Button with child Text elements)
      if (node.linkedNodes) {
        Object.values(node.linkedNodes).forEach((linkedNodeId: any) => {
          if (typeof linkedNodeId === 'string' && parsedContent[linkedNodeId]) {
            extractFontsFromNode(parsedContent[linkedNodeId]);
          }
        });
      }
    };

    // Start traversal from the root
    traverseNodes(parsedContent);

    return Array.from(customFonts);
  } catch (error) {
    console.warn('⚠️ Failed to extract fonts from content:', error);
    return [];
  }
};

/**
 * Extracts font-family values from HTML content (for Text components with inline styles)
 * @param htmlContent - HTML string that may contain inline font-family styles
 * @returns Array of font family names found in the HTML
 */
const extractFontsFromHTML = (htmlContent: string): string[] => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return [];
  }

  const fonts: string[] = [];
  
  // Regex to match font-family in style attributes
  const fontFamilyRegex = /font-family:\s*([^;]+)/gi;
  let match;

  while ((match = fontFamilyRegex.exec(htmlContent)) !== null) {
    if (match[1]) {
      fonts.push(match[1].trim());
    }
  }

  return fonts;
};

/**
 * Determines if a font family is a custom font (not a system font)
 * @param fontFamily - The font family string to check
 * @returns True if it's likely a custom font
 */
const isCustomFont = (fontFamily: string): boolean => {
  if (!fontFamily || typeof fontFamily !== 'string') {
    return false;
  }

  // Clean the font family string
  const cleanFont = fontFamily.toLowerCase().trim();

  // List of common system fonts that don't need to be loaded
  const systemFonts = [
    'arial',
    'helvetica',
    'times new roman',
    'times',
    'georgia',
    'courier new',
    'courier',
    'verdana',
    'tahoma',
    'trebuchet ms',
    'lucida grande',
    'lucida sans unicode',
    'palatino',
    'garamond',
    'bookman',
    'avant garde',
    'sans-serif',
    'serif',
    'monospace',
    'cursive',
    'fantasy',
    'inherit',
    'initial',
    'unset'
  ];

  // Check if it's a system font or contains system font fallbacks
  const isSystemFont = systemFonts.some(sysFont => 
    cleanFont.includes(sysFont) || 
    cleanFont.startsWith(`'${sysFont}'`) || 
    cleanFont.startsWith(`"${sysFont}"`)
  );

  // If it contains common system font patterns, it's probably not custom
  if (isSystemFont || cleanFont.includes('sans-serif') || cleanFont.includes('serif')) {
    return false;
  }

  // If it's quoted and doesn't match system fonts, it's likely custom
  if ((cleanFont.startsWith("'") && cleanFont.endsWith("'")) || 
      (cleanFont.startsWith('"') && cleanFont.endsWith('"'))) {
    return true;
  }

  // If it doesn't contain common CSS font keywords, it's likely custom
  return !cleanFont.includes(',') || !systemFonts.some(sysFont => cleanFont.includes(sysFont));
};

/**
 * Cleans a font family name to get the actual font name for loading
 * @param fontFamily - The raw font family string
 * @returns Cleaned font name
 */
const cleanFontName = (fontFamily: string): string => {
  if (!fontFamily) {
    return '';
  }

  // Remove quotes and extra whitespace
  let cleaned = fontFamily.trim();
  
  // Remove outer quotes
  if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || 
      (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
    cleaned = cleaned.slice(1, -1);
  }

  // If it contains comma, take the first font name
  if (cleaned.includes(',')) {
    cleaned = cleaned.split(',')[0].trim();
    
    // Remove quotes from the first font name if present
    if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || 
        (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
      cleaned = cleaned.slice(1, -1);
    }
  }

  return cleaned.trim();
};

/**
 * Debug function to log extracted fonts
 * @param content - Serialized content to analyze
 */
export const debugFontExtraction = (content: string): void => {
  console.group('🔍 Font Extraction Debug');
  
  try {
    const fonts = extractCustomFontsFromContent(content);
    console.log('📝 Serialized content length:', content.length);
    console.log('🎨 Custom fonts found:', fonts);
    
    if (fonts.length === 0) {
      console.log('ℹ️ No custom fonts detected in content');
    } else {
      console.log(`✅ Found ${fonts.length} custom font(s) that need to be loaded`);
    }
  } catch (error) {
    console.error('❌ Error during font extraction:', error);
  }
  
  console.groupEnd();
};
