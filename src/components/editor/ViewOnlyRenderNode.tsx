import { useNode } from '@craftjs/core';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { usePinning } from './components/PinningManager';
import { RenderNodeProps } from './types/RenderNodeTypes';
import { loadFontFromUrl } from '@/utils/fontLoader';
import { domainFile } from '@/api/apiClient';

/**
 * ViewOnlyRenderNode with optimized automatic font loading support
 *
 * This component automatically detects and loads custom fonts for each rendered component:
 * 1. Checks component props for fontFamily property
 * 2. For Text components, also scans inline HTML for font-family styles
 * 3. Filters out system fonts to only load custom fonts
 * 4. Directly constructs font URLs using the pattern: domainFile + /uploads/fonts/{filename}
 * 5. Loads fonts using the existing font loading infrastructure
 *
 * This optimized approach eliminates the need for useGetFonts() API calls and font searching,
 * improving performance by directly constructing URLs from UUID-based font filenames.
 * This ensures that custom fonts are available before components render,
 * preventing font flash and layout shifts in view-only mode.
 */

// Hook to handle font loading for components with fontFamily props
const useFontLoader = (props: any, componentName: string) => {
  const [fontLoaded, setFontLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!props) {
      setFontLoaded(true);
      return;
    }

    const fontsToLoad: string[] = [];

    // Check if this component has a fontFamily prop
    if (props.fontFamily && typeof props.fontFamily === 'string') {
      fontsToLoad.push(props.fontFamily);
    }

    // For Text components, also check for inline font styles in the text content
    if (componentName === 'Text' && props.text && typeof props.text === 'string') {
      // Updated regex to better capture font-family values including quoted UUID-based filenames
      // Matches: font-family: "3a897473-501e-4a6e-b408-468bfcd62ff7.ttf";
      const fontFamilyRegex = /font-family:\s*["']?([^;"']+)["']?[;\s]/gi;
      let match;
      while ((match = fontFamilyRegex.exec(props.text)) !== null) {
        if (match[1]) {
          fontsToLoad.push(match[1].trim());
        }
      }
    }

    if (fontsToLoad.length === 0) {
      setFontLoaded(true);
      return;
    }


    // Check if it's a custom font (not a system font)
    const isCustomFont = (font: string): boolean => {
      const cleanFont = font.toLowerCase().trim();

      // Check for custom font pattern: UUID-like filename with extension
      // Example: "3a897473-501e-4a6e-b408-468bfcd62ff7.ttf"
      const customFontPattern = /^["']?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(ttf|otf|woff|woff2)["']?$/i;
      if (customFontPattern.test(cleanFont)) {
        return true;
      }

      // Also check for any font file extensions (fallback for other custom fonts)
      const fontFilePattern = /\.(ttf|otf|woff|woff2)["']?$/i;
      if (fontFilePattern.test(cleanFont)) {
        return true;
      }

      const systemFonts = [
        'arial', 'helvetica', 'times new roman', 'times', 'georgia',
        'courier new', 'courier', 'verdana', 'tahoma', 'trebuchet ms',
        'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
        'inherit', 'initial', 'unset'
      ];

      return !systemFonts.some(sysFont =>
        cleanFont.includes(sysFont) ||
        cleanFont.startsWith(`'${sysFont}'`) ||
        cleanFont.startsWith(`"${sysFont}"`)
      );
    };

    // Extract file path from font family name
    const extractFilePath = (fontFamily: string): string | null => {
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

      // For custom font format like "3a897473-501e-4a6e-b408-468bfcd62ff7.ttf"
      const customFontPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(ttf|otf|woff|woff2)$/i;
      if (customFontPattern.test(cleaned)) {
        return `/contents/assets/${cleaned}`;
      }

      return null;
    };

    // Process all fonts that need to be loaded
    const customFontsToLoad = fontsToLoad
      .filter(font => {
        const isCustom = isCustomFont(font);
        return isCustom;
      })
      .map(font => ({ fontFamily: font, filePath: extractFilePath(font) }))
      .filter(fontInfo => fontInfo.filePath !== null)
      .filter((fontInfo, index, arr) =>
        arr.findIndex(f => f.filePath === fontInfo.filePath) === index
      ); // Remove duplicates based on filePath

    if (customFontsToLoad.length === 0) {
      setFontLoaded(true);
      return;
    }

    // Load fonts directly using constructed URLs
    const loadPromises = customFontsToLoad.map(fontInfo => {
      return new Promise<void>((resolve) => {
        try {
          const fontUrl = `${domainFile}${fontInfo.filePath}`;
          // Default to truetype format for .ttf files
          const fontFormat = 'truetype';

          // Extract font name from file path for font-family declaration
          const fontFileName = fontInfo.filePath!.split('/').pop() || fontInfo.fontFamily;

          loadFontFromUrl(fontFileName, fontUrl, fontFormat);
          resolve();
        } catch (error) {
          console.error(`❌ Failed to load font "${fontInfo.fontFamily}" for ${componentName}:`, error);
          resolve(); // Don't block other fonts
        }
      });
    });

    // Wait for all fonts to load
    Promise.all(loadPromises).then(() => {
      setFontLoaded(true);
    });

  }, [props, componentName]);

  return fontLoaded;
};

