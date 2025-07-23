import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewportSettings } from '../components/ViewportSettingsModal';

interface ViewportSettingsContextType {
  settings: ViewportSettings;
  updateSettings: (newSettings: Partial<ViewportSettings>) => void;
  isLoading: boolean;
}

const defaultSettings: ViewportSettings = {
  mobileWidth: "380px",
  desktopWidth: "960px",
  mobileOnly: false
};

const ViewportSettingsContext = createContext<ViewportSettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isLoading: false
});

export const useViewportSettings = () => useContext(ViewportSettingsContext);

interface ViewportSettingsProviderProps {
  children: ReactNode;
  templateData?: any; // Template data that might contain viewport settings
}

export const ViewportSettingsProvider: React.FC<ViewportSettingsProviderProps> = ({ 
  children, 
  templateData 
}) => {
  const [settings, setSettings] = useState<ViewportSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from template data when available
  useEffect(() => {
    if (templateData?.pageSettings) {
      setSettings({
        ...defaultSettings,
        ...templateData.pageSettings
      });
    }
  }, [templateData]);

  const updateSettings = (newSettings: Partial<ViewportSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <ViewportSettingsContext.Provider value={{
      settings,
      updateSettings,
      isLoading
    }}>
      {children}
    </ViewportSettingsContext.Provider>
  );
};

// Helper functions to get current viewport settings values
export const getMobileWidth = (settings: ViewportSettings): string => {
  return settings.mobileWidth || defaultSettings.mobileWidth;
};

export const getDesktopWidth = (settings: ViewportSettings): string => {
  return settings.desktopWidth || defaultSettings.desktopWidth;
};

export const getDesktopBreakpoint = (settings: ViewportSettings): number => {
  const width = getDesktopWidth(settings);
  return parseInt(width.replace('px', ''));
};

export const isMobileOnly = (settings: ViewportSettings): boolean => {
  return settings.mobileOnly || false;
};
