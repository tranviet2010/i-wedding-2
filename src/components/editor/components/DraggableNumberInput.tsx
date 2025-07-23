import React, { useState, useRef, useEffect } from 'react';

interface DraggableNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  sensitivity?: number; // Pixels per step
  allowFullRound?: boolean; // Allow setting to a special "full round" value
}

export const DraggableNumberInput: React.FC<DraggableNumberInputProps> = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 999, 
  step = 1,
  tooltip = '',
  sensitivity = 2, 
  allowFullRound = false
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [startX, setStartX] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    // Get coordinates from mouse or touch event
    let clientX;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    setStartX(clientX);
    setStartValue(value);

    // Add event listeners to window for drag tracking
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    // Change cursor style
    document.body.style.cursor = 'ew-resize';
  };
  
  const handlePointerMove = (e: MouseEvent | TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch

    // Get coordinates from mouse or touch event
    let clientX;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }

    const deltaX = clientX - startX;
    // Use sensitivity parameter to control how fast values change
    const newValue = Math.min(max, Math.max(min, startValue + Math.floor(deltaX / sensitivity) * step));

    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handlePointerUp = () => {
    // Remove both mouse and touch event listeners
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);

    // Reset cursor
    document.body.style.cursor = '';
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };
  
  const handleBlur = () => {
    const newValue = parseInt(inputValue);
    if (isNaN(newValue)) {
      setInputValue(value.toString());
    } else {
      const clampedValue = Math.min(max, Math.max(min, newValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  // Handle setting to "full round" (50%)
  const handleSetFullRound = () => {
    if (allowFullRound) {
      onChange(9999); // Special value to indicate full rounding (50%)
      setInputValue("MAX");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div 
        className="relative flex items-center group"
        data-tooltip-id="node-controls"
        data-tooltip-content={tooltip}
      >
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          className="w-12 h-7 text-center text-xs border-none rounded-md"
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 cursor-ew-resize transition-colors duration-100"
          style={{ touchAction: 'none' }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
        ></div>
      </div>
     
    </div>
  );
}; 