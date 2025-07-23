import { ReactNode } from 'react';

export interface RenderNodeProps {
  render: ReactNode;
}

export interface SectionBottomIndicatorProps {
  dom: HTMLElement | null;
  isSection: boolean;
  isActive: boolean;
  handleResizeMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  addNewSection: () => void;
  duplicateSection: () => void;
}

export interface NodeState {
  isLocked: boolean;
  isDragging: boolean;
  showLayerControls: boolean;
  isNearVerticalCenter: boolean;
  isNearHorizontalCenter: boolean;
  parentRect: DOMRect | null;
  toggleLock: () => void;
  setShowLayerControls: (value: boolean) => void;
  setIsNearVerticalCenter: (value: boolean) => void;
  setIsNearHorizontalCenter: (value: boolean) => void;
  setParentRect: (value: DOMRect | null) => void;
  setIsDragging: (value: boolean) => void;
} 