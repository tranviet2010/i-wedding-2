import React from 'react';

// Create a context for responsive platform information
const ResponsivePlatformContext = React.createContext<'desktop' | 'mobile' | null>(null);

export const useResponsivePlatformContext = () => React.useContext(ResponsivePlatformContext);

export { ResponsivePlatformContext };
