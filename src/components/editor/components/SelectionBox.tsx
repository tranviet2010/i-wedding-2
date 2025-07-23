import React, { useEffect } from 'react';
import { useMultiSelectContext } from '../contexts/MultiSelectContext';
import { zIndex } from '@/utils/zIndex';

export const SelectionBox: React.FC = () => {
  const { selectionBox, isMultiSelecting, forceEndSelection } = useMultiSelectContext();

  // Safety timeout to ensure selection box doesn't get stuck
  useEffect(() => {
    if (isMultiSelecting) {
      const timeout = setTimeout(() => {
        console.warn('Selection box timeout - force clearing');
        forceEndSelection();
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isMultiSelecting, forceEndSelection]);

  if (!isMultiSelecting || !selectionBox) {
    return null;
  }

  const { startX, startY, endX, endY } = selectionBox;

  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px dashed #ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.15)',
        pointerEvents: 'none',
        zIndex: zIndex.selectionBox,
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(255, 71, 87, 0.3)',
      }}
    >
      {/* Selection box label */}
      <div
        style={{
          position: 'absolute',
          top: '-25px',
          left: '0px',
          backgroundColor: '#ff4757',
          color: 'white',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: 'bold',
          borderRadius: '3px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        🎯 Chọn vùng
      </div>
    </div>
  );
};
