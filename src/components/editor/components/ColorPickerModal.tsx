import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ColorPicker, HStack, parseColor, Portal, Box, Button, Text } from '@chakra-ui/react';
import { debounce } from '@/utils/helper';
import { safeLocalStorage } from '@/utils/storage';
import { zIndex } from '@/utils/zIndex';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  initialColor?: string;
}

// Constants for global color history
const COLOR_HISTORY_KEY = 'color-picker-history';
const MAX_HISTORY_COLORS = 10;

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  onColorChange,
  initialColor = '#ffffff'
}) => {
  const colorWithOpacity = initialColor.length === 7 ? `${initialColor}ff` : initialColor;
  let colorParsed;
  try {
    colorParsed = parseColor(colorWithOpacity);
  } catch (error) {
    colorParsed = parseColor("#ffffff");
  }
  const [color, setColor] = useState(colorParsed);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const shouldSaveOnClose = useRef(false);
  const prevIsOpenRef = useRef(isOpen);

  // Function to add color to history
  const addColorToHistory = useCallback((colorValue: string) => {
    const hexColor = colorValue.length === 9 ? colorValue.slice(0, 7) : colorValue; // Remove alpha if present

    setColorHistory(prevHistory => {
      // Remove duplicate if it exists
      const filteredHistory = prevHistory.filter(c => c !== hexColor);
      // Add new color to the beginning
      const newHistory = [hexColor, ...filteredHistory].slice(0, MAX_HISTORY_COLORS);

      // Save to localStorage
      safeLocalStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(newHistory));

      return newHistory;
    });
  }, []);

  // Load color history from localStorage on component mount
  useEffect(() => {
    const savedHistory = safeLocalStorage.getItem(COLOR_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setColorHistory(parsedHistory);
        }
      } catch (error) {
        console.warn('Failed to parse color history from localStorage:', error);
      }
    }
  }, []);

  // Set flag when color changes to indicate we should save on close
  useEffect(() => {
    if (isOpen) {
      shouldSaveOnClose.current = true;
    }
  }, [color, isOpen]);

  // Detect when modal closes and save color
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isNowClosed = !isOpen;

    if (wasOpen && isNowClosed && shouldSaveOnClose.current && color) {
      // Modal was open and is now closed, save the color
      const currentColorHex = color.toString("hex");
      addColorToHistory(currentColorHex);
      shouldSaveOnClose.current = false; // Reset flag
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, color, addColorToHistory]);

  const debouncedColorChange = useCallback(
    debounce((newColor: string) => {
      onColorChange(newColor);
      // Don't add to history here - we'll save on modal close
    }, 100),
    [onColorChange]
  );

  // Function to handle clicking on history colors
  const handleHistoryColorClick = useCallback((historyColor: string) => {
    try {
      const colorWithOpacity = historyColor.length === 7 ? `${historyColor}ff` : historyColor;
      const parsedColor = parseColor(colorWithOpacity);
      setColor(parsedColor);
      onColorChange(historyColor);
    } catch (error) {
      console.warn('Failed to parse history color:', error);
    }
  }, [onColorChange]);

  const handleClose = useCallback(() => {
    // Don't save here - let the useEffect handle it when isOpen changes
    onClose();
  }, [onClose]);

  const handleColorChange = useCallback((e: any) => {
    setColor(e.value);
    debouncedColorChange(e.value.toString("hexa"));
  }, [debouncedColorChange]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center" 
      onClick={handleBackdropClick}
      style={{ zIndex: zIndex.colorPicker }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-full border border-gray-300" 
        onClick={e => e.stopPropagation()}
      >
        <ColorPicker.Root
          value={color}
          format="rgba"
          onValueChange={handleColorChange}
          maxW="200px"
        >
          <ColorPicker.HiddenInput />
          <ColorPicker.Control>
            <ColorPicker.Input />
            <ColorPicker.Trigger />
          </ColorPicker.Control>
          <Portal>
            <ColorPicker.Positioner>
              <ColorPicker.Content>
                <ColorPicker.Area />
                <HStack>
                  <ColorPicker.EyeDropper size="xs" variant="outline" />
                  <ColorPicker.Sliders />
                </HStack>
              </ColorPicker.Content>
            </ColorPicker.Positioner>
          </Portal>
        </ColorPicker.Root>

        {/* Color History Section */}
        {colorHistory.length > 0 && (
          <div className="mt-4">
            <Text fontSize="xs" color="gray.600" mb={2}>
              Màu đã sử dụng gần đây
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {colorHistory.map((historyColor, index) => (
                <Button
                  key={`${historyColor}-${index}`}
                  size="sm"
                  variant="outline"
                  p={0}
                  minW="24px"
                  h="24px"
                  borderRadius="sm"
                  onClick={() => handleHistoryColorClick(historyColor)}
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="transform 0.2s"
                >
                  <Box
                    w="20px"
                    h="20px"
                    bg={historyColor}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor="gray.300"
                  />
                </Button>
              ))}
            </HStack>
          </div>
        )}
      </div>
    </div>
  );
}; 