export const ViewOnlyRenderNode: React.FC<RenderNodeProps> = ({ render }) => {

  const {
    dom,
    name,
    props,
  } = useNode((node) => ({
    dom: node.dom,
    name: node.data.custom.displayName || node.data.displayName,
    props: node.data.props,
  }));
  const { PinnedWrapper } = usePinning(props.pinning, name);

  // Load fonts for this component if it has fontFamily props
  useFontLoader(props, name);
  const currentRef = React.useRef<HTMLDivElement | null>(null);
  const getPos = React.useCallback(() => {
    if (!dom) return { top: '0px', left: '0px' };

    const { top, left, bottom } = dom.getBoundingClientRect();
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`,
    };
  }, [dom]);

  const getRotatePos = React.useCallback(() => {
    if (!dom) return { top: '0px', left: '0px' };

    const { left, width, bottom } = dom.getBoundingClientRect();
    return {
      top: `${bottom + 10}px`, // Position below the element with some padding
      left: `${left + width / 2}px`, // Center horizontally
    };
  }, [dom]);

  const scroll = React.useCallback(() => {
    const { current: currentDOM } = currentRef;
    if (!currentDOM || !dom) return;

    // For the main node indicator
    if (currentDOM.classList.contains('node-indicator')) {
      const { top, left } = getPos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;
    }
    // For the rotate indicator
    else if (currentDOM.classList.contains('rotate-indicator')) {
      const { top, left } = getRotatePos();
      currentDOM.style.top = top;
      currentDOM.style.left = left;
    }
  }, [dom, getPos, getRotatePos]);

  React.useEffect(() => {
    const craftRenderer = document.querySelector('.craftjs-renderer');
    if (craftRenderer) {
      craftRenderer.addEventListener('scroll', scroll);
      return () => {
        craftRenderer.removeEventListener('scroll', scroll);
      };
    }
  }, [scroll]);

  const isTextInButton = name === 'Text' && props.isChildOfButton === true;

  const isMounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle pinning modes
  if (props.pinning?.enabled) {
    // Sections component handles its own pinning internally due to full-width backgrounds
    if (name === 'Sections') {
      return (
        <div className={`${!isTextInButton ? 'w-full h-full' : 'text-center'}`}>
          {render}
        </div>
      );
    }

    // Find the viewport container for better context preservation
    const getPortalContainer = () => {
      // Try to find the view-page container first
      const viewPageContainer = document.querySelector('.view-page');
      if (viewPageContainer) {
        return viewPageContainer;
      }

      // Fallback to the craftjs-renderer container
      const craftRenderer = document.querySelector('.craftjs-renderer');
      if (craftRenderer) {
        return craftRenderer.parentElement || document.body;
      }

      // Final fallback to document.body
      return document.body;
    };

    // Handle fixed positioning modes for other components
    return ReactDOM.createPortal(
      <PinnedWrapper>
        {render}
      </PinnedWrapper>,
      getPortalContainer()
    );
  }

  return (
    <div className={`w-full`}>
      {render}
    </div>
  );
};
