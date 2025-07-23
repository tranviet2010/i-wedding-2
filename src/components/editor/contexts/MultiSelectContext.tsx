import React, { createContext, useContext, ReactNode } from 'react';
import { useMultiSelect, UseMultiSelectReturn } from '../hooks/useMultiSelect';

interface MultiSelectContextType extends UseMultiSelectReturn {}

const MultiSelectContext = createContext<MultiSelectContextType | undefined>(undefined);

interface MultiSelectProviderProps {
  children: ReactNode;
}

export const MultiSelectProvider: React.FC<MultiSelectProviderProps> = ({ children }) => {
  const multiSelectState = useMultiSelect();

  return (
    <MultiSelectContext.Provider value={multiSelectState}>
      {children}
    </MultiSelectContext.Provider>
  );
};

export const useMultiSelectContext = (): MultiSelectContextType => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error('useMultiSelectContext must be used within a MultiSelectProvider');
  }
  return context;
};
