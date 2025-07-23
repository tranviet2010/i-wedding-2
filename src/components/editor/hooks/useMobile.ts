import * as React from 'react';

// Mobile breakpoint - matches ViewportContext platform switching logic
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current device is mobile based on screen width
 * Used for UI adjustments and responsive behavior
 * Note: Platform switching for editing is handled automatically in ViewportContext
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
